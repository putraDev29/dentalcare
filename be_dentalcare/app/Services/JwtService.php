<?php

namespace App\Services;

class JwtService
{
    private static function getSecret(): string
    {
        return config('app.key') ?: 'dentalcare_jwt_secret_key_2026_super_secure';
    }

    private static function base64UrlEncode(string $data): string
    {
        return rtrim(strtr(base64_encode($data), '+/', '-_'), '=');
    }

    private static function base64UrlDecode(string $data): string
    {
        return base64_decode(strtr($data, '-_', '+/'));
    }

    public static function generateToken(array $payload, int $expirySeconds = 86400 * 7): string
    {
        $header = [
            'typ' => 'JWT',
            'alg' => 'HS256',
        ];

        $payload['iat'] = time();
        $payload['exp'] = time() + $expirySeconds;

        $base64Header = self::base64UrlEncode(json_encode($header));
        $base64Payload = self::base64UrlEncode(json_encode($payload));

        $signature = hash_hmac('sha256', "$base64Header.$base64Payload", self::getSecret(), true);
        $base64Signature = self::base64UrlEncode($signature);

        return "$base64Header.$base64Payload.$base64Signature";
    }

    public static function verifyToken(string $token): ?array
    {
        $parts = explode('.', $token);
        if (count($parts) !== 3) {
            return null;
        }

        [$base64Header, $base64Payload, $base64Signature] = $parts;

        $expectedSignature = hash_hmac('sha256', "$base64Header.$base64Payload", self::getSecret(), true);
        $expectedBase64Signature = self::base64UrlEncode($expectedSignature);

        if (!hash_equals($expectedBase64Signature, $base64Signature)) {
            return null;
        }

        $payload = json_decode(self::base64UrlDecode($base64Payload), true);
        if (!$payload || !isset($payload['exp']) || $payload['exp'] < time()) {
            return null;
        }

        return $payload;
    }
}
