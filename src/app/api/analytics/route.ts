import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const totalTrackers = await db.tracker.count();
    const totalRecipients = await db.recipient.count();
    const openedRecipients = await db.recipient.count({
      where: { openCount: { gt: 0 } },
    });
    const clickedRecipients = await db.recipient.count({
      where: { clickCount: { gt: 0 } },
    });

    const totalOpens = await db.openLog.count();
    const totalClicks = await db.clickLog.count();

    const openRate = totalRecipients > 0 ? ((openedRecipients / totalRecipients) * 100).toFixed(1) : '0';
    const clickRate = totalRecipients > 0 ? ((clickedRecipients / totalRecipients) * 100).toFixed(1) : '0';

    // Recent open activity feed (last 20 events)
    const recentActivity = await db.openLog.findMany({
      take: 20,
      orderBy: { openedAt: 'desc' },
      include: {
        recipient: {
          include: {
            tracker: { select: { title: true, subject: true } },
          },
        },
      },
    });

    // Device breakdown
    const devicesGroup = await db.openLog.groupBy({
      by: ['device'],
      _count: { device: true },
    });

    const deviceData = devicesGroup.map((item) => ({
      name: item.device || 'Desktop',
      value: item._count.device,
    }));

    // Client type breakdown (Gmail Proxy, Apple Mail, Outlook, etc.)
    const clientGroup = await db.openLog.groupBy({
      by: ['clientType'],
      _count: { clientType: true },
    });

    const clientData = clientGroup.map((item) => ({
      name: item.clientType || 'Web / Client',
      value: item._count.clientType,
    }));

    // Daily opens timeline (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    const recentLogs = await db.openLog.findMany({
      where: { openedAt: { gte: sevenDaysAgo } },
      select: { openedAt: true },
    });

    const daysMap: Record<string, number> = {};
    for (let i = 0; i < 7; i++) {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      const dateStr = d.toISOString().split('T')[0];
      daysMap[dateStr] = 0;
    }

    recentLogs.forEach((log) => {
      const dateStr = log.openedAt.toISOString().split('T')[0];
      if (daysMap[dateStr] !== undefined) {
        daysMap[dateStr]++;
      }
    });

    const timelineData = Object.entries(daysMap).map(([date, count]) => ({
      date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      opens: count,
    }));

    return NextResponse.json({
      success: true,
      data: {
        totalTrackers,
        totalRecipients,
        openedRecipients,
        clickedRecipients,
        totalOpens,
        totalClicks,
        openRate: Number(openRate),
        clickRate: Number(clickRate),
        recentActivity,
        deviceData,
        clientData,
        timelineData,
      },
    });
  } catch (error) {
    console.error('Failed to fetch analytics:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch analytics' }, { status: 500 });
  }
}
