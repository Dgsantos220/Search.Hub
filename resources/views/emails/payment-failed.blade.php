@extends('emails.layouts.default')

@section('content')
<h2>Pagamento Não Realizado</h2>

<p>Olá <strong>{{ $user->name }}</strong>,</p>

<p>Houve um problema ao processar o seu pagamento para o plano <strong>{{ $plan->name }}</strong>.</p>

<div class="info-box" style="border-left: 4px solid #ef4444;">
    <strong>Detalhes da Falha:</strong><br><br>
    <ul>
        <li><strong>Valor Tentado:</strong> {{ $payment->formatted_amount }}</li>
        @if(isset($reason) && $reason)
        <li><strong>Motivo:</strong> {{ $reason }}</li>
        @else
        <li><strong>Motivo:</strong> Recusado pela operadora do cartão ou gateway.</li>
        @endif
    </ul>
</div>

<p>Não se preocupe, isso é comum. Você pode tentar novamente usando outro cartão ou método de pagamento.</p>

@php
    $actionUrl = url('/plans');
    $actionText = 'Tentar Novamente';
@endphp

@endsection
