"use client";

import * as React from "react";
import Link from "next/link";
import { Contact, Phone, Mail, CheckCircle2 } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useStaff } from "@/hooks";
import { formatDate } from "@/lib/formatting";

export default function StaffPage() {
  const { staff } = useStaff();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Tenaga Medis & Staff Rumah Sakit"
        description="Daftar perawat pelaksana, staf farmasi, analis laboratorium, radiografer, dan staf administrasi kasir."
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {staff.map((st) => (
          <Card key={st.id} className="hover:border-teal-300 transition-all">
            <CardHeader className="pb-3 flex flex-row items-center gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-teal-50 text-teal-700 font-bold text-sm dark:bg-teal-950/50 dark:text-teal-300">
                <Contact className="h-5 w-5" />
              </div>
              <div className="overflow-hidden">
                <CardTitle className="text-sm truncate">{st.name}</CardTitle>
                <CardDescription className="text-teal-700 dark:text-teal-400 font-medium">
                  {st.role}
                </CardDescription>
              </div>
            </CardHeader>

            <CardContent className="space-y-2.5 text-xs">
              <div className="rounded-xl bg-slate-50 p-2.5 dark:bg-slate-800/40 space-y-1">
                <div className="flex justify-between text-slate-500">
                  <span>Unit Kerja:</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">{st.department}</span>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>NIP / ID Staff:</span>
                  <span className="font-mono text-slate-700 dark:text-slate-300">{st.employeeId}</span>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>Tanggal Bergabung:</span>
                  <span className="text-slate-700 dark:text-slate-300">{formatDate(st.joinDate)}</span>
                </div>
              </div>

              <div className="pt-1 flex items-center justify-between text-slate-500 font-mono text-[11px]">
                <span className="flex items-center gap-1.5">
                  <Phone className="h-3 w-3" />
                  {st.phone}
                </span>
                <Badge variant="success" size="sm">Aktif</Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}