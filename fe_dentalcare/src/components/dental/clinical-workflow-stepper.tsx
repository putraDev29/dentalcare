"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  UserPlus,
  ListOrdered,
  Stethoscope,
  Pill,
  Receipt,
  ArrowRight,
  Sparkles,
  Landmark,
} from "lucide-react";
import { cn } from "@/lib/utils";

const WORKFLOW_STEPS = [
  {
    step: 1,
    id: "patients",
    title: "Pendaftaran",
    desc: "Registrasi Pasien",
    href: "/patients",
    icon: UserPlus,
  },
  {
    step: 2,
    id: "queue",
    title: "Antrean",
    desc: "Dental Chair Live",
    href: "/queue",
    icon: ListOrdered,
  },
  {
    step: 3,
    id: "encounters",
    title: "Pemeriksaan",
    desc: "Odontogram & SOAP",
    href: "/outpatient",
    aliases: ["/encounters"],
    icon: Stethoscope,
  },
  {
    step: 4,
    id: "pharmacy",
    title: "Farmasi & Alat Medis",
    desc: "Stok & Resep Dokter",
    href: "/pharmacy",
    icon: Pill,
  },
  {
    step: 5,
    id: "billing",
    title: "Kasir & Billing",
    desc: "Pembayaran Gigi",
    href: "/billing",
    icon: Receipt,
  },
];

export function ClinicalWorkflowStepper() {
  const pathname = usePathname();

  return (
    <div className="rounded-2xl border border-sky-200 bg-gradient-to-r from-sky-500/10 via-rose-500/5 to-amber-300/10 p-3.5 sm:p-4 shadow-xs mb-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 pb-3 border-b border-sky-100">
        <div className="flex items-center gap-2.5">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-tr from-sky-500 via-rose-400 to-amber-300 text-white shadow-xs">
            <Sparkles className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-sky-950">
              Alur Pelayanan Pasien Klinik Gigi
            </h3>
            <p className="text-[11px] text-slate-500">
              Alur terpadu dari pendaftaran, panggilan kursi gigi, odontogram, obat & alat medis, hingga kasir dan buku kas.
            </p>
          </div>
        </div>
      </div>

      {/* Stepper Pipeline */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-3">
        {WORKFLOW_STEPS.map((item, idx) => {
          const Icon = item.icon;
          const isActive =
            pathname === item.href ||
            pathname.startsWith(item.href + "/") ||
            (item.aliases && item.aliases.some((a) => pathname.startsWith(a)));

          return (
            <Link
              key={item.id}
              href={item.href}
              className={cn(
                "group relative flex items-center gap-2.5 p-2.5 rounded-xl border transition-all select-none",
                isActive
                  ? "border-sky-500 bg-white shadow-md ring-2 ring-sky-400/30"
                  : "border-sky-100 bg-white/80 hover:bg-white hover:border-sky-300"
              )}
            >
              <div
                className={cn(
                  "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg font-bold text-xs transition-colors",
                  isActive
                    ? "bg-gradient-to-r from-sky-500 to-sky-600 text-white shadow-xs"
                    : "bg-sky-50 text-sky-700 group-hover:bg-sky-100 group-hover:text-sky-800"
                )}
              >
                {isActive ? <Icon className="h-4 w-4" /> : item.step}
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1">
                  <span
                    className={cn(
                      "text-xs font-bold truncate",
                      isActive
                        ? "text-sky-950"
                        : "text-slate-700 group-hover:text-sky-700"
                    )}
                  >
                    {item.title}
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 truncate">{item.desc}</p>
              </div>

              {idx < WORKFLOW_STEPS.length - 1 && (
                <div className="hidden lg:block absolute -right-2 top-1/2 -translate-y-1/2 z-10">
                  <ArrowRight className="h-3 w-3 text-sky-200" />
                </div>
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
