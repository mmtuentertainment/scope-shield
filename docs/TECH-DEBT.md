# Technical Debt Tracker

## Priority Queue for Future PRs

### 🟡 Medium Priority - Address in PR #8 or #9

#### 1. Refactor content.js scanMessages() Function
**File**: `src/content/content.js:227`
**Issue**: Async function has 23 statements (limit: 20)
**Impact**: Core detection engine - high complexity increases bug risk
**Suggested Fix**: Extract validation, filtering, and detection logic into separate functions
**Estimated Effort**: 1-2 hours
**Target PR**: #8 (Phase 3) or #9 (Tech Debt Sprint)

#### 2. Refactor SettingsForm handleSubmit() Method
**File**: `src/popup/settings/SettingsForm.js:74`
**Issue**: Async method has 30 statements (limit: 20)
**Impact**: Complex form submission logic
**Suggested Fix**: Extract validation steps, error handling, and storage operations
**Estimated Effort**: 1 hour
**Target PR**: #9 (Tech Debt Sprint)

---

### 🟢 Low Priority - Opportunistic Fixes

#### 3. Split SettingsFormTemplate.js
**File**: `src/popup/settings/SettingsFormTemplate.js:8`
**Issue**: getFormHTML() has 94 lines (limit: 50)
**Fix**: Extract to separate .html file or split into sections
**Effort**: 30 minutes

#### 4. Extract WelcomeModal.show() Sub-Functions
**File**: `src/popup/WelcomeModal.js:20`
**Issue**: Method has 55 lines (limit: 50)
**Fix**: Extract DOM creation and setup logic
**Effort**: 30 minutes

#### 5. Clean Up Dead Code
**Files**:
- `Logger.js:14` - Unused 'error' parameter
- `WelcomeModal.js:93` - Unused 'errorEl' variable

**Fix**: Remove unused variables
**Effort**: 5 minutes

---

## Notes

- All items are from PR #6 (merged, working code)
- None block current development
- Address during slow periods or dedicated tech debt sprints
- ESLint warnings, not errors (intentionally set to "warn" for flexibility)

---

**Last Updated**: 2025-11-14 (PR #7 - Popup Modular Refactoring)
