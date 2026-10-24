"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ClinicLogo } from "@/components/shared/clinic-logo";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [loading, setLoading] = React.useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast.error("Konfirmasi kata sandi tidak cocok.");
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      toast.success("Kata sandi berhasil diperbarui. Silakan login kembali.");
      router.push("/login");
    }, 500);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50/70 p-4 dark:bg-slate-950">
      <div className="w-full max-w-md space-y-6">
        <div className="flex flex-col items-center text-center">
          <Link href="/login">
            <ClinicLogo variant="badge" size="lg" className="rounded-3xl shadow-lg ring-2 ring-cyan-500/20" />
          </Link>
          <h1 className="mt-4 text-xl font-bold tracking-tight text-slate-900 dark:text-white">
            Atur Ulang Kata Sandi
          </h1>
          <p className="mt-1 text-xs text-slate-500">
            OKAY DENTAL Therapist
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xl dark:border-slate-800 dark:bg-slate-900/90">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Kata Sandi Baru
              </label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="Minimal 8 karakter"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Ulangi Kata Sandi
              </label>
              <Input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                placeholder="••••••••"
              />
            </div>

            <Button type="submit" className="w-full" isLoading={loading}>
              Simpan Kata Sandi Baru
            </Button>
          </form>

          <div className="mt-5 border-t border-slate-100 pt-4 text-center dark:border-slate-800">
            <Link
              href="/login"
              className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-teal-600"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Kembali ke Halaman Login</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

