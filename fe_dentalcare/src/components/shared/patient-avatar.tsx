import * as React from "react";
import { cn } from "@/lib/utils";
import { getInitials } from "@/lib/formatting";
import { Gender } from "@/types";

interface PatientAvatarProps {
  name: string;
  gender?: Gender;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function PatientAvatar({
  name,
  gender,
  size = "md",
  className,
}: PatientAvatarProps) {
  const sizeStyles = {
    sm: "h-8 w-8 text-xs",
    md: "h-10 w-10 text-sm",
    lg: "h-12 w-12 text-base",
  };

  const bgStyles =
    gender === "female"
      ? "bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300 border-rose-200 dark:border-rose-900"
      : "bg-teal-50 text-teal-700 dark:bg-teal-950/50 dark:text-teal-300 border-teal-200 dark:border-teal-900";

  return (
    <div
      className={cn(
        "flex shrink-0 items-center justify-center rounded-2xl font-bold border select-none",
        sizeStyles[size],
        bgStyles,
        className
      )}
    >
      {getInitials(name)}
    </div>
  );
}

