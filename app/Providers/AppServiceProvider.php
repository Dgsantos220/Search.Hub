<?php

namespace App\Providers;

use App\Models\Payment;
use App\Models\SystemSetting;
use App\Observers\PaymentObserver;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\URL;
use Illuminate\Support\Facades\Vite;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void
    {
    }

    public function boot(): void
    {
        Vite::prefetch(concurrency: 3);
        
        if (env('REPL_SLUG') && !app()->runningInConsole()) {
            URL::forceScheme('https');
            URL::forceRootUrl(request()->getSchemeAndHttpHost());
        }

        Payment::observe(PaymentObserver::class);

        // Load system settings into config
        if (Schema::hasTable('system_settings')) {
            $this->loadMailSettings();
        }
    }

    protected function loadMailSettings(): void
    {
        $mailer = SystemSetting::get('MAIL_MAILER');
        if ($mailer) {
            Config::set('mail.default', $mailer);
            Config::set('mail.mailers.smtp.host', SystemSetting::get('MAIL_HOST', config('mail.mailers.smtp.host')));
            Config::set('mail.mailers.smtp.port', SystemSetting::get('MAIL_PORT', config('mail.mailers.smtp.port')));
            Config::set('mail.mailers.smtp.username', SystemSetting::get('MAIL_USERNAME', config('mail.mailers.smtp.username')));
            Config::set('mail.mailers.smtp.password', SystemSetting::get('MAIL_PASSWORD', config('mail.mailers.smtp.password')));
            Config::set('mail.mailers.smtp.encryption', SystemSetting::get('MAIL_ENCRYPTION', config('mail.mailers.smtp.encryption')));
            Config::set('mail.from.address', SystemSetting::get('MAIL_FROM_ADDRESS', config('mail.from.address')));
            Config::set('mail.from.name', SystemSetting::get('MAIL_FROM_NAME', config('mail.from.name')));
        }
    }
}
