@extends('emails.layouts.default')

@section('content')
<h2>Redefinição de Senha 🔑</h2>

<p>Olá,</p>

<p>Recebemos uma solicitação para redefinir a senha da sua conta no <strong>{{ config('app.name') }}</strong>.</p>

<p>Clique no botão abaixo para criar uma nova senha:</p>

@php
    $actionUrl = $url;
    $actionText = 'Redefinir Senha';
@endphp

<div class="info-box">
    <small>Este link expira em {{ $count }} minutos.</small>
</div>

<p>Se você não solicitou uma redefinição de senha, nenhuma ação é necessária.</p>
@endsection
