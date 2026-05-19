"use client";

import React, { useCallback, useEffect, useRef, useState } from 'react';
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
  ArrowRight
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { generateLiveAgentReasoning } from '@/ai/flows/generate-live-agent-reasoning-flow';
import { Button } from '@/components/ui/button';

const AGENTS = [
  { name: 'Input Agent', icon: Database, color: 'text-blue-400' },
  { name: 'Insight Agent', icon: Search, color: 'text-purple-400' },
  { name: 'Impact Agent', icon: Target, color: 'text-orange-400' },
  { name: 'Decision Agent', icon: Zap, color: 'text-yellow-400' },
  { name: 'Execution Agent', icon: Rocket, color: 'text-cyan-400' },
  { name: 'Reflection Agent', icon: RotateCcw, color: 'text-green-400' },
];

type AgentState = {
  status: string;
  progress: number;
  reasoning: string;
  confidence: number;
};

const INITIAL_AGENT_STATES: AgentState[] = AGENTS.map(() => ({
  status: 'Idle',
  progress: 0,
  reasoning: 'Waiting for signal...',
  confidence: 0,
}));

export function WorkflowScreen() {
  const { setScreen, uploadedFile } = useDemo();
  const [activeAgentIndex, setActiveAgentIndex] = useState(0);
  const [agentStates, setAgentStates] = useState<AgentState[]>(INITIAL_AGENT_STATES);
  const agentStatesRef = useRef<AgentState[]>(INITIAL_AGENT_STATES);
  const updateAgentStates = useCallback((updater: (states: AgentState[]) => AgentState[]) => {
    setAgentStates(prev => {
      const next = updater(prev);
      agentStatesRef.current = next;
      return next;
    });
  }, []);

  useEffect(() => {
    if (activeAgentIndex >= AGENTS.length) {
      const timer = setTimeout(() => setScreen('INSIGHTS'), 2000);
      return () => clearTimeout(timer);
    }

    const runAgent = async () => {
      // Update starting status
      updateAgentStates(prev => {
        const next = [...prev];
        next[activeAgentIndex] = { ...next[activeAgentIndex], status: 'Processing', progress: 20 };
        return next;
      });

      try {
        const reasoning = await generateLiveAgentReasoning({
          agentName: AGENTS[activeAgentIndex].name,
          currentContext: `Processing report ${uploadedFile?.name || 'internal_data'}. Sequential phase ${activeAgentIndex + 1}.`,
          previousAgentReasoning: activeAgentIndex > 0 ? agentStatesRef.current[activeAgentIndex - 1].reasoning : undefined
        });

        // Simulate progress increments
        let p = 20;
        const interval = setInterval(() => {
          p += 20;
          updateAgentStates(prev => {
            const next = [...prev];
            next[activeAgentIndex] = { ...next[activeAgentIndex], progress: p };
            return next;
          });
          if (p >= 100) {
            clearInterval(interval);
            updateAgentStates(prev => {
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
        }, 400);

      } catch (err) {
        console.error(err);
      }
    };

    runAgent();
  }, [activeAgentIndex, setScreen, updateAgentStates, uploadedFile]);

  return (
    <div className="p-6 space-y-6 animate-in fade-in duration-500">
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
                "glass-card border-none transition-all duration-700",
                isActive ? "opacity-100 scale-100 glow-active translate-x-1 ring-1 ring-intel-blue/50" : isDone ? "opacity-60 scale-95" : "opacity-30 scale-90 translate-x-2"
              )}
            >
              <CardContent className="p-4 flex items-start gap-4">
                <div className={cn(
                  "w-10 h-10 rounded-xl flex items-center justify-center shrink-0 z-10 transition-all duration-500",
                  isActive ? "bg-intel-blue shadow-[0_0_15px_rgba(66,133,244,0.6)]" : isDone ? "bg-green-500" : "bg-secondary"
                )}>
                  {isDone ? <CheckCircle2 className="w-5 h-5 text-white" /> : <agent.icon className={cn("w-5 h-5 text-white")} />}
                </div>

                <div className="flex-1 space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold">{agent.name}</h3>
                    <span className={cn(
                      "text-[10px] uppercase font-bold tracking-widest transition-colors duration-500",
                      isActive ? "text-intel-blue" : isDone ? "text-green-500" : "text-muted-foreground"
                    )}>
                      {state.status}
                    </span>
                  </div>

                  {isActive && (
                    <div className="space-y-2 animate-in fade-in slide-in-from-left-2 duration-500">
                      <p className="text-xs text-muted-foreground leading-relaxed italic">
                        &quot;{state.reasoning}&quot;
                      </p>
                      <div className="flex items-center gap-2">
                         <Progress value={state.progress} className="h-1 flex-1 transition-all duration-500" />
                         <span className="text-[10px] font-mono text-intel-blue">{state.progress}%</span>
                      </div>
                    </div>
                  )}

                  {isDone && (
                    <div className="flex items-center gap-2 animate-in fade-in duration-300">
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
        <div className="pt-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
           <Button className="w-full h-14 bg-green-500 hover:bg-green-600 text-white gap-2 rounded-2xl font-headline glow-active" onClick={() => setScreen('INSIGHTS')}>
             Analysis Complete <ArrowRight className="w-4 h-4" />
           </Button>
        </div>
      )}
    </div>
  );
}
