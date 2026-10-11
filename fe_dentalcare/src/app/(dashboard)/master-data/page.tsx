"use client";

import * as React from "react";
import Link from "next/link";
import {
  FileCode,
  Stethoscope,
  Building2,
  ShieldCheck,
  Pill,
  Plus,
  Search,
  Pencil,
  Trash2,
  CheckCircle2,
  Filter,
  DollarSign,
  Boxes,
  Database,
  AlertTriangle,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/shared/stat-card";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog } from "@/components/ui/dialog";
import { useDentalMaster, usePharmacy } from "@/hooks";
import { formatCurrency, formatRupiahInput } from "@/lib/formatting";
import { toast } from "sonner";
import {
  DentalDiagnosisMaster,
  DentalProcedureMaster,
  DentalDepartmentMaster,
  DentalInsuranceMaster,
  Medicine,
} from "@/types";

export default function MasterDataDentalPage() {
  const {
    diagnoses,
    procedures,
    departments,
    insurances,
    loading,
    createDiagnosis,
    updateDiagnosis,
    deleteDiagnosis,
    createProcedure,
    updateProcedure,
    deleteProcedure,
    createDepartment,
    updateDepartment,
    deleteDepartment,
    createInsurance,
    updateInsurance,
    deleteInsurance,
  } = useDentalMaster();

  const {
    medicines,
    createMedicine,
    updateMedicine,
    deleteMedicine,
    refetch: refetchMedicines,
  } = usePharmacy();

  // Active Tab
  const [activeTab, setActiveTab] = React.useState<"diagnoses" | "procedures" | "medicines" | "departments" | "insurances">("diagnoses");

  // Filter & Search states
  const [searchQuery, setSearchQuery] = React.useState("");
  const [selectedCategory, setSelectedCategory] = React.useState("all");

  // Reset filters on tab change
  React.useEffect(() => {
    setSearchQuery("");
    setSelectedCategory("all");
  }, [activeTab]);

  // Loading / Submitting State
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  // ========================================================
  // 1. MODAL STATE: DIAGNOSIS (ICD-10)
  // ========================================================
  const [isDxModalOpen, setIsDxModalOpen] = React.useState(false);
  const [editingDx, setEditingDx] = React.useState<DentalDiagnosisMaster | null>(null);
  const [dxForm, setDxForm] = React.useState({
    code: "",
    name: "",
    category: "Dental Caries",
    description: "",
    isActive: true,
  });

  const openCreateDx = () => {
    setEditingDx(null);
    setDxForm({ code: "", name: "", category: "Dental Caries", description: "", isActive: true });
    setIsDxModalOpen(true);
  };

  const openEditDx = (dx: DentalDiagnosisMaster) => {
    setEditingDx(dx);
    setDxForm({
      code: dx.code,
      name: dx.name,
      category: dx.category || "Dental Caries",
      description: dx.description || "",
      isActive: dx.isActive,
    });
    setIsDxModalOpen(true);
  };

  const handleSaveDx = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!dxForm.code.trim() || !dxForm.name.trim()) {
      toast.error("Kode dan Nama Diagnosis wajib diisi!");
      return;
    }
    setIsSubmitting(true);
    try {
      if (editingDx) {
        await updateDiagnosis(editingDx.id, dxForm);
        toast.success(`Diagnosis ${dxForm.code} berhasil diperbarui!`);
      } else {
        await createDiagnosis(dxForm);
        toast.success(`Diagnosis baru ${dxForm.code} berhasil ditambahkan!`);
      }
      setIsDxModalOpen(false);
    } catch {
      toast.error("Gagal menyimpan diagnosis ke API backend.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // ========================================================
  // 2. MODAL STATE: PROCEDURES & TARIFF
  // ========================================================
  const [isProcModalOpen, setIsProcModalOpen] = React.useState(false);
  const [editingProc, setEditingProc] = React.useState<DentalProcedureMaster | null>(null);
  const [procForm, setProcForm] = React.useState({
    code: "",
    name: "",
    category: "Konservasi Gigi",
    cost: 300000,
    description: "",
    isActive: true,
  });

  const openCreateProc = () => {
    setEditingProc(null);
    setProcForm({ code: "", name: "", category: "Konservasi Gigi", cost: 300000, description: "", isActive: true });
    setIsProcModalOpen(true);
  };

  const openEditProc = (p: DentalProcedureMaster) => {
    setEditingProc(p);
    setProcForm({
      code: p.code,
      name: p.name,
      category: p.category || "Konservasi Gigi",
      cost: p.cost,
      description: p.description || "",
      isActive: p.isActive,
    });
    setIsProcModalOpen(true);
  };

  const handleSaveProc = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!procForm.code.trim() || !procForm.name.trim()) {
      toast.error("Kode dan Nama Tindakan wajib diisi!");
      return;
    }
    setIsSubmitting(true);
    try {
      if (editingProc) {
        await updateProcedure(editingProc.id, procForm);
        toast.success(`Tindakan ${procForm.name} berhasil diperbarui!`);
      } else {
        await createProcedure(procForm);
        toast.success(`Tindakan baru ${procForm.name} berhasil ditambahkan!`);
      }
      setIsProcModalOpen(false);
    } catch {
      toast.error("Gagal menyimpan tindakan ke API backend.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // ========================================================
  // 3. MODAL STATE: DEPARTMENTS & DENTAL CHAIR
  // ========================================================
  const [isDeptModalOpen, setIsDeptModalOpen] = React.useState(false);
  const [editingDept, setEditingDept] = React.useState<DentalDepartmentMaster | null>(null);
  const [deptForm, setDeptForm] = React.useState({
    code: "CHAIR-01",
    name: "",
    location: "Lantai 1",
    description: "",
    isActive: true,
  });

  const openCreateDept = () => {
    setEditingDept(null);
    setDeptForm({ code: `CHAIR-${departments.length + 1}`, name: "", location: "Lantai 1", description: "", isActive: true });
    setIsDeptModalOpen(true);
  };

  const openEditDept = (d: DentalDepartmentMaster) => {
    setEditingDept(d);
    setDeptForm({
      code: d.code || "",
      name: d.name,
      location: d.location || "Lantai 1",
      description: d.description || "",
      isActive: d.isActive,
    });
    setIsDeptModalOpen(true);
  };

  const handleSaveDept = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!deptForm.name.trim()) {
      toast.error("Nama Unit Poli / Dental Chair wajib diisi!");
      return;
    }
    setIsSubmitting(true);
    try {
      if (editingDept) {
        await updateDepartment(editingDept.id, deptForm);
        toast.success(`Unit ${deptForm.name} berhasil diperbarui!`);
      } else {
        await createDepartment(deptForm);
        toast.success(`Unit ${deptForm.name} berhasil ditambahkan!`);
      }
      setIsDeptModalOpen(false);
    } catch {
      toast.error("Gagal menyimpan unit dental chair ke API backend.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // ========================================================
  // 4. MODAL STATE: ASURANSI & PENJAMIN
  // ========================================================
  const [isInsModalOpen, setIsInsModalOpen] = React.useState(false);
  const [editingIns, setEditingIns] = React.useState<DentalInsuranceMaster | null>(null);
  const [insForm, setInsForm] = React.useState({
    code: "",
    name: "",
    category: "Asuransi Swasta",
    contactPerson: "",
    phone: "",
    email: "",
    isActive: true,
  });

  const openCreateIns = () => {
    setEditingIns(null);
    setInsForm({ code: "", name: "", category: "Asuransi Swasta", contactPerson: "", phone: "", email: "", isActive: true });
    setIsInsModalOpen(true);
  };

  const openEditIns = (ins: DentalInsuranceMaster) => {
    setEditingIns(ins);
    setInsForm({
      code: ins.code,
      name: ins.name,
      category: ins.category || "Asuransi Swasta",
      contactPerson: ins.contactPerson || "",
      phone: ins.phone || "",
      email: ins.email || "",
      isActive: ins.isActive,
    });
    setIsInsModalOpen(true);
  };

  const handleSaveIns = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!insForm.code.trim() || !insForm.name.trim()) {
      toast.error("Kode dan Nama Penjamin wajib diisi!");
      return;
    }
    setIsSubmitting(true);
    try {
      if (editingIns) {
        await updateInsurance(editingIns.id, insForm);
        toast.success(`Penjamin ${insForm.name} berhasil diperbarui!`);
      } else {
        await createInsurance(insForm);
        toast.success(`Penjamin baru ${insForm.name} berhasil didaftarkan!`);
      }
      setIsInsModalOpen(false);
    } catch {
      toast.error("Gagal menyimpan penjamin ke API backend.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // ========================================================
  // 5. MODAL STATE: MASTER OBAT & MATERIAL MEDIS DENTAL
  // ========================================================
  const [isMedModalOpen, setIsMedModalOpen] = React.useState(false);
  const [editingMed, setEditingMed] = React.useState<Medicine | null>(null);
  const [medForm, setMedForm] = React.useState({
    code: "",
    brandName: "",
    genericName: "",
    dosageForm: "Tablet",
    strength: "",
    unit: "tablet",
    category: "Analgesic",
    manufacturer: "",
    currentStock: 50,
    minimumStock: 10,
    purchasePrice: 2500,
    sellingPrice: 6000,
    expiryDate: "2028-12-31",
    requiresPrescription: true,
  });

  const openCreateMed = () => {
    setEditingMed(null);
    setMedForm({
      code: `OBT-${String(medicines.length + 1).padStart(3, "0")}`,
      brandName: "",
      genericName: "",
      dosageForm: "Tablet",
      strength: "",
      unit: "tablet",
      category: "Analgesic",
      manufacturer: "",
      currentStock: 50,
      minimumStock: 10,
      purchasePrice: 2500,
      sellingPrice: 6000,
      expiryDate: "2028-12-31",
      requiresPrescription: true,
    });
    setIsMedModalOpen(true);
  };

  const openEditMed = (m: Medicine) => {
    setEditingMed(m);
    setMedForm({
      code: m.code,
      brandName: m.brandName,
      genericName: m.genericName,
      dosageForm: m.dosageForm,
      strength: m.strength || "",
      unit: m.unit,
      category: m.category,
      manufacturer: m.manufacturer || "",
      currentStock: m.currentStock,
      minimumStock: m.minimumStock,
      purchasePrice: m.purchasePrice,
      sellingPrice: m.sellingPrice,
      expiryDate: m.expiryDate ? m.expiryDate.split("T")[0] : "",
      requiresPrescription: m.requiresPrescription ?? true,
    });
    setIsMedModalOpen(true);
  };

  const handleSaveMed = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!medForm.brandName.trim() || !medForm.genericName.trim()) {
      toast.error("Nama Merek dan Nama Generik obat wajib diisi!");
      return;
    }
    setIsSubmitting(true);
    try {
      if (editingMed) {
        await updateMedicine(editingMed.id, medForm as any);
        toast.success(`Data obat ${medForm.brandName} berhasil diperbarui!`);
      } else {
        await createMedicine(medForm as any);
        toast.success(`Item obat ${medForm.brandName} berhasil didaftarkan ke master!`);
      }
      setIsMedModalOpen(false);
      await refetchMedicines();
    } catch {
      toast.error("Gagal menyimpan data obat ke API.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // ========================================================
  // DELETE CONFIRMATION STATE
  // ========================================================
  const [deleteConfirm, setDeleteConfirm] = React.useState<{
    isOpen: boolean;
    title: string;
    itemName: string;
    onConfirm: () => Promise<void>;
  }>({
    isOpen: false,
    title: "",
    itemName: "",
    onConfirm: async () => {},
  });

  const promptDelete = (title: string, itemName: string, onConfirm: () => Promise<void>) => {
    setDeleteConfirm({
      isOpen: true,
      title,
      itemName,
      onConfirm,
    });
  };

  const handleExecuteDelete = async () => {
    setIsSubmitting(true);
    try {
      await deleteConfirm.onConfirm();
      setDeleteConfirm((prev) => ({ ...prev, isOpen: false }));
    } catch {
      toast.error("Gagal menghapus data dari API.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const confirmDeleteMed = (m: Medicine) => {
    promptDelete("Hapus Obat dari Master", `${m.code} - ${m.brandName} (${m.genericName})`, async () => {
      await deleteMedicine(m.id);
      toast.success(`Obat ${m.brandName} berhasil dihapus dari master.`);
      await refetchMedicines();
    });
  };

  // ========================================================
  // FILTERED DATASETS
  // ========================================================
  const filteredDiagnoses = diagnoses.filter((d) => {
    const matchCat = selectedCategory === "all" || d.category === selectedCategory;
    const matchSearch =
      !searchQuery ||
      d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (d.description && d.description.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchCat && matchSearch;
  });

  const filteredProcedures = procedures.filter((p) => {
    const matchCat = selectedCategory === "all" || p.category === selectedCategory;
    const matchSearch =
      !searchQuery ||
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.code.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchSearch;
  });

  const filteredMedicines = medicines.filter((m) => {
    const matchCat = selectedCategory === "all" || m.category === selectedCategory;
    const matchSearch =
      !searchQuery ||
      m.brandName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.genericName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (m.manufacturer && m.manufacturer.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchCat && matchSearch;
  });

  const filteredDepartments = departments.filter((d) => {
    const matchSearch =
      !searchQuery ||
      d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (d.code && d.code.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (d.location && d.location.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchSearch;
  });

  const filteredInsurances = insurances.filter((i) => {
    const matchCat = selectedCategory === "all" || i.category === selectedCategory;
    const matchSearch =
      !searchQuery ||
      i.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      i.code.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchSearch;
  });

  // Extract unique categories for filter dropdowns
  const dxCategories = Array.from(new Set(diagnoses.map((d) => d.category))).filter(Boolean);
  const procCategories = Array.from(new Set(procedures.map((p) => p.category))).filter(Boolean);
  const medCategories = Array.from(new Set(medicines.map((m) => m.category))).filter(Boolean);
  const insCategories = Array.from(new Set(insurances.map((i) => i.category))).filter(Boolean);

  return (
    <div className="space-y-6 pb-20">
      {/* Page Header with Action */}
      <PageHeader
        title="Master Data Dental (Pusat Data Medis & Tarif)"
        description="Kelola seluruh katalog standar klinis gigi ICD-10, tarif tindakan dental, obat & bahan medis (BMHP), unit Dental Chair, serta penjamin BPJS & asuransi rekanan via REST API."
      >
        <div className="flex items-center gap-2">
          {activeTab === "diagnoses" && (
            <Button
              variant="primary"
              size="sm"
              onClick={openCreateDx}
              className="gap-1.5 bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs shadow-xs"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>+ Tambah Diagnosis (ICD-10)</span>
            </Button>
          )}

          {activeTab === "procedures" && (
            <Button
              variant="primary"
              size="sm"
              onClick={openCreateProc}
              className="gap-1.5 bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs shadow-xs"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>+ Tambah Tindakan & Tarif</span>
            </Button>
          )}

          {activeTab === "medicines" && (
            <Button
              variant="primary"
              size="sm"
              onClick={openCreateMed}
              className="gap-1.5 bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs shadow-xs"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>+ Tambah Obat / BMHP Baru</span>
            </Button>
          )}

          {activeTab === "departments" && (
            <Button
              variant="primary"
              size="sm"
              onClick={openCreateDept}
              className="gap-1.5 bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs shadow-xs"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>+ Tambah Unit Dental Chair</span>
            </Button>
          )}

          {activeTab === "insurances" && (
            <Button
              variant="primary"
              size="sm"
              onClick={openCreateIns}
              className="gap-1.5 bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs shadow-xs"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>+ Tambah Provider Asuransi</span>
            </Button>
          )}

          <Link href="/pharmacy">
            <Button variant="outline" size="sm" className="gap-1.5 text-xs border-purple-300 text-purple-700 hover:bg-purple-50 dark:border-purple-800">
              <Pill className="h-3.5 w-3.5" />
              <span>Farmasi & Stok Masuk/Keluar</span>
            </Button>
          </Link>
        </div>
      </PageHeader>

      {/* KPI Stats Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
        <StatCard
          title="Master Diagnosis (ICD-10)"
          value={diagnoses.length}
          icon={FileCode}
          iconColor="text-teal-600"
        />
        <StatCard
          title="Tindakan & Tarif Medis"
          value={procedures.length}
          icon={Stethoscope}
          iconColor="text-emerald-600"
        />
        <StatCard
          title="Master Obat & Bahan Dental"
          value={medicines.length}
          icon={Pill}
          iconColor="text-amber-600"
        />
        <StatCard
          title="Unit Poli / Dental Chair"
          value={departments.length}
          icon={Building2}
          iconColor="text-blue-600"
        />
        <StatCard
          title="Penjamin & BPJS Rekanan"
          value={insurances.length}
          icon={ShieldCheck}
          iconColor="text-purple-600"
        />
      </div>

      {/* Main Tabs Navigation */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 gap-1 overflow-x-auto text-xs font-semibold">
        <button
          onClick={() => setActiveTab("diagnoses")}
          className={`flex items-center gap-2 py-3 px-4 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
            activeTab === "diagnoses"
              ? "border-teal-600 text-teal-700 dark:text-teal-400 font-bold"
              : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
          }`}
        >
          <FileCode className="h-4 w-4" />
          <span>1. Diagnosis Gigi ICD-10 ({diagnoses.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("procedures")}
          className={`flex items-center gap-2 py-3 px-4 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
            activeTab === "procedures"
              ? "border-teal-600 text-teal-700 dark:text-teal-400 font-bold"
              : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
          }`}
        >
          <Stethoscope className="h-4 w-4" />
          <span>2. Tindakan Dental & Tarif ({procedures.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("medicines")}
          className={`flex items-center gap-2 py-3 px-4 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
            activeTab === "medicines"
              ? "border-teal-600 text-teal-700 dark:text-teal-400 font-bold"
              : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
          }`}
        >
          <Pill className="h-4 w-4" />
          <span>3. Master Obat & BMHP ({medicines.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("departments")}
          className={`flex items-center gap-2 py-3 px-4 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
            activeTab === "departments"
              ? "border-teal-600 text-teal-700 dark:text-teal-400 font-bold"
              : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
          }`}
        >
          <Building2 className="h-4 w-4" />
          <span>4. Unit Poli & Dental Chair ({departments.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("insurances")}
          className={`flex items-center gap-2 py-3 px-4 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
            activeTab === "insurances"
              ? "border-teal-600 text-teal-700 dark:text-teal-400 font-bold"
              : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
          }`}
        >
          <ShieldCheck className="h-4 w-4" />
          <span>5. Penjamin & BPJS Dental ({insurances.length})</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-3 text-xs dark:border-slate-800 dark:bg-slate-900 shadow-xs">
        <div className="flex flex-1 items-center gap-2 min-w-[240px]">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari kode, nama, atau deskripsi..."
              className="pl-8 text-xs h-8"
            />
          </div>

          {(activeTab === "diagnoses" || activeTab === "procedures" || activeTab === "medicines" || activeTab === "insurances") && (
            <div className="flex items-center gap-1.5">
              <Filter className="h-3.5 w-3.5 text-slate-400" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="h-8 rounded-xl border border-slate-200 bg-slate-50 px-2.5 text-xs text-slate-700 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-300"
              >
                <option value="all">Semua Kategori</option>
                {activeTab === "diagnoses" &&
                  dxCategories.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                {activeTab === "procedures" &&
                  procCategories.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                {activeTab === "medicines" &&
                  medCategories.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                {activeTab === "insurances" &&
                  insCategories.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
              </select>
            </div>
          )}

          {(searchQuery || selectedCategory !== "all") && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setSearchQuery("");
                setSelectedCategory("all");
              }}
              className="h-8 text-xs text-rose-600"
            >
              Reset
            </Button>
          )}
        </div>

        <div className="text-[11px] text-slate-400 font-medium">
          Menampilkan{" "}
          <span className="font-bold text-slate-700 dark:text-slate-200">
            {activeTab === "diagnoses"
              ? filteredDiagnoses.length
              : activeTab === "procedures"
              ? filteredProcedures.length
              : activeTab === "departments"
              ? filteredDepartments.length
              : filteredInsurances.length}
          </span>{" "}
          data dari API
        </div>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: MASTER DIAGNOSIS GIGI (ICD-10 DENTAL) */}
      {/* ========================================================================= */}
      {activeTab === "diagnoses" && (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-100 bg-slate-50 text-slate-500 dark:border-slate-800 dark:bg-slate-800/40">
                <tr>
                  <th className="px-4 py-3 font-semibold w-24">Kode ICD-10</th>
                  <th className="px-4 py-3 font-semibold">Nama Diagnosa Penyakit Gigi</th>
                  <th className="px-4 py-3 font-semibold">Kategori Dental</th>
                  <th className="px-4 py-3 font-semibold">Deskripsi / Gejala Klinis</th>
                  <th className="px-4 py-3 font-semibold text-center w-24">Status</th>
                  <th className="px-4 py-3 font-semibold text-right w-24">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredDiagnoses.map((dx) => (
                  <tr key={dx.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                    <td className="px-4 py-3">
                      <span className="rounded-md bg-teal-50 px-2 py-1 font-mono font-bold text-teal-700 border border-teal-200 dark:bg-teal-950/40 dark:text-teal-300 dark:border-teal-900">
                        {dx.code}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-semibold text-slate-900 dark:text-slate-100">
                      {dx.name}
                    </td>
                    <td className="px-4 py-3">
                      <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                        {dx.category}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-500 max-w-md truncate">
                      {dx.description || "-"}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          dx.isActive
                            ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400"
                            : "bg-slate-100 text-slate-500"
                        }`}
                      >
                        {dx.isActive ? "Aktif" : "Nonaktif"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 w-7 p-0 text-slate-500 hover:text-teal-600"
                          onClick={() => openEditDx(dx)}
                          title="Edit Diagnosis"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 w-7 p-0 text-slate-500 hover:text-rose-600"
                          onClick={() =>
                            promptDelete("Hapus Diagnosis", `${dx.code} - ${dx.name}`, async () => {
                              await deleteDiagnosis(dx.id);
                              toast.success(`Diagnosis ${dx.code} berhasil dihapus.`);
                            })
                          }
                          title="Hapus Diagnosis"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: MASTER TINDAKAN DENTAL & TARIF */}
      {/* ========================================================================= */}
      {activeTab === "procedures" && (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-100 bg-slate-50 text-slate-500 dark:border-slate-800 dark:bg-slate-800/40">
                <tr>
                  <th className="px-4 py-3 font-semibold w-24">Kode ICD-9</th>
                  <th className="px-4 py-3 font-semibold">Nama Tindakan Medis Dental</th>
                  <th className="px-4 py-3 font-semibold">Spesialisasi / Kategori</th>
                  <th className="px-4 py-3 font-semibold text-right">Tarif Tindakan</th>
                  <th className="px-4 py-3 font-semibold">Keterangan Prosedur</th>
                  <th className="px-4 py-3 font-semibold text-center w-24">Status</th>
                  <th className="px-4 py-3 font-semibold text-right w-24">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredProcedures.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                    <td className="px-4 py-3 font-mono font-bold text-slate-600 dark:text-slate-300">
                      {p.code}
                    </td>
                    <td className="px-4 py-3 font-semibold text-slate-900 dark:text-slate-100">
                      {p.name}
                    </td>
                    <td className="px-4 py-3">
                      <span className="rounded-full bg-teal-50 px-2.5 py-0.5 text-[11px] font-medium text-teal-800 border border-teal-200/60 dark:bg-teal-950/40 dark:text-teal-300 dark:border-teal-900/60">
                        {p.category}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right font-mono font-bold text-emerald-600 dark:text-emerald-400">
                      {formatCurrency(p.cost)}
                    </td>
                    <td className="px-4 py-3 text-slate-500 max-w-sm truncate">
                      {p.description || "-"}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          p.isActive
                            ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400"
                            : "bg-slate-100 text-slate-500"
                        }`}
                      >
                        {p.isActive ? "Aktif" : "Nonaktif"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 w-7 p-0 text-slate-500 hover:text-teal-600"
                          onClick={() => openEditProc(p)}
                          title="Edit Tindakan"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 w-7 p-0 text-slate-500 hover:text-rose-600"
                          onClick={() =>
                            promptDelete("Hapus Tindakan", `${p.code} - ${p.name}`, async () => {
                              await deleteProcedure(p.id);
                              toast.success(`Tindakan ${p.name} berhasil dihapus.`);
                            })
                          }
                          title="Hapus Tindakan"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: MASTER OBAT & MATERIAL MEDIS DENTAL */}
      {/* ========================================================================= */}
      {activeTab === "medicines" && (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-100 bg-slate-50 text-slate-500 dark:border-slate-800 dark:bg-slate-800/40">
                <tr>
                  <th className="px-4 py-3 font-semibold w-24">Kode</th>
                  <th className="px-4 py-3 font-semibold">Nama Merek & Generik</th>
                  <th className="px-4 py-3 font-semibold">Kategori</th>
                  <th className="px-4 py-3 font-semibold">Sediaan & Satuan</th>
                  <th className="px-4 py-3 font-semibold text-center">Stok Saat Ini</th>
                  <th className="px-4 py-3 font-semibold text-right">Harga Beli</th>
                  <th className="px-4 py-3 font-semibold text-right">Harga Jual</th>
                  <th className="px-4 py-3 font-semibold">Produsen</th>
                  <th className="px-4 py-3 font-semibold">Kadaluarsa</th>
                  <th className="px-4 py-3 font-semibold text-center">Resep</th>
                  <th className="px-4 py-3 font-semibold text-right w-20">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredMedicines.map((m) => {
                  const isLow = m.currentStock <= m.minimumStock && m.currentStock > 0;
                  const isOut = m.currentStock <= 0;
                  return (
                    <tr key={m.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                      <td className="px-4 py-3 font-mono font-bold text-amber-700 dark:text-amber-400">
                        {m.code}
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-bold text-slate-900 dark:text-slate-100">{m.brandName}</p>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400">{m.genericName}</p>
                      </td>
                      <td className="px-4 py-3">
                        <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-semibold text-amber-800 border border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800">
                          {m.category}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-600 dark:text-slate-300">
                        <span className="font-medium">{m.dosageForm}</span>
                        {m.strength && <span className="text-slate-400"> • {m.strength}</span>}
                        <p className="text-[10px] text-slate-400">per {m.unit}</p>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <div className="inline-flex flex-col items-center">
                          <span
                            className={`font-mono font-bold text-xs ${
                              isOut
                                ? "text-rose-600"
                                : isLow
                                ? "text-amber-600"
                                : "text-emerald-600 dark:text-emerald-400"
                            }`}
                          >
                            {m.currentStock} {m.unit}
                          </span>
                          <span
                            className={`px-1.5 py-0.2 rounded text-[9px] font-semibold ${
                              isOut
                                ? "bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300"
                                : isLow
                                ? "bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300"
                                : "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300"
                            }`}
                          >
                            {isOut ? "Habis" : isLow ? "Menipis" : "Aman"}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right font-mono text-slate-600 dark:text-slate-400">
                        {formatCurrency(m.purchasePrice)}
                      </td>
                      <td className="px-4 py-3 text-right font-mono font-bold text-slate-900 dark:text-slate-100">
                        {formatCurrency(m.sellingPrice)}
                      </td>
                      <td className="px-4 py-3 text-slate-600 dark:text-slate-300">
                        {m.manufacturer || "-"}
                      </td>
                      <td className="px-4 py-3 text-slate-600 dark:text-slate-400 font-mono text-[11px]">
                        {m.expiryDate ? m.expiryDate.split("T")[0] : "-"}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span
                          className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold ${
                            m.requiresPrescription
                              ? "bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-950/40 dark:text-blue-300"
                              : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
                          }`}
                        >
                          {m.requiresPrescription ? "Resep" : "Bebas"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 w-7 p-0 text-slate-500 hover:text-teal-600"
                            onClick={() => openEditMed(m)}
                            title="Edit Data Obat"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 w-7 p-0 text-slate-500 hover:text-rose-600"
                            onClick={() => confirmDeleteMed(m)}
                            title="Hapus Obat"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: UNIT POLI GIGI & DENTAL CHAIR */}
      {/* ========================================================================= */}
      {activeTab === "departments" && (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-100 bg-slate-50 text-slate-500 dark:border-slate-800 dark:bg-slate-800/40">
                <tr>
                  <th className="px-4 py-3 font-semibold w-28">Kode Chair</th>
                  <th className="px-4 py-3 font-semibold">Nama Unit Poli / Ruang Gigi</th>
                  <th className="px-4 py-3 font-semibold">Lokasi Ruangan</th>
                  <th className="px-4 py-3 font-semibold">Deskripsi Layanan</th>
                  <th className="px-4 py-3 font-semibold text-center w-24">Status</th>
                  <th className="px-4 py-3 font-semibold text-right w-24">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredDepartments.map((dept) => (
                  <tr key={dept.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                    <td className="px-4 py-3">
                      <span className="rounded-md bg-blue-50 px-2 py-1 font-mono font-bold text-blue-700 border border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-900">
                        {dept.code || "CHAIR"}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-bold text-slate-900 dark:text-slate-100">
                      {dept.name}
                    </td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-300">
                      {dept.location || "Lantai 1"}
                    </td>
                    <td className="px-4 py-3 text-slate-500 max-w-sm truncate">
                      {dept.description || "-"}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          dept.isActive
                            ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400"
                            : "bg-slate-100 text-slate-500"
                        }`}
                      >
                        {dept.isActive ? "Aktif" : "Nonaktif"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 w-7 p-0 text-slate-500 hover:text-teal-600"
                          onClick={() => openEditDept(dept)}
                          title="Edit Unit Poli"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 w-7 p-0 text-slate-500 hover:text-rose-600"
                          onClick={() =>
                            promptDelete("Hapus Unit Poli", dept.name, async () => {
                              await deleteDepartment(dept.id);
                              toast.success(`Unit ${dept.name} berhasil dihapus.`);
                            })
                          }
                          title="Hapus Unit Poli"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: PENJAMIN & ASURANSI BPJS DENTAL */}
      {/* ========================================================================= */}
      {activeTab === "insurances" && (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-100 bg-slate-50 text-slate-500 dark:border-slate-800 dark:bg-slate-800/40">
                <tr>
                  <th className="px-4 py-3 font-semibold w-24">Kode</th>
                  <th className="px-4 py-3 font-semibold">Nama Provider / Penjamin</th>
                  <th className="px-4 py-3 font-semibold">Jenis Penjamin</th>
                  <th className="px-4 py-3 font-semibold">Kontak PIC / Bantuan</th>
                  <th className="px-4 py-3 font-semibold">No. Telepon & Email</th>
                  <th className="px-4 py-3 font-semibold text-center w-24">Status</th>
                  <th className="px-4 py-3 font-semibold text-right w-24">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredInsurances.map((ins) => (
                  <tr key={ins.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                    <td className="px-4 py-3 font-mono font-bold text-purple-700 dark:text-purple-300">
                      {ins.code}
                    </td>
                    <td className="px-4 py-3 font-bold text-slate-900 dark:text-slate-100">
                      {ins.name}
                    </td>
                    <td className="px-4 py-3">
                      <span className="rounded-full bg-purple-50 px-2.5 py-0.5 text-[11px] font-medium text-purple-800 border border-purple-200/60 dark:bg-purple-950/40 dark:text-purple-300">
                        {ins.category}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-300">
                      {ins.contactPerson || "-"}
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-mono text-[11px] text-slate-700 dark:text-slate-300">{ins.phone || "-"}</p>
                      <p className="text-[10px] text-slate-400">{ins.email || "-"}</p>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          ins.isActive
                            ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400"
                            : "bg-slate-100 text-slate-500"
                        }`}
                      >
                        {ins.isActive ? "Aktif" : "Nonaktif"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 w-7 p-0 text-slate-500 hover:text-teal-600"
                          onClick={() => openEditIns(ins)}
                          title="Edit Penjamin"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 w-7 p-0 text-slate-500 hover:text-rose-600"
                          onClick={() =>
                            promptDelete("Hapus Penjamin", `${ins.code} - ${ins.name}`, async () => {
                              await deleteInsurance(ins.id);
                              toast.success(`Penjamin ${ins.name} berhasil dihapus.`);
                            })
                          }
                          title="Hapus Penjamin"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 1: FORM DIAGNOSIS (ICD-10) */}
      {/* ========================================================================= */}
      <Dialog
        open={isDxModalOpen}
        onOpenChange={setIsDxModalOpen}
        title={editingDx ? "Edit Master Diagnosis Gigi" : "Tambah Diagnosis Gigi Baru (ICD-10)"}
        description="Kelola kode referensi standar ICD-10 klasifikasi penyakit gigi & mulut."
      >
        <form onSubmit={handleSaveDx} className="space-y-4 text-xs pt-1">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-bold text-slate-700 dark:text-slate-300">
                Kode ICD-10 <span className="text-rose-500">*</span>
              </label>
              <Input
                value={dxForm.code}
                onChange={(e) => setDxForm({ ...dxForm, code: e.target.value.toUpperCase() })}
                placeholder="Contoh: K02.1"
                className="font-mono text-xs uppercase"
                required
              />
            </div>
            <div className="space-y-1">
              <label className="font-bold text-slate-700 dark:text-slate-300">
                Kategori Dental <span className="text-rose-500">*</span>
              </label>
              <select
                value={dxForm.category}
                onChange={(e) => setDxForm({ ...dxForm, category: e.target.value })}
                className="w-full rounded-xl border border-slate-200 bg-white p-2 text-xs dark:border-slate-800 dark:bg-slate-900"
                required
              >
                <option value="Dental Caries">Dental Caries (Karies / Gigi Berlubang)</option>
                <option value="Pulpal Diseases">Pulpal Diseases (Penyakit Pulpa & Saraf)</option>
                <option value="Periodontal Diseases">Periodontal Diseases (Penyakit Gusi / Periodonsia)</option>
                <option value="Tooth Development Disorders">Tooth Development Disorders (Impaksi / Pertumbuhan)</option>
                <option value="Dental Deposits">Dental Deposits (Kalkulus / Karang Gigi)</option>
                <option value="Periapical Diseases">Periapical Diseases (Abses / Periapikal)</option>
                <option value="Dentofacial Anomalies">Dentofacial Anomalies (Maloklusi / Ortodonti)</option>
                <option value="Umum">Lainnya / Umum</option>
              </select>
            </div>
          </div>

          <div className="space-y-1">
            <label className="font-bold text-slate-700 dark:text-slate-300">
              Nama Diagnosis / Penyakit Gigi <span className="text-rose-500">*</span>
            </label>
            <Input
              value={dxForm.name}
              onChange={(e) => setDxForm({ ...dxForm, name: e.target.value })}
              placeholder="Contoh: Caries of dentine (Karies Dentin Profunda)"
              className="text-xs"
              required
            />
          </div>

          <div className="space-y-1">
            <label className="font-bold text-slate-700 dark:text-slate-300">Deskripsi / Indikasi Gejala</label>
            <textarea
              value={dxForm.description}
              onChange={(e) => setDxForm({ ...dxForm, description: e.target.value })}
              placeholder="Keterangan klinis atau gejala khas penyakit"
              rows={3}
              className="w-full rounded-xl border border-slate-200 bg-white p-2 text-xs dark:border-slate-800 dark:bg-slate-900"
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="dxActive"
              checked={dxForm.isActive}
              onChange={(e) => setDxForm({ ...dxForm, isActive: e.target.checked })}
              className="h-4 w-4 rounded border-slate-300 text-teal-600 focus:ring-teal-500"
            />
            <label htmlFor="dxActive" className="font-medium text-slate-700 dark:text-slate-300 cursor-pointer">
              Status Aktif (Dapat dipilih dokter di lembar Odontogram)
            </label>
          </div>

          <div className="pt-3 flex justify-end gap-2 border-t border-slate-100 dark:border-slate-800">
            <Button variant="outline" size="sm" type="button" onClick={() => setIsDxModalOpen(false)}>
              Batal
            </Button>
            <Button
              variant="primary"
              size="sm"
              type="submit"
              isLoading={isSubmitting}
              className="bg-teal-600 hover:bg-teal-700 text-white font-semibold"
            >
              {editingDx ? "Simpan Perubahan" : "Tambah Diagnosis"}
            </Button>
          </div>
        </form>
      </Dialog>

      {/* ========================================================================= */}
      {/* MODAL 2: FORM PROCEDURES & TARIFF */}
      {/* ========================================================================= */}
      <Dialog
        open={isProcModalOpen}
        onOpenChange={setIsProcModalOpen}
        title={editingProc ? "Edit Master Tindakan & Tarif" : "Tambah Tindakan Dental & Tarif Baru"}
        description="Kelola daftar tindakan medis gigi beserta tarif biaya resmi klinik."
      >
        <form onSubmit={handleSaveProc} className="space-y-4 text-xs pt-1">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-bold text-slate-700 dark:text-slate-300">
                Kode Tindakan (ICD-9) <span className="text-rose-500">*</span>
              </label>
              <Input
                value={procForm.code}
                onChange={(e) => setProcForm({ ...procForm, code: e.target.value })}
                placeholder="Contoh: 23.2"
                className="font-mono text-xs"
                required
              />
            </div>
            <div className="space-y-1">
              <label className="font-bold text-slate-700 dark:text-slate-300">
                Spesialisasi / Kategori <span className="text-rose-500">*</span>
              </label>
              <select
                value={procForm.category}
                onChange={(e) => setProcForm({ ...procForm, category: e.target.value })}
                className="w-full rounded-xl border border-slate-200 bg-white p-2 text-xs dark:border-slate-800 dark:bg-slate-900"
                required
              >
                <option value="Konservasi Gigi">Konservasi Gigi (Tambal / Restorasi)</option>
                <option value="Periodonsia">Periodonsia (Scaling / Gusi)</option>
                <option value="Bedah Mulut Minor">Bedah Mulut Minor (Ekstraksi / Odontektomi)</option>
                <option value="Endodonsia">Endodonsia (Perawatan Saluran Akar)</option>
                <option value="Pedodonsia">Pedodonsia (Gigi Anak)</option>
                <option value="Radiologi Dental">Radiologi Dental (Rontgen Gigi)</option>
                <option value="Estetika Gigi">Estetika Gigi (Bleaching / Veneer)</option>
                <option value="Ortodonti">Ortodonti (Kawat Gigi / Aligner)</option>
                <option value="Umum">Umum / Lainnya</option>
              </select>
            </div>
          </div>

          <div className="space-y-1">
            <label className="font-bold text-slate-700 dark:text-slate-300">
              Nama Prosedur Tindakan <span className="text-rose-500">*</span>
            </label>
            <Input
              value={procForm.name}
              onChange={(e) => setProcForm({ ...procForm, name: e.target.value })}
              placeholder="Contoh: Penambalan Komposit Sinar Light-Curing"
              className="text-xs"
              required
            />
          </div>

          <div className="space-y-1">
            <label className="font-bold text-slate-700 dark:text-slate-300">
              Tarif Biaya Tindakan <span className="text-rose-500">*</span>
            </label>
            <div className="relative flex items-center">
              <span className="absolute left-3 text-xs font-bold text-slate-400 pointer-events-none select-none">
                Rp
              </span>
              <Input
                type="text"
                inputMode="numeric"
                value={procForm.cost ? formatRupiahInput(procForm.cost) : (procForm.cost === 0 ? "0" : "")}
                onChange={(e) => {
                  const raw = e.target.value;
                  const cleanDigits = raw.replace(/\D/g, "");
                  const num = cleanDigits === "" ? 0 : parseInt(cleanDigits, 10);
                  setProcForm({ ...procForm, cost: num });
                }}
                className="pl-9 font-mono text-xs font-bold text-emerald-600"
                required
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="font-bold text-slate-700 dark:text-slate-300">Keterangan Prosedur</label>
            <textarea
              value={procForm.description}
              onChange={(e) => setProcForm({ ...procForm, description: e.target.value })}
              placeholder="Prosedur klinis, alat yang digunakan, atau instruksi"
              rows={2}
              className="w-full rounded-xl border border-slate-200 bg-white p-2 text-xs dark:border-slate-800 dark:bg-slate-900"
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="procActive"
              checked={procForm.isActive}
              onChange={(e) => setProcForm({ ...procForm, isActive: e.target.checked })}
              className="h-4 w-4 rounded border-slate-300 text-teal-600 focus:ring-teal-500"
            />
            <label htmlFor="procActive" className="font-medium text-slate-700 dark:text-slate-300 cursor-pointer">
              Status Aktif (Tampil di tagihan kasir & pemeriksaan dokter)
            </label>
          </div>

          <div className="pt-3 flex justify-end gap-2 border-t border-slate-100 dark:border-slate-800">
            <Button variant="outline" size="sm" type="button" onClick={() => setIsProcModalOpen(false)}>
              Batal
            </Button>
            <Button
              variant="primary"
              size="sm"
              type="submit"
              isLoading={isSubmitting}
              className="bg-teal-600 hover:bg-teal-700 text-white font-semibold"
            >
              {editingProc ? "Simpan Perubahan" : "Tambah Tindakan"}
            </Button>
          </div>
        </form>
      </Dialog>

      {/* ========================================================================= */}
      {/* MODAL 3: FORM DEPARTMENTS & DENTAL CHAIR */}
      {/* ========================================================================= */}
      <Dialog
        open={isDeptModalOpen}
        onOpenChange={setIsDeptModalOpen}
        title={editingDept ? "Edit Unit Dental Chair" : "Tambah Unit Dental Chair Baru"}
        description="Kelola unit poli spesialisasi dan nomor kursi dental di klinik."
      >
        <form onSubmit={handleSaveDept} className="space-y-4 text-xs pt-1">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-bold text-slate-700 dark:text-slate-300">
                Kode Dental Chair <span className="text-rose-500">*</span>
              </label>
              <Input
                value={deptForm.code}
                onChange={(e) => setDeptForm({ ...deptForm, code: e.target.value.toUpperCase() })}
                placeholder="Contoh: CHAIR-01"
                className="font-mono text-xs uppercase"
                required
              />
            </div>
            <div className="space-y-1">
              <label className="font-bold text-slate-700 dark:text-slate-300">
                Lokasi Ruangan <span className="text-rose-500">*</span>
              </label>
              <Input
                value={deptForm.location}
                onChange={(e) => setDeptForm({ ...deptForm, location: e.target.value })}
                placeholder="Contoh: Lantai 1 - Ruang 101"
                className="text-xs"
                required
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="font-bold text-slate-700 dark:text-slate-300">
              Nama Unit Poli / Ruang Periksa <span className="text-rose-500">*</span>
            </label>
            <Input
              value={deptForm.name}
              onChange={(e) => setDeptForm({ ...deptForm, name: e.target.value })}
              placeholder="Contoh: Poli Gigi Umum (Dental Chair 1)"
              className="text-xs"
              required
            />
          </div>

          <div className="space-y-1">
            <label className="font-bold text-slate-700 dark:text-slate-300">Keterangan Layanan</label>
            <textarea
              value={deptForm.description}
              onChange={(e) => setDeptForm({ ...deptForm, description: e.target.value })}
              placeholder="Cakupan tindakan periksa di unit ini"
              rows={2}
              className="w-full rounded-xl border border-slate-200 bg-white p-2 text-xs dark:border-slate-800 dark:bg-slate-900"
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="deptActive"
              checked={deptForm.isActive}
              onChange={(e) => setDeptForm({ ...deptForm, isActive: e.target.checked })}
              className="h-4 w-4 rounded border-slate-300 text-teal-600 focus:ring-teal-500"
            />
            <label htmlFor="deptActive" className="font-medium text-slate-700 dark:text-slate-300 cursor-pointer">
              Status Unit Aktif (Bisa dipilih saat pendaftaran & antrean pasien)
            </label>
          </div>

          <div className="pt-3 flex justify-end gap-2 border-t border-slate-100 dark:border-slate-800">
            <Button variant="outline" size="sm" type="button" onClick={() => setIsDeptModalOpen(false)}>
              Batal
            </Button>
            <Button
              variant="primary"
              size="sm"
              type="submit"
              isLoading={isSubmitting}
              className="bg-teal-600 hover:bg-teal-700 text-white font-semibold"
            >
              {editingDept ? "Simpan Perubahan" : "Tambah Unit Chair"}
            </Button>
          </div>
        </form>
      </Dialog>

      {/* ========================================================================= */}
      {/* MODAL 4: FORM ASURANSI & PENJAMIN */}
      {/* ========================================================================= */}
      <Dialog
        open={isInsModalOpen}
        onOpenChange={setIsInsModalOpen}
        title={editingIns ? "Edit Provider Penjamin" : "Tambah Provider Asuransi / BPJS"}
        description="Kelola mitra penjamin asuransi komersial dan integrasi BPJS Kesehatan Dental."
      >
        <form onSubmit={handleSaveIns} className="space-y-4 text-xs pt-1">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-bold text-slate-700 dark:text-slate-300">
                Kode Penjamin <span className="text-rose-500">*</span>
              </label>
              <Input
                value={insForm.code}
                onChange={(e) => setInsForm({ ...insForm, code: e.target.value.toUpperCase() })}
                placeholder="Contoh: BPJS-DNT"
                className="font-mono text-xs uppercase"
                required
              />
            </div>
            <div className="space-y-1">
              <label className="font-bold text-slate-700 dark:text-slate-300">
                Jenis Penjamin <span className="text-rose-500">*</span>
              </label>
              <select
                value={insForm.category}
                onChange={(e) => setInsForm({ ...insForm, category: e.target.value })}
                className="w-full rounded-xl border border-slate-200 bg-white p-2 text-xs dark:border-slate-800 dark:bg-slate-900"
                required
              >
                <option value="Pemerintah / JKN">Pemerintah / BPJS Kesehatan</option>
                <option value="Asuransi Komersial">Asuransi Komersial (Inhealth/dll)</option>
                <option value="Asuransi Swasta">Asuransi Swasta (Prudential/Allianz/dll)</option>
                <option value="TPA Korporasi">TPA Korporasi (AdMedika/dll)</option>
                <option value="Kerjasama Perusahaan">Kerjasama Perusahaan / Faskes</option>
              </select>
            </div>
          </div>

          <div className="space-y-1">
            <label className="font-bold text-slate-700 dark:text-slate-300">
              Nama Provider Asuransi / Penjamin <span className="text-rose-500">*</span>
            </label>
            <Input
              value={insForm.name}
              onChange={(e) => setInsForm({ ...insForm, name: e.target.value })}
              placeholder="Contoh: BPJS Kesehatan (P-Care Dental)"
              className="text-xs"
              required
            />
          </div>

          <div className="space-y-1">
            <label className="font-bold text-slate-700 dark:text-slate-300">Kontak Person (PIC Provider)</label>
            <Input
              value={insForm.contactPerson}
              onChange={(e) => setInsForm({ ...insForm, contactPerson: e.target.value })}
              placeholder="Nama PIC klaim asuransi"
              className="text-xs"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-bold text-slate-700 dark:text-slate-300">No. Telepon / Helpdesk</label>
              <Input
                value={insForm.phone}
                onChange={(e) => setInsForm({ ...insForm, phone: e.target.value })}
                placeholder="021-xxxx / 165"
                className="font-mono text-xs"
              />
            </div>
            <div className="space-y-1">
              <label className="font-bold text-slate-700 dark:text-slate-300">Email Korespondensi</label>
              <Input
                type="email"
                value={insForm.email}
                onChange={(e) => setInsForm({ ...insForm, email: e.target.value })}
                placeholder="klaim@asuransi.co.id"
                className="text-xs"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="insActive"
              checked={insForm.isActive}
              onChange={(e) => setInsForm({ ...insForm, isActive: e.target.checked })}
              className="h-4 w-4 rounded border-slate-300 text-teal-600 focus:ring-teal-500"
            />
            <label htmlFor="insActive" className="font-medium text-slate-700 dark:text-slate-300 cursor-pointer">
              Status Kerjasama Aktif (Dapat dipilih saat pendaftaran pasien)
            </label>
          </div>

          <div className="pt-3 flex justify-end gap-2 border-t border-slate-100 dark:border-slate-800">
            <Button variant="outline" size="sm" type="button" onClick={() => setIsInsModalOpen(false)}>
              Batal
            </Button>
            <Button
              variant="primary"
              size="sm"
              type="submit"
              isLoading={isSubmitting}
              className="bg-teal-600 hover:bg-teal-700 text-white font-semibold"
            >
              {editingIns ? "Simpan Perubahan" : "Daftarkan Penjamin"}
            </Button>
          </div>
        </form>
      </Dialog>

      {/* ========================================================================= */}
      {/* MODAL 5: FORM MASTER OBAT & MATERIAL MEDIS DENTAL */}
      {/* ========================================================================= */}
      <Dialog
        open={isMedModalOpen}
        onOpenChange={setIsMedModalOpen}
        title={editingMed ? "Edit Data Master Obat / Material" : "Tambah Item Obat / BMHP Baru"}
        description="Kelola data obat gigi, anestesi dental, komposit, etchant, dan bahan habis pakai klinis."
      >
        <form onSubmit={handleSaveMed} className="space-y-4 text-xs pt-1">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="space-y-1">
              <label className="font-bold text-slate-700 dark:text-slate-300">
                Kode Obat / BMHP <span className="text-rose-500">*</span>
              </label>
              <Input
                value={medForm.code}
                onChange={(e) => setMedForm({ ...medForm, code: e.target.value.toUpperCase() })}
                placeholder="Contoh: OBT-025"
                className="font-mono text-xs uppercase"
                required
              />
            </div>

            <div className="space-y-1 sm:col-span-2">
              <label className="font-bold text-slate-700 dark:text-slate-300">
                Nama Merek / Paten <span className="text-rose-500">*</span>
              </label>
              <Input
                value={medForm.brandName}
                onChange={(e) => setMedForm({ ...medForm, brandName: e.target.value })}
                placeholder="Contoh: Amoxisan 500mg, Pehacain Ampul"
                className="text-xs"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-bold text-slate-700 dark:text-slate-300">
                Nama Bahan Generik / Zat Aktif <span className="text-rose-500">*</span>
              </label>
              <Input
                value={medForm.genericName}
                onChange={(e) => setMedForm({ ...medForm, genericName: e.target.value })}
                placeholder="Contoh: Amoxicillin Trihydrate, Lidocaine HCl"
                className="text-xs"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-700 dark:text-slate-300">
                Kategori Obat / Material <span className="text-rose-500">*</span>
              </label>
              <select
                value={medForm.category}
                onChange={(e) => setMedForm({ ...medForm, category: e.target.value })}
                className="w-full h-9 rounded-xl border border-slate-200 bg-white px-3 text-xs text-slate-800 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200"
              >
                <option value="Antibiotic">Antibiotik Gigi (Antibiotic)</option>
                <option value="Analgesic">Analgetik / Anti-Nyeri (Analgesic)</option>
                <option value="Dental Material / Anestesi">Dental Material / Anestesi</option>
                <option value="Antiseptic / Mouthwash">Obat Kumur / Antiseptik</option>
                <option value="Anti-inflammatory">Anti-Inflamasi & Kortikosteroid</option>
                <option value="Bahan Tambal & Restorasi">Bahan Tambal & Restorasi Komposit</option>
                <option value="Gastrointestinal">Gastrointestinal / Lambung</option>
                <option value="Disposable Supplies">BMHP & Jarum Suntik Disposable</option>
                <option value="Lainnya">Lainnya / Suplemen</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1">
              <label className="font-bold text-slate-700 dark:text-slate-300">
                Bentuk Sediaan
              </label>
              <select
                value={medForm.dosageForm}
                onChange={(e) => setMedForm({ ...medForm, dosageForm: e.target.value })}
                className="w-full h-9 rounded-xl border border-slate-200 bg-white px-2.5 text-xs text-slate-800 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200"
              >
                <option value="Tablet">Tablet</option>
                <option value="Capsule">Kapsul</option>
                <option value="Syrup">Sirup</option>
                <option value="Ampul">Ampul (Injeksi)</option>
                <option value="Syringe">Syringe (Bahan Gigi)</option>
                <option value="Botol">Botol Cairan</option>
                <option value="Tube">Tube Salep</option>
                <option value="Pcs">Pcs / Lembar</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-700 dark:text-slate-300">
                Kekuatan / Dosis
              </label>
              <Input
                value={medForm.strength}
                onChange={(e) => setMedForm({ ...medForm, strength: e.target.value })}
                placeholder="Contoh: 500mg, 2ml, 4g"
                className="text-xs"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-700 dark:text-slate-300">
                Satuan Kemasan <span className="text-rose-500">*</span>
              </label>
              <select
                value={medForm.unit}
                onChange={(e) => setMedForm({ ...medForm, unit: e.target.value })}
                className="w-full h-9 rounded-xl border border-slate-200 bg-white px-2.5 text-xs text-slate-800 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200"
              >
                <option value="tablet">tablet</option>
                <option value="kapsul">kapsul</option>
                <option value="botol">botol</option>
                <option value="ampul">ampul</option>
                <option value="syringe">syringe</option>
                <option value="pcs">pcs</option>
                <option value="tube">tube</option>
                <option value="box">box</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-bold text-slate-700 dark:text-slate-300">
                Pabrik / Produsen
              </label>
              <Input
                value={medForm.manufacturer}
                onChange={(e) => setMedForm({ ...medForm, manufacturer: e.target.value })}
                placeholder="Contoh: Sanbe Farma, Kalbe, GC Dental, 3M"
                className="text-xs"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-700 dark:text-slate-300">
                Tanggal Kadaluarsa (Expired)
              </label>
              <Input
                type="date"
                value={medForm.expiryDate}
                onChange={(e) => setMedForm({ ...medForm, expiryDate: e.target.value })}
                className="text-xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3 rounded-xl border border-slate-200 bg-slate-50/70 dark:border-slate-800 dark:bg-slate-900/40">
            <div className="space-y-1">
              <label className="font-bold text-slate-700 dark:text-slate-300">
                {editingMed ? "Stok Saat Ini" : "Stok Awal"}
              </label>
              <Input
                type="number"
                min="0"
                value={medForm.currentStock}
                onChange={(e) => setMedForm({ ...medForm, currentStock: Number(e.target.value) })}
                className="font-mono text-xs"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-700 dark:text-slate-300">
                Batas Min. Stok
              </label>
              <Input
                type="number"
                min="0"
                value={medForm.minimumStock}
                onChange={(e) => setMedForm({ ...medForm, minimumStock: Number(e.target.value) })}
                className="font-mono text-xs"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-700 dark:text-slate-300">
                Harga Beli (HPP)
              </label>
              <Input
                type="number"
                min="0"
                value={medForm.purchasePrice}
                onChange={(e) => setMedForm({ ...medForm, purchasePrice: Number(e.target.value) })}
                className="font-mono text-xs"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-700 dark:text-slate-300">
                Harga Jual Pasien
              </label>
              <Input
                type="number"
                min="0"
                value={medForm.sellingPrice}
                onChange={(e) => setMedForm({ ...medForm, sellingPrice: Number(e.target.value) })}
                className="font-mono text-xs"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="requiresPrescription"
              checked={medForm.requiresPrescription}
              onChange={(e) => setMedForm({ ...medForm, requiresPrescription: e.target.checked })}
              className="rounded border-slate-300 text-teal-600 focus:ring-teal-500 h-4 w-4"
            />
            <label htmlFor="requiresPrescription" className="text-slate-700 dark:text-slate-300 font-medium cursor-pointer">
              Wajib dengan Resep Dokter Gigi (Kategori Obat Keras / Terbatas)
            </label>
          </div>

          <div className="pt-3 flex justify-end gap-2 border-t border-slate-100 dark:border-slate-800">
            <Button
              variant="outline"
              size="sm"
              type="button"
              onClick={() => setIsMedModalOpen(false)}
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
              {editingMed ? "Simpan Perubahan Obat" : "Tambahkan ke Master"}
            </Button>
          </div>
        </form>
      </Dialog>

      {/* ========================================================================= */}
      {/* DELETE CONFIRMATION DIALOG */}
      {/* ========================================================================= */}
      <Dialog
        open={deleteConfirm.isOpen}
        onOpenChange={(open) => setDeleteConfirm((prev) => ({ ...prev, isOpen: open }))}
        title={deleteConfirm.title}
        description="Apakah Anda yakin ingin menghapus data master berikut ini dari sistem?"
      >
        <div className="space-y-4 pt-1 text-xs">
          <div className="p-3.5 rounded-xl border border-rose-200 bg-rose-50/60 dark:border-rose-900/60 dark:bg-rose-950/20">
            <div className="flex items-center gap-2.5">
              <AlertTriangle className="h-5 w-5 text-rose-600 shrink-0" />
              <div>
                <p className="font-bold text-rose-900 dark:text-rose-300">{deleteConfirm.itemName}</p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Tindakan ini akan menghapus data referensi master dari database API.
                </p>
              </div>
            </div>
          </div>

          <div className="pt-2 flex justify-end gap-2 border-t border-slate-100 dark:border-slate-800">
            <Button
              variant="outline"
              size="sm"
              type="button"
              onClick={() => setDeleteConfirm((prev) => ({ ...prev, isOpen: false }))}
            >
              Batal
            </Button>
            <Button
              variant="danger"
              size="sm"
              onClick={handleExecuteDelete}
              isLoading={isSubmitting}
              className="bg-rose-600 hover:bg-rose-700 text-white font-semibold"
            >
              Hapus Data
            </Button>
          </div>
        </div>
      </Dialog>
    </div>
  );
}
