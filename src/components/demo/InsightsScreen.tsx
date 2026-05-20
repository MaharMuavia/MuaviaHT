"use client";

import React from 'react';
import { useDemo } from '@/app/lib/demo-context';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, TrendingDown, Users, Package, ArrowRight, Brain } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export function InsightsScreen() {
  const { analysisResults, setScreen } = useDemo();
  const insights = analysisResults?.insights ?? [];

  const getIcon = (label: string) => {
    const t = label.toLowerCase();
    if (t.includes('revenue') || t.includes('sales')) return TrendingDown;
    if (t.includes('customer') || t.includes('complaint')) return Users;
    if (t.includes('inventory') || t.includes('stock')) return Package;
    return AlertCircle;
  };

  const getSeverityColor = (sev: string) => {
    switch (sev.toLowerCase()) {
      case 'critical': return 'text-red-500 bg-red-500/10 border-red-500/20';
      case 'high': return 'text-orange-500 bg-orange-500/10 border-orange-500/20';
      case 'medium': return 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20';
      default: return 'text-blue-500 bg-blue-500/10 border-blue-500/20';
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="space-y-1 animate-in fade-in slide-in-from-top-4 duration-700">
        <h1 className="text-2xl font-headline font-bold">Neural Insights</h1>
        <p className="text-sm text-muted-foreground">Autonomous agents detected the following signals.</p>
      </div>

      <div className="space-y-4">
        {insights.length === 0 && (
          <Card className="glass-card border-destructive/30 bg-destructive/5">
            <CardContent className="p-5 space-y-2">
              <h3 className="font-bold text-lg">No insights available</h3>
              <p className="text-sm text-muted-foreground">Upload a report first, or try analyzing the file again.</p>
            </CardContent>
          </Card>
        )}
        {insights.map((insight, idx) => {
          const title = insight.title ?? insight.description ?? insight.issue_type;
          const explanation = insight.explanation ?? insight.reasoning;
          const confidence = typeof insight.confidence === 'number' ? `${Math.round(insight.confidence * 100)}%` : 'N/A';
          const Icon = getIcon(title);
          return (
            <Card 
              key={idx} 
              className={cn(
                "glass-card overflow-hidden group hover:border-intel-blue/30 transition-all animate-in fade-in slide-in-from-right-4 duration-700",
                idx === 0 ? "stagger-1" : idx === 1 ? "stagger-2" : "stagger-3"
              )}
            >
              <CardContent className="p-5 space-y-3">
                <div className="flex items-start justify-between">
                  <div className={cn("p-2 rounded-lg bg-secondary transition-colors duration-300 group-hover:bg-intel-blue/10", insight.severity === 'Critical' && "bg-red-500/10")}>
                    <Icon className={cn("w-6 h-6 transition-transform duration-500 group-hover:scale-110", insight.severity === 'Critical' ? "text-red-500" : "text-intel-blue")} />
                  </div>
                  <div className="flex gap-2">
                    <Badge variant="outline" className={cn("text-[9px] uppercase tracking-tighter", getSeverityColor(insight.severity))}>
                      {insight.severity}
                    </Badge>
                    <Badge variant="outline" className="text-[9px] uppercase tracking-tighter bg-intel-blue/5 text-intel-blue border-intel-blue/20">
                      {confidence} Conf.
                    </Badge>
                  </div>
                </div>

                <div className="space-y-1">
                  <h3 className="font-bold text-lg leading-tight group-hover:text-intel-blue transition-colors duration-300">
                    {title}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {explanation}
                  </p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="pt-4 animate-in fade-in slide-in-from-bottom-4 duration-700 stagger-4">
        <Button 
          disabled={insights.length === 0}
          onClick={() => setScreen('DECISION')}
          className="w-full h-14 bg-intel-blue hover:bg-intel-blue/90 gap-2 rounded-2xl font-headline text-lg glow-active group relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
          <Brain className="w-5 h-5 group-hover:rotate-12 transition-transform" />
          <span className="relative z-10">Evaluate Strategies</span>
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </Button>
      </div>
    </div>
  );
}
