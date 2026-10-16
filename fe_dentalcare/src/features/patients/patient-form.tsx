"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter } from "next/navigation";
import { Save, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { CreatePatientInput, Patient } from "@/types";
import { toast } from "sonner";

const patientSchema = z.object({
  name: z.string().min(2, "Nama minimal 2 karakter"),
  nik: z.string().optional(),
  gender: z.enum(["male", "female"]),
  birthPlace: z.string().min(2, "Tempat lahir harus diisi"),
  birthDate: z.string().min(1, "Tanggal lahir harus diisi"),
  phone: z.string().min(9, "Nomor telepon minimal 9 digit"),
  email: z.string().email("Format email tidak valid").optional().or(z.literal("")),
  address: z.object({
    street: z.string().min(3, "Alamat jalan & domisili harus diisi"),
  }),
  emergencyContact: z
    .object({
      name: z.string().optional(),
      relationship: z.string().optional(),
      phone: z.string().optional(),
    })
    .optional(),
  insurance: z.object({
    type: z.enum(["umum", "bpjs", "asuransi", "perusahaan"]),
    providerName: z.string().optional(),
    policyNumber: z.string().optional(),
    memberNumber: z.string().optional(),
    bpjsClass: z.enum(["1", "2", "3"]).optional(),
    primaryClinic: z.string().optional(),
  }),
  allergies: z.string().optional(),
  chronicDiseases: z.string().optional(),
});

type PatientFormData = z.infer<typeof patientSchema>;

interface PatientFormProps {
  initialData?: Patient;
  onSubmit: (data: CreatePatientInput) => Promise<any>;
  title: string;
  description: string;
}

export function PatientForm({
  initialData,
  onSubmit,
  title,
  description,
}: PatientFormProps) {
  const router = useRouter();
  const [loading, setLoading] = React.useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isDirty },
  } = useForm<PatientFormData>({
    resolver: zodResolver(patientSchema),
    defaultValues: initialData
      ? {
          name: initialData.name,
          nik: initialData.nik,
          gender: initialData.gender,
          birthPlace: initialData.birthPlace,
          birthDate: initialData.birthDate,
          phone: initialData.phone,
          email: initialData.email || "",
          address: {
            street: initialData.address?.street || "",
          },
          emergencyContact: {
            name: initialData.emergencyContact?.name || "",
            relationship: initialData.emergencyContact?.relationship || "",
            phone: initialData.emergencyContact?.phone || "",
          },
          insurance: {
            type: initialData.insurance.type,
            providerName: initialData.insurance.providerName || "",
            policyNumber: initialData.insurance.policyNumber || "",
            memberNumber: initialData.insurance.memberNumber || "",
            bpjsClass: initialData.insurance.bpjsClass,
            primaryClinic: initialData.insurance.primaryClinic || "",
          },
          allergies: initialData.allergies?.join(", ") || "",
          chronicDiseases: initialData.chronicDiseases?.join(", ") || "",
        }
      : {
          gender: "male",
          insurance: {
            type: "umum",
          },
          address: {
            street: "",
          },
        },
  });

  const insuranceType = watch("insurance.type");

  const onFormSubmit = async (data: PatientFormData) => {
    setLoading(true);
    try {
      const formattedInput: CreatePatientInput = {
        name: data.name,
        nik: data.nik || undefined,
        gender: data.gender,
        birthPlace: data.birthPlace,
        birthDate: data.birthDate,
        phone: data.phone,
        email: data.email || undefined,
        address: {
          street: data.address.street,
        },
        insurance: {
          type: "umum",
          providerName: data.insurance?.providerName,
          policyNumber: data.insurance?.policyNumber,
          memberNumber: data.insurance?.memberNumber,
        },
        emergencyContact:
          data.emergencyContact?.name || data.emergencyContact?.phone
            ? {
                name: data.emergencyContact.name || "",
                relationship: data.emergencyContact.relationship || "",
                phone: data.emergencyContact.phone || "",
              }
            : undefined,
        allergies: data.allergies
          ? data.allergies.split(",").map((s) => s.trim()).filter(Boolean)
          : [],
        chronicDiseases: data.chronicDiseases
          ? data.chronicDiseases.split(",").map((s) => s.trim()).filter(Boolean)
          : [],
      };
      await onSubmit(formattedInput);
      toast.success("Data pasien berhasil disimpan.");
      router.push("/patients");
    } catch (err: any) {
      toast.error(err.message || "Gagal menyimpan data pasien.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6 max-w-4xl pb-12">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            {title}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {description}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => router.back()}
          >
            <ArrowLeft className="h-3.5 w-3.5 mr-1" />
            Batal
          </Button>
          <Button type="submit" size="sm" isLoading={loading} className="gap-1.5 shadow-xs">
            <Save className="h-3.5 w-3.5" />
            Simpan Pasien
          </Button>
        </div>
      </div>

      {/* 1. Data Pribadi */}
      <Card>
        <CardHeader>
          <CardTitle>1. Data Pribadi Pasien</CardTitle>
          <CardDescription>Informasi identitas kependudukan pasien</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="space-y-1.5 sm:col-span-2">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Nama Lengkap <span className="text-rose-500">*</span>
            </label>
            <Input {...register("name")} error={!!errors.name} placeholder="Nama lengkap sesuai KTP" />
            {errors.name && <p className="text-[11px] text-rose-500">{errors.name.message}</p>}
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              NIK (Nomor Induk Kependudukan) <span className="text-slate-400 font-normal text-[11px]">(Opsional)</span>
            </label>
            <Input {...register("nik")} error={!!errors.nik} placeholder="16 Digit NIK (Opsional)" maxLength={16} />
            {errors.nik && <p className="text-[11px] text-rose-500">{errors.nik.message}</p>}
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Jenis Kelamin <span className="text-rose-500">*</span>
            </label>
            <Select {...register("gender")}>
              <option value="male">Laki-laki</option>
              <option value="female">Perempuan</option>
            </Select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Tempat Lahir <span className="text-rose-500">*</span>
            </label>
            <Input {...register("birthPlace")} error={!!errors.birthPlace} placeholder="Kota Kelahiran" />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Tanggal Lahir <span className="text-rose-500">*</span>
            </label>
            <Input type="date" {...register("birthDate")} error={!!errors.birthDate} />
          </div>
        </CardContent>
      </Card>

      {/* 2. Kontak & Alamat */}
      <Card>
        <CardHeader>
          <CardTitle>2. Kontak & Alamat Domisili</CardTitle>
          <CardDescription>Nomor telepon/WhatsApp aktif dan alamat lengkap pasien</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="space-y-1.5 sm:col-span-1">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              No. Handphone / WhatsApp <span className="text-rose-500">*</span>
            </label>
            <Input {...register("phone")} error={!!errors.phone} placeholder="0812xxxxxxxx" />
            {errors.phone && <p className="text-[11px] text-rose-500">{errors.phone.message}</p>}
          </div>

          <div className="space-y-1.5 sm:col-span-2">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Alamat Email <span className="text-slate-400 font-normal text-[11px]">(Opsional)</span>
            </label>
            <Input type="email" {...register("email")} error={!!errors.email} placeholder="email@contoh.com" />
          </div>

          <div className="space-y-1.5 sm:col-span-3">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Alamat Lengkap (Jalan, No Rumah, Domisili) <span className="text-rose-500">*</span>
            </label>
            <Textarea
              {...register("address.street")}
              error={!!errors.address?.street}
              placeholder="Nama jalan, nomor rumah, RT/RW, kelurahan, kecamatan, kota domisili"
              rows={3}
            />
            {errors.address?.street && (
              <p className="text-[11px] text-rose-500">{errors.address.street.message}</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* 3. Penanggung Jawab / Kontak Darurat */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <div>
            <CardTitle>3. Penanggung Jawab & Kontak Darurat</CardTitle>
            <CardDescription>Pihak keluarga atau kerabat yang dapat dihubungi saat darurat</CardDescription>
          </div>
          <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-medium text-slate-500 dark:bg-slate-800 dark:text-slate-400">
            Opsional (Tidak Wajib)
          </span>
        </CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Nama Penanggung Jawab <span className="text-slate-400 font-normal text-[11px]">(Opsional)</span>
            </label>
            <Input {...register("emergencyContact.name")} error={!!errors.emergencyContact?.name} placeholder="Nama lengkap kerabat/penjamin" />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Hubungan Keluarga <span className="text-slate-400 font-normal text-[11px]">(Opsional)</span>
            </label>
            <Input {...register("emergencyContact.relationship")} error={!!errors.emergencyContact?.relationship} placeholder="Suami / Istri / Orang Tua / Anak" />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              No. Telepon Darurat <span className="text-slate-400 font-normal text-[11px]">(Opsional)</span>
            </label>
            <Input {...register("emergencyContact.phone")} error={!!errors.emergencyContact?.phone} placeholder="08xxxxxxxx" />
          </div>
        </CardContent>
      </Card>

      {/* 4. Penjamin Biaya Perawatan */}
      <Card>
        <CardHeader>
          <CardTitle>4. Penjamin Biaya Perawatan</CardTitle>
          <CardDescription>Metode pembayaran perawatan klinik gigi</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5 max-w-sm">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Jenis Penjamin
            </label>
            <Select {...register("insurance.type")}>
              <option value="umum">Umum (Biaya Pribadi / Mandiri)</option>
            </Select>
            <p className="text-[11px] text-slate-500">
              Biaya perawatan ditanggung secara mandiri oleh pasien (Tunai, Debit, QRIS, atau Transfer Bank).
            </p>
          </div>
        </CardContent>
      </Card>

      {/* 5. Riwayat Medis Singkat */}
      <Card>
        <CardHeader>
          <CardTitle>5. Riwayat Alergi & Penyakit Kronis</CardTitle>
          <CardDescription>Catatan keselamatan klinis untuk tim medis</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Riwayat Alergi Obat / Makanan (Pisahkan dengan koma)
            </label>
            <Input {...register("allergies")} placeholder="Contoh: Penicillin, Aspirin, Seafood" />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Riwayat Penyakit Kronis (Pisahkan dengan koma)
            </label>
            <Input {...register("chronicDiseases")} placeholder="Contoh: Hipertensi, Asma, Diabetes" />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-2 pt-2">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
        >
          Batal
        </Button>
        <Button type="submit" isLoading={loading} className="gap-1.5 shadow-xs">
          <Save className="h-4 w-4" />
          Simpan Pasien
        </Button>
      </div>
    </form>
  );
}

