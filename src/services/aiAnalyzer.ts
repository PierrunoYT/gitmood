import * as vscode from 'vscode';
import { GoogleGenAI, Type } from '@google/genai';

export interface CommitAnalysis {
  message: string;
  sentiment: 'POSITIVE' | 'NEGATIVE' | 'NEUTRAL';
  reason: string;
  codeQuality?: string;
  changeType?: string;
}

export interface AnalysisResult {
  overallSentiment: 'POSITIVE' | 'NEGATIVE' | 'NEUTRAL';
  summary: string;
  commitAnalyses: CommitAnalysis[];
}

export class AIAnalyzer {
  private ai: GoogleGenAI | null = null;

  constructor() {
    // Don't initialize here - do it lazily when needed
    console.log('AIAnalyzer created');
  }

  private initialize() {
    const config = vscode.workspace.getConfiguration('gitmood');
    const apiKey = config.get<string>('geminiApiKey');

    if (!apiKey) {
      throw new Error(
        'Gemini API key not configured. Please set "gitmood.geminiApiKey" in VS Code settings.'
      );
    }

    this.ai = new GoogleGenAI({ apiKey });
  }

  async analyzeCommits(commitsData: string): Promise<AnalysisResult> {
    if (!this.ai) {
      this.initialize();
    }

    const responseSchema = {
      type: Type.OBJECT,
      properties: {
        overallSentiment: {
          type: Type.STRING,
          enum: ['POSITIVE', 'NEGATIVE', 'NEUTRAL'],
          description: 'The overall sentiment of all commits combined.',
        },
        summary: {
          type: Type.STRING,
          description: 'A brief, 2-3 sentence summary of the team\'s mood and key themes.',
        },
        commitAnalyses: {
          type: Type.ARRAY,
          description: 'An array containing the sentiment analysis for each commit.',
          items: {
            type: Type.OBJECT,
            properties: {
              message: {
                type: Type.STRING,
                description: 'The original commit message.',
              },
              sentiment: {
                type: Type.STRING,
                enum: ['POSITIVE', 'NEGATIVE', 'NEUTRAL'],
                description: 'The sentiment of this commit.',
              },
              reason: {
                type: Type.STRING,
                description: 'Brief explanation for the sentiment.',
              },
              codeQuality: {
                type: Type.STRING,
                description: 'Assessment of code quality.',
              },
              changeType: {
                type: Type.STRING,
                description: 'Type of change (Feature, Bug Fix, Refactoring, etc.).',
              },
            },
            required: ['message', 'sentiment', 'reason'],
          },
        },
      },
      required: ['overallSentiment', 'summary', 'commitAnalyses'],
    };

    const prompt = `
      You are an expert engineering manager with high emotional intelligence.
      Analyze the following Git commit data, including messages and code diffs.
      
      For each commit, determine if the sentiment is POSITIVE, NEGATIVE, or NEUTRAL based on:
      - The commit message tone
      - The actual code changes (if provided)
      - Code quality indicators
      - Change type (feature, bug fix, refactoring, etc.)
      
      Consider these factors:
      - Large diffs with minimal explanation may indicate rushed work (NEGATIVE)
      - Well-documented changes with tests are positive (POSITIVE)
      - Good refactoring that simplifies code is positive (POSITIVE)
      - Bug fixes are typically neutral unless they address critical issues
      - Added TODOs or console.logs may indicate incomplete work (NEGATIVE)
      - Code deletion and simplification are usually positive (POSITIVE)
      
      Provide an overall sentiment and brief summary of team mood and code quality.
      
      Respond ONLY with a JSON object matching the provided schema.

      Commit Data:
      ---
      ${commitsData}
      ---
    `;

    try {
      if (!this.ai) {
        throw new Error('AI not initialized');
      }
      
      const response = await this.ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: responseSchema as any,
          temperature: 0.2,
        },
      });

      const jsonText = response.text?.trim();
      
      if (!jsonText) {
        throw new Error('Empty response from API.');
      }
      
      const result = JSON.parse(jsonText);

      if (!result.commitAnalyses || !result.overallSentiment) {
        throw new Error('Invalid response format from API.');
      }

      return result as AnalysisResult;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`AI analysis failed: ${message}`);
    }
  }
}
