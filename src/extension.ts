import * as vscode from 'vscode';
import { GitService } from './services/gitService';
import { AIAnalyzer } from './services/aiAnalyzer';
import { SidebarProvider } from './webview/sidebarProvider';

export async function activate(context: vscode.ExtensionContext) {
  console.log('GitMood extension is now active');

  const gitService = new GitService();
  const aiAnalyzer = new AIAnalyzer(context.secrets);

  // Register sidebar provider
  const sidebarProvider = new SidebarProvider(
    context.extensionUri, 
    gitService, 
    aiAnalyzer,
    context.secrets
  );
  
  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider('gitmood-sidebar', sidebarProvider)
  );
}

export function deactivate() {
  console.log('GitMood extension is now deactivated');
}
