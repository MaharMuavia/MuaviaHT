"use client";

import React from 'react';
import { useDemo } from '@/app/lib/demo-context';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Upload, ShieldCheck, Clock, ArrowRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export function HomeScreen() {
  const { setScreen } = useDemo();

  const recentAnalyses = [
    { title: "Q4 Retail Performance", date: "2 hours ago", status: "Success" },
    { title: "Supply Chain Latency", date: "Yesterday", status: "Success" },
    { title: "Customer Churn Risk", date: "3 days ago", status: "Analyzed" },
  ];

  return (
    <div className="p-6 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Hero Section */}
      <div className="text-center space-y-4 pt-8">
        <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-intel-blue/10 border border-intel-blue/20 mb-2">
          <ShieldCheck className="w-10 h-10 text-intel-blue" />
        </div>
        <h1 className="text-4xl font-headline font-bold leading-tight">
          VisualCore <br />
          <span className="text-intel-blue">Sentinel</span>
        </h1>
        <p className="text-muted-foreground text-sm px-8">
          From Business Signals to Autonomous Actions. Google Antigravity Hackathon 2026.
        </p>
      </div>

      {/* Main CTA */}
      <div className="space-y-4">
        <Button 
          onClick={() => setScreen('UPLOAD')}
          className="w-full h-14 text-lg font-headline bg-intel-blue hover:bg-intel-blue/90 rounded-2xl shadow-lg shadow-intel-blue/20"
        >
          <Upload className="mr-2 w-5 h-5" />
          Upload Business Report
        </Button>
        <p className="text-center text-[10px] text-muted-foreground uppercase tracking-wider">
          PDF, CSV, Excel, or Screenshots
        </p>
      </div>

      {/* Recent Activity */}
      <div className="space-y-4 pt-4">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-sm font-semibold text-foreground/80 uppercase tracking-widest">Recent Cycles</h2>
          <Button variant="link" className="text-xs text-intel-blue p-0">View All</Button>
        </div>

        <div className="space-y-3">
          {recentAnalyses.map((item, idx) => (
            <Card key={idx} className="glass-card border-white/5 hover:border-intel-blue/30 transition-colors cursor-pointer group">
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center">
                    <Clock className="w-5 h-5 text-muted-foreground" />
                  </div>
                  <div>
                    <h3 className="text-sm font-medium">{item.title}</h3>
                    <p className="text-[10px] text-muted-foreground">{item.date}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-[9px] bg-green-500/5 text-green-500 border-green-500/20">
                    {item.status}
                  </Badge>
                  <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-intel-blue transition-colors" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
