# API Contracts — Treinly V1

Base URL (exemplo): `https://api.treinly.com`

## Público

### GET /public/:slug
**Resposta**
```json
{
  "tenant": { "name": "Flávio", "slug": "flavio", "timezone": "America/Sao_Paulo", "rules": { "cancel_before_hours": 12 } },
  "services": [
    { "id": "uuid", "name": "Avaliação", "durationMinutes": 60, "slotMinutes": 30, "minNoticeMinutes": 120, "priceCents": 15000 }
  ]
}
```

### GET /public/:slug/availability?serviceId=...&date=YYYY-MM-DD
**Resposta**
```json
{
  "date": "2026-02-17",
  "slots": ["2026-02-17T13:00:00.000Z", "2026-02-17T13:30:00.000Z"]
}
```

### POST /public/:slug/appointments
Validação: `PublicCreateAppointmentSchema` (packages/validation)

**Body**
```json
{
  "serviceId": "uuid",
  "startAt": "2026-02-17T13:00:00.000Z",
  "fullName": "João da Silva",
  "phone": "(11) 99999-9999",
  "email": "joao@email.com",
  "notes": "Objetivo: performance"
}
```

**Resposta**
```json
{
  "appointmentId": "uuid",
  "billingStatus": "PENDING",
  "manageToken": "token",
  "manageUrl": "/m/apt/token"
}
```

**Erros**
- 400 validation failed (issues[])
- 403 assinatura inválida (PAST_DUE/EXPIRED)
- 409 horário indisponível (overlap)
- 409 já existe agendamento no dia (regra 1/dia PUBLIC)

### GET /public/appointments/manage/:token
**Resposta**
```json
{
  "status": "BOOKED",
  "tenantSlug": "flavio",
  "serviceName": "Avaliação",
  "startAt": "2026-02-17T13:00:00.000Z",
  "canCancel": true,
  "cancelBeforeHours": 12
}
```

### POST /public/appointments/manage/:token/cancel
Validação: `PublicCancelAppointmentSchema`

**Body**
```json
{ "reason": "Imprevisto" }
```

**Resposta**
```json
{ "status": "CANCELED" }
```

**Erros**
- 404 token inválido/expirado
- 409 prazo excedido

## Painel (auth required)

Authorization: `Bearer <supabase_jwt>`

### GET /me
Retorna tenant do usuário + status da assinatura SaaS.

### CRUD /services
- GET /services
- POST /services
- PATCH /services/:id
- DELETE /services/:id (ou soft delete)

### Customers
- GET /customers
- POST /customers
- GET /customers/:id

### Appointments
- GET /appointments?from=...&to=...
- PATCH /appointments/:id
  - cancelar (ADMIN)
  - marcar no-show
  - marcar done
  - alterar billing_status (PAID_MANUAL/WAIVED)

### Plans
- POST /customers/:id/plans
  - cria PACKAGE/MONTHLY
  - define sessions_total, valid_until
  - (futuro) renovar

### Customer Invite
- POST /customers/:id/invite
  - Convida customer para criar conta no Supabase Auth (email + senha)
  - Sem body — usa o email já cadastrado no customer
  - Cria conta no Supabase Auth (ou reutiliza se email já existe) e vincula `user_id` ao customer
  - **Erros:**
    - 400: cliente sem email cadastrado
    - 404: cliente não encontrado
    - 409: cliente já possui conta (`user_id` já preenchido)

### Tenant Members (OWNER e PLATFORM_ADMIN)

Requer `@Roles('OWNER', 'PLATFORM_ADMIN')`.
PLATFORM_ADMIN pode operar em qualquer tenant via `?tenantId=`.

- GET /tenant-members`(?tenantId=)` — listar membros do tenant
- POST /tenant-members`(?tenantId=)` — convidar membro (envia email via Supabase Auth)
  - Body: `{ "email": "novo@email.com", "role": "MEMBER" }` (role: `OWNER` | `MEMBER`, default `MEMBER`)
  - 409: email já é membro do tenant
- PATCH /tenant-members/:userId`(?tenantId=)` — atualizar role
  - Body: `{ "role": "OWNER" }`
  - 400: não pode alterar o próprio role
- DELETE /tenant-members/:userId`(?tenantId=)` — remover membro
  - 400: não pode remover a si mesmo
  - 400: não pode remover o último OWNER

## Billing SaaS

### POST /billing/checkout-session
Inicia checkout/portal do gateway de cobrança (cartão recorrente).

### POST /billing/webhook
Recebe eventos do gateway e atualiza `saas_subscriptions.status`.

## Status & bloqueios (painel)

Recomendação:
- TRIAL/ACTIVE: acesso total
- PAST_DUE: leitura + sem criar novos agendamentos (ou bloquear painel, decisão do produto)
- CANCELED/EXPIRED: somente leitura ou bloqueado (definir política)
