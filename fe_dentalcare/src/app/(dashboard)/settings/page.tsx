"use client";

import * as React from "react";
import {
  Building2,
  Clock,
  Hash,
  Share2,
  Database,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  ShieldCheck,
  Save,
  Server,
  Activity,
  Send,
  Zap,
} from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { useHospitalProfile } from "@/hooks";
import { toast } from "sonner";

export default function SettingsPage() {
  const { profile, loading, updateProfile, resetDemoData } = useHospitalProfile();

  // Profile Form State
  const [formData, setFormData] = React.useState({
    name: "",
    code: "",
    type: "",
    accreditation: "",
    licenseNumber: "",
    taxId: "",
    phone: "",
    email: "",
    website: "",
    address: "",
    city: "",
    province: "",
    postalCode: "",
    directorName: "",
  });

  // Operational settings state
  const [operational, setOperational] = React.useState({
    registrationOpen: "07:00",
    registrationClose: "20:00",
    emergency24h: true,
    defaultQuota: 30,
    cancellationHours: 2,
    autoAudioQueue: true,
  });

  // Numbering settings state
  const [numbering, setNumbering] = React.useState({
    mrnPrefix: "RM-{YYYY}{MM}-{XXXX}",
    regPrefix: "REG-{YYYY}{MM}{DD}-{XXXX}",
    queuePrefix: "{POLI}-{000}",
    rxPrefix: "RX-{YYYYMM}-{XXXX}",
    invPrefix: "INV-{YYYYMMDD}-{XXXX}",
  });

  // Integrations state
  const [integrations, setIntegrations] = React.useState({
    bpjsMode: "sandbox",
    bpjsConsId: "29841",
    bpjsSecretKey: "••••••••••••8391",
    bpjsUserKey: "••••••••••••9941",
    satusehatOrgId: "10084729104",
    satusehatClientId: "client_medika_prod_992",
    satusehatClientSecret: "••••••••••••••••",
    waProvider: "fonnte",
    waToken: "••••••••••••881a",
    waPhone: "081299881122",
  });

  const [testingBpjs, setTestingBpjs] = React.useState(false);
  const [bpjsStatus, setBpjsStatus] = React.useState<string | null>("Tersambung (Sandbox - Latency: 42ms)");
  const [testingSatusehat, setTestingSatusehat] = React.useState(false);
  const [satusehatStatus, setSatusehatStatus] = React.useState<string | null>("Terverifikasi (KYC Lulus - FHIR R4)");
  const [testingWa, setTestingWa] = React.useState(false);

  // Reset confirmation modal
  const [isResetDialogOpen, setIsResetDialogOpen] = React.useState(false);
  const [isResetting, setIsResetting] = React.useState(false);
  const [isSavingProfile, setIsSavingProfile] = React.useState(false);

  // Sync profile data when loaded
  React.useEffect(() => {
    if (profile) {
      setFormData({
        name: profile.name || "",
        code: profile.code || "",
        type: profile.type || "",
        accreditation: profile.accreditation || "",
        licenseNumber: profile.licenseNumber || "",
        taxId: profile.taxId || "",
        phone: profile.phone || "",
        email: profile.email || "",
        website: profile.website || "",
        address: profile.address || "",
        city: profile.city || "",
        province: profile.province || "",
        postalCode: profile.postalCode || "",
        directorName: profile.directorName || "",
      });
    }
  }, [profile]);

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingProfile(true);
    try {
      await updateProfile(formData);
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("hospital-profile-updated", { detail: formData }));
      }
      toast.success("Profil klinik gigi berhasil disimpan & nama klinik di sidebar diperbarui!");
    } catch {
      toast.error("Gagal menyimpan profil klinik gigi.");
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleSaveOperational = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Konfigurasi operasional berhasil disimpan!");
  };

  const handleSaveNumbering = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Format penomoran dokumen berhasil diperbarui!");
  };

  const handleTestBpjs = async () => {
    setTestingBpjs(true);
    setBpjsStatus(null);
    setTimeout(() => {
      setTestingBpjs(false);
      setBpjsStatus("Tersambung (Sandbox - Latency: 38ms - HTTP 200 OK)");
      toast.success("Koneksi BPJS VClaim & PCare berhasil diverifikasi!");
    }, 1200);
  };

  const handleTestSatusehat = async () => {
    setTestingSatusehat(true);
    setSatusehatStatus(null);
    setTimeout(() => {
      setTestingSatusehat(false);
      setSatusehatStatus("Terhubung ke SATUSEHAT Cloud Kemenkes (FHIR R4 Auth OK)");
      toast.success("Endpoint SATUSEHAT Kemenkes aktif & terverifikasi!");
    }, 1400);
  };

  const handleTestWa = async () => {
    setTestingWa(true);
    setTimeout(() => {
      setTestingWa(false);
      toast.success("Pesan tes WhatsApp berhasil dikirim ke nomor administrator!");
    }, 1000);
  };

  const handleConfirmResetDemo = async () => {
    setIsResetting(true);
    try {
      await resetDemoData();
      toast.success("Seluruh data demo berhasil direset ke status awal pabrik!");
      setIsResetDialogOpen(false);
    } catch {
      toast.error("Gagal mereset data demo.");
    } finally {
      setIsResetting(false);
    }
  };

  const dataSource = process.env.NEXT_PUBLIC_DATA_SOURCE || "mock";

  return (
    <div className="space-y-6">
      <PageHeader
        title="Pengaturan Klinik Gigi"
        badge={
          <Badge variant="outline" className="border-sky-300 bg-sky-50 text-sky-700 dark:border-sky-800 dark:bg-sky-950/50 dark:text-sky-300">
            OKAY Dental v2.0
          </Badge>
        }
      />

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="grid grid-cols-2 sm:grid-cols-5 w-full h-auto p-1.5 gap-1 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <TabsTrigger value="profile" className="flex items-center gap-2 py-2">
            <Building2 className="h-4 w-4" />
            <span className="truncate">Profil Faskes</span>
          </TabsTrigger>
          <TabsTrigger value="operational" className="flex items-center gap-2 py-2">
            <Clock className="h-4 w-4" />
            <span className="truncate">Operasional</span>
          </TabsTrigger>
          <TabsTrigger value="numbering" className="flex items-center gap-2 py-2">
            <Hash className="h-4 w-4" />
            <span className="truncate">Penomoran</span>
          </TabsTrigger>
          <TabsTrigger value="integrations" className="flex items-center gap-2 py-2">
            <Share2 className="h-4 w-4" />
            <span className="truncate">Integrasi</span>
          </TabsTrigger>
          <TabsTrigger value="demo" className="flex items-center gap-2 py-2">
            <Database className="h-4 w-4" />
            <span className="truncate">Data & Demo</span>
          </TabsTrigger>
        </TabsList>

        {/* ==================================================== */}
        {/* TAB 1: PROFIL FASKES */}
        {/* ==================================================== */}
        <TabsContent value="profile">
          <form onSubmit={handleSaveProfile} className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Identitas Klinik Gigi / Fasilitas Pelayanan Dental</CardTitle>
                    <CardDescription>
                      Informasi resmi klinik gigi yang tercetak pada kuitansi kasir dental, e-resep dokter gigi, dan berkas rekam medis odontogram.
                    </CardDescription>
                  </div>
                  <Badge variant="subtle" className="hidden sm:inline-flex">
                    Kode Faskes: {formData.code || "RSMU-01"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Nama Fasilitas Kesehatan <span className="text-rose-500">*</span>
                    </label>
                    <Input
                      name="name"
                      value={formData.name}
                      onChange={handleProfileChange}
                      placeholder="e.g. RS Medika Utama Sejahtera"
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Tipe / Klasifikasi Rumah Sakit
                    </label>
                    <Input
                      name="type"
                      value={formData.type}
                      onChange={handleProfileChange}
                      placeholder="e.g. Rumah Sakit Umum Tipe B"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Status Akreditasi
                    </label>
                    <Input
                      name="accreditation"
                      value={formData.accreditation}
                      onChange={handleProfileChange}
                      placeholder="e.g. KARS Paripurna (Bintang Lima)"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Nomor Izin Operasional
                    </label>
                    <Input
                      name="licenseNumber"
                      value={formData.licenseNumber}
                      onChange={handleProfileChange}
                      placeholder="e.g. 445/098/IZIN-RS/DINKES/2023"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      NPWP Badan Rumah Sakit
                    </label>
                    <Input
                      name="taxId"
                      value={formData.taxId}
                      onChange={handleProfileChange}
                      placeholder="e.g. 01.345.678.9-012.000"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Direktur Utama / Penanggung Jawab
                    </label>
                    <Input
                      name="directorName"
                      value={formData.directorName}
                      onChange={handleProfileChange}
                      placeholder="e.g. dr. Budi Rahardjo, Sp.B, MARS"
                    />
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                  <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-200 mb-3">
                    Kontak & Alamat Lokasi
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                        Nomor Telepon Hunting
                      </label>
                      <Input
                        name="phone"
                        value={formData.phone}
                        onChange={handleProfileChange}
                        placeholder="+62 21 555-7890"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                        Email Resmi
                      </label>
                      <Input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleProfileChange}
                        placeholder="kontak@rsmedikautama.co.id"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                        Website Portal
                      </label>
                      <Input
                        name="website"
                        value={formData.website}
                        onChange={handleProfileChange}
                        placeholder="https://rsmedikautama.co.id"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-3">
                    <div className="md:col-span-2 space-y-1.5">
                      <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                        Alamat Lengkap
                      </label>
                      <Input
                        name="address"
                        value={formData.address}
                        onChange={handleProfileChange}
                        placeholder="Jl. Jenderal Sudirman Kav. 52-53, Senayan"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                        Kota / Kabupaten
                      </label>
                      <Input
                        name="city"
                        value={formData.city}
                        onChange={handleProfileChange}
                        placeholder="Jakarta Selatan"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                        Kode Pos
                      </label>
                      <Input
                        name="postalCode"
                        value={formData.postalCode}
                        onChange={handleProfileChange}
                        placeholder="12190"
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-end gap-3 border-t border-slate-100 dark:border-slate-800 pt-4">
                <Button type="submit" variant="primary" isLoading={isSavingProfile} disabled={loading}>
                  <Save className="h-4 w-4" />
                  Simpan Perubahan Profil
                </Button>
              </CardFooter>
            </Card>
          </form>
        </TabsContent>

        {/* ==================================================== */}
        {/* TAB 2: OPERASIONAL */}
        {/* ==================================================== */}
        <TabsContent value="operational">
          <form onSubmit={handleSaveOperational} className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Jam Kerja & Kebijakan Antrean</CardTitle>
                <CardDescription>
                  Atur alokasi kuota kunjungan poliklinik, jam pendaftaran mandiri, dan integrasi audio pemanggilan.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
                    <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                      Waktu Registrasi Rawat Jalan
                    </h4>
                    <p className="text-xs text-slate-500">
                      Jam operasional loket pendaftaran rawat jalan dan check-in antrean mandiri (KiosK).
                    </p>
                    <div className="grid grid-cols-2 gap-3 pt-2">
                      <div className="space-y-1">
                        <label className="text-xs font-medium text-slate-600 dark:text-slate-400">
                          Buka Pukul
                        </label>
                        <Input
                          type="time"
                          value={operational.registrationOpen}
                          onChange={(e) =>
                            setOperational((prev) => ({ ...prev, registrationOpen: e.target.value }))
                          }
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-medium text-slate-600 dark:text-slate-400">
                          Tutup Pukul
                        </label>
                        <Input
                          type="time"
                          value={operational.registrationClose}
                          onChange={(e) =>
                            setOperational((prev) => ({ ...prev, registrationClose: e.target.value }))
                          }
                        />
                      </div>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
                    <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                      Instalasi Gawat Darurat (IGD)
                    </h4>
                    <p className="text-xs text-slate-500">
                      IGD beroperasi terus-menerus dengan triage otomatis 24 jam nonstop.
                    </p>
                    <div className="pt-2 flex items-center justify-between">
                      <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                        Layanan IGD 24 Jam
                      </span>
                      <Badge variant="subtle" className="bg-emerald-50 text-emerald-700 border-emerald-300">
                        Selalu Aktif
                      </Badge>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
                    <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                      Kuota Antrean Poliklinik
                    </h4>
                    <p className="text-xs text-slate-500">
                      Batas maksimal pasien yang dapat memesan janji temu per shift praktek dokter.
                    </p>
                    <div className="pt-1">
                      <div className="flex items-center gap-3">
                        <Input
                          type="number"
                          value={operational.defaultQuota}
                          onChange={(e) =>
                            setOperational((prev) => ({
                              ...prev,
                              defaultQuota: parseInt(e.target.value) || 0,
                            }))
                          }
                          className="w-32"
                        />
                        <span className="text-sm text-slate-600 dark:text-slate-400">
                          pasien / shift praktek
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
                    <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                      Batas Waktu Pembatalan
                    </h4>
                    <p className="text-xs text-slate-500">
                      Batas minimal jam bagi pasien untuk membatalkan janji sebelum jadwal kunjungan.
                    </p>
                    <div className="pt-1">
                      <div className="flex items-center gap-3">
                        <Input
                          type="number"
                          value={operational.cancellationHours}
                          onChange={(e) =>
                            setOperational((prev) => ({
                              ...prev,
                              cancellationHours: parseInt(e.target.value) || 0,
                            }))
                          }
                          className="w-32"
                        />
                        <span className="text-sm text-slate-600 dark:text-slate-400">
                          jam sebelum jadwal
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-end gap-3 border-t border-slate-100 dark:border-slate-800 pt-4">
                <Button type="submit" variant="primary">
                  <Save className="h-4 w-4" />
                  Simpan Konfigurasi Operasional
                </Button>
              </CardFooter>
            </Card>
          </form>
        </TabsContent>

        {/* ==================================================== */}
        {/* TAB 3: PENOMORAN DOKUMEN */}
        {/* ==================================================== */}
        <TabsContent value="numbering">
          <form onSubmit={handleSaveNumbering} className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Format & Prefix Penomoran Dokumen Otomatis</CardTitle>
                <CardDescription>
                  Skema penomoran rekam medis (MRN), registrasi kunjungan, antrean, resep farmasi, dan kuitansi pembayaran.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* MRN */}
                  <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                        Nomor Rekam Medis (No. RM)
                      </span>
                      <Badge variant="subtle" className="text-xs font-mono">
                        Contoh: RM-202609-0042
                      </Badge>
                    </div>
                    <Input
                      value={numbering.mrnPrefix}
                      onChange={(e) =>
                        setNumbering((prev) => ({ ...prev, mrnPrefix: e.target.value }))
                      }
                      className="font-mono text-sm"
                    />
                    <p className="text-[11px] text-slate-500">
                      Gunakan token <code className="text-teal-600 font-semibold">&#123;YYYY&#125;</code>, <code className="text-teal-600 font-semibold">&#123;MM&#125;</code>, <code className="text-teal-600 font-semibold">&#123;XXXX&#125;</code>.
                    </p>
                  </div>

                  {/* Registrasi */}
                  <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                        Nomor Registrasi Kunjungan
                      </span>
                      <Badge variant="subtle" className="text-xs font-mono">
                        Contoh: REG-20260916-0012
                      </Badge>
                    </div>
                    <Input
                      value={numbering.regPrefix}
                      onChange={(e) =>
                        setNumbering((prev) => ({ ...prev, regPrefix: e.target.value }))
                      }
                      className="font-mono text-sm"
                    />
                    <p className="text-[11px] text-slate-500">
                      Diperbarui setiap hari dengan sequence reset harian.
                    </p>
                  </div>

                  {/* Antrean */}
                  <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                        Nomor Antrean Poliklinik
                      </span>
                      <Badge variant="subtle" className="text-xs font-mono">
                        Contoh: POL-A014
                      </Badge>
                    </div>
                    <Input
                      value={numbering.queuePrefix}
                      onChange={(e) =>
                        setNumbering((prev) => ({ ...prev, queuePrefix: e.target.value }))
                      }
                      className="font-mono text-sm"
                    />
                    <p className="text-[11px] text-slate-500">
                      Menggabungkan kode departemen poliklinik dan urutan angka antrean.
                    </p>
                  </div>

                  {/* Resep */}
                  <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                        Nomor Resep Dokter (R/)
                      </span>
                      <Badge variant="subtle" className="text-xs font-mono">
                        Contoh: RX-2026-0001
                      </Badge>
                    </div>
                    <Input
                      value={numbering.rxPrefix}
                      onChange={(e) =>
                        setNumbering((prev) => ({ ...prev, rxPrefix: e.target.value }))
                      }
                      className="font-mono text-sm"
                    />
                    <p className="text-[11px] text-slate-500">
                      Identitas unik peresepan elektronik E-Prescription untuk farmasi.
                    </p>
                  </div>

                  {/* Invoice */}
                  <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-2 md:col-span-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                        Nomor Faktur / Invoice Kasir
                      </span>
                      <Badge variant="subtle" className="text-xs font-mono">
                        Contoh: INV-202609-0001
                      </Badge>
                    </div>
                    <Input
                      value={numbering.invPrefix}
                      onChange={(e) =>
                        setNumbering((prev) => ({ ...prev, invPrefix: e.target.value }))
                      }
                      className="font-mono text-sm"
                    />
                    <p className="text-[11px] text-slate-500">
                      Tercetak pada tanda terima resmi dan QRIS pembayaran pasien.
                    </p>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-end gap-3 border-t border-slate-100 dark:border-slate-800 pt-4">
                <Button type="submit" variant="primary">
                  <Save className="h-4 w-4" />
                  Simpan Format Penomoran
                </Button>
              </CardFooter>
            </Card>
          </form>
        </TabsContent>

        {/* ==================================================== */}
        {/* TAB 4: INTEGRASI EKSTERNAL */}
        {/* ==================================================== */}
        <TabsContent value="integrations">
          <div className="space-y-6">
            {/* BPJS */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400">
                      <ShieldCheck className="h-5 w-5" />
                    </div>
                    <div>
                      <CardTitle>BPJS Kesehatan (VClaim & PCare)</CardTitle>
                      <CardDescription>
                        Bridging API VClaim untuk verifikasi kepesertaan, SEP, rujukan faskes, dan klaim INA-CBGs.
                      </CardDescription>
                    </div>
                  </div>
                  <Badge variant="subtle" className="bg-emerald-50 text-emerald-700 border-emerald-300">
                    Aktif (Sandbox)
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Consumer ID (Cons ID)
                    </label>
                    <Input
                      value={integrations.bpjsConsId}
                      onChange={(e) =>
                        setIntegrations((prev) => ({ ...prev, bpjsConsId: e.target.value }))
                      }
                      className="font-mono text-sm"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Secret Key
                    </label>
                    <Input
                      type="password"
                      value={integrations.bpjsSecretKey}
                      onChange={(e) =>
                        setIntegrations((prev) => ({ ...prev, bpjsSecretKey: e.target.value }))
                      }
                      className="font-mono text-sm"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      User Key (VClaim API)
                    </label>
                    <Input
                      type="password"
                      value={integrations.bpjsUserKey}
                      onChange={(e) =>
                        setIntegrations((prev) => ({ ...prev, bpjsUserKey: e.target.value }))
                      }
                      className="font-mono text-sm"
                    />
                  </div>
                </div>

                {bpjsStatus && (
                  <div className="p-3 rounded-lg bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-800 dark:text-emerald-300 flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                    <span>{bpjsStatus}</span>
                  </div>
                )}
              </CardContent>
              <CardFooter className="flex justify-end gap-3 border-t border-slate-100 dark:border-slate-800 pt-4">
                <Button
                  variant="outline"
                  onClick={handleTestBpjs}
                  isLoading={testingBpjs}
                >
                  <Activity className="h-4 w-4" />
                  Uji Koneksi BPJS
                </Button>
                <Button variant="primary" onClick={() => toast.success("Kredensial BPJS disimpan")}>
                  Simpan Kredensial BPJS
                </Button>
              </CardFooter>
            </Card>

            {/* SATUSEHAT KEMENKES */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-100 text-teal-700 dark:bg-teal-950/60 dark:text-teal-400">
                      <Server className="h-5 w-5" />
                    </div>
                    <div>
                      <CardTitle>SATUSEHAT Kemenkes (FHIR R4)</CardTitle>
                      <CardDescription>
                        Interoperabilitas data rekam medis elektronik nasional sesuai Permenkes No. 24 Tahun 2022.
                      </CardDescription>
                    </div>
                  </div>
                  <Badge variant="subtle" className="bg-teal-50 text-teal-700 border-teal-300">
                    KYC Compliant
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Organization ID
                    </label>
                    <Input
                      value={integrations.satusehatOrgId}
                      onChange={(e) =>
                        setIntegrations((prev) => ({ ...prev, satusehatOrgId: e.target.value }))
                      }
                      className="font-mono text-sm"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Client ID
                    </label>
                    <Input
                      value={integrations.satusehatClientId}
                      onChange={(e) =>
                        setIntegrations((prev) => ({ ...prev, satusehatClientId: e.target.value }))
                      }
                      className="font-mono text-sm"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Client Secret
                    </label>
                    <Input
                      type="password"
                      value={integrations.satusehatClientSecret}
                      onChange={(e) =>
                        setIntegrations((prev) => ({ ...prev, satusehatClientSecret: e.target.value }))
                      }
                      className="font-mono text-sm"
                    />
                  </div>
                </div>

                {satusehatStatus && (
                  <div className="p-3 rounded-lg bg-teal-50/70 dark:bg-teal-950/30 border border-teal-200 dark:border-teal-800 text-xs text-teal-800 dark:text-teal-300 flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-teal-600 shrink-0" />
                    <span>{satusehatStatus}</span>
                  </div>
                )}
              </CardContent>
              <CardFooter className="flex justify-end gap-3 border-t border-slate-100 dark:border-slate-800 pt-4">
                <Button
                  variant="outline"
                  onClick={handleTestSatusehat}
                  isLoading={testingSatusehat}
                >
                  <Activity className="h-4 w-4" />
                  Uji Sinkronisasi SatuSehat
                </Button>
                <Button variant="primary" onClick={() => toast.success("Kredensial SatuSehat disimpan")}>
                  Simpan Kredensial SatuSehat
                </Button>
              </CardFooter>
            </Card>

            {/* WHATSAPP GATEWAY */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400">
                      <Send className="h-5 w-5" />
                    </div>
                    <div>
                      <CardTitle>WhatsApp Gateway Notifikasi</CardTitle>
                      <CardDescription>
                        Kirim konfirmasi janji temu, nomor antrean, dan notifikasi pengambilan obat langsung ke WhatsApp pasien.
                      </CardDescription>
                    </div>
                  </div>
                  <Badge variant="subtle" className="bg-emerald-50 text-emerald-700">
                    Fonnte / Wablas
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Nomor Pengirim Gateway
                    </label>
                    <Input
                      value={integrations.waPhone}
                      onChange={(e) =>
                        setIntegrations((prev) => ({ ...prev, waPhone: e.target.value }))
                      }
                      placeholder="081299881122"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      API Authorization Token
                    </label>
                    <Input
                      type="password"
                      value={integrations.waToken}
                      onChange={(e) =>
                        setIntegrations((prev) => ({ ...prev, waToken: e.target.value }))
                      }
                      className="font-mono text-sm"
                    />
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-end gap-3 border-t border-slate-100 dark:border-slate-800 pt-4">
                <Button
                  variant="outline"
                  onClick={handleTestWa}
                  isLoading={testingWa}
                >
                  <Send className="h-4 w-4" />
                  Kirim Pesan Uji Coba
                </Button>
                <Button variant="primary" onClick={() => toast.success("Konfigurasi WhatsApp disimpan")}>
                  Simpan Konfigurasi WA
                </Button>
              </CardFooter>
            </Card>
          </div>
        </TabsContent>

        {/* ==================================================== */}
        {/* TAB 5: DATA & MANAJEMEN DEMO */}
        {/* ==================================================== */}
        <TabsContent value="demo">
          <div className="space-y-6">
            {/* Environment & Architecture Information */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Zap className="h-5 w-5 text-amber-500" />
                      Arsitektur & Sumber Data Aktif
                    </CardTitle>
                    <CardDescription>
                      Status layer repository dan mekanisme penyimpanan data saat ini.
                    </CardDescription>
                  </div>
                  <Badge
                    variant="subtle"
                    className="bg-teal-50 text-teal-700 border-teal-300 font-mono text-xs px-2.5 py-1"
                  >
                    DATA_SOURCE: {dataSource.toUpperCase()}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                  <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-200 mb-2">
                    Mekanisme Isolasi Repository
                  </h4>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    Aplikasi ini dirancang dengan <strong>Repository Pattern</strong> yang memisahkan komponen UI dari lapisan sumber data. Seluruh mutasi (tambah pasien baru, check-in antrean, SOAP encounter, dispensing obat, faktur pembayaran) disimpan pada <strong>browser local state</strong> (storage key: <code className="text-teal-600 dark:text-teal-400 font-semibold font-mono">ehealth_demo_store_v1</code>).
                  </p>
                  <div className="mt-3 p-3 rounded-lg bg-teal-50/50 dark:bg-teal-950/30 border border-teal-200 dark:border-teal-800 text-xs text-teal-800 dark:text-teal-300">
                    💡 <strong>Beralih ke REST API Nyata:</strong> Cukup ubah variabel environment <code className="font-mono font-bold">NEXT_PUBLIC_DATA_SOURCE=&quot;api&quot;</code> pada file <code className="font-mono font-bold">.env.local</code>. Seluruh halaman akan otomatis memanggil backend REST API tanpa mengubah kode antarmuka.
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 pt-2">
                  <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center">
                    <p className="text-xs text-slate-500">Pasien Terdaftar</p>
                    <p className="text-xl font-bold text-slate-900 dark:text-slate-100 mt-1">20+</p>
                  </div>
                  <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center">
                    <p className="text-xs text-slate-500">Dokter Spesialis</p>
                    <p className="text-xl font-bold text-slate-900 dark:text-slate-100 mt-1">10</p>
                  </div>
                  <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center">
                    <p className="text-xs text-slate-500">Poliklinik</p>
                    <p className="text-xl font-bold text-slate-900 dark:text-slate-100 mt-1">8</p>
                  </div>
                  <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center">
                    <p className="text-xs text-slate-500">Katalog Obat</p>
                    <p className="text-xl font-bold text-slate-900 dark:text-slate-100 mt-1">30</p>
                  </div>
                  <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center">
                    <p className="text-xs text-slate-500">Kamar & Bed</p>
                    <p className="text-xl font-bold text-slate-900 dark:text-slate-100 mt-1">45</p>
                  </div>
                  <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center">
                    <p className="text-xs text-slate-500">Transaksi Invoice</p>
                    <p className="text-xl font-bold text-slate-900 dark:text-slate-100 mt-1">15</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Danger Zone: Reset Demo Data */}
            <Card className="border-rose-200 dark:border-rose-900/60 bg-rose-50/30 dark:bg-rose-950/10">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-100 text-rose-600 dark:bg-rose-950 dark:text-rose-400">
                    <AlertTriangle className="h-5 w-5" />
                  </div>
                  <div>
                    <CardTitle className="text-rose-900 dark:text-rose-200">
                      Zona Berbahaya: Reset Data Demo
                    </CardTitle>
                    <CardDescription className="text-rose-700/80 dark:text-rose-400">
                      Kembalikan seluruh database lokal ke kondisi awal (factory seed).
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                  Tindakan ini akan menghapus semua pasien baru yang telah didaftarkan, rekam medis (SOAP), resep obat, perubahan stok inventori, antrean yang dipanggil, serta mutasi kuitansi billing yang dibuat selama sesi demo ini, dan memulihkan dataset mock awal.
                </p>
              </CardContent>
              <CardFooter className="flex justify-end border-t border-rose-100 dark:border-rose-900/30 pt-4">
                <Button
                  variant="danger"
                  onClick={() => setIsResetDialogOpen(true)}
                  className="flex items-center gap-2"
                >
                  <RotateCcw className="h-4 w-4" />
                  Reset Semua Data Demo ke Awal
                </Button>
              </CardFooter>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Reset Confirmation Dialog */}
      <ConfirmDialog
        open={isResetDialogOpen}
        onOpenChange={setIsResetDialogOpen}
        title="Konfirmasi Reset Data Demo"
        description="Apakah Anda yakin ingin mengembalikan seluruh data ke kondisi awal? Seluruh perubahan data pasien, kunjungan, antrean, resep, dan transaksi billing akan dihapus."
        confirmText="Ya, Reset Seluruh Data"
        cancelText="Batal"
        variant="danger"
        isLoading={isResetting}
        onConfirm={handleConfirmResetDemo}
      />
    </div>
  );
}

