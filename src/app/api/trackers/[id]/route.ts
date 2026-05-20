import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const tracker = await db.tracker.findUnique({
      where: { id: params.id },
      include: {
        recipients: {
          include: {
            openLogs: { orderBy: { openedAt: 'desc' } },
            clickLogs: { orderBy: { clickedAt: 'desc' } },
          },
        },
      },
    });

    if (!tracker) {
      return NextResponse.json({ success: false, error: 'Tracker not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: tracker });
  } catch (error) {
    console.error('Failed to fetch tracker detail:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch tracker' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await db.tracker.delete({
      where: { id: params.id },
    });
    return NextResponse.json({ success: true, message: 'Tracker deleted successfully' });
  } catch (error) {
    console.error('Failed to delete tracker:', error);
    return NextResponse.json({ success: false, error: 'Failed to delete tracker' }, { status: 500 });
  }
}
