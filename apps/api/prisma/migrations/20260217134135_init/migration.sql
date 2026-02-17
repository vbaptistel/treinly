-- CreateEnum
CREATE TYPE "role" AS ENUM ('OWNER', 'MEMBER');

-- CreateEnum
CREATE TYPE "appointment_status" AS ENUM ('BOOKED', 'CANCELED', 'NO_SHOW', 'DONE');

-- CreateEnum
CREATE TYPE "appointment_source" AS ENUM ('PUBLIC', 'ADMIN');

-- CreateEnum
CREATE TYPE "billing_status" AS ENUM ('COVERED', 'PENDING', 'PAID_MANUAL', 'WAIVED');

-- CreateEnum
CREATE TYPE "customer_plan_type" AS ENUM ('PACKAGE', 'MONTHLY');

-- CreateEnum
CREATE TYPE "customer_plan_status" AS ENUM ('ACTIVE', 'EXPIRED');

-- CreateEnum
CREATE TYPE "ledger_reason" AS ENUM ('BOOKED_CONSUME', 'CANCELED_REFUND', 'ADMIN_ADJUST');

-- CreateEnum
CREATE TYPE "saas_subscription_status" AS ENUM ('TRIAL', 'ACTIVE', 'PAST_DUE', 'CANCELED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "canceled_by" AS ENUM ('PUBLIC', 'ADMIN');

-- CreateTable
CREATE TABLE "tenants" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "timezone" TEXT NOT NULL DEFAULT 'America/Sao_Paulo',
    "rules" JSONB NOT NULL DEFAULT '{"cancel_before_hours":12,"package_validity_days_default":60,"min_notice_minutes_default":120}',
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "public_theme_id" TEXT NOT NULL DEFAULT 'default',
    "public_page_themes" JSONB,
    "public_branding" JSONB,

    CONSTRAINT "tenants_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tenant_users" (
    "tenant_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "role" "role" NOT NULL DEFAULT 'OWNER',
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tenant_users_pkey" PRIMARY KEY ("tenant_id","user_id")
);

-- CreateTable
CREATE TABLE "services" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "duration_minutes" INTEGER NOT NULL,
    "slot_minutes" INTEGER NOT NULL,
    "min_notice_minutes" INTEGER NOT NULL DEFAULT 120,
    "buffer_before_minutes" INTEGER NOT NULL DEFAULT 0,
    "buffer_after_minutes" INTEGER NOT NULL DEFAULT 0,
    "price_cents" INTEGER,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "services_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "customers" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "full_name" TEXT NOT NULL,
    "phone_e164" TEXT NOT NULL,
    "email" TEXT,
    "notes" TEXT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "customers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tenant_availability_rules" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "weekday" INTEGER NOT NULL,
    "start_time" TIME NOT NULL,
    "end_time" TIME NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tenant_availability_rules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tenant_time_off" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "start_at" TIMESTAMPTZ NOT NULL,
    "end_at" TIMESTAMPTZ NOT NULL,
    "reason" TEXT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tenant_time_off_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "customer_plans" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "customer_id" UUID NOT NULL,
    "type" "customer_plan_type" NOT NULL,
    "sessions_total" INTEGER NOT NULL,
    "sessions_used" INTEGER NOT NULL DEFAULT 0,
    "valid_until" DATE NOT NULL,
    "status" "customer_plan_status" NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "customer_plans_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "appointments" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "customer_id" UUID NOT NULL,
    "service_id" UUID NOT NULL,
    "start_at" TIMESTAMPTZ NOT NULL,
    "end_at" TIMESTAMPTZ NOT NULL,
    "busy_start_at" TIMESTAMPTZ NOT NULL,
    "busy_end_at" TIMESTAMPTZ NOT NULL,
    "status" "appointment_status" NOT NULL DEFAULT 'BOOKED',
    "source" "appointment_source" NOT NULL,
    "billing_status" "billing_status" NOT NULL DEFAULT 'PENDING',
    "public_manage_token" TEXT,
    "public_manage_token_expires_at" TIMESTAMPTZ,
    "canceled_at" TIMESTAMPTZ,
    "canceled_by" "canceled_by",
    "canceled_reason" TEXT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "appointments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "plan_session_ledger" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "customer_plan_id" UUID NOT NULL,
    "appointment_id" UUID,
    "delta" INTEGER NOT NULL,
    "reason" "ledger_reason" NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "plan_session_ledger_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "saas_subscriptions" (
    "tenant_id" UUID NOT NULL,
    "status" "saas_subscription_status" NOT NULL,
    "trial_ends_at" TIMESTAMPTZ,
    "current_period_end" TIMESTAMPTZ,
    "gateway_customer_id" TEXT,
    "gateway_subscription_id" TEXT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "saas_subscriptions_pkey" PRIMARY KEY ("tenant_id")
);

-- CreateTable
CREATE TABLE "tenant_custom_domains" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "host" TEXT NOT NULL,

    CONSTRAINT "tenant_custom_domains_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "tenants_slug_key" ON "tenants"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "customers_tenant_id_phone_e164_key" ON "customers"("tenant_id", "phone_e164");

-- CreateIndex
CREATE UNIQUE INDEX "appointments_public_manage_token_key" ON "appointments"("public_manage_token");

-- CreateIndex
CREATE INDEX "appointments_tenant_id_start_at_idx" ON "appointments"("tenant_id", "start_at");

-- CreateIndex
CREATE UNIQUE INDEX "plan_session_ledger_appointment_id_reason_key" ON "plan_session_ledger"("appointment_id", "reason");

-- CreateIndex
CREATE UNIQUE INDEX "tenant_custom_domains_host_key" ON "tenant_custom_domains"("host");

-- AddForeignKey
ALTER TABLE "tenant_users" ADD CONSTRAINT "tenant_users_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "services" ADD CONSTRAINT "services_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "customers" ADD CONSTRAINT "customers_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tenant_availability_rules" ADD CONSTRAINT "tenant_availability_rules_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tenant_time_off" ADD CONSTRAINT "tenant_time_off_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "customer_plans" ADD CONSTRAINT "customer_plans_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "customer_plans" ADD CONSTRAINT "customer_plans_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "customers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "customers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_service_id_fkey" FOREIGN KEY ("service_id") REFERENCES "services"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "plan_session_ledger" ADD CONSTRAINT "plan_session_ledger_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "plan_session_ledger" ADD CONSTRAINT "plan_session_ledger_customer_plan_id_fkey" FOREIGN KEY ("customer_plan_id") REFERENCES "customer_plans"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "plan_session_ledger" ADD CONSTRAINT "plan_session_ledger_appointment_id_fkey" FOREIGN KEY ("appointment_id") REFERENCES "appointments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "saas_subscriptions" ADD CONSTRAINT "saas_subscriptions_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tenant_custom_domains" ADD CONSTRAINT "tenant_custom_domains_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;
