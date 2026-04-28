<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Vm extends Model
{
    protected $fillable = [
        'name',
        'cores',
        'ram',
        'disk',
        'os',
        'status',
        'user_id',
    ];

    protected $casts = [
        'cores' => 'integer',
        'ram'   => 'integer',
        'disk'  => 'integer',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
