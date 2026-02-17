# Modelo de Dados — Treinly V1

## Entidades principais

- Tenant (profissional)
- TenantUser (ligação usuário→tenant, role)
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
