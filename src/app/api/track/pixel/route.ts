import { NextRequest } from 'next/server';
import { processPixelRequest } from '@/lib/tracker-handler';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get('t');
  return processPixelRequest(request, token);
}
