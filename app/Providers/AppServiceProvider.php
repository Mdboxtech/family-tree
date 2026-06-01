<?php

namespace App\Providers;

use App\Models\FamilyMember;
use App\Models\Relationship;
use App\Observers\FamilyMemberObserver;
use App\Observers\RelationshipObserver;
use Illuminate\Support\Facades\Vite;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Vite::prefetch(concurrency: 3);
        FamilyMember::observe(FamilyMemberObserver::class);
        Relationship::observe(RelationshipObserver::class);
    }
}
