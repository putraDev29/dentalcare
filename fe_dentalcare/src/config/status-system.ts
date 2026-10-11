import { StatusVariant } from "@/types";

export interface StatusConfig {
  label: string;
  variant: StatusVariant;
  badgeClass: string;
}

export const appointmentStatusMap: Record<string, StatusConfig> = {
  scheduled: {
    label: "Terjadwal",
    variant: "info",
    badgeClass: "bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-950/40 dark:text-sky-300 dark:border-sky-800",
  },
  confirmed: {
    label: "Terkonfirmasi",
    variant: "info",
    badgeClass: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800",
  },
  checked_in: {
    label: "Check-in",
    variant: "warning",
    badgeClass: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800",
  },
  in_queue: {
    label: "Dalam Antrean",
    variant: "warning",
    badgeClass: "bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-950/40 dark:text-orange-300 dark:border-orange-800",
  },
  in_examination: {
    label: "Pemeriksaan",
    variant: "info",
    badgeClass: "bg-teal-50 text-teal-700 border-teal-200 dark:bg-teal-950/40 dark:text-teal-300 dark:border-teal-800",
  },
  completed: {
    label: "Selesai",
    variant: "success",
    badgeClass: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800",
  },
  cancelled: {
    label: "Dibatalkan",
    variant: "danger",
    badgeClass: "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800",
  },
  no_show: {
    label: "Tidak Hadir",
    variant: "neutral",
    badgeClass: "bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700",
  },
};

export const queueStatusMap: Record<string, StatusConfig> = {
  waiting: {
    label: "Menunggu",
    variant: "warning",
    badgeClass: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300",
  },
  called: {
    label: "Dipanggil",
    variant: "info",
    badgeClass: "bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-950/40 dark:text-sky-300",
  },
  in_progress: {
    label: "Dilayani",
    variant: "info",
    badgeClass: "bg-teal-50 text-teal-700 border-teal-200 dark:bg-teal-950/40 dark:text-teal-300",
  },
  skipped: {
    label: "Dilewati",
    variant: "neutral",
    badgeClass: "bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300",
  },
  completed: {
    label: "Selesai",
    variant: "success",
    badgeClass: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300",
  },
  cancelled: {
    label: "Batal",
    variant: "danger",
    badgeClass: "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300",
  },
};

export const bedStatusMap: Record<string, StatusConfig> = {
  available: {
    label: "Tersedia",
    variant: "success",
    badgeClass: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300",
  },
  occupied: {
    label: "Terisi",
    variant: "danger",
    badgeClass: "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300",
  },
  reserved: {
    label: "Dipesan",
    variant: "warning",
    badgeClass: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300",
  },
  cleaning: {
    label: "Pembersihan",
    variant: "info",
    badgeClass: "bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-950/40 dark:text-sky-300",
  },
  maintenance: {
    label: "Perawatan",
    variant: "neutral",
    badgeClass: "bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300",
  },
};

export const invoiceStatusMap: Record<string, StatusConfig> = {
  draft: {
    label: "Draft",
    variant: "neutral",
    badgeClass: "bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300",
  },
  pending: {
    label: "Menunggu",
    variant: "warning",
    badgeClass: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300",
  },
  partial: {
    label: "Sebagian",
    variant: "info",
    badgeClass: "bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-950/40 dark:text-sky-300",
  },
  paid: {
    label: "Lunas",
    variant: "success",
    badgeClass: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300",
  },
  cancelled: {
    label: "Dibatalkan",
    variant: "danger",
    badgeClass: "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300",
  },
  refunded: {
    label: "Dikembalikan",
    variant: "neutral",
    badgeClass: "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/40 dark:text-purple-300",
  },
};

export const prescriptionStatusMap: Record<string, StatusConfig> = {
  waiting: {
    label: "Menunggu",
    variant: "warning",
    badgeClass: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300",
  },
  preparing: {
    label: "Disiapkan",
    variant: "info",
    badgeClass: "bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-950/40 dark:text-sky-300",
  },
  ready: {
    label: "Siap Ambil",
    variant: "info",
    badgeClass: "bg-teal-50 text-teal-700 border-teal-200 dark:bg-teal-950/40 dark:text-teal-300",
  },
  dispensed: {
    label: "Diserahkan",
    variant: "success",
    badgeClass: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300",
  },
  cancelled: {
    label: "Dibatalkan",
    variant: "danger",
    badgeClass: "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300",
  },
};

export const triageMap: Record<string, { label: string; bg: string; text: string; border: string }> = {
  red: { label: "Resusitasi (P1)", bg: "bg-red-500", text: "text-white", border: "border-red-600" },
  orange: { label: "Emergent (P2)", bg: "bg-orange-500", text: "text-white", border: "border-orange-600" },
  yellow: { label: "Urgent (P3)", bg: "bg-amber-400", text: "text-amber-950", border: "border-amber-500" },
  green: { label: "Non-Urgent (P4)", bg: "bg-emerald-500", text: "text-white", border: "border-emerald-600" },
  blue: { label: "False Emergency (P5)", bg: "bg-blue-500", text: "text-white", border: "border-blue-600" },
};

