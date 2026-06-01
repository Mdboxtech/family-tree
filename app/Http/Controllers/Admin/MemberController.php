<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreMemberRequest;
use App\Http\Requests\UpdateMemberRequest;
use App\Models\FamilyMember;
use App\Services\FamilyTreeService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Inertia\Inertia;
use Inertia\Response;

class MemberController extends Controller
{
    public function __construct(
        private readonly FamilyTreeService $treeService
    ) {}

    /**
     * List all members with pagination.
     */
    public function index(Request $request): Response
    {
        $query = FamilyMember::query();

        if ($search = $request->input('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('first_name', 'like', "%{$search}%")
                  ->orWhere('last_name', 'like', "%{$search}%")
                  ->orWhere('maiden_name', 'like', "%{$search}%");
            });
        }

        $members = $query->orderBy('first_name')
            ->paginate(20)
            ->withQueryString()
            ->through(function ($member) {
                return [
                    'id' => $member->id,
                    'first_name' => $member->first_name,
                    'last_name' => $member->last_name,
                    'full_name' => $member->full_name,
                    'gender' => $member->gender,
                    'age' => $member->age,
                    'photo_url' => $member->photo_url,
                    'is_root' => $member->is_root,
                    'date_of_birth' => $member->date_of_birth?->format('Y-m-d'),
                    'date_of_death' => $member->date_of_death?->format('Y-m-d'),
                    'relationships_count' => $member->relationshipsAsSource()->count(),
                ];
            });

        return Inertia::render('Admin/Members/Index', [
            'members' => $members,
            'filters' => ['search' => $search],
        ]);
    }

    /**
     * Show create member form.
     */
    public function create(): Response
    {
        return Inertia::render('Admin/Members/Create');
    }

    /**
     * Store a new member.
     */
    public function store(StoreMemberRequest $request): RedirectResponse
    {
        $data = $request->validated();
        $photo = $request->file('photo');
        unset($data['photo']);

        $this->treeService->createMember($data, $photo);
        Cache::forget('family_tree_data');
        Cache::forget('family_tree_hierarchy');

        return redirect()->route('admin.members.index')
            ->with('success', 'Family member created successfully.');
    }

    /**
     * Show edit member form.
     */
    public function edit(FamilyMember $member): Response
    {
        $member->load(['parents', 'children', 'spouses', 'siblings']);

        // Get all members for the relationship manager dropdown
        $allMembers = FamilyMember::where('id', '!=', $member->id)
            ->orderBy('first_name')
            ->get(['id', 'first_name', 'last_name', 'gender', 'photo_path'])
            ->map(fn ($m) => [
                'id' => $m->id,
                'full_name' => $m->full_name,
                'gender' => $m->gender,
                'photo_url' => $m->photo_url,
            ]);

        // Get relationships with their IDs for deletion
        $relationships = $member->relationshipsAsSource()
            ->with('relative:id,first_name,last_name,gender,photo_path')
            ->get()
            ->map(fn ($r) => [
                'id' => $r->id,
                'relative_id' => $r->relative_id,
                'relative_name' => $r->relative?->full_name,
                'relative_gender' => $r->relative?->gender,
                'relative_photo_url' => $r->relative?->photo_url,
                'type' => $r->type,
                'marriage_date' => $r->marriage_date?->format('Y-m-d'),
                'divorce_date' => $r->divorce_date?->format('Y-m-d'),
                'is_biological' => $r->is_biological,
            ]);

        return Inertia::render('Admin/Members/Edit', [
            'member' => $member,
            'allMembers' => $allMembers,
            'relationships' => $relationships,
        ]);
    }

    /**
     * Update a member.
     */
    public function update(UpdateMemberRequest $request, FamilyMember $member): RedirectResponse
    {
        $data = $request->validated();
        $photo = $request->file('photo');
        unset($data['photo']);

        $this->treeService->updateMember($member, $data, $photo);
        Cache::forget('family_tree_data');
        Cache::forget('family_tree_hierarchy');

        return redirect()->route('admin.members.edit', $member->id)
            ->with('success', 'Family member updated successfully.');
    }

    /**
     * Delete a member.
     */
    public function destroy(FamilyMember $member): RedirectResponse
    {
        $this->treeService->deleteMember($member);
        Cache::forget('family_tree_data');
        Cache::forget('family_tree_hierarchy');

        return redirect()->route('admin.members.index')
            ->with('success', 'Family member deleted successfully.');
    }
}
