const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkDatabase() {
  console.log('🔍 Inspecting Neon PostgreSQL Database...');
  const trackers = await prisma.tracker.findMany({
    include: { recipients: { include: { openLogs: true } } },
  });

  console.log(`Total Trackers in Neon: ${trackers.length}`);
  trackers.forEach((t) => {
    console.log(`\nTracker: "${t.title}" (ID: ${t.id})`);
    t.recipients.forEach((r) => {
      console.log(`  - Recipient: ${r.email}`);
      console.log(`    Token: ${r.token}`);
      console.log(`    Open Count: ${r.openCount}`);
      console.log(`    Open Logs: ${r.openLogs.length}`);
    });
  });
}

checkDatabase().finally(() => prisma.$disconnect());
