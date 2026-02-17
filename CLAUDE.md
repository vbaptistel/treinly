# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Treinly is a **web-only SaaS** for fitness professionals (personal trainers, small clinics) to manage scheduling and session/package billing. V1 scope: public booking page, session control, billing status, and cancellation via link.

**All documentation is in Portuguese (pt-BR).** Follow this convention for user-facing strings and comments.

## Tech Stack

- **Frontend:** Next.js 16 (App Router) — SSR for public pages, client components for wizard
- **Backend:** NestJS (sole API, service role for DB access)
- **DB/Auth:** Supabase (Postgres + Supabase Auth)
- **ORM:** Prisma (with manual SQL migrations for EXCLUDE constraints)
- **Validation:** Zod schemas shared via `packages/validation` — single source of truth for both frontend and backend
- **Forms:** React Hook Form + Zod Resolver

## Monorepo Structure

```
/apps/site         # Next.js 16 — app para clientes (agendamento público, temas, gerenciar agendamento)
/apps/admin        # Next.js 16 — painel do profissional (agenda, pendências, clientes)
/apps/api          # NestJS (Prisma schema + migrations in apps/api/prisma/)
/packages/validation  # Shared Zod schemas
/docs              # Product and technical documentation
```

## Scaffolding & CLI

**Use CLIs to create apps and packages; avoid manual scaffolding.** Examples:
- Monorepo: `pnpm init`, `pnpm-workspace.yaml`
- Next.js: `pnpm create next-app@latest apps/web --typescript --tailwind --eslint --app --use-pnpm`
- NestJS: `npx @nestjs/cli new api --package-manager pnpm --skip-git --directory apps/api`
- Prisma: `pnpm exec prisma init` (inside apps/api)
- Packages: `pnpm init` + `pnpm add <deps>` + `pnpm exec <tool> init`

## Build & Dev Commands

- `pnpm dev` — sobe site, admin e API em paralelo.
- `pnpm dev:site`, `pnpm dev:admin`, `pnpm dev:api` — sobem cada app isoladamente.
- `pnpm build` — build de validation, site, admin e api.

When building out, expect:
- Package manager workspace (pnpm/npm workspaces)
- `packages/validation` consumed by `apps/site`, `apps/admin` and `apps/api`
- Prisma commands run from `apps/api`

## Architecture (Critical Patterns)

### Multi-tenancy
- **Every domain table has `tenant_id`** — never omit it.
- Panel routes: resolve `tenant_id` from JWT via `tenant_users`.
- Public routes: resolve `tenant_id` from URL `slug`.
- All panel queries must filter by `tenant_id`.

### Roles & Autorização
- Roles do tenant (`OWNER`, `MEMBER`) vivem em `tenant_users.role` (banco).
- `PLATFORM_ADMIN` **não é role de tenant** — vive no `app_metadata` do Supabase Auth (`{ "platform_role": "PLATFORM_ADMIN" }`).
- Guard chain (ordem): `SupabaseAuthGuard` → `TenantGuard` → `SaasGuard` → `RolesGuard`.
- `TenantGuard`: se `app_metadata.platform_role === 'PLATFORM_ADMIN'`, seta `request.tenantId = null` e `request.tenantRole = 'PLATFORM_ADMIN'` (sem query em `tenant_users`).
- `SaasGuard`: pula checagem quando `tenantId = null` (PLATFORM_ADMIN).
- `RolesGuard`: checa `@Roles()` decorator contra `request.tenantRole`. Sem `@Roles()` = liberado para qualquer role autenticado.
- Use `@Roles('OWNER', 'PLATFORM_ADMIN')` para restringir endpoints. Nunca atribua `PLATFORM_ADMIN` via invite — role gerenciado via `supabase.auth.admin.updateUserById()`.

### Anti-Overbooking (DB-level)
- `EXCLUDE USING GIST` constraint on `appointments` using `tstzrange(busy_start_at, busy_end_at, '[)')` where `status = 'BOOKED'`.
- Prisma cannot create EXCLUDE constraints — add them in manual SQL migration steps after `prisma migrate`.
- `busy_start_at`/`busy_end_at` include service buffers (`buffer_before_minutes`, `buffer_after_minutes`).

### Dates & Timezones
- Store `timestamptz` in **UTC** in the database.
- Availability is calculated in **tenant's timezone** then converted to UTC.
- "1 booking per client per day" rule uses the **tenant's local day**, not UTC.

### Phone Normalization
- Frontend sends raw `phone`.
- Backend normalizes to `phone_e164` (E.164 format, e.g., `+5511999999999`).
- Customer dedup by `(tenant_id, phone_e164)`.

### Session Ledger
- Every change to `sessions_used` must have a corresponding `plan_session_ledger` entry.
- Booking: `delta=-1`, reason `BOOKED_CONSUME`.
- Cancellation refund: `delta=+1`, reason `CANCELED_REFUND`.
- Create/cancel appointment operations must be **atomic** (single transaction).

### Validation
- Use `ZodValidationPipe(schema)` in NestJS endpoints — **do not use class-validator**.
- Zod schemas live in `packages/validation` and are imported by both apps.

## Key Business Rules (V1)

- Public booking: 3-step wizard (service → slot → client data). Auto-creates customer via phone upsert.
- **1 booking per client per day** (public only; panel has no such restriction).
- Cancellation via public token link, allowed only until `cancel_before_hours` (default 12h) before appointment.
- If active plan with remaining sessions: consume on booking (`billing_status=COVERED`), refund on valid cancellation.
- If no plan/balance: booking allowed with `billing_status=PENDING`.

## API Error Conventions

- `400`: Zod validation failed (`issues[]`)
- `403`: SaaS subscription blocked (PAST_DUE/EXPIRED)
- `409`: time slot unavailable (overlap) / booking already exists today (1/day rule) / cancellation deadline exceeded

## Next.js Routing

**apps/site** (clientes):
- `/` — SSR public profile (slug via middleware: subdomínio / custom domain / `?_slug=` em dev)
- `/agendar` — SSR wrapper + client wizard
- `/m/apt/[token]` — SSR manage appointment
- Middleware injeta `x-tenant-slug` para rotas que precisam do tenant.

**apps/admin** (painel do profissional):
- `/` — agenda; `/pendencias` — pendências de pagamento; `/clientes`, `/clientes/[id]` — clientes
- Auth via cookie `sb-access-token` (Supabase); chamadas à API com `Authorization: Bearer <token>`.

Ambas as apps chamam a NestJS API (`NEXT_PUBLIC_API_URL`).

## Enums

| Entity | Field | Values |
|---|---|---|
| Appointment | status | `BOOKED`, `CANCELED`, `NO_SHOW`, `DONE` |
| Appointment | source | `PUBLIC`, `ADMIN` |
| Appointment | billing_status | `COVERED`, `PENDING`, `PAID_MANUAL`, `WAIVED` |
| SaaSSubscription | status | `TRIAL`, `ACTIVE`, `PAST_DUE`, `CANCELED`, `EXPIRED` |
| CustomerPlan | type | `PACKAGE`, `MONTHLY` |
| TenantUser | role | `OWNER`, `MEMBER`, `PLATFORM_ADMIN` |

## Security

- Public token must be random, unique, and should expire (e.g., `start_at + 30 days`).
- Panel always requires valid JWT (Supabase Auth).
- Public routes never write to Supabase directly — always through NestJS.
- PLATFORM_ADMIN é identificado via `app_metadata.platform_role` no Supabase Auth (não via `tenant_users`). Conceder via SDK ou SQL diretamente.
