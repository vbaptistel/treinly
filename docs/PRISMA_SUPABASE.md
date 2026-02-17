# Prisma + Supabase — Notas

## Prisma schema

- Prisma cria a maior parte do schema, mas **não cria EXCLUDE constraints** nativamente.
- Recomendação:
  1. Rodar `prisma migrate`
  2. Adicionar migration SQL para:
     - `create extension btree_gist`
     - `EXCLUDE USING gist (...)`

## EXCLUDE constraint

Objetivo:
- impedir overlap em `appointments` por `tenant_id` mesmo sob concorrência.
- usar range `[busy_start_at, busy_end_at)`

## Transações

Criação/cancelamento devem ser atômicos:

- Create appointment + ledger consume + update sessions_used
- Cancel + ledger refund + update sessions_used

## Supabase Auth — app_metadata

- `SupabaseService.verifyToken()` retorna `{ id, email, platformRole }`.
- `platformRole` é extraído de `app_metadata.platform_role` do usuário Supabase.
- Único valor reconhecido: `'PLATFORM_ADMIN'` (demais retornam `null`).
- Para conceder: `supabase.auth.admin.updateUserById(id, { app_metadata: { platform_role: 'PLATFORM_ADMIN' } })`.
- `SupabaseService.inviteUserByEmail(email)` — cria usuário no Supabase Auth e envia email de convite. Retorna `{ id, email }`.
