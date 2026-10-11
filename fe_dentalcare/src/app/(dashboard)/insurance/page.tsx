"use client";

import * as React from "react";
import Link from "next/link";
import { ShieldCheck, Phone, Mail, FileText, CheckCircle2 } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useInsurance } from "@/hooks";

export default function InsurancePage() {
  const { insurances } = useInsurance();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Asuransi & Penjamin Kesehatan"
        description="Kelola kemitraan penjaminan medis rumah sakit: BPJS Kesehatan (JKN-KIS), asuransi komersial, dan jaminan korporasi."
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {insurances.map((ins) => (
          <Card key={ins.id} className="hover:border-teal-300 transition-all">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-50 text-teal-700 dark:bg-teal-950/60 dark:text-teal-300">
                    <ShieldCheck className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">{ins.name}</h3>
                    <span className="font-mono text-xs text-slate-400">Kode: {ins.code}</span>
                  </div>
                </div>
                <Badge variant={ins.isActive ? "success" : "neutral"} size="sm">
                  {ins.isActive ? "Aktif" : "Non-Aktif"}
                </Badge>
              </div>
            </CardHeader>

            <CardContent className="space-y-3 text-xs">
              <div className="rounded-xl bg-slate-50 p-3 dark:bg-slate-800/40 space-y-1.5">
                <div className="flex justify-between text-slate-500">
                  <span>Kategori Penjamin:</span>
                  <span className="font-semibold uppercase text-slate-800 dark:text-slate-200">{ins.category}</span>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>Total Klaim Terproses:</span>
                  <span className="font-mono font-bold text-teal-700 dark:text-teal-400">{ins.claimCount} Klaim</span>
                </div>
              </div>

              <div className="space-y-1 text-slate-600 dark:text-slate-400">
                <p>PIC: <strong>{ins.contactPerson}</strong></p>
                <div className="flex items-center gap-2 font-mono text-[11px]">
                  <Phone className="h-3 w-3" />
                  <span>{ins.phone}</span>
                </div>
                <div className="flex items-center gap-2 text-[11px] truncate">
                  <Mail className="h-3 w-3" />
                  <span>{ins.email}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}