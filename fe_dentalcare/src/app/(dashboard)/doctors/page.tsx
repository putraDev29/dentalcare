"use client";

import * as React from "react";
import Link from "next/link";
import {
  UserCheck,
  Calendar,
  Clock,
  MapPin,
  Phone,
  Mail,
  Stethoscope,
  Plus,
  Edit3,
  Trash2,
  Search,
  CheckCircle2,
  AlertCircle,
  Shield,
  DollarSign,
  Users,
  Sparkles,
  X,
  Building,
} from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog } from "@/components/ui/dialog";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { useDoctors } from "@/hooks";
import { formatCurrency } from "@/lib/formatting";
import { Doctor, DoctorSchedule } from "@/types";
import { toast } from "sonner";

const DENTAL_SPECIALIZATIONS = [
  "Dokter Gigi Umum & Perawatan Klinis",
  "Spesialis Konservasi Gigi & Endodonti (Sp.KG)",
  "Spesialis Ortodonsia (Kawat & Behel Gigi) (Sp.Ort)",
  "Spesialis Bedah Mulut & Maksilofasial (Sp.BM)",
  "Spesialis Periodonsia (Gusi & Jaringan Penyangga) (Sp.Perio)",
  "Spesialis Kedokteran Gigi Anak (Pedodonsia) (Sp.KGA)",
  "Spesialis Prostodonsia (Gigi Tiruan & Implan) (Sp.Pros)",
  "Spesialis Radiologi Kedokteran Gigi (Sp.RKG)",
];

const DENTAL_DEPARTMENTS = [
  "Poli Gigi Umum & Bedah Mulut",
  "Poli Gigi Spesialis Konservasi",
  "Poli Ortodonsia Dental",
  "Poli Bedah Mulut & Dental Implant",
  "Poli Gigi Anak (Pedodonsia)",
  "Poli Estetika Gigi & Whitening",
];

const DENTAL_ROOMS = [
  "Dental Chair 1",
  "Dental Chair 2",
  "Dental Chair 3",
  "Dental Unit VIP",
  "Ruang Bedah Minor Gigi",
];

const DAY_OPTIONS: { dayOfWeek: 1 | 2 | 3 | 4 | 5 | 6 | 7; dayName: string }[] = [
  { dayOfWeek: 1, dayName: "Senin" },
  { dayOfWeek: 2, dayName: "Selasa" },
  { dayOfWeek: 3, dayName: "Rabu" },
  { dayOfWeek: 4, dayName: "Kamis" },
  { dayOfWeek: 5, dayName: "Jumat" },
  { dayOfWeek: 6, dayName: "Sabtu" },
  { dayOfWeek: 7, dayName: "Minggu" },
];

export default function DoctorsPage() {
  const { doctors, loading, createDoctor, updateDoctor, deleteDoctor } = useDoctors();

  const [search, setSearch] = React.useState("");
  const [selectedSpecialization, setSelectedSpecialization] = React.useState("all");
  const [selectedStatus, setSelectedStatus] = React.useState("all");

  // Create / Edit Modal State
  const [isFormModalOpen, setIsFormModalOpen] = React.useState(false);
  const [editingDoctor, setEditingDoctor] = React.useState<Doctor | null>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  // Form Fields State
  const [formName, setFormName] = React.useState("");
  const [formTitle, setFormTitle] = React.useState("drg.");
  const [formSpecialization, setFormSpecialization] = React.useState(DENTAL_SPECIALIZATIONS[0]);
  const [formDepartmentName, setFormDepartmentName] = React.useState(DENTAL_DEPARTMENTS[0]);
  const [formSipNumber, setFormSipNumber] = React.useState("");
  const [formPhone, setFormPhone] = React.useState("");
  const [formEmail, setFormEmail] = React.useState("");
  const [formConsultationFee, setFormConsultationFee] = React.useState<number>(150000);
  const [formStatus, setFormStatus] = React.useState<"active" | "on_leave" | "resigned">("active");
  const [formSchedules, setFormSchedules] = React.useState<DoctorSchedule[]>([]);

  // Delete Modal State
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false);
  const [doctorToDelete, setDoctorToDelete] = React.useState<Doctor | null>(null);

  // Quick Schedule Modal State
  const [isScheduleModalOpen, setIsScheduleModalOpen] = React.useState(false);
  const [schedulingDoctor, setSchedulingDoctor] = React.useState<Doctor | null>(null);

  // Filtered Doctors
  const filteredDoctors = React.useMemo(() => {
    return doctors.filter((doc) => {
      const q = search.toLowerCase();
      const matchSearch =
        doc.name.toLowerCase().includes(q) ||
        doc.specialization.toLowerCase().includes(q) ||
        doc.sipNumber.toLowerCase().includes(q) ||
        doc.departmentName.toLowerCase().includes(q);

      const matchSpec =
        selectedSpecialization === "all" || doc.specialization === selectedSpecialization;

      const matchStatus =
        selectedStatus === "all" || doc.status === selectedStatus;

      return matchSearch && matchSpec && matchStatus;
    });
  }, [doctors, search, selectedSpecialization, selectedStatus]);

  // KPI Stats
  const totalDoctors = doctors.length;
  const activeDoctors = doctors.filter((d) => d.status === "active").length;
  const totalWeeklySlots = doctors.reduce((acc, d) => acc + (d.schedules?.length || 0), 0);
  const avgFee =
    totalDoctors > 0
      ? Math.round(doctors.reduce((acc, d) => acc + (d.consultationFee || 0), 0) / totalDoctors)
      : 0;

  // Open Create Form
  const handleOpenCreate = () => {
    setEditingDoctor(null);
    setFormName("");
    setFormTitle("drg.");
    setFormSpecialization(DENTAL_SPECIALIZATIONS[0]);
    setFormDepartmentName(DENTAL_DEPARTMENTS[0]);
    setFormSipNumber(`SIP.503/442/${String(doctors.length + 1).padStart(2, "0")}/DINKES/2026`);
    setFormPhone("081234567890");
    setFormEmail(`dokter${doctors.length + 1}@klinikgigi.local`);
    setFormConsultationFee(150000);
    setFormStatus("active");
    setFormSchedules([
      {
        id: `SCH-${Date.now()}-1`,
        doctorId: "",
        dayOfWeek: 1,
        dayName: "Senin",
        startTime: "08:00",
        endTime: "16:00",
        departmentId: "DEP-001",
        roomNumber: "Dental Chair 1",
        maxQuota: 20,
        isActive: true,
      },
      {
        id: `SCH-${Date.now()}-2`,
        doctorId: "",
        dayOfWeek: 3,
        dayName: "Rabu",
        startTime: "08:00",
        endTime: "16:00",
        departmentId: "DEP-001",
        roomNumber: "Dental Chair 1",
        maxQuota: 20,
        isActive: true,
      },
      {
        id: `SCH-${Date.now()}-3`,
        doctorId: "",
        dayOfWeek: 5,
        dayName: "Jumat",
        startTime: "16:30",
        endTime: "20:00",
        departmentId: "DEP-001",
        roomNumber: "Dental Chair 2",
        maxQuota: 15,
        isActive: true,
      },
    ]);
    setIsFormModalOpen(true);
  };

  // Open Edit Form
  const handleOpenEdit = (doc: Doctor) => {
    setEditingDoctor(doc);
    setFormName(doc.name);
    setFormTitle(doc.title || "drg.");
    setFormSpecialization(doc.specialization || DENTAL_SPECIALIZATIONS[0]);
    setFormDepartmentName(doc.departmentName || DENTAL_DEPARTMENTS[0]);
    setFormSipNumber(doc.sipNumber || "");
    setFormPhone(doc.phone || "");
    setFormEmail(doc.email || "");
    setFormConsultationFee(doc.consultationFee || 150000);
    setFormStatus(doc.status || "active");
    setFormSchedules(doc.schedules ? JSON.parse(JSON.stringify(doc.schedules)) : []);
    setIsFormModalOpen(true);
  };

  // Open Quick Schedule Modal
  const handleOpenScheduleModal = (doc: Doctor) => {
    setSchedulingDoctor(doc);
    setFormSchedules(doc.schedules ? JSON.parse(JSON.stringify(doc.schedules)) : []);
    setIsScheduleModalOpen(true);
  };

  // Save Schedule Modal
  const handleSaveSchedulesOnly = async () => {
    if (!schedulingDoctor) return;
    setIsSubmitting(true);
    try {
      await updateDoctor(schedulingDoctor.id, { schedules: formSchedules });
      toast.success(`Jadwal praktik ${schedulingDoctor.name} berhasil diperbarui!`);
      setIsScheduleModalOpen(false);
    } catch {
      toast.error("Gagal memperbarui jadwal praktik.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Add a schedule row
  const handleAddScheduleRow = (preset?: { start: string; end: string; room?: string }) => {
    const nextDayNum = ((formSchedules.length % 6) + 1) as 1 | 2 | 3 | 4 | 5 | 6 | 7;
    const dayObj = DAY_OPTIONS.find((d) => d.dayOfWeek === nextDayNum) || DAY_OPTIONS[0];

    const newSch: DoctorSchedule = {
      id: `SCH-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      doctorId: editingDoctor?.id || "",
      dayOfWeek: dayObj.dayOfWeek,
      dayName: dayObj.dayName,
      startTime: preset?.start || "08:30",
      endTime: preset?.end || "15:00",
      departmentId: "DEP-001",
      roomNumber: preset?.room || "Dental Chair 1",
      maxQuota: 18,
      isActive: true,
    };
    setFormSchedules((prev) => [...prev, newSch]);
  };

  const handleRemoveScheduleRow = (idx: number) => {
    setFormSchedules((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleUpdateScheduleRow = (idx: number, patch: Partial<DoctorSchedule>) => {
    setFormSchedules((prev) => {
      const next = [...prev];
      next[idx] = { ...next[idx], ...patch };
      if (patch.dayOfWeek !== undefined) {
        const found = DAY_OPTIONS.find((d) => d.dayOfWeek === patch.dayOfWeek);
        if (found) next[idx].dayName = found.dayName;
      }
      return next;
    });
  };

  // Submit Create or Edit
  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) {
      toast.error("Nama dokter gigi wajib diisi.");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload: Partial<Doctor> = {
        name: formName.trim(),
        title: formTitle.trim(),
        specialization: formSpecialization,
        departmentName: formDepartmentName,
        sipNumber: formSipNumber.trim(),
        phone: formPhone.trim(),
        email: formEmail.trim(),
        consultationFee: Number(formConsultationFee) || 0,
        status: formStatus,
        schedules: formSchedules,
      };

      if (editingDoctor) {
        await updateDoctor(editingDoctor.id, payload);
        toast.success(`Data dokter gigi ${payload.name} berhasil diperbarui!`);
      } else {
        await createDoctor(payload);
        toast.success(`Dokter gigi baru ${payload.name} berhasil ditambahkan!`);
      }
      setIsFormModalOpen(false);
    } catch {
      toast.error("Terjadi kesalahan saat menyimpan data dokter gigi.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Open Delete Dialog
  const handleOpenDelete = (doc: Doctor) => {
    setDoctorToDelete(doc);
    setIsDeleteDialogOpen(true);
  };

  // Confirm Delete
  const handleConfirmDelete = async () => {
    if (!doctorToDelete) return;
    try {
      await deleteDoctor(doctorToDelete.id);
      toast.success(`Dokter gigi ${doctorToDelete.name} berhasil dihapus.`);
    } catch {
      toast.error("Gagal menghapus dokter gigi.");
    } finally {
      setIsDeleteDialogOpen(false);
      setDoctorToDelete(null);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dokter Gigi & Jadwal Praktik"
        description="Kelola data dokter gigi spesialis, surat izin praktik (SIP), jadwal operasional klinik, serta alokasi kuota per dental chair."
      >
        <div className="flex items-center gap-2">
          <Link href="/appointments">
            <Button variant="outline" size="sm" className="gap-1.5 text-xs">
              <Calendar className="h-3.5 w-3.5" />
              <span>Jadwal Janji Temu</span>
            </Button>
          </Link>
          <Button
            size="sm"
            onClick={handleOpenCreate}
            className="gap-1.5 text-xs bg-teal-600 hover:bg-teal-700 text-white font-semibold shadow-xs cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span>Tambah Dokter Gigi</span>
          </Button>
        </div>
      </PageHeader>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card className="rounded-2xl border-slate-200/80 bg-white dark:bg-slate-900 shadow-xs">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                Total Dokter Gigi
              </p>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
                {totalDoctors}
              </h3>
              <p className="text-[10px] text-teal-600 font-medium mt-0.5">DPJP & Spesialis</p>
            </div>
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-teal-50 text-teal-600 dark:bg-teal-950 dark:text-teal-400">
              <Stethoscope className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-slate-200/80 bg-white dark:bg-slate-900 shadow-xs">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                Dokter Aktif
              </p>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
                {activeDoctors}
              </h3>
              <p className="text-[10px] text-emerald-600 font-medium mt-0.5">Siap Melayani Pasien</p>
            </div>
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400">
              <UserCheck className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-slate-200/80 bg-white dark:bg-slate-900 shadow-xs">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                Sesi Praktik Mingguan
              </p>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
                {totalWeeklySlots}
              </h3>
              <p className="text-[10px] text-blue-600 font-medium mt-0.5">Hari & Shift Terjadwal</p>
            </div>
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400">
              <Clock className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-slate-200/80 bg-white dark:bg-slate-900 shadow-xs">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                Tarif Konsultasi Rata-Rata
              </p>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mt-1">
                {formatCurrency(avgFee)}
              </h3>
              <p className="text-[10px] text-purple-600 font-medium mt-0.5">Jasa Medis Dental</p>
            </div>
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-purple-50 text-purple-600 dark:bg-purple-950 dark:text-purple-400">
              <DollarSign className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 p-3.5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari nama dokter gigi, nomor SIP, atau keahlian..."
            className="pl-9 text-xs h-9 bg-slate-50/70 dark:bg-slate-800/50"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="w-48">
            <Select
              value={selectedSpecialization}
              onChange={(e) => setSelectedSpecialization(e.target.value)}
              className="text-xs h-9 bg-slate-50/70 dark:bg-slate-800/50"
            >
              <option value="all">Semua Spesialisasi</option>
              {DENTAL_SPECIALIZATIONS.map((spec) => (
                <option key={spec} value={spec}>
                  {spec}
                </option>
              ))}
            </Select>
          </div>

          <div className="w-36">
            <Select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="text-xs h-9 bg-slate-50/70 dark:bg-slate-800/50"
            >
              <option value="all">Semua Status</option>
              <option value="active">Aktif</option>
              <option value="on_leave">Cuti / Izin</option>
              <option value="resigned">Non-Aktif</option>
            </Select>
          </div>
        </div>
      </div>

      {/* Doctors Grid */}
      {loading ? (
        <div className="p-12 text-center text-xs text-slate-400">Memuat data dokter gigi...</div>
      ) : filteredDoctors.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-200 p-12 text-center dark:border-slate-800">
          <Stethoscope className="mx-auto h-12 w-12 text-slate-300 stroke-1 mb-2" />
          <p className="font-semibold text-sm text-slate-700 dark:text-slate-300">
            Tidak ada dokter gigi yang sesuai
          </p>
          <p className="text-xs text-slate-400 mt-0.5">
            Coba ganti kata kunci pencarian atau filter spesialisasi.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredDoctors.map((doc) => {
            const isActive = doc.status === "active";
            const isOnLeave = doc.status === "on_leave";

            return (
              <Card
                key={doc.id}
                className="flex flex-col justify-between rounded-2xl border-slate-200/80 bg-white hover:shadow-md transition-all dark:border-slate-800 dark:bg-slate-900/90 overflow-hidden"
              >
                <div>
                  <CardHeader className="flex flex-row items-start justify-between gap-3 p-4 pb-3 border-b border-slate-100 dark:border-slate-800/60">
                    <div className="flex items-start gap-3 overflow-hidden">
                      <div className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-teal-50 text-teal-700 font-bold text-base dark:bg-teal-950/60 dark:text-teal-300 shadow-xs">
                        <Stethoscope className="h-6 w-6" />
                        <span
                          className={`absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full border-2 border-white dark:border-slate-900 ${
                            isActive
                              ? "bg-emerald-500"
                              : isOnLeave
                              ? "bg-amber-500"
                              : "bg-slate-400"
                          }`}
                        />
                      </div>
                      <div className="overflow-hidden">
                        <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 truncate">
                          {doc.name}
                        </h3>
                        <p className="text-[11px] font-semibold text-teal-700 dark:text-teal-400 truncate">
                          {doc.specialization}
                        </p>
                        <p className="text-[10px] text-slate-400 truncate mt-0.5">
                          {doc.departmentName}
                        </p>
                      </div>
                    </div>

                    <Badge
                      variant={isActive ? "success" : isOnLeave ? "warning" : "neutral"}
                      className="text-[10px] font-bold uppercase shrink-0 py-0.5 px-2"
                    >
                      {isActive ? "Aktif" : isOnLeave ? "Cuti" : "Non-Aktif"}
                    </Badge>
                  </CardHeader>

                  <CardContent className="p-4 space-y-3 text-xs">
                    {/* SIP and Consultation Fee */}
                    <div className="rounded-xl bg-slate-50 p-2.5 dark:bg-slate-800/50 space-y-1.5 border border-slate-100 dark:border-slate-800/60">
                      <div className="flex justify-between items-center text-[11px]">
                        <span className="text-slate-500">Nomor SIP:</span>
                        <span className="font-mono text-slate-700 dark:text-slate-300 font-semibold truncate max-w-[160px]">
                          {doc.sipNumber || "-"}
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-[11px]">
                        <span className="text-slate-500">Tarif Konsultasi:</span>
                        <span className="font-bold text-teal-700 dark:text-teal-300">
                          {formatCurrency(doc.consultationFee)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-[11px]">
                        <span className="text-slate-500">WhatsApp / Telp:</span>
                        <span className="font-mono text-slate-700 dark:text-slate-300 font-medium">
                          {doc.phone || "-"}
                        </span>
                      </div>
                    </div>

                    {/* Schedules Section */}
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="font-semibold text-slate-700 dark:text-slate-300 text-[11px] flex items-center gap-1">
                          <Calendar className="h-3 w-3 text-teal-600" />
                          Jadwal Praktik ({doc.schedules?.length || 0} Sesi):
                        </span>
                        <button
                          type="button"
                          onClick={() => handleOpenScheduleModal(doc)}
                          className="text-[10px] font-semibold text-teal-600 hover:underline dark:text-teal-400 cursor-pointer"
                        >
                          Atur Jadwal
                        </button>
                      </div>

                      {doc.schedules && doc.schedules.length > 0 ? (
                        <div className="flex flex-wrap gap-1.5">
                          {doc.schedules.map((sch) => (
                            <div
                              key={sch.id}
                              className="rounded-lg bg-teal-50/80 border border-teal-200/80 px-2 py-1 text-[10px] text-teal-900 dark:border-teal-900/60 dark:bg-teal-950/40 dark:text-teal-300 flex items-center gap-1"
                              title={`${sch.dayName}: ${sch.startTime} - ${sch.endTime} (${sch.roomNumber}, Kuota: ${sch.maxQuota})`}
                            >
                              <span className="font-bold">{sch.dayName}</span>
                              <span className="text-teal-700 dark:text-teal-400">
                                {sch.startTime}-{sch.endTime}
                              </span>
                              <span className="text-[9px] text-slate-400 font-mono">
                                • {sch.roomNumber.replace("Dental ", "")}
                              </span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-[11px] text-slate-400 italic">
                          Belum ada jadwal praktik ditentukan.
                        </p>
                      )}
                    </div>
                  </CardContent>
                </div>

                {/* Bottom Action Bar */}
                <div className="p-4 pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleOpenEdit(doc)}
                      className="h-8 text-xs gap-1 border-slate-200 hover:bg-slate-100 dark:border-slate-800 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 cursor-pointer"
                      title="Edit data profil dan jadwal praktik dokter"
                    >
                      <Edit3 className="h-3.5 w-3.5" />
                      <span>Edit</span>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleOpenDelete(doc)}
                      className="h-8 text-xs px-2.5 border-rose-200 text-rose-600 hover:bg-rose-50 dark:border-rose-900/60 dark:text-rose-400 cursor-pointer"
                      title="Hapus dokter gigi"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>

                  <Link href={`/appointments/new?doctorId=${doc.id}`}>
                    <Button
                      size="sm"
                      className="h-8 text-xs gap-1 bg-slate-900 hover:bg-slate-800 text-white dark:bg-slate-700 dark:hover:bg-slate-600 font-semibold"
                    >
                      <Clock className="h-3 w-3" />
                      <span>Booking Pasien</span>
                    </Button>
                  </Link>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* CREATE / EDIT DOCTOR MODAL */}
      <Dialog
        open={isFormModalOpen}
        onOpenChange={setIsFormModalOpen}
        title={editingDoctor ? "Edit Profil & Jadwal Dokter Gigi" : "Tambah Dokter Gigi Baru"}
        description="Lengkapi informasi identitas klinis, spesialisasi gigi, biaya jasa medis, dan hari jadwal praktik dokter."
      >
        <form onSubmit={handleSubmitForm} className="space-y-4 pt-2 text-xs">
          {/* Section: Profil Utama */}
          <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-3.5 dark:border-slate-800 dark:bg-slate-900/40 space-y-3">
            <h4 className="font-bold text-slate-900 dark:text-slate-100 text-xs flex items-center gap-1.5">
              <Stethoscope className="h-4 w-4 text-teal-600" />
              1. Identitas & Keahlian Dokter Gigi
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2 space-y-1">
                <label className="font-semibold text-slate-700 dark:text-slate-300">
                  Nama Lengkap Dokter Gigi <span className="text-rose-500">*</span>
                </label>
                <Input
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="Contoh: drg. Pratama Wijaya, Sp.KG"
                  required
                  className="text-xs h-8 bg-white dark:bg-slate-900"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700 dark:text-slate-300">
                  Gelar / Panggilan
                </label>
                <Input
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="drg. / Sp.KG"
                  className="text-xs h-8 bg-white dark:bg-slate-900"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="font-semibold text-slate-700 dark:text-slate-300">
                  Spesialisasi Gigi
                </label>
                <Select
                  value={formSpecialization}
                  onChange={(e) => setFormSpecialization(e.target.value)}
                  className="text-xs h-8 bg-white dark:bg-slate-900"
                >
                  {DENTAL_SPECIALIZATIONS.map((spec) => (
                    <option key={spec} value={spec}>
                      {spec}
                    </option>
                  ))}
                </Select>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700 dark:text-slate-300">
                  Departemen / Poli Utama
                </label>
                <Select
                  value={formDepartmentName}
                  onChange={(e) => setFormDepartmentName(e.target.value)}
                  className="text-xs h-8 bg-white dark:bg-slate-900"
                >
                  {DENTAL_DEPARTMENTS.map((dept) => (
                    <option key={dept} value={dept}>
                      {dept}
                    </option>
                  ))}
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="space-y-1">
                <label className="font-semibold text-slate-700 dark:text-slate-300">
                  Nomor SIP (Surat Izin Praktik)
                </label>
                <Input
                  value={formSipNumber}
                  onChange={(e) => setFormSipNumber(e.target.value)}
                  placeholder="SIP.503/442/01/DINKES/2026"
                  className="text-xs h-8 bg-white dark:bg-slate-900 font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700 dark:text-slate-300">
                  Biaya Jasa Konsultasi (Rp)
                </label>
                <Input
                  type="number"
                  value={formConsultationFee}
                  onChange={(e) => setFormConsultationFee(Number(e.target.value))}
                  placeholder="150000"
                  className="text-xs h-8 bg-white dark:bg-slate-900"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700 dark:text-slate-300">
                  Status Praktik
                </label>
                <Select
                  value={formStatus}
                  onChange={(e: any) => setFormStatus(e.target.value)}
                  className="text-xs h-8 bg-white dark:bg-slate-900"
                >
                  <option value="active">Aktif Melayani</option>
                  <option value="on_leave">Cuti Sementara</option>
                  <option value="resigned">Non-Aktif / Resigned</option>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="font-semibold text-slate-700 dark:text-slate-300">
                  Nomor WhatsApp / HP
                </label>
                <Input
                  value={formPhone}
                  onChange={(e) => setFormPhone(e.target.value)}
                  placeholder="081234567890"
                  className="text-xs h-8 bg-white dark:bg-slate-900 font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700 dark:text-slate-300">
                  Email Dokter
                </label>
                <Input
                  type="email"
                  value={formEmail}
                  onChange={(e) => setFormEmail(e.target.value)}
                  placeholder="dokter@klinikgigi.local"
                  className="text-xs h-8 bg-white dark:bg-slate-900"
                />
              </div>
            </div>
          </div>

          {/* Section: Jadwal Praktik Dokter */}
          <div className="rounded-xl border border-teal-200 bg-teal-50/40 p-3.5 dark:border-teal-900/60 dark:bg-teal-950/20 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-bold text-slate-900 dark:text-slate-100 text-xs flex items-center gap-1.5">
                  <Calendar className="h-4 w-4 text-teal-600" />
                  2. Konfigurasi Jadwal Praktik ({formSchedules.length} Sesi)
                </h4>
                <p className="text-[11px] text-slate-500">
                  Atur hari kerja, jam operasional, dental chair, dan kuota pasien.
                </p>
              </div>

              <div className="flex items-center gap-1.5">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleAddScheduleRow()}
                  className="h-7 text-[11px] gap-1 border-teal-300 text-teal-700 hover:bg-teal-100 dark:border-teal-800 dark:text-teal-300"
                >
                  <Plus className="h-3 w-3" />
                  <span>Tambah Sesi</span>
                </Button>
              </div>
            </div>

            {/* Quick Presets */}
            <div className="flex flex-wrap items-center gap-1.5 text-[10px] text-slate-500">
              <span className="font-semibold">Preset Cepat:</span>
              <button
                type="button"
                onClick={() =>
                  handleAddScheduleRow({ start: "08:00", end: "15:00", room: "Dental Chair 1" })
                }
                className="px-2 py-0.5 rounded-md bg-white border border-teal-200 text-teal-700 hover:bg-teal-50 dark:bg-slate-900 dark:border-teal-800 dark:text-teal-300 cursor-pointer"
              >
                + Shift Pagi (08:00 - 15:00)
              </button>
              <button
                type="button"
                onClick={() =>
                  handleAddScheduleRow({ start: "16:30", end: "20:00", room: "Dental Chair 2" })
                }
                className="px-2 py-0.5 rounded-md bg-white border border-teal-200 text-teal-700 hover:bg-teal-50 dark:bg-slate-900 dark:border-teal-800 dark:text-teal-300 cursor-pointer"
              >
                + Shift Sore/Malam (16:30 - 20:00)
              </button>
            </div>

            {/* Schedule Rows */}
            <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
              {formSchedules.length === 0 ? (
                <p className="text-center text-slate-400 py-3 text-xs italic">
                  Belum ada sesi praktik. Klik "+ Tambah Sesi" di atas.
                </p>
              ) : (
                formSchedules.map((sch, idx) => (
                  <div
                    key={sch.id || idx}
                    className="flex flex-wrap items-center gap-2 p-2 rounded-lg bg-white dark:bg-slate-900 border border-teal-100 dark:border-teal-900/40 shadow-2xs"
                  >
                    {/* Day selector */}
                    <div className="w-24">
                      <Select
                        value={String(sch.dayOfWeek)}
                        onChange={(e) =>
                          handleUpdateScheduleRow(idx, { dayOfWeek: Number(e.target.value) as any })
                        }
                        className="text-[11px] h-7 bg-slate-50 dark:bg-slate-800"
                      >
                        {DAY_OPTIONS.map((d) => (
                          <option key={d.dayOfWeek} value={d.dayOfWeek}>
                            {d.dayName}
                          </option>
                        ))}
                      </Select>
                    </div>

                    {/* Time range */}
                    <div className="flex items-center gap-1 text-[11px]">
                      <Input
                        type="time"
                        value={sch.startTime}
                        onChange={(e) => handleUpdateScheduleRow(idx, { startTime: e.target.value })}
                        className="text-[11px] h-7 w-20 px-1 bg-slate-50 dark:bg-slate-800 text-center font-mono"
                      />
                      <span>-</span>
                      <Input
                        type="time"
                        value={sch.endTime}
                        onChange={(e) => handleUpdateScheduleRow(idx, { endTime: e.target.value })}
                        className="text-[11px] h-7 w-20 px-1 bg-slate-50 dark:bg-slate-800 text-center font-mono"
                      />
                    </div>

                    {/* Room */}
                    <div className="w-36">
                      <Select
                        value={sch.roomNumber}
                        onChange={(e) => handleUpdateScheduleRow(idx, { roomNumber: e.target.value })}
                        className="text-[11px] h-7 bg-slate-50 dark:bg-slate-800"
                      >
                        {DENTAL_ROOMS.map((room) => (
                          <option key={room} value={room}>
                            {room}
                          </option>
                        ))}
                      </Select>
                    </div>

                    {/* Quota */}
                    <div className="flex items-center gap-1">
                      <span className="text-[10px] text-slate-400">Kuota:</span>
                      <Input
                        type="number"
                        value={sch.maxQuota}
                        onChange={(e) =>
                          handleUpdateScheduleRow(idx, { maxQuota: Number(e.target.value) })
                        }
                        className="text-[11px] h-7 w-14 px-1 bg-slate-50 dark:bg-slate-800 text-center"
                      />
                    </div>

                    {/* Remove button */}
                    <button
                      type="button"
                      onClick={() => handleRemoveScheduleRow(idx)}
                      className="p-1 text-slate-400 hover:text-rose-600 rounded-md hover:bg-rose-50 dark:hover:bg-rose-950/40 ml-auto cursor-pointer"
                      title="Hapus sesi praktik ini"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsFormModalOpen(false)}
            >
              Batal
            </Button>
            <Button
              type="submit"
              size="sm"
              isLoading={isSubmitting}
              className="bg-teal-600 hover:bg-teal-700 text-white font-semibold shadow-xs"
            >
              {editingDoctor ? "Simpan Perubahan Dokter" : "Tambah Dokter Gigi"}
            </Button>
          </div>
        </form>
      </Dialog>

      {/* QUICK SCHEDULE ONLY MODAL */}
      <Dialog
        open={isScheduleModalOpen}
        onOpenChange={setIsScheduleModalOpen}
        title={`Atur Jadwal Praktik • ${schedulingDoctor?.name || ""}`}
        description="Kelola hari dan jam praktik dokter gigi di unit klinik."
      >
        <div className="space-y-4 pt-2 text-xs">
          <div className="flex items-center justify-between">
            <p className="font-semibold text-slate-700 dark:text-slate-300">
              Daftar Sesi Praktik ({formSchedules.length})
            </p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => handleAddScheduleRow()}
              className="h-7 text-xs gap-1 border-teal-300 text-teal-700 hover:bg-teal-50"
            >
              <Plus className="h-3 w-3" />
              <span>Tambah Hari</span>
            </Button>
          </div>

          <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
            {formSchedules.map((sch, idx) => (
              <div
                key={sch.id || idx}
                className="flex flex-wrap items-center gap-2 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700"
              >
                <div className="w-24">
                  <Select
                    value={String(sch.dayOfWeek)}
                    onChange={(e) =>
                      handleUpdateScheduleRow(idx, { dayOfWeek: Number(e.target.value) as any })
                    }
                    className="text-xs h-8"
                  >
                    {DAY_OPTIONS.map((d) => (
                      <option key={d.dayOfWeek} value={d.dayOfWeek}>
                        {d.dayName}
                      </option>
                    ))}
                  </Select>
                </div>

                <div className="flex items-center gap-1 font-mono">
                  <Input
                    type="time"
                    value={sch.startTime}
                    onChange={(e) => handleUpdateScheduleRow(idx, { startTime: e.target.value })}
                    className="text-xs h-8 w-20 px-1 text-center"
                  />
                  <span>-</span>
                  <Input
                    type="time"
                    value={sch.endTime}
                    onChange={(e) => handleUpdateScheduleRow(idx, { endTime: e.target.value })}
                    className="text-xs h-8 w-20 px-1 text-center"
                  />
                </div>

                <div className="w-36">
                  <Select
                    value={sch.roomNumber}
                    onChange={(e) => handleUpdateScheduleRow(idx, { roomNumber: e.target.value })}
                    className="text-xs h-8"
                  >
                    {DENTAL_ROOMS.map((room) => (
                      <option key={room} value={room}>
                        {room}
                      </option>
                    ))}
                  </Select>
                </div>

                <div className="flex items-center gap-1">
                  <span className="text-slate-400 text-[10px]">Kuota:</span>
                  <Input
                    type="number"
                    value={sch.maxQuota}
                    onChange={(e) =>
                      handleUpdateScheduleRow(idx, { maxQuota: Number(e.target.value) })
                    }
                    className="text-xs h-8 w-14 text-center"
                  />
                </div>

                <button
                  type="button"
                  onClick={() => handleRemoveScheduleRow(idx)}
                  className="p-1 text-slate-400 hover:text-rose-600 ml-auto cursor-pointer"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsScheduleModalOpen(false)}
            >
              Batal
            </Button>
            <Button
              type="button"
              size="sm"
              isLoading={isSubmitting}
              onClick={handleSaveSchedulesOnly}
              className="bg-teal-600 hover:bg-teal-700 text-white font-semibold"
            >
              Simpan Jadwal Praktik
            </Button>
          </div>
        </div>
      </Dialog>

      {/* CONFIRM DELETE DIALOG */}
      <ConfirmDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onConfirm={handleConfirmDelete}
        title="Hapus Data Dokter Gigi?"
        description={`Apakah Anda yakin ingin menghapus data "${doctorToDelete?.name}"? Tindakan ini akan menghapus jadwal praktik dan profil dokter terkait.`}
        confirmText="Hapus Dokter"
        cancelText="Batal"
        variant="danger"
      />
    </div>
  );
}
