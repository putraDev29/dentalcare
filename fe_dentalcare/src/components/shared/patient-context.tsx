import * as React from "react";
import { AlertTriangle, Shield, User as UserIcon } from "lucide-react";
import { Patient } from "@/types";
import { formatAge } from "@/lib/formatting";
import { cn } from "@/lib/utils";

interface PatientContextBarProps {
  patient: Patient;
  className?: string;
  actions?: React.ReactNode;
}

export function PatientContextBar({
  patient,
  className,
  actions,
}: PatientContextBarProps) {
  const hasAllergies = patient.allergies && patient.allergies.length > 0;

  return (
    <div
      className={cn(
        "rounded-2xl border border-slate-200/90 bg-white p-4 shadow-xs dark:border-slate-800 dark:bg-slate-900/90 transition-all",
        className
      )}
    >
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        {/* Patient Core Info */}
        <div className="flex items-center gap-3.5">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-teal-50 text-teal-700 font-bold text-base dark:bg-teal-950/60 dark:text-teal-300">
            {patient.gender === "male" ? "♂" : "♀"}
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
                {patient.name}
              </h2>
              <span className="rounded-md bg-slate-100 px-2 py-0.5 text-xs font-mono font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                {patient.medicalRecordNumber}
              </span>
            </div>

            <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500 dark:text-slate-400">
              <span>{formatAge(patient.birthDate)}</span>
              <span>•</span>
              <span className="capitalize">{patient.gender === "male" ? "Laki-laki" : "Perempuan"}</span>
              {patient.bloodType && (
                <>
                  <span>•</span>
                  <span className="font-semibold text-slate-700 dark:text-slate-300">Gol. {patient.bloodType}</span>
                </>
              )}
              <span>•</span>
              <span className="inline-flex items-center gap-1 font-medium text-teal-700 dark:text-teal-300">
                <Shield className="h-3 w-3" />
                {patient.insurance.type.toUpperCase()}{" "}
                {patient.insurance.providerName ? `(${patient.insurance.providerName})` : ""}
              </span>
            </div>
          </div>
        </div>

        {/* Clinical Safety Alert & Actions */}
        <div className="flex flex-wrap items-center gap-2.5">
          {hasAllergies ? (
            <div className="inline-flex items-center gap-1.5 rounded-xl border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs font-medium text-rose-700 dark:border-rose-900/60 dark:bg-rose-950/40 dark:text-rose-300">
              <AlertTriangle className="h-4 w-4 shrink-0 text-rose-600 dark:text-rose-400" />
              <span>Alergi: <strong>{patient.allergies.join(", ")}</strong></span>
            </div>
          ) : (
            <span className="text-xs text-slate-400">Tidak ada riwayat alergi</span>
          )}

          {actions && <div className="flex items-center gap-2">{actions}</div>}
        </div>
      </div>
    </div>
  );
}

