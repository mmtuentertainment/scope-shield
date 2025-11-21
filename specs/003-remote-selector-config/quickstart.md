# Quickstart Guide: Remote Selector Configuration

**Feature**: 003-remote-selector-config
**Audience**: Developers implementing this feature
**Last Updated**: 2025-11-20

---

## Overview

This guide demonstrates how to integrate remote selector configuration into ScopeShield. Four integration scenarios cover the complete lifecycle from fresh install to config rollback.

---

## Prerequisites

Before starting, ensure:

- ✅ Feature 001 (Detection Engine) is complete and using selectors
- ✅ Constitutional amendment activated (Privacy-First exception approved)
- ✅ GitHub Gist created with initial config (copy from bundled fallback)
- ✅ Development environment set up (`npm install`, `npm run dev`)

---

## Scenario 1: First-Time Extension Install (Fresh User)

**Goal**: Verify extension works with bundled config before fetching remote config

### Step 1: Extension Installation

```bash
# Build extension
npm run build

# Load unpacked extension in Chrome
# 1. Navigate to chrome://extensions/
# 2. Enable "Developer mode"
# 3. Click "Load unpacked" → select dist/ directory
```

### Step 2: Verify Bundled Config Loads

**Expected Behavior**:
1. Extension loads `src/utils/config-fallback.json` (bundled config)
2. ConfigCache created in chrome.storage.local with `source: "bundled"`
3. Detection works using bundled selectors
4. Console logs:
   ```
   [ScopeShield] No cached config found, using bundled fallback (v1.0.0)
   [ScopeShield] Bundled config loaded: 5 selectors available
   ```

**Verification**:
```javascript
// Open DevTools Console in Chrome extension background page
// (chrome://extensions/ → ScopeShield → "Inspect views: background page")

chrome.storage.local.get('selectorConfig', (result) => {
  console.log('Config source:', result.selectorConfig?.source); // Expected: "bundled"
  console.log('Config version:', result.selectorConfig?.config.version); // Expected: "1.0.0"
});
```

### Step 3: Trigger First Remote Fetch

**Action**: Open Gmail (`mail.google.com`)

**Expected Behavior**:
1. Content script loads, checks `lastCheckTimestamp` (never checked before)
2. Background fetch triggered to GitHub Gist (500ms timeout)
3. Config v1.1.0 fetched successfully (assuming Gist has v1.1.0)
4. Validation passes (all fallback chains have ≥1 working selector)
5. ConfigCache updated with `source: "remote"`, `previousVersion: "1.0.0"`
6. Detection resumes with new selectors
7. Console logs:
   ```
   [ScopeShield] Checking for config update (last check: never)
   [ScopeShield] Fetching config from https://gist.githubusercontent.com/.../raw/selectors.json
   [ScopeShield] Config v1.1.0 fetched in 287ms
   [ScopeShield] Validation passed: 5/5 selectors have working fallbacks
   [ScopeShield] Config v1.1.0 cached successfully (previous: v1.0.0)
   [ScopeShield] Detection engine reloaded with v1.1.0 selectors
   ```

**Verification**:
```javascript
chrome.storage.local.get('selectorConfig', (result) => {
  console.log('Config source:', result.selectorConfig?.source); // Expected: "remote"
  console.log('Config version:', result.selectorConfig?.config.version); // Expected: "1.1.0"
  console.log('Previous version:', result.selectorConfig?.previousVersion); // Expected: "1.0.0"
});
```

---

## Scenario 2: Gmail Selector Breaks (Developer Pushes Update)

**Goal**: Simulate Gmail UI change breaking selectors, push fixed config, verify auto-recovery

### Step 1: Simulate Gmail DOM Change

**Manual DOM Modification** (for testing):
```javascript
// In Gmail tab DevTools Console, rename messageBody selector
document.querySelectorAll('.a3s.aiL').forEach(el => {
  el.classList.remove('a3s', 'aiL');
  el.classList.add('new-message-body');
});

// Result: Detection stops working (selector .a3s.aiL no longer exists)
```

**Expected Behavior**:
- ScopeShield detection fails (no messages highlighted)
- User reports: "Detection stopped working after Gmail updated"

### Step 2: Developer Creates Fixed Config

**Update GitHub Gist** (selectors.json):
```json
{
  "version": "1.2.0",
  "lastUpdated": "2025-11-21T08:00:00Z",
  "selectors": {
    "messageBody": ".new-message-body",
    "composeButton": ".T-I.T-I-KE",
    "senderName": ".gD",
    "subjectLine": ".hP",
    "timestamp": ".g3"
  },
  "fallbacks": {
    "messageBody": [".new-message-body", ".a3s.aiL", "[data-message-body]"],
    "composeButton": [".T-I-KE", "[role='button'][aria-label*='Compose']"],
    "senderName": [".gD", "[data-sender]"],
    "subjectLine": [".hP", "[data-subject]"],
    "timestamp": [".g3", "[data-time]"]
  },
  "metadata": {
    "description": "Fix for Gmail UI change (Nov 2025)",
    "gmailVersion": "2025.11.20"
  }
}
```

**Commit & Push**:
```bash
git add selectors.json
git commit -m "v1.2.0: Fix Gmail selector change (.a3s.aiL → .new-message-body)"
git push
```

### Step 3: Wait for Auto-Update (or Manual Trigger)

**Option A: Automatic Update (24 hour cycle)**

**User opens Gmail next day**:
1. Extension checks `lastCheckTimestamp` (24+ hours since last check)
2. Fetches config v1.2.0 from GitHub Gist
3. Validation passes (`.new-message-body` exists)
4. ConfigCache updated: `version: "1.2.0"`, `previousVersion: "1.1.0"`
5. Detection resumes working
6. Console logs:
   ```
   [ScopeShield] Checking for config update (last check: 25 hours ago)
   [ScopeShield] Fetching config from GitHub Gist...
   [ScopeShield] Config v1.2.0 fetched in 312ms
   [ScopeShield] Validation passed: 5/5 selectors have working fallbacks
   [ScopeShield] Config v1.2.0 applied, detection resumed
   ```

**Option B: Manual Update (instant)**

**User clicks "Check for Updates" in settings**:
1. Immediate fetch triggered (bypasses 24hr check)
2. Config v1.2.0 fetched
3. Detection resumes instantly
4. Success toast: "✓ Selectors updated to v1.2.0"
5. Console logs same as Option A

**Recovery Time**:
- **Automatic**: 1-24 hours (next Gmail load after 24hr cycle)
- **Manual**: Instant (user-initiated)
- **Average**: 12 hours (assuming random distribution of user logins)

---

## Scenario 3: User Offline During Update (Alarm Retry)

**Goal**: Verify extension handles offline gracefully and retries via chrome.alarms

### Step 1: User Opens Gmail While Offline

**Simulate Offline**:
```javascript
// In background page DevTools Console
chrome.storage.local.set({
  selectorConfig: {
    ...existingConfig,
    lastCheckTimestamp: Date.now() - (25 * 60 * 60 * 1000) // 25 hours ago
  }
});

// Disconnect network (Chrome DevTools → Network → Offline)
```

**Expected Behavior**:
1. Extension checks `lastCheckTimestamp` (>24hr)
2. Attempts fetch to GitHub Gist
3. Fetch fails immediately (network error)
4. Falls back to cached config (v1.1.0)
5. Schedules alarm retry in 1 hour
6. Detection continues working with cached config
7. Console logs:
   ```
   [ScopeShield] Checking for config update (last check: 25 hours ago)
   [ScopeShield] Fetching config from GitHub Gist...
   [ScopeShield] Fetch failed: Network error (ERR_INTERNET_DISCONNECTED)
   [ScopeShield] Using cached config (v1.1.0, age: 3 days)
   [ScopeShield] Alarm retry scheduled in 60 minutes
   ```

### Step 2: Network Comes Back Online

**Restore Network** (Chrome DevTools → Network → No throttling)

**Expected Behavior**:
1. After 1 hour, chrome.alarms fires `configRetry` alarm
2. Background fetch triggered again (10s timeout this time)
3. Config v1.2.0 fetched successfully
4. ConfigCache updated
5. All open Gmail tabs receive chrome.storage.onChanged event
6. Detection reloads with v1.2.0 selectors (no page refresh needed)
7. Console logs:
   ```
   [ScopeShield] Alarm 'configRetry' fired
   [ScopeShield] Fetching config from GitHub Gist (retry #1)...
   [ScopeShield] Config v1.2.0 fetched in 345ms
   [ScopeShield] Config v1.2.0 applied across 3 open Gmail tabs
   ```

**Verification**:
```javascript
// Check chrome.alarms
chrome.alarms.getAll((alarms) => {
  console.log('Active alarms:', alarms); // Should include 'configRetry' before firing
});

// After alarm fires
chrome.storage.local.get('selectorConfig', (result) => {
  console.log('Config version after retry:', result.selectorConfig?.config.version); // Expected: "1.2.0"
});
```

---

## Scenario 4: Bad Config Rollback (Developer Reverts Gist)

**Goal**: Demonstrate developer-initiated rollback via GitHub gist revert

### Step 1: Developer Pushes Bad Config (Accidentally)

**GitHub Gist Update** (selectors.json with invalid selector):
```json
{
  "version": "1.3.0",
  "lastUpdated": "2025-11-22T10:00:00Z",
  "selectors": {
    "messageBody": ".nonexistent-class",  // ❌ Invalid selector
    "composeButton": ".T-I.T-I-KE",
    "senderName": ".gD",
    "subjectLine": ".hP",
    "timestamp": ".g3"
  },
  "fallbacks": {
    "messageBody": [".nonexistent-class"],  // ❌ No working fallback
    "composeButton": [".T-I-KE"],
    "senderName": [".gD"],
    "subjectLine": [".hP"],
    "timestamp": [".g3"]
  }
}
```

**User Fetches Bad Config**:
1. User opens Gmail (triggers fetch)
2. Config v1.3.0 fetched from GitHub
3. **Validation FAILS**: No selector from `messageBody` fallback chain exists
4. Config v1.3.0 rejected
5. Extension keeps using cached v1.2.0
6. Console logs:
   ```
   [ScopeShield] Config v1.3.0 fetched in 289ms
   [ScopeShield] Validation failed: selector '.nonexistent-class' not found in DOM
   [ScopeShield] Config v1.3.0 rejected, keeping cached v1.2.0
   ```

**Result**: ✅ Users protected by validation (never apply bad config)

### Step 2: Developer Realizes Mistake & Reverts

**GitHub Gist Rollback**:
```bash
# View gist commit history
git log --oneline
# Output:
# abc1234 v1.3.0: Update selectors (BAD - invalid)
# def5678 v1.2.0: Fix Gmail selector change
# ghi9012 v1.1.0: Add fallback chains

# Revert to v1.2.0
git revert abc1234  # Creates new commit reverting bad changes
# OR
git reset --hard def5678  # Hard reset to v1.2.0 (force push needed)

# Push rollback
git push origin main  # or `git push --force` if reset used
```

**Update Version in Rolled-Back Config**:
```json
{
  "version": "1.3.1",  // Bumped to indicate rollback
  "lastUpdated": "2025-11-22T11:00:00Z",
  "selectors": {
    "messageBody": ".new-message-body",  // ✅ Restored working selector
    // ... same as v1.2.0 ...
  },
  "fallbacks": {
    "messageBody": [".new-message-body", ".a3s.aiL"],  // ✅ Working fallbacks
    // ... same as v1.2.0 ...
  },
  "metadata": {
    "description": "Rollback to v1.2.0 selectors (v1.3.0 had invalid .nonexistent-class)",
    "gmailVersion": "2025.11.20"
  }
}
```

### Step 3: Users Auto-Update to Rolled-Back Config

**Next User Gmail Load**:
1. Fetch config v1.3.1 from GitHub (rolled-back version)
2. Validation passes (selectors restored to v1.2.0 state)
3. ConfigCache updated: `version: "1.3.1"`, `previousVersion: "1.2.0"`
4. Detection continues working
5. Console logs:
   ```
   [ScopeShield] Config v1.3.1 fetched in 298ms
   [ScopeShield] Validation passed: 5/5 selectors have working fallbacks
   [ScopeShield] Config v1.3.1 applied (rollback from failed v1.3.0)
   ```

**Recovery Time**: 1-24 hours (normal update cycle)

**Emergency Recovery**: Users can click "Check for Updates" for instant rollback

---

## Integration Checklist

Before marking feature complete, verify all scenarios pass:

- [ ] **Scenario 1**: Fresh install loads bundled config, fetches remote on first Gmail load
- [ ] **Scenario 2**: Gmail selector breaks → developer pushes fix → auto-recovery within 24hr
- [ ] **Scenario 3**: Offline user falls back to cached, alarm retries successfully when online
- [ ] **Scenario 4**: Bad config rejected by validation, rollback via git revert works

**Additional Checks**:
- [ ] Manual "Check for Updates" button triggers immediate fetch
- [ ] Auto-update toggle in settings disables background fetches
- [ ] Popup footer displays current config version and age
- [ ] Console logs include [ScopeShield] prefix for all operations
- [ ] Privacy audit: Network monitor shows zero user data transmitted (only config download)

---

## Developer Workflow: Updating Config

**When to Update**:
1. Gmail DOM structure changes (selectors break)
2. Gmail A/B test (new UI variant detected)
3. Bug fix (incorrect selector)

**Update Process**:
```bash
# 1. Test selectors on real Gmail
# Open mail.google.com, inspect DOM, verify new selectors work

# 2. Update selectors.json
# Bump version (PATCH for fixes, MINOR for new selectors)
{
  "version": "1.2.1",  // Increment version
  "lastUpdated": "2025-11-23T09:00:00Z",  // Update timestamp
  "selectors": {
    // Update broken selectors
  },
  "fallbacks": {
    // Add old selectors as fallbacks
  },
  "metadata": {
    "description": "Fix for Gmail update (Nov 23)",
    "gmailVersion": "2025.11.23"
  }
}

# 3. Commit & push
git add selectors.json
git commit -m "v1.2.1: Fix Gmail subject selector (.hP → .hP-new)"
git push

# 4. Monitor (optional)
# - Check GitHub Gist views (see if users fetching)
# - Monitor support requests (should decrease)
```

**Testing Before Push**:
```bash
# Test config locally before pushing
cp selectors.json /path/to/extension/src/utils/config-fallback.json
npm run build
# Load unpacked extension, verify detection works
```

---

## Troubleshooting

### Issue: Config Fetch Fails (Always)

**Symptoms**: Console shows "Fetch failed: Network error" every time

**Causes**:
1. GitHub Gist URL incorrect (404)
2. CORS issue (GitHub should allow CORS by default)
3. Network firewall blocking GitHub

**Diagnosis**:
```javascript
// In background page DevTools Console
fetch('https://gist.githubusercontent.com/[user]/[gist-id]/raw/selectors.json')
  .then(r => r.json())
  .then(console.log)
  .catch(console.error);
```

**Fix**:
- Verify Gist URL is public and correct
- Check `raw` URL format (not web UI URL)
- Test Gist URL in browser (should download JSON)

---

### Issue: Validation Always Fails

**Symptoms**: Console shows "Validation failed: selector 'X' not found"

**Causes**:
1. Selectors don't match current Gmail DOM
2. Testing on wrong Gmail domain (using Gmail Lite vs standard)
3. Fallback chain missing working selectors

**Diagnosis**:
```javascript
// In Gmail tab DevTools Console
config.fallbacks.messageBody.forEach(sel => {
  console.log(sel, '→', document.querySelector(sel));
});
// Should show at least ONE non-null result
```

**Fix**:
- Inspect Gmail DOM, find correct selectors
- Add more fallbacks to handle Gmail variants
- Test on multiple Gmail accounts (personal, workspace)

---

### Issue: Config Updates But Detection Doesn't Reload

**Symptoms**: Config version increments but old selectors still used

**Causes**:
1. chrome.storage.onChanged listener not firing
2. Content script not reloading selectors on config change
3. Multiple content script instances running

**Diagnosis**:
```javascript
// In content script DevTools Console
chrome.storage.onChanged.addListener((changes) => {
  console.log('Storage changed:', changes);
});

// Then trigger update and check if listener fires
```

**Fix**:
- Ensure content script has chrome.storage.onChanged listener
- Reload selector cache when config changes
- Remove duplicate content script instances

---

## References

- **Data Model**: [data-model.md](data-model.md) - Entity definitions
- **JSON Schema**: [contracts/selector-config.schema.json](contracts/selector-config.schema.json) - Config validation
- **Implementation Plan**: [plan.md](plan.md) - Technical architecture
- **Chrome APIs**:
  - [chrome.alarms](https://developer.chrome.com/docs/extensions/reference/api/alarms)
  - [chrome.storage.local](https://developer.chrome.com/docs/extensions/reference/api/storage#property-local)
  - [chrome.storage.onChanged](https://developer.chrome.com/docs/extensions/reference/api/storage#event-onChanged)
