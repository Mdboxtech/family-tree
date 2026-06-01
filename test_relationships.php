<?php
require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$a = \App\Models\FamilyMember::firstOrCreate(['first_name'=>'Aisha','last_name'=>'Test','gender'=>'female']);
$b = \App\Models\FamilyMember::firstOrCreate(['first_name'=>'Bob','last_name'=>'Test','gender'=>'male']);
$c = \App\Models\FamilyMember::firstOrCreate(['first_name'=>'Charlie','last_name'=>'Test','gender'=>'male']);

app(\App\Services\FamilyTreeService::class)->createRelationship($a->id, $b->id, 'spouse');
app(\App\Services\FamilyTreeService::class)->createRelationship($a->id, $c->id, 'spouse');

echo "Aisha has " . $a->spouses()->count() . " spouses.\n";
