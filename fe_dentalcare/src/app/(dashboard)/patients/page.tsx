"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ColumnDef } from "@tanstack/react-table";
import {
  UserPlus,
  Eye,
  Edit,
  Calendar,
  Trash2,
  MoreHorizontal,
  Stethoscope,
  Filter,
  ListOrdered,
  CheckCircle2,
  MessageSquare,
  Bell,
  Sparkles,
  Phone,
  Radio,
} from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { DataTable } from "@/components/shared/data-table";
import { PatientAvatar } from "@/components/shared/patient-avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import {
  WhatsAppReminderModal,
  isHMinusOne,
  formatWhatsAppPhone,
} from "@/components/dental/whatsapp-reminder-modal";
import { WhatsAppGatewayDialog } from "@/components/dental/whatsapp-gateway-dialog";
import { ControlScheduleModal } from "@/components/dental/control-schedule-modal";
import { usePatients, useQueue } from "@/hooks";
import { Patient } from "@/types";
import { formatAge, formatDate, maskNik } from "@/lib/formatting";
import { ClinicalWorkflowStepper } from "@/components/dental/clinical-workflow-stepper";
import { toast } from "sonner";

export default function PatientsPage() {
  const router = useRouter();
  const { data, loading, query, setQuery, deletePatient, refetch } = usePatients({
    page: 1,
    perPage: 10,
  });
  const { enqueue } = useQueue();

  const [selectedPatientToDelete, setSelectedPatientToDelete] = React.useState<Patient | null>(null);
  const [isDeleting, setIsDeleting] = React.useState(false);

  // Checkbox selection state
  const [selectedPatientIds, setSelectedPatientIds] = React.useState<string[]>([]);

  // WhatsApp Reminder Modal State
  const [isWhatsAppModalOpen, setIsWhatsAppModalOpen] = React.useState(false);
  const [whatsAppModalPatients, setWhatsAppModalPatients] = React.useState<Patient[]>([]);

  // Control Schedule Modal State
  const [isControlModalOpen, setIsControlModalOpen] = React.useState(false);
  const [selectedPatientForControl, setSelectedPatientForControl] = React.useState<Patient | null>(null);

  const handleOpenControlModal = (p: Patient) => {
    setSelectedPatientForControl(p);
    setIsControlModalOpen(true);
  };

  // Filter H-1 control date toggle
  const [filterControlH1Only, setFilterControlH1Only] = React.useState(false);

  // WPPConnect Gateway Dialog State
  const [isGatewayDialogOpen, setIsGatewayDialogOpen] = React.useState(false);

  // Safely extract patient list regardless of API response wrapper format
  const patientList: Patient[] = React.useMemo(() => {
    if (!data) return [];
    if (Array.isArray(data)) return data;
    if (Array.isArray(data.data)) return data.data;
    return [];
  }, [data]);

  // Filtered patients for display (e.g. if H-1 filter toggle is active)
  const displayedPatients = React.useMemo(() => {
    if (filterControlH1Only) {
      return patientList.filter((p) => isHMinusOne(p.nextControlDate));
    }
    return patientList;
  }, [patientList, filterControlH1Only]);

  const h1TotalCount = React.useMemo(() => {
    return patientList.filter((p) => isHMinusOne(p.nextControlDate)).length;
  }, [patientList]);

  const selectedH1Count = React.useMemo(() => {
    return patientList.filter(
      (p) => selectedPatientIds.includes(p.id) && isHMinusOne(p.nextControlDate)
    ).length;
  }, [patientList, selectedPatientIds]);

  const handleToggleSelectAll = () => {
    if (selectedPatientIds.length === displayedPatients.length) {
      setSelectedPatientIds([]);
    } else {
      setSelectedPatientIds(displayedPatients.map((p) => p.id));
    }
  };

  const handleToggleSelectPatient = (id: string) => {
    setSelectedPatientIds((prev) =>
      prev.includes(id) ? prev.filter((pId) => pId !== id) : [...prev, id]
    );
  };

  const handleTriggerWhatsAppReminder = () => {
    // If no patient selected, take all displayed patients as target pool
    const targetPool =
      selectedPatientIds.length > 0
        ? patientList.filter((p) => selectedPatientIds.includes(p.id))
        : displayedPatients;

    // Filter strictly for patients whose nextControlDate is H-1 (tomorrow)
    const qualifyingH1Patients = targetPool.filter((p) => isHMinusOne(p.nextControlDate));

    if (qualifyingH1Patients.length === 0) {
      const tomorrowFormatted = (() => {
        const d = new Date();
        d.setDate(d.getDate() + 1);
        return formatDate(d.toISOString().split("T")[0]);
      })();

      toast.info(
        `Tidak ada pasien dengan jadwal kontrol H-1 (besok: ${tomorrowFormatted}) di antara ${targetPool.length} pasien yang dipilih. Notifikasi WA hanya diproses khusus untuk pasien jadwal kontrol H-1.`,
        {
          duration: 6000,
          action: {
            label: "Tampilkan Pasien H-1",
            onClick: () => {
              setFilterControlH1Only(true);
              const h1s = patientList.filter((p) => isHMinusOne(p.nextControlDate));
              setSelectedPatientIds(h1s.map((p) => p.id));
            },
          },
        }
      );
      return;
    }

    setWhatsAppModalPatients(qualifyingH1Patients);
    setIsWhatsAppModalOpen(true);
  };

  const handleDirectWhatsApp = (patient: Patient) => {
    setWhatsAppModalPatients([patient]);
    setIsWhatsAppModalOpen(true);
  };

  const meta = data?.meta || {
    page: query.page || 1,
    perPage: query.perPage || 10,
    total: patientList.length,
    totalPages: Math.max(1, Math.ceil(patientList.length / (query.perPage || 10))),
  };

  const handleEnqueuePatient = async (p: Patient) => {
    try {
      const q = await enqueue({
        patientId: p.id,
        patientName: p.name,
      });
      toast.success(`Pasien ${p.name} berhasil didaftarkan ke Antrean (Nomor ${q.queueNumber})!`, {
        action: {
          label: "Buka Antrean",
          onClick: () => router.push("/queue"),
        },
      });
    } catch {
      toast.error("Gagal mendaftarkan pasien ke antrean.");
    }
  };

  const handleDelete = async () => {
    if (!selectedPatientToDelete) return;
    setIsDeleting(true);
    try {
      await deletePatient(selectedPatientToDelete.id);
      toast.success(`Data pasien ${selectedPatientToDelete.name} berhasil dihapus.`);
    } catch {
      toast.error("Gagal menghapus pasien.");
    } finally {
      setIsDeleting(false);
      setSelectedPatientToDelete(null);
    }
  };

  const columns: ColumnDef<Patient>[] = React.useMemo(
    () => [
      {
        id: "select",
        header: () => (
          <div className="flex items-center justify-center px-1">
            <input
              type="checkbox"
              checked={
                displayedPatients.length > 0 &&
                selectedPatientIds.length === displayedPatients.length
              }
              ref={(input) => {
                if (input) {
                  input.indeterminate =
                    selectedPatientIds.length > 0 &&
                    selectedPatientIds.length < displayedPatients.length;
                }
              }}
              onChange={handleToggleSelectAll}
              className="h-4 w-4 rounded border-slate-300 text-teal-600 focus:ring-teal-500 cursor-pointer accent-teal-600"
              title="Pilih Semua Pasien"
              aria-label="Pilih Semua Pasien"
            />
          </div>
        ),
        cell: ({ row }) => {
          const isSelected = selectedPatientIds.includes(row.original.id);
          const isH1 = isHMinusOne(row.original.nextControlDate);
          return (
            <div className="flex items-center justify-center px-1">
              <input
                type="checkbox"
                checked={isSelected}
                onChange={() => handleToggleSelectPatient(row.original.id)}
                className={`h-4 w-4 rounded border-slate-300 text-teal-600 focus:ring-teal-500 cursor-pointer accent-teal-600 ${
                  isH1 ? "ring-2 ring-emerald-500 ring-offset-1" : ""
                }`}
                title={
                  isH1
                    ? "Pasien jadwal kontrol H-1 (besok)"
                    : `Pilih ${row.original.name}`
                }
                aria-label={`Pilih ${row.original.name}`}
              />
            </div>
          );
        },
      },
      {
        accessorKey: "medicalRecordNumber",
        header: "No. RM",
        cell: ({ row }) => (
          <Link
            href={`/patients/${row.original.id}`}
            className="font-mono text-xs font-semibold text-teal-700 hover:underline dark:text-teal-400"
          >
            {row.original.medicalRecordNumber}
          </Link>
        ),
      },
      {
        accessorKey: "name",
        header: "Nama Pasien",
        cell: ({ row }) => {
          const p = row.original;
          return (
            <div className="flex items-center gap-3">
              <PatientAvatar name={p.name} gender={p.gender} size="sm" />
              <div>
                <Link
                  href={`/patients/${p.id}`}
                  className="font-semibold text-slate-900 hover:text-teal-600 dark:text-slate-100 transition-colors"
                >
                  {p.name}
                </Link>
                <p className="text-[11px] text-slate-400">
                  NIK: {maskNik(p.nik)}
                </p>
              </div>
            </div>
          );
        },
      },
      {
        id: "demographics",
        header: "Gender / Umur",
        cell: ({ row }) => (
          <div className="text-xs">
            <p className="font-medium capitalize text-slate-700 dark:text-slate-300">
              {row.original.gender === "male" ? "Laki-laki" : "Perempuan"}
            </p>
            <p className="text-[11px] text-slate-400">{formatAge(row.original.birthDate)}</p>
          </div>
        ),
      },
      {
        accessorKey: "phone",
        header: "No. Telepon",
        cell: ({ row }) => (
          <span className="font-mono text-xs text-slate-600 dark:text-slate-400">
            {row.original.phone || "-"}
          </span>
        ),
      },
      {
        id: "nextControl",
        header: "Jadwal Kontrol",
        cell: ({ row }) => {
          const p = row.original;
          const dateStr = p.nextControlDate;
          const isH1 = isHMinusOne(dateStr);

          if (!dateStr) {
            return (
              <Button
                variant="ghost"
                size="sm"
                className="h-6 text-[11px] px-2 text-teal-700 bg-teal-50/70 hover:bg-teal-100 hover:text-teal-800 gap-1 border border-teal-200 dark:border-teal-800 dark:bg-teal-950/40 dark:text-teal-300 rounded-lg font-medium shadow-2xs"
                onClick={() => handleOpenControlModal(p)}
                title="Tentukan Tanggal Kontrol Pasien"
              >
                <Calendar className="h-3 w-3 text-teal-600" />
                <span>+ Atur Kontrol</span>
              </Button>
            );
          }

          return (
            <div className="flex items-center gap-1.5 group">
              <div className="flex flex-col gap-0.5">
                {isH1 ? (
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-300 dark:bg-emerald-950/60 dark:border-emerald-700 dark:text-emerald-300 px-2 py-0.5 rounded-full w-fit animate-pulse shadow-2xs">
                    <Bell className="h-3 w-3 text-emerald-600 dark:text-emerald-400" />
                    Besok (H-1)
                  </span>
                ) : (
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    {formatDate(dateStr)}
                  </span>
                )}
                {p.controlDoctor && (
                  <span
                    className="text-[10px] text-slate-500 dark:text-slate-400 truncate max-w-[130px]"
                    title={p.controlDoctor}
                  >
                    drg. {p.controlDoctor.replace(/^drg\.?\s*/i, "")}
                  </span>
                )}
              </div>
              <button
                type="button"
                onClick={() => handleOpenControlModal(p)}
                className="p-1 rounded-md text-slate-400 hover:text-teal-700 hover:bg-teal-50 dark:hover:bg-slate-800 transition-colors opacity-70 group-hover:opacity-100"
                title="Ubah / Jadwalkan Ulang Kontrol"
              >
                <Calendar className="h-3.5 w-3.5" />
              </button>
            </div>
          );
        },
      },

      {
        id: "insurance",
        header: "Penjamin",
        cell: ({ row }) => {
          const ins = row.original.insurance;
          return (
            <span className="inline-flex items-center gap-1 text-xs font-medium text-slate-700 dark:text-slate-300">
              <span className="uppercase font-semibold text-teal-700 dark:text-teal-400">
                {ins.type}
              </span>
              {ins.providerName && (
                <span className="text-[10px] text-slate-400">({ins.providerName})</span>
              )}
            </span>
          );
        },
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => {
          const st = row.original.status;
          const variant = st === "active" ? "success" : st === "inpatient" ? "info" : "neutral";
          const label = st === "active" ? "Aktif" : st === "inpatient" ? "Rawat Inap" : "Non-Aktif";
          return <Badge variant={variant} size="sm">{label}</Badge>;
        },
      },
      {
        id: "actions",
        header: "Aksi",
        cell: ({ row }) => {
          const p = row.original;
          const isH1 = isHMinusOne(p.nextControlDate);

          return (
            <div className="flex items-center gap-1.5">
              {/* WhatsApp Direct Click-to-Chat Button */}
              <Button
                size="sm"
                variant="outline"
                className={`h-7 px-2 text-[11px] gap-1 ${
                  isH1
                    ? "text-emerald-700 border-emerald-400 bg-emerald-50/70 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:border-emerald-700 dark:text-emerald-300"
                    : "text-slate-600 border-slate-300 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-400"
                }`}
                title={
                  isH1
                    ? `Kirim Notifikasi WA Kontrol H-1 ke ${p.name}`
                    : `Buka Chat WhatsApp ke ${p.name}`
                }
                onClick={() => handleDirectWhatsApp(p)}
              >
                <MessageSquare className="h-3 w-3 text-emerald-600 dark:text-emerald-400" />
                <span className="font-semibold">WA</span>
                {isH1 && (
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-ping" />
                )}
              </Button>

              {/* Quick Set / Edit Control Schedule Button */}
              <Button
                size="sm"
                variant="outline"
                className="h-7 px-2 text-[11px] gap-1 text-slate-700 border-slate-300 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300"
                title="Atur / Ubah Jadwal Kontrol Pasien"
                onClick={() => handleOpenControlModal(p)}
              >
                <Calendar className="h-3 w-3 text-teal-600" />
                <span className="hidden xl:inline">Kontrol</span>
              </Button>

              <Button
                size="sm"
                variant="outline"
                className="h-7 px-2 text-[11px] gap-1 text-teal-700 border-teal-300 hover:bg-teal-50 dark:border-teal-800 dark:text-teal-300"
                title="Daftarkan Pasien ke Antrean Hari Ini"
                onClick={() => handleEnqueuePatient(p)}
              >
                <ListOrdered className="h-3 w-3" />
                <span>+ Antrean</span>
              </Button>
              <Link href={`/patients/${p.id}`}>
                <Button variant="ghost" size="icon" className="h-7 w-7 text-slate-500 hover:text-teal-600" title="Lihat Detail Pasien">
                  <Eye className="h-3.5 w-3.5" />
                </Button>
              </Link>
              <Link href={`/patients/${p.id}/edit`}>
                <Button variant="ghost" size="icon" className="h-7 w-7 text-slate-500 hover:text-blue-600" title="Edit Pasien">
                  <Edit className="h-3.5 w-3.5" />
                </Button>
              </Link>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-slate-500 hover:text-rose-600"
                title="Hapus Pasien"
                onClick={() => setSelectedPatientToDelete(p)}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          );
        },
      },
    ],
    [displayedPatients, selectedPatientIds]
  );

  return (
    <div className="space-y-6">
      <ClinicalWorkflowStepper />
      <PageHeader
        title="Pendaftaran & Data Pasien Gigi"
        description="Kelola seluruh data pasien klinik gigi, rekam medis nomor (RM), riwayat sistemik, dan daftarkan langsung ke antrean dental chair."
      >
        <div className="flex items-center gap-2">
          {/* WPPConnect Gateway Config Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsGatewayDialogOpen(true)}
            className="gap-1.5 text-xs font-semibold border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 h-9"
            title="Kelola Koneksi WPPConnect Gateway (Scan QR Code WhatsApp Klinik)"
          >
            <Radio className="h-3.5 w-3.5 text-emerald-600 animate-pulse" />
            <span className="hidden sm:inline">Koneksi WA Gateway</span>
          </Button>

          {/* WhatsApp Reminder Click-to-Chat Button */}
          <Button
            onClick={handleTriggerWhatsAppReminder}
            className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs text-xs font-semibold h-9"
            title="Kirim notifikasi pengingat WhatsApp Web untuk pasien jadwal kontrol H-1"
          >
            <MessageSquare className="h-4 w-4" />
            <span>Notif WA Kontrol (H-1)</span>
            {h1TotalCount > 0 && (
              <span className="ml-1 rounded-full bg-white/25 px-1.5 py-0.2 text-[10px] font-bold text-white">
                {h1TotalCount}
              </span>
            )}
          </Button>

          <Link href="/patients/new">
            <Button className="gap-2 shadow-xs text-xs">
              <UserPlus className="h-4 w-4" />
              <span>Tambah Pasien Baru</span>
            </Button>
          </Link>
        </div>
      </PageHeader>

      {/* Selected Patients Floating Action Banner */}
      {selectedPatientIds.length > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-emerald-200 bg-emerald-50/80 p-3.5 px-5 text-xs dark:border-emerald-800 dark:bg-emerald-950/40 shadow-xs animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex items-center gap-2.5 text-emerald-900 dark:text-emerald-200">
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-600 text-white text-[11px] font-bold shadow-2xs">
              {selectedPatientIds.length}
            </span>
            <span className="font-bold">
              {selectedPatientIds.length} pasien dipilih
            </span>
            <span className="text-slate-400">|</span>
            <span className="text-slate-700 dark:text-slate-300">
              {selectedH1Count > 0 ? (
                <span>
                  Terdapat{" "}
                  <strong className="text-emerald-700 dark:text-emerald-300 font-bold">
                    {selectedH1Count} pasien
                  </strong>{" "}
                  dengan jadwal kontrol H-1 besok.
                </span>
              ) : (
                <span className="text-slate-500 italic">
                  Belum ada pasien yang jadwal kontrolnya H-1 di antara pilihan ini.
                </span>
              )}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Button
              size="sm"
              onClick={handleTriggerWhatsAppReminder}
              className="gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs h-8 font-semibold shadow-xs"
            >
              <MessageSquare className="h-3.5 w-3.5" />
              <span>
                Kirim Notif WA ({selectedH1Count > 0 ? `${selectedH1Count} Pasien H-1` : "H-1 Saja"})
              </span>
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setSelectedPatientIds([])}
              className="text-xs h-8 text-slate-600 border-slate-300 hover:bg-slate-100 dark:text-slate-400 dark:border-slate-700"
            >
              Batal Pilih
            </Button>
          </div>
        </div>
      )}

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-slate-200 bg-white p-3 text-xs dark:border-slate-800 dark:bg-slate-900">
        <span className="font-semibold text-slate-500 flex items-center gap-1.5 mr-2">
          <Filter className="h-3.5 w-3.5" />
          Filter:
        </span>

        {/* Toggle H-1 Control Filter Quick Button */}
        <button
          type="button"
          onClick={() => {
            const next = !filterControlH1Only;
            setFilterControlH1Only(next);
            setQuery((prev) => ({
              ...prev,
              h1Control: next ? true : undefined,
              page: 1,
            }));
          }}
          className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-semibold transition-all ${
            filterControlH1Only
              ? "border-emerald-500 bg-emerald-100 text-emerald-800 dark:border-emerald-600 dark:bg-emerald-950 dark:text-emerald-200 shadow-xs"
              : "border-emerald-200 bg-emerald-50/70 text-emerald-700 hover:bg-emerald-100 dark:border-emerald-900 dark:bg-emerald-950/30 dark:text-emerald-300"
          }`}
          title="Tampilkan hanya pasien yang jadwal kontrolnya besok (H-1)"
        >
          <Bell className="h-3.5 w-3.5 text-emerald-600" />
          <span>Pasien Kontrol H-1 (Besok)</span>
          <span className="rounded-full bg-emerald-600 px-1.5 py-0.2 text-[10px] text-white font-bold">
            {h1TotalCount}
          </span>
        </button>

        {/* Gender Filter */}
        <select
          value={query.gender || ""}
          onChange={(e) =>
            setQuery((prev) => ({
              ...prev,
              gender: e.target.value ? (e.target.value as any) : undefined,
              page: 1,
            }))
          }
          className="rounded-xl border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs text-slate-700 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-300"
        >
          <option value="">Semua Gender</option>
          <option value="male">Laki-laki</option>
          <option value="female">Perempuan</option>
        </select>


        {(query.gender || query.insuranceType || query.search || filterControlH1Only) && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setFilterControlH1Only(false);
              setQuery({ page: 1, perPage: query.perPage || 10 });
            }}
            className="h-7 text-xs text-rose-600 hover:bg-rose-50"
          >
            Reset Filter
          </Button>
        )}
      </div>

      {/* Main Table with Server-side Pagination */}
      <DataTable
        columns={columns}
        data={displayedPatients}
        searchValue={query.search || ""}
        onSearchChange={(val) =>
          setQuery((prev) => ({
            ...prev,
            search: val ? val : undefined,
            page: 1,
          }))
        }
        searchPlaceholder="Cari nama pasien, No RM, NIK, atau no telepon..."
        emptyTitle="Pasien tidak ditemukan"
        emptyDescription={
          filterControlH1Only
            ? "Tidak ada pasien yang memiliki jadwal kontrol H-1 (besok)."
            : "Coba ubah kata kunci pencarian atau tambah pasien baru."
        }
        isLoading={loading}
        manualPagination={!filterControlH1Only}
        currentPage={meta.page}
        pageSize={meta.perPage}
        pageCount={meta.totalPages}
        totalItems={filterControlH1Only ? displayedPatients.length : meta.total}
        onPageChange={(newPage) => setQuery((prev) => ({ ...prev, page: newPage }))}
        onPageSizeChange={(newSize) => setQuery((prev) => ({ ...prev, perPage: newSize, page: 1 }))}
        emptyAction={
          filterControlH1Only ? (
            <Button
              size="sm"
              variant="outline"
              onClick={() => setFilterControlH1Only(false)}
              className="text-xs"
            >
              Tampilkan Semua Pasien
            </Button>
          ) : (
            <Link href="/patients/new">
              <Button size="sm" className="gap-1 text-xs">
                <UserPlus className="h-3.5 w-3.5" />
                <span>Tambah Pasien</span>
              </Button>
            </Link>
          )
        }
      />

      {/* WhatsApp Reminder Modal */}
      <WhatsAppReminderModal
        open={isWhatsAppModalOpen}
        onOpenChange={setIsWhatsAppModalOpen}
        patients={whatsAppModalPatients}
      />

      {/* WPPConnect Gateway QR Dialog */}
      <WhatsAppGatewayDialog
        open={isGatewayDialogOpen}
        onOpenChange={setIsGatewayDialogOpen}
      />

      {/* Control Schedule Modal */}
      <ControlScheduleModal
        open={isControlModalOpen}
        onOpenChange={setIsControlModalOpen}
        patient={selectedPatientForControl}
        onSuccess={() => {
          refetch();
          if (typeof window !== "undefined") {
            window.dispatchEvent(new CustomEvent("refresh-notifications"));
          }
        }}
      />

      {/* Confirm Delete Dialog */}
      <ConfirmDialog
        open={!!selectedPatientToDelete}
        onOpenChange={(open) => !open && setSelectedPatientToDelete(null)}
        title="Hapus Data Pasien?"
        description={`Apakah Anda yakin ingin menghapus data pasien ${selectedPatientToDelete?.name} (${selectedPatientToDelete?.medicalRecordNumber})? Tindakan ini tidak dapat dibatalkan.`}
        confirmText="Ya, Hapus"
        cancelText="Batal"
        variant="danger"
        isLoading={isDeleting}
        onConfirm={handleDelete}
      />
    </div>
  );
}

