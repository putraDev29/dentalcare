"use client";

import * as React from "react";
import Link from "next/link";
import {
  Pill,
  CheckCircle2,
  Clock,
  PackageCheck,
  AlertTriangle,
  Layers,
  PackagePlus,
  PackageMinus,
  Plus,
  History,
  Receipt,
  Filter,
  ArrowDownRight,
  ArrowUpRight,
  Edit3,
  Search,
  DollarSign,
  Boxes,
  Sparkles,
  RefreshCw,
  Landmark,
} from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/shared/stat-card";
import { DataTable } from "@/components/shared/data-table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/shared/status-badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Dialog } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { usePharmacy, useFinance } from "@/hooks";
import { PharmacyService } from "@/services";
import { Medicine, MedicineMutation, Prescription } from "@/types";
import { formatTime, formatCurrency, formatDate, formatDateTime } from "@/lib/formatting";
import { ColumnDef } from "@tanstack/react-table";
import { ClinicalWorkflowStepper } from "@/components/dental/clinical-workflow-stepper";
import { toast } from "sonner";

export default function UnifiedPharmacyAndMedicalSuppliesPage() {
  const {
    prescriptions,
    medicines,
    loading,
    refetch,
    updatePrescriptionStatus,
    createMedicine,
    updateMedicine,
    stockIn,
    stockOut,
  } = usePharmacy();

  const { refetch: refetchFinance } = useFinance();

  // Mutations log state
  const [mutations, setMutations] = React.useState<MedicineMutation[]>([]);
  const [loadingMutations, setLoadingMutations] = React.useState(false);

  // Filters state
  const [selectedCategory, setSelectedCategory] = React.useState<string>("all");
  const [showLowStockOnly, setShowLowStockOnly] = React.useState<boolean>(false);

  // Dialog Modals State
  const [isStockInOpen, setIsStockInOpen] = React.useState(false);
  const [isStockOutOpen, setIsStockOutOpen] = React.useState(false);
  const [isAddOpen, setIsAddOpen] = React.useState(false);
  const [isEditOpen, setIsEditOpen] = React.useState(false);
  const [selectedItem, setSelectedItem] = React.useState<Medicine | null>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  // Form: Stock In (Penerimaan Barang / Restock)
  const [stockInForm, setStockInForm] = React.useState({
    medicineId: "",
    quantity: 10,
    unitCost: 0,
    supplier: "GC Dental Indonesia",
    referenceNo: "",
    batchNumber: "",
    expiryDate: "2028-12-31",
    notes: "Restock rutin bahan & obat dental",
    syncFinance: true,
  });

  // Form: Stock Out (Pemakaian Dental Chair)
  const [stockOutForm, setStockOutForm] = React.useState({
    medicineId: "",
    quantity: 1,
    reason: "treatment", // treatment, prescription, damaged, expired, adjustment
    notes: "Pemakaian tindakan pada pasien di Dental Chair",
  });

  // Form: New Item (Obat / Alat Medis)
  const [newItemForm, setNewItemForm] = React.useState({
    brandName: "",
    genericName: "",
    dosageForm: "Syringe",
    strength: "",
    unit: "syringe",
    manufacturer: "",
    category: "Bahan Tambal & Restorasi",
    currentStock: 20,
    minimumStock: 5,
    purchasePrice: 150000,
    sellingPrice: 220000,
    expiryDate: "2028-12-31",
    requiresPrescription: false,
  });

  // Form: Edit Item
  const [editForm, setEditForm] = React.useState({
    brandName: "",
    genericName: "",
    dosageForm: "",
    strength: "",
    unit: "",
    manufacturer: "",
    category: "",
    minimumStock: 10,
    purchasePrice: 0,
    sellingPrice: 0,
    expiryDate: "",
  });

  // Tab state
  const [activeTab, setActiveTab] = React.useState("prescriptions");

  // Load mutations on-demand
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

  // Only load mutations when the user clicks the mutations tab
  React.useEffect(() => {
    if (activeTab === "mutations" && mutations.length === 0) {
      fetchMutations();
    }
  }, [activeTab, fetchMutations, mutations.length]);

  // Calculations
  const waiting = prescriptions.filter((p) => p.status === "waiting");
  const preparing = prescriptions.filter((p) => p.status === "preparing");
  const ready = prescriptions.filter((p) => p.status === "ready");
  const dispensed = prescriptions.filter((p) => p.status === "dispensed");

  const totalStockUnits = medicines.reduce((sum, m) => sum + (m.currentStock || 0), 0);
  const lowStockCount = medicines.filter((m) => m.currentStock <= m.minimumStock).length;
  const totalInventoryValue = medicines.reduce(
    (sum, m) => sum + (m.currentStock || 0) * (m.purchasePrice || 0),
    0
  );

  // Filtered medicines
  const filteredMedicines = React.useMemo(() => {
    return medicines.filter((m) => {
      const matchCat =
        selectedCategory === "all" ||
        m.category === selectedCategory ||
        (selectedCategory === "Obat" && ["Antibiotic", "Analgesic", "Gastrointestinal", "Antiallergy"].includes(m.category));
      const matchLow = !showLowStockOnly || m.currentStock <= m.minimumStock;
      return matchCat && matchLow;
    });
  }, [medicines, selectedCategory, showLowStockOnly]);

  // Prescription Status Handler
  const handlePrescriptionStatus = async (id: string, status: Prescription["status"], msg: string) => {
    try {
      await updatePrescriptionStatus(id, status);
      toast.success(msg);
    } catch {
      toast.error("Gagal memperbarui status resep.");
    }
  };

  // Open Stock In Modal
  const handleOpenStockIn = (item?: Medicine) => {
    const target = item || medicines[0];
    if (target) {
      setSelectedItem(target);
      setStockInForm({
        medicineId: target.id,
        quantity: 10,
        unitCost: target.purchasePrice || 0,
        supplier: target.manufacturer || "Distributor Dental Medika",
        referenceNo: `INV-RESTOCK-${Date.now().toString().slice(-5)}`,
        batchNumber: `BATCH-${Date.now().toString().slice(-4)}`,
        expiryDate: target.expiryDate || "2028-12-31",
        notes: `Restock item: ${target.brandName}`,
        syncFinance: true,
      });
    }
    setIsStockInOpen(true);
  };

  // Open Stock Out Modal
  const handleOpenStockOut = (item?: Medicine) => {
    const target = item || medicines[0];
    if (target) {
      setSelectedItem(target);
      setStockOutForm({
        medicineId: target.id,
        quantity: 1,
        reason: "treatment",
        notes: `Pemakaian ${target.brandName} pada tindakan pasien`,
      });
    }
    setIsStockOutOpen(true);
  };

  // Open Edit Modal
  const handleOpenEdit = (item: Medicine) => {
    setSelectedItem(item);
    setEditForm({
      brandName: item.brandName,
      genericName: item.genericName,
      dosageForm: item.dosageForm,
      strength: item.strength || "",
      unit: item.unit,
      manufacturer: item.manufacturer || "",
      category: item.category,
      minimumStock: item.minimumStock,
      purchasePrice: item.purchasePrice,
      sellingPrice: item.sellingPrice,
      expiryDate: item.expiryDate || "",
    });
    setIsEditOpen(true);
  };

  // Submit Stock In
  const handleSubmitStockIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stockInForm.medicineId || stockInForm.quantity <= 0) {
      toast.error("Pilih barang dan masukkan jumlah stok masuk yang valid!");
      return;
    }

    setIsSubmitting(true);
    try {
      await stockIn(
        stockInForm.medicineId,
        Number(stockInForm.quantity),
        Number(stockInForm.unitCost),
        stockInForm.supplier,
        stockInForm.notes,
        stockInForm.syncFinance
      );

      const totalCost = Number(stockInForm.quantity) * Number(stockInForm.unitCost);
      toast.success(
        `Stok masuk berhasil dicatat! ${
          stockInForm.syncFinance && totalCost > 0
            ? `Pengeluaran ${formatCurrency(totalCost)} otomatis tersinkron ke Laporan Keuangan.`
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
      toast.error("Pilih barang dan tentukan jumlah yang valid!");
      return;
    }

    const currentItem = medicines.find((m) => m.id === stockOutForm.medicineId);
    if (currentItem && stockOutForm.quantity > currentItem.currentStock) {
      toast.error(`Jumlah keluar (${stockOutForm.quantity}) melebihi stok yang tersedia (${currentItem.currentStock})!`);
      return;
    }

    setIsSubmitting(true);
    try {
      await stockOut(
        stockOutForm.medicineId,
        Number(stockOutForm.quantity),
        stockOutForm.notes,
        stockOutForm.reason
      );

      toast.success("Pemakaian/pengeluaran stok berhasil dicatat.");
      setIsStockOutOpen(false);
      await Promise.all([refetch(), fetchMutations()]);
    } catch (err: any) {
      toast.error(err?.message || "Gagal mencatat stok keluar.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Submit New Item
  const handleSubmitNewItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemForm.brandName || !newItemForm.genericName) {
      toast.error("Nama merek dan nama generik/bahan wajib diisi!");
      return;
    }

    setIsSubmitting(true);
    try {
      await createMedicine(newItemForm as any);
      toast.success("Item obat / alat medis baru berhasil ditambahkan!");
      setIsAddOpen(false);
      await Promise.all([refetch(), fetchMutations()]);
      setNewItemForm({
        brandName: "",
        genericName: "",
        dosageForm: "Syringe",
        strength: "",
        unit: "syringe",
        manufacturer: "",
        category: "Bahan Tambal & Restorasi",
        currentStock: 20,
        minimumStock: 5,
        purchasePrice: 150000,
        sellingPrice: 220000,
        expiryDate: "2028-12-31",
        requiresPrescription: false,
      });
    } catch (err: any) {
      toast.error(err?.message || "Gagal menambahkan item baru.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Submit Edit Item
  const handleSubmitEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItem) return;

    setIsSubmitting(true);
    try {
      await updateMedicine(selectedItem.id, editForm as any);
      toast.success("Data item berhasil diperbarui!");
      setIsEditOpen(false);
      await refetch();
    } catch (err: any) {
      toast.error(err?.message || "Gagal memperbarui data.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Table Columns for Catalog
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
      header: "Nama Bahan / Obat & Merek",
      cell: ({ row }) => (
        <div>
          <p className="font-bold text-xs text-slate-900 dark:text-slate-100">
            {row.original.genericName}
          </p>
          <p className="text-[11px] text-slate-500">
            Merek: <span className="font-semibold text-teal-700 dark:text-teal-400">{row.original.brandName}</span> • {row.original.manufacturer || "Distributor Dental"}
          </p>
        </div>
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
                <span title="Stok kritis menipis!">
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
      id: "actions",
      header: "Aksi Cepat",
      cell: ({ row }) => {
        const item = row.original;
        return (
          <div className="flex items-center gap-1.5">
            <Button
              variant="outline"
              size="sm"
              className="h-7 px-2 text-[11px] gap-1 border-teal-200 text-teal-700 hover:bg-teal-50 dark:border-teal-800"
              onClick={() => handleOpenStockIn(item)}
              title="Input Stok Masuk / Restock"
            >
              <PackagePlus className="h-3 w-3" />
              <span>+ Masuk</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-7 px-2 text-[11px] gap-1 border-amber-200 text-amber-700 hover:bg-amber-50 dark:border-amber-800"
              onClick={() => handleOpenStockOut(item)}
              title="Input Pemakaian di Dental Chair"
            >
              <PackageMinus className="h-3 w-3" />
              <span>- Pakai</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 w-7 p-0 text-slate-400 hover:text-slate-700"
              onClick={() => handleOpenEdit(item)}
              title="Edit Data Item"
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
      {/* Visual Clinical Stepper */}
      <ClinicalWorkflowStepper />

      {/* Page Header */}
      <PageHeader
        title="Farmasi & Logistik Alat Medis Dental"
        description="Pusat terpadu pengelolaan stok obat gigi, anestesi, bahan habis pakai (komposit, bonding, etchant, jarum), telaah e-resep pasien, dan sinkronisasi pembelian ke buku kas keuangan."
      >
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5 text-xs border-amber-300 text-amber-700 hover:bg-amber-50"
            onClick={() => handleOpenStockOut()}
          >
            <PackageMinus className="h-3.5 w-3.5" />
            <span>- Catat Pemakaian Chair</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            className="gap-1.5 text-xs border-teal-300 text-teal-700 hover:bg-teal-50"
            onClick={() => handleOpenStockIn()}
          >
            <PackagePlus className="h-3.5 w-3.5" />
            <span>+ Input Stok Masuk (Beli)</span>
          </Button>

          <Button
            variant="primary"
            size="sm"
            className="gap-1.5 text-xs shadow-xs bg-teal-600 hover:bg-teal-700 text-white font-semibold"
            onClick={() => setIsAddOpen(true)}
          >
            <Plus className="h-3.5 w-3.5" />
            <span>+ Tambah Item Baru</span>
          </Button>

          <Link href="/finance">
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5 text-xs border-emerald-300 text-emerald-700 hover:bg-emerald-50 dark:border-emerald-800"
            >
              <Landmark className="h-3.5 w-3.5" />
              <span>Buku Kas Keuangan</span>
            </Button>
          </Link>
        </div>
      </PageHeader>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
        <StatCard
          title="Antrean Resep Hari Ini"
          value={waiting.length + preparing.length}
          icon={Clock}
          iconColor="text-amber-500"
        />
        <StatCard
          title="Total Item Obat & Alat"
          value={medicines.length}
          icon={Boxes}
          iconColor="text-teal-600"
        />
        <StatCard
          title="Stok Kritis / Menipis"
          value={lowStockCount}
          icon={AlertTriangle}
          iconColor="text-rose-500"
        />
        <StatCard
          title="Total Nilai Persediaan"
          value={formatCurrency(totalInventoryValue)}
          icon={DollarSign}
          iconColor="text-emerald-600"
        />
      </div>

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-1 flex-wrap">
          <TabsTrigger value="prescriptions" className="gap-2">
            <Pill className="h-4 w-4 text-teal-600" />
            <span>Antrean E-Resep Pasien ({waiting.length + preparing.length + ready.length})</span>
          </TabsTrigger>
          <TabsTrigger value="catalog" className="gap-2">
            <Layers className="h-4 w-4 text-sky-600" />
            <span>Katalog Stok Obat & Alat Medis ({medicines.length})</span>
          </TabsTrigger>
          <TabsTrigger value="mutations" className="gap-2">
            <History className="h-4 w-4 text-indigo-600" />
            <span>Buku Mutasi Stok ({mutations.length})</span>
          </TabsTrigger>
          <TabsTrigger value="dispensed" className="gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            <span>Riwayat Resep Selesai ({dispensed.length})</span>
          </TabsTrigger>
        </TabsList>

        {/* ==================================================== */}
        {/* TAB 1: ANTREAN RESEP PASIEN */}
        {/* ==================================================== */}
        <TabsContent value="prescriptions" className="space-y-4">
          {waiting.length + preparing.length + ready.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center text-xs text-slate-500">
                <CheckCircle2 className="mx-auto h-8 w-8 text-emerald-500 mb-2" />
                <p className="font-semibold text-sm">Tidak ada antrean resep yang perlu disiapkan saat ini.</p>
                <p className="mt-1">Resep dari ruang pemeriksaan dokter akan otomatis muncul di sini.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...waiting, ...preparing, ...ready].map((rx) => (
                <Card key={rx.id} className="hover:border-teal-300 transition-all">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-bold text-teal-700 dark:text-teal-400">
                        {rx.prescriptionNumber}
                      </span>
                      <StatusBadge type="prescription" status={rx.status} />
                    </div>
                    <CardTitle className="text-sm pt-1">{rx.patientName}</CardTitle>
                    <CardDescription className="font-mono text-[11px]">
                      {rx.patientMrn} • DPJP: {rx.doctorName}
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="space-y-3 text-xs">
                    {/* Items List */}
                    <div className="rounded-xl bg-slate-50 p-2.5 dark:bg-slate-800/50 space-y-1.5">
                      {rx.items.map((item) => (
                        <div key={item.id} className="flex justify-between text-slate-700 dark:text-slate-300">
                          <span className="font-medium truncate mr-2">
                            {item.medicineName} ({item.quantity} tab)
                          </span>
                          <span className="font-mono text-slate-500 shrink-0">
                            {item.frequency}
                          </span>
                        </div>
                      ))}
                    </div>

                    <div className="flex justify-between items-center text-[11px] text-slate-500 pt-1">
                      <span>Total Obat: {rx.items.length} item</span>
                      <span className="font-bold text-teal-700 dark:text-teal-300">
                        {formatCurrency(rx.totalAmount)}
                      </span>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1.5 pt-2 border-t border-slate-100 dark:border-slate-800">
                      {rx.status === "waiting" && (
                        <Button
                          size="sm"
                          className="w-full h-8 text-xs bg-teal-600 hover:bg-teal-700"
                          onClick={() =>
                            handlePrescriptionStatus(rx.id, "preparing", "Resep sedang diracik/disiapkan.")
                          }
                        >
                          Siapkan Obat & BMHP
                        </Button>
                      )}
                      {rx.status === "preparing" && (
                        <Button
                          size="sm"
                          variant="subtle"
                          className="w-full h-8 text-xs"
                          onClick={() =>
                            handlePrescriptionStatus(rx.id, "ready", "Obat telah selesai dikemas dan siap dipanggil.")
                          }
                        >
                          Selesai Dikemas
                        </Button>
                      )}
                      {rx.status === "ready" && (
                        <Button
                          size="sm"
                          className="w-full h-8 text-xs bg-emerald-600 hover:bg-emerald-700 text-white"
                          onClick={() =>
                            handlePrescriptionStatus(rx.id, "dispensed", "Obat telah diserahkan ke pasien.")
                          }
                        >
                          Serahkan ke Pasien
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* ==================================================== */}
        {/* TAB 2: KATALOG TERPADU OBAT & ALAT MEDIS */}
        {/* ==================================================== */}
        <TabsContent value="catalog" className="space-y-4">
          {/* Quick Filters */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
            <div className="flex flex-wrap items-center gap-1.5 text-xs">
              <span className="text-slate-500 font-semibold mr-1 flex items-center gap-1">
                <Filter className="h-3.5 w-3.5" /> Kategori:
              </span>
              {[
                { key: "all", label: "Semua Item" },
                { key: "Obat", label: "Obat Oral & Topikal" },
                { key: "Anestesi Dental", label: "Anestesi Dental" },
                { key: "Bahan Tambal & Restorasi", label: "Bahan Tambal & Restorasi" },
                { key: "Alat Medis & BMHP", label: "Alat Medis & Disposable BMHP" },
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
              <span>Hanya Stok Menipis ({lowStockCount})</span>
            </label>
          </div>

          <DataTable
            columns={columns}
            data={filteredMedicines}
            searchPlaceholder="Cari obat, komposit, bonding, anestesi, atau alat dental..."
            emptyTitle="Item tidak ditemukan"
            emptyDescription="Coba ubah kata kunci pencarian atau tambah item baru."
          />
        </TabsContent>

        {/* ==================================================== */}
        {/* TAB 3: BUKU MUTASI STOK KARTU STOK */}
        {/* ==================================================== */}
        <TabsContent value="mutations" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <div>
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <History className="h-5 w-5 text-indigo-600" />
                  Buku Catatan Mutasi Persediaan Obat & Bahan Dental
                </CardTitle>
                <CardDescription className="text-xs">
                  Semua transaksi barang masuk (restock distributor) dan barang keluar (pemakaian tindakan dental chair).
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
                <span>Segarkan Mutasi</span>
              </Button>
            </CardHeader>
            <CardContent>
              {mutations.length === 0 ? (
                <div className="text-center py-12 text-slate-500 text-xs">
                  <p className="font-semibold text-sm">Belum ada riwayat mutasi stok.</p>
                  <p className="mt-1">Gunakan tombol "+ Input Stok Masuk" untuk mencatat pengadaan pertama.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 font-semibold bg-slate-50/50 dark:bg-slate-900/50">
                        <th className="py-2.5 px-3">Tanggal</th>
                        <th className="py-2.5 px-3">No. Referensi</th>
                        <th className="py-2.5 px-3">Nama Barang / Obat</th>
                        <th className="py-2.5 px-3">Tipe Mutasi</th>
                        <th className="py-2.5 px-3 text-right">Jumlah</th>
                        <th className="py-2.5 px-3 text-center">Perubahan Stok</th>
                        <th className="py-2.5 px-3 text-right">Total Nilai (Rp)</th>
                        <th className="py-2.5 px-3">Keterangan / Supplier</th>
                        <th className="py-2.5 px-3">Sinkron Kas</th>
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
                              {mut.stockBefore} → <span className="font-bold text-slate-800 dark:text-slate-200">{mut.stockAfter}</span>
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
                                  Tersinkron ke Kas
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

        {/* ==================================================== */}
        {/* TAB 4: RIWAYAT RESEP SELESAI */}
        {/* ==================================================== */}
        <TabsContent value="dispensed">
          <Card>
            <CardHeader>
              <CardTitle>Riwayat Penyerahan Obat Selesai</CardTitle>
              <CardDescription>Resep yang telah diserahkan kepada pasien oleh petugas apotek</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {dispensed.map((rx) => (
                  <div
                    key={rx.id}
                    className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3.5 rounded-xl border border-slate-200 text-xs dark:border-slate-800 gap-2"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-teal-700">{rx.prescriptionNumber}</span>
                        <span className="font-semibold text-slate-800 dark:text-slate-200">{rx.patientName}</span>
                        <span className="text-slate-400 font-mono">({rx.patientMrn})</span>
                      </div>
                      <p className="text-slate-500 mt-1">
                        Diserahkan oleh: <strong>{rx.dispensedBy || "Apoteker"}</strong> • Total Biaya: {formatCurrency(rx.totalAmount)}
                      </p>
                    </div>
                    <StatusBadge type="prescription" status={rx.status} />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* ==================================================== */}
      {/* MODAL 1: INPUT STOK MASUK (STOCK IN / RESTOCK) */}
      {/* ==================================================== */}
      <Dialog
        open={isStockInOpen}
        onOpenChange={setIsStockInOpen}
        title="Input Stok Masuk (Penerimaan Barang / Restock)"
        description="Catat penerimaan obat atau bahan medis dari supplier. Pembelian dapat otomatis dicatat ke Buku Kas Keuangan."
      >
        <form onSubmit={handleSubmitStockIn} className="space-y-4 text-xs pt-1">
          <div className="space-y-1">
            <label className="font-bold text-slate-700 dark:text-slate-300">
              Pilih Item Obat / Alat Medis <span className="text-rose-500">*</span>
            </label>
            <select
              value={stockInForm.medicineId}
              onChange={(e) => {
                const med = medicines.find((m) => m.id === e.target.value);
                setStockInForm({
                  ...stockInForm,
                  medicineId: e.target.value,
                  unitCost: med ? med.purchasePrice : 0,
                  supplier: med?.manufacturer || stockInForm.supplier,
                });
              }}
              className="w-full rounded-xl border border-slate-200 bg-white p-2 text-xs dark:border-slate-800 dark:bg-slate-900"
              required
            >
              <option value="" disabled>Pilih barang...</option>
              {medicines.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.brandName} ({m.genericName}) - Stok saat ini: {m.currentStock} {m.unit}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-bold text-slate-700 dark:text-slate-300">
                Jumlah Masuk (Qty) <span className="text-rose-500">*</span>
              </label>
              <Input
                type="number"
                min="1"
                value={stockInForm.quantity}
                onChange={(e) => setStockInForm({ ...stockInForm, quantity: Number(e.target.value) || 0 })}
                className="font-mono text-xs"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-700 dark:text-slate-300">
                Harga Beli Satuan (Rp)
              </label>
              <Input
                type="number"
                min="0"
                value={stockInForm.unitCost}
                onChange={(e) => setStockInForm({ ...stockInForm, unitCost: Number(e.target.value) || 0 })}
                className="font-mono text-xs"
              />
            </div>
          </div>

          {/* Subtotal calculation */}
          <div className="p-2.5 rounded-xl bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-900/60 flex items-center justify-between">
            <span className="font-semibold text-teal-900 dark:text-teal-200">Total Nilai Pembelian:</span>
            <span className="font-mono font-bold text-sm text-teal-800 dark:text-teal-300">
              {formatCurrency(Number(stockInForm.quantity) * Number(stockInForm.unitCost))}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-bold text-slate-700 dark:text-slate-300">Nama Supplier / Distributor</label>
              <Input
                value={stockInForm.supplier}
                onChange={(e) => setStockInForm({ ...stockInForm, supplier: e.target.value })}
                placeholder="e.g. GC Dental Indonesia, Cobra Dental"
                className="text-xs"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-700 dark:text-slate-300">No. Surat Jalan / Faktur</label>
              <Input
                value={stockInForm.referenceNo}
                onChange={(e) => setStockInForm({ ...stockInForm, referenceNo: e.target.value })}
                placeholder="INV-RESTOCK-2026"
                className="font-mono text-xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-bold text-slate-700 dark:text-slate-300">Nomor Batch</label>
              <Input
                value={stockInForm.batchNumber}
                onChange={(e) => setStockInForm({ ...stockInForm, batchNumber: e.target.value })}
                placeholder="BATCH-001"
                className="font-mono text-xs"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-700 dark:text-slate-300">Tanggal Kadaluarsa (Exp)</label>
              <Input
                type="date"
                value={stockInForm.expiryDate}
                onChange={(e) => setStockInForm({ ...stockInForm, expiryDate: e.target.value })}
                className="text-xs"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="font-bold text-slate-700 dark:text-slate-300">Catatan Penerimaan</label>
            <Input
              value={stockInForm.notes}
              onChange={(e) => setStockInForm({ ...stockInForm, notes: e.target.value })}
              placeholder="Keterangan pengadaan barang"
              className="text-xs"
            />
          </div>

          {/* Sync to Finance Checkbox */}
          <div className="p-3 rounded-xl border border-emerald-200 bg-emerald-50/50 dark:border-emerald-900/60 dark:bg-emerald-950/20">
            <label className="flex items-center gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={stockInForm.syncFinance}
                onChange={(e) => setStockInForm({ ...stockInForm, syncFinance: e.target.checked })}
                className="h-4 w-4 rounded border-emerald-400 text-teal-600 focus:ring-teal-500"
              />
              <div>
                <span className="font-bold text-emerald-900 dark:text-emerald-300 flex items-center gap-1.5">
                  <Landmark className="h-3.5 w-3.5 text-emerald-700" />
                  Sinkronkan Otomatis ke Laporan Keuangan (Buku Kas)
                </span>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Total biaya pembelian ({formatCurrency(Number(stockInForm.quantity) * Number(stockInForm.unitCost))}) akan dicatat sebagai pengeluaran kas klinik.
                </p>
              </div>
            </label>
          </div>

          <div className="pt-3 flex justify-end gap-2 border-t border-slate-100 dark:border-slate-800">
            <Button variant="outline" size="sm" type="button" onClick={() => setIsStockInOpen(false)}>
              Batal
            </Button>
            <Button
              variant="primary"
              size="sm"
              type="submit"
              isLoading={isSubmitting}
              className="bg-teal-600 hover:bg-teal-700 text-white font-semibold"
            >
              Simpan Stok Masuk
            </Button>
          </div>
        </form>
      </Dialog>

      {/* ==================================================== */}
      {/* MODAL 2: INPUT STOK KELUAR (STOCK OUT / PEMAKAIAN) */}
      {/* ==================================================== */}
      <Dialog
        open={isStockOutOpen}
        onOpenChange={setIsStockOutOpen}
        title="Input Stok Keluar (Pemakaian Tindakan Gigi / Penyesuaian)"
        description="Catat pengurangan stok barang akibat pemakaian klinis di Dental Chair, barang rusak, atau kadaluarsa."
      >
        <form onSubmit={handleSubmitStockOut} className="space-y-4 text-xs pt-1">
          <div className="space-y-1">
            <label className="font-bold text-slate-700 dark:text-slate-300">
              Pilih Item Obat / Bahan Medis <span className="text-rose-500">*</span>
            </label>
            <select
              value={stockOutForm.medicineId}
              onChange={(e) => setStockOutForm({ ...stockOutForm, medicineId: e.target.value })}
              className="w-full rounded-xl border border-slate-200 bg-white p-2 text-xs dark:border-slate-800 dark:bg-slate-900"
              required
            >
              <option value="" disabled>Pilih barang...</option>
              {medicines.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.brandName} - Tersedia: {m.currentStock} {m.unit}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-bold text-slate-700 dark:text-slate-300">
                Jumlah Keluar (Qty) <span className="text-rose-500">*</span>
              </label>
              <Input
                type="number"
                min="1"
                value={stockOutForm.quantity}
                onChange={(e) => setStockOutForm({ ...stockOutForm, quantity: Number(e.target.value) || 0 })}
                className="font-mono text-xs"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-700 dark:text-slate-300">Alasan Pengeluaran</label>
              <select
                value={stockOutForm.reason}
                onChange={(e) => setStockOutForm({ ...stockOutForm, reason: e.target.value })}
                className="w-full rounded-xl border border-slate-200 bg-white p-2 text-xs dark:border-slate-800 dark:bg-slate-900"
              >
                <option value="treatment">Pemakaian Tindakan Gigi (Dental Chair)</option>
                <option value="prescription">Penyerahan Resep Pasien</option>
                <option value="expired">Barang Kadaluarsa</option>
                <option value="damaged">Barang Rusak / Pecah</option>
                <option value="adjustment">Penyesuaian Stok Opname</option>
              </select>
            </div>
          </div>

          <div className="space-y-1">
            <label className="font-bold text-slate-700 dark:text-slate-300">Keterangan Tambahan</label>
            <Textarea
              rows={2}
              value={stockOutForm.notes}
              onChange={(e) => setStockOutForm({ ...stockOutForm, notes: e.target.value })}
              placeholder="Catatan pemakaian atau tindakan pasien..."
            />
          </div>

          <div className="pt-3 flex justify-end gap-2 border-t border-slate-100 dark:border-slate-800">
            <Button variant="outline" size="sm" type="button" onClick={() => setIsStockOutOpen(false)}>
              Batal
            </Button>
            <Button
              variant="primary"
              size="sm"
              type="submit"
              isLoading={isSubmitting}
              className="bg-amber-600 hover:bg-amber-700 text-white font-semibold"
            >
              Kurangi Stok
            </Button>
          </div>
        </form>
      </Dialog>

      {/* ==================================================== */}
      {/* MODAL 3: TAMBAH ITEM BARU (OBAT / ALAT MEDIS) */}
      {/* ==================================================== */}
      <Dialog
        open={isAddOpen}
        onOpenChange={setIsAddOpen}
        title="Tambah Item Obat / Alat Medis Baru"
        description="Masukkan katalog obat, anestesi, bahan tambal komposit, atau disposable dental ke inventori."
      >
        <form onSubmit={handleSubmitNewItem} className="space-y-3 text-xs pt-1">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-bold text-slate-700 dark:text-slate-300">
                Nama Merek Dagang <span className="text-rose-500">*</span>
              </label>
              <Input
                value={newItemForm.brandName}
                onChange={(e) => setNewItemForm({ ...newItemForm, brandName: e.target.value })}
                placeholder="e.g. Solare Universal A2"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-700 dark:text-slate-300">
                Nama Generik / Bahan Medis <span className="text-rose-500">*</span>
              </label>
              <Input
                value={newItemForm.genericName}
                onChange={(e) => setNewItemForm({ ...newItemForm, genericName: e.target.value })}
                placeholder="e.g. Komposit Resin Mikrohibrid"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-bold text-slate-700 dark:text-slate-300">Kategori</label>
              <select
                value={newItemForm.category}
                onChange={(e) => setNewItemForm({ ...newItemForm, category: e.target.value })}
                className="w-full rounded-xl border border-slate-200 bg-white p-2 text-xs dark:border-slate-800 dark:bg-slate-900"
              >
                <option value="Bahan Tambal & Restorasi">Bahan Tambal & Restorasi</option>
                <option value="Alat Medis & BMHP">Alat Medis & Disposable BMHP</option>
                <option value="Anestesi Dental">Anestesi Dental</option>
                <option value="Analgesic">Obat Analgesik</option>
                <option value="Antibiotic">Obat Antibiotik</option>
                <option value="Antiseptic">Antiseptik / Obat Kumur</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-700 dark:text-slate-300">Satuan (Unit)</label>
              <Input
                value={newItemForm.unit}
                onChange={(e) => setNewItemForm({ ...newItemForm, unit: e.target.value })}
                placeholder="syringe / box / botol / tablet / set"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-bold text-slate-700 dark:text-slate-300">Stok Awal</label>
              <Input
                type="number"
                value={newItemForm.currentStock}
                onChange={(e) => setNewItemForm({ ...newItemForm, currentStock: Number(e.target.value) || 0 })}
                className="font-mono text-xs"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-700 dark:text-slate-300">Batas Minimum Stok</label>
              <Input
                type="number"
                value={newItemForm.minimumStock}
                onChange={(e) => setNewItemForm({ ...newItemForm, minimumStock: Number(e.target.value) || 0 })}
                className="font-mono text-xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-bold text-slate-700 dark:text-slate-300">Harga Beli HPP (Rp)</label>
              <Input
                type="number"
                value={newItemForm.purchasePrice}
                onChange={(e) => setNewItemForm({ ...newItemForm, purchasePrice: Number(e.target.value) || 0 })}
                className="font-mono text-xs"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-700 dark:text-slate-300">Harga Jual / Tarif (Rp)</label>
              <Input
                type="number"
                value={newItemForm.sellingPrice}
                onChange={(e) => setNewItemForm({ ...newItemForm, sellingPrice: Number(e.target.value) || 0 })}
                className="font-mono text-xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-bold text-slate-700 dark:text-slate-300">Pabrikan / Distributor</label>
              <Input
                value={newItemForm.manufacturer}
                onChange={(e) => setNewItemForm({ ...newItemForm, manufacturer: e.target.value })}
                placeholder="e.g. GC Dental / 3M ESPE"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-700 dark:text-slate-300">Tanggal Kadaluarsa</label>
              <Input
                type="date"
                value={newItemForm.expiryDate}
                onChange={(e) => setNewItemForm({ ...newItemForm, expiryDate: e.target.value })}
              />
            </div>
          </div>

          <div className="pt-3 flex justify-end gap-2 border-t border-slate-100 dark:border-slate-800">
            <Button variant="outline" size="sm" type="button" onClick={() => setIsAddOpen(false)}>
              Batal
            </Button>
            <Button
              variant="primary"
              size="sm"
              type="submit"
              isLoading={isSubmitting}
              className="bg-teal-600 hover:bg-teal-700 text-white font-semibold"
            >
              Simpan Item
            </Button>
          </div>
        </form>
      </Dialog>

      {/* ==================================================== */}
      {/* MODAL 4: EDIT ITEM */}
      {/* ==================================================== */}
      <Dialog
        open={isEditOpen}
        onOpenChange={setIsEditOpen}
        title="Edit Data Obat / Bahan Dental"
        description="Perbarui informasi data obat, harga beli, atau stok minimum."
      >
        <form onSubmit={handleSubmitEdit} className="space-y-3 text-xs pt-1">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-bold text-slate-700 dark:text-slate-300">Nama Merek</label>
              <Input
                value={editForm.brandName}
                onChange={(e) => setEditForm({ ...editForm, brandName: e.target.value })}
                required
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-700 dark:text-slate-300">Nama Generik</label>
              <Input
                value={editForm.genericName}
                onChange={(e) => setEditForm({ ...editForm, genericName: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-bold text-slate-700 dark:text-slate-300">Harga Beli HPP (Rp)</label>
              <Input
                type="number"
                value={editForm.purchasePrice}
                onChange={(e) => setEditForm({ ...editForm, purchasePrice: Number(e.target.value) || 0 })}
                className="font-mono text-xs"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-700 dark:text-slate-300">Harga Jual (Rp)</label>
              <Input
                type="number"
                value={editForm.sellingPrice}
                onChange={(e) => setEditForm({ ...editForm, sellingPrice: Number(e.target.value) || 0 })}
                className="font-mono text-xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-bold text-slate-700 dark:text-slate-300">Stok Minimum</label>
              <Input
                type="number"
                value={editForm.minimumStock}
                onChange={(e) => setEditForm({ ...editForm, minimumStock: Number(e.target.value) || 0 })}
                className="font-mono text-xs"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-700 dark:text-slate-300">Kadaluarsa</label>
              <Input
                type="date"
                value={editForm.expiryDate}
                onChange={(e) => setEditForm({ ...editForm, expiryDate: e.target.value })}
              />
            </div>
          </div>

          <div className="pt-3 flex justify-end gap-2 border-t border-slate-100 dark:border-slate-800">
            <Button variant="outline" size="sm" type="button" onClick={() => setIsEditOpen(false)}>
              Batal
            </Button>
            <Button
              variant="primary"
              size="sm"
              type="submit"
              isLoading={isSubmitting}
              className="bg-teal-600 hover:bg-teal-700 text-white font-semibold"
            >
              Simpan Perubahan
            </Button>
          </div>
        </form>
      </Dialog>
    </div>
  );
}
