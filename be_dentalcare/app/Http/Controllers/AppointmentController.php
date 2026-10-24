<?php

namespace App\Http\Controllers;

use App\Models\Appointment;
use App\Models\QueueItem;
use App\Models\Patient;
use App\Models\Doctor;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class AppointmentController extends Controller
{
    public function index(Request $request)
    {
        $query = Appointment::query();

        if ($request->filled('date')) {
            $query->where('appointment_date', $request->input('date'));
        }

        if ($request->filled('status')) {
            $query->where('status', $request->input('status'));
        }

        if ($request->filled('doctorId')) {
            $query->where('doctor_id', $request->input('doctorId'));
        }

        if ($request->filled('patientId')) {
            $query->where('patient_id', $request->input('patientId'));
        }

        return response()->json($query->orderBy('appointment_date')->orderBy('appointment_time')->get());
    }

    public function show($id)
    {
        $appointment = Appointment::findOrFail($id);
        return response()->json($appointment);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'patientId' => 'required|string',
            'doctorId' => 'required|string',
            'appointmentDate' => 'required|date',
            'appointmentTime' => 'required|string',
            'visitType' => 'nullable|string',
            'complaint' => 'nullable|string',
            'notes' => 'nullable|string',
            'durationMinutes' => 'nullable|integer',
        ]);

        $patient = Patient::findOrFail($validated['patientId']);
        $doctor = Doctor::findOrFail($validated['doctorId']);

        $count = Appointment::count() + 1;
        $id = 'APT-' . str_pad((string)$count, 3, '0', STR_PAD_LEFT);
        $appointmentNumber = 'APT-' . date('Y') . '-' . str_pad((string)$count, 4, '0', STR_PAD_LEFT);
        $queueNumber = 'DEN-' . str_pad((string)$count, 3, '0', STR_PAD_LEFT);

        $appointment = Appointment::create([
            'id' => $id,
            'facility_id' => 'FAC-001',
            'appointment_number' => $appointmentNumber,
            'patient_id' => $patient->id,
            'patient_name' => $patient->name,
            'patient_mrn' => $patient->medical_record_number,
            'patient_phone' => $patient->phone,
            'patient_gender' => $patient->gender,
            'patient_birth_date' => $patient->birth_date,
            'patient_insurance_type' => is_array($patient->insurance) ? ($patient->insurance['type'] ?? 'umum') : 'umum',
            'doctor_id' => $doctor->id,
            'doctor_name' => $doctor->name,
            'doctor_specialization' => $doctor->specialization,
            'department_id' => $doctor->department_id,
            'department_name' => $doctor->department_name,
            'appointment_date' => $validated['appointmentDate'],
            'appointment_time' => $validated['appointmentTime'],
            'duration_minutes' => $validated['durationMinutes'] ?? 30,
            'visit_type' => $validated['visitType'] ?? 'routine_checkup',
            'complaint' => $validated['complaint'] ?? null,
            'status' => 'in_queue',
            'queue_number' => $queueNumber,
            'notes' => $validated['notes'] ?? null,
        ]);

        // Auto create queue item for the clinic staff
        QueueItem::create([
            'id' => 'QUE-' . str_pad((string)(QueueItem::count() + 1), 3, '0', STR_PAD_LEFT),
            'facility_id' => 'FAC-001',
            'queue_number' => $queueNumber,
            'appointment_id' => $appointment->id,
            'patient_id' => $patient->id,
            'patient_name' => $patient->name,
            'patient_mrn' => $patient->medical_record_number,
            'doctor_id' => $doctor->id,
            'doctor_name' => $doctor->name,
            'department_id' => $doctor->department_id,
            'department_name' => $doctor->department_name,
            'status' => 'waiting',
            'estimated_call_time' => $appointment->appointment_time,
        ]);

        if (($appointment->visit_type ?? '') === 'control') {
            $patient->update([
                'next_control_date' => $appointment->appointment_date,
                'control_doctor' => $doctor ? $doctor->name : null,
                'control_notes' => $appointment->complaint ?: $appointment->notes,
            ]);
        }

        return response()->json($appointment, 201);
    }

    public function updateStatus(Request $request, $id)
    {
        $appointment = Appointment::findOrFail($id);
        $status = $request->input('status');
        $appointment->update(['status' => $status]);

        // Update corresponding queue item if any
        QueueItem::where('appointment_id', $id)->update([
            'status' => $status === 'completed' ? 'completed' : ($status === 'in_consultation' ? 'in_progress' : 'waiting'),
        ]);

        return response()->json($appointment);
    }
}
