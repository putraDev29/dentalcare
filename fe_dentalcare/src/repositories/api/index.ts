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
import { apiClient } from "@/lib/api/client";
import { API_ENDPOINTS } from "@/lib/api/endpoints";
import patientsSeed from "@/data/patients.json";
import encountersSeed from "@/data/encounters.json";
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

export class ApiPatientRepository implements IPatientRepository {
  async getPatients(query: PatientQuery = {}): Promise<PaginatedResult<Patient>> {
    const res: any = await apiClient.get(API_ENDPOINTS.patients, query as any);
    if (res && Array.isArray(res.data) && res.meta) {
      return res as PaginatedResult<Patient>;
    }
    if (Array.isArray(res)) {
      const page = Number(query.page) || 1;
      const perPage = Number(query.perPage) || 10;
      return {
        data: res,
        meta: {
          page,
          perPage,
          total: res.length,
          totalPages: Math.max(1, Math.ceil(res.length / perPage)),
        },
      };
    }
    if (res && Array.isArray(res.data)) {
      return {
        data: res.data,
        meta: res.meta || {
          page: Number(query.page) || 1,
          perPage: Number(query.perPage) || 10,
          total: res.data.length,
          totalPages: 1,
        },
      };
    }
    return {
      data: [],
      meta: { page: 1, perPage: 10, total: 0, totalPages: 0 },
    };
  }
  async getPatientById(id: string): Promise<Patient | null> {
    try {
      const p = await apiClient.get<Patient>(`${API_ENDPOINTS.patients}/${id}`);
      if (p) return p;
    } catch { }
    const seed = (patientsSeed as Patient[]).find((p) => p.id === id);
    return seed || null;
  }
  async createPatient(data: CreatePatientInput): Promise<Patient> {
    return apiClient.post<Patient>(API_ENDPOINTS.patients, data);
  }
  async updatePatient(id: string, data: UpdatePatientInput): Promise<Patient> {
    return apiClient.put<Patient>(`${API_ENDPOINTS.patients}/${id}`, data);
  }
  async deletePatient(id: string): Promise<boolean> {
    await apiClient.delete(`${API_ENDPOINTS.patients}/${id}`);
    return true;
  }
  async updateControlSchedule(patientId: string, data: { nextControlDate: string; appointmentTime?: string; doctorName?: string; doctorId?: string; notes?: string }): Promise<Patient> {
    const res: any = await apiClient.post(`${API_ENDPOINTS.patients}/${patientId}/control-schedule`, data);
    return res.patient || res;
  }
}

export class ApiDoctorRepository implements IDoctorRepository {
  async getDoctors(query: QueryParams & { departmentId?: string } = {}): Promise<Doctor[]> {
    return apiClient.get<Doctor[]>(API_ENDPOINTS.doctors, query as any);
  }
  async getDoctorById(id: string): Promise<Doctor | null> {
    return apiClient.get<Doctor>(`${API_ENDPOINTS.doctors}/${id}`);
  }
  async createDoctor(data: Partial<Doctor>): Promise<Doctor> {
    return apiClient.post<Doctor>(API_ENDPOINTS.doctors, data);
  }
  async updateDoctor(id: string, data: Partial<Doctor>): Promise<Doctor> {
    return apiClient.put<Doctor>(`${API_ENDPOINTS.doctors}/${id}`, data);
  }
  async deleteDoctor(id: string): Promise<boolean> {
    await apiClient.delete(`${API_ENDPOINTS.doctors}/${id}`);
    return true;
  }
}

export class ApiAppointmentRepository implements IAppointmentRepository {
  async getAppointments(query: QueryParams & { doctorId?: string; date?: string; status?: string; patientId?: string } = {}): Promise<Appointment[]> {
    return apiClient.get<Appointment[]>(API_ENDPOINTS.appointments, query as any);
  }
  async getAppointmentById(id: string): Promise<Appointment | null> {
    return apiClient.get<Appointment>(`${API_ENDPOINTS.appointments}/${id}`);
  }
  async createAppointment(data: CreateAppointmentInput): Promise<Appointment> {
    return apiClient.post<Appointment>(API_ENDPOINTS.appointments, data);
  }
  async updateAppointmentStatus(id: string, status: Appointment["status"]): Promise<Appointment> {
    return apiClient.patch<Appointment>(`${API_ENDPOINTS.appointments}/${id}/status`, { status });
  }
}

export class ApiQueueRepository implements IQueueRepository {
  async getQueues(query: QueryParams & { departmentId?: string; status?: string; serviceType?: string } = {}): Promise<QueueItem[]> {
    return apiClient.get<QueueItem[]>(API_ENDPOINTS.queues, query as any);
  }
  async updateQueueStatus(id: string, status: QueueItem["status"]): Promise<QueueItem> {
    return apiClient.patch<QueueItem>(`${API_ENDPOINTS.queues}/${id}/status`, { status });
  }
  async callNextQueue(departmentId?: string): Promise<QueueItem | null> {
    return apiClient.post<QueueItem>(`${API_ENDPOINTS.queues}/call-next`, { departmentId });
  }
  async enqueue(data: { patientId: string; patientName?: string; doctorId?: string; departmentId?: string; appointmentId?: string }): Promise<QueueItem> {
    return apiClient.post<QueueItem>(API_ENDPOINTS.queues, data);
  }
  async deleteQueue(id: string): Promise<void> {
    return apiClient.delete<void>(`${API_ENDPOINTS.queues}/${id}`);
  }
}

export class ApiEncounterRepository implements IEncounterRepository {
  private normalizeEncounter(enc: any): Encounter {
    if (!enc) return enc;
    return {
      ...enc,
      anamnesis: enc.anamnesis || {},
      vitalSigns: enc.vitalSigns || enc.vital_signs || {},
      diagnoses: Array.isArray(enc.diagnoses) ? enc.diagnoses : [],
      procedures: Array.isArray(enc.procedures) ? enc.procedures : [],
      prescriptions: Array.isArray(enc.prescriptions)
        ? enc.prescriptions
        : Array.isArray(enc.followUpPlan?.prescriptions)
        ? enc.followUpPlan.prescriptions
        : Array.isArray(enc.follow_up_plan?.prescriptions)
        ? enc.follow_up_plan.prescriptions
        : [],
      dentalNotes: enc.dentalNotes || enc.dental_notes || enc.followUpPlan?.dentalNotes || enc.follow_up_plan?.dentalNotes || "",
      nextControlDate: enc.nextControlDate || enc.next_control_date || enc.followUpPlan?.nextControlDate || enc.follow_up_plan?.nextControlDate || "",
    };
  }

  async getEncounters(query: QueryParams = {}): Promise<Encounter[]> {
    const list = await apiClient.get<any[]>(API_ENDPOINTS.encounters, query as any);
    return (list || []).map((enc) => this.normalizeEncounter(enc));
  }
  async getEncounterById(id: string): Promise<Encounter | null> {
    try {
      const enc = await apiClient.get<any>(`${API_ENDPOINTS.encounters}/${id}`);
      if (enc) return this.normalizeEncounter(enc);
    } catch { }
    const seed = (encountersSeed as any[]).find((e) => e.id === id);
    return seed ? this.normalizeEncounter(seed) : null;
  }
  async createEncounter(data: Partial<Encounter>): Promise<Encounter> {
    const enc = await apiClient.post<any>(API_ENDPOINTS.encounters, data);
    return this.normalizeEncounter(enc);
  }
  async updateEncounter(id: string, data: Partial<Encounter>): Promise<Encounter> {
    try {
      const enc = await apiClient.put<any>(`${API_ENDPOINTS.encounters}/${id}`, data);
      return this.normalizeEncounter(enc);
    } catch {
      const enc = await apiClient.post<any>(API_ENDPOINTS.encounters, { ...data, id });
      return this.normalizeEncounter(enc);
    }
  }
}

export class ApiPharmacyRepository implements IPharmacyRepository {
  async getPrescriptions(query: QueryParams = {}): Promise<Prescription[]> {
    return apiClient.get<Prescription[]>(API_ENDPOINTS.prescriptions, query as any);
  }
  async getPrescriptionById(id: string): Promise<Prescription | null> {
    return apiClient.get<Prescription>(`${API_ENDPOINTS.prescriptions}/${id}`);
  }
  async updatePrescriptionStatus(id: string, status: Prescription["status"], dispensedBy?: string): Promise<Prescription> {
    return apiClient.patch<Prescription>(`${API_ENDPOINTS.prescriptions}/${id}/status`, { status, dispensedBy });
  }
  async getMedicines(query: QueryParams = {}): Promise<Medicine[]> {
    return apiClient.get<Medicine[]>(API_ENDPOINTS.medicines, query as any);
  }
  async getMedicineById(id: string): Promise<Medicine | null> {
    return apiClient.get<Medicine>(`${API_ENDPOINTS.medicines}/${id}`);
  }
  async createMedicine(data: Partial<Medicine>): Promise<Medicine> {
    return apiClient.post<Medicine>(API_ENDPOINTS.medicines, data);
  }
  async updateMedicine(id: string, data: Partial<Medicine>): Promise<Medicine> {
    return apiClient.put<Medicine>(`${API_ENDPOINTS.medicines}/${id}`, data);
  }
  async deleteMedicine(id: string): Promise<boolean> {
    await apiClient.delete(`${API_ENDPOINTS.medicines}/${id}`);
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
    return apiClient.post(`${API_ENDPOINTS.medicines}/stock-in`, {
      medicineId,
      quantity,
      unitPrice: unitCost,
      supplier,
      notes,
      syncFinance,
    });
  }
  async stockOut(medicineId: string, quantity: number, notes?: string, reason: string = "treatment"): Promise<any> {
    return apiClient.post(`${API_ENDPOINTS.medicines}/stock-out`, {
      medicineId,
      quantity,
      reason,
      notes,
    });
  }
  async getMutations(medicineId?: string): Promise<any[]> {
    return apiClient.get<any[]>(`${API_ENDPOINTS.medicines}/mutations`, medicineId ? { medicineId } : {});
  }
  async updateMedicineStock(id: string, newStock: number): Promise<Medicine> {
    return apiClient.patch<Medicine>(`${API_ENDPOINTS.medicines}/${id}/stock`, { currentStock: newStock });
  }
}

export class ApiLaboratoryRepository implements ILaboratoryRepository {
  async getOrders(query: QueryParams = {}): Promise<LaboratoryOrder[]> {
    return apiClient.get<LaboratoryOrder[]>(API_ENDPOINTS.laboratory, query as any);
  }
  async getOrderById(id: string): Promise<LaboratoryOrder | null> {
    return apiClient.get<LaboratoryOrder>(`${API_ENDPOINTS.laboratory}/${id}`);
  }
  async updateOrderStatus(id: string, status: LaboratoryOrder["status"]): Promise<LaboratoryOrder> {
    return apiClient.patch<LaboratoryOrder>(`${API_ENDPOINTS.laboratory}/${id}/status`, { status });
  }
}

export class ApiRadiologyRepository implements IRadiologyRepository {
  async getOrders(query: QueryParams = {}): Promise<RadiologyOrder[]> {
    return apiClient.get<RadiologyOrder[]>(API_ENDPOINTS.radiology, query as any);
  }
  async getOrderById(id: string): Promise<RadiologyOrder | null> {
    return apiClient.get<RadiologyOrder>(`${API_ENDPOINTS.radiology}/${id}`);
  }
}

export class ApiInpatientRepository implements IInpatientRepository {
  async getRooms(): Promise<Room[]> {
    return apiClient.get<Room[]>(API_ENDPOINTS.inpatient.rooms);
  }
  async getAdmissions(status?: string): Promise<Admission[]> {
    return apiClient.get<Admission[]>(API_ENDPOINTS.inpatient.admissions, { status });
  }
  async updateBedStatus(bedId: string, status: Room["beds"][0]["status"]): Promise<boolean> {
    await apiClient.patch(`${API_ENDPOINTS.inpatient.rooms}/beds/${bedId}`, { status });
    return true;
  }
}

export class ApiBillingRepository implements IBillingRepository {
  private mapInvoice(inv: any): Invoice {
    const total = Number(inv.totalAmount) || 0;
    const covered = Number(inv.coveredByInsurance ?? inv.insuranceCoverage) || 0;
    const paid = Number(inv.patientPaidAmount ?? inv.paidAmount) || 0;
    const balance = inv.balanceAmount ?? inv.outstandingAmount ?? Math.max(0, total - covered - paid);

    return {
      ...inv,
      id: inv.id,
      invoiceNumber: inv.invoiceNumber || inv.id,
      facilityId: inv.facilityId || "FAC-001",
      patientId: inv.patientId,
      patientName: inv.patientName,
      patientMrn: inv.patientMrn || "-",
      patientPhone: inv.patientPhone || inv.patient_phone || undefined,
      emergencyContact: inv.emergencyContact || inv.emergency_contact || undefined,
      totalAmount: total,
      subtotal: Number(inv.subtotal) || total,
      discount: Number(inv.discount) || 0,
      tax: Number(inv.tax) || 0,
      insuranceCoverage: covered,
      patientResponsibility: Math.max(0, total - covered),
      paidAmount: paid,
      balanceAmount: balance,
      status: inv.status || (balance <= 0 ? "paid" : "pending"),
      transactions: inv.transactions || inv.payments || [],
      invoiceDate: inv.invoiceDate || (inv.createdAt ? inv.createdAt.split("T")[0] : new Date().toISOString().split("T")[0]),
      dueDate: inv.dueDate || (inv.createdAt ? inv.createdAt.split("T")[0] : new Date().toISOString().split("T")[0]),
      items: inv.items || [],
    };
  }

  async getInvoices(query: QueryParams = {}): Promise<Invoice[]> {
    const raw = await apiClient.get<any[]>(API_ENDPOINTS.billing.invoices, query as any);
    return Array.isArray(raw) ? raw.map((i) => this.mapInvoice(i)) : [];
  }

  async getInvoiceById(id: string): Promise<Invoice | null> {
    const raw = await apiClient.get<any>(`${API_ENDPOINTS.billing.invoices}/${id}`);
    return raw ? this.mapInvoice(raw) : null;
  }

  async recordPayment(invoiceId: string, paymentMethod: string, amount: number, cashierName: string): Promise<Invoice> {
    const raw = await apiClient.post<any>(API_ENDPOINTS.billing.payments, {
      invoiceId,
      paymentMethod,
      amount,
      cashierName,
    });
    return this.mapInvoice(raw);
  }
}

export class ApiInventoryRepository implements IInventoryRepository {
  async getItems(query: QueryParams = {}): Promise<InventoryItem[]> {
    return apiClient.get<InventoryItem[]>(API_ENDPOINTS.inventory, query as any);
  }
}

export class ApiSystemRepository implements ISystemRepository {
  async getNotifications(): Promise<AppNotification[]> {
    return apiClient.get<AppNotification[]>(API_ENDPOINTS.system.notifications);
  }
  async markNotificationRead(id: string): Promise<boolean> {
    await apiClient.patch(`${API_ENDPOINTS.system.notifications}/${id}/read`, {});
    return true;
  }
  async getAuditLogs(): Promise<AuditLog[]> {
    return apiClient.get<AuditLog[]>(API_ENDPOINTS.system.auditLogs);
  }
  async getHospitalProfile(): Promise<HospitalProfile> {
    return apiClient.get<HospitalProfile>("/system/hospital-profile");
  }
  async updateHospitalProfile(profile: Partial<HospitalProfile>): Promise<HospitalProfile> {
    return apiClient.put<HospitalProfile>("/system/hospital-profile", profile);
  }
  async resetDemoData(): Promise<void> {
    await apiClient.post("/system/reset-demo", {});
  }
}

export class ApiFinanceRepository implements IFinanceRepository {
  async getSummary(): Promise<{
    todayRevenue: number;
    monthRevenue: number;
    monthExpense: number;
    netCashflow: number;
    unpaidInvoices: number;
    unpaidAmount: number;
  }> {
    return apiClient.get("/finance/summary");
  }

  async getTransactions(query: QueryParams & { type?: string; category?: string } = {}): Promise<any[]> {
    const raw = await apiClient.get<any[]>("/finance/transactions", query as any);
    return (raw || []).map((t: any) => ({
      ...t,
      transactionNumber: t.transactionNumber || t.transaction_number || t.id,
      paymentMethod: t.paymentMethod || t.payment_method || "cash",
      operatorName: t.operatorName || t.operator_name || "Kasir OKAY Dental",
      referenceType: t.referenceType || t.reference_type,
      referenceId: t.referenceId || t.reference_id,
      createdAt: t.createdAt || t.created_at,
    }));
  }

  async createTransaction(data: {
    type: "income" | "expense";
    category: string;
    amount: number;
    referenceType?: string;
    referenceId?: string;
    notes?: string;
    transactionDate?: string;
  }): Promise<any> {
    return apiClient.post("/finance/transactions", data);
  }
}

export class ApiDentalMasterRepository implements IDentalMasterRepository {
  // Diagnoses (ICD-10)
  async getDiagnoses(query: { category?: string; search?: string } = {}): Promise<DentalDiagnosisMaster[]> {
    return apiClient.get<DentalDiagnosisMaster[]>("/clinical/diagnoses", query);
  }
  async createDiagnosis(data: Partial<DentalDiagnosisMaster>): Promise<DentalDiagnosisMaster> {
    return apiClient.post<DentalDiagnosisMaster>("/clinical/diagnoses", data);
  }
  async updateDiagnosis(id: string, data: Partial<DentalDiagnosisMaster>): Promise<DentalDiagnosisMaster> {
    return apiClient.put<DentalDiagnosisMaster>(`/clinical/diagnoses/${id}`, data);
  }
  async deleteDiagnosis(id: string): Promise<boolean> {
    await apiClient.delete(`/clinical/diagnoses/${id}`);
    return true;
  }

  // Procedures & Tariff
  async getProcedures(query: { category?: string; search?: string } = {}): Promise<DentalProcedureMaster[]> {
    return apiClient.get<DentalProcedureMaster[]>("/clinical/procedures", query);
  }
  async createProcedure(data: Partial<DentalProcedureMaster>): Promise<DentalProcedureMaster> {
    return apiClient.post<DentalProcedureMaster>("/clinical/procedures", data);
  }
  async updateProcedure(id: string, data: Partial<DentalProcedureMaster>): Promise<DentalProcedureMaster> {
    return apiClient.put<DentalProcedureMaster>(`/clinical/procedures/${id}`, data);
  }
  async deleteProcedure(id: string): Promise<boolean> {
    await apiClient.delete(`/clinical/procedures/${id}`);
    return true;
  }

  // Departments (Dental Chairs)
  async getDepartments(query: { search?: string; isActive?: boolean } = {}): Promise<DentalDepartmentMaster[]> {
    return apiClient.get<DentalDepartmentMaster[]>("/departments", query);
  }
  async createDepartment(data: Partial<DentalDepartmentMaster>): Promise<DentalDepartmentMaster> {
    return apiClient.post<DentalDepartmentMaster>("/departments", data);
  }
  async updateDepartment(id: string, data: Partial<DentalDepartmentMaster>): Promise<DentalDepartmentMaster> {
    return apiClient.put<DentalDepartmentMaster>(`/departments/${id}`, data);
  }
  async deleteDepartment(id: string): Promise<boolean> {
    await apiClient.delete(`/departments/${id}`);
    return true;
  }

  // Insurances & BPJS Dental
  async getInsurances(query: { category?: string; search?: string } = {}): Promise<DentalInsuranceMaster[]> {
    return apiClient.get<DentalInsuranceMaster[]>("/insurance", query);
  }
  async createInsurance(data: Partial<DentalInsuranceMaster>): Promise<DentalInsuranceMaster> {
    return apiClient.post<DentalInsuranceMaster>("/insurance", data);
  }
  async updateInsurance(id: string, data: Partial<DentalInsuranceMaster>): Promise<DentalInsuranceMaster> {
    return apiClient.put<DentalInsuranceMaster>(`/insurance/${id}`, data);
  }
  async deleteInsurance(id: string): Promise<boolean> {
    await apiClient.delete(`/insurance/${id}`);
    return true;
  }
}

export class ApiUserRepository implements IUserRepository {
  async getUsers(query: QueryParams & { role?: string; isActive?: boolean; search?: string } = {}): Promise<User[]> {
    return apiClient.get<User[]>(API_ENDPOINTS.users, query as any);
  }

  async getUserById(id: string): Promise<User> {
    return apiClient.get<User>(`${API_ENDPOINTS.users}/${id}`);
  }

  async createUser(data: Partial<User> & { password?: string }): Promise<User> {
    const res: any = await apiClient.post(API_ENDPOINTS.users, data);
    return res.data || res;
  }

  async updateUser(id: string, data: Partial<User> & { password?: string }): Promise<User> {
    const res: any = await apiClient.put(`${API_ENDPOINTS.users}/${id}`, data);
    return res.data || res;
  }

  async deleteUser(id: string): Promise<boolean> {
    await apiClient.delete(`${API_ENDPOINTS.users}/${id}`);
    return true;
  }

  async toggleStatus(id: string): Promise<User> {
    const res: any = await apiClient.patch(`${API_ENDPOINTS.users}/${id}/toggle-status`, {});
    return res.data || res;
  }
}

