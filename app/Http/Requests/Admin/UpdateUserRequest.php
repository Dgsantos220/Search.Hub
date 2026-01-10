<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateUserRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $userId = $this->route('user')->id ?? $this->route('user');

        return [
            'name' => 'required|string|max:255',
            'email' => ['required', 'email', Rule::unique('users', 'email')->ignore($userId)],
            'phone' => 'nullable|string|max:20',
            'password' => 'nullable|string|min:8|confirmed',
            'status' => 'required|in:active,blocked',
            'roles' => 'required|array|min:1',
            'roles.*' => 'exists:roles,id',
            'create_subscription' => 'nullable|boolean',
            'plan_id' => 'nullable|exists:plans,id',
            'subscription_status' => 'nullable|string|in:active,trialing',
        ];
    }

    public function messages(): array
    {
        return [
            'email.unique' => 'Este email ja esta em uso.',
            'roles.required' => 'Selecione pelo menos uma funcao.',
        ];
    }
}
