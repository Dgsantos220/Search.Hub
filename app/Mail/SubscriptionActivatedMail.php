<?php

namespace App\Mail;

use App\Models\Subscription;
use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class SubscriptionActivatedMail extends Mailable implements ShouldQueue
{
    use Queueable, SerializesModels;

    public Subscription $subscription;
    public User $user;

    public function __construct(Subscription $subscription)
    {
        $this->subscription = $subscription;
        $this->user = $subscription->user;
    }

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Assinatura Ativada - M7consultas',
        );
    }

    public function content(): Content
    {
        return new Content(
            markdown: 'emails.subscription-activated',
            with: [
                'subscription' => $this->subscription,
                'user' => $this->user,
                'plan' => $this->subscription->plan,
            ],
        );
    }

    public function attachments(): array
    {
        return [];
    }
}
