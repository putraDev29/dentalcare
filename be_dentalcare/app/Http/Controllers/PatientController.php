<?php

namespace App\Http\Controllers;

use App\Models\Patient;
use App\Models\Encounter;
use App\Models\Appointment;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class PatientController extends Controller
{
    public function index(Request $request)
    {
        $tControllerStart = microtime(true);
        $bootTime = round(($tControllerStart - LARAVEL_START) * 1000, 2);

        $query = Patient::query();

        if ($request->filled('search') && $request->input('search') !== 'undefined') {
            $s = trim($request->input('search'));
            $query->where(function ($q) use ($s) {
                $q->where('name', 'like', "%{$s}%")
                  ->orWhere('medical_record_number', 'like', "%{$s}%")
                  ->orWhere('nik', 'like', "%{$s}%")
                  ->orWhere('phone', 'like', "%{$s}%");
            });
        }

        if ($request->filled('gender') && !in_array($request->input('gender'), ['undefined', 'all', ''])) {
            $query->where('gender', $request->input('gender'));
        }

        if ($request->filled('status') && !in_array($request->input('status'), ['undefined', 'all', ''])) {
            $query->where('status', $request->input('status'));
        }

        if ($request->filled('bloodType') && !in_array($request->input('bloodType'), ['undefined', 'all', ''])) {
            $query->where('blood_type', $request->input('bloodType'));
        }

        if ($request->filled('insuranceType') && !in_array($request->input('insuranceType'), ['undefined', 'all', ''])) {
            $query->where('insurance->type', $request->input('insuranceType'));
        }

        if ($request->boolean('h1Control') || $request->filled('nextControlDate')) {
            $targetDate = $request->input('nextControlDate') ?: now()->addDay()->toDateString();
            $query->whereDate('next_control_date', $targetDate);
        }

        $page = max(1, (int) $request->input('page', 1));
        $perPage = max(1, min(100, (int) $request->input('perPage', 10)));
        $total = $query->count();
        $totalPages = $total > 0 ? (int) ceil($total / $perPage) : 1;

        $tDbStart = microtime(true);
        $patients = $total === 0 ? [] : $query->select([
            'id',
            'facility_id',
            'medical_record_number',
            'nik',
            'name',
            'gender',
            'birth_place',
            'birth_date',
            'blood_type',
            'marital_status',
            'religion',
            'occupation',
            'phone',
            'email',
            'address',
            'emergency_contact',
            'insurance',
            'allergies',
            'chronic_diseases',
            'status',
            'next_control_date',
            'control_doctor',
            'control_notes',
            'last_visit_at',
            'registered_at',
            'created_at',
            'updated_at',
        ])
        ->orderByDesc('created_at')
        ->skip(($page - 1) * $perPage)
        ->take($perPage)
        ->get();
        $dbTime = round((microtime(true) - $tDbStart) * 1000, 2);

        $controllerTime = round((microtime(true) - $tControllerStart) * 1000, 2);
        $totalTime = round((microtime(true) - LARAVEL_START) * 1000, 2);

        return response()->json([
            'data' => $patients,
            'meta' => [
                'page' => $page,
                'perPage' => $perPage,
                'total' => $total,
                'totalPages' => $totalPages,
            ],
        ])
        ->header('X-Boot-Time', $bootTime . 'ms')
        ->header('X-DB-Time', $dbTime . 'ms')
        ->header('X-Controller-Time', $controllerTime . 'ms')
        ->header('X-Response-Time', $totalTime . 'ms');
    }

    public function show($id)
    {
        $patient = Patient::where('id', $id)
            ->orWhere('medical_record_number', $id)
            ->orWhere('nik', $id)
            ->first();

        if (!$patient) {
            return response()->json(['message' => 'Pasien tidak ditemukan'], 404);
        }

        // Attach latest odontogram from previous encounter if available
        $latestEnc = Encounter::where('patient_id', $patient->id)
            ->whereNotNull('odontogram')
            ->orderByDesc('visit_date')
            ->orderByDesc('created_at')
            ->first();

        if ($latestEnc && !empty($latestEnc->odontogram)) {
            $patient->setAttribute('odontogram', $latestEnc->odontogram);
            $patient->setAttribute('latest_odontogram', $latestEnc->odontogram);
            $patient->setAttribute('latestOdontogram', $latestEnc->odontogram);
        }

        return response()->json($patient);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string',
            'gender' => 'required|in:male,female',
            'birthDate' => 'required|date',
            'phone' => 'nullable|string',
            'nik' => 'nullable|string',
            'birthPlace' => 'nullable|string',
            'bloodType' => 'nullable|string',
            'maritalStatus' => 'nullable|string',
            'religion' => 'nullable|string',
            'occupation' => 'nullable|string',
            'email' => 'nullable|email',
            'address' => 'nullable|array',
            'emergencyContact' => 'nullable|array',
            'insurance' => 'nullable|array',
            'allergies' => 'nullable|array',
            'chronicDiseases' => 'nullable|array',
        ]);

        $count = Patient::count() + 1;
        $mrn = 'RM-' . date('Y') . '-' . str_pad((string)$count, 6, '0', STR_PAD_LEFT);
        $id = 'PAT-' . str_pad((string)$count, 3, '0', STR_PAD_LEFT);

        $patient = Patient::create([
            'id' => $id,
            'facility_id' => 'FAC-001',
            'medical_record_number' => $mrn,
            'nik' => $validated['nik'] ?? null,
            'name' => $validated['name'],
            'gender' => $validated['gender'],
            'birth_place' => $validated['birthPlace'] ?? null,
            'birth_date' => $validated['birthDate'],
            'blood_type' => $validated['bloodType'] ?? null,
            'marital_status' => $validated['maritalStatus'] ?? null,
            'religion' => $validated['religion'] ?? null,
            'occupation' => $validated['occupation'] ?? null,
            'phone' => $validated['phone'] ?? null,
            'email' => $validated['email'] ?? null,
            'address' => $validated['address'] ?? null,
            'emergency_contact' => $validated['emergencyContact'] ?? null,
            'insurance' => $validated['insurance'] ?? null,
            'allergies' => $validated['allergies'] ?? [],
            'chronic_diseases' => $validated['chronicDiseases'] ?? [],
            'status' => 'active',
            'registered_at' => now(),
        ]);

        return response()->json($patient, 201);
    }

    public function update(Request $request, $id)
    {
        $patient = Patient::findOrFail($id);

        $data = [];
        if ($request->has('name')) $data['name'] = $request->input('name');
        if ($request->has('gender')) $data['gender'] = $request->input('gender');
        if ($request->has('birthDate')) $data['birth_date'] = $request->input('birthDate');
        if ($request->has('birthPlace')) $data['birth_place'] = $request->input('birthPlace');
        if ($request->has('bloodType')) $data['blood_type'] = $request->input('bloodType');
        if ($request->has('maritalStatus')) $data['marital_status'] = $request->input('maritalStatus');
        if ($request->has('religion')) $data['religion'] = $request->input('religion');
        if ($request->has('occupation')) $data['occupation'] = $request->input('occupation');
        if ($request->has('phone')) $data['phone'] = $request->input('phone');
        if ($request->has('email')) $data['email'] = $request->input('email');
        if ($request->has('nik')) $data['nik'] = $request->input('nik');
        if ($request->has('address')) $data['address'] = $request->input('address');
        if ($request->has('emergencyContact')) $data['emergency_contact'] = $request->input('emergencyContact');
        if ($request->has('insurance')) $data['insurance'] = $request->input('insurance');
        if ($request->has('allergies')) $data['allergies'] = $request->input('allergies');
        if ($request->has('chronicDiseases')) $data['chronic_diseases'] = $request->input('chronicDiseases');
        if ($request->has('status')) $data['status'] = $request->input('status');

        $patient->update($data);

        return response()->json($patient);
    }

    public function destroy($id)
    {
        $patient = Patient::findOrFail($id);
        $patient->delete();
        return response()->json(['success' => true]);
    }

    public function updateControlSchedule(Request $request, $id)
    {
        $patient = Patient::findOrFail($id);

        $validated = $request->validate([
            'nextControlDate' => 'required|date',
            'appointmentTime' => 'nullable|string',
            'doctorName' => 'nullable|string',
            'doctorId' => 'nullable|string',
            'notes' => 'nullable|string',
        ]);

        $controlDate = $validated['nextControlDate'];
        $time = $validated['appointmentTime'] ?? '09:00';
        $doctorName = $validated['doctorName'] ?? 'drg. Pratama Wijaya';
        $doctorId = $validated['doctorId'] ?? 'DOC-001';
        $notes = $validated['notes'] ?? 'Kontrol rutin kesehatan gigi';

        // 1. Create or update an Appointment with visit_type = 'control'
        $existingApt = Appointment::where('patient_id', $patient->id)
            ->where('appointment_date', '>=', now()->toDateString())
            ->first();

        if ($existingApt) {
            $existingApt->update([
                'appointment_date' => $controlDate,
                'appointment_time' => $time,
                'visit_type' => 'control',
                'doctor_name' => $doctorName,
                'doctor_id' => $doctorId,
                'complaint' => $notes,
                'status' => 'scheduled',
            ]);
        } else {
            $count = Appointment::count() + 1;
            Appointment::create([
                'id' => 'APT-' . str_pad((string)$count, 3, '0', STR_PAD_LEFT),
                'facility_id' => 'FAC-001',
                'appointment_number' => 'APT-' . date('Y') . '-' . str_pad((string)$count, 4, '0', STR_PAD_LEFT),
                'patient_id' => $patient->id,
                'patient_name' => $patient->name,
                'patient_mrn' => $patient->medical_record_number,
                'patient_phone' => $patient->phone,
                'patient_gender' => $patient->gender,
                'patient_birth_date' => $patient->birth_date,
                'patient_insurance_type' => $patient->insurance['type'] ?? 'umum',
                'doctor_id' => $doctorId,
                'doctor_name' => $doctorName,
                'doctor_specialization' => 'Dokter Gigi Spesialis',
                'department_id' => 'DEP-001',
                'department_name' => 'Poli Gigi Umum',
                'appointment_date' => $controlDate,
                'appointment_time' => $time,
                'duration_minutes' => 30,
                'visit_type' => 'control',
                'complaint' => $notes,
                'status' => 'scheduled',
                'queue_number' => 'DEN-' . str_pad((string)$count, 3, '0', STR_PAD_LEFT),
                'notes' => $notes,
            ]);
        }

        // 2. Also update latest encounter follow_up_plan if exists
        $latestEnc = Encounter::where('patient_id', $patient->id)->orderByDesc('created_at')->first();
        if ($latestEnc) {
            $plan = $latestEnc->follow_up_plan ?? [];
            $plan['nextControlDate'] = $controlDate;
            $plan['dentalNotes'] = $notes;
            $latestEnc->follow_up_plan = $plan;
            $latestEnc->save();
        }

        // 3. Reset read notification for this patient's H-1 notification so it pops up fresh
        $readPath = storage_path('app/read_notifications.json');
        if (file_exists($readPath)) {
            $readIds = json_decode(file_get_contents($readPath), true) ?? [];
            $notifIdApt = 'NOTIF-H1-' . ($existingApt ? $existingApt->id : '');
            $notifIdEnc = 'NOTIF-H1-ENC-' . ($latestEnc ? $latestEnc->id : '');
            $readIds = array_values(array_filter($readIds, function($rid) use ($notifIdApt, $notifIdEnc, $patient) {
                return $rid !== $notifIdApt && $rid !== $notifIdEnc && !str_contains($rid, $patient->id);
            }));
            file_put_contents($readPath, json_encode($readIds, JSON_PRETTY_PRINT));
        }

        $patient->update([
            'next_control_date' => $controlDate,
            'control_doctor' => $doctorName,
            'control_notes' => $notes,
        ]);

        return response()->json([
            'success' => true,
            'message' => "Jadwal kontrol pasien {$patient->name} berhasil disimpan untuk tanggal {$controlDate}.",
            'patient' => $patient,
            'nextControlDate' => $controlDate,
        ]);
    }
}
