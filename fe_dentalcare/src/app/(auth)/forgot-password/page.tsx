"use client";

import * as React from "react";
import Link from "next/link";
import { Activity, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

export default function ForgotPasswordPage() {
  const [email, setEmail] = React.useState("");
  const [sent, setSent] = React.useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSent(true);
    toast.success("Instruksi reset kata sandi telah dikirim ke email.");
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50/70 p-4 dark:bg-slate-950">
      <div className="w-full max-w-md space-y-6">
        <div className="flex flex-col items-center text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-teal-600 text-white shadow-md">
            <Activity className="h-6 w-6" />
          </div>
          <h1 className="mt-4 text-xl font-bold tracking-tight text-slate-900 dark:text-white">
            Lupa Kata Sandi
          </h1>
        </div>

        <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xl dark:border-slate-800 dark:bg-slate-900/90">
          {!sent ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Email Akun
                </label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="nama@ehealth.local"
                />
              </div>

              <Button type="submit" className="w-full">
                Kirim Tautan Reset
              </Button>
            </form>
          ) : (
            <div className="space-y-4 text-center">
              <p className="text-xs text-slate-600 dark:text-slate-300">
                Kami telah mengirimkan instruksi ke <strong>{email}</strong>. Silakan periksa kotak masuk Anda.
              </p>
              <Link href="/reset-password">
                <Button variant="outline" className="w-full text-xs">
                  Lanjut ke Halaman Reset Sandi
                </Button>
              </Link>
            </div>
          )}

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

