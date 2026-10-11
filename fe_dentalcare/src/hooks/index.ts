"use client";

import { useState, useEffect, useCallback } from "react";
import { apiClient } from "@/lib/api/client";
import { mockStore } from "@/repositories/mock/store";
import {
  PatientService,
  DoctorService,
  AppointmentService,
  QueueService,
  EncounterService,
  PharmacyService,
  LaboratoryService,
  RadiologyService,
  InpatientService,
  BillingService,
  InventoryService,
  SystemService,
  FinanceService,
  DentalMasterService,
  UserService,
} from "@/services";
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
  Prescription,
  Medicine,
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
  DentalDiagnosisMaster,
  DentalProcedureMaster,
  DentalDepartmentMaster,
  DentalInsuranceMaster,
} from "@/types";

export function usePatients(initialQuery?: PatientQuery) {
  const [data, setData] = useState<PaginatedResult<Patient> | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState<PatientQuery>(initialQuery || {});

  const fetchPatients = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res: any = await PatientService.getPatients(query);
      if (res && Array.isArray(res.data) && res.meta) {
        setData(res);
      } else if (Array.isArray(res)) {
        setData({
          data: res,
          meta: {
            page: query.page || 1,
            perPage: query.perPage || 10,
            total: res.length,
            totalPages: Math.max(1, Math.ceil(res.length / (query.perPage || 10))),
          },
        });
      } else if (res && Array.isArray(res.data)) {
        setData({
          data: res.data,
          meta: res.meta || {
            page: query.page || 1,
            perPage: query.perPage || 10,
            total: res.data.length,
            totalPages: 1,
          },
        });
      } else {
        setData({
          data: [],
          meta: { page: 1, perPage: 10, total: 0, totalPages: 0 },
        });
      }
    } catch (err: any) {
      setError(err.message || "Gagal memuat data pasien");
    } finally {
      setLoading(false);
    }
  }, [query]);

  useEffect(() => {
    fetchPatients();
  }, [fetchPatients]);

  const createPatient = async (input: CreatePatientInput) => {
    const created = await PatientService.createPatient(input);
    await fetchPatients();
    return created;
  };

  const updatePatient = async (id: string, input: UpdatePatientInput) => {
    const updated = await PatientService.updatePatient(id, input);
    await fetchPatients();
    return updated;
  };

  const deletePatient = async (id: string) => {
    const ok = await PatientService.deletePatient(id);
    await fetchPatients();
    return ok;
  };

  return {
    data,
    loading,
    error,
    query,
    setQuery,
    refetch: fetchPatients,
    createPatient,
    updatePatient,
    deletePatient,
  };
}

export function usePatient(id: string) {
  const [patient, setPatient] = useState<Patient | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPatient = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const res = await PatientService.getPatientById(id);
      setPatient(res);
    } catch (err: any) {
      setError(err.message || "Pasien tidak ditemukan");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchPatient();
  }, [fetchPatient]);

  return { patient, loading, error, refetch: fetchPatient };
}

export function useDoctors(departmentId?: string) {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDoctors = useCallback(async () => {
    setLoading(true);
    try {
      const res = await DoctorService.getDoctors(departmentId);
      setDoctors(res);
    } catch (err: any) {
      setError(err.message || "Gagal memuat data dokter");
    } finally {
      setLoading(false);
    }
  }, [departmentId]);

  useEffect(() => {
    fetchDoctors();
  }, [fetchDoctors]);

  const createDoctor = async (data: Partial<Doctor>) => {
    const res = await DoctorService.createDoctor(data);
    await fetchDoctors();
    return res;
  };

  const updateDoctor = async (id: string, data: Partial<Doctor>) => {
    const res = await DoctorService.updateDoctor(id, data);
    await fetchDoctors();
    return res;
  };

  const deleteDoctor = async (id: string) => {
    const res = await DoctorService.deleteDoctor(id);
    await fetchDoctors();
    return res;
  };

  return { doctors, loading, error, refetch: fetchDoctors, createDoctor, updateDoctor, deleteDoctor };
}

export function useAppointments(doctorId?: string, date?: string, status?: string) {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAppointments = useCallback(async () => {
    setLoading(true);
    try {
      const res = await AppointmentService.getAppointments(doctorId, date, status);
      setAppointments(res);
    } catch (err: any) {
      setError(err.message || "Gagal memuat appointment");
    } finally {
      setLoading(false);
    }
  }, [doctorId, date, status]);

  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  const createAppointment = async (input: CreateAppointmentInput) => {
    const res = await AppointmentService.createAppointment(input);
    await fetchAppointments();
    return res;
  };

  const updateStatus = async (id: string, newStatus: Appointment["status"]) => {
    const res = await AppointmentService.updateStatus(id, newStatus);
    await fetchAppointments();
    return res;
  };

  return { appointments, loading, error, refetch: fetchAppointments, createAppointment, updateStatus };
}

export function useQueue(departmentId?: string, serviceType?: string) {
  const [queues, setQueues] = useState<QueueItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchQueues = useCallback(async () => {
    setLoading(true);
    try {
      const res = await QueueService.getQueues(departmentId, serviceType);
      setQueues(res);
    } catch (err: any) {
      setError(err.message || "Gagal memuat antrean");
    } finally {
      setLoading(false);
    }
  }, [departmentId, serviceType]);

  useEffect(() => {
    fetchQueues();
  }, [fetchQueues]);

  const updateStatus = async (id: string, status: QueueItem["status"]) => {
    const res = await QueueService.updateStatus(id, status);
    await fetchQueues();
    return res;
  };

  const callNext = async () => {
    const res = await QueueService.callNext(departmentId);
    await fetchQueues();
    return res;
  };

  const enqueue = async (data: { patientId: string; patientName?: string; doctorId?: string; departmentId?: string; appointmentId?: string }) => {
    const res = await QueueService.enqueue(data);
    await fetchQueues();
    return res;
  };

  return { queues, loading, error, refetch: fetchQueues, updateStatus, callNext, enqueue };
}

export function useEncounters(patientId?: string, doctorId?: string) {
  const [encounters, setEncounters] = useState<Encounter[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchEncounters = useCallback(async () => {
    setLoading(true);
    try {
      const res = await EncounterService.getEncounters(patientId, doctorId);
      setEncounters(res);
    } finally {
      setLoading(false);
    }
  }, [patientId, doctorId]);

  useEffect(() => {
    fetchEncounters();
  }, [fetchEncounters]);

  const saveEncounter = async (data: Partial<Encounter>) => {
    const res = await EncounterService.saveEncounter(data);
    await fetchEncounters();
    return res;
  };

  return { encounters, loading, refetch: fetchEncounters, saveEncounter };
}

export function usePharmacy() {
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [rx, meds] = await Promise.all([
        PharmacyService.getPrescriptions(),
        PharmacyService.getMedicines(),
      ]);
      setPrescriptions(rx);
      setMedicines(meds);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const updatePrescriptionStatus = useCallback(async (id: string, status: Prescription["status"]) => {
    const res = await PharmacyService.updateStatus(id, status);
    await fetchData();
    return res;
  }, [fetchData]);

  const createMedicine = useCallback(async (data: Partial<Medicine>) => {
    const res = await PharmacyService.createMedicine(data);
    await fetchData();
    return res;
  }, [fetchData]);

  const updateMedicine = useCallback(async (id: string, data: Partial<Medicine>) => {
    const res = await PharmacyService.updateMedicine(id, data);
    await fetchData();
    return res;
  }, [fetchData]);

  const deleteMedicine = useCallback(async (id: string) => {
    const res = await PharmacyService.deleteMedicine(id);
    await fetchData();
    return res;
  }, [fetchData]);

  const stockIn = useCallback(async (
    medicineId: string,
    quantity: number,
    unitCost: number,
    supplier: string,
    notes?: string,
    syncFinance?: boolean
  ) => {
    const res = await PharmacyService.stockIn(medicineId, quantity, unitCost, supplier, notes, syncFinance);
    await fetchData();
    return res;
  }, [fetchData]);

  const stockOut = useCallback(async (medicineId: string, quantity: number, notes?: string, reason?: string) => {
    const res = await PharmacyService.stockOut(medicineId, quantity, notes, reason);
    await fetchData();
    return res;
  }, [fetchData]);

  const getMutations = useCallback(async (medicineId?: string) => {
    return PharmacyService.getMutations(medicineId);
  }, []);

  return {
    prescriptions,
    medicines,
    loading,
    refetch: fetchData,
    updatePrescriptionStatus,
    createMedicine,
    updateMedicine,
    deleteMedicine,
    stockIn,
    stockOut,
    getMutations,
  };
}

export function useLaboratory() {
  const [orders, setOrders] = useState<LaboratoryOrder[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const res = await LaboratoryService.getOrders();
      setOrders(res);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const updateStatus = async (id: string, status: LaboratoryOrder["status"]) => {
    const res = await LaboratoryService.updateStatus(id, status);
    await fetchOrders();
    return res;
  };

  return { orders, loading, refetch: fetchOrders, updateStatus };
}

export function useRadiology() {
  const [orders, setOrders] = useState<RadiologyOrder[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const res = await RadiologyService.getOrders();
      setOrders(res);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  return { orders, loading, refetch: fetchOrders };
}

export function useInpatient() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [admissions, setAdmissions] = useState<Admission[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [r, a] = await Promise.all([
        InpatientService.getRooms(),
        InpatientService.getAdmissions(),
      ]);
      setRooms(r);
      setAdmissions(a);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const updateBedStatus = async (bedId: string, status: Room["beds"][0]["status"]) => {
    const res = await InpatientService.updateBedStatus(bedId, status);
    await fetchData();
    return res;
  };

  return { rooms, admissions, loading, refetch: fetchData, updateBedStatus };
}

export function useBilling() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchInvoices = useCallback(async () => {
    setLoading(true);
    try {
      const res = await BillingService.getInvoices();
      setInvoices(res);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchInvoices();
  }, [fetchInvoices]);

  const recordPayment = async (invoiceId: string, paymentMethod: string, amount: number, cashierName: string) => {
    const res = await BillingService.recordPayment(invoiceId, paymentMethod, amount, cashierName);
    await fetchInvoices();
    return res;
  };

  return { invoices, loading, refetch: fetchInvoices, recordPayment };
}

export function useInventory() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchItems = useCallback(async () => {
    setLoading(true);
    try {
      const res = await InventoryService.getItems();
      setItems(res);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  return { items, loading, refetch: fetchItems };
}

export function useNotifications() {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    try {
      const res = await SystemService.getNotifications();
      setNotifications(res);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();

    const handleRefresh = () => {
      fetchNotifications();
    };
    if (typeof window !== "undefined") {
      window.addEventListener("refresh-notifications", handleRefresh);
    }
    return () => {
      if (typeof window !== "undefined") {
        window.removeEventListener("refresh-notifications", handleRefresh);
      }
    };
  }, [fetchNotifications]);

  const markAsRead = async (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
    await SystemService.markNotificationRead(id);
    await fetchNotifications();
  };

  const markAllAsRead = async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    for (const n of notifications) {
      if (!n.isRead) {
        await SystemService.markNotificationRead(n.id);
      }
    }
    await fetchNotifications();
  };

  return { notifications, loading, refetch: fetchNotifications, markAsRead, markAllAsRead };
}

export function useHospitalProfile() {
  const [profile, setProfile] = useState<HospitalProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchProfile = useCallback(async () => {
    setLoading(true);
    try {
      const res = await SystemService.getHospitalProfile();
      setProfile(res);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const updateProfile = async (data: Partial<HospitalProfile>) => {
    const updated = await SystemService.updateHospitalProfile(data);
    setProfile(updated);
    return updated;
  };

  const resetDemoData = async () => {
    await SystemService.resetDemoData();
    await fetchProfile();
  };

  return { profile, loading, updateProfile, resetDemoData, refetch: fetchProfile };
}

export function useFinance() {
  const [summary, setSummary] = useState<any>(null);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [sum, trx] = await Promise.all([
        FinanceService.getSummary(),
        FinanceService.getTransactions(),
      ]);
      setSummary(sum);
      setTransactions(trx);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const createTransaction = async (data: any) => {
    const res = await FinanceService.createTransaction(data);
    await fetchData();
    return res;
  };

  return { summary, transactions, loading, refetch: fetchData, createTransaction };
}



function getFallbackDashboardStats(range: string = "7d") {
  const state = typeof window !== "undefined" ? mockStore.getState() : ({} as any);
  const patients = state.patients || [];
  const appointments = state.appointments || [];
  const queues = state.queues || [];
  const encounters = state.encounters || [];
  const medicines = state.medicines || [];

  const demoBuckets: Record<string, { male: number; female: number }> = {
    "0-12 (Pedo)": { male: 0, female: 0 },
    "13-17 (Remaja)": { male: 0, female: 0 },
    "18-30 (Dewasa Muda)": { male: 0, female: 0 },
    "31-45 (Dewasa)": { male: 0, female: 0 },
    "46-60 (Senior)": { male: 0, female: 0 },
    "60+ (Geriatri)": { male: 0, female: 0 },
  };

  patients.forEach((p: any) => {
    let age = 28;
    if (p.birthDate) {
      const birthYear = parseInt(p.birthDate.substring(0, 4), 10);
      if (!isNaN(birthYear)) age = Math.max(1, new Date().getFullYear() - birthYear);
    }
    const isMale = ["male", "laki-laki", "l"].includes(String(p.gender || "").toLowerCase());
    const gKey = isMale ? "male" : "female";
    if (age <= 12) demoBuckets["0-12 (Pedo)"][gKey]++;
    else if (age <= 17) demoBuckets["13-17 (Remaja)"][gKey]++;
    else if (age <= 30) demoBuckets["18-30 (Dewasa Muda)"][gKey]++;
    else if (age <= 45) demoBuckets["31-45 (Dewasa)"][gKey]++;
    else if (age <= 60) demoBuckets["46-60 (Senior)"][gKey]++;
    else demoBuckets["60+ (Geriatri)"][gKey]++;
  });

  const demographics = Object.entries(demoBuckets).map(([ageGroup, counts]) => ({
    ageGroup,
    male: counts.male,
    female: counts.female,
  }));

  const visitTrend7d = [
    { day: "Sen", date: "Senin", visits: 18, revenue: 4500000, total: 42, umum: 16, konservasi: 12, orto: 8, bedah: 6 },
    { day: "Sel", date: "Selasa", visits: 22, revenue: 6200000, total: 48, umum: 18, konservasi: 14, orto: 10, bedah: 6 },
    { day: "Rab", date: "Rabu", visits: 20, revenue: 5800000, total: 54, umum: 20, konservasi: 16, orto: 11, bedah: 7 },
    { day: "Kam", date: "Kamis", visits: 25, revenue: 7400000, total: 49, umum: 19, konservasi: 13, orto: 10, bedah: 7 },
    { day: "Jum", date: "Jumat", visits: 19, revenue: 6100000, total: 45, umum: 17, konservasi: 12, orto: 9, bedah: 7 },
    { day: "Sab", date: "Sabtu", visits: 30, revenue: 9800000, total: 60, umum: 24, konservasi: 18, orto: 12, bedah: 6 },
    { day: "Min", date: "Minggu", visits: 10, revenue: 3200000, total: 28, umum: 12, konservasi: 8, orto: 5, bedah: 3 },
  ];

  const visitTrend30d = [
    { day: "Mg 1", date: "1 - 7 Sep", visits: 115, revenue: 34200000, total: 115, umum: 44, konservasi: 32, orto: 22, bedah: 17 },
    { day: "Mg 2", date: "8 - 14 Sep", visits: 138, revenue: 41500000, total: 138, umum: 52, barcode: 38, konservasi: 38, orto: 28, bedah: 20 },
    { day: "Mg 3", date: "15 - 21 Sep", visits: 144, revenue: 45800000, total: 144, umum: 55, konservasi: 40, orto: 30, bedah: 19 },
    { day: "Mg 4", date: "22 - 28 Sep", visits: 152, revenue: 48200000, total: 152, umum: 58, konservasi: 42, orto: 32, bedah: 20 },
  ];

  const visitTrend3m = [
    { day: "Juli", date: "Juli 2026", visits: 480, revenue: 165000000, total: 480, umum: 182, konservasi: 135, orto: 95, bedah: 68 },
    { day: "Agustus", date: "Agustus 2026", visits: 524, revenue: 182000000, total: 524, umum: 198, konservasi: 146, orto: 105, bedah: 75 },
    { day: "September", date: "September 2026", visits: 549, revenue: 195000000, total: 549, umum: 208, konservasi: 155, orto: 112, bedah: 74 },
  ];

  const selectedVisitTrend = range === "30d" ? visitTrend30d : range === "3m" ? visitTrend3m : visitTrend7d;

  const lowStock = medicines
    .filter((m: any) => m.currentStock <= (m.minimumStock || 30))
    .slice(0, 5)
    .map((m: any) => ({
      name: m.brandName || m.genericName,
      stock: `${m.currentStock} ${m.unit}`,
      min: `${m.minimumStock || 10} ${m.unit}`,
      status: m.currentStock <= ((m.minimumStock || 10) / 2) ? "critical" : "warning",
    }));

  return {
    totalPatients: patients.length || 20,
    patientsToday: 14,
    appointmentsToday: appointments.length || 5,
    waitingQueues: queues.filter((q: any) => q.status === "waiting").length || 3,
    completedEncounters: encounters.filter((e: any) => e.status === "completed").length || 12,
    todayRevenue: 2850000,
    monthlyRevenue: 48750000,
    prescriptionsCount: state.prescriptions?.length || 12,
    radiologyCount: 14,
    chairUtilization: "83%",
    averageWaitTime: "10.5 Menit",
    patientSatisfaction: "4.9 / 5.0",
    dentalChairs: [
      { id: "DC-01", name: "Dental Chair 1", unit: "Poli Gigi Umum", doctor: "drg. Jihan, S.Kep", status: "occupied", patientName: "Budi Santoso", procedure: "Scaling & Pembersihan Karang Gigi" },
      { id: "DC-02", name: "Dental Chair 2", unit: "Konservasi Gigi (PSA)", doctor: "drg. Jihan, S.Kep", status: "occupied", patientName: "Dewi Lestari", procedure: "Perawatan Saluran Akar (PSA)" },
      { id: "DC-03", name: "Dental Chair 3", unit: "Bedah Mulut Minor", doctor: "drg. Jihan, S.Kep", status: "sanitizing", patientName: null, procedure: "Sterilisasi Unit & Alat Dental" },
      { id: "DC-04", name: "Dental Chair 4", unit: "Pedodonsia (Gigi Anak)", doctor: "drg. Jihan, S.Kep", status: "available", patientName: null, procedure: "Siap Pasien Berikutnya" },
      { id: "DC-05", name: "Dental Chair 5", unit: "Ortodonti & Kontrol Behel", doctor: "drg. Jihan, S.Kep", status: "available", patientName: null, procedure: "Siap Pasien Berikutnya" },
      { id: "DC-06", name: "Dental Chair 6", unit: "Estetika & Bleaching Gigi", doctor: "drg. Jihan, S.Kep", status: "available", patientName: null, procedure: "Siap Pasien Berikutnya" },
    ],
    lowStockMaterials: lowStock.length > 0 ? lowStock : [
      { name: "Resin Komposit Filtek Z250 A2", stock: "4 syringe", min: "8 syringe", status: "warning" },
      { name: "Single Bond Universal Adhesive", stock: "2 botol", min: "5 botol", status: "critical" },
      { name: "Pehacain Dental Anesthetic", stock: "12 ampul", min: "30 ampul", status: "warning" },
      { name: "Dental Etchant Gel 37%", stock: "3 syringe", min: "6 syringe", status: "warning" },
    ],
    demographics,
    visitTrend: selectedVisitTrend,
    visitTrends: {
      "7d": visitTrend7d,
      "30d": visitTrend30d,
      "3m": visitTrend3m,
    },
    specialties: [
      { name: "Poli Gigi Umum", value: 35, count: 42, percentage: 38, color: "#0d9488" },
      { name: "Konservasi Gigi (PSA)", value: 25, count: 30, percentage: 27, color: "#0284c7" },
      { name: "Ortodonti (Behel)", value: 20, count: 24, percentage: 21, color: "#8b5cf6" },
      { name: "Bedah Mulut Minor", value: 12, count: 15, percentage: 14, color: "#f59e0b" },
      { name: "Pedodonsia (Gigi Anak)", value: 8, count: 10, percentage: 9, color: "#ec4899" },
    ],
    revenueTrend: [
      { month: "Jan", revenue: 145 },
      { month: "Feb", revenue: 168 },
      { month: "Mar", revenue: 162 },
      { month: "Apr", revenue: 184 },
      { month: "Mei", revenue: 195 },
      { month: "Jun", revenue: 210 },
      { month: "Jul", revenue: 205 },
      { month: "Agt", revenue: 228 },
      { month: "Sep", revenue: 245 },
    ],
    topDiagnoses: [
      { code: "K02.1", name: "Karies Dentin Profunda", count: 38, cases: 38 },
      { code: "K05.1", name: "Periodontitis Kronis", count: 25, cases: 25 },
      { code: "K04.0", name: "Pulpitis Akut Irreversibel", count: 19, cases: 19 },
      { code: "K01.1", name: "Impaksi Molar Ketiga (M3)", count: 14, cases: 14 },
      { code: "K05.0", name: "Gingivitis Akut", count: 11, cases: 11 },
      { code: "K03.6", name: "Kalkulus / Karang Gigi", count: 9, cases: 9 },
    ],
    waitTimes: [
      { poli: "Poli Gigi Umum", waitMin: 8 },
      { poli: "Konservasi Gigi", waitMin: 12 },
      { poli: "Ortodonti", waitMin: 10 },
      { poli: "Bedah Mulut", waitMin: 15 },
      { poli: "Pedodonsia", waitMin: 9 },
    ],
  };
}

export function useDashboardStats(range: string = "7d") {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchStats = useCallback(async () => {
    setLoading(true);
    try {
      const data = await apiClient.get<any>(`/dashboard/stats?range=${range}`);
      if (data && (data.visitTrend || data.demographics || data.totalPatients)) {
        setStats(data);
      } else {
        setStats(getFallbackDashboardStats(range));
      }
    } catch {
      setStats(getFallbackDashboardStats(range));
    } finally {
      setLoading(false);
    }
  }, [range]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return { stats, loading, refetch: fetchStats };
}

export function useAuditLogs() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    try {
      const data = await apiClient.get<AuditLog[]>("/system/audit-logs");
      setLogs(data);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  return { logs, loading, refetch: fetchLogs };
}

export function useStaff() {
  const [staff, setStaff] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchStaff = useCallback(async () => {
    setLoading(true);
    try {
      const data = await apiClient.get<any[]>("/staff");
      setStaff(data);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStaff();
  }, [fetchStaff]);

  return { staff, loading, refetch: fetchStaff };
}

export function useInsurance() {
  const [insurances, setInsurances] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchInsurance = useCallback(async () => {
    setLoading(true);
    try {
      const data = await apiClient.get<any[]>("/insurance");
      setInsurances(data);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchInsurance();
  }, [fetchInsurance]);

  return { insurances, loading, refetch: fetchInsurance };
}

export function useClinicalReferences() {
  const [diagnoses, setDiagnoses] = useState<any[]>([]);
  const [procedures, setProcedures] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchReferences = useCallback(async () => {
    setLoading(true);
    try {
      const [dx, proc] = await Promise.all([
        apiClient.get<any[]>("/clinical/diagnoses"),
        apiClient.get<any[]>("/clinical/procedures"),
      ]);
      setDiagnoses(dx || []);
      setProcedures(proc || []);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReferences();
  }, [fetchReferences]);

  return { diagnoses, procedures, loading, refetch: fetchReferences };
}

export function useDentalMaster() {
  const [diagnoses, setDiagnoses] = useState<DentalDiagnosisMaster[]>([]);
  const [procedures, setProcedures] = useState<DentalProcedureMaster[]>([]);
  const [departments, setDepartments] = useState<DentalDepartmentMaster[]>([]);
  const [insurances, setInsurances] = useState<DentalInsuranceMaster[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [dx, proc, dept, ins] = await Promise.all([
        DentalMasterService.getDiagnoses(),
        DentalMasterService.getProcedures(),
        DentalMasterService.getDepartments(),
        DentalMasterService.getInsurances(),
      ]);
      setDiagnoses(dx || []);
      setProcedures(proc || []);
      setDepartments(dept || []);
      setInsurances(ins || []);
    } catch (err) {
      console.error("Gagal memuat master data dental:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  // CRUD Diagnoses
  const createDiagnosis = async (data: Partial<DentalDiagnosisMaster>) => {
    const res = await DentalMasterService.createDiagnosis(data);
    await fetchAll();
    return res;
  };
  const updateDiagnosis = async (id: string, data: Partial<DentalDiagnosisMaster>) => {
    const res = await DentalMasterService.updateDiagnosis(id, data);
    await fetchAll();
    return res;
  };
  const deleteDiagnosis = async (id: string) => {
    const res = await DentalMasterService.deleteDiagnosis(id);
    await fetchAll();
    return res;
  };

  // CRUD Procedures
  const createProcedure = async (data: Partial<DentalProcedureMaster>) => {
    const res = await DentalMasterService.createProcedure(data);
    await fetchAll();
    return res;
  };
  const updateProcedure = async (id: string, data: Partial<DentalProcedureMaster>) => {
    const res = await DentalMasterService.updateProcedure(id, data);
    await fetchAll();
    return res;
  };
  const deleteProcedure = async (id: string) => {
    const res = await DentalMasterService.deleteProcedure(id);
    await fetchAll();
    return res;
  };

  // CRUD Departments (Dental Chairs)
  const createDepartment = async (data: Partial<DentalDepartmentMaster>) => {
    const res = await DentalMasterService.createDepartment(data);
    await fetchAll();
    return res;
  };
  const updateDepartment = async (id: string, data: Partial<DentalDepartmentMaster>) => {
    const res = await DentalMasterService.updateDepartment(id, data);
    await fetchAll();
    return res;
  };
  const deleteDepartment = async (id: string) => {
    const res = await DentalMasterService.deleteDepartment(id);
    await fetchAll();
    return res;
  };

  // CRUD Insurances
  const createInsurance = async (data: Partial<DentalInsuranceMaster>) => {
    const res = await DentalMasterService.createInsurance(data);
    await fetchAll();
    return res;
  };
  const updateInsurance = async (id: string, data: Partial<DentalInsuranceMaster>) => {
    const res = await DentalMasterService.updateInsurance(id, data);
    await fetchAll();
    return res;
  };
  const deleteInsurance = async (id: string) => {
    const res = await DentalMasterService.deleteInsurance(id);
    await fetchAll();
    return res;
  };

  return {
    diagnoses,
    procedures,
    departments,
    insurances,
    loading,
    refetch: fetchAll,
    createDiagnosis,
    updateDiagnosis,
    deleteDiagnosis,
    createProcedure,
    updateProcedure,
    deleteProcedure,
    createDepartment,
    updateDepartment,
    deleteDepartment,
    createInsurance,
    updateInsurance,
    deleteInsurance,
  };
}

export function useUsers(filters?: { role?: string; isActive?: boolean; search?: string }) {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await UserService.getUsers(filters);
      setUsers(res);
      setError(null);
    } catch (err: any) {
      setError(err.message || "Gagal memuat daftar pengguna");
    } finally {
      setLoading(false);
    }
  }, [filters?.role, filters?.isActive, filters?.search]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const createUser = async (data: Partial<User> & { password?: string }) => {
    const res = await UserService.createUser(data);
    await fetchUsers();
    return res;
  };

  const updateUser = async (id: string, data: Partial<User> & { password?: string }) => {
    const res = await UserService.updateUser(id, data);
    await fetchUsers();
    return res;
  };

  const deleteUser = async (id: string) => {
    const res = await UserService.deleteUser(id);
    await fetchUsers();
    return res;
  };

  const toggleStatus = async (id: string) => {
    const res = await UserService.toggleStatus(id);
    await fetchUsers();
    return res;
  };

  return {
    users,
    loading,
    error,
    refetch: fetchUsers,
    createUser,
    updateUser,
    deleteUser,
    toggleStatus,
  };
}