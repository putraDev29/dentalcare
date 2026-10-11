import { Suspense } from "react";
import encountersData from "@/data/encounters.json";

export function generateStaticParams() {
  const dataIds = (encountersData as Array<{ id: string }>).map((e) => e.id);
  const defaultIds = Array.from({ length: 20 }, (_, i) => `ENC-${String(i + 1).padStart(3, "0")}`);
  const allIds = Array.from(new Set(["new", ...dataIds, ...defaultIds]));
  return allIds.map((id) => ({ id }));
}

export default function EncounterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[400px] items-center justify-center">
          <div className="flex items-center gap-3 text-sm text-slate-500">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-teal-600 border-t-transparent" />
            Memuat workspace odontogram...
          </div>
        </div>
      }
    >
      {children}
    </Suspense>
  );
}
