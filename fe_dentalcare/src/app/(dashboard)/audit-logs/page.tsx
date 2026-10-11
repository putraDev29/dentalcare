"use client";

import * as React from "react";
import { History, ShieldCheck, Search, Filter } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { DataTable } from "@/components/shared/data-table";
import { Badge } from "@/components/ui/badge";
import { useAuditLogs } from "@/hooks";
import { formatDateTime } from "@/lib/formatting";
import { ColumnDef } from "@tanstack/react-table";
import { AuditLog } from "@/types";

export default function AuditLogsPage() {
  const { logs } = useAuditLogs();

  const columns: ColumnDef<AuditLog>[] = [
    {
      accessorKey: "timestamp",
      header: "Waktu Aktivitas",
      cell: ({ row }) => (
        <span className="font-mono text-xs text-slate-600">
          {formatDateTime(row.original.timestamp)}
        </span>
      ),
    },
    {
      accessorKey: "userName",
      header: "Pengguna / User",
      cell: ({ row }) => (
        <div>
          <p className="font-bold text-xs text-slate-800 dark:text-slate-200">
            {row.original.userName}
          </p>
          <p className="text-[11px] text-slate-400">{row.original.role}</p>
        </div>
      ),
    },
    {
      accessorKey: "action",
      header: "Aksi",
      cell: ({ row }) => {
        const act = row.original.action;
        const variant =
          act === "CREATE"
            ? "success"
            : act === "UPDATE"
            ? "info"
            : act === "DELETE"
            ? "danger"
            : "neutral";
        return <Badge variant={variant} size="sm">{act}</Badge>;
      },
    },
    {
      accessorKey: "module",
      header: "Modul Sistem",
      cell: ({ row }) => (
        <span className="font-semibold text-xs text-teal-700 dark:text-teal-400">
          {row.original.module}
        </span>
      ),
    },
    {
      accessorKey: "recordId",
      header: "ID Record Terkait",
      cell: ({ row }) => (
        <span className="font-mono text-xs font-semibold text-slate-700 dark:text-slate-300">
          {row.original.recordId}
        </span>
      ),
    },
    {
      accessorKey: "details",
      header: "Keterangan Audit Trail",
      cell: ({ row }) => (
        <p className="text-xs text-slate-600 dark:text-slate-400 max-w-sm">
          {row.original.details}
        </p>
      ),
    },
    {
      id: "device",
      header: "IP & Perangkat",
      cell: ({ row }) => (
        <div className="font-mono text-[11px] text-slate-400">
          <p>{row.original.ipAddress}</p>
          <p className="text-[10px] text-slate-500 truncate max-w-[120px]">{row.original.device}</p>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Audit Log & Jejak Aktivitas Keamanan"
        description="Rekaman audit kepatuhan keamanan data medis: pencatatan aksi pembuatan, pembaruan, dan penghapusan rekam medis sesuai standar kepatuhan HIPAA / Permenkes."
      />

      <DataTable
        columns={columns}
        data={logs}
        searchPlaceholder="Cari nama pengguna, aksi, atau ID record..."
        emptyTitle="Tidak ada log audit"
        emptyDescription="Aktivitas pengguna akan dicatat secara otomatis di sini."
      />
    </div>
  );
}