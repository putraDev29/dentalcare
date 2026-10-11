<?php

namespace App\Http\Controllers;

use App\Models\Doctor;
use Illuminate\Http\Request;

class DoctorController extends Controller
{
    public function index(Request $request)
    {
        $query = Doctor::query();

        if ($request->filled('departmentId')) {
            $query->where('department_id', $request->input('departmentId'));
        }

        if ($request->filled('status')) {
            $query->where('status', $request->input('status'));
        }

        if ($request->filled('search')) {
            $q = strtolower($request->input('search'));
            $query->where(function($sub) use ($q) {
                $sub->whereRaw('LOWER(name) LIKE ?', ["%{$q}%"])
                    ->orWhereRaw('LOWER(specialization) LIKE ?', ["%{$q}%"])
                    ->orWhereRaw('LOWER(sip_number) LIKE ?', ["%{$q}%"]);
            });
        }

        return response()->json($query->orderBy('name')->get());
    }

    public function show($id)
    {
        $doctor = Doctor::findOrFail($id);
        return response()->json($doctor);
    }

    public function store(Request $request)
    {
        $count = Doctor::count() + 1;
        $id = $request->input('id') ?: 'DOC-' . str_pad($count, 3, '0', STR_PAD_LEFT);

        $doctor = Doctor::create([
            'id' => $id,
            'facility_id' => $request->input('facilityId', 'FAC-001'),
            'employee_number' => $request->input('employeeNumber') ?: 'EMP-' . str_pad($count, 3, '0', STR_PAD_LEFT),
            'name' => $request->input('name', 'Dokter Gigi'),
            'title' => $request->input('title', 'drg.'),
            'specialization' => $request->input('specialization', 'Dokter Gigi Umum'),
            'department_id' => $request->input('departmentId', 'DEP-001'),
            'department_name' => $request->input('departmentName', 'Poli Gigi Umum'),
            'sip_number' => $request->input('sipNumber', ''),
            'phone' => $request->input('phone', ''),
            'email' => $request->input('email', ''),
            'avatar_url' => $request->input('avatarUrl'),
            'status' => $request->input('status', 'active'),
            'consultation_fee' => $request->input('consultationFee', 150000),
            'schedules' => $request->input('schedules', []),
        ]);

        return response()->json($doctor, 201);
    }

    public function update(Request $request, $id)
    {
        $doctor = Doctor::findOrFail($id);

        $mapping = [
            'name' => 'name',
            'title' => 'title',
            'specialization' => 'specialization',
            'departmentId' => 'department_id',
            'departmentName' => 'department_name',
            'sipNumber' => 'sip_number',
            'phone' => 'phone',
            'email' => 'email',
            'avatarUrl' => 'avatar_url',
            'status' => 'status',
            'consultationFee' => 'consultation_fee',
            'schedules' => 'schedules',
        ];

        $data = [];
        foreach ($mapping as $reqKey => $dbCol) {
            if ($request->has($reqKey)) {
                $data[$dbCol] = $request->input($reqKey);
            } elseif ($request->has($dbCol)) {
                $data[$dbCol] = $request->input($dbCol);
            }
        }

        $doctor->update($data);
        return response()->json($doctor);
    }

    public function destroy($id)
    {
        $doctor = Doctor::findOrFail($id);
        $doctor->delete();
        return response()->json([
            'success' => true,
            'message' => 'Dokter gigi berhasil dihapus'
        ]);
    }
}
