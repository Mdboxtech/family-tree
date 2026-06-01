<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreRelationshipRequest;
use App\Models\Relationship;
use App\Services\FamilyTreeService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Cache;

class RelationshipController extends Controller
{
    public function __construct(
        private readonly FamilyTreeService $treeService
    ) {}

    /**
     * Create a relationship (+ inverse).
     */
    public function store(StoreRelationshipRequest $request): RedirectResponse
    {
        $data = $request->validated();

        $this->treeService->createRelationship(
            $data['person_id'],
            $data['relative_id'],
            $data['type'],
            [
                'marriage_date' => $data['marriage_date'] ?? null,
                'divorce_date' => $data['divorce_date'] ?? null,
                'is_biological' => $data['is_biological'] ?? true,
            ]
        );

        Cache::forget('family_tree_data');
        Cache::forget('family_tree_hierarchy');

        return redirect()->back()->with('success', 'Relationship created successfully.');
    }

    /**
     * Delete a relationship (+ inverse).
     */
    public function destroy(Relationship $relationship): RedirectResponse
    {
        $this->treeService->deleteRelationship($relationship);
        Cache::forget('family_tree_data');
        Cache::forget('family_tree_hierarchy');

        return redirect()->back()->with('success', 'Relationship removed successfully.');
    }
}
