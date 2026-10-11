import patientsData from "@/data/patients.json";

export function generateStaticParams() {
  const dataIds = (patientsData as Array<{ id: string }>).map((p) => p.id);
  const defaultIds = Array.from({ length: 50 }, (_, i) => `PAT-${String(i + 1).padStart(3, "0")}`);
  const numericIds = Array.from({ length: 50 }, (_, i) => String(i + 1));
  const allIds = Array.from(new Set([...dataIds, ...defaultIds, ...numericIds]));
  return allIds.map((id) => ({ id }));
}

export default function PatientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
