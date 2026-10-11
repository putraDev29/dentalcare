<?php

namespace App\Models;

class Department extends BaseModel
{
    protected $table = 'departments';

    protected $casts = [
        'is_active' => 'boolean',
    ];
}
