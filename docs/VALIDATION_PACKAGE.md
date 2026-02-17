# packages/validation — Zod compartilhado

## Estrutura

```
/packages/validation/src
  index.ts
  public.ts
  app.ts
  common.ts
```

## Esquemas públicos (V1)

- `PublicCreateAppointmentSchema`:
  - serviceId (uuid)
  - startAt (ISO datetime)
  - fullName (min 3)
  - phone (raw string)
  - email? notes?

- `PublicCancelAppointmentSchema`:
  - reason?

## Esquemas do painel (app.ts)

- `CreateServiceSchema` / `UpdateServiceSchema` — CRUD de serviços.
- `AppointmentsQuerySchema` — filtro por `from`/`to` (datetime).
- `PatchAppointmentSchema` — ações: cancel, no_show, done, set_billing.
- `CreateCustomerSchema` — nome, telefone, email?, notes?.
- `CreatePlanSchema` — type (PACKAGE/MONTHLY), sessionsTotal, validUntil.
- `InviteMemberSchema` — `{ email, role }` (role: `OWNER` | `MEMBER`, default `MEMBER`).
- `UpdateMemberRoleSchema` — `{ role }` (role: `OWNER` | `MEMBER`). Nota: `PLATFORM_ADMIN` não é atribuível via invite.

## Política de telefone

- Zod valida apenas presença e tamanho mínimo.
- Normalização para E.164 é no backend (defensiva).
