"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  Users,
  UserCheck,
  CalendarCheck,
  FileText,
  Receipt,
  Pill,
  ArrowRight,
  X,
} from "lucide-react";
import {
  PatientService,
  DoctorService,
  AppointmentService,
  PharmacyService,
} from "@/services";
import { Patient, Doctor, Appointment, Medicine } from "@/types";

interface CommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CommandPalette({ open, onOpenChange }: CommandPaletteProps) {
  const [query, setQuery] = React.useState("");
  const router = useRouter();

  const [patients, setPatients] = React.useState<Patient[]>([]);
  const [doctors, setDoctors] = React.useState<Doctor[]>([]);
  const [appointments, setAppointments] = React.useState<Appointment[]>([]);
  const [medicines, setMedicines] = React.useState<Medicine[]>([]);
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        onOpenChange(!open);
      }
      if (e.key === "Escape" && open) {
        onOpenChange(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, onOpenChange]);

  const q = query.toLowerCase().trim();

  React.useEffect(() => {
    if (!open || !q) {
      setPatients([]);
      setDoctors([]);
      setAppointments([]);
      setMedicines([]);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const [patRes, docRes, appRes, medRes] = await Promise.allSettled([
          PatientService.getPatients({ search: q, perPage: 10 }),
          DoctorService.getDoctors(),
          AppointmentService.getAppointments(),
          PharmacyService.getMedicines(),
        ]);

        if (patRes.status === "fulfilled" && patRes.value?.data) {
          setPatients(patRes.value.data.slice(0, 4));
        }
        if (docRes.status === "fulfilled" && Array.isArray(docRes.value)) {
          const filteredDocs = docRes.value
            .filter(
              (d) =>
                d.name.toLowerCase().includes(q) ||
                (d.specialization && d.specialization.toLowerCase().includes(q))
            )
            .slice(0, 3);
          setDoctors(filteredDocs);
        }
        if (appRes.status === "fulfilled" && Array.isArray(appRes.value)) {
          const filteredAppts = appRes.value
            .filter(
              (a) =>
                a.appointmentNumber.toLowerCase().includes(q) ||
                a.patientName.toLowerCase().includes(q)
            )
            .slice(0, 3);
          setAppointments(filteredAppts);
        }
        if (medRes.status === "fulfilled" && Array.isArray(medRes.value)) {
          const filteredMeds = medRes.value
            .filter(
              (m) =>
                m.genericName.toLowerCase().includes(q) ||
                m.brandName.toLowerCase().includes(q)
            )
            .slice(0, 3);
          setMedicines(filteredMeds);
        }
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [open, q]);

  if (!open) return null;

  const handleSelect = (url: string) => {
    onOpenChange(false);
    setQuery("");
    router.push(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-16 sm:p-6 sm:pt-20">
      <div
        className="fixed inset-0 bg-slate-950/40 backdrop-blur-xs"
        onClick={() => onOpenChange(false)}
      />

      <div className="relative z-50 w-full max-w-xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900 animate-in zoom-in-95">
        {/* Search Bar */}
        <div className="flex items-center border-b border-slate-100 px-4 dark:border-slate-800">
          <Search className="h-4 w-4 text-slate-400 shrink-0" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Cari pasien, dokter, appointment, obat, invoice... (Ctrl+K)"
            className="h-12 w-full border-0 bg-transparent px-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none dark:text-slate-100"
            autoFocus
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              className="rounded p-1 text-slate-400 hover:text-slate-600"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* Results Container */}
        <div className="max-h-96 overflow-y-auto p-3 space-y-4">
          {!query ? (
            <div className="py-6 text-center text-xs text-slate-400 space-y-1">
              <p>Ketik kata kunci untuk mencari data sistem kesehatan.</p>
              <p className="text-[11px] text-slate-400">Contoh: "Budi", "RM-2026", "Ahmad", "Panadol", "Hipertensi"</p>
            </div>
          ) : (
            <>
              {patients.length > 0 && (
                <div>
                  <div className="px-2 py-1 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                    Pasien
                  </div>
                  <div className="space-y-1">
                    {patients.map((p) => (
                      <button
                        key={p.id}
                        onClick={() => handleSelect(`/patients/${p.id}`)}
                        className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-left hover:bg-teal-50 dark:hover:bg-slate-800/60 transition-colors"
                      >
                        <div className="flex items-center gap-2.5">
                          <Users className="h-4 w-4 text-teal-600 dark:text-teal-400" />
                          <div>
                            <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                              {p.name}
                            </p>
                            <p className="text-[10px] font-mono text-slate-500">
                              {p.medicalRecordNumber} • NIK: {p.nik}
                            </p>
                          </div>
                        </div>
                        <ArrowRight className="h-3.5 w-3.5 text-slate-400" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {doctors.length > 0 && (
                <div>
                  <div className="px-2 py-1 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                    Dokter
                  </div>
                  <div className="space-y-1">
                    {doctors.map((d) => (
                      <button
                        key={d.id}
                        onClick={() => handleSelect(`/doctors/${d.id}`)}
                        className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-left hover:bg-teal-50 dark:hover:bg-slate-800/60 transition-colors"
                      >
                        <div className="flex items-center gap-2.5">
                          <UserCheck className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                          <div>
                            <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                              {d.name}, {d.title}
                            </p>
                            <p className="text-[10px] text-slate-500">
                              {d.specialization} • {d.departmentName}
                            </p>
                          </div>
                        </div>
                        <ArrowRight className="h-3.5 w-3.5 text-slate-400" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {appointments.length > 0 && (
                <div>
                  <div className="px-2 py-1 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                    Appointment
                  </div>
                  <div className="space-y-1">
                    {appointments.map((a) => (
                      <button
                        key={a.id}
                        onClick={() => handleSelect("/appointments")}
                        className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-left hover:bg-teal-50 dark:hover:bg-slate-800/60 transition-colors"
                      >
                        <div className="flex items-center gap-2.5">
                          <CalendarCheck className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                          <div>
                            <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                              {a.appointmentNumber} - {a.patientName}
                            </p>
                            <p className="text-[10px] text-slate-500">
                              {a.appointmentDate} • {a.doctorName}
                            </p>
                          </div>
                        </div>
                        <ArrowRight className="h-3.5 w-3.5 text-slate-400" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {medicines.length > 0 && (
                <div>
                  <div className="px-2 py-1 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                    Obat & Farmasi
                  </div>
                  <div className="space-y-1">
                    {medicines.map((m) => (
                      <button
                        key={m.id}
                        onClick={() => handleSelect("/pharmacy/medicines")}
                        className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-left hover:bg-teal-50 dark:hover:bg-slate-800/60 transition-colors"
                      >
                        <div className="flex items-center gap-2.5">
                          <Pill className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                          <div>
                            <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                              {m.genericName} ({m.brandName})
                            </p>
                            <p className="text-[10px] text-slate-500">
                              {m.strength} • Stok: {m.currentStock} {m.unit}
                            </p>
                          </div>
                        </div>
                        <ArrowRight className="h-3.5 w-3.5 text-slate-400" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {patients.length === 0 &&
                doctors.length === 0 &&
                appointments.length === 0 &&
                medicines.length === 0 && (
                  <div className="py-8 text-center text-xs text-slate-400">
                    Tidak ada hasil yang sesuai dengan "{query}"
                  </div>
                )}
            </>
          )}
        </div>

        {/* Footer shortcuts info */}
        <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50 px-4 py-2 text-[11px] text-slate-400 dark:border-slate-800 dark:bg-slate-800/40">
          <span>Tekan ESC untuk menutup</span>
          <span>Navigasi Cepat E-Health</span>
        </div>
      </div>
    </div>
  );
}