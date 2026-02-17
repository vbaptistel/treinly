import { PrismaPg } from "@prisma/adapter-pg";
import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";

const SLUG_FLAVIO = "flavio-di-giovanni";

async function main() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("Variável DATABASE_URL não configurada.");
  }

  const adapter = new PrismaPg({ connectionString });
  const prisma = new PrismaClient({ adapter });

  // ─── Flávio Di Giovanni (https://treinly.vercel.app) ────────────────────

  const tenant = await prisma.tenant.upsert({
    where: { slug: SLUG_FLAVIO },
    update: {},
    create: {
      name: "Flávio Di Giovanni",
      slug: SLUG_FLAVIO,
      timezone: "America/Sao_Paulo",
      rules: {
        cancel_before_hours: 12,
        package_validity_days_default: 60,
        min_notice_minutes_default: 120,
      },
      publicThemeId: "default",
      publicBranding: {
        primaryColor: "#1a1a1a",
        secondaryColor: "#c9a227",
        backgroundColor: "#0f0f0f",
        textColor: "#f5f5f5",
        fontHeading: "Playfair Display, Georgia, serif",
        fontBody: "Inter, system-ui, sans-serif",
      },
    },
  });

  // Custom domain: treinly.vercel.app
  await prisma.tenantCustomDomain.upsert({
    where: { host: "treinly.vercel.app" },
    update: { tenantId: tenant.id },
    create: {
      tenantId: tenant.id,
      host: "treinly.vercel.app",
    },
  });

  // SaaS subscription (trial)
  await prisma.saasSubscription.upsert({
    where: { tenantId: tenant.id },
    update: {},
    create: {
      tenantId: tenant.id,
      status: "TRIAL",
      trialEndsAt: new Date(Date.now() + 14 * 24 * 60 * 60_000), // 14 dias
    },
  });

  // Serviços (baseado no site: treinos, consultoria, escaneamento 3D)
  const servicesData = [
    {
      name: "Sessão de Treino Personalizado",
      durationMinutes: 60,
      slotMinutes: 60,
      minNoticeMinutes: 120,
      priceCents: 15000, // R$150
    },
    {
      name: "Consultoria Online",
      durationMinutes: 60,
      slotMinutes: 60,
      minNoticeMinutes: 120,
      priceCents: 15000, // R$150
    },
    {
      name: "Escaneamento Corporal 3D (Bodygee)",
      durationMinutes: 30,
      slotMinutes: 30,
      minNoticeMinutes: 60,
      priceCents: null, // sob consulta
    },
  ];

  const existingServices = await prisma.service.findMany({
    where: { tenantId: tenant.id },
    select: { name: true },
  });
  const existingNames = new Set(existingServices.map((s) => s.name));
  for (const s of servicesData) {
    if (!existingNames.has(s.name)) {
      await prisma.service.create({
        data: {
          tenantId: tenant.id,
          ...s,
        },
      });
    }
  }

  // Disponibilidade: seg-sex 8h–18h
  const weekdays = [1, 2, 3, 4, 5]; // Mon-Fri
  for (const wd of weekdays) {
    const existing = await prisma.tenantAvailabilityRule.findFirst({
      where: { tenantId: tenant.id, weekday: wd },
    });
    if (!existing) {
      await prisma.tenantAvailabilityRule.create({
        data: {
          tenantId: tenant.id,
          weekday: wd,
          startTime: new Date("1970-01-01T08:00:00.000Z"),
          endTime: new Date("1970-01-01T18:00:00.000Z"),
        },
      });
    }
  }

  console.log(`Seeded tenant: ${tenant.name} (${tenant.slug})`);
  console.log(`  - Custom domain: treinly.vercel.app`);
  console.log(`  - Services: ${servicesData.length}`);
  console.log(`  - Availability: seg-sex 8h-18h`);

  // Ensure every other tenant has a saas_subscription (TRIAL by default)
  const allTenants = await prisma.tenant.findMany({
    select: { id: true },
  });

  for (const t of allTenants) {
    await prisma.saasSubscription.upsert({
      where: { tenantId: t.id },
      update: {},
      create: {
        tenantId: t.id,
        status: "TRIAL",
        trialEndsAt: new Date(Date.now() + 14 * 24 * 60 * 60_000),
      },
    });
  }

  console.log(`Total: ${allTenants.length} tenant(s) com subscription.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
