"use client";

import * as React from "react";
import Link from "next/link";
import { Stethoscope, Clock, CheckCircle2, FileText, ArrowRight, Sparkles } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { DataTable } from "@/components/shared/data-table";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/shared/status-badge";
import { useAppointments } from "@/hooks";
import { ColumnDef } from "@tanstack/react-table";
import { Appointment } from "@/types";

export default function OutpatientDentalPage() {
  const { appointments } = useAppointments();

  const columns: ColumnDef<Appointment>[] = [
    {
      accessorKey: "appointmentNumber",
      header: "No. Registrasi Dental",
      cell: ({ row }) => (
        <span className="font-mono text-xs font-semibold text-teal-700">
          {row.original.appointmentNumber}
        </span>
      ),
    },
    {
      accessorKey: "patientName",
      header: "Nama Pasien Gigi",
      cell: ({ row }) => (
        <div>
          <Link
            href={`/patients/${row.original.patientId}`}
            className="font-semibold text-slate-900 hover:text-teal-600 dark:text-slate-100"
          >
            {row.original.patientName}
          </Link>
          <p className="text-[11px] font-mono text-slate-400">{row.original.patientMrn}</p>
        </div>
      ),
    },
    {
      accessorKey: "departmentName",
      header: "Unit Poli Gigi",
      cell: ({ row }) => (
        <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
          {row.original.departmentName}
        </span>
      ),
    },
    {
      accessorKey: "doctorName",
      header: "Dokter Gigi Pemeriksa",
      cell: ({ row }) => (
        <span className="text-xs text-slate-600 dark:text-slate-400">
          {row.original.doctorName}
        </span>
      ),
    },
    {
      accessorKey: "queueNumber",
      header: "No. Dental Chair",
      cell: ({ row }) => (
        <div className="flex items-center gap-1.5">
          <span className="font-bold font-mono text-xs text-teal-700 bg-teal-50 dark:bg-teal-950/50 px-2 py-0.5 rounded-md">
            {row.original.queueNumber || "A-01"}
          </span>
        </div>
      ),
    },
    {
      accessorKey: "appointmentTime",
      header: "Jam Kunjungan",
      cell: ({ row }) => (
        <span className="font-mono text-xs text-slate-600">
          {row.original.appointmentTime} WIB
        </span>
      ),
    },
    {
      accessorKey: "status",
      header: "Status Alur",
      cell: ({ row }) => <StatusBadge type="appointment" status={row.original.status} />,
    },
    {
      id: "action",
      header: "Pemeriksaan Gigi",
      cell: ({ row }) => (
        <Link href={`/encounters/new?patientId=${row.original.patientId}&appointmentId=${row.original.id}`}>
          <Button size="sm" className="h-7 text-xs gap-1 shadow-xs bg-teal-600 hover:bg-teal-700">
            <Stethoscope className="h-3.5 w-3.5" />
            <span>Odontogram & Tindakan</span>
          </Button>
        </Link>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Ruang Praktik Dokter Gigi & Dental Chair"
        description="Monitor alur antrean dental chair, pemanggilan pasien ke unit gigi, dan inisiasi rekam medis odontogram dokter gigi."
      >
        <div className="flex items-center gap-2">
          <Link href="/appointments/new">
            <Button size="sm" className="text-xs shadow-xs">
              + Janji Temu Dental Baru
            </Button>
          </Link>
        </div>
      </PageHeader>

      <DataTable
        columns={columns}
        data={appointments}
        searchPlaceholder="Cari nama pasien gigi, No RM, atau dokter gigi..."
        emptyTitle="Tidak ada pasien gigi terdaftar"
        emptyDescription="Daftar pasien kunjungan klinik gigi akan muncul di sini."
      />
    </div>
  );
}
