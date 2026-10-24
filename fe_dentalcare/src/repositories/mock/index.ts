import {
  IPatientRepository,
  IDoctorRepository,
  IAppointmentRepository,
  IQueueRepository,
  IEncounterRepository,
  IPharmacyRepository,
  ILaboratoryRepository,
  IRadiologyRepository,
  IInpatientRepository,
  IBillingRepository,
  IInventoryRepository,
  ISystemRepository,
  IFinanceRepository,
  IDentalMasterRepository,
  IUserRepository,
} from "../contracts";
import { mockStore } from "./store";
import {
  User,
  Patient,
  PatientQuery,
  CreatePatientInput,
  UpdatePatientInput,
  Doctor,
  Appointment,
  CreateAppointmentInput,
  QueueItem,
  Encounter,
  Medicine,
  Prescription,
  LaboratoryOrder,
  RadiologyOrder,
  Room,
  Admission,
  Invoice,
  InventoryItem,
  AppNotification,
  AuditLog,
  HospitalProfile,
  PaginatedResult,
  QueryParams,
  DentalDiagnosisMaster,
  DentalProcedureMaster,
  DentalDepartmentMaster,
  DentalInsuranceMaster,
} from "@/types";
import diagnosesSeed from "@/data/diagnoses.json";

export class MockPatientRepository implements IPatientRepository {
  async getPatients(query: PatientQuery = {}): Promise<PaginatedResult<Patient>> {
    let items = [...mockStore.getState().patients];

    if (query.search) {
      const q = query.search.toLowerCase();
      items = items.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.medicalRecordNumber.toLowerCase().includes(q) ||
          (p.nik ? p.nik.includes(q) : false) ||
          p.phone.includes(q)
      );
    }

    if (query.gender) {
      items = items.filter((p) => p.gender === query.gender);
    }
    if (query.status) {
      items = items.filter((p) => p.status === query.status);
    }
    if (query.bloodType) {
      items = items.filter((p) => p.bloodType === query.bloodType);
    }
    if (query.insuranceType) {
      items = items.filter((p) => p.insurance.type === query.insuranceType);
    }

    const state = mockStore.getState();
    const enrichPatient = (p: Patient) => {
      if (p.nextControlDate && p.controlDoctor) return p;
      const enc = state.encounters.find((e) => e.patientId === p.id && e.nextControlDate);
      const apt = state.appointments.find((a) => a.patientId === p.id);
      const controlDate = enc?.nextControlDate || apt?.appointmentDate || p.nextControlDate;
      const controlDoctor = enc?.doctorName || apt?.doctorName || p.controlDoctor || "drg. Jihan, S.Kep";
      return {
        ...p,
        nextControlDate: controlDate,
        controlDoctor,
      };
    };

    let targetItems = items;
    if (query.h1Control || query.nextControlDate) {
      const targetDate = query.h1Control
        ? (() => {
            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            return tomorrow.toISOString().split("T")[0];
          })()
        : query.nextControlDate;

      targetItems = items
        .map(enrichPatient)
        .filter((p) => p.nextControlDate === targetDate);
    }

    const page = query.page || 1;
    const perPage = query.perPage || 10;
    const total = targetItems.length;
    const totalPages = Math.max(1, Math.ceil(total / perPage));
    const start = (page - 1) * perPage;
    const paginated = targetItems.slice(start, start + perPage).map(enrichPatient);

    return {
      data: paginated,
      meta: {
        page,
        perPage,
        total,
        totalPages,
      },
    };
  }

  async getPatientById(id: string): Promise<Patient | null> {
    const patient = mockStore.getState().patients.find((p) => p.id === id || p.medicalRecordNumber === id);
    if (!patient) return null;
    const enc = mockStore.getState().encounters.find(
      (e) => e.patientId === patient.id && e.odontogram?.teeth && Object.keys(e.odontogram.teeth).length > 0
    );
    return {
      ...patient,
      latestOdontogram: enc?.odontogram || patient.odontogram,
      odontogram: patient.odontogram || enc?.odontogram,
    };
  }

  async createPatient(data: CreatePatientInput): Promise<Patient> {
    const existing = mockStore.getState().patients;
    const nextNum = existing.length + 1;
    const padded = String(nextNum).padStart(6, "0");
    const mrn = `RM-2026-${padded}`;
    const newId = `PAT-${String(nextNum).padStart(3, "0")}`;

    const newPatient: Patient = {
      id: newId,
      facilityId: "FAC-001",
      medicalRecordNumber: mrn,
      nik: data.nik,
      name: data.name,
      gender: data.gender,
      birthPlace: data.birthPlace,
      birthDate: data.birthDate,
      bloodType: data.bloodType,
      maritalStatus: data.maritalStatus,
      religion: data.religion,
      occupation: data.occupation,
      phone: data.phone,
      email: data.email,
      address: data.address,
      emergencyContact: data.emergencyContact,
      insurance: data.insurance,
      allergies: data.allergies || [],
      chronicDiseases: data.chronicDiseases || [],
      status: "active",
      registeredAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    mockStore.updateState((state) => {
      state.patients.unshift(newPatient);
    });

    return newPatient;
  }

  async updatePatient(id: string, data: UpdatePatientInput): Promise<Patient> {
    let updatedPatient: Patient | null = null;
    mockStore.updateState((state) => {
      const idx = state.patients.findIndex((p) => p.id === id);
      if (idx !== -1) {
        state.patients[idx] = {
          ...state.patients[idx],
          ...data,
          updatedAt: new Date().toISOString(),
        };
        updatedPatient = state.patients[idx];
      }
    });

    if (!updatedPatient) throw new Error("Pasien tidak ditemukan");
    return updatedPatient;
  }

  async deletePatient(id: string): Promise<boolean> {
    let deleted = false;
    mockStore.updateState((state) => {
      const idx = state.patients.findIndex((p) => p.id === id);
      if (idx !== -1) {
        state.patients.splice(idx, 1);
        deleted = true;
      }
    });
    return deleted;
  }

  async updateControlSchedule(patientId: string, data: { nextControlDate: string; appointmentTime?: string; doctorName?: string; doctorId?: string; notes?: string }): Promise<Patient> {
    let updatedPatient: Patient | null = null;
    mockStore.updateState((state) => {
      const idx = state.patients.findIndex((p) => p.id === patientId);
      if (idx !== -1) {
        state.patients[idx] = {
          ...state.patients[idx],
          nextControlDate: data.nextControlDate,
          controlDoctor: data.doctorName || "drg. Pratama Wijaya",
          controlNotes: data.notes || "Kontrol rutin kesehatan gigi",
          updatedAt: new Date().toISOString(),
        };
        updatedPatient = state.patients[idx];
      }

      // Also create/update an appointment with visitType: 'control'
      const aptIdx = state.appointments.findIndex((a) => a.patientId === patientId);
      if (aptIdx !== -1) {
        state.appointments[aptIdx].appointmentDate = data.nextControlDate;
        state.appointments[aptIdx].appointmentTime = data.appointmentTime || "09:00";
        state.appointments[aptIdx].visitType = "control";
        state.appointments[aptIdx].complaint = data.notes || "Kontrol rutin kesehatan gigi";
        state.appointments[aptIdx].doctorName = data.doctorName || "drg. Pratama Wijaya";
      } else if (updatedPatient) {
        const nextNum = state.appointments.length + 1;
        state.appointments.unshift({
          id: `APT-${String(nextNum).padStart(3, "0")}`,
          facilityId: "FAC-001",
          appointmentNumber: `APT-2026-${String(nextNum).padStart(4, "0")}`,
          patientId: (updatedPatient as Patient).id,
          patientName: (updatedPatient as Patient).name,
          patientMrn: (updatedPatient as Patient).medicalRecordNumber,
          patientPhone: (updatedPatient as Patient).phone || "",
          patientGender: (updatedPatient as Patient).gender,
          patientBirthDate: (updatedPatient as Patient).birthDate,
          patientInsuranceType: (updatedPatient as Patient).insurance?.type || "umum",
          doctorId: data.doctorId || "DOC-001",
          doctorName: data.doctorName || "drg. Pratama Wijaya",
          doctorSpecialization: "Dokter Gigi Spesialis",
          departmentId: "DEP-001",
          departmentName: "Poli Gigi Umum",
          appointmentDate: data.nextControlDate,
          appointmentTime: data.appointmentTime || "09:00",
          durationMinutes: 30,
          visitType: "control",
          complaint: data.notes || "Kontrol rutin kesehatan gigi",
          status: "scheduled",
          queueNumber: `DEN-${String(nextNum).padStart(3, "0")}`,
          notes: data.notes || "Kontrol rutin kesehatan gigi",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
      }
    });

    if (!updatedPatient) throw new Error("Pasien tidak ditemukan");
    return updatedPatient;
  }
}

export class MockDoctorRepository implements IDoctorRepository {
  async getDoctors(query: QueryParams & { departmentId?: string } = {}): Promise<Doctor[]> {
    let items = [...mockStore.getState().doctors];
    if (query.departmentId) {
      items = items.filter((d) => d.departmentId === query.departmentId);
    }
    if (query.search) {
      const q = query.search.toLowerCase();
      items = items.filter(
        (d) => d.name.toLowerCase().includes(q) || d.specialization.toLowerCase().includes(q)
      );
    }
    return items;
  }

  async getDoctorById(id: string): Promise<Doctor | null> {
    const doc = mockStore.getState().doctors.find((d) => d.id === id);
    return doc || null;
  }

  async createDoctor(data: Partial<Doctor>): Promise<Doctor> {
    let result: Doctor | null = null;
    mockStore.updateState((state) => {
      const existing = state.doctors;
      const nextNum = existing.length + 1;
      const newDoc: Doctor = {
        id: data.id || `DOC-${String(nextNum).padStart(3, "0")}`,
        facilityId: data.facilityId || "FAC-001",
        employeeNumber: data.employeeNumber || `DOC-${new Date().getFullYear()}-${String(nextNum).padStart(3, "0")}`,
        name: data.name || "Dokter Gigi Baru",
        title: data.title || "drg.",
        specialization: data.specialization || "Dokter Gigi Umum",
        departmentId: data.departmentId || "DEP-001",
        departmentName: data.departmentName || "Poli Gigi Umum & Bedah Mulut",
        sipNumber: data.sipNumber || `SIP.503/442/${String(nextNum).padStart(2, "0")}/DINKES/${new Date().getFullYear()}`,
        phone: data.phone || "081234567890",
        email: data.email || `dokter${nextNum}@klinikgigi.local`,
        avatarUrl: data.avatarUrl || "https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=150&auto=format&fit=crop&q=80",
        status: data.status || "active",
        consultationFee: data.consultationFee !== undefined ? Number(data.consultationFee) : 150000,
        schedules: data.schedules || [],
      };
      state.doctors.push(newDoc);
      result = newDoc;
    });
    if (!result) throw new Error("Gagal menambahkan data dokter gigi");
    return result;
  }

  async updateDoctor(id: string, data: Partial<Doctor>): Promise<Doctor> {
    let result: Doctor | null = null;
    mockStore.updateState((state) => {
      const idx = state.doctors.findIndex((d) => d.id === id);
      if (idx !== -1) {
        state.doctors[idx] = {
          ...state.doctors[idx],
          ...data,
          consultationFee: data.consultationFee !== undefined ? Number(data.consultationFee) : state.doctors[idx].consultationFee,
          schedules: data.schedules !== undefined ? data.schedules : state.doctors[idx].schedules,
        };
        result = state.doctors[idx];
      }
    });
    if (!result) throw new Error("Dokter gigi tidak ditemukan");
    return result;
  }

  async deleteDoctor(id: string): Promise<boolean> {
    let deleted = false;
    mockStore.updateState((state) => {
      const idx = state.doctors.findIndex((d) => d.id === id);
      if (idx !== -1) {
        state.doctors.splice(idx, 1);
        deleted = true;
      }
    });
    return deleted;
  }
}

export class MockAppointmentRepository implements IAppointmentRepository {
  async getAppointments(query: QueryParams & { doctorId?: string; date?: string; status?: string; patientId?: string } = {}): Promise<Appointment[]> {
    let items = [...mockStore.getState().appointments];
    if (query.patientId) {
      items = items.filter((a) => a.patientId === query.patientId);
    }
    if (query.doctorId) {
      items = items.filter((a) => a.doctorId === query.doctorId);
    }
    if (query.date) {
      items = items.filter((a) => a.appointmentDate === query.date);
    }
    if (query.status) {
      items = items.filter((a) => a.status === query.status);
    }
    if (query.search) {
      const q = query.search.toLowerCase();
      items = items.filter(
        (a) =>
          a.patientName.toLowerCase().includes(q) ||
          a.patientMrn.toLowerCase().includes(q) ||
          a.appointmentNumber.toLowerCase().includes(q)
      );
    }
    return items;
  }

  async getAppointmentById(id: string): Promise<Appointment | null> {
    return mockStore.getState().appointments.find((a) => a.id === id) || null;
  }

  async createAppointment(data: CreateAppointmentInput): Promise<Appointment> {
    const nextNum = mockStore.getState().appointments.length + 1;
    const newApt: Appointment = {
      ...data,
      id: `APT-${String(nextNum).padStart(3, "0")}`,
      facilityId: "FAC-001",
      appointmentNumber: `APT-2026-${String(nextNum).padStart(4, "0")}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    mockStore.updateState((state) => {
      state.appointments.unshift(newApt);
    });
    return newApt;
  }

  async updateAppointmentStatus(id: string, status: Appointment["status"]): Promise<Appointment> {
    let result: Appointment | null = null;
    mockStore.updateState((state) => {
      const idx = state.appointments.findIndex((a) => a.id === id);
      if (idx !== -1) {
        state.appointments[idx].status = status;
        state.appointments[idx].updatedAt = new Date().toISOString();
        result = state.appointments[idx];
      }
    });
    if (!result) throw new Error("Appointment not found");
    return result;
  }
}

export class MockQueueRepository implements IQueueRepository {
  async getQueues(query: QueryParams & { departmentId?: string; status?: string; serviceType?: string; allDates?: boolean } = {}): Promise<QueueItem[]> {
    let items = [...mockStore.getState().queues];
    if (!query.allDates) {
      const today = new Date().toISOString().slice(0, 10);
      items = items.filter((q) => {
        const d = (q as any).createdAt || (q as any).created_at || q.checkInTime;
        if (!d || typeof d !== "string") return true;
        if (d.includes("-") || d.includes("T")) {
          return d.slice(0, 10) === today;
        }
        return true;
      });
    }
    if (query.departmentId) {
      items = items.filter((q) => q.departmentId === query.departmentId);
    }
    if (query.status) {
      if (query.status === "active") {
        items = items.filter((q) => q.status === "waiting" || q.status === "called" || q.status === "in_progress");
      } else {
        items = items.filter((q) => q.status === query.status);
      }
    }
    if (query.serviceType) {
      items = items.filter((q) => q.serviceType === query.serviceType);
    }
    return items;
  }

  async updateQueueStatus(id: string, status: QueueItem["status"]): Promise<QueueItem> {
    let result: QueueItem | null = null;
    mockStore.updateState((state) => {
      const idx = state.queues.findIndex((q) => q.id === id);
      if (idx !== -1) {
        state.queues[idx].status = status;
        if (status === "called" || status === "in_progress") {
          state.queues[idx].calledTime = new Date().toISOString();
        }
        result = state.queues[idx];
      }
    });
    if (!result) throw new Error("Antrean tidak ditemukan");
    return result;
  }

  async callNextQueue(departmentId?: string): Promise<QueueItem | null> {
    let nextItem: QueueItem | null = null;
    mockStore.updateState((state) => {
      const item = state.queues.find(
        (q) => q.status === "waiting" && (!departmentId || q.departmentId === departmentId)
      );
      if (item) {
        item.status = "called";
        item.calledTime = new Date().toISOString();
        nextItem = item;
      }
    });
    return nextItem;
  }

  async enqueue(data: { patientId: string; patientName?: string; doctorId?: string; departmentId?: string; appointmentId?: string }): Promise<QueueItem> {
    const state = mockStore.getState();
    const patient = state.patients.find((p) => p.id === data.patientId);
    const doctor = state.doctors.find((d) => d.id === data.doctorId) || state.doctors[0];
    const nextNum = state.queues.length + 1;
    const newItem: QueueItem = {
      id: `QUE-${Date.now()}`,
      facilityId: "FAC-001",
      queueNumber: `A-${String(nextNum).padStart(3, "0")}`,
      appointmentId: data.appointmentId,
      patientId: data.patientId,
      patientName: data.patientName || patient?.name || "Pasien Gigi",
      patientMrn: patient?.medicalRecordNumber || `RM-2026-${String(nextNum).padStart(6, "0")}`,
      doctorId: doctor ? doctor.id : "DOC-001",
      doctorName: doctor ? doctor.name : "drg. Jihan, S.Kep",
      departmentId: data.departmentId || "DEP-001",
      departmentName: "Poli Gigi Umum",
      roomNumber: "Dental Chair 1",
      checkInTime: new Date().toISOString(),
      estimatedWaitMinutes: nextNum * 15,
      status: "waiting",
      priority: "normal",
      serviceType: "outpatient",
    };
    mockStore.updateState((s) => {
      s.queues.unshift(newItem);
    });
    return newItem;
  }
}

export class MockEncounterRepository implements IEncounterRepository {
  async getEncounters(query: QueryParams & { patientId?: string; doctorId?: string } = {}): Promise<Encounter[]> {
    let items = [...mockStore.getState().encounters];
    if (query.patientId) {
      items = items.filter((e) => e.patientId === query.patientId);
    }
    if (query.doctorId) {
      items = items.filter((e) => e.doctorId === query.doctorId);
    }
    return items;
  }

  async getEncounterById(id: string): Promise<Encounter | null> {
    return mockStore.getState().encounters.find((e) => e.id === id) || null;
  }

  async createEncounter(data: Partial<Encounter>): Promise<Encounter> {
    const nextNum = mockStore.getState().encounters.length + 1;
    const encId = data.id || `ENC-${String(nextNum).padStart(3, "0")}`;
    const createdTime = data.createdAt || (data.visitDate ? `${data.visitDate}T09:00:00.000Z` : new Date().toISOString());
    const newEnc: Encounter = {
      id: encId,
      facilityId: "FAC-001",
      encounterNumber: data.encounterNumber || `ENC-2026-${String(nextNum).padStart(4, "0")}`,
      createdAt: createdTime,
      updatedAt: createdTime,
      ...data,
    } as Encounter;

    mockStore.updateState((state) => {
      const existingIdx = state.encounters.findIndex((e) => e.id === encId);
      if (existingIdx !== -1) {
        state.encounters[existingIdx] = { ...state.encounters[existingIdx], ...newEnc };
      } else {
        state.encounters.unshift(newEnc);
      }

      // Automatically deduct medicine stock when prescribed (unless deductStock is explicitly false)
      if ((data as any).deductStock !== false && data.prescriptions && Array.isArray(data.prescriptions) && data.prescriptions.length > 0) {
        data.prescriptions.forEach((rx: any) => {
          const medIdx = state.medicines.findIndex((m) => m.id === rx.medicineId || m.brandName === rx.medicineName);
          if (medIdx !== -1) {
            const med = state.medicines[medIdx];
            const qty = Number(rx.quantity) || 1;
            const stockBefore = med.currentStock;
            const stockAfter = Math.max(0, stockBefore - qty);
            state.medicines[medIdx] = {
              ...med,
              currentStock: stockAfter,
              stockStatus: stockAfter > med.minimumStock ? "in_stock" : stockAfter > 0 ? "low_stock" : "out_of_stock",
            };
          }
        });

        // Add prescription to pharmacy queue
        const prxNum = state.prescriptions.length + 1;
        state.prescriptions.unshift({
          id: `PRX-${String(prxNum).padStart(3, "0")}`,
          prescriptionNumber: `RX-2026-${String(prxNum).padStart(4, "0")}`,
          facilityId: newEnc.facilityId,
          encounterId: newEnc.id,
          patientId: newEnc.patientId,
          patientName: newEnc.patientName,
          patientMrn: newEnc.patientMrn,
          doctorId: newEnc.doctorId || "DOC-001",
          doctorName: newEnc.doctorName || "drg. Jihan, S.Kep",
          items: data.prescriptions as any,
          totalAmount: data.prescriptions.reduce((sum: number, p: any) => sum + (p.totalPrice || 0), 0),
          paymentStatus: "unpaid",
          status: "ready",
          createdAt: new Date().toISOString(),
        } as any);
      }

      // Automatically create or update billing invoice
      this.syncInvoiceForEncounter(state, newEnc);
    });
    return newEnc;
  }

  private syncInvoiceForEncounter(state: any, enc: Encounter) {
    state.invoices = state.invoices || [];
    const invIdx = state.invoices.findIndex((i: any) => i.encounterId === enc.id || (enc.patientId && i.patientId === enc.patientId && i.status !== "paid"));
    
    const invoiceItems: any[] = [];

    const proceduresToBill: any[] = [];
    if (enc.procedures && Array.isArray(enc.procedures)) {
      proceduresToBill.push(...enc.procedures);
    }
    // Also harvest any teeth with procedure/procedureCost from odontogram if not already listed
    if (enc.odontogram?.teeth) {
      Object.entries(enc.odontogram.teeth).forEach(([tNum, tRecord]: [string, any]) => {
        if (tRecord && (tRecord.procedure || (tRecord.procedureCost !== undefined && tRecord.procedureCost > 0))) {
          const already = proceduresToBill.some((p: any) => p.name?.includes(`#${tNum}`));
          if (!already) {
            proceduresToBill.push({
              id: `EP-ODON-${tNum}`,
              name: tRecord.procedure || `Tindakan Gigi #${tNum}`,
              code: "DENT",
              price: Number(tRecord.procedureCost) || 0,
              quantity: 1,
            });
          }
        }
      });
    }

    proceduresToBill.forEach((proc: any, pIdx: number) => {
      let price = 0;
      if (proc.price !== undefined && proc.price !== null && !isNaN(Number(proc.price))) {
        price = Number(proc.price);
      } else if (proc.cost !== undefined && proc.cost !== null && !isNaN(Number(proc.cost))) {
        price = Number(proc.cost);
      } else {
        price = 350000;
      }
      const qty = Number(proc.quantity) || 1;
      invoiceItems.push({
        id: proc.id || `ITM-PROC-${enc.id}-${pIdx}`,
        description: `Tindakan: ${proc.name}`,
        category: "procedure",
        quantity: qty,
        unitPrice: price,
        totalPrice: price * qty,
      });
    });

    if (enc.prescriptions && Array.isArray(enc.prescriptions)) {
      enc.prescriptions.forEach((rx: any, rIdx: number) => {
        const price = Number(rx.unitPrice) || 0;
        const qty = Number(rx.quantity) || 1;
        invoiceItems.push({
          id: `ITM-MED-${enc.id}-${rIdx}`,
          description: `Obat: ${rx.medicineName} (${qty} ${rx.dosage || "unit"})`,
          category: "medicine",
          quantity: qty,
          unitPrice: price,
          totalPrice: price * qty,
        });
      });
    }

    const totalAmount = invoiceItems.reduce((s, itm) => s + (itm.totalPrice || 0), 0);
    const todayStr = new Date().toISOString().split("T")[0];

    if (invIdx !== -1) {
      if (state.invoices[invIdx].status !== "paid") {
        state.invoices[invIdx].items = invoiceItems;
        state.invoices[invIdx].subtotal = totalAmount;
        state.invoices[invIdx].totalAmount = totalAmount;
        state.invoices[invIdx].patientResponsibility = totalAmount;
        state.invoices[invIdx].balanceAmount = Math.max(0, totalAmount - (state.invoices[invIdx].paidAmount || 0));
        state.invoices[invIdx].patientName = enc.patientName;
        state.invoices[invIdx].patientMrn = enc.patientMrn;
      }
    } else {
      const invNum = state.invoices.length + 1;
      const newInvoice = {
        id: `INV-${Date.now()}`,
        facilityId: "FAC-001",
        invoiceNumber: `INV-${todayStr.slice(0, 7).replace("-", "")}-${String(invNum).padStart(4, "0")}`,
        encounterId: enc.id,
        patientId: enc.patientId,
        patientName: enc.patientName,
        patientMrn: enc.patientMrn,
        patientPhone: "",
        invoiceDate: todayStr,
        dueDate: todayStr,
        insuranceType: "umum",
        insuranceCoverage: 0,
        patientResponsibility: totalAmount,
        items: invoiceItems,
        subtotal: totalAmount,
        discount: 0,
        tax: 0,
        totalAmount,
        paidAmount: 0,
        balanceAmount: totalAmount,
        status: "pending",
        transactions: [],
        createdAt: new Date().toISOString(),
      };
      state.invoices.unshift(newInvoice);
      enc.invoiceId = newInvoice.id;
    }
  }

  async updateEncounter(id: string, data: Partial<Encounter>): Promise<Encounter> {
    let result: Encounter | null = null;
    mockStore.updateState((state) => {
      const idx = state.encounters.findIndex((e) => e.id === id);
      if (idx !== -1) {
        state.encounters[idx] = {
          ...state.encounters[idx],
          ...data,
          updatedAt: new Date().toISOString(),
        };
        result = state.encounters[idx];
      } else {
        const nextNum = state.encounters.length + 1;
        const newEnc = {
          id,
          facilityId: "FAC-001",
          encounterNumber: `ENC-2026-${String(nextNum).padStart(4, "0")}`,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          ...data,
        } as Encounter;
        state.encounters.unshift(newEnc);
        result = newEnc;
      }

      // Automatically deduct medicine stock when prescribed in update
      if (data.prescriptions && Array.isArray(data.prescriptions) && data.prescriptions.length > 0) {
        data.prescriptions.forEach((rx: any) => {
          const medIdx = state.medicines.findIndex((m) => m.id === rx.medicineId || m.brandName === rx.medicineName);
          if (medIdx !== -1) {
            const med = state.medicines[medIdx];
            const qty = Number(rx.quantity) || 1;
            const stockBefore = med.currentStock;
            const stockAfter = Math.max(0, stockBefore - qty);
            state.medicines[medIdx] = {
              ...med,
              currentStock: stockAfter,
              stockStatus: stockAfter > med.minimumStock ? "in_stock" : stockAfter > 0 ? "low_stock" : "out_of_stock",
            };
          }
        });

        // Create or update prescription in pharmacy queue
        const prxIdx = state.prescriptions.findIndex((p) => p.encounterId === id);
        if (prxIdx !== -1) {
          state.prescriptions[prxIdx].items = data.prescriptions as any;
          state.prescriptions[prxIdx].totalAmount = data.prescriptions.reduce((sum: number, p: any) => sum + (p.totalPrice || 0), 0);
        } else {
          const prxNum = state.prescriptions.length + 1;
          state.prescriptions.unshift({
            id: `PRX-${String(prxNum).padStart(3, "0")}`,
            prescriptionNumber: `RX-2026-${String(prxNum).padStart(4, "0")}`,
            facilityId: result?.facilityId || "FAC-001",
            encounterId: id,
            patientId: result?.patientId || "PAT-001",
            patientName: result?.patientName || "Pasien Dental",
            patientMrn: result?.patientMrn || "RM-2026-000001",
            doctorId: result?.doctorId || "DOC-001",
            doctorName: result?.doctorName || "drg. Jihan, S.Kep",
            items: data.prescriptions as any,
            totalAmount: data.prescriptions.reduce((sum: number, p: any) => sum + (p.totalPrice || 0), 0),
            paymentStatus: "unpaid",
            status: "ready",
            createdAt: new Date().toISOString(),
          } as any);
        }
      }

      if (result) {
        this.syncInvoiceForEncounter(state, result);
      }
    });
    if (!result) throw new Error("Encounter not found");
    return result;
  }
}

export class MockPharmacyRepository implements IPharmacyRepository {
  async getPrescriptions(query: QueryParams & { status?: string } = {}): Promise<Prescription[]> {
    let items = [...mockStore.getState().prescriptions];
    if (query.status) {
      items = items.filter((p) => p.status === query.status);
    }
    return items;
  }

  async getPrescriptionById(id: string): Promise<Prescription | null> {
    return mockStore.getState().prescriptions.find((p) => p.id === id) || null;
  }

  async updatePrescriptionStatus(
    id: string,
    status: Prescription["status"],
    dispensedBy?: string
  ): Promise<Prescription> {
    let result: Prescription | null = null;
    mockStore.updateState((state) => {
      const idx = state.prescriptions.findIndex((p) => p.id === id);
      if (idx !== -1) {
        state.prescriptions[idx].status = status;
        if (status === "dispensed") {
          state.prescriptions[idx].dispensedAt = new Date().toISOString();
          state.prescriptions[idx].dispensedBy = dispensedBy || "apt. Hendro Wibowo, S.Farm";
        }
        result = state.prescriptions[idx];
      }
    });
    if (!result) throw new Error("Prescription not found");
    return result;
  }

  async getMedicines(query: QueryParams & { category?: string; stockStatus?: string } = {}): Promise<Medicine[]> {
    let items = [...mockStore.getState().medicines];
    if (query.category) {
      items = items.filter((m) => m.category === query.category);
    }
    if (query.stockStatus) {
      items = items.filter((m) => m.stockStatus === query.stockStatus);
    }
    if (query.search) {
      const q = query.search.toLowerCase();
      items = items.filter(
        (m) =>
          m.genericName.toLowerCase().includes(q) ||
          m.brandName.toLowerCase().includes(q) ||
          m.code.toLowerCase().includes(q)
      );
    }
    return items;
  }

  async getMedicineById(id: string): Promise<Medicine | null> {
    return mockStore.getState().medicines.find((m) => m.id === id) || null;
  }

  async createMedicine(data: Partial<Medicine>): Promise<Medicine> {
    const newMed: Medicine = {
      id: "MED-" + Date.now(),
      code: "MED-" + Math.floor(100 + Math.random() * 900),
      brandName: data.brandName || "New Medicine",
      genericName: data.genericName || "Generic",
      category: (data.category as any) || "Antibiotic",
      dosageForm: data.dosageForm || "Tablet",
      strength: data.strength || "500mg",
      unit: data.unit || "tablet",
      manufacturer: data.manufacturer || "Kimia Farma",
      currentStock: data.currentStock || 0,
      minimumStock: data.minimumStock || 10,
      purchasePrice: data.purchasePrice || 1000,
      sellingPrice: data.sellingPrice || 2000,
      expiryDate: data.expiryDate || "2027-12-31",
      stockStatus: (data.currentStock || 0) > 10 ? "in_stock" : "low_stock",
      requiresPrescription: data.requiresPrescription ?? true,
    };
    mockStore.updateState((state) => {
      state.medicines.unshift(newMed);
    });
    return newMed;
  }

  async updateMedicine(id: string, data: Partial<Medicine>): Promise<Medicine> {
    let result: Medicine | null = null;
    mockStore.updateState((state) => {
      const idx = state.medicines.findIndex((m) => m.id === id);
      if (idx !== -1) {
        state.medicines[idx] = { ...state.medicines[idx], ...data };
        result = state.medicines[idx];
      }
    });
    if (!result) throw new Error("Medicine not found");
    return result;
  }

  async deleteMedicine(id: string): Promise<boolean> {
    mockStore.updateState((state) => {
      state.medicines = state.medicines.filter((m) => m.id !== id);
    });
    return true;
  }

  async stockIn(
    medicineId: string,
    quantity: number,
    unitCost: number,
    supplier: string,
    notes?: string,
    syncFinance: boolean = true
  ): Promise<any> {
    let med = await this.getMedicineById(medicineId);
    if (!med) throw new Error("Medicine not found");
    med.currentStock += quantity;
    med.purchasePrice = unitCost;
    return {
      medicine: med,
      mutation: { id: "MUT-" + Date.now(), type: "in", quantity, unitCost, supplier, notes },
    };
  }

  async stockOut(medicineId: string, quantity: number, notes?: string): Promise<any> {
    let med = await this.getMedicineById(medicineId);
    if (!med) throw new Error("Medicine not found");
    med.currentStock = Math.max(0, med.currentStock - quantity);
    return {
      medicine: med,
      mutation: { id: "MUT-" + Date.now(), type: "out", quantity, notes },
    };
  }

  async getMutations(medicineId?: string): Promise<any[]> {
    return [];
  }

  async updateMedicineStock(id: string, newStock: number): Promise<Medicine> {
    let result: Medicine | null = null;
    mockStore.updateState((state) => {
      const idx = state.medicines.findIndex((m) => m.id === id);
      if (idx !== -1) {
        const item = state.medicines[idx];
        item.currentStock = newStock;
        if (newStock <= 0) item.stockStatus = "out_of_stock";
        else if (newStock <= item.minimumStock) item.stockStatus = "low_stock";
        else item.stockStatus = "in_stock";
        result = item;
      }
    });
    if (!result) throw new Error("Medicine not found");
    return result;
  }
}

export class MockLaboratoryRepository implements ILaboratoryRepository {
  async getOrders(query: QueryParams & { status?: string; priority?: string } = {}): Promise<LaboratoryOrder[]> {
    let items = [...mockStore.getState().labOrders];
    if (query.status) {
      items = items.filter((o) => o.status === query.status);
    }
    if (query.priority) {
      items = items.filter((o) => o.priority === query.priority);
    }
    return items;
  }

  async getOrderById(id: string): Promise<LaboratoryOrder | null> {
    return mockStore.getState().labOrders.find((o) => o.id === id) || null;
  }

  async updateOrderStatus(id: string, status: LaboratoryOrder["status"]): Promise<LaboratoryOrder> {
    let result: LaboratoryOrder | null = null;
    mockStore.updateState((state) => {
      const idx = state.labOrders.findIndex((o) => o.id === id);
      if (idx !== -1) {
        state.labOrders[idx].status = status;
        result = state.labOrders[idx];
      }
    });
    if (!result) throw new Error("Lab order not found");
    return result;
  }
}

export class MockRadiologyRepository implements IRadiologyRepository {
  async getOrders(query: QueryParams & { status?: string; modality?: string } = {}): Promise<RadiologyOrder[]> {
    let items = [...mockStore.getState().radOrders];
    if (query.status) {
      items = items.filter((o) => o.status === query.status);
    }
    if (query.modality) {
      items = items.filter((o) => o.modality === query.modality);
    }
    return items;
  }

  async getOrderById(id: string): Promise<RadiologyOrder | null> {
    return mockStore.getState().radOrders.find((o) => o.id === id) || null;
  }
}

export class MockInpatientRepository implements IInpatientRepository {
  async getRooms(): Promise<Room[]> {
    return mockStore.getState().rooms;
  }

  async getAdmissions(status?: string): Promise<Admission[]> {
    let items = [...mockStore.getState().admissions];
    if (status) {
      items = items.filter((a) => a.status === status);
    }
    return items;
  }

  async updateBedStatus(bedId: string, status: Room["beds"][0]["status"]): Promise<boolean> {
    let updated = false;
    mockStore.updateState((state) => {
      for (const room of state.rooms) {
        const bed = room.beds.find((b) => b.id === bedId);
        if (bed) {
          bed.status = status;
          updated = true;
          break;
        }
      }
    });
    return updated;
  }
}

export class MockBillingRepository implements IBillingRepository {
  async getInvoices(query: QueryParams & { status?: string; patientId?: string; encounterId?: string } = {}): Promise<Invoice[]> {
    let items = [...mockStore.getState().invoices];
    if (query.status) {
      items = items.filter((i) => i.status === query.status || (i as any).paymentStatus === query.status);
    }
    if (query.patientId) {
      items = items.filter((i) => i.patientId === query.patientId);
    }
    if (query.encounterId) {
      items = items.filter((i) => i.encounterId === query.encounterId);
    }
    return items;
  }

  async getInvoiceById(id: string): Promise<Invoice | null> {
    return mockStore.getState().invoices.find((i) => i.id === id) || null;
  }

  async recordPayment(
    invoiceId: string,
    paymentMethod: string,
    amount: number,
    cashierName: string
  ): Promise<Invoice> {
    let result: Invoice | null = null;
    mockStore.updateState((state) => {
      const idx = state.invoices.findIndex((i) => i.id === invoiceId || i.invoiceNumber === invoiceId);
      if (idx !== -1) {
        const inv = state.invoices[idx];
        const nextTrxNum = (inv.transactions?.length || 0) + 1;
        const trxId = `TRX-${Date.now()}`;
        if (!inv.transactions) inv.transactions = [];
        inv.transactions.push({
          id: trxId,
          transactionNumber: `TRX-2026-${String(nextTrxNum).padStart(4, "0")}`,
          paymentMethod: paymentMethod as any,
          amount,
          paidAt: new Date().toISOString(),
          cashierName: cashierName || "Kasir OKAY Dental",
        });
        inv.paidAmount = (Number(inv.paidAmount) || 0) + amount;
        inv.balanceAmount = Math.max(0, (Number(inv.totalAmount) || 0) - (Number(inv.insuranceCoverage) || 0) - inv.paidAmount);
        inv.status = inv.balanceAmount <= 0 ? "paid" : "partial";
        result = inv;

        // Otomatis catat Kas Masuk (income) dari pembayaran kasir pasien ke store persisten
        state.financeTransactions = state.financeTransactions || [];
        state.financeTransactions.unshift({
          id: `FIN-${Date.now()}`,
          transactionNumber: `TRX-IN-${new Date().toISOString().slice(0, 10).replace(/-/g, "")}-${String(Math.floor(Math.random() * 900) + 100)}`,
          type: "income",
          category: "patient_payment",
          amount,
          paymentMethod: paymentMethod || "cash",
          description: `Pembayaran Kasir Pasien: ${inv.patientName} (${inv.invoiceNumber})`,
          referenceId: inv.id,
          referenceType: "invoice",
          date: new Date().toISOString().split("T")[0],
          operatorName: cashierName || "Kasir OKAY Dental",
          notes: `Pembayaran kasir ${inv.invoiceNumber} | Metode: ${paymentMethod}`,
          createdAt: new Date().toISOString(),
        });
      }
    });
    if (!result) throw new Error("Invoice not found");
    return result;
  }
}

export class MockInventoryRepository implements IInventoryRepository {
  async getItems(query: QueryParams & { category?: string; status?: string } = {}): Promise<InventoryItem[]> {
    let items = [...mockStore.getState().inventory];
    if (query.category) {
      items = items.filter((i) => i.category === query.category);
    }
    if (query.status) {
      items = items.filter((i) => i.status === query.status);
    }
    return items;
  }
}

export class MockSystemRepository implements ISystemRepository {
  async getNotifications(): Promise<AppNotification[]> {
    mockStore.updateState((s) => {
      // Dynamically generate H-1 control notifications from actual patient appointments
      const controlApts = s.appointments.filter(
        (a) =>
          a.visitType === "control" ||
          (a.complaint && a.complaint.toLowerCase().includes("kontrol"))
      );

      controlApts.forEach((apt) => {
        const notifId = `NOTIF-H1-${apt.id}`;
        const existing = s.notifications.find((n) => n.id === notifId);
        if (!existing) {
          s.notifications.unshift({
            id: notifId,
            facilityId: apt.facilityId || "FAC-001",
            title: `Jadwal Kontrol Gigi Besok (H-1): ${apt.patientName}`,
            message: `Pasien ${apt.patientName} (${apt.patientMrn}) dijadwalkan ${apt.complaint || "Kontrol rutin gigi"} besok pukul ${apt.appointmentTime} bersama ${apt.doctorName}. Harap konfirmasi kehadiran pasien.`,
            category: "appointment",
            timestamp: apt.updatedAt || apt.createdAt || new Date().toISOString(),
            isRead: false,
            severity: "warning",
            actionUrl: "/appointments",
          });
        }
      });
    });
    return mockStore.getState().notifications;
  }

  async markNotificationRead(id: string): Promise<boolean> {
    let updated = false;
    mockStore.updateState((state) => {
      const notif = state.notifications.find((n) => n.id === id);
      if (notif) {
        notif.isRead = true;
        updated = true;
      }
    });
    return updated;
  }

  async getAuditLogs(): Promise<AuditLog[]> {
    return mockStore.getState().auditLogs;
  }

  async getHospitalProfile(): Promise<HospitalProfile> {
    return mockStore.getHospitalProfile();
  }

  async updateHospitalProfile(profile: Partial<HospitalProfile>): Promise<HospitalProfile> {
    return mockStore.updateHospitalProfile(profile);
  }

  async resetDemoData(): Promise<void> {
    mockStore.resetDemoData();
  }
}

export class MockFinanceRepository implements IFinanceRepository {
  private syncPatientPayments() {
    mockStore.updateState((state) => {
      state.financeTransactions = state.financeTransactions || [];
      const invoices = state.invoices || [];

      invoices.forEach((inv) => {
        const paid = Number(inv.paidAmount) || 0;
        if (paid > 0 || inv.status === "paid") {
          const exists = state.financeTransactions.some(
            (t) =>
              t.referenceId === inv.id ||
              t.referenceId === inv.invoiceNumber ||
              (t.description && t.description.includes(inv.invoiceNumber))
          );
          if (!exists) {
            const payMethod = (inv.transactions && inv.transactions[0]?.paymentMethod) || "cash";
            const cashier = (inv.transactions && inv.transactions[0]?.cashierName) || "Kasir OKAY Dental";
            const dateStr = (inv.paidAt || inv.invoiceDate || inv.createdAt || new Date().toISOString()).split("T")[0];
            state.financeTransactions.unshift({
              id: `FIN-INV-${inv.id}`,
              transactionNumber: `TRX-IN-${dateStr.replace(/-/g, "")}-${String(Math.floor(Math.random() * 900) + 100)}`,
              type: "income",
              category: "patient_payment",
              amount: paid || Number(inv.totalAmount) || 0,
              paymentMethod: payMethod,
              description: `Pembayaran Kasir Pasien: ${inv.patientName} (${inv.invoiceNumber})`,
              referenceId: inv.id,
              referenceType: "invoice",
              date: dateStr,
              operatorName: cashier,
              notes: `Pelunasan tagihan kasir dental (${inv.invoiceNumber})`,
              createdAt: inv.paidAt || inv.invoiceDate || inv.createdAt || new Date().toISOString(),
            });
          }
        }
      });
    });
  }

  async getSummary() {
    this.syncPatientPayments();
    const transactions = mockStore.getState().financeTransactions || [];
    const invoices = mockStore.getState().invoices || [];

    const income = transactions.filter((t) => t.type === "income").reduce((s, t) => s + (Number(t.amount) || 0), 0);
    const expense = transactions.filter((t) => t.type === "expense").reduce((s, t) => s + (Number(t.amount) || 0), 0);
    const today = new Date().toISOString().split("T")[0];
    const todayInc = transactions
      .filter((t) => t.type === "income" && (t.date === today || t.createdAt?.startsWith(today)))
      .reduce((s, t) => s + (Number(t.amount) || 0), 0);

    const unpaidInvoices = invoices.filter((i) => i.status !== "paid");
    const unpaidAmount = unpaidInvoices.reduce((s, i) => s + (Number(i.balanceAmount) || 0), 0);

    return {
      todayRevenue: todayInc || income,
      monthRevenue: income,
      monthExpense: expense,
      netCashflow: income - expense,
      totalIncome: income,
      totalExpense: expense,
      netBalance: income - expense,
      unpaidInvoices: unpaidInvoices.length,
      unpaidAmount: unpaidAmount,
    };
  }

  async getTransactions(query?: any) {
    this.syncPatientPayments();
    let list = [...(mockStore.getState().financeTransactions || [])];
    if (query?.type) list = list.filter((t) => t.type === query.type);
    if (query?.category) {
      if (query.category === "patient_payment") {
        list = list.filter((t) => t.category === "patient_payment" || t.referenceType === "invoice");
      } else {
        list = list.filter((t) => t.category === query.category);
      }
    }
    return list;
  }

  async createTransaction(data: any) {
    const item = {
      id: "FIN-" + Date.now(),
      transactionNumber: "TRX-" + (data.type === "income" ? "IN-" : "OUT-") + Date.now(),
      ...data,
      createdAt: new Date().toISOString(),
    };
    mockStore.updateState((state) => {
      state.financeTransactions = state.financeTransactions || [];
      state.financeTransactions.unshift(item);
    });
    return item;
  }
}

// In-Memory Master Data State for Mock Mode
let mockDiagnoses: DentalDiagnosisMaster[] = diagnosesSeed.map((d) => ({
  id: d.id,
  code: d.code,
  name: d.name,
  category: d.category || "Umum",
  description: d.description || d.name,
  isActive: true,
}));

let mockProcedures: DentalProcedureMaster[] = [
  { id: "PROC-001", code: "23.2", name: "Penambalan Gigi Komposit / Composite Resin Restoration", category: "Konservasi Gigi", cost: 350000, description: "Restorasi kavitas gigi estetik sewarna gigi dengan aktivasi sinar light-curing.", isActive: true },
  { id: "PROC-002", code: "96.54", name: "Pembersihan Karang Gigi Ultrasonik (Scaling & Polishing)", category: "Periodonsia", cost: 300000, description: "Pembersihan karang gigi supra & subgingiva rahang atas dan bawah menggunakan ultrasonic scaler.", isActive: true },
  { id: "PROC-003", code: "23.09", name: "Pencabutan Gigi Tetap Dewasa (Simple Tooth Extraction)", category: "Bedah Mulut Minor", cost: 250000, description: "Ekstraksi gigi tetap tanpa penyulit dengan anestesi lokal infiltrasi/blok.", isActive: true },
  { id: "PROC-004", code: "23.19", name: "Odontektomi / Pembedahan Gigi Impaksi M3", category: "Bedah Mulut Minor", cost: 1750000, description: "Pembedahan pengangkatan gigi bungsu impaksi dengan flep mukoperiosteal dan ostektomi.", isActive: true },
  { id: "PROC-005", code: "23.7", name: "Perawatan Saluran Akar (Root Canal Treatment / Pulpektomi)", category: "Endodonsia", cost: 600000, description: "Ekstirpasi jaringan pulpa terinfeksi, preparasi biomekanis saluran akar, dan medikasi.", isActive: true },
  { id: "PROC-006", code: "23.41", name: "Aplikasi Fluor Topikal & Pit Fissure Sealant Gigi Anak", category: "Pedodonsia", cost: 200000, description: "Pencegahan karies primer pada celah dalam permukaan oklusal anak.", isActive: true },
  { id: "PROC-007", code: "87.12", name: "Rontgen Gigi Digital (Periapikal / Bitewing X-Ray)", category: "Radiologi Dental", cost: 100000, description: "Pemeriksaan radiografis penunjang kondisi jaringan periapikal dan tulang alveolar.", isActive: true },
  { id: "PROC-008", code: "23.42", name: "Bleaching / Pemutihan Gigi Estetik In-Office", category: "Estetika Gigi", cost: 1500000, description: "Aplikasi hidrogen peroksida konsentrasi medis dengan aktivasi LED dental bleaching.", isActive: true },
];

let mockDepartments: DentalDepartmentMaster[] = [
  { id: "DEP-001", name: "Poli Gigi Umum (Dental Chair 1)", code: "CHAIR-01", location: "Lantai 1 - Ruang Periksa 1", description: "Pemeriksaan umum gigi, scaling, penambalan dasar", isActive: true },
  { id: "DEP-002", name: "Konservasi Gigi & Endodonti (Dental Chair 2)", code: "CHAIR-02", location: "Lantai 1 - Ruang Periksa 2", description: "Perawatan saluran akar, restorasi estetik lanjut, bleaching", isActive: true },
  { id: "DEP-003", name: "Ortodonti / Kawat Gigi (Dental Chair 3)", code: "CHAIR-03", location: "Lantai 1 - Ruang Periksa 3", description: "Pemasangan behel kawat gigi, aligner, dan kontrol rutin", isActive: true },
  { id: "DEP-004", name: "Bedah Mulut & Odontektomi (Dental Chair 4)", code: "CHAIR-04", location: "Lantai 2 - Ruang Bedah Minor", description: "Pencabutan gigi bungsu impaksi, alveolektomi, kuretase", isActive: true },
  { id: "DEP-005", name: "Pedodonsia / Gigi Anak (Dental Chair 5)", code: "CHAIR-05", location: "Lantai 2 - Ruang Pedo Ramah Anak", description: "Perawatan gigi sulung anak, pit & fissure sealant, fluoride", isActive: true },
];

let mockInsurances: DentalInsuranceMaster[] = [
  { id: "INS-001", code: "BPJS-DNT", name: "BPJS Kesehatan (P-Care Dental)", category: "Pemerintah / JKN", contactPerson: "Pusat Layanan Faskes Primer BPJS", phone: "165", email: "faskes@bpjs-kesehatan.go.id", claimCount: 184, isActive: true },
  { id: "INS-002", code: "INHEALTH-DNT", name: "Mandiri Inhealth Dental Care", category: "Asuransi Komersial", contactPerson: "Bambang Irawan (Provider Relation)", phone: "021-525-0988", email: "provider.dental@mandiriinhealth.co.id", claimCount: 67, isActive: true },
  { id: "INS-003", code: "PRU-DNT", name: "Prudential PRUMedical Dental Rider", category: "Asuransi Swasta", contactPerson: "Customer Care Dental Claim", phone: "1500085", email: "claim@prudential.co.id", claimCount: 42, isActive: true },
  { id: "INS-004", code: "ADMEDIKA", name: "AdMedika Third Party Administrator", category: "TPA Korporasi", contactPerson: "Meja Bantuan Klaim AdMedika", phone: "021-500-811", email: "helpdesk@admedika.co.id", claimCount: 95, isActive: true },
];

export class MockDentalMasterRepository implements IDentalMasterRepository {
  // Diagnoses
  async getDiagnoses(query: { category?: string; search?: string } = {}): Promise<DentalDiagnosisMaster[]> {
    let result = [...mockDiagnoses];
    if (query.category) result = result.filter(d => d.category === query.category);
    if (query.search) {
      const s = query.search.toLowerCase();
      result = result.filter(d => d.name.toLowerCase().includes(s) || d.code.toLowerCase().includes(s));
    }
    return result;
  }
  async createDiagnosis(data: Partial<DentalDiagnosisMaster>): Promise<DentalDiagnosisMaster> {
    const item: DentalDiagnosisMaster = {
      id: "DX-" + Date.now(),
      code: data.code || "K00.0",
      name: data.name || "Diagnosis Baru",
      category: data.category || "Umum",
      description: data.description || "",
      isActive: data.isActive ?? true,
      createdAt: new Date().toISOString(),
    };
    mockDiagnoses.push(item);
    return item;
  }
  async updateDiagnosis(id: string, data: Partial<DentalDiagnosisMaster>): Promise<DentalDiagnosisMaster> {
    const idx = mockDiagnoses.findIndex(d => d.id === id);
    if (idx === -1) throw new Error("Diagnosis tidak ditemukan");
    mockDiagnoses[idx] = { ...mockDiagnoses[idx], ...data, updatedAt: new Date().toISOString() };
    return mockDiagnoses[idx];
  }
  async deleteDiagnosis(id: string): Promise<boolean> {
    mockDiagnoses = mockDiagnoses.filter(d => d.id !== id);
    return true;
  }

  // Procedures
  async getProcedures(query: { category?: string; search?: string } = {}): Promise<DentalProcedureMaster[]> {
    let result = [...mockProcedures];
    if (query.category) result = result.filter(p => p.category === query.category);
    if (query.search) {
      const s = query.search.toLowerCase();
      result = result.filter(p => p.name.toLowerCase().includes(s) || p.code.toLowerCase().includes(s));
    }
    return result;
  }
  async createProcedure(data: Partial<DentalProcedureMaster>): Promise<DentalProcedureMaster> {
    const item: DentalProcedureMaster = {
      id: "PROC-" + Date.now(),
      code: data.code || "00.00",
      name: data.name || "Tindakan Baru",
      category: data.category || "Umum",
      cost: data.cost || 0,
      description: data.description || "",
      isActive: data.isActive ?? true,
      createdAt: new Date().toISOString(),
    };
    mockProcedures.push(item);
    return item;
  }
  async updateProcedure(id: string, data: Partial<DentalProcedureMaster>): Promise<DentalProcedureMaster> {
    const idx = mockProcedures.findIndex(p => p.id === id);
    if (idx === -1) throw new Error("Tindakan tidak ditemukan");
    mockProcedures[idx] = { ...mockProcedures[idx], ...data, updatedAt: new Date().toISOString() };
    return mockProcedures[idx];
  }
  async deleteProcedure(id: string): Promise<boolean> {
    mockProcedures = mockProcedures.filter(p => p.id !== id);
    return true;
  }

  // Departments (Chairs)
  async getDepartments(query: { search?: string; isActive?: boolean } = {}): Promise<DentalDepartmentMaster[]> {
    let result = [...mockDepartments];
    if (query.isActive !== undefined) result = result.filter(d => d.isActive === query.isActive);
    if (query.search) {
      const s = query.search.toLowerCase();
      result = result.filter(d => d.name.toLowerCase().includes(s) || (d.code && d.code.toLowerCase().includes(s)));
    }
    return result;
  }
  async createDepartment(data: Partial<DentalDepartmentMaster>): Promise<DentalDepartmentMaster> {
    const item: DentalDepartmentMaster = {
      id: "DEP-" + Date.now(),
      name: data.name || "Unit Poli Baru",
      code: data.code || "CHAIR-" + Math.floor(Math.random() * 90 + 10),
      location: data.location || "Lantai 1",
      description: data.description || "",
      isActive: data.isActive ?? true,
      createdAt: new Date().toISOString(),
    };
    mockDepartments.push(item);
    return item;
  }
  async updateDepartment(id: string, data: Partial<DentalDepartmentMaster>): Promise<DentalDepartmentMaster> {
    const idx = mockDepartments.findIndex(d => d.id === id);
    if (idx === -1) throw new Error("Unit poli tidak ditemukan");
    mockDepartments[idx] = { ...mockDepartments[idx], ...data, updatedAt: new Date().toISOString() };
    return mockDepartments[idx];
  }
  async deleteDepartment(id: string): Promise<boolean> {
    mockDepartments = mockDepartments.filter(d => d.id !== id);
    return true;
  }

  // Insurances
  async getInsurances(query: { category?: string; search?: string } = {}): Promise<DentalInsuranceMaster[]> {
    let result = [...mockInsurances];
    if (query.category) result = result.filter(i => i.category === query.category);
    if (query.search) {
      const s = query.search.toLowerCase();
      result = result.filter(i => i.name.toLowerCase().includes(s) || i.code.toLowerCase().includes(s));
    }
    return result;
  }
  async createInsurance(data: Partial<DentalInsuranceMaster>): Promise<DentalInsuranceMaster> {
    const item: DentalInsuranceMaster = {
      id: "INS-" + Date.now(),
      code: data.code || "INS-" + Math.floor(Math.random() * 90 + 10),
      name: data.name || "Asuransi Baru",
      category: data.category || "Asuransi Swasta",
      contactPerson: data.contactPerson || "",
      phone: data.phone || "",
      email: data.email || "",
      claimCount: 0,
      isActive: data.isActive ?? true,
      createdAt: new Date().toISOString(),
    };
    mockInsurances.push(item);
    return item;
  }
  async updateInsurance(id: string, data: Partial<DentalInsuranceMaster>): Promise<DentalInsuranceMaster> {
    const idx = mockInsurances.findIndex(i => i.id === id);
    if (idx === -1) throw new Error("Penjamin tidak ditemukan");
    mockInsurances[idx] = { ...mockInsurances[idx], ...data, updatedAt: new Date().toISOString() };
    return mockInsurances[idx];
  }
  async deleteInsurance(id: string): Promise<boolean> {
    mockInsurances = mockInsurances.filter(i => i.id !== id);
    return true;
  }
}

let mockUsers: User[] = [
  {
    id: "1",
    name: "drg. Pratama Wijaya",
    email: "admin@dentalcare.local",
    role: "super_admin",
    roleName: "Super Admin",
    employeeNumber: "DOC-2020-001",
    phone: "081311223344",
    facilityId: "FAC-001",
    isActive: true,
  },
  {
    id: "2",
    name: "drg. Amanda Putri, Sp.Ort",
    email: "amanda@dentalcare.local",
    role: "doctor",
    roleName: "Dokter Gigi",
    employeeNumber: "DOC-0004",
    phone: "081234567890",
    facilityId: "FAC-001",
    isActive: true,
  },
  {
    id: "3",
    name: "Ns. Rini Handayani, S.Kep",
    email: "perawat@dentalcare.local",
    role: "nurse",
    roleName: "Perawat Gigi",
    employeeNumber: "NUR-0005",
    phone: "081233445566",
    facilityId: "FAC-001",
    isActive: true,
  },
  {
    id: "4",
    name: "Apt. Rizky Pratama, S.Farm",
    email: "farmasi@dentalcare.local",
    role: "pharmacist",
    roleName: "Petugas Farmasi",
    employeeNumber: "PHA-0006",
    phone: "081377889900",
    facilityId: "FAC-001",
    isActive: true,
  },
];

export class MockUserRepository implements IUserRepository {
  async getUsers(query: QueryParams & { role?: string; isActive?: boolean; search?: string } = {}): Promise<User[]> {
    let result = [...mockUsers];
    if (query.role) {
      const r = query.role.toLowerCase();
      if (r === "dokter" || r === "doctor") result = result.filter(u => u.role === "doctor" || (u as any).role === "dokter");
      else if (r === "perawat" || r === "nurse") result = result.filter(u => u.role === "nurse" || (u as any).role === "perawat");
      else if (r === "farmasi" || r === "pharmacist") result = result.filter(u => u.role === "pharmacist" || (u as any).role === "farmasi");
      else result = result.filter(u => u.role === query.role);
    }
    if (typeof query.isActive === "boolean") {
      result = result.filter(u => u.isActive === query.isActive);
    }
    if (query.search) {
      const s = query.search.toLowerCase();
      result = result.filter(u => u.name.toLowerCase().includes(s) || u.email.toLowerCase().includes(s) || (u.phone && u.phone.includes(s)));
    }
    return result;
  }

  async getUserById(id: string): Promise<User> {
    const user = mockUsers.find(u => u.id === id);
    if (!user) throw new Error("Pengguna tidak ditemukan");
    return user;
  }

  async createUser(data: Partial<User> & { password?: string }): Promise<User> {
    const roleMeta: Record<string, string> = {
      super_admin: "Super Admin",
      doctor: "Dokter Gigi",
      dokter: "Dokter Gigi",
      nurse: "Perawat Gigi",
      perawat: "Perawat Gigi",
      pharmacist: "Petugas Farmasi",
      farmasi: "Petugas Farmasi",
    };
    const r = (data.role as string) || "";
    const roleCode = (r === "dokter" ? "doctor" : r === "perawat" ? "nurse" : r === "farmasi" ? "pharmacist" : data.role) || "super_admin";
    const nextId = String(mockUsers.length + 1);
    const newUser: User = {
      id: nextId,
      name: data.name || "Pengguna Baru",
      email: data.email || `user${nextId}@dentalcare.local`,
      role: roleCode as any,
      roleName: roleMeta[data.role || ""] || "Pengguna",
      phone: data.phone || "",
      employeeNumber: data.employeeNumber || `EMP-${nextId.padStart(4, "0")}`,
      facilityId: "FAC-001",
      isActive: data.isActive ?? true,
      createdAt: new Date().toISOString(),
    };
    mockUsers.unshift(newUser);
    return newUser;
  }

  async updateUser(id: string, data: Partial<User> & { password?: string }): Promise<User> {
    const idx = mockUsers.findIndex(u => u.id === id);
    if (idx === -1) throw new Error("Pengguna tidak ditemukan");
    const roleMeta: Record<string, string> = {
      super_admin: "Super Admin",
      doctor: "Dokter Gigi",
      dokter: "Dokter Gigi",
      nurse: "Perawat Gigi",
      perawat: "Perawat Gigi",
      pharmacist: "Petugas Farmasi",
      farmasi: "Petugas Farmasi",
    };
    const r = (data.role as string) || "";
    const roleCode = data.role ? (r === "dokter" ? "doctor" : r === "perawat" ? "nurse" : r === "farmasi" ? "pharmacist" : data.role) : mockUsers[idx].role;
    mockUsers[idx] = {
      ...mockUsers[idx],
      ...data,
      role: roleCode as any,
      roleName: data.role ? (roleMeta[data.role] || mockUsers[idx].roleName) : mockUsers[idx].roleName,
      updatedAt: new Date().toISOString(),
    };
    return mockUsers[idx];
  }

  async deleteUser(id: string): Promise<boolean> {
    mockUsers = mockUsers.filter(u => u.id !== id);
    return true;
  }

  async toggleStatus(id: string): Promise<User> {
    const idx = mockUsers.findIndex(u => u.id === id);
    if (idx === -1) throw new Error("Pengguna tidak ditemukan");
    mockUsers[idx].isActive = !mockUsers[idx].isActive;
    return mockUsers[idx];
  }
}


