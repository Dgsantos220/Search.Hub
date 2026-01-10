@extends('emails.layouts.default')

@section('content')
<h2>Pagamento Aprovado! 🎉</h2>

<p>Olá <strong>{{ $user->name }}</strong>,</p>

<p>Temos ótimas notícias! Seu pagamento foi processado e aprovado com sucesso.</p>

<div class="info-box">
    <strong>Detalhes da Transação:</strong><br><br>
    <ul>
        <li><strong>Plano:</strong> {{ $plan->name }}</li>
        <li><strong>Valor:</strong> {{ $payment->formatted_amount }}</li>
        <li><strong>Data:</strong> {{ $payment->paid_at?->format('d/m/Y H:i') ?? now()->format('d/m/Y H:i') }}</li>
    </ul>
</div>

@if($subscription)
<p>Sua assinatura agora está <strong>ATIVA</strong> e válida até <strong>{{ $subscription->current_period_end?->format('d/m/Y') }}</strong>.</p>
@endif

<p>Você já pode acessar todos os recursos do seu plano.</p>

@php
    $actionUrl = url('/dashboard');
    $actionText = 'Acessar Meu Painel';
@endphp

@endsection
