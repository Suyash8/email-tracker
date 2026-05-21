import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { UAParser } from 'ua-parser-js';


// 1x1 transparent GIF base64 standard buffer (13 bytes)
const TRANSPARENT_GIF_BUFFER = Buffer.from(
  'R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7',
  'base64'
);

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get('t');

  if (token) {
    try {
      // Find recipient by unique tracking token
      const recipient = await db.recipient.findUnique({
        where: { token },
        include: { tracker: true },
      });

      if (recipient) {
        // Extract telemetry
        const userAgent = request.headers.get('user-agent') || 'Unknown';
        const ip =
          request.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
          request.headers.get('x-real-ip') ||
          '127.0.0.1';

        // Parse User Agent details
        const parser = new UAParser(userAgent);
        const uaResult = parser.getResult();

        const browser = uaResult.browser.name
          ? `${uaResult.browser.name} ${uaResult.browser.version || ''}`.trim()
          : 'Unknown';
        const os = uaResult.os.name
          ? `${uaResult.os.name} ${uaResult.os.version || ''}`.trim()
          : 'Unknown';
        const device = uaResult.device.type || 'Desktop';

        // Identify email client proxy patterns (e.g. Gmail Image Proxy, Apple Mail Privacy Protection)
        let clientType = 'Web / Desktop Client';
        if (userAgent.includes('GoogleImageProxy')) {
          clientType = 'Gmail Image Proxy';
        } else if (userAgent.includes('Mozilla/5.0') && userAgent.includes('AppleWebKit') && !userAgent.includes('Safari')) {
          clientType = 'Apple Mail Privacy Proxy';
        } else if (userAgent.toLowerCase().includes('outlook')) {
          clientType = 'Microsoft Outlook';
        } else if (userAgent.toLowerCase().includes('thunderbird')) {
          clientType = 'Mozilla Thunderbird';
        }

        // Vercel / Cloudflare Geo Headers (if deployed on Vercel)
        const country = request.headers.get('x-vercel-ip-country') || 'Unknown';
        const region = request.headers.get('x-vercel-ip-country-region') || 'Unknown';
        const city = request.headers.get('x-vercel-ip-city') || 'Unknown';

        const now = new Date();

        // Atomically log Open event and update Recipient counters
        await db.$transaction([
          db.openLog.create({
            data: {
              recipientId: recipient.id,
              ip,
              userAgent,
              browser,
              os,
              device,
              clientType,
              country: country !== 'Unknown' ? country : null,
              region: region !== 'Unknown' ? region : null,
              city: city !== 'Unknown' ? city : null,
              openedAt: now,
            },
          }),
          db.recipient.update({
            where: { id: recipient.id },
            data: {
              openCount: { increment: 1 },
              firstOpened: recipient.firstOpened ? undefined : now,
              lastOpened: now,
            },
          }),
        ]);
      }
    } catch (error) {
      console.error('Error logging email open:', error);
    }
  }

  // Return 1x1 transparent GIF with strict anti-caching & anti-privacy headers
  return new NextResponse(TRANSPARENT_GIF_BUFFER, {
    status: 200,
    headers: {
      'Content-Type': 'image/gif',
      'Content-Length': TRANSPARENT_GIF_BUFFER.length.toString(),
      'Cache-Control': 'private, no-cache, no-store, must-revalidate, max-age=0, post-check=0, pre-check=0',
      'Pragma': 'no-cache',
      'Expires': '0',
      'Surrogate-Control': 'no-store',
      'Access-Control-Allow-Origin': '*',
    },
  });
}
