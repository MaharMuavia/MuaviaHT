"use client";

import React, { useState } from 'react';
import { useDemo } from '@/app/lib/demo-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Cpu, Loader2 } from 'lucide-react';

export function SignUpScreen() {
  const { setScreen } = useDemo();
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ name?: string; email?: string; password?: string; confirm?: string }>({});

  const handleSignUp = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const name = formData.get('name') as string;
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const confirm = formData.get('confirm') as string;

    const newErrors: any = {};
    if (!name) newErrors.name = "Full name is required";
    if (!email) newErrors.email = "Email is required";
    if (!password) newErrors.password = "Password is required";
    if (password !== confirm) newErrors.confirm = "Passwords do not match";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      setScreen('HOME');
    }, 800);
  };

  return (
    <div className="min-h-[80vh] flex flex-col justify-center p-8 space-y-10 animate-in fade-in duration-700">
      <div className="flex flex-col items-center text-center space-y-4">
        <div className="w-14 h-14 rounded-2xl bg-intel-blue flex items-center justify-center shadow-2xl shadow-intel-blue/30 glow-active">
          <Cpu className="w-8 h-8 text-white" />
        </div>
        <div className="space-y-1">
          <h1 className="text-2xl font-headline font-bold tracking-tight uppercase">Create Account</h1>
          <p className="text-sm text-muted-foreground font-medium">
            Join the autonomous core.
          </p>
        </div>
      </div>

      <form onSubmit={handleSignUp} className="space-y-5">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground px-1">Full Name</Label>
            <Input 
              name="name"
              placeholder="John Doe" 
              className="h-12 rounded-xl bg-secondary/50 border-white/5 focus:ring-intel-blue/50"
            />
            {errors.name && <p className="text-[10px] text-destructive px-1">{errors.name}</p>}
          </div>
          <div className="space-y-2">
            <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground px-1">Work Email</Label>
            <Input 
              name="email"
              type="email" 
              placeholder="name@company.com" 
              className="h-12 rounded-xl bg-secondary/50 border-white/5 focus:ring-intel-blue/50"
            />
            {errors.email && <p className="text-[10px] text-destructive px-1">{errors.email}</p>}
          </div>
          <div className="grid grid-cols-2 gap-3">
             <div className="space-y-2">
                <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground px-1">Password</Label>
                <Input 
                  name="password"
                  type="password" 
                  placeholder="••••••••" 
                  className="h-12 rounded-xl bg-secondary/50 border-white/5 focus:ring-intel-blue/50"
                />
             </div>
             <div className="space-y-2">
                <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground px-1">Confirm</Label>
                <Input 
                  name="confirm"
                  type="password" 
                  placeholder="••••••••" 
                  className="h-12 rounded-xl bg-secondary/50 border-white/5 focus:ring-intel-blue/50"
                />
             </div>
          </div>
          {errors.password && <p className="text-[10px] text-destructive px-1">{errors.password}</p>}
          {errors.confirm && <p className="text-[10px] text-destructive px-1">{errors.confirm}</p>}
        </div>

        <Button 
          type="submit"
          disabled={isLoading}
          className="w-full h-14 bg-intel-blue hover:bg-intel-blue/90 rounded-2xl text-lg font-headline shadow-lg shadow-intel-blue/20 mt-4"
        >
          {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Create Account"}
        </Button>

        <div className="text-center pt-2">
          <button 
            type="button"
            onClick={() => setScreen('SIGN_IN')}
            className="text-sm text-muted-foreground hover:text-intel-blue transition-colors"
          >
            Already have an account? <span className="text-foreground font-bold underline underline-offset-4">Sign In</span>
          </button>
        </div>
      </form>
    </div>
  );
}
