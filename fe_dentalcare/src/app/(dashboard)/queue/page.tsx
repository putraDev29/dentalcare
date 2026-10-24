"use client";

import * as React from "react";
import Link from "next/link";
import {
  ListOrdered,
  Volume2,
  Play,
  SkipForward,
  CheckCircle2,
  Clock,
  Filter,
  ArrowUpDown,
  LayoutGrid,
  List,
  AlertCircle,
  Stethoscope,
  Plus,
  UserPlus,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/shared/stat-card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/shared/status-badge";
import { Dialog } from "@/components/ui/dialog";
import { useQueue, usePatients } from "@/hooks";
import { QueueItem } from "@/types";
import { formatTime } from "@/lib/formatting";
import { ClinicalWorkflowStepper } from "@/components/dental/clinical-workflow-stepper";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function QueuePage() {
  const router = useRouter();
  const { queues, updateStatus, callNext, enqueue } = useQueue();
  const { data: patientData } = usePatients({ perPage: 100 });

  const [viewMode, setViewMode] = React.useState<"card" | "table">("card");
  const [filterDept, setFilterDept] = React.useState<string>("");
  const [filterStatus, setFilterStatus] = React.useState<string>("");
  const [sortOrder, setSortOrder] = React.useState<"newest" | "oldest">("newest");

  // Modal Add Queue State
  const [isAddQueueOpen, setIsAddQueueOpen] = React.useState(false);
  const [selectedPatientId, setSelectedPatientId] = React.useState<string>("");
  const [selectedDept, setSelectedDept] = React.useState<string>("Poli Gigi Umum");
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const todayStr = React.useMemo(() => new Date().toISOString().slice(0, 10), []);

  const todayQueues = React.useMemo(() => {
    return queues.filter((q) => {
      const rawCreated = (q as any).createdAt || (q as any).created_at || q.checkInTime;
      if (rawCreated && typeof rawCreated === "string" && (rawCreated.includes("-") || rawCreated.includes("T"))) {
        return rawCreated.slice(0, 10) === todayStr;
      }
      return true;
    });
  }, [queues, todayStr]);

  const total = todayQueues.length;
  const waiting = todayQueues.filter((q) => q.status === "waiting").length;
  const inProgress = todayQueues.filter((q) => q.status === "in_progress" || q.status === "called").length;
  const completed = todayQueues.filter((q) => q.status === "completed").length;
  const skipped = todayQueues.filter((q) => q.status === "skipped").length;

  const handleAction = async (id: string, status: QueueItem["status"], label: string, encounterId?: string, patientId?: string) => {
    try {
      await updateStatus(id, status);
      toast.success(`Antrean diperbarui: ${label}`);
      if (status === "in_progress") {
        const targetPatientId = patientId || "";
        router.push(`/encounters/new/?patientId=${targetPatientId}&queueId=${id}`);
      }
    } catch {
      toast.error("Gagal memperbarui antrean.");
    }
  };

  const handleCallNext = async () => {
    try {
      const next = await callNext();
      if (next) {
        toast.success(`Memanggil nomor antrean ${next.queueNumber} (${next.patientName})`);
      } else {
        toast.info("Tidak ada antrean menunggu berikutnya.");
      }
    } catch {
      toast.error("Gagal memanggil antrean.");
    }
  };

  const handleAddQueue = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPatientId) {
      toast.error("Pilih pasien terlebih dahulu!");
      return;
    }

    const patient = patientData?.data.find((p) => p.id === selectedPatientId);
    setIsSubmitting(true);
    try {
      const q = await enqueue({
        patientId: selectedPatientId,
        patientName: patient?.name,
        departmentId: selectedDept,
      });
      toast.success(`Pasien ${patient?.name || ""} berhasil masuk antrean nomor ${q.queueNumber}!`);
      setIsAddQueueOpen(false);
      setSelectedPatientId("");
    } catch {
      toast.error("Gagal menambahkan antrean.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const [page, setPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(12);

  const filtered = React.useMemo(() => {
    return [...todayQueues]
      .filter((q) => {
        if (filterDept && q.departmentName !== filterDept && q.departmentId !== filterDept) return false;
        if (filterStatus) {
          if (filterStatus === "active") {
            if (q.status !== "waiting" && q.status !== "called" && q.status !== "in_progress") return false;
          } else if (q.status !== filterStatus) {
            return false;
          }
        }
        return true;
      })
      .sort((a, b) => {
        // Extract timestamp or numeric weight for ordering
        const getWeight = (item: QueueItem): number => {
          const rawCreated = (item as any).createdAt || (item as any).created_at;
          if (rawCreated) {
            const t = new Date(rawCreated).getTime();
            if (!isNaN(t) && t > 0) return t;
          }
          if (item.checkInTime) {
            if (item.checkInTime.includes("-") || item.checkInTime.includes("T")) {
              const t = new Date(item.checkInTime).getTime();
              if (!isNaN(t) && t > 0) return t;
            }
            const match = item.checkInTime.match(/^(\d{1,2}):(\d{2})/);
            if (match) {
              const hours = parseInt(match[1], 10);
              const minutes = parseInt(match[2], 10);
              const d = new Date();
              d.setHours(hours, minutes, 0, 0);
              return d.getTime();
            }
          }
          const idNum = parseInt(item.id.replace(/\D/g, "") || "0", 10);
          if (idNum > 1000000000) return idNum;
          const qNum = parseInt(item.queueNumber.replace(/\D/g, "") || "0", 10);
          return qNum;
        };

        const weightA = getWeight(a);
        const weightB = getWeight(b);

        if (sortOrder === "newest") {
          if (weightA !== weightB) return weightB - weightA;
          return b.id.localeCompare(a.id);
        } else {
          if (weightA !== weightB) return weightA - weightB;
          return a.id.localeCompare(b.id);
        }
      });
  }, [queues, filterDept, filterStatus, sortOrder]);

  const totalFiltered = filtered.length;
  const totalPages = Math.max(1, Math.ceil(totalFiltered / pageSize));
  const paginatedQueues = filtered.slice((page - 1) * pageSize, page * pageSize);
  const startRecord = totalFiltered === 0 ? 0 : (page - 1) * pageSize + 1;
  const endRecord = Math.min(page * pageSize, totalFiltered);

  return (
    <div className="space-y-6">
      <ClinicalWorkflowStepper />

      <PageHeader
        title="Antrean Pasien Dental Chair Hari Ini"
      >
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => setIsAddQueueOpen(true)}
            className="gap-1.5 shadow-xs text-xs border-sky-300 text-sky-700 hover:bg-sky-50 font-bold"
          >
            <Plus className="h-4 w-4" />
            <span>+ Tambah Pasien ke Antrean</span>
          </Button>

          <Button
            size="sm"
            onClick={handleCallNext}
            className="gap-1.5 shadow-md shadow-sky-500/25 text-xs bg-gradient-to-r from-sky-500 to-sky-600 hover:from-sky-600 hover:to-sky-700 text-white font-bold"
          >
            <Volume2 className="h-4 w-4" />
            <span>Panggil Antrean Berikutnya</span>
          </Button>
        </div>
      </PageHeader>

      {/* Summary Metrics */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-5 sm:gap-4">
        <StatCard title="Total Antrean" value={total} iconColor="text-sky-600" />
        <StatCard title="Menunggu" value={waiting} iconColor="text-amber-500" />
        <StatCard title="Sedang Dilayani" value={inProgress} iconColor="text-sky-600" />
        <StatCard title="Selesai" value={completed} iconColor="text-emerald-600" />
        <StatCard title="Dilewati" value={skipped} iconColor="text-rose-500" />
      </div>

      {/* Filter & View Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-3 text-xs dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-semibold text-slate-500 flex items-center gap-1">
            <Filter className="h-3.5 w-3.5" /> Filter:
          </span>

          <select
            value={filterDept}
            onChange={(e) => {
              setFilterDept(e.target.value);
              setPage(1);
            }}
            className="rounded-xl border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs text-slate-700 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-300"
          >
            <option value="">Semua Unit Poli Gigi</option>
            <option value="Poli Gigi Umum">Poli Gigi Umum</option>
            <option value="Konservasi Gigi (Endodonti)">Konservasi Gigi (Endodonti)</option>
            <option value="Ortodonti (Kawat Gigi)">Ortodonti (Kawat Gigi)</option>
            <option value="Bedah Mulut">Bedah Mulut</option>
            <option value="Pedodonsia (Gigi Anak)">Pedodonsia (Gigi Anak)</option>
          </select>

          <select
            value={filterStatus}
            onChange={(e) => {
              setFilterStatus(e.target.value);
              setPage(1);
            }}
            className="rounded-xl border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs text-slate-700 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-300"
          >
            <option value="">Semua Status Hari Ini</option>
            <option value="active">Antrean Aktif (Menunggu &amp; Dipanggil)</option>
            <option value="waiting">Menunggu</option>
            <option value="called">Dipanggil</option>
            <option value="in_progress">Sedang Dilayani</option>
            <option value="completed">Selesai</option>
            <option value="skipped">Dilewati</option>
          </select>

          <div className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs text-slate-700 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-300">
            <ArrowUpDown className="h-3.5 w-3.5 text-slate-400" />
            <span className="text-[11px] text-slate-400">Urutan:</span>
            <select
              value={sortOrder}
              onChange={(e) => {
                setSortOrder(e.target.value as "newest" | "oldest");
                setPage(1);
              }}
              className="bg-transparent font-semibold text-xs focus:outline-hidden text-teal-700 dark:text-teal-300 cursor-pointer"
            >
              <option value="newest">Terbaru di Atas (Default)</option>
              <option value="oldest">Terlama di Atas (No. Awal)</option>
            </select>
          </div>

          {(filterDept || filterStatus || sortOrder !== "newest") && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setFilterDept("");
                setFilterStatus("");
                setSortOrder("newest");
                setPage(1);
              }}
              className="h-7 text-xs text-rose-600"
            >
              Reset
            </Button>
          )}
        </div>

        {/* View Toggle */}
        <div className="flex rounded-xl border border-sky-200 bg-sky-50/60 p-0.5 text-xs">
          <button
            onClick={() => setViewMode("card")}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg transition-colors ${
              viewMode === "card"
                ? "bg-white text-sky-700 font-bold shadow-xs"
                : "text-slate-500 hover:text-slate-900"
            }`}
          >
            <LayoutGrid className="h-3.5 w-3.5" />
            <span>Card</span>
          </button>
          <button
            onClick={() => setViewMode("table")}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg transition-colors ${
              viewMode === "table"
                ? "bg-white text-sky-700 font-bold shadow-xs"
                : "text-slate-500 hover:text-slate-900"
            }`}
          >
            <List className="h-3.5 w-3.5" />
            <span>Table</span>
          </button>
        </div>
      </div>

      {/* Card Mode */}
      {viewMode === "card" ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {paginatedQueues.map((q) => (
            <div
              key={q.id}
              className={`rounded-2xl border p-4 shadow-xs transition-all ${
                q.status === "in_progress" || q.status === "called"
                  ? "border-sky-400 bg-sky-50/50 shadow-md shadow-sky-500/10 ring-2 ring-sky-300/40"
                  : "border-sky-100 bg-white hover:border-sky-300 hover:shadow-md"
              }`}
            >
              {/* Card Header: Nomor Antrean 1 Line (Queue Number + Room + Status) */}
              <div className="flex items-center justify-between gap-2 border-b border-sky-100 pb-2.5">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="inline-flex items-center justify-center px-3 py-1 rounded-xl bg-gradient-to-r from-sky-500 to-sky-600 text-white font-black text-sm tracking-wide shadow-xs whitespace-nowrap shrink-0">
                    {q.queueNumber}
                  </span>
                  <div className="flex items-center gap-1.5 min-w-0 text-xs truncate">
                    <span className="font-bold text-slate-800 whitespace-nowrap">
                      {q.roomNumber}
                    </span>
                    <span className="text-slate-300">•</span>
                    <span className="text-[11px] text-slate-500 truncate">Poli Gigi</span>
                  </div>
                </div>
                <div className="shrink-0">
                  <StatusBadge type="queue" status={q.status} />
                </div>
              </div>

              {/* Patient and Doctor info */}
              <div className="py-3 space-y-1.5 text-xs">
                <div>
                  <Link
                    href={`/patients/${q.patientId}`}
                    className="font-bold text-slate-900 hover:text-sky-600 transition-colors"
                  >
                    {q.patientName}
                  </Link>
                  <p className="font-mono text-[11px] text-slate-400">{q.patientMrn}</p>
                </div>

                <div className="rounded-xl bg-sky-50/60 p-2.5 text-[11px] border border-sky-100/60 space-y-0.5">
                  <p className="font-bold text-sky-800">{q.departmentName}</p>
                  <p className="text-slate-600">{q.doctorName}</p>
                  <div className="flex justify-between pt-1 text-[10px] text-slate-400 border-t border-sky-100/60 mt-1">
                    <span>Check-in: {formatTime(q.checkInTime)} WIB</span>
                    {q.status === "waiting" && (
                      <span className="font-bold text-amber-600">
                        Tunggu: ~{q.estimatedWaitMinutes} menit
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-sky-100">
                {q.status === "waiting" && (
                  <>
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-7 text-xs flex-1 gap-1 border-sky-300 text-sky-700 hover:bg-sky-50 font-bold"
                      onClick={() => handleAction(q.id, "called", "Panggil Pasien", q.encounterId, q.patientId || (q as any).patient_id)}
                    >
                      <Volume2 className="h-3.5 w-3.5" />
                      <span>Panggil</span>
                    </Button>
                    <Button
                      size="sm"
                      className="h-7 text-xs flex-1 gap-1 bg-gradient-to-r from-sky-500 to-sky-600 hover:from-sky-600 hover:to-sky-700 text-white font-bold shadow-xs"
                      onClick={() => handleAction(q.id, "in_progress", "Mulai Pemeriksaan", q.encounterId, q.patientId || (q as any).patient_id)}
                    >
                      <Play className="h-3.5 w-3.5" />
                      <span>Mulai</span>
                    </Button>
                  </>
                )}

                {q.status === "called" && (
                  <Button
                    size="sm"
                    className="h-7 text-xs w-full gap-1 bg-gradient-to-r from-sky-500 to-sky-600 text-white font-bold shadow-xs"
                    onClick={() => handleAction(q.id, "in_progress", "Masuk Ruang Dokter", q.encounterId, q.patientId || (q as any).patient_id)}
                  >
                    <Stethoscope className="h-3.5 w-3.5" />
                    <span>Masuk Pemeriksaan</span>
                  </Button>
                )}

                {q.status === "in_progress" && (
                  <>
                    <Link href={`/encounters/new/?patientId=${q.patientId || (q as any).patient_id || ""}&queueId=${q.id}`} className="flex-1">
                      <Button size="sm" variant="subtle" className="h-7 text-xs w-full font-bold">
                        Buka SOAP
                      </Button>
                    </Link>
                    <Button
                      size="sm"
                      className="h-7 text-xs flex-1 gap-1 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-bold shadow-xs"
                      onClick={() => handleAction(q.id, "completed", "Selesai Pemeriksaan", q.encounterId, q.patientId || (q as any).patient_id)}
                    >
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      <span>Selesai</span>
                    </Button>
                  </>
                )}

                {q.status !== "completed" && q.status !== "cancelled" && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 text-xs text-slate-400 hover:text-rose-600 font-semibold"
                    onClick={() => handleAction(q.id, "skipped", "Lewati Antrean")}
                  >
                    Lewati
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Table Mode */
        <div className="overflow-hidden rounded-2xl border border-sky-100 bg-white shadow-xs">
          <table className="w-full text-left text-xs">
            <thead className="bg-sky-50/60 text-sky-900/80 font-bold border-b border-sky-100">
              <tr>
                <th className="px-4 py-3">No. Antrean</th>
                <th className="px-4 py-3">Pasien</th>
                <th className="px-4 py-3">Poli / Dokter</th>
                <th className="px-4 py-3">Ruangan</th>
                <th className="px-4 py-3">Check-in</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-sky-100">
              {paginatedQueues.map((q) => (
                <tr key={q.id} className="hover:bg-sky-50/40 transition-colors">
                  <td className="px-4 py-3 font-black font-mono text-sky-700 whitespace-nowrap">{q.queueNumber}</td>
                  <td className="px-4 py-3">
                    <p className="font-semibold">{q.patientName}</p>
                    <p className="text-[10px] text-slate-400 font-mono">{q.patientMrn}</p>
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-medium">{q.departmentName}</p>
                    <p className="text-[10px] text-slate-400">{q.doctorName}</p>
                  </td>
                  <td className="px-4 py-3 font-semibold">{q.roomNumber}</td>
                  <td className="px-4 py-3 font-mono">{formatTime(q.checkInTime)}</td>
                  <td className="px-4 py-3">
                    <StatusBadge type="queue" status={q.status} />
                  </td>
                  <td className="px-4 py-3 text-right space-x-1">
                    {q.status === "waiting" && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-6 px-2 text-[11px]"
                        onClick={() => handleAction(q.id, "called", "Panggil")}
                      >
                        Panggil
                      </Button>
                    )}
                    {q.status === "in_progress" && (
                      <div className="inline-flex items-center gap-1">
                        <Link href={`/encounters/new/?patientId=${q.patientId || (q as any).patient_id || ""}&queueId=${q.id}`}>
                          <Button size="sm" variant="outline" className="h-6 px-2 text-[11px] font-bold text-sky-700 border-sky-300 hover:bg-sky-50">
                            Buka SOAP
                          </Button>
                        </Link>
                        <Button
                          size="sm"
                          className="h-6 px-2 text-[11px] bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
                          onClick={() => handleAction(q.id, "completed", "Selesai", q.encounterId, q.patientId || (q as any).patient_id)}
                        >
                          Selesai
                        </Button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination Controls */}
      {totalFiltered > 0 && (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between rounded-2xl border border-slate-200 bg-white px-4 py-3 text-xs text-slate-500 dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center gap-2">
            <span>
              Menampilkan <strong className="text-slate-800 dark:text-slate-200">{startRecord}</strong> -{" "}
              <strong className="text-slate-800 dark:text-slate-200">{endRecord}</strong> dari{" "}
              <strong className="text-slate-800 dark:text-slate-200">{totalFiltered}</strong> antrean
            </span>
            <span className="hidden sm:inline text-slate-300 dark:text-slate-700">|</span>
            <div className="hidden sm:flex items-center gap-1.5">
              <span>Baris:</span>
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setPage(1);
                }}
                className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs font-semibold text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 focus:border-teal-500"
              >
                {[6, 12, 24, 48].map((sz) => (
                  <option key={sz} value={sz}>
                    {sz}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="sm"
              className="h-8 w-8 p-0"
              title="Halaman Pertama"
              onClick={() => setPage(1)}
              disabled={page <= 1}
            >
              <ChevronsLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-8 w-8 p-0"
              title="Halaman Sebelumnya"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>

            <span className="px-2 text-xs font-semibold text-slate-700 dark:text-slate-300">
              Hal {page} dari {totalPages}
            </span>

            <Button
              variant="outline"
              size="sm"
              className="h-8 w-8 p-0"
              title="Halaman Selanjutnya"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-8 w-8 p-0"
              title="Halaman Terakhir"
              onClick={() => setPage(totalPages)}
              disabled={page >= totalPages}
            >
              <ChevronsRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Modal Dialog: Tambah Antrean Pasien */}
      <Dialog
        open={isAddQueueOpen}
        onOpenChange={setIsAddQueueOpen}
        title="Ambil Antrean Baru (Dental Chair)"
        description="Pilih pasien terdaftar dan arahkan ke Dental Chair / Poli Gigi yang dituju."
      >
        <form onSubmit={handleAddQueue} className="space-y-4 text-xs pt-1">
          <div className="space-y-1.5">
            <label className="font-bold text-slate-700 dark:text-slate-300">
              Pilih Pasien Terdaftar <span className="text-rose-500">*</span>
            </label>
            <select
              value={selectedPatientId}
              onChange={(e) => setSelectedPatientId(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs text-slate-800 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500"
              required
            >
              <option value="" disabled>-- Pilih Pasien --</option>
              {patientData?.data?.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.medicalRecordNumber}) - {p.gender === 'male' ? 'L' : 'P'}, {p.phone || 'No Telp -'}
                </option>
              ))}
            </select>
            <div className="flex justify-between items-center text-[11px] text-slate-500 pt-1">
              <span>Belum terdaftar?</span>
              <Link href="/patients" className="text-teal-600 hover:underline font-semibold flex items-center gap-1">
                <UserPlus className="h-3 w-3" />
                Daftar Pasien Baru
              </Link>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="font-bold text-slate-700 dark:text-slate-300">
              Unit Layanan / Poli Gigi <span className="text-rose-500">*</span>
            </label>
            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs text-slate-800 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              <option value="Poli Gigi Umum">Poli Gigi Umum (Dental Chair 1)</option>
              <option value="Konservasi Gigi (Endodonti)">Konservasi Gigi / Saluran Akar (Dental Chair 2)</option>
              <option value="Ortodonti (Kawat Gigi)">Ortodonti / Kawat Gigi (Dental Chair 3)</option>
              <option value="Bedah Mulut">Bedah Mulut / Odontektomi (Dental Chair 4)</option>
              <option value="Pedodonsia (Gigi Anak)">Pedodonsia / Gigi Anak (Dental Chair 5)</option>
            </select>
          </div>

          <div className="rounded-xl border border-teal-200 bg-teal-50/50 p-3 text-[11px] text-teal-800 dark:border-teal-900/60 dark:bg-teal-950/20 dark:text-teal-300">
            <p className="font-semibold flex items-center gap-1.5 mb-1">
              <CheckCircle2 className="h-3.5 w-3.5 text-teal-600" />
              Sistem Alur Antrean Otomatis
            </p>
            <p className="text-slate-600 dark:text-slate-400">
              Nomor antrean berurutan (misal: A-004) akan diterbitkan secara otomatis dan langsung tampil di monitor antrean dental.
            </p>
          </div>

          <div className="pt-3 flex justify-end gap-2 border-t border-slate-100 dark:border-slate-800">
            <Button
              variant="outline"
              size="sm"
              type="button"
              onClick={() => setIsAddQueueOpen(false)}
            >
              Batal
            </Button>
            <Button
              variant="primary"
              size="sm"
              type="submit"
              isLoading={isSubmitting}
              className="bg-teal-600 hover:bg-teal-700 text-white font-semibold"
            >
              Terbitkan Tiket Antrean
            </Button>
          </div>
        </form>
      </Dialog>
    </div>
  );
}

