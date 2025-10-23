"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.AIAnalyzer = void 0;
const vscode = __importStar(require("vscode"));
const genai_1 = require("@google/genai");
class AIAnalyzer {
    constructor() {
        this.ai = null;
        // Don't initialize here - do it lazily when needed
        console.log('AIAnalyzer created');
    }
    initialize() {
        const config = vscode.workspace.getConfiguration('gitmood');
        const apiKey = config.get('geminiApiKey');
        if (!apiKey) {
            throw new Error('Gemini API key not configured. Please enter your API key in the GitMood sidebar.');
        }
        this.ai = new genai_1.GoogleGenAI({ apiKey });
    }
    async analyzeCommits(commitsData) {
        if (!this.ai) {
            this.initialize();
        }
        const responseSchema = {
            type: genai_1.Type.OBJECT,
            properties: {
                overallSentiment: {
                    type: genai_1.Type.STRING,
                    enum: ['POSITIVE', 'NEGATIVE', 'NEUTRAL'],
                    description: 'The overall sentiment of all commits combined.',
                },
                summary: {
                    type: genai_1.Type.STRING,
                    description: 'A brief, 2-3 sentence summary of the team\'s mood and key themes.',
                },
                commitAnalyses: {
                    type: genai_1.Type.ARRAY,
                    description: 'An array containing the sentiment analysis for each commit.',
                    items: {
                        type: genai_1.Type.OBJECT,
                        properties: {
                            message: {
                                type: genai_1.Type.STRING,
                                description: 'The original commit message.',
                            },
                            sentiment: {
                                type: genai_1.Type.STRING,
                                enum: ['POSITIVE', 'NEGATIVE', 'NEUTRAL'],
                                description: 'The sentiment of this commit.',
                            },
                            reason: {
                                type: genai_1.Type.STRING,
                                description: 'Brief explanation for the sentiment.',
                            },
                            codeQuality: {
                                type: genai_1.Type.STRING,
                                description: 'Assessment of code quality.',
                            },
                            changeType: {
                                type: genai_1.Type.STRING,
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
                    responseSchema: responseSchema,
                    temperature: 0.2,
                },
            });
            // Extract and validate response text
            const jsonText = response.text?.trim();
            if (!jsonText) {
                throw new Error('Empty response from API.');
            }
            const result = JSON.parse(jsonText);
            if (!result.commitAnalyses || !result.overallSentiment) {
                throw new Error('Invalid response format from API.');
            }
            return result;
        }
        catch (error) {
            const message = error instanceof Error ? error.message : 'Unknown error';
            throw new Error(`AI analysis failed: ${message}`);
        }
    }
}
exports.AIAnalyzer = AIAnalyzer;
//# sourceMappingURL=aiAnalyzer.js.map