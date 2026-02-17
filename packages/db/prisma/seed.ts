import { PrismaClient } from '../generated/prisma/client.js';

const prisma = new PrismaClient();

async function main() {
  // Ensure every tenant has a saas_subscription (TRIAL by default)
  const tenants = await prisma.tenant.findMany({
    select: { id: true },
  });

  for (const tenant of tenants) {
    await prisma.saasSubscription.upsert({
      where: { tenantId: tenant.id },
      update: {},
      create: {
        tenantId: tenant.id,
        status: 'TRIAL',
        trialEndsAt: new Date(Date.now() + 14 * 24 * 60 * 60_000), // 14 days
      },
    });
  }

  console.log(`Seeded ${tenants.length} tenant subscription(s).`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
