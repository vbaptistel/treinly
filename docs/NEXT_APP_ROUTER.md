# Next.js 16 App Router — Rotas e SSR/CSR

## Rotas públicas

- `app/(public)/@slug/page.tsx` (SSR): perfil público (SEO)
- `app/(public)/@slug/agendar/page.tsx` (SSR wrapper): pré-carrega services e renderiza wizard client
- `app/(public)/m/apt/[token]/page.tsx` (SSR): gerenciar agendamento

> Observação: o uso de `@slug` como prefixo é recomendado para evitar colisão com rotas fixas (`/app`, `/pricing`, etc).

## Wizard (3 passos)

1. Serviço
2. Data/slot (availability do backend)
3. Dados (React Hook Form + Zod)

Tratamento de erros no submit:
- 409 overlap → voltar para passo 2
- 409 1/dia → manter no passo 3 com mensagem

## Painel

- `/app/*` protegido por middleware (sessão Supabase)
- Layout próprio em `app/(app)/app/layout.tsx`

## Comunicação com API

- Next chama sempre o Nest:
  - público sem auth
  - painel com `Authorization: Bearer <supabase_jwt>`
