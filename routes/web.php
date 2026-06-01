<?php

use App\Http\Controllers\FamilyTreeController;
use App\Http\Controllers\Admin\MemberController;
use App\Http\Controllers\Admin\RelationshipController;
use App\Http\Controllers\ProfileController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

// ─── Public Routes ────────────────────────────────────────────────
Route::get('/', [FamilyTreeController::class, 'index'])->name('home');
Route::get('/api/tree', [FamilyTreeController::class, 'treeData'])->name('api.tree');
Route::get('/api/tree/hierarchy', [FamilyTreeController::class, 'hierarchyData'])->name('api.tree.hierarchy');
Route::get('/api/member/{id}/relatives', [FamilyTreeController::class, 'memberRelatives'])->name('api.member.relatives');

// ─── Admin Routes (protected) ─────────────────────────────────────
Route::middleware(['auth'])->prefix('admin')->name('admin.')->group(function () {
    Route::get('/', function () {
        return redirect()->route('admin.dashboard');
    });

    Route::get('/dashboard', function () {
        $membersCount = \App\Models\FamilyMember::count();
        $relationshipsCount = \App\Models\Relationship::count();
        $rootMember = \App\Models\FamilyMember::where('is_root', true)->first();

        return Inertia::render('Admin/Dashboard', [
            'stats' => [
                'members_count' => $membersCount,
                'relationships_count' => $relationshipsCount,
                'root_member' => $rootMember ? $rootMember->full_name : null,
            ],
        ]);
    })->name('dashboard');

    Route::resource('members', MemberController::class);
    Route::post('relationships', [RelationshipController::class, 'store'])->name('relationships.store');
    Route::delete('relationships/{relationship}', [RelationshipController::class, 'destroy'])->name('relationships.destroy');

    Route::get('/settings', [\App\Http\Controllers\Admin\SettingsController::class, 'index'])->name('settings.index');
    Route::post('/settings', [\App\Http\Controllers\Admin\SettingsController::class, 'update'])->name('settings.update');
});

// ─── Profile Routes ───────────────────────────────────────────────
Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

// ─── Auth Routes (Breeze) ─────────────────────────────────────────
require __DIR__.'/auth.php';
