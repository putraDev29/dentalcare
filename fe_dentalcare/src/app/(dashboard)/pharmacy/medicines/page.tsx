"use client";

import * as React from "react";
import Link from "next/link";
import {
  Pill,
  Plus,
  AlertTriangle,
  ArrowLeft,
  ArrowDownRight,
  ArrowUpRight,
  PackagePlus,
  PackageMinus,
  Layers,
  Receipt,
  Calendar,
  DollarSign,
  History,
  CheckCircle2,
  Edit3,
  Filter,
  Search,
  RefreshCw,
  Building2,
  Sparkles,
} from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { DataTable } from "@/components/shared/data-table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Dialog } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { usePharmacy, useFinance } from "@/hooks";
import { PharmacyService } from "@/services";
import { Medicine, MedicineMutation } from "@/types";
import { formatCurrency, formatDate, formatDateTime } from "@/lib/formatting";
import { ColumnDef } from "@tanstack/react-table";
import { toast } from "sonner";

export default function MedicinesMasterPage() {
  const {
    medicines,
    loading,
    refetch,
    createMedicine,
    updateMedicine,
    stockIn,
    stockOut,
      } = usePharmacy();

  const {
    summary: financeSummary,
    transactions: financeTrx,
    refetch: refetchFinance,
  } = useFinance();

  // Mutations state
  const [mutations, setMutations] = React.useState<MedicineMutation[]>([]);
  const [loadingMutations, setLoadingMutations] = React.useState(false);

  // Filter states
  const [selectedCategory, setSelectedCategory] = React.useState<string>("all");
  const [showLowStockOnly, setShowLowStockOnly] = React.useState<boolean>(false);

  // Modal dialog states
  const [isAddOpen, setIsAddOpen] = React.useState(false);
  const [isStockInOpen, setIsStockInOpen] = React.useState(false);
  const [isStockOutOpen, setIsStockOutOpen] = React.useState(false);
  const [isEditOpen, setIsEditOpen] = React.useState(false);
  const [selectedMedicine, setSelectedMedicine] = React.useState<Medicine | null>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  // Form states: New Medicine
  const [newMedForm, setNewMedForm] = React.useState({
    brandName: "",
    genericName: "",
    dosageForm: "Tablet",
    strength: "",
    unit: "tablet",
    manufacturer: "",
    category: "Analgesic",
    currentStock: 50,
    minimumStock: 10,
    purchasePrice: 2000,
    sellingPrice: 3500,
    expiryDate: "2027-12-31",
    requiresPrescription: true,
  });

  // Form states: Stock In
  const [stockInForm, setStockInForm] = React.useState({
    medicineId: "",
    quantity: 20,
    unitCost: 0,
    supplier: "PT Kimia Farma Trading",
    referenceNo: "",
    batchNumber: "",
    expiryDate: "",
    notes: "Pembelian restock rutin bahan farmasi",
    syncFinance: true,
  });

  // Form states: Stock Out
  const [stockOutForm, setStockOutForm] = React.useState({
    medicineId: "",
    quantity: 1,
    reason: "treatment", // treatment, prescription, damaged, expired, adjustment
    notes: "Pemakaian klinis di Dental Chair",
  });

  // Form states: Edit Medicine
  const [editForm, setEditForm] = React.useState({
    brandName: "",
    genericName: "",
    dosageForm: "Tablet",
    strength: "",
    unit: "tablet",
    manufacturer: "",
    category: "Analgesic",
    minimumStock: 10,
    purchasePrice: 0,
    sellingPrice: 0,
    expiryDate: "",
  });

  // Tab state
  const [activeTab, setActiveTab] = React.useState("catalog");

  // Load mutations (stable reference, only runs when mutations tab is selected)
  const fetchMutations = React.useCallback(async () => {
    setLoadingMutations(true);
    try {
      const res = await PharmacyService.getMutations();
      setMutations(res || []);
    } catch {
      // ignore
    } finally {
      setLoadingMutations(false);
    }
  }, []);

  // Only load mutations on-demand
  React.useEffect(() => {
    if (activeTab === "mutations" && mutations.length === 0) {
      fetchMutations();
    }
  }, [activeTab, fetchMutations, mutations.length]);

  // Overall calculations
  const totalStockUnits = medicines.reduce((sum, m) => sum + (m.currentStock || 0), 0);
  const lowStockCount = medicines.filter((m) => m.currentStock <= m.minimumStock).length;
  const totalInventoryValue = medicines.reduce(
    (sum, m) => sum + (m.currentStock || 0) * (m.purchasePrice || 0),
    0
  );

  // Filtered medicines
  const filteredMedicines = React.useMemo(() => {
    return medicines.filter((m) => {
      const matchCategory = selectedCategory === "all" || m.category === selectedCategory;
      const matchLowStock = !showLowStockOnly || m.currentStock <= m.minimumStock;
      return matchCategory && matchLowStock;
    });
  }, [medicines, selectedCategory, showLowStockOnly]);

  // Handle open Stock In for specific medicine
  const handleOpenStockIn = (med?: Medicine) => {
    const target = med || medicines[0];
    if (target) {
      setSelectedMedicine(target);
      setStockInForm({
        medicineId: target.id,
        quantity: 20,
        unitCost: target.purchasePrice || 0,
        supplier: target.manufacturer || "Distributor Dental Medika",
        referenceNo: `INV-RESTOCK-${Date.now().toString().slice(-5)}`,
        batchNumber: `BATCH-${Date.now().toString().slice(-4)}`,
        expiryDate: target.expiryDate || "2027-12-31",
        notes: `Restock bahan dental: ${target.brandName}`,
        syncFinance: true,
      });
    }
    setIsStockInOpen(true);
  };

  // Handle open Stock Out for specific medicine
  const handleOpenStockOut = (med?: Medicine) => {
    const target = med || medicines[0];
    if (target) {
      setSelectedMedicine(target);
      setStockOutForm({
        medicineId: target.id,
        quantity: 1,
        reason: "treatment",
        notes: `Pemakaian ${target.brandName} pada tindakan pasien klinik`,
      });
    }
    setIsStockOutOpen(true);
  };

  // Handle open Edit for specific medicine
  const handleOpenEdit = (med: Medicine) => {
    setSelectedMedicine(med);
    setEditForm({
      brandName: med.brandName,
      genericName: med.genericName,
      dosageForm: med.dosageForm,
      strength: med.strength || "",
      unit: med.unit,
      manufacturer: med.manufacturer || "",
      category: med.category,
      minimumStock: med.minimumStock,
      purchasePrice: med.purchasePrice,
      sellingPrice: med.sellingPrice,
      expiryDate: med.expiryDate || "",
    });
    setIsEditOpen(true);
  };

  // Submit Stock In
  const handleSubmitStockIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stockInForm.medicineId || stockInForm.quantity <= 0) {
      toast.error("Pilih obat dan tentukan jumlah masuk yang valid!");
      return;
    }

    setIsSubmitting(true);
    try {
      await stockIn(
        stockInForm.medicineId,
        stockInForm.quantity,
        stockInForm.unitCost,
        stockInForm.supplier,
        stockInForm.notes,
        stockInForm.syncFinance
      );

      const totalCost = stockInForm.quantity * stockInForm.unitCost;
      toast.success(
        `Stok masuk berhasil dicatat! ${
          stockInForm.syncFinance && totalCost > 0
            ? `Pengeluaran kas ${formatCurrency(totalCost)} otomatis tersinkron ke Buku Kas.`
            : ""
        }`
      );
      setIsStockInOpen(false);
      await Promise.all([refetch(), fetchMutations(), refetchFinance()]);
    } catch (err: any) {
      toast.error(err?.message || "Gagal mencatat stok masuk.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Submit Stock Out
  const handleSubmitStockOut = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stockOutForm.medicineId || stockOutForm.quantity <= 0) {
      toast.error("Pilih obat dan tentukan jumlah keluar yang valid!");
      return;
    }

    const cur = medicines.find((m) => m.id === stockOutForm.medicineId);
    if (cur && stockOutForm.quantity > cur.currentStock) {
      toast.error(`Jumlah keluar (${stockOutForm.quantity}) melebihi stok yang tersedia (${cur.currentStock})!`);
      return;
    }

    setIsSubmitting(true);
    try {
      await stockOut(
        stockOutForm.medicineId,
        stockOutForm.quantity,
        stockOutForm.notes,
        stockOutForm.reason
      );

      toast.success("Stok keluar berhasil dicatat di mutasi persediaan.");
      setIsStockOutOpen(false);
      await Promise.all([refetch(), fetchMutations()]);
    } catch (err: any) {
      toast.error(err?.message || "Gagal mencatat stok keluar.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Submit New Medicine
  const handleSubmitNewMedicine = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMedForm.brandName || !newMedForm.genericName) {
      toast.error("Nama merek dan nama generik wajib diisi!");
      return;
    }

    setIsSubmitting(true);
    try {
      await createMedicine(newMedForm as any);
      toast.success("Obat/Bahan dental baru berhasil ditambahkan!");
      setIsAddOpen(false);
      await Promise.all([refetch(), fetchMutations()]);
      setNewMedForm({
        brandName: "",
        genericName: "",
        dosageForm: "Tablet",
        strength: "",
        unit: "tablet",
        manufacturer: "",
        category: "Analgesic",
        currentStock: 50,
        minimumStock: 10,
        purchasePrice: 2000,
        sellingPrice: 3500,
        expiryDate: "2027-12-31",
        requiresPrescription: true,
      });
    } catch (err: any) {
      toast.error(err?.message || "Gagal menambahkan obat baru.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Submit Edit Medicine
  const handleSubmitEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMedicine) return;

    setIsSubmitting(true);
    try {
      await updateMedicine(selectedMedicine.id, editForm as any);
      toast.success("Data obat berhasil diperbarui!");
      setIsEditOpen(false);
      await refetch();
    } catch (err: any) {
      toast.error(err?.message || "Gagal memperbarui data obat.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Table Columns: Catalog
  const columns: ColumnDef<Medicine>[] = [
    {
      accessorKey: "code",
      header: "Kode",
      cell: ({ row }) => (
        <span className="font-mono text-xs font-semibold text-slate-700 dark:text-slate-300">
          {row.original.code}
        </span>
      ),
    },
    {
      accessorKey: "genericName",
      header: "Nama Generik & Brand",
      cell: ({ row }) => (
        <div>
          <p className="font-bold text-xs text-slate-900 dark:text-slate-100">
            {row.original.genericName}
          </p>
          <p className="text-[11px] text-slate-500">
            Merek: <span className="font-semibold text-teal-700 dark:text-teal-400">{row.original.brandName}</span> â€¢ {row.original.manufacturer || "Distributor"}
          </p>
        </div>
      ),
    },
    {
      accessorKey: "strength",
      header: "Sediaan & Dosis",
      cell: ({ row }) => (
        <span className="text-xs text-slate-700 dark:text-slate-300">
          {row.original.dosageForm} {row.original.strength}
        </span>
      ),
    },
    {
      accessorKey: "category",
      header: "Kategori",
      cell: ({ row }) => (
        <Badge variant="neutral" size="sm">
          {row.original.category}
        </Badge>
      ),
    },
    {
      accessorKey: "currentStock",
      header: "Stok Fisik",
      cell: ({ row }) => {
        const m = row.original;
        const isLow = m.currentStock <= m.minimumStock;
        return (
          <div>
            <div className="flex items-center gap-1.5">
              <span
                className={`font-mono font-bold text-xs ${
                  isLow
                    ? "text-rose-600 bg-rose-50 dark:bg-rose-950/60 px-2 py-0.5 rounded-md"
                    : "text-emerald-700 dark:text-emerald-400"
                }`}
              >
                {m.currentStock} {m.unit}
              </span>
              {isLow && (
                <span title="Stok kritis di bawah batas minimum!">
                  <AlertTriangle className="h-3 w-3 text-rose-500" />
                </span>
              )}
            </div>
            <p className="text-[10px] text-slate-400">Min: {m.minimumStock} {m.unit}</p>
          </div>
        );
      },
    },
    {
      accessorKey: "purchasePrice",
      header: "Harga Beli & Jual",
      cell: ({ row }) => (
        <div className="text-xs">
          <p className="font-mono text-slate-500 text-[11px]">
            Beli: {formatCurrency(row.original.purchasePrice)}
          </p>
          <p className="font-mono font-bold text-teal-700 dark:text-teal-400">
            Jual: {formatCurrency(row.original.sellingPrice)}
          </p>
        </div>
      ),
    },
    {
      accessorKey: "expiryDate",
      header: "Kadaluarsa",
      cell: ({ row }) => (
        <span className="font-mono text-xs text-slate-600 dark:text-slate-400">
          {formatDate(row.original.expiryDate)}
        </span>
      ),
    },
    {
      accessorKey: "stockStatus",
      header: "Status",
      cell: ({ row }) => {
        const st = row.original.stockStatus;
        if (st === "in_stock") return <Badge variant="success" size="sm">Aman</Badge>;
        if (st === "low_stock") return <Badge variant="warning" size="sm">Menipis</Badge>;
        return <Badge variant="danger" size="sm">Habis</Badge>;
      },
    },
    {
      id: "actions",
      header: "Aksi Cepat",
      cell: ({ row }) => {
        const med = row.original;
        return (
          <div className="flex items-center gap-1.5">
            <Button
              variant="outline"
              size="sm"
              className="h-7 px-2 text-[11px] gap-1 border-teal-200 text-teal-700 hover:bg-teal-50 dark:border-teal-800"
              onClick={() => handleOpenStockIn(med)}
              title="Input Stok Masuk / Restock"
            >
              <PackagePlus className="h-3 w-3" />
              <span>Masuk</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-7 px-2 text-[11px] gap-1 border-amber-200 text-amber-700 hover:bg-amber-50 dark:border-amber-800"
              onClick={() => handleOpenStockOut(med)}
              title="Input Stok Keluar / Pemakaian"
            >
              <PackageMinus className="h-3 w-3" />
              <span>Keluar</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 w-7 p-0 text-slate-400 hover:text-slate-700"
              onClick={() => handleOpenEdit(med)}
              title="Edit Data Obat"
            >
              <Edit3 className="h-3.5 w-3.5" />
            </Button>
          </div>
        );
      },
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <PageHeader
        title="Master Farmasi, Stok & Sinkronisasi Keuangan"
        description="Kelola katalog obat gigi, input stok masuk & keluar, pantau mutasi persediaan, dan sinkronkan transaksi pengadaan otomatis ke laporan kas keuangan klinik."
      >
        <div className="flex flex-wrap items-center gap-2">
          <Link href="/pharmacy">
            <Button variant="outline" size="sm" className="gap-1.5 text-xs">
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Antrean E-Resep</span>
            </Button>
          </Link>
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5 text-xs border-amber-300 text-amber-700 hover:bg-amber-50"
            onClick={() => handleOpenStockOut()}
          >
            <PackageMinus className="h-3.5 w-3.5" />
            <span>- Stok Keluar (Pakai)</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5 text-xs border-teal-300 text-teal-700 hover:bg-teal-50"
            onClick={() => handleOpenStockIn()}
          >
            <PackagePlus className="h-3.5 w-3.5" />
            <span>+ Stok Masuk (Beli)</span>
          </Button>
          <Button
            variant="primary"
            size="sm"
            className="gap-1.5 text-xs shadow-sm bg-teal-600 hover:bg-teal-700 text-white font-semibold"
            onClick={() => setIsAddOpen(true)}
          >
            <Plus className="h-3.5 w-3.5" />
            <span>+ Obat Baru</span>
          </Button>
        </div>
      </PageHeader>

      {/* Summary Stat Cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
        <Card className="p-4 border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Total Jenis Obat</span>
            <Layers className="h-4 w-4 text-teal-600" />
          </div>
          <p className="mt-2 font-mono text-2xl font-bold text-slate-900 dark:text-slate-100">
            {medicines.length}
          </p>
          <p className="text-[11px] text-slate-400 mt-0.5">Item aktif di katalog</p>
        </Card>

        <Card className="p-4 border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Total Fisik Stok</span>
            <Pill className="h-4 w-4 text-sky-600" />
          </div>
          <p className="mt-2 font-mono text-2xl font-bold text-sky-600">
            {totalStockUnits.toLocaleString("id-ID")}
          </p>
          <p className="text-[11px] text-slate-400 mt-0.5">Tablet, botol, ampul, carpule</p>
        </Card>

        <Card className="p-4 border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Stok Kritis / Menipis</span>
            <AlertTriangle className="h-4 w-4 text-rose-500" />
          </div>
          <p className="mt-2 font-mono text-2xl font-bold text-rose-600">
            {lowStockCount}
          </p>
          <p className="text-[11px] text-rose-500 mt-0.5">Perlu segera restock</p>
        </Card>

        <Card className="p-4 border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Nilai Aset Persediaan</span>
            <DollarSign className="h-4 w-4 text-emerald-600" />
          </div>
          <p className="mt-2 font-mono text-xl font-bold text-emerald-600">
            {formatCurrency(totalInventoryValue)}
          </p>
          <p className="text-[11px] text-slate-400 mt-0.5">Berdasarkan HPP Beli</p>
        </Card>
      </div>

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-1">
          <TabsTrigger value="catalog" className="gap-2">
            <Layers className="h-4 w-4 text-teal-600" />
            <span>Katalog Master Obat ({medicines.length})</span>
          </TabsTrigger>
          <TabsTrigger value="mutations" className="gap-2">
            <History className="h-4 w-4 text-sky-600" />
            <span>Riwayat Mutasi Stok ({mutations.length})</span>
          </TabsTrigger>
          <TabsTrigger value="finance" className="gap-2">
            <Receipt className="h-4 w-4 text-emerald-600" />
            <span>Sinkronisasi Kas Keuangan</span>
          </TabsTrigger>
        </TabsList>

        {/* ========================================================= */}
        {/* TAB 1: KATALOG MASTER OBAT & STOK GUDANG */}
        {/* ========================================================= */}
        <TabsContent value="catalog" className="space-y-4">
          {/* Quick Filters */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
            <div className="flex flex-wrap items-center gap-1.5 text-xs">
              <span className="text-slate-500 font-semibold mr-1 flex items-center gap-1">
                <Filter className="h-3.5 w-3.5" /> Kategori:
              </span>
              {[
                { key: "all", label: "Semua" },
                { key: "Analgesic", label: "Analgesik & Antiinflamasi" },
                { key: "Antibiotic", label: "Antibiotik Gigi" },
                { key: "Antiseptic", label: "Antiseptik / Obat Kumur" },
                { key: "Anesthetic", label: "Anestesi Dental" },
                { key: "Emergency", label: "Gawat Darurat / Alergi" },
                { key: "Vitamin", label: "Vitamin & Suplemen" },
              ].map((c) => (
                <button
                  type="button"
                  key={c.key}
                  onClick={() => setSelectedCategory(c.key)}
                  className={`px-2.5 py-1 rounded-lg transition-colors font-medium ${
                    selectedCategory === c.key
                      ? "bg-teal-600 text-white font-semibold"
                      : "bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300"
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>

            <label className="flex items-center gap-2 text-xs font-semibold text-rose-600 cursor-pointer">
              <input
                type="checkbox"
                checked={showLowStockOnly}
                onChange={(e) => setShowLowStockOnly(e.target.checked)}
                className="rounded border-rose-300 text-rose-600 focus:ring-rose-500"
              />
              <span>Tampilkan Hanya Stok Menipis</span>
            </label>
          </div>

          <DataTable
            columns={columns}
            data={filteredMedicines}
            searchPlaceholder="Cari obat generik, merek dagang, atau kategori..."
            emptyTitle="Obat tidak ditemukan"
            emptyDescription="Coba ubah kata kunci pencarian atau filter kategori di atas."
          />
        </TabsContent>

        {/* ========================================================= */}
        {/* TAB 2: RIWAYAT MUTASI STOK (MASUK & KELUAR) */}
        {/* ========================================================= */}
        <TabsContent value="mutations" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <div>
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <History className="h-5 w-5 text-sky-600" />
                  Buku Catatan Mutasi Stok Obat & Bahan Dental
                </CardTitle>
                <CardDescription className="text-xs">
                  Semua transaksi barang masuk (pembelian/restock) dan barang keluar (pemakaian tindakan dental, rusak, kadaluarsa).
                </CardDescription>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5 text-xs"
                onClick={fetchMutations}
                disabled={loadingMutations}
              >
                <RefreshCw className={`h-3.5 w-3.5 ${loadingMutations ? "animate-spin" : ""}`} />
                <span>Segarkan Data</span>
              </Button>
            </CardHeader>
            <CardContent>
              {mutations.length === 0 ? (
                <div className="text-center py-12 text-slate-500 text-xs">
                  <p className="font-semibold text-sm">Belum ada riwayat mutasi stok.</p>
                  <p className="mt-1">Gunakan tombol "+ Stok Masuk" atau "- Stok Keluar" untuk mencatat pergerakan barang.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 font-semibold bg-slate-50/50 dark:bg-slate-900/50">
                        <th className="py-2.5 px-3">Tanggal & Waktu</th>
                        <th className="py-2.5 px-3">No. Referensi</th>
                        <th className="py-2.5 px-3">Nama Obat / Bahan</th>
                        <th className="py-2.5 px-3">Tipe Mutasi</th>
                        <th className="py-2.5 px-3 text-right">Jumlah</th>
                        <th className="py-2.5 px-3 text-center">Perubahan Stok</th>
                        <th className="py-2.5 px-3 text-right">Total Nilai (Rp)</th>
                        <th className="py-2.5 px-3">Keterangan / Supplier</th>
                        <th className="py-2.5 px-3">Status Sinkronisasi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {mutations.map((mut) => {
                        const isIn = mut.type === "in";
                        return (
                          <tr key={mut.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                            <td className="py-2.5 px-3 text-slate-600 dark:text-slate-400 font-mono">
                              {formatDateTime(mut.createdAt)}
                            </td>
                            <td className="py-2.5 px-3 font-mono text-slate-500 text-[11px]">
                              {mut.referenceNo || mut.id}
                            </td>
                            <td className="py-2.5 px-3 font-bold text-slate-900 dark:text-slate-100">
                              {mut.medicineName}
                            </td>
                            <td className="py-2.5 px-3">
                              {isIn ? (
                                <Badge variant="success" size="sm" className="gap-1">
                                  <ArrowDownRight className="h-3 w-3" />
                                  <span>Masuk (Restock)</span>
                                </Badge>
                              ) : (
                                <Badge variant="danger" size="sm" className="gap-1">
                                  <ArrowUpRight className="h-3 w-3" />
                                  <span>Keluar ({mut.reason || "Pakai"})</span>
                                </Badge>
                              )}
                            </td>
                            <td className="py-2.5 px-3 text-right font-mono font-bold">
                              <span className={isIn ? "text-emerald-600" : "text-rose-600"}>
                                {isIn ? `+${mut.quantity}` : `-${mut.quantity}`}
                              </span>
                            </td>
                            <td className="py-2.5 px-3 text-center font-mono text-slate-500 text-[11px]">
                              {mut.stockBefore} â†’ <span className="font-bold text-slate-800 dark:text-slate-200">{mut.stockAfter}</span>
                            </td>
                            <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900 dark:text-slate-100">
                              {mut.totalPrice > 0 ? formatCurrency(mut.totalPrice) : "-"}
                            </td>
                            <td className="py-2.5 px-3 text-slate-600 dark:text-slate-400 max-w-xs truncate">
                              {mut.notes || "-"}
                            </td>
                            <td className="py-2.5 px-3">
                              {isIn && mut.totalPrice > 0 ? (
                                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-md">
                                  <CheckCircle2 className="h-3 w-3" />
                                  Kas Keluar Tercatat
                                </span>
                              ) : (
                                <span className="text-[11px] text-slate-400">Non-Finansial</span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ========================================================= */}
        {/* TAB 3: SINKRONISASI BUKU KAS KEUANGAN */}
        {/* ========================================================= */}
        <TabsContent value="finance" className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card className="p-4 border-slate-200 dark:border-slate-800">
              <span className="text-xs font-semibold text-slate-500">Total Pengeluaran Kas Pembelian Bahan</span>
              <p className="mt-2 font-mono text-2xl font-bold text-rose-600">
                {formatCurrency(financeSummary?.totalExpense || 0)}
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5">Tercatat dari transaksi restock farmasi & operasional</p>
            </Card>

            <Card className="p-4 border-slate-200 dark:border-slate-800">
              <span className="text-xs font-semibold text-slate-500">Total Pemasukan Kas Klinik</span>
              <p className="mt-2 font-mono text-2xl font-bold text-emerald-600">
                {formatCurrency(financeSummary?.totalIncome || 0)}
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5">Dari tagihan invoice pasien & kasir gigi</p>
            </Card>

            <Card className="p-4 border-slate-200 dark:border-slate-800">
              <span className="text-xs font-semibold text-slate-500">Saldo Kas Bersih Klinik (Net Cashflow)</span>
              <p className="mt-2 font-mono text-2xl font-bold text-teal-600">
                {formatCurrency(financeSummary?.netBalance || 0)}
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5">Surplus keuangan berjalan</p>
            </Card>
          </div>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <div>
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <Receipt className="h-5 w-5 text-teal-600" />
                  Jurnal Transaksi Kas Keuangan Terintegrasi Farmasi
                </CardTitle>
                <CardDescription className="text-xs">
                  Daftar transaksi kas masuk (pembayaran pasien) dan kas keluar (pembelian obat/bahan dental) yang tersinkronisasi otomatis.
                </CardDescription>
              </div>
              <Link href="/reports">
                <Button variant="outline" size="sm" className="gap-1.5 text-xs">
                  <span>Buka Semua Laporan Kas</span>
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              {financeTrx.length === 0 ? (
                <p className="text-xs text-slate-500 py-6 text-center">
                  Belum ada transaksi kas keuangan. Lakukan stok masuk dengan opsi sinkronisasi kas aktif untuk mencatat pengeluaran.
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 font-semibold bg-slate-50/50 dark:bg-slate-900/50">
                        <th className="py-2.5 px-3">Tanggal</th>
                        <th className="py-2.5 px-3">No. Transaksi</th>
                        <th className="py-2.5 px-3">Arus Kas</th>
                        <th className="py-2.5 px-3">Kategori</th>
                        <th className="py-2.5 px-3">Deskripsi</th>
                        <th className="py-2.5 px-3 text-right">Nominal</th>
                        <th className="py-2.5 px-3">Metode</th>
                        <th className="py-2.5 px-3">Petugas</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {financeTrx.map((trx: any) => {
                        const isIncome = trx.type === "income";
                        return (
                          <tr key={trx.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                            <td className="py-2.5 px-3 font-mono text-slate-600">{formatDate(trx.date)}</td>
                            <td className="py-2.5 px-3 font-mono text-[11px] text-slate-500">{trx.transactionNumber || trx.id}</td>
                            <td className="py-2.5 px-3">
                              {isIncome ? (
                                <Badge variant="success" size="sm">Kas Masuk (Income)</Badge>
                              ) : (
                                <Badge variant="danger" size="sm">Kas Keluar (Expense)</Badge>
                              )}
                            </td>
                            <td className="py-2.5 px-3 font-medium text-slate-700 dark:text-slate-300">
                              {trx.category}
                            </td>
                            <td className="py-2.5 px-3 text-slate-800 dark:text-slate-200 max-w-sm">
                              {trx.description}
                            </td>
                            <td className="py-2.5 px-3 text-right font-mono font-bold">
                              <span className={isIncome ? "text-emerald-600" : "text-rose-600"}>
                                {isIncome ? `+${formatCurrency(trx.amount)}` : `-${formatCurrency(trx.amount)}`}
                              </span>
                            </td>
                            <td className="py-2.5 px-3 uppercase text-[11px] text-slate-500">{trx.paymentMethod || "Cash"}</td>
                            <td className="py-2.5 px-3 text-slate-500">{trx.operatorName || "-"}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* ========================================================= */}
      {/* MODAL 1: TAMBAH OBAT / BAHAN BARU */}
      {/* ========================================================= */}
      <Dialog
        open={isAddOpen}
        onOpenChange={setIsAddOpen}
        title="Tambah Obat / Bahan Dental Baru"
        description="Daftarkan obat generik, paten, atau bahan habis pakai (BMHP) baru ke katalog farmasi klinik."
        className="max-w-xl"
      >
        <form onSubmit={handleSubmitNewMedicine} className="space-y-4 pt-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Nama Merek / Brand Dagang <span className="text-rose-500">*</span>
              </label>
              <Input
                required
                value={newMedForm.brandName}
                onChange={(e) => setNewMedForm({ ...newMedForm, brandName: e.target.value })}
                placeholder="e.g. Ponstan, Minosep, Filtek Z250"
                className="h-8 text-xs"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Nama Generik / Zat Aktif <span className="text-rose-500">*</span>
              </label>
              <Input
                required
                value={newMedForm.genericName}
                onChange={(e) => setNewMedForm({ ...newMedForm, genericName: e.target.value })}
                placeholder="e.g. Asam Mefenamat, Chlorhexidine"
                className="h-8 text-xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Bentuk Sediaan
              </label>
              <select
                value={newMedForm.dosageForm}
                onChange={(e) => setNewMedForm({ ...newMedForm, dosageForm: e.target.value as any })}
                className="w-full h-8 px-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs"
              >
                <option value="Tablet">Tablet</option>
                <option value="Capsule">Kapsul</option>
                <option value="Syrup">Sirup</option>
                <option value="Injection">Injeksi / Ampul</option>
                <option value="Ointment">Gel / Salep</option>
                <option value="Drops">Obat Kumur / Tetes</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Dosis / Kekuatan
              </label>
              <Input
                value={newMedForm.strength}
                onChange={(e) => setNewMedForm({ ...newMedForm, strength: e.target.value })}
                placeholder="e.g. 500mg, 0.2%, 150ml"
                className="h-8 text-xs"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Satuan Kemasan
              </label>
              <Input
                required
                value={newMedForm.unit}
                onChange={(e) => setNewMedForm({ ...newMedForm, unit: e.target.value })}
                placeholder="tablet, botol, ampul, carpule"
                className="h-8 text-xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Kategori Medis
              </label>
              <select
                value={newMedForm.category}
                onChange={(e) => setNewMedForm({ ...newMedForm, category: e.target.value as any })}
                className="w-full h-8 px-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs"
              >
                <option value="Analgesic">Analgesik & Antiinflamasi</option>
                <option value="Antibiotic">Antibiotik Gigi</option>
                <option value="Antiseptic">Antiseptik / Obat Kumur</option>
                <option value="Anesthetic">Anestesi Dental</option>
                <option value="Emergency">Gawat Darurat / Alergi</option>
                <option value="Vitamin">Vitamin & Suplemen</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Pabrikan / Distributor
              </label>
              <Input
                value={newMedForm.manufacturer}
                onChange={(e) => setNewMedForm({ ...newMedForm, manufacturer: e.target.value })}
                placeholder="e.g. Kimia Farma, Kalbe, Pfizer, 3M"
                className="h-8 text-xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Stok Awal
              </label>
              <Input
                type="number"
                min="0"
                value={newMedForm.currentStock}
                onChange={(e) => setNewMedForm({ ...newMedForm, currentStock: parseInt(e.target.value) || 0 })}
                className="h-8 text-xs font-mono"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Batas Min. Stok
              </label>
              <Input
                type="number"
                min="1"
                value={newMedForm.minimumStock}
                onChange={(e) => setNewMedForm({ ...newMedForm, minimumStock: parseInt(e.target.value) || 1 })}
                className="h-8 text-xs font-mono"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Harga Beli Satuan
              </label>
              <Input
                type="number"
                min="0"
                value={newMedForm.purchasePrice}
                onChange={(e) => setNewMedForm({ ...newMedForm, purchasePrice: parseFloat(e.target.value) || 0 })}
                className="h-8 text-xs font-mono"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Harga Jual Satuan
              </label>
              <Input
                type="number"
                min="0"
                value={newMedForm.sellingPrice}
                onChange={(e) => setNewMedForm({ ...newMedForm, sellingPrice: parseFloat(e.target.value) || 0 })}
                className="h-8 text-xs font-mono font-bold text-teal-700"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Tanggal Kadaluarsa
              </label>
              <Input
                type="date"
                value={newMedForm.expiryDate}
                onChange={(e) => setNewMedForm({ ...newMedForm, expiryDate: e.target.value })}
                className="h-8 text-xs font-mono"
              />
            </div>

            <div className="flex items-center gap-2 pt-6">
              <input
                type="checkbox"
                id="reqPrescription"
                checked={newMedForm.requiresPrescription}
                onChange={(e) => setNewMedForm({ ...newMedForm, requiresPrescription: e.target.checked })}
                className="rounded border-slate-300 text-teal-600 focus:ring-teal-500"
              />
              <label htmlFor="reqPrescription" className="text-xs font-medium text-slate-700 dark:text-slate-300 cursor-pointer">
                Perlu Resep Dokter Gigi (Obat Keras)
              </label>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-slate-100 dark:border-slate-800">
            <Button type="button" variant="outline" size="sm" onClick={() => setIsAddOpen(false)}>
              Batal
            </Button>
            <Button type="submit" variant="primary" size="sm" isLoading={isSubmitting} className="bg-teal-600 hover:bg-teal-700">
              Simpan Obat Baru
            </Button>
          </div>
        </form>
      </Dialog>

      {/* ========================================================= */}
      {/* MODAL 2: STOK MASUK (RESTOCK / PEMBELIAN) & SINKRONISASI KAS */}
      {/* ========================================================= */}
      <Dialog
        open={isStockInOpen}
        onOpenChange={setIsStockInOpen}
        title="Input Stok Masuk (Restock / Pembelian Bahan)"
        description="Tambahkan stok fisik obat masuk dari distributor. Total biaya pembelian dapat otomatis dicatat sebagai Pengeluaran Kas Keuangan."
        className="max-w-xl"
      >
        <form onSubmit={handleSubmitStockIn} className="space-y-4 pt-2">
          {/* Medicine Selector */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Pilih Obat / Bahan Dental <span className="text-rose-500">*</span>
            </label>
            <select
              value={stockInForm.medicineId}
              onChange={(e) => {
                const target = medicines.find((m) => m.id === e.target.value);
                if (target) {
                  setSelectedMedicine(target);
                  setStockInForm({
                    ...stockInForm,
                    medicineId: target.id,
                    unitCost: target.purchasePrice || 0,
                    notes: `Restock bahan dental: ${target.brandName}`,
                  });
                }
              }}
              className="w-full h-9 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-semibold"
            >
              {medicines.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.brandName} ({m.genericName}) â€” Sisa Stok: {m.currentStock} {m.unit}
                </option>
              ))}
            </select>
          </div>

          {selectedMedicine && (
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 text-xs flex justify-between">
              <div>
                <p className="font-semibold text-slate-800 dark:text-slate-200">{selectedMedicine.brandName}</p>
                <p className="text-[11px] text-slate-500">{selectedMedicine.dosageForm} â€¢ {selectedMedicine.strength || "Standard"}</p>
              </div>
              <div className="text-right">
                <span className="font-mono font-bold text-teal-700 dark:text-teal-400">
                  Stok Saat Ini: {selectedMedicine.currentStock} {selectedMedicine.unit}
                </span>
                <p className="text-[11px] text-slate-400">Harga Beli Lama: {formatCurrency(selectedMedicine.purchasePrice)}</p>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Jumlah Masuk (Unit / Tablet) <span className="text-rose-500">*</span>
              </label>
              <Input
                type="number"
                min="1"
                required
                value={stockInForm.quantity}
                onChange={(e) => setStockInForm({ ...stockInForm, quantity: parseInt(e.target.value) || 0 })}
                className="h-8 text-xs font-mono font-bold"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Harga Beli Satuan (Rp)
              </label>
              <Input
                type="number"
                min="0"
                required
                value={stockInForm.unitCost}
                onChange={(e) => setStockInForm({ ...stockInForm, unitCost: parseFloat(e.target.value) || 0 })}
                className="h-8 text-xs font-mono"
              />
            </div>
          </div>

          {/* Realtime Total Calculation */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800">
            <div>
              <span className="text-xs text-teal-800 dark:text-teal-200 font-medium">Total Nilai Pembelian:</span>
              <p className="text-[11px] text-teal-600 dark:text-teal-400">
                {stockInForm.quantity} unit Ã— {formatCurrency(stockInForm.unitCost)}
              </p>
            </div>
            <span className="font-mono text-base font-bold text-teal-800 dark:text-teal-200">
              {formatCurrency(stockInForm.quantity * stockInForm.unitCost)}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Nama Distributor / Supplier Dental
              </label>
              <Input
                value={stockInForm.supplier}
                onChange={(e) => setStockInForm({ ...stockInForm, supplier: e.target.value })}
                placeholder="e.g. PT Kimia Farma, Dental Distributor"
                className="h-8 text-xs"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                No. Faktur / Surat Jalan
              </label>
              <Input
                value={stockInForm.referenceNo}
                onChange={(e) => setStockInForm({ ...stockInForm, referenceNo: e.target.value })}
                placeholder="e.g. FAK-2026-0901"
                className="h-8 text-xs font-mono"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Catatan Pembelian
            </label>
            <Input
              value={stockInForm.notes}
              onChange={(e) => setStockInForm({ ...stockInForm, notes: e.target.value })}
              className="h-8 text-xs"
            />
          </div>

          {/* Financial Cashout Sync Box */}
          <div className="p-3.5 rounded-xl border border-emerald-300 bg-emerald-50/70 dark:bg-emerald-950/30 dark:border-emerald-800 space-y-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={stockInForm.syncFinance}
                onChange={(e) => setStockInForm({ ...stockInForm, syncFinance: e.target.checked })}
                className="rounded border-emerald-400 text-emerald-600 focus:ring-emerald-500"
              />
              <span className="text-xs font-bold text-emerald-900 dark:text-emerald-200">
                Sinkronkan Otomatis ke Laporan Kas Keuangan (Pengeluaran Kas)
              </span>
            </label>
            <p className="text-[11px] text-emerald-700 dark:text-emerald-300 pl-6 leading-relaxed">
              Jika dicentang, transaksi kas keluar sebesar{" "}
              <strong>{formatCurrency(stockInForm.quantity * stockInForm.unitCost)}</strong>{" "}
              akan langsung tercatat di Buku Kas Keuangan klinik dengan kategori "Pengadaan Obat & Bahan Dental".
            </p>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
            <Button type="button" variant="outline" size="sm" onClick={() => setIsStockInOpen(false)}>
              Batal
            </Button>
            <Button type="submit" variant="primary" size="sm" isLoading={isSubmitting} className="bg-teal-600 hover:bg-teal-700">
              Konfirmasi Simpan Stok Masuk
            </Button>
          </div>
        </form>
      </Dialog>

      {/* ========================================================= */}
      {/* MODAL 3: STOK KELUAR (PEMAKAIAN / RUSAK / KADALUARSA) */}
      {/* ========================================================= */}
      <Dialog
        open={isStockOutOpen}
        onOpenChange={setIsStockOutOpen}
        title="Input Stok Keluar (Pemakaian Tindakan Dental / Kadaluarsa)"
        description="Kurangi stok obat fisik karena pemakaian medis di dental chair, obat rusak, atau pemusnahan barang kadaluarsa."
        className="max-w-lg"
      >
        <form onSubmit={handleSubmitStockOut} className="space-y-4 pt-2">
          {/* Medicine Selector */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Pilih Obat / Bahan Dental <span className="text-rose-500">*</span>
            </label>
            <select
              value={stockOutForm.medicineId}
              onChange={(e) => {
                const target = medicines.find((m) => m.id === e.target.value);
                if (target) {
                  setSelectedMedicine(target);
                  setStockOutForm({
                    ...stockOutForm,
                    medicineId: target.id,
                    notes: `Pemakaian ${target.brandName} pada tindakan pasien`,
                  });
                }
              }}
              className="w-full h-9 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-semibold"
            >
              {medicines.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.brandName} ({m.genericName}) â€” Sisa: {m.currentStock} {m.unit}
                </option>
              ))}
            </select>
          </div>

          {selectedMedicine && (
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 text-xs flex justify-between">
              <div>
                <p className="font-semibold text-slate-800 dark:text-slate-200">{selectedMedicine.brandName}</p>
                <p className="text-[11px] text-slate-500">{selectedMedicine.genericName}</p>
              </div>
              <div className="text-right">
                <span className="font-mono font-bold text-rose-600 dark:text-rose-400">
                  Stok Tersedia: {selectedMedicine.currentStock} {selectedMedicine.unit}
                </span>
                <p className="text-[10px] text-slate-400">Min. Alert: {selectedMedicine.minimumStock}</p>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Jumlah Keluar <span className="text-rose-500">*</span>
              </label>
              <Input
                type="number"
                min="1"
                required
                value={stockOutForm.quantity}
                onChange={(e) => setStockOutForm({ ...stockOutForm, quantity: parseInt(e.target.value) || 0 })}
                className="h-8 text-xs font-mono font-bold"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Alasan Pengeluaran <span className="text-rose-500">*</span>
              </label>
              <select
                value={stockOutForm.reason}
                onChange={(e) => setStockOutForm({ ...stockOutForm, reason: e.target.value })}
                className="w-full h-8 px-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs"
              >
                <option value="treatment">Pemakaian Klinis (Dental Chair)</option>
                <option value="prescription">Penyerahan Resep Dokter Gigi</option>
                <option value="damaged">Obat / Kemasan Rusak</option>
                <option value="expired">Pemusnahan Kadaluarsa</option>
                <option value="adjustment">Koreksi Stok Opname Fisik</option>
              </select>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Catatan Pengeluaran
            </label>
            <Input
              value={stockOutForm.notes}
              onChange={(e) => setStockOutForm({ ...stockOutForm, notes: e.target.value })}
              placeholder="e.g. Pemakaian untuk 3 pasien scaling & penambalan"
              className="h-8 text-xs"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
            <Button type="button" variant="outline" size="sm" onClick={() => setIsStockOutOpen(false)}>
              Batal
            </Button>
            <Button type="submit" variant="primary" size="sm" isLoading={isSubmitting} className="bg-rose-600 hover:bg-rose-700">
              Simpan Stok Keluar
            </Button>
          </div>
        </form>
      </Dialog>

      {/* ========================================================= */}
      {/* MODAL 4: EDIT MASTER OBAT */}
      {/* ========================================================= */}
      <Dialog
        open={isEditOpen}
        onOpenChange={setIsEditOpen}
        title={`Edit Data Obat: ${selectedMedicine?.brandName || ""}`}
        description="Perbarui informasi sediaan, harga jual, atau batas minimum stok."
        className="max-w-xl"
      >
        <form onSubmit={handleSubmitEdit} className="space-y-4 pt-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Nama Merek</label>
              <Input
                required
                value={editForm.brandName}
                onChange={(e) => setEditForm({ ...editForm, brandName: e.target.value })}
                className="h-8 text-xs"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Nama Generik</label>
              <Input
                required
                value={editForm.genericName}
                onChange={(e) => setEditForm({ ...editForm, genericName: e.target.value })}
                className="h-8 text-xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Batas Min. Stok</label>
              <Input
                type="number"
                value={editForm.minimumStock}
                onChange={(e) => setEditForm({ ...editForm, minimumStock: parseInt(e.target.value) || 0 })}
                className="h-8 text-xs font-mono"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Harga Beli</label>
              <Input
                type="number"
                value={editForm.purchasePrice}
                onChange={(e) => setEditForm({ ...editForm, purchasePrice: parseFloat(e.target.value) || 0 })}
                className="h-8 text-xs font-mono"
              />
            </div>
            <div className="space-y-1 sm:col-span-2">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Harga Jual</label>
              <Input
                type="number"
                value={editForm.sellingPrice}
                onChange={(e) => setEditForm({ ...editForm, sellingPrice: parseFloat(e.target.value) || 0 })}
                className="h-8 text-xs font-mono font-bold text-teal-700"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
            <Button type="button" variant="outline" size="sm" onClick={() => setIsEditOpen(false)}>
              Batal
            </Button>
            <Button type="submit" variant="primary" size="sm" isLoading={isSubmitting} className="bg-teal-600 hover:bg-teal-700">
              Perbarui Data
            </Button>
          </div>
        </form>
      </Dialog>
    </div>
  );
}