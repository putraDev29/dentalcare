"use client";

import * as React from "react";
import { useParams } from "next/navigation";
import { PatientForm } from "@/features/patients/patient-form";
import { usePatient } from "@/hooks";
import { PatientService } from "@/services";
import { CreatePatientInput } from "@/types";
import { SkeletonTable } from "@/components/shared/skeleton-table";
import { ErrorState } from "@/components/shared/error-state";

export default function EditPatientPage() {
  const params = useParams();
  const pathnameId = typeof window !== "undefined"
    ? window.location.pathname.replace(/^\/|\/$/g, "").split("/")[1]
    : null;
  const id = (pathnameId && pathnameId !== "patients") ? pathnameId : (params?.id as string);
  const { patient, loading, error, refetch } = usePatient(id);

  if (loading) return <SkeletonTable rows={8} columns={2} />;
  if (error || !patient) return <ErrorState message={error || "Pasien tidak ditemukan"} onRetry={refetch} />;

  const handleUpdate = async (data: CreatePatientInput) => {
    return PatientService.updatePatient(patient.id, data);
  };

  return (
    <div className="py-2">
      <PatientForm
        initialData={patient}
        title={`Edit Data Pasien: ${patient.name}`}
        description={`Perbarui data rekam medis ${patient.medicalRecordNumber}.`}
        onSubmit={handleUpdate}
      />
    </div>
  );
}
