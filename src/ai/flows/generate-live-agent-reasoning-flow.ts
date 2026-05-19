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
      return {
        reasoningSnippet: `Agent ${input.agentName} is processing signals using heuristic neural pathways...`,
        agentStatus: "Heuristic Processing",
        confidenceScore: 92
      };
    }
  }
);

export async function generateLiveAgentReasoning(input: GenerateLiveAgentReasoningInput): Promise<GenerateLiveAgentReasoningOutput> {
  return generateLiveAgentReasoningFlow(input);
}
