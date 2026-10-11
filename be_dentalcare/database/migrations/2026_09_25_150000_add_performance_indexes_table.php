<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('patients', function (Blueprint $table) {
            $table->index('nik', 'idx_patients_nik');
            $table->index('name', 'idx_patients_name');
            $table->index('created_at', 'idx_patients_created_at');
        });

        Schema::table('queue_items', function (Blueprint $table) {
            $table->index(['status', 'created_at'], 'idx_queues_status_created');
            $table->index('patient_id', 'idx_queues_patient_id');
        });

        Schema::table('appointments', function (Blueprint $table) {
            $table->index(['appointment_date', 'status'], 'idx_appointments_date_status');
            $table->index('patient_id', 'idx_appointments_patient_id');
        });

        Schema::table('encounters', function (Blueprint $table) {
            $table->index('patient_id', 'idx_encounters_patient_id');
            $table->index('visit_date', 'idx_encounters_visit_date');
        });

        Schema::table('invoices', function (Blueprint $table) {
            $table->index('patient_id', 'idx_invoices_patient_id');
            $table->index('status', 'idx_invoices_status');
        });

        Schema::table('finance_transactions', function (Blueprint $table) {
            $table->index(['type', 'date'], 'idx_finance_type_date');
        });
    }

    public function down(): void
    {
        Schema::table('patients', function (Blueprint $table) {
            $table->dropIndex('idx_patients_nik');
            $table->dropIndex('idx_patients_name');
            $table->dropIndex('idx_patients_created_at');
        });

        Schema::table('queue_items', function (Blueprint $table) {
            $table->dropIndex('idx_queues_status_created');
            $table->dropIndex('idx_queues_patient_id');
        });

        Schema::table('appointments', function (Blueprint $table) {
            $table->dropIndex('idx_appointments_date_status');
            $table->dropIndex('idx_appointments_patient_id');
        });

        Schema::table('encounters', function (Blueprint $table) {
            $table->dropIndex('idx_encounters_patient_id');
            $table->dropIndex('idx_encounters_visit_date');
        });

        Schema::table('invoices', function (Blueprint $table) {
            $table->dropIndex('idx_invoices_patient_id');
            $table->dropIndex('idx_invoices_status');
        });

        Schema::table('finance_transactions', function (Blueprint $table) {
            $table->dropIndex('idx_finance_type_date');
        });
    }
};
