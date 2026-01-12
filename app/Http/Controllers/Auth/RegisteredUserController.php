<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules;
use Inertia\Inertia;
use Inertia\Response;

use App\Models\Plan;
use App\Services\SubscriptionService;

class RegisteredUserController extends Controller
{
    /**
     * Display the registration view.
     */
    public function create(): Response
    {
        return Inertia::render('Auth/Register');
    }

    /**
     * Handle an incoming registration request.
     *
     * @throws \Illuminate\Validation\ValidationException
     */
    public function store(Request $request, SubscriptionService $subscriptionService): RedirectResponse
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|lowercase|email|max:255|unique:'.User::class,
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
        ]);

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
        ]);

        // Assinar plano gratis automaticamente
        $freePlan = Plan::where('slug', 'gratis')->where('is_active', true)->first();
        if ($freePlan) {
            $subscriptionService->subscribe($user, $freePlan, 'manual', null, \App\Models\Subscription::STATUS_ACTIVE);
        }

        event(new Registered($user));

        Auth::login($user);

        // Send Welcome Notification
        $notificationService = app(\App\Services\NotificationService::class);
        $notificationService->send(
            $user,
            'Bem-vindo ao Los Dados!',
            'Obrigado por criar sua conta. Explore nossos painéis e realize suas consultas com agilidade.',
            ['type' => 'success']
        );

        return redirect(route('dashboard', absolute: false));
    }
}
