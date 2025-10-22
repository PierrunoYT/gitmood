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
    constructor();
    private initialize;
    analyzeCommits(commitsData: string): Promise<AnalysisResult>;
}
//# sourceMappingURL=aiAnalyzer.d.ts.map