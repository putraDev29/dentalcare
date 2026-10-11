<?php

namespace App\Models;

class DentalProcedure extends BaseModel
{
    protected $table = 'dental_procedures';

    protected $casts = [
        'cost' => 'float',
        'is_active' => 'boolean',
    ];
}
