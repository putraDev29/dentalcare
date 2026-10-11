import * as React from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "success" | "warning" | "danger" | "info" | "neutral" | "outline" | "subtle";
  size?: "sm" | "md";
}

export function Badge({
  className,
  variant = "default",
  size = "md",
  ...props
}: BadgeProps) {
  const variantStyles = {
    default: "bg-sky-100 text-sky-800 border-sky-300 font-bold",
    subtle: "bg-sky-50 text-sky-700 border-sky-200 font-semibold",
    success: "bg-emerald-100 text-emerald-800 border-emerald-300 font-bold",
    warning: "bg-amber-100 text-amber-900 border-amber-300 font-bold",
    danger: "bg-rose-100 text-rose-800 border-rose-300 font-bold",
    info: "bg-sky-100 text-sky-800 border-sky-300 font-bold",
    neutral: "bg-slate-100 text-slate-700 border-slate-200 font-medium",
    outline: "border-sky-300 text-sky-800 bg-white font-semibold",
  };

  const sizeStyles = {
    sm: "px-2 py-0.5 text-[10px] font-medium",
    md: "px-2.5 py-0.5 text-xs font-medium",
  };

  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full border transition-colors select-none",
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
      {...props}
    />
  );
}

