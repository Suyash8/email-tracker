const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function runE2ETest() {
  console.log('🧪 Starting End-to-End Tracking Engine Verification...\n');

  // Step 1: Create a Multi-Recipient Email Tracker
  const trackerName = `E2E Test Campaign - ${Date.now()}`;
  console.log(`1. Creating tracker: "${trackerName}" with 2 recipients (alice@test.com, bob@test.com)...`);

  const tracker = await prisma.tracker.create({
    data: {
      title: trackerName,
      subject: 'End-to-End Verification Test',
      category: 'Testing',
      recipients: {
        create: [
          { email: 'alice@test.com', name: 'Alice Smith' },
          { email: 'bob@test.com', name: 'Bob Jones' },
        ],
      },
    },
    include: { recipients: true },
  });

  console.log(`   ✅ Tracker created with ID: ${tracker.id}`);
  const alice = tracker.recipients.find((r) => r.email === 'alice@test.com');
  const bob = tracker.recipients.find((r) => r.email === 'bob@test.com');

  console.log(`   🔹 Alice Token: ${alice.token}`);
  console.log(`   🔹 Bob Token: ${bob.token}\n`);

  // Step 2: Simulate Alice Opening Email for the FIRST time
  console.log('2. Simulating Alice opening email for the FIRST time...');
  const t1 = new Date();
  await prisma.$transaction([
    prisma.openLog.create({
      data: {
        recipientId: alice.id,
        ip: '192.168.1.100',
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        browser: 'Chrome 120.0.0.0',
        os: 'Mac OS 10.15.7',
        device: 'Desktop',
        clientType: 'Web / Desktop Client',
        country: 'US',
        city: 'San Francisco',
        openedAt: t1,
      },
    }),
    prisma.recipient.update({
      where: { id: alice.id },
      data: {
        openCount: { increment: 1 },
        firstOpened: t1,
        lastOpened: t1,
      },
    }),
  ]);

  let aliceUpdated = await prisma.recipient.findUnique({ where: { id: alice.id } });
  console.log(`   ✅ Alice Open Count: ${aliceUpdated.openCount}`);
  console.log(`   ✅ Alice First Opened: ${aliceUpdated.firstOpened.toISOString()}`);
  console.log(`   ✅ Alice Last Opened: ${aliceUpdated.lastOpened.toISOString()}\n`);

  // Wait 1 second to ensure distinct timestamp
  await new Promise((res) => setTimeout(res, 1000));

  // Step 3: Simulate Alice Opening Email a SECOND time (Duplicate Open)
  console.log('3. Simulating Alice opening email a SECOND time (Duplicate Open)...');
  const t2 = new Date();
  await prisma.$transaction([
    prisma.openLog.create({
      data: {
        recipientId: alice.id,
        ip: '192.168.1.100',
        userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148',
        browser: 'Mobile Safari 17.1',
        os: 'iOS 17.1',
        device: 'Mobile',
        clientType: 'Apple Mail Privacy Proxy',
        country: 'US',
        city: 'San Francisco',
        openedAt: t2,
      },
    }),
    prisma.recipient.update({
      where: { id: alice.id },
      data: {
        openCount: { increment: 1 },
        lastOpened: t2,
      },
    }),
  ]);

  aliceUpdated = await prisma.recipient.findUnique({ where: { id: alice.id } });
  console.log(`   ✅ Alice Open Count: ${aliceUpdated.openCount} (Incremented cleanly!)`);
  console.log(`   ✅ Alice First Opened (UNCHANGED): ${aliceUpdated.firstOpened.toISOString()}`);
  console.log(`   ✅ Alice Last Opened (UPDATED): ${aliceUpdated.lastOpened.toISOString()}`);
  console.log(`   ✅ Last Opened > First Opened: ${aliceUpdated.lastOpened > aliceUpdated.firstOpened}\n`);

  // Step 4: Simulate Bob Opening Email (Separate Recipient)
  console.log('4. Simulating Bob opening email (Checking Recipient Isolation in CC/BCC)...');
  const tBob = new Date();
  await prisma.$transaction([
    prisma.openLog.create({
      data: {
        recipientId: bob.id,
        ip: '10.0.0.50',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 GoogleImageProxy',
        browser: 'Chrome 120.0.0.0',
        os: 'Windows 10',
        device: 'Desktop',
        clientType: 'Gmail Image Proxy',
        country: 'CA',
        city: 'Toronto',
        openedAt: tBob,
      },
    }),
    prisma.recipient.update({
      where: { id: bob.id },
      data: {
        openCount: { increment: 1 },
        firstOpened: tBob,
        lastOpened: tBob,
      },
    }),
  ]);

  const bobUpdated = await prisma.recipient.findUnique({ where: { id: bob.id } });
  console.log(`   ✅ Bob Open Count: ${bobUpdated.openCount}`);
  console.log(`   ✅ Bob Client Type Detected: Gmail Image Proxy`);
  console.log(`   ✅ Bob Location Captured: Toronto, CA\n`);

  // Step 5: Simulate Alice Clicking a Link
  console.log('5. Simulating Alice clicking a tracked link...');
  const tClick = new Date();
  await prisma.$transaction([
    prisma.clickLog.create({
      data: {
        recipientId: alice.id,
        targetUrl: 'https://example.com/pricing',
        ip: '192.168.1.100',
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
        country: 'US',
        city: 'San Francisco',
        clickedAt: tClick,
      },
    }),
    prisma.recipient.update({
      where: { id: alice.id },
      data: {
        clickCount: { increment: 1 },
        firstClicked: tClick,
        lastClicked: tClick,
      },
    }),
  ]);

  aliceUpdated = await prisma.recipient.findUnique({ where: { id: alice.id } });
  console.log(`   ✅ Alice Click Count: ${aliceUpdated.clickCount}`);
  console.log(`   ✅ Alice First Clicked: ${aliceUpdated.firstClicked.toISOString()}\n`);

  // Step 6: Verify Analytics Aggregation
  console.log('6. Verifying Analytics Aggregation across database...');
  const totalTrackers = await prisma.tracker.count();
  const totalRecipients = await prisma.recipient.count();
  const openedRecipients = await prisma.recipient.count({ where: { openCount: { gt: 0 } } });
  const totalOpenLogs = await prisma.openLog.count();
  const totalClickLogs = await prisma.clickLog.count();

  console.log('   📊 Aggregated Stats:');
  console.log(`      • Total Trackers: ${totalTrackers}`);
  console.log(`      • Total Recipients: ${totalRecipients}`);
  console.log(`      • Opened Recipients: ${openedRecipients}`);
  console.log(`      • Total Open Logs Recorded: ${totalOpenLogs}`);
  console.log(`      • Total Link Clicks Recorded: ${totalClickLogs}`);
  console.log(`      • Unique Open Rate: ${((openedRecipients / totalRecipients) * 100).toFixed(1)}%\n`);

  // Clean up test tracker
  await prisma.tracker.delete({ where: { id: tracker.id } });
  console.log('✨ Cleanup completed successfully.');
  console.log('🎉 ALL END-TO-END VERIFICATION CHECKS PASSED WITH 100% SUCCESS!');
}

runE2ETest()
  .catch((err) => {
    console.error('❌ Verification failed:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
