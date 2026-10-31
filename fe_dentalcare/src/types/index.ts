// ==========================================
// 1. COMMON TYPES & INTERFACES
// ==========================================

export type Gender = "male" | "female";

export interface Address {
  street: string;
  rtRw?: string;
  subDistrict?: string; // Kelurahan
  district?: string;    // Kecamatan
  city?: string;        // Kota/Kabupaten
  province?: string;
  postalCode?: string;
}

export interface EmergencyContact {
  name?: string;
  relationship?: string;
  phone?: string;
}

export interface PaginatedResult<T> {
  data: T[];
  meta: {
    page: number;
    perPage: number;
    total: number;
    totalPages: number;
  };
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface ApiError {
  success: false;
  message: string;
  errors?: Record<string, string[]>;
}

export interface QueryParams {
  search?: string;
  page?: number;
  perPage?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  facilityId?: string;
}

export type StatusVariant = "default" | "success" | "warning" | "danger" | "info" | "neutral";

// ==========================================
// 2. AUTH, ROLES & PERMISSIONS
// ==========================================

export type RoleType =
  | "super_admin"
  | "hospital_admin"
  | "doctor"
  | "nurse"
  | "receptionist"
  | "pharmacist"
  | "lab_technician"
  | "radiologist"
  | "cashier"
  | "inventory_staff"
  | "management"
  | "patient";

export interface Role {
  id: string;
  code: RoleType;
  name: string;
  description: string;
  permissions: string[];
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: RoleType;
  roleName: string;
  avatarUrl?: string;
  facilityId: string;
  departmentId?: string;
  doctorId?: string;
  employeeNumber?: string;
  phone?: string;
  isActive: boolean;
  lastLoginAt?: string;
  createdAt?: string;
  updatedAt?: string;
}

// ==========================================
// 3. PATIENTS
// ==========================================

export type PatientStatus = "active" | "inactive" | "inpatient" | "deceased";

export interface PatientInsurance {
  type: "umum" | "bpjs" | "asuransi" | "perusahaan";
  providerName?: string;
  policyNumber?: string;
  memberNumber?: string;
  bpjsClass?: "1" | "2" | "3";
  primaryClinic?: string; // Faskes 1
}

export interface Patient {
  id: string;
  facilityId: string;
  medicalRecordNumber: string; // e.g. RM-2026-000123
  nik?: string;
  name: string;
  gender: Gender;
  birthPlace: string;
  birthDate: string; // YYYY-MM-DD
  bloodType?: "A+" | "A-" | "B+" | "B-" | "AB+" | "AB-" | "O+" | "O-";
  maritalStatus?: "single" | "married" | "widowed" | "divorced";
  religion?: string;
  occupation?: string;
  phone: string;
  email?: string;
  address: Address;
  emergencyContact?: EmergencyContact;
  insurance: PatientInsurance;
  allergies: string[];
  chronicDiseases: string[];
  dentalHistory?: DentalSystemicHistory;
  odontogram?: OdontogramData;
  latestOdontogram?: OdontogramData;
  status: PatientStatus;
  nextControlDate?: string;
  controlDoctor?: string;
  controlNotes?: string;
  lastVisitAt?: string;
  registeredAt: string;
  updatedAt: string;
}

export interface PatientQuery extends QueryParams {
  gender?: Gender;
  status?: PatientStatus;
  bloodType?: string;
  insuranceType?: string;
  h1Control?: boolean;
  nextControlDate?: string;
}

export interface CreatePatientInput {
  name: string;
  nik?: string;
  gender: Gender;
  birthPlace: string;
  birthDate: string;
  bloodType?: Patient["bloodType"];
  maritalStatus?: Patient["maritalStatus"];
  religion?: string;
  occupation?: string;
  phone: string;
  email?: string;
  address: Address;
  emergencyContact?: EmergencyContact;
  insurance: PatientInsurance;
  allergies?: string[];
  chronicDiseases?: string[];
}

export type UpdatePatientInput = Partial<CreatePatientInput>;

// ==========================================
// 4. DOCTORS & DEPARTMENTS
// ==========================================

export interface Department {
  id: string;
  facilityId: string;
  name: string;
  code: string;
  description?: string;
  headDoctorId?: string;
  location?: string;
  isActive: boolean;
}

export interface DoctorSchedule {
  id: string;
  doctorId: string;
  dayOfWeek: 1 | 2 | 3 | 4 | 5 | 6 | 7; // 1 = Monday ... 7 = Sunday
  dayName: string;
  startTime: string; // "08:00"
  endTime: string;   // "14:00"
  departmentId: string;
  roomNumber: string;
  maxQuota: number;
  isActive: boolean;
}

export interface Doctor {
  id: string;
  facilityId: string;
  employeeNumber: string;
  name: string;
  title: string;
  specialization: string;
  departmentId: string;
  departmentName: string;
  sipNumber: string;
  phone: string;
  email: string;
  avatarUrl?: string;
  status: "active" | "on_leave" | "resigned";
  schedules: DoctorSchedule[];
  consultationFee: number;
}

export interface Staff {
  id: string;
  facilityId: string;
  employeeId: string;
  name: string;
  role: string;
  department: string;
  phone: string;
  email: string;
  joinDate: string;
  status: "active" | "inactive";
  avatarUrl?: string;
}

// ==========================================
// 5. APPOINTMENTS & QUEUES
// ==========================================

export type AppointmentStatus =
  | "scheduled"
  | "confirmed"
  | "checked_in"
  | "in_queue"
  | "in_examination"
  | "completed"
  | "cancelled"
  | "no_show";

export type VisitType = "consultation" | "control" | "telemedicine" | "emergency" | "routine_checkup" | "historical_record";

export interface Appointment {
  id: string;
  facilityId: string;
  appointmentNumber: string; // APT-2026-0001
  patientId: string;
  patientName: string;
  patientMrn: string;
  patientPhone: string;
  patientGender: Gender;
  patientBirthDate: string;
  patientInsuranceType: string;
  doctorId: string;
  doctorName: string;
  doctorSpecialization: string;
  departmentId: string;
  departmentName: string;
  appointmentDate: string; // YYYY-MM-DD
  appointmentTime: string; // HH:mm
  durationMinutes: number;
  visitType: VisitType;
  complaint: string;
  status: AppointmentStatus;
  notes?: string;
  queueNumber?: string;
  createdAt: string;
  updatedAt: string;
}

export type CreateAppointmentInput = Omit<Appointment, "id" | "appointmentNumber" | "createdAt" | "updatedAt" | "facilityId"> & {
  facilityId?: string;
  appointmentNumber?: string;
};

export type QueueStatus = "waiting" | "called" | "in_progress" | "skipped" | "completed" | "cancelled";

export interface QueueItem {
  id: string;
  facilityId: string;
  queueNumber: string; // e.g. A-012, B-005
  appointmentId?: string;
  encounterId?: string;
  patientId: string;
  patientName: string;
  patientMrn: string;
  doctorId: string;
  doctorName: string;
  departmentId: string;
  departmentName: string;
  roomNumber: string;
  checkInTime: string; // ISO or HH:mm
  calledTime?: string;
  estimatedWaitMinutes: number;
  status: QueueStatus;
  priority: "normal" | "priority" | "emergency";
  serviceType: "outpatient" | "pharmacy" | "laboratory" | "radiology" | "cashier";
}

// ==========================================
// 6. CLINICAL ENCOUNTERS, VITAL SIGNS & EMR
// ==========================================

export interface VitalSigns {
  bloodPressureSystolic: number; // mmHg
  bloodPressureDiastolic: number;// mmHg
  heartRate: number;             // bpm
  respiratoryRate: number;       // breaths/min
  temperature: number;           // Celsius
  oxygenSaturation: number;      // SpO2 %
  weightKg: number;
  heightCm: number;
  bmi: number;
  bmiCategory: "Underweight" | "Normal" | "Overweight" | "Obese";
  painScale: number;             // 0-10
  consciousness: "Compos Mentis" | "Apatis" | "Somnolen" | "Sopor" | "Coma";
}

export interface Anamnesis {
  chiefComplaint: string;
  historyOfPresentIllness: string;
  pastMedicalHistory?: string;
  familyHistory?: string;
  medicationHistory?: string;
  allergyHistory?: string;
  socialHistory?: string;
}

export interface PhysicalExamination {
  generalAppearance?: string;
  headNeck?: string;
  thorax?: string;
  abdomen?: string;
  extremities?: string;
  neurological?: string;
  localStateNotes?: string;
}

export interface EncounterDiagnosis {
  id: string;
  code: string; // ICD-10 e.g. I10
  name: string; // Essential (primary) hypertension
  type: "primary" | "secondary" | "differential";
  notes?: string;
}

export interface EncounterProcedure {
  id: string;
  code: string; // ICD-9-CM
  name: string;
  quantity: number;
  doctorName: string;
  price: number;
  notes?: string;
}

export type EncounterStatus =
  | "registered"
  | "waiting"
  | "in_examination"
  | "waiting_lab"
  | "waiting_pharmacy"
  | "billing"
  | "completed";

export interface Encounter {
  id: string;
  facilityId: string;
  encounterNumber: string; // ENC-2026-0001
  patientId: string;
  patientName: string;
  patientMrn: string;
  patientGender: Gender;
  patientBirthDate: string;
  patientBloodType?: string;
  patientAllergies: string[];
  doctorId: string;
  doctorName: string;
  departmentId: string;
  departmentName: string;
  appointmentId?: string;
  visitDate: string; // YYYY-MM-DD
  visitType: VisitType;
  status: EncounterStatus;
  anamnesis: Anamnesis;
  vitalSigns: VitalSigns;
  physicalExam?: PhysicalExamination;
  diagnoses: EncounterDiagnosis[];
  procedures: EncounterProcedure[];
  odontogram?: OdontogramData;
  dentalProcedures?: DentalProcedureItem[];
  dentalNotes?: string;
  nextControlDate?: string;
  doctorNotes?: string;
  prescriptions: PrescriptionItem[];
  labOrderIds?: string[];
  radiologyOrderIds?: string[];
  invoiceId?: string;
  isPaid?: boolean;
  deductStock?: boolean;
  createdAt: string;
  updatedAt: string;
}

// ==========================================
// DENTAL CLINIC & ODONTOGRAM DOMAIN TYPES
// ==========================================

export type DentalArch = "maxillary" | "mandibular"; // Atas / Bawah

export type ToothCondition =
  | "sound"             // Sehat / Normal
  | "caries"            // Karies Gigi / Berlubang (Merah)
  | "filled_composite"  // Tambalan Komposit Sinar (Biru)
  | "filled_amalgam"    // Tambalan Logam Amalgam (Abu-abu gelap)
  | "filled_temporary"  // Tambalan Sementara (Kuning)
  | "missing"           // Gigi Hilang (Tanggal / Agenesis)
  | "extracted"         // Gigi Dicabut (Post-Ekstraksi)
  | "crown"             // Mahkota Tiruan (Ungu)
  | "bridge"            // Jembatan Gigi
  | "root_canal"        // Perawatan Saluran Akar / PSA (Orange)
  | "impacted"          // Impaksi Gigi Bungsu (Coklat / Amber)
  | "radix"             // Sisa Akar (Hitam)
  | "fracture"          // Gigi Patah (Garis merah)
  | "calculus";         // Karang Gigi (Hijau tua)

export type DentalSurface = "O" | "M" | "D" | "B" | "L" | "P" | "I";
// O: Occlusal, M: Mesial, D: Distal, B: Buccal/Labial, L: Lingual, P: Palatal, I: Incisal

export interface ToothRecord {
  toothNumber: number; // 11-48 (dewasa), 51-85 (anak)
  condition: ToothCondition;
  surfaces?: DentalSurface[];
  diagnosis?: string;      // e.g. "Karies Dentin (K02.1)"
  procedure?: string;      // e.g. "Penambalan Komposit Sinar"
  procedureCost?: number;  // e.g. 450000
  notes?: string;
  updatedAt?: string;
}

export interface OdontogramData {
  teeth: Record<number, ToothRecord>;
  occlusion?: "normal" | "crossbite" | "deepbite" | "openbite";
  torusPalatinus?: "none" | "small" | "medium" | "large";
  torusMandibularis?: "none" | "left" | "right" | "both";
  palatum?: "deep" | "medium" | "shallow";
  diastema?: boolean;
  anomalies?: string[];
  notes?: string;
  updatedAt: string;
}

export interface DentalProcedureItem {
  id: string;
  toothNumber?: number; // Nomor gigi jika spesifik pada satu gigi
  procedureCode: string;
  procedureName: string;
  category: "Pencegahan" | "Restorasi" | "Bedah Mulut" | "Endodontik" | "Ortodonti" | "Periodonsia" | "Prostodonsia" | "Estetika";
  price: number;
  doctorName: string;
  notes?: string;
}

export interface DentalSystemicHistory {
  hasHypertension: boolean;
  hasDiabetes: boolean;
  hasBleedingDisorder: boolean; // Riwayat perdarahan lama pasca cabut gigi
  hasHeartDisease: boolean;
  isPregnant: boolean;
  anestheticAllergy: boolean;   // Alergi obat bius lidocaine/pehacain
  regularMedications?: string;
  dentalCareFrequency?: "6_months" | "1_year" | "only_pain" | "first_time";
}

// ==========================================
// 7. PHARMACY & MEDICINES
// ==========================================

export type StockStatus = "in_stock" | "low_stock" | "out_of_stock";

export interface Medicine {
  id: string;
  code: string;
  genericName: string;
  brandName: string;
  dosageForm: "Tablet" | "Capsule" | "Syrup" | "Injection" | "Ointment" | "Drops" | "Inhaler" | "Syringe" | "Ampul" | string;
  strength: string; // e.g. 500mg, 10mg/ml
  unit: string;     // tablet, botol, ampul, tube, syringe, pcs
  manufacturer: string;
  category: "Analgesic" | "Antibiotic" | "Antihypertensive" | "Antidiabetic" | "Antiallergy" | "Vitamin" | "Gastrointestinal" | "Emergency" | string;
  currentStock: number;
  minimumStock: number;
  purchasePrice: number;
  sellingPrice: number;
  expiryDate: string;
  stockStatus: StockStatus;
  requiresPrescription: boolean;
}

export interface PrescriptionItem {
  id: string;
  medicineId: string;
  medicineName: string;
  dosage: string;      // e.g. "1 tablet"
  route: "Oral" | "Intravenous" | "Intramuscular" | "Subcutaneous" | "Topical" | "Inhalation" | "Rectal";
  frequency: string;  // e.g. "3x sehari"
  duration: string;   // e.g. "5 hari"
  quantity: number;
  instruction: string;// e.g. "Sesudah makan"
  unitPrice: number;
  totalPrice: number;
}

export type PrescriptionStatus = "waiting" | "preparing" | "ready" | "dispensed" | "cancelled";

export interface Prescription {
  id: string;
  prescriptionNumber: string; // RX-2026-0001
  facilityId: string;
  encounterId: string;
  patientId: string;
  patientName: string;
  patientMrn: string;
  doctorId: string;
  doctorName: string;
  items: PrescriptionItem[];
  totalAmount: number;
  paymentStatus: "unpaid" | "paid" | "covered_by_insurance";
  status: PrescriptionStatus;
  notes?: string;
  dispensedAt?: string;
  dispensedBy?: string;
  createdAt: string;
}

// ==========================================
// 8. LABORATORY & RADIOLOGY
// ==========================================

export type LabPriority = "normal" | "urgent" | "stat";
export type LabOrderStatus = "ordered" | "sample_collected" | "in_progress" | "completed" | "cancelled";
export type ResultIndicator = "low" | "normal" | "high" | "critical";

export interface LabResultItem {
  testCode: string;
  testName: string;
  resultValue: string;
  unit: string;
  referenceRange: string;
  indicator: ResultIndicator;
  notes?: string;
}

export interface LaboratoryOrder {
  id: string;
  orderNumber: string; // LAB-2026-0001
  facilityId: string;
  encounterId?: string;
  patientId: string;
  patientName: string;
  patientMrn: string;
  doctorId: string;
  doctorName: string;
  testCategory: string; // "Hematologi", "Kimia Darah", "Urinalisis"
  testName: string;
  priority: LabPriority;
  orderDate: string;
  status: LabOrderStatus;
  sampleType: "Whole Blood" | "Serum" | "Plasma" | "Urine" | "Sputum" | "Swab";
  sampleCollectedAt?: string;
  results: LabResultItem[];
  technicianName?: string;
  verifiedByDoctor?: string;
  notes?: string;
}

export type RadiologyModality = "X-Ray" | "CT Scan" | "MRI" | "Ultrasound" | "Mammography";
export type RadiologyStatus = "ordered" | "scheduled" | "in_progress" | "completed" | "reported";

export interface RadiologyOrder {
  id: string;
  orderNumber: string; // RAD-2026-0001
  facilityId: string;
  encounterId?: string;
  patientId: string;
  patientName: string;
  patientMrn: string;
  doctorId: string;
  doctorName: string;
  radiologistName?: string;
  modality: RadiologyModality;
  examinationName: string; // e.g. "Thorax PA", "CT Brain non-contrast"
  clinicalIndication: string;
  orderDate: string;
  scheduledDate?: string;
  status: RadiologyStatus;
  findings?: string;
  impression?: string;
  imageUrl?: string;
  reportedAt?: string;
}

// ==========================================
// 9. INPATIENT, ROOMS & BEDS
// ==========================================

export type RoomClass = "VVIP" | "VIP" | "Kelas 1" | "Kelas 2" | "Kelas 3" | "ICU" | "NICU" | "Isolasi";
export type BedStatus = "available" | "occupied" | "reserved" | "cleaning" | "maintenance";

export interface Bed {
  id: string;
  bedNumber: string; // e.g. "Bed A", "Bed B"
  status: BedStatus;
  currentPatientId?: string;
  currentPatientName?: string;
  currentPatientMrn?: string;
  admissionId?: string;
  occupiedSince?: string;
}

export interface Room {
  id: string;
  roomNumber: string; // e.g. "201", "202"
  building: string;   // e.g. "Gedung Utama"
  floor: string;      // e.g. "Lantai 2"
  ward: string;       // e.g. "Ruang Anggrek", "Ruang Mawar"
  roomClass: RoomClass;
  pricePerDay: number;
  beds: Bed[];
  isActive: boolean;
}

export type AdmissionStatus = "admitted" | "in_treatment" | "ready_for_discharge" | "discharged" | "transferred";

export interface Admission {
  id: string;
  admissionNumber: string; // ADM-2026-0001
  facilityId: string;
  patientId: string;
  patientName: string;
  patientMrn: string;
  patientGender: Gender;
  doctorId: string;
  doctorName: string;
  ward: string;
  roomNumber: string;
  bedNumber: string;
  roomClass: RoomClass;
  admissionDate: string; // YYYY-MM-DD HH:mm
  dischargeDate?: string;
  lengthOfStayDays: number;
  initialDiagnosis: string;
  finalDiagnosis?: string;
  conditionOnDischarge?: "Cured" | "Improved" | "Unchanged" | "Referred" | "Deceased";
  dischargeSummary?: string;
  status: AdmissionStatus;
  insuranceType: string;
}

// ==========================================
// 10. EMERGENCY / IGD
// ==========================================

export type TriageUrgency = "red" | "orange" | "yellow" | "green" | "blue";

export interface EmergencyCase {
  id: string;
  caseNumber: string; // IGD-2026-0001
  facilityId: string;
  patientId: string;
  patientName: string;
  patientMrn: string;
  arrivalTime: string;
  arrivalMethod: "Ambulance" | "Walk-in" | "Referred" | "Police";
  triageUrgency: TriageUrgency;
  triageNotes: string;
  chiefComplaint: string;
  vitalSigns: VitalSigns;
  attendingDoctorId: string;
  attendingDoctorName: string;
  status: "triage" | "resuscitation" | "observation" | "admitted_inpatient" | "discharged" | "transferred";
}

// ==========================================
// 11. BILLING & PAYMENTS
// ==========================================

export type InvoiceStatus = "draft" | "pending" | "partial" | "partially_paid" | "paid" | "cancelled" | "refunded";
export type PaymentMethod = "cash" | "debit_card" | "credit_card" | "bank_transfer" | "qris" | "bpjs" | "insurance" | "corporate";

export interface InvoiceItem {
  id: string;
  category: "consultation" | "procedure" | "laboratory" | "radiology" | "medicine" | "room" | "administration" | "other";
  description: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface PaymentTransaction {
  id: string;
  transactionNumber?: string;
  paymentMethod: PaymentMethod | string;
  amount: number;
  tenderedAmount?: number;
  changeAmount?: number;
  paidAt: string;
  referenceNumber?: string;
  cashierName: string;
  type?: "dp" | "settlement" | "full" | string;
  notes?: string;
}

export interface Invoice {
  id: string;
  invoiceNumber: string; // INV-2026-0001
  facilityId: string;
  patientId: string;
  patientName: string;
  patientMrn: string;
  patientPhone?: string;
  emergencyContact?: EmergencyContact;
  encounterId?: string;
  admissionId?: string;
  invoiceDate: string;
  dueDate: string;
  items: InvoiceItem[];
  subtotal: number;
  discount: number;
  tax: number;
  totalAmount: number;
  insuranceCoverage: number;
  patientResponsibility: number;
  paidAmount: number;
  dpAmount?: number;
  tenderedAmount?: number;
  changeAmount?: number;
  balanceAmount: number;
  status: InvoiceStatus;
  transactions: PaymentTransaction[];
  paidAt?: string;
  createdAt?: string;
  notes?: string;
}

export interface InsuranceProvider {
  id: string;
  name: string;
  code: string;
  category: "bpjs" | "commercial" | "corporate";
  contactPerson: string;
  phone: string;
  email: string;
  isActive: boolean;
  claimCount: number;
}

// ==========================================
// 12. INVENTORY & STOCK
// ==========================================

export type InventoryCategory = "Medicine" | "Medical Supplies" | "Laboratory" | "Office Supplies" | "Equipment";
export type StockMovementType = "stock_in" | "stock_out" | "transfer" | "adjustment" | "return" | "expired" | "damaged";

export interface InventoryItem {
  id: string;
  itemCode: string;
  itemName: string;
  category: InventoryCategory;
  unit: string;
  currentStock: number;
  minimumStock: number;
  reorderPoint: number;
  unitCost: number;
  location: string;
  supplier: string;
  lastPurchaseDate: string;
  expiryDate?: string;
  status: "normal" | "low_stock" | "out_of_stock";
}

export interface StockMovement {
  id: string;
  referenceNumber: string;
  itemId: string;
  itemName: string;
  movementType: StockMovementType;
  quantity: number;
  stockBefore: number;
  stockAfter: number;
  date: string;
  user: string;
  notes?: string;
}

// ==========================================
// 13. SYSTEM, AUDIT & NOTIFICATIONS
// ==========================================

export type NotificationCategory = "appointment" | "laboratory" | "pharmacy" | "inventory" | "billing" | "system";

export interface AppNotification {
  id: string;
  facilityId: string;
  title: string;
  message: string;
  category: NotificationCategory;
  timestamp: string;
  isRead: boolean;
  actionUrl?: string;
  severity?: "info" | "success" | "warning" | "error";
}

export interface AuditLog {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  role: string;
  action: "CREATE" | "UPDATE" | "DELETE" | "LOGIN" | "LOGOUT" | "EXPORT" | "VIEW";
  module: "Patient" | "Appointment" | "Encounter" | "Pharmacy" | "Laboratory" | "Billing" | "Inventory" | "User" | "Setting";
  recordId: string;
  ipAddress: string;
  device: string;
  details?: string;
}

export interface Facility {
  id: string;
  name: string;
  city: string;
  type: "hospital" | "clinic" | "laboratory";
  address: string;
  phone: string;
}

export interface HospitalProfile {
  name: string;
  code: string;
  type: string;
  accreditation: string;
  licenseNumber: string;
  taxId: string;
  phone: string;
  email: string;
  website: string;
  address: string;
  city: string;
  province: string;
  postalCode: string;
  directorName: string;
}

export interface OperationalConfig {
  registrationOpenTime: string;
  registrationCloseTime: string;
  emergencyOpen24h: boolean;
  defaultDoctorQuota: number;
  cancellationHoursLimit: number;
  autoCallQueue: boolean;
}

export interface DocumentNumberingConfig {
  mrnPrefix: string;
  registrationPrefix: string;
  queuePrefixFormat: string;
  prescriptionPrefix: string;
  invoicePrefix: string;
}

export interface IntegrationConfig {
  bpjsSandbox: boolean;
  bpjsConsId: string;
  bpjsSecretKey: string;
  bpjsUserKey: string;
  satusehatOrgId: string;
  satusehatClientId: string;
  satusehatClientSecret: string;
  waGatewayProvider: string;
  waGatewayToken: string;
}


export interface MedicineMutation {
  id: string;
  medicineId: string;
  medicineName: string;
  type: 'in' | 'out';
  quantity: number;
  stockBefore: number;
  stockAfter: number;
  unitPrice: number;
  totalPrice: number;
  reason: string;
  referenceNo?: string;
  batchNumber?: string;
  expiryDate?: string;
  notes?: string;
  operatorName?: string;
  createdAt: string;
}

// ==========================================
// DENTAL MASTER DATA TYPES
// ==========================================

export interface DentalDiagnosisMaster {
  id: string;
  code: string;
  name: string;
  category: string;
  description?: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface DentalProcedureMaster {
  id: string;
  code: string;
  name: string;
  category: string;
  cost: number;
  description?: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface DentalDepartmentMaster {
  id: string;
  facilityId?: string;
  name: string;
  code?: string;
  description?: string;
  headDoctorId?: string;
  location?: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface DentalInsuranceMaster {
  id: string;
  code: string;
  name: string;
  category: string;
  contactPerson?: string;
  phone?: string;
  email?: string;
  claimCount: number;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}