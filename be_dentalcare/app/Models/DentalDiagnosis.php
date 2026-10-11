<?php

namespace App\Models;

class DentalDiagnosis extends BaseModel
{
    protected $table = 'dental_diagnoses';

    protected $casts = [
        'is_active' => 'boolean',
    ];
}
