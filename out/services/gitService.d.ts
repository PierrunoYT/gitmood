export interface CommitData {
    message: string;
    diff?: string;
    stats?: string;
    author?: string;
    date?: string;
}
export declare class GitService {
    getCommitsWithDiff(repoPath: string, limit?: number, fullDiff?: boolean): Promise<CommitData[]>;
    private parseCommitOutput;
}
//# sourceMappingURL=gitService.d.ts.map