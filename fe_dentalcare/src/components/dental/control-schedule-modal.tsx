"use client";

import * as React from "react";
import {
  Calendar,
  Clock,
  User,
  Stethoscope,
  FileText,
  CheckCircle2,
  Sparkles,
  AlertCircle,
  Bell,
  ChevronRight,
  CalendarCheck,
} from "lucide-react";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Patient } from "@/types";
import { formatDate } from "@/lib/formatting";
import { toast } from "sonner";
import { PatientService } from "@/services";
import { isHMinusOne } from "./whatsapp-reminder-modal";

interface ControlScheduleModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  patient: Patient | null;
  onSuccess?: (updatedPatient: Patient) => void;
}

const DOCTORS = [
  { id: "DOC-001", name: "drg. Pratama Wijaya, Sp.Ort", spec: "Spesialis Ortodonti (Behel / Kawat Gigi)" },
  { id: "DOC-002", name: "drg. Sarah Nurul, Sp.KG", spec: "Spesialis Konservasi Gigi (Tambal & Saraf)" },
  { id: "DOC-003", name: "drg. Budi Santoso, Sp.BM", spec: "Spesialis Bedah Mulut & Maksilofasial" },
  { id: "DOC-004", name: "drg. Jihan, S.Kep", spec: "Dokter Gigi Umum & Estetika" },
  { id: "DOC-005", name: "drg. Nadya Paramita, Sp.Perio", spec: "Spesialis Periodonsia (Gusi & Karang Gigi)" },
];

const COMMON_REASONS = [
  "Kontrol rutin evaluasi kesehatan gigi & mulut",
  "Kontrol pelepasan tampon & jahitan pasca pencabutan",
  "Kontrol berkala aktivasi behel / kawat gigi",
  "Kontrol evaluasi tambalan gigi komposit / sementara",
  "Kontrol lanjutan perawatan saluran akar (PSA)",
  "Kontrol pembersihan karang gigi (scaling) berkala",
];

export function ControlScheduleModal({
  open,
  onOpenChange,
  patient,
  onSuccess,
}: ControlScheduleModalProps) {
  // Today and Tomorrow strings formatted as YYYY-MM-DD
  const getTodayStr = () => {
    const d = new Date();
    return d.toISOString().split("T")[0];
  };

  const getRelativeDateStr = (daysAhead: number) => {
    const d = new Date();
    d.setDate(d.getDate() + daysAhead);
    return d.toISOString().split("T")[0];
  };

  const tomorrowStr = React.useMemo(() => getRelativeDateStr(1), []);

  const [controlDate, setControlDate] = React.useState<string>("");
  const [appointmentTime, setAppointmentTime] = React.useState<string>("09:00");
  const [selectedDoctorId, setSelectedDoctorId] = React.useState<string>("DOC-001");
  const [notes, setNotes] = React.useState<string>("Kontrol rutin evaluasi kesehatan gigi");
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  // Sync state whenever modal opens or patient changes
  React.useEffect(() => {
    if (patient) {
      if (patient.nextControlDate) {
        setControlDate(patient.nextControlDate);
      } else {
        // Default to tomorrow (H-1 ready)
        setControlDate(tomorrowStr);
      }

      if (patient.controlDoctor) {
        const found = DOCTORS.find((d) =>
          d.name.toLowerCase().includes(patient.controlDoctor!.toLowerCase())
        );
        if (found) setSelectedDoctorId(found.id);
      }
    }
  }, [patient, open, tomorrowStr]);

  if (!patient) return null;

  const isSelectedDateH1 = isHMinusOne(controlDate);

  const presets = [
    { label: "Besok (H-1)", date: tomorrowStr, isH1Badge: true },
    { label: "3 Hari Lagi", date: getRelativeDateStr(3) },
    { label: "1 Minggu Lagi", date: getRelativeDateStr(7) },
    { label: "2 Minggu Lagi", date: getRelativeDateStr(14) },
    { label: "1 Bulan Lagi", date: getRelativeDateStr(30) },
  ];

  const quickTimes = ["09:00", "10:30", "13:00", "15:30", "17:00", "19:00"];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!controlDate) {
      toast.error("Silakan pilih tanggal kontrol terlebih dahulu.");
      return;
    }

    const doc = DOCTORS.find((d) => d.id === selectedDoctorId) || DOCTORS[0];

    setIsSubmitting(true);
    try {
      const updated = await PatientService.updateControlSchedule(patient.id, {
        nextControlDate: controlDate,
        appointmentTime,
        doctorName: doc.name,
        doctorId: doc.id,
        notes,
      });

      toast.success(
        `Jadwal kontrol ${patient.name} berhasil disimpan untuk tanggal ${formatDate(controlDate)}!`,
        {
          description: isSelectedDateH1
            ? "Karena jadwal jatuh pada hari esok (H-1), notifikasi otomatis aktif di lonceng sistem dan WhatsApp."
            : "Data jadwal kontrol telah terhubung dengan rekam medis pasien.",
          duration: 5000,
        }
      );

      if (onSuccess) {
        onSuccess(updated);
      }
      onOpenChange(false);
    } catch (err: any) {
      toast.error(err?.message || "Gagal menyimpan jadwal kontrol pasien.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
      title="Atur Jadwal Kontrol Pasien"
      description="Tentukan tanggal kontrol kunjungan berikutnya. Pasien dengan kontrol besok (H-1) akan otomatis mendapat notifikasi di sistem dan pengingat WhatsApp."
      className="max-w-xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4 pt-1">
        {/* Patient Info Card */}
        <div className="rounded-xl border border-teal-100 bg-teal-50/60 p-3.5 dark:border-teal-900/60 dark:bg-teal-950/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-600 font-bold text-white shadow-xs">
                {patient.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100">
                    {patient.name}
                  </h4>
                  <span className="rounded bg-teal-100 px-1.5 py-0.5 font-mono text-[10px] font-semibold text-teal-800 dark:bg-teal-900 dark:text-teal-300">
                    {patient.medicalRecordNumber}
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {patient.phone || "Tidak ada nomor telepon"} • Penjamin:{" "}
                  <span className="uppercase font-semibold text-teal-700 dark:text-teal-400">
                    {patient.insurance?.type || "Umum"}
                  </span>
                </p>
              </div>
            </div>

            {/* Current schedule badge if exists */}
            {patient.nextControlDate && (
              <div className="text-right">
                <span className="text-[10px] text-slate-400 block">Jadwal saat ini:</span>
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  {formatDate(patient.nextControlDate)}
                </span>
                {isHMinusOne(patient.nextControlDate) && (
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded-full mt-0.5">
                    <Bell className="h-2.5 w-2.5" /> Besok (H-1)
                  </span>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Date Section with Quick Presets */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5 text-teal-600" />
              <span>Tanggal Kontrol Berikutnya *</span>
            </label>
            {isSelectedDateH1 && (
              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-100 border border-emerald-300 dark:bg-emerald-950 dark:border-emerald-700 dark:text-emerald-300 px-2 py-0.5 rounded-full animate-pulse shadow-2xs">
                <Bell className="h-3 w-3 text-emerald-600" />
                Masuk Notifikasi H-1 Besok!
              </span>
            )}
          </div>

          {/* Quick preset chips */}
          <div className="flex flex-wrap gap-1.5">
            {presets.map((preset) => {
              const active = controlDate === preset.date;
              return (
                <button
                  key={preset.label}
                  type="button"
                  onClick={() => setControlDate(preset.date)}
                  className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-medium transition-all ${
                    active
                      ? preset.isH1Badge
                        ? "bg-emerald-600 text-white font-bold shadow-xs ring-2 ring-emerald-400"
                        : "bg-teal-600 text-white font-bold shadow-xs ring-2 ring-teal-400"
                      : preset.isH1Badge
                      ? "bg-emerald-50 text-emerald-800 border border-emerald-300 hover:bg-emerald-100 dark:bg-emerald-950/60 dark:text-emerald-300"
                      : "bg-slate-100 text-slate-700 border border-slate-200 hover:bg-slate-200 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300"
                  }`}
                >
                  {preset.isH1Badge && <Sparkles className="h-3 w-3" />}
                  <span>{preset.label}</span>
                </button>
              );
            })}
          </div>

          <Input
            type="date"
            min={getTodayStr()}
            value={controlDate}
            onChange={(e) => setControlDate(e.target.value)}
            className="w-full text-sm font-medium"
            required
          />
        </div>

        {/* Time and Doctor Selection Grid */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {/* Time */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5 text-teal-600" />
              <span>Jam Kontrol (WIB)</span>
            </label>
            <div className="flex flex-wrap gap-1 mb-1">
              {quickTimes.map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setAppointmentTime(t)}
                  className={`rounded px-1.5 py-0.5 text-[11px] font-mono transition-colors ${
                    appointmentTime === t
                      ? "bg-teal-600 text-white font-bold"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
            <Input
              type="time"
              value={appointmentTime}
              onChange={(e) => setAppointmentTime(e.target.value)}
              className="text-xs font-mono"
            />
          </div>

          {/* Doctor */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <Stethoscope className="h-3.5 w-3.5 text-teal-600" />
              <span>Dokter DPJP / Pemeriksa</span>
            </label>
            <select
              value={selectedDoctorId}
              onChange={(e) => setSelectedDoctorId(e.target.value)}
              className="w-full rounded-lg border border-slate-300 bg-white px-2.5 py-2 text-xs text-slate-800 focus:border-teal-500 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
            >
              {DOCTORS.map((doc) => (
                <option key={doc.id} value={doc.id}>
                  {doc.name}
                </option>
              ))}
            </select>
            <p className="text-[10px] text-slate-400 truncate">
              {DOCTORS.find((d) => d.id === selectedDoctorId)?.spec}
            </p>
          </div>
        </div>

        {/* Reason / Notes */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
            <FileText className="h-3.5 w-3.5 text-teal-600" />
            <span>Tujuan / Rencana Tindakan Kontrol</span>
          </label>

          {/* Quick chip reasons */}
          <div className="flex flex-wrap gap-1 max-h-20 overflow-y-auto pr-1">
            {COMMON_REASONS.map((reason) => (
              <button
                key={reason}
                type="button"
                onClick={() => setNotes(reason)}
                className={`text-[10px] rounded-md px-2 py-0.5 text-left transition-colors border ${
                  notes === reason
                    ? "bg-teal-50 border-teal-300 text-teal-800 font-semibold dark:bg-teal-950 dark:border-teal-700 dark:text-teal-300"
                    : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-400"
                }`}
              >
                {reason}
              </button>
            ))}
          </div>

          <Textarea
            rows={2}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Tuliskan catatan khusus atau tindakan yang direncanakan..."
            className="text-xs leading-relaxed"
          />
        </div>

        {/* H-1 info notice */}
        <div className="rounded-xl border border-blue-200 bg-blue-50/70 p-3 text-xs text-blue-900 dark:border-blue-900 dark:bg-blue-950/40 dark:text-blue-200">
          <div className="flex items-start gap-2">
            <AlertCircle className="h-4 w-4 text-blue-600 shrink-0 mt-0.5 dark:text-blue-400" />
            <div className="space-y-0.5 text-[11px] leading-relaxed">
              <p className="font-semibold text-blue-950 dark:text-blue-200">
                Otomasi Pengingat Kontrol H-1 OKAY Dental
              </p>
              <p className="text-blue-800 dark:text-blue-300">
                Ketika tanggal kontrol berjarak <strong>1 hari (H-1)</strong> dari hari berjalan,
                sistem secara otomatis memunculkan notifikasi di bilah atas (lonceng), menambahkan lencana hijau{" "}
                <span className="font-bold underline">Besok (H-1)</span> di daftar pasien, serta
                menyiapkan pesan WA pengingat untuk dikirim ke pasien.
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
            className="text-xs"
          >
            Batal
          </Button>

          <Button
            type="submit"
            size="sm"
            disabled={isSubmitting}
            className="bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold gap-1.5 shadow-xs"
          >
            {isSubmitting ? (
              <>
                <span className="h-3 w-3 animate-spin rounded-full border-2 border-white border-t-transparent" />
                <span>Menyimpan...</span>
              </>
            ) : (
              <>
                <CalendarCheck className="h-3.5 w-3.5" />
                <span>Simpan Jadwal Kontrol</span>
              </>
            )}
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
