<?php

namespace App\Services;

use App\Models\FamilyMember;
use App\Models\Relationship;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Http\UploadedFile;

class FamilyTreeService
{
    /**
     * Get flat tree data optimised for D3 (all nodes + links).
     */
    public function getTreeData(): array
    {
        $members = FamilyMember::all();
        $relationships = Relationship::all();

        $nodes = $members->map(function (FamilyMember $member) {
            return [
                'id' => $member->id,
                'name' => $member->full_name,
                'first_name' => $member->first_name,
                'last_name' => $member->last_name,
                'gender' => $member->gender,
                'birth_year' => $member->date_of_birth?->year,
                'death_year' => $member->date_of_death?->year,
                'photo_url' => $member->photo_url,
                'is_root' => $member->is_root,
            ];
        })->values()->toArray();

        $links = $relationships->map(function (Relationship $rel) {
            return [
                'source' => $rel->person_id,
                'target' => $rel->relative_id,
                'type' => $rel->type,
            ];
        })->values()->toArray();

        return [
            'nodes' => $nodes,
            'links' => $links,
        ];
    }

    /**
     * Get a member with their direct relatives only (one degree of separation).
     */
    public function getMemberWithRelatives(int $id): array
    {
        $member = FamilyMember::findOrFail($id);

        $parents = $member->parents()->get()->map(fn ($m) => $this->formatMemberForPanel($m));
        $children = $member->children()->get()->map(fn ($m) => $this->formatMemberForPanel($m));
        $siblings = $member->siblings()->get()->map(fn ($m) => $this->formatMemberForPanel($m));
        $spouses = $member->spouses()->get()->map(function ($m) {
            $data = $this->formatMemberForPanel($m);
            $data['marriage_date'] = $m->pivot->marriage_date;
            $data['divorce_date'] = $m->pivot->divorce_date;
            return $data;
        });

        return [
            'member' => $member->toArray(),
            'parents' => $parents->values()->toArray(),
            'spouses' => $spouses->values()->toArray(),
            'children' => $children->values()->toArray(),
            'siblings' => $siblings->values()->toArray(),
        ];
    }

    /**
     * Create a new family member.
     */
    public function createMember(array $data, ?UploadedFile $photo = null): FamilyMember
    {
        if ($photo) {
            $data['photo_path'] = $photo->store('family-photos', 'public');
        }

        // If this member is being set as root, unset all others
        if (!empty($data['is_root']) && $data['is_root']) {
            FamilyMember::where('is_root', true)->update(['is_root' => false]);
        }

        return FamilyMember::create($data);
    }

    /**
     * Update an existing family member.
     */
    public function updateMember(FamilyMember $member, array $data, ?UploadedFile $photo = null): FamilyMember
    {
        if ($photo) {
            // Delete old photo
            if ($member->photo_path) {
                Storage::disk('public')->delete($member->photo_path);
            }
            $data['photo_path'] = $photo->store('family-photos', 'public');
        }

        // If this member is being set as root, unset all others
        if (!empty($data['is_root']) && $data['is_root']) {
            FamilyMember::where('is_root', true)->where('id', '!=', $member->id)->update(['is_root' => false]);
        }

        $member->update($data);
        return $member->fresh();
    }

    /**
     * Delete a family member and their photo.
     */
    public function deleteMember(FamilyMember $member): void
    {
        if ($member->photo_path) {
            Storage::disk('public')->delete($member->photo_path);
        }
        $member->delete();
    }

    /**
     * Create a relationship and its inverse in a single transaction.
     */
    public function createRelationship(int $personId, int $relativeId, string $type, array $extra = []): void
    {
        DB::transaction(function () use ($personId, $relativeId, $type, $extra) {
            // Create the forward relationship
            Relationship::firstOrCreate(
                [
                    'person_id' => $personId,
                    'relative_id' => $relativeId,
                    'type' => $type,
                ],
                array_merge([
                    'marriage_date' => $extra['marriage_date'] ?? null,
                    'divorce_date' => $extra['divorce_date'] ?? null,
                    'is_biological' => $extra['is_biological'] ?? true,
                ])
            );

            // Create the inverse relationship
            $inverseType = Relationship::inverseType($type);
            Relationship::firstOrCreate(
                [
                    'person_id' => $relativeId,
                    'relative_id' => $personId,
                    'type' => $inverseType,
                ],
                array_merge([
                    'marriage_date' => $extra['marriage_date'] ?? null,
                    'divorce_date' => $extra['divorce_date'] ?? null,
                    'is_biological' => $extra['is_biological'] ?? true,
                ])
            );
        });
    }

    /**
     * Delete a relationship and its inverse.
     */
    public function deleteRelationship(Relationship $relationship): void
    {
        DB::transaction(function () use ($relationship) {
            $inverseType = Relationship::inverseType($relationship->type);

            // Delete inverse
            Relationship::where('person_id', $relationship->relative_id)
                ->where('relative_id', $relationship->person_id)
                ->where('type', $inverseType)
                ->delete();

            // Delete forward
            $relationship->delete();
        });
    }

    /**
     * Build a recursive hierarchy tree for D3 tree layout, starting from root.
     */
    public function buildHierarchyTree(?int $rootId = null): array
    {
        // If no rootId, find the root member
        if ($rootId === null) {
            $root = FamilyMember::where('is_root', true)->first();
            if (!$root) {
                // Fallback: oldest member
                $root = FamilyMember::whereNotNull('date_of_birth')
                    ->orderBy('date_of_birth')
                    ->first();
            }
            if (!$root) {
                $root = FamilyMember::first();
            }
            if (!$root) {
                return [];
            }
            $rootId = $root->id;
        }

        $visited = [];
        return $this->buildNode($rootId, $visited);
    }

    /**
     * Recursively build a node and its children for the hierarchy.
     */
    private function buildNode(int $id, array &$visited): array
    {
        if (in_array($id, $visited)) {
            return []; // Prevent circular references
        }
        $visited[] = $id;

        $member = FamilyMember::find($id);
        if (!$member) {
            return [];
        }

        $children = $member->children()->get();
        $spouses = $member->spouses()->get();

        $childNodes = [];
        foreach ($children as $child) {
            $node = $this->buildNode($child->id, $visited);
            if (!empty($node)) {
                $childNodes[] = $node;
            }
        }

        return [
            'id' => $member->id,
            'name' => $member->full_name,
            'first_name' => $member->first_name,
            'last_name' => $member->last_name,
            'gender' => $member->gender,
            'birth_year' => $member->date_of_birth?->year,
            'death_year' => $member->date_of_death?->year,
            'photo_url' => $member->photo_url,
            'is_root' => $member->is_root,
            'spouses' => $spouses->map(fn ($s) => [
                'id' => $s->id,
                'name' => $s->full_name,
                'gender' => $s->gender,
                'photo_url' => $s->photo_url,
                'birth_year' => $s->date_of_birth?->year,
                'death_year' => $s->date_of_death?->year,
                'marriage_date' => $s->pivot->marriage_date,
                'has_children' => $s->children()->count() > 0,
            ])->values()->toArray(),
            'children' => $childNodes,
        ];
    }

    private function formatMemberForPanel(FamilyMember $member): array
    {
        return [
            'id' => $member->id,
            'first_name' => $member->first_name,
            'last_name' => $member->last_name,
            'full_name' => $member->full_name,
            'gender' => $member->gender,
            'date_of_birth' => $member->date_of_birth?->format('Y-m-d'),
            'date_of_death' => $member->date_of_death?->format('Y-m-d'),
            'photo_url' => $member->photo_url,
            'age' => $member->age,
            'is_root' => $member->is_root,
            'email' => $member->email,
            'phone' => $member->phone,
            'address' => $member->address,
            'occupation' => $member->occupation,
        ];
    }
}
