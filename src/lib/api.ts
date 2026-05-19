import type { AnalyzeAndGenerateInsightsOutput } from '@/ai/flows/analyze-and-generate-insights';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:8000/api/v1';

export type UploadAnalysisResponse = AnalyzeAndGenerateInsightsOutput & {
  id?: string;
  filename?: string;
  mime_type?: string;
  model?: string;
};

export async function uploadFile(file: File): Promise<UploadAnalysisResponse> {
  const form = new FormData();
  form.append('file', file, file.name);

  const res = await fetch('/api/analyze', {
    method: 'POST',
    body: form,
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `Upload failed with status ${res.status}`);
  }

  return res.json() as Promise<UploadAnalysisResponse>;
}

export async function runAnalysis(fileIds: string[], context?: string) {
  const res = await fetch(`${API_BASE}/analysis/run`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ file_ids: fileIds, context }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `Analysis request failed with status ${res.status}`);
  }

  return res.json();
}

const api = { uploadFile, runAnalysis };

export default api;
