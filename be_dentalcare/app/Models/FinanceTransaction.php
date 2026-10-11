<?php

namespace App\Models;

class FinanceTransaction extends BaseModel
{
    protected $table = 'finance_transactions';

    protected $casts = [
        'amount' => 'float',
        'date' => 'date:Y-m-d',
    ];

    protected $appends = [
        'transactionNumber',
        'paymentMethod',
        'operatorName',
        'referenceType',
        'referenceId',
        'createdAt',
    ];

    public function getTransactionNumberAttribute(): ?string
    {
        return $this->attributes['transaction_number'] ?? null;
    }

    public function getPaymentMethodAttribute(): ?string
    {
        return $this->attributes['payment_method'] ?? 'cash';
    }

    public function getOperatorNameAttribute(): ?string
    {
        return $this->attributes['operator_name'] ?? null;
    }

    public function getReferenceTypeAttribute(): ?string
    {
        return $this->attributes['reference_type'] ?? null;
    }

    public function getReferenceIdAttribute(): ?string
    {
        return $this->attributes['reference_id'] ?? null;
    }

    public function getCreatedAtAttribute(): ?string
    {
        return isset($this->attributes['created_at']) ? (string) $this->attributes['created_at'] : null;
    }
}
