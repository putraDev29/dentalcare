"use client";

import * as React from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  Calendar,
  Edit,
  Stethoscope,
  Clock,
  FileText,
  Pill,
  FlaskConical,
  Scan,
  Receipt,
  AlertTriangle,
  MapPin,
  Phone,
  Mail,
  UserCheck,
  Shield,
  HeartPulse,
  Sparkles,
  Loader2,
  History,
  Bell,
} from "lucide-react";
import { usePatient } from "@/hooks";
import { Encounter, Appointment, Prescription, RadiologyOrder, Invoice } from "@/types";
import { EncounterService, AppointmentService, RadiologyService, BillingService } from "@/services";
import { apiClient } from "@/lib/api/client";
import { API_ENDPOINTS } from "@/lib/api/endpoints";
import { PageHeader } from "@/components/shared/page-header";
import { PatientContextBar } from "@/components/shared/patient-context";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { StatusBadge } from "@/components/shared/status-badge";
import { SkeletonTable } from "@/components/shared/skeleton-table";
import { ErrorState } from "@/components/shared/error-state";
import { formatDate, formatDateTime, formatCurrency, maskNik, maskPhone } from "@/lib/formatting";
import { Odontogram } from "@/components/dental/odontogram";
import { ControlScheduleModal } from "@/components/dental/control-schedule-modal";
import { isHMinusOne } from "@/components/dental/whatsapp-reminder-modal";

export default function PatientDetailPage() {
  const params = useParams();
  const pathnameId = typeof window !== "undefined"
    ? window.location.pathname.replace(/^\/|\/$/g, "").split("/")[1]
    : null;
  const id = (pathnameId && pathnameId !== "patients") ? pathnameId : (params?.id as string);
  const { patient, loading, error, refetch } = usePatient(id);

  // Lazy tab data loading states
  const [activeTab, setActiveTab] = React.useState("overview");
  const [encounters, setEncounters] = React.useState<Encounter[]>([]);
  const [appointments, setAppointments] = React.useState<Appointment[]>([]);
  const [prescriptions, setPrescriptions] = React.useState<Prescription[]>([]);
  const [radiologyOrders, setRadiologyOrders] = React.useState<RadiologyOrder[]>([]);
  const [invoices, setInvoices] = React.useState<Invoice[]>([]);
  const [loadingTab, setLoadingTab] = React.useState<Record<string, boolean>>({});
  const loadedTabs = React.useRef<Record<string, boolean>>({ overview: true });
  const [isBackdateModalOpen, setIsBackdateModalOpen] = React.useState(false);
  const [isControlModalOpen, setIsControlModalOpen] = React.useState(false);

  const reloadEncounters = React.useCallback(() => {
    if (patient?.id) {
      setLoadingTab((prev) => ({ ...prev, encounters: true }));
      EncounterService.getEncounters(patient.id)
        .then((data) => setEncounters(data || []))
        .catch(() => {})
        .finally(() => setLoadingTab((prev) => ({ ...prev, encounters: false })));
    }
  }, [patient?.id]);

  // On-demand fetch when user switches to a tab
  React.useEffect(() => {
    if (!patient?.id) return;

    if ((activeTab === "encounters" || activeTab === "timeline" || activeTab === "odontogram") && !loadedTabs.current["encounters"]) {
      loadedTabs.current["encounters"] = true;
      setLoadingTab((prev) => ({ ...prev, encounters: true }));
      EncounterService.getEncounters(patient.id)
        .then((data) => setEncounters(data || []))
        .catch((err) => console.error("Error loading encounters:", err))
        .finally(() => setLoadingTab((prev) => ({ ...prev, encounters: false })));
    }

    if (activeTab === "appointments" && !loadedTabs.current["appointments"]) {
      loadedTabs.current["appointments"] = true;
      setLoadingTab((prev) => ({ ...prev, appointments: true }));
      AppointmentService.getAppointments(undefined, undefined, undefined, patient.id)
        .then((data) => setAppointments(data || []))
        .catch((err) => console.error("Error loading appointments:", err))
        .finally(() => setLoadingTab((prev) => ({ ...prev, appointments: false })));
    }

    if (activeTab === "prescriptions" && !loadedTabs.current["prescriptions"]) {
      loadedTabs.current["prescriptions"] = true;
      setLoadingTab((prev) => ({ ...prev, prescriptions: true }));
      apiClient
        .get<Prescription[]>(API_ENDPOINTS.prescriptions, { patientId: patient.id })
        .then((data) => setPrescriptions(data || []))
        .catch((err) => console.error("Error loading prescriptions:", err))
        .finally(() => setLoadingTab((prev) => ({ ...prev, prescriptions: false })));
    }

    if (activeTab === "radiology" && !loadedTabs.current["radiology"]) {
      loadedTabs.current["radiology"] = true;
      setLoadingTab((prev) => ({ ...prev, radiology: true }));
      RadiologyService.getOrders()
        .then((data) => setRadiologyOrders((data || []).filter((r) => r.patientId === patient.id)))
        .catch((err) => console.error("Error loading radiology:", err))
        .finally(() => setLoadingTab((prev) => ({ ...prev, radiology: false })));
    }

    if (activeTab === "billing" && !loadedTabs.current["billing"]) {
      loadedTabs.current["billing"] = true;
      setLoadingTab((prev) => ({ ...prev, billing: true }));
      BillingService.getInvoices(undefined, patient.id)
        .then((data) => setInvoices(data || []))
        .catch((err) => console.error("Error loading invoices:", err))
        .finally(() => setLoadingTab((prev) => ({ ...prev, billing: false })));
    }
  }, [activeTab, patient?.id]);

  if (loading) return <SkeletonTable rows={10} columns={3} />;
  if (error || !patient) return <ErrorState message={error || "Pasien tidak ditemukan"} onRetry={refetch} />;

  const patientAppointments = appointments;
  const patientPrescriptions = prescriptions;
  const patientRadiologyOrders = radiologyOrders;
  const patientInvoices = invoices;
  const latestEncOdonto = encounters
    .filter((e) => e.odontogram?.teeth && Object.keys(e.odontogram.teeth).length > 0)
    .sort((a, b) => new Date(b.visitDate || b.createdAt || 0).getTime() - new Date(a.visitDate || a.createdAt || 0).getTime())[0]?.odontogram;
  const patientOdontogram = patient.latestOdontogram || patient.odontogram || latestEncOdonto;

  return (
    <div className="space-y-6">
      {/* Sticky Patient Context Bar */}
      <PatientContextBar
        patient={patient}
        actions={
          <>
            <Button
              variant="outline"
              size="sm"
              className="text-xs gap-1.5 border-teal-300 text-teal-700 bg-teal-50/70 hover:bg-teal-100 dark:border-teal-800 dark:bg-teal-950/40 dark:text-teal-300 shadow-2xs"
              onClick={() => setIsControlModalOpen(true)}
              title="Atur atau ubah jadwal kontrol berikutnya"
            >
              <Calendar className="h-3.5 w-3.5 text-teal-600" />
              <span>Atur Kontrol</span>
            </Button>
            <Link href={`/patients/${patient.id}/edit`}>
              <Button variant="outline" size="sm" className="text-xs gap-1.5">
                <Edit className="h-3.5 w-3.5" />
                <span>Edit Pasien</span>
              </Button>
            </Link>
            <Link href={`/appointments/new?patientId=${patient.id}`}>
              <Button variant="outline" size="sm" className="text-xs gap-1.5">
                <Calendar className="h-3.5 w-3.5" />
                <span>Buat Appointment</span>
              </Button>
            </Link>
            <Link href={`/encounters/new?patientId=${patient.id}&backdate=true`}>
              <Button
                variant="outline"
                size="sm"
                className="text-xs gap-1.5 border-amber-300 text-amber-700 bg-amber-50/80 hover:bg-amber-100 hover:text-amber-800 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-300 cursor-pointer shadow-2xs"
                title="Input data pemeriksaan manual / lampau pasien ini"
              >
                <History className="h-3.5 w-3.5 text-amber-600" />
                <span>Input Backdate</span>
              </Button>
            </Link>
            <Link href={`/encounters/new?patientId=${patient.id}`}>
              <Button size="sm" className="text-xs gap-1.5 shadow-xs">
                <Stethoscope className="h-3.5 w-3.5" />
                <span>Mulai Pemeriksaan</span>
              </Button>
            </Link>
          </>
        }
      />

      {/* 10 Clinical & Operational Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="w-full justify-start overflow-x-auto">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="odontogram">Odontogram Gigi</TabsTrigger>
          <TabsTrigger value="encounters">
            Pemeriksaan Medis {loadedTabs.current["encounters"] ? `(${encounters.length})` : ""}
          </TabsTrigger>
          <TabsTrigger value="timeline">Timeline Kunjungan</TabsTrigger>
          <TabsTrigger value="appointments">
            Janji Temu {loadedTabs.current["appointments"] ? `(${patientAppointments.length})` : ""}
          </TabsTrigger>
          <TabsTrigger value="prescriptions">
            Resep Obat {loadedTabs.current["prescriptions"] ? `(${patientPrescriptions.length})` : ""}
          </TabsTrigger>
          <TabsTrigger value="radiology">
            Rontgen Gigi {loadedTabs.current["radiology"] ? `(${patientRadiologyOrders.length})` : ""}
          </TabsTrigger>
          <TabsTrigger value="billing">
            Tagihan Kasir {loadedTabs.current["billing"] ? `(${patientInvoices.length})` : ""}
          </TabsTrigger>
        </TabsList>

        {/* Tab 1: Overview */}
        <TabsContent value="overview" className="space-y-6">
          {/* Jadwal Kontrol Gigi Banner / Card */}
          <div className="rounded-2xl border border-teal-200 bg-gradient-to-r from-teal-50/70 via-sky-50/50 to-white p-4 shadow-xs dark:border-teal-900/60 dark:from-teal-950/30 dark:via-sky-950/20 dark:bg-slate-900">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-teal-600 text-white shadow-xs">
                  <Calendar className="h-6 w-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-bold text-sm text-slate-800 dark:text-slate-100">
                      Jadwal Kontrol Gigi Pasien
                    </h3>
                    {patient.nextControlDate && isHMinusOne(patient.nextControlDate) && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 border border-emerald-300 px-2 py-0.5 text-xs font-bold text-emerald-800 animate-pulse">
                        <Bell className="h-3 w-3 text-emerald-600" />
                        Besok (H-1) Aktif di Notifikasi
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                    {patient.nextControlDate ? (
                      <>
                        Tanggal: <strong className="text-teal-800 dark:text-teal-300">{formatDate(patient.nextControlDate)}</strong>
                        {patient.controlDoctor && (
                          <> • Dokter DPJP: <span className="font-semibold text-slate-700 dark:text-slate-300">drg. {patient.controlDoctor.replace(/^drg\.?\s*/i, "")}</span></>
                        )}
                      </>
                    ) : (
                      "Belum ada jadwal kontrol yang ditentukan untuk pasien ini. Klik tombol di kanan untuk menentukan tanggal kontrol."
                    )}
                  </p>
                </div>
              </div>

              <Button
                size="sm"
                onClick={() => setIsControlModalOpen(true)}
                className="bg-teal-600 hover:bg-teal-700 text-white text-xs gap-1.5 shadow-2xs font-semibold shrink-0"
              >
                <Calendar className="h-3.5 w-3.5" />
                <span>{patient.nextControlDate ? "Ubah Jadwal Kontrol" : "+ Tentukan Jadwal Kontrol"}</span>
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {/* Info Pribadi & Kependudukan */}
            <Card>
              <CardHeader>
                <CardTitle>Identitas Kependudukan</CardTitle>
                <CardDescription>Data NIK, tanggal lahir, dan status kependudukan</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 text-xs">
                <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-slate-500">Nomor Rekam Medis (RM)</span>
                  <span className="font-mono font-bold text-teal-700 dark:text-teal-400">{patient.medicalRecordNumber}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-slate-500">NIK (KTP)</span>
                  <span className="font-mono font-semibold text-slate-800 dark:text-slate-200">{maskNik(patient.nik)}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-slate-500">Tempat, Tanggal Lahir</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">{patient.birthPlace}, {formatDate(patient.birthDate)}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-slate-500">Agama</span>
                  <span className="text-slate-800 dark:text-slate-200">{patient.religion || "-"}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-slate-500">Status Pernikahan</span>
                  <span className="capitalize text-slate-800 dark:text-slate-200">{patient.maritalStatus || "-"}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-500">Pekerjaan</span>
                  <span className="text-slate-800 dark:text-slate-200">{patient.occupation || "-"}</span>
                </div>
              </CardContent>
            </Card>

            {/* Kontak & Domisili */}
            <Card>
              <CardHeader>
                <CardTitle>Kontak & Alamat Domisili</CardTitle>
                <CardDescription>Nomor telepon yang dapat dihubungi dan lokasi tempat tinggal</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 text-xs">
                <div className="flex items-center gap-2 py-1 border-b border-slate-100 dark:border-slate-800">
                  <Phone className="h-4 w-4 text-slate-400" />
                  <span className="text-slate-500 w-24">No. Telepon:</span>
                  <span className="font-mono font-semibold text-slate-800 dark:text-slate-200">{maskPhone(patient.phone)}</span>
                </div>
                <div className="flex items-center gap-2 py-1 border-b border-slate-100 dark:border-slate-800">
                  <Mail className="h-4 w-4 text-slate-400" />
                  <span className="text-slate-500 w-24">Email:</span>
                  <span className="text-slate-800 dark:text-slate-200">{patient.email || "-"}</span>
                </div>
                <div className="flex items-start gap-2 py-1">
                  <MapPin className="h-4 w-4 text-slate-400 mt-0.5 shrink-0" />
                  <div>
                    <span className="text-slate-500">Alamat Lengkap:</span>
                    <p className="font-medium text-slate-800 dark:text-slate-200 mt-0.5 leading-relaxed">
                      {patient.address.street} {patient.address.rtRw ? `RT/RW ${patient.address.rtRw}` : ""},{" "}
                      {patient.address.subDistrict ? `Kel. ${patient.address.subDistrict}, ` : ""}
                      {patient.address.district ? `Kec. ${patient.address.district}, ` : ""}
                      {patient.address.city}, {patient.address.province}{" "}
                      {patient.address.postalCode}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Penjamin & Asuransi */}
            <Card>
              <CardHeader>
                <CardTitle>Penjamin & Asuransi</CardTitle>
                <CardDescription>Status kepesertaan penjaminan biaya kesehatan</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 text-xs">
                <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-slate-500">Jenis Penjamin</span>
                  <span className="font-bold uppercase text-teal-700 dark:text-teal-400">{patient.insurance.type}</span>
                </div>
                {patient.insurance.providerName && (
                  <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                    <span className="text-slate-500">Nama Provider Asuransi</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">{patient.insurance.providerName}</span>
                  </div>
                )}
                {patient.insurance.policyNumber && (
                  <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                    <span className="text-slate-500">Nomor Polis / Kartu</span>
                    <span className="font-mono text-slate-800 dark:text-slate-200">{patient.insurance.policyNumber}</span>
                  </div>
                )}
                {patient.insurance.bpjsClass && (
                  <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                    <span className="text-slate-500">Hak Kelas Rawat BPJS</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">Kelas {patient.insurance.bpjsClass}</span>
                  </div>
                )}
                {patient.insurance.primaryClinic && (
                  <div className="flex justify-between py-1">
                    <span className="text-slate-500">Faskes Primer (FKTP)</span>
                    <span className="text-slate-800 dark:text-slate-200">{patient.insurance.primaryClinic}</span>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Kontak Darurat & Alergi */}
            <Card>
              <CardHeader>
                <CardTitle>Penanggung Jawab & Keamanan Medis</CardTitle>
                <CardDescription>Kontak darurat serta riwayat alergi dan penyakit kronis</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 text-xs">
                <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-slate-500">Nama Penanggung Jawab</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">{patient.emergencyContact?.name || "-"}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-slate-500">Hubungan Keluarga</span>
                  <span className="text-slate-800 dark:text-slate-200">{patient.emergencyContact?.relationship || "-"}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-slate-500">No. HP Penanggung Jawab</span>
                  <span className="font-mono font-semibold text-slate-800 dark:text-slate-200">{patient.emergencyContact?.phone || "-"}</span>
                </div>
                <div className="py-1 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-slate-500 block mb-1">Riwayat Alergi:</span>
                  {patient.allergies && patient.allergies.length > 0 ? (
                    <div className="flex flex-wrap gap-1.5">
                      {patient.allergies.map((al) => (
                        <span key={al} className="rounded-md bg-rose-50 border border-rose-200 px-2 py-0.5 text-[11px] font-semibold text-rose-700">
                          {al}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <span className="text-slate-400">Tidak ada riwayat alergi</span>
                  )}
                </div>
                <div className="py-1">
                  <span className="text-slate-500 block mb-1">Penyakit Kronis:</span>
                  {patient.chronicDiseases && patient.chronicDiseases.length > 0 ? (
                    <div className="flex flex-wrap gap-1.5">
                      {patient.chronicDiseases.map((cd) => (
                        <span key={cd} className="rounded-md bg-amber-50 border border-amber-200 px-2 py-0.5 text-[11px] font-semibold text-amber-700">
                          {cd}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <span className="text-slate-400">Tidak ada riwayat penyakit kronis</span>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Tab: Odontogram Gigi */}
        <TabsContent value="odontogram" className="space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div>
                <CardTitle>Diagram Rekam Gigi (Odontogram)</CardTitle>
                <CardDescription>
                  Peta visual status anatomi gigi standar FDI 2-digit, karies, tambalan, dan riwayat tindakan
                </CardDescription>
              </div>
              <Link href={`/encounters/new?patientId=${patient.id}`}>
                <Button size="sm" className="text-xs gap-1.5 shadow-xs">
                  <Stethoscope className="h-3.5 w-3.5" />
                  <span>Buka Odontogram Dokter</span>
                </Button>
              </Link>
            </CardHeader>
            <CardContent className="pt-2">
              <Odontogram
                readOnly={true}
                value={patientOdontogram}
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 2: Timeline Kunjungan */}
        <TabsContent value="timeline" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Timeline Rekam Medis Pasien</CardTitle>
              <CardDescription>Riwayat kunjungan, pemeriksaan dokter, tindakan, dan resep obat secara kronologis</CardDescription>
            </CardHeader>
            <CardContent>
              {loadingTab["encounters"] ? (
                <div className="flex items-center justify-center p-8 text-slate-500">
                  <Loader2 className="h-5 w-5 animate-spin mr-2 text-teal-600" />
                  <span>Memuat timeline kunjungan...</span>
                </div>
              ) : encounters.length > 0 ? (
                <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-800">
                  {encounters.map((enc) => (
                    <div key={enc.id} className="relative group">
                      <div className="absolute -left-[27px] top-1 h-3.5 w-3.5 rounded-full border-2 border-white bg-teal-600 shadow-xs dark:border-slate-900" />
                      <div className="rounded-2xl border border-slate-200/80 bg-slate-50/50 p-4 transition-all hover:bg-white hover:shadow-xs dark:border-slate-800 dark:bg-slate-800/40">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 border-b border-slate-100 pb-2.5 dark:border-slate-800">
                          <div>
                            <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
                              {formatDate(enc.visitDate)} • Rawat Jalan ({enc.departmentName})
                            </span>
                            <p className="text-[11px] text-teal-700 dark:text-teal-400 font-medium">
                              DPJP: {enc.doctorName}
                            </p>
                          </div>
                          <Link href={`/encounters/${enc.id}?patientId=${patient.id}`}>
                            <Button variant="outline" size="sm" className="text-xs h-7">
                              Lihat Encounter
                            </Button>
                          </Link>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 text-xs">
                          <div>
                            <p className="font-semibold text-slate-500">Keluhan / Anamnesis:</p>
                            <p className="text-slate-700 dark:text-slate-300 mt-0.5">{enc.anamnesis?.chiefComplaint || "-"}</p>
                          </div>
                          <div>
                            <p className="font-semibold text-slate-500">Diagnosis (ICD-10):</p>
                            {(enc.diagnoses || []).length > 0 ? (
                              enc.diagnoses.map((d, dIdx) => (
                                <p key={d.id || d.code || dIdx} className="text-slate-800 font-medium dark:text-slate-200 mt-0.5">
                                  <span className="font-mono text-teal-600 mr-1">[{d.code}]</span> {d.name}
                                </p>
                              ))
                            ) : (
                              <p className="text-slate-400 mt-0.5">-</p>
                            )}
                          </div>
                          <div>
                            <p className="font-semibold text-slate-500">Resep Terapi Obat:</p>
                            {(enc.prescriptions || (enc as any).followUpPlan?.prescriptions || []).length > 0 ? (
                              (enc.prescriptions || (enc as any).followUpPlan?.prescriptions || []).map((rx: any, rIdx: number) => (
                                <p key={rx.id || rx.medicineName || rIdx} className="text-slate-700 dark:text-slate-300 mt-0.5">
                                  • {rx.medicineName} {rx.frequency ? `(${rx.frequency})` : ""}
                                </p>
                              ))
                            ) : (
                              <p className="text-slate-400 mt-0.5">-</p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-400">Belum ada riwayat kunjungan rekam medis sebelumnya.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 3: Encounters */}
        <TabsContent value="encounters">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Daftar Pemeriksaan Klinis (Encounters)</CardTitle>
                <CardDescription>Semua rekam sesi konsultasi dengan dokter spesialis & umum</CardDescription>
              </div>
              <Link href={`/encounters/new?patientId=${patient.id}&backdate=true`}>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-xs gap-1.5 border-amber-300 text-amber-700 bg-amber-50 hover:bg-amber-100 hover:text-amber-800 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-300 cursor-pointer shadow-2xs"
                >
                  <History className="h-3.5 w-3.5 text-amber-600" />
                  <span>+ Input Pemeriksaan Backdate</span>
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              {loadingTab["encounters"] ? (
                <div className="flex items-center justify-center p-8 text-slate-500">
                  <Loader2 className="h-5 w-5 animate-spin mr-2 text-teal-600" />
                  <span>Memuat rekam pemeriksaan...</span>
                </div>
              ) : encounters.length > 0 ? (
                <div className="space-y-3">
                  {encounters.map((enc) => (
                    <div key={enc.id} className="flex items-center justify-between rounded-xl border border-slate-200 p-4 dark:border-slate-800">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-semibold text-teal-700">{enc.encounterNumber}</span>
                          <span className="text-xs font-bold text-slate-800 dark:text-slate-200">{enc.departmentName}</span>
                          <span className="text-xs text-slate-400">• {formatDate(enc.visitDate)}</span>
                        </div>
                        <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                          Dokter: <strong>{enc.doctorName}</strong> | Diagnosa:{" "}
                          {(enc.diagnoses || []).map((d) => `[${d.code}] ${d.name}`).join(", ") || "-"}
                        </p>
                      </div>
                      <Link href={`/encounters/${enc.id}?patientId=${patient.id}`}>
                        <Button variant="outline" size="sm" className="text-xs">
                          Buka Rekam Medis
                        </Button>
                      </Link>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-400">Belum ada pemeriksaan medis.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 4: Appointments */}
        <TabsContent value="appointments">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Riwayat & Rencana Appointment</CardTitle>
                <CardDescription>Daftar jadwal perjanjian temu dokter pasien</CardDescription>
              </div>
              <Link href={`/appointments/new?patientId=${patient.id}`}>
                <Button size="sm" className="text-xs">+ Booking Appointment</Button>
              </Link>
            </CardHeader>
            <CardContent>
              {loadingTab["appointments"] ? (
                <div className="flex items-center justify-center p-8 text-slate-500">
                  <Loader2 className="h-5 w-5 animate-spin mr-2 text-teal-600" />
                  <span>Memuat riwayat janji temu...</span>
                </div>
              ) : patientAppointments.length > 0 ? (
                <div className="space-y-3">
                  {patientAppointments.map((apt) => (
                    <div key={apt.id} className="flex items-center justify-between rounded-xl border border-slate-200 p-3.5 text-xs dark:border-slate-800">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-teal-700">{apt.appointmentNumber}</span>
                          <span className="font-semibold text-slate-800 dark:text-slate-200">{apt.departmentName}</span>
                        </div>
                        <p className="text-slate-500 mt-0.5">
                          {formatDate(apt.appointmentDate)} pukul {apt.appointmentTime} WIB • DPJP: {apt.doctorName}
                        </p>
                      </div>
                      <StatusBadge type="appointment" status={apt.status} />
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-400">Belum ada appointment yang dibuat.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 5: Resep Obat */}
        <TabsContent value="prescriptions">
          <Card>
            <CardHeader>
              <CardTitle>Resep & Riwayat Pengobatan</CardTitle>
              <CardDescription>Resep farmasi yang diresepkan oleh dokter</CardDescription>
            </CardHeader>
            <CardContent>
              {loadingTab["prescriptions"] ? (
                <div className="flex items-center justify-center p-8 text-slate-500">
                  <Loader2 className="h-5 w-5 animate-spin mr-2 text-teal-600" />
                  <span>Memuat resep obat...</span>
                </div>
              ) : patientPrescriptions.length > 0 ? (
                <div className="space-y-4">
                  {patientPrescriptions.map((rx) => (
                    <div key={rx.id} className="rounded-xl border border-slate-200 p-4 text-xs dark:border-slate-800 space-y-2">
                      <div className="flex items-center justify-between border-b border-slate-100 pb-2 dark:border-slate-800">
                        <div>
                          <span className="font-mono font-bold text-teal-700 mr-2">{rx.prescriptionNumber}</span>
                          <span className="text-slate-500">dr. {rx.doctorName}</span>
                        </div>
                        <StatusBadge type="prescription" status={rx.status} />
                      </div>
                      <div className="space-y-1.5 pt-1">
                        {rx.items.map((item) => (
                          <div key={item.id} className="flex items-center justify-between text-slate-700 dark:text-slate-300">
                            <div>
                              <span className="font-semibold">{item.medicineName}</span> — {item.dosage} ({item.frequency}, {item.instruction})
                            </div>
                            <span className="font-mono text-slate-500">Qty: {item.quantity}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-400">Belum ada resep obat tercatat.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 6: Rontgen Gigi (Radiology) */}
        <TabsContent value="radiology">
          <Card>
            <CardHeader>
              <CardTitle>Hasil Foto Rontgen Gigi (Dental X-Ray)</CardTitle>
              <CardDescription>Pemeriksaan radiologi dental: Foto Panoramik (OPG) & Periapikal intraoral</CardDescription>
            </CardHeader>
            <CardContent>
              {loadingTab["radiology"] ? (
                <div className="flex items-center justify-center p-8 text-slate-500">
                  <Loader2 className="h-5 w-5 animate-spin mr-2 text-teal-600" />
                  <span>Memuat data foto rontgen...</span>
                </div>
              ) : patientRadiologyOrders.length > 0 ? (
                <div className="space-y-4">
                  {patientRadiologyOrders.map((rad) => (
                    <div key={rad.id} className="rounded-xl border border-slate-200 p-4 text-xs dark:border-slate-800 space-y-3">
                      <div className="flex items-center justify-between border-b border-slate-100 pb-2 dark:border-slate-800">
                        <div>
                          <span className="font-mono font-bold text-teal-700 mr-2">{rad.orderNumber}</span>
                          <span className="font-semibold text-slate-800 dark:text-slate-200">{rad.examinationName}</span>
                          <span className="text-slate-400 ml-2">({formatDateTime(rad.orderDate)})</span>
                        </div>
                        <span className="rounded-full bg-emerald-50 text-emerald-700 px-2 py-0.5 text-[10px] font-semibold uppercase">
                          {rad.status}
                        </span>
                      </div>
                      <div className="space-y-2">
                        <div className="rounded-lg bg-slate-50 p-2.5 dark:bg-slate-800/50">
                          <p className="font-medium text-slate-500">Indikasi Klinis:</p>
                          <p className="text-slate-800 dark:text-slate-200">{rad.clinicalIndication}</p>
                        </div>
                        {rad.findings && (
                          <div className="rounded-lg bg-teal-50/50 border border-teal-100 p-2.5 dark:bg-teal-950/20 dark:border-teal-900/50">
                            <p className="font-semibold text-teal-900 dark:text-teal-300">Hasil Interpretasi Radiologi Gigi:</p>
                            <p className="text-slate-700 dark:text-slate-300 mt-0.5">{rad.findings}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-400">Belum ada data foto rontgen gigi.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 7: Billing */}
        <TabsContent value="billing">
          <Card>
            <CardHeader>
              <CardTitle>Tagihan & Transaksi Pembayaran</CardTitle>
              <CardDescription>Riwayat invoice dan pelunasan kasir</CardDescription>
            </CardHeader>
            <CardContent>
              {loadingTab["billing"] ? (
                <div className="flex items-center justify-center p-8 text-slate-500">
                  <Loader2 className="h-5 w-5 animate-spin mr-2 text-teal-600" />
                  <span>Memuat riwayat invoice...</span>
                </div>
              ) : patientInvoices.length > 0 ? (
                <div className="space-y-3">
                  {patientInvoices.map((inv) => (
                    <div key={inv.id} className="flex items-center justify-between rounded-xl border border-slate-200 p-4 text-xs dark:border-slate-800">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-teal-700">{inv.invoiceNumber}</span>
                          <span className="text-slate-400">{formatDate(inv.invoiceDate)}</span>
                        </div>
                        <p className="text-slate-700 dark:text-slate-300 font-semibold mt-1">
                          Total: {formatCurrency(inv.totalAmount)} | Dijamin: {formatCurrency(inv.insuranceCoverage)} | Bayar Pasien: {formatCurrency(inv.patientResponsibility)}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <StatusBadge type="invoice" status={inv.status} />
                        <Link href={`/billing`}>
                          <Button variant="outline" size="sm" className="h-7 text-xs">
                            Detail Invoice
                          </Button>
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-400">Belum ada riwayat tagihan.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Control Schedule Modal */}
      <ControlScheduleModal
        open={isControlModalOpen}
        onOpenChange={setIsControlModalOpen}
        patient={patient}
        onSuccess={() => {
          refetch();
          if (typeof window !== "undefined") {
            window.dispatchEvent(new CustomEvent("refresh-notifications"));
          }
        }}
      />
    </div>
  );
}

