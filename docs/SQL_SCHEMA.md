# SQL Schema (Supabase) — V1

> Observação: este schema é compatível com a estratégia definida (EXCLUDE constraint).
> Execute em um migration step no Supabase, ou use Prisma + migration SQL manual para a constraint.

```sql
-- Tenants
create table treinly.tenants (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  timezone text not null default 'America/Sao_Paulo',
  rules jsonb not null default jsonb_build_object(
    'cancel_before_hours', 12,
    'package_validity_days_default', 60,
    'min_notice_minutes_default', 120
  ),
  created_at timestamptz not null default now()
);

-- Tenant users (professional accounts)
create table treinly.tenant_users (
  tenant_id uuid not null references treinly.tenants(id) on delete cascade,
  user_id uuid not null, -- supabase auth.users.id
  role text not null default 'OWNER',
  created_at timestamptz not null default now(),
  primary key (tenant_id, user_id)
);

-- Services
create table treinly.services (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references treinly.tenants(id) on delete cascade,
  name text not null,
  duration_minutes int not null check (duration_minutes > 0),
  slot_minutes int not null check (slot_minutes > 0),
  min_notice_minutes int not null default 120 check (min_notice_minutes >= 0),
  buffer_before_minutes int not null default 0 check (buffer_before_minutes >= 0),
  buffer_after_minutes int not null default 0 check (buffer_after_minutes >= 0),
  price_cents int,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

-- Customers
create table treinly.customers (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references treinly.tenants(id) on delete cascade,
  full_name text not null,
  phone_e164 text not null,
  email text,
  notes text,
  created_at timestamptz not null default now(),
  unique (tenant_id, phone_e164)
);

-- Weekly availability windows
create table treinly.tenant_availability_rules (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references treinly.tenants(id) on delete cascade,
  weekday int not null check (weekday between 0 and 6),
  start_time time not null,
  end_time time not null,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  check (end_time > start_time)
);

-- Time off / blocks
create table treinly.tenant_time_off (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references treinly.tenants(id) on delete cascade,
  start_at timestamptz not null,
  end_at timestamptz not null,
  reason text,
  created_at timestamptz not null default now(),
  check (end_at > start_at)
);

-- Plans assigned to customers (packages/monthly)
create table treinly.customer_plans (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references treinly.tenants(id) on delete cascade,
  customer_id uuid not null references treinly.customers(id) on delete cascade,
  type text not null check (type in ('PACKAGE','MONTHLY')),
  sessions_total int not null check (sessions_total >= 0),
  sessions_used int not null default 0 check (sessions_used >= 0),
  valid_until date not null,
  status text not null default 'ACTIVE' check (status in ('ACTIVE','EXPIRED')),
  created_at timestamptz not null default now()
);

-- Appointments
create table treinly.appointments (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references treinly.tenants(id) on delete cascade,
  customer_id uuid not null references treinly.customers(id) on delete restrict,
  service_id uuid not null references treinly.services(id) on delete restrict,

  start_at timestamptz not null,
  end_at timestamptz not null,
  busy_start_at timestamptz not null,
  busy_end_at timestamptz not null,

  status text not null default 'BOOKED' check (status in ('BOOKED','CANCELED','NO_SHOW','DONE')),
  source text not null check (source in ('PUBLIC','ADMIN')),

  billing_status text not null default 'PENDING' check (billing_status in ('COVERED','PENDING','WAIVED','PAID_MANUAL')),

  public_manage_token text unique,
  public_manage_token_expires_at timestamptz,

  canceled_at timestamptz,
  canceled_by text check (canceled_by in ('PUBLIC','ADMIN')),
  canceled_reason text,

  created_at timestamptz not null default now(),

  check (end_at > start_at),
  check (busy_end_at > busy_start_at)
);

-- Prevent overlapping appointments per tenant (uses busy range)
create extension if not exists btree_gist;

alter table treinly.appointments
  add constraint appointments_no_overlap
  exclude using gist (
    tenant_id with =,
    tstzrange(busy_start_at, busy_end_at, '[)') with &&
  )
  where (status = 'BOOKED');

-- Ledger of session consumption/refund
create table treinly.plan_session_ledger (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references treinly.tenants(id) on delete cascade,
  customer_plan_id uuid not null references treinly.customer_plans(id) on delete cascade,
  appointment_id uuid references treinly.appointments(id) on delete cascade,
  delta int not null check (delta in (-1, 1)),
  reason text not null check (reason in ('BOOKED_CONSUME','CANCELED_REFUND','ADMIN_ADJUST')),
  created_at timestamptz not null default now(),
  unique (appointment_id, reason)
);

-- SaaS subscription status (professional billing)
create table treinly.saas_subscriptions (
  tenant_id uuid primary key references treinly.tenants(id) on delete cascade,
  status text not null check (status in ('TRIAL','ACTIVE','PAST_DUE','CANCELED','EXPIRED')),
  trial_ends_at timestamptz,
  current_period_end timestamptz,
  gateway_customer_id text,
  gateway_subscription_id text,
  created_at timestamptz not null default now()
);
```
