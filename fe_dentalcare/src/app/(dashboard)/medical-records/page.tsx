"use client";

import * as React from "react";
import Link from "next/link";
import {
  FileText,
  Stethoscope,
  Search,
  Eye,
  Calendar,
  User,
  Activity,
  Pill,
  Sparkles,
  ClipboardList,
  CheckCircle2,
  Clock,
  ArrowRight,
  History,
  TrendingUp,
  Layers,
  ChevronRight,
} from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { DataTable } from "@/components/shared/data-table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useEncounters } from "@/hooks";
import { Encounter } from "@/types";
import { formatDate } from "@/lib/formatting";
import { ColumnDef } from "@tanstack/react-table";
import { PatientExaminationHistoryModal } from "@/components/dental/patient-examination-history-modal";

export interface PatientHistoryGroup {
  patientId: string;
  patientName: string;
  patientMrn: string;
  patientGender?: string;
  totalVisits: number;
  latestVisitDate: string;
  latestDoctor: string;
  latestDepartment: string;
  latestDiagnosis: string;
  latestChiefComplaint: string;
  latestEncounterId: string;
  allEncounters: Encounter[];
}

export default function PatientExaminationHistoryPage() {
  const { encounters, refetch } = useEncounters();

  // State for Patient Examination History Modal (listing all visits of that patient)
  const [selectedPatientForHistory, setSelectedPatientForHistory] = React.useState<{
    id: string;
    name: string;
    mrn: string;
  } | null>(null);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = React.useState(false);

  React.useEffect(() => {
    const handleEncounterCreated = () => {
      refetch();
    };
    window.addEventListener("encounter-created", handleEncounterCreated);
    return () => {
      window.removeEventListener("encounter-created", handleEncounterCreated);
    };
  }, [refetch]);

  // Group encounters by unique patient
  const groupedPatients = React.useMemo<PatientHistoryGroup[]>(() => {
    const map = new Map<string, PatientHistoryGroup>();

    // Sort all encounters chronologically descending (newest visit first)
    const sorted = [...encounters].sort((a, b) => {
      const timeA = new Date(a.visitDate || a.createdAt || 0).getTime();
      const timeB = new Date(b.visitDate || b.createdAt || 0).getTime();
      return timeB - timeA;
    });

    for (const enc of sorted) {
      const key = enc.patientId || enc.patientName;
      if (!map.has(key)) {
        map.set(key, {
          patientId: enc.patientId,
          patientName: enc.patientName,
          patientMrn: enc.patientMrn,
          patientGender: enc.patientGender,
          totalVisits: 1,
          latestVisitDate: enc.visitDate || enc.createdAt?.split("T")[0] || "-",
          latestDoctor: enc.doctorName || "drg. Jihan, S.Kep",
          latestDepartment: enc.departmentName || "Poli Gigi Umum",
          latestDiagnosis: enc.diagnoses?.[0]?.name
            ? `[${enc.diagnoses[0].code}] ${enc.diagnoses[0].name}`
            : enc.diagnoses?.[0]?.code || "-",
          latestChiefComplaint: enc.anamnesis?.chiefComplaint || "-",
          latestEncounterId: enc.id,
          allEncounters: [enc],
        });
      } else {
        const item = map.get(key)!;
        item.totalVisits += 1;
        item.allEncounters.push(enc);
      }
    }

    return Array.from(map.values());
  }, [encounters]);

  const handleOpenPatientHistory = (group: PatientHistoryGroup) => {
    setSelectedPatientForHistory({
      id: group.patientId,
      name: group.patientName,
      mrn: group.patientMrn,
    });
    setIsHistoryModalOpen(true);
  };

  // Stats calculation
  const totalVisitsCount = encounters.length;
  const uniquePatientsCount = groupedPatients.length;
  const multiVisitCount = groupedPatients.filter((p) => p.totalVisits > 1).length;
  const totalProcedures = encounters.reduce((acc, e) => acc + (e.procedures?.length || 0), 0);

  const columns: ColumnDef<PatientHistoryGroup>[] = [
    {
      accessorKey: "patientName",
      header: "Pasien Gigi & Nomor RM",
      cell: ({ row }) => (
        <div className="space-y-1">
          <Link
            href={`/patients/${row.original.patientId}`}
            className="font-bold text-slate-900 hover:text-teal-600 dark:text-slate-100 text-xs transition-colors"
          >
            {row.original.patientName}
          </Link>
          <div className="flex items-center gap-1.5 text-[11px] font-mono text-slate-400">
            <span>{row.original.patientMrn}</span>
            <span>•</span>
            <span className="text-[10px] uppercase font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/60 px-1 rounded">
              UMUM
            </span>
            {row.original.patientGender && (
              <>
                <span>•</span>
                <span className="text-[10px] text-slate-500 capitalize">
                  {row.original.patientGender === "male" ? "L" : "P"}
                </span>
              </>
            )}
          </div>
        </div>
      ),
    },
    {
      accessorKey: "totalVisits",
      header: "Total Riwayat Pemeriksaan",
      cell: ({ row }) => {
        const count = row.original.totalVisits;
        const isMulti = count >= 3;
        return (
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-1.5">
              <Badge
                variant={isMulti ? "success" : "outline"}
                className={`font-bold text-xs gap-1 py-0.5 px-2.5 ${
                  isMulti
                    ? "bg-teal-100 text-teal-800 border-teal-300 dark:bg-teal-950/80 dark:text-teal-300 shadow-xs"
                    : count > 1
                    ? "border-teal-200 text-teal-700 bg-teal-50/50 dark:text-teal-300"
                    : "text-slate-600 border-slate-200 dark:border-slate-800"
                }`}
              >
                <History className="h-3 w-3" />
                <span>{count}x Pemeriksaan</span>
              </Badge>
            </div>
            <p className="text-[10px] text-slate-400">
              {count > 1 ? "Pasien Kontrol Berkala" : "Kunjungan Perdana"}
            </p>
          </div>
        );
      },
    },
    {
      accessorKey: "latestVisitDate",
      header: "Pemeriksaan Terakhir",
      cell: ({ row }) => (
        <div>
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-800 dark:text-slate-200">
            <Calendar className="h-3.5 w-3.5 text-teal-600" />
            <span>{formatDate(row.original.latestVisitDate)}</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-0.5">{row.original.latestDepartment}</p>
        </div>
      ),
    },
    {
      accessorKey: "latestDoctor",
      header: "Dokter Pemeriksa Terakhir",
      cell: ({ row }) => (
        <div>
          <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
            {row.original.latestDoctor}
          </span>
          <p className="text-[11px] text-slate-500">DPJP Poli Gigi</p>
        </div>
      ),
    },
    {
      id: "diagnosisComplaint",
      header: "Keluhan & Diagnosa Terakhir",
      cell: ({ row }) => (
        <div className="text-xs max-w-xs space-y-0.5">
          <p className="font-medium text-slate-800 dark:text-slate-200 truncate">
            {row.original.latestDiagnosis}
          </p>
          <p className="text-[11px] text-slate-500 line-clamp-1 italic">
            "{row.original.latestChiefComplaint}"
          </p>
        </div>
      ),
    },
    {
      id: "actions",
      header: "Aksi",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleOpenPatientHistory(row.original)}
            className="h-8 text-xs gap-1.5 font-semibold border-teal-300 text-teal-700 bg-teal-50/70 hover:bg-teal-100 hover:text-teal-800 dark:border-teal-800 dark:bg-teal-950/40 dark:text-teal-300 dark:hover:bg-teal-900/50 shadow-xs cursor-pointer"
            title="Klik untuk membuka rincian lengkap seluruh sesi riwayat pemeriksaan pasien ini"
          >
            <Eye className="h-3.5 w-3.5" />
            <span>Detail Riwayat ({row.original.totalVisits}x)</span>
          </Button>

          <Link
            href={`/encounters/new/?encounterId=${row.original.latestEncounterId || ""}&patientId=${row.original.patientId}`}
          >
            <Button
              size="sm"
              className="h-8 text-xs bg-slate-800 hover:bg-slate-900 text-white dark:bg-slate-700 dark:hover:bg-slate-600 cursor-pointer"
              title="Buka ruang pemeriksaan rekam medis terakhir"
            >
              <span>Buka EMR</span>
            </Button>
          </Link>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Riwayat Pemeriksaan Pasien"
        description="Pusat rekap riwayat pemeriksaan gigi per nama pasien. Klik tombol detail pada pasien untuk melihat rincian kronologis seluruh sesi konsultasi, odontogram, tindakan klinis, dan resep obat."
      >
        <Link href="/encounters/new/?backdate=true">
          <Button
            className="h-9 text-xs bg-teal-600 hover:bg-teal-700 text-white font-semibold gap-1.5 shadow-xs cursor-pointer"
          >
            <Clock className="h-4 w-4 text-teal-100" />
            <span>+ Input Pemeriksaan Manual (Backdate)</span>
          </Button>
        </Link>
      </PageHeader>

      {/* Stats KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card className="rounded-2xl border-slate-200/80 bg-white dark:bg-slate-900 shadow-xs">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                Pasien Terdaftar
              </p>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
                {uniquePatientsCount}
              </h3>
              <p className="text-[10px] text-teal-600 font-medium mt-0.5">Pasien Gigi Unik</p>
            </div>
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-teal-50 text-teal-600 dark:bg-teal-950 dark:text-teal-400">
              <User className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-slate-200/80 bg-white dark:bg-slate-900 shadow-xs">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                Total Sesi Pemeriksaan
              </p>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
                {totalVisitsCount}
              </h3>
              <p className="text-[10px] text-blue-600 font-medium mt-0.5">Seluruh Kunjungan Dental</p>
            </div>
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400">
              <ClipboardList className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-slate-200/80 bg-white dark:bg-slate-900 shadow-xs">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                Pasien Kontrol Berkala
              </p>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
                {multiVisitCount}
              </h3>
              <p className="text-[10px] text-purple-600 font-medium mt-0.5">Kunjungan Lebih Dari 1x</p>
            </div>
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-purple-50 text-purple-600 dark:bg-purple-950 dark:text-purple-400">
              <History className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-slate-200/80 bg-white dark:bg-slate-900 shadow-xs">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                Tindakan Medis Gigi
              </p>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
                {totalProcedures}
              </h3>
              <p className="text-[10px] text-emerald-600 font-medium mt-0.5">Tindakan Klinis Dilakukan</p>
            </div>
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400">
              <Stethoscope className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Datatable Grouped by Patient */}
      <DataTable
        columns={columns}
        data={groupedPatients}
        searchPlaceholder="Cari riwayat pemeriksaan berdasarkan nama pasien, nomor RM, dokter, atau diagnosa..."
        emptyTitle="Tidak ada riwayat pemeriksaan"
        emptyDescription="Sesi konsultasi dokter gigi dan odontogram yang dilakukan akan tersimpan di sini."
      />

      {/* Patient Examination History Modal (Comprehensive Breakdown of all visits) */}
      {selectedPatientForHistory && (
        <PatientExaminationHistoryModal
          open={isHistoryModalOpen}
          onOpenChange={setIsHistoryModalOpen}
          patientId={selectedPatientForHistory.id}
          patientName={selectedPatientForHistory.name}
          patientMrn={selectedPatientForHistory.mrn}
        />
      )}
    </div>
  );
}
