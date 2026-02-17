# Arquitetura — Treinly (V1)

## Visão geral

**Next.js 16 (Web)** → **NestJS (API)** → **Supabase Postgres**

- `/{slug}` (página pública) é SSR.
- `/{slug}/agendar` é um wizard client, com `services` pré-carregados via SSR.
- Persistência apenas via API do NestJS.

## Multi-tenancy

Estratégia:
- **Single DB, shared schema**
- Todas as tabelas do domínio possuem `tenant_id`.
- Painel: tenant obtido via `tenant_users` usando `user_id` do JWT.
- Público: tenant obtido via `slug`.

## Fluxos principais

### Fluxo A — Visitante → Agendamento
1. Visita `/{slug}`
2. Seleciona serviço
3. Seleciona data/slot
4. Preenche nome/telefone/email
5. API cria (transação):
   - upsert `customer` por `(tenant_id, phone_e164)`
   - valida regra 1/dia (PUBLIC)
   - cria `appointment` com `source=PUBLIC`
   - se houver plano ativo com saldo: consome sessão (ledger) e marca `billing_status=COVERED`
   - senão: `billing_status=PENDING`
6. Retorna `manage_url` com token

### Fluxo B — Cancelamento público
1. Cliente abre `manage_url` (`/m/apt/{token}`)
2. API valida token + regra 12h
3. Se pode cancelar:
   - seta `status=CANCELED`, `canceled_by=PUBLIC`
   - se existiu consumo (ledger BOOKED_CONSUME): cria ledger CANCELED_REFUND e decrementa `sessions_used`

### Fluxo C — Operação do profissional (painel)
- Agenda dia/semana
- Lista de pendências (billing_status=PENDING)
- Ações rápidas: cancelar, no-show, done, marcar pago/isentar

## Padrões de integridade

### Anti-overbooking (DB)
- `appointments_no_overlap` via `EXCLUDE USING GIST` em range `[busy_start_at, busy_end_at)` para status BOOKED.
- `busy_start_at/busy_end_at` incluem buffers do serviço.

### Ledger de sessões
- Toda alteração de `sessions_used` deve ter registro em `plan_session_ledger`.
- Consumo: `delta=-1` e reason `BOOKED_CONSUME`
- Estorno: `delta=+1` e reason `CANCELED_REFUND`

## Roles & Autorização

### Roles de tenant
- `OWNER` e `MEMBER` — armazenados em `tenant_users.role`.
- Resolvidos pelo `TenantGuard` via query em `tenant_users` a cada request.

### PLATFORM_ADMIN
- Não pertence a nenhum tenant — role especial para administração da plataforma.
- Armazenado no `app_metadata` do Supabase Auth: `{ "platform_role": "PLATFORM_ADMIN" }`.
- `TenantGuard` detecta via `request.user.platformRole` (retornado por `SupabaseService.verifyToken()`).
- Quando identificado: `request.tenantId = null`, `request.tenantRole = 'PLATFORM_ADMIN'`.
- Pula checagem de SaaS subscription (`SaasGuard` retorna `true` quando `tenantId` é `null`).
- Conceder role: `supabase.auth.admin.updateUserById(id, { app_metadata: { platform_role: 'PLATFORM_ADMIN' } })`.

### Guard chain (ordem de execução)
1. `SupabaseAuthGuard` — valida JWT, seta `request.user = { id, email, platformRole }`.
2. `TenantGuard` — resolve `tenantId` + `tenantRole` (via `tenant_users` ou `app_metadata`).
3. `SaasGuard` — bloqueia tenants com subscription expirada/cancelada.
4. `RolesGuard` — checa `@Roles()` decorator contra `request.tenantRole`.

### Decorator @Roles()
- Sem `@Roles()` no controller/handler = liberado para qualquer role autenticado.
- `@Roles('OWNER', 'PLATFORM_ADMIN')` = somente OWNER e PLATFORM_ADMIN.
- `PLATFORM_ADMIN` nunca é atribuído via invite — gerenciado manualmente.

## Convite de membros do tenant (login e senha)

1. OWNER/PLATFORM_ADMIN chama `POST /tenant-members` com email e role.
2. API chama `Supabase Auth: inviteUserByEmail(email, { redirectTo })`. O `redirectTo` é montado a partir de `ADMIN_APP_URL` (ex.: `https://admin.treinly.com/auth/confirmar-convite`).
3. O convidado recebe o e-mail do Supabase com um link. Ao clicar, é redirecionado para a URL acima com tokens no hash.
4. A página **Confirmar convite** (`/auth/confirmar-convite`) lê o hash, chama `setSession`, exibe o formulário **Definir senha** e, após `updateUser({ password })`, grava o token no cookie e redireciona para a agenda.
5. Nos acessos seguintes, o membro usa a página **Login** (`/login`) com e-mail e senha.

**Variáveis de ambiente:**

- **API:** `ADMIN_APP_URL` — URL base do app admin (ex.: `http://localhost:3000` em dev). Usada para montar o `redirectTo` do convite. O Supabase exige que essa URL de redirect esteja em **Authentication → URL Configuration → Redirect URLs**.
- **Admin:** `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` — para o cliente Supabase no browser (login e confirmar-convite).

## Componentes por módulo (monolito modular)

- Auth & Tenant
- Tenant Members (CRUD + invite)
- Public Pages
- Scheduling
- Customers
- Plans
- Billing (SaaS subscription)
- Notifications (futuro)

## Observação sobre RLS

RLS no Supabase é recomendado, mas no V1 pode ser implementado em etapa posterior se:
- **Somente** o NestJS acessar o DB via service role
- E todas as queries forem filtradas por `tenant_id` corretamente

Para SaaS “real”, a defesa em profundidade é ideal:
- RLS + validação no Nest.
