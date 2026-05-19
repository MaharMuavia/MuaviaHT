"use client";

import React, { useState } from 'react';
import { useDemo } from '@/app/lib/demo-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { BarChart3, Loader2 } from 'lucide-react';

export function SignInScreen() {
  const { setScreen } = useDemo();
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    const newErrors: { email?: string; password?: string } = {};
    if (!email) newErrors.email = "Email is required";
    if (!password) newErrors.password = "Password is required";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsLoading(true);
    // Mocking a quick delay
    setTimeout(() => {
      setScreen('HOME');
    }, 800);
  };

  return (
    <div className="min-h-[80vh] flex flex-col justify-center p-8 space-y-10 animate-in fade-in duration-700">
      <div className="flex flex-col items-center text-center space-y-4">
        <div className="w-14 h-14 rounded-2xl bg-intel-blue flex items-center justify-center shadow-2xl shadow-intel-blue/30 glow-active">
          <BarChart3 className="w-8 h-8 text-white" />
        </div>
        <div className="space-y-1">
          <h1 className="text-2xl font-headline font-bold tracking-tight">VISUALCORE SENTINEL</h1>
          <p className="text-sm text-muted-foreground font-medium uppercase tracking-[0.2em] opacity-70">
            Autonomous Business Intelligence
          </p>
        </div>
      </div>

      <form onSubmit={handleSignIn} className="space-y-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground px-1">Email Address</Label>
            <Input 
              id="email" 
              name="email"
              type="email" 
              placeholder="name@company.com" 
              className="h-12 rounded-xl bg-secondary/50 border-white/5 focus:ring-intel-blue/50"
            />
            {errors.email && <p className="text-[10px] text-destructive px-1">{errors.email}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="password" title="Password" className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground px-1">Password</Label>
            <Input 
              id="password" 
              name="password"
              type="password" 
              placeholder="••••••••" 
              className="h-12 rounded-xl bg-secondary/50 border-white/5 focus:ring-intel-blue/50"
            />
            {errors.password && <p className="text-[10px] text-destructive px-1">{errors.password}</p>}
          </div>
        </div>

        <Button 
          type="submit"
          disabled={isLoading}
          className="w-full h-14 bg-intel-blue hover:bg-intel-blue/90 rounded-2xl text-lg font-headline shadow-lg shadow-intel-blue/20"
        >
          {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Sign In"}
        </Button>

        <div className="space-y-4 text-center">
          <button 
            type="button"
            onClick={() => setScreen('SIGN_UP')}
            className="text-sm text-muted-foreground hover:text-intel-blue transition-colors"
          >
            Don't have an account? <span className="text-foreground font-bold underline underline-offset-4">Sign Up</span>
          </button>
          
          <div className="flex items-center gap-4 py-2">
            <div className="h-px flex-1 bg-white/5" />
            <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">OR</span>
            <div className="h-px flex-1 bg-white/5" />
          </div>

          <button 
            type="button"
            onClick={() => setScreen('HOME')}
            className="text-sm font-medium text-intel-blue/80 hover:text-intel-blue"
          >
            Continue as Guest
          </button>
        </div>
      </form>
    </div>
  );
}
