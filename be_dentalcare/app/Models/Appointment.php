<?php

namespace App\Models;

class Appointment extends BaseModel
{
    protected $table = 'appointments';

    protected $casts = [
        'appointment_date' => 'date:Y-m-d',
        'duration_minutes' => 'integer',
        'patient_birth_date' => 'date:Y-m-d',
    ];
}
