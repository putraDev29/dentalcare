import { format, parseISO, differenceInYears, isValid } from "date-fns";
import { id } from "date-fns/locale";

/**
 * Format number to Indonesian Rupiah currency string (e.g. Rp 150.000)
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Format ISO date string or Date to readable format (e.g. 16 Sep 2026)
 */
export function formatDate(dateInput?: string | Date | null, formatStr: string = "dd MMM yyyy"): string {
  if (!dateInput) return "-";
  try {
    const d = typeof dateInput === "string" ? parseISO(dateInput) : dateInput;
    if (!isValid(d)) return "-";
    return format(d, formatStr, { locale: id });
  } catch {
    return "-";
  }
}

/**
 * Format ISO date string or Date to datetime format (e.g. 16 Sep 2026, 10:45)
 */
export function formatDateTime(dateInput?: string | Date | null): string {
  return formatDate(dateInput, "dd MMM yyyy, HH:mm");
}

/**
 * Format time only (e.g. 09:30)
 */
export function formatTime(dateInput?: string | Date | null): string {
  return formatDate(dateInput, "HH:mm");
}

/**
 * Calculate age in years from birthDate string (YYYY-MM-DD)
 */
export function getAge(birthDateString?: string | null): number {
  if (!birthDateString) return 0;
  try {
    const birthDate = parseISO(birthDateString);
    if (!isValid(birthDate)) return 0;
    return differenceInYears(new Date(), birthDate);
  } catch {
    return 0;
  }
}

/**
 * Get formatted age string (e.g. "34 Tahun")
 */
export function formatAge(birthDateString?: string | null): string {
  const age = getAge(birthDateString);
  return `${age} Tahun`;
}

/**
 * Get 2-letter initials from full name
 */
export function getInitials(name?: string | null): string {
  if (!name) return "EH";
  const parts = name.trim().split(" ").filter(Boolean);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

/**
 * Mask NIK for privacy compliance (e.g. 3174********1234)
 */
export function maskNik(nik?: string | null): string {
  if (!nik) return "-";
  const clean = nik.replace(/\s+/g, "");
  if (clean.length < 8) return clean;
  return `${clean.slice(0, 4)}********${clean.slice(-4)}`;
}

/**
 * Mask Phone number (e.g. 0812****5678)
 */
export function maskPhone(phone?: string | null): string {
  if (!phone) return "-";
  const clean = phone.replace(/\s+/g, "");
  if (clean.length < 8) return clean;
  return `${clean.slice(0, 4)}****${clean.slice(-4)}`;
}

/**
 * Calculate BMI and category from Weight (kg) and Height (cm)
 */
export function calculateBmi(weightKg: number, heightCm: number): {
  bmi: number;
  category: "Underweight" | "Normal" | "Overweight" | "Obese";
} {
  if (heightCm <= 0 || weightKg <= 0) {
    return { bmi: 0, category: "Normal" };
  }
  const heightM = heightCm / 100;
  const bmi = Math.round((weightKg / (heightM * heightM)) * 10) / 10;
  
  let category: "Underweight" | "Normal" | "Overweight" | "Obese" = "Normal";
  if (bmi < 18.5) category = "Underweight";
  else if (bmi < 25.0) category = "Normal";
  else if (bmi < 30.0) category = "Overweight";
  else category = "Obese";

  return { bmi, category };
}

/**
 * Format raw number or string with thousand separator dots for input fields (e.g. 250000 -> "250.000")
 */
export function formatRupiahInput(value: number | string | undefined | null): string {
  if (value === "" || value === null || value === undefined) return "";
  const clean = String(value).replace(/\D/g, "");
  if (!clean) return "";
  const num = parseInt(clean, 10);
  if (isNaN(num)) return "";
  return new Intl.NumberFormat("id-ID").format(num);
}

/**
 * Parse thousand-separated string into numeric integer (e.g. "250.000" -> 250000)
 */
export function parseRupiahInput(value: string | undefined | null): number {
  if (!value) return 0;
  const clean = String(value).replace(/\D/g, "");
  if (!clean) return 0;
  const num = parseInt(clean, 10);
  return isNaN(num) ? 0 : num;
}


