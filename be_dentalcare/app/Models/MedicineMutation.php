<?php

namespace App\Models;

class MedicineMutation extends BaseModel
{
    protected $table = 'medicine_mutations';

    protected $casts = [
        'quantity' => 'integer',
        'stock_before' => 'integer',
        'stock_after' => 'integer',
        'unit_price' => 'float',
        'total_price' => 'float',
        'expiry_date' => 'date:Y-m-d',
    ];
}
