"use client";

import * as React from "react";
import {
  Search,
  Pill,
  Plus,
  Check,
  Package,
  Clock,
  Sparkles,
  Info,
  X,
  AlertCircle,
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
import { Medicine, PrescriptionItem } from "@/types";
import { formatCurrency } from "@/lib/formatting";
import { toast } from "sonner";

interface MedicinePrescriptionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  medicines: Medicine[];
  onAddPrescription: (item: PrescriptionItem) => void;
}

const CATEGORIES = [
  { id: "all", label: "Semua Kategori" },
  { id: "Antibiotic", label: "Antibiotik" },
  { id: "Analgesic", label: "Analgesik / Nyeri" },
  { id: "Antiseptic", label: "Antiseptik Kumur" },
  { id: "Corticosteroid", label: "Kortikosteroid / Sariawan" },
  { id: "Anesthetic", label: "Anestesi Dental" },
  { id: "Supplement", label: "Vitamin & Suplemen" },
];

const COMMON_FREQUENCIES = [
  "3x sehari 1 tablet (tiap 8 jam)",
  "2x sehari 1 tablet (tiap 12 jam)",
  "3x sehari 1 kapsul",
  "1x sehari 1 tablet",
  "Bila sakit / nyeri hebat (p.r.n)",
  "Kumur 3x sehari 10-15 ml selama 1 menit",
];

const COMMON_INSTRUCTIONS = [
  "Sesudah makan (p.c.)",
  "Sebelum makan (a.c.)",
  "Bersama makanan (d.c.)",
  "Wajib dihabiskan (Antibiotik)",
  "Bila nyeri / tidak membaik kontrol kembali",
  "Kumur buang, jangan ditelan",
];

export function MedicinePrescriptionModal({
  open,
  onOpenChange,
  medicines,
  onAddPrescription,
}: MedicinePrescriptionModalProps) {
  const [searchTerm, setSearchTerm] = React.useState("");
  const [selectedCategory, setSelectedCategory] = React.useState("all");
  const [selectedMedicine, setSelectedMedicine] = React.useState<Medicine | null>(null);

  // Prescription configuration form state
  const [quantity, setQuantity] = React.useState<number>(10);
  const [dosage, setDosage] = React.useState<string>("1 tablet");
  const [frequency, setFrequency] = React.useState<string>("3x sehari 1 tablet (tiap 8 jam)");
  const [duration, setDuration] = React.useState<string>("3 hari");
  const [instruction, setInstruction] = React.useState<string>("Sesudah makan (p.c.)");

  // Select first medicine as initial selection if none selected
  React.useEffect(() => {
    if (open && medicines.length > 0 && !selectedMedicine) {
      setSelectedMedicine(medicines[0]);
      applyDefaultsForMedicine(medicines[0]);
    }
  }, [open, medicines, selectedMedicine]);

  const applyDefaultsForMedicine = (med: Medicine) => {
    if (med.category.toLowerCase().includes("antiseptic")) {
      setDosage("10-15 ml");
      setFrequency("Kumur 3x sehari 10-15 ml selama 1 menit");
      setInstruction("Kumur buang, jangan ditelan");
      setQuantity(1);
      setDuration("7 hari");
    } else if (med.category.toLowerCase().includes("antibiotic")) {
      setDosage(`1 ${med.unit || "tablet"}`);
      setFrequency("3x sehari 1 tablet (tiap 8 jam)");
      setInstruction("Wajib dihabiskan (Antibiotik)");
      setQuantity(10);
      setDuration("3-5 hari");
    } else if (med.category.toLowerCase().includes("analgesic")) {
      setDosage(`1 ${med.unit || "tablet"}`);
      setFrequency("3x sehari 1 tablet (tiap 8 jam)");
      setInstruction("Sesudah makan (bila sakit)");
      setQuantity(10);
      setDuration("3 hari");
    } else {
      setDosage(`1 ${med.unit || "tablet"}`);
      setFrequency("3x sehari");
      setInstruction("Sesudah makan");
      setQuantity(10);
      setDuration("3 hari");
    }
  };

  const handleSelectMed = (med: Medicine) => {
    setSelectedMedicine(med);
    applyDefaultsForMedicine(med);
  };

  const filteredMedicines = React.useMemo(() => {
    return medicines.filter((m) => {
      const matchSearch =
        m.brandName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.genericName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.category.toLowerCase().includes(searchTerm.toLowerCase());

      const matchCategory =
        selectedCategory === "all" ||
        m.category.toLowerCase().includes(selectedCategory.toLowerCase());

      return matchSearch && matchCategory;
    });
  }, [medicines, searchTerm, selectedCategory]);

  const handleConfirmAdd = () => {
    if (!selectedMedicine) {
      toast.error("Silakan pilih obat terlebih dahulu.");
      return;
    }

    if (quantity <= 0) {
      toast.error("Jumlah obat minimal 1.");
      return;
    }

    const newItem: PrescriptionItem = {
      id: `RXI-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      medicineId: selectedMedicine.id,
      medicineName: `${selectedMedicine.brandName} (${selectedMedicine.genericName})`,
      dosage: dosage.trim() || `1 ${selectedMedicine.unit || "tablet"}`,
      route: selectedMedicine.category.toLowerCase().includes("antiseptic") ? "Topical" : "Oral",
      frequency: frequency.trim() || "3x sehari",
      duration: duration.trim() || "3 hari",
      quantity: quantity,
      instruction: instruction.trim() || "Sesudah makan",
      unitPrice: selectedMedicine.sellingPrice,
      totalPrice: selectedMedicine.sellingPrice * quantity,
    };

    onAddPrescription(newItem);
    toast.success(`Berhasil menambahkan ${selectedMedicine.brandName} ke resep.`);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl p-0 overflow-hidden rounded-2xl bg-white dark:bg-slate-900 shadow-2xl border border-slate-200 dark:border-slate-800">
        <DialogHeader className="p-5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-600 text-white shadow-md shadow-teal-600/30">
                <Pill className="h-5 w-5" />
              </div>
              <div>
                <DialogTitle className="text-lg font-bold text-slate-900 dark:text-white">
                  Katalog & Peresepan Obat Gigi
                </DialogTitle>
                <DialogDescription className="text-xs text-slate-500 dark:text-slate-400">
                  Cari obat dental, pilih dosis, signa, aturan minum, dan tambahkan langsung ke resep pasien.
                </DialogDescription>
              </div>
            </div>
          </div>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-12 min-h-[480px] max-h-[75vh]">
          {/* LEFT COLUMN: Search & Medicine List (7 Cols) */}
          <div className="md:col-span-7 flex flex-col border-b md:border-b-0 md:border-r border-slate-100 dark:border-slate-800 p-4 space-y-3">
            {/* Search Input */}
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <Input
                type="text"
                placeholder="Cari nama obat (Amoxicillin, Ponstan, Clindamycin...)"
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

            {/* Category Filter Chips */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  type="button"
                  className={`text-[11px] font-medium px-2.5 py-1 rounded-lg shrink-0 transition-all cursor-pointer ${
                    selectedCategory === cat.id
                      ? "bg-teal-600 text-white shadow-xs"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300"
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* Medicine Scrollable List */}
            <div className="flex-1 overflow-y-auto pr-1 space-y-2 max-h-[380px]">
              {filteredMedicines.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-8 text-center text-slate-400">
                  <Package className="h-8 w-8 mb-2 stroke-1" />
                  <p className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                    Obat tidak ditemukan
                  </p>
                  <p className="text-[11px] text-slate-400">
                    Coba kata kunci pencarian lain atau pilih kategori Semua.
                  </p>
                </div>
              ) : (
                filteredMedicines.map((med) => {
                  const isSelected = selectedMedicine?.id === med.id;
                  const isLowStock = med.currentStock <= med.minimumStock;

                  return (
                    <div
                      key={med.id}
                      onClick={() => handleSelectMed(med)}
                      className={`p-3 rounded-xl border text-xs cursor-pointer transition-all ${
                        isSelected
                          ? "border-teal-500 bg-teal-50/60 dark:bg-teal-950/40 shadow-xs"
                          : "border-slate-200 hover:border-teal-300 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800/40"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-slate-900 dark:text-slate-100 text-xs">
                              {med.brandName}
                            </span>
                            {med.strength && (
                              <span className="text-[10px] font-mono text-teal-700 dark:text-teal-400 bg-teal-50 dark:bg-teal-950 px-1.5 py-0.2 rounded font-semibold">
                                {med.strength}
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400">
                            {med.genericName}
                          </p>
                        </div>
                        <div className="text-right shrink-0">
                          <span className="font-bold font-mono text-slate-900 dark:text-white">
                            {formatCurrency(med.sellingPrice)}
                          </span>
                          <p className="text-[10px] text-slate-400">/ {med.unit}</p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100 dark:border-slate-800/70 text-[10px]">
                        <span className="text-slate-500 dark:text-slate-400 font-medium">
                          Bentuk: {med.dosageForm}
                        </span>
                        <div className="flex items-center gap-2">
                          <span
                            className={`font-semibold ${
                              isLowStock
                                ? "text-amber-600 dark:text-amber-400"
                                : "text-emerald-600 dark:text-emerald-400"
                            }`}
                          >
                            Stok: {med.currentStock} {med.unit}
                          </span>
                          {isSelected && (
                            <span className="flex items-center gap-0.5 text-teal-600 font-bold">
                              <Check className="h-3 w-3" /> Dipilih
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* RIGHT COLUMN: Prescription Configurator (5 Cols) */}
          <div className="md:col-span-5 p-4 flex flex-col justify-between bg-slate-50/40 dark:bg-slate-900/60">
            {selectedMedicine ? (
              <div className="space-y-4">
                <div className="rounded-xl border border-teal-100 bg-teal-50/70 p-3 dark:border-teal-900/40 dark:bg-teal-950/40">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-teal-700 dark:text-teal-300">
                      Obat Terpilih
                    </span>
                    <Badge variant="outline" className="text-[10px] bg-white dark:bg-slate-900 border-teal-200">
                      {selectedMedicine.category}
                    </Badge>
                  </div>
                  <h4 className="mt-1 font-bold text-sm text-slate-900 dark:text-white">
                    {selectedMedicine.brandName}
                  </h4>
                  <p className="text-xs text-slate-600 dark:text-slate-300">
                    {selectedMedicine.genericName} • {selectedMedicine.dosageForm}
                  </p>
                  <p className="text-xs font-bold text-teal-700 dark:text-teal-400 mt-1">
                    {formatCurrency(selectedMedicine.sellingPrice)} / {selectedMedicine.unit}
                  </p>
                </div>

                {/* Quantity Input */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex justify-between">
                    <span>Jumlah / Kuantitas ({selectedMedicine.unit}):</span>
                    <span className="text-[11px] text-teal-600 font-mono">
                      Subtotal: {formatCurrency(selectedMedicine.sellingPrice * quantity)}
                    </span>
                  </label>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                      className="h-8 w-8 rounded-lg border border-slate-200 bg-white font-bold text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                    >
                      -
                    </button>
                    <Input
                      type="number"
                      min={1}
                      value={quantity}
                      onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                      className="h-8 text-center font-bold text-xs"
                    />
                    <button
                      type="button"
                      onClick={() => setQuantity((q) => q + 1)}
                      className="h-8 w-8 rounded-lg border border-slate-200 bg-white font-bold text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                    >
                      +
                    </button>
                    {/* Quick presets */}
                    <div className="flex items-center gap-1">
                      {[5, 10, 15, 20].map((preset) => (
                        <button
                          key={preset}
                          type="button"
                          onClick={() => setQuantity(preset)}
                          className={`text-[10px] px-2 py-1 rounded-md font-semibold border ${
                            quantity === preset
                              ? "bg-teal-600 text-white border-teal-600"
                              : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300"
                          }`}
                        >
                          {preset}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Signa / Frekuensi */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Signa & Frekuensi Penggunaan:
                  </label>
                  <Input
                    type="text"
                    value={frequency}
                    onChange={(e) => setFrequency(e.target.value)}
                    placeholder="Contoh: 3x sehari 1 tablet"
                    className="text-xs h-8"
                  />
                  <div className="flex flex-wrap gap-1 pt-1">
                    {COMMON_FREQUENCIES.slice(0, 4).map((f) => (
                      <button
                        key={f}
                        type="button"
                        onClick={() => setFrequency(f)}
                        className="text-[10px] px-2 py-0.5 rounded border border-slate-200 bg-white hover:border-teal-400 hover:bg-teal-50/50 text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
                      >
                        {f}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Aturan Minum / Instruksi */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Petunjuk Khusus & Aturan Minum:
                  </label>
                  <Input
                    type="text"
                    value={instruction}
                    onChange={(e) => setInstruction(e.target.value)}
                    placeholder="Contoh: Sesudah makan"
                    className="text-xs h-8"
                  />
                  <div className="flex flex-wrap gap-1 pt-1">
                    {COMMON_INSTRUCTIONS.slice(0, 4).map((inst) => (
                      <button
                        key={inst}
                        type="button"
                        onClick={() => setInstruction(inst)}
                        className="text-[10px] px-2 py-0.5 rounded border border-slate-200 bg-white hover:border-teal-400 hover:bg-teal-50/50 text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
                      >
                        {inst}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center p-8 text-center text-slate-400">
                <AlertCircle className="h-8 w-8 mb-2 text-slate-300" />
                <p className="text-xs font-medium text-slate-500">
                  Pilih obat dari daftar di sebelah kiri untuk mengatur resep.
                </p>
              </div>
            )}

            {/* Bottom action button */}
            <div className="pt-4 border-t border-slate-200 dark:border-slate-800 mt-auto">
              <Button
                type="button"
                onClick={handleConfirmAdd}
                disabled={!selectedMedicine}
                className="w-full bg-teal-600 hover:bg-teal-700 text-white shadow-md shadow-teal-600/20 gap-2"
              >
                <Plus className="h-4 w-4" />
                <span>Tambahkan ke Resep Pasien</span>
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
