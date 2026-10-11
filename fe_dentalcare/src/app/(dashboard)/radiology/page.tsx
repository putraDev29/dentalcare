"use client";

import * as React from "react";
import Link from "next/link";
import { Scan, Eye, CheckCircle2, Clock } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useRadiology } from "@/hooks";
import { formatDateTime } from "@/lib/formatting";

export default function RadiologyPage() {
  const { orders } = useRadiology();
  const [selectedOrder, setSelectedOrder] = React.useState(orders[0] || null);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Rontgen Gigi & Radiologi Dental Digital"
        description="Pelayanan pencitraan medis gigi: Foto Rontgen Panoramik (OPG), Foto Periapikal Intraoral, Bitewing, dan Cephalometric digital."
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Orders List */}
        <div className="lg:col-span-1 space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Order Radiologi ({orders.length})
          </h3>
          {orders.map((rad) => (
            <div
              key={rad.id}
              onClick={() => setSelectedOrder(rad)}
              className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                (selectedOrder?.id || orders[0]?.id) === rad.id
                  ? "border-teal-500 bg-teal-50/40 shadow-xs dark:bg-teal-950/20"
                  : "border-slate-200 bg-white hover:border-teal-200 dark:border-slate-800 dark:bg-slate-900"
              }`}
            >
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                <span className="font-mono text-xs font-bold text-teal-700 dark:text-teal-400">
                  {rad.orderNumber}
                </span>
                <Badge variant="info" size="sm">
                  {rad.modality}
                </Badge>
              </div>
              <div className="pt-2 text-xs space-y-1">
                <p className="font-bold text-slate-900 dark:text-slate-100">{rad.patientName}</p>
                <p className="text-slate-500">{rad.examinationName}</p>
                <div className="flex justify-between text-[11px] text-slate-400 pt-1">
                  <span>DPJP: {rad.doctorName}</span>
                  <span className="capitalize text-teal-700 dark:text-teal-400 font-semibold">{rad.status}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Right: Detailed Expertise Report */}
        <div className="lg:col-span-2">
          {(() => {
            const active = selectedOrder || orders[0];
            if (!active) return null;

            return (
              <Card>
                <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-teal-700">{active.orderNumber}</span>
                      <CardTitle className="text-base">{active.examinationName}</CardTitle>
                    </div>
                    <CardDescription className="mt-1">
                      Pasien: <strong>{active.patientName}</strong> ({active.patientMrn}) • Modalitas: {active.modality}
                    </CardDescription>
                  </div>
                  <div className="mt-2 sm:mt-0">
                    <span className="rounded-full bg-emerald-50 text-emerald-700 px-2.5 py-1 text-xs font-semibold uppercase">
                      {active.status}
                    </span>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4 pt-4 text-xs">
                  <div className="rounded-xl bg-slate-50 p-3 dark:bg-slate-800/40">
                    <p className="font-semibold text-slate-500">Indikasi Klinis:</p>
                    <p className="text-slate-800 dark:text-slate-200 mt-0.5">{active.clinicalIndication}</p>
                  </div>

                  {active.findings && (
                    <div>
                      <p className="font-bold text-slate-800 dark:text-slate-200 mb-1">
                        Deskripsi Hasil Pemeriksaan (Findings):
                      </p>
                      <p className="text-slate-700 dark:text-slate-300 leading-relaxed bg-white border border-slate-100 p-3 rounded-xl dark:bg-slate-900 dark:border-slate-800">
                        {active.findings}
                      </p>
                    </div>
                  )}

                  {active.impression && (
                    <div>
                      <p className="font-bold text-teal-900 dark:text-teal-200 mb-1">
                        Kesimpulan / Kesan (Impression):
                      </p>
                      <div className="rounded-xl border border-teal-200 bg-teal-50/50 p-3 dark:border-teal-900/60 dark:bg-teal-950/20">
                        <p className="font-semibold text-teal-950 dark:text-teal-200">
                          {active.impression}
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="flex flex-col sm:flex-row justify-between text-slate-400 border-t border-slate-100 pt-3 dark:border-slate-800">
                    <span>Dokter Pengirim: <strong>{active.doctorName}</strong></span>
                    <span>Radiolog: <strong>{active.radiologistName || "dr. Nadia Safitri, Sp.Rad"}</strong></span>
                  </div>
                </CardContent>
              </Card>
            );
          })()}
        </div>
      </div>
    </div>
  );
}

