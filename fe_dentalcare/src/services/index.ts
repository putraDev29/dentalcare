import {
  patientRepository,
  doctorRepository,
  appointmentRepository,
  queueRepository,
  encounterRepository,
  pharmacyRepository,
  laboratoryRepository,
  radiologyRepository,
  inpatientRepository,
  billingRepository,
  inventoryRepository,
  systemRepository,
  financeRepository,
  dentalMasterRepository,
  userRepository,
} from "@/repositories";
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
  Invoice,
  InventoryItem,
  HospitalProfile,
  DentalDiagnosisMaster,
  DentalProcedureMaster,
  DentalDepartmentMaster,
  DentalInsuranceMaster,
} from "@/types";

export class PatientService {
  static async getPatients(query?: PatientQuery) {
    return patientRepository.getPatients(query);
  }

  static async getPatientById(id: string) {
    return patientRepository.getPatientById(id);
  }

  static async createPatient(data: CreatePatientInput) {
    return patientRepository.createPatient(data);
  }

  static async updatePatient(id: string, data: UpdatePatientInput) {
    return patientRepository.updatePatient(id, data);
  }

  static async deletePatient(id: string) {
    return patientRepository.deletePatient(id);
  }

  static async updateControlSchedule(patientId: string, data: { nextControlDate: string; appointmentTime?: string; doctorName?: string; doctorId?: string; notes?: string }) {
    return patientRepository.updateControlSchedule(patientId, data);
  }
}

export class DoctorService {
  static async getDoctors(departmentId?: string) {
    return doctorRepository.getDoctors({ departmentId });
  }

  static async getDoctorById(id: string) {
    return doctorRepository.getDoctorById(id);
  }

  static async createDoctor(data: Partial<Doctor>) {
    return doctorRepository.createDoctor(data);
  }

  static async updateDoctor(id: string, data: Partial<Doctor>) {
    return doctorRepository.updateDoctor(id, data);
  }

  static async deleteDoctor(id: string) {
    return doctorRepository.deleteDoctor(id);
  }
}

export class AppointmentService {
  static async getAppointments(doctorId?: string, date?: string, status?: string, patientId?: string) {
    return appointmentRepository.getAppointments({ doctorId, date, status, patientId });
  }

  static async createAppointment(data: CreateAppointmentInput) {
    return appointmentRepository.createAppointment(data);
  }

  static async updateStatus(id: string, status: Appointment["status"]) {
    return appointmentRepository.updateAppointmentStatus(id, status);
  }
}

export class QueueService {
  static async getQueues(departmentId?: string, serviceType?: string) {
    return queueRepository.getQueues({ departmentId, serviceType });
  }

  static async updateStatus(id: string, status: QueueItem["status"]) {
    return queueRepository.updateQueueStatus(id, status);
  }

  static async callNext(departmentId?: string) {
    return queueRepository.callNextQueue(departmentId);
  }

  static async enqueue(data: { patientId: string; patientName?: string; doctorId?: string; departmentId?: string; appointmentId?: string }) {
    return queueRepository.enqueue(data);
  }
}

export class EncounterService {
  static async getEncounters(patientId?: string, doctorId?: string) {
    return encounterRepository.getEncounters({ patientId, doctorId });
  }

  static async getEncounterById(id: string) {
    return encounterRepository.getEncounterById(id);
  }

  static async createEncounter(data: Partial<Encounter>) {
    return encounterRepository.createEncounter(data);
  }

  static async updateEncounter(id: string, data: Partial<Encounter>) {
    return encounterRepository.updateEncounter(id, data);
  }

  static async saveEncounter(data: Partial<Encounter>) {
    if (data.id) {
      return encounterRepository.updateEncounter(data.id, data);
    }
    return encounterRepository.createEncounter(data);
  }
}

export class PharmacyService {
  static async getPrescriptions(status?: string) {
    return pharmacyRepository.getPrescriptions({ status });
  }

  static async getPrescriptionById(id: string) {
    return pharmacyRepository.getPrescriptionById(id);
  }

  static async updateStatus(id: string, status: Prescription["status"], dispensedBy?: string) {
    return pharmacyRepository.updatePrescriptionStatus(id, status, dispensedBy);
  }

  static async getMedicines(category?: string, stockStatus?: string) {
    return pharmacyRepository.getMedicines({ category, stockStatus });
  }

  static async getMedicineById(id: string) {
    return pharmacyRepository.getMedicineById(id);
  }

  static async createMedicine(data: Partial<Medicine>) {
    return pharmacyRepository.createMedicine(data);
  }

  static async updateMedicine(id: string, data: Partial<Medicine>) {
    return pharmacyRepository.updateMedicine(id, data);
  }

  static async deleteMedicine(id: string) {
    return pharmacyRepository.deleteMedicine(id);
  }

  static async stockIn(
    medicineId: string,
    quantity: number,
    unitCost: number,
    supplier: string,
    notes?: string,
    syncFinance?: boolean
  ) {
    return pharmacyRepository.stockIn(medicineId, quantity, unitCost, supplier, notes, syncFinance);
  }

  static async stockOut(medicineId: string, quantity: number, notes?: string, reason?: string) {
    return (pharmacyRepository as any).stockOut(medicineId, quantity, notes, reason);
  }

  static async getMutations(medicineId?: string) {
    return pharmacyRepository.getMutations(medicineId);
  }

  static async updateStock(id: string, stock: number) {
    return pharmacyRepository.updateMedicineStock(id, stock);
  }
}

export class LaboratoryService {
  static async getOrders(status?: string, priority?: string) {
    return laboratoryRepository.getOrders({ status, priority });
  }

  static async getOrderById(id: string) {
    return laboratoryRepository.getOrderById(id);
  }

  static async updateStatus(id: string, status: LaboratoryOrder["status"]) {
    return laboratoryRepository.updateOrderStatus(id, status);
  }
}

export class RadiologyService {
  static async getOrders(status?: string, modality?: string) {
    return radiologyRepository.getOrders({ status, modality });
  }

  static async getOrderById(id: string) {
    return radiologyRepository.getOrderById(id);
  }
}

export class InpatientService {
  static async getRooms() {
    return inpatientRepository.getRooms();
  }

  static async getAdmissions(status?: string) {
    return inpatientRepository.getAdmissions(status);
  }

  static async updateBedStatus(bedId: string, status: Room["beds"][0]["status"]) {
    return inpatientRepository.updateBedStatus(bedId, status);
  }
}

export class BillingService {
  static async getInvoices(status?: string, patientId?: string, encounterId?: string) {
    return billingRepository.getInvoices({ status, patientId, encounterId } as any);
  }

  static async getInvoiceById(id: string) {
    return billingRepository.getInvoiceById(id);
  }

  static async recordPayment(invoiceId: string, paymentMethod: string, amount: number, cashierName: string) {
    return billingRepository.recordPayment(invoiceId, paymentMethod, amount, cashierName);
  }
}

export class InventoryService {
  static async getItems(category?: string, status?: string) {
    return inventoryRepository.getItems({ category, status });
  }
}

export class SystemService {
  static async getNotifications() {
    return systemRepository.getNotifications();
  }

  static async markNotificationRead(id: string) {
    return systemRepository.markNotificationRead(id);
  }

  static async getAuditLogs() {
    return systemRepository.getAuditLogs();
  }

  static async getHospitalProfile() {
    return systemRepository.getHospitalProfile();
  }

  static async updateHospitalProfile(profile: Partial<HospitalProfile>) {
    return systemRepository.updateHospitalProfile(profile);
  }

  static async resetDemoData() {
    return systemRepository.resetDemoData();
  }
}

export class FinanceService {
  static async getSummary() {
    return financeRepository.getSummary();
  }

  static async getTransactions(query?: any) {
    return financeRepository.getTransactions(query);
  }

  static async createTransaction(data: any) {
    return financeRepository.createTransaction(data);
  }
}

export class DentalMasterService {
  // Diagnoses (ICD-10)
  static async getDiagnoses(query?: { category?: string; search?: string }) {
    return dentalMasterRepository.getDiagnoses(query);
  }
  static async createDiagnosis(data: Partial<DentalDiagnosisMaster>) {
    return dentalMasterRepository.createDiagnosis(data);
  }
  static async updateDiagnosis(id: string, data: Partial<DentalDiagnosisMaster>) {
    return dentalMasterRepository.updateDiagnosis(id, data);
  }
  static async deleteDiagnosis(id: string) {
    return dentalMasterRepository.deleteDiagnosis(id);
  }

  // Procedures & Tariff
  static async getProcedures(query?: { category?: string; search?: string }) {
    return dentalMasterRepository.getProcedures(query);
  }
  static async createProcedure(data: Partial<DentalProcedureMaster>) {
    return dentalMasterRepository.createProcedure(data);
  }
  static async updateProcedure(id: string, data: Partial<DentalProcedureMaster>) {
    return dentalMasterRepository.updateProcedure(id, data);
  }
  static async deleteProcedure(id: string) {
    return dentalMasterRepository.deleteProcedure(id);
  }

  // Departments (Dental Chairs)
  static async getDepartments(query?: { search?: string; isActive?: boolean }) {
    return dentalMasterRepository.getDepartments(query);
  }
  static async createDepartment(data: Partial<DentalDepartmentMaster>) {
    return dentalMasterRepository.createDepartment(data);
  }
  static async updateDepartment(id: string, data: Partial<DentalDepartmentMaster>) {
    return dentalMasterRepository.updateDepartment(id, data);
  }
  static async deleteDepartment(id: string) {
    return dentalMasterRepository.deleteDepartment(id);
  }

  // Insurances & BPJS Dental
  static async getInsurances(query?: { category?: string; search?: string }) {
    return dentalMasterRepository.getInsurances(query);
  }
  static async createInsurance(data: Partial<DentalInsuranceMaster>) {
    return dentalMasterRepository.createInsurance(data);
  }
  static async updateInsurance(id: string, data: Partial<DentalInsuranceMaster>) {
    return dentalMasterRepository.updateInsurance(id, data);
  }
  static async deleteInsurance(id: string) {
    return dentalMasterRepository.deleteInsurance(id);
  }
}

export class UserService {
  static async getUsers(query?: { role?: string; isActive?: boolean; search?: string }) {
    return userRepository.getUsers(query);
  }

  static async getUserById(id: string) {
    return userRepository.getUserById(id);
  }

  static async createUser(data: Partial<User> & { password?: string }) {
    return userRepository.createUser(data);
  }

  static async updateUser(id: string, data: Partial<User> & { password?: string }) {
    return userRepository.updateUser(id, data);
  }

  static async deleteUser(id: string) {
    return userRepository.deleteUser(id);
  }

  static async toggleStatus(id: string) {
    return userRepository.toggleStatus(id);
  }
}


