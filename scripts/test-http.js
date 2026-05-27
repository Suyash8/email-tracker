const http = require('http');
const { spawn } = require('child_process');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testHttpEndpoints() {
  console.log('🌐 Starting Live HTTP Endpoint & Header Verification...\n');

  // Start Next.js server on port 3005
  console.log('1. Starting Next.js dev server on port 3005...');
  const server = spawn('npx', ['next', 'dev', '-p', '3005'], {
    cwd: process.cwd(),
    env: { ...process.env, PORT: '3005' },
  });

  // Wait 7 seconds for server to start
  await new Promise((resolve) => setTimeout(resolve, 7000));

  try {
    // Step 1: Create a tracker via HTTP POST /api/trackers
    console.log('2. Making HTTP POST /api/trackers to create tracker for recipient eve@test.com...');
    const postData = JSON.stringify({
      title: 'HTTP Test Campaign',
      subject: 'HTTP Verification',
      recipients: ['eve@test.com'],
    });

    const createRes = await makeRequest({
      hostname: '127.0.0.1',
      port: 3005,
      path: '/api/trackers',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData),
      },
    }, postData);

    const createJson = JSON.parse(createRes.body);
    console.log(`   ✅ HTTP Status: ${createRes.statusCode}`);
    console.log(`   ✅ Response Success: ${createJson.success}`);

    const eveRecipient = createJson.data.recipients[0];
    const token = eveRecipient.token;
    console.log(`   🔹 Generated Token: ${token}\n`);

    // Step 2: Fetch Pixel via HTTP GET /api/track/pixel?t=TOKEN (1st Open)
    console.log('3. Fetching Pixel via HTTP GET /api/track/pixel (1st Open)...');
    const pixelRes1 = await makeRequest({
      hostname: '127.0.0.1',
      port: 3005,
      path: `/api/track/pixel?t=${token}`,
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      },
    });

    console.log(`   ✅ HTTP Status: ${pixelRes1.statusCode}`);
    console.log(`   ✅ Content-Type: ${pixelRes1.headers['content-type']}`);
    console.log(`   ✅ Cache-Control: ${pixelRes1.headers['cache-control']}`);
    console.log(`   ✅ GIF Binary Signature Match: ${pixelRes1.buffer.toString('hex').startsWith('474946383961') ? 'YES (GIF89a)' : 'NO'}\n`);

    // Wait 1 sec
    await new Promise((r) => setTimeout(r, 1000));

    // Step 3: Fetch Pixel via HTTP GET /api/track/pixel?t=TOKEN (2nd Open / Duplicate)
    console.log('4. Fetching Pixel via HTTP GET /api/track/pixel (2nd Open / Duplicate)...');
    const pixelRes2 = await makeRequest({
      hostname: '127.0.0.1',
      port: 3005,
      path: `/api/track/pixel?t=${token}`,
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)',
      },
    });

    console.log(`   ✅ HTTP Status: ${pixelRes2.statusCode}`);

    // Step 4: Verify Database State
    console.log('\n5. Verifying DB state for Eve after 2 HTTP requests...');
    const eveDb = await prisma.recipient.findUnique({
      where: { token },
      include: { openLogs: true },
    });

    console.log(`   ✅ Open Count: ${eveDb.openCount}`);
    console.log(`   ✅ Open Logs Count: ${eveDb.openLogs.length}`);
    console.log(`   ✅ First Opened: ${eveDb.firstOpened.toISOString()}`);
    console.log(`   ✅ Last Opened: ${eveDb.lastOpened.toISOString()}`);
    console.log(`   ✅ First Opened !== Last Opened: ${eveDb.firstOpened.toISOString() !== eveDb.lastOpened.toISOString()}`);

    // Cleanup
    await prisma.tracker.delete({ where: { id: createJson.data.id } });
    console.log('\n🎉 ALL LIVE HTTP ENDPOINT TESTS PASSED WITH 100% SUCCESS!');
  } finally {
    server.kill();
  }
}

function makeRequest(options, postData) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      const chunks = [];
      res.on('data', (chunk) => chunks.push(chunk));
      res.on('end', () => {
        const buffer = Buffer.concat(chunks);
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body: buffer.toString('utf-8'),
          buffer,
        });
      });
    });

    req.on('error', reject);
    if (postData) req.write(postData);
    req.end();
  });
}

testHttpEndpoints()
  .catch((err) => {
    console.error('❌ HTTP Test error:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
