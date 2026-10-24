"use client";

import * as React from "react";
import {
  History,
  Calendar,
  User,
  Stethoscope,
  Activity,
  FileText,
  Pill,
  Sparkles,
  Search,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  X,
  Clock,
  Eye,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Encounter } from "@/types";
import { EncounterService } from "@/services";
import { formatDate, formatCurrency } from "@/lib/formatting";
import { cn } from "@/lib/utils";
import Link from "next/link";

interface PatientExaminationHistoryModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  patientId?: string;
  patientName?: string;
  patientMrn?: string;
}

export function PatientExaminationHistoryModal({
  open,
  onOpenChange,
  patientId,
  patientName,
  patientMrn,
}: PatientExaminationHistoryModalProps) {
  const [encounters, setEncounters] = React.useState<Encounter[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [searchTerm, setSearchTerm] = React.useState("");
  const [expandedEncounterId, setExpandedEncounterId] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (open && patientId) {
      setLoading(true);
      EncounterService.getEncounters(patientId)
        .then((res) => {
          if (res) {
            setEncounters(res);
            if (res.length > 0) {
              setExpandedEncounterId(res[0].id);
            }
          }
        })
        .catch((err) => {
          console.error("Gagal memuat riwayat pemeriksaan pasien", err);
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [open, patientId]);

  const filteredEncounters = React.useMemo(() => {
    if (!searchTerm.trim()) return encounters;
    const term = searchTerm.toLowerCase();
    return encounters.filter((enc) => {
      const matchDoc = enc.doctorName?.toLowerCase().includes(term);
      const matchChief = enc.anamnesis?.chiefComplaint?.toLowerCase().includes(term);
      const matchDiag = enc.diagnoses?.some(
        (d) => d.code.toLowerCase().includes(term) || d.name.toLowerCase().includes(term)
      );
      const matchProc = enc.procedures?.some(
        (p) => p.name.toLowerCase().includes(term) || p.code.toLowerCase().includes(term)
      );
      const matchDate = enc.visitDate?.includes(term);
      return matchDoc || matchChief || matchDiag || matchProc || matchDate;
    });
  }, [encounters, searchTerm]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl p-0 overflow-hidden rounded-2xl bg-white dark:bg-slate-900 shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col max-h-[calc(100dvh-2rem)] sm:max-h-[calc(100dvh-3rem)]">
        <DialogHeader className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-600 text-white shadow-md shadow-teal-600/30">
                <History className="h-5 w-5" />
              </div>
              <div>
                <DialogTitle className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <span>Riwayat Pemeriksaan Pasien</span>
                  {patientName && (
                    <span className="text-teal-700 dark:text-teal-400 font-normal">
                      • {patientName} ({patientMrn || "RM"})
                    </span>
                  )}
                </DialogTitle>
                <DialogDescription className="text-xs text-slate-500 dark:text-slate-400">
                  Daftar kronologis seluruh sesi konsultasi dokter, diagnosis ICD-10, riwayat odontogram, tindakan, dan resep obat.
                </DialogDescription>
              </div>
            </div>
          </div>
        </DialogHeader>

        <div className="p-4 space-y-4 overflow-y-auto flex-1 min-h-0">
          {/* Search bar inside history */}
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <Input
              type="text"
              placeholder="Cari dalam riwayat pemeriksaan (misal: Karies, Scaling, Ponstan, nama dokter)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 text-xs h-9 bg-slate-50 dark:bg-slate-800/50 rounded-xl"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center p-12 text-slate-400 space-y-2">
              <Loader2 className="h-8 w-8 animate-spin text-teal-600" />
              <p className="text-xs">Memuat rekam riwayat pemeriksaan...</p>
            </div>
          ) : filteredEncounters.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-12 text-center text-slate-400">
              <History className="h-10 w-10 text-slate-300 mb-2 stroke-1" />
              <p className="font-semibold text-sm text-slate-700 dark:text-slate-300">
                Belum ada catatan riwayat pemeriksaan
              </p>
              <p className="text-xs text-slate-400 mt-0.5">
                Pemeriksaan yang telah diselesaikan dokter akan tercatat secara otomatis di sini.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredEncounters.map((enc, idx) => {
                const isExpanded = expandedEncounterId === enc.id;
                const teethCount = enc.odontogram?.teeth ? Object.keys(enc.odontogram.teeth).length : 0;

                return (
                  <div
                    key={enc.id}
                    className="rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-xs"
                  >
                    {/* Header Summary */}
                    <div
                      onClick={() => setExpandedEncounterId(isExpanded ? null : enc.id)}
                      className="p-4 bg-slate-50/70 hover:bg-teal-50/30 dark:bg-slate-800/40 dark:hover:bg-slate-800/60 cursor-pointer transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-teal-100 text-teal-700 dark:bg-teal-950 dark:text-teal-300 font-bold text-xs">
                          #{filteredEncounters.length - idx}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-900 dark:text-slate-100 text-sm">
                              {formatDate(enc.visitDate)}
                            </span>
                            <Badge variant="outline" className="text-[10px] font-mono text-teal-700 border-teal-200">
                              {enc.encounterNumber}
                            </Badge>
                            <span className="rounded-full bg-emerald-50 text-emerald-700 px-2 py-0.2 text-[10px] font-semibold uppercase">
                              {enc.status}
                            </span>
                          </div>
                          <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                            DPJP: <span className="font-semibold text-slate-800 dark:text-slate-200">{enc.doctorName}</span> • {enc.departmentName}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 self-end sm:self-auto">
                        <Link
                          href={`/encounters/new/?encounterId=${enc.id}&patientId=${enc.patientId}`}
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Button variant="outline" size="sm" className="h-7 text-xs gap-1 border-teal-200 text-teal-700 cursor-pointer">
                            <Eye className="h-3.5 w-3.5" />
                            <span>Buka EMR Lengkap</span>
                          </Button>
                        </Link>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 text-xs text-slate-500"
                        >
                          {isExpanded ? "Tutup Ringkasan" : "Lihat Rincian"}
                        </Button>
                      </div>
                    </div>

                    {/* Detailed Content (SOAP) */}
                    {isExpanded && (
                      <div className="p-4 space-y-4 text-xs divide-y divide-slate-100 dark:divide-slate-800">
                        {/* 1. Anamnesis (S) */}
                        <div className="space-y-1 pt-1">
                          <span className="font-bold uppercase tracking-wider text-[10px] text-teal-700 dark:text-teal-400">
                            Subjective (S): Keluhan & Anamnesis Pasien
                          </span>
                          <p className="text-slate-800 dark:text-slate-200 font-medium">
                            {enc.anamnesis?.chiefComplaint || "Tidak ada keluhan tertulis"}
                          </p>
                          {enc.anamnesis?.historyOfPresentIllness && (
                            <p className="text-slate-500 italic mt-0.5">
                              HPI: {enc.anamnesis.historyOfPresentIllness}
                            </p>
                          )}
                        </div>

                        {/* 2. Tanda Vital & Fisik (O) */}
                        <div className="space-y-2 pt-3">
                          <span className="font-bold uppercase tracking-wider text-[10px] text-teal-700 dark:text-teal-400">
                            Objective (O): Tanda Vital & Temuan Odontogram
                          </span>
                          {enc.vitalSigns && (
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-slate-50 dark:bg-slate-800/40 p-2.5 rounded-xl">
                              <div>
                                <span className="text-[10px] text-slate-400">Tekanan Darah:</span>
                                <p className="font-bold text-slate-800 dark:text-slate-200 font-mono">
                                  {enc.vitalSigns.bloodPressureSystolic}/{enc.vitalSigns.bloodPressureDiastolic} mmHg
                                </p>
                              </div>
                              <div>
                                <span className="text-[10px] text-slate-400">Denyut Nadi:</span>
                                <p className="font-bold text-slate-800 dark:text-slate-200 font-mono">
                                  {enc.vitalSigns.heartRate} bpm
                                </p>
                              </div>
                              <div>
                                <span className="text-[10px] text-slate-400">Suhu Tubuh:</span>
                                <p className="font-bold text-slate-800 dark:text-slate-200 font-mono">
                                  {enc.vitalSigns.temperature} °C
                                </p>
                              </div>
                              <div>
                                <span className="text-[10px] text-slate-400">Skala Nyeri:</span>
                                <p className="font-bold text-amber-600 font-mono">
                                  {enc.vitalSigns.painScale || 0} / 10
                                </p>
                              </div>
                            </div>
                          )}

                          {teethCount > 0 && (
                            <div className="pt-1">
                              <p className="text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">
                                Rekam Status Odontogram ({teethCount} elemen gigi tercatat):
                              </p>
                              <div className="flex flex-wrap gap-1.5">
                                {Object.values(enc.odontogram?.teeth || {}).map((t) => {
                                  const condMap: Record<string, { label: string; badge: string }> = {
                                    sound: { label: "Sehat", badge: "bg-slate-100 text-slate-700 border-slate-300" },
                                    caries: { label: "Karies", badge: "bg-rose-50 text-rose-700 border-rose-200" },
                                    filled_composite: { label: "Tambal Tetap (Hijau)", badge: "bg-emerald-100 text-emerald-800 border-emerald-300 font-semibold" },
                                    filled_amalgam: { label: "Amalgam", badge: "bg-slate-100 text-slate-700 border-slate-300" },
                                    filled_temporary: { label: "Tambal Sementara (Kuning)", badge: "bg-yellow-100 text-yellow-900 border-yellow-400 font-semibold" },
                                    extracted: { label: "Dicabut", badge: "bg-rose-100 text-rose-800 border-rose-300 font-bold" },
                                    missing: { label: "Hilang", badge: "bg-slate-100 text-slate-600 border-slate-300" },
                                    crown: { label: "Crown", badge: "bg-purple-50 text-purple-700 border-purple-200" },
                                    root_canal: { label: "PSA", badge: "bg-orange-50 text-orange-700 border-orange-200" },
                                    impacted: { label: "Impaksi", badge: "bg-amber-50 text-amber-800 border-amber-200" },
                                    radix: { label: "Radix", badge: "bg-slate-800 text-rose-300 border-slate-700" },
                                    calculus: { label: "Karang Gigi", badge: "bg-teal-50 text-teal-700 border-teal-200" },
                                  };
                                  const cInfo = condMap[t.condition] || { label: t.condition, badge: "bg-teal-50 text-teal-800 border-teal-200" };
                                  return (
                                    <span
                                      key={t.toothNumber}
                                      className={cn("inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-[11px] font-mono", cInfo.badge)}
                                    >
                                      <span className="font-bold">Gigi {t.toothNumber}:</span>
                                      <span>{cInfo.label}</span>
                                      {t.diagnosis && <span className="text-[10px] opacity-75">({t.diagnosis})</span>}
                                    </span>
                                  );
                                })}
                              </div>
                            </div>
                          )}
                        </div>

                        {/* 3. Diagnosis ICD-10 (A) */}
                        <div className="space-y-1 pt-3">
                          <span className="font-bold uppercase tracking-wider text-[10px] text-teal-700 dark:text-teal-400">
                            Assessment (A): Diagnosa ICD-10 Gigi
                          </span>
                          {enc.diagnoses && enc.diagnoses.length > 0 ? (
                            <div className="space-y-1">
                              {(enc.diagnoses || []).map((d, dIdx) => (
                                <div key={d.id || d.code || dIdx} className="flex items-center gap-2">
                                  <Badge className="font-mono bg-teal-600 text-white text-[10px]">
                                    {d.code}
                                  </Badge>
                                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                                    {d.name}
                                  </span>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-slate-400 italic">Tidak ada diagnosa ICD-10 tercatat.</p>
                          )}
                        </div>

                        {/* 4. Tindakan & Resep (P) */}
                        <div className="space-y-3 pt-3">
                          <span className="font-bold uppercase tracking-wider text-[10px] text-teal-700 dark:text-teal-400">
                            Plan (P): Tindakan Gigi & Terapi Obat
                          </span>

                          {/* Tindakan */}
                          {enc.procedures && enc.procedures.length > 0 && (
                            <div>
                              <p className="text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">
                                Tindakan & Prosedur Medis:
                              </p>
                              <div className="space-y-1">
                                {enc.procedures.map((p, pIdx) => (
                                  <div
                                    key={p.id || p.code || pIdx}
                                    className="flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800"
                                  >
                                    <div>
                                      <span className="font-medium text-slate-800 dark:text-slate-200">
                                        {p.name}
                                      </span>
                                      <span className="text-[10px] text-slate-400 ml-2">
                                        Qty: {p.quantity || 1}
                                      </span>
                                    </div>
                                    <span className="font-mono font-bold text-teal-700 dark:text-teal-400">
                                      {formatCurrency(p.price * (p.quantity || 1))}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Resep Obat */}
                          {((enc.prescriptions || (enc as any).followUpPlan?.prescriptions) || []).length > 0 && (
                            <div>
                              <p className="text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">
                                Resep Terapi Obat:
                              </p>
                              <div className="space-y-1">
                                {(enc.prescriptions || (enc as any).followUpPlan?.prescriptions || []).map((rx: any, rIdx: number) => (
                                  <div
                                    key={rx.id || rx.medicineName || rIdx}
                                    className="flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800"
                                  >
                                    <div>
                                      <span className="font-medium text-slate-800 dark:text-slate-200">
                                        {rx.medicineName}
                                      </span>
                                      <p className="text-[10px] text-teal-700 dark:text-teal-400">
                                        {rx.frequency} • {rx.instruction} ({rx.quantity} {rx.dosage})
                                      </p>
                                    </div>
                                    <span className="font-mono text-slate-700 dark:text-slate-300">
                                      {formatCurrency(rx.totalPrice)}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Catatan / Follow up */}
                          {(enc.dentalNotes || (enc as any).followUpPlan?.dentalNotes) && (
                            <div className="rounded-lg bg-amber-50/60 dark:bg-amber-950/30 p-2 text-amber-800 dark:text-amber-300">
                              <span className="font-bold">Instruksi Pasca Tindakan: </span>
                              {enc.dentalNotes || (enc as any).followUpPlan?.dentalNotes}
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
