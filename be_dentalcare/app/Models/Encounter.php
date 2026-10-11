<?php

namespace App\Models;

class Encounter extends BaseModel
{
    protected $table = 'encounters';

    protected $casts = [
        'visit_date' => 'date:Y-m-d',
        'patient_birth_date' => 'date:Y-m-d',
        'patient_allergies' => 'array',
        'anamnesis' => 'array',
        'vital_signs' => 'array',
        'physical_exam' => 'array',
        'odontogram' => 'array',
        'diagnoses' => 'array',
        'procedures' => 'array',
        'follow_up_plan' => 'array',
    ];

    protected $appends = [
        'prescriptions',
        'dentalNotes',
        'nextControlDate',
    ];

    public function getPrescriptionsAttribute()
    {
        return $this->follow_up_plan['prescriptions'] ?? [];
    }

    public function getDentalNotesAttribute()
    {
        return $this->follow_up_plan['dentalNotes'] ?? null;
    }

    public function getNextControlDateAttribute()
    {
        return $this->follow_up_plan['nextControlDate'] ?? null;
    }
}
