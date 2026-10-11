"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Pill, Boxes, ArrowRight } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function InventoryRedirectPage() {
  const router = useRouter();

  React.useEffect(() => {
    const timer = setTimeout(() => {
      router.replace("/pharmacy");
    }, 600);
    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="flex min-h-[50vh] items-center justify-center p-4">
      <Card className="max-w-md w-full text-center border-teal-200 dark:border-teal-900/60 shadow-md">
        <CardHeader className="pb-3">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-teal-50 text-teal-600 dark:bg-teal-950 dark:text-teal-400 mb-2">
            <Boxes className="h-7 w-7" />
          </div>
          <CardTitle className="text-base font-bold text-slate-900 dark:text-slate-100">
            Farmasi & Alat Medis Telah Disatukan
          </CardTitle>
          <CardDescription className="text-xs">
            Pengelolaan stok obat, bahan habis pakai dental, alat medis, dan resep dokter kini berada di satu modul terpadu.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-xs text-slate-500">
            Mengarahkan Anda ke modul <strong>Farmasi & Alat Medis (Stok)</strong>...
          </p>
          <Button
            size="sm"
            onClick={() => router.replace("/pharmacy")}
            className="w-full gap-2 bg-teal-600 hover:bg-teal-700 text-white font-semibold"
          >
            <span>Buka Farmasi & Alat Medis Sekarang</span>
            <ArrowRight className="h-4 w-4" />
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
