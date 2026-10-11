<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use App\Models\User;
use App\Services\JwtService;

class AuthController extends Controller
{
    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required',
        ]);

        $user = User::where('email', strtolower($request->email))->first();

        // Also check if admin alias is requested
        if (!$user && strtolower($request->email) === 'admin@dentalcare.local') {
            $user = User::where('email', 'admin@ehealth.local')->first();
        }

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Email atau kata sandi tidak sesuai.',
            ], 401);
        }

        if (!$user->is_active) {
            return response()->json([
                'success' => false,
                'message' => 'Akun pengguna dinonaktifkan. Silakan hubungi Super Admin.',
            ], 403);
        }

        // Verify password (hash or default demo)
        $passwordValid = Hash::check($request->password, $user->password) || $request->password === 'password';

        if (!$passwordValid) {
            return response()->json([
                'success' => false,
                'message' => 'Email atau kata sandi tidak sesuai.',
            ], 401);
        }

        $tokenPayload = [
            'sub' => $user->id,
            'email' => $user->email,
            'role' => $user->role,
            'name' => $user->name,
        ];

        $token = JwtService::generateToken($tokenPayload);

        return response()->json([
            'success' => true,
            'message' => 'Login berhasil',
            'token' => $token,
            'token_type' => 'Bearer',
            'user' => [
                'id' => (string) $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role,
                'roleName' => $user->role_name ?? ucwords(str_replace('_', ' ', $user->role)),
                'avatarUrl' => $user->avatar_url,
                'facilityId' => $user->facility_id ?? 'FAC-001',
                'departmentId' => $user->department_id,
                'doctorId' => $user->doctor_id,
                'employeeNumber' => $user->employee_number,
                'phone' => $user->phone,
                'isActive' => (bool) $user->is_active,
            ],
        ]);
    }

    public function me(Request $request)
    {
        $authHeader = $request->header('Authorization');
        if (!$authHeader || !preg_match('/Bearer\s+(.*)$/i', $authHeader, $matches)) {
            return response()->json(['message' => 'Unauthenticated'], 401);
        }

        $payload = JwtService::verifyToken($matches[1]);
        if (!$payload) {
            return response()->json(['message' => 'Token tidak valid atau kedaluwarsa'], 401);
        }

        $user = null;
        if (!empty($payload['sub'])) {
            $user = User::find($payload['sub']);
        }
        if (!$user && !empty($payload['email'])) {
            $user = User::where('email', $payload['email'])->first();
        }
        if (!$user && strtolower($payload['email'] ?? '') === 'admin@dentalcare.local') {
            $user = User::where('email', 'admin@ehealth.local')->first();
        }
        if (!$user) {
            $user = User::first();
        }

        if (!$user) {
            return response()->json(['message' => 'Pengguna tidak ditemukan'], 404);
        }

        return response()->json([
            'id' => (string) $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'role' => $user->role,
            'roleName' => $user->role_name ?? ucwords(str_replace('_', ' ', $user->role)),
            'avatarUrl' => $user->avatar_url,
            'facilityId' => $user->facility_id ?? 'FAC-001',
            'departmentId' => $user->department_id,
            'doctorId' => $user->doctor_id,
            'employeeNumber' => $user->employee_number,
            'phone' => $user->phone,
            'isActive' => (bool) $user->is_active,
        ]);
    }

    public function logout()
    {
        return response()->json([
            'success' => true,
            'message' => 'Berhasil logout.',
        ]);
    }

    public function users()
    {
        $users = User::all()->map(function ($u) {
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
            ];
        });

        return response()->json($users);
    }
}
