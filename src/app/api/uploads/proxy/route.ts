import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:8000/api/v1';

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as { name?: string; arrayBuffer?: () => Promise<ArrayBuffer> } | null;

    if (!file || typeof file.name !== 'string' || typeof file.arrayBuffer !== 'function') {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    const uploadForm = new FormData();
    uploadForm.append('file', file as unknown as Blob, file.name);

    const backendRes = await fetch(`${API_BASE}/uploads/`, {
      method: 'POST',
      body: uploadForm,
    });

    if (!backendRes.ok) {
      const text = await backendRes.text();
      return NextResponse.json({ error: text || 'Upload failed' }, { status: backendRes.status });
    }

    const upload = await backendRes.json();
    return NextResponse.json(upload);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Upload proxy failed';
    console.error('POST /api/uploads/proxy failed:', error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
