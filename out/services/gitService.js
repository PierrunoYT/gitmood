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
exports.GitService = void 0;
const child_process_1 = require("child_process");
const path = __importStar(require("path"));
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
    async getRepositoryName(repoPath) {
        try {
            const name = path.basename(repoPath);
            return name || 'Repository';
        }
        catch {
            return 'Repository';
        }
    }
    async getRepositoryStats(repoPath) {
        try {
            const totalCommits = parseInt((0, child_process_1.execSync)('git rev-list --count HEAD', { cwd: repoPath, encoding: 'utf-8' }), 10);
            const branches = ((0, child_process_1.execSync)('git branch -r', { cwd: repoPath, encoding: 'utf-8' }).split('\n').length - 1);
            return { totalCommits, branches };
        }
        catch {
            return { totalCommits: 0, branches: 0 };
        }
    }
}
exports.GitService = GitService;
//# sourceMappingURL=gitService.js.map