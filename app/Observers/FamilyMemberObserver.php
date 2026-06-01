<?php

namespace App\Observers;

use App\Models\FamilyMember;
use Illuminate\Support\Facades\Cache;

class FamilyMemberObserver
{
    /**
     * Clear the cache when any modification occurs.
     */
    private function clearCache(): void
    {
        Cache::forget('family_tree_data');
        Cache::forget('family_tree_hierarchy');
    }

    /**
     * Handle the FamilyMember "created" event.
     */
    public function created(FamilyMember $familyMember): void
    {
        $this->clearCache();
    }

    /**
     * Handle the FamilyMember "updated" event.
     */
    public function updated(FamilyMember $familyMember): void
    {
        $this->clearCache();
    }

    /**
     * Handle the FamilyMember "deleted" event.
     */
    public function deleted(FamilyMember $familyMember): void
    {
        $this->clearCache();
    }

    /**
     * Handle the FamilyMember "restored" event.
     */
    public function restored(FamilyMember $familyMember): void
    {
        $this->clearCache();
    }

    /**
     * Handle the FamilyMember "force deleted" event.
     */
    public function forceDeleted(FamilyMember $familyMember): void
    {
        $this->clearCache();
    }
}
