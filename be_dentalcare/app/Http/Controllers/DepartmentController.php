<?php

namespace App\Http\Controllers;

use App\Models\Department;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class DepartmentController extends Controller
{
    public function index(Request $request)
    {
        $query = Department::query();

        if ($request->filled('isActive')) {
            $query->where('is_active', filter_var($request->input('isActive'), FILTER_VALIDATE_BOOLEAN));
        }

        if ($request->filled('search')) {
            $search = $request->input('search');
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('code', 'like', "%{$search}%")
                  ->orWhere('location', 'like', "%{$search}%");
            });
        }

        return response()->json($query->orderBy('name')->get());
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'code' => 'nullable|string|max:50',
            'description' => 'nullable|string',
            'headDoctorId' => 'nullable|string',
            'location' => 'nullable|string',
            'isActive' => 'nullable|boolean',
        ]);

        $id = 'DEP-' . strtoupper(Str::random(5));
        $department = Department::create([
            'id' => $id,
            'facility_id' => 'FAC-001',
            'name' => $validated['name'],
            'code' => $validated['code'] ?? ('CHAIR-' . rand(10, 99)),
            'description' => $validated['description'] ?? null,
            'head_doctor_id' => $validated['headDoctorId'] ?? null,
            'location' => $validated['location'] ?? null,
            'is_active' => $validated['isActive'] ?? true,
        ]);

        return response()->json($department, 201);
    }

    public function show($id)
    {
        $department = Department::findOrFail($id);
        return response()->json($department);
    }

    public function update(Request $request, $id)
    {
        $department = Department::findOrFail($id);

        $validated = $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'code' => 'nullable|string|max:50',
            'description' => 'nullable|string',
            'headDoctorId' => 'nullable|string',
            'location' => 'nullable|string',
            'isActive' => 'nullable|boolean',
        ]);

        $data = [];
        if (isset($validated['name'])) $data['name'] = $validated['name'];
        if (array_key_exists('code', $validated)) $data['code'] = $validated['code'];
        if (array_key_exists('description', $validated)) $data['description'] = $validated['description'];
        if (array_key_exists('headDoctorId', $validated)) $data['head_doctor_id'] = $validated['headDoctorId'];
        if (array_key_exists('location', $validated)) $data['location'] = $validated['location'];
        if (array_key_exists('isActive', $validated)) $data['is_active'] = $validated['isActive'];

        $department->update($data);

        return response()->json($department);
    }

    public function destroy($id)
    {
        $department = Department::findOrFail($id);
        $department->delete();

        return response()->json(['message' => 'Unit poli gigi berhasil dihapus', 'id' => $id]);
    }
}
