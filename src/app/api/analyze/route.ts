import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:8000/api/v1';

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get('file');

    if (!(file instanceof File)) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    const uploadForm = new FormData();
    uploadForm.append('file', file, file.name);

    const uploadResponse = await fetch(`${API_BASE}/uploads/`, {
      method: 'POST',
      body: uploadForm,
    });

    if (!uploadResponse.ok) {
      const text = await uploadResponse.text();
      return NextResponse.json({ error: text || 'Upload failed' }, { status: uploadResponse.status });
    }

    const upload = await uploadResponse.json();

    const analysisResponse = await fetch(`${API_BASE}/analysis/run`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ file_ids: [upload.id], context: 'Next.js proxy analysis', force_recompute: false }),
    });

    if (!analysisResponse.ok) {
      const text = await analysisResponse.text();
      return NextResponse.json({ error: text || 'Analysis failed' }, { status: analysisResponse.status });
    }

    const analysis = await analysisResponse.json();
    return NextResponse.json({ ...analysis, upload });
  } catch (error) {
    console.error('POST /api/analyze failed:', error);
    return NextResponse.json({ error: 'Analysis proxy failed' }, { status: 500 });
  }
}