"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Activity,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  X,
} from "lucide-react";
import { NAVIGATION_GROUPS } from "@/config/navigation";
import { useAuthStore } from "@/features/auth/auth-store";
import { useHospitalProfile } from "@/hooks";
import { cn } from "@/lib/utils";

interface SidebarProps {
  isOpenMobile: boolean;
  onCloseMobile: () => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

export function Sidebar({
  isOpenMobile,
  onCloseMobile,
  isCollapsed,
  onToggleCollapse,
}: SidebarProps) {
  const pathname = usePathname();
  const can = useAuthStore((state) => state.can);
  const [mounted, setMounted] = React.useState(false);
  const { profile, refetch } = useHospitalProfile();

  React.useEffect(() => {
    setMounted(true);
    const handleProfileUpdate = () => {
      refetch();
    };
    window.addEventListener("hospital-profile-updated", handleProfileUpdate);
    window.addEventListener("storage", handleProfileUpdate);
    return () => {
      window.removeEventListener("hospital-profile-updated", handleProfileUpdate);
      window.removeEventListener("storage", handleProfileUpdate);
    };
  }, [refetch]);

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpenMobile && (
        <div
          className="fixed inset-0 z-40 bg-slate-950/40 backdrop-blur-xs lg:hidden"
          onClick={onCloseMobile}
        />
      )}

      {/* Sidebar Container: Independent Sticky Viewport on Desktop with distinct dental clinic background */}
      <aside
        suppressHydrationWarning
        className={cn(
          "fixed inset-y-0 left-0 z-40 flex flex-col border-r border-sky-300/70 bg-gradient-to-b from-[#dff2fe] via-[#ebf7ff] to-[#fff0f6] transition-all duration-200 lg:sticky lg:top-0 lg:h-screen lg:shrink-0 shadow-sm",
          isCollapsed ? "w-20" : "w-64",
          isOpenMobile ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        {/* Brand Header */}
        <div className="flex h-16 shrink-0 items-center justify-between border-b border-sky-200/80 bg-white/80 backdrop-blur-md px-4">
          <Link href="/dashboard" className="flex items-center gap-3 overflow-hidden" title="OKAY Dental">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-tr from-sky-500 via-rose-400 to-amber-300 text-white shadow-md shadow-sky-500/30">
              <Sparkles className="h-5 w-5 text-white drop-shadow-xs" />
            </div>
            {!isCollapsed && (
              <div className="transition-opacity overflow-hidden flex-1 min-w-0">
                <div className="flex items-center gap-1.5 leading-tight">
                  <span className="text-base font-black tracking-tight text-slate-900">
                    OKAY
                  </span>
                  <span className="text-base font-extrabold tracking-tight text-sky-600">
                    dental
                  </span>
                  <span className="h-2 w-2 rounded-full bg-rose-400 animate-pulse" />
                </div>
                <p className="text-[10px] text-slate-600 font-medium truncate flex items-center gap-1 mt-0.5">
                  <span className="inline-block px-1 rounded bg-amber-200/80 text-amber-900 text-[9px] font-bold">
                    PRO
                  </span>
                  Modern Dental Clinic
                </p>
              </div>
            )}
          </Link>

          {/* Close for mobile */}
          <button
            onClick={onCloseMobile}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 hover:bg-white/80 lg:hidden"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Navigation Menu List: Independent Scroll Container */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6 overscroll-contain">
          {NAVIGATION_GROUPS.map((group) => {
            // Filter items by user role permission
            const visibleItems = group.items.filter((item) => {
              if (!item.permission) return true;
              if (!mounted) return true;
              return can(item.permission);
            });

            if (visibleItems.length === 0) return null;

            return (
              <div key={group.groupName} className="space-y-1">
                {!isCollapsed && (
                  <h4 className="px-3 text-[11px] font-bold uppercase tracking-wider text-sky-900/80">
                    {group.groupName}
                  </h4>
                )}

                <div className="space-y-0.5">
                  {visibleItems.map((item) => {
                    const Icon = item.icon;
                    const isActive =
                      pathname === item.href ||
                      (item.href !== "/dashboard" && pathname.startsWith(item.href));

                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={onCloseMobile}
                        title={isCollapsed ? item.label : undefined}
                        className={cn(
                          "group flex items-center gap-3 rounded-xl px-3 py-2 text-xs font-semibold transition-all duration-150 select-none",
                          isActive
                            ? "bg-gradient-to-r from-sky-500 via-sky-600 to-cyan-500 text-white font-bold shadow-md shadow-sky-500/30"
                            : "text-slate-700 hover:bg-white hover:text-sky-600 hover:shadow-xs",
                          isCollapsed && "justify-center px-0 py-2.5"
                        )}
                      >
                        <Icon
                          className={cn(
                            "h-4 w-4 shrink-0 transition-colors",
                            isActive
                              ? "text-white"
                              : "text-sky-700/70 group-hover:text-sky-600"
                          )}
                        />

                        {!isCollapsed && (
                          <div className="flex flex-1 items-center justify-between overflow-hidden">
                            <span className="truncate">{item.label}</span>
                            {item.badge && (
                              <span
                                className={cn(
                                  "rounded-full px-2 py-0.5 text-[10px] font-bold",
                                  isActive
                                    ? "bg-white/20 text-white border border-white/30"
                                    : "bg-rose-100 text-rose-700 border border-rose-200/60"
                                )}
                              >
                                {item.badge}
                              </span>
                            )}
                          </div>
                        )}
                      </Link>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom Toggle Collapse Button (Desktop) */}
        <div className="hidden lg:flex shrink-0 border-t border-sky-200/70 bg-white/50 backdrop-blur-xs p-3">
          <button
            onClick={onToggleCollapse}
            className="flex h-9 w-full items-center justify-center gap-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-white/90 hover:text-sky-700 transition-colors shadow-2xs"
          >
            {isCollapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <>
                <ChevronLeft className="h-4 w-4" />
                <span>Kecilkan Sidebar</span>
              </>
            )}
          </button>
        </div>
      </aside>
    </>
  );
}

