"use client";

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import type { AnalysisResponse, StreamEvent, WorkflowState } from '@/lib/api';

export type Screen = 'SIGN_IN' | 'SIGN_UP' | 'HOME' | 'UPLOAD' | 'WORKFLOW' | 'INSIGHTS' | 'DECISION' | 'EXECUTION' | 'RESULTS' | 'FAILURE';

export interface WorkflowSnapshot {
  workflowId: string | null;
  uploadIds: string[];
  fileHash: string | null;
  executionState: WorkflowState;
  cachedResults: boolean;
  lastExecutionTimestamp: string | null;
}

interface DemoContextType {
  currentScreen: Screen;
  setScreen: (screen: Screen) => void;
  uploadedFile: File | null;
  setUploadedFile: (file: File | null) => void;
  analysisResults: AnalysisResponse | null;
  setAnalysisResults: (results: AnalysisResponse | null) => void;
  workflow: WorkflowSnapshot;
  setWorkflow: (workflow: Partial<WorkflowSnapshot>) => void;
  activeAgent: string | null;
  agentStatuses: Record<string, StreamEvent>;
  timeline: StreamEvent[];
  executionLogs: string[];
  addExecutionLog: (log: string) => void;
  liveEvents: StreamEvent[];
  appendLiveEvent: (event: StreamEvent) => void;
  resetLiveEvents: () => void;
  clearWorkflow: () => void;
}

const DemoContext = createContext<DemoContextType | undefined>(undefined);

const DEFAULT_WORKFLOW: WorkflowSnapshot = {
  workflowId: null,
  uploadIds: [],
  fileHash: null,
  executionState: 'initializing',
  cachedResults: false,
  lastExecutionTimestamp: null,
};

const WORKFLOW_STATE_BY_EVENT: Record<string, WorkflowState> = {
  'workflow.initialized': 'initializing',
  'stream.initialized': 'initializing',
  'workflow.started': 'initializing',
  'workflow.plan_created': 'planning',
  'workflow.observed': 'schema_analysis',
  'workflow.validation_completed': 'data_validation',
  'workflow.validation_requested': 'data_validation',
  'workflow.root_cause_completed': 'reasoning',
  'workflow.reasoned': 'reasoning',
  'workflow.impact_estimated': 'reasoning',
  'workflow.decided': 'decision_making',
  'workflow.executed': 'simulation',
  'workflow.alternative_executed': 'simulation',
  'workflow.reflected': 'evaluation',
  'analysis.completed': 'completed',
  'workflow.completed': 'completed',
  'workflow.failed': 'failed',
};

export function DemoProvider({ children }: { children: ReactNode }) {
  const [currentScreen, setCurrentScreen] = useState<Screen>('SIGN_IN');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [analysisResults, setAnalysisResults] = useState<AnalysisResponse | null>(null);
  const [workflow, setWorkflowState] = useState<WorkflowSnapshot>(DEFAULT_WORKFLOW);
  const [activeAgent, setActiveAgent] = useState<string | null>(null);
  const [agentStatuses, setAgentStatuses] = useState<Record<string, StreamEvent>>({});
  const [timeline, setTimeline] = useState<StreamEvent[]>([]);
  const [executionLogs, setExecutionLogs] = useState<string[]>([]);
  const [liveEvents, setLiveEvents] = useState<StreamEvent[]>([]);

  useEffect(() => {
    const cachedWorkflow = window.sessionStorage.getItem('visualcore.workflow');
    const cachedAnalysis = window.sessionStorage.getItem('visualcore.analysis');

    if (cachedWorkflow) {
      try {
        setWorkflowState((prev) => ({ ...prev, ...JSON.parse(cachedWorkflow) }));
      } catch {
        window.sessionStorage.removeItem('visualcore.workflow');
      }
    }

    if (cachedAnalysis) {
      try {
        setAnalysisResults(JSON.parse(cachedAnalysis));
      } catch {
        window.sessionStorage.removeItem('visualcore.analysis');
      }
    }
  }, []);

  const addExecutionLog = (log: string) => {
    setExecutionLogs((prev) => [...prev, log]);
  };

  const appendLiveEvent = (event: StreamEvent) => {
    setLiveEvents((prev) => [...prev, event]);
    setTimeline((prev) => [...prev, event]);
    if (event.event) {
      const stamp = event.timestamp ? `[${new Date(event.timestamp).toLocaleTimeString()}]` : '';
      const label = event.message || event.event;
      setExecutionLogs((prev) => [...prev, `${stamp} ${label}`.trim()]);
    }

    if (event.agent) {
      setAgentStatuses((prev) => ({ ...prev, [event.agent as string]: event }));
      if (event.status && ['running', 'thinking', 'calling_tool', 'analyzing'].includes(String(event.status))) {
        setActiveAgent(event.agent);
      }
      if (String(event.status) === 'completed') {
        setActiveAgent((current) => (current === event.agent ? null : current));
      }
    }

    const workflowState = WORKFLOW_STATE_BY_EVENT[event.event];
    if (workflowState) {
      setWorkflow({ executionState: workflowState, lastExecutionTimestamp: event.timestamp ?? null });
    }

    if (event.event === 'workflow.completed' || event.event === 'analysis.completed') {
      setActiveAgent(null);
      setWorkflow({ executionState: 'completed', lastExecutionTimestamp: event.timestamp ?? null });
    }

    if (event.event === 'workflow.failed') {
      setActiveAgent(null);
      setWorkflow({ executionState: 'failed', lastExecutionTimestamp: event.timestamp ?? null });
    }
  };

  const resetLiveEvents = () => {
    setLiveEvents([]);
  };

  const setWorkflow = (nextWorkflow: Partial<WorkflowSnapshot>) => {
    setWorkflowState((prev) => {
      const merged = { ...prev, ...nextWorkflow };
      window.sessionStorage.setItem('visualcore.workflow', JSON.stringify(merged));
      return merged;
    });
  };

  const setScreen = (screen: Screen) => {
    setCurrentScreen(screen);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const clearWorkflow = () => {
    setUploadedFile(null);
    setAnalysisResults(null);
    setWorkflowState(DEFAULT_WORKFLOW);
    setActiveAgent(null);
    setAgentStatuses({});
    setTimeline([]);
    setExecutionLogs([]);
    setLiveEvents([]);
    window.sessionStorage.removeItem('visualcore.workflow');
    window.sessionStorage.removeItem('visualcore.analysis');
  };

  useEffect(() => {
    if (analysisResults) {
      window.sessionStorage.setItem('visualcore.analysis', JSON.stringify(analysisResults));
    } else {
      window.sessionStorage.removeItem('visualcore.analysis');
    }
  }, [analysisResults]);

  return (
    <DemoContext.Provider
      value={{
        currentScreen,
        setScreen,
        uploadedFile,
        setUploadedFile,
        analysisResults,
        setAnalysisResults,
        workflow,
        setWorkflow,
        activeAgent,
        agentStatuses,
        timeline,
        executionLogs,
        addExecutionLog,
        liveEvents,
        appendLiveEvent,
        resetLiveEvents,
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
