"use client";

import * as React from "react";
import {
  ToothCondition,
  ToothRecord,
  OdontogramData,
  DentalSurface,
} from "@/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Select } from "@/components/ui/select";
import { formatCurrency, formatRupiahInput } from "@/lib/formatting";
import { cn } from "@/lib/utils";
import { Check, Sparkles, AlertCircle, Info, Stethoscope, Banknote, Tag, Search, X } from "lucide-react";

// Tooth naming dictionary in Indonesian
export const TOOTH_NAMES: Record<number, string> = {
  // Quadrant 1 (Upper Right)
  18: "Geraham Bungsu Kanan Atas (M3)",
  17: "Geraham Kedua Kanan Atas (M2)",
  16: "Geraham Pertama Kanan Atas (M1)",
  15: "Premolar Kedua Kanan Atas (P2)",
  14: "Premolar Pertama Kanan Atas (P1)",
  13: "Taring Kanan Atas (C)",
  12: "Seri Kedua Kanan Atas (I2)",
  11: "Seri Pertama Kanan Atas (I1)",

  // Quadrant 2 (Upper Left)
  21: "Seri Pertama Kiri Atas (I1)",
  22: "Seri Kedua Kiri Atas (I2)",
  23: "Taring Kiri Atas (C)",
  24: "Premolar Pertama Kiri Atas (P1)",
  25: "Premolar Kedua Kiri Atas (P2)",
  26: "Geraham Pertama Kiri Atas (M1)",
  27: "Geraham Kedua Kiri Atas (M2)",
  28: "Geraham Bungsu Kiri Atas (M3)",

  // Quadrant 4 (Lower Right)
  48: "Geraham Bungsu Kanan Bawah (M3)",
  47: "Geraham Kedua Kanan Bawah (M2)",
  46: "Geraham Pertama Kanan Bawah (M1)",
  45: "Premolar Kedua Kanan Bawah (P2)",
  44: "Premolar Pertama Kanan Bawah (P1)",
  43: "Taring Kanan Bawah (C)",
  42: "Seri Kedua Kanan Bawah (I2)",
  41: "Seri Pertama Kanan Bawah (I1)",

  // Quadrant 3 (Lower Left)
  31: "Seri Pertama Kiri Bawah (I1)",
  32: "Seri Kedua Kiri Bawah (I2)",
  33: "Taring Kiri Bawah (C)",
  34: "Premolar Pertama Kiri Bawah (P1)",
  35: "Premolar Kedua Kiri Bawah (P2)",
  36: "Geraham Pertama Kiri Bawah (M1)",
  37: "Geraham Kedua Kiri Bawah (M2)",
  38: "Geraham Bungsu Kiri Bawah (M3)",

  // Pedodontic / Deciduous (Gigi Susu Anak)
  55: "Geraham Susu Kedua Kanan Atas",
  54: "Geraham Susu Pertama Kanan Atas",
  53: "Taring Susu Kanan Atas",
  52: "Seri Susu Kedua Kanan Atas",
  51: "Seri Susu Pertama Kanan Atas",
  61: "Seri Susu Pertama Kiri Atas",
  62: "Seri Susu Kedua Kiri Atas",
  63: "Taring Susu Kiri Atas",
  64: "Geraham Susu Pertama Kiri Atas",
  65: "Geraham Susu Kedua Kiri Atas",
  85: "Geraham Susu Kedua Kanan Bawah",
  84: "Geraham Susu Pertama Kanan Bawah",
  83: "Taring Susu Kanan Bawah",
  82: "Seri Susu Kedua Kanan Bawah",
  81: "Seri Susu Pertama Kanan Bawah",
  71: "Seri Susu Pertama Kiri Bawah",
  72: "Seri Susu Kedua Kiri Bawah",
  73: "Taring Susu Kiri Bawah",
  74: "Geraham Susu Pertama Kiri Bawah",
  75: "Geraham Susu Kedua Kiri Bawah",
};

export const TOOTH_CONDITIONS: {
  value: ToothCondition;
  label: string;
  shortLabel: string;
  color: string;
  bgClass: string;
  borderClass: string;
  badgeVariant: "default" | "danger" | "info" | "warning" | "neutral" | "success";
}[] = [
  { value: "sound", label: "Sehat / Normal", shortLabel: "Normal", color: "#64748b", bgClass: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300", borderClass: "border-slate-300", badgeVariant: "neutral" },
  { value: "caries", label: "Karies Gigi (Berlubang)", shortLabel: "Karies", color: "#f43f5e", bgClass: "bg-rose-500 text-white", borderClass: "border-rose-600", badgeVariant: "danger" },
  { value: "filled_composite", label: "Tambalan Permanen (Komposit/GIC)", shortLabel: "Permanen", color: "#16a34a", bgClass: "bg-emerald-600 text-white", borderClass: "border-emerald-700", badgeVariant: "success" },
  { value: "filled_temporary", label: "Tambalan Sementara", shortLabel: "Sementara", color: "#eab308", bgClass: "bg-amber-400 text-amber-950 font-bold", borderClass: "border-amber-500", badgeVariant: "warning" },
  { value: "filled_amalgam", label: "Tambalan Logam Amalgam", shortLabel: "Amalgam", color: "#475569", bgClass: "bg-slate-700 text-white", borderClass: "border-slate-800", badgeVariant: "neutral" },
  { value: "extracted", label: "Gigi Dicabut (Ekstraksi)", shortLabel: "Dicabut", color: "#ef4444", bgClass: "bg-rose-600 text-white", borderClass: "border-rose-700", badgeVariant: "danger" },
  { value: "missing", label: "Gigi Hilang (Agenesis/Tanggal)", shortLabel: "Hilang", color: "#94a3b8", bgClass: "bg-slate-200 text-slate-800 dark:bg-slate-800 dark:text-slate-200", borderClass: "border-slate-400", badgeVariant: "neutral" },
  { value: "crown", label: "Mahkota Tiruan (Crown)", shortLabel: "Crown", color: "#8b5cf6", bgClass: "bg-purple-600 text-white", borderClass: "border-purple-700", badgeVariant: "default" },
  { value: "root_canal", label: "Perawatan Saluran Akar (PSA)", shortLabel: "PSA", color: "#ea580c", bgClass: "bg-orange-500 text-white", borderClass: "border-orange-600", badgeVariant: "warning" },
  { value: "impacted", label: "Gigi Impaksi (Bungsu Terpendam)", shortLabel: "Impaksi", color: "#d97706", bgClass: "bg-amber-700 text-white", borderClass: "border-amber-800", badgeVariant: "warning" },
  { value: "radix", label: "Sisa Akar (Radix)", shortLabel: "Radix", color: "#1e293b", bgClass: "bg-slate-900 text-rose-400", borderClass: "border-slate-950", badgeVariant: "danger" },
  { value: "calculus", label: "Karang Gigi (Perlu Scaling)", shortLabel: "Kalkulus", color: "#0d9488", bgClass: "bg-teal-600 text-white", borderClass: "border-teal-700", badgeVariant: "default" },
];

export const DENTAL_PROCEDURE_PRESETS: {
  name: string;
  code: string;
  cost: number;
  condition: ToothCondition;
}[] = [
  { name: "Open bur", code: "23.70", cost: 150000, condition: "root_canal" },
  { name: "Konsultasi", code: "89.07", cost: 100000, condition: "sound" },
  { name: "Cetak alginat", code: "99.91", cost: 150000, condition: "sound" },
  { name: "Incisi abses", code: "24.00", cost: 350000, condition: "caries" },
  { name: "Insersi gigi tiruan", code: "23.45", cost: 650000, condition: "missing" },
  { name: "Pembersihan Karang Gigi (Scaling Rahang Atas & Bawah)", code: "96.54", cost: 350000, condition: "calculus" },
  { name: "Penambalan Permanen Komposit Sinar (Light Curing)", code: "23.2", cost: 450000, condition: "filled_composite" },
  { name: "Penambalan Permanen Glass Ionomer (GIC)", code: "23.2G", cost: 300000, condition: "filled_composite" },
  { name: "Penambalan Sementara (Fletcher / Cavit)", code: "23.2T", cost: 150000, condition: "filled_temporary" },
  { name: "Pencabutan Gigi Tetap Dewasa", code: "23.09", cost: 350000, condition: "extracted" },
  { name: "Pencabutan Gigi Susu Anak (Topikal)", code: "23.01", cost: 175000, condition: "extracted" },
  { name: "Odontektomi / Bedah Gigi Bungsu Impaksi", code: "23.19", cost: 1850000, condition: "extracted" },
  { name: "Perawatan Saluran Akar (Endodontik/Kunjungan 1)", code: "23.7", cost: 650000, condition: "root_canal" },
  { name: "Mahkota Jaket Porselen Zirconia", code: "23.41", cost: 2800000, condition: "crown" },
  { name: "Bleaching / Pemutihan Gigi In-Office", code: "96.55", cost: 2500000, condition: "sound" },
  { name: "Rontgen Dental Periapikal", code: "87.12", cost: 150000, condition: "sound" },
];

interface OdontogramProps {
  value?: OdontogramData;
  onChange?: (data: OdontogramData) => void;
  readOnly?: boolean;
  className?: string;
  onSelectProcedure?: (procedure: { toothNumber: number; name: string; code: string; cost: number }) => void;
}

// ==========================================
// REALISTIC ANATOMICAL TOOTH SVG COMPONENT
// ==========================================
interface AnatomicalToothProps {
  toothNum: number;
  condition?: ToothCondition;
  surfaces?: DentalSurface[];
  className?: string;
}

export function AnatomicalToothSvg({
  toothNum,
  condition = "sound",
  surfaces = [],
  className,
}: AnatomicalToothProps) {
  // Tooth classification
  const isUpper = (toothNum >= 11 && toothNum <= 28) || (toothNum >= 51 && toothNum <= 65);
  // Quadrant 1 & 4 (patient's right, left side of chart): Midline is to the RIGHT
  // Quadrant 2 & 3 (patient's left, right side of chart): Midline is to the LEFT
  const isRightSide =
    (toothNum >= 11 && toothNum <= 18) ||
    (toothNum >= 41 && toothNum <= 48) ||
    (toothNum >= 51 && toothNum <= 55) ||
    (toothNum >= 81 && toothNum <= 85);

  const digit = toothNum % 10;
  const morphology: "molar" | "premolar" | "canine" | "incisor" =
    digit >= 6 ? "molar" : digit >= 4 ? "premolar" : digit === 3 ? "canine" : "incisor";

  const isMissing = condition === "missing";
  const isExtracted = condition === "extracted";
  const isMissingOrExtracted = isMissing || isExtracted;
  const isRadix = condition === "radix";
  const isCrown = condition === "crown";
  const isRCT = condition === "root_canal";
  const isCaries = condition === "caries";
  const isComposite = condition === "filled_composite";
  const isAmalgam = condition === "filled_amalgam";
  const isTemp = condition === "filled_temporary";
  const isImpacted = condition === "impacted";
  const isCalculus = condition === "calculus";

  // Unique IDs for SVG gradients to prevent clipping/collisions
  const enamelId = `enamel-grad-${toothNum}`;
  const rootId = `root-grad-${toothNum}`;
  const crownMatId = `crown-mat-${toothNum}`;
  const cariesMatId = `caries-mat-${toothNum}`;
  const compMatId = `comp-mat-${toothNum}`;

  // Coordinates for caries / filling spot
  // Mesial is TOWARD dental midline (center of dental arch / chart):
  //   - For Right Quadrants (Q1 & Q4, left of screen): Midline is on the RIGHT -> spotX = 33
  //   - For Left Quadrants (Q2 & Q3, right of screen): Midline is on the LEFT -> spotX = 17
  // Distal is AWAY from dental midline:
  //   - For Right Quadrants: Distal is on the LEFT -> spotX = 17
  //   - For Left Quadrants: Distal is on the RIGHT -> spotX = 33
  const spotY = isUpper ? 52 : 20;
  let spotX = 25;
  const hasM = surfaces.includes("M");
  const hasD = surfaces.includes("D");

  if (hasM && !hasD && !surfaces.includes("O")) {
    spotX = isRightSide ? 33 : 17;
  } else if (hasD && !hasM && !surfaces.includes("O")) {
    spotX = isRightSide ? 17 : 33;
  }

  return (
    <svg
      viewBox="0 0 50 72"
      className={cn("w-full h-full select-none overflow-visible", className)}
      style={{
        opacity: isMissingOrExtracted ? 0.35 : 1,
        transform: isImpacted ? (isUpper ? "rotate(22deg)" : "rotate(-22deg)") : undefined,
        transformOrigin: "center center",
        transition: "transform 0.2s ease",
      }}
    >
      <defs>
        {/* Natural Tooth Enamel Gradient - Pearlescent Luster */}
        <linearGradient id={enamelId} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="55%" stopColor="#f8fafc" />
          <stop offset="100%" stopColor="#e2e8f0" />
        </linearGradient>

        {/* Natural Dentin / Root Warm Gradient */}
        <linearGradient id={rootId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#fffbeb" />
          <stop offset="50%" stopColor="#fef3c7" />
          <stop offset="100%" stopColor="#fde68a" />
        </linearGradient>

        {/* Prosthetic Porcelain / Zirconia Crown Gradient */}
        <linearGradient id={crownMatId} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#f3e8ff" />
          <stop offset="45%" stopColor="#c084fc" />
          <stop offset="100%" stopColor="#7e22ce" />
        </linearGradient>

        {/* Realistic Caries Gradient */}
        <radialGradient id={cariesMatId} cx="35%" cy="35%" r="65%">
          <stop offset="0%" stopColor="#f43f5e" />
          <stop offset="60%" stopColor="#dc2626" />
          <stop offset="100%" stopColor="#881337" />
        </radialGradient>

        {/* Permanent Composite / GIC Gradient - Green */}
        <linearGradient id={compMatId} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#4ade80" />
          <stop offset="50%" stopColor="#16a34a" />
          <stop offset="100%" stopColor="#15803d" />
        </linearGradient>
      </defs>

      {/* RENDER MORPHOLOGY BASED ON JAW */}
      {isUpper ? (
        // ==================== UPPER JAW (MAXILLA) ====================
        // Roots point UP (y: 6 to 34), Crown points DOWN (y: 34 to 68)
        <g>
          {/* ROOT SHAPES */}
          {morphology === "molar" && (
            <path
              d="M 11 34 C 8 23 10 10 13 6 C 15 6 17 12 18 20 C 21 16 29 16 32 20 C 33 12 35 6 37 6 C 40 10 42 23 39 34 Z"
              fill={`url(#${rootId})`}
              stroke="#64748b"
              strokeWidth="1.4"
              strokeDasharray={isMissingOrExtracted ? "2 2" : undefined}
            />
          )}

          {morphology === "premolar" && (
            <path
              d="M 15 34 C 17 21 20 6 25 6 C 30 6 33 21 35 34 Z"
              fill={`url(#${rootId})`}
              stroke="#64748b"
              strokeWidth="1.4"
              strokeDasharray={isMissingOrExtracted ? "2 2" : undefined}
            />
          )}

          {morphology === "canine" && (
            <path
              d="M 16 34 C 18 20 21 4 25 4 C 29 4 32 20 34 34 Z"
              fill={`url(#${rootId})`}
              stroke="#64748b"
              strokeWidth="1.4"
              strokeDasharray={isMissingOrExtracted ? "2 2" : undefined}
            />
          )}

          {morphology === "incisor" && (
            <path
              d="M 17 34 C 19 22 21 6 25 6 C 29 6 31 22 33 34 Z"
              fill={`url(#${rootId})`}
              stroke="#64748b"
              strokeWidth="1.4"
              strokeDasharray={isMissingOrExtracted ? "2 2" : undefined}
            />
          )}

          {/* Root Canal Lines (Endodontic Gutta-Percha in Roots) */}
          {isRCT && (
            <g stroke="#ea580c" strokeWidth="2.2" strokeLinecap="round">
              {morphology === "molar" ? (
                <>
                  <path d="M 14 10 Q 16 22 22 34" />
                  <path d="M 36 10 Q 34 22 28 34" />
                </>
              ) : (
                <path d="M 25 8 L 25 34" />
              )}
            </g>
          )}

          {/* CROWN OR RADIX */}
          {isRadix ? (
            // Broken Crown / Jagged Cervical Fracture Line
            <g>
              <path
                d="M 11 34 Q 15 38 19 33 Q 25 39 31 34 Q 35 38 39 34"
                stroke="#ef4444"
                strokeWidth="2.5"
                fill="none"
              />
              <circle cx="25" cy="46" r="7" fill="#fee2e2" stroke="#ef4444" strokeWidth="1.5" />
              <text x="25" y="50" textAnchor="middle" fontSize="10" fontWeight="bold" fill="#ef4444">
                !
              </text>
            </g>
          ) : (
            // Intact or Restored Crown
            <g>
              {morphology === "molar" && (
                <path
                  d="M 11 34 C 7 38 7 52 10 60 C 13 65 17 67 21 64 C 23 62 27 62 29 64 C 33 67 37 65 40 60 C 43 52 43 38 39 34 Z"
                  fill={isCrown ? `url(#${crownMatId})` : `url(#${enamelId})`}
                  stroke={isCrown ? "#7e22ce" : "#64748b"}
                  strokeWidth="1.4"
                  strokeDasharray={isMissingOrExtracted ? "2 2" : undefined}
                />
              )}

              {morphology === "premolar" && (
                <path
                  d="M 15 34 C 11 39 11 51 14 59 C 17 65 21 66 25 63 C 29 66 33 65 36 59 C 39 51 39 39 35 34 Z"
                  fill={isCrown ? `url(#${crownMatId})` : `url(#${enamelId})`}
                  stroke={isCrown ? "#7e22ce" : "#64748b"}
                  strokeWidth="1.4"
                  strokeDasharray={isMissingOrExtracted ? "2 2" : undefined}
                />
              )}

              {morphology === "canine" && (
                <path
                  d="M 16 34 C 12 40 12 50 16 58 L 25 68 L 34 58 C 38 50 38 40 34 34 Z"
                  fill={isCrown ? `url(#${crownMatId})` : `url(#${enamelId})`}
                  stroke={isCrown ? "#7e22ce" : "#64748b"}
                  strokeWidth="1.4"
                  strokeDasharray={isMissingOrExtracted ? "2 2" : undefined}
                />
              )}

              {morphology === "incisor" && (
                <path
                  d="M 17 34 C 13 40 13 52 14 62 C 14 65 17 66 21 66 L 29 66 C 33 66 36 65 36 62 C 37 52 37 40 33 34 Z"
                  fill={isCrown ? `url(#${crownMatId})` : `url(#${enamelId})`}
                  stroke={isCrown ? "#7e22ce" : "#64748b"}
                  strokeWidth="1.4"
                  strokeDasharray={isMissingOrExtracted ? "2 2" : undefined}
                />
              )}

              {/* Cervical line demarcation */}
              <line
                x1={morphology === "molar" ? 11 : 16}
                y1="34"
                x2={morphology === "molar" ? 39 : 34}
                y2="34"
                stroke={isCrown ? "#9333ea" : "#cbd5e1"}
                strokeWidth="1"
              />

              {/* Natural Occlusal Grooves */}
              {!isCrown && (
                <g stroke="#cbd5e1" strokeWidth="1" fill="none" opacity="0.8">
                  {morphology === "molar" && (
                    <>
                      <path d="M 17 54 Q 25 58 33 54" />
                      <line x1="25" y1="46" x2="25" y2="58" />
                    </>
                  )}
                  {morphology === "premolar" && <path d="M 20 54 Q 25 57 30 54" />}
                  {morphology === "canine" && <line x1="25" y1="40" x2="25" y2="60" strokeDasharray="1 2" />}
                  {morphology === "incisor" && (
                    <>
                      <line x1="21" y1="48" x2="21" y2="62" />
                      <line x1="29" y1="48" x2="29" y2="62" />
                    </>
                  )}
                </g>
              )}

              {/* Caries cavity on crown */}
              {isCaries && (
                <g>
                  <circle cx={spotX} cy={spotY} r="6" fill="#dc2626" stroke="#991b1b" strokeWidth="1" />
                  <circle cx={spotX} cy={spotY} r="3" fill="#450a0a" />
                </g>
              )}

              {/* Permanent Filling (Composite/GIC) on crown - GREEN */}
              {isComposite && (
                <g>
                  <ellipse cx={spotX} cy={spotY} rx="7" ry="5" fill="#16a34a" stroke="#15803d" strokeWidth="1" />
                  <ellipse cx={spotX - 1.5} cy={spotY - 1.5} rx="2.5" ry="1.5" fill="#4ade80" />
                </g>
              )}

              {/* Amalgam Filling on crown */}
              {isAmalgam && (
                <g>
                  <ellipse cx={spotX} cy={spotY} rx="7" ry="5" fill="#475569" stroke="#1e293b" strokeWidth="1" />
                  <ellipse cx={spotX - 1.5} cy={spotY - 1.5} rx="2.5" ry="1.5" fill="#94a3b8" />
                </g>
              )}

              {/* Temporary Filling on crown - YELLOW */}
              {isTemp && (
                <g>
                  <ellipse cx={spotX} cy={spotY} rx="6.5" ry="4.5" fill="#eab308" stroke="#ca8a04" strokeWidth="1" />
                  <ellipse cx={spotX - 1.5} cy={spotY - 1.5} rx="2.5" ry="1.5" fill="#fef08a" />
                </g>
              )}

              {/* RCT Crown Access Cavity */}
              {isRCT && (
                <circle cx="25" cy="46" r="4.5" fill="#f97316" stroke="#c2410c" strokeWidth="1" />
              )}

              {/* Calculus / Tartar Band at cervical neck */}
              {isCalculus && (
                <path
                  d="M 12 33 Q 25 36 38 33 Q 36 37 25 37 Q 14 37 12 33"
                  fill="#0d9488"
                  stroke="#0f766e"
                  strokeWidth="0.8"
                />
              )}
            </g>
          )}
        </g>
      ) : (
        // ==================== LOWER JAW (MANDIBLE) ====================
        // Crown points UP (y: 4 to 38), Roots point DOWN (y: 38 to 68)
        <g>
          {/* CROWN OR RADIX */}
          {isRadix ? (
            <g>
              <path
                d="M 11 38 Q 15 34 19 39 Q 25 33 31 38 Q 35 34 39 38"
                stroke="#ef4444"
                strokeWidth="2.5"
                fill="none"
              />
              <circle cx="25" cy="24" r="7" fill="#fee2e2" stroke="#ef4444" strokeWidth="1.5" />
              <text x="25" y="28" textAnchor="middle" fontSize="10" fontWeight="bold" fill="#ef4444">
                !
              </text>
            </g>
          ) : (
            <g>
              {morphology === "molar" && (
                <path
                  d="M 10 12 C 13 7 17 5 21 8 C 23 10 27 10 29 8 C 33 5 37 7 40 12 C 43 20 43 32 39 38 L 11 38 C 7 32 7 20 10 12 Z"
                  fill={isCrown ? `url(#${crownMatId})` : `url(#${enamelId})`}
                  stroke={isCrown ? "#7e22ce" : "#64748b"}
                  strokeWidth="1.4"
                  strokeDasharray={isMissingOrExtracted ? "2 2" : undefined}
                />
              )}

              {morphology === "premolar" && (
                <path
                  d="M 14 13 C 17 7 21 6 25 9 C 29 6 33 7 36 13 C 39 21 39 32 35 38 L 15 38 C 11 32 11 21 14 13 Z"
                  fill={isCrown ? `url(#${crownMatId})` : `url(#${enamelId})`}
                  stroke={isCrown ? "#7e22ce" : "#64748b"}
                  strokeWidth="1.4"
                  strokeDasharray={isMissingOrExtracted ? "2 2" : undefined}
                />
              )}

              {morphology === "canine" && (
                <path
                  d="M 25 4 L 16 14 C 12 22 12 32 16 38 L 34 38 C 38 32 38 22 34 14 Z"
                  fill={isCrown ? `url(#${crownMatId})` : `url(#${enamelId})`}
                  stroke={isCrown ? "#7e22ce" : "#64748b"}
                  strokeWidth="1.4"
                  strokeDasharray={isMissingOrExtracted ? "2 2" : undefined}
                />
              )}

              {morphology === "incisor" && (
                <path
                  d="M 16 10 C 16 7 18 6 21 6 L 29 6 C 32 6 34 7 34 10 C 35 19 35 30 33 38 L 17 38 C 15 30 15 19 16 10 Z"
                  fill={isCrown ? `url(#${crownMatId})` : `url(#${enamelId})`}
                  stroke={isCrown ? "#7e22ce" : "#64748b"}
                  strokeWidth="1.4"
                  strokeDasharray={isMissingOrExtracted ? "2 2" : undefined}
                />
              )}

              {/* Cervical line demarcation */}
              <line
                x1={morphology === "molar" ? 11 : 16}
                y1="38"
                x2={morphology === "molar" ? 39 : 34}
                y2="38"
                stroke={isCrown ? "#9333ea" : "#cbd5e1"}
                strokeWidth="1"
              />

              {/* Natural Occlusal Grooves */}
              {!isCrown && (
                <g stroke="#cbd5e1" strokeWidth="1" fill="none" opacity="0.8">
                  {morphology === "molar" && (
                    <>
                      <path d="M 17 18 Q 25 14 33 18" />
                      <line x1="25" y1="14" x2="25" y2="26" />
                    </>
                  )}
                  {morphology === "premolar" && <path d="M 20 18 Q 25 15 30 18" />}
                  {morphology === "canine" && <line x1="25" y1="12" x2="25" y2="32" strokeDasharray="1 2" />}
                  {morphology === "incisor" && (
                    <>
                      <line x1="21" y1="10" x2="21" y2="24" />
                      <line x1="29" y1="10" x2="29" y2="24" />
                    </>
                  )}
                </g>
              )}

              {/* Caries cavity on crown */}
              {isCaries && (
                <g>
                  <circle cx={spotX} cy={spotY} r="6" fill="#dc2626" stroke="#991b1b" strokeWidth="1" />
                  <circle cx={spotX} cy={spotY} r="3" fill="#450a0a" />
                </g>
              )}

              {/* Permanent Filling (Composite/GIC) on crown - GREEN */}
              {isComposite && (
                <g>
                  <ellipse cx={spotX} cy={spotY} rx="7" ry="5" fill="#16a34a" stroke="#0369a1" strokeWidth="1" />
                  <ellipse cx={spotX - 1.5} cy={spotY - 1.5} rx="2.5" ry="1.5" fill="#4ade80" />
                </g>
              )}

              {/* Amalgam Filling on crown */}
              {isAmalgam && (
                <g>
                  <ellipse cx={spotX} cy={spotY} rx="7" ry="5" fill="#475569" stroke="#1e293b" strokeWidth="1" />
                  <ellipse cx={spotX - 1.5} cy={spotY - 1.5} rx="2.5" ry="1.5" fill="#94a3b8" />
                </g>
              )}

              {/* Temporary Filling on crown - YELLOW */}
              {isTemp && (
                <g>
                  <ellipse cx={spotX} cy={spotY} rx="6.5" ry="4.5" fill="#eab308" stroke="#ca8a04" strokeWidth="1" />
                  <ellipse cx={spotX - 1.5} cy={spotY - 1.5} rx="2.5" ry="1.5" fill="#fef08a" />
                </g>
              )}

              {/* RCT Crown Access Cavity */}
              {isRCT && (
                <circle cx="25" cy="26" r="4.5" fill="#f97316" stroke="#c2410c" strokeWidth="1" />
              )}

              {/* Calculus / Tartar Band at cervical neck */}
              {isCalculus && (
                <path
                  d="M 12 39 Q 25 36 38 39 Q 36 35 25 35 Q 14 35 12 39"
                  fill="#0d9488"
                  stroke="#0f766e"
                  strokeWidth="0.8"
                />
              )}
            </g>
          )}

          {/* ROOT SHAPES */}
          {morphology === "molar" && (
            <path
              d="M 11 38 C 8 49 10 62 13 66 C 15 66 17 60 18 52 C 21 56 29 56 32 52 C 33 60 35 66 37 66 C 40 62 42 49 39 38 Z"
              fill={`url(#${rootId})`}
              stroke="#64748b"
              strokeWidth="1.4"
              strokeDasharray={isMissingOrExtracted ? "2 2" : undefined}
            />
          )}

          {morphology === "premolar" && (
            <path
              d="M 15 38 C 17 51 20 66 25 66 C 30 66 33 51 35 38 Z"
              fill={`url(#${rootId})`}
              stroke="#64748b"
              strokeWidth="1.4"
              strokeDasharray={isMissingOrExtracted ? "2 2" : undefined}
            />
          )}

          {morphology === "canine" && (
            <path
              d="M 16 38 C 18 52 21 68 25 68 C 29 68 32 52 34 38 Z"
              fill={`url(#${rootId})`}
              stroke="#64748b"
              strokeWidth="1.4"
              strokeDasharray={isMissingOrExtracted ? "2 2" : undefined}
            />
          )}

          {morphology === "incisor" && (
            <path
              d="M 17 38 C 19 50 21 66 25 66 C 29 66 31 50 33 38 Z"
              fill={`url(#${rootId})`}
              stroke="#64748b"
              strokeWidth="1.4"
              strokeDasharray={isMissingOrExtracted ? "2 2" : undefined}
            />
          )}

          {/* Root Canal Lines (Endodontic Gutta-Percha in Roots) */}
          {isRCT && (
            <g stroke="#ea580c" strokeWidth="2.2" strokeLinecap="round">
              {morphology === "molar" ? (
                <>
                  <path d="M 22 38 Q 16 50 14 62" />
                  <path d="M 28 38 Q 34 50 36 62" />
                </>
              ) : (
                <path d="M 25 38 L 25 64" />
              )}
            </g>
          )}
        </g>
      )}

      {/* SPECIAL OVERLAYS: EXTRACTED TOOTH (BOLD RED X ACROSS CROWN & ROOT) */}
      {isExtracted && (
        <g stroke="#ef4444" strokeWidth="4.5" strokeLinecap="round">
          <line x1="6" y1="8" x2="44" y2="64" />
          <line x1="44" y1="8" x2="6" y2="64" />
        </g>
      )}

      {/* SPECIAL OVERLAYS: MISSING TOOTH (GREY DASHED X) */}
      {isMissing && (
        <g stroke="#94a3b8" strokeWidth="3.5" strokeLinecap="round" strokeDasharray="4 3">
          <line x1="8" y1="10" x2="42" y2="62" />
          <line x1="42" y1="10" x2="8" y2="62" />
        </g>
      )}

      {/* SPECIAL OVERLAYS: IMPACTED TOOTH BADGE */}
      {isImpacted && (
        <g>
          <rect x="6" y="27" width="38" height="18" rx="4" fill="#b45309" stroke="#fef3c7" strokeWidth="1" />
          <text x="25" y="40" textAnchor="middle" fontSize="9.5" fontWeight="bold" fill="#ffffff" letterSpacing="0.5">
            IMPAKSI
          </text>
        </g>
      )}
    </svg>
  );
}

export function Odontogram({
  value,
  onChange,
  readOnly = false,
  className,
  onSelectProcedure,
}: OdontogramProps) {
  const [viewMode, setViewMode] = React.useState<"anatomical" | "geometric">("anatomical");
  const [showPedodontic, setShowPedodontic] = React.useState(false);
  const [showLegend, setShowLegend] = React.useState(false);
  const [selectedTooth, setSelectedTooth] = React.useState<number | null>(null);
  const [activeTeeth, setActiveTeeth] = React.useState<Record<number, ToothRecord>>(
    value?.teeth || {}
  );

  // Sync external value
  React.useEffect(() => {
    if (value?.teeth) {
      setActiveTeeth(value.teeth);
    }
  }, [value]);

  // Teeth quadrants in FDI sequence
  const adultUpperRight = [18, 17, 16, 15, 14, 13, 12, 11];
  const adultUpperLeft = [21, 22, 23, 24, 25, 26, 27, 28];
  const adultLowerRight = [48, 47, 46, 45, 44, 43, 42, 41];
  const adultLowerLeft = [31, 32, 33, 34, 35, 36, 37, 38];

  const pedoUpperRight = [55, 54, 53, 52, 51];
  const pedoUpperLeft = [61, 62, 63, 64, 65];
  const pedoLowerRight = [85, 84, 83, 82, 81];
  const pedoLowerLeft = [71, 72, 73, 74, 75];

  const handleToothClick = (toothNumber: number) => {
    if (readOnly) return;
    setSelectedTooth(toothNumber);
  };

  const handleSaveTooth = (record: ToothRecord) => {
    const updated = {
      ...activeTeeth,
      [record.toothNumber]: record,
    };
    setActiveTeeth(updated);

    if (onChange) {
      onChange({
        teeth: updated,
        updatedAt: new Date().toISOString(),
      });
    }

    if (onSelectProcedure) {
      const procName =
        record.procedure ||
        (record.procedureCost && record.procedureCost > 0
          ? `Tindakan Gigi #${record.toothNumber}`
          : "");
      if (procName || (record.procedureCost !== undefined && record.procedureCost > 0)) {
        const preset = DENTAL_PROCEDURE_PRESETS.find((p) => p.name === record.procedure);
        onSelectProcedure({
          toothNumber: record.toothNumber,
          name: procName || `Perawatan Gigi #${record.toothNumber}`,
          code: preset?.code || "DENT",
          cost: Number(record.procedureCost) || 0,
        });
      }
    }

    setSelectedTooth(null);
  };

  // Summary counts
  const cariesCount = Object.values(activeTeeth).filter((t) => t.condition === "caries").length;
  const filledPermanentCount = Object.values(activeTeeth).filter((t) => t.condition === "filled_composite").length;
  const filledTemporaryCount = Object.values(activeTeeth).filter((t) => t.condition === "filled_temporary").length;
  const filledAmalgamCount = Object.values(activeTeeth).filter((t) => t.condition === "filled_amalgam").length;
  const extractedCount = Object.values(activeTeeth).filter((t) => t.condition === "extracted").length;
  const missingCount = Object.values(activeTeeth).filter((t) => t.condition === "missing").length;
  const rctCount = Object.values(activeTeeth).filter((t) => t.condition === "root_canal").length;
  const totalCost = Object.values(activeTeeth).reduce((sum, t) => sum + (t.procedureCost || 0), 0);

  // SVG representation of a single tooth with 5 surfaces
  const renderToothVisual = (toothNum: number) => {
    const record = activeTeeth[toothNum];
    const condition = record?.condition || "sound";
    const condConfig = TOOTH_CONDITIONS.find((c) => c.value === condition) || TOOTH_CONDITIONS[0];
    const isSelected = selectedTooth === toothNum;

    const isUpper = (toothNum >= 11 && toothNum <= 28) || (toothNum >= 51 && toothNum <= 65);
    const isRightSide =
      (toothNum >= 11 && toothNum <= 18) ||
      (toothNum >= 41 && toothNum <= 48) ||
      (toothNum >= 51 && toothNum <= 55) ||
      (toothNum >= 81 && toothNum <= 85);

    // Anatomically correct surface mapping:
    // Midline is between 11/21 and 41/31 (center of the screen).
    // For Right Quadrants (Q1 & Q4, left of screen):
    //   - Midline is to the RIGHT.
    //   - MESIAL is to the RIGHT (towards midline).
    //   - DISTAL is to the LEFT (away from midline).
    // For Left Quadrants (Q2 & Q3, right of screen):
    //   - Midline is to the LEFT.
    //   - MESIAL is to the LEFT (towards midline).
    //   - DISTAL is to the RIGHT (away from midline).
    const leftSurfaceKey: DentalSurface = isRightSide ? "D" : "M";
    const rightSurfaceKey: DentalSurface = isRightSide ? "M" : "D";
    const topSurfaceKey: DentalSurface = isUpper ? "B" : "L";
    const bottomSurfaceKey: DentalSurface = isUpper ? "L" : "B";
    const centerSurfaceKey: DentalSurface = "O";

    const getSurfaceFill = (surf: DentalSurface) => {
      if (condition === "sound") return "#f8fafc";
      if (condition === "missing" || condition === "extracted") return "#f1f5f9";
      if (condition === "crown") return "#8b5cf6";
      if (condition === "root_canal") return "#ea580c";
      if (condition === "radix") return "#0f172a";
      if (condition === "impacted") return "#d97706";
      if (condition === "calculus") return "#0d9488";

      const toothSurfaces = record?.surfaces || ["O"];
      const isAffected = toothSurfaces.includes(surf);
      if (!isAffected) return "#f8fafc";

      switch (condition) {
        case "caries":
          return "#f43f5e";
        case "filled_composite":
          return "#16a34a"; // Hijau untuk tambalan permanen (komposit / gic)
        case "filled_amalgam":
          return "#475569";
        case "filled_temporary":
          return "#eab308"; // Kuning untuk tambalan sementara
        default:
          return "#f8fafc";
      }
    };

    return (
      <button
        type="button"
        key={toothNum}
        onClick={() => handleToothClick(toothNum)}
        className={cn(
          "group relative flex flex-col items-center justify-between p-1.5 rounded-xl border transition-all duration-150 select-none min-h-[88px]",
          isSelected
            ? "ring-2 ring-teal-500 border-teal-500 bg-teal-50/50 dark:bg-teal-950/50 shadow-sm"
            : condition !== "sound"
            ? "border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-2xs hover:border-teal-400"
            : "border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-teal-400 hover:shadow-xs",
          readOnly ? "cursor-default" : "cursor-pointer active:scale-95"
        )}
      >
        {/* Tooth FDI Number */}
        <span
          className={cn(
            "text-[11px] font-bold font-mono transition-colors",
            condition !== "sound" ? "text-teal-700 dark:text-teal-400 font-extrabold" : "text-slate-600 dark:text-slate-400"
          )}
        >
          {toothNum}
        </span>

        {/* Tooth Visual: Anatomical Tooth Illustration vs 5-Surface Geometric Diagram */}
        {viewMode === "anatomical" ? (
          <div className="relative my-0.5 h-14 w-8 flex items-center justify-center">
            <AnatomicalToothSvg
              toothNum={toothNum}
              condition={condition}
              surfaces={record?.surfaces}
            />
          </div>
        ) : (
          <div className="relative my-1 h-9 w-9">
            <svg viewBox="0 0 100 100" className="h-full w-full drop-shadow-2xs">
              {/* Top Surface */}
              <polygon
                points="10,10 90,10 70,30 30,30"
                fill={getSurfaceFill(topSurfaceKey)}
                stroke="#64748b"
                strokeWidth="2.5"
              />
              {/* Right Surface */}
              <polygon
                points="90,10 90,90 70,70 70,30"
                fill={getSurfaceFill(rightSurfaceKey)}
                stroke="#64748b"
                strokeWidth="2.5"
              />
              {/* Bottom Surface */}
              <polygon
                points="90,90 10,90 30,70 70,70"
                fill={getSurfaceFill(bottomSurfaceKey)}
                stroke="#64748b"
                strokeWidth="2.5"
              />
              {/* Left Surface */}
              <polygon
                points="10,10 10,90 30,70 30,30"
                fill={getSurfaceFill(leftSurfaceKey)}
                stroke="#64748b"
                strokeWidth="2.5"
              />
              {/* Center / Occlusal Surface */}
              <polygon
                points="30,30 70,30 70,70 30,70"
                fill={getSurfaceFill(centerSurfaceKey)}
                stroke="#64748b"
                strokeWidth="2.5"
              />

              {/* Overlays for Special Conditions */}
              {condition === "extracted" && (
                <>
                  <line x1="12" y1="12" x2="88" y2="88" stroke="#ef4444" strokeWidth="8" strokeLinecap="round" />
                  <line x1="88" y1="12" x2="12" y2="88" stroke="#ef4444" strokeWidth="8" strokeLinecap="round" />
                </>
              )}

              {condition === "missing" && (
                <>
                  <line x1="12" y1="12" x2="88" y2="88" stroke="#94a3b8" strokeWidth="6" strokeDasharray="8 6" strokeLinecap="round" />
                  <line x1="88" y1="12" x2="12" y2="88" stroke="#94a3b8" strokeWidth="6" strokeDasharray="8 6" strokeLinecap="round" />
                </>
              )}

              {condition === "radix" && (
                <circle cx="50" cy="50" r="26" fill="#0f172a" stroke="#f43f5e" strokeWidth="3.5" />
              )}

              {condition === "impacted" && (
                <text x="50" y="61" textAnchor="middle" fontSize="30" fontWeight="bold" fill="#78350f">
                  IMP
                </text>
              )}
            </svg>
          </div>
        )}

        {/* Clean Condition Mini-Tag: NO "Sehat" clutter on normal teeth! */}
        {condition !== "sound" ? (
          <div className="w-full text-center mt-0.5">
            <span
              className={cn(
                "block truncate text-[9px] font-bold px-1 rounded-sm py-0.5 shadow-2xs",
                condConfig.bgClass
              )}
            >
              {condConfig.shortLabel || condConfig.label.split(" ")[0]}
            </span>
          </div>
        ) : (
          <div className="h-3 w-full" />
        )}
      </button>
    );
  };

  return (
    <div className={cn("space-y-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950 p-4 sm:p-6", className)}>
      {/* Header Controls & Summary Badges */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-100 text-teal-700 dark:bg-teal-950 dark:text-teal-400">
            <Sparkles className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              Peta Gigi Pasien (Odontogram)
              <Badge variant="outline" className="text-[10px] font-mono border-teal-300 text-teal-700">
                FDI Two-Digit Standard
              </Badge>
            </h3>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* View Mode Toggle: Bentuk Gigi Asli vs Diagram 5 Bidang */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg border border-slate-200 dark:border-slate-700">
            <button
              type="button"
              onClick={() => setViewMode("anatomical")}
              className={cn(
                "flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold transition-all",
                viewMode === "anatomical"
                  ? "bg-white dark:bg-slate-900 text-teal-700 dark:text-teal-300 shadow-xs"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
              )}
            >
              <span>🦷</span>
              <span>Bentuk Gigi Asli</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode("geometric")}
              className={cn(
                "flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold transition-all",
                viewMode === "geometric"
                  ? "bg-white dark:bg-slate-900 text-teal-700 dark:text-teal-300 shadow-xs"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
              )}
            >
              <span>⊞</span>
              <span>Diagram 5 Bidang</span>
            </button>
          </div>

          <Button
            type="button"
            variant={showPedodontic ? "primary" : "outline"}
            size="sm"
            onClick={() => setShowPedodontic(!showPedodontic)}
            className="text-xs h-8"
          >
            {showPedodontic ? "Gigi Dewasa" : "Gigi Anak (Susu)"}
          </Button>

          <Button
            type="button"
            variant={showLegend ? "primary" : "outline"}
            size="sm"
            onClick={() => setShowLegend(!showLegend)}
            className="text-xs h-8 gap-1"
          >
            <Info className="h-3.5 w-3.5" />
            <span>{showLegend ? "Tutup Info Warna" : "Info Warna"}</span>
          </Button>
        </div>
      </div>

      {/* Summary Metrics - Only show active findings to avoid clutter */}
      <div className="flex flex-wrap items-center gap-2 text-xs">
        <span className="font-semibold text-slate-700 dark:text-slate-300">Temuan Klinis:</span>
        {cariesCount > 0 && (
          <Badge variant="danger" size="sm">
            Karies: {cariesCount}
          </Badge>
        )}
        {filledPermanentCount > 0 && (
          <Badge variant="success" size="sm" className="bg-emerald-600 text-white border-emerald-700">
            Tambalan Tetap (Hijau): {filledPermanentCount}
          </Badge>
        )}
        {filledTemporaryCount > 0 && (
          <Badge variant="warning" size="sm" className="bg-yellow-400 text-slate-950 font-bold border-yellow-500">
            Tambalan Sementara (Kuning): {filledTemporaryCount}
          </Badge>
        )}
        {filledAmalgamCount > 0 && (
          <Badge variant="neutral" size="sm">
            Amalgam: {filledAmalgamCount}
          </Badge>
        )}
        {extractedCount > 0 && (
          <Badge variant="danger" size="sm">
            Dicabut: {extractedCount}
          </Badge>
        )}
        {missingCount > 0 && (
          <Badge variant="neutral" size="sm">
            Hilang: {missingCount}
          </Badge>
        )}
        {rctCount > 0 && (
          <Badge variant="warning" size="sm">
            PSA: {rctCount}
          </Badge>
        )}
        {cariesCount === 0 && filledPermanentCount === 0 && filledTemporaryCount === 0 && filledAmalgamCount === 0 && extractedCount === 0 && missingCount === 0 && rctCount === 0 && (
          <Badge variant="neutral" size="sm">
            Semua Gigi Normal
          </Badge>
        )}
        {totalCost > 0 && (
          <Badge variant="success" size="sm" className="font-mono font-bold ml-auto">
            Estimasi Tindakan: {formatCurrency(totalCost)}
          </Badge>
        )}
      </div>

      {/* Optional Collapsible Color Legend Drawer */}
      {showLegend && (
        <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs animate-in fade-in duration-200">
          <p className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-2">
            Panduan Simbol & Warna:
          </p>
          <div className="flex flex-wrap items-center gap-1.5">
            {TOOTH_CONDITIONS.map((c) => (
              <div
                key={c.value}
                className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[10px]"
              >
                <div className="h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: c.color }} />
                <span className="text-slate-700 dark:text-slate-300 font-medium">{c.label}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Odontogram Grid: Maxilla (Upper) and Mandible (Lower) */}
      <div className="space-y-5 pt-1 overflow-x-auto">
        {/* RAHANG ATAS (MAXILLARY ARCH) */}
        <div className="space-y-1.5 min-w-[720px]">
          <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500 px-3">
            <span>Kanan (Q1)</span>
            <span className="text-xs font-bold text-teal-800 dark:text-teal-300 tracking-wide uppercase">
              Rahang Atas (Maxilla)
            </span>
            <span>Kiri (Q2)</span>
          </div>

          <div className="flex items-center justify-center gap-1.5 p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs">
            {/* Upper Right (18 to 11 or 55 to 51) */}
            <div className="flex gap-1">
              {(showPedodontic ? pedoUpperRight : adultUpperRight).map((t) => renderToothVisual(t))}
            </div>

            <div className="h-16 w-0.5 bg-teal-400/50 mx-2" />

            {/* Upper Left (21 to 28 or 61 to 65) */}
            <div className="flex gap-1">
              {(showPedodontic ? pedoUpperLeft : adultUpperLeft).map((t) => renderToothVisual(t))}
            </div>
          </div>
        </div>

        {/* MID-LINE DIVIDER */}
        <div className="relative flex items-center justify-center min-w-[720px] my-1">
          <div className="w-full border-t border-slate-200 dark:border-slate-800" />
          <span className="absolute bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-3 py-0.5 rounded-full text-[10px] font-medium text-slate-400">
            Garis Tengah Lengkung Gigi / Bidang Oklusal
          </span>
        </div>

        {/* RAHANG BAWAH (MANDIBULAR ARCH) */}
        <div className="space-y-1.5 min-w-[720px]">
          <div className="flex items-center justify-center gap-1.5 p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs">
            {/* Lower Right (48 to 41 or 85 to 81) */}
            <div className="flex gap-1">
              {(showPedodontic ? pedoLowerRight : adultLowerRight).map((t) => renderToothVisual(t))}
            </div>

            <div className="h-16 w-0.5 bg-teal-400/50 mx-2" />

            {/* Lower Left (31 to 38 or 71 to 75) */}
            <div className="flex gap-1">
              {(showPedodontic ? pedoLowerLeft : adultLowerLeft).map((t) => renderToothVisual(t))}
            </div>
          </div>

          <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500 px-3">
            <span>Kanan (Q4)</span>
            <span className="text-xs font-bold text-teal-800 dark:text-teal-300 tracking-wide uppercase">
              Rahang Bawah (Mandible)
            </span>
            <span>Kiri (Q3)</span>
          </div>
        </div>
      </div>

      {/* Tooth Detail & Diagnosis Dialog */}
      {selectedTooth !== null && (
        <ToothEditorDialog
          toothNumber={selectedTooth}
          initialRecord={activeTeeth[selectedTooth]}
          onClose={() => setSelectedTooth(null)}
          onSave={handleSaveTooth}
        />
      )}
    </div>
  );
}

// Modal component to edit diagnosis and procedure for an individual tooth
function ToothEditorDialog({
  toothNumber,
  initialRecord,
  onClose,
  onSave,
}: {
  toothNumber: number;
  initialRecord?: ToothRecord;
  onClose: () => void;
  onSave: (record: ToothRecord) => void;
}) {
  const [condition, setCondition] = React.useState<ToothCondition>(
    initialRecord?.condition || "sound"
  );
  const [selectedSurfaces, setSelectedSurfaces] = React.useState<DentalSurface[]>(
    initialRecord?.surfaces || ["O"]
  );
  const [diagnosis, setDiagnosis] = React.useState<string>(
    initialRecord?.diagnosis || ""
  );
  const [procedure, setProcedure] = React.useState<string>(
    initialRecord?.procedure || ""
  );
  const [cost, setCost] = React.useState<number>(
    initialRecord?.procedureCost || 0
  );
  const [costInput, setCostInput] = React.useState<string>(
    initialRecord?.procedureCost ? formatRupiahInput(initialRecord.procedureCost) : ""
  );
  const [notes, setNotes] = React.useState<string>(
    initialRecord?.notes || ""
  );
  const [procedureSearch, setProcedureSearch] = React.useState<string>("");

  const filteredPresets = React.useMemo(() => {
    if (!procedureSearch.trim()) return DENTAL_PROCEDURE_PRESETS;
    const q = procedureSearch.toLowerCase().trim();
    return DENTAL_PROCEDURE_PRESETS.filter(
      (p) => p.name.toLowerCase().includes(q) || p.code.toLowerCase().includes(q)
    );
  }, [procedureSearch]);

  const toothName = TOOTH_NAMES[toothNumber] || `Gigi #${toothNumber}`;

  const toggleSurface = (surf: DentalSurface) => {
    setSelectedSurfaces((prev) =>
      prev.includes(surf) ? prev.filter((s) => s !== surf) : [...prev, surf]
    );
  };

  const handleSelectPreset = (preset: typeof DENTAL_PROCEDURE_PRESETS[0]) => {
    setProcedure(preset.name);
    setCost(preset.cost);
    setCostInput(formatRupiahInput(preset.cost));
    setCondition(preset.condition);
  };

  const handleSelectAmountChip = (amount: number) => {
    setCost(amount);
    setCostInput(amount === 0 ? "0" : formatRupiahInput(amount));
  };

  const handleCostInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawVal = e.target.value;
    if (rawVal.trim() === "") {
      setCostInput("");
      setCost(0);
      return;
    }
    const cleanDigits = rawVal.replace(/\D/g, "");
    if (!cleanDigits) {
      setCostInput("");
      setCost(0);
      return;
    }
    const num = parseInt(cleanDigits, 10);
    setCost(num);
    setCostInput(formatRupiahInput(num));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      toothNumber,
      condition,
      surfaces: selectedSurfaces,
      diagnosis,
      procedure,
      procedureCost: cost,
      notes,
      updatedAt: new Date().toISOString(),
    });
  };

  return (
    <Dialog open={true} onOpenChange={onClose} className="max-w-4xl sm:max-w-4xl w-full">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Modal Header with Live Anatomical Preview */}
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-3">
            <div className="h-16 w-12 p-1 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 flex items-center justify-center shrink-0 shadow-inner">
              <AnatomicalToothSvg
                toothNum={toothNumber}
                condition={condition}
                surfaces={selectedSurfaces}
                className="h-full w-full"
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-teal-600 text-white font-mono text-xs font-bold">
                  {toothNumber}
                </span>
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                  Pemeriksaan Gigi #{toothNumber}
                </h3>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">{toothName}</p>
            </div>
          </div>
          <div className="flex flex-col items-end gap-1">
            <Badge variant="subtle" className="text-xs">
              FDI Notasi
            </Badge>
            <span className="text-[10px] text-teal-600 dark:text-teal-400 font-medium">
              Preview Interaktif
            </span>
          </div>
        </div>

        {/* Condition Selector */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
            Kondisi Patologi / Status Gigi
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
            {TOOTH_CONDITIONS.map((c) => {
              const active = condition === c.value;
              return (
                <button
                  type="button"
                  key={c.value}
                  onClick={() => setCondition(c.value)}
                  className={cn(
                    "flex items-center gap-2 p-2 rounded-xl text-xs font-medium border text-left transition-all",
                    active
                      ? "ring-2 ring-teal-500 border-teal-500 bg-teal-50/50 dark:bg-teal-950/40 text-slate-900 dark:text-slate-100"
                      : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 hover:bg-slate-50"
                  )}
                >
                  <div
                    className="h-2.5 w-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: c.color }}
                  />
                  <span className="truncate">{c.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Surface Selector with Interactive Anatomical Diagram */}
        <div className="space-y-2 pt-1">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Permukaan Gigi Terkena (Dental Surfaces)
            </label>
            <span className="text-[10px] font-mono text-teal-600 dark:text-teal-400 font-semibold">
              Garis Tengah (Midline): {((toothNumber >= 11 && toothNumber <= 18) || (toothNumber >= 41 && toothNumber <= 48) || (toothNumber >= 51 && toothNumber <= 55) || (toothNumber >= 81 && toothNumber <= 85)) ? "Sisi Kanan →" : "← Sisi Kiri"}
            </span>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800">
            {/* Interactive 5-Surface Mini-diagram */}
            {(() => {
              const isUpperTooth = (toothNumber >= 11 && toothNumber <= 28) || (toothNumber >= 51 && toothNumber <= 65);
              const isRightQuadrant =
                (toothNumber >= 11 && toothNumber <= 18) ||
                (toothNumber >= 41 && toothNumber <= 48) ||
                (toothNumber >= 51 && toothNumber <= 55) ||
                (toothNumber >= 81 && toothNumber <= 85);
              const topSurf: DentalSurface = isUpperTooth ? "B" : "L";
              const bottomSurf: DentalSurface = isUpperTooth ? "L" : "B";
              const rightSurf: DentalSurface = isRightQuadrant ? "M" : "D";
              const leftSurf: DentalSurface = isRightQuadrant ? "D" : "M";

              const getActiveSurfaceColor = () => {
                if (condition === "filled_composite") return "#16a34a"; // Green for permanent
                if (condition === "filled_temporary") return "#eab308"; // Yellow for temporary
                if (condition === "filled_amalgam") return "#475569";
                if (condition === "caries") return "#f43f5e";
                return "#0284c7";
              };

              const activeColor = getActiveSurfaceColor();

              return (
                <div className="relative h-20 w-20 shrink-0 select-none">
                  <svg viewBox="0 0 100 100" className="h-full w-full drop-shadow-2xs">
                    {/* Top Polygon */}
                    <polygon
                      points="10,10 90,10 70,30 30,30"
                      fill={selectedSurfaces.includes(topSurf) ? activeColor : "#f1f5f9"}
                      stroke="#475569"
                      strokeWidth="2"
                      className="cursor-pointer hover:opacity-80 transition-all"
                      onClick={() => toggleSurface(topSurf)}
                    />
                    {/* Right Polygon (Mesial if Right Quadrant, Distal if Left Quadrant) */}
                    <polygon
                      points="90,10 90,90 70,70 70,30"
                      fill={selectedSurfaces.includes(rightSurf) ? activeColor : "#e2e8f0"}
                      stroke="#475569"
                      strokeWidth="2"
                      className="cursor-pointer hover:opacity-80 transition-all"
                      onClick={() => toggleSurface(rightSurf)}
                    />
                    {/* Bottom Polygon */}
                    <polygon
                      points="90,90 10,90 30,70 70,70"
                      fill={selectedSurfaces.includes(bottomSurf) ? activeColor : "#f1f5f9"}
                      stroke="#475569"
                      strokeWidth="2"
                      className="cursor-pointer hover:opacity-80 transition-all"
                      onClick={() => toggleSurface(bottomSurf)}
                    />
                    {/* Left Polygon (Distal if Right Quadrant, Mesial if Left Quadrant) */}
                    <polygon
                      points="10,10 10,90 30,70 30,30"
                      fill={selectedSurfaces.includes(leftSurf) ? activeColor : "#e2e8f0"}
                      stroke="#475569"
                      strokeWidth="2"
                      className="cursor-pointer hover:opacity-80 transition-all"
                      onClick={() => toggleSurface(leftSurf)}
                    />
                    {/* Center / Occlusal Polygon */}
                    <polygon
                      points="30,30 70,30 70,70 30,70"
                      fill={selectedSurfaces.includes("O") ? activeColor : "#ffffff"}
                      stroke="#475569"
                      strokeWidth="2"
                      className="cursor-pointer hover:opacity-80 transition-all"
                      onClick={() => toggleSurface("O")}
                    />
                    {/* Labels on SVG */}
                    <text x="50" y="21" textAnchor="middle" fontSize="9" fontWeight="bold" fill={selectedSurfaces.includes(topSurf) ? "#ffffff" : "#475569"} pointerEvents="none">
                      {topSurf}
                    </text>
                    <text x="78" y="54" textAnchor="middle" fontSize="9" fontWeight="bold" fill={selectedSurfaces.includes(rightSurf) ? "#ffffff" : "#475569"} pointerEvents="none">
                      {rightSurf}
                    </text>
                    <text x="50" y="87" textAnchor="middle" fontSize="9" fontWeight="bold" fill={selectedSurfaces.includes(bottomSurf) ? "#ffffff" : "#475569"} pointerEvents="none">
                      {bottomSurf}
                    </text>
                    <text x="22" y="54" textAnchor="middle" fontSize="9" fontWeight="bold" fill={selectedSurfaces.includes(leftSurf) ? "#ffffff" : "#475569"} pointerEvents="none">
                      {leftSurf}
                    </text>
                    <text x="50" y="54" textAnchor="middle" fontSize="11" fontWeight="bold" fill={selectedSurfaces.includes("O") ? "#ffffff" : "#475569"} pointerEvents="none">
                      O
                    </text>
                  </svg>
                </div>
              );
            })()}

            {/* Surface Buttons */}
            {(() => {
              const isUpperTooth = (toothNumber >= 11 && toothNumber <= 28) || (toothNumber >= 51 && toothNumber <= 65);
              const isRightQuadrant =
                (toothNumber >= 11 && toothNumber <= 18) ||
                (toothNumber >= 41 && toothNumber <= 48) ||
                (toothNumber >= 51 && toothNumber <= 55) ||
                (toothNumber >= 81 && toothNumber <= 85);

              const activeBtnStyle =
                condition === "filled_composite"
                  ? "bg-emerald-600 text-white border-emerald-600 shadow-2xs"
                  : condition === "filled_temporary"
                  ? "bg-amber-400 text-amber-950 font-bold border-amber-500 shadow-2xs"
                  : condition === "caries"
                  ? "bg-rose-500 text-white border-rose-500 shadow-2xs"
                  : "bg-teal-600 text-white border-teal-600 shadow-2xs";

              return (
                <div className="flex-1 flex flex-wrap gap-1.5">
                  {[
                    { key: "O", label: "Oklusal (O) - Kunyah" },
                    {
                      key: "M",
                      label: `Mesial (M) - ${isRightQuadrant ? "Kanan (ke Tengah)" : "Kiri (ke Tengah)"}`,
                    },
                    {
                      key: "D",
                      label: `Distal (D) - ${isRightQuadrant ? "Kiri (ke Belakang)" : "Kanan (ke Belakang)"}`,
                    },
                    { key: "B", label: `Bukal (B) - ${isUpperTooth ? "Pipi Atas" : "Bibir/Pipi Bawah"}` },
                    { key: "L", label: isUpperTooth ? "Palatal (P) - Langit-langit" : "Lingual (L) - Sisi Lidah" },
                  ].map((s) => {
                    const active = selectedSurfaces.includes(s.key as DentalSurface);
                    return (
                      <button
                        type="button"
                        key={s.key}
                        onClick={() => toggleSurface(s.key as DentalSurface)}
                        className={cn(
                          "px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all",
                          active
                            ? activeBtnStyle
                            : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 hover:bg-slate-100"
                        )}
                      >
                        {s.label}
                      </button>
                    );
                  })}
                </div>
              );
            })()}
          </div>
        </div>

        {/* Quick Procedure Presets */}
        <div className="space-y-2 pt-1">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-1.5">
            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Pilihan Cepat Tindakan & Tarif Standar
              </label>
              <p className="text-[10px] text-slate-400">Pilih tindakan untuk mengisi nama & tarif secara otomatis</p>
            </div>

            {/* Search Tindakan Input */}
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
              <input
                type="text"
                value={procedureSearch}
                onChange={(e) => setProcedureSearch(e.target.value)}
                placeholder="Cari tindakan (e.g. Open bur, Alginat)..."
                className="w-full h-8 pl-8 pr-7 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 shadow-2xs"
              />
              {procedureSearch && (
                <button
                  type="button"
                  onClick={() => setProcedureSearch("")}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
                  title="Hapus pencarian"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 max-h-52 overflow-y-auto pr-1">
            {filteredPresets.length > 0 ? (
              filteredPresets.map((preset) => (
                <button
                  type="button"
                  key={preset.name}
                  onClick={() => handleSelectPreset(preset)}
                  className={cn(
                    "flex items-center justify-between p-2.5 rounded-xl text-left border text-xs transition-all cursor-pointer hover:border-teal-400 hover:bg-slate-50 dark:hover:bg-slate-800",
                    procedure === preset.name
                      ? "border-teal-500 bg-teal-50 dark:bg-teal-950/40 text-teal-900 dark:text-teal-200 font-semibold shadow-2xs ring-1 ring-teal-500"
                      : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700"
                  )}
                >
                  <div className="truncate mr-2">
                    <p className="truncate font-semibold">{preset.name}</p>
                    <p className="text-[10px] text-slate-400 font-mono">Kode: {preset.code}</p>
                  </div>
                  <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400 shrink-0">
                    {formatCurrency(preset.cost)}
                  </span>
                </button>
              ))
            ) : (
              <div className="col-span-full py-6 text-center text-xs text-slate-400">
                Tidak ada tindakan yang cocok dengan kata kunci &quot;<span className="text-slate-600 dark:text-slate-200 font-semibold">{procedureSearch}</span>&quot;
              </div>
            )}
          </div>
        </div>

        {/* Manual Procedure Name & Tariff Input (Editable) */}
        <div className="p-3 rounded-xl border border-teal-200 dark:border-teal-800/60 bg-teal-50/40 dark:bg-teal-950/20 space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-teal-900 dark:text-teal-200 flex items-center gap-1.5">
              <Banknote className="h-4 w-4 text-teal-600 dark:text-teal-400" />
              Nama Tindakan & Tarif Biaya (Bisa Diinput Manual)
            </label>
            <span className="text-[10px] font-medium text-teal-700 dark:text-teal-300 bg-teal-100 dark:bg-teal-900/60 px-2 py-0.5 rounded-full">
              Sinkron ke Kasir & Keuangan
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Procedure Name Field */}
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400">
                Nama Tindakan Medis
              </label>
              <input
                type="text"
                value={procedure}
                onChange={(e) => setProcedure(e.target.value)}
                placeholder="Contoh: Penambalan Gigi 16"
                className="w-full h-8 px-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-medium text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-teal-500"
              />
            </div>

            {/* Custom Tariff Input Field */}
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400">
                Tarif Biaya Tindakan
              </label>
              <div className="relative flex items-center">
                <span className="absolute left-2.5 text-xs font-bold text-slate-400 pointer-events-none select-none">
                  Rp
                </span>
                <input
                  type="text"
                  inputMode="numeric"
                  value={costInput}
                  onChange={handleCostInputChange}
                  placeholder="0"
                  className="w-full h-8 pl-8 pr-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400 focus:outline-none focus:ring-1 focus:ring-teal-500"
                />
              </div>
            </div>
          </div>

          {/* Quick Tariff Adjustment Chips */}
          <div className="space-y-1">
            <span className="text-[10px] text-slate-500 font-medium">Pilihan Cepat Nominal Tarif:</span>
            <div className="flex flex-wrap gap-1.5">
              {[
                { label: "Gratis (Rp 0)", amount: 0 },
                { label: "150rb", amount: 150000 },
                { label: "250rb", amount: 250000 },
                { label: "350rb", amount: 350000 },
                { label: "450rb", amount: 450000 },
                { label: "650rb", amount: 650000 },
                { label: "1 Juta", amount: 1000000 },
              ].map((chip) => (
                <button
                  type="button"
                  key={chip.amount}
                  onClick={() => handleSelectAmountChip(chip.amount)}
                  className={cn(
                    "px-2 py-0.5 text-[11px] font-mono rounded-md border transition-all cursor-pointer",
                    cost === chip.amount
                      ? "bg-teal-600 text-white border-teal-600 font-bold shadow-2xs"
                      : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                  )}
                >
                  {chip.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Notes */}
        <div className="space-y-1">
          <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
            Catatan Klinis Tambahan Gigi #{toothNumber}
          </label>
          <input
            type="text"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="e.g. Kavitas kelas II Black, sondasi +, perkusi -, tes dingin +"
            className="w-full h-8 px-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs"
          />
        </div>

        {/* Footer Actions */}
        <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
          <Button type="button" variant="outline" size="sm" onClick={onClose}>
            Batal
          </Button>
          <Button type="submit" variant="primary" size="sm">
            <Check className="h-4 w-4" />
            Terapkan ke Odontogram
          </Button>
        </div>
      </form>
    </Dialog>
  );
}

