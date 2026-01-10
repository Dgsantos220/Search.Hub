@extends('emails.layouts.default')

@section('content')
<h2>Assinatura Ativada! 🚀</h2>

<p>Olá <strong>{{ $user->name }}</strong>,</p>

<p>Seja muito bem-vindo! Sua assinatura do plano <strong>{{ $plan->name }}</strong> foi ativada com sucesso e você já pode aproveitar todos os benefícios.</p>

<div class="info-box">
    <strong>Resumo da Assinatura:</strong><br><br>
    <ul>
        <li><strong>Plano:</strong> {{ $plan->name }}</li>
        <li><strong>Valor:</strong> {{ $plan->formatted_price }}</li>
        <li><strong>Válido até:</strong> {{ $subscription->current_period_end?->format('d/m/Y') }}</li>
        @if($plan->monthly_limit)
        <li><strong>Limite Mensal:</strong> {{ number_format($plan->monthly_limit) }} consultas</li>
        @endif
    </ul>
</div>

<p>Estamos felizes em ter você conosco. Se tiver qualquer dúvida, nosso suporte está à disposição.</p>

@php
    $actionUrl = url('/dashboard');
    $actionText = 'Começar a Usar Agora';
@endphp

@endsection
