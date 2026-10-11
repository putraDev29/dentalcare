<?php

namespace App\Models;

class DentalInsurance extends BaseModel
{
    protected $table = 'dental_insurances';

    protected $casts = [
        'claim_count' => 'integer',
        'is_active' => 'boolean',
    ];
}
