<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class BaseModel extends Model
{
    public $incrementing = false;
    protected $keyType = 'string';
    protected $guarded = [];

    public function toArray(): array
    {
        $array = parent::toArray();
        return $this->camelizeKeys($array);
    }

    protected function camelizeKeys(array $array): array
    {
        $result = [];
        foreach ($array as $key => $value) {
            $newKey = is_numeric($key) ? $key : Str::camel($key);
            if (is_array($value)) {
                $result[$newKey] = $this->camelizeKeys($value);
            } else {
                $result[$newKey] = $value;
            }
        }
        return $result;
    }
}
