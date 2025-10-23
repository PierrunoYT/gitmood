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
exports.SidebarProvider = void 0;
const vscode = __importStar(require("vscode"));
class SidebarProvider {
    constructor(_extensionUri, gitService, aiAnalyzer) {
        this._extensionUri = _extensionUri;
        this.gitService = gitService;
        this.aiAnalyzer = aiAnalyzer;
    }
    resolveWebviewView(webviewView, context, _token) {
        this._view = webviewView;
        webviewView.webview.options = {
            enableScripts: true,
            localResourceRoots: [this._extensionUri]
        };
        webviewView.webview.html = this._getHtmlForWebview(webviewView.webview);
        // Handle messages from the webview
        webviewView.webview.onDidReceiveMessage(async (data) => {
            switch (data.type) {
                case 'saveApiKey': {
                    await this._saveApiKey(data.apiKey);
                    break;
                }
                case 'analyze': {
                    await this._runAnalysis(data.apiKey);
                    break;
                }
            }
        });
        // Load saved API key
        this._loadApiKey();
    }
    async _saveApiKey(apiKey) {
        const config = vscode.workspace.getConfiguration('gitmood');
        await config.update('geminiApiKey', apiKey, vscode.ConfigurationTarget.Global);
        this._view?.webview.postMessage({
            type: 'apiKeySaved',
            message: 'API key saved successfully!'
        });
    }
    async _loadApiKey() {
        if (!this._view)
            return;
        const config = vscode.workspace.getConfiguration('gitmood');
        const apiKey = config.get('geminiApiKey', '');
        this._view.webview.postMessage({
            type: 'loadApiKey',
            apiKey: apiKey
        });
    }
    async _runAnalysis(apiKey) {
        const workspaceFolders = vscode.workspace.workspaceFolders;
        if (!workspaceFolders) {
            this._view?.webview.postMessage({
                type: 'error',
                message: 'No workspace folder is open'
            });
            return;
        }
        if (!apiKey) {
            this._view?.webview.postMessage({
                type: 'error',
                message: 'Gemini API key not configured. Please enter your API key.'
            });
            return;
        }
        try {
            this._view?.webview.postMessage({
                type: 'analyzing',
                message: 'Fetching commits...'
            });
            const workspaceFolder = workspaceFolders[0];
            const config = vscode.workspace.getConfiguration('gitmood');
            // Validate commitLimit to be between 1 and 100
            const rawCommitLimit = config.get('commitLimit', 20);
            const commitLimit = Math.max(1, Math.min(rawCommitLimit, 100));
            const analyzeType = config.get('analyzeType', 'full-diff');
            const commits = await this.gitService.getCommitsWithDiff(workspaceFolder.uri.fsPath, commitLimit, analyzeType === 'full-diff');
            if (commits.length === 0) {
                this._view?.webview.postMessage({
                    type: 'error',
                    message: 'No commits found in repository'
                });
                return;
            }
            this._view?.webview.postMessage({
                type: 'analyzing',
                message: `Analyzing ${commits.length} commits with AI...`
            });
            // Convert commits to formatted string for AI analysis
            const commitsString = commits
                .map(commit => {
                let result = `COMMIT: ${commit.message}`;
                if (commit.author)
                    result += `\nAUTHOR: ${commit.author}`;
                if (commit.date)
                    result += `\nDATE: ${commit.date}`;
                result += `\n${commit.diff || commit.stats || ''}`;
                return result;
            })
                .join('\n\n');
            const analysis = await this.aiAnalyzer.analyzeCommits(commitsString);
            this._view?.webview.postMessage({
                type: 'analysisComplete',
                analysis: analysis
            });
        }
        catch (error) {
            const message = error instanceof Error ? error.message : 'Unknown error';
            this._view?.webview.postMessage({
                type: 'error',
                message: `Analysis failed: ${message}`
            });
        }
    }
    _getHtmlForWebview(webview) {
        return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>GitMood</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        body {
            padding: 20px;
            font-family: var(--vscode-font-family);
            color: var(--vscode-foreground);
            background: var(--vscode-sideBar-background);
        }
        h2 {
            font-size: 18px;
            margin-bottom: 15px;
            color: var(--vscode-foreground);
        }
        .section {
            margin-bottom: 25px;
        }
        label {
            display: block;
            margin-bottom: 8px;
            font-size: 13px;
            color: var(--vscode-foreground);
        }
        input {
            width: 100%;
            padding: 8px;
            background: var(--vscode-input-background);
            color: var(--vscode-input-foreground);
            border: 1px solid var(--vscode-input-border);
            border-radius: 3px;
            font-size: 13px;
            font-family: var(--vscode-font-family);
        }
        input:focus {
            outline: 1px solid var(--vscode-focusBorder);
        }
        button {
            width: 100%;
            padding: 10px;
            background: var(--vscode-button-background);
            color: var(--vscode-button-foreground);
            border: none;
            border-radius: 3px;
            font-size: 13px;
            font-weight: 500;
            cursor: pointer;
            transition: background 0.2s;
        }
        button:hover {
            background: var(--vscode-button-hoverBackground);
        }
        button:disabled {
            opacity: 0.5;
            cursor: not-allowed;
        }
        .status {
            margin-top: 15px;
            padding: 10px;
            border-radius: 3px;
            font-size: 12px;
            display: none;
        }
        .status.show {
            display: block;
        }
        .status.success {
            background: var(--vscode-statusBar-debuggingBackground);
            color: var(--vscode-statusBar-debuggingForeground);
        }
        .status.error {
            background: var(--vscode-inputValidation-errorBackground);
            color: var(--vscode-inputValidation-errorForeground);
            border: 1px solid var(--vscode-inputValidation-errorBorder);
        }
        .status.analyzing {
            background: var(--vscode-badge-background);
            color: var(--vscode-badge-foreground);
        }
        .result {
            margin-top: 20px;
            display: none;
        }
        .result.show {
            display: block;
        }
        .overall-sentiment {
            padding: 15px;
            border-radius: 5px;
            margin-bottom: 15px;
            border-left: 4px solid var(--vscode-textLink-foreground);
            background: var(--vscode-editor-background);
        }
        .overall-sentiment h3 {
            font-size: 14px;
            margin-bottom: 8px;
            color: var(--vscode-textLink-foreground);
        }
        .overall-sentiment p {
            font-size: 12px;
            line-height: 1.6;
            color: var(--vscode-foreground);
        }
        .stats {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 10px;
            margin-bottom: 15px;
        }
        .stat-card {
            padding: 10px;
            background: var(--vscode-editor-background);
            border-radius: 3px;
            text-align: center;
        }
        .stat-label {
            font-size: 11px;
            color: var(--vscode-descriptionForeground);
            text-transform: uppercase;
        }
        .stat-value {
            font-size: 20px;
            font-weight: 600;
            margin-top: 5px;
            color: var(--vscode-foreground);
        }
        .commits-section h3 {
            font-size: 14px;
            margin-bottom: 10px;
            color: var(--vscode-foreground);
        }
        .commit-card {
            background: var(--vscode-editor-background);
            border-left: 3px solid var(--vscode-textLink-foreground);
            border-radius: 3px;
            padding: 10px;
            margin-bottom: 10px;
        }
        .commit-card.positive {
            border-left-color: #22c55e;
        }
        .commit-card.negative {
            border-left-color: #ef4444;
        }
        .commit-card.neutral {
            border-left-color: #6b7280;
        }
        .commit-header {
            display: flex;
            gap: 8px;
            margin-bottom: 6px;
            flex-wrap: wrap;
        }
        .badge {
            padding: 2px 6px;
            border-radius: 3px;
            font-size: 10px;
            font-weight: 600;
            text-transform: uppercase;
        }
        .sentiment-badge.positive {
            background: rgba(34, 197, 94, 0.2);
            color: #86efac;
        }
        .sentiment-badge.negative {
            background: rgba(239, 68, 68, 0.2);
            color: #fca5a5;
        }
        .sentiment-badge.neutral {
            background: rgba(107, 114, 128, 0.2);
            color: #d1d5db;
        }
        .change-type {
            background: rgba(37, 99, 235, 0.2);
            color: #60a5fa;
        }
        .commit-message {
            font-size: 11px;
            margin-bottom: 5px;
            color: var(--vscode-foreground);
            word-break: break-word;
        }
        .commit-reason {
            font-size: 11px;
            color: var(--vscode-descriptionForeground);
            font-style: italic;
        }
        .help-text {
            font-size: 11px;
            color: var(--vscode-descriptionForeground);
            margin-top: 5px;
        }
        .help-link {
            color: var(--vscode-textLink-foreground);
            text-decoration: none;
        }
        .help-link:hover {
            text-decoration: underline;
        }
    </style>
</head>
<body>
    <div class="section">
        <h2>🎭 GitMood</h2>
        
        <div style="margin-bottom: 20px;">
            <label for="apiKey">
                Gemini API Key
                <span class="help-text">Get your key from <a href="https://aistudio.google.com/app/apikey" class="help-link">Google AI Studio</a></span>
            </label>
            <input 
                type="password" 
                id="apiKey" 
                placeholder="Enter your Gemini API key..."
            />
        </div>

        <button id="analyzeBtn">Analyze Repository</button>
        
        <div id="status" class="status"></div>
    </div>

    <div id="result" class="result">
        <div id="resultContent"></div>
    </div>

    <script>
        const vscode = acquireVsCodeApi();
        const apiKeyInput = document.getElementById('apiKey');
        const analyzeBtn = document.getElementById('analyzeBtn');
        const status = document.getElementById('status');
        const result = document.getElementById('result');
        const resultContent = document.getElementById('resultContent');

        analyzeBtn.addEventListener('click', () => {
            const apiKey = apiKeyInput.value.trim();
            
            if (!apiKey) {
                showStatus('Please enter your Gemini API key', 'error');
                return;
            }

            vscode.postMessage({
                type: 'analyze',
                apiKey: apiKey
            });
        });

        window.addEventListener('message', event => {
            const message = event.data;

            switch (message.type) {
                case 'loadApiKey':
                    if (message.apiKey) {
                        apiKeyInput.value = message.apiKey;
                    }
                    break;
                    
                case 'apiKeySaved':
                    showStatus(message.message, 'success');
                    break;

                case 'analyzing':
                    analyzeBtn.disabled = true;
                    showStatus(message.message, 'analyzing');
                    result.classList.remove('show');
                    break;

                case 'analysisComplete':
                    analyzeBtn.disabled = false;
                    hideStatus();
                    showResults(message.analysis);
                    break;

                case 'error':
                    analyzeBtn.disabled = false;
                    showStatus(message.message, 'error');
                    result.classList.remove('show');
                    break;
            }
        });

        function showStatus(message, type) {
            status.textContent = message;
            status.className = 'status show ' + type;
        }

        function hideStatus() {
            status.classList.remove('show');
        }

        function showResults(analysis) {
            const sentimentColor = getSentimentColor(analysis.overallSentiment);
            const positive = analysis.commitAnalyses.filter(c => c.sentiment === 'POSITIVE').length;
            const neutral = analysis.commitAnalyses.filter(c => c.sentiment === 'NEUTRAL').length;
            const negative = analysis.commitAnalyses.filter(c => c.sentiment === 'NEGATIVE').length;

            const commitsHtml = analysis.commitAnalyses.map(commit => \`
                <div class="commit-card \${commit.sentiment.toLowerCase()}">
                    <div class="commit-header">
                        <span class="badge sentiment-badge \${commit.sentiment.toLowerCase()}">\${commit.sentiment}</span>
                        \${commit.changeType ? \`<span class="badge change-type">\${commit.changeType}</span>\` : ''}
                    </div>
                    <div class="commit-message">\${escapeHtml(commit.message)}</div>
                    <div class="commit-reason">\${escapeHtml(commit.reason)}</div>
                </div>
            \`).join('');

            resultContent.innerHTML = \`
                <div class="overall-sentiment" style="border-left-color: \${sentimentColor};">
                    <h3 style="color: \${sentimentColor};">Overall: \${analysis.overallSentiment}</h3>
                    <p>\${escapeHtml(analysis.summary)}</p>
                </div>

                <div class="stats">
                    <div class="stat-card">
                        <div class="stat-label">Total</div>
                        <div class="stat-value">\${analysis.commitAnalyses.length}</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-label">Positive</div>
                        <div class="stat-value" style="color: #22c55e;">\${positive}</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-label">Neutral</div>
                        <div class="stat-value" style="color: #6b7280;">\${neutral}</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-label">Negative</div>
                        <div class="stat-value" style="color: #ef4444;">\${negative}</div>
                    </div>
                </div>

                <div class="commits-section">
                    <h3>Commits</h3>
                    \${commitsHtml}
                </div>
            \`;

            result.classList.add('show');
        }

        function getSentimentColor(sentiment) {
            switch (sentiment) {
                case 'POSITIVE': return '#22c55e';
                case 'NEGATIVE': return '#ef4444';
                default: return '#6b7280';
            }
        }

        function escapeHtml(text) {
            const div = document.createElement('div');
            div.textContent = text;
            return div.innerHTML;
        }
    </script>
</body>
</html>`;
    }
}
exports.SidebarProvider = SidebarProvider;
//# sourceMappingURL=sidebarProvider.js.map