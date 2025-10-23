import { spawnSync } from 'child_process';
import * as path from 'path';
import * as vscode from 'vscode';

export interface CommitData {
  message: string;
  diff?: string;
  stats?: string;
  author?: string;
  date?: string;
}

export class GitService {
  async getCommitsWithDiff(repoPath: string, limit: number = 20, fullDiff: boolean = true): Promise<CommitData[]> {
    try {
      // Validate and sanitize limit to prevent injection
      const sanitizedLimit = Math.max(1, Math.min(Math.floor(limit), 1000));
      
      // Get configurable buffer size
      const config = vscode.workspace.getConfiguration('gitmood');
      const maxBufferMB = config.get<number>('maxBufferSize', 10);
      const maxBuffer = Math.max(1, Math.min(maxBufferMB, 100)) * 1024 * 1024; // Convert MB to bytes
      
      // Use array-based command execution to prevent injection
      const format = fullDiff 
        ? 'COMMIT: %s%nAUTHOR: %an%nDATE: %ad%n'
        : 'COMMIT: %s%nAUTHOR: %an%nDATE: %ad%n--STATS--%n';

      const args = fullDiff
        ? ['--no-pager', 'log', '-p', `--pretty=format:${format}`, '--date=short', '-n', sanitizedLimit.toString()]
        : ['--no-pager', 'log', '--stat', `--pretty=format:${format}`, '-n', sanitizedLimit.toString()];

      const result = spawnSync('git', args, {
        cwd: repoPath,
        encoding: 'utf-8',
        maxBuffer: maxBuffer,
      });

      if (result.error) {
        // Check if it's a buffer overflow error
        if (result.error.message.includes('maxBuffer')) {
          throw new Error(
            `Git output exceeded buffer size (${maxBufferMB}MB). Try reducing commit limit or increasing maxBufferSize in settings.`
          );
        }
        throw result.error;
      }

      if (result.status !== 0) {
        throw new Error(result.stderr || 'Git command failed');
      }

      return this.parseCommitOutput(result.stdout);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Failed to fetch commits: ${message}`);
    }
  }

  private parseCommitOutput(output: string): CommitData[] {
    const commits: CommitData[] = [];
    const commitBlocks = output.split(/^COMMIT: /m).filter(block => block.trim());

    for (const block of commitBlocks) {
      const lines = block.split('\n');
      if (lines.length === 0) continue;

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
        } else if (line.startsWith('DATE: ')) {
          date = line.replace('DATE: ', '').trim();
        } else if (line.startsWith('--STATS--')) {
          // Switch to stats mode
          stats = lines.slice(i + 1).join('\n');
          break;
        } else if (line.startsWith('diff --git')) {
          inDiff = true;
          diff += line + '\n';
        } else if (inDiff) {
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
