# NestJS — Padrões (V1)

## Validação

- Usar `ZodValidationPipe(schema)` nos endpoints.
- Não usar class-validator no V1.

## Rotas públicas

- público nunca escreve no Supabase diretamente
- sempre via NestJS (service role para DB)

## Erros padronizados

- 400: Zod validation failed (issues[])
- 403: assinatura SaaS bloqueada (PAST_DUE/EXPIRED)
- 409: horário indisponível (overlap)
- 409: já existe agendamento no dia (PUBLIC)
- 409: prazo excedido (cancelamento)

## Cancelamento público

- token longo e aleatório
- recomendado expirar (ex: start_at + 30 dias)
