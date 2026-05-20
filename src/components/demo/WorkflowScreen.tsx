"use client";

import React, { useMemo } from 'react';
import { useDemo } from '@/app/lib/demo-context';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowRight, AlertCircle, CheckCircle2, CircleDot, Loader2, Sparkles, Workflow, TerminalSquare, Activity, BrainCircuit } from 'lucide-react';
import { cn } from '@/lib/utils';

const EXECUTION_NODES = [
  { agent: 'Input Agent', title: 'Parser', description: 'Extracts signals from uploaded files' },
  { agent: 'Validation Agent', title: 'Validation', description: 'Checks missing values and schema coverage' },
  { agent: 'Insight Agent', title: 'Insight', description: 'Detects anomalies and operational patterns' },
  { agent: 'Root Cause Agent', title: 'Root Cause', description: 'Branches on severe or low-confidence evidence' },
  { agent: 'Impact Agent', title: 'Impact', description: 'Scores business exposure and confidence' },
  { agent: 'Decision Agent', title: 'Decision', description: 'Selects the next action based on memory and evidence' },
  { agent: 'Execution Agent', title: 'Execution', description: 'Simulates downstream systems and before/after state' },
  { agent: 'Reflection Agent', title: 'Reflection', description: 'Evaluates the outcome and adapts' },
];

function progressWidthClass(progress: number) {
  if (progress >= 90) return 'w-[95%]';
  if (progress >= 70) return 'w-[80%]';
  if (progress >= 50) return 'w-[60%]';
  if (progress >= 25) return 'w-[35%]';
  return 'w-[10%]';
}

function statusTone(status?: string) {
  switch (status) {
    case 'completed':
      return 'text-green-400 border-green-500/30 bg-green-500/10';
    case 'running':
    case 'thinking':
    case 'calling_tool':
    case 'analyzing':
      return 'text-intel-blue border-intel-blue/30 bg-intel-blue/10';
    case 'failed':
      return 'text-red-400 border-red-500/30 bg-red-500/10';
    default:
      return 'text-muted-foreground border-white/10 bg-white/5';
  }
}

export function WorkflowScreen() {
  const { setScreen, uploadedFile, analysisResults, workflow, liveEvents, activeAgent, agentStatuses, timeline } = useDemo();
  const latestEvent = liveEvents[liveEvents.length - 1];
  const isLive = !analysisResults && liveEvents.length > 0;
  const completedNodes = useMemo(() => new Set(Object.entries(agentStatuses).filter(([, event]) => String(event.status) === 'completed').map(([agent]) => agent)), [agentStatuses]);
  const currentNode = activeAgent ?? latestEvent?.agent ?? 'Workflow Engine';
  const currentMessage = latestEvent?.message || 'Waiting for backend execution to begin.';
  const overallProgress = typeof latestEvent?.progress === 'number' ? latestEvent.progress : workflow.executionState === 'completed' ? 100 : isLive ? 35 : 0;

  if (!uploadedFile && !analysisResults) {
    return (
      <div className="p-6 space-y-4 animate-in fade-in duration-500">
        <div className="space-y-2">
          <h1 className="text-xl font-headline font-bold">Workflow Dashboard</h1>
          <p className="text-sm text-muted-foreground">Upload a file to start a live backend execution stream.</p>
        </div>

        <Card className="glass-card border-dashed border-white/10 bg-background/60">
          <CardContent className="p-5 space-y-3">
            <p className="text-sm text-muted-foreground leading-relaxed">
              The backend will stream agent states, branch-specific reasoning, and the final decision trace in real time.
            </p>
            <Button onClick={() => setScreen('UPLOAD')} className="w-full h-12 bg-intel-blue hover:bg-intel-blue/90 rounded-xl">
              Go to Upload
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 animate-in fade-in duration-500 max-w-5xl mx-auto">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-headline font-bold flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-intel-blue" />
            Live Workflow Dashboard
          </h1>
          <p className="text-sm text-muted-foreground">{uploadedFile?.name ?? 'Selected upload'} is being processed by the backend orchestrator.</p>
        </div>
        <Badge variant="outline" className={cn('rounded-full px-4 py-1.5 font-medium border text-xs tracking-wide', statusTone(workflow.executionState))}>
          {workflow.executionState === 'completed' ? 'Execution Completed' : workflow.executionState === 'failed' ? 'Execution Failed' : isLive ? 'Live Execution Active' : 'Initializing'}
        </Badge>
      </div>

      <Card className="glass-card border-white/10 bg-background/70">
        <CardContent className="p-5 space-y-4">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Current Agent</p>
              <h2 className="mt-1 text-xl font-semibold flex items-center gap-2">
                <BrainCircuit className="h-5 w-5 text-intel-blue" />
                {currentNode}
              </h2>
              <p className="mt-2 text-sm text-muted-foreground">{currentMessage}</p>
            </div>
            <div className={cn('w-full max-w-sm rounded-2xl border px-4 py-3 lg:w-auto lg:min-w-40', statusTone(latestEvent?.status))}>
              <p className="text-[10px] uppercase tracking-[0.3em]">Status</p>
              <p className="mt-1 font-semibold capitalize">{String(latestEvent?.status || workflow.executionState)}</p>
              <p className="text-xs opacity-80 mt-1">{Math.round(overallProgress)}% complete</p>
            </div>
          </div>
          <div className="h-2 rounded-full bg-white/5 overflow-hidden">
            <div className={cn('h-full rounded-full bg-gradient-to-r from-intel-blue via-cyan-400 to-emerald-400 transition-all duration-300', progressWidthClass(overallProgress))} />
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
        <Card className="glass-card border-white/10 bg-background/70">
          <CardContent className="p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Execution Graph</p>
                <h3 className="mt-1 text-lg font-semibold flex items-center gap-2"><Workflow className="h-4 w-4 text-intel-blue" />Dependency DAG</h3>
              </div>
              <div className="text-xs text-muted-foreground">{completedNodes.size}/{EXECUTION_NODES.length} nodes complete</div>
            </div>
            <div className="grid gap-3 grid-cols-1">
              {EXECUTION_NODES.map((node, index) => {
                const nodeEvent = agentStatuses[node.agent];
                const status = String(nodeEvent?.status || (analysisResults ? 'completed' : 'waiting'));
                const isActive = activeAgent === node.agent;
                return (
                  <div key={node.agent} className={cn('rounded-2xl border p-4 transition-all', statusTone(status), isActive && 'shadow-[0_0_24px_rgba(0,113,197,0.18)] scale-[1.01]')}>
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-[10px] uppercase tracking-[0.3em] opacity-80">Node {index + 1}</p>
                        <h4 className="mt-1 font-semibold flex items-center gap-2">
                          {status === 'completed' ? <CheckCircle2 className="h-4 w-4 text-green-400" /> : status === 'running' || status === 'thinking' || status === 'calling_tool' || status === 'analyzing' ? <Loader2 className="h-4 w-4 animate-spin" /> : <CircleDot className="h-4 w-4" />}
                          {node.title}
                        </h4>
                        <p className="mt-1 text-xs text-muted-foreground">{node.description}</p>
                      </div>
                      <Badge variant="outline" className="capitalize">{status}</Badge>
                    </div>
                    {nodeEvent?.message && <p className="mt-3 text-xs text-foreground/80">{nodeEvent.message}</p>}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card border-white/10 bg-background/70">
          <CardContent className="p-5 space-y-4">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Live Log Terminal</p>
              <h3 className="mt-1 text-lg font-semibold flex items-center gap-2"><TerminalSquare className="h-4 w-4 text-intel-blue" />Streaming events</h3>
            </div>
            <div className="max-h-[420px] overflow-y-auto rounded-2xl border border-white/10 bg-black/70 p-4 font-mono text-[11px] space-y-2">
              {timeline.length > 0 ? timeline.slice(-80).map((event, index) => (
                <div key={`${event.event}-${index}`} className="border-b border-white/5 pb-2 last:border-0 last:pb-0">
                  <div className="flex items-center gap-2 text-white/50">
                    <span>{event.timestamp ? new Date(event.timestamp).toLocaleTimeString() : '--:--:--'}</span>
                    <span className="text-intel-blue">{event.agent || 'workflow'}</span>
                    <span>{event.event}</span>
                  </div>
                  <div className="mt-1 text-white/85">{event.message || JSON.stringify(event.result || event.summary || { status: event.status })}</div>
                </div>
              )) : (
                <div className="flex items-center gap-2 text-white/40">
                  {isLive ? <Loader2 className="w-3 h-3 animate-spin" /> : <AlertCircle className="w-3 h-3" />}
                  {isLive ? 'Waiting for the first backend event...' : 'No live events yet.'}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="glass-card border-white/10 bg-background/70">
        <CardContent className="p-5 space-y-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Results Panel</p>
              <h3 className="mt-1 text-lg font-semibold flex items-center gap-2"><Activity className="h-4 w-4 text-intel-blue" />Final backend outcome</h3>
            </div>
            <Badge variant="outline" className={cn('capitalize', statusTone(workflow.executionState))}>{workflow.executionState}</Badge>
          </div>

          {analysisResults ? (
            <div className="grid gap-4 grid-cols-1">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">Primary Action</p>
                <p className="mt-2 font-semibold">{analysisResults.action?.action || 'N/A'}</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">Confidence</p>
                <p className="mt-2 font-semibold">{typeof analysisResults.confidence_score === 'number' ? `${Math.round(analysisResults.confidence_score * 100)}%` : 'N/A'}</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">Trace Events</p>
                <p className="mt-2 font-semibold">{analysisResults.antigravity_trace?.tool_calls?.length ?? 0} tool calls</p>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">The backend will populate this panel only after the final workflow.completed event arrives.</p>
          )}
        </CardContent>
      </Card>

      <div className="pt-2">
        <Button
          disabled={isLive}
          onClick={() => setScreen('RESULTS')}
          className={cn('w-full h-14 bg-intel-blue hover:bg-intel-blue/90 gap-2 rounded-2xl font-headline text-lg transition-all', isLive ? 'opacity-50 grayscale cursor-not-allowed' : 'glow-active')}
        >
          {isLive ? 'Workflow still running' : 'Open Final Results'}
          {!isLive && <ArrowRight className="w-5 h-5" />}
        </Button>
      </div>
    </div>
  );
}