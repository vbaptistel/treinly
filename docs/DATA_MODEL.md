# Modelo de Dados — Treinly V1

## Entidades principais

- Tenant (profissional)
- TenantUser (ligação usuário→tenant, role, email)
- Service (serviços, duração, slot variável, buffers, notice)
- Customer (cliente; dedupe por telefone)
- Appointment (agendamento; anti-overlap no DB; token público)
- CustomerPlan (pacote/mensalidade do aluno)
- PlanSessionLedger (consumo/estorno auditável)
- SaaSSubscription (assinatura do profissional - recorrente)

## Chaves e índices importantes

- `customers`: unique (tenant_id, phone_e164)
- `appointments`: index (tenant_id, start_at)
- `appointments`: EXCLUDE constraint por tenant_id e range busy_* quando status=BOOKED
- `plan_session_ledger`: unique (appointment_id, reason)

## Telefone e dedupe

- Backend normaliza `phone` para `phone_e164`.
- Upsert por `(tenant_id, phone_e164)`.

## Roles

- `tenant_users.role`: `OWNER`, `MEMBER`, `PLATFORM_ADMIN` (enum no Prisma).
- `OWNER` e `MEMBER` são roles de tenant — armazenados em `tenant_users`.
- `PLATFORM_ADMIN` existe no enum para tipagem, mas na prática vive em `app_metadata` do Supabase Auth.
- `tenant_users.email`: armazenado na criação (invite) para facilitar listagem sem join com `auth.users`.
