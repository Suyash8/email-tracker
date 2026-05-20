import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const trackers = await db.tracker.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        recipients: {
          include: {
            _count: {
              select: { openLogs: true, clickLogs: true },
            },
          },
        },
      },
    });

    return NextResponse.json({ success: true, data: trackers });
  } catch (error) {
    console.error('Failed to fetch trackers:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch trackers' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, subject, bodySnippet, category, recipients } = body;

    if (!title || !recipients || !Array.isArray(recipients) || recipients.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Title and at least one recipient email are required' },
        { status: 400 }
      );
    }

    // Process recipients list (handles array of string emails or { email, name } objects)
    const formattedRecipients = recipients
      .map((r: string | { email: string; name?: string }) => {
        if (typeof r === 'string') {
          return { email: r.trim(), name: null };
        }
        return { email: r.email.trim(), name: r.name || null };
      })
      .filter((r) => r.email.length > 0);

    const tracker = await db.tracker.create({
      data: {
        title,
        subject: subject || null,
        bodySnippet: bodySnippet || null,
        category: category || 'General',
        recipients: {
          create: formattedRecipients,
        },
      },
      include: {
        recipients: true,
      },
    });

    return NextResponse.json({ success: true, data: tracker }, { status: 201 });
  } catch (error) {
    console.error('Failed to create tracker:', error);
    return NextResponse.json({ success: false, error: 'Failed to create tracker' }, { status: 500 });
  }
}
