import {
  LayoutDashboard,
  ListOrdered,
  CalendarCheck,
  Users,
  Stethoscope,
  FileText,
  Pill,
  Scan,
  UserCheck,
  Clock,
  Boxes,
  Receipt,
  ShieldCheck,
  FileSpreadsheet,
  BarChart3,
  Contact,
  Bell,
  History,
  Database,
  Settings,
  Landmark,
  UserCog,
  LucideIcon,
} from "lucide-react";
import { PERMISSIONS } from "./permissions";

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  permission?: string;
  badge?: string;
}

export interface NavGroup {
  groupName: string;
  items: NavItem[];
}

export const NAVIGATION_GROUPS: NavGroup[] = [
  {
    groupName: "Utama",
    items: [
      {
        label: "Dashboard Klinik Gigi",
        href: "/dashboard",
        icon: LayoutDashboard,
        permission: PERMISSIONS.DASHBOARD_VIEW,
      },
    ],
  },
  {
    groupName: "Alur Pelayanan Gigi",
    items: [
      {
        label: "1. Pendaftaran Pasien",
        href: "/patients",
        icon: Users,
        permission: PERMISSIONS.PATIENT_VIEW,
      },
      {
        label: "2. Antrean Dental Chair",
        href: "/queue",
        icon: ListOrdered,
        permission: PERMISSIONS.QUEUE_VIEW,
        badge: "Live",
      },
      {
        label: "3. Pemeriksaan Gigi & Odontogram",
        href: "/outpatient",
        icon: Stethoscope,
        permission: PERMISSIONS.PATIENT_VIEW,
      },
      {
        label: "4. Farmasi & Alat Medis (Stok)",
        href: "/pharmacy",
        icon: Pill,
        permission: PERMISSIONS.PHARMACY_VIEW,
      },
      {
        label: "5. Kasir & Pembayaran Gigi",
        href: "/billing",
        icon: Receipt,
        permission: PERMISSIONS.BILLING_VIEW,
      },
      {
        label: "6. Riwayat Pemeriksaan Pasien",
        href: "/medical-records",
        icon: FileText,
        permission: PERMISSIONS.ENCOUNTER_VIEW,
      },
    ],
  },
  {
    groupName: "Keuangan & Laporan",
    items: [
      {
        label: "Laporan Keuangan & Buku Kas",
        href: "/finance",
        icon: Landmark,
        permission: PERMISSIONS.BILLING_VIEW,
        badge: "Sinkron",
      },
      {
        label: "Pusat Rekap Laporan",
        href: "/reports",
        icon: FileSpreadsheet,
        permission: PERMISSIONS.REPORT_VIEW,
      },
      {
        label: "Statistik & Kunjungan",
        href: "/analytics",
        icon: BarChart3,
        permission: PERMISSIONS.ANALYTICS_VIEW,
      },
    ],
  },
  {
    groupName: "Jadwal & Pengaturan",
    items: [
      {
        label: "Jadwal Janji Temu",
        href: "/appointments",
        icon: CalendarCheck,
        permission: PERMISSIONS.APPOINTMENT_VIEW,
      },
      {
        label: "Dokter Gigi & Praktik",
        href: "/doctors",
        icon: UserCheck,
        permission: PERMISSIONS.DOCTOR_VIEW,
      },
      {
        label: "Master Data Dental",
        href: "/master-data",
        icon: Database,
        permission: PERMISSIONS.MASTER_DATA_VIEW,
      },
      {
        label: "Manajemen Pengguna (User)",
        href: "/users",
        icon: UserCog,
        permission: PERMISSIONS.USER_VIEW,
      },
      {
        label: "Pengaturan Klinik Gigi",
        href: "/settings",
        icon: Settings,
        permission: PERMISSIONS.SETTINGS_MANAGE,
      },
    ],
  },
];

