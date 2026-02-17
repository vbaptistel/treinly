# AGENTS.md — Diretrizes obrigatórias (Treinly)

Este documento define padrões obrigatórios para desenvolvimento do Treinly.

## 1) Filosofia do produto

Treinly não é ERP.
Treinly é:

> **Agenda organizada + controle de sessões + previsibilidade**.

Qualquer feature nova deve manter simplicidade e reduzir esforço operacional.

## 2) Scaffolding e criação de apps

- **Usar CLIs** para criar apps, packages e ferramentas — evitar criação manual.
- Exemplos: `create-next-app`, `nest new`, `prisma init`, `pnpm init`.
- Nunca criar scaffolds completos de apps (Next, Nest, etc.) manualmente quando existe CLI oficial.

## 3) Decisões fixas do projeto (V1)

- SaaS **web-only**
- **Next.js 16 App Router** (SSR no perfil público; wizard client no agendamento)
- **NestJS** como única API
- **Supabase Postgres** como DB
- **Prisma** como ORM
- **Zod** como fonte única de validação (compartilhado em `packages/validation`)
- **React Hook Form + Zod** no frontend
- Modelo de receita: **mensalidade do profissional** (cartão recorrente)

## 4) Multi-tenancy

- Todas as tabelas de domínio possuem `tenant_id`.
- Toda query do painel deve filtrar por `tenant_id` do usuário autenticado.
- Rotas públicas resolvem `tenant_id` pelo `slug`.

Nunca remover `tenant_id` do domínio.

## 5) Regras de negócio (V1)

### Agendamento público
- Wizard em 3 passos: serviço → horário → dados
- **Cria customer automaticamente** (upsert por telefone)
- **1 agendamento por cliente por dia** (apenas público)
- Se não houver plano/saldo: agendamento permitido com `billing_status=PENDING`

### Cancelamento público
- Via token de gerenciamento (link)
- Permitido apenas até `cancel_before_hours` (default 12h)
- Cancelamento dentro do prazo **estorna sessão** se houve consumo

### Sessões (pacotes/mensalidades)
- Consumo no momento do agendamento (BOOKED)
- Estorno no cancelamento válido
- Ledger é obrigatório (auditável)

## 6) Integridade e concorrência

- Overbooking deve ser impedido no **banco** via **EXCLUDE constraint** com `tstzrange`.
- Não confiar apenas em checagem na aplicação.

## 7) Datas e timezone

- Armazenar `timestamptz` em UTC.
- Disponibilidade deve ser calculada no timezone do tenant e convertida para UTC.
- Regra “1 por dia” é baseada no **dia local do tenant** (não em UTC).

## 8) Telefone

- Front envia `phone` raw.
- Backend normaliza para `phone_e164` (E.164).
- Dedupe por `(tenant_id, phone_e164)`.

## 9) Status (enums do V1)

### Appointment.status
- `BOOKED`
- `CANCELED`
- `NO_SHOW`
- `DONE`

### Appointment.source
- `PUBLIC`
- `ADMIN`

### Appointment.billing_status
- `COVERED`
- `PENDING`
- `PAID_MANUAL`
- `WAIVED`

### SaaSSubscription.status
- `TRIAL`
- `ACTIVE`
- `PAST_DUE`
- `CANCELED`
- `EXPIRED`

## 10) Segurança mínima

- Token público deve ser aleatório, único e (preferencialmente) expirar.
- Painel sempre requer JWT válido (Supabase Auth).
- Rotas públicas nunca escrevem direto no Supabase; sempre via NestJS.
