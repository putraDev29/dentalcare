"use client";

import * as React from "react";
import {
  QrCode,
  RefreshCw,
  Send,
  PowerOff,
  Radio,
  Smartphone,
  LogOut,
  AlertCircle,
  Trash2,
} from "lucide-react";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { appConfig } from "@/config/app-config";

interface WhatsAppGatewayDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function WhatsAppGatewayDialog({
  open,
  onOpenChange,
}: WhatsAppGatewayDialogProps) {
  const [status, setStatus] = React.useState<{
    status?: string;
    connected?: boolean;
    phone?: string;
    name?: string;
    lastError?: string | null;
  } | null>(null);
  const [qrCode, setQrCode] = React.useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = React.useState(false);
  const [isLoggingOut, setIsLoggingOut] = React.useState(false);
  const [testPhone, setTestPhone] = React.useState("");
  const [testMessage, setTestMessage] = React.useState("Halo, ini pesan uji coba dari OKAY Dental Clinic!");
  const [isSendingTest, setIsSendingTest] = React.useState(false);

  const fetchQr = React.useCallback(async () => {
    try {
      const res = await fetch(`${appConfig.apiUrl}/whatsapp/qr`);
      if (res.ok) {
        const data = await res.json();
        if (data.qr) {
          setQrCode(data.qr);
        }
      }
    } catch {
      // Ignored
    }
  }, []);

  const fetchStatus = React.useCallback(async () => {
    try {
      const res = await fetch(`${appConfig.apiUrl}/whatsapp/status`);
      if (res.ok) {
        const data = await res.json();
        setStatus(data);
        if (data.status === "QR_READY") {
          fetchQr();
        } else if (data.status === "CONNECTED") {
          setQrCode(null);
        }
      }
    } catch {
      setStatus({ status: "OFFLINE", connected: false });
    }
  }, [fetchQr]);

  React.useEffect(() => {
    if (!open) return;
    const loadInitial = () => {
      fetchStatus();
    };
    loadInitial();

    // Poll status every 4 seconds while dialog is open
    const interval = setInterval(fetchStatus, 4000);
    return () => clearInterval(interval);
  }, [open, fetchStatus]);

  const handleReconnect = async () => {
    setIsRefreshing(true);
    try {
      let res;
      try {
        res = await fetch(`${appConfig.apiUrl}/whatsapp/reconnect`, { method: "POST" });
      } catch {
        res = await fetch("http://127.0.0.1:21465/api/reconnect", { method: "POST" });
      }

      if (res && res.ok) {
        toast.info("Menginisialisasi ulang gateway WhatsApp...");
        setTimeout(fetchStatus, 2000);
      } else {
        toast.error("Gagal menghubungkan ulang ke gateway.");
      }
    } catch {
      toast.error("Server WPPConnect Gateway (port 21465) belum berjalan.");
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleLogout = async () => {
    if (!window.confirm("Apakah Anda yakin ingin logout dari akun WhatsApp ini? Koneksi akan diputus dan QR code baru akan disiapkan.")) {
      return;
    }

    setIsLoggingOut(true);
    try {
      let res;
      try {
        res = await fetch(`${appConfig.apiUrl}/whatsapp/logout`, { method: "POST" });
      } catch {
        res = await fetch("http://127.0.0.1:21465/api/logout", { method: "POST" });
      }

      const data = await res.json().catch(() => null);
      if (res && res.ok && data?.success !== false) {
        toast.success(data?.message || "Berhasil logout dari WhatsApp.");
        setStatus({ status: "DISCONNECTED", connected: false });
        setQrCode(null);
        setTimeout(fetchStatus, 2000);
      } else {
        toast.error(data?.message || "Gagal melakukan logout.");
      }
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Terjadi kesalahan";
      toast.error("Gagal menghubungi gateway untuk logout: " + msg);
    } finally {
      setIsLoggingOut(false);
    }
  };

  const handleSendTestMessage = async () => {
    if (!testPhone.trim()) {
      toast.error("Masukkan nomor HP penerima!");
      return;
    }

    setIsSendingTest(true);
    try {
      const res = await fetch(`${appConfig.apiUrl}/whatsapp/send`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone: testPhone,
          message: testMessage,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        toast.success(`Pesan uji coba berhasil terkirim ke ${data.to || testPhone}!`);
      } else {
        toast.error(data.message || "Gagal mengirim pesan uji coba.", { duration: 10000 });
      }
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Terjadi kesalahan";
      toast.error("Gagal menghubungi server WhatsApp: " + msg, { duration: 6000 });
    } finally {
      setIsSendingTest(false);
    }
  };

  const [isClearingChat, setIsClearingChat] = React.useState(false);

  const handleClearChat = async () => {
    if (!testPhone.trim()) {
      toast.error("Masukkan nomor HP yang ingin di-reset antriannya.");
      return;
    }
    setIsClearingChat(true);
    try {
      const res = await fetch("http://127.0.0.1:21465/api/clear-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: testPhone }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(`Berhasil membersihkan antrian/sesi obrolan nomor ${testPhone}.`);
      } else {
        toast.error(data.message || "Gagal membersihkan antrian obrolan.");
      }
    } catch {
      toast.error("Gagal menghubungi WhatsApp Gateway.");
    } finally {
      setIsClearingChat(false);
    }
  };

  const isConnected = status?.connected || status?.status === "CONNECTED";
  const isQrReady = status?.status === "QR_READY" || (!isConnected && qrCode);
  const isOffline = status?.status === "OFFLINE" || !status;

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
      title="WPPConnect WhatsApp Gateway"
      description="Server gateway WhatsApp lokal mandiri untuk pengiriman pesan otomatis di latar belakang (background job)."
      className="max-w-xl"
    >
      <div className="space-y-5">
        {/* Status Badge */}
        <div className="flex items-center justify-between p-3.5 rounded-2xl border border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center gap-3">
            <div
              className={`flex h-9 w-9 items-center justify-center rounded-xl text-white shadow-xs ${
                isConnected
                  ? "bg-emerald-600"
                  : isQrReady
                  ? "bg-amber-500 animate-pulse"
                  : "bg-rose-500"
              }`}
            >
              {isConnected ? (
                <Radio className="h-5 w-5" />
              ) : isQrReady ? (
                <QrCode className="h-5 w-5" />
              ) : (
                <PowerOff className="h-5 w-5" />
              )}
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  Status Gateway:
                </span>
                <span
                  className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                    isConnected
                      ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                      : isQrReady
                      ? "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300"
                      : "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300"
                  }`}
                >
                  {isConnected
                    ? "🟢 Terhubung (Online)"
                    : isQrReady
                    ? "🟡 Menunggu Scan QR"
                    : "🔴 Offline / Disconnected"}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                {isConnected
                  ? `Nomor Klinik: ${status?.phone || "Terhubung"} (${status?.name || "OKAY Dental"})`
                  : isQrReady
                  ? "Silakan scan QR code di bawah menggunakan WhatsApp HP klinik"
                  : "Service gateway lokal di port 21465 belum aktif"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {isConnected && (
              <Button
                size="sm"
                variant="outline"
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="h-8 text-xs gap-1.5 border-rose-200 text-rose-600 hover:bg-rose-50 hover:text-rose-700 dark:border-rose-900/50 dark:text-rose-400 dark:hover:bg-rose-950/40"
                title="Keluar / Putus koneksi WhatsApp"
              >
                <LogOut className={`h-3 w-3 ${isLoggingOut ? "animate-spin" : ""}`} />
                <span>{isLoggingOut ? "Logout..." : "Logout"}</span>
              </Button>
            )}
            <Button
              size="sm"
              variant="outline"
              onClick={handleReconnect}
              disabled={isRefreshing}
              className="h-8 text-xs gap-1.5"
              title="Muat ulang koneksi gateway"
            >
              <RefreshCw className={`h-3 w-3 ${isRefreshing ? "animate-spin" : ""}`} />
              <span>Refresh</span>
            </Button>
          </div>
        </div>

        {/* QR Code Scan Area */}
        {!isConnected && (
          <div className="space-y-4">
            <div className="flex flex-col items-center justify-center p-6 rounded-2xl border border-dashed border-slate-300 bg-white dark:border-slate-800 dark:bg-slate-900 text-center">
              {qrCode ? (
                <div className="space-y-3">
                  <div className="p-3 bg-white rounded-2xl shadow-md border inline-block">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={qrCode}
                      alt="WhatsApp QR Code"
                      className="w-56 h-56 object-contain"
                    />
                  </div>
                  <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Arahkan kamera WhatsApp HP Anda ke QR Code di atas
                  </p>
                </div>
              ) : (
                <div className="py-6 space-y-2">
                  <QrCode className="h-12 w-12 text-slate-300 mx-auto animate-pulse" />
                  <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">
                    {isOffline
                      ? "WPPConnect Gateway service belum aktif di port 21465."
                      : "Sedang menyiapkan QR Code WhatsApp..."}
                  </p>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleReconnect}
                    className="mt-2 text-xs h-8"
                  >
                    Minta QR Code Baru
                  </Button>
                </div>
              )}
            </div>

            {/* Instruction Steps */}
            <div className="rounded-xl bg-slate-50 p-3.5 border border-slate-200 text-xs text-slate-600 dark:bg-slate-800/50 dark:border-slate-800 dark:text-slate-300 space-y-2">
              <p className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <Smartphone className="h-4 w-4 text-teal-600" />
                Cara Menghubungkan WhatsApp Klinik:
              </p>
              <ol className="list-decimal list-inside space-y-1 text-[11px] leading-relaxed pl-1 text-slate-600 dark:text-slate-400">
                <li>Buka aplikasi <strong>WhatsApp</strong> di smartphone nomor resmi klinik.</li>
                <li>Ketuk ikon <strong>Titik Tiga (⋮)</strong> di Android atau <strong>Pengaturan (Settings)</strong> di iPhone.</li>
                <li>Pilih menu <strong>Perangkat Tertaut (Linked Devices)</strong>.</li>
                <li>Ketuk <strong>Tautkan Perangkat (Link a Device)</strong>, lalu scan QR Code di atas.</li>
              </ol>
            </div>
          </div>
        )}

        {/* Test Send Message Area (when connected) */}
        {isConnected && (
          <div className="space-y-3 rounded-2xl border border-emerald-200 bg-emerald-50/40 p-4 dark:border-emerald-800 dark:bg-emerald-950/20">
            <div className="flex items-center justify-between pb-2 border-b border-emerald-200/60 dark:border-emerald-900/40">
              <h4 className="text-xs font-bold text-emerald-900 dark:text-emerald-200 flex items-center gap-1.5">
                <Send className="h-3.5 w-3.5 text-emerald-600" />
                Uji Coba Pengiriman Pesan Langsung
              </h4>
              <Button
                size="sm"
                variant="ghost"
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="h-6 px-2 text-[11px] text-rose-600 hover:text-rose-700 hover:bg-rose-100/60 dark:hover:bg-rose-950/60 font-medium gap-1"
                title="Keluar dari akun WhatsApp"
              >
                <LogOut className={`h-3 w-3 ${isLoggingOut ? "animate-spin" : ""}`} />
                <span>{isLoggingOut ? "Memutuskan..." : "Logout Akun"}</span>
              </Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <div className="sm:col-span-1">
                <input
                  type="text"
                  placeholder="08xxxxxxxxxx"
                  value={testPhone}
                  onChange={(e) => setTestPhone(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-1.5 text-xs dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 focus:outline-hidden focus:border-emerald-500"
                />
              </div>
              <div className="sm:col-span-2 flex items-center gap-2">
                <input
                  type="text"
                  value={testMessage}
                  onChange={(e) => setTestMessage(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-1.5 text-xs dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 focus:outline-hidden focus:border-emerald-500"
                />
                <Button
                  size="sm"
                  onClick={handleSendTestMessage}
                  disabled={isSendingTest}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs h-8 shrink-0 font-semibold shadow-xs"
                >
                  {isSendingTest ? "Mengirim..." : "Kirim"}
                </Button>
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <span className="text-[11px] text-slate-500 dark:text-slate-400">
                Mendukung pengiriman ke nomor pasien, rekan, maupun nomor sendiri (Pesan ke diri sendiri).
              </span>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleClearChat}
                disabled={isClearingChat || !testPhone.trim()}
                className="h-6 px-2 text-[11px] text-amber-700 hover:text-amber-800 hover:bg-amber-100/60 dark:text-amber-400 dark:hover:bg-amber-950/60 gap-1"
                title="Hapus riwayat/antrian pesan gagal di nomor ini"
              >
                <Trash2 className={`h-3 w-3 ${isClearingChat ? "animate-spin" : ""}`} />
                <span>{isClearingChat ? "Mereset..." : "Reset Antrian Chat"}</span>
              </Button>
            </div>
          </div>
        )}

        {/* Close Button */}
        <div className="flex justify-end pt-2 border-t border-slate-100 dark:border-slate-800">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onOpenChange(false)}
            className="text-xs"
          >
            Tutup
          </Button>
        </div>
      </div>
    </Dialog>
  );
}
