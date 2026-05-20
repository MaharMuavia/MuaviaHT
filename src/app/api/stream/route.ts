import { NextRequest } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:8000/api/v1';

/**
 * SSE proxy: streams events from the Python backend to the frontend.
 * The frontend connects to /api/stream and this route forwards to
 * the backend /api/v1/stream/analysis SSE endpoint.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const backendResponse = await fetch(`${API_BASE}/stream/analysis`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      // @ts-expect-error – Next.js fetch supports duplex for streaming
      duplex: 'half',
    });

    if (!backendResponse.ok) {
      const errorText = await backendResponse.text();
      return new Response(
        JSON.stringify({ error: errorText || 'Stream failed' }),
        { status: backendResponse.status, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Stream through – pass the ReadableBody straight to the client
    return new Response(backendResponse.body, {
      status: 200,
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache, no-transform',
        'X-Accel-Buffering': 'no',
        'Connection': 'keep-alive',
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (error) {
    console.error('SSE proxy error:', error);
    return new Response(
      JSON.stringify({ error: 'SSE proxy failed', detail: String(error) }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
