<?php

namespace App\Models;

class Patient extends BaseModel
{
    protected $table = 'patients';

    protected $casts = [
        'address' => 'array',
        'emergency_contact' => 'array',
        'insurance' => 'array',
        'allergies' => 'array',
        'chronic_diseases' => 'array',
        'birth_date' => 'date:Y-m-d',
        'last_visit_at' => 'datetime',
        'registered_at' => 'datetime',
    ];
}
