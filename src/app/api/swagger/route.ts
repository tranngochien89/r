import { NextResponse } from 'next/server';
import { getApiDocs } from '@/lib/swagger';

export async function GET() {
  if (process.env.NODE_ENV === 'development') {
    const spec = await getApiDocs();
    return NextResponse.json(spec);
  }
  // In production, you could serve a static file or return a 404
  return new Response(null, { status: 404 });
}
