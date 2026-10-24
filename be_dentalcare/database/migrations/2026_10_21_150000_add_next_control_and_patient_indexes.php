<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('patients', function (Blueprint $table) {
            if (!Schema::hasColumn('patients', 'next_control_date')) {
                $table->date('next_control_date')->nullable()->after('status');
                $table->index('next_control_date', 'idx_patients_next_control_date');
            }
            if (!Schema::hasColumn('patients', 'control_doctor')) {
                $table->string('control_doctor')->nullable()->after('next_control_date');
            }
            if (!Schema::hasColumn('patients', 'control_notes')) {
                $table->text('control_notes')->nullable()->after('control_doctor');
            }
            $table->index('phone', 'idx_patients_phone');
            $table->index('status', 'idx_patients_status');
        });
    }

    public function down(): void
    {
        Schema::table('patients', function (Blueprint $table) {
            if (Schema::hasColumn('patients', 'next_control_date')) {
                $table->dropIndex('idx_patients_next_control_date');
                $table->dropColumn('next_control_date');
            }
            if (Schema::hasColumn('patients', 'control_doctor')) {
                $table->dropColumn('control_doctor');
            }
            if (Schema::hasColumn('patients', 'control_notes')) {
                $table->dropColumn('control_notes');
            }
            $table->dropIndex('idx_patients_phone');
            $table->dropIndex('idx_patients_status');
        });
    }
};
