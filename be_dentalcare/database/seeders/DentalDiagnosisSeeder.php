<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\DentalDiagnosis;

class DentalDiagnosisSeeder extends Seeder
{
    public function run(): void
    {
        $filePath = database_path('data/diagnoses.json');
        if (!file_exists($filePath)) {
            $filePath = base_path('../fe_dentalcare/src/data/diagnoses.json');
        }
        if (!file_exists($filePath)) {
            $this->command->error("File diagnoses.json tidak ditemukan di database/data maupun di fe_dentalcare/src/data");
            return;
        }

        $items = json_decode(file_get_contents($filePath), true) ?: [];
        $this->command->info("Memulai sinkronisasi " . count($items) . " ICD-10 gigi...");

        $count = 0;
        foreach ($items as $d) {
            $existing = DentalDiagnosis::where('code', $d['code'])->first();
            if ($existing) {
                $existing->update([
                    'name' => $d['name'],
                    'category' => $d['category'] ?? 'Umum',
                    'description' => $d['description'] ?? $d['name'],
                    'is_active' => true,
                ]);
            } else {
                $id = $d['id'];
                if (DentalDiagnosis::where('id', $id)->exists()) {
                    $id = 'DIA-' . strtoupper(\Illuminate\Support\Str::random(5));
                }
                DentalDiagnosis::create([
                    'id' => $id,
                    'code' => $d['code'],
                    'name' => $d['name'],
                    'category' => $d['category'] ?? 'Umum',
                    'description' => $d['description'] ?? $d['name'],
                    'is_active' => true,
                ]);
            }
            $count++;
        }

        $total = DentalDiagnosis::count();
        $this->command->info("Berhasil menyinkronkan {$count} ICD-10 gigi. Total di database sekarang: {$total}");
    }
}
