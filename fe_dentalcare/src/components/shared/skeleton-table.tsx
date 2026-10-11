import * as React from "react";
import { cn } from "@/lib/utils";

interface SkeletonTableProps {
  rows?: number;
  columns?: number;
  className?: string;
}

export function SkeletonTable({
  rows = 5,
  columns = 5,
  className,
}: SkeletonTableProps) {
  return (
    <div
      className={cn(
        "w-full rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900 animate-pulse",
        className
      )}
    >
      <div className="flex gap-4 border-b border-slate-100 pb-3 dark:border-slate-800">
        {Array.from({ length: columns }).map((_, i) => (
          <div key={i} className="h-4 flex-1 rounded-md bg-slate-200 dark:bg-slate-800" />
        ))}
      </div>
      <div className="space-y-3 pt-4">
        {Array.from({ length: rows }).map((_, r) => (
          <div key={r} className="flex items-center gap-4 py-1">
            {Array.from({ length: columns }).map((_, c) => (
              <div
                key={c}
                className={cn(
                  "h-4 rounded-md bg-slate-100 dark:bg-slate-800/60",
                  c === 0 ? "w-1/4" : "flex-1"
                )}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

