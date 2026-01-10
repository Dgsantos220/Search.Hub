@extends('emails.layouts.default')

@section('content')
<h2>Verifique seu endereço de e-mail 🔒</h2>

<p>Olá,</p>

<p>Obrigado por se cadastrar no <strong>{{ config('app.name') }}</strong>! Para garantir a segurança da sua conta e liberar seu acesso completo, precisamos que você confirme seu endereço de e-mail.</p>

<p>Clique no botão abaixo para verificar:</p>

@php
    $actionUrl = $url;
    $actionText = 'Verificar E-mail';
@endphp

<p>Se você não criou uma conta, pode ignorar este e-mail.</p>
@endsection
