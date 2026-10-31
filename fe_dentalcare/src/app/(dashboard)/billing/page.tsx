"use client";

import * as React from "react";
import Link from "next/link";
import {
  Receipt,
  CreditCard,
  CheckCircle2,
  QrCode,
  FileText,
  ArrowRight,
  Plus,
  Coins,
  History,
  AlertCircle,
  HelpCircle,
  User,
  Stethoscope,
} from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { DataTable } from "@/components/shared/data-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog } from "@/components/ui/dialog";
import { StatusBadge } from "@/components/shared/status-badge";
import { useBilling, usePatients, useDentalMaster } from "@/hooks";
import { Invoice } from "@/types";
import { formatCurrency, formatDate, formatRupiahInput } from "@/lib/formatting";
import { ColumnDef } from "@tanstack/react-table";
import { toast } from "sonner";
import { PaymentReceiptModal } from "@/components/dental/payment-receipt-modal";

export default function BillingPage() {
  const { invoices, recordPayment, createInvoice } = useBilling();
  const { data: patientsData } = usePatients({ perPage: 100 });
  const patients = patientsData?.data || [];
  const { procedures } = useDentalMaster();

  // Payment Modal States
  const [selectedInvoice, setSelectedInvoice] = React.useState<Invoice | null>(null);
  const [isPaymentOpen, setIsPaymentOpen] = React.useState(false);
  const [paymentMode, setPaymentMode] = React.useState<"full" | "dp" | "settlement">("full");
  const [dpInput, setDpInput] = React.useState<number>(0);
  const [tenderedInput, setTenderedInput] = React.useState<number>(0);
  const [paymentMethod, setPaymentMethod] = React.useState<string>("cash");
  const [paymentNotes, setPaymentNotes] = React.useState<string>("");
  const [paying, setPaying] = React.useState(false);

  // Receipt Modal State for Printing & WhatsApp Sharing
  const [receiptInvoice, setReceiptInvoice] = React.useState<Invoice | null>(null);
  const [isReceiptOpen, setIsReceiptOpen] = React.useState(false);

  // New Invoice / Treatment Plan Modal States
  const [isCreateOpen, setIsCreateOpen] = React.useState(false);
  const [creating, setCreating] = React.useState(false);
  const [newInvoiceForm, setNewInvoiceForm] = React.useState({
    patientId: "",
    procedureName: "Pemasangan Kawat Gigi / Ortodonti Fixed",
    totalPrice: 5000000,
    hasImmediateDp: true,
    dpAmount: 1500000,
    tenderedAmount: 1500000,
    paymentMethod: "cash",
    notes: "DP Pemasangan Behel / Perawatan Gigi",
  });

  const handleOpenPayment = (inv: Invoice, preferredMode?: "full" | "dp" | "settlement") => {
    setSelectedInvoice(inv);
    setPaymentMethod("cash");
    const hasExistingDp = (inv.paidAmount || 0) > 0 && inv.balanceAmount > 0;
    let targetAmount = inv.balanceAmount;

    if (hasExistingDp) {
      setPaymentMode("settlement");
      setDpInput(inv.balanceAmount);
      targetAmount = inv.balanceAmount;
    } else if (preferredMode === "dp") {
      setPaymentMode("dp");
      // Default DP: ~30% rounded to nearest 50.000
      const defaultDp = Math.round((inv.balanceAmount * 0.3) / 50000) * 50000 || 500000;
      const dpVal = Math.min(inv.balanceAmount - 10000, defaultDp);
      setDpInput(dpVal);
      targetAmount = dpVal;
    } else {
      setPaymentMode("full");
      setDpInput(inv.balanceAmount);
      targetAmount = inv.balanceAmount;
    }

    setTenderedInput(targetAmount);
    setPaymentNotes("");
    setIsPaymentOpen(true);
  };

  const handleOpenReceipt = (inv: Invoice) => {
    setReceiptInvoice(inv);
    setIsReceiptOpen(true);
  };

  const handleProcessPayment = async () => {
    if (!selectedInvoice) return;

    const isDp = paymentMode === "dp";
    const amountToPay = isDp ? Number(dpInput) : selectedInvoice.balanceAmount;
    const tendered = Number(tenderedInput) || amountToPay;
    const change = Math.max(0, tendered - amountToPay);

    if (amountToPay <= 0) {
      toast.error("Nominal pembayaran harus lebih besar dari Rp 0!");
      return;
    }

    if (isDp && amountToPay >= selectedInvoice.balanceAmount) {
      toast.error("Nominal DP tidak boleh melebihi atau sama dengan total sisa tagihan! Gunakan opsi Pelunasan Penuh.");
      return;
    }

    if (tendered < amountToPay) {
      toast.error(
        `Nominal uang yang diterima kurang ${formatCurrency(amountToPay - tendered)}! Silakan masukkan nominal yang mencukupi.`
      );
      return;
    }

    setPaying(true);
    try {
      const typeParam = isDp ? "dp" : (selectedInvoice.paidAmount > 0 ? "settlement" : "full");
      const defaultNote = isDp
        ? "Pembayaran Uang Muka (DP)"
        : (selectedInvoice.paidAmount > 0
            ? "Pelunasan Sisa Tagihan (Setelah Pembayaran DP)"
            : "Pelunasan Kasir 100%");

      const updated = await recordPayment(
        selectedInvoice.id,
        paymentMethod,
        amountToPay,
        "Dewi Kartika - Kasir",
        typeParam,
        paymentNotes.trim() || defaultNote,
        tendered,
        change
      );

      if (isDp) {
        const remainingAfter = selectedInvoice.balanceAmount - amountToPay;
        toast.success(
          `Pembayaran DP ${selectedInvoice.invoiceNumber} sebesar ${formatCurrency(amountToPay)} berhasil! Sisa yang harus dilunasi nanti: ${formatCurrency(remainingAfter)}.`
        );
      } else {
        toast.success(
          `Pelunasan tagihan ${selectedInvoice.invoiceNumber} sebesar ${formatCurrency(amountToPay)} berhasil! Tagihan telah LUNAS.`
        );
      }

      setIsPaymentOpen(false);

      // Automatically pop open the digital receipt / invoice modal!
      const completedInvoice: Invoice = updated || {
        ...selectedInvoice,
        paidAmount: selectedInvoice.paidAmount + amountToPay,
        balanceAmount: Math.max(0, selectedInvoice.balanceAmount - amountToPay),
        tenderedAmount: tendered,
        changeAmount: change,
        status: (selectedInvoice.balanceAmount - amountToPay <= 0) ? "paid" : "partial",
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

  const handleCreateTreatmentInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newInvoiceForm.patientId) {
      toast.error("Pilih pasien terlebih dahulu!");
      return;
    }
    const patientObj = patients.find((p) => p.id === newInvoiceForm.patientId);
    if (!patientObj) {
      toast.error("Data pasien tidak ditemukan!");
      return;
    }

    if (newInvoiceForm.totalPrice <= 0) {
      toast.error("Total biaya tagihan harus lebih besar dari Rp 0!");
      return;
    }

    if (newInvoiceForm.hasImmediateDp && (newInvoiceForm.dpAmount <= 0 || newInvoiceForm.dpAmount >= newInvoiceForm.totalPrice)) {
      toast.error("Nominal DP harus lebih dari Rp 0 dan kurang dari total biaya tagihan!");
      return;
    }

    setCreating(true);
    try {
      const items = [
        {
          id: `ITEM-${Date.now()}`,
          description: newInvoiceForm.procedureName,
          category: "procedure" as const,
          quantity: 1,
          unitPrice: newInvoiceForm.totalPrice,
          totalPrice: newInvoiceForm.totalPrice,
        },
      ];

      const initialPaid = newInvoiceForm.hasImmediateDp ? newInvoiceForm.dpAmount : 0;
      const initialStatus = initialPaid >= newInvoiceForm.totalPrice ? "paid" : (initialPaid > 0 ? "partial" : "pending");
      const dpTendered = newInvoiceForm.hasImmediateDp ? (newInvoiceForm.tenderedAmount || initialPaid) : 0;
      const dpChange = Math.max(0, dpTendered - initialPaid);

      if (newInvoiceForm.hasImmediateDp && dpTendered < initialPaid) {
        toast.error(`Nominal uang yang diterima kurang ${formatCurrency(initialPaid - dpTendered)}!`);
        return;
      }

      const created = await createInvoice({
        patientId: patientObj.id,
        patientName: patientObj.name,
        patientMrn: patientObj.medicalRecordNumber,
        patientPhone: patientObj.phone,
        items,
        subtotal: newInvoiceForm.totalPrice,
        totalAmount: newInvoiceForm.totalPrice,
        patientPaidAmount: initialPaid,
        coveredByInsurance: 0,
        discount: 0,
        tax: 0,
        status: initialStatus,
        paymentMethod: newInvoiceForm.paymentMethod,
        cashierName: "Dewi Kartika - Kasir",
        paymentType: initialPaid > 0 ? "dp" : undefined,
        notes: newInvoiceForm.notes,
        tenderedAmount: dpTendered,
        changeAmount: dpChange,
      });

      toast.success(
        `Tagihan ${newInvoiceForm.procedureName} untuk ${patientObj.name} berhasil diterbitkan!` +
        (newInvoiceForm.hasImmediateDp ? ` DP sebesar ${formatCurrency(newInvoiceForm.dpAmount)} telah tercatat.` : "")
      );

      setIsCreateOpen(false);

      if (newInvoiceForm.hasImmediateDp && created) {
        setReceiptInvoice({
          ...created,
          tenderedAmount: dpTendered,
          changeAmount: dpChange,
        });
        setIsReceiptOpen(true);
      }
    } catch {
      toast.error("Gagal menerbitkan tagihan perawatan.");
    } finally {
      setCreating(false);
    }
  };

  const columns: ColumnDef<Invoice>[] = [
    {
      accessorKey: "invoiceNumber",
      header: "No. Invoice",
      cell: ({ row }) => (
        <span className="font-mono text-xs font-semibold text-teal-700 dark:text-teal-400">
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
        <span className="text-xs text-slate-600 dark:text-slate-400">{formatDate(row.original.invoiceDate)}</span>
      ),
    },
    {
      accessorKey: "totalAmount",
      header: "Total Biaya",
      cell: ({ row }) => (
        <span className="font-mono font-bold text-xs text-slate-900 dark:text-slate-100">
          {formatCurrency(row.original.totalAmount)}
        </span>
      ),
    },
    {
      id: "dpPaidAmount",
      header: "DP / Terbayar",
      cell: ({ row }) => {
        const inv = row.original;
        const paid = Number(inv.paidAmount) || 0;
        const balance = Number(inv.balanceAmount) || 0;
        const isDp = paid > 0 && balance > 0;

        if (paid <= 0) {
          return <span className="font-mono text-xs text-slate-400">Rp 0</span>;
        }

        if (isDp) {
          return (
            <div className="flex flex-col items-start gap-0.5">
              <span className="inline-flex items-center gap-1 rounded-md bg-sky-50 px-1.5 py-0.5 font-mono text-xs font-bold text-sky-700 dark:bg-sky-950/60 dark:text-sky-300 border border-sky-200/80 dark:border-sky-800">
                <Coins className="h-3 w-3 text-sky-600" />
                DP: {formatCurrency(paid)}
              </span>
            </div>
          );
        }

        return (
          <span className="font-mono font-bold text-xs text-emerald-600 dark:text-emerald-400">
            {formatCurrency(paid)}
          </span>
        );
      },
    },
    {
      accessorKey: "balanceAmount",
      header: "Sisa Pelunasan",
      cell: ({ row }) => {
        const inv = row.original;
        const isSettled = inv.balanceAmount <= 0;
        return (
          <div className="flex flex-col">
            <span
              className={`font-mono font-bold text-xs ${
                isSettled ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"
              }`}
            >
              {isSettled ? "Rp 0 (Lunas)" : formatCurrency(inv.balanceAmount)}
            </span>
            {!isSettled && (inv.paidAmount || 0) > 0 && (
              <span className="text-[10px] text-amber-600 dark:text-amber-400 font-medium">
                Sisa Pelunasan DP
              </span>
            )}
          </div>
        );
      },
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
        const hasExistingDp = (inv.paidAmount || 0) > 0 && inv.balanceAmount > 0;

        return (
          <div className="flex items-center gap-1.5">
            {isPaid ? (
              <>
                <Button
                  size="sm"
                  className="h-7 text-xs bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5 shadow-xs font-semibold"
                  onClick={() => handleOpenReceipt(inv)}
                  title="Cetak kuitansi lunas atau bagikan ke WhatsApp pasien"
                >
                  <Receipt className="h-3.5 w-3.5" />
                  <span>Kuitansi &amp; WA</span>
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
            ) : hasExistingDp ? (
              <>
                <Button
                  size="sm"
                  className="h-7 text-xs bg-indigo-600 hover:bg-indigo-700 text-white gap-1 shadow-xs font-semibold"
                  onClick={() => handleOpenPayment(inv, "settlement")}
                  title="Bayar sisa tagihan setelah pembayaran DP"
                >
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  <span>Bayar Pelunasan</span>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7 text-xs text-sky-700 border-sky-300 hover:bg-sky-50 gap-1"
                  onClick={() => handleOpenReceipt(inv)}
                  title="Cetak Kuitansi DP & Share WhatsApp"
                >
                  <Receipt className="h-3 w-3" />
                  <span>Nota DP</span>
                </Button>
              </>
            ) : (
              <>
                <Button
                  size="sm"
                  className="h-7 text-xs bg-teal-600 hover:bg-teal-700 text-white shadow-xs font-semibold gap-1"
                  onClick={() => handleOpenPayment(inv, "full")}
                >
                  <span>Bayar / DP</span>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7 text-xs text-slate-600 gap-1"
                  onClick={() => handleOpenReceipt(inv)}
                  title="Pratinjau Nota"
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
        description="Penerbitan tagihan perawatan gigi terpadu, pembayaran Uang Muka (DP), pelunasan sisa tagihan dental, verifikasi asuransi/BPJS, dan buku kas masuk."
      >
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            onClick={() => setIsCreateOpen(true)}
            className="h-8 text-xs bg-teal-600 hover:bg-teal-700 text-white gap-1.5 shadow-xs font-semibold"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>+ Terbitkan Tagihan / Rencana DP</span>
          </Button>

          <Link href="/finance">
            <Button
              variant="outline"
              size="sm"
              className="h-8 text-xs border-teal-300 text-teal-700 bg-white hover:bg-teal-50 dark:bg-slate-900 dark:border-teal-800 dark:text-teal-300 gap-1.5 shadow-xs font-semibold"
            >
              <span>Buku Kas Masuk</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </Link>
        </div>
      </PageHeader>

      {/* Kas Masuk Auto-Sync & DP System Banner */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="flex items-center gap-3 rounded-2xl border border-teal-200 bg-gradient-to-r from-teal-50/80 via-emerald-50/60 to-cyan-50/40 p-3.5 text-xs text-teal-900 dark:border-teal-900/60 dark:from-teal-950/40 dark:via-emerald-950/30 dark:to-cyan-950/20 dark:text-teal-200">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-teal-600 text-white shadow-xs">
            <CheckCircle2 className="h-4 w-4" />
          </div>
          <div>
            <p className="font-bold flex items-center gap-1.5">
              <span>Sinkronisasi Kas Masuk (Income) Aktif</span>
              <span className="rounded-full bg-emerald-100 px-2 py-0.2 text-[10px] font-bold text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300">
                Real-time
              </span>
            </p>
            <p className="text-[11px] text-teal-700 dark:text-teal-400">
              Setiap pembayaran kasir (DP maupun Pelunasan Sisa) otomatis tercatat ke <strong>Buku Kas Masuk</strong> pada laporan keuangan.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 rounded-2xl border border-sky-200 bg-gradient-to-r from-sky-50/80 via-indigo-50/60 to-teal-50/40 p-3.5 text-xs text-sky-900 dark:border-sky-900/60 dark:from-sky-950/40 dark:via-indigo-950/30 dark:to-teal-950/20 dark:text-sky-200">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-sky-600 text-white shadow-xs">
            <Coins className="h-4 w-4" />
          </div>
          <div>
            <p className="font-bold flex items-center gap-1.5">
              <span>Sistem Pembayaran Uang Muka (DP) &amp; Pelunasan</span>
            </p>
            <p className="text-[11px] text-sky-700 dark:text-sky-400">
              Pasien dapat membayar DP terlebih dahulu. Saat kontrol / tindakan selesai, kasir <strong>cukup menagih sisa dari total harga dikurangi DP</strong>.
            </p>
          </div>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={invoices}
        searchPlaceholder="Cari nomor invoice, nama pasien, atau No RM..."
        emptyTitle="Tidak ada data invoice"
        emptyDescription="Tagihan pasien yang diterbitkan akan tampil di sini."
      />

      {/* ========================================================================= */}
      {/* MODAL 1: PAYMENT (DP & PELUNASAN SISA) */}
      {/* ========================================================================= */}
      {selectedInvoice && (
        <Dialog
          open={isPaymentOpen}
          onOpenChange={setIsPaymentOpen}
          title={`${
            selectedInvoice.paidAmount > 0 && selectedInvoice.balanceAmount > 0
              ? "Pelunasan Sisa Tagihan (Setelah DP)"
              : "Kasir Pembayaran Perawatan Gigi"
          }: ${selectedInvoice.invoiceNumber}`}
          description={`Pasien: ${selectedInvoice.patientName} (${selectedInvoice.patientMrn})`}
        >
          <div className="space-y-4 text-xs">
            {/* Itemized Services List */}
            <div className="rounded-xl border border-slate-200 overflow-hidden dark:border-slate-800">
              <table className="w-full text-left">
                <thead className="bg-slate-50 text-slate-500 border-b border-slate-200 dark:bg-slate-800/60 dark:border-slate-800">
                  <tr>
                    <th className="p-2.5 font-semibold">Layanan / Tindakan Dental</th>
                    <th className="p-2.5 font-semibold text-center w-16">Qty</th>
                    <th className="p-2.5 font-semibold text-right">Biaya</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {selectedInvoice.items.map((item) => (
                    <tr key={item.id}>
                      <td className="p-2.5 font-medium">{item.description}</td>
                      <td className="p-2.5 font-mono text-center">{item.quantity}</td>
                      <td className="p-2.5 font-mono text-right">{formatCurrency(item.totalPrice)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Calculations Breakdown */}
            <div className="rounded-xl bg-slate-50 p-3.5 space-y-2 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800">
              <div className="flex justify-between text-slate-600 dark:text-slate-400">
                <span>Total Biaya Tindakan Dental</span>
                <span className="font-mono font-semibold">{formatCurrency(selectedInvoice.totalAmount)}</span>
              </div>
              {selectedInvoice.insuranceCoverage > 0 && (
                <div className="flex justify-between text-teal-700 dark:text-teal-400 font-medium">
                  <span>Tanggungan Jaminan Asuransi / BPJS</span>
                  <span className="font-mono">- {formatCurrency(selectedInvoice.insuranceCoverage)}</span>
                </div>
              )}
              {selectedInvoice.discount > 0 && (
                <div className="flex justify-between text-emerald-600">
                  <span>Diskon Klinik</span>
                  <span className="font-mono">- {formatCurrency(selectedInvoice.discount)}</span>
                </div>
              )}

              {/* Already Paid DP Highlight Box */}
              {selectedInvoice.paidAmount > 0 && (
                <div className="rounded-lg bg-sky-50 dark:bg-sky-950/50 p-2.5 border border-sky-200 dark:border-sky-800 space-y-1">
                  <div className="flex justify-between items-center text-sky-900 dark:text-sky-200 font-bold">
                    <span className="flex items-center gap-1.5">
                      <Coins className="h-3.5 w-3.5 text-sky-600 dark:text-sky-400" />
                      <span>Uang Muka (DP) Telah Dibayar:</span>
                    </span>
                    <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold">
                      - {formatCurrency(selectedInvoice.paidAmount)}
                    </span>
                  </div>
                  <p className="text-[10.5px] text-sky-700 dark:text-sky-400 leading-tight">
                    Uang muka telah dipotong langsung dari total tagihan. Pasien hanya membayar sisa pelunasan di bawah ini.
                  </p>
                </div>
              )}

              {/* Sisa Pelunasan */}
              <div className="flex justify-between items-center font-bold text-sm pt-1.5 border-t border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100">
                <span>
                  {selectedInvoice.paidAmount > 0
                    ? "Sisa yang Wajib Dilunasi (Pelunasan):"
                    : "Total Kewajiban Bayar Pasien:"}
                </span>
                <span
                  className={`font-mono text-base ${
                    selectedInvoice.balanceAmount > 0 ? "text-rose-600 dark:text-rose-400" : "text-emerald-600"
                  }`}
                >
                  {formatCurrency(selectedInvoice.balanceAmount)}
                </span>
              </div>
            </div>

            {/* Payment History Log (if any transactions exist) */}
            {selectedInvoice.transactions && selectedInvoice.transactions.length > 0 && (
              <div className="space-y-1.5 pt-1">
                <label className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5 text-[11px]">
                  <History className="h-3.5 w-3.5 text-slate-500" />
                  <span>Riwayat Pembayaran Sebelumnya:</span>
                </label>
                <div className="rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 overflow-hidden divide-y divide-slate-100 dark:divide-slate-800">
                  {selectedInvoice.transactions.map((tx: any, idx: number) => (
                    <div key={tx.id || idx} className="p-2 flex items-center justify-between text-[11px]">
                      <div className="flex items-center gap-2">
                        <span className="rounded bg-slate-100 px-1.5 py-0.5 font-bold text-[10px] uppercase text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                          {tx.type === "dp" ? "Uang Muka (DP)" : (tx.type === "settlement" ? "Pelunasan" : "Bayar Penuh")}
                        </span>
                        <span className="text-slate-500 font-mono">
                          {formatDate(tx.paidAt)} • {tx.paymentMethod?.toUpperCase()}
                        </span>
                      </div>
                      <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                        {formatCurrency(Number(tx.amount) || 0)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* PAYMENT OPTIONS (If Invoice not yet fully settled) */}
            {selectedInvoice.balanceAmount > 0 && (
              <div className="space-y-3 pt-1 border-t border-slate-100 dark:border-slate-800">
                {/* Mode Selector: If NO previous payment, allow selecting DP vs Full. If DP already paid, default to Settlement! */}
                {selectedInvoice.paidAmount === 0 ? (
                  <div className="space-y-1.5">
                    <label className="font-bold text-slate-800 dark:text-slate-200">
                      Pilih Skema Pembayaran:
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setPaymentMode("full");
                          setDpInput(selectedInvoice.balanceAmount);
                          setTenderedInput(selectedInvoice.balanceAmount);
                        }}
                        className={`flex items-center gap-2 p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                          paymentMode === "full"
                            ? "border-teal-500 bg-teal-50 text-teal-900 font-bold dark:bg-teal-950/40 dark:text-teal-200 ring-1 ring-teal-500"
                            : "border-slate-200 bg-white hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 text-slate-700 dark:text-slate-300"
                        }`}
                      >
                        <CheckCircle2 className="h-4 w-4 text-teal-600 shrink-0" />
                        <div>
                          <p className="font-bold">1. Bayar Lunas (100%)</p>
                          <p className="text-[10px] text-slate-500">
                            {formatCurrency(selectedInvoice.balanceAmount)}
                          </p>
                        </div>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setPaymentMode("dp");
                          const defaultDp = Math.round((selectedInvoice.balanceAmount * 0.3) / 50000) * 50000 || 500000;
                          const targetDp = Math.min(selectedInvoice.balanceAmount - 10000, defaultDp);
                          setDpInput(targetDp);
                          setTenderedInput(targetDp);
                        }}
                        className={`flex items-center gap-2 p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                          paymentMode === "dp"
                            ? "border-sky-500 bg-sky-50 text-sky-900 font-bold dark:bg-sky-950/40 dark:text-sky-200 ring-1 ring-sky-500"
                            : "border-slate-200 bg-white hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 text-slate-700 dark:text-slate-300"
                        }`}
                      >
                        <Coins className="h-4 w-4 text-sky-600 shrink-0" />
                        <div>
                          <p className="font-bold">2. Bayar Uang Muka (DP)</p>
                          <p className="text-[10px] text-slate-500">
                            Pelunasan sisa saat kontrol berikutnya
                          </p>
                        </div>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="rounded-xl bg-indigo-50 border border-indigo-200 p-2.5 text-indigo-900 dark:bg-indigo-950/40 dark:border-indigo-800 dark:text-indigo-200 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Coins className="h-4 w-4 text-indigo-600 shrink-0" />
                      <span>Mode Pembayaran: <strong>Pelunasan Sisa Tagihan (Setelah DP)</strong></span>
                    </div>
                    <span className="font-mono font-bold text-indigo-700 dark:text-indigo-300">
                      {formatCurrency(selectedInvoice.balanceAmount)}
                    </span>
                  </div>
                )}

                {/* DP Input Form if DP mode is active */}
                {paymentMode === "dp" && (
                  <div className="rounded-xl border border-sky-200 bg-sky-50/60 p-3 space-y-2.5 dark:border-sky-800 dark:bg-sky-950/30">
                    <div className="flex items-center justify-between">
                      <label className="font-bold text-sky-900 dark:text-sky-200">
                        Nominal Uang Muka (DP) Yang Dibayar Pasien:
                      </label>
                      {/* Quick Percentage Presets */}
                      <div className="flex items-center gap-1">
                        {[0.2, 0.3, 0.5].map((pct) => {
                          const val = Math.round((selectedInvoice.balanceAmount * pct) / 10000) * 10000;
                          return (
                            <button
                              key={pct}
                              type="button"
                              onClick={() => {
                                setDpInput(val);
                                setTenderedInput(val);
                              }}
                              className="rounded-md bg-white px-2 py-0.5 text-[10px] font-bold text-sky-700 border border-sky-300 hover:bg-sky-100 dark:bg-slate-900 dark:border-sky-700 dark:text-sky-300"
                            >
                              {pct * 100}% ({formatCurrency(val)})
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div className="relative flex items-center">
                      <span className="absolute left-3 text-xs font-bold text-slate-400 pointer-events-none select-none">
                        Rp
                      </span>
                      <Input
                        type="text"
                        inputMode="numeric"
                        value={dpInput ? formatRupiahInput(dpInput) : ""}
                        onChange={(e) => {
                          const raw = e.target.value.replace(/\D/g, "");
                          const num = raw === "" ? 0 : parseInt(raw, 10);
                          setDpInput(num);
                          setTenderedInput(num);
                        }}
                        placeholder="Masukkan nominal DP..."
                        className="pl-9 font-mono text-sm font-bold text-sky-700 dark:text-sky-300 bg-white dark:bg-slate-900"
                      />
                    </div>

                    {/* Calculation of Remaining Balance after DP */}
                    <div className="flex justify-between items-center text-[11px] pt-1 border-t border-sky-200 dark:border-sky-800 text-sky-800 dark:text-sky-300">
                      <span>Sisa yang akan dilunasi saat kontrol berikutnya:</span>
                      <span className="font-mono font-bold text-rose-600 dark:text-rose-400">
                        {formatCurrency(Math.max(0, selectedInvoice.balanceAmount - (dpInput || 0)))}
                      </span>
                    </div>
                  </div>
                )}

                {/* Payment Method Selector */}
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-800 dark:text-slate-200">
                    Pilih Metode Pembayaran Kasir:
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {[
                      { id: "cash", label: "Tunai (Cash)", icon: Receipt },
                      { id: "qris", label: "QRIS", icon: QrCode },
                      { id: "debit_card", label: "Debit Card", icon: CreditCard },
                      { id: "bank_transfer", label: "Transfer Bank", icon: CheckCircle2 },
                    ].map((m) => {
                      const Icon = m.icon;
                      return (
                        <button
                          key={m.id}
                          type="button"
                          onClick={() => setPaymentMethod(m.id)}
                          className={`flex flex-col items-center justify-center p-2 rounded-xl border text-center transition-all cursor-pointer ${
                            paymentMethod === m.id
                              ? "border-teal-500 bg-teal-50 text-teal-800 font-bold dark:bg-teal-950/40 dark:text-teal-300 ring-1 ring-teal-500"
                              : "border-slate-200 bg-white hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 text-slate-700 dark:text-slate-300"
                          }`}
                        >
                          <Icon className="h-4 w-4 mb-1 text-teal-600" />
                          <span className="text-[11px]">{m.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Input Uang Diterima & Kalkulasi Kembalian Pasien */}
                {(() => {
                  const activePayAmount = paymentMode === "dp" ? (dpInput || 0) : selectedInvoice.balanceAmount;
                  const activeTendered = Number(tenderedInput) || 0;
                  const activeChange = Math.max(0, activeTendered - activePayAmount);
                  const isUnder = activeTendered < activePayAmount;
                  const shortAmount = Math.max(0, activePayAmount - activeTendered);

                  // Quick presets (+10k, +20k, +50k, +100k)
                  const quickAdd = [10000, 20000, 50000, 100000];
                  // Common Indonesian currency banknotes higher than target
                  const bankNotes = [50000, 100000, 200000, 500000, 1000000].filter(
                    (b) => b >= activePayAmount && b !== activePayAmount
                  );

                  return (
                    <div className="rounded-xl border border-teal-200 bg-teal-50/40 p-3 space-y-2.5 dark:border-teal-900/60 dark:bg-teal-950/20">
                      <div className="flex items-center justify-between">
                        <label className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5 text-xs">
                          <Coins className="h-4 w-4 text-teal-600 dark:text-teal-400" />
                          <span>Nominal Uang Diterima dari Pasien:</span>
                        </label>
                        <button
                          type="button"
                          onClick={() => setTenderedInput(activePayAmount)}
                          className="text-[10px] font-bold text-teal-700 bg-white border border-teal-300 hover:bg-teal-50 dark:bg-slate-900 dark:border-teal-700 dark:text-teal-300 px-2 py-0.5 rounded-md transition-all cursor-pointer shadow-2xs"
                        >
                          ⚡ Uang Pas ({formatCurrency(activePayAmount)})
                        </button>
                      </div>

                      <div className="relative flex items-center">
                        <span className="absolute left-3 text-xs font-bold text-slate-400 pointer-events-none select-none">
                          Rp
                        </span>
                        <Input
                          type="text"
                          inputMode="numeric"
                          value={tenderedInput ? formatRupiahInput(tenderedInput) : ""}
                          onChange={(e) => {
                            const raw = e.target.value.replace(/\D/g, "");
                            const num = raw === "" ? 0 : parseInt(raw, 10);
                            setTenderedInput(num);
                          }}
                          placeholder={`Nominal diterima (contoh: ${formatRupiahInput(activePayAmount)})`}
                          className="pl-9 font-mono text-sm font-bold text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-950 border-slate-300 dark:border-slate-700"
                        />
                      </div>

                      {/* Quick preset pills */}
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="text-[10px] text-slate-500 font-medium">Bantu Hitung:</span>
                        <button
                          type="button"
                          onClick={() => setTenderedInput(activePayAmount)}
                          className="rounded-md bg-white px-2 py-0.5 text-[10px] font-semibold text-teal-700 border border-teal-200 hover:bg-teal-50 dark:bg-slate-800 dark:border-teal-800 dark:text-teal-300 transition-all cursor-pointer"
                        >
                          Uang Pas
                        </button>
                        {quickAdd.map((addVal) => (
                          <button
                            key={addVal}
                            type="button"
                            onClick={() => setTenderedInput((activeTendered || activePayAmount) + addVal)}
                            className="rounded-md bg-white px-2 py-0.5 text-[10px] font-semibold text-slate-700 border border-slate-200 hover:border-teal-400 hover:bg-teal-50 hover:text-teal-800 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200 transition-all cursor-pointer"
                          >
                            +{addVal >= 1000 ? `${addVal / 1000}rb` : addVal}
                          </button>
                        ))}
                        {bankNotes.slice(0, 3).map((bill) => (
                          <button
                            key={bill}
                            type="button"
                            onClick={() => setTenderedInput(bill)}
                            className="rounded-md bg-white px-2 py-0.5 text-[10px] font-semibold text-sky-700 border border-sky-200 hover:bg-sky-50 dark:bg-slate-800 dark:border-sky-800 dark:text-sky-300 transition-all cursor-pointer"
                          >
                            {formatCurrency(bill)}
                          </button>
                        ))}
                      </div>

                      {/* Visual Feedback: Kembalian atau Kurang */}
                      {activeTendered > 0 && (
                        <div className="pt-0.5">
                          {isUnder ? (
                            <div className="rounded-lg bg-rose-50 border border-rose-300 p-2 dark:bg-rose-950/40 dark:border-rose-800 flex items-center justify-between">
                              <div className="flex items-center gap-1.5">
                                <AlertCircle className="h-4 w-4 text-rose-600 shrink-0" />
                                <span className="font-bold text-xs text-rose-800 dark:text-rose-200">
                                  Uang Pasien Kurang:
                                </span>
                              </div>
                              <span className="font-mono text-xs font-bold text-rose-600 dark:text-rose-400">
                                - {formatCurrency(shortAmount)}
                              </span>
                            </div>
                          ) : activeChange > 0 ? (
                            <div className="rounded-lg bg-emerald-50 border border-emerald-300 p-2.5 dark:bg-emerald-950/40 dark:border-emerald-800 flex items-center justify-between">
                              <div>
                                <span className="font-bold text-xs text-emerald-900 dark:text-emerald-200 flex items-center gap-1">
                                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                                  Uang Kembalian Pasien:
                                </span>
                                <p className="text-[10px] text-emerald-700 dark:text-emerald-300 pl-4.5">
                                  Kembalikan ke pasien saat transaksi kasir selesai
                                </p>
                              </div>
                              <span className="font-mono text-base font-extrabold text-emerald-700 dark:text-emerald-300">
                                {formatCurrency(activeChange)}
                              </span>
                            </div>
                          ) : (
                            <div className="rounded-lg bg-sky-50 border border-sky-200 p-2 dark:bg-sky-950/40 dark:border-sky-800 flex items-center justify-between">
                              <span className="font-bold text-xs text-sky-900 dark:text-sky-200 flex items-center gap-1">
                                <CheckCircle2 className="h-3.5 w-3.5 text-sky-600" />
                                Uang Pas (Tidak Ada Kembalian)
                              </span>
                              <span className="font-mono text-xs font-bold text-sky-700 dark:text-sky-400">
                                Rp 0
                              </span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })()}

                {/* Optional Payment Note */}
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300">
                    Catatan Kasir (Opsional):
                  </label>
                  <input
                    type="text"
                    value={paymentNotes}
                    onChange={(e) => setPaymentNotes(e.target.value)}
                    placeholder={
                      paymentMode === "dp"
                        ? "Contoh: DP Pemasangan Behel Rahang Atas & Bawah"
                        : "Contoh: Pelunasan sisa perawatan gigi"
                    }
                    className="w-full rounded-xl border border-slate-200 bg-white p-2 text-xs dark:border-slate-800 dark:bg-slate-900"
                  />
                </div>

                {/* Actions Footer */}
                <div className="pt-3 flex justify-end gap-2 border-t border-slate-100 dark:border-slate-800">
                  <Button variant="outline" size="sm" onClick={() => setIsPaymentOpen(false)}>
                    Batal
                  </Button>
                  <Button
                    size="sm"
                    className={`gap-1.5 font-bold shadow-xs ${
                      paymentMode === "dp"
                        ? "bg-sky-600 hover:bg-sky-700 text-white"
                        : "bg-emerald-600 hover:bg-emerald-700 text-white"
                    }`}
                    isLoading={paying}
                    disabled={
                      paying ||
                      (tenderedInput || 0) <
                        (paymentMode === "dp" ? (dpInput || 0) : selectedInvoice.balanceAmount)
                    }
                    onClick={handleProcessPayment}
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    <span>
                      {paymentMode === "dp"
                        ? `Konfirmasi Pembayaran DP (${formatCurrency(dpInput || 0)})`
                        : `Konfirmasi Pelunasan Sisa (${formatCurrency(selectedInvoice.balanceAmount)})`}
                    </span>
                  </Button>
                </div>
              </div>
            )}

            {/* Quick Action Button for Already Settled Invoices */}
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
                  <span>Cetak Kuitansi &amp; Kirim WhatsApp</span>
                </Button>
                <Button variant="outline" size="sm" onClick={() => setIsPaymentOpen(false)}>
                  Tutup
                </Button>
              </div>
            )}
          </div>
        </Dialog>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: TERBITKAN TAGIHAN RENCANA PERAWATAN DENTAL (DP OPTIONAL) */}
      {/* ========================================================================= */}
      <Dialog
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        title="Terbitkan Tagihan Baru / Rencana Perawatan Gigi (DP)"
        description="Buat tagihan perawatan gigi berjangka (seperti Ortodonti / Behel, Implan Gigi, Gigi Tiruan, Veneer) dengan opsi pembayaran DP langsung."
      >
        <form onSubmit={handleCreateTreatmentInvoice} className="space-y-3.5 text-xs pt-1">
          <div className="space-y-1">
            <label className="font-bold text-slate-700 dark:text-slate-300">
              Pilih Pasien <span className="text-rose-500">*</span>
            </label>
            <select
              value={newInvoiceForm.patientId}
              onChange={(e) => setNewInvoiceForm({ ...newInvoiceForm, patientId: e.target.value })}
              className="w-full rounded-xl border border-slate-200 bg-white p-2 text-xs dark:border-slate-800 dark:bg-slate-900"
              required
            >
              <option value="">-- Pilih Pasien Terdaftar --</option>
              {patients.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.medicalRecordNumber}) - {p.phone || "No HP -"}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="font-bold text-slate-700 dark:text-slate-300">
              Tindakan / Paket Perawatan Gigi <span className="text-rose-500">*</span>
            </label>
            <select
              value={newInvoiceForm.procedureName}
              onChange={(e) => {
                const proc = procedures.find((p) => p.name === e.target.value);
                const costVal = proc ? Number(proc.cost) : newInvoiceForm.totalPrice;
                const calcDp = Math.round((costVal * 0.3) / 10000) * 10000;
                setNewInvoiceForm({
                  ...newInvoiceForm,
                  procedureName: e.target.value,
                  totalPrice: costVal,
                  dpAmount: calcDp,
                  tenderedAmount: calcDp,
                });
              }}
              className="w-full rounded-xl border border-slate-200 bg-white p-2 text-xs dark:border-slate-800 dark:bg-slate-900"
              required
            >
              <option value="Pemasangan Kawat Gigi / Ortodonti Fixed">Pemasangan Kawat Gigi / Ortodonti Fixed</option>
              <option value="Paket Implan Gigi Dental Premium + Mahkota">Paket Implan Gigi Dental Premium + Mahkota</option>
              <option value="Insersi Gigi Tiruan Lengkap / Akrilik">Insersi Gigi Tiruan Lengkap / Akrilik</option>
              <option value="Veneer Gigi Estetika (Porcelain / E-max)">Veneer Gigi Estetika (Porcelain / E-max)</option>
              <option value="Odontektomi / Bedah Gigi Bungsu Terpadu">Odontektomi / Bedah Gigi Bungsu Terpadu</option>
              {procedures.map((p) => (
                <option key={p.id} value={p.name}>
                  [{p.code}] {p.name} ({formatCurrency(p.cost)})
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="font-bold text-slate-700 dark:text-slate-300">
              Total Biaya Keseluruhan Perawatan <span className="text-rose-500">*</span>
            </label>
            <div className="relative flex items-center">
              <span className="absolute left-3 text-xs font-bold text-slate-400 pointer-events-none select-none">
                Rp
              </span>
              <Input
                type="text"
                inputMode="numeric"
                value={newInvoiceForm.totalPrice ? formatRupiahInput(newInvoiceForm.totalPrice) : ""}
                onChange={(e) => {
                  const num = e.target.value.replace(/\D/g, "");
                  const val = num === "" ? 0 : parseInt(num, 10);
                  const calcDp = Math.round((val * 0.3) / 10000) * 10000;
                  setNewInvoiceForm({
                    ...newInvoiceForm,
                    totalPrice: val,
                    dpAmount: calcDp,
                    tenderedAmount: calcDp,
                  });
                }}
                className="pl-9 font-mono text-xs font-bold text-teal-700 dark:text-teal-300"
                required
              />
            </div>
          </div>

          {/* Checkbox: Pembayaran DP Langsung */}
          <div className="p-3 rounded-xl border border-sky-200 bg-sky-50/70 dark:border-sky-800 dark:bg-sky-950/30 space-y-2.5">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="hasImmediateDp"
                checked={newInvoiceForm.hasImmediateDp}
                onChange={(e) => setNewInvoiceForm({ ...newInvoiceForm, hasImmediateDp: e.target.checked })}
                className="h-4 w-4 rounded border-slate-300 text-sky-600 focus:ring-sky-500"
              />
              <label htmlFor="hasImmediateDp" className="font-bold text-sky-950 dark:text-sky-200 cursor-pointer">
                Terima Pembayaran Uang Muka (DP) Hari Ini
              </label>
            </div>

            {newInvoiceForm.hasImmediateDp && (
              <div className="space-y-2 pt-1 border-t border-sky-200 dark:border-sky-800">
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="font-semibold text-slate-700 dark:text-slate-300">
                      Nominal Uang Muka (DP) <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative flex items-center">
                      <span className="absolute left-2.5 text-xs font-bold text-slate-400 pointer-events-none select-none">
                        Rp
                      </span>
                      <Input
                        type="text"
                        inputMode="numeric"
                        value={newInvoiceForm.dpAmount ? formatRupiahInput(newInvoiceForm.dpAmount) : ""}
                        onChange={(e) => {
                          const num = e.target.value.replace(/\D/g, "");
                          const val = num === "" ? 0 : parseInt(num, 10);
                          setNewInvoiceForm({ ...newInvoiceForm, dpAmount: val, tenderedAmount: val });
                        }}
                        className="pl-8 font-mono text-xs font-bold text-sky-700 dark:text-sky-300"
                        required={newInvoiceForm.hasImmediateDp}
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="font-semibold text-slate-700 dark:text-slate-300">
                      Metode Pembayaran DP
                    </label>
                    <select
                      value={newInvoiceForm.paymentMethod}
                      onChange={(e) => setNewInvoiceForm({ ...newInvoiceForm, paymentMethod: e.target.value })}
                      className="w-full rounded-xl border border-slate-200 bg-white p-2 text-xs dark:border-slate-800 dark:bg-slate-900"
                    >
                      <option value="cash">Tunai (Cash)</option>
                      <option value="qris">QRIS</option>
                      <option value="debit_card">Kartu Debit</option>
                      <option value="bank_transfer">Transfer Bank</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-1 border-t border-sky-100 dark:border-sky-900/50">
                  <div className="space-y-1">
                    <label className="font-semibold text-slate-700 dark:text-slate-300">
                      Uang Diterima dari Pasien (Rp)
                    </label>
                    <div className="relative flex items-center">
                      <span className="absolute left-2.5 text-xs font-bold text-slate-400 pointer-events-none select-none">
                        Rp
                      </span>
                      <Input
                        type="text"
                        inputMode="numeric"
                        value={newInvoiceForm.tenderedAmount ? formatRupiahInput(newInvoiceForm.tenderedAmount) : ""}
                        onChange={(e) => {
                          const num = e.target.value.replace(/\D/g, "");
                          const val = num === "" ? 0 : parseInt(num, 10);
                          setNewInvoiceForm({ ...newInvoiceForm, tenderedAmount: val });
                        }}
                        className="pl-8 font-mono text-xs font-bold text-slate-900 dark:text-slate-100"
                        placeholder={formatRupiahInput(newInvoiceForm.dpAmount || 0)}
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="font-semibold text-slate-700 dark:text-slate-300">
                      Kembalian DP Pasien
                    </label>
                    <div className="h-9 px-3 rounded-xl border border-slate-200 bg-white dark:bg-slate-900 dark:border-slate-700 flex items-center justify-between">
                      <span className="text-[11px] text-slate-500">Kembalian:</span>
                      <span
                        className={`font-mono text-xs font-bold ${
                          (newInvoiceForm.tenderedAmount || 0) < newInvoiceForm.dpAmount
                            ? "text-rose-600"
                            : "text-emerald-600"
                        }`}
                      >
                        {(newInvoiceForm.tenderedAmount || 0) < newInvoiceForm.dpAmount
                          ? `- ${formatCurrency(newInvoiceForm.dpAmount - (newInvoiceForm.tenderedAmount || 0))}`
                          : formatCurrency((newInvoiceForm.tenderedAmount || 0) - newInvoiceForm.dpAmount)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex justify-between items-center text-[11px] text-sky-800 dark:text-sky-300 pt-0.5">
                  <span>Sisa yang akan dilunasi saat kontrol:</span>
                  <span className="font-mono font-bold text-rose-600 dark:text-rose-400">
                    {formatCurrency(Math.max(0, newInvoiceForm.totalPrice - newInvoiceForm.dpAmount))}
                  </span>
                </div>
              </div>
            )}
          </div>

          <div className="space-y-1">
            <label className="font-bold text-slate-700 dark:text-slate-300">Catatan / Keterangan Tagihan</label>
            <input
              type="text"
              value={newInvoiceForm.notes}
              onChange={(e) => setNewInvoiceForm({ ...newInvoiceForm, notes: e.target.value })}
              placeholder="Contoh: Rencana pasang behel metal sapphire, kontrol tiap 3 minggu"
              className="w-full rounded-xl border border-slate-200 bg-white p-2 text-xs dark:border-slate-800 dark:bg-slate-900"
            />
          </div>

          <div className="pt-3 flex justify-end gap-2 border-t border-slate-100 dark:border-slate-800">
            <Button variant="outline" size="sm" type="button" onClick={() => setIsCreateOpen(false)}>
              Batal
            </Button>
            <Button
              type="submit"
              size="sm"
              isLoading={creating}
              className="bg-teal-600 hover:bg-teal-700 text-white font-semibold gap-1.5"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Terbitkan Tagihan</span>
            </Button>
          </div>
        </form>
      </Dialog>

      {/* Payment Receipt Modal with Print & WhatsApp Sharing */}
      <PaymentReceiptModal
        open={isReceiptOpen}
        onOpenChange={setIsReceiptOpen}
        invoice={receiptInvoice}
      />
    </div>
  );
}
