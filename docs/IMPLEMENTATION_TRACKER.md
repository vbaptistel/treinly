# Implementação Treinly V1 — Tracker

Arquivo para acompanhar progresso. Marque com `[x]` quando concluído.

**Referência:** Especificação completa do hotsite (URLs por subdomínio/custom domain, temas default + branding, temas 100% custom, override por página, diagramas) em [docs/HOTSITE_THEMES.md](docs/HOTSITE_THEMES.md).

---

## Milestone 1 — Fundação

### Fase 1.1 — Monorepo
- [x] pnpm workspaces configurado
- [x] Estrutura `apps/web`, `apps/api`, `packages/db`, `packages/validation`
- [x] TypeScript compartilhado
- [x] ESLint e Prettier

### Fase 1.2 — packages/validation
- [x] Estrutura: `index.ts`, `common.ts`, `public.ts`, `app.ts`
- [x] `PublicCreateAppointmentSchema`
- [x] `PublicCancelAppointmentSchema`
- [x] Exportar tipos inferidos

### Fase 1.3 — packages/db
- [x] Prisma schema (tenants, tenant_users, services, customers, appointments, etc.)
- [x] Migration inicial via Prisma
- [x] Migration SQL manual: `btree_gist` + EXCLUDE constraint

### Fase 1.4 — Supabase Auth
- [x] Projeto Supabase criado
- [x] NestJS: validação de JWT
- [x] Resolver `tenant_id` via `tenant_users` no painel

### Fase 1.5 — CRUD Services (painel)
- [x] Módulo NestJS (ServicesController + ServicesService)
- [x] GET /services
- [x] POST /services
- [x] PATCH /services/:id
- [x] DELETE /services/:id (ou soft delete)

### Fase 1.6 — Página pública
- [x] GET /public/:slug (API)
- [x] SSR `app/(public)/[slug]/page.tsx`
- [x] Exibir serviços e CTA agendar
- Nota: migração para rotas sem slug + resolução por host (subdomínio/custom domain) e sistema de temas está no [Milestone 6](#milestone-6--hotsite-subdomínio-temas-e-branding).

---

## Milestone 2 — Agendamento público

### Fase 2.1 — Disponibilidade
- [x] Tabelas `tenant_availability_rules` e `tenant_time_off`
- [x] API GET /public/:slug/availability?serviceId=...&date=...
- [x] Cálculo de slots service-aware (slot_minutes, min_notice_minutes)
- [x] Considerar timezone do tenant

### Fase 2.2 — POST /public/:slug/appointments
- [x] Validação com PublicCreateAppointmentSchema
- [x] Upsert customer por (tenant_id, phone_e164)
- [x] Regra 1 agendamento/dia (PUBLIC)
- [x] busy_start_at / busy_end_at com buffers
- [x] Inserção respeitando EXCLUDE constraint
- [x] Ledger BOOKED_CONSUME se plano ativo com saldo
- [x] billing_status COVERED ou PENDING
- [x] Gerar public_manage_token e manageUrl
- [x] Tratar 409 overlap e 409 1/dia

### Fase 2.3 — Wizard frontend
- [x] Wizard 3 passos: serviço → data/slot → dados
- [x] React Hook Form + Zod Resolver
- [x] Chamada POST e tratamento de erros

---

## Milestone 3 — Cancelamento e ledger

### Fase 3.1 — manage_url
- [x] manageUrl no retorno do POST appointments

### Fase 3.2 — GET /public/appointments/manage/:token
- [x] Endpoint retorna status, tenantSlug, serviceName, startAt, canCancel, cancelBeforeHours
- [x] 404 para token inválido/expirado

### Fase 3.3 — Cancelamento público
- [x] POST /public/appointments/manage/:token/cancel
- [x] Validação prazo (cancel_before_hours)
- [x] status=CANCELED, canceled_by=PUBLIC
- [x] Ledger CANCELED_REFUND e estorno sessions_used
- [x] 409 prazo excedido

### Fase 3.4 — Página manage
- [x] SSR `app/(public)/m/apt/[token]/page.tsx`
- [x] Exibir dados do agendamento e botão cancelar

---

## Milestone 4 — Painel

### Fase 4.1 — GET /me
- [x] Retorna tenant + status assinatura SaaS

### Fase 4.2 — Agenda
- [x] GET /appointments?from=...&to=...
- [x] Página agenda dia/semana
- [x] Visualização de appointments

### Fase 4.3 — Pendências
- [x] Lista appointments PENDING
- [x] UI no painel

### Fase 4.4 — Ações rápidas
- [x] PATCH /appointments/:id: cancelar (ADMIN)
- [x] PATCH /appointments/:id: marcar no-show
- [x] PATCH /appointments/:id: marcar done
- [x] PATCH /appointments/:id: alterar billing_status (PAID_MANUAL, WAIVED)
- [x] UI com botões para cada ação

### Fase 4.5 — Customers e Plans
- [x] GET /customers
- [x] POST /customers
- [x] GET /customers/:id
- [x] POST /customers/:id/plans (PACKAGE/MONTHLY)

---

## Milestone 5 — Billing SaaS

### Fase 5.1 — Tabela e seed
- [x] saas_subscriptions no schema
- [x] Seed ou fluxo inicial TRIAL

### Fase 5.2 — Checkout
- [x] POST /billing/checkout-session
- [x] Integração com gateway (Stripe ou similar)

### Fase 5.3 — Webhooks
- [x] POST /billing/webhook
- [x] Atualizar saas_subscriptions.status
- [x] Assinatura de webhook

### Fase 5.4 — Bloqueios
- [x] Guard/middleware checar status
- [x] TRIAL/ACTIVE: acesso total
- [x] PAST_DUE: política definida
- [x] CANCELED/EXPIRED: bloqueio ou só leitura

---

## Milestone 6 — Hotsite (subdomínio, temas e branding)

Implementação do plano em [docs/HOTSITE_THEMES.md](docs/HOTSITE_THEMES.md): URLs por subdomínio/custom domain (sem slug na URL), tema default com branding (imagens, fontes, cores) e temas 100% custom com override por página.

### Fase 6.1 — Resolução por host (middleware)
- [ ] Middleware Next.js: resolver Host da requisição → slug
- [ ] Subdomínio: convenção (ex. `joao.treinly.com` → slug `joao`)
- [ ] Custom domain: tabela ou campo (ex. `tenant_custom_domains` ou `tenant.custom_domain`) e lookup/cache
- [ ] Injetar slug (ou tenant_id) em header/context para as páginas

### Fase 6.2 — Rotas públicas sem slug na URL
- [ ] Migrar/duplicar para rotas sem `[slug]`: `(public)/page.tsx` (perfil) e `(public)/agendar/page.tsx`
- [ ] Slug obtido do contexto (middleware); 404 ou fallback quando host não resolver para tenant
- [ ] Manter compatibilidade ou desativar rotas antigas `(public)/[slug]/...` conforme decisão de produto

### Fase 6.3 — Modelo de dados: temas e branding
- [ ] Schema: `public_theme_id` (string, default `"default"`), `public_page_themes` (JSON opcional)
- [ ] Schema: branding para tema default — `public_branding` (JSON) ou campos (logo_url, hero_image_url, primary_color, font_heading, font_body, etc.)
- [ ] API GET `/public/:slug`: incluir `themeId`, `pageThemes`, `branding` na resposta

### Fase 6.4 — Tema default parametrizado por branding
- [ ] Tema `themes/default/`: ProfilePage e AgendarPage (ou wizard compartilhado) recebem `tenant.branding`
- [ ] Aplicar imagens (logo, hero), fontes e cores via CSS variables / props
- [ ] Resolver `themeId` efetivo por página: `pageThemes[pageKey] ?? themeId`

### Fase 6.5 — Registry de temas e carregamento por página
- [ ] Carregar componente do tema por (themeId, pageKey) — dynamic import ou registry
- [ ] Fallback: página não existente no tema custom → tema base
- [ ] Documentar interface mínima por página (props) e convenção de pastas

### Fase 6.6 — Painel: edição de branding (opcional V1)
- [ ] CRUD ou edição de branding no painel (logo, cores, fontes) para tema default
- [ ] Persistir em `public_branding` ou campos do tenant

### Fase 6.7 — Temas 100% custom (quando houver demanda)
- [ ] Criar `themes/custom-<id>/` com páginas customizadas (ex. ProfilePage.tsx)
- [ ] Configurar `themeId` e `pageThemes` no tenant para usar tema custom

---

## Resumo por Milestone

| Milestone | Fases | Concluído |
|-----------|-------|-----------|
| M1 Fundação | 6 | 6/6 |
| M2 Agendamento | 3 | 3/3 |
| M3 Cancelamento | 4 | 4/4 |
| M4 Painel | 5 | 5/5 |
| M5 Billing | 4 | 4/4 |
| M6 Hotsite (subdomínio, temas, branding) | 7 | 0/7 |
