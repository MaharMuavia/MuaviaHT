"use client";

import React from 'react';
import { useDemo } from '@/app/lib/demo-context';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { TrendingDown, TrendingUp, AlertTriangle, CheckCircle2, RotateCcw, Share2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export function ResultsScreen() {
  const { setScreen, clearWorkflow } = useDemo();

  const metrics = [
    { label: 'Revenue Risk', before: 'CRITICAL', after: 'REDUCED', icon: AlertTriangle, status: 'improvement' },
    { label: 'Op. Efficiency', before: '62%', after: '78%', icon: TrendingUp, status: 'improvement' },
    { label: 'Cust. Sentiment', before: '6.2/10', after: '7.4/10', icon: TrendingUp, status: 'improvement' },
  ];

  const handleRestart = () => {
    clearWorkflow();
    setScreen('HOME');
  };

  return (
    <div className="p-6 space-y-8 animate-in fade-in duration-500">
      <div className="text-center space-y-2">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-500/10 border border-green-500/20 mb-4">
           <CheckCircle2 className="w-10 h-10 text-green-500" />
        </div>
        <h1 className="text-2xl font-headline font-bold">Mission Complete</h1>
        <p className="text-sm text-muted-foreground px-4">Autonomous intelligence has stabilized the business signal.</p>
      </div>

      <div className="space-y-4">
        <h2 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground px-1">Outcome Comparison</h2>
        
        {metrics.map((m, i) => (
          <Card key={i} className="glass-card overflow-hidden">
             <CardContent className="p-0 flex h-24">
                <div className="flex-1 p-4 flex flex-col justify-center border-r border-white/5">
                   <p className="text-[10px] text-muted-foreground uppercase font-bold mb-1">{m.label}</p>
                   <div className="flex items-center gap-2">
                      <TrendingDown className="w-4 h-4 text-red-500" />
                      <span className="text-lg font-bold text-foreground/50 line-through decoration-red-500/50">{m.before}</span>
                   </div>
                </div>
                <div className="flex-1 p-4 flex flex-col justify-center bg-intel-blue/5">
                   <p className="text-[10px] text-intel-blue uppercase font-bold mb-1">Projected</p>
                   <div className="flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-green-500" />
                      <span className="text-lg font-bold text-intel-blue">{m.after}</span>
                   </div>
                </div>
             </CardContent>
          </Card>
        ))}
      </div>

      <Card className="glass-card border-intel-blue/30 bg-intel-blue/5">
        <CardHeader className="pb-2">
           <CardTitle className="text-sm">Expected Recovery</CardTitle>
        </CardHeader>
        <CardContent className="space-y-1">
           <div className="text-4xl font-headline font-bold text-intel-blue">+12%</div>
           <p className="text-xs text-muted-foreground">Estimated revenue uplift within 30 days of execution.</p>
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 gap-4 pt-4">
        <Button variant="outline" className="h-14 rounded-2xl border-white/10 bg-white/5 gap-2" onClick={() => {}}>
           <Share2 className="w-4 h-4" /> Export
        </Button>
        <Button className="h-14 rounded-2xl bg-intel-blue hover:bg-intel-blue/90 gap-2" onClick={handleRestart}>
           <RotateCcw className="w-4 h-4" /> New Cycle
        </Button>
      </div>
    </div>
  );
}
