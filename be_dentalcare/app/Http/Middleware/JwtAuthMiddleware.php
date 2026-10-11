<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use App\Services\JwtService;
use App\Models\User;

class JwtAuthMiddleware
{
    public function handle(Request $request, Closure $next)
    {
        $authHeader = $request->header('Authorization');

        if (!$authHeader || !preg_match('/Bearer\s+(.*)$/i', $authHeader, $matches)) {
            return response()->json([
                'success' => false,
                'message' => 'Token otentikasi tidak ditemukan.'
            ], 401);
        }

        $token = $matches[1];
        $payload = JwtService::verifyToken($token);

        if (!$payload) {
            return response()->json([
                'success' => false,
                'message' => 'Sesi kedaluwarsa atau token tidak sah.'
            ], 401);
        }

        $user = User::where('email', $payload['email'] ?? '')->first();
        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Pengguna tidak ditemukan.'
            ], 401);
        }

        // Attach user to request
        $request->merge(['auth_user' => $user]);

        return $next($request);
    }
}
