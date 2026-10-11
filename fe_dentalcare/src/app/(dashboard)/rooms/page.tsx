"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Stethoscope, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function RoomsRedirectPage() {
  const router = useRouter();

  React.useEffect(() => {
    const timer = setTimeout(() => {
      router.replace("/outpatient");
    }, 1500);
    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center p-6 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-teal-50 text-teal-600 dark:bg-teal-950 dark:text-teal-400 mb-4">
        <Stethoscope className="h-8 w-8" />
      </div>
      <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">
        Khusus Klinik Pemeriksaan Gigi
      </h2>
      <p className="mt-1 text-xs text-slate-400">Mengalihkan ke Ruang Praktik Gigi...</p>
      <div className="mt-6">
        <Link href="/outpatient">
          <Button size="sm" className="gap-2 shadow-xs">
            <span>Buka Ruang Praktik Gigi</span>
            <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
      </div>
    </div>
  );
}
