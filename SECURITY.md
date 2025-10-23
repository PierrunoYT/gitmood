# Security Implementation

## API Key Storage

### Encrypted Secret Storage

GitMood now uses **VS Code's Secret Storage API** for secure API key management.

### How It Works

1. **Encryption**: API keys are stored using VS Code's built-in encrypted secret storage
2. **Platform-Specific**: Uses the operating system's secure credential storage:
   - **Windows**: Windows Credential Manager
   - **macOS**: Keychain
   - **Linux**: Secret Service API (libsecret)

3. **No Plain Text**: API keys are never stored in plain text configuration files

### Storage Location

The API key is stored securely using:
```typescript
context.secrets.store('gitmood.geminiApiKey', apiKey)
```

### Benefits

✅ **Encrypted at rest** - API keys are encrypted using OS-level security  
✅ **Secure access** - Only accessible by VS Code and your extension  
✅ **Cross-platform** - Works consistently across Windows, macOS, and Linux  
✅ **No accidental commits** - Not stored in settings.json or workspace files  
✅ **User-scoped** - Isolated per user account  

### Migration from Old Version

If you previously used this extension, your API key was stored in `settings.json`. 

**Action Required:**
1. Re-enter your API key in the GitMood sidebar
2. The new key will be stored securely using encrypted storage
3. You can safely remove the old `gitmood.geminiApiKey` entry from your settings.json

### For Developers

The implementation uses:
- `vscode.SecretStorage` API
- Secret key: `gitmood.geminiApiKey`
- Accessed via `context.secrets` in extension activation

**Code Example:**
```typescript
// Store
await secrets.store('gitmood.geminiApiKey', apiKey);

// Retrieve
const apiKey = await secrets.get('gitmood.geminiApiKey');

// Delete
await secrets.delete('gitmood.geminiApiKey');
```

### Security Best Practices

✅ API keys are encrypted  
✅ No logging of sensitive data  
✅ Secure transmission to AI service (HTTPS)  
✅ No third-party storage  
✅ User controls their own keys  

---

**Last Updated:** 2025-10-23  
**Version:** 0.0.2
