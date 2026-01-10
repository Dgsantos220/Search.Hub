<?php

namespace App\Services;

use App\Mail\PaymentApprovedMail;
use App\Mail\PaymentFailedMail;
use App\Mail\SubscriptionActivatedMail;
use App\Models\Payment;
use App\Models\Subscription;
use App\Models\User;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

class NotificationService
{
    public function sendPaymentApproved(Payment $payment): void
    {
        try {
            $user = $payment->user;
            
            if (!$user || !$user->email) {
                Log::warning('Cannot send payment approved email: user or email not found', [
                    'payment_id' => $payment->id,
                ]);
                return;
            }

            Mail::to($user->email)->send(new PaymentApprovedMail($payment));

            Log::info('Payment approved email sent', [
                'payment_id' => $payment->id,
                'user_id' => $user->id,
                'email' => $user->email,
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to send payment approved email', [
                'payment_id' => $payment->id,
                'error' => $e->getMessage(),
            ]);
        }
    }

    public function sendPaymentFailed(Payment $payment, ?string $reason = null): void
    {
        try {
            $user = $payment->user;
            
            if (!$user || !$user->email) {
                Log::warning('Cannot send payment failed email: user or email not found', [
                    'payment_id' => $payment->id,
                ]);
                return;
            }

            Mail::to($user->email)->send(new PaymentFailedMail($payment, $reason));

            Log::info('Payment failed email sent', [
                'payment_id' => $payment->id,
                'user_id' => $user->id,
                'email' => $user->email,
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to send payment failed email', [
                'payment_id' => $payment->id,
                'error' => $e->getMessage(),
            ]);
        }
    }

    public function sendSubscriptionActivated(Subscription $subscription): void
    {
        try {
            $user = $subscription->user;
            
            if (!$user || !$user->email) {
                Log::warning('Cannot send subscription activated email: user or email not found', [
                    'subscription_id' => $subscription->id,
                ]);
                return;
            }

            Mail::to($user->email)->send(new SubscriptionActivatedMail($subscription));

            Log::info('Subscription activated email sent', [
                'subscription_id' => $subscription->id,
                'user_id' => $user->id,
                'email' => $user->email,
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to send subscription activated email', [
                'subscription_id' => $subscription->id,
                'error' => $e->getMessage(),
            ]);
        }
    }
}
