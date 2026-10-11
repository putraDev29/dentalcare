"use client";

import * as React from "react";
import Link from "next/link";
import {
  Landmark,
  ArrowDownRight,
  ArrowUpRight,
  TrendingUp,
  Download,
  Printer,
  Plus,
  Filter,
  Search,
  Calendar,
  Receipt,
  Clock,
  CheckCircle2,
  AlertCircle,
  FileSpreadsheet,
  Building2,
  DollarSign,
  Wallet,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/shared/stat-card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Dialog } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { useFinance, useHospitalProfile } from "@/hooks";
import { formatCurrency, formatDate, formatDateTime } from "@/lib/formatting";
import { ClinicalWorkflowStepper } from "@/components/dental/clinical-workflow-stepper";
import { toast } from "sonner";

export default function FinanceReportPage() {
  const { summary, transactions, loading, refetch, createTransaction } = useFinance();
  const { profile } = useHospitalProfile();

  // Filters state
  const [filterType, setFilterType] = React.useState<string>("all");
  const [filterCategory, setFilterCategory] = React.useState<string>("all");
  const [searchQuery, setSearchQuery] = React.useState<string>("");
  const [dateRange, setDateRange] = React.useState<string>("all");

  // Modal dialog state
  const [isAddModalOpen, setIsAddModalOpen] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  // New Transaction Form State
  const [formData, setFormData] = React.useState({
    type: "expense" as "income" | "expense",
    category: "operational",
    amount: 150000,
    paymentMethod: "cash",
    description: "",
    date: new Date().toISOString().split("T")[0],
    notes: "",
  });

  // Calculate stats robustly from summary or transactions
  const totalIncome =
    summary?.totalIncome ??
    summary?.monthRevenue ??
    transactions
      .filter((t) => t.type === "income")
      .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);

  const totalExpense =
    summary?.totalExpense ??
    summary?.monthExpense ??
    transactions
      .filter((t) => t.type === "expense")
      .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);

  const netBalance = totalIncome - totalExpense;

  const todayStr = new Date().toISOString().split("T")[0];
  const todayIncome = transactions
    .filter((t) => t.type === "income" && (t.date === todayStr || (t.createdAt && t.createdAt.startsWith(todayStr))))
    .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);

  const todayExpense = transactions
    .filter((t) => t.type === "expense" && (t.date === todayStr || (t.createdAt && t.createdAt.startsWith(todayStr))))
    .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);

  // Filtered transactions
  const filteredTransactions = React.useMemo(() => {
    return transactions.filter((t) => {
      // Type filter
      if (filterType !== "all" && t.type !== filterType) return false;

      // Category filter
      if (filterCategory !== "all") {
        if (filterCategory === "patient_payment") {
          if (t.category !== "patient_payment" && t.referenceType !== "invoice") return false;
        } else if (filterCategory === "medicine_purchase") {
          if (t.category !== "medicine_purchase" && t.referenceType !== "stock_in") return false;
        } else if (filterCategory === "operational") {
          if (t.category !== "operational" || t.referenceType === "stock_in") return false;
        } else if (t.category !== filterCategory) {
          return false;
        }
      }

      // Search filter
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const descMatch = (t.description || "").toLowerCase().includes(q);
        const numMatch = (t.transactionNumber || "").toLowerCase().includes(q);
        const opMatch = (t.operatorName || "").toLowerCase().includes(q);
        const notesMatch = (t.notes || "").toLowerCase().includes(q);
        if (!descMatch && !numMatch && !opMatch && !notesMatch) return false;
      }

      // Date range filter
      if (dateRange === "today") {
        const itemDate = t.date || (t.createdAt ? t.createdAt.split("T")[0] : "");
        if (itemDate !== todayStr) return false;
      } else if (dateRange === "7days") {
        const itemDate = new Date(t.date || t.createdAt);
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        if (itemDate < sevenDaysAgo) return false;
      }

      return true;
    });
  }, [transactions, filterType, filterCategory, searchQuery, dateRange, todayStr]);

  // Pagination state
  const [page, setPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(10);
  const totalFiltered = filteredTransactions.length;
  const totalPages = Math.max(1, Math.ceil(totalFiltered / pageSize));
  const paginatedTransactions = filteredTransactions.slice((page - 1) * pageSize, page * pageSize);
  const startRecord = totalFiltered === 0 ? 0 : (page - 1) * pageSize + 1;
  const endRecord = Math.min(page * pageSize, totalFiltered);

  // Handle Export to CSV / Excel
  const handleExportCSV = () => {
    try {
      const clinicName = profile?.name || "OKAY Dental (Klinik Gigi OKAY Dental)";
      const printDate = new Date().toLocaleString("id-ID");

      const headers = [
        "No",
        "Tanggal",
        "No Transaksi",
        "Tipe",
        "Kategori",
        "Deskripsi / Keterangan",
        "Metode Pembayaran",
        "Pemasukan (Rp)",
        "Pengeluaran (Rp)",
        "Operator / Kasir",
      ];

      const rows = filteredTransactions.map((t, idx) => {
        const isInc = t.type === "income";
        const amt = Number(t.amount) || 0;
        return [
          idx + 1,
          t.date || (t.createdAt ? t.createdAt.split("T")[0] : "-"),
          `"${t.transactionNumber || t.id}"`,
          isInc ? "Pemasukan (Kas Masuk)" : "Pengeluaran (Kas Keluar)",
          `"${t.category || '-'}"`,
          `"${(t.description || t.notes || '').replace(/"/g, '""')}"`,
          `"${t.paymentMethod || 'cash'}"`,
          isInc ? amt : 0,
          !isInc ? amt : 0,
          `"${t.operatorName || 'Petugas Klinik'}"`,
        ];
      });

      const csvContent = [
        `"LAPORAN BUKU KAS KEUANGAN KLINIK GIGI"`,
        `"Klinik: ${clinicName}"`,
        `"Waktu Ekspor: ${printDate}"`,
        `"Total Pemasukan: Rp ${totalIncome.toLocaleString('id-ID')}"`,
        `"Total Pengeluaran: Rp ${totalExpense.toLocaleString('id-ID')}"`,
        `"Laba Bersih (Net Cashflow): Rp ${netBalance.toLocaleString('id-ID')}"`,
        "",
        headers.join(","),
        ...rows.map((r) => r.join(",")),
      ].join("\r\n");

      const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", `Laporan_Keuangan_DentalCare_${todayStr}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success("Laporan keuangan berhasil diekspor ke Excel (CSV)!");
    } catch {
      toast.error("Gagal mengekspor laporan keuangan.");
    }
  };

  // Handle Print / PDF View
  const handlePrintPDF = () => {
    window.print();
  };

  // Handle Submit Manual Transaction
  const handleSaveTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.description || formData.amount <= 0) {
      toast.error("Lengkapi deskripsi transaksi dan jumlah nominal yang valid!");
      return;
    }

    setIsSubmitting(true);
    try {
      await createTransaction({
        type: formData.type,
        category: formData.category,
        amount: Number(formData.amount),
        paymentMethod: formData.paymentMethod,
        description: formData.description,
        date: formData.date,
        notes: formData.notes,
      });

      toast.success("Transaksi kas berhasil dicatat!");
      setIsAddModalOpen(false);
      setFormData({
        type: "expense",
        category: "operational",
        amount: 150000,
        paymentMethod: "cash",
        description: "",
        date: new Date().toISOString().split("T")[0],
        notes: "",
      });
      await refetch();
    } catch {
      toast.error("Gagal mencatat transaksi kas.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Visual Clinical Stepper */}
      <div className="print:hidden">
        <ClinicalWorkflowStepper />
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200/80 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-teal-600 text-white shadow-md shadow-teal-600/30">
              <Landmark className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <span>Laporan Keuangan & Buku Kas Klinik Gigi</span>
                <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                  Sinkron Otomatis
                </span>
              </h1>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2 print:hidden">
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportCSV}
            className="gap-1.5 text-xs border-emerald-300 text-emerald-700 hover:bg-emerald-50 dark:border-emerald-800 dark:text-emerald-300"
          >
            <FileSpreadsheet className="h-3.5 w-3.5" />
            <span>Ekspor Excel (CSV)</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handlePrintPDF}
            className="gap-1.5 text-xs text-slate-700 dark:text-slate-300"
          >
            <Printer className="h-3.5 w-3.5" />
            <span>Cetak / PDF</span>
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsAddModalOpen(true)}
            className="gap-1.5 text-xs bg-teal-600 hover:bg-teal-700 text-white font-semibold shadow-xs"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>+ Catat Transaksi Kas</span>
          </Button>
        </div>
      </div>

      {/* Print-Only Header Letterhead */}
      <div className="hidden print:block mb-6 border-b-2 border-slate-900 pb-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold uppercase">{profile?.name || "OKAY Dental (Klinik Gigi OKAY Dental)"}</h2>
            <p className="text-xs text-slate-600">{profile?.address || "Jl. Tebet Raya No. 45B, Tebet Barat, Jakarta Selatan"}</p>
            <p className="text-xs text-slate-600">Telp: {profile?.phone || "021-8291029"} • Izin: {profile?.licenseNumber || "503/012/KLINIK/2024"}</p>
          </div>
          <div className="text-right text-xs">
            <p className="font-bold">LAPORAN BUKU KAS KEUANGAN</p>
            <p className="text-slate-500">Tanggal: {new Date().toLocaleDateString("id-ID")}</p>
          </div>
        </div>
      </div>

      {/* Top Financial KPI Summary Cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
        {/* Total Income */}
        <Card className="p-4 border-emerald-200 bg-gradient-to-br from-emerald-50/40 via-white to-white dark:border-emerald-900/40 dark:from-slate-900 dark:to-slate-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 flex items-center gap-1">
              <ArrowDownRight className="h-3.5 w-3.5 text-emerald-600" />
              Total Pemasukan Kas
            </span>
            <span className="rounded-md bg-emerald-100 px-1.5 py-0.5 text-[10px] font-bold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
              Kasir Gigi
            </span>
          </div>
          <p className="mt-2 font-mono text-xl sm:text-2xl font-bold text-emerald-600 dark:text-emerald-400">
            {formatCurrency(totalIncome)}
          </p>
          <div className="flex items-center justify-between text-[11px] text-slate-400 mt-1">
            <span>Hari ini:</span>
            <span className="font-mono font-semibold text-emerald-600">
              +{formatCurrency(todayIncome)}
            </span>
          </div>
        </Card>

        {/* Total Expense */}
        <Card className="p-4 border-rose-200 bg-gradient-to-br from-rose-50/40 via-white to-white dark:border-rose-900/40 dark:from-slate-900 dark:to-slate-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 flex items-center gap-1">
              <ArrowUpRight className="h-3.5 w-3.5 text-rose-600" />
              Total Pengeluaran Kas
            </span>
            <span className="rounded-md bg-rose-100 px-1.5 py-0.5 text-[10px] font-bold text-rose-800 dark:bg-rose-950 dark:text-rose-300">
              Restock & Operasional
            </span>
          </div>
          <p className="mt-2 font-mono text-xl sm:text-2xl font-bold text-rose-600 dark:text-rose-400">
            {formatCurrency(totalExpense)}
          </p>
          <div className="flex items-center justify-between text-[11px] text-slate-400 mt-1">
            <span>Hari ini:</span>
            <span className="font-mono font-semibold text-rose-600">
              -{formatCurrency(todayExpense)}
            </span>
          </div>
        </Card>

        {/* Net Profit / Cashflow */}
        <Card className="p-4 border-teal-200 bg-gradient-to-br from-teal-50/40 via-white to-white dark:border-teal-900/40 dark:from-slate-900 dark:to-slate-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 flex items-center gap-1">
              <TrendingUp className="h-3.5 w-3.5 text-teal-600" />
              Laba Bersih (Net Cashflow)
            </span>
            <span className="rounded-md bg-teal-100 px-1.5 py-0.5 text-[10px] font-bold text-teal-800 dark:bg-teal-950 dark:text-teal-300">
              Surplus
            </span>
          </div>
          <p
            className={`mt-2 font-mono text-xl sm:text-2xl font-bold ${
              netBalance >= 0 ? "text-teal-700 dark:text-teal-300" : "text-rose-600"
            }`}
          >
            {formatCurrency(netBalance)}
          </p>
          <div className="flex items-center justify-between text-[11px] text-slate-400 mt-1">
            <span>Margin Keuntungan:</span>
            <span className="font-mono font-semibold text-teal-700 dark:text-teal-400">
              {totalIncome > 0 ? `${Math.round((netBalance / totalIncome) * 100)}%` : "0%"}
            </span>
          </div>
        </Card>

        {/* Transaction Count */}
        <Card className="p-4 border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 flex items-center gap-1">
              <Receipt className="h-3.5 w-3.5 text-sky-600" />
              Total Transaksi Tercatat
            </span>
            <span className="rounded-md bg-sky-100 px-1.5 py-0.5 text-[10px] font-bold text-sky-800 dark:bg-sky-950 dark:text-sky-300">
              Jurnal
            </span>
          </div>
          <p className="mt-2 font-mono text-2xl font-bold text-slate-900 dark:text-slate-100">
            {transactions.length}
          </p>
          <p className="text-[11px] text-slate-400 mt-1">Transaksi sinkron otomatis</p>
        </Card>
      </div>

      {/* Synchronized Breakdown Information Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Source of Income */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-bold flex items-center justify-between">
              <span className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300">
                <ArrowDownRight className="h-4 w-4" />
                Rincian Arus Kas Masuk (Pemasukan)
              </span>
              <span className="font-mono text-xs font-bold text-emerald-600">
                {formatCurrency(totalIncome)}
              </span>
            </CardTitle>
            <CardDescription className="text-xs">
              Bersumber otomatis dari pembayaran invoice kasir pasien (tindakan odontogram, konsultasi, dan obat).
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-xs">
            <div className="flex justify-between items-center p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/40">
              <div>
                <p className="font-semibold text-slate-800 dark:text-slate-200">
                  Pembayaran Kasir Pasien Gigi (Billing Invoices)
                </p>
                <p className="text-[11px] text-slate-400">Scaling, Penambalan Komposit, Cabut Gigi, & E-Resep</p>
              </div>
              <span className="font-mono font-bold text-emerald-600">{formatCurrency(totalIncome)}</span>
            </div>
            <div className="flex justify-between items-center px-2.5 py-1 text-slate-500 text-[11px]">
              <span>Metode Pembayaran Dominan:</span>
              <span className="font-semibold text-slate-700 dark:text-slate-300">QRIS & Tunai (Cash)</span>
            </div>
          </CardContent>
        </Card>

        {/* Source of Expense */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-bold flex items-center justify-between">
              <span className="flex items-center gap-2 text-rose-800 dark:text-rose-300">
                <ArrowUpRight className="h-4 w-4" />
                Rincian Arus Kas Keluar (Pengeluaran)
              </span>
              <span className="font-mono text-xs font-bold text-rose-600">
                {formatCurrency(totalExpense)}
              </span>
            </CardTitle>
            <CardDescription className="text-xs">
              Bersumber dari restock stok masuk farmasi & alat medis dental serta operasional harian.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-xs">
            <div className="flex justify-between items-center p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/40">
              <div>
                <p className="font-semibold text-slate-800 dark:text-slate-200">
                  Pengadaan Obat & Bahan Dental (BMHP Restock)
                </p>
                <p className="text-[11px] text-slate-400">Komposit, Bonding, Pehacain, Jarum, Antibiotik</p>
              </div>
              <span className="font-mono font-bold text-rose-600">
                {formatCurrency(
                  transactions
                    .filter((t) => t.category === "medicine_purchase" || t.referenceType === "stock_in")
                    .reduce((sum, t) => sum + (Number(t.amount) || 0), 0)
                )}
              </span>
            </div>
            <div className="flex justify-between items-center p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/40">
              <div>
                <p className="font-semibold text-slate-800 dark:text-slate-200">Biaya Operasional & Fasilitas</p>
                <p className="text-[11px] text-slate-400">APD, utilitas, listrik, air, dan pemeliharaan</p>
              </div>
              <span className="font-mono font-bold text-rose-600">
                {formatCurrency(
                  transactions
                    .filter((t) => t.category === "operational" && t.referenceType !== "stock_in")
                    .reduce((sum, t) => sum + (Number(t.amount) || 0), 0)
                )}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Automatic Kas Masuk Info Banner */}
      <div className="rounded-2xl border border-emerald-200 bg-gradient-to-r from-emerald-500/10 via-emerald-500/5 to-transparent p-3.5 text-xs text-emerald-900 dark:border-emerald-900/50 dark:text-emerald-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 shadow-xs">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-emerald-600 text-white">
            <Sparkles className="h-4 w-4" />
          </div>
          <div>
            <p className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
              <span>Laporan Kas Masuk Otomatis Terhubung ke Pembayaran Pasien</span>
              <span className="rounded-full bg-emerald-100 px-2 py-0.2 text-[9px] font-bold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                Real-Time
              </span>
            </p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Setiap transaksi pelunasan tindakan dental & obat di kasir langsung disinkronkan ke jurnal kas masuk ini.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Link href="/billing">
            <Button size="sm" variant="outline" className="h-7 text-xs border-emerald-300 text-emerald-700 bg-white hover:bg-emerald-50 dark:bg-slate-900 dark:border-emerald-800 dark:text-emerald-300">
              <Receipt className="h-3 w-3 mr-1" />
              <span>Loket Kasir & Tagihan</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Quick Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2 print:hidden">
        <button
          onClick={() => {
            setFilterType("all");
            setFilterCategory("all");
            setPage(1);
          }}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
            filterType === "all" && filterCategory === "all"
              ? "bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 shadow-xs"
              : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-400"
          }`}
        >
          Semua Mutasi Kas ({transactions.length})
        </button>

        <button
          onClick={() => {
            setFilterType("income");
            setFilterCategory("patient_payment");
            setPage(1);
          }}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
            filterType === "income" && filterCategory === "patient_payment"
              ? "bg-emerald-600 text-white shadow-xs"
              : "bg-emerald-50 border border-emerald-200 text-emerald-800 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:border-emerald-900 dark:text-emerald-300"
          }`}
        >
          <ArrowDownRight className="h-3.5 w-3.5" />
          <span>Kas Masuk: Pembayaran Pasien ({transactions.filter((t) => t.type === "income").length})</span>
        </button>

        <button
          onClick={() => {
            setFilterType("expense");
            setFilterCategory("medicine_purchase");
            setPage(1);
          }}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
            filterType === "expense" && filterCategory === "medicine_purchase"
              ? "bg-rose-600 text-white shadow-xs"
              : "bg-rose-50 border border-rose-200 text-rose-800 hover:bg-rose-100 dark:bg-rose-950/40 dark:border-rose-900 dark:text-rose-300"
          }`}
        >
          <ArrowUpRight className="h-3.5 w-3.5" />
          <span>Kas Keluar: Pengadaan Bahan/Obat ({transactions.filter((t) => t.category === "medicine_purchase" || t.referenceType === "stock_in").length})</span>
        </button>

        <button
          onClick={() => {
            setFilterType("expense");
            setFilterCategory("operational");
            setPage(1);
          }}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
            filterType === "expense" && filterCategory === "operational"
              ? "bg-amber-600 text-white shadow-xs"
              : "bg-amber-50 border border-amber-200 text-amber-800 hover:bg-amber-100 dark:bg-amber-950/40 dark:border-amber-900 dark:text-amber-300"
          }`}
        >
          Biaya Operasional ({transactions.filter((t) => t.category === "operational" && t.referenceType !== "stock_in").length})
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-3.5 text-xs dark:border-slate-800 dark:bg-slate-900 print:hidden">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-semibold text-slate-500 flex items-center gap-1.5 mr-1">
            <Filter className="h-3.5 w-3.5" />
            Filter Jurnal:
          </span>

          {/* Type Filter */}
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="rounded-xl border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs text-slate-700 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-300"
          >
            <option value="all">Semua Tipe (Masuk & Keluar)</option>
            <option value="income">Kas Masuk (+ Pemasukan)</option>
            <option value="expense">Kas Keluar (- Pengeluaran)</option>
          </select>

          {/* Category Filter */}
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="rounded-xl border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs text-slate-700 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-300"
          >
            <option value="all">Semua Kategori</option>
            <option value="patient_payment">Pembayaran Kasir Pasien</option>
            <option value="medicine_purchase">Pengadaan Obat & Bahan Dental</option>
            <option value="operational">Operasional Klinik</option>
          </select>

          {/* Date Filter */}
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="rounded-xl border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs text-slate-700 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-300"
          >
            <option value="all">Semua Waktu</option>
            <option value="today">Hari Ini</option>
            <option value="7days">7 Hari Terakhir</option>
          </select>

          {(filterType !== "all" || filterCategory !== "all" || dateRange !== "all" || searchQuery) && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setFilterType("all");
                setFilterCategory("all");
                setDateRange("all");
                setSearchQuery("");
              }}
              className="h-7 text-xs text-rose-600 hover:bg-rose-50"
            >
              Reset Filter
            </Button>
          )}
        </div>

        {/* Search Bar */}
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari transaksi, pasien, suplier..."
            className="h-8 pl-8 text-xs"
          />
        </div>
      </div>

      {/* Main Ledger Table */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <div>
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <Receipt className="h-5 w-5 text-teal-600" />
              Buku Kas Keuangan: Jurnal Mutasi Masuk & Keluar
            </CardTitle>
            <CardDescription className="text-xs">
              Daftar seluruh transaksi keuangan yang disinkronisasi dari sistem operasional klinik gigi.
            </CardDescription>
          </div>
          <span className="text-xs text-slate-400 font-mono">
            {filteredTransactions.length} dari {transactions.length} transaksi
          </span>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="py-12 text-center text-xs text-slate-500">
              <p>Memuat buku kas keuangan klinik...</p>
            </div>
          ) : filteredTransactions.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-500">
              <Receipt className="mx-auto h-8 w-8 text-slate-300 mb-2" />
              <p className="font-semibold text-sm">Tidak ada transaksi ditemukan.</p>
              <p className="mt-1">Coba sesuaikan filter pencarian atau catat transaksi kas baru.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 font-semibold bg-slate-50/50 dark:bg-slate-900/50">
                    <th className="py-2.5 px-3">Tanggal</th>
                    <th className="py-2.5 px-3">No. Transaksi</th>
                    <th className="py-2.5 px-3">Tipe & Kategori</th>
                    <th className="py-2.5 px-3">Keterangan / Referensi</th>
                    <th className="py-2.5 px-3">Metode</th>
                    <th className="py-2.5 px-3 text-right">Nominal (Rp)</th>
                    <th className="py-2.5 px-3">Operator</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {paginatedTransactions.map((trx) => {
                    const isIncome = trx.type === "income";
                    return (
                      <tr
                        key={trx.id}
                        className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                      >
                        <td className="py-2.5 px-3 text-slate-600 dark:text-slate-400 font-mono whitespace-nowrap">
                          {trx.date ? formatDate(trx.date) : formatDateTime(trx.createdAt)}
                        </td>
                        <td className="py-2.5 px-3 font-mono font-semibold text-slate-700 dark:text-slate-300 text-[11px] whitespace-nowrap">
                          {trx.transactionNumber || trx.id}
                        </td>
                        <td className="py-2.5 px-3">
                          <div className="flex items-center gap-1.5">
                            {isIncome ? (
                              <Badge variant="success" size="sm" className="gap-1">
                                <ArrowDownRight className="h-3 w-3" />
                                <span>Kas Masuk</span>
                              </Badge>
                            ) : (
                              <Badge variant="danger" size="sm" className="gap-1">
                                <ArrowUpRight className="h-3 w-3" />
                                <span>Kas Keluar</span>
                              </Badge>
                            )}
                            <span className="text-[11px] text-slate-500 capitalize">
                              {trx.category === "patient_payment"
                                ? "Kasir Pasien"
                                : trx.category === "medicine_purchase"
                                ? "Restock Farmasi"
                                : "Operasional"}
                            </span>
                          </div>
                        </td>
                        <td className="py-2.5 px-3 max-w-sm">
                          <p className="font-semibold text-slate-800 dark:text-slate-200">
                            {trx.description || trx.notes || "Transaksi Keuangan"}
                          </p>
                          {trx.notes && trx.notes !== trx.description && (
                            <p className="text-[11px] text-slate-400 truncate">{trx.notes}</p>
                          )}
                        </td>
                        <td className="py-2.5 px-3 whitespace-nowrap uppercase font-semibold text-slate-600 dark:text-slate-400 text-[11px]">
                          {trx.paymentMethod || "Tunai"}
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono font-bold whitespace-nowrap">
                          <span
                            className={
                              isIncome
                                ? "text-emerald-600 dark:text-emerald-400 font-bold"
                                : "text-rose-600 dark:text-rose-400 font-bold"
                            }
                          >
                            {isIncome ? `+${formatCurrency(trx.amount)}` : `-${formatCurrency(trx.amount)}`}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-slate-500 whitespace-nowrap">
                          {trx.operatorName || "Petugas"}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              {/* Table Pagination Footer */}
              {totalFiltered > 0 && (
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-t border-slate-100 px-4 py-3 dark:border-slate-800 text-xs text-slate-500">
                  <div className="flex items-center gap-2">
                    <span>
                      Menampilkan <strong className="text-slate-800 dark:text-slate-200">{startRecord}</strong> -{" "}
                      <strong className="text-slate-800 dark:text-slate-200">{endRecord}</strong> dari{" "}
                      <strong className="text-slate-800 dark:text-slate-200">{totalFiltered}</strong> transaksi
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
                        {[5, 10, 20, 50].map((sz) => (
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
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal Dialog: Add Manual Transaction */}
      <Dialog
        open={isAddModalOpen}
        onOpenChange={setIsAddModalOpen}
        title="Catat Transaksi Kas Baru"
        description="Tambahkan catatan mutasi arus kas masuk atau keluar operasional klinik gigi secara manual."
      >
        <form onSubmit={handleSaveTransaction} className="space-y-4 text-xs pt-1">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-bold text-slate-700 dark:text-slate-300">Tipe Transaksi</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                className="w-full rounded-xl border border-slate-200 bg-white p-2 text-xs dark:border-slate-800 dark:bg-slate-900"
              >
                <option value="expense">Kas Keluar (- Pengeluaran)</option>
                <option value="income">Kas Masuk (+ Pemasukan Lain)</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-700 dark:text-slate-300">Kategori</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full rounded-xl border border-slate-200 bg-white p-2 text-xs dark:border-slate-800 dark:bg-slate-900"
              >
                <option value="operational">Biaya Operasional Klinik</option>
                <option value="medicine_purchase">Pembelian Bahan Medis / BMHP</option>
                <option value="utilities">Listrik, Air & Internet</option>
                <option value="maintenance">Pemeliharaan Dental Chair</option>
                <option value="other">Lain-lain</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-bold text-slate-700 dark:text-slate-300">
                Jumlah Nominal (Rp) <span className="text-rose-500">*</span>
              </label>
              <Input
                type="number"
                min="1000"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: Number(e.target.value) || 0 })}
                className="font-mono text-xs"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-700 dark:text-slate-300">Metode Pembayaran</label>
              <select
                value={formData.paymentMethod}
                onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                className="w-full rounded-xl border border-slate-200 bg-white p-2 text-xs dark:border-slate-800 dark:bg-slate-900"
              >
                <option value="cash">Tunai (Kas Kasir)</option>
                <option value="transfer">Transfer Bank Klinik</option>
                <option value="debit">Kartu Debit</option>
              </select>
            </div>
          </div>

          <div className="space-y-1">
            <label className="font-bold text-slate-700 dark:text-slate-300">
              Deskripsi Transaksi <span className="text-rose-500">*</span>
            </label>
            <Input
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="e.g. Pembelian bahan sterilisasi autoclave & kassa dental"
              className="text-xs"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-bold text-slate-700 dark:text-slate-300">Tanggal Transaksi</label>
              <Input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="text-xs"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-700 dark:text-slate-300">Catatan Tambahan</label>
              <Input
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="No bukti nota / keterangan"
                className="text-xs"
              />
            </div>
          </div>

          <div className="pt-3 flex justify-end gap-2 border-t border-slate-100 dark:border-slate-800">
            <Button variant="outline" size="sm" type="button" onClick={() => setIsAddModalOpen(false)}>
              Batal
            </Button>
            <Button
              variant="primary"
              size="sm"
              type="submit"
              isLoading={isSubmitting}
              className="bg-teal-600 hover:bg-teal-700 text-white font-semibold"
            >
              Simpan ke Buku Kas
            </Button>
          </div>
        </form>
      </Dialog>
    </div>
  );
}
