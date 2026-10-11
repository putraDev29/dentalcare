"use client";

import * as React from "react";
import Link from "next/link";
import {
  Users,
  CalendarCheck,
  Clock,
  Receipt,
  Pill,
  Scan,
  Activity,
  ChevronRight,
  Sparkles,
  AlertTriangle,
  Stethoscope,
  CheckCircle2,
} from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/shared/stat-card";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/shared/status-badge";
import { formatCurrency } from "@/lib/formatting";
import { useQueue, useAppointments, usePharmacy, useDashboardStats } from "@/hooks";

export default function DashboardPage() {
  const [trendRange, setTrendRange] = React.useState<"7d" | "30d" | "3m">("7d");
  const { stats, loading } = useDashboardStats(trendRange);
  const { queues } = useQueue();
  const { appointments } = useAppointments();
  const { medicines } = usePharmacy();

  const visitTrendData = React.useMemo(() => {
    if (stats?.visitTrends && stats.visitTrends[trendRange]) {
      return stats.visitTrends[trendRange];
    }
    return stats?.visitTrend || [];
  }, [stats, trendRange]);

  const specialtyData = stats?.specialties || [];
  const revenueData = stats?.revenueTrend || [];
  const demographicsData = stats?.demographics || [];
  const dentalChairs = stats?.dentalChairs || [];
  const lowStockMaterials = stats?.lowStockMaterials || [];
  const topDiagnoses = stats?.topDiagnoses || [];
  const waitTimes = stats?.waitTimes || [];

  return (
    <div className="space-y-6">
      {/* OKAY Dental Cheerful Welcome Card */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-sky-500 via-sky-400 to-rose-400 p-5 sm:p-6 text-white shadow-lg shadow-sky-500/20">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/20 backdrop-blur-md px-3 py-1 text-xs font-semibold text-white">
              <Sparkles className="h-3.5 w-3.5 text-amber-200" />
              <span>OKAY Dental • Praktek Dokter Gigi & Odontogram Modern</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-2">
              Selamat Datang di OKAY Dental! ✨
            </h1>
            <p className="text-xs sm:text-sm text-sky-50 max-w-xl font-medium">
              Senyum sehat & cerah pasien prioritas kami. Kelola antrean dental chair, odontogram digital, rekam medis, dan kasir keuangan.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/encounters/new">
              <Button size="sm" className="bg-white text-sky-700 hover:bg-sky-50 font-bold shadow-md shadow-black/10 border-0">
                <Sparkles className="h-4 w-4 text-amber-500" />
                <span>Pemeriksaan Baru</span>
              </Button>
            </Link>
            <Link href="/patients/new">
              <Button size="sm" variant="outline" className="bg-white/20 hover:bg-white/30 text-white border-white/40 font-bold backdrop-blur-sm">
                + Pasien Baru
              </Button>
            </Link>
          </div>
        </div>

        {/* Decorative Background Glows */}
        <div className="absolute -top-12 -right-12 h-44 w-44 rounded-full bg-rose-300/30 blur-2xl" />
        <div className="absolute -bottom-10 right-32 h-36 w-36 rounded-full bg-amber-200/30 blur-2xl" />
      </div>

      {/* 8 Dental Summary Cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 lg:grid-cols-4 sm:gap-4">
        <StatCard
          title="Pasien Gigi Hari Ini"
          value={`${stats?.patientsToday ?? 0} Pasien`}
          subtitle={`${stats?.totalPatients ?? 0} total pasien terdaftar`}
          trend={{ value: "15.4%", isPositive: true }}
          icon={Users}
          iconBgColor="bg-sky-50"
          iconColor="text-sky-600"
        />
        <StatCard
          title="Janji Temu Gigi"
          value={`${stats?.appointmentsToday ?? appointments.length} Janji Temu`}
          subtitle="Tingkat kehadiran 96%"
          trend={{ value: "4.8%", isPositive: true }}
          icon={CalendarCheck}
          iconBgColor="bg-rose-50"
          iconColor="text-rose-500"
        />
        <StatCard
          title="Antrean Dental Chair"
          value={`${stats?.waitingQueues ?? queues.filter((q) => q.status === "waiting").length} Pasien`}
          subtitle={`Rata-rata tunggu ${stats?.averageWaitTime ?? "10.5 mnt"}`}
          icon={Clock}
          iconBgColor="bg-amber-50"
          iconColor="text-amber-600"
        />
        <StatCard
          title="Tindakan Gigi Selesai"
          value={`${stats?.completedEncounters ?? 12} Prosedur`}
          subtitle="Scaling, Tambal, PSA & Ekstraksi"
          icon={Stethoscope}
          iconBgColor="bg-pink-50"
          iconColor="text-pink-600"
        />
        <StatCard
          title="Pendapatan Kasir Gigi"
          value={formatCurrency(stats?.todayRevenue ?? 0)}
          subtitle={`Bulan ini: ${formatCurrency(stats?.monthlyRevenue ?? 0)}`}
          trend={{ value: "11.2%", isPositive: true }}
          icon={Receipt}
          iconBgColor="bg-emerald-50"
          iconColor="text-emerald-600"
        />
        <StatCard
          title="Resep Obat Dental"
          value={`${stats?.prescriptionsCount ?? 12} Resep`}
          subtitle="Antibiotik & Analgesik Gigi"
          icon={Pill}
          iconBgColor="bg-sky-50"
          iconColor="text-sky-600"
        />
        <StatCard
          title="Rontgen Gigi Digital"
          value={`${stats?.radiologyCount ?? 14} Foto`}
          subtitle="Panoramik OPG & Periapikal"
          trend={{ value: "100% Siap", isPositive: true }}
          icon={Scan}
          iconBgColor="bg-rose-50"
          iconColor="text-rose-600"
        />
        <StatCard
          title="Utilisasi Dental Chair"
          value={stats?.chairUtilization ?? "83%"}
          subtitle="Kapasitas Dental Unit Aktif"
          icon={Activity}
          iconBgColor="bg-amber-50"
          iconColor="text-amber-700"
        />
      </div>

      {/* Main Charts Row */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Patient Visits Trend */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle>Tren Pasien Pemeriksaan Gigi</CardTitle>
            </div>
            <div className="flex rounded-xl bg-slate-100 p-1 text-[11px] font-medium">
              {(["7d", "30d", "3m"] as const).map((range) => (
                <button
                  key={range}
                  onClick={() => setTrendRange(range)}
                  className={`px-2.5 py-1 rounded-lg transition-colors ${
                    trendRange === range
                      ? "bg-white text-sky-700 shadow-xs font-semibold"
                      : "text-slate-500 hover:text-slate-900"
                  }`}
                >
                  {range === "7d" ? "7 Hari" : range === "30d" ? "30 Hari" : "3 Bulan"}
                </button>
              ))}
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-72 w-full pt-4">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={visitTrendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorTotalDental" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0284c7" stopOpacity={0.35} />
                      <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0.0} />
                    </linearGradient>
                    <linearGradient id="colorUmumDental" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#fb7185" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#f43f5e" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" opacity={0.6} />
                  <XAxis dataKey="day" tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: "#64748b" }} />
                  <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: "#64748b" }} />
                  <Tooltip
                    formatter={(val: any, name: any) => [`${val} Pasien`, name]}
                    labelFormatter={(label) => `Periode: ${label}`}
                    contentStyle={{
                      backgroundColor: "#ffffff",
                      borderRadius: "12px",
                      border: "1px solid #e2e8f0",
                      fontSize: "12px",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: "11px", paddingTop: "6px" }} />
                  <Area
                    type="monotone"
                    dataKey="total"
                    stroke="#0284c7"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#colorTotalDental)"
                    name="Total Pasien Gigi"
                  />
                  <Area
                    type="monotone"
                    dataKey="umum"
                    stroke="#fb7185"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorUmumDental)"
                    name="Poli Gigi Umum"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Specialty Distribution Donut Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Distribusi Layanan Dental</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center">
            <div className="h-52 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={specialtyData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {specialtyData.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={entry.color || "#0d9488"} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(val) => [`${val}%`, "Pangsa"]}
                    contentStyle={{
                      backgroundColor: "#ffffff",
                      borderRadius: "12px",
                      border: "1px solid #e2e8f0",
                      fontSize: "12px",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-2 gap-x-3 gap-y-2 text-xs w-full pt-2">
              {specialtyData.map((item: any) => (
                <div key={item.name} className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color || "#0d9488" }} />
                  <span className="text-slate-600 dark:text-slate-400 truncate">{item.name}</span>
                  <span className="ml-auto font-semibold">{item.value}%</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Second Row: Revenue & Demographics */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Revenue Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Tren Pendapatan Kasir Gigi (Juta Rp)</CardTitle>
            <CardDescription>Pendapatan tindakan dental, jasa dokter gigi, dan obat</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={revenueData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" opacity={0.6} />
                  <XAxis dataKey="month" tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: "#64748b" }} />
                  <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: "#64748b" }} />
                  <Tooltip
                    formatter={(val) => [`Rp ${val} Juta`, "Pendapatan"]}
                    contentStyle={{
                      backgroundColor: "#ffffff",
                      borderRadius: "12px",
                      border: "1px solid #e2e8f0",
                      fontSize: "12px",
                    }}
                  />
                  <Bar dataKey="revenue" fill="#0284c7" radius={[6, 6, 0, 0]} name="Pendapatan (Juta Rp)" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Demographics Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Demografi Pasien Gigi Berdasarkan Usia</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={demographicsData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" opacity={0.6} />
                  <XAxis dataKey="ageGroup" tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: "#64748b" }} />
                  <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: "#64748b" }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#ffffff",
                      borderRadius: "12px",
                      border: "1px solid #e2e8f0",
                      fontSize: "12px",
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: "11px", paddingTop: "8px" }} />
                  <Bar dataKey="male" fill="#0284c7" name="Laki-laki" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="female" fill="#ec4899" name="Perempuan" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Third Row: Top Diagnoses & Service Wait Times */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Top 6 Diagnoses Dental */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle>Top Diagnosa Kasus Gigi (ICD-10)</CardTitle>
            </div>
            <Link href="/master-data">
              <Button variant="ghost" size="sm" className="h-7 text-xs text-teal-600 gap-1 p-1">
                <span>Katalog ICD-10</span>
                <ChevronRight className="h-3.5 w-3.5" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="space-y-3 pt-2">
            {topDiagnoses.slice(0, 6).map((item: any) => {
              const maxCases = Math.max(...topDiagnoses.map((d: any) => d.cases || d.count || 1), 1);
              const percentage = Math.round(((item.cases || item.count || 0) / maxCases) * 100);
              return (
                <div key={item.code} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="font-mono text-[10px] font-bold px-1.5 py-0.5 rounded bg-teal-50 text-teal-700 dark:bg-teal-950/60 dark:text-teal-300">
                        {item.code}
                      </span>
                      <span className="font-medium text-slate-800 dark:text-slate-200 truncate">
                        {item.name}
                      </span>
                    </div>
                    <span className="font-semibold text-slate-700 dark:text-slate-300 shrink-0 ml-2">
                      {item.cases || item.count} Kasus
                    </span>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-linear-to-r from-teal-500 to-teal-600 transition-all duration-500"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Efisiensi & Waktu Tunggu Pelayanan Dental */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle>Efisiensi Waktu Tunggu Poli Gigi</CardTitle>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-emerald-600 font-semibold bg-emerald-50 px-2 py-0.5 rounded-full">
              <CheckCircle2 className="h-3.5 w-3.5" />
              <span>SLA Target &lt; 15 Mnt</span>
            </div>
          </CardHeader>
          <CardContent className="space-y-3.5 pt-2">
            <div className="grid grid-cols-2 gap-3 pb-2">
              <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-3 dark:border-slate-800 dark:bg-slate-800/40 text-center">
                <p className="text-[11px] text-slate-500 dark:text-slate-400">Rata-rata Waktu Tunggu</p>
                <p className="text-xl font-bold text-teal-600 dark:text-teal-400">{stats?.averageWaitTime ?? "10.5 Menit"}</p>
                <p className="text-[10px] text-slate-400">Semua Poli Dental</p>
              </div>
              <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-3 dark:border-slate-800 dark:bg-slate-800/40 text-center">
                <p className="text-[11px] text-slate-500 dark:text-slate-400">Kepuasan Pasien</p>
                <p className="text-xl font-bold text-amber-500">{stats?.patientSatisfaction ?? "4.9 / 5.0"}</p>
                <p className="text-[10px] text-slate-400">Berdasarkan 128 Review</p>
              </div>
            </div>

            <div className="space-y-2">
              {waitTimes.map((w: any) => (
                <div key={w.poli} className="flex items-center justify-between text-xs p-2 rounded-lg bg-slate-50/50 dark:bg-slate-800/30">
                  <span className="font-medium text-slate-700 dark:text-slate-300">{w.poli}</span>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-teal-600 dark:text-teal-400">{w.waitMin} mnt</span>
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Operational Widgets Row */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Antrean Dental Chair Widget */}
        <Card className="lg:col-span-1">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <div>
              <CardTitle>Antrean Dental Chair</CardTitle>
            </div>
            <Link href="/queue">
              <Button variant="ghost" size="sm" className="h-7 text-xs text-sky-600 gap-1 p-1">
                <span>Lihat Semua</span>
                <ChevronRight className="h-3.5 w-3.5" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="space-y-3">
            {queues.slice(0, 4).map((q) => (
              <div
                key={q.id}
                className="flex items-center justify-between rounded-xl border border-sky-100 bg-sky-50/40 p-3 shadow-2xs hover:border-sky-200 transition-all"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="flex px-3 py-1.5 shrink-0 items-center justify-center rounded-xl bg-gradient-to-r from-sky-500 to-sky-600 text-white font-black text-sm whitespace-nowrap shadow-xs">
                    {q.queueNumber}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-800 truncate">
                      {q.patientName}
                    </p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      {q.departmentName} • {q.doctorName}
                    </p>
                  </div>
                </div>
                <StatusBadge type="queue" status={q.status} />
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Dental Chair Status Monitor */}
        <Card className="lg:col-span-1">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <div>
              <CardTitle>Status Unit Dental Chair</CardTitle>
            </div>
            <Link href="/outpatient">
              <Button variant="ghost" size="sm" className="h-7 text-xs text-sky-600 gap-1 p-1">
                <span>Ruang Praktik</span>
                <ChevronRight className="h-3.5 w-3.5" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="space-y-2.5">
            {dentalChairs.map((chair: any) => (
              <div
                key={chair.id}
                className="flex items-center justify-between p-2.5 rounded-xl border border-slate-100 bg-white dark:border-slate-800 dark:bg-slate-900"
              >
                <div className="min-w-0 pr-2">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-xs text-slate-800 dark:text-slate-200">{chair.name}</span>
                    <span className="text-[10px] text-slate-400">• {chair.unit}</span>
                  </div>
                  <p className="text-[11px] text-slate-500 truncate">{chair.procedure}</p>
                </div>
                <div className="shrink-0">
                  {chair.status === "occupied" && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-2 py-0.5 text-[10px] font-semibold text-rose-700 dark:bg-rose-950/50 dark:text-rose-400">
                      <span className="h-1.5 w-1.5 rounded-full bg-rose-500 animate-pulse" />
                      Tindakan
                    </span>
                  )}
                  {chair.status === "sanitizing" && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-semibold text-amber-700 dark:bg-amber-950/50 dark:text-amber-400">
                      <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                      Sterilisasi
                    </span>
                  )}
                  {chair.status === "available" && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                      Tersedia
                    </span>
                  )}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Low Stock Dental Materials Alert */}
        <div className="space-y-6 lg:col-span-1">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div>
                <CardTitle>Stok Bahan Dental Kritis</CardTitle>
              </div>
              <Link href="/inventory">
                <Button variant="ghost" size="sm" className="h-7 text-xs text-sky-600 gap-1 p-1">
                  <span>Inventory</span>
                  <ChevronRight className="h-3.5 w-3.5" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent className="space-y-2.5">
              {lowStockMaterials.map((mat: any) => (
                <div
                  key={mat.name}
                  className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50/70 p-2.5 dark:border-slate-800 dark:bg-slate-800/40 text-xs"
                >
                  <div className="min-w-0 pr-2">
                    <p className="font-semibold text-slate-800 dark:text-slate-200 truncate">{mat.name}</p>
                    <p className="text-[11px] text-slate-400">Min. buffer: {mat.min}</p>
                  </div>
                  <div className="shrink-0 text-right">
                    <span className="font-bold text-rose-600 dark:text-rose-400">{mat.stock}</span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Quick Dental Action Card */}
          <div className="rounded-2xl border border-sky-200 bg-linear-to-br from-sky-500/10 via-rose-500/5 to-amber-300/10 p-4 shadow-2xs">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-sky-500 to-sky-600 text-white shadow-sm">
                <Sparkles className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-sky-950">
                  Pemeriksaan Pasien Gigi Baru
                </h4>
                <p className="text-[11px] text-slate-600">
                  Input odontogram intraoral dan pilih prosedur tindakan dental.
                </p>
              </div>
            </div>
            <div className="mt-3 flex gap-2">
              <Link href="/queue" className="w-full">
                <Button size="sm" className="w-full text-xs shadow-xs">
                  Buka Antrean & Mulai Pemeriksaan
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}