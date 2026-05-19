"use client";

import React, { useState, useEffect } from 'react';
import { useDemo } from '@/app/lib/demo-context';
import { generateAndJustifyDecision } from '@/ai/flows/generate-and-justify-decision-flow';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, TrendingUp, Sparkles, ArrowRight } from 'lucide-react';

export function DecisionScreen() {
  const { analysisResults, decisionResults, setDecisionResults, setScreen } = useDemo();
  const [loading, setLoading] = useState(!decisionResults);

  useEffect(() => {
    if (!decisionResults && analysisResults?.insights?.length) {
      const fetchDecision = async () => {
        try {
          setLoading(true);
          const input = {
            businessIssues: analysisResults.insights.map(i => ({
              description: i.title,
              severity: i.severity.toUpperCase() as 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW',
              confidence: i.confidence === 'High' ? 0.9 : i.confidence === 'Medium' ? 0.7 : 0.5
            }))
          };
          const result = await generateAndJustifyDecision(input);
          setDecisionResults(result);
        } finally {
          setLoading(false);
        }
      };
      fetchDecision();
    } else if (!analysisResults?.insights?.length) {
      setLoading(false);
    }
  }, [analysisResults, decisionResults, setDecisionResults]);

  if (!analysisResults?.insights?.length && !decisionResults) {
    return (
      <div className="p-6 space-y-4">
        <h1 className="text-2xl font-headline font-bold">Autonomous Decision</h1>
        <Card className="glass-card">
          <CardContent className="p-5 space-y-3">
            <p className="text-sm text-muted-foreground">No analyzed insights are available yet.</p>
            <Button onClick={() => setScreen('UPLOAD')} className="w-full h-12 bg-intel-blue hover:bg-intel-blue/90 rounded-xl">
              Upload a Report
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="p-6 flex flex-col items-center justify-center min-h-[60vh] space-y-4 animate-pulse">
        <div className="w-16 h-16 rounded-full bg-intel-blue/20 flex items-center justify-center">
          <Sparkles className="w-8 h-8 text-intel-blue animate-spin" />
        </div>
        <p className="text-lg font-headline font-bold">Simulating Outcomes...</p>
        <p className="text-sm text-muted-foreground text-center px-8 italic">
          AI agents are evaluating risk/reward vectors across multiple strategic paths.
        </p>
      </div>
    );
  }

  const chosenOption = decisionResults?.options.find(o => o.id === decisionResults.chosenOptionId);

  return (
    <div className="p-6 space-y-8 animate-in fade-in duration-500">
      <div className="space-y-2">
        <h1 className="text-2xl font-headline font-bold">Autonomous Decision</h1>
        <p className="text-sm text-muted-foreground">The AI evaluated 3 distinct strategies and selected the optimal path.</p>
      </div>

      <div className="space-y-6">
        {/* Recommended Option */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Badge className="bg-green-500 text-white rounded-md px-2 py-1">RECOMMENDED</Badge>
            <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">Selected Strategy</span>
          </div>
          
          <Card className="glass-card border-green-500/30 bg-green-500/5 glow-active overflow-hidden">
            <CardContent className="p-6 space-y-4">
              <div className="flex items-start justify-between">
                <h3 className="text-xl font-bold text-green-400">{chosenOption?.description}</h3>
                <div className="p-2 rounded-lg bg-green-500/20">
                   <TrendingUp className="w-6 h-6 text-green-400" />
                </div>
              </div>

              <div className="space-y-3">
                <p className="text-sm leading-relaxed">{decisionResults?.justification}</p>
                <div className="grid grid-cols-2 gap-4 pt-2">
                   <div className="space-y-1">
                      <p className="text-[10px] text-muted-foreground uppercase font-bold">Impact</p>
                      <p className="text-sm font-medium">{chosenOption?.estimatedImpact}</p>
                   </div>
                   <div className="space-y-1">
                      <p className="text-[10px] text-muted-foreground uppercase font-bold">Risk Level</p>
                      <Badge variant="outline" className="text-[10px] bg-secondary border-none">{chosenOption?.riskLevel}</Badge>
                   </div>
                </div>
              </div>

              <div className="pt-4 border-t border-white/5 space-y-2">
                <p className="text-xs font-bold text-green-400/80">Key Pros:</p>
                <ul className="space-y-1">
                   {chosenOption?.pros.map((pro, i) => (
                     <li key={i} className="flex items-center gap-2 text-xs text-muted-foreground">
                        <CheckCircle2 className="w-3 h-3 text-green-500" /> {pro}
                     </li>
                   ))}
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Other Options - Collapsed for Demo simplicity */}
        <div className="space-y-4">
           <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest px-1">Alternative Scenarios</p>
           <div className="space-y-3 opacity-60 grayscale">
             {decisionResults?.options.filter(o => o.id !== decisionResults.chosenOptionId).map((opt, i) => (
               <Card key={i} className="glass-card bg-background/40">
                 <CardContent className="p-4 flex items-center justify-between">
                    <span className="text-sm font-medium">{opt.description}</span>
                    <Badge variant="secondary" className="text-[8px]">{opt.riskLevel} RISK</Badge>
                 </CardContent>
               </Card>
             ))}
           </div>
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
