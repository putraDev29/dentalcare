<?php

namespace App\Http\Controllers;

use App\Models\QueueItem;
use App\Models\Appointment;
use App\Models\Patient;
use App\Models\Doctor;
use App\Models\Department;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class QueueController extends Controller
{
    public function index(Request $request)
    {
        $query = QueueItem::query();

        if ($request->filled('status')) {
            $query->where('status', $request->input('status'));
        }

        if ($request->filled('doctorId')) {
            $query->where('doctor_id', $request->input('doctorId'));
        }

        return response()->json($query->orderByDesc('created_at')->orderByDesc('id')->get());
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'patientId' => 'required|string',
            'doctorId' => 'nullable|string',
            'departmentId' => 'nullable|string',
            'appointmentId' => 'nullable|string',
            'serviceType' => 'nullable|string',
        ]);

        $patient = Patient::findOrFail($validated['patientId']);
        $doctor = isset($validated['doctorId']) ? Doctor::find($validated['doctorId']) : Doctor::first();
        $department = isset($validated['departmentId']) ? Department::find($validated['departmentId']) : ($doctor ? Department::find($doctor->department_id) : null);

        $todayCount = QueueItem::whereDate('created_at', now()->toDateString())->count() + 1;
        $queueNumber = 'A-' . str_pad((string)$todayCount, 3, '0', STR_PAD_LEFT);
        $id = 'QUE-' . strtoupper(Str::random(6));

        $queue = QueueItem::create([
            'id' => $id,
            'facility_id' => 'FAC-001',
            'queue_number' => $queueNumber,
            'appointment_id' => $validated['appointmentId'] ?? null,
            'encounter_id' => null,
            'patient_id' => $patient->id,
            'patient_name' => $patient->name,
            'patient_mrn' => $patient->medical_record_number,
            'doctor_id' => $doctor ? $doctor->id : 'DOC-001',
            'doctor_name' => $doctor ? $doctor->name : 'drg. Jihan, S.Kep',
            'department_id' => $department ? $department->id : 'DEP-001',
            'department_name' => $department ? $department->name : 'Poli Gigi Umum',
            'status' => 'waiting',
            'estimated_call_time' => now()->addMinutes($todayCount * 15)->format('H:i'),
        ]);

        return response()->json($queue, 201);
    }

    public function updateStatus(Request $request, $id)
    {
        $queue = QueueItem::findOrFail($id);
        $status = $request->input('status');

        $update = ['status' => $status];
        if ($status === 'called' || $status === 'in_progress') {
            $update['called_at'] = now();
        }

        $queue->update($update);

        if ($queue->appointment_id) {
            $aptStatus = match($status) {
                'in_progress' => 'in_consultation',
                'completed' => 'completed',
                'cancelled' => 'cancelled',
                default => 'in_queue'
            };
            Appointment::where('id', $queue->appointment_id)->update(['status' => $aptStatus]);
        }

        return response()->json($queue);
    }

    public function callNext(Request $request)
    {
        $query = QueueItem::where('status', 'waiting');

        if ($request->filled('departmentId')) {
            $query->where('department_id', $request->input('departmentId'));
        }

        $next = $query->orderBy('created_at')->first();

        if ($next) {
            $next->update([
                'status' => 'called',
                'called_at' => now(),
            ]);

            if ($next->appointment_id) {
                Appointment::where('id', $next->appointment_id)->update(['status' => 'in_queue']);
            }
        }

        return response()->json($next);
    }
}
