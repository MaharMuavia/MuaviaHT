"use client";

import React from 'react';
import { DemoProvider, useDemo } from '@/app/lib/demo-context';
import { AppLayout } from '@/components/demo/AppLayout';
import { HomeScreen } from '@/components/demo/HomeScreen';
import { UploadScreen } from '@/components/demo/UploadScreen';
import { WorkflowScreen } from '@/components/demo/WorkflowScreen';
import { InsightsScreen } from '@/components/demo/InsightsScreen';
import { DecisionScreen } from '@/components/demo/DecisionScreen';
import { ExecutionScreen } from '@/components/demo/ExecutionScreen';
import { ResultsScreen } from '@/components/demo/ResultsScreen';

function ScreenRenderer() {
  const { currentScreen } = useDemo();

  switch (currentScreen) {
    case 'HOME': return <HomeScreen />;
    case 'UPLOAD': return <UploadScreen />;
    case 'WORKFLOW': return <WorkflowScreen />;
    case 'INSIGHTS': return <InsightsScreen />;
    case 'DECISION': return <DecisionScreen />;
    case 'EXECUTION': return <ExecutionScreen />;
    case 'RESULTS': return <ResultsScreen />;
    default: return <HomeScreen />;
  }
}

export default function Home() {
  return (
    <DemoProvider>
      <AppLayout>
        <ScreenRenderer />
      </AppLayout>
    </DemoProvider>
  );
}
