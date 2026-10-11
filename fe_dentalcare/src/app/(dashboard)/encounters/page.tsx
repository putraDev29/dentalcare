"use client";

import * as React from "react";
import { useRouter } from "next/navigation";

export default function EncountersPage() {
  const router = useRouter();

  React.useEffect(() => {
    router.replace("/encounters/new");
  }, [router]);

  return (
    <div className="flex min-h-[400px] items-center justify-center">
      <div className="flex items-center gap-3 text-sm text-slate-500">
        <div className="h-4 w-4 animate-spin rounded-full border-2 border-teal-600 border-t-transparent" />
        Membuka formulir pemeriksaan odontogram...
      </div>
    </div>
  );
}
