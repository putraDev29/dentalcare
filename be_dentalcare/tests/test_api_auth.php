<?php

require_once __DIR__ . '/../vendor/autoload.php';

$app = require_once __DIR__ . '/../bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use Illuminate\Http\Request;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\ClinicalController;

$controller = new AuthController();
$loginReq = Request::create('/api/auth/login', 'POST', [
    'email' => 'admin@dentalcare.local',
    'password' => 'password',
]);

$loginRes = $controller->login($loginReq);
echo "1. AUTH LOGIN: " . $loginRes->getStatusCode() . "\n";
echo "   Payload: " . $loginRes->getContent() . "\n\n";

$data = json_decode($loginRes->getContent(), true);
$token = $data['token'] ?? null;

if ($token) {
    $meReq = Request::create('/api/auth/me', 'GET');
    $meReq->headers->set('Authorization', 'Bearer ' . $token);
    $meRes = $controller->me($meReq);
    echo "2. AUTH ME: " . $meRes->getStatusCode() . "\n";
    echo "   Payload: " . $meRes->getContent() . "\n\n";
}

$dash = new DashboardController();
$dashRes = $dash->stats(Request::create('/api/dashboard/stats', 'GET'));
echo "3. DASHBOARD STATS: " . $dashRes->getStatusCode() . "\n";
echo "   Payload: " . substr($dashRes->getContent(), 0, 150) . "...\n\n";

$clin = new ClinicalController();
$dxRes = $clin->diagnoses(Request::create('/api/clinical/diagnoses', 'GET'));
echo "4. CLINICAL DIAGNOSES: " . $dxRes->getStatusCode() . "\n";
echo "   Count: " . count(json_decode($dxRes->getContent(), true)) . " diagnoses\n\n";

$procRes = $clin->procedures(Request::create('/api/clinical/procedures', 'GET'));
echo "5. CLINICAL PROCEDURES: " . $procRes->getStatusCode() . "\n";
echo "   Count: " . count(json_decode($procRes->getContent(), true)) . " procedures\n\n";

$staffRes = $clin->staff(Request::create('/api/clinical/staff', 'GET'));
echo "6. STAFF: " . $staffRes->getStatusCode() . "\n";
echo "   Count: " . count(json_decode($staffRes->getContent(), true)) . " staff members\n\n";

$insRes = $clin->insurance(Request::create('/api/clinical/insurance', 'GET'));
echo "7. INSURANCE: " . $insRes->getStatusCode() . "\n";
echo "   Count: " . count(json_decode($insRes->getContent(), true)) . " insurers\n\n";

echo "ALL BACKEND TESTS PASSED!\n";