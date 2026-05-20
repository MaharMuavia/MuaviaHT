'use server';
/**
 * @fileOverview A Genkit flow for generating real-time, concise reasoning snippets for active AI agents.
 *
 * - generateLiveAgentReasoning - A function that handles the generation of agent reasoning.
 * - GenerateLiveAgentReasoningInput - The input type for the generateLiveAgentReasoning function.
 * - GenerateLiveAgentReasoningOutput - The return type for the generateLiveAgentReasoning function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const FALLBACK_AGENT_PROFILES: Record<string, { status: string; confidenceScore: number; reasoningSnippet: string }> = {
  'Input Agent': {
    status: 'Observing signals',
    confidenceScore: 84,
    reasoningSnippet: 'Extracting structured inputs from the source report and normalizing the data stream.',
  },
  'Insight Agent': {
    status: 'Detecting anomalies',
    confidenceScore: 88,
    reasoningSnippet: 'Cross-referencing signals to surface business anomalies, trends, and pressure points.',
  },
  'Impact Agent': {
    status: 'Estimating impact',
    confidenceScore: 91,
    reasoningSnippet: 'Translating the detected issues into operational and financial impact estimates.',
  },
  'Decision Agent': {
    status: 'Ranking options',
    confidenceScore: 93,
    reasoningSnippet: 'Scoring strategic responses and selecting the option with the best balance of risk and reward.',
  },
  'Execution Agent': {
    status: 'Simulating execution',
    confidenceScore: 86,
    reasoningSnippet: 'Projecting the selected strategy into concrete steps, dependencies, and observable actions.',
  },
  'Reflection Agent': {
    status: 'Reviewing outcomes',
    confidenceScore: 90,
    reasoningSnippet: 'Evaluating the path taken and identifying what to refine before the next cycle.',
  },
};

function getFallbackProfile(agentName: string) {
  return (
    FALLBACK_AGENT_PROFILES[agentName] ?? {
      status: 'Heuristic processing',
      confidenceScore: 85,
      reasoningSnippet: `Agent ${agentName} is processing the current report context using heuristic pathways.`,
    }
  );
}

const GenerateLiveAgentReasoningInputSchema = z.object({
  agentName: z.string().describe('The name of the AI agent (e.g., Input Agent, Insight Agent).'),
  currentContext: z.string().describe('A summary of the data or task the agent is currently processing.'),
  previousAgentReasoning: z.string().optional().describe('The reasoning snippet from the previous AI agent in the workflow.'),
});

export type GenerateLiveAgentReasoningInput = z.infer<typeof GenerateLiveAgentReasoningInputSchema>;

const GenerateLiveAgentReasoningOutputSchema = z.object({
  reasoningSnippet: z.string().describe('A concise, real-time statement of the agent\u0027s current processing and thought progression.'),
  agentStatus: z.string().describe('The current status of the agent (e.g., Processing, Analyzing, Deciding, Executing).'),
  confidenceScore: z.number().min(0).max(100).describe('A confidence score (0-100) indicating the agent\u0027s certainty in its current operation.'),
});

export type GenerateLiveAgentReasoningOutput = z.infer<typeof GenerateLiveAgentReasoningOutputSchema>;

const generateLiveAgentReasoningPrompt = ai.definePrompt({
  name: 'generateLiveAgentReasoningPrompt',
  input: { schema: GenerateLiveAgentReasoningInputSchema },
  output: { schema: GenerateLiveAgentReasoningOutputSchema },
  prompt: `You are an AI agent named {{{agentName}}} within the VisualCore Sentinel system, providing insights into your operational state.

Your task is to generate a concise reasoning snippet, an updated status, and a confidence score based on your current context and the reasoning from the previous agent.

Previous Agent's Reasoning (if available): {{{previousAgentReasoning}}}

Current Context: {{{currentContext}}}

Ensure the reasoning snippet is brief and clearly explains what you are currently doing or thinking. The status should reflect your immediate action, and the confidence score should be an integer between 0 and 100.

Generate the response in JSON format matching the output schema.`, 
});

const generateLiveAgentReasoningFlow = ai.defineFlow(
  {
    name: 'generateLiveAgentReasoningFlow',
    inputSchema: GenerateLiveAgentReasoningInputSchema,
    outputSchema: GenerateLiveAgentReasoningOutputSchema,
  },
  async (input) => {
    try {
      const { output } = await generateLiveAgentReasoningPrompt(input);
      return output!;
    } catch {
      console.warn('AI Service Busy, using heuristic fallback for reasoning.');
      const fallback = getFallbackProfile(input.agentName);
      return {
        reasoningSnippet: fallback.reasoningSnippet,
        agentStatus: fallback.status,
        confidenceScore: fallback.confidenceScore,
      };
    }
  }
);

export async function generateLiveAgentReasoning(input: GenerateLiveAgentReasoningInput): Promise<GenerateLiveAgentReasoningOutput> {
  return generateLiveAgentReasoningFlow(input);
}
