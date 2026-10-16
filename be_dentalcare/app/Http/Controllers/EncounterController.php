<?php

namespace App\Http\Controllers;

use App\Models\Encounter;
use App\Models\Patient;
use App\Models\Doctor;
use App\Models\Medicine;
use App\Models\MedicineMutation;
use App\Models\Prescription;
use App\Models\Invoice;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class EncounterController extends Controller
{
    public function index(Request $request)
    {
        $query = Encounter::query();

        if ($request->filled('patientId')) {
            $query->where('patient_id', $request->input('patientId'));
        }

        if ($request->filled('status')) {
            $query->where('status', $request->input('status'));
        }

        return response()->json($query->orderByDesc('visit_date')->orderByDesc('created_at')->get());
    }

    public function show($id)
    {
        $encounter = Encounter::find($id);
        if (!$encounter) {
            return response()->json([
                'success' => false,
                'message' => 'Encounter belum dibuat atau masih berupa antrean/draf baru.',
                'data' => null,
            ], 200);
        }
        return response()->json($encounter);
    }

    public function store(Request $request)
    {
        $patientId = $request->input('patientId') ?: $request->input('patient_id');
        $patient = $patientId ? Patient::find($patientId) : null;
        $doctorId = $request->input('doctorId', 'DOC-001');
        $doctor = Doctor::find($doctorId) ?: Doctor::first();

        $id = $request->input('id');
        if (!$id) {
            $count = Encounter::count() + 1;
            $id = 'ENC-' . str_pad((string)$count, 3, '0', STR_PAD_LEFT);
        }
        $encounterNumber = $request->input('encounterNumber') ?: ('ENC-' . date('Y') . '-' . str_pad((string)(Encounter::count() + 1), 4, '0', STR_PAD_LEFT));

        $visitDate = $request->input('visitDate') ?: $request->input('visit_date', date('Y-m-d'));
        $createdAt = $request->input('createdAt') ?: $request->input('created_at') ?: ($visitDate . ' ' . date('H:i:s'));
        $doctorName = $request->input('doctorName') ?: ($doctor ? $doctor->name : 'drg. Jihan Pratama');
        $status = $request->input('status', 'billing');
        $isPaid = $request->boolean('isPaid') || $status === 'completed';
        $deductStock = $request->input('deductStock') !== false;

        $encounter = Encounter::create([
            'id' => $id,
            'facility_id' => $request->input('facilityId', 'FAC-001'),
            'encounter_number' => $encounterNumber,
            'patient_id' => $patient ? $patient->id : ($patientId ?: 'PAT-001'),
            'patient_name' => $patient ? $patient->name : $request->input('patientName', 'Pasien Dental'),
            'patient_mrn' => $patient ? $patient->medical_record_number : $request->input('patientMrn', 'RM-2026-000001'),
            'patient_gender' => $patient ? $patient->gender : $request->input('patientGender', 'male'),
            'patient_birth_date' => $patient ? $patient->birth_date : $request->input('patientBirthDate', '1990-01-01'),
            'patient_blood_type' => $patient ? $patient->blood_type : $request->input('patientBloodType'),
            'patient_allergies' => $patient ? $patient->allergies : $request->input('patientAllergies', []),
            'doctor_id' => $doctor ? $doctor->id : $doctorId,
            'doctor_name' => $doctorName,
            'department_id' => $doctor ? $doctor->department_id : 'DEP-001',
            'department_name' => $doctor ? $doctor->department_name : 'Poli Gigi Umum',
            'appointment_id' => $request->input('appointmentId'),
            'visit_date' => $visitDate,
            'visit_type' => $request->input('visitType', 'routine_checkup'),
            'status' => $status,
            'anamnesis' => $request->input('anamnesis'),
            'vital_signs' => $request->input('vitalSigns'),
            'physical_exam' => $request->input('physicalExam'),
            'odontogram' => $request->input('odontogram'),
            'diagnoses' => $request->input('diagnoses', []),
            'procedures' => $request->input('procedures', []),
            'follow_up_plan' => $request->input('followUpPlan') ?: [
                'prescriptions' => $request->input('prescriptions', []),
                'dentalNotes' => $request->input('dentalNotes'),
                'nextControlDate' => $request->input('nextControlDate'),
            ],
            'created_at' => $createdAt,
            'updated_at' => $createdAt,
        ]);

        // Process Prescriptions and deduct medicine stock
        $prescriptions = $request->input('prescriptions', []);
        if (!empty($prescriptions)) {
            $this->processPrescriptions($encounter, $prescriptions, $deductStock, $isPaid);
        } else {
            $this->syncInvoiceForEncounter($encounter, $isPaid);
        }

        // Sync queue item to completed if any
        if ($encounter->patient_id) {
            \App\Models\QueueItem::where('patient_id', $encounter->patient_id)
                ->whereIn('status', ['waiting', 'called', 'in_progress'])
                ->update([
                    'encounter_id' => $encounter->id,
                    'status' => 'completed',
                ]);
        }

        return response()->json($encounter, 201);
    }

    public function update(Request $request, $id)
    {
        $encounter = Encounter::find($id);

        $visitDate = $request->input('visitDate') ?: $request->input('visit_date');
        $deductStock = $request->input('deductStock') !== false;
        $status = $request->input('status');
        $isPaid = $request->boolean('isPaid') || $status === 'completed';

        if (!$encounter) {
            // Upsert / Create if not found
            $patientId = $request->input('patientId') ?: $request->input('patient_id');
            $patient = $patientId ? Patient::find($patientId) : null;
            $doctorId = $request->input('doctorId', 'DOC-001');
            $doctor = Doctor::find($doctorId) ?: Doctor::first();

            $count = Encounter::count() + 1;
            $encounterNumber = $request->input('encounterNumber') ?: ('ENC-' . date('Y') . '-' . str_pad((string)$count, 4, '0', STR_PAD_LEFT));
            $visitDateVal = $visitDate ?: date('Y-m-d');
            $createdAt = $request->input('createdAt') ?: $request->input('created_at') ?: ($visitDateVal . ' ' . date('H:i:s'));
            $doctorName = $request->input('doctorName') ?: ($doctor ? $doctor->name : 'drg. Jihan Pratama');

            $encounter = Encounter::create([
                'id' => $id,
                'facility_id' => $request->input('facilityId', 'FAC-001'),
                'encounter_number' => $encounterNumber,
                'patient_id' => $patient ? $patient->id : ($patientId ?: 'PAT-001'),
                'patient_name' => $patient ? $patient->name : $request->input('patientName', 'Pasien Dental'),
                'patient_mrn' => $patient ? $patient->medical_record_number : $request->input('patientMrn', 'RM-2026-000001'),
                'patient_gender' => $patient ? $patient->gender : $request->input('patientGender', 'male'),
                'patient_birth_date' => $patient ? $patient->birth_date : $request->input('patientBirthDate', '1990-01-01'),
                'patient_blood_type' => $patient ? $patient->blood_type : $request->input('patientBloodType'),
                'patient_allergies' => $patient ? $patient->allergies : $request->input('patientAllergies', []),
                'doctor_id' => $doctor ? $doctor->id : $doctorId,
                'doctor_name' => $doctorName,
                'department_id' => $doctor ? $doctor->department_id : 'DEP-001',
                'department_name' => $doctor ? $doctor->department_name : 'Poli Gigi Umum',
                'appointment_id' => $request->input('appointmentId'),
                'visit_date' => $visitDateVal,
                'visit_type' => $request->input('visitType', 'routine_checkup'),
                'status' => $status ?: 'billing',
                'anamnesis' => $request->input('anamnesis'),
                'vital_signs' => $request->input('vitalSigns'),
                'physical_exam' => $request->input('physicalExam'),
                'odontogram' => $request->input('odontogram'),
                'diagnoses' => $request->input('diagnoses', []),
                'procedures' => $request->input('procedures', []),
                'follow_up_plan' => $request->input('followUpPlan') ?: [
                    'prescriptions' => $request->input('prescriptions', []),
                    'dentalNotes' => $request->input('dentalNotes'),
                    'nextControlDate' => $request->input('nextControlDate'),
                ],
                'created_at' => $createdAt,
                'updated_at' => $createdAt,
            ]);

            // Process Prescriptions and deduct medicine stock
            $prescriptions = $request->input('prescriptions', []);
            if (!empty($prescriptions)) {
                $this->processPrescriptions($encounter, $prescriptions, $deductStock, $isPaid);
            } else {
                $this->syncInvoiceForEncounter($encounter, $isPaid);
            }

            // Sync queue item to completed
            if ($encounter->patient_id) {
                \App\Models\QueueItem::where('patient_id', $encounter->patient_id)
                    ->whereIn('status', ['waiting', 'called', 'in_progress'])
                    ->update([
                        'encounter_id' => $encounter->id,
                        'status' => 'completed',
                    ]);
            }

            return response()->json($encounter, 201);
        }

        $data = [];
        if ($request->has('status')) $data['status'] = $request->input('status');
        if ($visitDate) $data['visit_date'] = $visitDate;
        if ($request->has('doctorId')) {
            $data['doctor_id'] = $request->input('doctorId');
            $doc = Doctor::find($request->input('doctorId'));
            if ($doc) {
                $data['doctor_name'] = $doc->name;
            }
        }
        if ($request->has('doctorName')) {
            $data['doctor_name'] = $request->input('doctorName');
        }
        if ($request->has('patientId') && $encounter->patient_id !== $request->input('patientId')) {
            $patient = Patient::find($request->input('patientId'));
            if ($patient) {
                $data['patient_id'] = $patient->id;
                $data['patient_name'] = $patient->name;
                $data['patient_mrn'] = $patient->medical_record_number;
            }
        }
        if ($request->has('anamnesis')) $data['anamnesis'] = $request->input('anamnesis');
        if ($request->has('vitalSigns')) $data['vital_signs'] = $request->input('vitalSigns');
        if ($request->has('physicalExam')) $data['physical_exam'] = $request->input('physicalExam');
        if ($request->has('odontogram')) $data['odontogram'] = $request->input('odontogram');
        if ($request->has('diagnoses')) $data['diagnoses'] = $request->input('diagnoses');
        if ($request->has('procedures')) $data['procedures'] = $request->input('procedures');
        if ($request->has('followUpPlan')) $data['follow_up_plan'] = $request->input('followUpPlan');

        if ($request->has('prescriptions') || $request->has('dentalNotes') || $request->has('nextControlDate')) {
            $existingPlan = is_array($encounter->follow_up_plan) ? $encounter->follow_up_plan : [];
            if ($request->has('prescriptions')) $existingPlan['prescriptions'] = $request->input('prescriptions');
            if ($request->has('dentalNotes')) $existingPlan['dentalNotes'] = $request->input('dentalNotes');
            if ($request->has('nextControlDate')) $existingPlan['nextControlDate'] = $request->input('nextControlDate');
            $data['follow_up_plan'] = $existingPlan;
        }

        $encounter->update($data);

        // Process Prescriptions and deduct medicine stock
        $prescriptions = $request->input('prescriptions', []);
        if (!empty($prescriptions)) {
            $this->processPrescriptions($encounter, $prescriptions, $deductStock, $isPaid);
        } else {
            $this->syncInvoiceForEncounter($encounter, $isPaid);
        }

        // Sync queue item to completed
        if ($encounter->patient_id) {
            \App\Models\QueueItem::where('patient_id', $encounter->patient_id)
                ->whereIn('status', ['waiting', 'called', 'in_progress'])
                ->update([
                    'encounter_id' => $encounter->id,
                    'status' => 'completed',
                ]);
        }

        return response()->json($encounter);
    }

    /**
     * Process e-prescriptions, automatically deduct medicine stock, and create mutation & prescription records
     */
    private function processPrescriptions(Encounter $encounter, array $prescriptions, bool $deductStock = true, bool $isPaid = false): void
    {
        $items = [];
        $totalAmount = 0;

        foreach ($prescriptions as $rx) {
            $medId = $rx['medicineId'] ?? null;
            $qty = (int) ($rx['quantity'] ?? 1);
            $unitPrice = (float) ($rx['unitPrice'] ?? 0);
            $totalPrice = (float) ($rx['totalPrice'] ?? ($unitPrice * $qty));
            $totalAmount += $totalPrice;

            $items[] = [
                'id' => $rx['id'] ?? ('RXI-' . strtoupper(Str::random(6))),
                'medicineId' => $medId,
                'medicineName' => $rx['medicineName'] ?? 'Obat Dental',
                'dosage' => $rx['dosage'] ?? '1 tablet',
                'route' => $rx['route'] ?? 'Oral',
                'frequency' => $rx['frequency'] ?? '3x sehari',
                'duration' => $rx['duration'] ?? '3 hari',
                'quantity' => $qty,
                'instruction' => $rx['instruction'] ?? 'Sesudah makan',
                'unitPrice' => $unitPrice,
                'totalPrice' => $totalPrice,
            ];

            // Deduct stock if medicine is found, deductStock is enabled, and not already mutated for this encounter
            if ($medId && $deductStock) {
                $med = Medicine::find($medId);
                if (!$med) {
                    $med = Medicine::where('code', $medId)->orWhere('brand_name', $rx['medicineName'] ?? '')->first();
                }

                if ($med) {
                    // Check if stock mutation for this encounter already happened to avoid double deduction
                    $alreadyMutated = MedicineMutation::where('reference_no', $encounter->encounter_number)
                        ->where('medicine_id', $med->id)
                        ->exists();

                    if (!$alreadyMutated) {
                        $stockBefore = (int) $med->current_stock;
                        $stockAfter = max(0, $stockBefore - $qty);

                        $med->update([
                            'current_stock' => $stockAfter,
                            'stock_status' => $stockAfter > $med->minimum_stock ? 'in_stock' : ($stockAfter > 0 ? 'low_stock' : 'out_of_stock'),
                        ]);

                        MedicineMutation::create([
                            'id' => 'MUT-' . strtoupper(Str::random(6)),
                            'medicine_id' => $med->id,
                            'medicine_name' => $med->brand_name,
                            'type' => 'out',
                            'quantity' => $qty,
                            'stock_before' => $stockBefore,
                            'stock_after' => $stockAfter,
                            'unit_price' => $med->selling_price,
                            'total_price' => $qty * $med->selling_price,
                            'reason' => 'prescription',
                            'reference_no' => $encounter->encounter_number,
                            'notes' => 'Pengurangan stok e-resep dokter untuk pasien: ' . $encounter->patient_name,
                            'operator_name' => $encounter->doctor_name ?: 'drg. Pratama Wijaya',
                        ]);
                    }
                }
            }
        }

        // Create or update Prescription record in pharmacy queue
        $existingPrx = Prescription::where('encounter_id', $encounter->id)->first();
        $prxStatus = $isPaid ? 'dispensed' : 'ready';
        $paymentStatus = $isPaid ? 'paid' : 'unpaid';

        if ($existingPrx) {
            $existingPrx->update([
                'items' => $items,
                'total_amount' => $totalAmount,
                'status' => $existingPrx->status === 'dispensed' ? 'dispensed' : $prxStatus,
                'payment_status' => $existingPrx->payment_status === 'paid' ? 'paid' : $paymentStatus,
                'notes' => $encounter->follow_up_plan['dentalNotes'] ?? 'Resep dari pemeriksaan dental',
            ]);
        } else {
            $count = Prescription::count() + 1;
            $prxId = 'PRX-' . str_pad((string)$count, 3, '0', STR_PAD_LEFT);
            $rxNumber = 'RX-' . date('Y') . '-' . str_pad((string)$count, 4, '0', STR_PAD_LEFT);

            Prescription::create([
                'id' => $prxId,
                'prescription_number' => $rxNumber,
                'facility_id' => $encounter->facility_id ?: 'FAC-001',
                'encounter_id' => $encounter->id,
                'patient_id' => $encounter->patient_id,
                'patient_name' => $encounter->patient_name,
                'patient_mrn' => $encounter->patient_mrn,
                'doctor_id' => $encounter->doctor_id,
                'doctor_name' => $encounter->doctor_name,
                'items' => $items,
                'total_amount' => $totalAmount,
                'payment_status' => $paymentStatus,
                'status' => $prxStatus,
                'notes' => $encounter->follow_up_plan['dentalNotes'] ?? 'Resep dari pemeriksaan dental',
            ]);
        }

        // Otomatis sinkronisasi tagihan kasir
        $this->syncInvoiceForEncounter($encounter, $isPaid);
    }

    /**
     * Otomatis membuat atau memperbarui Invoice tagihan kasir dari tindakan & resep pemeriksaan dental
     */
    public function syncInvoiceForEncounter(Encounter $encounter, bool $isPaid = false): void
    {
        $existingInvoice = Invoice::where('encounter_id', $encounter->id)->first();
        if ($existingInvoice && $existingInvoice->status === 'paid' && !$isPaid) {
            return; // Jangan ubah invoice yang sudah lunas dibayar
        }

        $items = [];
        $subtotal = 0;

        // 1. Tindakan Medis Dental (Procedures)
        $procedures = is_array($encounter->procedures) ? $encounter->procedures : [];
        if (!empty($encounter->odontogram['teeth']) && is_array($encounter->odontogram['teeth'])) {
            foreach ($encounter->odontogram['teeth'] as $toothNum => $tRecord) {
                if (!empty($tRecord['procedure']) || (!empty($tRecord['procedureCost']) && $tRecord['procedureCost'] > 0)) {
                    $already = false;
                    foreach ($procedures as $p) {
                        if (str_contains($p['name'] ?? '', "#{$toothNum}")) {
                            $already = true;
                            break;
                        }
                    }
                    if (!$already) {
                        $procedures[] = [
                            'name' => $tRecord['procedure'] ?? "Tindakan Gigi #{$toothNum}",
                            'toothNumber' => $toothNum,
                            'cost' => (float) ($tRecord['procedureCost'] ?? 0),
                            'price' => (float) ($tRecord['procedureCost'] ?? 0),
                        ];
                    }
                }
            }
        }
        foreach ($procedures as $proc) {
            $cost = (float) ($proc['cost'] ?? ($proc['price'] ?? ($proc['unitPrice'] ?? 350000)));
            $items[] = [
                'id' => $proc['id'] ?? ('ITM-PROC-' . strtoupper(Str::random(4))),
                'category' => 'procedure',
                'description' => "Tindakan: " . ($proc['name'] ?? 'Perawatan Gigi') . (!empty($proc['toothNumber']) ? " (Gigi #{$proc['toothNumber']})" : ""),
                'quantity' => 1,
                'unitPrice' => $cost,
                'totalPrice' => $cost,
            ];
            $subtotal += $cost;
        }

        // 3. Obat & Resep Dental
        $prescriptions = [];
        if (!empty($encounter->follow_up_plan['prescriptions']) && is_array($encounter->follow_up_plan['prescriptions'])) {
            $prescriptions = $encounter->follow_up_plan['prescriptions'];
        }
        foreach ($prescriptions as $rx) {
            $qty = (int) ($rx['quantity'] ?? 1);
            $uPrice = (float) ($rx['unitPrice'] ?? 0);
            $tPrice = (float) ($rx['totalPrice'] ?? ($qty * $uPrice));
            if ($tPrice <= 0 && $uPrice <= 0) {
                $tPrice = $qty * 3500;
                $uPrice = 3500;
            }
            $items[] = [
                'id' => $rx['id'] ?? ('ITM-RX-' . strtoupper(Str::random(4))),
                'category' => 'medicine',
                'description' => "Obat: " . ($rx['medicineName'] ?? 'Obat Gigi') . " ({$qty} unit)",
                'quantity' => $qty,
                'unitPrice' => $uPrice,
                'totalPrice' => $tPrice,
            ];
            $subtotal += $tPrice;
        }

        $totalAmount = $subtotal;
        $covered = 0;
        $paid = ($isPaid || $encounter->status === 'completed') ? $totalAmount : ($existingInvoice ? (float)$existingInvoice->patient_paid_amount : 0);
        $outstanding = max(0, $totalAmount - $covered - $paid);
        $status = $outstanding <= 0 ? 'paid' : ($paid > 0 ? 'partially_paid' : 'pending');

        if ($existingInvoice) {
            $existingInvoice->update([
                'items' => $items,
                'subtotal' => $subtotal,
                'total_amount' => $totalAmount,
                'covered_by_insurance' => $covered,
                'patient_paid_amount' => $paid,
                'outstanding_amount' => $outstanding,
                'status' => $status,
            ]);
        } else {
            $count = Invoice::count() + 1;
            $invoiceNumber = 'INV-' . date('Ym') . '-' . str_pad((string)$count, 4, '0', STR_PAD_LEFT);
            Invoice::create([
                'id' => 'INV-' . strtoupper(Str::random(6)),
                'facility_id' => $encounter->facility_id ?: 'FAC-001',
                'invoice_number' => $invoiceNumber,
                'encounter_id' => $encounter->id,
                'patient_id' => $encounter->patient_id,
                'patient_name' => $encounter->patient_name,
                'patient_mrn' => $encounter->patient_mrn,
                'patient_phone' => $encounter->patient_phone ?? null,
                'insurance_type' => 'umum',
                'items' => $items,
                'subtotal' => $subtotal,
                'discount' => 0,
                'tax' => 0,
                'total_amount' => $totalAmount,
                'covered_by_insurance' => $covered,
                'patient_paid_amount' => $paid,
                'outstanding_amount' => $outstanding,
                'status' => $status,
                'payments' => $status === 'paid' ? [[
                    'method' => 'cash',
                    'amount' => $paid,
                    'paidAt' => $encounter->visit_date . ' 12:00:00',
                    'reference' => 'MANUAL-MIGRATION',
                ]] : [],
            ]);
        }
    }
}

