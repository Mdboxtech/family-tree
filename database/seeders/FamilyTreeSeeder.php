<?php

namespace Database\Seeders;

use App\Models\FamilyMember;
use App\Services\FamilyTreeService;
use Illuminate\Database\Seeder;

class FamilyTreeSeeder extends Seeder
{
    public function run(): void
    {
        $service = app(FamilyTreeService::class);

        // ── Generation 1 (Grandparents) ──────────────────────────────
        $grandpa = FamilyMember::create([
            'first_name' => 'Ahmad',
            'last_name' => 'Ali',
            'gender' => 'male',
            'date_of_birth' => '1940-03-15',
            'birth_place' => 'Lagos, Nigeria',
            'biography' => 'The patriarch of the Ali family. A respected community leader and teacher who dedicated his life to education.',
            'is_root' => true,
        ]);

        $grandma = FamilyMember::create([
            'first_name' => 'Amina',
            'last_name' => 'Ali',
            'maiden_name' => 'Ibrahim',
            'gender' => 'female',
            'date_of_birth' => '1945-07-22',
            'birth_place' => 'Kano, Nigeria',
            'biography' => 'A loving grandmother and accomplished seamstress known throughout the community.',
        ]);

        // Grandparents are spouses
        $service->createRelationship($grandpa->id, $grandma->id, 'spouse', [
            'marriage_date' => '1963-12-01',
        ]);

        // ── Generation 2 (Parents & Aunts/Uncles) ────────────────────
        $father = FamilyMember::create([
            'first_name' => 'Ibrahim',
            'last_name' => 'Ali',
            'gender' => 'male',
            'date_of_birth' => '1965-01-10',
            'birth_place' => 'Lagos, Nigeria',
            'biography' => 'A successful architect who designed several landmark buildings in Lagos.',
        ]);

        $mother = FamilyMember::create([
            'first_name' => 'Fatima',
            'last_name' => 'Ali',
            'maiden_name' => 'Okafor',
            'gender' => 'female',
            'date_of_birth' => '1968-09-05',
            'birth_place' => 'Ibadan, Nigeria',
            'biography' => 'A pediatrician who has dedicated her career to children\'s health.',
        ]);

        $uncle = FamilyMember::create([
            'first_name' => 'Yusuf',
            'last_name' => 'Ali',
            'gender' => 'male',
            'date_of_birth' => '1970-04-18',
            'birth_place' => 'Lagos, Nigeria',
            'biography' => 'A software engineer working in Abuja.',
        ]);

        $aunt = FamilyMember::create([
            'first_name' => 'Halima',
            'last_name' => 'Bello',
            'maiden_name' => 'Ali',
            'gender' => 'female',
            'date_of_birth' => '1972-11-30',
            'birth_place' => 'Lagos, Nigeria',
            'biography' => 'A university professor specializing in African literature.',
        ]);

        $auntHusband = FamilyMember::create([
            'first_name' => 'Musa',
            'last_name' => 'Bello',
            'gender' => 'male',
            'date_of_birth' => '1969-06-14',
            'birth_place' => 'Kaduna, Nigeria',
            'biography' => 'A civil engineer and devoted family man.',
        ]);

        // Parent relationships to grandparents
        $service->createRelationship($father->id, $grandpa->id, 'parent');
        $service->createRelationship($father->id, $grandma->id, 'parent');
        $service->createRelationship($uncle->id, $grandpa->id, 'parent');
        $service->createRelationship($uncle->id, $grandma->id, 'parent');
        $service->createRelationship($aunt->id, $grandpa->id, 'parent');
        $service->createRelationship($aunt->id, $grandma->id, 'parent');

        // Sibling relationships
        $service->createRelationship($father->id, $uncle->id, 'sibling');
        $service->createRelationship($father->id, $aunt->id, 'sibling');
        $service->createRelationship($uncle->id, $aunt->id, 'sibling');

        // Spouse relationships
        $service->createRelationship($father->id, $mother->id, 'spouse', [
            'marriage_date' => '1990-06-15',
        ]);
        $service->createRelationship($aunt->id, $auntHusband->id, 'spouse', [
            'marriage_date' => '1995-03-20',
        ]);

        // ── Generation 3 (Children / Grandchildren) ─────────────────
        $son1 = FamilyMember::create([
            'first_name' => 'Omar',
            'last_name' => 'Ali',
            'gender' => 'male',
            'date_of_birth' => '1992-08-20',
            'birth_place' => 'Lagos, Nigeria',
            'biography' => 'A data scientist working at a tech startup in Lagos.',
        ]);

        $daughter1 = FamilyMember::create([
            'first_name' => 'Aisha',
            'last_name' => 'Ali',
            'gender' => 'female',
            'date_of_birth' => '1995-02-14',
            'birth_place' => 'Lagos, Nigeria',
            'biography' => 'A medical student at the University of Lagos.',
        ]);

        $son2 = FamilyMember::create([
            'first_name' => 'Khalid',
            'last_name' => 'Ali',
            'gender' => 'male',
            'date_of_birth' => '1998-12-01',
            'birth_place' => 'Lagos, Nigeria',
            'biography' => 'A university student studying mechanical engineering.',
        ]);

        $cousin1 = FamilyMember::create([
            'first_name' => 'Zainab',
            'last_name' => 'Bello',
            'gender' => 'female',
            'date_of_birth' => '1997-05-10',
            'birth_place' => 'Lagos, Nigeria',
            'biography' => 'A graphic designer with a passion for African art.',
        ]);

        $cousin2 = FamilyMember::create([
            'first_name' => 'Usman',
            'last_name' => 'Bello',
            'gender' => 'male',
            'date_of_birth' => '2000-09-25',
            'birth_place' => 'Lagos, Nigeria',
            'biography' => 'A high school student and aspiring musician.',
        ]);

        // Children of father & mother
        $service->createRelationship($son1->id, $father->id, 'parent');
        $service->createRelationship($son1->id, $mother->id, 'parent');
        $service->createRelationship($daughter1->id, $father->id, 'parent');
        $service->createRelationship($daughter1->id, $mother->id, 'parent');
        $service->createRelationship($son2->id, $father->id, 'parent');
        $service->createRelationship($son2->id, $mother->id, 'parent');

        // Siblings among children
        $service->createRelationship($son1->id, $daughter1->id, 'sibling');
        $service->createRelationship($son1->id, $son2->id, 'sibling');
        $service->createRelationship($daughter1->id, $son2->id, 'sibling');

        // Children of aunt & aunt's husband
        $service->createRelationship($cousin1->id, $aunt->id, 'parent');
        $service->createRelationship($cousin1->id, $auntHusband->id, 'parent');
        $service->createRelationship($cousin2->id, $aunt->id, 'parent');
        $service->createRelationship($cousin2->id, $auntHusband->id, 'parent');

        // Siblings among cousins
        $service->createRelationship($cousin1->id, $cousin2->id, 'sibling');

        // ── Omar's spouse (Gen 3 marriage) ───────────────────────────
        $omarWife = FamilyMember::create([
            'first_name' => 'Mariam',
            'last_name' => 'Ali',
            'maiden_name' => 'Adeyemi',
            'gender' => 'female',
            'date_of_birth' => '1994-04-08',
            'birth_place' => 'Abuja, Nigeria',
            'biography' => 'A lawyer specializing in human rights law.',
        ]);

        $service->createRelationship($son1->id, $omarWife->id, 'spouse', [
            'marriage_date' => '2020-11-15',
        ]);

        // ── Generation 4 (Great-grandchild) ──────────────────────────
        $greatGrandchild = FamilyMember::create([
            'first_name' => 'Layla',
            'last_name' => 'Ali',
            'gender' => 'female',
            'date_of_birth' => '2023-03-12',
            'birth_place' => 'Lagos, Nigeria',
            'biography' => 'The newest addition to the Ali family.',
        ]);

        $service->createRelationship($greatGrandchild->id, $son1->id, 'parent');
        $service->createRelationship($greatGrandchild->id, $omarWife->id, 'parent');
    }
}
