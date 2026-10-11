"use client";

import * as React from "react";
import { PatientForm } from "@/features/patients/patient-form";
import { PatientService } from "@/services";
import { CreatePatientInput } from "@/types";

export default function NewPatientPage() {
  const handleCreate = async (data: CreatePatientInput) => {
    return PatientService.createPatient(data);
  };

  return (
    <div className="py-2">
      <PatientForm
        title="Pendaftaran Pasien Baru"
        description="Lengkapi formulir di bawah ini untuk mendaftarkan pasien ke dalam sistem rekam medis."
        onSubmit={handleCreate}
      />
    </div>
  );
}

