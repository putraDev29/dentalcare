"use client";

import * as React from "react";
import {
  Printer,
  Share2,
  Copy,
  Check,
  Send,
  Phone,
  User,
  ShieldAlert,
  FileText,
  CheckCircle2,
  ExternalLink,
  Radio,
  Clock,
  Sparkles,
  Receipt,
  X,
  CreditCard,
  QrCode,
  Building2,
  Download,
} from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Invoice, Patient } from "@/types";
import { formatCurrency, formatDate } from "@/lib/formatting";
import { formatWhatsAppPhone } from "./whatsapp-reminder-modal";
import { generateInvoicePdf } from "@/lib/pdf/invoice-pdf";
import { appConfig } from "@/config/app-config";
import { apiClient } from "@/lib/api/client";
import { API_ENDPOINTS } from "@/lib/api/endpoints";
import { toast } from "sonner";

interface PaymentReceiptModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  invoice: Invoice | null;
}

export function PaymentReceiptModal({
  open,
  onOpenChange,
  invoice,
}: PaymentReceiptModalProps) {
  const [patientData, setPatientData] = React.useState<Patient | null>(null);
  const [loadingPatient, setLoadingPatient] = React.useState(false);

  // Recipient selection: "patient" | "emergency" | "custom"
  const [recipientType, setRecipientType] = React.useState<"patient" | "emergency" | "custom">("patient");
  const [customPhone, setCustomPhone] = React.useState("");
  const [customNote, setCustomNote] = React.useState("");

  // Gateway status
  const [gatewayStatus, setGatewayStatus] = React.useState<any>(null);
  const [isGatewaySending, setIsGatewaySending] = React.useState(false);
  const [copied, setCopied] = React.useState(false);

  // Active view tab: "receipt" (preview fisik) vs "share" (whatsapp share)
  const [activeView, setActiveView] = React.useState<"receipt" | "share">("receipt");

  // Fetch patient information if not already attached on invoice
  React.useEffect(() => {
    if (open && invoice?.patientId) {
      if (!invoice.patientPhone || !invoice.emergencyContact) {
        setLoadingPatient(true);
        apiClient
          .get<Patient>(`${API_ENDPOINTS.patients}/${invoice.patientId}`)
          .then((res) => {
            if (res) {
              setPatientData(res);
            }
          })
          .catch((err) => {
            console.error("Gagal memuat kontak pasien untuk nota", err);
          })
          .finally(() => {
            setLoadingPatient(false);
          });
      }
    }
  }, [open, invoice?.patientId, invoice?.patientPhone, invoice?.emergencyContact]);

  // Check WA gateway status when modal opens
  React.useEffect(() => {
    if (open) {
      fetch(`${appConfig.apiUrl}/whatsapp/status`)
        .then((res) => res.json())
        .then((data) => setGatewayStatus(data))
        .catch(() => setGatewayStatus({ status: "OFFLINE", connected: false }));
    }
  }, [open]);

  if (!invoice) return null;

  // Resolve patient contact numbers
  const patientPhone = invoice.patientPhone || patientData?.phone || "";
  const emergencyContact = invoice.emergencyContact || patientData?.emergencyContact || null;
  const emergencyPhone = emergencyContact?.phone || "";

  // Get active recipient target phone
  const getTargetPhone = (): string => {
    if (recipientType === "patient") return patientPhone;
    if (recipientType === "emergency") return emergencyPhone;
    return customPhone;
  };

  const getRecipientLabel = (): string => {
    if (recipientType === "patient") {
      return `Pasien: ${invoice.patientName}`;
    }
    if (recipientType === "emergency") {
      return `Kontak Darurat: ${emergencyContact?.name || "Keluarga"} (${emergencyContact?.relationship || "Kerabat"})`;
    }
    return `Nomor Kustom: ${customPhone || "Belum diisi"}`;
  };

  // Payment transaction metadata
  const latestTransaction = invoice.transactions && invoice.transactions.length > 0
    ? invoice.transactions[invoice.transactions.length - 1]
    : null;

  const paymentMethodLabel = (() => {
    const method = latestTransaction?.paymentMethod || "qris";
    switch (method) {
      case "qris":
        return "QRIS";
      case "cash":
        return "Tunai (Cash)";
      case "debit_card":
        return "Kartu Debit";
      case "credit_card":
        return "Kartu Kredit";
      case "bank_transfer":
        return "Transfer Bank";
      case "bpjs":
        return "BPJS Kesehatan Dental";
      case "insurance":
        return "Asuransi Swasta";
      default:
        return String(method).toUpperCase();
    }
  })();

  const cashierName = latestTransaction?.cashierName || "Kasir Dental Care";
  const transactionTime = latestTransaction?.paidAt
    ? new Date(latestTransaction.paidAt).toLocaleTimeString("id-ID", {
        hour: "2-digit",
        minute: "2-digit",
      }) + " WIB"
    : new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }) + " WIB";

  // Build the formatted WhatsApp message
  const buildWhatsAppMessage = () => {
    const itemsList = invoice.items
      .map(
        (it, idx) =>
          `${idx + 1}. *${it.description}* (x${it.quantity})\n   Rp ${it.totalPrice.toLocaleString("id-ID")}`
      )
      .join("\n");

    const notePart = customNote.trim()
      ? `\n💬 *Catatan Khusus:*\n${customNote.trim()}\n─────────────────────────\n`
      : "";

    const insurancePart =
      invoice.insuranceCoverage > 0
        ? `Tanggungan Asuransi: -Rp ${invoice.insuranceCoverage.toLocaleString("id-ID")}\n`
        : "";

    return `🧾 *BUKTI PEMBAYARAN & NOTA KASIR*
*DENTAL CARE CLINIC*
_Klinik Gigi & Spesialis Konservasi / Ortodonsia_
Jl. Kesehatan No. 45, Jakarta Pusat | Telp: (021) 555-DENTAL
─────────────────────────
📄 *No. Invoice:* ${invoice.invoiceNumber}
📅 *Tanggal:* ${formatDate(invoice.invoiceDate)}
⏰ *Waktu:* ${transactionTime}
👨‍💼 *Kasir:* ${cashierName}
💳 *Metode:* ${paymentMethodLabel}

👤 *Data Pasien:*
• Nama: *${invoice.patientName}*
• No. RM: *${invoice.patientMrn}*
• No. HP/WA: ${patientPhone || "-"}

📋 *Rincian Layanan & Tindakan Gigi:*
${itemsList}

─────────────────────────
Subtotal Layanan: Rp ${invoice.subtotal.toLocaleString("id-ID")}
${insurancePart}*TOTAL BIAYA:* *Rp ${invoice.totalAmount.toLocaleString("id-ID")}*
*DIBAYAR:* *Rp ${(invoice.paidAmount || invoice.totalAmount).toLocaleString("id-ID")}*
*SISA TAGIHAN:* *Rp 0 (LUNAS)* ✅
─────────────────────────${notePart}
Terima kasih telah mempercayakan perawatan kesehatan gigi Anda kepada *Dental Care Clinic*.
Semoga lekas sembuh dan senyum sehat selalu! 🙏🦷

_Simpan pesan ini sebagai bukti pembayaran dan transaksi kasir yang sah._`;
  };

  // 1. Direct Click-to-Chat (wa.me) dengan unduhan PDF otomatis
  const handleSendViaWhatsAppWeb = () => {
    const rawPhone = getTargetPhone();
    if (!rawPhone) {
      toast.error("Nomor tujuan WhatsApp belum tersedia atau belum diisi!");
      return;
    }
    const clean = formatWhatsAppPhone(rawPhone);
    if (!clean || clean.length < 10) {
      toast.error("Nomor WhatsApp tidak valid. Pastikan minimal 10 digit.");
      return;
    }

    try {
      // Otomatis unduh PDF invoice agar staf bisa langsung attach ke chat WhatsApp Web
      const pdf = generateInvoicePdf(invoice, {
        cashierName,
        paymentMethod: paymentMethodLabel,
        clinicName: "OKAY DENTAL CLINIC",
      });
      pdf.download();
    } catch (e) {}

    const msg = encodeURIComponent(buildWhatsAppMessage());
    const url = `https://wa.me/${clean}?text=${msg}`;
    window.open(url, "_blank", "noopener,noreferrer");
    toast.success(`Berkas PDF diunduh & WhatsApp terbuka untuk dikirim ke ${getRecipientLabel()}!`);
  };

  // 2. Direct Gateway Send via WPPConnect API (Mengirim Berkas PDF Invoice)
  const handleSendViaGateway = async () => {
    const rawPhone = getTargetPhone();
    if (!rawPhone) {
      toast.error("Nomor tujuan WhatsApp belum tersedia!");
      return;
    }
    const clean = formatWhatsAppPhone(rawPhone);
    if (!clean || clean.length < 10) {
      toast.error("Nomor WhatsApp tidak valid!");
      return;
    }

    setIsGatewaySending(true);
    try {
      // 1. Generate PDF file as base64
      const pdf = generateInvoicePdf(invoice, {
        cashierName,
        paymentMethod: paymentMethodLabel,
        clinicName: "OKAY DENTAL CLINIC",
      });
      const pdfBase64 = pdf.getBase64();

      const caption = `Halo Kak *${invoice.patientName}*,\n\nTerlampir berkas *PDF Bukti Pembayaran (Invoice)* resmi dari *OKAY Dental Clinic* untuk transaksi No. *${invoice.invoiceNumber}* sebesar *${formatCurrency(invoice.totalAmount)}* (LUNAS).\n\nTerima kasih atas kepercayaannya. Semoga lekas sembuh & senyum sehat selalu! 🙏🦷`;

      // 2. Kirim berkas PDF via endpoint /whatsapp/send-file
      const res = await fetch(`${appConfig.apiUrl}/whatsapp/send-file`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone: clean,
          file: pdfBase64,
          filename: `Nota_${invoice.invoiceNumber}.pdf`,
          caption: caption,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success !== false) {
        toast.success(`Berkas PDF Nota berhasil dikirim via WA Gateway ke ${getRecipientLabel()}!`);
      } else {
        toast.warning(
          data.message || "Gateway offline atau tidak tersambung. Mengalihkan ke WhatsApp Web..."
        );
        handleSendViaWhatsAppWeb();
      }
    } catch {
      toast.info("Koneksi gateway tidak tersedia, mengalihkan ke WhatsApp Web...");
      handleSendViaWhatsAppWeb();
    } finally {
      setIsGatewaySending(false);
    }
  };

  // 3. Copy Nota Text to Clipboard
  const handleCopyText = async () => {
    try {
      await navigator.clipboard.writeText(buildWhatsAppMessage());
      setCopied(true);
      toast.success("Teks nota pembayaran berhasil disalin ke clipboard!");
      setTimeout(() => setCopied(false), 2500);
    } catch {
      toast.error("Gagal menyalin teks ke clipboard.");
    }
  };

  // 4. Unduh Berkas PDF Nota Kasir
  const handleDownloadPdf = () => {
    try {
      const pdf = generateInvoicePdf(invoice, {
        cashierName,
        paymentMethod: paymentMethodLabel,
        clinicName: "OKAY DENTAL CLINIC",
      });
      pdf.download();
      toast.success("Berkas PDF Nota pembayaran berhasil diunduh!");
    } catch (err: any) {
      toast.error("Gagal membuat berkas PDF: " + err.message);
    }
  };

  // 5. Print Receipt ke Thermal Printer
  const handlePrint = () => {
    window.print();
  };

  const isGatewayConnected = !!(gatewayStatus?.connected || gatewayStatus?.status === "CONNECTED");

  return (
    <>
      {/* Hidden Global Print Stylesheet for thermal 58mm printer */}
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden !important;
          }
          #printable-thermal-receipt,
          #printable-thermal-receipt * {
            visibility: visible !important;
          }
          #printable-thermal-receipt {
            position: fixed !important;
            left: 0 !important;
            top: 0 !important;
            width: 48mm !important;
            max-width: 48mm !important;
            margin: 0 !important;
            padding: 2mm 1mm !important;
            background: white !important;
            color: black !important;
            box-shadow: none !important;
            border: none !important;
            font-family: "Courier New", Courier, monospace !important;
            font-size: 9px !important;
            line-height: 1.25 !important;
            display: block !important;
          }
          @page {
            size: 58mm auto;
            margin: 0;
          }
        }
      `}</style>

      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl p-0 overflow-hidden rounded-2xl bg-white dark:bg-slate-900 shadow-2xl border border-slate-200 dark:border-slate-800">
          {/* Modal Header */}
          <div className="flex flex-wrap items-center justify-between border-b border-slate-100 bg-gradient-to-r from-teal-50/90 via-sky-50/60 to-white px-5 py-4 dark:border-slate-800 dark:from-teal-950/40 dark:via-sky-950/20 dark:bg-slate-900">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-600 text-white shadow-xs">
                <Receipt className="h-5 w-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                    Bukti Pembayaran &amp; Nota Kasir
                  </h3>
                  <span className="rounded-full bg-emerald-100 border border-emerald-300 px-2 py-0.5 text-[11px] font-bold text-emerald-800 dark:bg-emerald-950/60 dark:border-emerald-700 dark:text-emerald-300 flex items-center gap-1">
                    <CheckCircle2 className="h-3 w-3" />
                    LUNAS
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  No. Invoice: <strong className="font-mono text-teal-700 dark:text-teal-400">{invoice.invoiceNumber}</strong> • Pasien: <strong>{invoice.patientName}</strong> ({invoice.patientMrn})
                </p>
              </div>
            </div>

            {/* Quick Mode Toggle */}
            <div className="flex items-center gap-1.5 rounded-xl bg-white/80 p-1 border border-teal-200/60 shadow-2xs dark:bg-slate-800 dark:border-slate-700">
              <button
                type="button"
                onClick={() => setActiveView("receipt")}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                  activeView === "receipt"
                    ? "bg-teal-600 text-white shadow-xs"
                    : "text-slate-600 hover:text-teal-700 dark:text-slate-400"
                }`}
              >
                <Printer className="h-3.5 w-3.5" />
                <span>Pratinjau Nota Fisik</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveView("share")}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                  activeView === "share"
                    ? "bg-emerald-600 text-white shadow-xs"
                    : "text-slate-600 hover:text-emerald-700 dark:text-slate-400"
                }`}
              >
                <Share2 className="h-3.5 w-3.5" />
                <span>Share WhatsApp</span>
              </button>
            </div>
          </div>

          {/* Modal Body */}
          <div className="p-5 max-h-[75vh] overflow-y-auto space-y-5">
            {activeView === "receipt" ? (
              /* ================= VIEW 1: PRATINJAU NOTA FISIK / CETAK ================= */
              <div className="space-y-4">
                <div className="flex flex-wrap items-center justify-between bg-slate-50 dark:bg-slate-800/40 p-3 rounded-xl border border-slate-200 dark:border-slate-700 text-xs gap-2">
                  <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                    <Printer className="h-4 w-4 text-teal-600" />
                    <span>
                      Format nota dioptimalkan untuk <strong>Printer Kasir Thermal 58 mm</strong> &amp; Ekspor PDF.
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      onClick={handleDownloadPdf}
                      variant="outline"
                      className="h-8 text-xs border-sky-300 text-sky-700 hover:bg-sky-50 gap-1.5 font-semibold"
                    >
                      <Download className="h-3.5 w-3.5" />
                      <span>Unduh PDF Nota</span>
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => setActiveView("share")}
                      variant="outline"
                      className="h-8 text-xs border-emerald-300 text-emerald-700 hover:bg-emerald-50 gap-1.5 font-semibold"
                    >
                      <Share2 className="h-3.5 w-3.5" />
                      <span>Kirim PDF ke WhatsApp</span>
                    </Button>
                    <Button
                      size="sm"
                      onClick={handlePrint}
                      className="h-8 text-xs bg-teal-600 hover:bg-teal-700 text-white gap-1.5 shadow-xs font-semibold"
                    >
                      <Printer className="h-3.5 w-3.5" />
                      <span>Cetak Nota 58mm</span>
                    </Button>
                  </div>
                </div>

                {/* Printable Receipt Card - Optimized for 58mm Thermal Printer */}
                <div className="flex justify-center">
                  <div
                    id="printable-thermal-receipt"
                    className="w-full max-w-[320px] bg-white border border-slate-300 rounded-xl p-4 shadow-sm text-slate-900 space-y-3 font-mono text-[11px] leading-snug dark:bg-slate-950 dark:text-slate-100 dark:border-slate-800"
                  >
                    {/* Clinic Branding Header */}
                    <div className="text-center pb-2 border-b border-dashed border-slate-400 dark:border-slate-700 space-y-0.5">
                      <div className="flex items-center justify-center gap-1.5 font-black text-sm uppercase tracking-tight text-slate-900 dark:text-white">
                        <Sparkles className="h-4 w-4 text-sky-600 inline shrink-0" />
                        <span>OKAY DENTAL CLINIC</span>
                      </div>
                      <p className="text-[10px] text-slate-600 font-medium">
                        Klinik Gigi &amp; Spesialis Konservasi
                      </p>
                      <p className="text-[9.5px] text-slate-500">
                        Jl. Kesehatan No. 45, Jakarta Pusat
                      </p>
                      <p className="text-[9.5px] text-slate-500">
                        Telp: (021) 555-DENTAL
                      </p>
                    </div>

                    {/* Receipt Status & Metadata */}
                    <div className="space-y-1 text-[10.5px] py-1 border-b border-dashed border-slate-400 dark:border-slate-700">
                      <div className="flex justify-between items-center font-bold">
                        <span>BUKTI TRANSAKSI KASIR</span>
                        <span className="text-[10px] font-black border border-emerald-600 text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded dark:bg-emerald-950 dark:text-emerald-300">
                          LUNAS
                        </span>
                      </div>
                      <div className="flex justify-between text-slate-600 dark:text-slate-400">
                        <span>No. Nota:</span>
                        <span className="font-bold text-slate-900 dark:text-slate-100">
                          {invoice.invoiceNumber}
                        </span>
                      </div>
                      <div className="flex justify-between text-slate-600 dark:text-slate-400">
                        <span>Tgl &amp; Waktu:</span>
                        <span>{formatDate(invoice.invoiceDate)}, {transactionTime}</span>
                      </div>
                      <div className="flex justify-between text-slate-600 dark:text-slate-400">
                        <span>Kasir:</span>
                        <span>{cashierName}</span>
                      </div>
                      <div className="flex justify-between text-slate-600 dark:text-slate-400">
                        <span>Pasien:</span>
                        <span className="font-bold text-slate-900 dark:text-slate-100 truncate max-w-[170px]">
                          {invoice.patientName}
                        </span>
                      </div>
                      <div className="flex justify-between text-slate-600 dark:text-slate-400">
                        <span>No. RM:</span>
                        <span className="font-bold text-sky-700 dark:text-sky-400">
                          {invoice.patientMrn}
                        </span>
                      </div>
                      {patientPhone && (
                        <div className="flex justify-between text-slate-600 dark:text-slate-400">
                          <span>No. HP:</span>
                          <span>{patientPhone}</span>
                        </div>
                      )}
                      <div className="flex justify-between text-slate-600 dark:text-slate-400">
                        <span>Metode Bayar:</span>
                        <span className="font-semibold text-teal-700 dark:text-teal-400">
                          {paymentMethodLabel}
                        </span>
                      </div>
                    </div>

                    {/* Itemized Table (2-Row Layout for 58mm Thermal Printers) */}
                    <div className="py-1 border-b border-dashed border-slate-400 dark:border-slate-700 space-y-1.5">
                      <div className="flex justify-between text-[10px] font-bold text-slate-700 dark:text-slate-300 pb-0.5 border-b border-slate-200 dark:border-slate-800">
                        <span>LAYANAN / TINDAKAN</span>
                        <span>SUBTOTAL</span>
                      </div>
                      {invoice.items.map((it, idx) => (
                        <div key={idx} className="text-[10px] space-y-0.5">
                          <div className="font-semibold text-slate-900 dark:text-white break-words leading-tight">
                            {idx + 1}. {it.description}
                          </div>
                          <div className="flex justify-between text-slate-600 dark:text-slate-400 pl-3">
                            <span>{it.quantity} x {formatCurrency(it.unitPrice)}</span>
                            <span className="font-bold text-slate-900 dark:text-white font-mono">
                              {formatCurrency(it.totalPrice)}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Financial Summary */}
                    <div className="space-y-1 text-[10.5px] py-1 border-b border-dashed border-slate-400 dark:border-slate-700">
                      <div className="flex justify-between text-slate-600 dark:text-slate-400">
                        <span>Subtotal:</span>
                        <span className="font-mono">{formatCurrency(invoice.subtotal)}</span>
                      </div>
                      {invoice.insuranceCoverage > 0 && (
                        <div className="flex justify-between text-teal-700 dark:text-teal-400">
                          <span>Asuransi/BPJS:</span>
                          <span className="font-mono">- {formatCurrency(invoice.insuranceCoverage)}</span>
                        </div>
                      )}
                      {invoice.discount > 0 && (
                        <div className="flex justify-between text-emerald-600">
                          <span>Diskon Klinik:</span>
                          <span className="font-mono">- {formatCurrency(invoice.discount)}</span>
                        </div>
                      )}
                      <div className="flex justify-between font-black text-xs pt-1 border-t border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white">
                        <span>TOTAL BAYAR:</span>
                        <span className="font-mono text-sky-700 dark:text-sky-400">
                          {formatCurrency(invoice.totalAmount)}
                        </span>
                      </div>
                      <div className="flex justify-between text-slate-700 dark:text-slate-300">
                        <span>Jumlah Bayar:</span>
                        <span className="font-mono font-bold">
                          {formatCurrency(invoice.paidAmount || invoice.totalAmount)}
                        </span>
                      </div>
                      <div className="flex justify-between text-slate-600 dark:text-slate-400">
                        <span>Kembali / Sisa:</span>
                        <span className="font-mono font-bold text-emerald-600">Rp 0 (LUNAS)</span>
                      </div>
                    </div>

                    {/* Footer / Thank you */}
                    <div className="text-center pt-2 space-y-0.5 text-[9.5px] text-slate-500">
                      <p className="font-bold text-slate-800 dark:text-slate-200">
                        Terima kasih atas kunjungan Anda!
                      </p>
                      <p>
                        Semoga senyum sehat selalu menyertai Anda. 🙏🦷
                      </p>
                      <p className="text-[8.5px] text-slate-400 pt-1 font-mono">
                        === Simpan nota ini sebagai bukti sah ===
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              /* ================= VIEW 2: SHARE KE WHATSAPP ================= */
              <div className="space-y-4">
                {/* Recipient Selection Header */}
                <div className="rounded-xl border border-emerald-200 bg-emerald-50/70 p-3.5 text-xs dark:border-emerald-900/60 dark:bg-emerald-950/30">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Share2 className="h-4 w-4 text-emerald-700 dark:text-emerald-400" />
                      <span className="font-bold text-emerald-950 dark:text-emerald-200 text-sm">
                        Kirim Nota Pembayaran ke Nomor WhatsApp
                      </span>
                    </div>
                    {isGatewayConnected ? (
                      <span className="rounded-full bg-emerald-200/70 border border-emerald-400 px-2 py-0.5 text-[10px] font-bold text-emerald-900 dark:bg-emerald-900/60 dark:text-emerald-200 flex items-center gap-1">
                        <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                        WA Gateway Terhubung
                      </span>
                    ) : (
                      <span className="rounded-full bg-slate-100 border border-slate-300 px-2 py-0.5 text-[10px] font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                        Direct Click-to-Chat (wa.me)
                      </span>
                    )}
                  </div>
                  <p className="text-slate-600 dark:text-slate-400 mt-1">
                    Pilih tujuan pengiriman bukti transaksi: dapat dikirim langsung ke <strong>Nomor Pasien</strong> atau ke <strong>Nomor Kontak Darurat (Keluarga/Penjamin)</strong> yang terdaftar.
                  </p>
                </div>

                {/* Recipient Options Radio Grid */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Pilih Nomor Tujuan Pengiriman:
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    {/* Option 1: Nomor Pasien */}
                    <div
                      onClick={() => setRecipientType("patient")}
                      className={`p-3 rounded-xl border text-xs cursor-pointer transition-all ${
                        recipientType === "patient"
                          ? "border-emerald-500 bg-emerald-50/70 ring-1 ring-emerald-500 dark:bg-emerald-950/40"
                          : "border-slate-200 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800/40"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-1.5 font-bold text-slate-800 dark:text-slate-200">
                          <User className="h-3.5 w-3.5 text-emerald-600" />
                          <span>Nomor Pasien</span>
                        </div>
                        <input
                          type="radio"
                          name="recipientType"
                          checked={recipientType === "patient"}
                          onChange={() => setRecipientType("patient")}
                          className="accent-emerald-600"
                        />
                      </div>
                      <p className="font-semibold text-slate-900 dark:text-slate-100 truncate">
                        {invoice.patientName}
                      </p>
                      <p className="font-mono text-slate-500 mt-0.5">
                        {patientPhone || "(Belum terdaftar)"}
                      </p>
                    </div>

                    {/* Option 2: Nomor Kontak Darurat */}
                    <div
                      onClick={() => {
                        if (emergencyPhone) {
                          setRecipientType("emergency");
                        } else {
                          toast.info("Pasien ini belum memiliki nomor kontak darurat terdaftar.");
                        }
                      }}
                      className={`p-3 rounded-xl border text-xs transition-all ${
                        !emergencyPhone
                          ? "opacity-60 bg-slate-50 border-slate-200 cursor-not-allowed dark:bg-slate-900/50 dark:border-slate-800"
                          : recipientType === "emergency"
                          ? "border-emerald-500 bg-emerald-50/70 ring-1 ring-emerald-500 cursor-pointer dark:bg-emerald-950/40"
                          : "border-slate-200 hover:bg-slate-50 cursor-pointer dark:border-slate-800 dark:hover:bg-slate-800/40"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-1.5 font-bold text-slate-800 dark:text-slate-200">
                          <ShieldAlert className="h-3.5 w-3.5 text-amber-600" />
                          <span>Kontak Darurat</span>
                        </div>
                        <input
                          type="radio"
                          name="recipientType"
                          disabled={!emergencyPhone}
                          checked={recipientType === "emergency"}
                          onChange={() => setRecipientType("emergency")}
                          className="accent-emerald-600"
                        />
                      </div>
                      <p className="font-semibold text-slate-900 dark:text-slate-100 truncate">
                        {emergencyContact?.name || "Keluarga/Penjamin"}
                        {emergencyContact?.relationship ? ` (${emergencyContact.relationship})` : ""}
                      </p>
                      <p className="font-mono text-slate-500 mt-0.5">
                        {emergencyPhone || "(Tidak ada no. darurat)"}
                      </p>
                    </div>

                    {/* Option 3: Nomor Kustom */}
                    <div
                      onClick={() => setRecipientType("custom")}
                      className={`p-3 rounded-xl border text-xs cursor-pointer transition-all ${
                        recipientType === "custom"
                          ? "border-emerald-500 bg-emerald-50/70 ring-1 ring-emerald-500 dark:bg-emerald-950/40"
                          : "border-slate-200 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800/40"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-1.5 font-bold text-slate-800 dark:text-slate-200">
                          <Phone className="h-3.5 w-3.5 text-teal-600" />
                          <span>Nomor Lain (Kustom)</span>
                        </div>
                        <input
                          type="radio"
                          name="recipientType"
                          checked={recipientType === "custom"}
                          onChange={() => setRecipientType("custom")}
                          className="accent-emerald-600"
                        />
                      </div>
                      <p className="text-slate-600 dark:text-slate-400">
                        Ketik nomor WhatsApp lain
                      </p>
                      <p className="font-mono text-slate-500 mt-0.5">
                        {customPhone || "08xxxxxxxxxx"}
                      </p>
                    </div>
                  </div>

                  {recipientType === "custom" && (
                    <div className="pt-1">
                      <Input
                        value={customPhone}
                        onChange={(e) => setCustomPhone(e.target.value)}
                        placeholder="Masukkan nomor WhatsApp tujuan (contoh: 081234567890)..."
                        className="text-xs h-9 font-mono"
                      />
                    </div>
                  )}
                </div>

                {/* Optional Custom Note */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Tambahkan Catatan Tambahan (Opsional):
                  </label>
                  <Input
                    value={customNote}
                    onChange={(e) => setCustomNote(e.target.value)}
                    placeholder="Contoh: Jadwal kontrol lepas jahitan tanggal 21 Oktober 2026..."
                    className="text-xs h-8"
                  />
                </div>

                {/* Live Message Preview */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                      <FileText className="h-3.5 w-3.5 text-teal-600" />
                      <span>Pratinjau Pesan WhatsApp:</span>
                    </label>
                    <span className="text-[11px] text-slate-500 font-mono">
                      Tujuan: <strong>{getTargetPhone() || "Belum dipilih"}</strong>
                    </span>
                  </div>
                  <div className="relative rounded-xl border border-slate-200 bg-slate-50 p-3.5 dark:border-slate-800 dark:bg-slate-900/60 font-mono text-xs text-slate-800 dark:text-slate-200 whitespace-pre-wrap max-h-56 overflow-y-auto leading-relaxed shadow-inner">
                    {buildWhatsAppMessage()}
                  </div>
                </div>

                {/* Action Buttons for Sharing */}
                <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleCopyText}
                      className="h-8 text-xs gap-1.5 text-slate-700 border-slate-300 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300"
                    >
                      {copied ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                      <span>{copied ? "Tersalin!" : "Salin Pesan Nota"}</span>
                    </Button>
                  </div>

                  <div className="flex items-center gap-2">
                    {isGatewayConnected && (
                      <Button
                        size="sm"
                        onClick={handleSendViaGateway}
                        isLoading={isGatewaySending}
                        className="h-8 text-xs bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5 font-semibold shadow-xs"
                        title="Kirim otomatis dari nomor WhatsApp resmi klinik"
                      >
                        <Send className="h-3.5 w-3.5" />
                        <span>Kirim via WA Gateway Klinik</span>
                      </Button>
                    )}
                    <Button
                      size="sm"
                      onClick={handleSendViaWhatsAppWeb}
                      className="h-8 text-xs bg-teal-600 hover:bg-teal-700 text-white gap-1.5 font-semibold shadow-xs"
                      title="Buka WhatsApp Web atau WhatsApp Desktop dengan pesan nota yang siap dikirim"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                      <span>Buka Chat WhatsApp (wa.me)</span>
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Modal Footer */}
          <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50/50 px-5 py-3 dark:border-slate-800 dark:bg-slate-900">
            <span className="text-[11px] text-slate-500">
              Dental Care Clinic Kasir &amp; Billing Module
            </span>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onOpenChange(false)}
                className="text-xs h-8"
              >
                Tutup
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
