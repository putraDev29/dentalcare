<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Patient;
use App\Models\Doctor;
use App\Models\Appointment;
use App\Models\Medicine;
use App\Models\Encounter;
use App\Models\Invoice;
use App\Models\DentalDiagnosis;
use App\Models\DentalProcedure;
use App\Models\DentalInsurance;
use Illuminate\Support\Str;

class ClinicalController extends Controller
{
    // ==========================================
    // 1. MASTER DIAGNOSIS GIGI (ICD-10 DENTAL)
    // ==========================================
    public function diagnoses(Request $request)
    {
        if (DentalDiagnosis::count() === 0) {
            $this->autoSeedDiagnoses();
        }

        $query = DentalDiagnosis::query();

        if ($request->filled('category')) {
            $query->where('category', $request->input('category'));
        }

        if ($request->filled('search')) {
            $s = $request->input('search');
            $query->where(function ($q) use ($s) {
                $q->where('name', 'like', "%{$s}%")
                  ->orWhere('code', 'like', "%{$s}%")
                  ->orWhere('category', 'like', "%{$s}%");
            });
        }

        return response()->json($query->orderBy('code')->get());
    }

    private function autoSeedDiagnoses(): void
    {
        $filePath = database_path('data/diagnoses.json');
        if (!file_exists($filePath)) {
            $filePath = base_path('../fe_dentalcare/src/data/diagnoses.json');
        }
        if (file_exists($filePath)) {
            $items = json_decode(file_get_contents($filePath), true) ?: [];
            foreach ($items as $d) {
                $existing = DentalDiagnosis::where('code', $d['code'])->first();
                if ($existing) {
                    $existing->update([
                        'name' => $d['name'],
                        'category' => $d['category'] ?? 'Umum',
                        'description' => $d['description'] ?? $d['name'],
                        'is_active' => true,
                    ]);
                } else {
                    $id = $d['id'];
                    if (DentalDiagnosis::where('id', $id)->exists()) {
                        $id = 'DIA-' . strtoupper(Str::random(5));
                    }
                    DentalDiagnosis::create([
                        'id' => $id,
                        'code' => $d['code'],
                        'name' => $d['name'],
                        'category' => $d['category'] ?? 'Umum',
                        'description' => $d['description'] ?? $d['name'],
                        'is_active' => true,
                    ]);
                }
            }
        }
    }

    public function storeDiagnosis(Request $request)
    {
        $validated = $request->validate([
            'code' => 'required|string|max:50',
            'name' => 'required|string|max:255',
            'category' => 'nullable|string|max:100',
            'description' => 'nullable|string',
            'isActive' => 'nullable|boolean',
        ]);

        $id = 'DX-' . strtoupper(Str::random(5));
        $diagnosis = DentalDiagnosis::create([
            'id' => $id,
            'code' => $validated['code'],
            'name' => $validated['name'],
            'category' => $validated['category'] ?? 'Umum',
            'description' => $validated['description'] ?? null,
            'is_active' => $validated['isActive'] ?? true,
        ]);

        return response()->json($diagnosis, 201);
    }

    public function updateDiagnosis(Request $request, $id)
    {
        $diagnosis = DentalDiagnosis::findOrFail($id);

        $validated = $request->validate([
            'code' => 'sometimes|required|string|max:50',
            'name' => 'sometimes|required|string|max:255',
            'category' => 'nullable|string|max:100',
            'description' => 'nullable|string',
            'isActive' => 'nullable|boolean',
        ]);

        $data = [];
        if (isset($validated['code'])) $data['code'] = $validated['code'];
        if (isset($validated['name'])) $data['name'] = $validated['name'];
        if (array_key_exists('category', $validated)) $data['category'] = $validated['category'];
        if (array_key_exists('description', $validated)) $data['description'] = $validated['description'];
        if (array_key_exists('isActive', $validated)) $data['is_active'] = $validated['isActive'];

        $diagnosis->update($data);

        return response()->json($diagnosis);
    }

    public function destroyDiagnosis($id)
    {
        $diagnosis = DentalDiagnosis::findOrFail($id);
        $diagnosis->delete();

        return response()->json(['message' => 'Diagnosis berhasil dihapus', 'id' => $id]);
    }

    // ==========================================
    // 2. MASTER TINDAKAN DENTAL & TARIF
    // ==========================================
    public function procedures(Request $request)
    {
        if (DentalProcedure::count() === 0) {
            $this->autoSeedProcedures();
        }

        $query = DentalProcedure::query();

        if ($request->filled('category')) {
            $query->where('category', $request->input('category'));
        }

        if ($request->filled('search')) {
            $s = $request->input('search');
            $query->where(function ($q) use ($s) {
                $q->where('name', 'like', "%{$s}%")
                  ->orWhere('code', 'like', "%{$s}%")
                  ->orWhere('category', 'like', "%{$s}%");
            });
        }

        return response()->json($query->orderBy('id')->get());
    }

    private function autoSeedProcedures(): void
    {
        $filePath = database_path('data/procedures.json');
        if (!file_exists($filePath)) {
            $filePath = base_path('../fe_dentalcare/src/data/procedures.json');
        }
        if (file_exists($filePath)) {
            $items = json_decode(file_get_contents($filePath), true) ?: [];
            foreach ($items as $p) {
                $existing = DentalProcedure::where('code', $p['code'])->first();
                if ($existing) {
                    $existing->update([
                        'name' => $p['name'],
                        'category' => $p['category'] ?? 'Umum',
                        'cost' => $p['price'] ?? 0,
                        'description' => $p['name'],
                        'is_active' => true,
                    ]);
                } else {
                    $id = $p['id'];
                    if (DentalProcedure::where('id', $id)->exists()) {
                        $id = 'PROC-' . strtoupper(Str::random(5));
                    }
                    DentalProcedure::create([
                        'id' => $id,
                        'code' => $p['code'],
                        'name' => $p['name'],
                        'category' => $p['category'] ?? 'Umum',
                        'cost' => $p['price'] ?? 0,
                        'description' => $p['name'],
                        'is_active' => true,
                    ]);
                }
            }
        }
    }

    public function storeProcedure(Request $request)
    {
        $validated = $request->validate([
            'code' => 'required|string|max:50',
            'name' => 'required|string|max:255',
            'category' => 'nullable|string|max:100',
            'cost' => 'sometimes|numeric|min:0',
            'price' => 'sometimes|numeric|min:0',
            'description' => 'nullable|string',
            'isActive' => 'nullable|boolean',
            'is_active' => 'nullable|boolean',
        ]);

        $cost = $request->input('cost', $request->input('price', 0));
        $isActive = $request->input('isActive', $request->input('is_active', true));

        $id = $request->input('id');
        if (empty($id) || DentalProcedure::where('id', $id)->exists()) {
            $id = 'PROC-' . strtoupper(Str::random(5));
        }

        $procedure = DentalProcedure::create([
            'id' => $id,
            'code' => $validated['code'],
            'name' => $validated['name'],
            'category' => $validated['category'] ?? 'Umum',
            'cost' => $cost,
            'description' => $validated['description'] ?? null,
            'is_active' => $isActive,
        ]);

        return response()->json($procedure, 201);
    }

    public function updateProcedure(Request $request, $id)
    {
        $procedure = DentalProcedure::findOrFail($id);

        $validated = $request->validate([
            'code' => 'sometimes|required|string|max:50',
            'name' => 'sometimes|required|string|max:255',
            'category' => 'nullable|string|max:100',
            'cost' => 'nullable|numeric|min:0',
            'price' => 'nullable|numeric|min:0',
            'description' => 'nullable|string',
            'isActive' => 'nullable|boolean',
            'is_active' => 'nullable|boolean',
        ]);

        $data = [];
        if (isset($validated['code'])) $data['code'] = $validated['code'];
        if (isset($validated['name'])) $data['name'] = $validated['name'];
        if (array_key_exists('category', $validated)) $data['category'] = $validated['category'];
        if ($request->has('cost')) {
            $data['cost'] = $request->input('cost');
        } elseif ($request->has('price')) {
            $data['cost'] = $request->input('price');
        }
        if (array_key_exists('description', $validated)) $data['description'] = $validated['description'];
        if ($request->has('isActive')) {
            $data['is_active'] = $request->boolean('isActive');
        } elseif ($request->has('is_active')) {
            $data['is_active'] = $request->boolean('is_active');
        }

        $procedure->update($data);

        return response()->json($procedure);
    }

    public function destroyProcedure($id)
    {
        $procedure = DentalProcedure::findOrFail($id);
        $procedure->delete();

        return response()->json(['message' => 'Tindakan berhasil dihapus', 'id' => $id]);
    }

    // ==========================================
    // 3. MASTER ASURANSI & PENJAMIN DENTAL
    // ==========================================
    public function insurance(Request $request)
    {
        $query = DentalInsurance::query();

        if ($request->filled('category')) {
            $query->where('category', $request->input('category'));
        }

        if ($request->filled('search')) {
            $s = $request->input('search');
            $query->where(function ($q) use ($s) {
                $q->where('name', 'like', "%{$s}%")
                  ->orWhere('code', 'like', "%{$s}%");
            });
        }

        return response()->json($query->orderBy('id')->get());
    }

    public function storeInsurance(Request $request)
    {
        $validated = $request->validate([
            'code' => 'required|string|max:50',
            'name' => 'required|string|max:255',
            'category' => 'nullable|string|max:100',
            'contactPerson' => 'nullable|string|max:255',
            'phone' => 'nullable|string|max:50',
            'email' => 'nullable|string|email|max:100',
            'isActive' => 'nullable|boolean',
        ]);

        $id = 'INS-' . strtoupper(Str::random(5));
        $insurance = DentalInsurance::create([
            'id' => $id,
            'code' => $validated['code'],
            'name' => $validated['name'],
            'category' => $validated['category'] ?? 'Asuransi Swasta',
            'contact_person' => $validated['contactPerson'] ?? null,
            'phone' => $validated['phone'] ?? null,
            'email' => $validated['email'] ?? null,
            'claim_count' => 0,
            'is_active' => $validated['isActive'] ?? true,
        ]);

        return response()->json($insurance, 201);
    }

    public function updateInsurance(Request $request, $id)
    {
        $insurance = DentalInsurance::findOrFail($id);

        $validated = $request->validate([
            'code' => 'sometimes|required|string|max:50',
            'name' => 'sometimes|required|string|max:255',
            'category' => 'nullable|string|max:100',
            'contactPerson' => 'nullable|string|max:255',
            'phone' => 'nullable|string|max:50',
            'email' => 'nullable|string|email|max:100',
            'isActive' => 'nullable|boolean',
        ]);

        $data = [];
        if (isset($validated['code'])) $data['code'] = $validated['code'];
        if (isset($validated['name'])) $data['name'] = $validated['name'];
        if (array_key_exists('category', $validated)) $data['category'] = $validated['category'];
        if (array_key_exists('contactPerson', $validated)) $data['contact_person'] = $validated['contactPerson'];
        if (array_key_exists('phone', $validated)) $data['phone'] = $validated['phone'];
        if (array_key_exists('email', $validated)) $data['email'] = $validated['email'];
        if (array_key_exists('isActive', $validated)) $data['is_active'] = $validated['isActive'];

        $insurance->update($data);

        return response()->json($insurance);
    }

    public function destroyInsurance($id)
    {
        $insurance = DentalInsurance::findOrFail($id);
        $insurance->delete();

        return response()->json(['message' => 'Penjamin berhasil dihapus', 'id' => $id]);
    }

    public function staff()
    {
        $users = \App\Models\User::all();
        $staff = $users->map(function ($u) {
            return [
                'id' => $u->id,
                'facilityId' => $u->facility_id ?? 'FAC-001',
                'employeeId' => $u->employee_number ?? $u->id,
                'name' => $u->name,
                'role' => $u->role_name ?? ucfirst(str_replace('_', ' ', $u->role ?? 'Staff Medis')),
                'department' => $u->department_id ?? 'Poli Gigi & Mulut',
                'phone' => $u->phone ?? '0812-9988-7766',
                'email' => $u->email,
                'joinDate' => $u->created_at ? $u->created_at->format('Y-m-d') : date('Y-m-d'),
                'status' => $u->is_active ? 'active' : 'inactive',
                'avatarUrl' => $u->avatar_url,
            ];
        });

        return response()->json($staff);
    }

    public function inventoryItems()
    {
        return response()->json([
            [
                'id' => 'INV-DNT-001',
                'sku' => 'MAT-RES-01',
                'name' => 'Resin Komposit Filtek Z250 Universal Shade A2',
                'category' => 'Dental Restorative Material',
                'currentStock' => 14,
                'minStock' => 5,
                'unit' => 'Syringe 4g',
                'location' => 'Lemari Material A-1',
                'unitCost' => 380000,
                'sellingPrice' => 0
            ],
            [
                'id' => 'INV-DNT-002',
                'sku' => 'MAT-BND-01',
                'name' => 'Single Bond Universal Adhesive 5ml 3M',
                'category' => 'Adhesive Dental',
                'currentStock' => 6,
                'minStock' => 3,
                'unit' => 'Botol 5ml',
                'location' => 'Lemari Material A-2',
                'unitCost' => 520000,
                'sellingPrice' => 0
            ],
            [
                'id' => 'INV-DNT-003',
                'sku' => 'MAT-ETC-01',
                'name' => 'Gel Asam Fosfat 37% (Dental Etchant Gel)',
                'category' => 'Etching Material',
                'currentStock' => 18,
                'minStock' => 5,
                'unit' => 'Syringe 3ml',
                'location' => 'Lemari Material A-3',
                'unitCost' => 65000,
                'sellingPrice' => 0
            ],
            [
                'id' => 'INV-DNT-004',
                'sku' => 'MAT-ANES-01',
                'name' => 'Pehacain Ampul 2ml (Lidocaine + Epinephrine)',
                'category' => 'Anestesi Dental',
                'currentStock' => 85,
                'minStock' => 20,
                'unit' => 'Ampul 2ml',
                'location' => 'Kulkas Obat Suhu 2-8°C',
                'unitCost' => 12500,
                'sellingPrice' => 25000
            ],
            [
                'id' => 'INV-DNT-005',
                'sku' => 'MAT-ALG-01',
                'name' => 'Bahan Cetak Alginat Kromatis (Alginate Impression 454g)',
                'category' => 'Prosthodontic Impression',
                'currentStock' => 12,
                'minStock' => 4,
                'unit' => 'Bungkus 454g',
                'location' => 'Rak Cetak B-2',
                'unitCost' => 110000,
                'sellingPrice' => 0
            ],
            [
                'id' => 'INV-DNT-006',
                'sku' => 'MAT-SLV-01',
                'name' => 'Saliva Ejector Disposable Suction Tip',
                'category' => 'Disposable Supplies',
                'currentStock' => 340,
                'minStock' => 100,
                'unit' => 'Pcs',
                'location' => 'Gudang Sterilisasi C-1',
                'unitCost' => 800,
                'sellingPrice' => 0
            ]
        ]);
    }

    public function notifications()
    {
        $readPath = storage_path('app/read_notifications.json');
        $readIds = [];
        if (file_exists($readPath)) {
            $readIds = json_decode(file_get_contents($readPath), true) ?? [];
        }

        $tomorrow = now()->addDay()->toDateString();
        $notifications = [];

        // 1. Ambil data pasien yang kontrol H-1 dari Appointments
        $h1Appointments = Appointment::where(function ($q) use ($tomorrow) {
                $q->whereDate('appointment_date', $tomorrow)
                  ->orWhere('visit_type', 'control')
                  ->orWhere('complaint', 'like', '%kontrol%');
            })
            ->orderBy('appointment_time')
            ->get();

        foreach ($h1Appointments as $apt) {
            $notifId = 'NOTIF-H1-' . $apt->id;
            $complaintText = !empty($apt->complaint) ? $apt->complaint : 'Kontrol rutin kesehatan gigi';
            $notifications[] = [
                'id' => $notifId,
                'facilityId' => $apt->facility_id ?? 'FAC-001',
                'title' => "Jadwal Kontrol Gigi Besok (H-1): {$apt->patient_name}",
                'message' => "Pasien {$apt->patient_name} ({$apt->patient_mrn}) dijadwalkan {$complaintText} besok pukul {$apt->appointment_time} bersama {$apt->doctor_name}. Harap konfirmasi kehadiran pasien.",
                'category' => 'appointment',
                'timestamp' => $apt->updated_at ? $apt->updated_at->toISOString() : now()->toISOString(),
                'isRead' => in_array($notifId, $readIds),
                'severity' => 'warning',
                'actionUrl' => $apt->patient_id ? ('/patients/' . $apt->patient_id) : '/appointments',
            ];
        }

        // 2. Ambil data pasien dari Encounters yang memiliki follow_up_plan kontrol H-1
        $h1Encounters = Encounter::whereNotNull('follow_up_plan')->get();
        foreach ($h1Encounters as $enc) {
            $plan = is_array($enc->follow_up_plan) ? $enc->follow_up_plan : json_decode($enc->follow_up_plan, true);
            if (!$plan) continue;

            $nextDate = $plan['nextControlDate'] ?? null;
            if ($nextDate === $tomorrow) {
                // Avoid duplicate if this patient already has a notification
                $patientAlreadyNotified = collect($notifications)->contains(function ($item) use ($enc) {
                    return str_contains($item['title'], $enc->patient_name);
                });
                if (!$patientAlreadyNotified) {
                    $notifId = 'NOTIF-H1-ENC-' . $enc->id;
                    $notes = $plan['dentalNotes'] ?? 'Pemeriksaan tindak lanjut kontrol gigi';
                    $notifications[] = [
                        'id' => $notifId,
                        'facilityId' => 'FAC-001',
                        'title' => "Jadwal Kontrol Gigi Besok (H-1): {$enc->patient_name}",
                        'message' => "Pasien {$enc->patient_name} ({$enc->patient_mrn}) dijadwalkan kontrol pasca tindakan gigi besok. Catatan klinis: {$notes}.",
                        'category' => 'appointment',
                        'timestamp' => $enc->updated_at ? $enc->updated_at->toISOString() : now()->toISOString(),
                        'isRead' => in_array($notifId, $readIds),
                        'severity' => 'warning',
                        'actionUrl' => $enc->patient_id ? ('/patients/' . $enc->patient_id) : ('/encounters/' . $enc->id),
                    ];
                }
            }
        }

        // 3. Notifikasi sistem klinik pendukung
        $otherNotifs = [
            [
                'id' => 'NOTIF-RAD-001',
                'facilityId' => 'FAC-001',
                'title' => 'Hasil Foto Panoramik Gigi Tersedia',
                'message' => 'Hasil foto Rontgen Panoramik digital gigi pasien Ahmad Fauzi (RM-2026-000004) telah selesai diunggah dan siap diverifikasi oleh dokter gigi.',
                'category' => 'radiology',
                'timestamp' => now()->subHours(2)->toISOString(),
                'isRead' => in_array('NOTIF-RAD-001', $readIds),
                'severity' => 'info',
                'actionUrl' => '/radiology',
            ],
            [
                'id' => 'NOTIF-INV-002',
                'facilityId' => 'FAC-001',
                'title' => 'Stok Bahan Dental Menipis',
                'message' => 'Stok Composite Resin Solare A2 tersisa 3 syringe (batas minimum: 5 syringe). Harap segera ajukan restock bahan tambal gigi.',
                'category' => 'inventory',
                'timestamp' => now()->subHours(4)->toISOString(),
                'isRead' => in_array('NOTIF-INV-002', $readIds),
                'severity' => 'warning',
                'actionUrl' => '/inventory',
            ],
            [
                'id' => 'NOTIF-BIL-003',
                'facilityId' => 'FAC-001',
                'title' => 'Pembayaran Kasir Gigi Diterima',
                'message' => 'Invoice INV-2026-0001 pasien Siti Rahmawati sebesar Rp 350.000 (Scaling Gigi Rahang Atas & Bawah) telah lunas via QRIS.',
                'category' => 'billing',
                'timestamp' => now()->subHours(6)->toISOString(),
                'isRead' => in_array('NOTIF-BIL-003', $readIds),
                'severity' => 'success',
                'actionUrl' => '/billing',
            ],
        ];

        foreach ($otherNotifs as $on) {
            $notifications[] = $on;
        }

        return response()->json($notifications);
    }

    public function markNotificationRead($id)
    {
        $readPath = storage_path('app/read_notifications.json');
        $readIds = [];
        if (file_exists($readPath)) {
            $readIds = json_decode(file_get_contents($readPath), true) ?? [];
        }

        if (!in_array($id, $readIds)) {
            $readIds[] = $id;
            if (!file_exists(dirname($readPath))) {
                mkdir(dirname($readPath), 0755, true);
            }
            file_put_contents($readPath, json_encode(array_values($readIds), JSON_PRETTY_PRINT));
        }

        return response()->json(['success' => true, 'id' => $id]);
    }

    public function markAllNotificationsRead(Request $request)
    {
        $readPath = storage_path('app/read_notifications.json');
        $readIds = [];
        if (file_exists($readPath)) {
            $readIds = json_decode(file_get_contents($readPath), true) ?? [];
        }

        $allNotifs = $this->notifications()->getData(true);
        $ids = collect($allNotifs)->pluck('id')->toArray();
        $readIds = array_unique(array_merge($readIds, $ids));

        if (!file_exists(dirname($readPath))) {
            mkdir(dirname($readPath), 0755, true);
        }
        file_put_contents($readPath, json_encode(array_values($readIds), JSON_PRETTY_PRINT));

        return response()->json(['success' => true]);
    }

    public function auditLogs()
    {
        return response()->json([
            [
                'id' => 'AUD-001',
                'timestamp' => now()->subMinutes(15)->toISOString(),
                'userName' => 'drg. Pratama Wijaya',
                'role' => 'Dokter Gigi Utama',
                'action' => 'UPDATE',
                'module' => 'Odontogram Rekam Medis',
                'recordId' => 'PAT-001 / Gigi #46',
                'details' => 'Memperbarui status gigi 46 menjadi Pulpitis Akut dengan tindakan Restorasi Komposit',
                'ipAddress' => '192.168.1.10',
                'device' => 'Dental Unit PC 1 - Windows 11'
            ],
            [
                'id' => 'AUD-002',
                'timestamp' => now()->subHours(2)->toISOString(),
                'userName' => 'Siti Nurhaliza',
                'role' => 'Petugas Resepsionis & Farmasi',
                'action' => 'CREATE',
                'module' => 'Farmasi - Barang Masuk',
                'recordId' => 'MUT-2026-0012',
                'details' => 'Mencatat stok masuk Pehacain Ampul 50 pcs dari Kimia Farma Trading & Distribution',
                'ipAddress' => '192.168.1.15',
                'device' => 'Front Desk Terminal'
            ],
            [
                'id' => 'AUD-003',
                'timestamp' => now()->subHours(4)->toISOString(),
                'userName' => 'Dewi Anggraini',
                'role' => 'Kasir & Keuangan',
                'action' => 'CREATE',
                'module' => 'Billing & Kasir',
                'recordId' => 'INV-2026-0001',
                'details' => 'Penerbitan faktur tagihan dan penerimaan pembayaran tunai pasien Budi Santoso',
                'ipAddress' => '192.168.1.16',
                'device' => 'Kasir POS Terminal'
            ]
        ]);
    }
}