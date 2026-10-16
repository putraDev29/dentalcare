"use client";

import * as React from "react";
import Link from "next/link";
import { Receipt, CreditCard, CheckCircle2, QrCode, FileText, ArrowRight } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { DataTable } from "@/components/shared/data-table";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { StatusBadge } from "@/components/shared/status-badge";
import { useBilling } from "@/hooks";
import { Invoice } from "@/types";
import { formatCurrency, formatDate } from "@/lib/formatting";
import { ColumnDef } from "@tanstack/react-table";
import { toast } from "sonner";
import { PaymentReceiptModal } from "@/components/dental/payment-receipt-modal";

export default function BillingPage() {
  const { invoices, recordPayment } = useBilling();
  const [selectedInvoice, setSelectedInvoice] = React.useState<Invoice | null>(null);
  const [isPaymentOpen, setIsPaymentOpen] = React.useState(false);
  const [paymentMethod, setPaymentMethod] = React.useState<string>("qris");
  const [paying, setPaying] = React.useState(false);

  // Receipt Modal State for Printing & WhatsApp Sharing
  const [receiptInvoice, setReceiptInvoice] = React.useState<Invoice | null>(null);
  const [isReceiptOpen, setIsReceiptOpen] = React.useState(false);

  const handleOpenPayment = (inv: Invoice) => {
    setSelectedInvoice(inv);
    setIsPaymentOpen(true);
  };

  const handleOpenReceipt = (inv: Invoice) => {
    setReceiptInvoice(inv);
    setIsReceiptOpen(true);
  };

  const handleProcessPayment = async () => {
    if (!selectedInvoice) return;
    setPaying(true);
    try {
      const updated = await recordPayment(
        selectedInvoice.id,
        paymentMethod,
        selectedInvoice.balanceAmount,
        "Dewi Kartika - Kasir"
      );
      toast.success(
        `Pembayaran invoice ${selectedInvoice.invoiceNumber} sebesar ${formatCurrency(selectedInvoice.balanceAmount)} berhasil! Nota siap dicetak & dibagikan ke WhatsApp.`
      );
      setIsPaymentOpen(false);

      // Automatically pop open the digital receipt / invoice modal!
      const completedInvoice: Invoice = updated || {
        ...selectedInvoice,
        paidAmount: selectedInvoice.totalAmount,
        balanceAmount: 0,
        status: "paid",
      };
      setReceiptInvoice(completedInvoice);
      setIsReceiptOpen(true);
      setSelectedInvoice(null);
    } catch {
      toast.error("Gagal memproses pembayaran.");
    } finally {
      setPaying(false);
    }
  };

  const columns: ColumnDef<Invoice>[] = [
    {
      accessorKey: "invoiceNumber",
      header: "No. Invoice",
      cell: ({ row }) => (
        <span className="font-mono text-xs font-semibold text-teal-700">
          {row.original.invoiceNumber}
        </span>
      ),
    },
    {
      accessorKey: "patientName",
      header: "Pasien",
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
      accessorKey: "invoiceDate",
      header: "Tanggal",
      cell: ({ row }) => (
        <span className="text-xs text-slate-600">{formatDate(row.original.invoiceDate)}</span>
      ),
    },
    {
      accessorKey: "totalAmount",
      header: "Total Tagihan",
      cell: ({ row }) => (
        <span className="font-mono font-bold text-xs text-slate-900 dark:text-slate-100">
          {formatCurrency(row.original.totalAmount)}
        </span>
      ),
    },
    {
      accessorKey: "insuranceCoverage",
      header: "Jaminan Asuransi",
      cell: ({ row }) => (
        <span className="font-mono text-xs text-teal-700 dark:text-teal-400">
          {formatCurrency(row.original.insuranceCoverage)}
        </span>
      ),
    },
    {
      accessorKey: "patientResponsibility",
      header: "Tanggungan Pasien",
      cell: ({ row }) => (
        <span className="font-mono font-bold text-xs text-amber-700 dark:text-amber-400">
          {formatCurrency(row.original.patientResponsibility)}
        </span>
      ),
    },
    {
      accessorKey: "balanceAmount",
      header: "Sisa Belum Bayar",
      cell: ({ row }) => (
        <span className={`font-mono font-bold text-xs ${row.original.balanceAmount > 0 ? "text-rose-600" : "text-emerald-600"}`}>
          {formatCurrency(row.original.balanceAmount)}
        </span>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => <StatusBadge type="invoice" status={row.original.status} />,
    },
    {
      id: "actions",
      header: "Aksi",
      cell: ({ row }) => {
        const inv = row.original;
        const isPaid = inv.balanceAmount <= 0 || inv.status === "paid";
        return (
          <div className="flex items-center gap-1.5">
            {isPaid ? (
              <>
                <Button
                  size="sm"
                  className="h-7 text-xs bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5 shadow-xs font-semibold"
                  onClick={() => handleOpenReceipt(inv)}
                  title="Cetak nota kuitansi atau bagikan ke nomor WhatsApp pasien / kontak darurat"
                >
                  <Receipt className="h-3.5 w-3.5" />
                  <span>Nota &amp; WA</span>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7 text-xs text-slate-600"
                  onClick={() => handleOpenPayment(inv)}
                >
                  Rincian
                </Button>
              </>
            ) : (
              <>
                <Button
                  size="sm"
                  className="h-7 text-xs bg-teal-600 hover:bg-teal-700 text-white shadow-xs font-semibold"
                  onClick={() => handleOpenPayment(inv)}
                >
                  Bayar Kasir
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7 text-xs text-slate-600 gap-1"
                  onClick={() => handleOpenReceipt(inv)}
                  title="Pratinjau Nota & Share WA"
                >
                  <Receipt className="h-3 w-3" />
                  <span>Nota</span>
                </Button>
              </>
            )}
          </div>
        );
      },
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Kasir & Pembayaran Klinik Gigi"
        description="Penerbitan tagihan perawatan gigi terpadu (konsultasi drg., tindakan scaling/tambal/PSA, rontgen dental, resep obat gigi), verifikasi jaminan BPJS & asuransi dental, dan kasir pembayaran."
      >
        <Link href="/finance">
          <Button variant="outline" size="sm" className="h-8 text-xs border-teal-300 text-teal-700 bg-white hover:bg-teal-50 dark:bg-slate-900 dark:border-teal-800 dark:text-teal-300 gap-1.5 shadow-xs font-semibold">
            <span>Buku Kas Masuk & Laporan Keuangan</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Button>
        </Link>
      </PageHeader>

      {/* Kas Masuk Auto-Sync Banner */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-teal-200 bg-gradient-to-r from-teal-50/80 via-emerald-50/60 to-cyan-50/40 p-3.5 text-xs text-teal-900 dark:border-teal-900/60 dark:from-teal-950/40 dark:via-emerald-950/30 dark:to-cyan-950/20 dark:text-teal-200">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-teal-600 text-white shadow-xs">
            <CheckCircle2 className="h-4 w-4" />
          </div>
          <div>
            <p className="font-bold flex items-center gap-1.5">
              <span>Sinkronisasi Otomatis Kas Masuk Aktif</span>
              <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300">
                Otomatis Real-time
              </span>
            </p>
            <p className="text-[11px] text-teal-700 dark:text-teal-400">
              Setiap pelunasan tindakan dental &amp; obat di kasir langsung otomatis tercatat ke <strong>Buku Kas Masuk (Income)</strong> pada laporan keuangan klinik.
            </p>
          </div>
        </div>
        <Link href="/finance">
          <Button variant="outline" size="sm" className="h-7 text-xs border-teal-300 text-teal-700 bg-white hover:bg-teal-50 dark:bg-slate-900 dark:border-teal-800 dark:text-teal-300 gap-1 shadow-xs">
            <span>Lihat Buku Kas Masuk</span>
            <ArrowRight className="h-3 w-3" />
          </Button>
        </Link>
      </div>

      <DataTable
        columns={columns}
        data={invoices}
        searchPlaceholder="Cari nomor invoice, nama pasien, atau No RM..."
        emptyTitle="Tidak ada data invoice"
        emptyDescription="Tagihan pasien yang diterbitkan akan tampil di sini."
      />

      {/* Payment & Breakdown Modal */}
      {selectedInvoice && (
        <Dialog
          open={isPaymentOpen}
          onOpenChange={setIsPaymentOpen}
          title={`Rincian Tagihan: ${selectedInvoice.invoiceNumber}`}
          description={`Pasien: ${selectedInvoice.patientName} (${selectedInvoice.patientMrn})`}
        >
          <div className="space-y-4 text-xs">
            {/* Itemized List */}
            <div className="rounded-xl border border-slate-200 overflow-hidden dark:border-slate-800">
              <table className="w-full text-left">
                <thead className="bg-slate-50 text-slate-500 border-b border-slate-200 dark:bg-slate-800/60 dark:border-slate-800">
                  <tr>
                    <th className="p-2.5">Item Layanan</th>
                    <th className="p-2.5">Qty</th>
                    <th className="p-2.5 text-right">Subtotal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {selectedInvoice.items.map((item) => (
                    <tr key={item.id}>
                      <td className="p-2.5 font-medium">{item.description}</td>
                      <td className="p-2.5 font-mono">{item.quantity}</td>
                      <td className="p-2.5 font-mono text-right">{formatCurrency(item.totalPrice)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Calculations Breakdown */}
            <div className="rounded-xl bg-slate-50 p-3 space-y-1.5 dark:bg-slate-800/40">
              <div className="flex justify-between text-slate-600 dark:text-slate-400">
                <span>Subtotal Tindakan & Layanan Gigi</span>
                <span className="font-mono">{formatCurrency(selectedInvoice.subtotal)}</span>
              </div>
              <div className="flex justify-between text-teal-700 dark:text-teal-400 font-medium">
                <span>Tanggungan Jaminan Asuransi / BPJS</span>
                <span className="font-mono">- {formatCurrency(selectedInvoice.insuranceCoverage)}</span>
              </div>
              <div className="flex justify-between font-bold text-sm text-slate-900 dark:text-slate-100 pt-1 border-t border-slate-200 dark:border-slate-700">
                <span>Total Kewajiban Bayar Pasien</span>
                <span className="font-mono text-teal-700 dark:text-teal-400">
                  {formatCurrency(selectedInvoice.patientResponsibility)}
                </span>
              </div>
              {selectedInvoice.paidAmount > 0 && (
                <div className="flex justify-between text-emerald-600">
                  <span>Sudah Dibayar</span>
                  <span className="font-mono">{formatCurrency(selectedInvoice.paidAmount)}</span>
                </div>
              )}
              <div className="flex justify-between font-bold text-rose-600">
                <span>Sisa Tagihan Belum Lunas</span>
                <span className="font-mono">{formatCurrency(selectedInvoice.balanceAmount)}</span>
              </div>
            </div>

            {/* Kas Masuk Status Notice */}
            {selectedInvoice.balanceAmount > 0 ? (
              <div className="rounded-xl bg-teal-50 border border-teal-200 p-2.5 text-teal-800 dark:bg-teal-950/40 dark:border-teal-800 dark:text-teal-300 flex items-center gap-2 text-xs">
                <CheckCircle2 className="h-4 w-4 shrink-0 text-teal-600 dark:text-teal-400" />
                <span>Pelunasan kasir ini akan <strong>otomatis disinkronisasikan ke Buku Kas Masuk (Income)</strong> pada Laporan Keuangan klinik.</span>
              </div>
            ) : (
              <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-2.5 text-emerald-800 dark:bg-emerald-950/40 dark:border-emerald-800 dark:text-emerald-300 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  <span>Invoice ini telah lunas dan tercatat otomatis di <strong>Buku Kas Masuk</strong>.</span>
                </div>
                <Link href="/finance">
                  <Button variant="outline" size="sm" className="h-6 text-[11px] bg-white border-emerald-300 text-emerald-700 hover:bg-emerald-50 dark:bg-slate-900">
                    Lihat Kas Masuk
                  </Button>
                </Link>
              </div>
            )}

            {/* Payment Method Selector if balance > 0 */}
            {selectedInvoice.balanceAmount > 0 && (
              <div className="space-y-2 pt-1">
                <label className="font-bold text-slate-800 dark:text-slate-200">
                  Pilih Metode Pembayaran Kasir:
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { id: "qris", label: "QRIS", icon: QrCode },
                    { id: "debit_card", label: "Debit Card", icon: CreditCard },
                    { id: "cash", label: "Tunai (Cash)", icon: Receipt },
                    { id: "bank_transfer", label: "Transfer", icon: CheckCircle2 },
                  ].map((m) => {
                    const Icon = m.icon;
                    return (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => setPaymentMethod(m.id)}
                        className={`flex flex-col items-center justify-center p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                          paymentMethod === m.id
                            ? "border-teal-500 bg-teal-50 text-teal-800 font-bold dark:bg-teal-950/40 dark:text-teal-300"
                            : "border-slate-200 bg-white hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900"
                        }`}
                      >
                        <Icon className="h-4 w-4 mb-1 text-teal-600" />
                        <span>{m.label}</span>
                      </button>
                    );
                  })}
                </div>

                <div className="pt-3 flex justify-end gap-2">
                  <Button variant="outline" size="sm" onClick={() => setIsPaymentOpen(false)}>
                    Tutup
                  </Button>
                  <Button
                    size="sm"
                    className="bg-emerald-600 hover:bg-emerald-700 shadow-xs gap-1.5"
                    isLoading={paying}
                    onClick={handleProcessPayment}
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    <span>Konfirmasi Pelunasan Kasir</span>
                  </Button>
                </div>
              </div>
            )}

            {/* Quick Action Button for Paid Invoices */}
            {selectedInvoice.balanceAmount <= 0 && (
              <div className="pt-3 flex justify-between items-center border-t border-slate-100 dark:border-slate-800">
                <Button
                  size="sm"
                  variant="outline"
                  className="h-8 text-xs border-emerald-400 text-emerald-700 hover:bg-emerald-50 gap-1.5 font-semibold"
                  onClick={() => {
                    setIsPaymentOpen(false);
                    handleOpenReceipt(selectedInvoice);
                  }}
                >
                  <Receipt className="h-3.5 w-3.5 text-emerald-600" />
                  <span>Cetak Nota &amp; Kirim WhatsApp</span>
                </Button>
                <Button variant="outline" size="sm" onClick={() => setIsPaymentOpen(false)}>
                  Tutup
                </Button>
              </div>
            )}
          </div>
        </Dialog>
      )}

      {/* Payment Receipt Modal with Print & WhatsApp Sharing */}
      <PaymentReceiptModal
        open={isReceiptOpen}
        onOpenChange={setIsReceiptOpen}
        invoice={receiptInvoice}
      />
    </div>
  );
}

