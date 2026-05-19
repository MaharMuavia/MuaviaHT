"use client";

import React from 'react';
import { useDemo } from '@/app/lib/demo-context';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Upload, ShieldCheck, Sparkles } from 'lucide-react';

export function HomeScreen() {
  const { setScreen } = useDemo();

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] p-8 space-y-12 overflow-hidden">
      {/* Visual Background Effect */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-intel-blue/5 rounded-full blur-[120px] animate-pulse-glow" />
      </div>

      {/* Hero Section */}
      <div className="text-center space-y-6 relative z-10 animate-in fade-in slide-in-from-bottom-8 duration-1000">
        <div className="inline-flex items-center justify-center p-4 rounded-3xl bg-intel-blue/10 border border-intel-blue/20 mb-2 shadow-2xl shadow-intel-blue/10 animate-float">
          <ShieldCheck className="w-12 h-12 text-intel-blue" />
        </div>
        <div className="space-y-2">
          <h1 className="text-4xl font-headline font-bold tracking-tight">
            VISUALCORE <br />
            <span className="text-intel-blue tracking-widest opacity-90">SENTINEL</span>
          </h1>
          <p className="text-muted-foreground text-sm max-w-[280px] mx-auto leading-relaxed font-medium">
            Upload business data and let autonomous AI agents analyze, reason, and generate actions.
          </p>
        </div>
      </div>

      {/* Clean Centered Upload Area */}
      <div className="w-full space-y-6 relative z-10 animate-in fade-in slide-in-from-bottom-12 duration-1000 stagger-2">
        <Card 
          onClick={() => setScreen('UPLOAD')}
          className="glass-card border-dashed border-2 border-white/5 hover:border-intel-blue/40 transition-all cursor-pointer group flex flex-col items-center justify-center p-12 bg-white/[0.02]"
        >
          <div className="w-16 h-16 rounded-full bg-intel-blue/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-500">
            <Upload className="w-8 h-8 text-intel-blue group-hover:animate-bounce" />
          </div>
          <p className="text-lg font-headline font-bold">Upload your files</p>
          <p className="text-[10px] text-muted-foreground uppercase tracking-[0.2em] mt-2 font-bold opacity-60">
            PDF • CSV • XLSX • DOCX • PNG • JPG • JSON
          </p>
        </Card>

        <Button 
          onClick={() => setScreen('UPLOAD')}
          className="w-full h-16 text-lg font-headline bg-intel-blue hover:bg-intel-blue/90 rounded-2xl shadow-xl shadow-intel-blue/20 gap-3 group overflow-hidden relative"
        >
          <Sparkles className="w-5 h-5 group-hover:rotate-12 transition-transform" />
          <span className="relative z-10">Initialize Neural Analysis</span>
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
        </Button>
      </div>

      {/* Footer Meta */}
      <div className="pt-8 text-center animate-in fade-in duration-1000 stagger-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/5">
          <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
          <span className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground/80">Core Engine Standby</span>
        </div>
      </div>
    </div>
  );
}