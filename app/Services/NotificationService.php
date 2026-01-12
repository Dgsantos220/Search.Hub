<?php

namespace App\Services;

use App\Models\User;
use App\Notifications\GeneralNotification;
use App\Models\UserSettings;

class NotificationService
{
    /**
     * Send a notification to a user based on their preferences.
     *
     * @param User $user
     * @param string $title
     * @param string $message
     * @param array $options Optional: 'action_url', 'action_text', 'type' (success, info, error)
     * @return void
     */
    public function send(User $user, string $title, string $message, array $options = []): void
    {
        $settings = $user->getSettings();
        
        // Determine channels based on preferences
        $channels = ['database']; // Always save to database/internal notifications if implemented later
        
        if ($settings->notifications_email) {
            $channels[] = 'mail';
        }
        
        if ($settings->notifications_push) {
            $channels[] = \NotificationChannels\WebPush\WebPushChannel::class;
        }

        $user->notify(new GeneralNotification($title, $message, $options, $channels));
    }
}
