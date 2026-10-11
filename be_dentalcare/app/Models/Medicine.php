<?php

namespace App\Models;

class Medicine extends BaseModel
{
    protected $table = 'medicines';

    protected $casts = [
        'current_stock' => 'integer',
        'minimum_stock' => 'integer',
        'purchase_price' => 'float',
        'selling_price' => 'float',
        'expiry_date' => 'date:Y-m-d',
        'requires_prescription' => 'boolean',
    ];
}
