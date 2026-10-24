import patientsSeed from "@/data/patients.json";
import doctorsSeed from "@/data/doctors.json";
import departmentsSeed from "@/data/departments.json";
import appointmentsSeed from "@/data/appointments.json";
import queuesSeed from "@/data/queues.json";
import encountersSeed from "@/data/encounters.json";
import prescriptionsSeed from "@/data/prescriptions.json";
import medicinesSeed from "@/data/medicines.json";
import labOrdersSeed from "@/data/laboratory-orders.json";
import radOrdersSeed from "@/data/radiology-orders.json";
import roomsSeed from "@/data/rooms.json";
import admissionsSeed from "@/data/admissions.json";
import invoicesSeed from "@/data/invoices.json";
import inventorySeed from "@/data/inventory.json";
import notificationsSeed from "@/data/notifications.json";
import auditLogsSeed from "@/data/audit-logs.json";

import {
  Patient,
  Doctor,
  Department,
  Appointment,
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
} from "@/types";

const STORAGE_KEY = "ehealth_demo_store_v1";

export interface MockStoreState {
  patients: Patient[];
  doctors: Doctor[];
  departments: Department[];
  appointments: Appointment[];
  queues: QueueItem[];
  encounters: Encounter[];
  prescriptions: Prescription[];
  medicines: Medicine[];
  labOrders: LaboratoryOrder[];
  radOrders: RadiologyOrder[];
  rooms: Room[];
  admissions: Admission[];
  invoices: Invoice[];
  inventory: InventoryItem[];
  notifications: AppNotification[];
  auditLogs: AuditLog[];
  hospitalProfile: HospitalProfile;
  financeTransactions: any[];
}

const defaultHospitalProfile: HospitalProfile = {
  name: "OKAY DENTAL THERAPIST",
  code: "OKAY-01",
  type: "Praktek & Klinik Dokter Gigi Spesialis Modern",
  accreditation: "Paripurna Kemenkes RI",
  licenseNumber: "445/098/IZIN-KLINIK-GIGI/DINKES/2023",
  taxId: "01.345.678.9-012.000",
  phone: "083856480982",
  email: "kontak@okaydental.co.id",
  website: "https://okaydental.co.id",
  address: "Ds. Krajan II RT.08 RW.02 67276",
  city: "Pati",
  province: "Jawa Tengah",
  postalCode: "67276",
  directorName: "drg. Jihan, S.Kep",
};

function getInitialSeedState(): MockStoreState {
  return {
    patients: patientsSeed as unknown as Patient[],
    doctors: doctorsSeed as unknown as Doctor[],
    departments: departmentsSeed as unknown as Department[],
    appointments: appointmentsSeed as unknown as Appointment[],
    queues: queuesSeed as unknown as QueueItem[],
    encounters: encountersSeed as unknown as Encounter[],
    prescriptions: prescriptionsSeed as unknown as Prescription[],
    medicines: medicinesSeed as unknown as Medicine[],
    labOrders: labOrdersSeed as unknown as LaboratoryOrder[],
    radOrders: radOrdersSeed as unknown as RadiologyOrder[],
    rooms: roomsSeed as unknown as Room[],
    admissions: admissionsSeed as unknown as Admission[],
    invoices: invoicesSeed as unknown as Invoice[],
    inventory: inventorySeed as unknown as InventoryItem[],
    notifications: notificationsSeed as unknown as AppNotification[],
    auditLogs: auditLogsSeed as unknown as AuditLog[],
    hospitalProfile: defaultHospitalProfile,
    financeTransactions: [
      {
        id: "FIN-REV-001",
        transactionNumber: "TRX-IN-20260924-001",
        type: "income",
        category: "patient_payment",
        amount: 452000,
        paymentMethod: "cash",
        description: "Pembayaran tagihan pasien: Budi Santoso (INV-202609-0001)",
        referenceId: "INV-001",
        referenceType: "invoice",
        date: "2026-09-24",
        operatorName: "Kasir OKAY Dental",
        notes: "Tindakan gigi & obat",
        createdAt: "2026-09-24T14:34:27.000Z",
      },
      {
        id: "FIN-EXP-001",
        transactionNumber: "TRX-OUT-20260924-001",
        type: "expense",
        category: "medicine_purchase",
        amount: 1250000,
        paymentMethod: "transfer",
        description: "Pembelian stok awal obat & anestesi dental dari PBF Kimia Farma",
        referenceId: "INV-SUP-PBF-01",
        referenceType: "stock_in",
        date: "2026-09-21",
        operatorName: "Petugas Farmasi",
        notes: "Restock farmasi bulanan",
        createdAt: "2026-09-24T14:34:27.000Z",
      },
      {
        id: "FIN-EXP-002",
        transactionNumber: "TRX-OUT-20260924-002",
        type: "expense",
        category: "operational",
        amount: 350000,
        paymentMethod: "cash",
        description: "Bahan habis pakai medis dental (masker, sarung tangan nitril, bib pasien)",
        referenceId: "BHP-MED-01",
        referenceType: "operational",
        date: "2026-09-23",
        operatorName: "Petugas Klinik",
        notes: "Perlengkapan APD dental unit",
        createdAt: "2026-09-24T14:34:27.000Z",
      },
    ],
  };
}

class MockDataStore {
  private state: MockStoreState;

  constructor() {
    this.state = this.loadFromStorage();
  }

  private loadFromStorage(): MockStoreState {
    if (typeof window === "undefined") {
      return getInitialSeedState();
    }
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (!parsed.hospitalProfile) {
          parsed.hospitalProfile = defaultHospitalProfile;
        }
        if (!Array.isArray(parsed.doctors) || parsed.doctors.length === 0) {
          parsed.doctors = doctorsSeed as unknown as Doctor[];
        }

        if (Array.isArray(parsed.queues)) {
          parsed.queues.forEach((q: any) => {
            q.doctorId = "DOC-001";
            q.doctorName = "drg. Jihan, S.Kep";
          });
        }
        if (Array.isArray(parsed.appointments)) {
          parsed.appointments.forEach((a: any) => {
            a.doctorId = "DOC-001";
            a.doctorName = "drg. Jihan, S.Kep";
          });
        }
        if (Array.isArray(parsed.encounters)) {
          // Merge missing seed encounters (e.g. ENC-004, ENC-002, ENC-003)
          encountersSeed.forEach((seedEnc: any) => {
            if (!parsed.encounters.some((e: any) => e.id === seedEnc.id)) {
              parsed.encounters.push(seedEnc);
            }
          });
          parsed.encounters.forEach((e: any) => {
            e.doctorId = "DOC-001";
            e.doctorName = "drg. Jihan, S.Kep";
          });
        }
        if (Array.isArray(parsed.invoices)) {
          // Merge missing seed invoices (e.g. INV-004)
          invoicesSeed.forEach((seedInv: any) => {
            if (!parsed.invoices.some((i: any) => i.id === seedInv.id || (seedInv.encounterId && i.encounterId === seedInv.encounterId))) {
              parsed.invoices.push(seedInv);
            }
          });
          parsed.invoices.forEach((inv: any) => {
            inv.status = inv.status || inv.paymentStatus || "pending";
          });
        }
        if (Array.isArray(parsed.prescriptions)) {
          parsed.prescriptions.forEach((p: any) => {
            p.doctorId = "DOC-001";
            p.doctorName = "drg. Jihan, S.Kep";
          });
        }

        if (Array.isArray(parsed.notifications)) {
          notificationsSeed.forEach((seedNotif: any) => {
            if (!parsed.notifications.some((n: any) => n.id === seedNotif.id)) {
              parsed.notifications.unshift(seedNotif);
            }
          });
        }

        if (!parsed.financeTransactions || !Array.isArray(parsed.financeTransactions)) {
          parsed.financeTransactions = getInitialSeedState().financeTransactions;
        }

        // Backfill any paid invoices into financeTransactions
        if (Array.isArray(parsed.invoices)) {
          parsed.invoices.forEach((inv: any) => {
            const paid = Number(inv.paidAmount) || 0;
            if (paid > 0 || inv.status === "paid") {
              const exists = parsed.financeTransactions.some(
                (t: any) =>
                  t.referenceId === inv.id ||
                  t.referenceId === inv.invoiceNumber ||
                  (t.description && t.description.includes(inv.invoiceNumber))
              );
              if (!exists) {
                const payMethod = (inv.transactions && inv.transactions[0]?.paymentMethod) || "cash";
                const cashier = (inv.transactions && inv.transactions[0]?.cashierName) || "Kasir OKAY Dental";
                const dateStr = (inv.paidAt || inv.invoiceDate || inv.createdAt || new Date().toISOString()).split("T")[0];
                parsed.financeTransactions.unshift({
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
        }

        return parsed;
      }
    } catch {
      // Ignore parse error and fallback
    }
    const seed = getInitialSeedState();
    this.saveToStorage(seed);
    return seed;
  }

  private saveToStorage(state: MockStoreState) {
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      } catch {
        // Storage might be full or disabled
      }
    }
  }

  public getState(): MockStoreState {
    return this.state;
  }

  public getHospitalProfile(): HospitalProfile {
    return this.state.hospitalProfile || defaultHospitalProfile;
  }

  public updateHospitalProfile(profile: Partial<HospitalProfile>): HospitalProfile {
    this.state.hospitalProfile = { ...this.getHospitalProfile(), ...profile };
    this.saveToStorage(this.state);
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("hospital-profile-updated", { detail: this.state.hospitalProfile }));
    }
    return this.state.hospitalProfile;
  }

  public updateState(updater: (draft: MockStoreState) => void) {
    updater(this.state);
    this.saveToStorage(this.state);
  }

  public resetDemoData() {
    this.state = getInitialSeedState();
    if (typeof window !== "undefined") {
      localStorage.removeItem(STORAGE_KEY);
      this.saveToStorage(this.state);
    }
  }
}

export const mockStore = new MockDataStore();
