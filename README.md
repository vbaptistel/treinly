# Treinly

SaaS **web-only** para profissionais de fitness (personal trainers, pequenas clínicas) gerenciarem agenda, sessões e cobrança de pacotes. Escopo V1: página pública de agendamento, controle de sessões, status de cobrança e cancelamento via link.

> **Agenda organizada + controle de sessões + previsibilidade.**

## Stack

| Camada    | Tecnologia |
| --------- | ---------- |
| Frontend  | Next.js 16 (App Router), React 19, Tailwind CSS |
| Backend   | NestJS (API única) |
| Banco/Auth| Supabase (Postgres + Supabase Auth) |
| ORM       | Prisma (migrações manuais para constraints EXCLUDE) |
| Validação | Zod em `packages/validation` (compartilhado front + API) |
| Forms     | React Hook Form + Zod Resolver |

## Estrutura do monorepo

```
apps/
  web/          # Next.js 16 (App Router)
  api/          # NestJS
packages/
  db/           # Prisma (schema + migrations)
  validation/   # Schemas Zod compartilhados
docs/           # Documentação de produto e técnica
```

## Pré-requisitos

- [Node.js](https://nodejs.org/) (LTS)
- [pnpm](https://pnpm.io/) 10.x (`corepack enable && corepack prepare pnpm@10.13.1 --activate`)
- Conta [Supabase](https://supabase.com/) (Postgres + Auth)

## Setup

1. **Clonar e instalar dependências**

   ```bash
   git clone <repo-url>
   cd treinly
   pnpm install
   ```

2. **Variáveis de ambiente**

   - Em `apps/api`: crie `.env` com `DATABASE_URL` e variáveis do Supabase (ver `docs/` ou exemplo em `.env.example` se existir).
   - Em `apps/web`: se a API for chamada em outro host/porta, configure conforme o projeto.

3. **Banco de dados**

   ```bash
   pnpm db:generate
   # Aplicar migrações: dentro de packages/db, conforme docs (Prisma + passos manuais para EXCLUDE)
   ```

4. **Rodar em desenvolvimento**

   ```bash
   pnpm dev
   ```

   Sobe o Next.js e o NestJS em paralelo. Web em geral em `http://localhost:3000`, API em outra porta (ver `apps/api`).

## Scripts principais

| Comando            | Descrição |
| ------------------ | --------- |
| `pnpm dev`         | Sobe web + API em modo desenvolvimento |
| `pnpm dev:web`     | Apenas Next.js |
| `pnpm dev:api`     | Apenas NestJS |
| `pnpm build`       | Build de validation, web e api |
| `pnpm db:generate` | Gera cliente Prisma em `packages/db` |

## Documentação

- **Arquitetura e contratos:** `docs/ARCHITECTURE.md`, `docs/API_CONTRACTS.md`, `docs/DATA_MODEL.md`
- **Regras de negócio e padrões:** `AGENTS.md`, `CLAUDE.md` (para contribuição/IA)
- **Acompanhamento de implementação:** `docs/IMPLEMENTATION_TRACKER.md`

## Licença

ISC (conforme `package.json`).
