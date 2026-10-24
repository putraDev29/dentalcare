"use client";

import * as React from "react";
import {
  MessageSquare,
  ExternalLink,
  CheckCircle2,
  Calendar,
  Clock,
  User,
  Copy,
  Check,
  Send,
  Sparkles,
  AlertCircle,
  Phone,
  FileText,
  RefreshCw,
  Zap,
  Radio,
  QrCode,
} from "lucide-react";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Patient } from "@/types";
import { formatDate } from "@/lib/formatting";
import { toast } from "sonner";
import { appConfig } from "@/config/app-config";
import { WhatsAppGatewayDialog } from "./whatsapp-gateway-dialog";

interface WhatsAppReminderModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  patients: Patient[];
}

/**
 * Format phone number to international WhatsApp format (e.g. 0812... -> 62812...)
 */
export function formatWhatsAppPhone(phone: string): string {
  if (!phone) return "";
  let clean = phone.replace(/\D/g, "");
  if (clean.startsWith("0")) {
    clean = "62" + clean.slice(1);
  } else if (!clean.startsWith("62")) {
    clean = "62" + clean;
  }
  return clean;
}

/**
 * Check if the target date is exactly tomorrow (H-1 from today)
 */
export function isHMinusOne(dateStr?: string): boolean {
  if (!dateStr) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const target = new Date(dateStr);
  target.setHours(0, 0, 0, 0);

  const diffMs = target.getTime() - today.getTime();
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));
  return diffDays === 1;
}

const MESSAGE_TEMPLATES = [
  {
    id: "standard",
    name: "Kontrol Rutin Gigi (OKAY Dental Therapist)",
    template: `Halo Kak {nama},

Mengingatkan jadwal kontrol kesehatan gigi Anda di OKAY Dental Therapist:

🗓️ Tanggal Kontrol: {tanggal} (Besok)
⏰ Pukul: 09:00 WIB
🏥 Klinik: OKAY Dental Therapist
📋 No. RM: {no_rm}

Mohon konfirmasi kehadiran dengan membalas pesan ini:
Ketik YA jika hadir, atau infokan jika ingin penyesuaian jadwal.

Terima kasih atas kepercayaannya pada OKAY Dental Therapist! 🙏🦷`,
  },
  {
    id: "post_treatment",
    name: "Kontrol Pasca Tindakan / Bedah Gigi",
    template: `Halo Kak {nama},

Semoga proses pemulihan gigi Anda berjalan dengan baik. Kami dari OKAY Dental Therapist ingin mengingatkan jadwal kontrol evaluasi pasca tindakan Anda:

🗓️ Tanggal Kontrol: {tanggal} (Besok)
⏰ Pukul: 10:00 WIB
🏥 Klinik: OKAY Dental Therapist
📋 No. RM: {no_rm}

Terapis/dokter akan mengevaluasi penyembuhan gusi/tambalan gigi Anda. Mohon konfirmasi kehadiran dengan membalas pesan ini:
Ketik YA jika hadir, atau infokan jika ingin penyesuaian jadwal.

Terima kasih atas kepercayaannya pada OKAY Dental Therapist! 🙏🦷`,
  },
  {
    id: "orthodontic",
    name: "Kontrol Kawat Gigi / Ortodonti",
    template: `Halo Kak {nama},

Mengingatkan jadwal aktivasi dan kontrol kawat gigi (behel) Anda di OKAY Dental Therapist:

🗓️ Tanggal Kontrol: {tanggal} (Besok)
⏰ Pukul: 14:00 WIB
🏥 Klinik: OKAY Dental Therapist
📋 No. RM: {no_rm}

Mohon hadir tepat waktu agar perawatan behel berjalan optimal. Konfirmasi kehadiran Anda dengan membalas pesan ini:
Ketik YA jika hadir, atau infokan jika ingin penyesuaian jadwal.

Terima kasih atas kepercayaannya pada OKAY Dental Therapist! 🙏🦷`,
  },
  {
    id: "brief",
    name: "Pesan Singkat & Cepat",
    template: `Halo Kak {nama}, mengingatkan jadwal kontrol gigi Anda di OKAY Dental Therapist besok pada tanggal {tanggal} (No RM: {no_rm}). Mohon konfirmasi kehadirannya ya Kak. Terima kasih! 🙏🦷`,
  },
];

export function WhatsAppReminderModal({
  open,
  onOpenChange,
  patients,
}: WhatsAppReminderModalProps) {
  const [selectedTemplateId, setSelectedTemplateId] = React.useState("standard");
  const [customMessage, setCustomMessage] = React.useState(MESSAGE_TEMPLATES[0].template);
  const [sentPatientIds, setSentPatientIds] = React.useState<Record<string, boolean>>({});
  const [copiedUrlId, setCopiedUrlId] = React.useState<string | null>(null);

  const [isBatchOpening, setIsBatchOpening] = React.useState(false);
  const [batchProgress, setBatchProgress] = React.useState({ current: 0, total: 0 });

  // Filter patients whose nextControlDate is H-1 (tomorrow)
  const h1Patients = React.useMemo(() => {
    return patients.filter((p) => isHMinusOne(p.nextControlDate));
  }, [patients]);

  // Tomorrow formatted date for banner
  const tomorrowFormatted = React.useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return formatDate(d.toISOString().split("T")[0]);
  }, []);

  // Find next unsent patient
  const nextUnsentPatient = React.useMemo(() => {
    return h1Patients.find((p) => !sentPatientIds[p.id]);
  }, [h1Patients, sentPatientIds]);

  const sentCount = React.useMemo(() => {
    return h1Patients.filter((p) => !!sentPatientIds[p.id]).length;
  }, [h1Patients, sentPatientIds]);

  const handleTemplateChange = (tmplId: string) => {
    setSelectedTemplateId(tmplId);
    const tmpl = MESSAGE_TEMPLATES.find((t) => t.id === tmplId);
    if (tmpl) {
      setCustomMessage(tmpl.template);
    }
  };

  const buildMessage = (patient: Patient) => {
    return customMessage
      .replace(/{nama}/g, patient.name)
      .replace(
        /{tanggal}/g,
        patient.nextControlDate ? formatDate(patient.nextControlDate) : tomorrowFormatted
      )
      .replace(/{dokter}/g, patient.controlDoctor || "drg. Pratama Wijaya")
      .replace(/{no_rm}/g, patient.medicalRecordNumber);
  };

  const getWhatsAppUrl = (patient: Patient) => {
    const formattedPhone = formatWhatsAppPhone(patient.phone);
    const message = buildMessage(patient);
    return `https://wa.me/${formattedPhone}?text=${encodeURIComponent(message)}`;
  };

  const handleOpenWhatsApp = (patient: Patient) => {
    if (!patient.phone) {
      toast.error(`Nomor telepon pasien ${patient.name} tidak tersedia!`);
      return;
    }
    const url = getWhatsAppUrl(patient);
    // Mark as sent / opened
    setSentPatientIds((prev) => ({ ...prev, [patient.id]: true }));
    // Open WhatsApp Web Click-to-Chat in new window
    window.open(url, "_blank", "noopener,noreferrer");
    toast.success(`Membuka WhatsApp Web untuk ${patient.name}...`);
  };

  const handleOpenNextPatient = () => {
    if (!nextUnsentPatient) {
      toast.info("Semua pasien H-1 sudah dibuka tautan WhatsApp-nya!");
      return;
    }
    handleOpenWhatsApp(nextUnsentPatient);
  };

  const handleOpenAllSequentially = async () => {
    if (h1Patients.length === 0) return;
    setIsBatchOpening(true);
    setBatchProgress({ current: 0, total: h1Patients.length });

    toast.info(
      `Membuka WhatsApp Web untuk ${h1Patients.length} pasien secara berurutan... Pastikan izin pop-up diizinkan pada browser Anda.`,
      { duration: 4000 }
    );

    for (let i = 0; i < h1Patients.length; i++) {
      const p = h1Patients[i];
      if (p.phone) {
        setBatchProgress({ current: i + 1, total: h1Patients.length });
        setSentPatientIds((prev) => ({ ...prev, [p.id]: true }));
        const url = getWhatsAppUrl(p);
        window.open(url, "_blank", "noopener,noreferrer");
      }
      // Delay 1.2s between tabs so the browser does not throttle/block as spam
      if (i < h1Patients.length - 1) {
        await new Promise((resolve) => setTimeout(resolve, 1200));
      }
    }

    setIsBatchOpening(false);
    toast.success(`Selesai membuka WhatsApp Web untuk seluruh ${h1Patients.length} pasien H-1!`);
  };

  // Delivery mode: "gateway" (WPPConnect auto-send) vs "click_to_chat" (wa.me)
  const [sendMode, setSendMode] = React.useState<"gateway" | "click_to_chat">("gateway");
  const [gatewayStatus, setGatewayStatus] = React.useState<any>(null);
  const [isGatewaySending, setIsGatewaySending] = React.useState(false);
  const [isGatewayDialogOpen, setIsGatewayDialogOpen] = React.useState(false);

  const isGatewayConnected = !!(gatewayStatus?.connected || gatewayStatus?.status === "CONNECTED");

  const fetchGatewayStatus = React.useCallback(async () => {
    try {
      const res = await fetch(`${appConfig.apiUrl}/whatsapp/status`);
      if (res.ok) {
        const data = await res.json();
        setGatewayStatus(data);
      }
    } catch {
      setGatewayStatus({ status: "OFFLINE", connected: false });
    }
  }, []);

  React.useEffect(() => {
    if (open) {
      fetchGatewayStatus();
    }
  }, [open, fetchGatewayStatus]);

  const handleSendViaGateway = async () => {
    if (h1Patients.length === 0) return;
    setIsGatewaySending(true);
    try {
      const recipients = h1Patients.map((p) => ({
        id: p.id,
        name: p.name,
        phone: p.phone,
        message: buildMessage(p),
      }));

      const res = await fetch(`${appConfig.apiUrl}/whatsapp/send-bulk`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ recipients }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        toast.success(
          `Berhasil mengirim pesan ke ${data.sent} pasien via WPPConnect Gateway!`,
          { duration: 5000 }
        );
        const updated = { ...sentPatientIds };
        h1Patients.forEach((p) => {
          updated[p.id] = true;
        });
        setSentPatientIds(updated);
      } else {
        toast.error(data.message || "Gagal mengirim pesan via WPPConnect Gateway.");
      }
    } catch (e: any) {
      toast.error("Gagal menghubungi server WhatsApp Gateway: " + e.message);
    } finally {
      setIsGatewaySending(false);
    }
  };

  const handleCopyLink = (patient: Patient) => {
    const url = getWhatsAppUrl(patient);
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(url);
      setCopiedUrlId(patient.id);
      toast.success(`Tautan wa.me untuk ${patient.name} berhasil disalin!`);
      setTimeout(() => setCopiedUrlId(null), 2500);
    }
  };

  const handleCopyAllPhones = () => {
    const phones = h1Patients
      .map((p) => formatWhatsAppPhone(p.phone))
      .filter(Boolean)
      .join(", ");
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(phones);
      toast.success(`${h1Patients.length} nomor WhatsApp berhasil disalin ke clipboard!`);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
      title="Pengingat Kontrol Pasien via WhatsApp (H-1)"
      description="Kirim notifikasi pengingat jadwal kontrol H-1 secara otomatis via WPPConnect Gateway atau melalui protokol WhatsApp Web."
      className="max-w-3xl"
    >
      <div className="space-y-4 pr-1">
        {/* Mode Selector Tabs */}
        <div className="flex rounded-xl bg-slate-100 p-1 dark:bg-slate-800 text-xs font-semibold">
          <button
            type="button"
            onClick={() => setSendMode("gateway")}
            className={`flex flex-1 items-center justify-center gap-2 rounded-lg py-2 transition-all ${
              sendMode === "gateway"
                ? "bg-white text-emerald-700 shadow-xs dark:bg-slate-900 dark:text-emerald-400"
                : "text-slate-600 hover:text-slate-900 dark:text-slate-400"
            }`}
          >
            <Zap className="h-3.5 w-3.5 text-emerald-600" />
            <span>WPPConnect Gateway (Kirim Otomatis Background)</span>
            <span className="rounded-full bg-emerald-100 text-emerald-800 px-1.5 py-0.2 text-[10px] dark:bg-emerald-950 dark:text-emerald-300">
              Otomatis
            </span>
          </button>
          <button
            type="button"
            onClick={() => setSendMode("click_to_chat")}
            className={`flex flex-1 items-center justify-center gap-2 rounded-lg py-2 transition-all ${
              sendMode === "click_to_chat"
                ? "bg-white text-teal-700 shadow-xs dark:bg-slate-900 dark:text-teal-400"
                : "text-slate-600 hover:text-slate-900 dark:text-slate-400"
            }`}
          >
            <MessageSquare className="h-3.5 w-3.5 text-teal-600" />
            <span>WhatsApp Web (Click-to-Chat / wa.me)</span>
          </button>
        </div>

        {/* WPPConnect Gateway Banner */}
        {sendMode === "gateway" && (
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 rounded-2xl border border-emerald-200 bg-emerald-50/80 p-3.5 text-xs text-emerald-950 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-200">
            <div className="flex items-start gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-600 text-white shrink-0 shadow-xs">
                <Radio className="h-5 w-5" />
              </div>
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm">WPPConnect Server:</span>
                  <span
                    className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold ${
                      isGatewayConnected
                        ? "bg-emerald-200 text-emerald-900 dark:bg-emerald-900 dark:text-emerald-200"
                        : "bg-amber-200 text-amber-900 dark:bg-amber-900 dark:text-amber-200"
                    }`}
                  >
                    {isGatewayConnected
                      ? "🟢 Siap Kirim Otomatis"
                      : "🟡 Menunggu Scan QR"}
                  </span>
                </div>
                <p className="text-[11px] text-emerald-800 dark:text-emerald-300">
                  {isGatewayConnected
                    ? `Terhubung ke nomor WhatsApp klinik: ${gatewayStatus?.phone || "OKAY Dental"}. Sekali klik pesan langsung meluncur!`
                    : "Gateway belum di-scan dengan HP WhatsApp klinik. Klik tombol scan untuk menghubungkan."}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <Button
                size="sm"
                variant="outline"
                onClick={() => setIsGatewayDialogOpen(true)}
                className="h-8 text-xs gap-1.5 border-emerald-300 text-emerald-800 hover:bg-emerald-100 dark:border-emerald-700 dark:text-emerald-200 font-semibold"
              >
                <QrCode className="h-3.5 w-3.5" />
                <span>{isGatewayConnected ? "Info Gateway" : "Scan QR Code"}</span>
              </Button>

              {isGatewayConnected && (
                <Button
                  size="sm"
                  onClick={handleSendViaGateway}
                  disabled={isGatewaySending || h1Patients.length === 0}
                  className="h-8 text-xs gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-xs"
                >
                  {isGatewaySending ? (
                    <>
                      <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                      <span>Mengirim...</span>
                    </>
                  ) : (
                    <>
                      <Send className="h-3.5 w-3.5" />
                      <span>Kirim ke Semua ({h1Patients.length}) Pasien</span>
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>
        )}

        {/* Click-to-Chat Banner */}
        {sendMode === "click_to_chat" && (
          <div className="flex items-start gap-3 rounded-2xl border border-teal-200 bg-teal-50/70 p-3.5 text-xs text-teal-900 dark:border-teal-800 dark:bg-teal-950/40 dark:text-teal-200">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-teal-600 text-white shrink-0 shadow-xs">
              <MessageSquare className="h-4 w-4" />
            </div>
            <div className="space-y-1">
              <p className="font-semibold text-sm">
                WhatsApp Web Click-to-Chat (wa.me)
              </p>
              <p className="text-[11px] leading-relaxed text-teal-800 dark:text-teal-300">
                Membuka obrolan WhatsApp Web di tab browser baru per nomor dengan teks pesan terisi otomatis (100% aman tanpa bot).
              </p>
            </div>
          </div>
        )}

        {/* Template Selector & Editor */}
        <div className="space-y-2 rounded-2xl border border-slate-200 bg-white p-3.5 dark:border-slate-800 dark:bg-slate-900">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <FileText className="h-3.5 w-3.5 text-teal-600" />
              Template Pesan WhatsApp
            </label>
            <div className="flex items-center gap-1 text-[11px] text-slate-400">
              Variabel: <span className="font-mono text-teal-600">{"{nama}"}</span>, <span className="font-mono text-teal-600">{"{tanggal}"}</span>, <span className="font-mono text-teal-600">{"{dokter}"}</span>, <span className="font-mono text-teal-600">{"{no_rm}"}</span>
            </div>
          </div>

          <div className="flex flex-wrap gap-1.5 pt-1">
            {MESSAGE_TEMPLATES.map((tmpl) => (
              <button
                key={tmpl.id}
                type="button"
                onClick={() => handleTemplateChange(tmpl.id)}
                className={`rounded-lg px-2.5 py-1 text-xs font-medium transition-colors cursor-pointer border ${
                  selectedTemplateId === tmpl.id
                    ? "bg-teal-50 border-teal-500 text-teal-700 dark:bg-teal-950/50 dark:text-teal-300 font-semibold"
                    : "border-slate-200 text-slate-600 hover:bg-slate-50 dark:border-slate-800 dark:text-slate-400"
                }`}
              >
                {tmpl.name}
              </button>
            ))}
          </div>

          <textarea
            value={customMessage}
            onChange={(e) => setCustomMessage(e.target.value)}
            rows={5}
            className="w-full mt-2 rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs text-slate-800 font-mono focus:border-teal-500 focus:outline-hidden dark:border-slate-800 dark:bg-slate-800 dark:text-slate-200"
            placeholder="Tulis pesan pengingat WhatsApp..."
          />
        </div>

        {/* Patients List Section */}
        <div className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center gap-2">
              <span>Daftar Pasien Kontrol H-1 ({h1Patients.length} Pasien)</span>
              <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-semibold">
                Target Besok: {tomorrowFormatted}
              </span>
            </h4>

            {h1Patients.length > 0 && (
              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                {sentCount} dari {h1Patients.length} telah dibuka
              </span>
            )}
          </div>

          {/* Multi-Number Quick Submission Actions */}
          {h1Patients.length > 1 && (
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3.5 rounded-2xl bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 dark:from-emerald-950/40 dark:to-teal-950/40 dark:border-emerald-800 shadow-2xs">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
                  <p className="font-bold text-xs text-emerald-950 dark:text-emerald-200">
                    Aksi Cepat Multi-Nomor ({h1Patients.length} Pasien H-1)
                  </p>
                </div>
                <p className="text-[11px] text-emerald-800 dark:text-emerald-300">
                  {nextUnsentPatient
                    ? `Berikutnya: ${nextUnsentPatient.name} (${nextUnsentPatient.phone || "No HP Kosong"})`
                    : "Semua pasien telah dibuka!"}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleCopyAllPhones}
                  className="h-8 text-xs gap-1.5 border-emerald-300 text-emerald-800 hover:bg-emerald-100 dark:border-emerald-700 dark:text-emerald-200"
                  title="Salin seluruh nomor telepon pasien H-1 dipisah koma"
                >
                  <Copy className="h-3 w-3" />
                  <span>Salin Semua Nomor</span>
                </Button>

                {nextUnsentPatient && (
                  <Button
                    size="sm"
                    onClick={handleOpenNextPatient}
                    className="h-8 text-xs gap-1.5 bg-teal-600 hover:bg-teal-700 text-white font-semibold shadow-xs"
                    title={`Buka WA pasien berikutnya (${nextUnsentPatient.name})`}
                  >
                    <Send className="h-3.5 w-3.5" />
                    <span>Lanjut Pasien Berikutnya</span>
                  </Button>
                )}

                <Button
                  size="sm"
                  onClick={handleOpenAllSequentially}
                  disabled={isBatchOpening}
                  className="h-8 text-xs gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold shadow-xs"
                  title="Buka tab WhatsApp Web untuk seluruh pasien secara berurutan"
                >
                  {isBatchOpening ? (
                    <>
                      <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                      <span>Membuka ({batchProgress.current}/{batchProgress.total})...</span>
                    </>
                  ) : (
                    <>
                      <ExternalLink className="h-3.5 w-3.5" />
                      <span>Buka Semua Tab Sekaligus</span>
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}

          {h1Patients.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-amber-300 bg-amber-50/50 p-6 text-center text-xs text-amber-800 dark:border-amber-800 dark:bg-amber-950/30 dark:text-amber-300 space-y-1">
              <AlertCircle className="h-6 w-6 mx-auto text-amber-600 mb-1" />
              <p className="font-semibold">
                Tidak ada pasien terpilih yang memiliki jadwal kontrol H-1 ({tomorrowFormatted}).
              </p>
              <p className="text-[11px] text-amber-700 dark:text-amber-400">
                Fitur ini hanya otomatis memfilter pasien dengan tanggal kontrol tepat 1 hari sebelum jadwal (H-1).
              </p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {h1Patients.map((p, idx) => {
                const isSent = !!sentPatientIds[p.id];
                const cleanPhone = formatWhatsAppPhone(p.phone);

                return (
                  <div
                    key={p.id}
                    className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border p-3.5 transition-all ${
                      isSent
                        ? "border-emerald-300 bg-emerald-50/30 dark:border-emerald-800 dark:bg-emerald-950/20"
                        : "border-slate-200 bg-white hover:border-teal-300 dark:border-slate-800 dark:bg-slate-900"
                    }`}
                  >
                    {/* Patient Info */}
                    <div className="flex items-start gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-50 border border-teal-200 font-bold text-teal-700 text-xs shadow-xs dark:bg-teal-950/50 dark:border-teal-800 dark:text-teal-300 shrink-0">
                        {idx + 1}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-bold text-xs text-slate-900 dark:text-slate-100">
                            {p.name}
                          </p>
                          <span className="font-mono text-[10px] text-slate-400">
                            {p.medicalRecordNumber}
                          </span>
                          {isSent && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                              <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                              Sudah Dibuka
                            </span>
                          )}
                        </div>

                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-[11px] text-slate-500 dark:text-slate-400">
                          <span className="flex items-center gap-1 font-mono text-emerald-700 dark:text-emerald-400 font-semibold">
                            <Phone className="h-3 w-3" />
                            {p.phone || "Tanpa No. HP"}
                          </span>
                          <span>•</span>
                          <span className="flex items-center gap-1 text-teal-700 dark:text-teal-400 font-medium">
                            <Calendar className="h-3 w-3" />
                            Kontrol: {p.nextControlDate ? formatDate(p.nextControlDate) : tomorrowFormatted}
                          </span>
                          <span>•</span>
                          <span className="text-slate-600 dark:text-slate-400">
                            DPJP: {p.controlDoctor || "drg. Pratama Wijaya"}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 self-end sm:self-center">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleCopyLink(p)}
                        className="h-8 text-xs gap-1 border-slate-200 hover:border-slate-300"
                        title="Salin tautan wa.me"
                      >
                        {copiedUrlId === p.id ? (
                          <Check className="h-3.5 w-3.5 text-emerald-600" />
                        ) : (
                          <Copy className="h-3.5 w-3.5 text-slate-500" />
                        )}
                        <span className="hidden sm:inline">Salin Link</span>
                      </Button>

                      <Button
                        size="sm"
                        onClick={() => handleOpenWhatsApp(p)}
                        className={`h-8 text-xs gap-1.5 font-semibold text-white shadow-xs ${
                          isSent
                            ? "bg-slate-700 hover:bg-slate-800"
                            : "bg-emerald-600 hover:bg-emerald-700"
                        }`}
                      >
                        <MessageSquare className="h-3.5 w-3.5" />
                        <span>{isSent ? "Kirim Ulang WA" : "Kirim WA Web"}</span>
                        <ExternalLink className="h-3 w-3 opacity-70" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500">
          <p className="text-[11px] text-slate-400">
            Format URL: <code className="font-mono text-emerald-600 dark:text-emerald-400">https://wa.me/628xxx?text=...</code>
          </p>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onOpenChange(false)}
          >
            Tutup Jendela
          </Button>
        </div>
      </div>

      {/* WhatsApp Gateway QR Code Dialog */}
      <WhatsAppGatewayDialog
        open={isGatewayDialogOpen}
        onOpenChange={(isOpen) => {
          setIsGatewayDialogOpen(isOpen);
          if (!isOpen) {
            fetchGatewayStatus();
          }
        }}
      />
    </Dialog>
  );
}
