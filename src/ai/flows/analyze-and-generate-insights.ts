'use server';
/**
 * @fileOverview This file defines a Genkit flow for analyzing business data and generating actionable insights.
 *
 * - analyzeAndGenerateInsights - A function that handles the business data analysis process.
 * - AnalyzeAndGenerateInsightsInput - The input type for the analyzeAndGenerateInsights function.
 * - AnalyzeAndGenerateInsightsOutput - The return type for the analyzeAndGenerateInsights function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const InsightSchema = z.object({
  title: z.string().describe('A concise summary of the detected business issue or opportunity.'),
  explanation: z
    .string()
    .describe('A detailed explanation of the insight, its context, and potential implications.'),
  severity: z
    .enum(['Low', 'Medium', 'High', 'Critical'])
    .describe('The severity level of the insight.'),
  confidence: z.enum(['Low', 'Medium', 'High']).describe('The confidence level in the insight.'),
});

const AnalyzeAndGenerateInsightsInputSchema = z.object({
  reportContent: z
    .string()
    .describe(
      'The extracted text content of the business report (PDF, CSV, Excel, or OCR from image).' + 'This can be raw text, CSV data, or other structured text.'
    ),
  reportFileName: z
    .string()
    .optional()
    .describe('The original file name of the report, e.g., sales_report.csv.'),
});
export type AnalyzeAndGenerateInsightsInput = z.infer<typeof AnalyzeAndGenerateInsightsInputSchema>;

const AnalyzeAndGenerateInsightsOutputSchema = z.object({
  insights: z.array(InsightSchema).describe('A list of actionable business insights generated from the report.'),
});
export type AnalyzeAndGenerateInsightsOutput = z.infer<typeof AnalyzeAndGenerateInsightsOutputSchema>;

export async function analyzeAndGenerateInsights(
  input: AnalyzeAndGenerateInsightsInput
): Promise<AnalyzeAndGenerateInsightsOutput> {
  return analyzeAndGenerateInsightsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'analyzeAndGenerateInsightsPrompt',
  input: { schema: AnalyzeAndGenerateInsightsInputSchema },
  output: { schema: AnalyzeAndGenerateInsightsOutputSchema },
  prompt: `You are an expert business intelligence analyst for VisualCore Sentinel, an AI operating system for autonomous business actions.
Your task is to analyze the provided business report content and extract concise, actionable insights with explanations and severity/confidence scores.

Focus on identifying key business issues, opportunities, and anomalies.

Report Filename: {{{reportFileName}}}
Report Content:
"""{{{reportContent}}}"""

Provide the output in a JSON array of insights, each with a 'title', 'explanation', 'severity' (Low, Medium, High, Critical), and 'confidence' (Low, Medium, High).
`,
});

const analyzeAndGenerateInsightsFlow = ai.defineFlow(
  {
    name: 'analyzeAndGenerateInsightsFlow',
    inputSchema: AnalyzeAndGenerateInsightsInputSchema,
    outputSchema: AnalyzeAndGenerateInsightsOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
