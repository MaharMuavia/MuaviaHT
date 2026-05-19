"use client";

import React, { useState, useEffect } from 'react';
import { useDemo } from '@/app/lib/demo-context';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  Database, 
  Search, 
  Target, 
  Zap, 
  Rocket, 
  RotateCcw,
  CheckCircle2,
  BrainCircuit,
  ArrowRight
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { generateLiveAgentReasoning } from '@/ai/flows/generate-live-agent-reasoning-flow';

const AGENTS = [
  { name: 'Input Agent', icon: Database, color: 'text-blue-400' },
  { name: 'Insight Agent', icon: Search, color: 'text-purple-400' },
  { name: 'Impact Agent', icon: Target, color: 'text-orange-400' },
  { name: 'Decision Agent', icon: Zap, color: 'text-yellow-400' },
  { name: 'Execution Agent', icon: Rocket, color: 'text-cyan-400' },
  { name: 'Reflection Agent', icon: RotateCcw, color: 'text-green-400' },
];

export function WorkflowScreen() {
  const { setScreen, uploadedFile } = useDemo();
  const [activeAgentIndex, setActiveAgentIndex] = useState(0);
  const [agentStates, setAgentStates] = useState<any[]>(
    AGENTS.map(() => ({ status: 'Idle', progress: 0, reasoning: 'Waiting for signal...', confidence: 0 }))
  );

  useEffect(() => {
    if (activeAgentIndex >= AGENTS.length) {
      const timer = setTimeout(() => setScreen('INSIGHTS'), 2000);
      return () => clearTimeout(timer);
    }

    const runAgent = async () => {
      const agent = AGENTS[activeAgentIndex];
      
      // Update starting status
      setAgentStates(prev => {
        const next = [...prev];
        next[activeAgentIndex] = { ...next[activeAgentIndex], status: 'Processing', progress: 20 };
        return next;
      });

      try {
        const reasoning = await generateLiveAgentReasoning({
          agentName: agent.name,
          currentContext: `Processing report ${uploadedFile?.name || 'internal_data'}. Sequential phase ${activeAgentIndex + 1}.`,
          previousAgentReasoning: activeAgentIndex > 0 ? agentStates[activeAgentIndex - 1].reasoning : undefined
        });

        // Simulate progress increments
        let p = 20;
        const interval = setInterval(() => {
          p += 20;
          setAgentStates(prev => {
            const next = [...prev];
            next[activeAgentIndex] = { ...next[activeAgentIndex], progress: p };
            return next;
          });
          if (p >= 100) {
            clearInterval(interval);
            setAgentStates(prev => {
              const next = [...prev];
              next[activeAgentIndex] = { 
                ...next[activeAgentIndex], 
                status: 'Completed', 
                progress: 100, 
                reasoning: reasoning.reasoningSnippet,
                confidence: reasoning.confidenceScore
              };
              return next;
            });
            setTimeout(() => setActiveAgentIndex(idx => idx + 1), 800);
          }
        }, 300);

      } catch (err) {
        console.error(err);
      }
    };

    runAgent();
  }, [activeAgentIndex, setScreen, uploadedFile]);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-headline font-bold">Neural Workflow</h1>
        <Badge variant="outline" className="bg-intel-blue/10 text-intel-blue border-intel-blue/30 animate-pulse">
          Engine Active
        </Badge>
      </div>

      <div className="relative space-y-4">
        {/* Connection Line */}
        <div className="absolute left-7 top-4 bottom-4 w-px bg-white/10" />

        {AGENTS.map((agent, idx) => {
          const isActive = activeAgentIndex === idx;
          const isDone = activeAgentIndex > idx;
          const state = agentStates[idx];

          return (
            <Card 
              key={agent.name} 
              className={cn(
                "glass-card border-none transition-all duration-500",
                isActive ? "opacity-100 scale-100 glow-active translate-x-1" : isDone ? "opacity-60 scale-95" : "opacity-30 scale-90 translate-x-2"
              )}
            >
              <CardContent className="p-4 flex items-start gap-4">
                <div className={cn(
                  "w-10 h-10 rounded-xl flex items-center justify-center shrink-0 z-10",
                  isActive ? "bg-intel-blue animate-pulse" : isDone ? "bg-green-500" : "bg-secondary"
                )}>
                  {isDone ? <CheckCircle2 className="w-5 h-5 text-white" /> : <agent.icon className={cn("w-5 h-5 text-white")} />}
                </div>

                <div className="flex-1 space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold">{agent.name}</h3>
                    <span className={cn(
                      "text-[10px] uppercase font-bold tracking-widest",
                      isActive ? "text-intel-blue" : isDone ? "text-green-500" : "text-muted-foreground"
                    )}>
                      {state.status}
                    </span>
                  </div>

                  {isActive && (
                    <div className="space-y-2 animate-in fade-in slide-in-from-top-1 duration-300">
                      <p className="text-xs text-muted-foreground leading-relaxed italic">
                        "{state.reasoning}"
                      </p>
                      <div className="flex items-center gap-2">
                         <Progress value={state.progress} className="h-1 flex-1" />
                         <span className="text-[10px] font-mono text-intel-blue">{state.progress}%</span>
                      </div>
                    </div>
                  )}

                  {isDone && (
                    <div className="flex items-center gap-2">
                      <div className="h-1 flex-1 bg-green-500/20 rounded-full">
                        <div className="h-full bg-green-500 w-full rounded-full" />
                      </div>
                      <span className="text-[10px] font-mono text-green-500">{state.confidence}% Conf.</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {activeAgentIndex >= AGENTS.length && (
        <div className="pt-4 animate-in fade-in duration-500">
           <Button className="w-full bg-green-500 hover:bg-green-600 text-white gap-2" onClick={() => setScreen('INSIGHTS')}>
             Analysis Complete <ArrowRight className="w-4 h-4" />
           </Button>
        </div>
      )}
    </div>
  );
}
