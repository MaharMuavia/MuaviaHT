"use client";

import React from 'react';
import { useDemo } from '@/app/lib/demo-context';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, CheckCircle2, Sparkles, TrendingUp } from 'lucide-react';

export function DecisionScreen() {
  const { analysisResults, setScreen } = useDemo();
  const action = analysisResults?.action;
  const alternatives = action?.alternatives ?? [];

  if (!analysisResults?.insights?.length || !action) {
    return (
      <div className="p-6 space-y-4">
        <h1 className="text-2xl font-headline font-bold">Autonomous Decision</h1>
        <Card className="glass-card">
          <CardContent className="p-5 space-y-3">
            <p className="text-sm text-muted-foreground">No completed workflow is available yet.</p>
            <Button onClick={() => setScreen('UPLOAD')} className="w-full h-12 bg-intel-blue hover:bg-intel-blue/90 rounded-xl">
              Upload a Report
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-8 animate-in fade-in duration-500">
      <div className="space-y-2">
        <h1 className="text-2xl font-headline font-bold">Autonomous Decision</h1>
        <p className="text-sm text-muted-foreground">Derived from the cached backend workflow for {analysisResults.id}.</p>
      </div>

      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Badge className="bg-green-500 text-white rounded-md px-2 py-1">RECOMMENDED</Badge>
          <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">Selected Action</span>
        </div>

        <Card className="glass-card border-green-500/30 bg-green-500/5 glow-active overflow-hidden">
          <CardContent className="p-6 space-y-4">
            <div className="flex items-start justify-between gap-4">
              <h3 className="text-xl font-bold text-green-400">{action.action}</h3>
              <div className="p-2 rounded-lg bg-green-500/20">
                <TrendingUp className="w-6 h-6 text-green-400" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-2">
              <div className="space-y-1">
                <p className="text-[10px] text-muted-foreground uppercase font-bold">Confidence</p>
                <p className="text-sm font-medium">{Math.round((action.confidence ?? 0) * 100)}%</p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] text-muted-foreground uppercase font-bold">Expected Outcome</p>
                <p className="text-sm font-medium">{action.expected_outcome}</p>
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-xs font-bold text-green-400/80">Decision Reasoning</p>
              <p className="text-sm leading-relaxed">{action.reasoning}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest px-1">Alternatives</p>
        <div className="space-y-3">
          {alternatives.length > 0 ? alternatives.map((opt, index) => (
            <Card key={index} className="glass-card bg-background/40">
              <CardContent className="p-4 flex items-center justify-between gap-3">
                <div>
                  <span className="text-sm font-medium">{String(opt.action || opt.description || 'Alternative')}</span>
                  <p className="text-xs text-muted-foreground mt-1">{String(opt.reasoning || opt.score || '')}</p>
                </div>
                <Badge variant="secondary" className="text-[8px]">ALT</Badge>
              </CardContent>
            </Card>
          )) : (
            <Card className="glass-card bg-background/40">
              <CardContent className="p-4 text-sm text-muted-foreground">No alternative actions were stored in the workflow trace.</CardContent>
            </Card>
          )}
        </div>
      </div>

      <div className="pt-4">
        <Button
          onClick={() => setScreen('EXECUTION')}
          className="w-full h-14 bg-intel-blue hover:bg-intel-blue/90 gap-2 rounded-2xl font-headline text-lg"
        >
          Execute Selected Action
          <ArrowRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}