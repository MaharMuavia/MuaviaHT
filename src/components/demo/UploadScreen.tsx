"use client";

import React, { useState } from 'react';
import { useDemo } from '@/app/lib/demo-context';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { FileUp, FileText, CheckCircle2, X, BrainCircuit, AlertCircle } from 'lucide-react';
import { uploadAndStreamAnalyzeFile } from '@/lib/api';

export function UploadScreen() {
  const { setScreen, setUploadedFile, setAnalysisResults, setWorkflow, clearWorkflow, appendLiveEvent } = useDemo();
  const [file, setFile] = useState<File | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) {
      clearWorkflow();
      setFile(selected);
      setErrorMessage(null);
    }
  };

  const handleAnalyze = async () => {
    if (!file) return;
    setIsAnalyzing(true);
    setErrorMessage(null);
    setUploadedFile(file);
    setScreen('WORKFLOW');
    setWorkflow({ executionState: 'initializing', cachedResults: false, lastExecutionTimestamp: null });
    
    try {
      const { upload, analysis } = await uploadAndStreamAnalyzeFile(
        file,
        'Frontend autonomous analysis run',
        false,
        (event) => {
          appendLiveEvent(event);
          if (event.workflow_id) {
            setWorkflow({ workflowId: event.workflow_id });
          }
          if (event.event === 'analysis.completed' && event.analysis) {
            setAnalysisResults(event.analysis);
            setWorkflow({
              workflowId: event.workflow_id ?? event.analysis.workflow_id ?? null,
              uploadIds: event.analysis.upload_ids ?? [],
              fileHash: null,
              executionState: event.analysis.execution_state ?? 'completed',
              cachedResults: Boolean(event.analysis.cached_results),
              lastExecutionTimestamp: event.analysis.last_execution_timestamp ?? event.analysis.created_at,
            });
            setScreen('RESULTS');
          }
        },
      );

      setUploadedFile(file);
      setAnalysisResults(analysis);
      setWorkflow({
        workflowId: analysis.workflow_id ?? analysis.id,
        uploadIds: analysis.upload_ids ?? [upload.id],
        fileHash: upload.file_hash ?? null,
        executionState: analysis.execution_state ?? 'completed',
        cachedResults: Boolean(analysis.cached_results),
        lastExecutionTimestamp: analysis.last_execution_timestamp ?? analysis.created_at,
      });
      setScreen('RESULTS');
    } catch (error) {
      console.error(error);
      setAnalysisResults(null);
      setErrorMessage(error instanceof Error ? error.message : 'Analysis failed. Please try another file.');
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
              <CheckCircle2 className="w-6 h-6 text-green-500" />
              <Button variant="ghost" size="icon" onClick={() => setFile(null)}>
                <X className="w-4 h-4" />
              </Button>
            </div>
            <div className="absolute inset-x-0 bottom-0 h-1 bg-intel-blue/20 opacity-20 pointer-events-none" />
          </Card>

          <Button 
            disabled={isAnalyzing}
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
          {errorMessage && (
            <div className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}
        </div>
      )}

      {/* Technical Metadata */}
      <div className="pt-4">
        <div className="text-[10px] font-mono text-muted-foreground flex justify-between border-t border-white/5 pt-4">
          <span>MD5: computed per upload</span>
          <span>ENCRYPTION: AES-256</span>
        </div>
      </div>
    </div>
  );
}
