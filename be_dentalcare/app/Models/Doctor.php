<?php

namespace App\Models;

class Doctor extends BaseModel
{
    protected $table = 'doctors';

    protected $casts = [
        'consultation_fee' => 'float',
        'schedules' => 'array',
    ];
}
