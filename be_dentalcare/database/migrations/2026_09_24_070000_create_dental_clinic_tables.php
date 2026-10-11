<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // 1. Departments / Poliklinik
        Schema::create('departments', function (Blueprint $table) {
            $table->string('id')->primary();
            $table->string('facility_id')->nullable();
            $table->string('name');
            $table->string('code')->nullable();
            $table->text('description')->nullable();
            $table->string('head_doctor_id')->nullable();
            $table->string('location')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        // 2. Doctors / Dokter Gigi
        Schema::create('doctors', function (Blueprint $table) {
            $table->string('id')->primary();
            $table->string('facility_id')->nullable();
            $table->string('employee_number')->nullable();
            $table->string('name');
            $table->string('title')->nullable();
            $table->string('specialization')->nullable();
            $table->string('department_id')->nullable();
            $table->string('department_name')->nullable();
            $table->string('sip_number')->nullable();
            $table->string('phone')->nullable();
            $table->string('email')->nullable();
            $table->text('avatar_url')->nullable();
            $table->string('status')->default('active');
            $table->decimal('consultation_fee', 12, 2)->default(0);
            $table->json('schedules')->nullable();
            $table->timestamps();
        });

        // 3. Patients / Pasien
        Schema::create('patients', function (Blueprint $table) {
            $table->string('id')->primary();
            $table->string('facility_id')->nullable();
            $table->string('medical_record_number')->unique();
            $table->string('nik')->nullable();
            $table->string('name');
            $table->string('gender')->default('male');
            $table->string('birth_place')->nullable();
            $table->date('birth_date')->nullable();
            $table->string('blood_type')->nullable();
            $table->string('marital_status')->nullable();
            $table->string('religion')->nullable();
            $table->string('occupation')->nullable();
            $table->string('phone')->nullable();
            $table->string('email')->nullable();
            $table->json('address')->nullable();
            $table->json('emergency_contact')->nullable();
            $table->json('insurance')->nullable();
            $table->json('allergies')->nullable();
            $table->json('chronic_diseases')->nullable();
            $table->string('status')->default('active');
            $table->timestamp('last_visit_at')->nullable();
            $table->timestamp('registered_at')->nullable();
            $table->timestamps();
        });

        // 4. Appointments / Janji Temu
        Schema::create('appointments', function (Blueprint $table) {
            $table->string('id')->primary();
            $table->string('facility_id')->nullable();
            $table->string('appointment_number')->unique();
            $table->string('patient_id');
            $table->string('patient_name');
            $table->string('patient_mrn')->nullable();
            $table->string('patient_phone')->nullable();
            $table->string('patient_gender')->nullable();
            $table->date('patient_birth_date')->nullable();
            $table->string('patient_insurance_type')->nullable();
            $table->string('doctor_id');
            $table->string('doctor_name');
            $table->string('doctor_specialization')->nullable();
            $table->string('department_id')->nullable();
            $table->string('department_name')->nullable();
            $table->date('appointment_date');
            $table->string('appointment_time');
            $table->integer('duration_minutes')->default(30);
            $table->string('visit_type')->default('routine_checkup');
            $table->text('complaint')->nullable();
            $table->string('status')->default('in_queue');
            $table->string('queue_number')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();
        });

        // 5. Queue Items / Antrean Pelayanan
        Schema::create('queue_items', function (Blueprint $table) {
            $table->string('id')->primary();
            $table->string('facility_id')->nullable();
            $table->string('queue_number');
            $table->string('appointment_id')->nullable();
            $table->string('encounter_id')->nullable();
            $table->string('patient_id');
            $table->string('patient_name');
            $table->string('patient_mrn')->nullable();
            $table->string('doctor_id');
            $table->string('doctor_name');
            $table->string('department_id')->nullable();
            $table->string('department_name')->nullable();
            $table->string('status')->default('waiting');
            $table->string('estimated_call_time')->nullable();
            $table->timestamp('called_at')->nullable();
            $table->timestamps();
        });

        // 6. Encounters / Rekam Medis & Odontogram
        Schema::create('encounters', function (Blueprint $table) {
            $table->string('id')->primary();
            $table->string('facility_id')->nullable();
            $table->string('encounter_number')->unique();
            $table->string('patient_id');
            $table->string('patient_name');
            $table->string('patient_mrn')->nullable();
            $table->string('patient_gender')->nullable();
            $table->date('patient_birth_date')->nullable();
            $table->string('patient_blood_type')->nullable();
            $table->json('patient_allergies')->nullable();
            $table->string('doctor_id');
            $table->string('doctor_name');
            $table->string('department_id')->nullable();
            $table->string('department_name')->nullable();
            $table->string('appointment_id')->nullable();
            $table->date('visit_date');
            $table->string('visit_type')->default('routine_checkup');
            $table->string('status')->default('in_examination');
            $table->json('anamnesis')->nullable();
            $table->json('vital_signs')->nullable();
            $table->json('physical_exam')->nullable();
            $table->json('odontogram')->nullable();
            $table->json('diagnoses')->nullable();
            $table->json('procedures')->nullable();
            $table->json('follow_up_plan')->nullable();
            $table->timestamps();
        });

        // 7. Medicines / Master Obat Farmasi
        Schema::create('medicines', function (Blueprint $table) {
            $table->string('id')->primary();
            $table->string('code')->unique();
            $table->string('generic_name');
            $table->string('brand_name');
            $table->string('dosage_form');
            $table->string('strength')->nullable();
            $table->string('unit');
            $table->string('manufacturer')->nullable();
            $table->string('category');
            $table->integer('current_stock')->default(0);
            $table->integer('minimum_stock')->default(0);
            $table->decimal('purchase_price', 12, 2)->default(0);
            $table->decimal('selling_price', 12, 2)->default(0);
            $table->date('expiry_date')->nullable();
            $table->string('stock_status')->default('in_stock');
            $table->boolean('requires_prescription')->default(true);
            $table->timestamps();
        });

        // 8. Medicine Mutations / Mutasi Keluar & Masuk Obat
        Schema::create('medicine_mutations', function (Blueprint $table) {
            $table->string('id')->primary();
            $table->string('medicine_id');
            $table->string('medicine_name');
            $table->string('type'); // in, out
            $table->integer('quantity');
            $table->integer('stock_before');
            $table->integer('stock_after');
            $table->decimal('unit_price', 12, 2)->default(0);
            $table->decimal('total_price', 12, 2)->default(0);
            $table->string('reason'); // purchase, treatment, prescription, expired, damaged, adjustment
            $table->string('reference_no')->nullable();
            $table->string('batch_number')->nullable();
            $table->date('expiry_date')->nullable();
            $table->text('notes')->nullable();
            $table->string('operator_name')->nullable();
            $table->timestamps();
        });

        // 9. Prescriptions / Resep Obat
        Schema::create('prescriptions', function (Blueprint $table) {
            $table->string('id')->primary();
            $table->string('prescription_number')->unique();
            $table->string('facility_id')->nullable();
            $table->string('encounter_id')->nullable();
            $table->string('patient_id');
            $table->string('patient_name');
            $table->string('patient_mrn')->nullable();
            $table->string('doctor_id');
            $table->string('doctor_name');
            $table->json('items');
            $table->decimal('total_amount', 12, 2)->default(0);
            $table->string('payment_status')->default('unpaid');
            $table->string('status')->default('submitted');
            $table->text('notes')->nullable();
            $table->timestamp('dispensed_at')->nullable();
            $table->string('dispensed_by')->nullable();
            $table->timestamps();
        });

        // 10. Invoices / Tagihan & Kasir
        Schema::create('invoices', function (Blueprint $table) {
            $table->string('id')->primary();
            $table->string('facility_id')->nullable();
            $table->string('invoice_number')->unique();
            $table->string('encounter_id')->nullable();
            $table->string('patient_id');
            $table->string('patient_name');
            $table->string('patient_mrn')->nullable();
            $table->string('patient_phone')->nullable();
            $table->string('insurance_type')->default('umum');
            $table->json('items');
            $table->decimal('subtotal', 12, 2)->default(0);
            $table->decimal('discount', 12, 2)->default(0);
            $table->decimal('tax', 12, 2)->default(0);
            $table->decimal('total_amount', 12, 2)->default(0);
            $table->decimal('covered_by_insurance', 12, 2)->default(0);
            $table->decimal('patient_paid_amount', 12, 2)->default(0);
            $table->decimal('outstanding_amount', 12, 2)->default(0);
            $table->string('status')->default('pending');
            $table->json('payments')->nullable();
            $table->timestamp('paid_at')->nullable();
            $table->timestamps();
        });

        // 11. Finance Transactions / Buku Kas Keuangan
        Schema::create('finance_transactions', function (Blueprint $table) {
            $table->string('id')->primary();
            $table->string('transaction_number')->unique();
            $table->string('type'); // income, expense
            $table->string('category'); // patient_payment, medicine_purchase, operational, salary, equipment, other
            $table->decimal('amount', 12, 2);
            $table->string('payment_method')->default('cash');
            $table->text('description');
            $table->string('reference_id')->nullable();
            $table->string('reference_type')->nullable();
            $table->date('date');
            $table->string('operator_name')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();
        });

        // 12. Hospital Profile / Profil Klinik
        Schema::create('hospital_profiles', function (Blueprint $table) {
            $table->string('id')->primary();
            $table->string('name');
            $table->string('code')->nullable();
            $table->string('type')->nullable();
            $table->string('accreditation')->nullable();
            $table->string('license_number')->nullable();
            $table->string('tax_id')->nullable();
            $table->string('phone')->nullable();
            $table->string('email')->nullable();
            $table->string('website')->nullable();
            $table->text('address')->nullable();
            $table->string('city')->nullable();
            $table->string('province')->nullable();
            $table->string('postal_code')->nullable();
            $table->string('director_name')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('hospital_profiles');
        Schema::dropIfExists('finance_transactions');
        Schema::dropIfExists('invoices');
        Schema::dropIfExists('prescriptions');
        Schema::dropIfExists('medicine_mutations');
        Schema::dropIfExists('medicines');
        Schema::dropIfExists('encounters');
        Schema::dropIfExists('queue_items');
        Schema::dropIfExists('appointments');
        Schema::dropIfExists('patients');
        Schema::dropIfExists('doctors');
        Schema::dropIfExists('departments');
    }
};
