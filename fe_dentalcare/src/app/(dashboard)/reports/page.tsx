"use client";

import * as React from "react";
import Link from "next/link";
import {
  FileSpreadsheet,
  Download,
  FileText,
  Filter,
  Calendar,
  ExternalLink,
  ArrowRight,
  Landmark,
  Boxes,
  CheckCircle2,
  ArrowDownRight,
  Receipt,
  TrendingUp,
  Sparkles,
  CreditCard,
} from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { useFinance, useBilling } from "@/hooks";
import { formatCurrency, formatDate, formatDateTime } from "@/lib/formatting";

const REPORT_CARDS = [
  { id: "REP-01", title: "Laporan Registrasi Pasien Gigi Baru", desc: "Pertumbuhan demografis pasien baru klinik gigi, usia anak (pedodonsia), remaja, dan dewasa.", category: "Pasien", route: "/patients" },
  { id: "REP-02", title: "Laporan Kunjungan Unit Spesialis Gigi", desc: "Frekuensi pasien per poli gigi umum, ortodonti, konservasi gigi, bedah mulut, & periodonsia.", category: "Pelayanan", route: "/queue" },
  { id: "REP-03", title: "Laporan Rekapitulasi Tindakan Gigi", desc: "Volume tindakan scaling, tambal resin komposit, perawatan saluran akar, ekstraksi, & odontektomi.", category: "Tindakan", route: "/outpatient" },
  { id: "REP-04", title: "Laporan Indeks Karies & Gigi (DMF-T)", desc: "Statistik decayed, missing, filled teeth (DMF-T) pasien klinik untuk evaluasi kesehatan gigi.", category: "Klinis", route: "/outpatient" },
  { id: "REP-05", title: "Laporan Pendapatan Kasir Klinik Gigi", desc: "Rincian pendapatan kasir dari tindakan medis dental, jasa dokter gigi, dan sinkronisasi buku kas.", category: "Keuangan", route: "/finance", isHighlighted: true },
  { id: "REP-06", title: "Laporan Kinerja Dokter Gigi & Operator", desc: "Beban kerja dokter gigi spesialis, jumlah tindakan per chair, dan indeks kepuasan pasien.", category: "Medis", route: "/doctors" },
  { id: "REP-07", title: "Laporan Peresepan Farmasi Obat Gigi", desc: "Statistik peresepan amoxicillin, analgesik gigi, asam mefenamat, dan obat kumur klorheksidin.", category: "Farmasi", route: "/pharmacy" },
  { id: "REP-08", title: "Laporan Rontgen Gigi Panoramik & X-Ray", desc: "Jumlah foto panoramik OPG, foto periapikal intraoral, dan evaluasi hasil radiologi dental.", category: "Penunjang", route: "/outpatient" },
  { id: "REP-09", title: "Laporan Klaim Asuransi & BPJS Gigi", desc: "Status verifikasi klaim tindakan gigi kapitasi & non-kapitasi BPJS dan asuransi rekanan.", category: "Keuangan", route: "/insurance" },
  { id: "REP-10", title: "Laporan Pemakaian Bahan Dental (BMHP)", desc: "Mutasi persediaan komposit, bonding agent, etchant, jarum citoject, dan pehacain carpule.", category: "Inventori", route: "/pharmacy", isHighlighted: true },
];

export default function ReportsPage() {
  const { transactions, summary, loading: loadingFinance } = useFinance();
  const { invoices } = useBilling();

  // Extract automated patient payment transactions (Kas Masuk)
  const kasMasukTransactions = React.useMemo(() => {
    return transactions.filter((t) => t.type === "income");
  }, [transactions]);

  const todayStr = new Date().toISOString().split("T")[0];
  const totalKasMasuk = kasMasukTransactions.reduce((acc, t) => acc + (Number(t.amount) || 0), 0);
  const todayKasMasuk = kasMasukTransactions
    .filter((t) => t.date === todayStr || (t.createdAt && t.createdAt.startsWith(todayStr)))
    .reduce((acc, t) => acc + (Number(t.amount) || 0), 0);

  const handleExport = (format: string, title: string, repId?: string) => {
    const dateStr = new Date().toISOString().split("T")[0];

    // Specialized export for REP-05 (Laporan Pendapatan Kasir / Kas Masuk Otomatis)
    let exportRows: (string | number)[][] = [];

    if (repId === "REP-05" || title.toLowerCase().includes("pendapatan") || title.toLowerCase().includes("kasir")) {
      exportRows = [
        ["OKAY DENTAL - LAPORAN KAS MASUK (PENDAPATAN KASIR PASIEN)"],
        ["Sumber Data", "Otomatis Tersinkron dari Kasir & Pembayaran Pasien"],
        ["Tanggal Ekspor", dateStr],
        ["Total Akumulasi Kas Masuk", `Rp ${totalKasMasuk.toLocaleString("id-ID")}`],
        [],
        ["No", "Tanggal", "No. Transaksi Kas", "Uraian / Pasien", "Metode Pembayaran", "Jumlah Kas Masuk (Rp)", "Status Verifikasi"],
      ];

      if (kasMasukTransactions.length > 0) {
        kasMasukTransactions.forEach((trx, idx) => {
          exportRows.push([
            idx + 1,
            trx.date || (trx.createdAt ? trx.createdAt.split("T")[0] : dateStr),
            trx.transactionNumber || trx.id,
            `"${(trx.description || trx.notes || "Pembayaran Pasien").replace(/"/g, '""')}"`,
            (trx.paymentMethod || "Tunai").toUpperCase(),
            `Rp ${Number(trx.amount || 0).toLocaleString("id-ID")}`,
            "Lunas Otomatis Kasir",
          ]);
        });
      } else {
        // Fallback to paid invoices
        const paidInvoices = invoices.filter((i) => i.paidAmount > 0 || i.status === "paid");
        paidInvoices.forEach((inv, idx) => {
          exportRows.push([
            idx + 1,
            inv.invoiceDate || dateStr,
            inv.invoiceNumber,
            `"Pembayaran Pasien: ${inv.patientName} (${inv.patientMrn})"`,
            "KASIR DENTAL",
            `Rp ${Number(inv.paidAmount || inv.totalAmount).toLocaleString("id-ID")}`,
            "Lunas Otomatis Kasir",
          ]);
        });
      }

      exportRows.push([]);
      exportRows.push([
        "TOTAL KAS MASUK",
        "",
        "",
        "",
        "",
        `Rp ${totalKasMasuk.toLocaleString("id-ID")}`,
        "TERVERIFIKASI OTOMATIS",
      ]);
    } else {
      // Default structured report export
      exportRows = [
        [`OKAY DENTAL - ${title.toUpperCase()}`],
        ["Periode", "September 2026"],
        ["Tanggal Ekspor", dateStr],
        [],
        ["No", "Tanggal", "Uraian / Transaksi", "Kategori", "Jumlah", "Status"],
        [1, dateStr, "Tindakan Scaling & Polishing (Dental Chair 1)", "Pemasukan Tindakan", "Rp 350.000", "Lunas"],
        [2, dateStr, "Penambalan Komposit Sinar (Gigi #46)", "Pemasukan Tindakan", "Rp 450.000", "Lunas"],
        [3, dateStr, "Pembelian Restock Bahan Fuji IX GIC", "Pengeluaran Bahan Dental", "Rp 850.000", "Selesai"],
        [4, dateStr, "Resep Asam Mefenamat & Amoxicillin", "Pemasukan Farmasi", "Rp 95.000", "Lunas"],
        [],
        ["Total Rekapitulasi", "", "", "", "Rp 1.745.000", "Verified"],
      ];
    }

    if (format === "Excel" || format === "CSV") {
      const csvContent =
        "data:text/csv;charset=utf-8,\uFEFF" +
        exportRows.map((e) => e.join(",")).join("\n");
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `${title.replace(/\s+/g, "_")}_${dateStr}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success(`Berhasil mengunduh ${title} (Excel/CSV)`);
    } else {
      window.print();
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Pusat Laporan Klinik Gigi"
        description="Akses rekapitulasi laporan berkala operasional klinis gigi, rekap tindakan, odontogram, keuangan kasir, dan persediaan bahan dental."
      >
        <Link href="/finance">
          <Button variant="primary" size="sm" className="bg-teal-600 hover:bg-teal-700 text-white font-semibold gap-1.5 shadow-xs">
            <Landmark className="h-3.5 w-3.5" />
            <span>Buka Laporan Keuangan Terpadu</span>
          </Button>
        </Link>
      </PageHeader>

      {/* Real-time Automated Kas Masuk Feature Banner */}
      <div className="rounded-2xl border border-teal-200 bg-gradient-to-r from-teal-50 via-emerald-50/70 to-cyan-50/50 p-4 text-teal-950 dark:border-teal-900/60 dark:from-teal-950/40 dark:via-emerald-950/30 dark:to-cyan-950/20 dark:text-teal-200 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-teal-600 text-white shadow-xs">
              <CheckCircle2 className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                  Laporan Kas Masuk Otomatis Terhubung ke Kasir Pasien
                </h3>
                <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300">
                  Sinkron Real-time
                </span>
              </div>
              <p className="mt-0.5 text-xs text-slate-600 dark:text-slate-400 max-w-2xl">
                Setiap pembayaran tagihan pasien (konsultasi dokter gigi, tindakan scaling/tambal, odontogram, rontgen, dan resep obat) langsung masuk ke <strong>Buku Kas Masuk</strong> tanpa perlu input manual.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button
              size="sm"
              onClick={() => handleExport("CSV", "Laporan Pendapatan Kasir Gigi", "REP-05")}
              className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs gap-1.5 h-8 text-xs font-semibold"
            >
              <FileSpreadsheet className="h-3.5 w-3.5" />
              <span>Ekspor Kas Masuk (CSV)</span>
            </Button>
            <Link href="/finance">
              <Button
                variant="outline"
                size="sm"
                className="h-8 text-xs border-teal-300 text-teal-700 bg-white hover:bg-teal-50 dark:bg-slate-900 dark:border-teal-800 dark:text-teal-300 gap-1 shadow-xs"
              >
                <span>Buku Kas Keuangan</span>
                <ArrowRight className="h-3 w-3" />
              </Button>
            </Link>
          </div>
        </div>

        {/* Live Mini Stats Row */}
        <div className="mt-3.5 grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-3 border-t border-teal-200/60 dark:border-teal-900/50">
          <div className="rounded-xl bg-white/80 p-2.5 dark:bg-slate-900/80 border border-teal-100 dark:border-teal-900/40">
            <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Total Kas Masuk Terverifikasi</span>
            <p className="font-mono text-base font-bold text-emerald-600 dark:text-emerald-400">
              {formatCurrency(totalKasMasuk)}
            </p>
          </div>
          <div className="rounded-xl bg-white/80 p-2.5 dark:bg-slate-900/80 border border-teal-100 dark:border-teal-900/40">
            <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Kas Masuk Hari Ini</span>
            <p className="font-mono text-base font-bold text-teal-700 dark:text-teal-300">
              +{formatCurrency(todayKasMasuk)}
            </p>
          </div>
          <div className="rounded-xl bg-white/80 p-2.5 dark:bg-slate-900/80 border border-teal-100 dark:border-teal-900/40">
            <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Jumlah Pembayaran Pasien</span>
            <p className="font-mono text-base font-bold text-slate-800 dark:text-slate-200">
              {kasMasukTransactions.length} Transaksi Lunas
            </p>
          </div>
        </div>
      </div>

      {/* Global Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-3.5 text-xs dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-wrap items-center gap-3">
          <span className="font-semibold text-slate-500 flex items-center gap-1">
            <Calendar className="h-3.5 w-3.5" /> Rentang Waktu:
          </span>
          <select className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-1 text-xs text-slate-700 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-300">
            <option>Bulan Ini (September 2026)</option>
            <option>Bulan Lalu (Agustus 2026)</option>
            <option>Kuartal 3 (Jul - Sep 2026)</option>
            <option>Tahun Berjalan (YTD 2026)</option>
          </select>

          <span className="font-semibold text-slate-500 ml-2">Poli Spesialis Gigi:</span>
          <select className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-1 text-xs text-slate-700 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-300">
            <option>Seluruh Unit Poli Gigi</option>
            <option>Poli Gigi Umum</option>
            <option>Konservasi Gigi (Endodonti)</option>
            <option>Ortodonti (Kawat Gigi)</option>
            <option>Bedah Mulut (Oral Surgery)</option>
            <option>Pedodonsia (Gigi Anak)</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <Link href="/finance">
            <Button variant="outline" size="sm" className="h-7 text-xs gap-1 border-teal-300 text-teal-700 dark:border-teal-800">
              <Landmark className="h-3 w-3" />
              <span>Buku Kas & Laporan Laba Bersih</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* 10 Report Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {REPORT_CARDS.map((rep) => (
          <Card
            key={rep.id}
            className={`transition-all ${
              rep.isHighlighted
                ? "border-teal-300 bg-teal-50/20 dark:border-teal-800 dark:bg-teal-950/10 shadow-xs"
                : "hover:border-teal-300"
            }`}
          >
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div className="flex items-center gap-2.5">
                <div
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
                    rep.isHighlighted
                      ? "bg-teal-600 text-white"
                      : "bg-teal-50 text-teal-600 dark:bg-teal-950 dark:text-teal-400"
                  }`}
                >
                  {rep.id === "REP-05" ? (
                    <Landmark className="h-4 w-4" />
                  ) : rep.id === "REP-10" ? (
                    <Boxes className="h-4 w-4" />
                  ) : (
                    <FileText className="h-4 w-4" />
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-teal-700 dark:text-teal-400">
                      {rep.category}
                    </span>
                    {rep.isHighlighted && (
                      <span className="rounded-full bg-teal-100 px-2 py-0.2 text-[9px] font-bold text-teal-800 dark:bg-teal-900/60 dark:text-teal-300">
                        Sinkron Keuangan
                      </span>
                    )}
                  </div>
                  <CardTitle className="text-sm font-semibold">{rep.title}</CardTitle>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-xs">{rep.desc}</CardDescription>
              <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-3 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[11px] text-slate-400">{rep.id}</span>
                  {rep.route && (
                    <Link
                      href={rep.route}
                      className="text-[11px] text-teal-600 hover:text-teal-700 font-semibold flex items-center gap-0.5"
                    >
                      <span>Lihat Live</span>
                      <ArrowRight className="h-3 w-3" />
                    </Link>
                  )}
                </div>
                <div className="flex items-center gap-1.5">
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-7 text-xs gap-1"
                    onClick={() => handleExport("PDF", rep.title, rep.id)}
                  >
                    <Download className="h-3 w-3" />
                    <span>PDF / Cetak</span>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-7 text-xs gap-1 border-emerald-300 text-emerald-700 hover:bg-emerald-50 dark:border-emerald-800"
                    onClick={() => handleExport("Excel", rep.title, rep.id)}
                  >
                    <FileSpreadsheet className="h-3 w-3 text-emerald-600" />
                    <span>Excel (CSV)</span>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Live Preview Table: Recent Patient Kas Masuk Transactions */}
      <Card className="border-teal-200 dark:border-teal-900/60 shadow-xs">
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <div>
            <div className="flex items-center gap-2">
              <CardTitle className="text-sm font-bold flex items-center gap-1.5">
                <ArrowDownRight className="h-4 w-4 text-emerald-600" />
                <span>Rincian Transaksi Kas Masuk Terkini (Otomatis dari Kasir)</span>
              </CardTitle>
              <Badge variant="success" size="sm" className="gap-1">
                <span>Otomatis Sinkron</span>
              </Badge>
            </div>
            <CardDescription className="text-xs">
              Menampilkan bukti pencatatan kas masuk yang otomatis terbit saat pembayaran kasir pasien berhasil diselesaikan.
            </CardDescription>
          </div>
          <Button
            size="sm"
            variant="outline"
            className="h-7 text-xs border-emerald-300 text-emerald-700 bg-white hover:bg-emerald-50 dark:bg-slate-900 dark:border-emerald-800"
            onClick={() => handleExport("CSV", "Laporan Pendapatan Kasir Gigi", "REP-05")}
          >
            <Download className="h-3 w-3 mr-1" />
            <span>Unduh Laporan Kas Masuk</span>
          </Button>
        </CardHeader>
        <CardContent>
          {loadingFinance ? (
            <div className="py-6 text-center text-xs text-slate-500">Memuat mutasi kas masuk...</div>
          ) : kasMasukTransactions.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-500">
              <Receipt className="mx-auto h-8 w-8 text-slate-300 mb-2" />
              <p className="font-semibold text-slate-700 dark:text-slate-300">Belum ada kas masuk tercatat hari ini.</p>
              <p className="mt-1">Transaksi kas masuk akan otomatis muncul saat kasir menerima pembayaran pasien.</p>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 border-b border-slate-200 dark:bg-slate-800/60 dark:border-slate-800 font-semibold">
                  <tr>
                    <th className="py-2.5 px-3">Tanggal</th>
                    <th className="py-2.5 px-3">No. Transaksi</th>
                    <th className="py-2.5 px-3">Uraian / Pasien</th>
                    <th className="py-2.5 px-3">Metode Bayar</th>
                    <th className="py-2.5 px-3 text-right">Kas Masuk (Rp)</th>
                    <th className="py-2.5 px-3 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {kasMasukTransactions.slice(0, 8).map((trx) => (
                    <tr key={trx.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                      <td className="py-2 px-3 font-mono text-slate-600 dark:text-slate-400 whitespace-nowrap">
                        {trx.date ? formatDate(trx.date) : formatDateTime(trx.createdAt)}
                      </td>
                      <td className="py-2 px-3 font-mono font-semibold text-teal-700 dark:text-teal-400 whitespace-nowrap">
                        {trx.transactionNumber || trx.id}
                      </td>
                      <td className="py-2 px-3 max-w-xs truncate font-medium text-slate-800 dark:text-slate-200">
                        {trx.description || trx.notes || "Pembayaran Tagihan Pasien"}
                      </td>
                      <td className="py-2 px-3 uppercase font-semibold text-slate-600 dark:text-slate-400 text-[11px] whitespace-nowrap">
                        {trx.paymentMethod || "Tunai"}
                      </td>
                      <td className="py-2 px-3 font-mono font-bold text-emerald-600 dark:text-emerald-400 text-right whitespace-nowrap">
                        +{formatCurrency(trx.amount)}
                      </td>
                      <td className="py-2 px-3 text-center whitespace-nowrap">
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                          <CheckCircle2 className="h-2.5 w-2.5" />
                          <span>Lunas Otomatis</span>
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
