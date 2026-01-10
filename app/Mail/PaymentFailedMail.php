<?php

namespace App\Mail;

use App\Models\Payment;
use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class PaymentFailedMail extends Mailable implements ShouldQueue
{
    use Queueable, SerializesModels;

    public Payment $payment;
    public User $user;
    public ?string $reason;

    public function __construct(Payment $payment, ?string $reason = null)
    {
        $this->payment = $payment;
        $this->user = $payment->user;
        $this->reason = $reason ?? $payment->failure_reason;
    }

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Pagamento Rejeitado - M7consultas',
        );
    }

    public function content(): Content
    {
        return new Content(
            markdown: 'emails.payment-failed',
            with: [
                'payment' => $this->payment,
                'user' => $this->user,
                'plan' => $this->payment->plan,
                'reason' => $this->reason,
            ],
        );
    }

    public function attachments(): array
    {
        return [];
    }
}
