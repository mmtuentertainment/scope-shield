# Spec-Kit: Implement (Stage 5)

You are now in **Stage 5: Implementation** of the Spec-Driven Development workflow.

## Your Task

Execute the implementation by completing tasks from tasks.md in dependency order, writing tests first (TDD), and maintaining alignment with the plan and specification.

## Context

- **Project**: ScopeShield
- **Input Files**:
  - specs/###-feature-name/spec.md
  - specs/###-feature-name/plan.md
  - specs/###-feature-name/tasks.md
  - specs/###-feature-name/data-model.md
  - specs/###-feature-name/contracts/
- **Output**: Working, tested code in src/

## Pre-Implementation Validation

Before starting implementation, verify:
- [ ] spec.md is complete and clarified
- [ ] plan.md exists with architecture, data model, and contracts
- [ ] tasks.md has atomic tasks with acceptance criteria
- [ ] Dependencies are installed: `npm install`
- [ ] Development environment works: `npm run dev`

## Implementation Workflow

### 1. Task Selection

**Selection Strategy**:
- Start with Task 001 (typically infrastructure)
- Follow dependency order from tasks.md
- Pick tasks marked "⬜ Not Started" with no blocking dependencies
- Prefer parallel tasks when possible

### 2. Test-Driven Development (TDD) Cycle

For each task:

```
1. READ → Read task acceptance criteria and implementation notes
2. TEST → Write failing unit test
3. CODE → Write minimal code to pass test
4. REFACTOR → Clean up code while keeping tests green
5. VALIDATE → Check acceptance criteria
6. UPDATE → Mark task complete in tasks.md
```

**Example TDD Flow**:

```javascript
// Step 1: Write test (RED)
describe('detectScopeCreep', () => {
  it('should return true for trigger words', () => {
    const result = detectScopeCreep('Can you also add this feature?');
    expect(result).toBe(true);
  });
});

// Run: npm test → FAILS ✗

// Step 2: Write code (GREEN)
function detectScopeCreep(message) {
  return message.includes('also');
}

// Run: npm test → PASSES ✓

// Step 3: Refactor (REFACTOR)
const TRIGGER_WORDS = ['also', 'additionally', 'one more thing'];
function detectScopeCreep(message) {
  return TRIGGER_WORDS.some(word => message.toLowerCase().includes(word));
}

// Run: npm test → STILL PASSES ✓
```

### 3. Implementation Standards

**Code Quality**:
- Follow existing code style (ESLint config)
- Write JSDoc comments for public functions
- Use meaningful variable names
- Keep functions small (<50 lines)
- Avoid nested callbacks (use async/await)

**Performance**:
- Profile critical paths
- Use `performance.now()` for timing
- Validate against performance budgets from plan.md
- Optimize only after profiling shows bottleneck

**Security**:
- Sanitize all user inputs
- No `eval()` or `Function()` constructors
- No inline scripts (CSP compliant)
- Validate data types before use

**Privacy**:
- No network requests for user data
- Only use chrome.storage.local
- No console.log of sensitive data
- No analytics or telemetry

### 4. Task Completion Checklist

Before marking a task complete:
- [ ] All acceptance criteria met
- [ ] Unit tests written and passing
- [ ] No new ESLint errors
- [ ] Performance validated (if performance-critical)
- [ ] Manual testing done (if UI task)
- [ ] JSDoc comments added (if public API)
- [ ] Task status updated in tasks.md

### 5. Progress Tracking

**Update tasks.md after each task**:

```markdown
| Task | Status | Assignee | Hours | Completed |
|------|--------|----------|-------|-----------|
| 001 | ✅ | Claude | 0.5 | 2025-11-10 |
| 002 | 🟦 | Claude | 0.75 | In progress |
| 003 | ⬜ | - | 1.0 | - |
```

**Status symbols**:
- ⬜ Not Started
- 🟦 In Progress
- ✅ Completed
- ⚠️ Blocked

## Common Implementation Patterns

### Chrome Extension Architecture

**Service Worker (Background)**:
```javascript
// src/background/service-worker.js
chrome.runtime.onInstalled.addListener(() => {
  // Initialize storage
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  // Handle messages from content scripts
});
```

**Content Script**:
```javascript
// src/content/content.js
// Inject into Gmail/Slack pages
function init() {
  observeDOM();
  detectScopeCreep();
}

// Run when page loads
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
```

**Storage Utilities**:
```javascript
// src/utils/storage.js
export async function saveData(key, value) {
  return chrome.storage.local.set({ [key]: value });
}

export async function loadData(key) {
  const result = await chrome.storage.local.get(key);
  return result[key];
}
```

### Error Handling Pattern

```javascript
try {
  const result = await riskyOperation();
  return { success: true, data: result };
} catch (error) {
  console.error('Operation failed:', error);
  // Graceful degradation
  return { success: false, error: error.message, fallback: true };
}
```

### Performance Monitoring

```javascript
function detectScopeCreep(message) {
  const startTime = performance.now();

  const result = performDetection(message);

  const duration = performance.now() - startTime;
  if (duration > 500) {
    console.warn(`Detection took ${duration}ms (target: <500ms)`);
  }

  return result;
}
```

## Testing Strategy

### Unit Tests

```javascript
// tests/utils/detector.test.js
import { describe, it, expect } from 'vitest';
import { detectScopeCreep } from '../../src/utils/detector.js';

describe('detectScopeCreep', () => {
  it('should detect trigger words', () => {
    expect(detectScopeCreep('Can you also add X?')).toBe(true);
  });

  it('should ignore clean messages', () => {
    expect(detectScopeCreep('Thanks for the update')).toBe(false);
  });

  it('should be case insensitive', () => {
    expect(detectScopeCreep('ALSO please add...')).toBe(true);
  });

  it('should handle empty input', () => {
    expect(detectScopeCreep('')).toBe(false);
  });
});
```

### Run Tests

```bash
# Run all tests
npm test

# Run specific test file
npm test detector.test.js

# Run tests in watch mode
npm test -- --watch

# Run with coverage
npm test -- --coverage
```

## Debugging

### Chrome Extension Debugging

1. **Load unpacked extension**:
   - Build: `npm run build`
   - Open: `chrome://extensions/`
   - Enable Developer mode
   - Click "Load unpacked" → select `dist/`

2. **Debug service worker**:
   - Click "service worker" link in extension card
   - Opens DevTools for background script

3. **Debug content script**:
   - Open Gmail/Slack
   - Right-click → Inspect
   - Console shows content script logs

4. **Debug popup**:
   - Click extension icon
   - Right-click popup → Inspect

### Common Issues

**Issue**: Content script not injecting
- Check manifest.json matches array includes correct URLs
- Verify run_at: "document_idle" is set
- Reload extension and refresh page

**Issue**: Storage not persisting
- Check chrome.storage.local size (<5MB limit)
- Verify permissions in manifest.json
- Use chrome.storage.local.get() correctly (async)

**Issue**: Permission denied
- Add missing permission to manifest.json
- Reload extension
- Check host_permissions for specific domains

## Implementation Milestones

### Milestone 1: Foundation ✅
- [ ] File structure created
- [ ] Build system working
- [ ] Tests running
- [ ] Storage utilities implemented

### Milestone 2: Core Logic ✅
- [ ] Data models implemented
- [ ] Business logic complete
- [ ] Unit tests passing (80%+ coverage)
- [ ] Performance validated

### Milestone 3: UI Integration ✅
- [ ] UI components created
- [ ] Event handlers connected
- [ ] Visual feedback working
- [ ] Manual testing complete

### Milestone 4: Polish ✅
- [ ] Error handling complete
- [ ] Edge cases handled
- [ ] Documentation updated
- [ ] Ready for manual QA

## Completion Criteria

Feature implementation is complete when:
- [ ] All tasks in tasks.md marked ✅
- [ ] All unit tests passing
- [ ] All acceptance criteria met
- [ ] Performance budgets validated
- [ ] Manual testing completed
- [ ] No critical bugs
- [ ] Constitution Check still valid
- [ ] Code reviewed (if team project)

## Post-Implementation

After implementation is complete:

1. **Run Analysis**:
   ```bash
   /speckit.analyze
   ```
   Validates code aligns with spec and plan.

2. **Update Status**:
   Update spec.md status to "Implemented"

3. **Manual Testing**:
   Test in real Chrome on Gmail and Slack

4. **Measure Success**:
   Validate success metrics from spec.md

5. **Document Learnings**:
   Note any deviations from plan and why

6. **Commit Code**:
   ```bash
   git add .
   git commit -m "Implement [Feature Name] (#001)"
   ```

## Getting Help

**If stuck on a task**:
1. Re-read acceptance criteria and implementation notes
2. Check plan.md for architecture guidance
3. Review contracts/ for function signatures
4. Search Chrome Extension docs
5. Ask for clarification (update open questions)

**If task is blocked**:
1. Mark as ⚠️ Blocked in tasks.md
2. Document blocking reason
3. Work on parallel tasks
4. Resolve blocker before returning

## Workflow Summary

```
1. Select task (dependency order)
2. Write test (RED)
3. Implement code (GREEN)
4. Refactor (CLEAN)
5. Validate acceptance criteria
6. Update tasks.md
7. Repeat until all tasks ✅
8. Run /speckit.analyze
9. Commit code
```

---

**Ready to implement.** Which feature should I start implementing?

**Usage**: `/speckit.implement` or `/speckit.implement [task-number]` to resume from specific task.
