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

class PaymentApprovedMail extends Mailable implements ShouldQueue
{
    use Queueable, SerializesModels;

    public Payment $payment;
    public User $user;

    public function __construct(Payment $payment)
    {
        $this->payment = $payment;
        $this->user = $payment->user;
    }

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Pagamento Aprovado - M7consultas',
        );
    }

    public function content(): Content
    {
        return new Content(
            markdown: 'emails.payment-approved',
            with: [
                'payment' => $this->payment,
                'user' => $this->user,
                'plan' => $this->payment->plan,
                'subscription' => $this->payment->subscription,
            ],
        );
    }

    public function attachments(): array
    {
        return [];
    }
}
