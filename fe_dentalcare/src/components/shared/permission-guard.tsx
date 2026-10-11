"use client";

import React from "react";
import { useAuthStore } from "@/features/auth/auth-store";

interface PermissionGuardProps {
  permission: string;
  fallback?: React.ReactNode;
  children: React.ReactNode;
}

export function PermissionGuard({
  permission,
  fallback = null,
  children,
}: PermissionGuardProps) {
  const can = useAuthStore((state) => state.can);

  if (!can(permission)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}

