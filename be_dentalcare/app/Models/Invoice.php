<?php

namespace App\Models;

class Invoice extends BaseModel
{
    protected $table = 'invoices';

    protected $casts = [
        'items' => 'array',
        'payments' => 'array',
        'subtotal' => 'float',
        'discount' => 'float',
        'tax' => 'float',
        'total_amount' => 'float',
        'covered_by_insurance' => 'float',
        'patient_paid_amount' => 'float',
        'outstanding_amount' => 'float',
        'paid_at' => 'datetime',
    ];

    protected $appends = [
        'balanceAmount',
        'paidAmount',
        'dpAmount',
        'tenderedAmount',
        'changeAmount',
        'insuranceCoverage',
        'patientResponsibility',
        'transactions',
        'invoiceDate',
        'patientPhone',
        'emergencyContact',
    ];

    public function patient()
    {
        return $this->belongsTo(Patient::class, 'patient_id');
    }

    public function getBalanceAmountAttribute(): float
    {
        return (float) ($this->attributes['outstanding_amount'] ?? 0);
    }

    public function getPaidAmountAttribute(): float
    {
        return (float) ($this->attributes['patient_paid_amount'] ?? 0);
    }

    public function getTenderedAmountAttribute(): float
    {
        $payments = $this->transactions;
        if (!empty($payments)) {
            $latest = end($payments);
            if (isset($latest['tenderedAmount'])) {
                return (float) $latest['tenderedAmount'];
            }
        }
        return (float) ($this->attributes['patient_paid_amount'] ?? 0);
    }

    public function getChangeAmountAttribute(): float
    {
        $payments = $this->transactions;
        if (!empty($payments)) {
            $latest = end($payments);
            if (isset($latest['changeAmount'])) {
                return (float) $latest['changeAmount'];
            }
        }
        return 0;
    }

    public function getDpAmountAttribute(): float
    {
        $payments = $this->transactions;
        $dp = 0;
        foreach ($payments as $p) {
            if (($p['type'] ?? '') === 'dp') {
                $dp += (float) ($p['amount'] ?? 0);
            }
        }
        if ($dp === 0 && (float) ($this->attributes['patient_paid_amount'] ?? 0) > 0 && (float) ($this->attributes['outstanding_amount'] ?? 0) > 0) {
            $dp = (float) ($this->attributes['patient_paid_amount'] ?? 0);
        }
        return $dp;
    }

    public function getInsuranceCoverageAttribute(): float
    {
        return (float) ($this->attributes['covered_by_insurance'] ?? 0);
    }

    public function getPatientResponsibilityAttribute(): float
    {
        $total = (float) ($this->attributes['total_amount'] ?? 0);
        $insurance = (float) ($this->attributes['covered_by_insurance'] ?? 0);
        return max(0, $total - $insurance);
    }

    public function getTransactionsAttribute(): array
    {
        $payments = $this->attributes['payments'] ?? null;
        if (is_string($payments)) {
            $decoded = json_decode($payments, true);
            return is_array($decoded) ? $decoded : [];
        }
        return is_array($payments) ? $payments : [];
    }

    public function getInvoiceDateAttribute(): string
    {
        if (!empty($this->attributes['created_at'])) {
            return substr($this->attributes['created_at'], 0, 10);
        }
        return date('Y-m-d');
    }

    public function getPatientPhoneAttribute(): ?string
    {
        if (!empty($this->attributes['patient_phone'])) {
            return $this->attributes['patient_phone'];
        }
        $p = $this->relationLoaded('patient') ? $this->patient : Patient::find($this->patient_id);
        return $p ? $p->phone : null;
    }

    public function getEmergencyContactAttribute(): ?array
    {
        $p = $this->relationLoaded('patient') ? $this->patient : Patient::find($this->patient_id);
        return $p ? $p->emergency_contact : null;
    }
}

