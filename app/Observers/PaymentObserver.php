<?php

namespace App\Observers;

use App\Models\Payment;
use App\Services\NotificationService;
use Illuminate\Support\Facades\Log;

class PaymentObserver
{
    protected NotificationService $notificationService;

    public function __construct(NotificationService $notificationService)
    {
        $this->notificationService = $notificationService;
    }

    public function created(Payment $payment): void
    {
    }

    public function updated(Payment $payment): void
    {
        Log::info('PaymentObserver updated called', ['status' => $payment->status]);
        
        if ($payment->isDirty('status')) {
            $oldStatus = $payment->getOriginal('status');
            $newStatus = $payment->status;

            if ($oldStatus !== Payment::STATUS_PAID && $newStatus === Payment::STATUS_PAID) {
                $this->notificationService->sendPaymentApproved($payment);
                
                if ($payment->subscription) {
                    $this->notificationService->sendSubscriptionActivated($payment->subscription);
                }
            }

            if ($oldStatus !== Payment::STATUS_FAILED && $newStatus === Payment::STATUS_FAILED) {
                $this->notificationService->sendPaymentFailed($payment);
            }
        }
    }

    public function deleted(Payment $payment): void
    {
    }

    public function restored(Payment $payment): void
    {
    }

    public function forceDeleted(Payment $payment): void
    {
    }
}
