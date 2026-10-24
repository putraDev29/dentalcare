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
        'next_control_date' => 'date:Y-m-d',
        'last_visit_at' => 'datetime',
        'registered_at' => 'datetime',
    ];

    protected $appends = [
        'nextControlDate',
        'controlDoctor',
        'controlNotes',
    ];

    public function getNextControlDateAttribute()
    {
        return $this->attributes['next_control_date'] ?? null;
    }

    public function getControlDoctorAttribute()
    {
        return $this->attributes['control_doctor'] ?? 'drg. Pratama Wijaya';
    }

    public function getControlNotesAttribute()
    {
        return $this->attributes['control_notes'] ?? null;
    }
}
