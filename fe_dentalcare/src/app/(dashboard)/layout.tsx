"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Activity } from "lucide-react";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { Breadcrumb } from "@/components/layout/breadcrumb";
import { CommandPalette } from "@/components/layout/command-palette";
import { Toaster } from "sonner";
import { useAuthStore } from "@/features/auth/auth-store";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [isOpenMobile, setIsOpenMobile] = React.useState(false);
  const [isCollapsed, setIsCollapsed] = React.useState(false);
  const [isCommandOpen, setIsCommandOpen] = React.useState(false);

  const { isAuthenticated, isHydrated, initFromStorage } = useAuthStore();

  React.useEffect(() => {
    initFromStorage();
  }, [initFromStorage]);

  React.useEffect(() => {
    if (isHydrated && !isAuthenticated) {
      const currentPath =
        typeof window !== "undefined"
          ? window.location.pathname + window.location.search
          : "";
      const isAuthOrRoot =
        !currentPath ||
        currentPath === "/" ||
        currentPath === "/login" ||
        currentPath === "/login/" ||
        currentPath.startsWith("/login") ||
        currentPath.startsWith("/forgot-password") ||
        currentPath.startsWith("/reset-password");

      const redirectQuery = !isAuthOrRoot
        ? `?redirect=${encodeURIComponent(currentPath)}`
        : "";
      router.replace(`/login/${redirectQuery}`);
    }
  }, [isHydrated, isAuthenticated, router]);

  // If not hydrated or not authenticated, render loading screen while redirecting to login
  if (!isHydrated || !isAuthenticated) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-[#f0f8ff] via-[#f5faff] to-[#fef6f8] p-4">
        <div className="flex flex-col items-center gap-4 text-center max-w-sm">
          <div className="flex items-center justify-center rounded-2xl bg-slate-950 px-5 py-3 shadow-xl shadow-cyan-950/20 ring-1 ring-cyan-500/30 border border-slate-800 animate-pulse">
            <Image
              src="/logo.png"
              alt="OKAY DENTAL Therapist"
              width={220}
              height={58}
              priority
              className="h-11 w-auto object-contain drop-shadow"
            />
          </div>
          <div className="space-y-1">
            <p className="text-sm font-semibold text-slate-800">
              Mengamankan Akses OKAY DENTAL Therapist...
            </p>
            <p className="text-xs text-slate-500">
              Silakan login terlebih dahulu untuk mengakses rekam medis klinik gigi.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      suppressHydrationWarning
      className="flex min-h-screen bg-gradient-to-br from-[#f0f8ff] via-[#f5faff] to-[#fef6f8] font-sans text-slate-800"
    >
      {/* Sidebar */}
      <Sidebar
        isOpenMobile={isOpenMobile}
        onCloseMobile={() => setIsOpenMobile(false)}
        isCollapsed={isCollapsed}
        onToggleCollapse={() => setIsCollapsed(!isCollapsed)}
      />

      {/* Main App Area */}
      <div className="flex flex-1 flex-col min-w-0">
        <Header
          onToggleSidebar={() => setIsOpenMobile(!isOpenMobile)}
          onOpenCommandPalette={() => setIsCommandOpen(true)}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-[1600px] w-full mx-auto">
          <Breadcrumb />
          {children}
        </main>
      </div>

      {/* Global Command Palette (Ctrl+K) */}
      <CommandPalette
        open={isCommandOpen}
        onOpenChange={setIsCommandOpen}
      />

      {/* Modern Toast Notifications */}
      <Toaster
        position="top-right"
        richColors
        closeButton
        toastOptions={{
          className: "rounded-2xl border text-xs shadow-lg",
        }}
      />
    </div>
  );
}
