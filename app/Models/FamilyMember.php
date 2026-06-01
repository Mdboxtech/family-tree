<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Support\Facades\Storage;

class FamilyMember extends Model
{
    protected $fillable = [
        'first_name', 'last_name', 'maiden_name', 'gender',
        'date_of_birth', 'date_of_death', 'birth_place',
        'biography', 'photo_path', 'is_root',
        'email', 'phone', 'address', 'occupation',
    ];

    protected $casts = [
        'date_of_birth' => 'date',
        'date_of_death' => 'date',
        'is_root' => 'boolean',
    ];

    protected $appends = ['full_name', 'age', 'photo_url'];

    /**
     * Computed full name.
     */
    public function getFullNameAttribute(): string
    {
        return "{$this->first_name} {$this->last_name}";
    }

    /**
     * Computed age (or age at death).
     */
    public function getAgeAttribute(): ?int
    {
        if (!$this->date_of_birth) return null;
        $end = $this->date_of_death ?? now();
        return $this->date_of_birth->diffInYears($end);
    }

    /**
     * Photo URL accessor.
     */
    public function getPhotoUrlAttribute(): ?string
    {
        return $this->photo_path ? Storage::url($this->photo_path) : null;
    }

    /**
     * All relationships where this person is the source.
     */
    public function relationshipsAsSource(): HasMany
    {
        return $this->hasMany(Relationship::class, 'person_id');
    }

    /**
     * All relationships where this person is the relative.
     */
    public function relationshipsAsRelative(): HasMany
    {
        return $this->hasMany(Relationship::class, 'relative_id');
    }

    /**
     * Parents of this person.
     */
    public function parents(): BelongsToMany
    {
        return $this->belongsToMany(
            FamilyMember::class, 'relationships', 'person_id', 'relative_id'
        )->wherePivot('type', 'parent')
         ->withPivot('is_biological')
         ->withTimestamps();
    }

    /**
     * Children of this person.
     */
    public function children(): BelongsToMany
    {
        return $this->belongsToMany(
            FamilyMember::class, 'relationships', 'person_id', 'relative_id'
        )->wherePivot('type', 'child')
         ->withPivot('is_biological')
         ->withTimestamps();
    }

    /**
     * Spouses of this person.
     */
    public function spouses(): BelongsToMany
    {
        return $this->belongsToMany(
            FamilyMember::class, 'relationships', 'person_id', 'relative_id'
        )->wherePivot('type', 'spouse')
         ->withPivot('marriage_date', 'divorce_date', 'is_biological')
         ->withTimestamps();
    }

    /**
     * Siblings of this person.
     */
    public function siblings(): BelongsToMany
    {
        return $this->belongsToMany(
            FamilyMember::class, 'relationships', 'person_id', 'relative_id'
        )->wherePivot('type', 'sibling')
         ->withPivot('is_biological')
         ->withTimestamps();
    }
}
