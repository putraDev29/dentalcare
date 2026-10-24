"use client";

import * as React from "react";
import {
  Search,
  Plus,
  Bell,
  ChevronDown,
  Menu,
  LogOut,
  Settings,
  Calendar,
  CheckCheck,
  MessageSquare,
} from "lucide-react";
import { useAuthStore } from "@/features/auth/auth-store";
import { appConfig } from "@/config/app-config";
import { Button } from "@/components/ui/button";
import { useNotifications } from "@/hooks";
import { formatTime } from "@/lib/formatting";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { WhatsAppGatewayDialog } from "@/components/dental/whatsapp-gateway-dialog";

interface HeaderProps {
  onToggleSidebar: () => void;
  onOpenCommandPalette: () => void;
}

export function Header({
  onToggleSidebar,
  onOpenCommandPalette,
}: HeaderProps) {
  const router = useRouter();
  const { currentUser, currentFacilityId, logout } = useAuthStore();
  const { notifications, markAsRead, markAllAsRead } = useNotifications();

  const [isNotifOpen, setIsNotifOpen] = React.useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = React.useState(false);
  const [isWaDialogOpen, setIsWaDialogOpen] = React.useState(false);
  const [waStatus, setWaStatus] = React.useState<{
    status?: string;
    connected?: boolean;
    phone?: string;
  } | null>(null);

  React.useEffect(() => {
    let isMounted = true;
    const checkWaStatus = async () => {
      try {
        const res = await fetch(`${appConfig.apiUrl}/whatsapp/status`);
        if (res.ok && isMounted) {
          const data = await res.json();
          setWaStatus(data);
        }
      } catch {
        if (isMounted) setWaStatus({ status: "OFFLINE", connected: false });
      }
    };
    checkWaStatus();
    const timer = setInterval(checkWaStatus, 6000);
    return () => {
      isMounted = false;
      clearInterval(timer);
    };
  }, []);

  const notifRef = React.useRef<HTMLDivElement>(null);
  const userMenuRef = React.useRef<HTMLDivElement>(null);

  // Close dropdowns when clicking outside
  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setIsNotifOpen(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Enforce light mode strictly
  React.useEffect(() => {
    if (typeof document !== "undefined") {
      document.documentElement.classList.remove("dark");
    }
  }, []);

  const activeFacility =
    appConfig.facilities.find((f) => f.id === currentFacilityId) ||
    appConfig.facilities[0];

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-sky-200/80 bg-white/95 px-4 backdrop-blur-md sm:px-6 relative shadow-xs">
      {/* Signature OKAY DENTAL Top Accent Line */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-400 via-[#30C9DB] to-amber-200" />

      {/* Left: Mobile trigger & Facility Switcher */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-500 hover:bg-sky-50 hover:text-sky-700 lg:hidden"
          aria-label="Toggle Sidebar"
        >
          <Menu className="h-5 w-5" />
        </button>

        {/* Facility Switcher */}
        {/* <div className="relative">
          <button
            onClick={() => setIsFacilityOpen(!isFacilityOpen)}
            className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50/80 px-3 py-1.5 text-left text-xs transition-colors hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-800/60 dark:hover:bg-slate-800"
          >
            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-teal-600 text-white font-semibold">
              <Building2 className="h-3.5 w-3.5" />
            </div>
            <div className="hidden sm:block">
              <p className="font-semibold text-slate-800 dark:text-slate-200 leading-tight">
                {activeFacility.name}
              </p>
              <p className="text-[10px] text-slate-400 leading-none">
                {activeFacility.city}
              </p>
            </div>
            <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
          </button>

          {isFacilityOpen && (
            <div className="absolute left-0 top-12 z-40 w-64 rounded-2xl border border-slate-200 bg-white p-1.5 shadow-xl dark:border-slate-800 dark:bg-slate-900">
              <div className="px-2.5 py-1.5 text-[11px] font-semibold text-slate-400">
                Pilih Fasilitas Kesehatan
              </div>
              {appConfig.facilities.map((fac) => (
                <button
                  key={fac.id}
                  onClick={() => {
                    setFacilityId(fac.id);
                    setIsFacilityOpen(false);
                  }}
                  className={`flex w-full items-center justify-between rounded-xl px-2.5 py-2 text-left text-xs transition-colors ${
                    fac.id === activeFacility.id
                      ? "bg-teal-50 text-teal-800 font-semibold dark:bg-teal-950/50 dark:text-teal-300"
                      : "text-slate-700 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800/60"
                  }`}
                >
                  <div>
                    <p>{fac.name}</p>
                    <p className="text-[10px] text-slate-400">{fac.city}</p>
                  </div>
                  {fac.id === activeFacility.id && (
                    <span className="h-1.5 w-1.5 rounded-full bg-teal-600 dark:bg-teal-400" />
                  )}
                </button>
              ))}
            </div>
          )}
        </div> */}
      </div>

      {/* Center: Search trigger */}
      <div className="hidden md:flex flex-1 max-w-md mx-6">
        <button
          onClick={onOpenCommandPalette}
          className="flex h-9 w-full items-center justify-between rounded-xl border border-slate-200 bg-slate-50/80 px-3 text-xs text-slate-400 transition-colors hover:border-slate-300 hover:bg-white dark:border-slate-800 dark:bg-slate-800/40 dark:hover:border-slate-700"
        >
          <div className="flex items-center gap-2">
            <Search className="h-3.5 w-3.5 text-slate-400" />
            <span>Pencarian Cepat Pasien, Dokter, Obat...</span>
          </div>
          <kbd className="hidden rounded bg-slate-200/80 px-1.5 py-0.5 font-mono text-[10px] font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-400 sm:inline-block">
            Ctrl + K
          </kbd>
        </button>
      </div>

      {/* Right: Quick Actions, Theme, Notifications, Profile */}
      <div className="flex items-center gap-2">
        {/* Quick Action Button */}
        <Link href="/patients/new" className="hidden sm:inline-flex">
          <Button size="sm" className="gap-1.5 text-xs shadow-xs">
            <Plus className="h-3.5 w-3.5" />
            <span>Pasien Baru</span>
          </Button>
        </Link>

        {/* Mobile search button */}
        <button
          onClick={onOpenCommandPalette}
          className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 md:hidden"
          aria-label="Search"
        >
          <Search className="h-4 w-4" />
        </button>


        {/* WhatsApp Gateway Quick Trigger */}
        <button
          onClick={() => setIsWaDialogOpen(true)}
          className={`flex items-center gap-1.5 rounded-xl border px-2.5 py-1.5 text-xs font-semibold transition-all shadow-xs cursor-pointer ${
            waStatus?.connected
              ? "border-emerald-300 bg-emerald-50 text-emerald-800 hover:bg-emerald-100"
              : waStatus?.status === "QR_READY"
              ? "border-amber-400 bg-amber-50 text-amber-900 hover:bg-amber-100 animate-pulse ring-2 ring-amber-300/60"
              : "border-slate-200 bg-slate-50 text-slate-500 hover:bg-slate-100"
          }`}
          title={
            waStatus?.connected
              ? `WhatsApp Gateway Online (${waStatus?.phone || "Terhubung"})`
              : waStatus?.status === "QR_READY"
              ? "WhatsApp Gateway: Klik untuk scan QR Code!"
              : "WhatsApp Gateway Offline"
          }
        >
          <MessageSquare className="h-3.5 w-3.5 shrink-0" />
          <span className="hidden sm:inline">
            {waStatus?.connected
              ? "WA Terhubung"
              : waStatus?.status === "QR_READY"
              ? "Scan QR WA"
              : "WA Gateway"}
          </span>
          <span
            className={`h-2 w-2 rounded-full ${
              waStatus?.connected
                ? "bg-emerald-500"
                : waStatus?.status === "QR_READY"
                ? "bg-amber-500 animate-ping"
                : "bg-rose-400"
            }`}
          />
        </button>

        {/* Notification Bell Dropdown */}
        <div ref={notifRef} className="relative">
          <button
            onClick={() => setIsNotifOpen(!isNotifOpen)}
            className="relative flex h-9 w-9 items-center justify-center rounded-xl text-slate-500 hover:bg-sky-50 hover:text-sky-700 transition-colors"
            aria-label="Notifications"
          >
            <Bell className="h-4 w-4" />
            {unreadCount > 0 && (
              <span className="absolute right-1.5 top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[9px] font-bold text-white ring-2 ring-white">
                {unreadCount}
              </span>
            )}
          </button>

          {isNotifOpen && (
            <div className="absolute right-0 top-12 z-40 w-80 sm:w-96 rounded-2xl border border-sky-100 bg-white p-2 shadow-2xl shadow-sky-950/15 animate-in fade-in zoom-in-95">
              <div className="flex items-center justify-between px-3 py-2 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-800">
                    Notifikasi Klinik
                  </span>
                  {unreadCount > 0 ? (
                    <span className="rounded-full bg-rose-100 px-2 py-0.5 text-[10px] font-bold text-rose-700">
                      {unreadCount} Baru
                    </span>
                  ) : (
                    <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-500">
                      Semua Terbaca
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {unreadCount > 0 && (
                    <button
                      onClick={() => markAllAsRead()}
                      className="text-[11px] font-medium text-sky-600 hover:text-sky-800 flex items-center gap-1 hover:underline cursor-pointer"
                    >
                      <CheckCheck className="h-3 w-3" />
                      <span>Baca Semua</span>
                    </button>
                  )}
                  <Link
                    href="/notifications"
                    onClick={() => setIsNotifOpen(false)}
                    className="text-[11px] font-semibold text-slate-500 hover:text-sky-700"
                  >
                    Lihat Semua
                  </Link>
                </div>
              </div>

              <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 py-1">
                {notifications.slice(0, 6).map((n) => {
                  const isH1 = n.title.includes("H-1") || n.message.includes("H-1");
                  return (
                    <div
                      key={n.id}
                      onClick={() => {
                        markAsRead(n.id);
                        setIsNotifOpen(false);
                        if (n.actionUrl) {
                          router.push(n.actionUrl);
                        }
                      }}
                      className={`p-3 text-xs transition-colors cursor-pointer hover:bg-sky-50/70 rounded-xl relative ${
                        !n.isRead ? "bg-sky-50/50" : "opacity-80"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {isH1 ? (
                            <span className="inline-flex items-center gap-1 rounded-md bg-amber-100 px-1.5 py-0.5 text-[10px] font-bold text-amber-800 border border-amber-200">
                              <Calendar className="h-2.5 w-2.5" />
                              H-1 KONTROL PASIEN
                            </span>
                          ) : (
                            <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[9px] uppercase font-mono text-slate-500">
                              {n.category}
                            </span>
                          )}
                          {!n.isRead && (
                            <span className="h-2 w-2 rounded-full bg-rose-500 ring-2 ring-white" />
                          )}
                        </div>
                        <span className="text-[10px] text-slate-400 font-mono shrink-0">
                          {formatTime(n.timestamp)}
                        </span>
                      </div>

                      <p className={`mt-1 leading-snug ${!n.isRead ? "font-bold text-slate-900" : "font-medium text-slate-700"}`}>
                        {n.title}
                      </p>
                      <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-2 leading-relaxed">
                        {n.message}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* User Profile (Super Admin Only) */}
        <div ref={userMenuRef} className="relative ml-1">
          <button
            suppressHydrationWarning
            onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
            className="flex items-center gap-2 rounded-xl p-1 text-left transition-colors hover:bg-sky-50 cursor-pointer"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-tr from-cyan-600 via-sky-600 to-cyan-500 text-white font-black text-xs shadow-xs ring-1 ring-cyan-500/20">
              {currentUser?.name ? currentUser.name.slice(0, 2).toUpperCase() : "SA"}
            </div>
            <div className="hidden xl:block">
              <p className="text-xs font-bold text-slate-800 leading-tight">
                {currentUser?.name || "drg. Pratama Wijaya"}
              </p>
              <div className="flex items-center gap-1">
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-500" />
                <p className="text-[10px] font-semibold text-sky-700 leading-none">
                  Super Administrator
                </p>
              </div>
            </div>
            <ChevronDown className="hidden xl:block h-3.5 w-3.5 text-slate-400" />
          </button>

          {isUserMenuOpen && (
            <div className="absolute right-0 top-12 z-40 w-60 rounded-2xl border border-sky-100 bg-white p-2 shadow-2xl shadow-sky-950/15 animate-in fade-in zoom-in-95">
              <div className="px-3 py-2.5 border-b border-slate-100 bg-slate-50/60 rounded-xl mb-1">
                <p className="text-xs font-bold text-slate-900">
                  {currentUser?.name || "drg. Pratama Wijaya"}
                </p>
                <p className="text-[11px] text-slate-500 truncate font-mono">
                  {currentUser?.email || "admin@dentalcare.local"}
                </p>
                <div className="mt-2 inline-flex items-center gap-1 rounded-full bg-sky-100 px-2 py-0.5 text-[10px] font-bold text-sky-800 border border-sky-200">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  Super Administrator
                </div>
              </div>

              <div className="space-y-0.5">
                <Link
                  href="/settings"
                  onClick={() => setIsUserMenuOpen(false)}
                  className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs text-slate-700 hover:bg-sky-50 hover:text-sky-700 font-medium transition-colors"
                >
                  <Settings className="h-3.5 w-3.5 text-slate-400" />
                  <span>Pengaturan Sistem</span>
                </Link>

                <button
                  onClick={() => {
                    logout();
                    setIsUserMenuOpen(false);
                    router.push("/login/");
                  }}
                  className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs text-rose-600 hover:bg-rose-50 font-medium transition-colors cursor-pointer"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  <span>Logout</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
      <WhatsAppGatewayDialog
        open={isWaDialogOpen}
        onOpenChange={setIsWaDialogOpen}
      />
    </header>
  );
}

