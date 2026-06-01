const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const http = require('http');
const { spawn } = require('child_process');

async function testLiveNeonToken() {
  console.log('🧪 Testing Live Neon Database Pixel Resolution...\n');

  // Check count before
  const recBefore = await prisma.recipient.findFirst({
    where: { email: 'kopywritr@gmail.com' },
  });
  console.log(`1. Current Open Count in Neon for ${recBefore.email}: ${recBefore.openCount}`);
  console.log(`   Token: ${recBefore.token}`);

  // Start Next.js dev server on port 3006
  console.log('\n2. Starting local Next.js dev server connected to Neon on port 3006...');
  const server = spawn('npx', ['next', 'dev', '-p', '3006'], {
    cwd: process.cwd(),
    env: { ...process.env, PORT: '3006' },
  });

  await new Promise((res) => setTimeout(res, 6000));

  try {
    console.log('\n3. Requesting GET http://127.0.0.1:3006/api/t/' + recBefore.token + '.gif ...');
    const res = await new Promise((resolve, reject) => {
      http.get(`http://127.0.0.1:3006/api/t/${recBefore.token}.gif`, (res) => {
        resolve(res);
      }).on('error', reject);
    });

    console.log(`   ✅ HTTP Response Status: ${res.statusCode}`);
    console.log(`   ✅ Content-Type: ${res.headers['content-type']}`);

    await new Promise((res) => setTimeout(res, 1000));

    // Check count after
    const recAfter = await prisma.recipient.findFirst({
      where: { email: 'kopywritr@gmail.com' },
      include: { openLogs: true },
    });

    console.log(`\n4. Updated Open Count in Neon for ${recAfter.email}: ${recAfter.openCount}`);
    console.log(`   Total Open Logs in Neon: ${recAfter.openLogs.length}`);
    console.log(`   Last Opened: ${recAfter.lastOpened}`);

    if (recAfter.openCount === recBefore.openCount + 1) {
      console.log('\n🎉 SUCCESS! Neon Database successfully incremented open count and logged event!');
    } else {
      console.error('\n❌ FAILURE: Open count did not increment in Neon.');
    }
  } finally {
    server.kill();
  }
}

testLiveNeonToken().finally(() => prisma.$disconnect());
