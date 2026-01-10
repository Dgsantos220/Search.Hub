# Visão Técnica - M7consultas

**Data da Auditoria:** 15/12/2025  
**Auditor:** Replit Agent  
**Versão:** 1.0

---

## 4.1 Resumo Executivo

### Estado Geral do Sistema: **PARCIAL**

O sistema M7consultas está parcialmente funcional. A arquitetura está bem estruturada, o core de consultas funciona, e o painel administrativo está completo. Porém, há lacunas críticas em integrações de pagamento e testes.

### Top 10 Riscos/Bloqueadores

| # | Risco | Severidade | Impacto |
|---|-------|------------|---------|
| 1 | **Gateways de pagamento não funcionais** (Stripe/MercadoPago) | P0 | Não aceita pagamentos reais |
| 2 | ~~Teste de exclusão de usuário falha~~ **CORRIGIDO** | ~~P0~~ | ~~CI/CD quebrado~~ |
| 3 | **Workflow falha** (porta 5000 ocupada) | P1 | Dev bloqueado |
| 4 | **Sem integração de email/notificações** | P1 | Sem confirmação de pagamento/ações |
| 5 | **Banco sample.db read-only sem backup** | P1 | Dados de consulta sem redundância |
| 6 | **Testes limitados** (apenas Auth) | P1 | Cobertura mínima |
| 7 | **Provider Manual sem fluxo de aprovação automático** | P2 | Depende de admin manual |
| 8 | **Sem rate limiting por IP** | P2 | Vulnerável a abuso |
| 9 | **Auditoria incompleta** (AuditLog sem uso ativo) | P2 | Compliance fraco |
| 10 | **Sem validação de integridade do sample.db** | P2 | Dados corrompidos não detectados |

---

## 4.2 Arquitetura Atual

### Stack Detectada

| Camada | Tecnologia | Versão |
|--------|-----------|--------|
| Backend | Laravel | 12.x |
| PHP | PHP | 8.2+ |
| Frontend | React | 18.2 |
| Inertia | Inertia.js | 2.0 |
| CSS | TailwindCSS | 3.2 |
| UI Components | Shadcn/Radix | Latest |
| Build | Vite | 7.x |
| Auth | Laravel Sanctum | 4.0 |
| Auth Scaffolding | Laravel Breeze | 2.3 |
| DB Principal | SQLite | - |
| DB Consultas | SQLite (sample.db) | 174MB |

### Como Rodar Localmente

```bash
# Instalar dependências
composer install
npm install

# Configurar ambiente
cp .env.example .env
php artisan key:generate

# Executar migrations e seeders
php artisan migrate --seed

# Rodar desenvolvimento
npm run dev &
php artisan serve --host=0.0.0.0 --port=5000
```

### Variáveis de Ambiente Necessárias

| Variável | Descrição | Obrigatório |
|----------|-----------|-------------|
| `APP_KEY` | Chave de criptografia Laravel | Sim |
| `APP_URL` | URL base da aplicação | Sim |
| `DB_CONNECTION` | Driver de banco (sqlite) | Sim |
| `DB_DATABASE` | Caminho do database.sqlite | Sim |
| `SAMPLE_DB_PATH` | Caminho do sample.db | Sim |
| `SESSION_DRIVER` | Driver de sessão | Sim |
| `CACHE_DRIVER` | Driver de cache | Não |

---

## 4.3 Mapa Completo de Rotas

### Backend Routes - Web (routes/web.php)

| Método | Path | Handler | Middleware | Auth |
|--------|------|---------|------------|------|
| GET | `/` | Closure→Landing | - | Não |
| GET | `/terms` | Closure→Terms | - | Não |
| GET | `/privacy` | Closure→Privacy | - | Não |
| GET | `/dashboard` | Closure→Dashboard | auth, verified | Sim |
| GET | `/consulta/{query}` | Closure→Consulta | auth, verified | Sim |
| GET | `/history` | PageController@history | auth, verified | Sim |
| POST | `/history` | PageController@storeHistory | auth, verified | Sim |
| DELETE | `/history/{id}` | PageController@deleteHistory | auth, verified | Sim |
| DELETE | `/history` | PageController@clearHistory | auth, verified | Sim |
| GET | `/settings` | PageController@settings | auth, verified | Sim |
| PUT | `/settings` | PageController@updateSettings | auth, verified | Sim |
| GET | `/plans` | PageController@plans | auth, verified | Sim |
| GET | `/subscription` | PageController@subscription | auth, verified | Sim |
| POST | `/subscription/cancel` | PageController@cancelSubscription | auth, verified | Sim |
| POST | `/subscription/checkout` | PageController@checkout | auth, verified | Sim |
| GET | `/profile` | ProfileController@edit | auth | Sim |
| PATCH | `/profile` | ProfileController@update | auth | Sim |
| DELETE | `/profile` | ProfileController@destroy | auth | Sim |

### Backend Routes - Admin (prefix: /admin)

| Método | Path | Handler | Middleware |
|--------|------|---------|------------|
| GET | `/admin` | AdminPageController@dashboard | auth, verified, role:admin |
| GET | `/admin/users` | AdminUserController@index | auth, verified, role:admin |
| GET | `/admin/users/create` | AdminUserController@create | auth, verified, role:admin |
| POST | `/admin/users` | AdminUserController@store | auth, verified, role:admin |
| GET | `/admin/users/{user}` | AdminUserController@show | auth, verified, role:admin |
| GET | `/admin/users/{user}/edit` | AdminUserController@edit | auth, verified, role:admin |
| PUT | `/admin/users/{user}` | AdminUserController@update | auth, verified, role:admin |
| DELETE | `/admin/users/{user}` | AdminUserController@destroy | auth, verified, role:admin |
| POST | `/admin/users/{id}/restore` | AdminUserController@restore | auth, verified, role:admin |
| POST | `/admin/users/{user}/block` | AdminUserController@block | auth, verified, role:admin |
| POST | `/admin/users/{user}/unblock` | AdminUserController@unblock | auth, verified, role:admin |
| POST | `/admin/users/{user}/change-plan` | AdminUserController@changePlan | auth, verified, role:admin |
| POST | `/admin/users/{user}/cancel-subscription` | AdminUserController@cancelSubscription | auth, verified, role:admin |
| POST | `/admin/users/{user}/reactivate-subscription` | AdminUserController@reactivateSubscription | auth, verified, role:admin |
| POST | `/admin/users/{user}/reset-usage` | AdminUserController@resetUsage | auth, verified, role:admin |
| POST | `/admin/users/{user}/adjust-period` | AdminUserController@adjustPeriod | auth, verified, role:admin |
| GET | `/admin/plans` | AdminPageController@plans | auth, verified, role:admin |
| POST | `/admin/plans` | AdminPageController@storePlan | auth, verified, role:admin |
| PUT | `/admin/plans/{plan}` | AdminPageController@updatePlan | auth, verified, role:admin |
| DELETE | `/admin/plans/{plan}` | AdminPageController@deletePlan | auth, verified, role:admin |
| POST | `/admin/plans/{plan}/toggle` | AdminPageController@togglePlanActive | auth, verified, role:admin |
| POST | `/admin/plans/{plan}/duplicate` | AdminPageController@duplicatePlan | auth, verified, role:admin |
| POST | `/admin/plans/{id}/restore` | AdminPageController@restorePlan | auth, verified, role:admin |
| GET | `/admin/subscriptions` | AdminPageController@subscriptions | auth, verified, role:admin |
| POST | `/admin/subscriptions/{subscription}/cancel` | AdminPageController@cancelSubscription | auth, verified, role:admin |
| POST | `/admin/subscriptions/{subscription}/reactivate` | AdminPageController@reactivateSubscription | auth, verified, role:admin |
| POST | `/admin/payments/{payment}/approve` | AdminPageController@approvePayment | auth, verified, role:admin |
| POST | `/admin/payments/{payment}/reject` | AdminPageController@rejectPayment | auth, verified, role:admin |
| GET | `/admin/gateways` | AdminPageController@gateways | auth, verified, role:admin |
| PUT | `/admin/gateways/{provider}` | AdminPageController@updateGateway | auth, verified, role:admin |
| POST | `/admin/gateways/{provider}/test` | AdminPageController@testGateway | auth, verified, role:admin |
| GET | `/admin/system` | AdminPageController@system | auth, verified, role:admin |
| POST | `/admin/system/rotate-keys` | AdminPageController@rotateApiKeys | auth, verified, role:admin |
| PUT | `/admin/system/rate-limits` | AdminPageController@updateRateLimits | auth, verified, role:admin |
| POST | `/admin/system/maintenance` | AdminPageController@toggleMaintenanceMode | auth, verified, role:admin |
| POST | `/admin/system/clear-cache` | AdminPageController@clearCache | auth, verified, role:admin |

### Backend Routes - API (routes/api.php)

| Método | Path | Handler | Middleware |
|--------|------|---------|------------|
| POST | `/api/auth/register` | ApiAuthController@register | throttle:10,1 |
| POST | `/api/auth/login` | ApiAuthController@login | throttle:10,1 |
| GET | `/api/auth/user` | ApiAuthController@user | auth:sanctum |
| POST | `/api/auth/logout` | ApiAuthController@logout | auth:sanctum |
| POST | `/api/auth/logout-all` | ApiAuthController@logoutAll | auth:sanctum |
| GET | `/api/auth/tokens` | ApiAuthController@tokens | auth:sanctum |
| DELETE | `/api/auth/tokens/{tokenId}` | ApiAuthController@revokeToken | auth:sanctum |
| GET | `/api/plans` | PlanController@index | - |
| GET | `/api/plans/{plan}` | PlanController@show | - |
| GET | `/api/subscriptions/me` | UserSubscriptionController@me | auth:web |
| POST | `/api/subscriptions/checkout` | UserSubscriptionController@checkout | auth:web |
| POST | `/api/subscriptions/cancel` | UserSubscriptionController@cancel | auth:web |
| POST | `/api/subscriptions/change-plan` | UserSubscriptionController@changePlan | auth:web |
| POST | `/api/subscriptions/reactivate` | UserSubscriptionController@reactivate | auth:web |
| GET | `/api/subscriptions/history` | UserSubscriptionController@history | auth:web |
| GET | `/api/subscriptions/payments` | UserSubscriptionController@payments | auth:web |
| GET | `/api/consulta/cpf/{cpf}` | ConsultaController@consultarCpf | auth:web, subscription.active, record.usage |
| GET | `/api/consulta/telefone/{telefone}` | ConsultaController@consultarTelefone | auth:web, subscription.active, record.usage |
| GET | `/api/consulta/email/{email}` | ConsultaController@consultarEmail | auth:web, subscription.active, record.usage |
| GET | `/api/consulta/nome` | ConsultaController@consultarNome | auth:web, subscription.active, record.usage |
| GET | `/api/consulta/parentes/{cpf}` | ConsultaController@consultarParentes | auth:web, subscription.active, record.usage |
| GET | `/api/consulta/rg/{rg}` | ConsultaController@consultarRg | auth:web, subscription.active, record.usage |
| GET | `/api/history` | HistoryController@index | auth:web |
| POST | `/api/history` | HistoryController@store | auth:web |
| DELETE | `/api/history/{id}` | HistoryController@destroy | auth:web |
| DELETE | `/api/history` | HistoryController@clear | auth:web |
| POST | `/api/webhooks/manual` | WebhookController@handleManual | - |
| POST | `/api/webhooks/mercadopago` | WebhookController@handleMercadoPago | - |
| POST | `/api/webhooks/stripe` | WebhookController@handleStripe | - |
| GET | `/api/admin/stats` | AdminController@stats | auth:web, role:admin |
| GET | `/api/admin/users` | AdminController@users | auth:web, role:admin |
| PUT | `/api/admin/users/{id}` | AdminController@updateUser | auth:web, role:admin |
| DELETE | `/api/admin/users/{id}` | AdminController@deleteUser | auth:web, role:admin |
| GET | `/api/admin/system` | AdminController@systemStats | auth:web, role:admin |
| GET | `/api/admin/plans` | PlanController@index | auth:web, role:admin |
| POST | `/api/admin/plans` | PlanController@store | auth:web, role:admin |
| PUT | `/api/admin/plans/{plan}` | PlanController@update | auth:web, role:admin |
| DELETE | `/api/admin/plans/{plan}` | PlanController@destroy | auth:web, role:admin |
| POST | `/api/admin/plans/{plan}/duplicate` | PlanController@duplicate | auth:web, role:admin |
| POST | `/api/admin/plans/{plan}/toggle-active` | PlanController@toggleActive | auth:web, role:admin |
| POST | `/api/admin/plans/{id}/restore` | PlanController@restore | auth:web, role:admin |
| GET | `/api/admin/subscriptions` | AdminSubscriptionController@index | auth:web, role:admin |
| GET | `/api/admin/subscriptions/stats` | AdminSubscriptionController@stats | auth:web, role:admin |
| GET | `/api/admin/subscriptions/payments` | AdminSubscriptionController@payments | auth:web, role:admin |
| POST | `/api/admin/subscriptions/create` | AdminSubscriptionController@createForUser | auth:web, role:admin |
| GET | `/api/admin/subscriptions/{subscription}` | AdminSubscriptionController@show | auth:web, role:admin |
| PUT | `/api/admin/subscriptions/{subscription}` | AdminSubscriptionController@update | auth:web, role:admin |
| POST | `/api/admin/subscriptions/{subscription}/cancel` | AdminSubscriptionController@cancel | auth:web, role:admin |
| POST | `/api/admin/subscriptions/{subscription}/reactivate` | AdminSubscriptionController@reactivate | auth:web, role:admin |
| POST | `/api/admin/payments/{payment}/approve` | AdminSubscriptionController@approvePayment | auth:web, role:admin |
| POST | `/api/admin/payments/{payment}/reject` | AdminSubscriptionController@rejectPayment | auth:web, role:admin |
| GET | `/api/admin/gateways` | AdminGatewayController@index | auth:web, role:admin |
| GET | `/api/admin/gateways/{provider}` | AdminGatewayController@show | auth:web, role:admin |
| PUT | `/api/admin/gateways/{provider}` | AdminGatewayController@update | auth:web, role:admin |
| POST | `/api/admin/gateways/{provider}/test` | AdminGatewayController@test | auth:web, role:admin |
| POST | `/api/admin/gateways/{provider}/toggle` | AdminGatewayController@toggle | auth:web, role:admin |

### Frontend Pages (resources/js/Pages/)

| Path | Componente | Chamadas API | Auth |
|------|------------|--------------|------|
| `/` | Landing.jsx | - | Não |
| `/terms` | Terms.jsx | - | Não |
| `/privacy` | Privacy.jsx | - | Não |
| `/login` | Auth/Login.jsx | POST /login | Não |
| `/register` | Auth/Register.jsx | POST /register | Não |
| `/forgot-password` | Auth/ForgotPassword.jsx | POST /forgot-password | Não |
| `/reset-password/{token}` | Auth/ResetPassword.jsx | POST /reset-password | Não |
| `/verify-email` | Auth/VerifyEmail.jsx | POST /email/verification-notification | Sim |
| `/confirm-password` | Auth/ConfirmPassword.jsx | POST /confirm-password | Sim |
| `/dashboard` | Dashboard.jsx | - | Sim |
| `/consulta/{query}` | Consulta.jsx | GET /api/consulta/* | Sim |
| `/history` | History.jsx | GET /api/history | Sim |
| `/settings` | Settings.jsx | PUT /settings | Sim |
| `/plans` | Plans.jsx | GET /api/plans | Sim |
| `/subscription` | Subscription.jsx | GET /api/subscriptions/me | Sim |
| `/profile` | Profile/Edit.jsx | PATCH /profile, DELETE /profile | Sim |
| `/admin` | Admin/Dashboard.jsx | GET /api/admin/stats | Admin |
| `/admin/users` | Admin/Users.jsx | GET /api/admin/users | Admin |
| `/admin/users/create` | Admin/UserForm.jsx | POST /admin/users | Admin |
| `/admin/users/{user}` | Admin/UserShow.jsx | GET /admin/users/{user} | Admin |
| `/admin/users/{user}/edit` | Admin/UserForm.jsx | PUT /admin/users/{user} | Admin |
| `/admin/plans` | Admin/Plans.jsx | GET /api/admin/plans | Admin |
| `/admin/subscriptions` | Admin/Subscriptions.jsx | GET /api/admin/subscriptions | Admin |
| `/admin/gateways` | Admin/Gateways.jsx | GET /api/admin/gateways | Admin |
| `/admin/system` | Admin/System.jsx | GET /api/admin/system | Admin |

### Divergências Identificadas

| Tipo | Descrição |
|------|-----------|
| ⚠️ | Webhooks Stripe/MercadoPago existem nas rotas mas sem implementação real |
| ⚠️ | Rota `/subscription/checkout` chama provider que só funciona com Manual |
| ✅ | Todas as páginas frontend têm rotas backend correspondentes |
| ✅ | Todas as chamadas de API do frontend existem no backend |

---

## 4.4 Mapa de Banco de Dados

### Tabelas - App Principal (database.sqlite)

| Tabela | Finalidade | Model |
|--------|-----------|-------|
| `users` | Usuários do sistema | User |
| `roles` | Papéis (admin, user) | Role |
| `role_user` | Pivot usuário-papel | - |
| `personal_access_tokens` | Tokens Sanctum | - |
| `consulta_histories` | Histórico de consultas | ConsultaHistory |
| `plans` | Planos de assinatura | Plan |
| `subscriptions` | Assinaturas de usuários | Subscription |
| `usage_counters` | Contadores de uso | UsageCounter |
| `payments` | Pagamentos | Payment |
| `gateway_settings` | Config. de gateways | GatewaySetting |
| `system_settings` | Config. do sistema | SystemSetting |
| `audit_logs` | Logs de auditoria | AuditLog |
| `cache` | Cache do Laravel | - |
| `jobs` | Queue jobs | - |
| `job_batches` | Batch jobs | - |
| `failed_jobs` | Jobs falhados | - |
| `sessions` | Sessões | - |

### Tabelas - Sample DB (db/sample.db) - READ ONLY

| Tabela | Finalidade | Model |
|--------|-----------|-------|
| `DADOS` | Dados pessoais (CPF, nome, etc) | Consulta\Dados |
| `TELEFONE` | Telefones | Consulta\Telefone |
| `EMAIL` | Emails | Consulta\Email |
| `ENDERECO` | Endereços | Consulta\Endereco |
| `PARENTES` | Vínculos familiares | Consulta\Parentes |
| `SCORE` | Score de crédito | Consulta\Score |
| `PODER_AQUISITIVO` | Poder aquisitivo | Consulta\PoderAquisitivo |
| `TSE` | Dados eleitorais | Consulta\Tse |
| `PIS` | Dados PIS | Consulta\Pis |

### Lacunas e Inconsistências

| Issue | Descrição | Impacto |
|-------|-----------|---------|
| ⚠️ | `audit_logs` existe mas não é populada automaticamente | Auditoria incompleta |
| ✅ | `users.deleted_at` usa soft delete - teste corrigido | Funcionando |
| ✅ | Todas FK e índices estão corretos | - |
| ✅ | Migrations são idempotentes | - |
| ✅ | Seeders criam admin e planos básicos | - |

---

## 4.5 Mapa de Funcionalidades

### Módulo: Auth/Users/Roles

| Status | **✅ FUNCIONAL** |
|--------|-----------------|
| Evidências | `app/Http/Controllers/Auth/*`, `app/Models/User.php`, `app/Traits/HasRoles.php` |
| Como testar | `POST /login`, `POST /register`, verificar roles no admin |
| Pendências | Nenhuma |

**Features implementadas:**
- Login/Logout (web + API)
- Registro com verificação de email
- Reset de senha
- Roles (admin/user)
- Soft delete de usuários
- Sanctum tokens para API

### Módulo: Admin Panel

| Status | **✅ FUNCIONAL** |
|--------|-----------------|
| Evidências | `app/Http/Controllers/Admin/*`, `resources/js/Pages/Admin/*` |
| Como testar | Login como admin@m7consultas.com / admin123 |
| Pendências | Nenhuma crítica |

**Features implementadas:**
- Dashboard com estatísticas
- CRUD de usuários
- CRUD de planos
- Gerenciamento de assinaturas
- Configuração de gateways
- Configurações do sistema
- Rotação de API keys

### Módulo: Assinaturas/Planos

| Status | **⚠️ PARCIAL** |
|--------|---------------|
| Evidências | `app/Services/SubscriptionService.php`, `app/Models/Subscription.php` |
| Como testar | Criar assinatura via admin ou checkout |
| Pendências | **Apenas provider Manual funciona** |

**Features implementadas:**
- CRUD de planos
- Criação de assinaturas
- Cancelamento/reativação
- Controle de período
- Trial period
- Soft delete de planos

**Features NÃO implementadas:**
- ❌ Integração real com Stripe
- ❌ Integração real com MercadoPago
- ❌ Cobrança recorrente automática
- ❌ Webhooks funcionais

### Módulo: Consultas (Core)

| Status | **✅ FUNCIONAL** |
|--------|-----------------|
| Evidências | `app/Services/ConsultaService.php`, `app/Http/Controllers/Api/ConsultaController.php` |
| Como testar | GET /api/consulta/cpf/{cpf} com assinatura ativa |
| Pendências | Depende do sample.db externo |

**Features implementadas:**
- Consulta por CPF
- Consulta por telefone
- Consulta por email
- Consulta por nome (paginado)
- Consulta por RG
- Consulta de parentes
- Cache de resultados (5 min)
- Conversão UTF-8 automática

### Módulo: Pagamentos

| Status | **❌ QUEBRADO** |
|--------|----------------|
| Evidências | `app/Services/Billing/ManualProvider.php`, webhooks vazios |
| Como testar | POST /api/webhooks/stripe (não funciona) |
| Pendências | **Implementar Stripe e MercadoPago** |

**Features implementadas:**
- Provider Manual (aprovação por admin)
- Modelo de Payment

**Features NÃO implementadas:**
- ❌ Stripe Provider
- ❌ MercadoPago Provider
- ❌ Processamento automático de pagamentos
- ❌ Webhooks funcionais

### Módulo: Rate Limiting/Usage

| Status | **✅ FUNCIONAL** |
|--------|-----------------|
| Evidências | `app/Http/Middleware/EnsureSubscriptionActive.php`, `app/Services/UsageService.php` |
| Como testar | Fazer consultas até atingir limite |
| Pendências | Nenhuma crítica |

**Features implementadas:**
- Limite por mês
- Limite por dia
- Verificação de assinatura ativa
- Contador de uso

### Módulo: Auditoria/Logs

| Status | **⚠️ PARCIAL** |
|--------|---------------|
| Evidências | `app/Models/AuditLog.php`, `app/Http/Middleware/ApiAuditLog.php` |
| Como testar | Ver logs de API |
| Pendências | **AuditLog não sendo populada** |

**Features implementadas:**
- Histórico de consultas (ConsultaHistory)
- Middleware de audit log (estrutura)

**Features NÃO implementadas:**
- ❌ Logs de ações administrativas
- ❌ Logs de alterações em modelos
- ❌ Dashboard de auditoria

### Módulo: Notificações/Email

| Status | **❌ INEXISTENTE** |
|--------|-------------------|
| Evidências | Nenhum código de notificação encontrado |
| Como testar | N/A |
| Pendências | **Implementar completamente** |

**Features NÃO implementadas:**
- ❌ Confirmação de email
- ❌ Notificação de pagamento
- ❌ Alertas de uso
- ❌ Integração com WhatsApp

---

## 4.6 Lista de Mock/Placeholders/TODO

### Análise de Código

| Tipo | Arquivo | Impacto |
|------|---------|---------|
| ✅ | **Nenhum TODO/FIXME encontrado no código** | N/A |
| ✅ | **Nenhum mock de produção encontrado** | N/A |
| ⚠️ | Faker/Mockery usados apenas em testes | Correto |

### Dados Mockados

| Item | Localização | Impacto |
|------|-------------|---------|
| ✅ | sample.db contém dados reais (174MB) | Core funcional |
| ⚠️ | Seeders criam admin com senha fraca | Trocar em produção |

---

## 4.7 Erros Encontrados

### ~~Erro 1: Teste de exclusão de usuário falha~~ **CORRIGIDO**

| Campo | Valor |
|-------|-------|
| **Erro** | ~~`FAILED Tests\Feature\ProfileTest > user can delete their account`~~ |
| **Status** | ✅ **CORRIGIDO em 15/12/2025** |
| **Causa Raiz** | User model usa SoftDeletes, mas teste esperava hard delete (`assertNull($user->fresh())`) |
| **Correção Aplicada** | Alterado teste para `assertSoftDeleted($user)` |

### Erro 2: Workflow falha (porta ocupada)

| Campo | Valor |
|-------|-------|
| **Erro** | `Failed to listen on 0.0.0.0:5000 (reason: Address already in use)` |
| **Reproduzir** | Iniciar workflow M7consultas |
| **Causa Raiz** | Processo anterior não foi finalizado corretamente |
| **Correção** | `pkill -f "php artisan serve"` antes de iniciar |

### Erro 3: Webhooks não implementados

| Campo | Valor |
|-------|-------|
| **Erro** | POST /api/webhooks/stripe retorna resposta genérica |
| **Reproduzir** | Enviar webhook do Stripe |
| **Causa Raiz** | WebhookController@handleStripe não processa eventos |
| **Correção** | Implementar lógica de webhook completa |

---

## 4.8 Plano de Correção Priorizado

### P0 - Bloqueadores (Críticos para funcionamento)

| # | Item | Estimativa | Descrição |
|---|------|------------|-----------|
| ~~1~~ | ~~Corrigir teste ProfileTest~~ | ~~S~~ | ✅ **CONCLUÍDO** |
| 2 | Implementar Stripe Provider | L | Integração completa com webhooks |
| 3 | Implementar MercadoPago Provider | L | Integração completa com webhooks |

### P1 - Necessários para MVP

| # | Item | Estimativa | Descrição |
|---|------|------------|-----------|
| 4 | Configurar envio de emails | M | Usar Laravel Mail com driver SMTP |
| 5 | Notificações de pagamento | M | Email ao aprovar/rejeitar pagamento |
| 6 | Backup do sample.db | S | Script de backup automático |
| 7 | Testes de integração | M | Testes para consultas e assinaturas |
| 8 | Corrigir workflow startup | S | Script de cleanup antes de iniciar |

### P2 - Melhorias

| # | Item | Estimativa | Descrição |
|---|------|------------|-----------|
| 9 | Rate limiting por IP | S | Middleware adicional |
| 10 | Dashboard de auditoria | M | Visualização de AuditLogs |
| 11 | Logs de ações admin | M | Registrar todas ações |
| 12 | Validação sample.db | S | Checksum/integridade |
| 13 | Documentação de API | M | Swagger/OpenAPI |
| 14 | Testes E2E | L | Cypress ou similar |

**Legenda de Estimativas:**
- **S** = Small (1-2 horas)
- **M** = Medium (4-8 horas)
- **L** = Large (2-5 dias)

---

## 4.9 Checklist de "Pronto para Produção"

### Segurança

| Item | Status | Ação Necessária |
|------|--------|-----------------|
| Auth implementado | ✅ | - |
| Roles/permissions | ✅ | - |
| Rate limiting | ✅ | Adicionar por IP |
| CSRF protection | ✅ | - |
| XSS protection | ✅ | - |
| SQL injection | ✅ | Eloquent ORM |
| Senha admin forte | ❌ | Trocar admin123 |
| HTTPS enforced | ❌ | Configurar em produção |
| Headers de segurança | ❌ | Adicionar CSP, HSTS |

### Observabilidade

| Item | Status | Ação Necessária |
|------|--------|-----------------|
| Logs de aplicação | ✅ | Laravel logs |
| Logs de consultas | ✅ | ConsultaHistory |
| Logs de auditoria | ⚠️ | Implementar uso do AuditLog |
| Métricas | ❌ | Implementar |
| Alertas | ❌ | Implementar |
| Health check | ✅ | /up |

### Consistência de Dados

| Item | Status | Ação Necessária |
|------|--------|-----------------|
| Migrations OK | ✅ | - |
| Seeders funcionais | ✅ | - |
| FK constraints | ✅ | - |
| Soft deletes | ✅ | - |
| Backup strategy | ❌ | Implementar |

### Testes Mínimos

| Item | Status | Ação Necessária |
|------|--------|-----------------|
| Unit tests | ⚠️ | Apenas básicos |
| Feature tests | ✅ | 25 testes passando (auth + profile) |
| Integration tests | ❌ | Implementar |
| E2E tests | ❌ | Implementar |
| Smoke tests | ❌ | Implementar |
| Test coverage > 60% | ❌ | Aumentar |

**Resultado atual dos testes:** ✅ 25 passed (61 assertions) - 2.84s

---

## Conclusão

O sistema M7consultas tem uma base sólida com arquitetura bem estruturada. O core de consultas funciona corretamente, o painel administrativo está completo, e a autenticação é robusta.

**Principais gaps para produção:**
1. Integração de pagamentos real (Stripe/MercadoPago)
2. Sistema de notificações por email
3. Cobertura de testes adequada
4. Estratégia de backup

**Recomendação:** Priorizar itens P0 e P1 antes de ir para produção.

---

*Documento gerado automaticamente em 15/12/2025*
