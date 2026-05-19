"use client";

import React from 'react';
import { useDemo } from '@/app/lib/demo-context';
import { Button } from '@/components/ui/button';
import { Home, Upload, Activity, Lightbulb, Gavel, Play, BarChart3, BrainCircuit } from 'lucide-react';
import { cn } from '@/lib/utils';

export function AppLayout({ children }: { children: React.ReactNode }) {
  const { currentScreen, setScreen } = useDemo();

  const isAuthScreen = currentScreen === 'SIGN_IN' || currentScreen === 'SIGN_UP';

  const navItems = [
    { id: 'HOME', icon: Home, label: 'Home' },
    { id: 'UPLOAD', icon: Upload, label: 'Upload' },
    { id: 'WORKFLOW', icon: Activity, label: 'Agents' },
    { id: 'INSIGHTS', icon: Lightbulb, label: 'Insights' },
    { id: 'DECISION', icon: Gavel, label: 'Decision' },
    { id: 'EXECUTION', icon: Play, label: 'Execution' },
    { id: 'RESULTS', icon: BarChart3, label: 'Results' },
  ];

  return (
    <div className="flex flex-col min-h-screen max-w-md mx-auto relative bg-navy-bg shadow-2xl">
      {/* Top Header - Hidden on Auth Screens */}
      {!isAuthScreen && (
        <header className="sticky top-0 z-50 flex items-center justify-between p-4 bg-background/80 backdrop-blur-md border-b border-white/5 animate-in slide-in-from-top-4 duration-500">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => setScreen('HOME')}>
            <div className="w-8 h-8 rounded-lg bg-intel-blue flex items-center justify-center shadow-lg shadow-intel-blue/20">
              <BrainCircuit className="w-5 h-5 text-white" />
            </div>
            <span className="font-headline font-bold text-lg tracking-tight">VisualCore</span>
          </div>
          <div className="flex gap-2 items-center">
             <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
             <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-widest">Live Engine</span>
          </div>
        </header>
      )}

      {/* Screen Content */}
      <main className={cn("flex-1", !isAuthScreen ? "pb-24" : "flex flex-col")}>
        {children}
      </main>

      {/* Bottom Navigation - Hidden on Auth Screens */}
      {!isAuthScreen && (
        <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md bg-background/90 backdrop-blur-xl border-t border-white/5 px-2 py-3 flex justify-around items-center z-50 animate-in slide-in-from-bottom-4 duration-500">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setScreen(item.id as any)}
              className={cn(
                "flex flex-col items-center gap-1 transition-all duration-300",
                currentScreen === item.id ? "text-intel-blue" : "text-muted-foreground hover:text-foreground"
              )}
            >
              <item.icon className={cn("w-5 h-5", currentScreen === item.id && "scale-110")} />
              <span className="text-[10px] font-medium">{item.label}</span>
            </button>
          ))}
        </nav>
      )}
    </div>
  );
}
