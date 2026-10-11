import { appConfig } from "@/config/app-config";
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
} from "./contracts";
import {
  MockPatientRepository,
  MockDoctorRepository,
  MockAppointmentRepository,
  MockQueueRepository,
  MockEncounterRepository,
  MockPharmacyRepository,
  MockLaboratoryRepository,
  MockRadiologyRepository,
  MockInpatientRepository,
  MockBillingRepository,
  MockInventoryRepository,
  MockSystemRepository,
  MockFinanceRepository,
  MockDentalMasterRepository,
  MockUserRepository,
} from "./mock";
import {
  ApiPatientRepository,
  ApiDoctorRepository,
  ApiAppointmentRepository,
  ApiQueueRepository,
  ApiEncounterRepository,
  ApiPharmacyRepository,
  ApiLaboratoryRepository,
  ApiRadiologyRepository,
  ApiInpatientRepository,
  ApiBillingRepository,
  ApiInventoryRepository,
  ApiSystemRepository,
  ApiFinanceRepository,
  ApiDentalMasterRepository,
  ApiUserRepository,
} from "./api";

const isApi = appConfig.dataSource === "api";

export const patientRepository: IPatientRepository = isApi
  ? new ApiPatientRepository()
  : new MockPatientRepository();

export const doctorRepository: IDoctorRepository = isApi
  ? new ApiDoctorRepository()
  : new MockDoctorRepository();

export const appointmentRepository: IAppointmentRepository = isApi
  ? new ApiAppointmentRepository()
  : new MockAppointmentRepository();

export const queueRepository: IQueueRepository = isApi
  ? new ApiQueueRepository()
  : new MockQueueRepository();

export const encounterRepository: IEncounterRepository = isApi
  ? new ApiEncounterRepository()
  : new MockEncounterRepository();

export const pharmacyRepository: IPharmacyRepository = isApi
  ? new ApiPharmacyRepository()
  : new MockPharmacyRepository();

export const laboratoryRepository: ILaboratoryRepository = isApi
  ? new ApiLaboratoryRepository()
  : new MockLaboratoryRepository();

export const radiologyRepository: IRadiologyRepository = isApi
  ? new ApiRadiologyRepository()
  : new MockRadiologyRepository();

export const inpatientRepository: IInpatientRepository = isApi
  ? new ApiInpatientRepository()
  : new MockInpatientRepository();

export const billingRepository: IBillingRepository = isApi
  ? new ApiBillingRepository()
  : new MockBillingRepository();

export const inventoryRepository: IInventoryRepository = isApi
  ? new ApiInventoryRepository()
  : new MockInventoryRepository();

export const systemRepository: ISystemRepository = isApi
  ? new ApiSystemRepository()
  : new MockSystemRepository();

export const financeRepository: IFinanceRepository = isApi
  ? new ApiFinanceRepository()
  : new MockFinanceRepository();

export const dentalMasterRepository: IDentalMasterRepository = isApi
  ? new ApiDentalMasterRepository()
  : new MockDentalMasterRepository();

export const userRepository: IUserRepository = isApi
  ? new ApiUserRepository()
  : new MockUserRepository();


export * from "./contracts";
export { mockStore } from "./mock/store";

