"use client";

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { AnalyzeAndGenerateInsightsOutput } from '@/ai/flows/analyze-and-generate-insights';
import { GenerateAndJustifyDecisionOutput } from '@/ai/flows/generate-and-justify-decision-flow';

export type Screen = 'SIGN_IN' | 'SIGN_UP' | 'HOME' | 'UPLOAD' | 'WORKFLOW' | 'INSIGHTS' | 'DECISION' | 'EXECUTION' | 'RESULTS' | 'FAILURE';

interface DemoContextType {
  currentScreen: Screen;
  setScreen: (screen: Screen) => void;
  uploadedFile: File | null;
  setUploadedFile: (file: File | null) => void;
  analysisResults: AnalyzeAndGenerateInsightsOutput | null;
  setAnalysisResults: (results: AnalyzeAndGenerateInsightsOutput | null) => void;
  decisionResults: GenerateAndJustifyDecisionOutput | null;
  setDecisionResults: (results: GenerateAndJustifyDecisionOutput | null) => void;
  executionLogs: string[];
  addExecutionLog: (log: string) => void;
  clearWorkflow: () => void;
}

const DemoContext = createContext<DemoContextType | undefined>(undefined);

export function DemoProvider({ children }: { children: ReactNode }) {
  const [currentScreen, setCurrentScreen] = useState<Screen>('SIGN_IN');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [analysisResults, setAnalysisResults] = useState<AnalyzeAndGenerateInsightsOutput | null>(null);
  const [decisionResults, setDecisionResults] = useState<GenerateAndJustifyDecisionOutput | null>(null);
  const [executionLogs, setExecutionLogs] = useState<string[]>([]);

  const addExecutionLog = (log: string) => {
    setExecutionLogs((prev) => [...prev, log]);
  };

  const setScreen = (screen: Screen) => {
    setCurrentScreen(screen);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const clearWorkflow = () => {
    setUploadedFile(null);
    setAnalysisResults(null);
    setDecisionResults(null);
    setExecutionLogs([]);
  };

  return (
    <DemoContext.Provider
      value={{
        currentScreen,
        setScreen,
        uploadedFile,
        setUploadedFile,
        analysisResults,
        setAnalysisResults,
        decisionResults,
        setDecisionResults,
        executionLogs,
        addExecutionLog,
        clearWorkflow,
      }}
    >
      {children}
    </DemoContext.Provider>
  );
}

export function useDemo() {
  const context = useContext(DemoContext);
  if (context === undefined) {
    throw new Error('useDemo must be used within a DemoProvider');
  }
  return context;
}
