import * as React from "react";
import { cn } from "@/lib/utils";
import {
  appointmentStatusMap,
  queueStatusMap,
  bedStatusMap,
  invoiceStatusMap,
  prescriptionStatusMap,
  triageMap,
} from "@/config/status-system";

interface StatusBadgeProps {
  type: "appointment" | "queue" | "bed" | "invoice" | "prescription" | "triage";
  status: string;
  className?: string;
}

export function StatusBadge({ type, status, className }: StatusBadgeProps) {
  let label = status;
  let badgeClass = "bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300";

  if (type === "appointment") {
    const cfg = appointmentStatusMap[status];
    if (cfg) {
      label = cfg.label;
      badgeClass = cfg.badgeClass;
    }
  } else if (type === "queue") {
    const cfg = queueStatusMap[status];
    if (cfg) {
      label = cfg.label;
      badgeClass = cfg.badgeClass;
    }
  } else if (type === "bed") {
    const cfg = bedStatusMap[status];
    if (cfg) {
      label = cfg.label;
      badgeClass = cfg.badgeClass;
    }
  } else if (type === "invoice") {
    const cfg = invoiceStatusMap[status];
    if (cfg) {
      label = cfg.label;
      badgeClass = cfg.badgeClass;
    }
  } else if (type === "prescription") {
    const cfg = prescriptionStatusMap[status];
    if (cfg) {
      label = cfg.label;
      badgeClass = cfg.badgeClass;
    }
  } else if (type === "triage") {
    const cfg = triageMap[status];
    if (cfg) {
      return (
        <span
          className={cn(
            "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold select-none border",
            cfg.bg,
            cfg.text,
            cfg.border,
            className
          )}
        >
          <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
          {cfg.label}
        </span>
      );
    }
  }

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium select-none transition-colors",
        badgeClass,
        className
      )}
    >
      {label}
    </span>
  );
}

