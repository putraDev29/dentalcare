<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Department;
use App\Models\Doctor;
use App\Models\Patient;
use App\Models\Appointment;
use App\Models\QueueItem;
use App\Models\Encounter;
use App\Models\Medicine;
use App\Models\MedicineMutation;
use App\Models\Prescription;
use App\Models\Invoice;
use App\Models\FinanceTransaction;
use App\Models\HospitalProfile;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $this->command->info("Starting Dental Care Database Seeding...");

        // 1. Seed Users (Dokter & Petugas Klinik Mandiri)
        $this->seedUsers();

        // 2. Seed Hospital Profile
        $this->seedHospitalProfile();

        // Path to JSON data in frontend
        $dataPath = base_path('../fe_dentalcare/src/data');

        // 3. Seed Master Dental Diagnoses & Procedures (ICD-10 Dental & Tarif)
        $this->seedDentalMasterData($dataPath);

        // 4. Seed Departments
        $this->seedDepartments($dataPath);

        // 5. Seed Doctors
        $this->seedDoctors($dataPath);

        // 6. Seed Patients
        $this->seedPatients($dataPath);

        // 7. Seed Appointments
        $this->seedAppointments($dataPath);

        // 8. Seed Queues
        $this->seedQueues($dataPath);

        // 9. Seed Encounters & Odontogram
        $this->seedEncounters($dataPath);

        // 10. Seed Medicines & Initial Mutations
        $this->seedMedicines($dataPath);

        // 11. Seed Prescriptions
        $this->seedPrescriptions($dataPath);

        // 12. Seed Invoices & Financial Cash Flow
        $this->seedInvoicesAndFinances($dataPath);

        $this->command->info("Dental Care Database Seeded Successfully!");
    }

    private function loadJson(string $dataPath, string $filename): array
    {
        $file = database_path('data/' . $filename);
        if (!file_exists($file)) {
            $file = $dataPath . '/' . $filename;
        }
        if (file_exists($file)) {
            $content = file_get_contents($file);
            return json_decode($content, true) ?: [];
        }
        return [];
    }

    private function seedUsers(): void
    {
        User::updateOrCreate(
            ['email' => 'admin@dentalcare.local'],
            [
                'name' => 'drg. Pratama Wijaya',
                'password' => Hash::make('password'),
                'role' => 'super_admin',
                'role_name' => 'Dokter Gigi & Super Admin',
                'avatar_url' => 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=150&auto=format&fit=crop&q=80',
                'facility_id' => 'FAC-001',
                'department_id' => 'DEP-001',
                'doctor_id' => 'DOC-001',
                'employee_number' => 'DOC-2020-001',
                'phone' => '081311223344',
                'is_active' => true,
                'email_verified_at' => now(),
            ]
        );

        User::updateOrCreate(
            ['email' => 'admin@ehealth.local'],
            [
                'name' => 'drg. Pratama Wijaya',
                'password' => Hash::make('password'),
                'role' => 'super_admin',
                'role_name' => 'Dokter Gigi & Super Admin',
                'avatar_url' => 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=150&auto=format&fit=crop&q=80',
                'facility_id' => 'FAC-001',
                'department_id' => 'DEP-001',
                'doctor_id' => 'DOC-001',
                'employee_number' => 'DOC-2020-001',
                'phone' => '081311223344',
                'is_active' => true,
                'email_verified_at' => now(),
            ]
        );

        User::updateOrCreate(
            ['email' => 'petugas@dentalcare.local'],
            [
                'name' => 'Siti Nurhaliza (Petugas Klinik)',
                'password' => Hash::make('password'),
                'role' => 'receptionist',
                'role_name' => 'Petugas Resepsionis & Farmasi',
                'avatar_url' => 'https://images.unsplash.com/photo-1594824813576-03716d1cd41b?w=150&auto=format&fit=crop&q=80',
                'facility_id' => 'FAC-001',
                'department_id' => 'DEP-001',
                'doctor_id' => null,
                'employee_number' => 'STF-2022-005',
                'phone' => '081555667788',
                'is_active' => true,
                'email_verified_at' => now(),
            ]
        );
    }

    private function seedHospitalProfile(): void
    {
        HospitalProfile::updateOrCreate(
            ['id' => 'HOSP-001'],
            [
                'name' => 'Klinik Gigi Pratama Dental Care',
                'code' => 'KDC-01',
                'type' => 'Klinik Gigi Mandiri',
                'accreditation' => 'Paripurna',
                'license_number' => '503/012/KLINIK/DPMPTSP/2024',
                'tax_id' => '09.876.543.2-012.000',
                'phone' => '021-8291029 / 0812-9988-7766',
                'email' => 'info@dentalcarepratama.id',
                'website' => 'https://dentalcarepratama.id',
                'address' => 'Jl. Tebet Raya No. 45B, Tebet Barat',
                'city' => 'Jakarta Selatan',
                'province' => 'DKI Jakarta',
                'postal_code' => '12810',
                'director_name' => 'drg. Pratama Wijaya',
            ]
        );
    }

    private function seedDepartments(string $dataPath): void
    {
        $items = $this->loadJson($dataPath, 'departments.json');
        foreach ($items as $item) {
            Department::updateOrCreate(
                ['id' => $item['id']],
                [
                    'facility_id' => $item['facilityId'] ?? null,
                    'name' => $item['name'],
                    'code' => $item['code'] ?? null,
                    'description' => $item['description'] ?? null,
                    'head_doctor_id' => $item['headDoctorId'] ?? null,
                    'location' => $item['location'] ?? null,
                    'is_active' => $item['isActive'] ?? true,
                ]
            );
        }
    }

    private function seedDoctors(string $dataPath): void
    {
        $items = $this->loadJson($dataPath, 'doctors.json');
        foreach ($items as $item) {
            Doctor::updateOrCreate(
                ['id' => $item['id']],
                [
                    'facility_id' => $item['facilityId'] ?? null,
                    'employee_number' => $item['employeeNumber'] ?? null,
                    'name' => $item['name'],
                    'title' => $item['title'] ?? null,
                    'specialization' => $item['specialization'] ?? null,
                    'department_id' => $item['departmentId'] ?? null,
                    'department_name' => $item['departmentName'] ?? null,
                    'sip_number' => $item['sipNumber'] ?? null,
                    'phone' => $item['phone'] ?? null,
                    'email' => $item['email'] ?? null,
                    'avatar_url' => $item['avatarUrl'] ?? null,
                    'status' => $item['status'] ?? 'active',
                    'consultation_fee' => $item['consultationFee'] ?? 0,
                    'schedules' => $item['schedules'] ?? [],
                ]
            );
        }
    }

    private function seedPatients(string $dataPath): void
    {
        $items = $this->loadJson($dataPath, 'patients.json');
        foreach ($items as $item) {
            Patient::updateOrCreate(
                ['id' => $item['id']],
                [
                    'facility_id' => $item['facilityId'] ?? null,
                    'medical_record_number' => $item['medicalRecordNumber'],
                    'nik' => $item['nik'] ?? null,
                    'name' => $item['name'],
                    'gender' => $item['gender'] ?? 'male',
                    'birth_place' => $item['birthPlace'] ?? null,
                    'birth_date' => isset($item['birthDate']) ? substr($item['birthDate'], 0, 10) : null,
                    'blood_type' => $item['bloodType'] ?? null,
                    'marital_status' => $item['maritalStatus'] ?? null,
                    'religion' => $item['religion'] ?? null,
                    'occupation' => $item['occupation'] ?? null,
                    'phone' => $item['phone'] ?? null,
                    'email' => $item['email'] ?? null,
                    'address' => $item['address'] ?? null,
                    'emergency_contact' => $item['emergencyContact'] ?? null,
                    'insurance' => $item['insurance'] ?? null,
                    'allergies' => $item['allergies'] ?? [],
                    'chronic_diseases' => $item['chronicDiseases'] ?? [],
                    'status' => $item['status'] ?? 'active',
                    'last_visit_at' => $item['lastVisitAt'] ?? null,
                    'registered_at' => $item['registeredAt'] ?? null,
                ]
            );
        }
    }

    private function seedAppointments(string $dataPath): void
    {
        $items = $this->loadJson($dataPath, 'appointments.json');
        foreach ($items as $item) {
            Appointment::updateOrCreate(
                ['id' => $item['id']],
                [
                    'facility_id' => $item['facilityId'] ?? null,
                    'appointment_number' => $item['appointmentNumber'],
                    'patient_id' => $item['patientId'],
                    'patient_name' => $item['patientName'],
                    'patient_mrn' => $item['patientMrn'] ?? null,
                    'patient_phone' => $item['patientPhone'] ?? null,
                    'patient_gender' => $item['patientGender'] ?? null,
                    'patient_birth_date' => isset($item['patientBirthDate']) ? substr($item['patientBirthDate'], 0, 10) : null,
                    'patient_insurance_type' => $item['patientInsuranceType'] ?? null,
                    'doctor_id' => $item['doctorId'],
                    'doctor_name' => $item['doctorName'],
                    'doctor_specialization' => $item['doctorSpecialization'] ?? null,
                    'department_id' => $item['departmentId'] ?? null,
                    'department_name' => $item['departmentName'] ?? null,
                    'appointment_date' => $item['appointmentDate'],
                    'appointment_time' => $item['appointmentTime'],
                    'duration_minutes' => $item['durationMinutes'] ?? 30,
                    'visit_type' => $item['visitType'] ?? 'routine_checkup',
                    'complaint' => $item['complaint'] ?? null,
                    'status' => $item['status'] ?? 'in_queue',
                    'queue_number' => $item['queueNumber'] ?? null,
                    'notes' => $item['notes'] ?? null,
                ]
            );
        }
    }

    private function seedQueues(string $dataPath): void
    {
        $items = $this->loadJson($dataPath, 'queues.json');
        foreach ($items as $item) {
            QueueItem::updateOrCreate(
                ['id' => $item['id']],
                [
                    'facility_id' => $item['facilityId'] ?? null,
                    'queue_number' => $item['queueNumber'],
                    'appointment_id' => $item['appointmentId'] ?? null,
                    'encounter_id' => $item['encounterId'] ?? null,
                    'patient_id' => $item['patientId'],
                    'patient_name' => $item['patientName'],
                    'patient_mrn' => $item['patientMrn'] ?? null,
                    'doctor_id' => $item['doctorId'],
                    'doctor_name' => $item['doctorName'],
                    'department_id' => $item['departmentId'] ?? null,
                    'department_name' => $item['departmentName'] ?? null,
                    'status' => $item['status'] ?? 'waiting',
                    'estimated_call_time' => $item['estimatedCallTime'] ?? null,
                    'called_at' => $item['calledAt'] ?? null,
                ]
            );
        }
    }

    private function seedEncounters(string $dataPath): void
    {
        $items = $this->loadJson($dataPath, 'encounters.json');
        foreach ($items as $item) {
            Encounter::updateOrCreate(
                ['id' => $item['id']],
                [
                    'facility_id' => $item['facilityId'] ?? null,
                    'encounter_number' => $item['encounterNumber'],
                    'patient_id' => $item['patientId'],
                    'patient_name' => $item['patientName'],
                    'patient_mrn' => $item['patientMrn'] ?? null,
                    'patient_gender' => $item['patientGender'] ?? null,
                    'patient_birth_date' => isset($item['patientBirthDate']) ? substr($item['patientBirthDate'], 0, 10) : null,
                    'patient_blood_type' => $item['patientBloodType'] ?? null,
                    'patient_allergies' => $item['patientAllergies'] ?? [],
                    'doctor_id' => $item['doctorId'],
                    'doctor_name' => $item['doctorName'],
                    'department_id' => $item['departmentId'] ?? null,
                    'department_name' => $item['departmentName'] ?? null,
                    'appointment_id' => $item['appointmentId'] ?? null,
                    'visit_date' => $item['visitDate'],
                    'visit_type' => $item['visitType'] ?? 'routine_checkup',
                    'status' => $item['status'] ?? 'in_examination',
                    'anamnesis' => $item['anamnesis'] ?? null,
                    'vital_signs' => $item['vitalSigns'] ?? null,
                    'physical_exam' => $item['physicalExam'] ?? null,
                    'odontogram' => $item['odontogram'] ?? null,
                    'diagnoses' => $item['diagnoses'] ?? [],
                    'procedures' => $item['procedures'] ?? [],
                    'follow_up_plan' => $item['followUpPlan'] ?? null,
                ]
            );
        }
    }

    private function seedMedicines(string $dataPath): void
    {
        $items = $this->loadJson($dataPath, 'medicines.json');
        foreach ($items as $index => $item) {
            $med = Medicine::updateOrCreate(
                ['code' => $item['code']],
                [
                    'id' => $item['id'],
                    'code' => $item['code'],
                    'generic_name' => $item['genericName'],
                    'brand_name' => $item['brandName'],
                    'dosage_form' => $item['dosageForm'],
                    'strength' => $item['strength'] ?? null,
                    'unit' => $item['unit'],
                    'manufacturer' => $item['manufacturer'] ?? null,
                    'category' => $item['category'],
                    'current_stock' => $item['currentStock'] ?? 0,
                    'minimum_stock' => $item['minimumStock'] ?? 0,
                    'purchase_price' => $item['purchasePrice'] ?? 0,
                    'selling_price' => $item['sellingPrice'] ?? 0,
                    'expiry_date' => $item['expiryDate'] ?? null,
                    'stock_status' => $item['stockStatus'] ?? 'in_stock',
                    'requires_prescription' => $item['requiresPrescription'] ?? true,
                ]
            );

            // Record initial stock mutation
            MedicineMutation::updateOrCreate(
                ['id' => 'MUT-INIT-' . str_pad((string)($index + 1), 3, '0', STR_PAD_LEFT)],
                [
                    'medicine_id' => $med->id,
                    'medicine_name' => $med->brand_name,
                    'type' => 'in',
                    'quantity' => $med->current_stock,
                    'stock_before' => 0,
                    'stock_after' => $med->current_stock,
                    'unit_price' => $med->purchase_price,
                    'total_price' => $med->current_stock * $med->purchase_price,
                    'reason' => 'purchase',
                    'reference_no' => 'INV-SUP-2026-' . str_pad((string)($index + 1), 3, '0', STR_PAD_LEFT),
                    'batch_number' => 'BATCH-' . strtoupper(Str::random(6)),
                    'expiry_date' => $med->expiry_date,
                    'notes' => 'Stok awal klinik dental care',
                    'operator_name' => 'Petugas Farmasi',
                ]
            );
        }
    }

    private function seedPrescriptions(string $dataPath): void
    {
        $items = $this->loadJson($dataPath, 'prescriptions.json');
        foreach ($items as $item) {
            Prescription::updateOrCreate(
                ['id' => $item['id']],
                [
                    'prescription_number' => $item['prescriptionNumber'],
                    'facility_id' => $item['facilityId'] ?? null,
                    'encounter_id' => $item['encounterId'] ?? null,
                    'patient_id' => $item['patientId'],
                    'patient_name' => $item['patientName'],
                    'patient_mrn' => $item['patientMrn'] ?? null,
                    'doctor_id' => $item['doctorId'],
                    'doctor_name' => $item['doctorName'],
                    'items' => $item['items'] ?? [],
                    'total_amount' => $item['totalAmount'] ?? 0,
                    'payment_status' => $item['paymentStatus'] ?? 'unpaid',
                    'status' => $item['status'] ?? 'submitted',
                    'notes' => $item['notes'] ?? null,
                    'dispensed_at' => $item['dispensedAt'] ?? null,
                    'dispensed_by' => $item['dispensedBy'] ?? null,
                ]
            );
        }
    }

    private function seedInvoicesAndFinances(string $dataPath): void
    {
        $items = $this->loadJson($dataPath, 'invoices.json');
        foreach ($items as $index => $item) {
            $invoice = Invoice::updateOrCreate(
                ['id' => $item['id']],
                [
                    'facility_id' => $item['facilityId'] ?? null,
                    'invoice_number' => $item['invoiceNumber'],
                    'encounter_id' => $item['encounterId'] ?? null,
                    'patient_id' => $item['patientId'],
                    'patient_name' => $item['patientName'],
                    'patient_mrn' => $item['patientMrn'] ?? null,
                    'patient_phone' => $item['patientPhone'] ?? null,
                    'insurance_type' => $item['insuranceType'] ?? 'umum',
                    'items' => $item['items'] ?? [],
                    'subtotal' => $item['subtotal'] ?? 0,
                    'discount' => $item['discount'] ?? 0,
                    'tax' => $item['tax'] ?? 0,
                    'total_amount' => $item['totalAmount'] ?? 0,
                    'covered_by_insurance' => $item['coveredByInsurance'] ?? 0,
                    'patient_paid_amount' => $item['patientPaidAmount'] ?? 0,
                    'outstanding_amount' => $item['outstandingAmount'] ?? 0,
                    'status' => $item['status'] ?? 'pending',
                    'payments' => $item['payments'] ?? [],
                    'paid_at' => $item['paidAt'] ?? ($item['status'] === 'paid' ? now() : null),
                ]
            );

            // If invoice is paid, create income finance transaction
            if ($invoice->patient_paid_amount > 0) {
                FinanceTransaction::updateOrCreate(
                    ['id' => 'FIN-REV-' . str_pad((string)($index + 1), 3, '0', STR_PAD_LEFT)],
                    [
                        'transaction_number' => 'TRX-IN-' . date('Ymd') . '-' . str_pad((string)($index + 1), 3, '0', STR_PAD_LEFT),
                        'type' => 'income',
                        'category' => 'patient_payment',
                        'amount' => $invoice->patient_paid_amount,
                        'payment_method' => 'cash',
                        'description' => 'Pembayaran tagihan pasien: ' . $invoice->patient_name . ' (' . $invoice->invoice_number . ')',
                        'reference_id' => $invoice->id,
                        'reference_type' => 'invoice',
                        'date' => date('Y-m-d'),
                        'operator_name' => 'Kasir Klinik',
                        'notes' => 'Tindakan gigi & obat',
                    ]
                );
            }
        }

        // Seed initial operational expenses
        FinanceTransaction::updateOrCreate(
            ['id' => 'FIN-EXP-001'],
            [
                'transaction_number' => 'TRX-OUT-' . date('Ymd') . '-001',
                'type' => 'expense',
                'category' => 'medicine_purchase',
                'amount' => 1250000,
                'payment_method' => 'transfer',
                'description' => 'Pembelian stok awal obat & anestesi dental dari PBF Kimia Farma',
                'reference_id' => 'INV-SUP-PBF-01',
                'reference_type' => 'stock_in',
                'date' => date('Y-m-d', strtotime('-3 days')),
                'operator_name' => 'Petugas Klinik',
                'notes' => 'Restock farmasi bulanan',
            ]
        );

        FinanceTransaction::updateOrCreate(
            ['id' => 'FIN-EXP-002'],
            [
                'transaction_number' => 'TRX-OUT-' . date('Ymd') . '-002',
                'type' => 'expense',
                'category' => 'operational',
                'amount' => 350000,
                'payment_method' => 'cash',
                'description' => 'Bahan habis pakai medis dental (masker, sarung tangan nitril, bib pasien)',
                'reference_id' => 'BHP-MED-01',
                'reference_type' => 'operational',
                'date' => date('Y-m-d', strtotime('-1 day')),
                'operator_name' => 'Petugas Klinik',
                'notes' => 'Perlengkapan APD dental unit',
            ]
        );
    }

    private function seedDentalMasterData(string $dataPath): void
    {
        $diagnoses = $this->loadJson($dataPath, 'diagnoses.json');
        foreach ($diagnoses as $d) {
            $existing = \App\Models\DentalDiagnosis::where('code', $d['code'])->first();
            if ($existing) {
                $existing->update([
                    'name' => $d['name'],
                    'category' => $d['category'] ?? 'Umum',
                    'description' => $d['description'] ?? $d['name'],
                    'is_active' => true,
                ]);
            } else {
                $id = $d['id'];
                if (\App\Models\DentalDiagnosis::where('id', $id)->exists()) {
                    $id = 'DIA-' . strtoupper(Str::random(5));
                }
                \App\Models\DentalDiagnosis::create([
                    'id' => $id,
                    'code' => $d['code'],
                    'name' => $d['name'],
                    'category' => $d['category'] ?? 'Umum',
                    'description' => $d['description'] ?? $d['name'],
                    'is_active' => true,
                ]);
            }
        }

        $procedures = $this->loadJson($dataPath, 'procedures.json');
        foreach ($procedures as $p) {
            $existing = \App\Models\DentalProcedure::where('code', $p['code'])->first();
            if ($existing) {
                $existing->update([
                    'name' => $p['name'],
                    'category' => $p['category'] ?? 'Umum',
                    'cost' => $p['price'] ?? 0,
                    'description' => $p['name'],
                    'is_active' => true,
                ]);
            } else {
                $id = $p['id'];
                if (\App\Models\DentalProcedure::where('id', $id)->exists()) {
                    $id = 'PROC-' . strtoupper(Str::random(5));
                }
                \App\Models\DentalProcedure::create([
                    'id' => $id,
                    'code' => $p['code'],
                    'name' => $p['name'],
                    'category' => $p['category'] ?? 'Umum',
                    'cost' => $p['price'] ?? 0,
                    'description' => $p['name'],
                    'is_active' => true,
                ]);
            }
        }
    }
}

