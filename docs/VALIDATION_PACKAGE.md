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

## Política de telefone

- Zod valida apenas presença e tamanho mínimo.
- Normalização para E.164 é no backend (defensiva).
