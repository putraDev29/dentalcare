import * as React from "react";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  icon?: LucideIcon;
  iconBgColor?: string;
  iconColor?: string;
  className?: string;
}

export function StatCard({
  title,
  value,
  subtitle,
  trend,
  icon: Icon,
  iconBgColor = "bg-teal-50 dark:bg-teal-950/40",
  iconColor = "text-teal-600 dark:text-teal-400",
  className,
}: StatCardProps) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs transition-all hover:shadow-md dark:border-slate-800 dark:bg-slate-900/90",
        className
      )}
    >
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
          {title}
        </p>
        {Icon && (
          <div className={cn("flex h-9 w-9 items-center justify-center rounded-xl", iconBgColor)}>
            <Icon className={cn("h-4 w-4", iconColor)} />
          </div>
        )}
      </div>

      <div className="mt-2 flex items-baseline gap-2">
        <p className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
          {value}
        </p>
      </div>

      {(trend || subtitle) && (
        <div className="mt-2 flex items-center gap-1.5 text-xs">
          {trend && (
            <span
              className={cn(
                "inline-flex items-center font-medium",
                trend.isPositive
                  ? "text-emerald-600 dark:text-emerald-400"
                  : "text-rose-600 dark:text-rose-400"
              )}
            >
              {trend.isPositive ? "↑ " : "↓ "}
              {trend.value}
            </span>
          )}
          {subtitle && (
            <span className="text-slate-400 dark:text-slate-500">
              {subtitle}
            </span>
          )}
        </div>
      )}
    </div>
  );
}

