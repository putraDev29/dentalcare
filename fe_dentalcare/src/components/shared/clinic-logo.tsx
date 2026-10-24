"use client";

import * as React from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

export interface ClinicLogoProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "full" | "icon" | "badge";
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  themeMode?: "light" | "dark" | "auto";
  priority?: boolean;
}

export function ClinicLogo({
  variant = "full",
  size = "md",
  themeMode = "auto",
  priority = false,
  className,
  ...props
}: ClinicLogoProps) {
  // Dimension definitions
  const dimensions = React.useMemo(() => {
    switch (variant) {
      case "icon":
        switch (size) {
          case "xs":
            return { width: 24, height: 24, boxClass: "h-6 w-6" };
          case "sm":
            return { width: 32, height: 32, boxClass: "h-8 w-8" };
          case "md":
            return { width: 40, height: 40, boxClass: "h-10 w-10" };
          case "lg":
            return { width: 56, height: 56, boxClass: "h-14 w-14" };
          case "xl":
            return { width: 80, height: 80, boxClass: "h-20 w-20" };
        }
        break;
      case "badge":
        switch (size) {
          case "xs":
            return { width: 20, height: 20, boxClass: "h-7 w-7 rounded-lg" };
          case "sm":
            return { width: 26, height: 26, boxClass: "h-9 w-9 rounded-xl" };
          case "md":
            return { width: 34, height: 34, boxClass: "h-11 w-11 rounded-2xl" };
          case "lg":
            return { width: 48, height: 48, boxClass: "h-16 w-16 rounded-3xl" };
          case "xl":
            return { width: 68, height: 68, boxClass: "h-24 w-24 rounded-3xl" };
        }
        break;
      case "full":
      default:
        switch (size) {
          case "xs":
            return { width: 110, height: 28, boxClass: "h-7 w-[110px]" };
          case "sm":
            return { width: 140, height: 36, boxClass: "h-9 w-[140px]" };
          case "md":
            return { width: 180, height: 46, boxClass: "h-11 w-[180px]" };
          case "lg":
            return { width: 240, height: 61, boxClass: "h-15 w-[240px]" };
          case "xl":
            return { width: 320, height: 82, boxClass: "h-20 w-[320px]" };
        }
    }
  }, [variant, size]);

  if (variant === "badge") {
    return (
      <div
        className={cn(
          "relative flex items-center justify-center shrink-0 bg-slate-950 shadow-md shadow-cyan-950/20 ring-1 ring-cyan-500/20 overflow-hidden",
          dimensions.boxClass,
          className
        )}
        {...props}
      >
        {/* Soft background cyan glow */}
        <div className="absolute inset-0 bg-gradient-to-tr from-cyan-950/40 via-transparent to-amber-900/20" />
        <Image
          src="/logo-icon.png"
          alt="OKAY Dental Icon"
          width={dimensions.width}
          height={dimensions.height}
          priority={priority}
          className="relative object-contain drop-shadow-sm"
        />
      </div>
    );
  }

  if (variant === "icon") {
    return (
      <div
        className={cn(
          "relative flex items-center justify-center shrink-0 overflow-hidden",
          dimensions.boxClass,
          className
        )}
        {...props}
      >
        <Image
          src={themeMode === "light" ? "/logo-icon-light.png" : "/logo-icon.png"}
          alt="OKAY Dental Icon"
          width={dimensions.width}
          height={dimensions.height}
          priority={priority}
          className="object-contain"
        />
      </div>
    );
  }

  // Full banner logo
  // If on a dark background or dark mode container, use the original vibrant logo
  // If on a white card / page, use the high-contrast logo or wrap nicely
  return (
    <div
      className={cn(
        "relative flex items-center shrink-0 select-none",
        dimensions.boxClass,
        className
      )}
      {...props}
    >
      <Image
        src={
          themeMode === "light"
            ? "/logo-light.png"
            : themeMode === "dark"
            ? "/logo-dark.png"
            : "/logo.png"
        }
        alt="OKAY DENTAL Therapist"
        width={dimensions.width}
        height={dimensions.height}
        priority={priority}
        className="w-full h-full object-contain"
      />
    </div>
  );
}
