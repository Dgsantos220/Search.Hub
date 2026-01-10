<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class StoreUserRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'phone' => 'nullable|string|max:20',
            'password' => 'nullable|string|min:8',
            'status' => 'required|in:active,blocked',
            'send_invite' => 'boolean',
            'roles' => 'required|array|min:1',
            'roles.*' => 'exists:roles,id',
            'create_subscription' => 'boolean',
            'plan_id' => 'required_if:create_subscription,true|nullable|exists:plans,id',
            'subscription_status' => 'nullable|in:active,trialing',
            'trial_days' => 'nullable|integer|min:0|max:365',
        ];
    }

    public function messages(): array
    {
        return [
            'email.unique' => 'Este email ja esta em uso.',
            'roles.required' => 'Selecione pelo menos uma funcao.',
            'plan_id.required_if' => 'Selecione um plano para criar a assinatura.',
        ];
    }
}
