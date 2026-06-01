<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreMemberRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'first_name'    => 'required|string|max:100',
            'last_name'     => 'required|string|max:100',
            'maiden_name'   => 'nullable|string|max:100',
            'gender'        => 'required|in:male,female,other',
            'date_of_birth' => 'nullable|date|before:today',
            'date_of_death' => 'nullable|date|after:date_of_birth|before_or_equal:today',
            'birth_place'   => 'nullable|string|max:200',
            'biography'     => 'nullable|string|max:5000',
            'photo'         => 'nullable|image|mimes:jpeg,png,webp|max:2048',
            'is_root'       => 'boolean',
            'email'         => 'nullable|email|max:255',
            'phone'         => 'nullable|string|max:50',
            'address'       => 'nullable|string|max:1000',
            'occupation'    => 'nullable|string|max:255',
        ];
    }
}
