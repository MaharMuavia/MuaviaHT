"use client";

import React from 'react';
import { useDemo } from '@/app/lib/demo-context';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Terminal, ShieldCheck, ChevronRight, BarChart } from 'lucide-react';

function prettyJson(value: unknown) {
  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return String(value);
  }
}

export function ExecutionScreen() {
  const { analysisResults, setScreen, liveEvents, workflow, timeline } = useDemo();
  const execution = analysisResults?.execution;
  const trace = analysisResults?.antigravity_trace;
  const isLive = !analysisResults && liveEvents.length > 0;
  const progress = isLive ? Math.min(98, Number(liveEvents.at(-1)?.progress ?? 0)) : analysisResults?.execution ? 100 : 0;
  const logs = trace
    ? [
        ...(trace.observations ?? []).map((line) => `OBSERVE ${line}`),
        ...(trace.reasoning_steps ?? []).map((line) => `REASON ${line}`),
        ...(trace.decisions ?? []).map((line) => `DECIDE ${prettyJson(line)}`),
        ...(trace.tool_calls ?? []).map((line) => `TOOL ${String(line.tool || 'tool')}`),
      ]
    : timeline.map((event) => `${event.agent || 'workflow'} ${event.event} ${event.message || ''}`.trim());

  if (!analysisResults || !execution) {
    return (
      <div className="p-6 space-y-4">
        <h1 className="text-2xl font-headline font-bold">Execution Engine</h1>
        <Card className="glass-card">
          <CardContent className="p-5 space-y-3">
            <p className="text-sm text-muted-foreground">{isLive ? 'Live backend execution is in progress.' : 'No execution trace is available yet.'}</p>
            {isLive && <p className="text-xs text-muted-foreground">Current workflow state: {workflow.executionState}</p>}
            <Button onClick={() => setScreen('UPLOAD')} className="w-full h-12 bg-intel-blue hover:bg-intel-blue/90 rounded-xl">
              Upload a Report
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-headline font-bold">Execution Engine</h1>
          <p className="text-sm text-muted-foreground">Cached execution for the selected action.</p>
        </div>
        <div className="w-10 h-10 rounded-xl bg-intel-blue/10 flex items-center justify-center">
          <Terminal className="w-6 h-6 text-intel-blue" />
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between text-[10px] font-mono uppercase tracking-widest text-muted-foreground px-1">
          <span>{isLive ? 'Live Execution' : 'Cached Execution'}</span>
          <span>{Math.round(progress)}% Integrity</span>
        </div>
        <Progress value={progress} className="h-2 bg-white/5" />
      </div>

      <Card className="bg-black/80 border-white/10 rounded-xl overflow-hidden shadow-2xl">
        <div className="bg-white/5 px-4 py-2 border-b border-white/5 flex items-center justify-between">
          <div className="flex gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-red-500/50" />
            <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/50" />
            <div className="w-2.5 h-2.5 rounded-full bg-green-500/50" />
          </div>
          <span className="text-[10px] font-mono text-muted-foreground">sentinel_os cached_trace</span>
        </div>
        <CardContent className="p-4 h-[350px] overflow-y-auto font-mono text-[11px] space-y-2 scroll-smooth">
          {logs.map((log, i) => (
            <div key={i} className="flex gap-2">
              <span className="text-intel-blue opacity-50 font-bold tracking-tighter shrink-0">[{String(i + 1).padStart(2, '0')}]</span>
              <span className="text-foreground/90">{log}</span>
            </div>
          ))}
          {logs.length === 0 && <div className="text-muted-foreground">No execution trace was recorded.</div>}
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="glass-card border-green-500/20 bg-green-500/5">
          <CardContent className="p-4 space-y-3">
            <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-6 h-6 text-white" />
            </div>
            <div>
              <h4 className="text-sm font-bold">Execution Synchronized</h4>
              <p className="text-xs text-muted-foreground">Before/after state is sourced from backend trace events and the final analysis payload.</p>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card border-intel-blue/20 bg-intel-blue/5">
          <CardContent className="p-4 space-y-3">
            <div className="flex items-center gap-2">
              <BarChart className="w-4 h-4 text-intel-blue" />
              <h4 className="text-sm font-bold">Impact Preview</h4>
            </div>
            <p className="text-xs text-muted-foreground">{execution.expected_impact}</p>
            <div className="space-y-2 text-xs text-muted-foreground">
              <p><span className="text-foreground font-medium">Before:</span> {prettyJson(execution.before_state)}</p>
              <p><span className="text-foreground font-medium">After:</span> {prettyJson(execution.after_state)}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Button
        onClick={() => setScreen('RESULTS')}
        className="w-full h-14 bg-intel-blue hover:bg-intel-blue/90 gap-2 rounded-2xl font-headline text-lg glow-active"
      >
        View Projected Impact
        <ChevronRight className="w-4 h-4" />
      </Button>
    </div>
  );
}