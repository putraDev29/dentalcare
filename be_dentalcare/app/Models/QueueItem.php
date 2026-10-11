<?php

namespace App\Models;

class QueueItem extends BaseModel
{
    protected $table = 'queue_items';

    protected $casts = [
        'called_at' => 'datetime',
    ];
}
