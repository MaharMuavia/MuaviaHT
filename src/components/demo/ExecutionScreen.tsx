"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useDemo } from '@/app/lib/demo-context';
import { generateExecutionLogs } from '@/ai/flows/generate-execution-logs';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Terminal, ShieldCheck, ChevronRight, BarChart } from 'lucide-react';

export function ExecutionScreen() {
  const { decisionResults, setScreen } = useDemo();
  const [logs, setLogs] = useState<string[]>([]);
  const [progress, setProgress] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const logContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (decisionResults) {
      const runExecution = async () => {
        const rawLogs = await generateExecutionLogs({
          strategy: decisionResults.options.find(o => o.id === decisionResults.chosenOptionId)?.description || "Strategy Execution"
        });
        
        const logLines = rawLogs.split('\n').filter(l => l.trim());
        
        let currentLine = 0;
        const interval = setInterval(() => {
          if (currentLine < logLines.length) {
            setLogs(prev => [...prev, logLines[currentLine]]);
            setProgress((currentLine / logLines.length) * 100);
            currentLine++;
            
            // Auto scroll
            if (logContainerRef.current) {
              logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
            }
          } else {
            clearInterval(interval);
            setProgress(100);
            setIsComplete(true);
          }
        }, 500);
      };
      
      runExecution();
    }
  }, [decisionResults]);

  return (
    <div className="p-6 space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-headline font-bold">Execution Engine</h1>
          <p className="text-sm text-muted-foreground">Simulating real-world API & system integrations.</p>
        </div>
        <div className="w-10 h-10 rounded-xl bg-intel-blue/10 flex items-center justify-center">
          <Terminal className="w-6 h-6 text-intel-blue" />
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between text-[10px] font-mono uppercase tracking-widest text-muted-foreground px-1">
          <span>{isComplete ? 'System Static' : 'Sequence Running'}</span>
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
          <span className="text-[10px] font-mono text-muted-foreground">sentinel_os v4.2.1</span>
        </div>
        <CardContent 
          ref={logContainerRef}
          className="p-4 h-[350px] overflow-y-auto font-mono text-[11px] space-y-2 scroll-smooth"
        >
          {logs.map((log, i) => (
            <div key={i} className="flex gap-2 animate-in slide-in-from-bottom-1 fade-in duration-200">
              <span className="text-intel-blue opacity-50 font-bold tracking-tighter shrink-0">
                {log.match(/\[(.*?)\]/)?.[0] || '[SYSTEM]'}
              </span>
              <span className="text-foreground/90">{log.replace(/\[(.*?)\]/, '').trim()}</span>
            </div>
          ))}
          {!isComplete && (
            <div className="flex items-center gap-1 text-intel-blue animate-pulse">
              <ChevronRight className="w-3 h-3" />
              <span className="w-1.5 h-3 bg-intel-blue inline-block" />
            </div>
          )}
        </CardContent>
      </Card>

      {isComplete && (
        <div className="space-y-4 animate-in fade-in slide-in-from-top-4 duration-700">
          <Card className="glass-card border-green-500/20 bg-green-500/5">
            <CardContent className="p-4 flex items-center gap-4">
               <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-6 h-6 text-white" />
               </div>
               <div>
                  <h4 className="text-sm font-bold">Execution Synchronized</h4>
                  <p className="text-xs text-muted-foreground">All systems updated. Outcomes projected in results panel.</p>
               </div>
            </CardContent>
          </Card>

          <Button 
            onClick={() => setScreen('RESULTS')}
            className="w-full h-14 bg-intel-blue hover:bg-intel-blue/90 gap-2 rounded-2xl font-headline text-lg glow-active"
          >
            <BarChart className="w-5 h-5" />
            View Projected Impact
          </Button>
        </div>
      )}
    </div>
  );
}
