<?php

namespace App\Http\Controllers;

use App\Models\Prescription;
use App\Models\Medicine;
use App\Models\MedicineMutation;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class PrescriptionController extends Controller
{
    public function index(Request $request)
    {
        $query = Prescription::query();

        if ($request->filled('status')) {
            $query->where('status', $request->input('status'));
        }

        if ($request->filled('patientId')) {
            $query->where('patient_id', $request->input('patientId'));
        }

        return response()->json($query->orderByDesc('created_at')->get());
    }

    public function show($id)
    {
        $prescription = Prescription::findOrFail($id);
        return response()->json($prescription);
    }

    public function store(Request $request)
    {
        $count = Prescription::count() + 1;
        $id = 'PRX-' . str_pad((string)$count, 3, '0', STR_PAD_LEFT);
        $prescriptionNumber = 'RX-' . date('Y') . '-' . str_pad((string)$count, 4, '0', STR_PAD_LEFT);

        $prescription = Prescription::create([
            'id' => $id,
            'prescription_number' => $prescriptionNumber,
            'facility_id' => 'FAC-001',
            'encounter_id' => $request->input('encounterId'),
            'patient_id' => $request->input('patientId'),
            'patient_name' => $request->input('patientName'),
            'patient_mrn' => $request->input('patientMrn'),
            'doctor_id' => $request->input('doctorId', 'DOC-001'),
            'doctor_name' => $request->input('doctorName', 'drg. Pratama Wijaya'),
            'items' => $request->input('items', []),
            'total_amount' => $request->input('totalAmount', 0),
            'payment_status' => $request->input('paymentStatus', 'unpaid'),
            'status' => 'submitted',
            'notes' => $request->input('notes'),
        ]);

        return response()->json($prescription, 201);
    }

    public function updateStatus(Request $request, $id)
    {
        $prescription = Prescription::findOrFail($id);
        $status = $request->input('status');
        $dispensedBy = $request->input('dispensedBy', 'Petugas Farmasi');

        $update = ['status' => $status];

        // If prescription is dispensed, subtract medicine stock and create mutations
        if ($status === 'dispensed' && $prescription->status !== 'dispensed') {
            $update['dispensed_at'] = now();
            $update['dispensed_by'] = $dispensedBy;

            $items = $prescription->items ?: [];
            foreach ($items as $item) {
                if (!empty($item['medicineId'])) {
                    $med = Medicine::find($item['medicineId']);
                    if ($med) {
                        $qty = (int) ($item['quantity'] ?? 1);
                        $stockBefore = $med->current_stock;
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
                            'reference_no' => $prescription->prescription_number,
                            'notes' => 'Pengeluaran resep pasien: ' . $prescription->patient_name,
                            'operator_name' => $dispensedBy,
                        ]);
                    }
                }
            }
        }

        $prescription->update($update);

        return response()->json($prescription);
    }
}
