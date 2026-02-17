# NestJS — Padrões (V1)

## Validação

- Usar `ZodValidationPipe(schema)` nos endpoints.
- Não usar class-validator no V1.

## Guard chain (global)

Registrados em `app.module.ts` via `APP_GUARD`, executados nesta ordem:

1. **SupabaseAuthGuard** — valida JWT, seta `request.user = { id, email, platformRole }`.
2. **TenantGuard** — resolve `tenantId` + `tenantRole` via `tenant_users` (ou `app_metadata` para PLATFORM_ADMIN).
3. **SaasGuard** — bloqueia mutations para subscriptions PAST_DUE e bloqueia tudo para CANCELED/EXPIRED.
4. **RolesGuard** — checa `@Roles()` decorator contra `request.tenantRole`. Sem `@Roles()` = liberado.

Todos os guards pulam rotas marcadas com `@Public()`.

## Decorators disponíveis

| Decorator | Tipo | Descrição |
|---|---|---|
| `@Public()` | Metadata | Pula todos os guards |
| `@Roles('OWNER', 'PLATFORM_ADMIN')` | Metadata | Restringe por role |
| `@CurrentUser()` | Param | `{ id, email, platformRole }` |
| `@CurrentTenantId()` | Param | `string \| null` (null para PLATFORM_ADMIN sem tenant) |
| `@CurrentTenantRole()` | Param | `Role` (`OWNER`, `MEMBER`, `PLATFORM_ADMIN`) |

## Rotas públicas

- público nunca escreve no Supabase diretamente
- sempre via NestJS (service role para DB)

## Erros padronizados

- 400: Zod validation failed (issues[])
- 400: PLATFORM_ADMIN sem `?tenantId` em rota que exige tenant
- 403: acesso negado (role insuficiente)
- 403: assinatura SaaS bloqueada (PAST_DUE/EXPIRED)
- 409: horário indisponível (overlap)
- 409: já existe agendamento no dia (PUBLIC)
- 409: prazo excedido (cancelamento)
- 409: email já é membro do tenant (invite duplicado)

## Cancelamento público

- token longo e aleatório
- recomendado expirar (ex: start_at + 30 dias)

## Padrão de tenant resolution para PLATFORM_ADMIN

Endpoints que operam sobre um tenant específico devem aceitar `?tenantId=` como query param:

```ts
private resolveTargetTenantId(
  guardTenantId: string | null,
  guardRole: Role,
  queryTenantId?: string,
): string {
  if (guardRole === 'PLATFORM_ADMIN') {
    if (queryTenantId) return queryTenantId;
    if (!guardTenantId) throw new BadRequestException('...');
  }
  return guardTenantId!;
}
```

- **PLATFORM_ADMIN**: usa `?tenantId` se fornecido, senão `400` se não tem tenant próprio.
- **OWNER/MEMBER**: sempre usa o próprio `tenantId` do guard (ignora query param).
