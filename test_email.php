

use Illuminate\Support\Facades\Mail;

try {
    echo "Iniciando teste de envio de email...\n";
    
    // Forçar recarregamento das configs caso necessário (mas o boot já deve ter feito)
    // O AppServiceProvider roda no boot, então já deve estar OK.

    Mail::raw('Este e um email de teste do sistema M7Consultas enviado via script de teste.', function($msg) {
        $msg->to('diego.haidmann@gmail.com')
            ->subject('Teste de Envio SMTP - M7Consultas');
    });

    echo "Email enviado com sucesso!\n";
} catch (\Exception $e) {
    echo "Erro ao enviar email: " . $e->getMessage() . "\n";
    echo "Config atual MAIL_HOST: " . config('mail.mailers.smtp.host') . "\n";
    echo "Config atual MAIL_PORT: " . config('mail.mailers.smtp.port') . "\n";
    echo "Config atual MAIL_USERNAME: " . config('mail.mailers.smtp.username') . "\n";
}
