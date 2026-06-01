<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('family_members', function (Blueprint $table) {
            $table->id();
            $table->string('first_name', 100);
            $table->string('last_name', 100);
            $table->string('maiden_name', 100)->nullable();
            $table->string('gender', 10); // male, female, other
            $table->date('date_of_birth')->nullable();
            $table->date('date_of_death')->nullable();
            $table->string('birth_place', 200)->nullable();
            $table->text('biography')->nullable();
            $table->string('photo_path', 500)->nullable();
            $table->boolean('is_root')->default(false);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('family_members');
    }
};
