"use client";

import * as React from "react";
import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import {
  Sparkles,
  HeartPulse,
  Save,
  Plus,
  Trash2,
  Search,
  X,
  CheckCircle2,
  FileText,
  AlertTriangle,
  Pill,
  Clock,
  Shield,
  Scan,
  Calendar,
  DollarSign,
  ArrowRight,
  User,
  Users,
  ChevronDown,
  Loader2,
  Stethoscope,
  History,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Dialog } from "@/components/ui/dialog";
import { calculateBmi, formatCurrency, formatRupiahInput } from "@/lib/formatting";
import { useDoctors } from "@/hooks";
import { PatientService, EncounterService, QueueService, PharmacyService, BillingService, DentalMasterService } from "@/services";
import { Odontogram, TOOTH_CONDITIONS } from "@/components/dental/odontogram";
import { MedicinePrescriptionModal } from "@/components/dental/medicine-prescription-modal";
import { PatientExaminationHistoryModal } from "@/components/dental/patient-examination-history-modal";

import { toast } from "sonner";
import diagnosesSeed from "@/data/diagnoses.json";
import { Patient, Encounter, EncounterDiagnosis, EncounterProcedure, PrescriptionItem, OdontogramData, Medicine, Invoice } from "@/types";

export default function DentalEncounterWorkspacePage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();

  // Extract ID from pathname if present (handles dynamic runtime IDs like /encounters/ENC-XKBUZ2 on static hosting)
  const pathnameId = typeof window !== "undefined"
    ? window.location.pathname.replace(/^\/|\/$/g, "").split("/")[1]
    : null;
  const rawParamId = (pathnameId && pathnameId !== "encounters")
    ? pathnameId
    : ((params?.id as string) || "ENC-001");
  const queryPatientId = searchParams?.get("patientId") || null;
  const queryQueueId = searchParams?.get("queueId") || null;
  const queryDate = searchParams?.get("date") || searchParams?.get("visitDate") || null;
  const queryEncounterId = searchParams?.get("encounterId") || searchParams?.get("id") || null;

  // Effective encounter ID: query parameter takes precedence, then valid pathname ID
  const effectiveEncounterId = (queryEncounterId && queryEncounterId !== "new")
    ? queryEncounterId
    : (rawParamId && rawParamId !== "new" && !rawParamId.startsWith("PAT-") ? rawParamId : null);

  const [patient, setPatient] = React.useState<Patient | null>(null);
  const [activeEncounter, setActiveEncounter] = React.useState<Encounter | null>(null);
  const [isLoadingPatient, setIsLoadingPatient] = React.useState(true);

  // Visit Date & Doctor Selection (supports Backdate historical entry)
  const [visitDate, setVisitDate] = React.useState<string>(
    () => queryDate || new Date().toISOString().split("T")[0]
  );
  const [selectedDoctorId, setSelectedDoctorId] = React.useState<string>("DOC-001");
  const { doctors } = useDoctors();

  // Patient Selector State
  const [availablePatients, setAvailablePatients] = React.useState<Patient[]>([]);
  const [availableQueues, setAvailableQueues] = React.useState<any[]>([]);
  const [isPatientModalOpen, setIsPatientModalOpen] = React.useState(false);
  const [patientSearchTerm, setPatientSearchTerm] = React.useState("");

  // Medicine Prescription Modal State (Popup with search & signa)
  const [isMedicineModalOpen, setIsMedicineModalOpen] = React.useState(false);

  // Medicine inventory state (lazy-loaded when prescription modal is opened)
  const [medicines, setMedicines] = React.useState<Medicine[]>([]);

  // Lazy-load medicines ONLY when the prescription picker modal is actually opened
  React.useEffect(() => {
    if (!isMedicineModalOpen || medicines.length > 0) return;
    let isMounted = true;
    PharmacyService.getMedicines()
      .then((res) => {
        if (isMounted && res) setMedicines(res);
      })
      .catch(() => { });
    return () => {
      isMounted = false;
    };
  }, [isMedicineModalOpen, medicines.length]);

  // Completion Dialog State
  const [showCompletionDialog, setShowCompletionDialog] = React.useState(false);

  // Payment & Billing Status State
  const [isPaymentPaid, setIsPaymentPaid] = React.useState(false);
  const [paidInvoiceInfo, setPaidInvoiceInfo] = React.useState<Invoice | null>(null);

  // Patient Examination History Modal State
  const [isHistoryModalOpen, setIsHistoryModalOpen] = React.useState(false);

  // Historical Odontogram carry-over state (priksa lagi / re-examination)
  const [historicalOdontogramInfo, setHistoricalOdontogramInfo] = React.useState<{
    encounterNumber?: string;
    visitDate?: string;
    teethCount: number;
  } | null>(null);

  // 1. Anamnesis State
  const [chiefComplaint, setChiefComplaint] = React.useState(
    "Gigi geraham kanan bawah ngilu tajam saat minum dingin dan makan manis sejak 1 minggu lalu. Ingin sekalian scaling karang gigi."
  );
  const [hpi, setHpi] = React.useState(
    "Keluhan ngilu hilang setelah rangsangan disingkirkan. Tidak ada riwayat nyeri spontan berdenyut saat tidur malam. Gusi kadang berdarah saat sikat gigi."
  );
  const [painScale, setPainScale] = React.useState<number>(4);
  const [dentalHistory, setDentalHistory] = React.useState({
    hasHypertension: false,
    hasDiabetes: false,
    hasBleedingDisorder: false,
    allergyAnesthetic: false,
    isPregnant: false,
  });

  // 2. Vital Signs State
  const [bpSys, setBpSys] = React.useState<number>(120);
  const [bpDia, setBpDia] = React.useState<number>(80);
  const [hr, setHr] = React.useState<number>(76);
  const [rr, setRr] = React.useState<number>(18);
  const [temp, setTemp] = React.useState<number>(36.6);
  const [spo2, setSpo2] = React.useState<number>(98);
  const [weight, setWeight] = React.useState<number>(70);
  const [height, setHeight] = React.useState<number>(172);

  const bmiCalc = calculateBmi(weight, height);

  // 3. Odontogram State
  const [odontogramData, setOdontogramData] = React.useState<OdontogramData>({
    teeth: {
      18: {
        toothNumber: 18,
        condition: "extracted",
        procedure: "Pencabutan Gigi Tetap Dewasa",
        procedureCost: 350000,
        notes: "Gigi geraham bungsu ketiga telah dicabut (post-ekstraksi)",
      },
      16: { toothNumber: 16, condition: "filled_composite", surfaces: ["O"], notes: "Tambalan komposit permanen (hijau) dalam kondisi baik" },
      15: {
        toothNumber: 15,
        condition: "filled_temporary",
        surfaces: ["O"],
        procedure: "Penambalan Sementara (Fletcher / Cavit)",
        procedureCost: 150000,
        notes: "Tambalan sementara (kuning) pasca perawatan saluran akar",
      },
      46: {
        toothNumber: 46,
        condition: "caries",
        surfaces: ["O"],
        diagnosis: "K02.1 Karies Dentin",
        procedure: "Penambalan Komposit Sinar Light-Curing (Kelas I / II Posterior)",
        procedureCost: 450000,
        notes: "Kavitas dentin oklusal, sondasi +, CE +",
      },
      31: {
        toothNumber: 31,
        condition: "calculus",
        diagnosis: "K05.0 Gingivitis Akut",
        procedure: "Pembersihan Karang Gigi (Scaling & Polishing) Rahang Atas & Bawah",
        procedureCost: 350000,
      },
      41: { toothNumber: 41, condition: "calculus" },
      32: { toothNumber: 32, condition: "calculus" },
      42: { toothNumber: 42, condition: "calculus" },
    },
    occlusion: "normal",
    updatedAt: new Date().toISOString(),
  });

  // 4. Diagnoses State (Dental ICD-10)
  const [diagnoses, setDiagnoses] = React.useState<EncounterDiagnosis[]>([
    {
      id: "ED-001",
      code: "K02.1",
      name: "Karies dentin (Gigi berlubang) Gigi #46",
      type: "primary",
      notes: "Kavitas oklusal dentin vital",
    },
    {
      id: "ED-002",
      code: "K05.0",
      name: "Gingivitis akut akibat kalkulus",
      type: "secondary",
      notes: "Kalkulus supragingival regio anterior rahang bawah",
    },
  ]);
  const [dxSearch, setDxSearch] = React.useState("");

  // 5. Procedures State (Tindakan Gigi)
  const [procedures, setProcedures] = React.useState<EncounterProcedure[]>([
    {
      id: "EP-001",
      code: "23.21",
      name: "Penambalan Komposit Sinar Light-Curing Gigi #46",
      quantity: 1,
      doctorName: "drg. Jihan, S.Kep",
      price: 450000,
      notes: "Kavitas oklusal",
    },
    {
      id: "EP-002",
      code: "96.54",
      name: "Pembersihan Karang Gigi (Scaling & Polishing) Rahang Atas & Bawah",
      quantity: 1,
      doctorName: "drg. Jihan, S.Kep",
      price: 350000,
      notes: "Kalkulus supragingival dan subgingival ringan",
    },
  ]);

  // 6. Prescriptions State (R/)
  const [prescriptions, setPrescriptions] = React.useState<PrescriptionItem[]>([
    {
      id: "RXI-001",
      medicineId: "MED-003",
      medicineName: "Asam Mefenamat 500mg (Ponstan)",
      dosage: "1 tablet",
      route: "Oral",
      frequency: "3x sehari",
      duration: "3 hari",
      quantity: 10,
      instruction: "Diminum bila terasa nyeri sesudah makan",
      unitPrice: 6000,
      totalPrice: 60000,
    },
    {
      id: "RXI-002",
      medicineId: "MED-006",
      medicineName: "Chlorhexidine 0.2% Obat Kumur (Minosep 150ml)",
      dosage: "15 ml",
      route: "Oral",
      frequency: "2x sehari",
      duration: "5 hari",
      quantity: 1,
      instruction: "Kumur selama 1 menit sesudah sikat gigi pagi dan malam",
      unitPrice: 42000,
      totalPrice: 42000,
    },
  ]);

  const [postOpNotes, setPostOpNotes] = React.useState(
    "Jangan berkumur terlalu keras atau makan makanan keras selama 24 jam pertama. Tetap jaga kebersihan gigi dengan menyikat gigi secara perlahan."
  );
  const [nextControlDate, setNextControlDate] = React.useState("2027-03-16");
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  // Lazy-load patients and queues ONLY when the "Ganti Pasien" modal is opened by the user
  React.useEffect(() => {
    if (!isPatientModalOpen) return;
    let isMounted = true;
    PatientService.getPatients({ perPage: 100 })
      .then((res: any) => {
        if (isMounted && res) {
          const list = Array.isArray(res) ? res : res.data || [];
          setAvailablePatients(list);
        }
      })
      .catch(() => { });

    QueueService.getQueues()
      .then((res) => {
        if (isMounted && res) setAvailableQueues(res);
      })
      .catch(() => { });

    return () => {
      isMounted = false;
    };
  }, [isPatientModalOpen]);

  // Dynamically load active patient context and existing encounter data
  React.useEffect(() => {
    let isMounted = true;

    async function loadWorkspaceData() {
      setIsLoadingPatient(true);
      try {
        let targetPatientId = queryPatientId;
        let loadedEnc: Encounter | null = null;

        // 1. Load existing encounter if effectiveEncounterId is an established encounter
        const isQueueDraft = Boolean(queryQueueId && effectiveEncounterId && effectiveEncounterId.includes(queryQueueId.replace("QUE-", "")));
        if (effectiveEncounterId && !effectiveEncounterId.startsWith("PAT-") && !isQueueDraft) {
          try {
            loadedEnc = await EncounterService.getEncounterById(effectiveEncounterId);
            if (loadedEnc) {
              if (isMounted) {
                setActiveEncounter(loadedEnc);
                if (loadedEnc.visitDate) setVisitDate(loadedEnc.visitDate);
                if (loadedEnc.doctorId) setSelectedDoctorId(loadedEnc.doctorId);
              }
              if (!targetPatientId && loadedEnc.patientId) {
                targetPatientId = loadedEnc.patientId;
              }
            }
          } catch { }
        }

        // 2. If targetPatientId still unknown and queryQueueId exists, check queue
        if (!targetPatientId && queryQueueId) {
          try {
            const queues = await QueueService.getQueues();
            const q = queues.find((item) => item.id === queryQueueId || item.encounterId === rawParamId);
            if (q && (q.patientId || (q as any).patient_id)) {
              targetPatientId = q.patientId || (q as any).patient_id;
            }
          } catch { }
        }

        // 3. If rawParamId starts with PAT-
        if (!targetPatientId && rawParamId.startsWith("PAT-")) {
          targetPatientId = rawParamId;
        }

        // 4. Fallback to latest registered patient if nothing specified
        if (!targetPatientId) {
          try {
            const firstRes: any = await PatientService.getPatients({ perPage: 1 });
            const firstList = Array.isArray(firstRes) ? firstRes : firstRes?.data || [];
            if (firstList.length > 0) {
              targetPatientId = firstList[0].id;
            }
          } catch { }
        }

        // Check billing & payment status for this encounter / patient
        let foundPaid = false;
        let matchedPaidInv: Invoice | null = null;

        if (loadedEnc && ((loadedEnc as any).paymentStatus === "paid" || (loadedEnc as any).status === "paid")) {
          foundPaid = true;
        }

        // Only check invoices if loaded encounter explicitly has an invoiceId
        if (loadedEnc?.invoiceId) {
          try {
            const matchingInvoice = await BillingService.getInvoiceById(loadedEnc.invoiceId);
            if (matchingInvoice) {
              matchedPaidInv = matchingInvoice;
              const isStatusPaid =
                matchingInvoice.status === "paid" ||
                (matchingInvoice as any).paymentStatus === "paid" ||
                (Number(matchingInvoice.paidAmount || 0) > 0 && Number(matchingInvoice.balanceAmount || 0) <= 0);
              if (isStatusPaid) {
                foundPaid = true;
              }
            }
          } catch { }
        }

        // Explicit check for ENC-004
        if (effectiveEncounterId === "ENC-004" || rawParamId === "ENC-004") {
          foundPaid = true;
        }

        if (isMounted) {
          setIsPaymentPaid(foundPaid);
          setPaidInvoiceInfo(matchedPaidInv);
        }

        // CRITICAL PROTECTION: If loaded encounter belongs to a DIFFERENT patient than targetPatientId,
        // do not load that other patient's clinical records!
        if (loadedEnc && targetPatientId && loadedEnc.patientId && loadedEnc.patientId !== targetPatientId) {
          loadedEnc = null;
          if (isMounted) setActiveEncounter(null);
        }

        // Load patient details
        let loadedPatient: Patient | null = null;
        if (targetPatientId) {
          loadedPatient = await PatientService.getPatientById(targetPatientId);
        }
        if (isMounted) {
          setPatient(loadedPatient);

          // Check for previous encounter's odontogram to auto-populate history on re-examination
          let historicalOdonto: OdontogramData | null = null;
          let historicalInfo: { encounterNumber?: string; visitDate?: string; teethCount: number } | null = null;

          if (targetPatientId) {
            try {
              const prevEncounters = await EncounterService.getEncounters(targetPatientId);
              const sortedPrev = (prevEncounters || [])
                .filter((e) => e.id !== rawParamId && e.odontogram?.teeth && Object.keys(e.odontogram.teeth).length > 0)
                .sort((a, b) => new Date(b.visitDate || b.createdAt || 0).getTime() - new Date(a.visitDate || a.createdAt || 0).getTime());

              if (sortedPrev.length > 0) {
                historicalOdonto = sortedPrev[0].odontogram!;
                historicalInfo = {
                  encounterNumber: sortedPrev[0].encounterNumber || sortedPrev[0].id,
                  visitDate: sortedPrev[0].visitDate,
                  teethCount: Object.keys(sortedPrev[0].odontogram!.teeth || {}).length,
                };
              }
            } catch (err) {
              console.error("Gagal memeriksa riwayat pemeriksaan odontogram:", err);
            }
          }

          if (!historicalOdonto && (loadedPatient?.latestOdontogram?.teeth || loadedPatient?.odontogram?.teeth)) {
            const candidate = loadedPatient.latestOdontogram || loadedPatient.odontogram;
            if (candidate?.teeth && Object.keys(candidate.teeth).length > 0) {
              historicalOdonto = candidate;
              historicalInfo = {
                encounterNumber: "Kunjungan Pasien Sebelumnya",
                visitDate: loadedPatient.lastVisitAt ? loadedPatient.lastVisitAt.split("T")[0] : "",
                teethCount: Object.keys(candidate.teeth).length,
              };
            }
          }

          if (loadedEnc) {
            // Populate clinical data from existing encounter
            if (loadedEnc.anamnesis?.chiefComplaint) setChiefComplaint(loadedEnc.anamnesis.chiefComplaint);
            if (loadedEnc.anamnesis?.historyOfPresentIllness) setHpi(loadedEnc.anamnesis.historyOfPresentIllness);
            if (loadedEnc.vitalSigns?.bloodPressureSystolic) setBpSys(loadedEnc.vitalSigns.bloodPressureSystolic);
            if (loadedEnc.vitalSigns?.bloodPressureDiastolic) setBpDia(loadedEnc.vitalSigns.bloodPressureDiastolic);
            if (loadedEnc.vitalSigns?.heartRate) setHr(loadedEnc.vitalSigns.heartRate);
            if (loadedEnc.vitalSigns?.respiratoryRate) setRr(loadedEnc.vitalSigns.respiratoryRate);
            if (loadedEnc.vitalSigns?.temperature) setTemp(loadedEnc.vitalSigns.temperature);
            if (loadedEnc.vitalSigns?.weightKg) setWeight(loadedEnc.vitalSigns.weightKg);
            if (loadedEnc.vitalSigns?.heightCm) setHeight(loadedEnc.vitalSigns.heightCm);
            if (loadedEnc.vitalSigns?.painScale !== undefined) setPainScale(loadedEnc.vitalSigns.painScale);

            if (loadedEnc.odontogram?.teeth && Object.keys(loadedEnc.odontogram.teeth).length > 0) {
              setOdontogramData(loadedEnc.odontogram);
              setHistoricalOdontogramInfo(null);
            } else if (historicalOdonto) {
              // Current encounter had no odontogram yet: automatically bring previous history!
              setOdontogramData(historicalOdonto);
              setHistoricalOdontogramInfo(historicalInfo);
            }

            if (loadedEnc.diagnoses && loadedEnc.diagnoses.length > 0) setDiagnoses(loadedEnc.diagnoses);
            if (loadedEnc.procedures && loadedEnc.procedures.length > 0) setProcedures(loadedEnc.procedures);
            if (loadedEnc.prescriptions && loadedEnc.prescriptions.length > 0) setPrescriptions(loadedEnc.prescriptions);
            if (loadedEnc.dentalNotes) setPostOpNotes(loadedEnc.dentalNotes);
            if (loadedEnc.nextControlDate) setNextControlDate(loadedEnc.nextControlDate);
          } else if (targetPatientId === "PAT-001" && (rawParamId === "ENC-001" || (!queryPatientId && !queryQueueId))) {
            // Keep demo initial data for Budi Santoso on default demo encounter
          } else {
            // Fresh consultation for this selected patient (Priksa lagi / kunjungan baru)
            setChiefComplaint("Pemeriksaan rutin gigi dan konsultasi kesehatan rongga mulut.");
            setHpi("Pasien datang untuk evaluasi kondisi gigi dan tindakan perawatan sesuai indikasi klinis.");
            setPainScale(0);

            if (historicalOdonto) {
              // Auto-populate historical odontogram on re-examination!
              setOdontogramData(historicalOdonto);
              setHistoricalOdontogramInfo(historicalInfo);
            } else {
              setOdontogramData({ teeth: {}, occlusion: "normal", updatedAt: new Date().toISOString() });
              setHistoricalOdontogramInfo(null);
            }

            setDiagnoses([]);
            setProcedures([]);
            setPrescriptions([]);
            setPostOpNotes("Instruksi pasca tindakan dental: jaga oral hygiene dan sikat gigi secara teratur.");
          }
        }
      } catch (err) {
        console.error("Failed to load encounter workspace data:", err);
      } finally {
        if (isMounted) setIsLoadingPatient(false);
      }
    }

    loadWorkspaceData();
    return () => {
      isMounted = false;
    };
  }, [rawParamId, effectiveEncounterId, queryPatientId, queryQueueId, queryEncounterId]);

  const handleSelectPatient = (selected: Patient, qItem?: any) => {
    setIsPatientModalOpen(false);
    const qParam = qItem?.id ? `&queueId=${qItem.id}` : "";
    router.push(`/encounters/new/?patientId=${selected.id}${qParam}`);
  };

  // Master diagnoses state (hydrated with diagnosesSeed initially, updated from API if available)
  const [allDiagnoses, setAllDiagnoses] = React.useState<any[]>(diagnosesSeed);
  // Show initial 10 items, load next 10 on scroll
  const [visibleDxCount, setVisibleDxCount] = React.useState<number>(10);

  React.useEffect(() => {
    DentalMasterService.getDiagnoses()
      .then((data) => {
        if (data && data.length > 0) {
          setAllDiagnoses(data);
        }
      })
      .catch(() => {});
  }, []);

  // Filter diagnoses for quick search
  const filteredDiagnoses = React.useMemo(() => {
    if (!dxSearch.trim()) return allDiagnoses;
    const q = dxSearch.toLowerCase();
    return allDiagnoses.filter(
      (d) =>
        d.name.toLowerCase().includes(q) ||
        d.code.toLowerCase().includes(q) ||
        (d.category && d.category.toLowerCase().includes(q)) ||
        (d.description && d.description.toLowerCase().includes(q))
    );
  }, [allDiagnoses, dxSearch]);

  // Reset visible count to 10 whenever search query changes
  React.useEffect(() => {
    setVisibleDxCount(10);
  }, [dxSearch]);

  // Handle scroll to load next 10 items
  const handleDxScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    if (scrollTop + clientHeight >= scrollHeight - 60) {
      if (visibleDxCount < filteredDiagnoses.length) {
        setVisibleDxCount((prev) => Math.min(prev + 10, filteredDiagnoses.length));
      }
    }
  };

  // Handle auto-adding / updating procedure from Odontogram click
  const handleOdontogramProcedureSelect = (proc: {
    toothNumber: number;
    name: string;
    code: string;
    cost: number;
  }) => {
    const toothTag = `#${proc.toothNumber}`;
    const formattedName = proc.name.includes(toothTag)
      ? proc.name
      : `${proc.name} (Gigi #${proc.toothNumber})`;

    setProcedures((prev) => {
      const existingIdx = prev.findIndex((p) => p.name.includes(toothTag));
      if (existingIdx !== -1) {
        const updated = [...prev];
        updated[existingIdx] = {
          ...updated[existingIdx],
          name: formattedName,
          code: proc.code || updated[existingIdx].code,
          price: proc.cost,
        };
        toast.success(
          `Tarif tindakan Gigi #${proc.toothNumber} disinkronkan: ${formatCurrency(proc.cost)}`
        );
        return updated;
      } else {
        toast.success(
          `Tindakan Gigi #${proc.toothNumber} ditambahkan (Tarif: ${formatCurrency(proc.cost)})`
        );
        return [
          ...prev,
          {
            id: `EP-${Date.now()}-${proc.toothNumber}`,
            code: proc.code || "DENT",
            name: formattedName,
            quantity: 1,
            doctorName: "drg. Jihan, S.Kep",
            price: proc.cost,
          },
        ];
      }
    });
  };

  const handleUpdateProcedurePrice = (procId: string, newPrice: number) => {
    setProcedures((prev) =>
      prev.map((p) => (p.id === procId ? { ...p, price: newPrice } : p))
    );
    // Keep odontogram tooth procedureCost in sync
    const target = procedures.find((p) => p.id === procId);
    if (target) {
      const match = target.name.match(/#(\d+)/);
      if (match) {
        const toothNum = parseInt(match[1], 10);
        setOdontogramData((prev) => {
          if (!prev?.teeth?.[toothNum]) return prev;
          return {
            ...prev,
            teeth: {
              ...prev.teeth,
              [toothNum]: {
                ...prev.teeth[toothNum],
                procedureCost: newPrice,
              },
            },
            updatedAt: new Date().toISOString(),
          };
        });
      }
    }
  };

  const handleAddDiagnosis = (dx: { code: string; name: string }) => {
    if (diagnoses.some((d) => d.code === dx.code)) {
      toast.error("Diagnosis sudah ada di daftar");
      return;
    }
    setDiagnoses((prev) => [
      ...prev,
      {
        id: `ED-${Date.now()}`,
        code: dx.code,
        name: dx.name,
        type: prev.length === 0 ? "primary" : "secondary",
      },
    ]);
    setDxSearch("");
  };

  const handleRemoveDiagnosis = (id: string) => {
    setDiagnoses((prev) => prev.filter((d) => d.id !== id));
  };

  const handleRemoveProcedure = (id: string) => {
    const target = procedures.find((p) => p.id === id);
    setProcedures((prev) => prev.filter((p) => p.id !== id));
    if (target) {
      const match = target.name.match(/#(\d+)/);
      if (match) {
        const toothNum = parseInt(match[1], 10);
        setOdontogramData((prev) => {
          if (!prev?.teeth?.[toothNum]) return prev;
          return {
            ...prev,
            teeth: {
              ...prev.teeth,
              [toothNum]: {
                ...prev.teeth[toothNum],
                procedure: "",
                procedureCost: 0,
              },
            },
            updatedAt: new Date().toISOString(),
          };
        });
      }
    }
  };

  const handleAddPrescriptionItem = (medId: string) => {
    const med = medicines.find((m) => m.id === medId);
    if (!med) return;
    const newItem: PrescriptionItem = {
      id: `RXI-${Date.now()}`,
      medicineId: med.id,
      medicineName: `${med.brandName} (${med.genericName})`,
      dosage: "1 tablet",
      route: "Oral",
      frequency: "3x sehari",
      duration: "3 hari",
      quantity: 10,
      instruction: "Sesudah makan",
      unitPrice: med.sellingPrice,
      totalPrice: med.sellingPrice * 10,
    };
    setPrescriptions((prev) => [...prev, newItem]);
  };

  const handleRemovePrescriptionItem = (id: string) => {
    setPrescriptions((prev) => prev.filter((p) => p.id !== id));
  };

  const consultationFee = 0;
  const proceduresTotal = procedures.reduce((sum, p) => sum + p.price * p.quantity, 0);
  const prescriptionsTotal = prescriptions.reduce((sum, p) => sum + p.totalPrice, 0);
  const grandTotal = proceduresTotal + prescriptionsTotal;

  const handleCompleteEncounter = async () => {
    setIsSubmitting(true);
    try {
      const finalPatientId = patient?.id || "PAT-001";
      const finalPatientName = patient?.name || "Pasien Dental";
      const finalPatientMrn = patient?.medicalRecordNumber || "RM-2026-000001";
      const finalPatientGender = patient?.gender || "male";
      const finalPatientBirthDate = patient?.birthDate || "1990-01-01";
      const finalPatientAllergies = patient?.allergies || [];
      const targetEncounterId = activeEncounter?.id || (effectiveEncounterId && effectiveEncounterId.startsWith("ENC-") && effectiveEncounterId !== "ENC-001" ? effectiveEncounterId : `ENC-${Date.now()}`);

      const selectedDoctor = doctors.find((d) => d.id === selectedDoctorId);
      const finalDoctorId = selectedDoctor?.id || selectedDoctorId || "DOC-001";
      const finalDoctorName = selectedDoctor?.name || "drg. Jihan, S.Kep";
      const todayStr = new Date().toISOString().split("T")[0];
      const finalVisitDate = visitDate || todayStr;
      const isBackdate = finalVisitDate < todayStr;

      await EncounterService.saveEncounter({
        id: targetEncounterId,
        facilityId: "FAC-001",
        encounterNumber: activeEncounter?.encounterNumber || `ENC-${finalVisitDate.slice(0, 4)}-${String(Math.floor(Math.random() * 9000) + 1000)}`,
        patientId: finalPatientId,
        patientName: finalPatientName,
        patientMrn: finalPatientMrn,
        patientGender: finalPatientGender,
        patientBirthDate: finalPatientBirthDate,
        patientAllergies: finalPatientAllergies,
        doctorId: finalDoctorId,
        doctorName: finalDoctorName,
        departmentId: "DEP-001",
        departmentName: "Poli Gigi Umum",
        visitDate: finalVisitDate,
        visitType: isBackdate ? "historical_record" : "routine_checkup",
        status: isPaymentPaid || isBackdate ? "completed" : "billing",
        isPaid: isPaymentPaid || isBackdate,
        deductStock: !isBackdate,
        anamnesis: {
          chiefComplaint,
          historyOfPresentIllness: hpi,
          pastMedicalHistory: patient?.bloodType ? `Golongan Darah: ${patient.bloodType}` : "Tidak ada riwayat penyakit sistemik",
          allergyHistory: finalPatientAllergies.length > 0 ? finalPatientAllergies.join(", ") : "Tidak ada riwayat alergi obat",
        },
        vitalSigns: {
          bloodPressureSystolic: bpSys,
          bloodPressureDiastolic: bpDia,
          heartRate: hr,
          respiratoryRate: rr,
          temperature: temp,
          oxygenSaturation: spo2,
          weightKg: weight,
          heightCm: height,
          bmi: bmiCalc.bmi,
          bmiCategory: bmiCalc.category,
          painScale,
          consciousness: "Compos Mentis",
        },
        odontogram: odontogramData,
        diagnoses,
        procedures,
        prescriptions,
        dentalNotes: postOpNotes,
        nextControlDate,
        createdAt: activeEncounter?.createdAt || (isBackdate ? `${finalVisitDate}T09:00:00.000Z` : new Date().toISOString()),
        updatedAt: new Date().toISOString(),
      });

      // Update patient's latest odontogram so future examinations automatically have it
      if (patient?.id) {
        try {
          await PatientService.updatePatient(patient.id, {
            odontogram: odontogramData,
            latestOdontogram: odontogramData,
          } as any);

          if (nextControlDate) {
            await PatientService.updateControlSchedule(patient.id, {
              nextControlDate,
              appointmentTime: "09:00",
              doctorName: finalDoctorName,
              doctorId: finalDoctorId,
              notes: postOpNotes || "Kontrol rutin evaluasi kesehatan gigi",
            });
            if (typeof window !== "undefined") {
              window.dispatchEvent(new CustomEvent("refresh-notifications"));
            }
          }
        } catch { }
      }

      // If came from queue, mark queue item as completed
      if (queryQueueId) {
        try {
          await QueueService.updateStatus(queryQueueId, "completed");
        } catch { }
      }

      if (isBackdate || isPaymentPaid) {
        setIsPaymentPaid(true);
        toast.success(
          `Data pemeriksaan manual tanggal ${finalVisitDate} tersimpan dengan status LUNAS.`
        );
      } else {
        toast.success(
          `Pemeriksaan gigi selesai! Rekam medis ${finalPatientName} tersimpan, stok ${prescriptions.length > 0 ? `${prescriptions.length} obat otomatis berkurang & ` : ""
          }diteruskan ke Kasir / Farmasi.`
        );
        setShowCompletionDialog(true);
      }
    } catch {
      toast.error("Gagal menyimpan pemeriksaan gigi.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoadingPatient) {
    return (
      <div className="flex flex-col min-h-[calc(100vh-8rem)] space-y-6">
        {/* Workspace Top Header Loading */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-4 dark:border-slate-800">
          <div className="space-y-2">
            <div className="flex items-center gap-2.5">
              <div className="h-7 w-7 rounded-lg bg-teal-600/20 flex items-center justify-center text-teal-600">
                <Loader2 className="h-4 w-4 animate-spin" />
              </div>
              <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
                Ruang Pemeriksaan Dokter Gigi & Odontogram
              </h1>
              <span className="rounded-full bg-teal-50 dark:bg-teal-950/60 border border-teal-200 dark:border-teal-800 px-2.5 py-0.5 text-xs font-semibold text-teal-700 dark:text-teal-300">
                {effectiveEncounterId || (rawParamId !== "new" ? rawParamId : "Pemeriksaan Baru")}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-8 w-24 rounded-xl bg-slate-200/70 dark:bg-slate-800 animate-pulse" />
            <div className="h-8 w-36 rounded-xl bg-slate-200/70 dark:bg-slate-800 animate-pulse" />
          </div>
        </div>

        {/* Ambient Loading Banner Card */}
        <div className="relative overflow-hidden rounded-2xl border border-teal-200 bg-gradient-to-r from-teal-500/10 via-emerald-500/5 to-teal-500/10 p-5 shadow-xs dark:border-teal-900/60 dark:bg-slate-900/80 backdrop-blur-md">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-teal-600 text-white shadow-md shadow-teal-600/20">
                <Stethoscope className="h-6 w-6 animate-pulse" />
                <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500"></span>
                </span>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                    Memuat Ruang Pemeriksaan Klinis
                  </h3>
                  <span className="inline-flex items-center gap-1 rounded-full bg-teal-100 dark:bg-teal-950 px-2 py-0.5 text-[11px] font-semibold text-teal-800 dark:text-teal-200">
                    <Loader2 className="h-3 w-3 animate-spin" />
                    Sinkronisasi Data
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Menghubungkan {queryPatientId ? `Pasien ${queryPatientId}` : "Pasien"} dengan Antrean {queryQueueId || "Dental Chair"} • DPJP: drg. Jihan, S.Kep
                </p>
              </div>
            </div>

            {/* Visual Progress Indicator */}
            <div className="w-full sm:w-56 space-y-1.5">
              <div className="flex justify-between text-[11px] font-semibold text-teal-700 dark:text-teal-300">
                <span>Mengunduh rekam gigi...</span>
                <span>Harap tunggu</span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
                <div className="h-full w-3/4 rounded-full bg-gradient-to-r from-teal-500 via-emerald-400 to-teal-600 animate-pulse" />
              </div>
            </div>
          </div>
        </div>

        {/* Skeleton Patient Context Bar */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-4 dark:border-slate-800 dark:bg-slate-900 shadow-xs">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-3">
              <div className="h-11 w-11 rounded-xl bg-slate-200 dark:bg-slate-800 animate-pulse shrink-0" />
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <div className="h-5 w-36 rounded-md bg-slate-200 dark:bg-slate-800 animate-pulse" />
                  <div className="h-4 w-24 rounded-md bg-slate-100 dark:bg-slate-800/60 animate-pulse" />
                  <div className="h-4 w-16 rounded-md bg-slate-100 dark:bg-slate-800/60 animate-pulse" />
                </div>
                <div className="h-3.5 w-60 rounded-md bg-slate-100 dark:bg-slate-800/40 animate-pulse" />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-7 w-28 rounded-lg bg-slate-100 dark:bg-slate-800/60 animate-pulse" />
              <div className="h-7 w-40 rounded-lg bg-slate-100 dark:bg-slate-800/60 animate-pulse" />
            </div>
          </div>
        </div>

        {/* Skeleton Tabs Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-1 p-1.5 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <div className="h-9 rounded-lg bg-white dark:bg-slate-800 shadow-xs flex items-center justify-center gap-2">
            <Sparkles className="h-4 w-4 text-teal-600" />
            <div className="h-3 w-28 rounded bg-teal-100 dark:bg-teal-900/60" />
          </div>
          <div className="h-9 rounded-lg flex items-center justify-center">
            <div className="h-3 w-20 rounded bg-slate-200 dark:bg-slate-800" />
          </div>
          <div className="h-9 rounded-lg flex items-center justify-center">
            <div className="h-3 w-24 rounded bg-slate-200 dark:bg-slate-800" />
          </div>
          <div className="h-9 rounded-lg flex items-center justify-center">
            <div className="h-3 w-20 rounded bg-slate-200 dark:bg-slate-800" />
          </div>
          <div className="h-9 rounded-lg flex items-center justify-center">
            <div className="h-3 w-24 rounded bg-slate-200 dark:bg-slate-800" />
          </div>
        </div>

        {/* Skeleton Odontogram Workspace Canvas */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4 rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
              <div className="space-y-1">
                <div className="h-4 w-48 rounded bg-slate-200 dark:bg-slate-800 animate-pulse" />
                <div className="h-3 w-72 rounded bg-slate-100 dark:bg-slate-800/60 animate-pulse" />
              </div>
              <div className="h-7 w-28 rounded-lg bg-slate-100 dark:bg-slate-800/60 animate-pulse" />
            </div>

            {/* Anatomical Teeth Grid Placeholder */}
            <div className="py-6 space-y-4">
              <div className="flex items-center justify-center gap-2">
                {Array.from({ length: 16 }).map((_, i) => (
                  <div key={i} className="flex flex-col items-center gap-1">
                    <div className="h-3 w-4 rounded bg-slate-200 dark:bg-slate-800 animate-pulse" />
                    <div className="h-9 w-7 rounded-lg border border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-800/50 animate-pulse" />
                  </div>
                ))}
              </div>
              <div className="flex items-center justify-center gap-2">
                {Array.from({ length: 16 }).map((_, i) => (
                  <div key={i} className="flex flex-col items-center gap-1">
                    <div className="h-9 w-7 rounded-lg border border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-800/50 animate-pulse" />
                    <div className="h-3 w-4 rounded bg-slate-200 dark:bg-slate-800 animate-pulse" />
                  </div>
                ))}
              </div>
            </div>

            <div className="h-10 w-full rounded-xl bg-slate-50 dark:bg-slate-800/40 animate-pulse" />
          </div>

          {/* Right Column Skeleton */}
          <div className="space-y-4">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 space-y-3">
              <div className="h-4 w-36 rounded bg-slate-200 dark:bg-slate-800 animate-pulse" />
              <div className="space-y-2">
                <div className="h-12 rounded-xl bg-slate-50 dark:bg-slate-800/40 animate-pulse" />
                <div className="h-12 rounded-xl bg-slate-50 dark:bg-slate-800/40 animate-pulse" />
              </div>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 space-y-3">
              <div className="h-4 w-40 rounded bg-slate-200 dark:bg-slate-800 animate-pulse" />
              <div className="h-24 rounded-xl bg-slate-50 dark:bg-slate-800/40 animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  const patientInitials = (patient?.name || "PD")
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const patientAge = patient?.birthDate
    ? `${new Date().getFullYear() - new Date(patient.birthDate).getFullYear()} Tahun`
    : "30 Tahun";

  const patientGenderText = patient?.gender === "male" ? "Laki-laki" : patient?.gender === "female" ? "Perempuan" : "-";
  const hasPenicillinOrLidoAllergy = (patient?.allergies || []).some(
    (a) => a.toLowerCase().includes("lido") || a.toLowerCase().includes("anest")
  );

  return (
    <div className="flex flex-col min-h-[calc(100vh-8rem)] justify-between space-y-6">
      {/* Dental Sticky Patient Header */}
      <div className="sticky top-16 z-20 rounded-2xl border border-teal-200 bg-white/95 p-4 shadow-sm backdrop-blur-md dark:border-teal-900/60 dark:bg-slate-900/95">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-teal-600 text-white font-bold text-lg shadow-sm">
              {patientInitials}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100">
                  {patient?.name || "Pasien Dental"}
                </h2>
                <Badge variant="subtle" className="text-xs font-mono">
                  {patient?.medicalRecordNumber || "RM-2026-000000"}
                </Badge>
                <Badge variant="outline" className="text-xs font-semibold uppercase text-emerald-700 border-emerald-300">
                  {((patient as any)?.insuranceType || patient?.insurance?.providerName || patient?.insurance?.type || "UMUM").toUpperCase()}
                </Badge>
                {isPaymentPaid && (
                  <Badge className="text-xs font-bold bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950/80 dark:text-emerald-300 gap-1 shadow-xs">
                    <CheckCircle2 className="h-3 w-3 text-emerald-600 dark:text-emerald-400" />
                    <span>Tagihan Lunas</span>
                  </Badge>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsPatientModalOpen(true)}
                  className="h-6 text-[11px] px-2 gap-1 border-teal-300 text-teal-700 hover:bg-teal-50 dark:border-teal-800 dark:text-teal-300"
                  title="Pilih pasien lain dari antrean atau database klinik"
                >
                  <Users className="h-3 w-3" />
                  <span>Ganti Pasien</span>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsHistoryModalOpen(true)}
                  className="h-6 text-[11px] px-2 gap-1 border-teal-300 text-teal-700 bg-teal-50/70 hover:bg-teal-100 dark:border-teal-800 dark:bg-teal-950/40 dark:text-teal-300 font-medium"
                  title="Buka riwayat pemeriksaan, SOAP, odontogram, dan tindakan terdahulu"
                >
                  <History className="h-3 w-3" />
                  <span>Riwayat Pemeriksaan</span>
                </Button>
              </div>
              <div className="flex flex-wrap items-center gap-2.5 text-xs text-slate-500 pt-0.5">
                <span>{patientGenderText} • {patientAge} • Dental Chair Unit 1</span>
                <span className="text-slate-300 dark:text-slate-700 hidden sm:inline">•</span>

                {/* Tanggal Kunjungan / Pemeriksaan */}
                <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-800/80 px-2 py-0.5 rounded-lg border border-slate-200 dark:border-slate-700">
                  <Calendar className="h-3.5 w-3.5 text-teal-600 shrink-0" />
                  <span className="font-semibold text-slate-700 dark:text-slate-300 text-[11px]">Tgl Periksa:</span>
                  <input
                    type="date"
                    value={visitDate}
                    onChange={(e) => setVisitDate(e.target.value)}
                    max={new Date().toISOString().split("T")[0]}
                    className="h-5 text-[11px] px-1 py-0 rounded border-0 bg-transparent font-mono text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-teal-500 cursor-pointer"
                    title="Tanggal pemeriksaan (dapat diatur tanggal lampau / backdate untuk input manual)"
                  />
                  {visitDate < new Date().toISOString().split("T")[0] && (
                    <span className="bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300 text-[10px] px-1.5 py-0 rounded-full font-bold flex items-center gap-1">
                      <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                      Backdate (Lunas)
                    </span>
                  )}
                </div>

                <span className="text-slate-300 dark:text-slate-700 hidden sm:inline">•</span>

                {/* Dokter DPJP */}
                <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-800/80 px-2 py-0.5 rounded-lg border border-slate-200 dark:border-slate-700">
                  <User className="h-3.5 w-3.5 text-teal-600 shrink-0" />
                  <span className="font-semibold text-slate-700 dark:text-slate-300 text-[11px]">DPJP:</span>
                  <select
                    value={selectedDoctorId}
                    onChange={(e) => setSelectedDoctorId(e.target.value)}
                    className="h-5 text-[11px] px-1 py-0 rounded border-0 bg-transparent text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-teal-500 cursor-pointer max-w-[170px] truncate"
                  >
                    {doctors.length > 0 ? (
                      doctors.map((doc) => (
                        <option key={doc.id} value={doc.id}>
                          {doc.name}
                        </option>
                      ))
                    ) : (
                      <option value="DOC-001">drg. Jihan, S.Kep</option>
                    )}
                  </select>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Medical Alerts */}
            {patient?.allergies && patient.allergies.length > 0 ? (
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs font-semibold">
                <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                <span>Alergi: {patient.allergies.join(", ")}</span>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-xs">
                <span>Tidak ada alergi obat tercatat</span>
              </div>
            )}
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-teal-50 dark:bg-teal-950/50 border border-teal-200 dark:border-teal-800 text-teal-800 dark:text-teal-300 text-xs font-medium">
              <Shield className="h-3.5 w-3.5 shrink-0" />
              <span>{hasPenicillinOrLidoAllergy ? "Perhatian: Ada Riwayat Alergi Anestesi" : "Anestesi: Aman (Tanpa Alergi Lidocaine)"}</span>
            </div>
            {/* <Link href="/radiology">
              <Button variant="outline" size="sm" className="h-8 text-xs gap-1.5 border-teal-300 text-teal-700">
                <Scan className="h-3.5 w-3.5" />
                Rontgen Dental
              </Button>
            </Link> */}
          </div>
        </div>
      </div>

      {/* Main Dental Workspace Tabs */}
      <Tabs defaultValue="odontogram" className="space-y-6 flex-1">
        <TabsList className="grid grid-cols-2 sm:grid-cols-5 w-full h-auto p-1.5 gap-1 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <TabsTrigger value="odontogram" className="flex items-center gap-2 py-2">
            <Sparkles className="h-4 w-4 text-teal-600" />
            <span className="font-semibold">Peta Gigi (Odontogram)</span>
          </TabsTrigger>
          <TabsTrigger value="subjective" className="flex items-center gap-2 py-2">
            <FileText className="h-4 w-4" />
            <span>Anamnesis (S)</span>
          </TabsTrigger>
          <TabsTrigger value="objective" className="flex items-center gap-2 py-2">
            <HeartPulse className="h-4 w-4" />
            <span>Pemeriksaan Fisik (O)</span>
          </TabsTrigger>
          <TabsTrigger value="assessment" className="flex items-center gap-2 py-2">
            <Shield className="h-4 w-4" />
            <span>Diagnosis Gigi (A)</span>
          </TabsTrigger>
          <TabsTrigger value="plan" className="flex items-center gap-2 py-2">
            <Pill className="h-4 w-4" />
            <span>Tindakan & Resep (P)</span>
          </TabsTrigger>
        </TabsList>

        {/* ==================================================== */}
        {/* TAB 1: INTERACTIVE ODONTOGRAM */}
        {/* ==================================================== */}
        <TabsContent value="odontogram">
          <div className="space-y-4">
            {/* Historical Odontogram Auto-loaded Banner */}
            {historicalOdontogramInfo && (
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl bg-teal-50/90 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800 text-xs shadow-2xs">
                <div className="flex items-center gap-2.5">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-teal-600 text-white font-bold text-xs shadow-2xs">
                    🦷
                  </span>
                  <div>
                    <p className="font-bold text-teal-900 dark:text-teal-200">
                      Riwayat Odontogram Pasien Otomatis Ditampilkan
                    </p>
                    <p className="text-[11px] text-teal-700 dark:text-teal-400 mt-0.5">
                      Memuat {historicalOdontogramInfo.teethCount} data kondisi gigi dari {historicalOdontogramInfo.encounterNumber ? `${historicalOdontogramInfo.encounterNumber} ` : ""}
                      {historicalOdontogramInfo.visitDate ? `(Pemeriksaan: ${historicalOdontogramInfo.visitDate})` : ""}. Dokter dapat langsung mengevaluasi dan memperbarui peta gigi.
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsHistoryModalOpen(true)}
                    className="h-7 text-xs text-teal-800 dark:text-teal-300 hover:bg-teal-100 dark:hover:bg-teal-900/60"
                  >
                    <History className="h-3.5 w-3.5 mr-1" />
                    <span>Lihat Riwayat EMR</span>
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setOdontogramData({ teeth: {}, occlusion: "normal", updatedAt: new Date().toISOString() });
                      setHistoricalOdontogramInfo(null);
                      toast.info("Odontogram di-reset ke kondisi awal normal / kosong.");
                    }}
                    className="h-7 text-xs border-slate-300 text-slate-600 hover:text-slate-800"
                  >
                    Mulai Baru (Kosong)
                  </Button>
                </div>
              </div>
            )}

            <Odontogram
              value={odontogramData}
              onChange={setOdontogramData}
              onSelectProcedure={handleOdontogramProcedureSelect}
            />

            {/* Procedures Summary Box */}
            <Card className="border-teal-200 dark:border-teal-900/40">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-bold flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-teal-600" />
                    Tindakan Medis Gigi Terpilih dari Odontogram
                  </CardTitle>
                  <span className="text-xs font-mono font-bold text-teal-700 dark:text-teal-400">
                    Subtotal Tindakan: {formatCurrency(proceduresTotal)}
                  </span>
                </div>
              </CardHeader>
              <CardContent>
                {procedures.length === 0 ? (
                  <p className="text-xs text-slate-500 py-2">
                    Belum ada tindakan yang dipilih. Klik nomor gigi pada diagram di atas untuk menetapkan tindakan perawatan.
                  </p>
                ) : (
                  <div className="divide-y divide-slate-100 dark:divide-slate-800">
                    {procedures.map((p) => (
                      <div key={p.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 py-2.5 text-xs">
                        <div>
                          <p className="font-semibold text-slate-800 dark:text-slate-200">{p.name}</p>
                          <p className="text-[11px] text-slate-400 font-mono">Kode: {p.code}</p>
                        </div>
                        <div className="flex items-center gap-2.5">
                          <div className="flex items-center rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-2.5 py-1 shadow-2xs">
                            <span className="text-slate-400 text-xs font-semibold mr-1 select-none">Rp</span>
                            <input
                              type="text"
                              inputMode="numeric"
                              value={p.price ? formatRupiahInput(p.price) : (p.price === 0 ? "0" : "")}
                              onChange={(e) => {
                                const raw = e.target.value;
                                if (raw.trim() === "") {
                                  handleUpdateProcedurePrice(p.id, 0);
                                  return;
                                }
                                const cleanDigits = raw.replace(/\D/g, "");
                                const val = cleanDigits === "" ? 0 : parseInt(cleanDigits, 10);
                                handleUpdateProcedurePrice(p.id, val);
                              }}
                              placeholder="0"
                              className="w-24 text-right text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400 bg-transparent focus:outline-none"
                              title="Tarif biaya tindakan (dapat diubah manual, otomatis format Rupiah)"
                            />
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRemoveProcedure(p.id)}
                            className="text-rose-500 hover:text-rose-700 p-1 rounded-md hover:bg-rose-50 dark:hover:bg-rose-950/40"
                            title="Hapus tindakan"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ==================================================== */}
        {/* TAB 2: ANAMNESIS (S) */}
        {/* ==================================================== */}
        <TabsContent value="subjective">
          <Card>
            <CardHeader>
              <CardTitle>Subjective (S): Anamnesis & Riwayat Pasien Gigi</CardTitle>
              <CardDescription>
                Keluhan utama rongga mulut, riwayat sistemik khusus tindakan gigi, dan skala nyeri.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Keluhan Utama Gigi (Chief Complaint) <span className="text-rose-500">*</span>
                </label>
                <Textarea
                  rows={2}
                  value={chiefComplaint}
                  onChange={(e) => setChiefComplaint(e.target.value)}
                  placeholder="e.g. Gigi geraham kanan bawah ngilu saat minum dingin..."
                />
              </div>

              {/* Quick complaint chips */}
              <div className="space-y-1">
                <p className="text-[11px] text-slate-500">Pilihan Cepat Keluhan Umum:</p>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    "Gigi ngilu minum dingin/manis",
                    "Sakit gigi berdenyut spontan malam hari",
                    "Gigi berlubang sering terselip makanan",
                    "Gusi berdarah saat menyikat gigi",
                    "Bau mulut & karang gigi tebal",
                    "Gigi depan patah / somplak",
                    "Mau pasang behel / kawat gigi",
                    "Gigi geraham bungsu menusuk pipi",
                    "Gigi tiruan patah / longgar",
                  ].map((chip) => (
                    <button
                      type="button"
                      key={chip}
                      onClick={() => setChiefComplaint(chip)}
                      className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-[11px] text-slate-700 dark:text-slate-300 hover:bg-teal-50 hover:text-teal-700 transition-colors"
                    >
                      + {chip}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Riwayat Perjalanan Penyakit Gigi (HPI)
                </label>
                <Textarea
                  rows={2}
                  value={hpi}
                  onChange={(e) => setHpi(e.target.value)}
                  placeholder="Detail rasa ngilu, apakah menetap atau hilang timbul..."
                />
              </div>

              {/* Dental Medical Alert Checkboxes */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
                <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 mb-2">
                  Riwayat Sistemik Kritis Sebelum Tindakan Anestesi & Pencabutan:
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <label className="flex items-center gap-2 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs cursor-pointer hover:bg-slate-50">
                    <input
                      type="checkbox"
                      checked={dentalHistory.hasHypertension}
                      onChange={(e) =>
                        setDentalHistory((prev) => ({ ...prev, hasHypertension: e.target.checked }))
                      }
                      className="rounded border-slate-300 text-teal-600"
                    />
                    <span>Hipertensi (Tekanan Darah Tinggi)</span>
                  </label>

                  <label className="flex items-center gap-2 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs cursor-pointer hover:bg-slate-50">
                    <input
                      type="checkbox"
                      checked={dentalHistory.hasDiabetes}
                      onChange={(e) =>
                        setDentalHistory((prev) => ({ ...prev, hasDiabetes: e.target.checked }))
                      }
                      className="rounded border-slate-300 text-teal-600"
                    />
                    <span>Diabetes / Gula Darah Tinggi</span>
                  </label>

                  <label className="flex items-center gap-2 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs cursor-pointer hover:bg-slate-50">
                    <input
                      type="checkbox"
                      checked={dentalHistory.hasBleedingDisorder}
                      onChange={(e) =>
                        setDentalHistory((prev) => ({ ...prev, hasBleedingDisorder: e.target.checked }))
                      }
                      className="rounded border-slate-300 text-teal-600"
                    />
                    <span>Riwayat Perdarahan Sukar Berhenti</span>
                  </label>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ==================================================== */}
        {/* TAB 3: PEMERIKSAAN FISIK & VITAL (O) */}
        {/* ==================================================== */}
        <TabsContent value="objective">
          <Card>
            <CardHeader>
              <CardTitle>Objective (O): Tanda Vital & Pemeriksaan Rongga Mulut</CardTitle>
              <CardDescription>
                Pemeriksaan fisik umum, tanda vital sebelum anestesi lokal, dan evaluasi intraoral/ekstraoral.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Vital Signs Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Tekanan Darah (Sistolik / Diastolik)
                  </label>
                  <div className="flex items-center gap-1">
                    <Input
                      type="number"
                      value={bpSys}
                      onChange={(e) => setBpSys(parseInt(e.target.value) || 0)}
                      className="h-8 text-xs font-mono"
                    />
                    <span className="text-slate-400">/</span>
                    <Input
                      type="number"
                      value={bpDia}
                      onChange={(e) => setBpDia(parseInt(e.target.value) || 0)}
                      className="h-8 text-xs font-mono"
                    />
                  </div>
                  <p className="text-[10px] text-slate-400">Normal &lt; 130/80 mmHg</p>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Denyut Nadi (HR)
                  </label>
                  <div className="flex items-center gap-1">
                    <Input
                      type="number"
                      value={hr}
                      onChange={(e) => setHr(parseInt(e.target.value) || 0)}
                      className="h-8 text-xs font-mono"
                    />
                    <span className="text-xs text-slate-500">bpm</span>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Suhu Tubuh
                  </label>
                  <div className="flex items-center gap-1">
                    <Input
                      type="number"
                      step="0.1"
                      value={temp}
                      onChange={(e) => setTemp(parseFloat(e.target.value) || 0)}
                      className="h-8 text-xs font-mono"
                    />
                    <span className="text-xs text-slate-500">°C</span>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Indeks Massa Tubuh (BMI)
                  </label>
                  <div className="flex items-center gap-2 pt-1">
                    <span className="text-sm font-bold font-mono text-slate-800 dark:text-slate-200">
                      {bmiCalc.bmi}
                    </span>
                    <Badge variant={bmiCalc.category === "Normal" ? "success" : "warning"} size="sm">
                      {bmiCalc.category}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Extraoral & Intraoral Clinical Notes */}
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-3">
                <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  Pemeriksaan Khusus Ekstraoral & Intraoral:
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-slate-600 dark:text-slate-400">
                      Ekstraoral (Wajah, TMJ, Kelenjar Getah Bening)
                    </label>
                    <Textarea
                      rows={2}
                      defaultValue="Wajah simetris, tidak ada pembengkakan ekstraoral. Sendi rahang (TMJ) normal tanpa suara clicking atau deviasi membuka mulut."
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-slate-600 dark:text-slate-400">
                      Intraoral (Mukosa, Lidah, Palatum, Kebersihan Mulut)
                    </label>
                    <Textarea
                      rows={2}
                      defaultValue="Kebersihan mulut (OHI-S) kategori sedang. Kalkulus supragingival ditemukan pada permukaan lingual gigi anterior rahang bawah. Mukosa bukal dan palatum dalam batas normal."
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ==================================================== */}
        {/* TAB 4: DIAGNOSIS GIGI (A) */}
        {/* ==================================================== */}
        <TabsContent value="assessment">
          <Card>
            <CardHeader>
              <CardTitle>Assessment (A): Diagnosis ICD-10 Kedokteran Gigi</CardTitle>
              <CardDescription>
                Pencatatan diagnosis penyakit gigi dan mulut sesuai standar ICD-10 Kemenkes.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Search Diagnosis */}
              <div className="relative">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <Input
                  value={dxSearch}
                  onChange={(e) => setDxSearch(e.target.value)}
                  placeholder="Cari kode atau nama diagnosis gigi (e.g. Karies, K02, Pulpitis, Impaksi, Gigi)..."
                  className="pl-9 pr-8"
                />
                {dxSearch && (
                  <button
                    type="button"
                    onClick={() => setDxSearch("")}
                    className="absolute right-2.5 top-2.5 p-0.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full"
                    title="Hapus pencarian"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>

              {/* ICD-10 Diagnosis List: Appears directly with 10 initial items, loads +10 on scroll */}
              <div
                onScroll={handleDxScroll}
                className="max-h-64 overflow-y-auto rounded-xl border border-slate-200 bg-white p-2 dark:border-slate-800 dark:bg-slate-900 shadow-xs space-y-1"
              >
                <div className="px-2 py-1.5 text-[11px] font-semibold text-slate-500 dark:text-slate-400 flex justify-between items-center border-b border-slate-100 dark:border-slate-800 mb-1 sticky top-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xs z-10">
                  <span className="font-bold text-slate-700 dark:text-slate-200">
                    {dxSearch
                      ? `Hasil Pencarian (${filteredDiagnoses.length} ditemukan)`
                      : `Daftar Master ICD-10 Gigi (${filteredDiagnoses.length} total)`}
                  </span>
                  <span className="text-[10px] text-teal-600 dark:text-teal-400 font-medium">
                    Menampilkan {Math.min(visibleDxCount, filteredDiagnoses.length)} dari {filteredDiagnoses.length} item • Scroll untuk +10
                  </span>
                </div>

                {filteredDiagnoses.length === 0 ? (
                  <div className="p-6 text-center text-xs text-slate-400">
                    Tidak ada diagnosis yang sesuai &quot;{dxSearch}&quot;
                  </div>
                ) : (
                  <>
                    {filteredDiagnoses.slice(0, visibleDxCount).map((d) => (
                      <button
                        type="button"
                        key={d.id}
                        onClick={() => handleAddDiagnosis(d)}
                        className="w-full text-left p-2.5 rounded-lg hover:bg-teal-50 dark:hover:bg-teal-950/40 flex items-center justify-between text-xs transition-colors group cursor-pointer border border-transparent hover:border-teal-200/50"
                      >
                        <div className="flex-1 mr-2">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="font-mono font-bold text-teal-700 dark:text-teal-400 bg-teal-50 dark:bg-teal-950/60 px-1.5 py-0.5 rounded border border-teal-200 dark:border-teal-900 text-[11px]">
                              {d.code}
                            </span>
                            <span className="text-slate-800 dark:text-slate-200 font-semibold group-hover:text-teal-700 dark:group-hover:text-teal-300">
                              {d.name}
                            </span>
                            {d.category && (
                              <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 font-normal">
                                {d.category}
                              </span>
                            )}
                          </div>
                          {d.description && d.description !== d.name && (
                            <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">{d.description}</p>
                          )}
                        </div>
                        <span className="shrink-0 flex items-center gap-1 text-[11px] font-semibold text-teal-600 dark:text-teal-400 opacity-70 group-hover:opacity-100 bg-teal-50 dark:bg-teal-950 px-2 py-1 rounded-md">
                          <span>+ Pilih</span>
                          <Plus className="h-3.5 w-3.5" />
                        </span>
                      </button>
                    ))}

                    {visibleDxCount < filteredDiagnoses.length ? (
                      <div className="pt-2 pb-1 text-center">
                        <button
                          type="button"
                          onClick={() => setVisibleDxCount((prev) => Math.min(prev + 10, filteredDiagnoses.length))}
                          className="text-xs text-teal-600 hover:text-teal-700 dark:text-teal-400 font-medium py-1.5 px-3 rounded-lg hover:bg-teal-50 dark:hover:bg-teal-950/50 transition-colors border border-dashed border-teal-200 dark:border-teal-900"
                        >
                          + Tampilkan 10 diagnosis berikutnya ({filteredDiagnoses.length - visibleDxCount} tersisa)
                        </button>
                      </div>
                    ) : (
                      <div className="py-2 text-center text-[10px] text-slate-400">
                        ✓ Seluruh {filteredDiagnoses.length} diagnosis telah dimuat
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* Active Diagnoses List */}
              <div className="space-y-2 pt-2">
                <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Diagnosis Aktif Pasien ({diagnoses.length}):
                </h4>
                <div className="divide-y divide-slate-100 dark:divide-slate-800 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900">
                  {diagnoses.map((d) => (
                    <div key={d.id} className="p-3 flex items-center justify-between text-xs">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-teal-700 dark:text-teal-400">
                            {d.code}
                          </span>
                          <span className="font-semibold text-slate-800 dark:text-slate-200">
                            {d.name}
                          </span>
                          <Badge variant={d.type === "primary" ? "default" : "neutral"} size="sm">
                            {d.type === "primary" ? "Utama" : "Sekunder"}
                          </Badge>
                        </div>
                        {d.notes && <p className="text-[11px] text-slate-500">{d.notes}</p>}
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveDiagnosis(d.id)}
                        className="text-rose-500 hover:text-rose-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ==================================================== */}
        {/* TAB 5: TINDAKAN, RESEP OBAT & KONTROL (P) */}
        {/* ==================================================== */}
        <TabsContent value="plan">
          <div className="space-y-6">
            {/* Prescriptions */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-3">
                <div>
                  <CardTitle>R/ Peresepan Elektronik Obat Gigi</CardTitle>
                  <CardDescription>
                    Resep antibiotik, analgetik pereda nyeri, dan obat kumur antiseptik.
                  </CardDescription>
                </div>
                <div>
                  <Button
                    type="button"
                    onClick={() => setIsMedicineModalOpen(true)}
                    className="h-9 gap-2 text-xs bg-teal-600 hover:bg-teal-700 text-white shadow-xs cursor-pointer font-medium"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Pilih Obat & Resep (Popup Cari)</span>
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="divide-y divide-slate-100 dark:divide-slate-800 rounded-xl border border-slate-200 dark:border-slate-800">
                  {prescriptions.map((rx) => (
                    <div key={rx.id} className="p-3 flex items-center justify-between text-xs">
                      <div className="space-y-1">
                        <p className="font-bold text-slate-800 dark:text-slate-200">{rx.medicineName}</p>
                        <div className="flex items-center gap-2 text-slate-500">
                          <span>{rx.dosage}</span>
                          <span>•</span>
                          <span>{rx.frequency}</span>
                          <span>•</span>
                          <span className="italic font-medium text-teal-700 dark:text-teal-400">
                            {rx.instruction}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                          {formatCurrency(rx.totalPrice)}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleRemovePrescriptionItem(rx.id)}
                          className="text-rose-500 hover:text-rose-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Post-Op & Next Control */}
            <Card>
              <CardHeader>
                <CardTitle>Instruksi Pasca-Tindakan & Jadwal Kontrol Dental</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Instruksi Khusus untuk Pasien (Tercetak di Resep & Kuitansi)
                  </label>
                  <Textarea
                    rows={2}
                    value={postOpNotes}
                    onChange={(e) => setPostOpNotes(e.target.value)}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Rencana Tanggal Kontrol / Kunjungan Berikutnya
                  </label>
                  <Input
                    type="date"
                    value={nextControlDate}
                    onChange={(e) => setNextControlDate(e.target.value)}
                    className="w-56"
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Sticky Bottom Action Bar (Docked to bottom, constrained to main content area to never overlap sidebar) */}
      <div className="sticky bottom-0 z-30 -mx-4 -mb-4 sm:-mx-6 sm:-mb-6 lg:-mx-8 lg:-mb-8 border-t border-slate-200/90 bg-white/95 px-4 sm:px-6 lg:px-8 py-3.5 shadow-[0_-4px_20px_rgba(0,0,0,0.06)] backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/95">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-xs">
            <div>
              <p className="text-slate-500">Tindakan Odontogram ({procedures.length})</p>
              <p className="font-mono font-bold text-slate-800 dark:text-slate-200">
                {formatCurrency(proceduresTotal)}
              </p>
            </div>
            <div className="h-6 w-px bg-slate-200 dark:bg-slate-800" />
            <div>
              <p className="text-slate-500">Obat Farmasi ({prescriptions.length})</p>
              <p className="font-mono font-bold text-slate-800 dark:text-slate-200">
                {formatCurrency(prescriptionsTotal)}
              </p>
            </div>
            <div className="h-6 w-px bg-slate-200 dark:bg-slate-800" />
            <div className="rounded-lg bg-emerald-50 px-2.5 py-1 border border-emerald-200/60 dark:bg-emerald-950/40 dark:border-emerald-800/40">
              <p className="text-[10px] text-emerald-700 dark:text-emerald-300 font-semibold uppercase tracking-wider">Total Tagihan Sementara</p>
              <p className="font-mono font-bold text-sm sm:text-base text-emerald-700 dark:text-emerald-400">
                {formatCurrency(grandTotal)}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0 w-full sm:w-auto justify-end">
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push("/outpatient")}
            >
              Kembali
            </Button>
            {isPaymentPaid ? (
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 dark:bg-emerald-950/60 dark:border-emerald-800 dark:text-emerald-300 text-xs font-bold shadow-xs">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                  <span>Pemeriksaan Selesai & Tagihan Lunas</span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCompleteEncounter}
                  isLoading={isSubmitting}
                  className="gap-1.5 text-xs border-teal-300 text-teal-700 hover:bg-teal-50 cursor-pointer"
                  title="Simpan pembaruan rekam medis ini"
                >
                  <Save className="h-3.5 w-3.5" />
                  <span>Simpan Perubahan</span>
                </Button>
              </div>
            ) : (
              <Button
                variant="primary"
                size="md"
                onClick={handleCompleteEncounter}
                isLoading={isSubmitting}
                className="gap-2 shadow-sm font-semibold cursor-pointer"
              >
                {visitDate < new Date().toISOString().split("T")[0] || searchParams?.get("backdate") === "true" ? (
                  <>
                    <CheckCircle2 className="h-4 w-4" />
                    <span>Simpan Pemeriksaan (Langsung Lunas)</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="h-4 w-4" />
                    <span>Selesai & Teruskan ke Kasir / Farmasi</span>
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Post-Examination Completion Dialog */}
      <Dialog
        open={showCompletionDialog}
        onOpenChange={setShowCompletionDialog}
        title="Pemeriksaan Gigi Selesai & Tersimpan!"
        description="Hasil anamnesis, odontogram, tindakan klinis, dan resep telah dicatat ke rekam medis pasien."
      >
        <div className="space-y-4 pt-2 text-xs">
          <div className="rounded-xl border border-teal-200 bg-teal-50/50 p-4 dark:border-teal-900/60 dark:bg-teal-950/20">
            <div className="flex items-center gap-3 mb-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-600 text-white font-bold">
                <CheckCircle2 className="h-5 w-5" />
              </div>
              <div>
                <p className="font-bold text-sm text-slate-800 dark:text-slate-100">{patient?.name || "Pasien Dental"}</p>
                <p className="text-slate-500 font-mono text-[11px]">{patient?.medicalRecordNumber || "RM-2026-000001"} • Poli Gigi Umum</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-teal-200/60 dark:border-teal-900/40">
              <div>
                <span className="text-slate-500 text-[10px]">Tindakan Gigi:</span>
                <p className="font-semibold text-slate-800 dark:text-slate-200">{procedures.length} tindakan ({formatCurrency(proceduresTotal)})</p>
              </div>
              <div>
                <span className="text-slate-500 text-[10px]">Resep Obat & Bahan:</span>
                <p className="font-semibold text-slate-800 dark:text-slate-200">{prescriptions.length} item ({formatCurrency(prescriptionsTotal)})</p>
              </div>
            </div>
          </div>

          <p className="font-semibold text-slate-700 dark:text-slate-300">Pilih langkah alur pelayanan berikutnya:</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {prescriptions.length > 0 && (
              <Button
                variant="outline"
                className="justify-start gap-2 h-auto py-3 px-3 text-left border-purple-200 bg-purple-50/40 hover:bg-purple-50 hover:border-purple-300 dark:border-purple-900/60 dark:bg-purple-950/20"
                onClick={() => router.push("/pharmacy")}
              >
                <Pill className="h-5 w-5 text-purple-600 shrink-0" />
                <div>
                  <p className="font-bold text-purple-950 dark:text-purple-300 text-xs">4. Farmasi & Alat Medis</p>
                  <p className="text-[11px] text-slate-500">Keluarkan obat resep & kurangi stok</p>
                </div>
              </Button>
            )}

            <Button
              variant="outline"
              className="justify-start gap-2 h-auto py-3 px-3 text-left border-teal-200 bg-teal-50/40 hover:bg-teal-50 hover:border-teal-300 dark:border-teal-900/60 dark:bg-teal-950/20"
              onClick={() => router.push("/billing")}
            >
              <DollarSign className="h-5 w-5 text-teal-600 shrink-0" />
              <div>
                <p className="font-bold text-teal-950 dark:text-teal-300 text-xs">5. Kasir & Pembayaran</p>
                <p className="text-[11px] text-slate-500">Proses pembayaran tagihan pasien</p>
              </div>
            </Button>
          </div>

          <div className="pt-2 flex justify-between items-center border-t border-slate-100 dark:border-slate-800">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push("/queue")}
              className="text-slate-500 hover:text-slate-800"
            >
              Kembali ke Antrean
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => router.push("/billing")}
              className="bg-teal-600 hover:bg-teal-700 text-white font-semibold gap-1.5"
            >
              <span>Lanjut Kasir</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </Dialog>

      {/* Patient Selector Modal */}
      <Dialog
        open={isPatientModalOpen}
        onOpenChange={setIsPatientModalOpen}
        title="Pilih Pasien Pemeriksaan Dental"
        description="Pilih pasien dari antrean kursi gigi live atau cari seluruh database pasien."
      >
        <div className="space-y-4 pt-2 text-xs">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Cari nama pasien, No. RM, atau NIK..."
              value={patientSearchTerm}
              onChange={(e) => setPatientSearchTerm(e.target.value)}
              className="pl-9 h-9 text-xs"
            />
          </div>

          {/* Section 1: Active Queue */}
          {availableQueues.filter((q) => q.status === "in_progress" || q.status === "called" || q.status === "waiting").length > 0 && !patientSearchTerm && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-teal-800 dark:text-teal-300 flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5 text-teal-600" />
                  Antrean Dental Chair Hari Ini
                </span>
                <Badge variant="subtle" size="sm">
                  {availableQueues.filter((q) => q.status === "in_progress" || q.status === "called" || q.status === "waiting").length} Pasien
                </Badge>
              </div>
              <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                {availableQueues
                  .filter((q) => q.status === "in_progress" || q.status === "called" || q.status === "waiting")
                  .map((q) => {
                    const pId = q.patientId || q.patient_id;
                    const matchingPatient = availablePatients.find((p) => p.id === pId);
                    const isCurrent = patient?.id === pId;
                    return (
                      <div
                        key={q.id}
                        className={`flex items-center justify-between p-2.5 rounded-xl border transition-all ${isCurrent
                            ? "border-teal-500 bg-teal-50/70 dark:bg-teal-950/40"
                            : "border-slate-200 hover:border-teal-300 hover:bg-slate-50 dark:border-slate-800"
                          }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <Badge variant="default" className="font-mono text-[10px] px-1.5 py-0.5 bg-teal-600 text-white">
                            {q.queueNumber || "DEN"}
                          </Badge>
                          <div>
                            <p className="font-semibold text-slate-900 dark:text-slate-100">
                              {q.patientName || "Pasien"}
                            </p>
                            <p className="text-[11px] text-slate-500">
                              {q.patientMrn || ""} • {q.departmentName || "Poli Gigi Umum"}
                            </p>
                          </div>
                        </div>
                        <Button
                          size="sm"
                          disabled={isCurrent}
                          className="h-7 text-xs"
                          onClick={() => {
                            if (matchingPatient) {
                              handleSelectPatient(matchingPatient, q);
                            } else {
                              handleSelectPatient(
                                {
                                  id: pId || "PAT-001",
                                  name: q.patientName || "Pasien",
                                  medicalRecordNumber: q.patientMrn || "RM-000000",
                                } as any,
                                q
                              );
                            }
                          }}
                        >
                          {isCurrent ? "Pasien Ini" : "Periksa Pasien Ini"}
                        </Button>
                      </div>
                    );
                  })}
              </div>
            </div>
          )}

          {/* Section 2: All Registered Patients */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Users className="h-3.5 w-3.5 text-slate-500" />
                Semua Pasien Terdaftar
              </span>
              <span className="text-[11px] text-slate-400">
                {availablePatients.filter(
                  (p) =>
                    p.name.toLowerCase().includes(patientSearchTerm.toLowerCase()) ||
                    p.medicalRecordNumber.toLowerCase().includes(patientSearchTerm.toLowerCase()) ||
                    (p.nik && p.nik.includes(patientSearchTerm))
                ).length} Pasien
              </span>
            </div>
            <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
              {availablePatients
                .filter(
                  (p) =>
                    p.name.toLowerCase().includes(patientSearchTerm.toLowerCase()) ||
                    p.medicalRecordNumber.toLowerCase().includes(patientSearchTerm.toLowerCase()) ||
                    (p.nik && p.nik.includes(patientSearchTerm))
                )
                .map((p) => {
                  const isCurrent = patient?.id === p.id;
                  return (
                    <div
                      key={p.id}
                      className={`flex items-center justify-between p-2.5 rounded-xl border transition-all ${isCurrent
                          ? "border-teal-500 bg-teal-50/70 dark:bg-teal-950/40"
                          : "border-slate-200 hover:border-teal-300 hover:bg-slate-50 dark:border-slate-800"
                        }`}
                    >
                      <div>
                        <div className="flex items-center gap-1.5">
                          <p className="font-semibold text-slate-900 dark:text-slate-100">{p.name}</p>
                          <Badge variant="subtle" className="text-[10px] font-mono">
                            {p.medicalRecordNumber}
                          </Badge>
                        </div>
                        <p className="text-[11px] text-slate-500">
                          {p.gender === "male" ? "Laki-laki" : "Perempuan"} • NIK: {p.nik || "-"}
                        </p>
                      </div>
                      <Button
                        size="sm"
                        variant={isCurrent ? "subtle" : "outline"}
                        disabled={isCurrent}
                        className="h-7 text-xs"
                        onClick={() => handleSelectPatient(p)}
                      >
                        {isCurrent ? "Pasien Aktif" : "Pilih Pasien"}
                      </Button>
                    </div>
                  );
                })}
              {availablePatients.filter(
                (p) =>
                  p.name.toLowerCase().includes(patientSearchTerm.toLowerCase()) ||
                  p.medicalRecordNumber.toLowerCase().includes(patientSearchTerm.toLowerCase()) ||
                  (p.nik && p.nik.includes(patientSearchTerm))
              ).length === 0 && (
                  <p className="text-center py-6 text-slate-400 text-xs">
                    Tidak ada pasien ditemukan dengan kata kunci &quot;{patientSearchTerm}&quot;
                  </p>
                )}
            </div>
          </div>
        </div>
      </Dialog>

      {/* Popup Modal: Prescription & Medicine Search with Signa */}
      <MedicinePrescriptionModal
        open={isMedicineModalOpen}
        onOpenChange={setIsMedicineModalOpen}
        medicines={medicines}
        onAddPrescription={(newItem) => setPrescriptions((prev) => [...prev, newItem])}
      />

      {/* Popup Modal: Patient Examination History (SOAP & Odontogram) */}
      <PatientExaminationHistoryModal
        open={isHistoryModalOpen}
        onOpenChange={setIsHistoryModalOpen}
        patientId={patient?.id}
        patientName={patient?.name}
        patientMrn={patient?.medicalRecordNumber}
      />
    </div>
  );
}
