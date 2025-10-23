import * as vscode from 'vscode';
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
export declare class AIAnalyzer {
    private ai;
    private secrets;
    private static readonly API_KEY_SECRET;
    constructor(secrets: vscode.SecretStorage);
    private initialize;
    analyzeCommits(commitsData: string): Promise<AnalysisResult>;
}
//# sourceMappingURL=aiAnalyzer.d.ts.map