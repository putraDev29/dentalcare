<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\PatientController;
use App\Http\Controllers\DoctorController;
use App\Http\Controllers\AppointmentController;
use App\Http\Controllers\QueueController;
use App\Http\Controllers\EncounterController;
use App\Http\Controllers\MedicineController;
use App\Http\Controllers\PrescriptionController;
use App\Http\Controllers\BillingController;
use App\Http\Controllers\FinanceController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\ClinicalController;
use App\Http\Controllers\DepartmentController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\WhatsAppGatewayController;
use App\Models\HospitalProfile;

// Authentication (JWT)
Route::post('/auth/login', [AuthController::class, 'login']);
Route::get('/auth/me', [AuthController::class, 'me']);
Route::post('/auth/logout', [AuthController::class, 'logout']);
Route::get('/auth/users', [UserController::class, 'index']);

// WhatsApp Gateway (WPPConnect)
Route::get('/whatsapp/status', [WhatsAppGatewayController::class, 'status']);
Route::get('/whatsapp/qr', [WhatsAppGatewayController::class, 'qr']);
Route::post('/whatsapp/send', [WhatsAppGatewayController::class, 'send']);
Route::post('/whatsapp/send-file', [WhatsAppGatewayController::class, 'sendFile']);
Route::post('/whatsapp/send-bulk', [WhatsAppGatewayController::class, 'sendBulk']);
Route::post('/whatsapp/send-h1', [WhatsAppGatewayController::class, 'sendH1']);
Route::post('/whatsapp/logout', [WhatsAppGatewayController::class, 'logout']);
Route::post('/whatsapp/reconnect', [WhatsAppGatewayController::class, 'reconnect']);

// Users Management CRUD
Route::get('/users', [UserController::class, 'index']);
Route::post('/users', [UserController::class, 'store']);
Route::get('/users/{id}', [UserController::class, 'show']);
Route::put('/users/{id}', [UserController::class, 'update']);
Route::delete('/users/{id}', [UserController::class, 'destroy']);
Route::patch('/users/{id}/toggle-status', [UserController::class, 'toggleStatus']);

// Dashboard Stats
Route::get('/dashboard/stats', [DashboardController::class, 'stats']);

// Patients
Route::get('/patients', [PatientController::class, 'index']);
Route::post('/patients', [PatientController::class, 'store']);
Route::get('/patients/{id}', [PatientController::class, 'show']);
Route::put('/patients/{id}', [PatientController::class, 'update']);
Route::delete('/patients/{id}', [PatientController::class, 'destroy']);
Route::post('/patients/{id}/control-schedule', [PatientController::class, 'updateControlSchedule']);

// Doctors
Route::get('/doctors', [DoctorController::class, 'index']);
Route::post('/doctors', [DoctorController::class, 'store']);
Route::get('/doctors/{id}', [DoctorController::class, 'show']);
Route::put('/doctors/{id}', [DoctorController::class, 'update']);
Route::delete('/doctors/{id}', [DoctorController::class, 'destroy']);

// Appointments
Route::get('/appointments', [AppointmentController::class, 'index']);
Route::post('/appointments', [AppointmentController::class, 'store']);
Route::get('/appointments/{id}', [AppointmentController::class, 'show']);
Route::patch('/appointments/{id}/status', [AppointmentController::class, 'updateStatus']);

// Queues
Route::get('/queues', [QueueController::class, 'index']);
Route::post('/queues', [QueueController::class, 'store']);
Route::patch('/queues/{id}/status', [QueueController::class, 'updateStatus']);
Route::post('/queues/call-next', [QueueController::class, 'callNext']);

// Encounters (Rekam Medis & Odontogram)
Route::get('/encounters', [EncounterController::class, 'index']);
Route::post('/encounters', [EncounterController::class, 'store']);
Route::get('/encounters/{id}', [EncounterController::class, 'show']);
Route::put('/encounters/{id}', [EncounterController::class, 'update']);

// Medicines (Farmasi)
Route::get('/medicines', [MedicineController::class, 'index']);
Route::post('/medicines', [MedicineController::class, 'store']);
Route::get('/medicines/mutations', [MedicineController::class, 'mutations']);
Route::post('/medicines/stock-in', [MedicineController::class, 'stockIn']);
Route::post('/medicines/stock-out', [MedicineController::class, 'stockOut']);
Route::get('/medicines/{id}', [MedicineController::class, 'show']);
Route::put('/medicines/{id}', [MedicineController::class, 'update']);
Route::patch('/medicines/{id}', [MedicineController::class, 'update']);
Route::delete('/medicines/{id}', [MedicineController::class, 'destroy']);

// Prescriptions
Route::get('/prescriptions', [PrescriptionController::class, 'index']);
Route::post('/prescriptions', [PrescriptionController::class, 'store']);
Route::get('/prescriptions/{id}', [PrescriptionController::class, 'show']);
Route::patch('/prescriptions/{id}/status', [PrescriptionController::class, 'updateStatus']);

// Billing & Payments
Route::get('/billing/invoices', [BillingController::class, 'index']);
Route::post('/billing/invoices', [BillingController::class, 'store']);
Route::get('/billing/invoices/{id}', [BillingController::class, 'show']);
Route::post('/billing/payments', [BillingController::class, 'recordPayment']);

// Finance (Buku Kas & Sinkronisasi)
Route::get('/finance/summary', [FinanceController::class, 'summary']);
Route::get('/finance/transactions', [FinanceController::class, 'transactions']);
Route::post('/finance/transactions', [FinanceController::class, 'store']);

// Departments & Dental Chairs
Route::get('/departments', [DepartmentController::class, 'index']);
Route::post('/departments', [DepartmentController::class, 'store']);
Route::get('/departments/{id}', [DepartmentController::class, 'show']);
Route::put('/departments/{id}', [DepartmentController::class, 'update']);
Route::delete('/departments/{id}', [DepartmentController::class, 'destroy']);

// Clinical Dental References: Diagnoses (ICD-10)
Route::get('/clinical/diagnoses', [ClinicalController::class, 'diagnoses']);
Route::post('/clinical/diagnoses', [ClinicalController::class, 'storeDiagnosis']);
Route::put('/clinical/diagnoses/{id}', [ClinicalController::class, 'updateDiagnosis']);
Route::delete('/clinical/diagnoses/{id}', [ClinicalController::class, 'destroyDiagnosis']);

// Clinical Dental References: Procedures & Tariff
Route::get('/clinical/procedures', [ClinicalController::class, 'procedures']);
Route::post('/clinical/procedures', [ClinicalController::class, 'storeProcedure']);
Route::put('/clinical/procedures/{id}', [ClinicalController::class, 'updateProcedure']);
Route::delete('/clinical/procedures/{id}', [ClinicalController::class, 'destroyProcedure']);

// Master Insurance & BPJS Dental
Route::get('/insurance', [ClinicalController::class, 'insurance']);
Route::post('/insurance', [ClinicalController::class, 'storeInsurance']);
Route::put('/insurance/{id}', [ClinicalController::class, 'updateInsurance']);
Route::delete('/insurance/{id}', [ClinicalController::class, 'destroyInsurance']);

Route::get('/staff', [ClinicalController::class, 'staff']);
Route::get('/inventory/items', [ClinicalController::class, 'inventoryItems']);

// System & Clinic Profile
Route::get('/system/hospital-profile', function () {
    $profile = HospitalProfile::first();
    if (!$profile) {
        $profile = HospitalProfile::create([
            'id' => 'HOSP-001',
            'name' => 'Klinik Gigi Dental Care',
            'type' => 'Klinik Pratama Rawat Jalan Gigi & Mulut',
            'director_name' => 'drg. Pratama Wijaya',
        ]);
    }
    return response()->json($profile);
});

Route::put('/system/hospital-profile', function (\Illuminate\Http\Request $request) {
    $profile = HospitalProfile::first();
    if (!$profile) {
        $profile = new HospitalProfile();
        $profile->id = 'HOSP-001';
    }

    $fieldMap = [
        'name' => 'name',
        'code' => 'code',
        'type' => 'type',
        'accreditation' => 'accreditation',
        'licenseNumber' => 'license_number',
        'license_number' => 'license_number',
        'taxId' => 'tax_id',
        'tax_id' => 'tax_id',
        'phone' => 'phone',
        'email' => 'email',
        'website' => 'website',
        'address' => 'address',
        'city' => 'city',
        'province' => 'province',
        'postalCode' => 'postal_code',
        'postal_code' => 'postal_code',
        'directorName' => 'director_name',
        'director_name' => 'director_name',
    ];

    $data = [];
    foreach ($fieldMap as $key => $column) {
        if ($request->has($key)) {
            $data[$column] = $request->input($key);
        }
    }

    if (empty($profile->name) && empty($data['name'])) {
        $data['name'] = 'Klinik Gigi Dental Care';
    }

    $profile->fill($data);
    $profile->save();

    return response()->json($profile);
});
Route::get('/system/notifications', [ClinicalController::class, 'notifications']);
Route::patch('/system/notifications/{id}/read', [ClinicalController::class, 'markNotificationRead']);
Route::post('/system/notifications/mark-all-read', [ClinicalController::class, 'markAllNotificationsRead']);
Route::get('/system/audit-logs', [ClinicalController::class, 'auditLogs']);
Route::post('/system/reset-demo', function () {
    return response()->json(['success' => true]);
});

// Diagnostic & Specialized Orders
Route::get('/laboratory/orders', function () {
    return response()->json([]);
});
Route::get('/radiology/orders', function () {
    return response()->json([]);
});
Route::get('/inpatient/rooms', function () {
    return response()->json([]);
});
Route::get('/inpatient/admissions', function () {
    return response()->json([]);
});
