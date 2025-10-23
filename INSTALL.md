# Installation & Usage Guide

## Build from Source

### Prerequisites
- Node.js (v16 or higher)
- npm
- VS Code

### Build Steps

```bash
# Clone the repository
git clone https://github.com/PierrunoYT/gitmood.git
cd gitmood

# Install dependencies
npm install

# Compile TypeScript
npm run compile

# Package the extension
npx vsce package
```

This creates `gitmood-0.0.1.vsix`

## Install on Windows

```bash
# Using VS Code CLI
code --install-extension gitmood-0.0.1.vsix
```

Or manually:
1. Open VS Code
2. Press `Ctrl+Shift+P`
3. Type "Extensions: Install from VSIX"
4. Select `gitmood-0.0.1.vsix`

## Install on macOS

```bash
# Using VS Code CLI
code --install-extension gitmood-0.0.1.vsix
```

Or manually:
1. Open VS Code
2. Press `Cmd+Shift+P`
3. Type "Extensions: Install from VSIX"
4. Select `gitmood-0.0.1.vsix`

## Install on Linux

```bash
# Using VS Code CLI
code --install-extension gitmood-0.0.1.vsix
```

Or manually:
1. Open VS Code
2. Press `Ctrl+Shift+P`
3. Type "Extensions: Install from VSIX"
4. Select `gitmood-0.0.1.vsix`

## Usage

1. Open a Git repository in VS Code
2. Click the GitMood icon in the Activity Bar (left sidebar)
3. Enter your Google Gemini API key
4. Click "Analyze Repository"
5. View sentiment analysis results

## Get API Key

Get your free Gemini API key: https://aistudio.google.com/app/apikey
