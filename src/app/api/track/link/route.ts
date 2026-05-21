import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get('t');
  const targetUrl = searchParams.get('url');

  const fallbackUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://google.com';
  const destination = targetUrl ? decodeURIComponent(targetUrl) : fallbackUrl;

  if (token && targetUrl) {
    try {
      const recipient = await db.recipient.findUnique({
        where: { token },
      });

      if (recipient) {
        const userAgent = request.headers.get('user-agent') || 'Unknown';
        const ip =
          request.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
          request.headers.get('x-real-ip') ||
          '127.0.0.1';

        const country = request.headers.get('x-vercel-ip-country') || null;
        const city = request.headers.get('x-vercel-ip-city') || null;
        const now = new Date();

        await db.$transaction([
          db.clickLog.create({
            data: {
              recipientId: recipient.id,
              targetUrl: destination,
              ip,
              userAgent,
              country,
              city,
              clickedAt: now,
            },
          }),
          db.recipient.update({
            where: { id: recipient.id },
            data: {
              clickCount: { increment: 1 },
              firstClicked: recipient.firstClicked ? undefined : now,
              lastClicked: now,
            },
          }),
        ]);
      }
    } catch (error) {
      console.error('Error logging link click:', error);
    }
  }

  // Redirect cleanly to destination
  return NextResponse.redirect(destination, 302);
}
