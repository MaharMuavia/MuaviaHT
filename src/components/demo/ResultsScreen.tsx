"use client";

import React, { useState } from 'react';
import { useDemo } from '@/app/lib/demo-context';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  TrendingDown,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  RotateCcw,
  Download,
  Database,
  FileText,
  Table as TableIcon,
  FileCode,
  Loader2,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

const SEVERITY_ORDER = ['Critical', 'High', 'Medium', 'Low'] as const;
const SEVERITY_COLORS = ['#ef4444', '#f97316', '#eab308', '#22c55e'];

type ReportInsight = {
  issue_type: string;
  title?: string;
  description: string;
  explanation?: string;
  severity: string;
  reasoning: string;
  confidence?: number;
};

type ReportOption = {
  id: string;
  description: string;
  estimatedImpact: string;
  riskLevel: string;
};

function escapeHtml(value: string) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function getSeverityData(insights: ReportInsight[]) {
  return SEVERITY_ORDER.map((severity) => ({
    label: severity,
    count: insights.filter((insight) => insight.severity.toLowerCase() === severity.toLowerCase()).length,
  }));
}

function buildSeveritySvg(data: Array<{ label: string; count: number }>) {
  const width = 820;
  const height = 280;
  const padding = { top: 24, right: 28, bottom: 56, left: 56 };
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;
  const barWidth = chartWidth / Math.max(data.length, 1);
  const maxValue = Math.max(...data.map((entry) => entry.count), 1);

  const bars = data
    .map((entry, index) => {
      const barHeight = Math.max((entry.count / maxValue) * chartHeight, entry.count > 0 ? 18 : 0);
      const x = padding.left + index * barWidth + barWidth * 0.18;
      const y = padding.top + chartHeight - barHeight;
      const color = SEVERITY_COLORS[index] ?? '#60a5fa';

      return `
        <g>
          <rect x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${(barWidth * 0.64).toFixed(1)}" height="${barHeight.toFixed(1)}" rx="14" fill="${color}" opacity="0.9" />
          <text x="${(x + barWidth * 0.32).toFixed(1)}" y="${(y - 10).toFixed(1)}" text-anchor="middle" fill="#e5e7eb" font-size="20" font-weight="700">${entry.count}</text>
          <text x="${(x + barWidth * 0.32).toFixed(1)}" y="${(height - 18).toFixed(1)}" text-anchor="middle" fill="#94a3b8" font-size="18">${escapeHtml(entry.label)}</text>
        </g>
      `;
    })
    .join('');

  return `
    <svg viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Insight severity breakdown">
      <defs>
        <linearGradient id="chart-bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#0f172a" />
          <stop offset="100%" stop-color="#111827" />
        </linearGradient>
      </defs>
      <rect x="0" y="0" width="${width}" height="${height}" rx="24" fill="url(#chart-bg)" />
      <line x1="${padding.left}" y1="${padding.top + chartHeight}" x2="${width - padding.right}" y2="${padding.top + chartHeight}" stroke="rgba(148,163,184,0.2)" stroke-width="1.5" />
      ${bars}
    </svg>
  `;
}

function buildReportHtml(input: {
  title: string;
  sourceName: string;
  generatedAt: string;
  severityData: Array<{ label: string; count: number }>;
  insights: ReportInsight[];
  chosenOption: ReportOption | null;
  decisionOptions: ReportOption[];
  executionLogs: string[];
}) {
  const insightsMarkup = input.insights.length
    ? input.insights
        .map(
          (insight) => `
            <article class="insight-card">
              <div class="insight-top">
                <h3>${escapeHtml(insight.title ?? insight.description ?? insight.issue_type)}</h3>
                <span>${escapeHtml(insight.severity)} / ${escapeHtml(typeof insight.confidence === 'number' ? `${Math.round(insight.confidence * 100)}%` : 'N/A')}</span>
              </div>
              <p>${escapeHtml(insight.explanation ?? insight.reasoning ?? insight.description)}</p>
            </article>
          `
        )
        .join('')
    : '<div class="empty-state">No insights were captured for this run.</div>';

  const optionMarkup = input.decisionOptions.length
    ? input.decisionOptions
        .map(
          (option, index) => `
            <div class="option-row ${input.chosenOption?.id === option.id ? 'selected' : ''}">
              <div>
                <strong>${index + 1}. ${escapeHtml(option.description)}</strong>
                <p>${escapeHtml(option.estimatedImpact)}</p>
              </div>
              <span>${escapeHtml(option.riskLevel)} risk</span>
            </div>
          `
        )
        .join('')
    : '<div class="empty-state">No strategic options were produced for this run.</div>';

  const executionMarkup = input.executionLogs.length
    ? input.executionLogs.map((log) => `<li>${escapeHtml(log)}</li>`).join('')
    : '<li>No execution logs were recorded.</li>';

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${escapeHtml(input.title)}</title>
    <style>
      :root {
        color-scheme: dark;
        --bg: #020617;
        --panel: rgba(15, 23, 42, 0.92);
        --panel-2: rgba(30, 41, 59, 0.82);
        --border: rgba(148, 163, 184, 0.18);
        --text: #e2e8f0;
        --muted: #94a3b8;
        --accent: #60a5fa;
      }
      * { box-sizing: border-box; }
      body {
        margin: 0;
        font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
        background:
          radial-gradient(circle at top left, rgba(96, 165, 250, 0.2), transparent 28%),
          radial-gradient(circle at top right, rgba(34, 197, 94, 0.16), transparent 24%),
          linear-gradient(180deg, #020617 0%, #0f172a 100%);
        color: var(--text);
        padding: 32px;
      }
      .sheet {
        max-width: 1120px;
        margin: 0 auto;
        border: 1px solid var(--border);
        border-radius: 28px;
        overflow: hidden;
        background: linear-gradient(180deg, rgba(15, 23, 42, 0.96), rgba(2, 6, 23, 0.94));
        box-shadow: 0 24px 80px rgba(15, 23, 42, 0.5);
      }
      header {
        padding: 32px;
        border-bottom: 1px solid var(--border);
        display: grid;
        grid-template-columns: 1.8fr 1fr;
        gap: 20px;
        align-items: end;
      }
      h1, h2, h3, p { margin: 0; }
      h1 { font-size: 34px; line-height: 1.1; }
      .subtle { color: var(--muted); margin-top: 10px; line-height: 1.6; }
      .badge {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        border: 1px solid var(--border);
        border-radius: 999px;
        padding: 8px 14px;
        color: var(--muted);
        background: rgba(15, 23, 42, 0.8);
        width: fit-content;
        margin-bottom: 18px;
      }
      .stats {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: 12px;
      }
      .stat {
        background: var(--panel);
        border: 1px solid var(--border);
        border-radius: 20px;
        padding: 16px;
      }
      .stat .label { color: var(--muted); font-size: 12px; text-transform: uppercase; letter-spacing: 0.16em; }
      .stat .value { margin-top: 8px; font-size: 24px; font-weight: 700; }
      main { padding: 24px 32px 32px; display: grid; gap: 18px; }
      .panel {
        background: var(--panel-2);
        border: 1px solid var(--border);
        border-radius: 24px;
        padding: 22px;
      }
      .panel h2 { font-size: 18px; margin-bottom: 14px; }
      .chart-wrap { margin-top: 10px; }
      .insights-grid { display: grid; gap: 12px; }
      .insight-card, .option-row {
        background: rgba(2, 6, 23, 0.36);
        border: 1px solid var(--border);
        border-radius: 18px;
        padding: 16px;
      }
      .insight-top, .option-row {
        display: flex;
        justify-content: space-between;
        gap: 18px;
        align-items: start;
      }
      .insight-top h3 { font-size: 15px; margin-bottom: 4px; }
      .insight-top span, .option-row span, .muted { color: var(--muted); font-size: 12px; text-transform: uppercase; letter-spacing: 0.12em; }
      .insight-card p, .option-row p, li { color: #cbd5e1; line-height: 1.6; }
      .option-list, .log-list { list-style: none; padding: 0; margin: 0; display: grid; gap: 10px; }
      .selected { border-color: rgba(34, 197, 94, 0.35); box-shadow: inset 0 0 0 1px rgba(34, 197, 94, 0.12); }
      .empty-state {
        border: 1px dashed var(--border);
        border-radius: 18px;
        padding: 18px;
        color: var(--muted);
      }
      .footer-note {
        color: var(--muted);
        font-size: 12px;
        padding-top: 4px;
      }
      @media print {
        body { background: white; padding: 0; }
        .sheet { box-shadow: none; border-radius: 0; border: 0; }
      }
      @media (max-width: 900px) {
        header { grid-template-columns: 1fr; }
        .stats { grid-template-columns: repeat(2, 1fr); }
      }
    </style>
  </head>
  <body>
    <div class="sheet">
      <header>
        <div>
          <div class="badge">VisualCore Sentinel Report • ${escapeHtml(input.sourceName)}</div>
          <h1>${escapeHtml(input.title)}</h1>
          <p class="subtle">A visual summary of the detected business signals, the selected strategy, and the simulated execution trail. Generated ${escapeHtml(input.generatedAt)}.</p>
        </div>
        <div class="stats">
          <div class="stat"><div class="label">Insights</div><div class="value">${input.insights.length}</div></div>
          <div class="stat"><div class="label">Strategic Options</div><div class="value">${input.decisionOptions.length}</div></div>
          <div class="stat"><div class="label">Execution Logs</div><div class="value">${input.executionLogs.length}</div></div>
          <div class="stat"><div class="label">Chosen Path</div><div class="value">${escapeHtml(input.chosenOption?.description ?? 'Pending')}</div></div>
        </div>
      </header>
      <main>
        <section class="panel">
          <h2>Signal Distribution</h2>
          <p class="muted">Severity breakdown for the detected insights.</p>
          <div class="chart-wrap">${buildSeveritySvg(input.severityData)}</div>
        </section>

        <section class="panel">
          <h2>Insight Detail</h2>
          <div class="insights-grid">${insightsMarkup}</div>
        </section>

        <section class="panel">
          <h2>Decision Rationale</h2>
          <div class="option-list">${optionMarkup}</div>
        </section>

        <section class="panel">
          <h2>Execution Trace</h2>
          <ul class="log-list">${executionMarkup}</ul>
        </section>

        <div class="footer-note">This report is designed for browser preview and print-to-PDF workflows, with charts embedded inline for fidelity across exports.</div>
      </main>
    </div>
  </body>
</html>`;
}

function downloadBlob(filename: string, content: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
}

function openPrintableReport(html: string) {
  const reportWindow = window.open('', '_blank', 'noopener,noreferrer,width=1280,height=960');

  if (!reportWindow) {
    return false;
  }

  reportWindow.document.open();
  reportWindow.document.write(html);
  reportWindow.document.close();
  reportWindow.focus();
  reportWindow.onload = () => {
    reportWindow.focus();
    reportWindow.print();
  };

  return true;
}

export function ResultsScreen() {
  const { setScreen, clearWorkflow, analysisResults, uploadedFile } = useDemo();
  const { toast } = useToast();
  const [isExporting, setIsExporting] = useState<string | null>(null);

  const insights = (analysisResults?.insights ?? []) as ReportInsight[];
  const severityData = getSeverityData(insights);
  const chosenOption = analysisResults?.action
    ? ({
        id: analysisResults.action.action,
        description: analysisResults.action.action,
        estimatedImpact: analysisResults.action.expected_outcome,
        riskLevel: analysisResults.action.confidence >= 0.85 ? 'LOW' : analysisResults.action.confidence >= 0.7 ? 'MEDIUM' : 'HIGH',
      } as ReportOption)
    : null;
  const strongestInsight = insights[0];
  const traceExecutionLogs = [
    ...(analysisResults?.antigravity_trace?.observations ?? []),
    ...(analysisResults?.antigravity_trace?.reasoning_steps ?? []),
    ...(analysisResults?.antigravity_trace?.decisions ?? []).map((entry) => JSON.stringify(entry)),
    ...(analysisResults?.antigravity_trace?.tool_calls ?? []).map((entry) => `${String(entry.tool || 'tool')}`),
  ];
  const semanticMatches = (analysisResults?.antigravity_trace?.final_outcome as Record<string, unknown> | undefined)?.semantic_matches as Array<Record<string, unknown>> | undefined;
  const criticalCount = severityData.find((entry) => entry.label === 'Critical')?.count ?? 0;
  const highCount = severityData.find((entry) => entry.label === 'High')?.count ?? 0;
  const mediumCount = severityData.find((entry) => entry.label === 'Medium')?.count ?? 0;
  const lowCount = severityData.find((entry) => entry.label === 'Low')?.count ?? 0;
  const totalSeverityWeight = severityData.reduce((sum, entry) => {
    if (entry.label === 'Critical') return sum + entry.count * 4;
    if (entry.label === 'High') return sum + entry.count * 3;
    if (entry.label === 'Medium') return sum + entry.count * 2;
    return sum + entry.count;
  }, 0);
  const summaryCards = [
    {
      label: 'Source File',
      value: uploadedFile?.name ?? 'Demo data',
      detail: uploadedFile ? `Uploaded ${new Date(uploadedFile.lastModified).toLocaleDateString()}` : 'No upload attached yet',
      icon: FileText,
    },
    {
      label: 'Top Insight',
      value: strongestInsight?.title ?? strongestInsight?.description ?? strongestInsight?.issue_type ?? 'No insights detected',
      detail: strongestInsight ? strongestInsight.severity : 'Waiting for analysis output',
      icon: AlertTriangle,
    },
    {
      label: 'Severity Mix',
      value: `${criticalCount} critical / ${highCount} high`,
      detail: `${mediumCount} medium and ${lowCount} low`,
      icon: TrendingUp,
    },
    {
      label: 'Decision Path',
      value: chosenOption?.description ?? 'Pending',
      detail: chosenOption ? chosenOption.estimatedImpact : 'No decision selected yet',
      icon: CheckCircle2,
    },
  ];

  const summaryStats = [
    { label: 'Insights', value: String(insights.length), detail: 'Detected from the uploaded report' },
    { label: 'Strategy', value: chosenOption?.description ?? 'Pending', detail: 'Selected decision path' },
    { label: 'Execution logs', value: String(traceExecutionLogs.length), detail: 'Simulated operations captured' },
    { label: 'Source', value: uploadedFile?.name ?? 'Demo data', detail: 'Current input artifact' },
  ];

  const handleRestart = () => {
    clearWorkflow();
    setScreen('HOME');
  };

  const handleExport = (format: 'PDF' | 'XLSX' | 'DOCX' | 'JSON') => {
    setIsExporting(format);

    window.setTimeout(() => {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const baseName = `VisualCore_Report_${timestamp}`;
      const reportPayload = {
        generatedAt: new Date().toISOString(),
        sourceFile: uploadedFile?.name ?? 'Demo data',
        insights,
        decision: analysisResults?.action,
        executionLogs: traceExecutionLogs,
        severityBreakdown: severityData,
      };

      if (format === 'JSON') {
        downloadBlob(`${baseName}.json`, JSON.stringify(reportPayload, null, 2), 'application/json;charset=utf-8');
        setIsExporting(null);
        toast({
          title: 'Export Successful',
          description: `${baseName}.json has been generated with the report data.`,
        });
        return;
      }

      const html = buildReportHtml({
        title: 'VisualCore Sentinel Analysis Report',
        sourceName: uploadedFile?.name ?? 'Demo data',
        generatedAt: new Date().toLocaleString(),
        severityData,
        insights,
        chosenOption,
        decisionOptions: chosenOption ? [chosenOption] : [],
        executionLogs: traceExecutionLogs,
      });

      if (format === 'PDF') {
        const opened = openPrintableReport(html);
        setIsExporting(null);
        toast({
          title: opened ? 'Visual PDF Preview Ready' : 'Popup Blocked',
          description: opened
            ? 'A print-ready report opened in a new tab. Use the browser print dialog to save it as PDF.'
            : 'Allow popups to open the print-ready PDF preview.',
        });

        return;
      }

      downloadBlob(`${baseName}_${format.toLowerCase()}.html`, html, 'text/html;charset=utf-8');
      setIsExporting(null);
      toast({
        title: 'Visual Report Generated',
        description: `${baseName}_${format.toLowerCase()}.html includes charts, insight summaries, and execution trace data.`,
      });
    }, 350);
  };

  return (
    <div className="p-6 space-y-8 animate-in fade-in duration-500">
      <div className="text-center space-y-2">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-500/10 border border-green-500/20 mb-4 animate-float">
          <CheckCircle2 className="w-10 h-10 text-green-500" />
        </div>
        <h1 className="text-2xl font-headline font-bold">Mission Complete</h1>
        <p className="text-sm text-muted-foreground px-4">Autonomous intelligence has stabilized the business signal.</p>
      </div>

      <Card className="glass-card overflow-hidden">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <TableIcon className="w-4 h-4 text-intel-blue" />
            Visual Summary
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-3">
            {summaryStats.map((stat) => (
              <div key={stat.label} className="rounded-2xl border border-white/5 bg-background/40 p-4 space-y-1">
                <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">{stat.label}</p>
                <p className="text-sm font-semibold line-clamp-1">{stat.value}</p>
                <p className="text-[11px] text-muted-foreground">{stat.detail}</p>
              </div>
            ))}
          </div>

          <div className="h-64 w-full rounded-3xl border border-white/5 bg-background/40 p-3">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={severityData} margin={{ top: 10, right: 12, left: -12, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.12)" vertical={false} />
                <XAxis dataKey="label" stroke="rgba(148,163,184,0.7)" tickLine={false} axisLine={false} />
                <YAxis allowDecimals={false} stroke="rgba(148,163,184,0.7)" tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{
                    background: 'rgba(2, 6, 23, 0.95)',
                    border: '1px solid rgba(148, 163, 184, 0.2)',
                    borderRadius: '16px',
                    color: '#e2e8f0',
                  }}
                  cursor={{ fill: 'rgba(96, 165, 250, 0.08)' }}
                />
                <Bar dataKey="count" radius={[14, 14, 0, 0]}>
                  {severityData.map((entry, index) => (
                    <Cell key={entry.label} fill={SEVERITY_COLORS[index] ?? '#60a5fa'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <h2 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground px-1">Outcome Comparison</h2>

        {summaryCards.map((card, i) => (
          <Card key={i} className={cn(
            'glass-card overflow-hidden animate-in slide-in-from-bottom-4 duration-500',
            i === 0 ? 'stagger-1' : i === 1 ? 'stagger-2' : 'stagger-3'
          )}>
            <CardContent className="p-0 flex flex-col md:flex-row min-h-24">
              <div className="flex-1 p-4 flex flex-col justify-center border-b border-white/5 md:border-b-0 md:border-r md:border-white/5">
                <p className="text-[10px] text-muted-foreground uppercase font-bold mb-1">{card.label}</p>
                <div className="flex items-center gap-2">
                  <card.icon className="w-4 h-4 text-red-500" />
                  <span className="text-lg font-bold text-foreground/80 line-clamp-1">{card.value}</span>
                </div>
              </div>
              <div className="flex-1 p-4 flex flex-col justify-center bg-intel-blue/5">
                <p className="text-[10px] text-intel-blue uppercase font-bold mb-1">Report Detail</p>
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-green-500" />
                  <span className="text-sm font-bold text-intel-blue line-clamp-2">{card.detail}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="glass-card border-intel-blue/30 bg-intel-blue/5 stagger-4 animate-in slide-in-from-bottom-4">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-intel-blue" />
            Report Signal Strength
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-1">
          <div className="text-4xl font-headline font-bold text-intel-blue">{totalSeverityWeight > 0 ? `${Math.min(totalSeverityWeight * 4, 99)}%` : '0%'}</div>
          <p className="text-xs text-muted-foreground">Derived from the uploaded file, detected insight severity, and decision state.</p>
        </CardContent>
      </Card>

      <Card className="glass-card border-white/10 bg-background/50 stagger-4 animate-in slide-in-from-bottom-4">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Database className="w-4 h-4 text-intel-blue" />
            Observability
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-4 text-sm">
          <div className="rounded-2xl border border-white/5 bg-black/10 p-4">
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">Cost</p>
            <p className="mt-1 font-semibold">{analysisResults?.cost_summary ? `$${analysisResults.cost_summary.request_cost_usd.toFixed(4)}` : 'Pending'}</p>
          </div>
          <div className="rounded-2xl border border-white/5 bg-black/10 p-4">
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">Cache</p>
            <p className="mt-1 font-semibold">{analysisResults?.cached_results ? 'Hit' : 'Miss'}</p>
          </div>
          <div className="rounded-2xl border border-white/5 bg-black/10 p-4">
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">Retries</p>
            <p className="mt-1 font-semibold">{String(analysisResults?.antigravity_trace?.error_recovery?.length ?? 0)}</p>
          </div>
          <div className="rounded-2xl border border-white/5 bg-black/10 p-4">
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">Memory</p>
            <p className="mt-1 font-semibold">{String(semanticMatches?.length ?? 0)} matches</p>
          </div>
        </CardContent>
      </Card>

      {semanticMatches && semanticMatches.length > 0 && (
        <Card className="glass-card border-white/10 bg-background/50 stagger-4 animate-in slide-in-from-bottom-4">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Database className="w-4 h-4 text-intel-blue" />
              Semantic Memory Reuse
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {semanticMatches.map((match, index) => (
              <div key={index} className="rounded-2xl border border-white/5 bg-black/10 p-3 text-sm text-muted-foreground">
                Workflow {String(match.workflow_id ?? index + 1)} · score {String(match.score ?? 'n/a')} · {String(match.summary ?? 'similar case')}
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-2 gap-4 pt-4 stagger-5 animate-in slide-in-from-bottom-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              disabled={!!isExporting}
              className="h-14 rounded-2xl bg-intel-blue hover:bg-intel-blue/90 gap-2 font-headline group relative overflow-hidden"
            >
              {isExporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4 group-hover:translate-y-0.5 transition-transform" />}
              {isExporting ? 'Exporting...' : 'Export'}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48 glass-card border-white/10 bg-background/90 backdrop-blur-xl">
            <DropdownMenuItem onClick={() => handleExport('PDF')} className="gap-2 focus:bg-intel-blue/10 cursor-pointer">
              <FileText className="w-4 h-4 text-red-400" />
              <span>Export as PDF</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleExport('XLSX')} className="gap-2 focus:bg-intel-blue/10 cursor-pointer">
              <TableIcon className="w-4 h-4 text-green-400" />
              <span>Export as visual HTML</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleExport('JSON')} className="gap-2 focus:bg-intel-blue/10 cursor-pointer">
              <FileCode className="w-4 h-4 text-orange-400" />
              <span>Export as JSON</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <Button className="h-14 rounded-2xl bg-intel-blue hover:bg-intel-blue/90 gap-2 font-headline group" onClick={handleRestart}>
          <RotateCcw className="w-4 h-4 group-hover:rotate-180 transition-transform duration-500" />
          New Cycle
        </Button>
      </div>
    </div>
  );
}
