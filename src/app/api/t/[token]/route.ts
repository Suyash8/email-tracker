import { NextRequest } from 'next/server';
import { processPixelRequest } from '@/lib/tracker-handler';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request: NextRequest, { params }: { params: { token: string } }) {
  return processPixelRequest(request, params.token);
}
