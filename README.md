# GitMood - VS Code Extension

Analyze your Git commit history with AI to understand team sentiment and code quality directly in VS Code!

## Features

- 🎭 **Sentiment Analysis** - Understand the emotional tone of your commits
- 🔍 **Code Diff Analysis** - Analyze actual code changes, not just messages
- 📊 **Quality Assessment** - Get insights on code quality and change types
- ⚡ **Sidebar UI** - Convenient sidebar panel with API key input and inline results
- 🤖 **AI-Powered** - Uses Google's Gemini AI for deep insights

## Installation

1. Install the extension from the VS Code Marketplace (or from VSIX file)
2. Look for the **pulse icon** in the Activity Bar (left side)
3. Click it to open the GitMood sidebar
4. Enter your Gemini API key in the input field

## Quick Start

### Get Your API Key

1. Visit https://aistudio.google.com/app/apikey
2. Click "Create API Key"
3. Copy the generated key

### Analyze Your Repository

1. Open a Git repository in VS Code
2. Click the GitMood icon in the Activity Bar
3. Paste your API key in the sidebar
4. Click **"Analyze Repository"**
5. View results directly in the sidebar!

## Usage

### Sidebar Interface

The GitMood sidebar provides:

1. **API Key Input**
   - Enter your Gemini API key
   - Key is saved automatically when you analyze
   - Link to get your API key

2. **Analyze Button**
   - Fetches commits from your current repository
   - Analyzes them with AI
   - Shows progress status

3. **Results Display**
   - Overall sentiment summary
   - Statistics grid (total, positive, neutral, negative)
   - Individual commit cards with:
     - Sentiment badge
     - Change type badge
     - Commit message
     - AI reasoning

## What GitMood Analyzes

For each commit, GitMood determines:

- **Sentiment** - Positive, Negative, or Neutral
- **Change Type** - Feature, Bug Fix, Refactoring, Documentation, Test, etc.
- **Code Quality** - Well-structured, rushed, complex, clean refactoring, etc.
- **Reasoning** - Why the sentiment was assigned

### Sentiment Indicators

- ✅ **POSITIVE**
  - Well-documented changes
  - Tests included
  - Code simplification/refactoring
  - Clear commit messages

- ⚠️ **NEUTRAL**
  - Standard bug fixes
  - Routine updates
  - Documentation changes

- ❌ **NEGATIVE**
  - Large diffs with minimal explanation
  - TODOs or console.logs in code
  - Incomplete changes
  - Rushed commits

## Configuration

### Required Settings

- **API Key**
  - Enter in the sidebar OR
  - Set in VS Code Settings: `gitmood.geminiApiKey`

### Optional Settings

Open VS Code Settings (`Ctrl+,` / `Cmd+,`) and search for "GitMood":

- **`gitmood.commitLimit`** (Default: 20)
  - Maximum number of commits to analyze
  - Recommended: 10-30 for best results

- **`gitmood.analyzeType`** (Default: "full-diff")
  - `full-diff`: Analyze with complete code diffs (detailed but slower)
  - `stats-only`: Analyze with file statistics only (faster)

## Tips for Best Results

1. **Use Full Diffs** - Set `analyzeType` to "full-diff" for more detailed analysis
2. **Good Commit Messages** - Clear, descriptive messages help AI understand intent
3. **Reasonable Limit** - 15-30 commits usually provides good insights without too much data
4. **Include Code Context** - Diffs with code changes provide richer analysis than messages alone

## Troubleshooting

### "Please enter your Gemini API key" Error

Make sure you've entered your API key in the sidebar input field.

### "No workspace folder is open" Error

- Open a folder/workspace in VS Code (File → Open Folder)
- Make sure it's a Git repository

### "No commits found" Error

- Ensure you're in a Git repository
- Verify Git is installed: `git --version`
- Check repository has commits: `git log`

### Sidebar Not Showing

- Look for the pulse icon in the Activity Bar (left side)
- If hidden, right-click Activity Bar and enable GitMood
- Reload VS Code if needed

### Slow Analysis

- Reduce `commitLimit` setting to analyze fewer commits
- Use `analyzeType: "stats-only"` for faster analysis
- Check your internet connection

## Building from Source

To build the extension:

```bash
cd extension
npm install
npm run compile
```

To package for distribution:

```bash
npm install -g @vscode/vsce
vsce package
```

Install the built extension:

```bash
code --install-extension gitmood-0.0.1.vsix
```

## Requirements

- VS Code 1.60.0 or later
- Git installed and available in PATH
- Google Gemini API key
- Node.js and npm (for building from source)

## License

MIT

## Contributing

Contributions welcome! Feel free to submit issues and pull requests on GitHub.

## Support

For issues, feature requests, or questions:
- Open an issue on GitHub
- Check the troubleshooting section above

---

**Enjoy analyzing your repository's emotional pulse! 🎭**
