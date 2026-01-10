<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{ config('app.name') }}</title>
    <style>
        body {
            font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
            background-color: #f3f4f6;
            margin: 0;
            padding: 0;
            -webkit-font-smoothing: antialiased;
            color: #1f2937;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            border-radius: 8px;
            overflow: hidden;
            margin-top: 40px;
            margin-bottom: 40px;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
        }
        .header {
            background-color: #111827; /* Dark background mainly */
            padding: 30px;
            text-align: center;
        }
        .header h1 {
            color: #ffffff;
            font-size: 24px;
            margin: 0;
            font-weight: 700;
            letter-spacing: -0.025em;
        }
        .content {
            padding: 40px 30px;
            line-height: 1.6;
            color: #374151;
            font-size: 16px;
        }
        .content h2 {
            color: #111827;
            font-size: 20px;
            margin-top: 0;
            margin-bottom: 20px;
        }
        .content p {
            margin-bottom: 20px;
        }
        .button-container {
            text-align: center;
            margin: 30px 0;
        }
        .button {
            background-color: #2563eb; /* Primary Blue */
            color: #ffffff;
            text-decoration: none;
            padding: 12px 24px;
            border-radius: 6px;
            font-weight: 600;
            display: inline-block;
            transition: background-color 0.2s;
        }
        .button:hover {
            background-color: #1d4ed8;
        }
        .footer {
            background-color: #f9fafb;
            padding: 20px 30px;
            text-align: center;
            font-size: 12px;
            color: #6b7280;
            border-top: 1px solid #e5e7eb;
        }
        .footer a {
            color: #6b7280;
            text-decoration: underline;
        }
        .divider {
            height: 1px;
            background-color: #e5e7eb;
            margin: 30px 0;
        }
        .info-box {
            background-color: #f3f4f6;
            border: 1px solid #e5e7eb;
            border-radius: 6px;
            padding: 15px;
            margin: 20px 0;
            font-size: 14px;
        }
        /* Mobile adjustment */
        @media only screen and (max-width: 600px) {
            .container {
                margin: 0;
                width: 100% !important;
                border-radius: 0;
            }
            .content {
                padding: 20px;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <!-- Header -->
        <div class="header">
            <!-- You can replace text with <img src="..." alt="Logo" height="40" /> -->
            <h1>{{ config('app.name') }}</h1>
        </div>

        <!-- Content -->
        <div class="content">
            @yield('content')
            
            @if(isset($actionUrl) && isset($actionText))
                <div class="button-container">
                    <a href="{{ $actionUrl }}" class="button" target="_blank" style="color: #ffffff !important;">{{ $actionText }}</a>
                </div>
                
                <p style="font-size: 14px; color: #6b7280; margin-top: 30px;">
                    Se o botão acima não funcionar, copie e cole o link abaixo no seu navegador:<br>
                    <a href="{{ $actionUrl }}" style="color: #2563eb; word-break: break-all;">{{ $actionUrl }}</a>
                </p>
            @endif
        </div>

        <!-- Footer -->
        <div class="footer">
            <p>&copy; {{ date('Y') }} {{ config('app.name') }}. Todos os direitos reservados.</p>
            <p>Se você não solicitou este e-mail, nenhuma ação é necessária.</p>
        </div>
    </div>
</body>
</html>
