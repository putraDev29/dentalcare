"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight, Home } from "lucide-react";

const ROUTE_LABELS: Record<string, string> = {
  dashboard: "Dashboard",
  patients: "Pasien",
  new: "Tambah Baru",
  edit: "Edit",
  appointments: "Appointment",
  queue: "Antrean Hari Ini",
  doctors: "Dokter",
  schedules: "Jadwal Dokter",
  outpatient: "Rawat Jalan",
  inpatient: "Rawat Inap",
  emergency: "IGD / Emergency",
  "medical-records": "Rekam Medis",
  encounters: "Pemeriksaan Medis",
  pharmacy: "Farmasi",
  medicines: "Master Obat",
  laboratory: "Laboratorium",
  radiology: "Radiologi",
  rooms: "Kamar & Bed",
  billing: "Billing & Pembayaran",
  insurance: "Asuransi & BPJS",
  inventory: "Inventori Medis",
  staff: "Tenaga Medis & Staff",
  reports: "Laporan",
  analytics: "Statistik & Analytics",
  notifications: "Pusat Notifikasi",
  "audit-logs": "Audit Log",
  "master-data": "Master Data",
  settings: "Pengaturan Sistem",
};

export function Breadcrumb() {
  const pathname = usePathname();
  if (!pathname || pathname === "/" || pathname === "/dashboard") return null;

  const segments = pathname.split("/").filter(Boolean);

  return (
    <nav className="flex items-center space-x-1.5 text-xs text-slate-500 mb-4 select-none">
      <Link
        href="/dashboard"
        className="flex items-center gap-1 hover:text-sky-600 transition-colors"
      >
        <Home className="h-3.5 w-3.5" />
        <span className="hidden sm:inline">Dashboard</span>
      </Link>

      {segments.map((seg, idx) => {
        const href = "/" + segments.slice(0, idx + 1).join("/");
        const isLast = idx === segments.length - 1;
        const label = ROUTE_LABELS[seg] || seg;

        return (
          <React.Fragment key={href}>
            <ChevronRight className="h-3 w-3 text-slate-400" />
            {isLast ? (
              <span className="font-semibold text-slate-800">
                {label}
              </span>
            ) : (
              <Link
                href={href}
                className="hover:text-sky-600 transition-colors"
              >
                {label}
              </Link>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
}

