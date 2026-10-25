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
  AuditLog,
  AppNotification,
  HospitalProfile,
  PaginatedResult,
  QueryParams,
  DentalDiagnosisMaster,
  DentalProcedureMaster,
  DentalDepartmentMaster,
  DentalInsuranceMaster,
} from "@/types";

export interface IPatientRepository {
  getPatients(query?: PatientQuery): Promise<PaginatedResult<Patient>>;
  getPatientById(id: string): Promise<Patient | null>;
  createPatient(data: CreatePatientInput): Promise<Patient>;
  updatePatient(id: string, data: UpdatePatientInput): Promise<Patient>;
  deletePatient(id: string): Promise<boolean>;
  updateControlSchedule(patientId: string, data: { nextControlDate: string; appointmentTime?: string; doctorName?: string; doctorId?: string; notes?: string }): Promise<Patient>;
}

export interface IDoctorRepository {
  getDoctors(query?: QueryParams & { departmentId?: string }): Promise<Doctor[]>;
  getDoctorById(id: string): Promise<Doctor | null>;
  createDoctor(data: Partial<Doctor>): Promise<Doctor>;
  updateDoctor(id: string, data: Partial<Doctor>): Promise<Doctor>;
  deleteDoctor(id: string): Promise<boolean>;
}

export interface IAppointmentRepository {
  getAppointments(query?: QueryParams & { doctorId?: string; date?: string; status?: string; patientId?: string }): Promise<Appointment[]>;
  getAppointmentById(id: string): Promise<Appointment | null>;
  createAppointment(data: CreateAppointmentInput): Promise<Appointment>;
  updateAppointmentStatus(id: string, status: Appointment["status"]): Promise<Appointment>;
}

export interface IQueueRepository {
  getQueues(query?: QueryParams & { departmentId?: string; status?: string; serviceType?: string }): Promise<QueueItem[]>;
  updateQueueStatus(id: string, status: QueueItem["status"]): Promise<QueueItem>;
  callNextQueue(departmentId?: string): Promise<QueueItem | null>;
  enqueue(data: { patientId: string; patientName?: string; doctorId?: string; departmentId?: string; appointmentId?: string }): Promise<QueueItem>;
  deleteQueue(id: string): Promise<void>;
}

export interface IEncounterRepository {
  getEncounters(query?: QueryParams & { patientId?: string; doctorId?: string }): Promise<Encounter[]>;
  getEncounterById(id: string): Promise<Encounter | null>;
  createEncounter(data: Partial<Encounter>): Promise<Encounter>;
  updateEncounter(id: string, data: Partial<Encounter>): Promise<Encounter>;
}

export interface IPharmacyRepository {
  getPrescriptions(query?: QueryParams & { status?: string }): Promise<Prescription[]>;
  getPrescriptionById(id: string): Promise<Prescription | null>;
  updatePrescriptionStatus(id: string, status: Prescription["status"], dispensedBy?: string): Promise<Prescription>;
  getMedicines(query?: QueryParams & { category?: string; stockStatus?: string }): Promise<Medicine[]>;
  getMedicineById(id: string): Promise<Medicine | null>;
  createMedicine(data: Partial<Medicine>): Promise<Medicine>;
  updateMedicine(id: string, data: Partial<Medicine>): Promise<Medicine>;
  deleteMedicine(id: string): Promise<boolean>;
  stockIn(medicineId: string, quantity: number, unitCost: number, supplier: string, notes?: string, syncFinance?: boolean): Promise<any>;
  stockOut(medicineId: string, quantity: number, notes?: string, reason?: string): Promise<any>;
  getMutations(medicineId?: string): Promise<any[]>;
  updateMedicineStock(id: string, newStock: number): Promise<Medicine>;
}

export interface ILaboratoryRepository {
  getOrders(query?: QueryParams & { status?: string; priority?: string }): Promise<LaboratoryOrder[]>;
  getOrderById(id: string): Promise<LaboratoryOrder | null>;
  updateOrderStatus(id: string, status: LaboratoryOrder["status"]): Promise<LaboratoryOrder>;
}

export interface IRadiologyRepository {
  getOrders(query?: QueryParams & { status?: string; modality?: string }): Promise<RadiologyOrder[]>;
  getOrderById(id: string): Promise<RadiologyOrder | null>;
}

export interface IInpatientRepository {
  getRooms(): Promise<Room[]>;
  getAdmissions(status?: string): Promise<Admission[]>;
  updateBedStatus(bedId: string, status: Room["beds"][0]["status"]): Promise<boolean>;
}

export interface IBillingRepository {
  getInvoices(query?: QueryParams & { status?: string; patientId?: string }): Promise<Invoice[]>;
  getInvoiceById(id: string): Promise<Invoice | null>;
  recordPayment(invoiceId: string, paymentMethod: string, amount: number, cashierName: string): Promise<Invoice>;
}

export interface IInventoryRepository {
  getItems(query?: QueryParams & { category?: string; status?: string }): Promise<InventoryItem[]>;
}

export interface ISystemRepository {
  getNotifications(): Promise<AppNotification[]>;
  markNotificationRead(id: string): Promise<boolean>;
  getAuditLogs(): Promise<AuditLog[]>;
  getHospitalProfile(): Promise<HospitalProfile>;
  updateHospitalProfile(profile: Partial<HospitalProfile>): Promise<HospitalProfile>;
  resetDemoData(): Promise<void>;
}

export interface IFinanceRepository {
  getSummary(): Promise<{
    todayRevenue: number;
    monthRevenue: number;
    monthExpense: number;
    netCashflow: number;
    unpaidInvoices: number;
    unpaidAmount: number;
  }>;
  getTransactions(query?: QueryParams & { type?: string; category?: string }): Promise<any[]>;
  createTransaction(data: {
    type: "income" | "expense";
    category: string;
    amount: number;
    referenceType?: string;
    referenceId?: string;
    notes?: string;
    transactionDate?: string;
  }): Promise<any>;
}

export interface IDentalMasterRepository {
  // Diagnoses
  getDiagnoses(query?: { category?: string; search?: string }): Promise<DentalDiagnosisMaster[]>;
  createDiagnosis(data: Partial<DentalDiagnosisMaster>): Promise<DentalDiagnosisMaster>;
  updateDiagnosis(id: string, data: Partial<DentalDiagnosisMaster>): Promise<DentalDiagnosisMaster>;
  deleteDiagnosis(id: string): Promise<boolean>;

  // Procedures
  getProcedures(query?: { category?: string; search?: string }): Promise<DentalProcedureMaster[]>;
  createProcedure(data: Partial<DentalProcedureMaster>): Promise<DentalProcedureMaster>;
  updateProcedure(id: string, data: Partial<DentalProcedureMaster>): Promise<DentalProcedureMaster>;
  deleteProcedure(id: string): Promise<boolean>;

  // Departments (Dental Chairs)
  getDepartments(query?: { search?: string; isActive?: boolean }): Promise<DentalDepartmentMaster[]>;
  createDepartment(data: Partial<DentalDepartmentMaster>): Promise<DentalDepartmentMaster>;
  updateDepartment(id: string, data: Partial<DentalDepartmentMaster>): Promise<DentalDepartmentMaster>;
  deleteDepartment(id: string): Promise<boolean>;

  // Insurances
  getInsurances(query?: { category?: string; search?: string }): Promise<DentalInsuranceMaster[]>;
  createInsurance(data: Partial<DentalInsuranceMaster>): Promise<DentalInsuranceMaster>;
  updateInsurance(id: string, data: Partial<DentalInsuranceMaster>): Promise<DentalInsuranceMaster>;
  deleteInsurance(id: string): Promise<boolean>;
}

export interface IUserRepository {
  getUsers(query?: QueryParams & { role?: string; isActive?: boolean; search?: string }): Promise<User[]>;
  getUserById(id: string): Promise<User>;
  createUser(data: Partial<User> & { password?: string }): Promise<User>;
  updateUser(id: string, data: Partial<User> & { password?: string }): Promise<User>;
  deleteUser(id: string): Promise<boolean>;
  toggleStatus(id: string): Promise<User>;
}

