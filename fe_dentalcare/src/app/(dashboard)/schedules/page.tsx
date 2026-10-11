"use client";

import * as React from "react";
import Link from "next/link";
import { Clock, Calendar, Filter, Users, Stethoscope } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useDoctors } from "@/hooks";

const DAYS = [
  { dayOfWeek: 1, name: "Senin" },
  { dayOfWeek: 2, name: "Selasa" },
  { dayOfWeek: 3, name: "Rabu" },
  { dayOfWeek: 4, name: "Kamis" },
  { dayOfWeek: 5, name: "Jumat" },
  { dayOfWeek: 6, name: "Sabtu" },
];

export default function DoctorSchedulesPage() {
  const { doctors } = useDoctors();
  const [selectedDay, setSelectedDay] = React.useState<number>(1);
  const [selectedDept, setSelectedDept] = React.useState<string>("");

  const allSchedules = doctors.flatMap((doc) =>
    doc.schedules.map((sch) => ({
      ...sch,
      doctor: doc,
    }))
  );

  const filtered = allSchedules.filter(
    (s) =>
      s.dayOfWeek === selectedDay &&
      (!selectedDept || s.doctor.departmentId === selectedDept)
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Jadwal Praktik Dokter"
        description="Jadwal operasional klinik rawat jalan, jam praktik, dan kapasitas kuota pasien per sesi."
      >
        <Link href="/appointments/new">
          <Button size="sm" className="text-xs shadow-xs">
            + Buat Appointment
          </Button>
        </Link>
      </PageHeader>

      {/* Day Selector Chips */}
      <div className="flex flex-wrap items-center gap-2">
        {DAYS.map((d) => (
          <button
            key={d.dayOfWeek}
            onClick={() => setSelectedDay(d.dayOfWeek)}
            className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold transition-colors cursor-pointer ${
              selectedDay === d.dayOfWeek
                ? "bg-teal-600 text-white shadow-xs"
                : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300"
            }`}
          >
            <Calendar className="h-3.5 w-3.5" />
            <span>{d.name}</span>
          </button>
        ))}
      </div>

      {/* Grid of Schedules */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.length > 0 ? (
          filtered.map((sch) => (
            <Card key={sch.id} className="hover:border-teal-300 dark:hover:border-teal-800 transition-all">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100">
                      {sch.doctor.name}
                    </h4>
                    <p className="text-xs text-teal-700 dark:text-teal-400 font-medium">
                      {sch.doctor.specialization}
                    </p>
                  </div>
                  <span className="rounded-lg bg-teal-50 px-2 py-1 text-[11px] font-bold text-teal-700 dark:bg-teal-950 dark:text-teal-300">
                    {sch.roomNumber}
                  </span>
                </div>
              </CardHeader>

              <CardContent className="space-y-3 text-xs">
                <div className="rounded-xl bg-slate-50 p-3 dark:bg-slate-800/40 space-y-1.5">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Poli / Departemen:</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                      {sch.doctor.departmentName}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Waktu Praktik:</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                      {sch.startTime} - {sch.endTime} WIB
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Kuota Pasien:</span>
                    <span className="font-bold text-teal-700 dark:text-teal-400">
                      {sch.maxQuota} Pasien
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <span className="text-[11px] text-slate-400">Tersedia untuk reservasi</span>
                  <Link href={`/appointments/new?doctorId=${sch.doctor.id}`}>
                    <Button size="sm" variant="outline" className="h-7 text-xs">
                      Reservasi Slot
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="col-span-full py-12 text-center text-xs text-slate-400">
            Tidak ada jadwal praktik dokter yang aktif untuk hari ini.
          </div>
        )}
      </div>
    </div>
  );
}

