"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GitService = void 0;
const child_process_1 = require("child_process");
class GitService {
    async getCommitsWithDiff(repoPath, limit = 20, fullDiff = true) {
        try {
            // Change to repo directory for git commands
            const format = fullDiff
                ? 'COMMIT: %s%nAUTHOR: %an%nDATE: %ad%n'
                : 'COMMIT: %s%nAUTHOR: %an%nDATE: %ad%n--STATS--%n';
            const cmd = fullDiff
                ? `git --no-pager log -p --pretty=format:"${format}" --date=short -n ${limit}`
                : `git --no-pager log --stat --pretty=format:"${format}" -n ${limit}`;
            const output = (0, child_process_1.execSync)(cmd, {
                cwd: repoPath,
                encoding: 'utf-8',
                maxBuffer: 10 * 1024 * 1024, // 10MB buffer for large repos
            });
            return this.parseCommitOutput(output);
        }
        catch (error) {
            const message = error instanceof Error ? error.message : 'Unknown error';
            throw new Error(`Failed to fetch commits: ${message}`);
        }
    }
    parseCommitOutput(output) {
        const commits = [];
        const commitBlocks = output.split(/^COMMIT: /m).filter(block => block.trim());
        for (const block of commitBlocks) {
            const lines = block.split('\n');
            if (lines.length === 0)
                continue;
            const message = lines[0].trim();
            let author = '';
            let date = '';
            let diff = '';
            let stats = '';
            let inDiff = false;
            for (let i = 1; i < lines.length; i++) {
                const line = lines[i];
                if (line.startsWith('AUTHOR: ')) {
                    author = line.replace('AUTHOR: ', '').trim();
                }
                else if (line.startsWith('DATE: ')) {
                    date = line.replace('DATE: ', '').trim();
                }
                else if (line.startsWith('--STATS--')) {
                    // Switch to stats mode
                    stats = lines.slice(i + 1).join('\n');
                    break;
                }
                else if (line.startsWith('diff --git')) {
                    inDiff = true;
                    diff += line + '\n';
                }
                else if (inDiff) {
                    diff += line + '\n';
                }
            }
            commits.push({
                message,
                author,
                date,
                diff: diff.trim() || undefined,
                stats: stats.trim() || undefined,
            });
        }
        return commits;
    }
}
exports.GitService = GitService;
//# sourceMappingURL=gitService.js.map