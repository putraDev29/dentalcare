"use client";

import * as React from "react";
import Link from "next/link";
import {
  Bell,
  Check,
  Calendar,
  Clock,
  AlertTriangle,
  ArrowRight,
  CheckCheck,
  CalendarClock,
  Sparkles,
} from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { useNotifications } from "@/hooks";
import { formatDateTime } from "@/lib/formatting";

export default function NotificationsPage() {
  const { notifications, markAsRead, markAllAsRead } = useNotifications();
  const [filterCat, setFilterCat] = React.useState<string>("");

  const filtered = notifications.filter((n) =>
    filterCat ? n.category === filterCat : true
  );

  const unreadTotal = notifications.filter((n) => !n.isRead).length;

  const categories = [
    { key: "", label: "Semua Kategori" },
    { key: "appointment", label: "Jadwal Kontrol (H-1)" },
    { key: "radiology", label: "Radiologi & Foto" },
    { key: "pharmacy", label: "Farmasi & Resep" },
    { key: "inventory", label: "Stok Bahan Dental" },
    { key: "billing", label: "Kasir & Billing" },
    { key: "system", label: "Sistem" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <PageHeader
          title="Pusat Notifikasi & Pengingat Kontrol Pasien"
          description=""
        />
        {unreadTotal > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => markAllAsRead?.()}
            className="self-start sm:self-auto gap-1.5 text-xs text-sky-700 border-sky-200 hover:bg-sky-50"
          >
            <CheckCheck className="h-3.5 w-3.5" />
            <span>Tandai Semua Sudah Dibaca ({unreadTotal})</span>
          </Button>
        )}
      </div>

      {/* Filter Category Chips */}
      <div className="flex flex-wrap items-center gap-2 text-xs">
        {categories.map((cat) => (
          <button
            key={cat.key}
            onClick={() => setFilterCat(cat.key)}
            className={`rounded-xl px-3.5 py-1.5 font-bold transition-all border cursor-pointer ${
              filterCat === cat.key
                ? "bg-sky-600 text-white border-sky-600 shadow-xs"
                : "bg-white text-slate-600 border-slate-200 hover:border-sky-300 hover:bg-sky-50/50"
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      <div className="space-y-3 max-w-4xl">
        {filtered.map((n) => {
          const isH1 = n.title.includes("H-1") || n.message.includes("H-1");
          return (
            <div
              key={n.id}
              onClick={() => {
                if (!n.isRead) {
                  markAsRead(n.id);
                }
              }}
              className={`p-4 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 cursor-pointer ${
                !n.isRead
                  ? "border-sky-200 bg-sky-50/40 shadow-xs hover:border-sky-300 hover:bg-sky-50/70"
                  : "border-slate-200 bg-white hover:bg-slate-50/60 opacity-90"
              }`}
            >
              <div className="flex items-start gap-3.5">
                <div
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl shadow-2xs ${
                    isH1
                      ? "bg-amber-100 text-amber-700 ring-2 ring-amber-200"
                      : n.severity === "error"
                      ? "bg-rose-100 text-rose-600"
                      : n.severity === "warning"
                      ? "bg-amber-100 text-amber-700"
                      : "bg-sky-100 text-sky-700"
                  }`}
                >
                  {isH1 ? (
                    <CalendarClock className="h-5 w-5" />
                  ) : n.category === "appointment" ? (
                    <Calendar className="h-5 w-5" />
                  ) : (
                    <Bell className="h-5 w-5" />
                  )}
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className={`text-xs sm:text-sm ${!n.isRead ? "font-bold text-slate-900" : "font-semibold text-slate-800"}`}>
                      {n.title}
                    </h4>
                    {isH1 && (
                      <span className="rounded-md bg-amber-100 border border-amber-200 px-2 py-0.5 text-[10px] font-black text-amber-800">
                        PENGINGAT H-1
                      </span>
                    )}
                    <span className="rounded bg-slate-100 px-1.5 py-0.2 text-[10px] uppercase font-mono text-slate-500">
                      {n.category}
                    </span>
                    {!n.isRead && (
                      <span className="h-2 w-2 rounded-full bg-rose-500 ring-2 ring-white" />
                    )}
                  </div>
                  <p className="text-xs text-slate-600 max-w-2xl leading-relaxed">
                    {n.message}
                  </p>
                  <p className="text-[10px] text-slate-400 font-mono">
                    {formatDateTime(n.timestamp)}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                {!n.isRead && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 text-xs gap-1 border-sky-200 text-sky-700 hover:bg-sky-50"
                    onClick={(e) => {
                      e.stopPropagation();
                      markAsRead(n.id);
                    }}
                  >
                    <Check className="h-3 w-3" />
                    <span>Tandai Dibaca</span>
                  </Button>
                )}
                {n.actionUrl && (
                  <Link
                    href={n.actionUrl}
                    onClick={(e) => {
                      e.stopPropagation();
                      markAsRead(n.id);
                    }}
                  >
                    <Button size="sm" className="h-8 text-xs gap-1 bg-sky-600 hover:bg-sky-700 text-white">
                      <span>Buka Modul</span>
                      <ArrowRight className="h-3 w-3" />
                    </Button>
                  </Link>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
