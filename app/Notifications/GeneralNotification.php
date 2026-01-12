<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;
use NotificationChannels\WebPush\WebPushMessage;
use NotificationChannels\WebPush\WebPushChannel;

class GeneralNotification extends Notification implements ShouldQueue
{
    use Queueable;

    private string $title;
    private string $message;
    private array $options;
    private array $channels;

    /**
     * Create a new notification instance.
     */
    public function __construct(string $title, string $message, array $options = [], array $channels = ['mail'])
    {
        $this->title = $title;
        $this->message = $message;
        $this->options = $options;
        $this->channels = $channels;
    }

    /**
     * Get the notification's delivery channels.
     *
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return $this->channels;
    }

    /**
     * Get the mail representation of the notification.
     */
    public function toMail(object $notifiable): MailMessage
    {
        $mail = (new MailMessage)
                    ->subject(config('app.name') . ' - ' . $this->title)
                    ->greeting('Olá, ' . $notifiable->name)
                    ->line($this->message);

        if (isset($this->options['action_url']) && isset($this->options['action_text'])) {
            $mail->action($this->options['action_text'], $this->options['action_url']);
        }

        return $mail->line('Obrigado por usar nossa plataforma!');
    }

    /**
     * Get the web push representation of the notification.
     */
    public function toWebPush($notifiable, $notification)
    {
        $url = $this->options['action_url'] ?? url('/dashboard');

        return (new WebPushMessage)
            ->title($this->title)
            ->icon('/storage/icon-192x192.png') // Ensure this icon exists or use default
            ->body($this->message)
            ->action('Ver', 'view_app')
            ->data(['url' => $url]);
    }

    /**
     * Get the array representation of the notification.
     *
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        return [
            'title' => $this->title,
            'message' => $this->message,
            'options' => $this->options,
        ];
    }
}
