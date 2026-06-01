<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Relationship extends Model
{
    protected $fillable = [
        'person_id', 'relative_id', 'type',
        'marriage_date', 'divorce_date', 'is_biological',
    ];

    protected $casts = [
        'marriage_date' => 'date',
        'divorce_date' => 'date',
        'is_biological' => 'boolean',
    ];

    /**
     * The person this relationship belongs to.
     */
    public function person(): BelongsTo
    {
        return $this->belongsTo(FamilyMember::class, 'person_id');
    }

    /**
     * The related person in this relationship.
     */
    public function relative(): BelongsTo
    {
        return $this->belongsTo(FamilyMember::class, 'relative_id');
    }

    /**
     * Get the inverse relationship type.
     */
    public static function inverseType(string $type): string
    {
        return match ($type) {
            'parent' => 'child',
            'child' => 'parent',
            'spouse' => 'spouse',
            'sibling' => 'sibling',
            default => throw new \InvalidArgumentException("Invalid relationship type: {$type}"),
        };
    }
}
