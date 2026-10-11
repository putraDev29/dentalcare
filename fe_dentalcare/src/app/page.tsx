"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/features/auth/auth-store";

export default function Home() {
  const router = useRouter();
  const { isAuthenticated, isHydrated, initFromStorage } = useAuthStore();

  React.useEffect(() => {
    initFromStorage();
  }, [initFromStorage]);

  React.useEffect(() => {
    if (isHydrated) {
      if (isAuthenticated) {
        router.replace("/dashboard/");
      } else {
        router.replace("/login/");
      }
    }
  }, [isHydrated, isAuthenticated, router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-[#f0f8ff] via-[#f5faff] to-[#fef6f8]">
      <div className="flex flex-col items-center gap-3">
        <div className="flex h-12 px-4 items-center justify-center rounded-2xl bg-gradient-to-tr from-sky-500 via-rose-400 to-amber-300 shadow-lg shadow-sky-500/25 animate-pulse text-white font-black text-lg tracking-wider">
          OKAY
        </div>
        <div className="flex items-center gap-2 text-sm font-medium text-slate-600">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-sky-500 border-t-transparent" />
          <span>Memuat <strong className="font-bold text-sky-700">OKAY</strong> dental...</span>
        </div>
      </div>
    </div>
  );
}
