import * as vscode from 'vscode';
import { GitService } from '../services/gitService';
import { AIAnalyzer } from '../services/aiAnalyzer';
export declare class SidebarProvider implements vscode.WebviewViewProvider {
    private readonly _extensionUri;
    private _view?;
    private gitService;
    private aiAnalyzer;
    constructor(_extensionUri: vscode.Uri, gitService: GitService, aiAnalyzer: AIAnalyzer);
    resolveWebviewView(webviewView: vscode.WebviewView, context: vscode.WebviewViewResolveContext, _token: vscode.CancellationToken): void;
    private _saveApiKey;
    private _loadApiKey;
    private _runAnalysis;
    private _getHtmlForWebview;
}
//# sourceMappingURL=sidebarProvider.d.ts.map