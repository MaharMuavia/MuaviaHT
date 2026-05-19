"use client";

import React, { useState } from 'react';
import { useDemo } from '@/app/lib/demo-context';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { FileUp, FileText, CheckCircle2, X, BrainCircuit } from 'lucide-react';
import { analyzeAndGenerateInsights } from '@/ai/flows/analyze-and-generate-insights';

export function UploadScreen() {
  const { setScreen, setUploadedFile, setAnalysisResults } = useDemo();
  const [file, setFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) {
      setFile(selected);
      // Simulate upload
      setUploadProgress(0);
      const interval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval);
            return 100;
          }
          return prev + 10;
        });
      }, 100);
    }
  };

  const handleAnalyze = async () => {
    if (!file) return;
    setIsAnalyzing(true);
    setUploadedFile(file);
    
    try {
      // Mocked analysis for the demo
      const result = await analyzeAndGenerateInsights({
        reportContent: "Sample business data: Q3 Revenue dropped in Southeast region by 15%. Supply chain delays in Karachi port causing stockouts. Customer sentiment score at 6.2/10.",
        reportFileName: file.name,
      });
      setAnalysisResults(result);
      setScreen('WORKFLOW');
    } catch (error) {
      console.error(error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="p-6 space-y-8 animate-in fade-in zoom-in-95 duration-500">
      <div className="space-y-2">
        <h1 className="text-2xl font-headline font-bold">Neural Upload</h1>
        <p className="text-sm text-muted-foreground">Feed the core with signals to begin autonomous reasoning.</p>
      </div>

      {!file ? (
        <label className="block">
          <Card className="border-dashed border-2 border-intel-blue/20 bg-intel-blue/5 h-64 flex flex-col items-center justify-center cursor-pointer hover:bg-intel-blue/10 transition-all hover:border-intel-blue/40 group">
            <div className="w-16 h-16 rounded-full bg-intel-blue/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <FileUp className="w-8 h-8 text-intel-blue" />
            </div>
            <span className="text-sm font-medium text-foreground">Tap to select signal</span>
            <span className="text-[10px] text-muted-foreground mt-2">PDF, XLSX, CSV, JPG</span>
            <input type="file" className="hidden" onChange={handleFileSelect} accept=".pdf,.csv,.xlsx,.xls,.png,.jpg,.jpeg" />
          </Card>
        </label>
      ) : (
        <div className="space-y-6">
          <Card className="glass-card p-4 relative overflow-hidden">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center">
                <FileText className="w-6 h-6 text-intel-blue" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-medium truncate">{file.name}</h3>
                <p className="text-xs text-muted-foreground">{(file.size / 1024).toFixed(1)} KB</p>
              </div>
              {uploadProgress === 100 ? (
                <CheckCircle2 className="w-6 h-6 text-green-500" />
              ) : (
                <Button variant="ghost" size="icon" onClick={() => setFile(null)}>
                  <X className="w-4 h-4" />
                </Button>
              )}
            </div>
            {uploadProgress < 100 && (
              <Progress value={uploadProgress} className="h-1 mt-4" />
            )}
            <div className="absolute inset-x-0 bottom-0 h-1 bg-intel-blue/20 animate-scanning opacity-20 pointer-events-none" />
          </Card>

          <Button 
            disabled={uploadProgress < 100 || isAnalyzing}
            onClick={handleAnalyze}
            className="w-full h-14 text-lg font-headline bg-intel-blue hover:bg-intel-blue/90 rounded-2xl glow-active"
          >
            {isAnalyzing ? (
              <span className="flex items-center gap-2">
                <BrainCircuit className="w-5 h-5 animate-spin" />
                Initializing Neural Link...
              </span>
            ) : (
              "Analyze with AI"
            )}
          </Button>
        </div>
      )}

      {/* Technical Metadata */}
      <div className="pt-4">
        <div className="text-[10px] font-mono text-muted-foreground flex justify-between border-t border-white/5 pt-4">
          <span>MD5: 2F90A...B12</span>
          <span>ENCRYPTION: AES-256</span>
        </div>
      </div>
    </div>
  );
}
