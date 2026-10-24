"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  User,
  Building2,
  UserCheck,
  Clock,
  CheckCircle2,
  Calendar,
  ArrowRight,
  ArrowLeft,
  Search,
} from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { usePatients, useDoctors } from "@/hooks";
import { AppointmentService } from "@/services";
import { Patient, Doctor } from "@/types";
import { formatDate } from "@/lib/formatting";
import { toast } from "sonner";

const MORNING_AFTERNOON_SLOTS = [
  "08:00", "08:30", "09:00", "09:30", "10:00", "10:30", 
  "11:00", "11:30", "13:00", "13:30", "14:00", "14:30"
];

const EVENING_NIGHT_SLOTS = [
  "16:30", "17:00", "17:30", "18:00", "18:30", "19:00", "19:30", "20:00"
];

const SLOTS = [...MORNING_AFTERNOON_SLOTS, ...EVENING_NIGHT_SLOTS];

function NewAppointmentContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselectedPatientId = searchParams.get("patientId");
  const preselectedDoctorId = searchParams.get("doctorId");

  const { data: patientsData } = usePatients({ perPage: 100 });
  const { doctors } = useDoctors();

  const [step, setStep] = React.useState<number>(1);
  const [selectedPatient, setSelectedPatient] = React.useState<Patient | null>(null);
  const [selectedDoctor, setSelectedDoctor] = React.useState<Doctor | null>(null);
  const [selectedDate, setSelectedDate] = React.useState<string>(() => new Date().toISOString().split("T")[0]);
  const [selectedSlot, setSelectedSlot] = React.useState<string>("09:00");
  const [visitType, setVisitType] = React.useState<any>("consultation");
  const [complaint, setComplaint] = React.useState<string>("");
  const [patientSearch, setPatientSearch] = React.useState<string>("");
  const [loading, setLoading] = React.useState(false);

  // Handle preselection
  React.useEffect(() => {
    if (preselectedPatientId && patientsData?.data) {
      const found = patientsData.data.find((p) => p.id === preselectedPatientId);
      if (found) {
        setSelectedPatient(found);
        setStep(2);
      }
    }
  }, [preselectedPatientId, patientsData]);

  React.useEffect(() => {
    if (preselectedDoctorId && doctors.length > 0) {
      const found = doctors.find((d) => d.id === preselectedDoctorId);
      if (found) setSelectedDoctor(found);
    }
  }, [preselectedDoctorId, doctors]);

  const filteredPatients = (patientsData?.data || []).filter(
    (p) =>
      p.name.toLowerCase().includes(patientSearch.toLowerCase()) ||
      p.medicalRecordNumber.toLowerCase().includes(patientSearch.toLowerCase()) ||
      (p.nik ? p.nik.includes(patientSearch) : false)
  );

  const handleCreateAppointment = async () => {
    if (!selectedPatient || !selectedDoctor) return;
    setLoading(true);

    try {
      await AppointmentService.createAppointment({
        patientId: selectedPatient.id,
        patientName: selectedPatient.name,
        patientMrn: selectedPatient.medicalRecordNumber,
        patientPhone: selectedPatient.phone,
        patientGender: selectedPatient.gender,
        patientBirthDate: selectedPatient.birthDate,
        patientInsuranceType: selectedPatient.insurance.type,
        doctorId: selectedDoctor.id,
        doctorName: selectedDoctor.name,
        doctorSpecialization: selectedDoctor.specialization,
        departmentId: selectedDoctor.departmentId,
        departmentName: selectedDoctor.departmentName,
        appointmentDate: selectedDate,
        appointmentTime: selectedSlot,
        durationMinutes: 20,
        visitType: visitType,
        complaint: complaint || "Pemeriksaan dan konsultasi rutin",
        status: "scheduled",
      });

      toast.success("Appointment berhasil dijadwalkan!");
      router.push("/appointments");
    } catch {
      toast.error("Gagal membuat appointment.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl pb-12">
      <PageHeader
        title="Buat Appointment Pasien"
        description="Booking jadwal kunjungan pasien dengan alur cepat 5 langkah: Pasien → Poli → Dokter → Slot Jam → Konfirmasi."
      />

      {/* 5-Step Indicator */}
      <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-900 text-xs overflow-x-auto">
        {[
          { num: 1, label: "1. Pasien" },
          { num: 2, label: "2. Dokter" },
          { num: 3, label: "3. Waktu" },
          { num: 4, label: "4. Keluhan" },
          { num: 5, label: "5. Konfirmasi" },
        ].map((s) => (
          <div
            key={s.num}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl font-semibold transition-colors ${
              step === s.num
                ? "bg-teal-50 text-teal-700 dark:bg-teal-950/60 dark:text-teal-300"
                : step > s.num
                ? "text-emerald-600"
                : "text-slate-400"
            }`}
          >
            <span
              className={`flex h-5 w-5 items-center justify-center rounded-full text-[11px] ${
                step === s.num
                  ? "bg-teal-600 text-white"
                  : step > s.num
                  ? "bg-emerald-600 text-white"
                  : "bg-slate-200 text-slate-600 dark:bg-slate-800"
              }`}
            >
              {step > s.num ? "✓" : s.num}
            </span>
            <span className="whitespace-nowrap">{s.label}</span>
          </div>
        ))}
      </div>

      {/* Step 1: Select Patient */}
      {step === 1 && (
        <Card>
          <CardHeader>
            <CardTitle>Langkah 1: Pilih Pasien</CardTitle>
            <CardDescription>Cari nama pasien, No RM, atau NIK terdaftar</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <Input
                type="text"
                placeholder="Ketik nama pasien atau nomor rekam medis..."
                value={patientSearch}
                onChange={(e) => setPatientSearch(e.target.value)}
                className="pl-9"
              />
            </div>

            <div className="max-h-80 overflow-y-auto space-y-2">
              {filteredPatients.slice(0, 6).map((p) => (
                <div
                  key={p.id}
                  onClick={() => {
                    setSelectedPatient(p);
                    setStep(2);
                  }}
                  className={`flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer ${
                    selectedPatient?.id === p.id
                      ? "border-teal-500 bg-teal-50/50 dark:bg-teal-950/30"
                      : "border-slate-200 hover:border-teal-300 dark:border-slate-800"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-teal-600 text-white font-bold text-xs">
                      {p.gender === "male" ? "♂" : "♀"}
                    </div>
                    <div>
                      <p className="font-semibold text-xs text-slate-800 dark:text-slate-200">{p.name}</p>
                      <p className="text-[11px] font-mono text-slate-400">
                        {p.medicalRecordNumber} • NIK: {p.nik} • {p.insurance.type.toUpperCase()}
                      </p>
                    </div>
                  </div>
                  <Button size="sm" variant="ghost" className="h-7 text-xs text-teal-600">
                    Pilih
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 2: Select Doctor */}
      {step === 2 && (
        <Card>
          <CardHeader>
            <CardTitle>Langkah 2: Pilih Dokter Spesialis</CardTitle>
            <CardDescription>
              Pasien: <strong>{selectedPatient?.name}</strong> ({selectedPatient?.medicalRecordNumber})
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {doctors.map((doc) => (
                <div
                  key={doc.id}
                  onClick={() => {
                    setSelectedDoctor(doc);
                    setStep(3);
                  }}
                  className={`p-4 rounded-xl border transition-all cursor-pointer ${
                    selectedDoctor?.id === doc.id
                      ? "border-teal-500 bg-teal-50/50 dark:bg-teal-950/30 shadow-xs"
                      : "border-slate-200 hover:border-teal-300 dark:border-slate-800"
                  }`}
                >
                  <p className="font-bold text-sm text-slate-900 dark:text-slate-100">{doc.name}</p>
                  <p className="text-xs text-teal-700 dark:text-teal-400 font-medium">{doc.specialization}</p>
                  <p className="text-[11px] text-slate-500 mt-1">{doc.departmentName}</p>
                  <div className="mt-2 flex flex-wrap gap-1">
                    {doc.schedules.slice(0, 2).map((sch) => (
                      <span key={sch.id} className="rounded bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 text-[10px] text-slate-600 dark:text-slate-300">
                        {sch.dayName} ({sch.startTime}-{sch.endTime})
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <div className="flex justify-between pt-2">
              <Button variant="outline" size="sm" onClick={() => setStep(1)}>
                <ArrowLeft className="h-3.5 w-3.5 mr-1" /> Kembali
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 3: Select Date & Time Slot */}
      {step === 3 && (
        <Card>
          <CardHeader>
            <CardTitle>Langkah 3: Pilih Tanggal & Slot Jam</CardTitle>
            <CardDescription>
              Dokter: <strong>{selectedDoctor?.name}</strong> ({selectedDoctor?.departmentName})
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Tanggal Kunjungan
                </label>
                <Input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Jenis Kunjungan
                </label>
                <Select value={visitType} onChange={(e) => setVisitType(e.target.value)}>
                  <option value="consultation">Konsultasi Baru</option>
                  <option value="control">Kontrol Pasca Rawat / Rutin</option>
                  <option value="routine_checkup">Medical Check-up</option>
                  <option value="telemedicine">Telekonsultasi Online</option>
                </Select>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Sesi Pagi & Siang (08:00 - 14:30)
                  </label>
                  <span className="text-[11px] text-teal-600 font-medium">Praktik Pagi</span>
                </div>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                  {MORNING_AFTERNOON_SLOTS.map((slot) => (
                    <button
                      key={slot}
                      type="button"
                      onClick={() => setSelectedSlot(slot)}
                      className={`rounded-xl py-2 text-xs font-mono font-semibold transition-all border cursor-pointer ${
                        selectedSlot === slot
                          ? "bg-teal-600 text-white border-teal-600 shadow-xs"
                          : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200"
                      }`}
                    >
                      {slot}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Sesi Sore & Malam (16:30 - 20:00)
                  </label>
                  <span className="text-[11px] text-amber-600 font-medium">Praktik Sore / Malam</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {EVENING_NIGHT_SLOTS.map((slot) => (
                    <button
                      key={slot}
                      type="button"
                      onClick={() => setSelectedSlot(slot)}
                      className={`rounded-xl py-2.5 text-xs font-mono font-semibold transition-all border cursor-pointer ${
                        selectedSlot === slot
                          ? "bg-teal-600 text-white border-teal-600 shadow-xs"
                          : "bg-white text-slate-700 border-slate-200 hover:bg-amber-50/50 hover:border-amber-300 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200"
                      }`}
                    >
                      {slot} WIB
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-between pt-4">
              <Button variant="outline" size="sm" onClick={() => setStep(2)}>
                <ArrowLeft className="h-3.5 w-3.5 mr-1" /> Kembali
              </Button>
              <Button size="sm" onClick={() => setStep(4)}>
                Lanjut <ArrowRight className="h-3.5 w-3.5 ml-1" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 4: Chief Complaint */}
      {step === 4 && (
        <Card>
          <CardHeader>
            <CardTitle>Langkah 4: Keluhan Utama Pasien</CardTitle>
            <CardDescription>Keterangan gejala atau alasan rujukan untuk tim perawat/dokter</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Keluhan yang Dirasakan Pasien
              </label>
              <Textarea
                value={complaint}
                onChange={(e) => setComplaint(e.target.value)}
                placeholder="Contoh: Pusing berputar, leher kaku sejak 2 hari yang lalu, mual muntah..."
                rows={4}
              />
            </div>

            <div className="flex justify-between pt-2">
              <Button variant="outline" size="sm" onClick={() => setStep(3)}>
                <ArrowLeft className="h-3.5 w-3.5 mr-1" /> Kembali
              </Button>
              <Button size="sm" onClick={() => setStep(5)}>
                Tinjau Konfirmasi <ArrowRight className="h-3.5 w-3.5 ml-1" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 5: Confirmation */}
      {step === 5 && (
        <Card>
          <CardHeader>
            <CardTitle>Langkah 5: Konfirmasi Booking Appointment</CardTitle>
            <CardDescription>Pastikan seluruh rincian appointment sudah sesuai sebelum disimpan</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-2xl border border-teal-100 bg-teal-50/50 p-4 dark:border-teal-900/40 dark:bg-teal-950/20 space-y-3 text-xs">
              <div className="flex justify-between pb-2 border-b border-teal-200/40">
                <span className="text-slate-500">Pasien:</span>
                <span className="font-bold text-slate-900 dark:text-slate-100">
                  {selectedPatient?.name} ({selectedPatient?.medicalRecordNumber})
                </span>
              </div>
              <div className="flex justify-between pb-2 border-b border-teal-200/40">
                <span className="text-slate-500">Dokter & Poli:</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  {selectedDoctor?.name} — {selectedDoctor?.departmentName}
                </span>
              </div>
              <div className="flex justify-between pb-2 border-b border-teal-200/40">
                <span className="text-slate-500">Jadwal Praktik:</span>
                <span className="font-mono font-bold text-teal-700 dark:text-teal-300">
                  {formatDate(selectedDate)} pukul {selectedSlot} WIB
                </span>
              </div>
              <div className="flex justify-between pb-2 border-b border-teal-200/40">
                <span className="text-slate-500">Jenis Layanan:</span>
                <span className="capitalize font-medium text-slate-800 dark:text-slate-200">{visitType}</span>
              </div>
              <div className="flex justify-between pb-2 border-b border-teal-200/40">
                <span className="text-slate-500">Penjamin:</span>
                <span className="uppercase font-semibold text-teal-800 dark:text-teal-200">
                  {selectedPatient?.insurance.type}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Keluhan:</span>
                <span className="text-slate-700 dark:text-slate-300 max-w-sm text-right">
                  {complaint || "Konsultasi rutin"}
                </span>
              </div>
            </div>

            <div className="flex justify-between pt-2">
              <Button variant="outline" size="sm" onClick={() => setStep(4)}>
                <ArrowLeft className="h-3.5 w-3.5 mr-1" /> Kembali
              </Button>
              <Button size="sm" onClick={handleCreateAppointment} isLoading={loading} className="gap-1.5 shadow-xs">
                <CheckCircle2 className="h-4 w-4" />
                Konfirmasi & Terbitkan Appointment
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default function NewAppointmentPage() {
  return (
    <React.Suspense
      fallback={
        <div className="flex min-h-[400px] items-center justify-center">
          <div className="flex items-center gap-3 text-sm text-slate-500">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-teal-600 border-t-transparent" />
            Memuat formulir pendaftaran janji temu...
          </div>
        </div>
      }
    >
      <NewAppointmentContent />
    </React.Suspense>
  );
}


