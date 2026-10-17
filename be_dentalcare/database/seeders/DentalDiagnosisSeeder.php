<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\DentalDiagnosis;

class DentalDiagnosisSeeder extends Seeder
{
    public function run(): void
    {
        $filePath = base_path('../fe_dentalcare/src/data/diagnoses.json');
        if (!file_exists($filePath)) {
            $this->command->error("File diagnoses.json tidak ditemukan di: {$filePath}");
            return;
        }

        $items = json_decode(file_get_contents($filePath), true) ?: [];
        $this->command->info("Memulai sinkronisasi " . count($items) . " ICD-10 gigi...");

        $count = 0;
        foreach ($items as $d) {
            DentalDiagnosis::updateOrCreate(
                ['code' => $d['code']],
                [
                    'id' => $d['id'],
                    'name' => $d['name'],
                    'category' => $d['category'] ?? 'Umum',
                    'description' => $d['description'] ?? $d['name'],
                    'is_active' => true,
                ]
            );
            $count++;
        }

        $total = DentalDiagnosis::count();
        $this->command->info("Berhasil menyinkronkan {$count} ICD-10 gigi. Total di database sekarang: {$total}");
    }
}
