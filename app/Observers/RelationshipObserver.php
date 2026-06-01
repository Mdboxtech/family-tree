<?php

namespace App\Observers;

use App\Models\Relationship;
use Illuminate\Support\Facades\Cache;

class RelationshipObserver
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
     * Handle the Relationship "created" event.
     */
    public function created(Relationship $relationship): void
    {
        $this->clearCache();
    }

    /**
     * Handle the Relationship "updated" event.
     */
    public function updated(Relationship $relationship): void
    {
        $this->clearCache();
    }

    /**
     * Handle the Relationship "deleted" event.
     */
    public function deleted(Relationship $relationship): void
    {
        $this->clearCache();
    }

    /**
     * Handle the Relationship "restored" event.
     */
    public function restored(Relationship $relationship): void
    {
        $this->clearCache();
    }

    /**
     * Handle the Relationship "force deleted" event.
     */
    public function forceDeleted(Relationship $relationship): void
    {
        $this->clearCache();
    }
}
