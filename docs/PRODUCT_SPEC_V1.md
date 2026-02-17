# Especificação Funcional — V1 (enxuto)

## Persona

- Profissional (Tenant Owner)
- Cliente final (público, sem login)

## Módulos do V1

### Público
- Página do profissional: descrição + serviços + CTA agendar
- Agendamento 3 passos
- Cancelamento por link/token

### Painel
- Serviços (CRUD)
- Agenda (dia/semana; lista já serve no V1)
- Clientes (lista e detalhes)
- Planos do cliente (criar pacote/mensalidade)
- Pendências (appointments PENDING)
- Assinatura do SaaS (status)

## Regras de negócio

- 1 agendamento por cliente por dia (PUBLIC)
- Conflito de agenda nunca permitido (DB constraint)
- Cancelamento público até 12h antes
- Se plano ativo e saldo: consome sessão ao agendar; estorna ao cancelar dentro do prazo
- Se não tem plano/saldo: agendamento permitido e marca PENDING
