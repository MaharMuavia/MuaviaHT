import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:8000/api/v1';

export async function POST(req: Request) {
  try {
    const body = await req.text();

    const backendRes = await fetch(`${API_BASE}/stream/analysis`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'text/event-stream' },
      body,
    });

    if (!backendRes.ok) {
      const text = await backendRes.text();
      return NextResponse.json({ error: text || 'Backend stream failed' }, { status: backendRes.status });
    }

    const headers = new Headers(backendRes.headers);
    headers.set('Content-Type', 'text/event-stream');

    return new NextResponse(backendRes.body, { headers });
  } catch (error) {
    console.error('Stream proxy failed:', error);
    return NextResponse.json({ error: 'Stream proxy failed' }, { status: 500 });
  }
}
