"use client";

import * as React from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  LineChart,
  Line,
  Legend,
} from "recharts";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { StatCard } from "@/components/shared/stat-card";
import { BarChart3, TrendingUp, Clock, Activity } from "lucide-react";
import { useDashboardStats } from "@/hooks";

export default function AnalyticsPage() {
  const { stats, loading } = useDashboardStats();

  const topDiagnoses = stats?.topDiagnoses || [];
  const waitTimes = stats?.waitTimes || [];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Statistik & Analitika Eksekutif Klinik Gigi"
        description="Analisis performa mendalam klinik gigi: tren morbiditas diagnosis dental, waktu tunggu antrean dental chair, dan utilisasi unit dental."
      />

      {/* Top Metrics */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
        <StatCard title="Rata-rata Waktu Tunggu" value={stats?.averageWaitTime || "10.5 Menit"} icon={Clock} iconColor="text-teal-600" />
        <StatCard title="Kepuasan Pasien (CSAT)" value={stats?.patientSatisfaction || "4.9 / 5.0"} icon={TrendingUp} iconColor="text-emerald-600" />
        <StatCard title="Tindakan Gigi Selesai" value={`${stats?.completedEncounters || 12} Prosedur`} icon={Activity} iconColor="text-blue-500" />
        <StatCard title="Utilisasi Dental Chair" value={stats?.chairUtilization || "83%"} icon={BarChart3} iconColor="text-purple-600" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Diagnoses Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Top Diagnosis Gigi & Mulut (ICD-10 Gigi)</CardTitle>
            <CardDescription>Kasus morbiditas terbanyak yang ditangani poliklinik gigi</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={topDiagnoses}
                  layout="vertical"
                  margin={{ top: 10, right: 20, left: 40, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
                  <XAxis type="number" tick={{ fontSize: 11, fill: "#64748b" }} />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: "#64748b" }} width={160} />
                  <Tooltip
                    formatter={(val) => [`${val} Kasus`, "Jumlah Pasien"]}
                    contentStyle={{ borderRadius: "12px", fontSize: "12px" }}
                  />
                  <Bar dataKey="cases" fill="#0d9488" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Average Waiting Time Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Rata-rata Waktu Tunggu per Unit Poli Gigi (Menit)</CardTitle>
            <CardDescription>Durasi dari pasien check-in antrean hingga dipanggil ke dental chair</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={waitTimes} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="poli" tick={{ fontSize: 11, fill: "#64748b" }} />
                  <YAxis tick={{ fontSize: 11, fill: "#64748b" }} />
                  <Tooltip
                    formatter={(val) => [`${val} Menit`, "Waktu Tunggu"]}
                    contentStyle={{ borderRadius: "12px", fontSize: "12px" }}
                  />
                  <Bar dataKey="waitMin" fill="#0284c7" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}