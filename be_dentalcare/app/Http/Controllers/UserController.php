<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;

class UserController extends Controller
{
    /**
     * Map role code to human-readable Indonesian label and standard code.
     */
    private function resolveRoleMeta(string $role): array
    {
        $role = strtolower(trim($role));
        switch ($role) {
            case 'super_admin':
            case 'admin':
                return ['code' => 'super_admin', 'label' => 'Super Admin'];
            case 'dokter':
            case 'doctor':
                return ['code' => 'doctor', 'label' => 'Dokter Gigi'];
            case 'perawat':
            case 'nurse':
                return ['code' => 'nurse', 'label' => 'Perawat Gigi'];
            case 'farmasi':
            case 'pharmacist':
                return ['code' => 'pharmacist', 'label' => 'Petugas Farmasi'];
            default:
                return ['code' => $role, 'label' => ucwords(str_replace('_', ' ', $role))];
        }
    }

    /**
     * Format a user model into standard API response.
     */
    private function formatUser(User $u): array
    {
        return [
            'id' => (string) $u->id,
            'name' => $u->name,
            'email' => $u->email,
            'role' => $u->role,
            'roleName' => $u->role_name ?? ucwords(str_replace('_', ' ', $u->role)),
            'avatarUrl' => $u->avatar_url,
            'facilityId' => $u->facility_id ?? 'FAC-001',
            'departmentId' => $u->department_id,
            'doctorId' => $u->doctor_id,
            'employeeNumber' => $u->employee_number,
            'phone' => $u->phone,
            'isActive' => (bool) $u->is_active,
            'createdAt' => $u->created_at ? $u->created_at->toISOString() : null,
            'updatedAt' => $u->updated_at ? $u->updated_at->toISOString() : null,
        ];
    }

    /**
     * Display a listing of users.
     */
    public function index(Request $request)
    {
        $query = User::query();

        if ($request->filled('role')) {
            $roleFilter = strtolower($request->input('role'));
            if ($roleFilter === 'dokter' || $roleFilter === 'doctor') {
                $query->whereIn('role', ['dokter', 'doctor']);
            } elseif ($roleFilter === 'perawat' || $roleFilter === 'nurse') {
                $query->whereIn('role', ['perawat', 'nurse']);
            } elseif ($roleFilter === 'farmasi' || $roleFilter === 'pharmacist') {
                $query->whereIn('role', ['farmasi', 'pharmacist']);
            } else {
                $query->where('role', $roleFilter);
            }
        }

        if ($request->has('isActive') && $request->input('isActive') !== '') {
            $query->where('is_active', filter_var($request->input('isActive'), FILTER_VALIDATE_BOOLEAN));
        }

        if ($request->filled('search')) {
            $q = strtolower($request->input('search'));
            $query->where(function ($sub) use ($q) {
                $sub->whereRaw('LOWER(name) LIKE ?', ["%{$q}%"])
                    ->orWhereRaw('LOWER(email) LIKE ?', ["%{$q}%"])
                    ->orWhereRaw('LOWER(phone) LIKE ?', ["%{$q}%"])
                    ->orWhereRaw('LOWER(employee_number) LIKE ?', ["%{$q}%"]);
            });
        }

        $users = $query->orderByDesc('id')->get()->map(function ($u) {
            return $this->formatUser($u);
        });

        return response()->json($users);
    }

    /**
     * Store a newly created user.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|max:255|unique:users,email',
            'password' => 'required|string|min:6',
            'role' => 'required|string',
            'phone' => 'nullable|string|max:50',
            'employeeNumber' => 'nullable|string|max:50',
            'employee_number' => 'nullable|string|max:50',
            'isActive' => 'nullable|boolean',
            'is_active' => 'nullable|boolean',
        ]);

        $roleMeta = $this->resolveRoleMeta($validated['role']);
        $employeeNum = $request->input('employeeNumber') ?: $request->input('employee_number');
        if (!$employeeNum) {
            $prefix = strtoupper(substr($roleMeta['code'], 0, 3));
            $employeeNum = $prefix . '-' . str_pad((string)(User::count() + 1), 4, '0', STR_PAD_LEFT);
        }

        $user = User::create([
            'name' => trim($validated['name']),
            'email' => strtolower(trim($validated['email'])),
            'password' => Hash::make($validated['password']),
            'role' => $roleMeta['code'],
            'role_name' => $roleMeta['label'],
            'phone' => $request->input('phone'),
            'employee_number' => $employeeNum,
            'facility_id' => $request->input('facilityId', 'FAC-001'),
            'department_id' => $request->input('departmentId'),
            'doctor_id' => $request->input('doctorId'),
            'is_active' => $request->has('isActive')
                ? filter_var($request->input('isActive'), FILTER_VALIDATE_BOOLEAN)
                : ($request->has('is_active') ? filter_var($request->input('is_active'), FILTER_VALIDATE_BOOLEAN) : true),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Pengguna berhasil ditambahkan dan siap digunakan untuk login.',
            'data' => $this->formatUser($user),
        ], 201);
    }

    /**
     * Display the specified user.
     */
    public function show($id)
    {
        $user = User::findOrFail($id);
        return response()->json($this->formatUser($user));
    }

    /**
     * Update the specified user.
     */
    public function update(Request $request, $id)
    {
        $user = User::findOrFail($id);

        $validated = $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'email' => ['sometimes', 'required', 'email', 'max:255', Rule::unique('users')->ignore($user->id)],
            'password' => 'nullable|string|min:6',
            'role' => 'sometimes|required|string',
            'phone' => 'nullable|string|max:50',
            'employeeNumber' => 'nullable|string|max:50',
            'employee_number' => 'nullable|string|max:50',
            'isActive' => 'nullable|boolean',
            'is_active' => 'nullable|boolean',
        ]);

        $updateData = [];

        if ($request->filled('name')) {
            $updateData['name'] = trim($validated['name']);
        }

        if ($request->filled('email')) {
            $updateData['email'] = strtolower(trim($validated['email']));
        }

        if ($request->filled('password')) {
            $updateData['password'] = Hash::make($validated['password']);
        }

        if ($request->filled('role')) {
            $roleMeta = $this->resolveRoleMeta($validated['role']);
            $updateData['role'] = $roleMeta['code'];
            $updateData['role_name'] = $roleMeta['label'];
        }

        if ($request->has('phone')) {
            $updateData['phone'] = $request->input('phone');
        }

        if ($request->has('employeeNumber') || $request->has('employee_number')) {
            $updateData['employee_number'] = $request->input('employeeNumber') ?: $request->input('employee_number');
        }

        if ($request->has('isActive')) {
            $updateData['is_active'] = filter_var($request->input('isActive'), FILTER_VALIDATE_BOOLEAN);
        } elseif ($request->has('is_active')) {
            $updateData['is_active'] = filter_var($request->input('is_active'), FILTER_VALIDATE_BOOLEAN);
        }

        $user->update($updateData);

        return response()->json([
            'success' => true,
            'message' => 'Data pengguna berhasil diperbarui.',
            'data' => $this->formatUser($user->fresh()),
        ]);
    }

    /**
     * Remove the specified user.
     */
    public function destroy($id)
    {
        $user = User::findOrFail($id);

        // Prevent deleting the primary admin account if only 1 super_admin exists
        if ($user->role === 'super_admin') {
            $adminCount = User::where('role', 'super_admin')->count();
            if ($adminCount <= 1) {
                return response()->json([
                    'success' => false,
                    'message' => 'Tidak dapat menghapus satu-satunya akun Super Admin sistem.',
                ], 422);
            }
        }

        $user->delete();

        return response()->json([
            'success' => true,
            'message' => 'Pengguna berhasil dihapus.',
        ]);
    }

    /**
     * Toggle active status.
     */
    public function toggleStatus($id)
    {
        $user = User::findOrFail($id);
        $user->is_active = !$user->is_active;
        $user->save();

        $statusText = $user->is_active ? 'diaktifkan' : 'dinonaktifkan';

        return response()->json([
            'success' => true,
            'message' => "Akun pengguna berhasil {$statusText}.",
            'data' => $this->formatUser($user),
        ]);
    }
}
