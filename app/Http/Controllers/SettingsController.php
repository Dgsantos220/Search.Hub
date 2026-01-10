<?php

namespace App\Http\Controllers;

use App\Models\UserSettings;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;
use Inertia\Response;

class SettingsController extends Controller
{
    public function index(): Response
    {
        $user = Auth::user();
        $settings = $user->getSettings();

        return Inertia::render('Settings', [
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'created_at' => $user->created_at->format('d/m/Y'),
            ],
            'settings' => [
                'theme' => $settings->theme,
                'language' => $settings->language,
                'timezone' => $settings->timezone,
                'notifications_email' => $settings->notifications_email,
                'notifications_push' => $settings->notifications_push,
                'two_factor_enabled' => $settings->two_factor_enabled,
            ],
            'options' => [
                'themes' => UserSettings::getThemeOptions(),
                'languages' => UserSettings::getLanguageOptions(),
                'timezones' => UserSettings::getTimezoneOptions(),
            ],
            'subscription' => $user->activeSubscription ? [
                'name' => $user->activeSubscription->plan?->name,
                'price' => $user->activeSubscription->plan?->price,
                'status' => $user->activeSubscription->status,
                'next_billing' => $user->activeSubscription->current_period_end?->format('d/m/Y'),
            ] : null,
        ]);
    }

    public function updatePreferences(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'theme' => 'sometimes|string|in:dark,light,system',
            'language' => 'sometimes|string|in:pt-BR,en,es',
            'timezone' => 'sometimes|string|max:50',
        ]);

        $settings = Auth::user()->getSettings();
        $settings->update($validated);

        return back()->with('success', 'Preferências atualizadas com sucesso.');
    }

    public function updateNotifications(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'notifications_email' => 'sometimes|boolean',
            'notifications_push' => 'sometimes|boolean',
        ]);

        $settings = Auth::user()->getSettings();
        $settings->update($validated);

        return back()->with('success', 'Notificações atualizadas com sucesso.');
    }

    public function updateSecurity(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'current_password' => 'required|current_password',
            'password' => 'required|min:8|confirmed',
        ]);

        $user = Auth::user();
        $user->password = Hash::make($validated['password']);
        $user->save();

        return back()->with('success', 'Senha alterada com sucesso.');
    }

    public function toggleTwoFactor(Request $request): RedirectResponse
    {
        $settings = Auth::user()->getSettings();
        $settings->two_factor_enabled = !$settings->two_factor_enabled;
        $settings->save();

        $message = $settings->two_factor_enabled 
            ? 'Autenticação de dois fatores ativada.' 
            : 'Autenticação de dois fatores desativada.';

        return back()->with('success', $message);
    }
}
