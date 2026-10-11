"use client";

import * as React from "react";
import Link from "next/link";
import { ColumnDef } from "@tanstack/react-table";
import {
  CalendarCheck,
  Plus,
  Clock,
  UserCheck,
  CheckCircle2,
  XCircle,
  Stethoscope,
  Eye,
  CalendarDays,
  List,
} from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { DataTable } from "@/components/shared/data-table";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/shared/status-badge";
import { useAppointments } from "@/hooks";
import { Appointment } from "@/types";
import { formatDate } from "@/lib/formatting";
import { toast } from "sonner";

export default function AppointmentsPage() {
  const { appointments, loading, updateStatus } = useAppointments();
  const [viewMode, setViewMode] = React.useState<"list" | "calendar">("list");
  const [statusFilter, setStatusFilter] = React.useState<string>("");

  const handleStatusChange = async (id: string, status: Appointment["status"]) => {
    try {
      await updateStatus(id, status);
      toast.success(`Status appointment berhasil diubah ke ${status}.`);
    } catch {
      toast.error("Gagal memperbarui status.");
    }
  };

  const filteredAppointments = appointments.filter((a) =>
    statusFilter ? a.status === statusFilter : true
  );

  const columns: ColumnDef<Appointment>[] = [
    {
      accessorKey: "appointmentNumber",
      header: "No. Appointment",
      cell: ({ row }) => (
        <span className="font-mono text-xs font-semibold text-teal-700 dark:text-teal-400">
          {row.original.appointmentNumber}
        </span>
      ),
    },
    {
      accessorKey: "patientName",
      header: "Nama Pasien",
      cell: ({ row }) => (
        <div>
          <Link
            href={`/patients/${row.original.patientId}`}
            className="font-semibold text-slate-900 hover:text-teal-600 dark:text-slate-100"
          >
            {row.original.patientName}
          </Link>
          <p className="text-[11px] font-mono text-slate-400">
            {row.original.patientMrn}
          </p>
        </div>
      ),
    },
    {
      id: "schedule",
      header: "Jadwal",
      cell: ({ row }) => (
        <div className="text-xs">
          <p className="font-semibold text-slate-800 dark:text-slate-200">
            {formatDate(row.original.appointmentDate)}
          </p>
          <p className="text-[11px] text-teal-700 dark:text-teal-400 font-mono font-medium">
            Pukul {row.original.appointmentTime} WIB
          </p>
        </div>
      ),
    },
    {
      accessorKey: "doctorName",
      header: "Dokter / Poli",
      cell: ({ row }) => (
        <div className="text-xs">
          <p className="font-medium text-slate-800 dark:text-slate-200">
            {row.original.doctorName}
          </p>
          <p className="text-[11px] text-slate-400">{row.original.departmentName}</p>
        </div>
      ),
    },
    {
      accessorKey: "complaint",
      header: "Keluhan Awal",
      cell: ({ row }) => (
        <p className="text-xs text-slate-600 dark:text-slate-400 max-w-xs truncate">
          {row.original.complaint || "-"}
        </p>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => (
        <StatusBadge type="appointment" status={row.original.status} />
      ),
    },
    {
      id: "actions",
      header: "Aksi Cepat",
      cell: ({ row }) => {
        const apt = row.original;
        return (
          <div className="flex items-center gap-1">
            {apt.status === "scheduled" && (
              <Button
                variant="outline"
                size="sm"
                className="h-7 text-xs text-blue-600"
                onClick={() => handleStatusChange(apt.id, "confirmed")}
              >
                Konfirmasi
              </Button>
            )}
            {(apt.status === "confirmed" || apt.status === "scheduled") && (
              <Button
                size="sm"
                className="h-7 text-xs"
                onClick={() => handleStatusChange(apt.id, "checked_in")}
              >
                Check-in
              </Button>
            )}
            {apt.status === "checked_in" && (
              <Link href="/queue">
                <Button size="sm" variant="subtle" className="h-7 text-xs">
                  Ke Antrean
                </Button>
              </Link>
            )}
            {apt.status !== "cancelled" && apt.status !== "completed" && (
              <Button
                variant="ghost"
                size="sm"
                className="h-7 text-xs text-rose-600 hover:bg-rose-50"
                onClick={() => handleStatusChange(apt.id, "cancelled")}
              >
                Batal
              </Button>
            )}
          </div>
        );
      },
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Jadwal Appointment & Perjanjian Temu"
        description="Kelola jadwal booking pasien dengan dokter spesialis, check-in kedatangan, dan pengaturan slot poli."
      >
        <div className="flex items-center gap-2">
          {/* View Mode Toggle */}
          <div className="flex rounded-xl border border-slate-200 bg-white p-1 text-xs dark:border-slate-800 dark:bg-slate-900">
            <button
              onClick={() => setViewMode("list")}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg transition-colors ${
                viewMode === "list"
                  ? "bg-teal-600 text-white font-medium"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <List className="h-3.5 w-3.5" />
              <span>Daftar</span>
            </button>
            <button
              onClick={() => setViewMode("calendar")}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg transition-colors ${
                viewMode === "calendar"
                  ? "bg-teal-600 text-white font-medium"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <CalendarDays className="h-3.5 w-3.5" />
              <span>Kalender</span>
            </button>
          </div>

          <Link href="/appointments/new">
            <Button className="gap-1.5 shadow-xs text-xs">
              <Plus className="h-4 w-4" />
              <span>Buat Appointment</span>
            </Button>
          </Link>
        </div>
      </PageHeader>

      {/* Filter Chips */}
      <div className="flex flex-wrap items-center gap-2 text-xs">
        <span className="font-semibold text-slate-500 mr-1">Status:</span>
        {["", "scheduled", "confirmed", "checked_in", "in_queue", "completed", "cancelled"].map((st) => (
          <button
            key={st}
            onClick={() => setStatusFilter(st)}
            className={`rounded-xl px-3 py-1.5 font-medium transition-colors border cursor-pointer ${
              statusFilter === st
                ? "bg-teal-600 text-white border-teal-600"
                : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50 dark:bg-slate-900 dark:border-slate-800"
            }`}
          >
            {st === "" ? "Semua Status" : st.replace("_", " ").toUpperCase()}
          </button>
        ))}
      </div>

      {viewMode === "list" ? (
        <DataTable
          columns={columns}
          data={filteredAppointments}
          searchPlaceholder="Cari nomor appointment, nama pasien, atau DPJP..."
          emptyTitle="Tidak ada appointment"
          emptyDescription="Belum ada appointment pasien yang terdaftar sesuai filter."
        />
      ) : (
        /* Calendar Grid View */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredAppointments.map((apt) => (
            <div
              key={apt.id}
              className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs dark:border-slate-800 dark:bg-slate-900 space-y-3"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-2.5 dark:border-slate-800">
                <span className="font-mono text-xs font-bold text-teal-700">
                  {apt.appointmentNumber}
                </span>
                <StatusBadge type="appointment" status={apt.status} />
              </div>
              <div className="space-y-1 text-xs">
                <p className="font-bold text-slate-900 dark:text-slate-100 text-sm">
                  {apt.patientName}
                </p>
                <p className="text-slate-500 font-mono text-[11px]">{apt.patientMrn}</p>
                <div className="mt-2 rounded-xl bg-slate-50 p-2.5 dark:bg-slate-800/50 space-y-1">
                  <p className="text-teal-700 dark:text-teal-300 font-semibold">
                    {apt.doctorName}
                  </p>
                  <p className="text-slate-500">{apt.departmentName}</p>
                  <p className="text-slate-700 dark:text-slate-300 font-mono font-medium">
                    📅 {formatDate(apt.appointmentDate)} • ⏰ {apt.appointmentTime} WIB
                  </p>
                </div>
              </div>
              <div className="flex justify-end pt-1">
                <Link href={`/patients/${apt.patientId}`}>
                  <Button variant="outline" size="sm" className="h-7 text-xs">
                    Profil Pasien
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

