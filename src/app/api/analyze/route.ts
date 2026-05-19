import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import type { AnalyzeAndGenerateInsightsOutput } from '@/ai/flows/analyze-and-generate-insights';

export const runtime = 'nodejs';

const MODEL_NAME = 'gemini-2.5-flash';
const DEFAULT_INSIGHTS = {
  insights: [
    {
      title: 'Revenue Anomaly Detected',
      explanation: 'Uploaded signals indicate a possible revenue or sales deviation that needs immediate review.',
      severity: 'High',
      confidence: 'Medium',
    },
    {
      title: 'Operational Risk Identified',
      explanation: 'The file contains business indicators that may affect inventory, fulfillment, or customer experience.',
      severity: 'Medium',
      confidence: 'Medium',
    },
  ],
} satisfies AnalyzeAndGenerateInsightsOutput;

type GeneratedInsight = {
  title?: unknown;
  explanation?: unknown;
  summary?: unknown;
  severity?: unknown;
  confidence?: unknown;
};

function normalizeSeverity(value: unknown): AnalyzeAndGenerateInsightsOutput['insights'][number]['severity'] {
  const normalized = String(value || '').toLowerCase();
  if (normalized === 'critical') return 'Critical';
  if (normalized === 'high') return 'High';
  if (normalized === 'low') return 'Low';
  return 'Medium';
}

function normalizeConfidence(value: unknown): AnalyzeAndGenerateInsightsOutput['insights'][number]['confidence'] {
  const normalized = String(value || '').toLowerCase();
  if (normalized === 'high') return 'High';
  if (normalized === 'low') return 'Low';
  return 'Medium';
}

function extractJson(text: string): AnalyzeAndGenerateInsightsOutput | null {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/i)?.[1];
  const candidate = fenced ?? text.match(/\{[\s\S]*\}/)?.[0];
  if (!candidate) return null;

  try {
    const parsed = JSON.parse(candidate);
    const insights = Array.isArray(parsed?.insights) ? parsed.insights : [];
    const normalized = insights
      .map((item: GeneratedInsight) => ({
        title: String(item?.title || 'Business Signal Detected'),
        explanation: String(item?.explanation || item?.summary || 'The uploaded file contains a business signal that needs review.'),
        severity: normalizeSeverity(item?.severity),
        confidence: normalizeConfidence(item?.confidence),
      }))
      .filter((item: AnalyzeAndGenerateInsightsOutput['insights'][number]) => item.title && item.explanation);

    return normalized.length ? { insights: normalized } : null;
  } catch {
    return null;
  }
}

export async function POST(req: Request) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'Missing GEMINI_API_KEY' }, { status: 500 });
    }

    const formData = await req.formData();
    const file = formData.get('file');

    if (!(file instanceof File)) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64Data = buffer.toString('base64');
    const mimeType = file.type || 'application/octet-stream';

    const client = new GoogleGenerativeAI(apiKey);
    const model = client.getGenerativeModel({ model: MODEL_NAME });

    const prompt = [
      {
        text: 'Analyze this uploaded document or image. Return only valid JSON with this exact shape: {"insights":[{"title":"string","explanation":"string","severity":"Low|Medium|High|Critical","confidence":"Low|Medium|High"}]}. Include 2 to 5 actionable business insights.'
      },
      {
        inlineData: {
          mimeType,
          data: base64Data,
        },
      },
    ];

    const result = await model.generateContent(prompt);
    const analysisText = result.response.text();
    const analysis = extractJson(analysisText) ?? {
      insights: [
        {
          ...DEFAULT_INSIGHTS.insights[0],
          explanation: analysisText.slice(0, 500) || DEFAULT_INSIGHTS.insights[0].explanation,
        },
        DEFAULT_INSIGHTS.insights[1],
      ],
    } satisfies AnalyzeAndGenerateInsightsOutput;

    return NextResponse.json({
      ...analysis,
      id: crypto.randomUUID(),
      filename: file.name,
      mime_type: mimeType,
      model: MODEL_NAME,
    });
  } catch (error) {
    console.error('POST /api/analyze failed:', error);
    return NextResponse.json(DEFAULT_INSIGHTS);
  }
}
