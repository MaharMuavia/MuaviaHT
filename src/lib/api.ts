export type WorkflowState =
  | 'initializing'
  | 'waiting_for_upload'
  | 'planning'
  | 'schema_analysis'
  | 'data_validation'
  | 'insight_extraction'
  | 'reasoning'
  | 'decision_making'
  | 'simulation'
  | 'evaluation'
  | 'completed'
  | 'failed';

export type AgentStatus =
  | 'waiting'
  | 'running'
  | 'thinking'
  | 'calling_tool'
  | 'analyzing'
  | 'completed'
  | 'failed';

export interface UploadResponse {
  id: string;
  filename: string;
  file_type: string;
  file_size: number;
  created_at: string;
  file_hash?: string | null;
  public_url?: string | null;
}

export interface BusinessSignal {
  metric: string;
  value: unknown;
  unit?: string | null;
  timestamp?: string | null;
  region?: string | null;
  confidence?: number;
}

export interface ExtractedData {
  signals: BusinessSignal[];
  raw_text?: string | null;
  tables?: Array<Record<string, unknown>> | null;
  images?: string[] | null;
  missing_fields?: string[] | null;
}

export interface Insight {
  issue_type: string;
  title?: string;
  description: string;
  explanation?: string;
  severity: string;
  affected_metrics: string[];
  reasoning: string;
  confidence?: number;
}

export interface ImpactEstimate {
  financial_loss: number;
  currency: string;
  time_horizon_days: number;
  confidence: number;
  churn_risk?: number;
  operational_bottleneck?: string | null;
  market_impact?: string | null;
}

export interface ActionRecommendation {
  action: string;
  reasoning: string;
  expected_outcome: string;
  confidence: number;
  alternatives?: Array<Record<string, unknown>> | null;
}

export interface ExecutionSimulation {
  before_state: Record<string, unknown>;
  action: Record<string, unknown>;
  after_state: Record<string, unknown>;
  expected_impact: string;
}

export interface ReflectionResult {
  action_improved_outcome: boolean;
  metrics_change: Record<string, number>;
  alternative_actions?: string[] | null;
  learning: string;
}

export interface CostSummary {
  request_cost_usd: number;
  cost_per_100_users_usd: number;
  cost_per_1000_users_usd: number;
  projected_10x_cost_usd: number;
  projected_100x_cost_usd: number;
}

export interface AntigravityTrace {
  workplan: Record<string, unknown>;
  task_plan: Array<Record<string, unknown>>;
  observations: string[];
  reasoning_steps: string[];
  decisions: Array<Record<string, unknown>>;
  tool_calls: Array<Record<string, unknown>>;
  recovery_steps?: Array<Record<string, unknown>> | null;
  action_execution: Record<string, unknown>;
  error_recovery?: Array<Record<string, unknown>> | null;
  final_outcome: Record<string, unknown>;
}

export interface AnalysisResponse {
  id: string;
  workflow_id?: string | null;
  upload_ids?: string[] | null;
  execution_state?: WorkflowState | null;
  cached_results?: boolean | null;
  last_execution_timestamp?: string | null;
  status: string;
  extracted_data?: ExtractedData | null;
  insights?: Insight[] | null;
  impact?: ImpactEstimate | null;
  action?: ActionRecommendation | null;
  execution?: ExecutionSimulation | null;
  reflection?: ReflectionResult | null;
  antigravity_trace?: AntigravityTrace | null;
  confidence_score?: number | null;
  cost_summary?: CostSummary | null;
  created_at: string;
}

export interface StreamEvent {
  event: string;
  workflow_id?: string;
  agent?: string;
  status?: WorkflowState | AgentStatus | string;
  progress?: number;
  message?: string;
  timestamp?: string;
  step?: string;
  state?: string;
  result?: Record<string, unknown>;
  file_ids?: string[];
  force_recompute?: boolean;
  trace?: AntigravityTrace;
  analysis?: AnalysisResponse;
  summary?: {
    confidence?: number | null;
    primary_action?: string | null;
    semantic_matches?: Array<Record<string, unknown>>;
  };
  [key: string]: unknown;
}

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:8000/api/v1';

export async function uploadFile(file: File): Promise<UploadResponse> {
  const form = new FormData();
  form.append('file', file, file.name);

  const res = await fetch('/api/uploads/proxy', {
    method: 'POST',
    body: form,
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `Upload failed with status ${res.status}`);
  }

  return res.json() as Promise<UploadResponse>;
}

export async function runAnalysis(fileIds: string[], context?: string, forceRecompute = false): Promise<AnalysisResponse> {
  const res = await fetch(`${API_BASE}/analysis/run`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ file_ids: fileIds, context, force_recompute: forceRecompute }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `Analysis request failed with status ${res.status}`);
  }

  return res.json() as Promise<AnalysisResponse>;
}

export async function uploadAndAnalyzeFile(file: File, context?: string, forceRecompute = false) {
  const upload = await uploadFile(file);
  const analysis = await runAnalysis([upload.id], context, forceRecompute);
  return { upload, analysis };
}

export async function streamAnalysis(
  fileIds: string[],
  context?: string,
  forceRecompute = false,
  onEvent?: (event: StreamEvent) => void,
): Promise<AnalysisResponse> {
  // Try direct backend call first; fallback to same-origin proxy on network errors.
  let res: Response | null = null;
  try {
    res = await fetch(`${API_BASE}/stream/analysis`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'text/event-stream' },
      body: JSON.stringify({ file_ids: fileIds, context, force_recompute: forceRecompute }),
    });
  } catch (err) {
    // Network-level failure (CORS/mixed-content); fall back to same-origin proxy
    try {
      res = await fetch('/api/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'text/event-stream' },
        body: JSON.stringify({ file_ids: fileIds, context, force_recompute: forceRecompute }),
      });
    } catch (err2) {
      throw new Error('Streaming analysis network error: ' + (err2 as Error).message);
    }
  }

  if (!res || !res.ok || !res.body) {
    const text = res ? await res.text() : 'No response';
    throw new Error(text || `Streaming analysis failed`);
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  let finalAnalysis: AnalysisResponse | null = null;

  const flushEvent = (block: string) => {
    const dataLines = block
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => line.startsWith('data:'))
      .map((line) => line.slice(5).trim());

    if (!dataLines.length) return;

    try {
      const event = JSON.parse(dataLines.join('\n')) as StreamEvent;
      onEvent?.(event);
      if (event.event === 'analysis.completed' && event.analysis) {
        finalAnalysis = event.analysis;
      }
      if (event.event === 'stream.trace_ready' && event.analysis) {
        finalAnalysis = event.analysis;
      }
    } catch (error) {
      console.warn('Failed to parse stream event', error);
    }
  };

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });

    let separatorIndex = buffer.indexOf('\n\n');
    while (separatorIndex !== -1) {
      const block = buffer.slice(0, separatorIndex);
      buffer = buffer.slice(separatorIndex + 2);
      flushEvent(block);
      separatorIndex = buffer.indexOf('\n\n');
    }
  }

  if (buffer.trim()) {
    flushEvent(buffer);
  }

  if (!finalAnalysis) {
    throw new Error('Streaming analysis completed without a final analysis payload');
  }

  return finalAnalysis;
}

export async function uploadAndStreamAnalyzeFile(
  file: File,
  context?: string,
  forceRecompute = false,
  onEvent?: (event: StreamEvent) => void,
) {
  const upload = await uploadFile(file);
  let analysis: AnalysisResponse;
  try {
    analysis = await streamAnalysis([upload.id], context, forceRecompute, onEvent);
  } catch (error) {
    console.warn('Streaming failed, falling back to standard analysis run:', error);
    onEvent?.({
      event: 'stream.fallback_to_non_stream',
      file_ids: [upload.id],
      reason: error instanceof Error ? error.message : 'stream_error',
    });
    analysis = await runAnalysis([upload.id], context, forceRecompute);
    onEvent?.({
      event: 'analysis.completed',
      workflow_id: analysis.workflow_id ?? undefined,
      analysis,
      summary: {
        confidence: analysis.confidence_score ?? null,
        primary_action: analysis.action?.action ?? null,
      },
    });
  }
  return { upload, analysis };
}

const api = { uploadFile, runAnalysis, uploadAndAnalyzeFile, streamAnalysis, uploadAndStreamAnalyzeFile };

export default api;
