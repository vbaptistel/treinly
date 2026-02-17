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
