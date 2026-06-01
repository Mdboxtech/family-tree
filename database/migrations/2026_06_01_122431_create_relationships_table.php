<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('relationships', function (Blueprint $table) {
            $table->id();
            $table->foreignId('person_id')->constrained('family_members')->cascadeOnDelete();
            $table->foreignId('relative_id')->constrained('family_members')->cascadeOnDelete();
            $table->string('type', 20); // parent, child, spouse, sibling
            $table->date('marriage_date')->nullable();
            $table->date('divorce_date')->nullable();
            $table->boolean('is_biological')->default(true);
            $table->timestamps();

            $table->unique(['person_id', 'relative_id', 'type']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('relationships');
    }
};
