"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import {
  ShieldCheck,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  CheckCircle2,
  Stethoscope,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuthStore } from "@/features/auth/auth-store";
import { toast } from "sonner";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const rawRedirect = searchParams?.get("redirect");

  // Sanitize redirect target: prevent any redirect looping to /login or other auth routes
  const cleanRedirect = React.useMemo(() => {
    if (!rawRedirect) return "/dashboard/";
    if (
      rawRedirect.startsWith("/login") ||
      rawRedirect.startsWith("/forgot-password") ||
      rawRedirect.startsWith("/reset-password") ||
      rawRedirect === "/"
    ) {
      return "/dashboard/";
    }
    return rawRedirect;
  }, [rawRedirect]);

  const { isAuthenticated, isHydrated, login } = useAuthStore();

  const [email, setEmail] = React.useState("admin@dentalcare.local");
  const [password, setPassword] = React.useState("password");
  const [showPassword, setShowPassword] = React.useState(false);
  const [rememberMe, setRememberMe] = React.useState(true);
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    useAuthStore.getState().initFromStorage();
  }, []);

  // Clean recursive / invalid redirect query from URL bar if present
  React.useEffect(() => {
    if (
      rawRedirect &&
      (rawRedirect.startsWith("/login") ||
        rawRedirect.startsWith("/forgot-password") ||
        rawRedirect.startsWith("/reset-password"))
    ) {
      router.replace("/login/");
    }
  }, [rawRedirect, router]);

  React.useEffect(() => {
    if (isHydrated && isAuthenticated) {
      router.replace(cleanRedirect);
    }
  }, [isHydrated, isAuthenticated, cleanRedirect, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const ok = await login(email, password);
      if (ok) {
        toast.success("Login Super Admin berhasil! Selamat datang di OKAY DENTAL Therapist.");
        router.push(cleanRedirect);
      } else {
        toast.error("Email atau kata sandi tidak sesuai.");
      }
    } catch {
      toast.error("Terjadi masalah saat login.");
    } finally {
      setLoading(false);
    }
  };

  const handleFillSuperAdmin = () => {
    setEmail("admin@dentalcare.local");
    setPassword("password");
    toast.success("Kredensial Super Administrator terisi otomatis.");
  };

  return (
    <div className="w-full max-w-md space-y-6">
      {/* Brand Header: OKAY DENTAL Therapist */}
      <div className="flex flex-col items-center text-center">
        <div className="relative rounded-2xl bg-slate-950 px-6 py-3.5 shadow-2xl shadow-cyan-950/30 ring-1 ring-cyan-500/30 border border-slate-800 transition-transform duration-300 hover:scale-[1.02]">
          <div className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-cyan-500" />
          </div>
          <Image
            src="/logo.png"
            alt="OKAY DENTAL Therapist"
            width={280}
            height={72}
            priority
            className="h-12 sm:h-14 w-auto object-contain drop-shadow-md"
          />
        </div>

        <p className="mt-3 text-xs text-slate-500 font-medium tracking-wide">
          Sistem Informasi Praktek Dokter Gigi &amp; Odontogram
        </p>

        <div className="mt-2.5 flex flex-wrap items-center justify-center gap-1.5 text-[11px]">
          <span className="rounded-full bg-sky-100/90 px-3 py-0.5 font-bold text-sky-800 border border-sky-200/60 shadow-2xs">
            Praktek Klinik Gigi
          </span>
          <span className="rounded-full bg-cyan-100/90 px-3 py-0.5 font-bold text-cyan-800 border border-cyan-200/60 shadow-2xs">
            Odontogram FDI
          </span>
          <span className="rounded-full bg-amber-100/90 px-3 py-0.5 font-bold text-amber-900 border border-amber-200/60 shadow-2xs">
            Billing &amp; Keuangan
          </span>
        </div>
      </div>

      {/* Main Login Card */}
      <div className="overflow-hidden rounded-3xl border border-sky-100/90 bg-white/95 p-7 shadow-2xl shadow-sky-950/10 backdrop-blur-xl relative">
        {/* Top signature gradient accent line */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-400 via-[#30C9DB] to-amber-200" />

        <div className="mb-5 text-center">
          <h2 className="text-lg font-bold text-slate-900 tracking-tight">
            Masuk ke Portal Klinik
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email input with icon */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700">
              Email Super Admin
            </label>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                <Mail className="h-4 w-4" />
              </div>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="pl-9 h-11 text-xs sm:text-sm rounded-xl border-slate-200 bg-slate-50/50 focus:bg-white focus:border-sky-500 transition-colors"
                placeholder="admin@dentalcare.local"
              />
            </div>
          </div>

          {/* Password input with icon & toggle */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700">
                Kata Sandi
              </label>
              <Link
                href="/forgot-password"
                className="text-[11px] font-semibold text-sky-600 hover:text-sky-800 hover:underline"
              >
                Lupa kata sandi?
              </Link>
            </div>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                <Lock className="h-4 w-4" />
              </div>
              <Input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="pl-9 pr-10 h-11 text-xs sm:text-sm rounded-xl border-slate-200 bg-slate-50/50 focus:bg-white focus:border-sky-500 transition-colors"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-600 cursor-pointer"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>

          {/* Remember me & secure session */}
          <div className="flex items-center justify-between pt-1">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="h-4 w-4 rounded border-slate-300 text-sky-600 focus:ring-sky-500"
              />
              <span className="text-xs text-slate-600 font-medium">
                Ingat saya di perangkat ini
              </span>
            </label>
          </div>

          {/* Submit CTA */}
          <Button
            type="submit"
            className="w-full h-11 mt-3 bg-gradient-to-r from-sky-600 via-cyan-600 to-cyan-500 hover:from-sky-700 hover:to-cyan-600 text-white font-bold text-sm rounded-xl shadow-lg shadow-cyan-600/25 transition-all flex items-center justify-center gap-2 cursor-pointer"
            isLoading={loading}
          >
            <span>LOGIN</span>
            <ArrowRight className="h-4 w-4" />
          </Button>
        </form>

        {/* Feature Badges */}
        <div className="mt-6 pt-5 border-t border-slate-100 grid grid-cols-2 gap-2 text-[11px] text-slate-500">
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
            <span className="truncate">SatuSehat Ready</span>
          </div>
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
            <span className="truncate">Enkripsi 256-bit</span>
          </div>
        </div>
      </div>

      {/* Footer notes */}
      <div className="text-center space-y-1">
        <p className="text-xs font-semibold text-slate-600">
          OKAY DENTAL Therapist • Dental Clinic Management System
        </p>
        <p className="text-[11px] text-slate-400">
          © 2026 OKAY DENTAL Therapist. Hak cipta dilindungi undang-undang.
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-[#dfeffa] via-[#eef6fc] to-[#fceef3] p-4 sm:p-6">
      {/* Decorative ambient background glowing circles */}
      <div className="pointer-events-none absolute -top-24 -left-24 h-96 w-96 rounded-full bg-sky-300/30 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -right-24 h-96 w-96 rounded-full bg-rose-300/25 blur-3xl" />
      <div className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[500px] w-[500px] rounded-full bg-amber-200/20 blur-3xl" />

      <React.Suspense
        fallback={
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span className="h-3 w-3 rounded-full bg-sky-500 animate-ping" />
            Memuat portal OKAY Dental...
          </div>
        }
      >
        <LoginForm />
      </React.Suspense>
    </div>
  );
}
