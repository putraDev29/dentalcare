<?php

namespace App\Models;

class Prescription extends BaseModel
{
    protected $table = 'prescriptions';

    protected $casts = [
        'items' => 'array',
        'total_amount' => 'float',
        'dispensed_at' => 'datetime',
    ];
}
