# Roadmap — Treinly

## Milestone 1 (Sprint 1 recomendado)
- Monorepo
- packages/validation
- packages/db com Prisma base
- Supabase Auth (profissional)
- tenants + tenant_users
- CRUD services (painel)
- GET /public/:slug
- SSR /@slug mostrando serviços

## Milestone 2
- tenant_availability_rules + tenant_time_off
- availability service-aware (slot variável por serviço)
- POST /public/:slug/appointments com:
  - customer upsert
  - regra 1/dia (PUBLIC)
  - busy interval + EXCLUDE constraint

## Milestone 3
- token manage_url
- GET manage/:token
- cancel público (12h)
- plan_session_ledger + estorno

## Milestone 4
- agenda no painel (dia/semana)
- pendências PENDING
- ações rápidas (done/no-show/cancel/mark paid)

## Milestone 5
- billing SaaS (cartão recorrente)
- webhooks + status
- bloqueios por status
