<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreRelationshipRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'person_id'     => 'required|exists:family_members,id',
            'relative_id'   => 'required|exists:family_members,id|different:person_id',
            'type'          => 'required|in:parent,child,spouse,sibling',
            'marriage_date' => 'nullable|date|required_if:type,spouse',
            'divorce_date'  => 'nullable|date|after:marriage_date',
            'is_biological' => 'boolean',
        ];
    }

    public function messages(): array
    {
        return [
            'relative_id.different' => 'A person cannot have a relationship with themselves.',
            'marriage_date.required_if' => 'Marriage date is required for spouse relationships.',
        ];
    }
}
