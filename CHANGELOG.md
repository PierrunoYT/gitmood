# Changelog

All notable changes to the GitMood extension will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.0] - 2025-10-23

### 🔒 Security (BREAKING CHANGE)
- **Implemented encrypted API key storage using VS Code Secret Storage API**
  - API keys now stored encrypted using OS-level security (Keychain/Credential Manager/libsecret)
  - Removed plain text storage from settings.json
  - **Users must re-enter their API key after updating**

### 🐛 Bug Fixes

**Critical Issues:**
- Fixed API key security and redundancy issue
- Fixed git command injection vulnerability using array-based command execution
- Added input validation and sanitization

**Moderate Issues:**
- Made memory buffer size configurable (1-100 MB)
- Added graceful error handling for buffer overflow
- Improved error messages with actionable suggestions

**Minor Issues:**
- Added author and date context to AI commit analysis
- Removed unused `getRepositoryName` and `getRepositoryStats` methods
- Added input validation for commit limits (1-100 range)
- Standardized error messages across the extension
- Improved code clarity with comments

### ✨ Features
- Configurable `maxBufferSize` setting for large repositories
- Better AI sentiment analysis with author and date metadata

### 📚 Documentation
- Added MIT License
- Added SECURITY.md explaining encrypted storage implementation
- Added INSTALL.md with build and installation instructions for all platforms
- Added BUGS.md tracking all resolved issues

### 📦 Packaging
- Optimized extension package size from 3.35MB (465 files) to 21.3KB (21 files)
- Updated .vscodeignore to exclude unnecessary files
- Added proper repository URL

### 🔧 Technical Improvements
- Replaced `execSync` with `spawnSync` for safer command execution
- Implemented dependency injection for SecretStorage
- Made all async operations properly awaited
- Improved TypeScript strict mode compliance

## [0.0.1] - 2025-10-23

### 🎉 Initial Release
- Git commit sentiment analysis using Google Gemini AI
- Visual sentiment dashboard in VS Code sidebar
- Support for full-diff and stats-only analysis modes
- Configurable commit limit
- Real-time analysis progress indicators
- Beautiful, modern UI with sentiment color coding

---

[0.1.0]: https://github.com/PierrunoYT/gitmood/compare/v0.0.1...v0.1.0
[0.0.1]: https://github.com/PierrunoYT/gitmood/releases/tag/v0.0.1
