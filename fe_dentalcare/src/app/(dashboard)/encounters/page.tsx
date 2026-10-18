"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function EncountersPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  React.useEffect(() => {
    const qStr = searchParams?.toString();
    const dest = qStr ? `/encounters/new/?${qStr}` : "/encounters/new/";
    router.replace(dest);
  }, [router, searchParams]);

  return (
    <div className="flex min-h-[400px] items-center justify-center">
      <div className="flex items-center gap-3 text-sm text-slate-500">
        <div className="h-4 w-4 animate-spin rounded-full border-2 border-teal-600 border-t-transparent" />
        Membuka formulir pemeriksaan odontogram...
      </div>
    </div>
  );
}
