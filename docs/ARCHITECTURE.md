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

## Componentes por módulo (monolito modular)

- Auth & Tenant
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
