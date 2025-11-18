# Phase 6: Auto-Export Feature - Rehydration Prompt

**Context Date**: 2025-11-18
**Current Branch**: `main` (PR #10 merged)
**Test Status**: ✅ 507/507 tests passing
**Phases Complete**: 1-5 (85% MVP complete)

---

## 🎯 Mission: Implement Phase 6 Auto-Export Timer

**User Story**: As a freelancer who has adjusted pricing in the calculator, I want the change order to automatically export after 3 seconds of inactivity, so I don't have to manually click export buttons every time.

**Value**: Reduces friction from 1 click (export button) → 0 clicks (automatic), improving workflow efficiency for repeat users.

---

## 📦 What's Already Built (Phases 1-5)

### ✅ Available Infrastructure

1. **ExportService** ([src/lib/change-order/export/ExportService.js](../src/lib/change-order/export/ExportService.js))
   ```javascript
   // 3 export methods ready:
   await ExportService.export(text, 'pdf', metadata);      // PDF download
   await ExportService.export(text, 'clipboard');          // Clipboard copy
   await ExportService.export(text, 'text', metadata);     // Text file download
   ```

2. **ChangeOrderModal** ([src/popup/components/ChangeOrderModal.js](../src/popup/components/ChangeOrderModal.js))
   - Calculator widget integrated
   - Export controls mounted
   - `updateDocument(newText)` method available
   - `debouncedRecalculate` already uses 300ms debounce

3. **Settings System** ([src/lib/storage/SettingsStorage.js](../src/lib/storage/SettingsStorage.js))
   - `SettingsStorage.get()` - Load settings
   - `SettingsStorage.save(settings)` - Persist settings
   - FreelancerSettings model with validation
   - Schema already has `autoExportEnabled`, `autoExportDelay`, `defaultExportMethod` fields ✅

4. **Notification System** ([src/popup/components/NotificationManager.js](../src/popup/components/NotificationManager.js))
   ```javascript
   showNotification(id, message, type, duration);
   // Use for countdown: "Auto-exporting in 3... 2... 1..."
   ```

5. **Debounce Utility** ([src/popup/utils/debounce.js](../src/popup/utils/debounce.js))
   ```javascript
   const debounced = debounce(fn, delay);
   debounced.cancel(); // Cancel pending execution
   ```

### 🧪 Test Coverage
- 507 tests passing across 29 test files
- Test patterns available in `tests/lib/change-order/`, `tests/popup/components/`
- Manual testing guide: [PHASE3-MANUAL-TESTING-GUIDE.md](specs/002-change-order-generator/PHASE3-MANUAL-TESTING-GUIDE.md)

---

## 🚧 What Needs to Be Built (Phase 6)

### Required Components

**1. AutoExportTimer.js** (NEW - Primary deliverable)
**Location**: `src/lib/change-order/AutoExportTimer.js`
**Purpose**: Manage 3-second countdown + auto-trigger export

**API Design**:
```javascript
class AutoExportTimer {
  constructor(options) {
    this.delay = options.delay || 3; // seconds
    this.onExport = options.onExport; // async () => Promise<{success, error?}>
    this.onCountdown = options.onCountdown; // (secondsLeft) => void
    this.onCancel = options.onCancel; // () => void
  }

  start() { /* Start 3s countdown */ }
  cancel() { /* Cancel pending export */ }
  reset() { /* Reset timer (e.g., on user edit) */ }
  isActive() { /* Returns boolean */ }
}
```

**Behavior**:
- Starts countdown immediately after document rebuild completes
- Resets timer if user makes another calculator change (debounced)
- Shows countdown toast notification: "Auto-exporting in 3... 2... 1..."
- Calls `onExport()` when timer reaches 0
- Cancels if user clicks anywhere in modal (or explicitly cancels)
- Cleanup on modal close

**2. Settings UI Update** (PREREQUISITE)
**Location**: `src/options/SettingsForm.js`
**Purpose**: Add UI for export preferences (deferred from Phase 2)

**Required Fields**:
1. **Default Export Method** dropdown:
   ```html
   <select id="defaultExportMethod">
     <option value="clipboard">Clipboard</option>
     <option value="pdf">PDF</option>
     <option value="text">Text File</option>
   </select>
   ```

2. **Auto-Export Enabled** checkbox:
   ```html
   <input type="checkbox" id="autoExportEnabled" />
   <label>Auto-export change orders after delay</label>
   ```

3. **Auto-Export Delay** slider:
   ```html
   <input type="range" id="autoExportDelay" min="1" max="10" step="1" value="3" />
   <span id="delayDisplay">3 seconds</span>
   ```

**Integration**: Settings form should save to `FreelancerSettings` on change

---

## 📋 Implementation Tasks (T191-T212)

### Phase 6.1: Settings UI (T050-T052) - 1-2 hours
**MUST COMPLETE FIRST**

- [ ] **T050**: Add default export method dropdown to SettingsForm
- [ ] **T050**: Add auto-export enabled checkbox to SettingsForm
- [ ] **T051**: Add auto-export delay slider (1-10 seconds)
- [ ] **T052**: Add delay value display next to slider
- [ ] **Tests**: Verify settings save/load correctly

### Phase 6.2: AutoExportTimer Core (T191-T200) - 2 hours

- [ ] **T191**: Create `AutoExportTimer.js` class with constructor
- [ ] **T192**: Implement `start()` method (begins countdown)
- [ ] **T193**: Implement `cancel()` method (stops countdown)
- [ ] **T194**: Implement `reset()` method (restart countdown)
- [ ] **T195**: Add countdown callback (`onCountdown(secondsLeft)`)
- [ ] **T196**: Add export completion callback (`onExport()`)
- [ ] **T197**: Add cancellation callback (`onCancel()`)
- [ ] **T198**: Implement cleanup logic (clear timers, remove listeners)
- [ ] **T199**: Add state tracking (`isActive()`, `isPaused()`)
- [ ] **T200**: Write unit tests for timer logic

### Phase 6.3: UI Integration (T201-T206) - 1 hour

- [ ] **T201**: Add countdown toast notification
  - Use `NotificationManager.showNotification()`
  - Update text every second: "Auto-exporting in X..."
  - Different color/style than regular toasts (e.g., blue instead of green)

- [ ] **T202**: Integrate timer into `ChangeOrderModal`
  - Create timer instance after calculator mounts
  - Pass `autoExportDelay` from settings
  - Wire up `onExport` to call `ExportService.export()`

- [ ] **T203**: Reset timer on calculator changes
  - Hook into calculator `onCalculate` callback
  - Call `timer.reset()` when user edits rate/hours

- [ ] **T204**: Cancel timer on modal close
  - Add to `modal.close()` method
  - Ensure cleanup prevents memory leaks

- [ ] **T205**: Allow manual cancellation
  - Click anywhere in modal → cancel timer
  - Show "Auto-export cancelled" toast briefly

- [ ] **T206**: Respect `autoExportEnabled` setting
  - Don't create timer if disabled
  - Show "Auto-export disabled" hint in settings

### Phase 6.4: Error Handling (T207-T210) - 1 hour

- [ ] **T207**: Handle export failures gracefully
  - If auto-export fails, show error toast
  - Display manual export buttons as fallback
  - Log error but don't crash modal

- [ ] **T208**: Handle settings loading errors
  - If settings can't load, default to `autoExportEnabled: true, delay: 3`
  - Log warning but proceed with defaults

- [ ] **T209**: Test cancellation edge cases
  - User closes modal during countdown
  - User changes calculator while countdown active
  - Multiple rapid calculator changes (debounce handling)

- [ ] **T210**: Add integration tests
  - Test timer + modal + export integration
  - Verify countdown UI updates correctly
  - Verify cancellation works from multiple triggers

### Phase 6.5: Polish & Documentation (T211-T212) - 30 mins

- [ ] **T211**: Add JSDoc comments to AutoExportTimer
- [ ] **T212**: Update README with auto-export feature description
- [ ] **Bonus**: Add manual testing guide for auto-export

---

## 🚀 Getting Started - Use Claude Code Features

### Step 1: Research Phase (Use Task Tool with Explore Agent)

**Instead of reading files manually**, use the Explore agent to understand current architecture:

```
Use the Task tool with Explore agent to:
1. Find all ExportService usage patterns in the codebase
2. Understand how ChangeOrderModal integrates with calculator
3. Review NotificationManager API and usage examples
4. Map out SettingsForm.js structure for adding new fields
```

**Why**: Explore agent can search multiple files in parallel, providing comprehensive context faster than manual file reads.

### Step 2: Implement in Parallel (Multiple Files)

**Use parallel file edits** when creating independent components:

```
In a single response, I'll:
1. Create AutoExportTimer.js (Write tool)
2. Update ChangeOrderModal.js integration (Edit tool)
3. Update SettingsForm.js with new fields (Edit tool)
4. Create AutoExportTimer.test.js (Write tool)

All 4 files in parallel since they don't depend on each other's content.
```

**Why**: Parallel execution is 4x faster than sequential for independent changes.

### Step 3: Test with Agent (Use Task Tool)

**Launch test runner agent** instead of manual test runs:

```
Use Task tool to:
1. Run test suite and monitor for failures
2. If failures occur, analyze and fix automatically
3. Report back with summary

This agent can iterate on fixes without manual intervention.
```

**Why**: Automated test fix iterations save time on debugging cycles.

### Step 4: Manual Testing (Use Manual Testing Assistant Skill)

**If available**, use the manual-testing-assistant skill:

```
"Use manual-testing-assistant to test auto-export countdown feature with Thorough Tessa persona"
```

**Features to test**:
- Countdown appears after document rebuild
- Clicking cancels auto-export
- Changing calculator resets countdown
- Export triggers automatically after delay
- Settings toggle works (enable/disable)

---

## 📚 Key Files to Reference

### Read These First (Context)
1. [src/popup/components/ChangeOrderModal.js](../src/popup/components/ChangeOrderModal.js) - Where to integrate timer
2. [src/lib/change-order/export/ExportService.js](../src/lib/change-order/export/ExportService.js) - Export API
3. [src/popup/components/NotificationManager.js](../src/popup/components/NotificationManager.js) - Toast notifications
4. [src/options/SettingsForm.js](../src/options/SettingsForm.js) - Add export preferences UI

### Reference Implementations (Patterns to Follow)
1. [src/lib/change-order/PricingCalculatorWidget.js](../src/lib/change-order/PricingCalculatorWidget.js) - Widget pattern (render, destroy, event handling)
2. [src/popup/utils/debounce.js](../src/popup/utils/debounce.js) - Debounce utility (has cancel method)
3. [tests/popup/components/ChangeOrderModal.test.js](../tests/popup/components/ChangeOrderModal.test.js) - Test patterns for modal integration

### Spec Files (Requirements)
1. [specs/002-change-order-generator/spec.md](specs/002-change-order-generator/spec.md) - User stories + acceptance criteria
2. [specs/002-change-order-generator/tasks.md](specs/002-change-order-generator/tasks.md) - T191-T212 task details
3. [specs/002-change-order-generator/plan.md](specs/002-change-order-generator/plan.md) - Phase 6 Prerequisites section

---

## ✅ Acceptance Criteria (How to Know You're Done)

### Functional Requirements
1. ✅ Timer starts automatically after document rebuild completes
2. ✅ Countdown toast shows "Auto-exporting in 3... 2... 1..."
3. ✅ Timer resets when user changes calculator inputs
4. ✅ Clicking anywhere in modal cancels auto-export
5. ✅ Auto-export uses `defaultExportMethod` from settings
6. ✅ Settings page has dropdown, checkbox, slider for export preferences
7. ✅ Auto-export respects `autoExportEnabled` toggle (disabled = no timer)
8. ✅ Export failures show error + manual button fallback

### Performance Requirements
1. ✅ Timer accuracy: ±100ms (countdown should be 3000ms ± 100ms)
2. ✅ No performance impact on calculator updates (<100ms still)
3. ✅ No memory leaks from timer (cleanup on modal close)

### Test Requirements
1. ✅ Unit tests for AutoExportTimer (start, cancel, reset, countdown)
2. ✅ Integration tests for modal + timer + export flow
3. ✅ Edge case tests (close during countdown, rapid calculator changes)
4. ✅ Manual testing: Countdown visible, cancellation works, export triggers

---

## 🔧 Implementation Strategy

### Use Claude Code's Parallel Mode

**Phase 6 has 4 independent file creation tasks** - leverage parallel execution:

**Single Message with 4 Tool Calls**:
```
"Create these 4 files in parallel:
1. AutoExportTimer.js - Timer logic with start/cancel/reset
2. AutoExportTimer.test.js - Unit tests for timer
3. Update ChangeOrderModal.js - Integrate timer
4. Update SettingsForm.js - Add export preference UI"
```

This completes in 1 iteration instead of 4!

### Use Agents for Complex Tasks

**For refactoring ChangeOrderModal** (which is 272 lines):
```
Use code-architect agent to design the timer integration:
- Where to initialize timer
- How to wire up calculator reset
- Cleanup strategy on modal close
```

**For comprehensive testing**:
```
Use pr-test-analyzer agent to review test coverage for Phase 6:
- Verify timer tests cover start/cancel/reset
- Check integration tests cover modal + timer + export
- Identify any missing edge cases
```

### Leverage Existing Patterns

**Don't reinvent** - reuse established patterns:

1. **Widget Pattern** (from PricingCalculatorWidget):
   ```javascript
   class AutoExportTimer {
     constructor(options) { /* ... */ }
     start() { /* Begin countdown */ }
     cancel() { /* Stop countdown */ }
     destroy() { /* Cleanup */ }
   }
   ```

2. **Modal Integration** (from PricingCalculatorWidget in ChangeOrderModal):
   ```javascript
   // In ChangeOrderModal constructor:
   this.autoExportTimer = null;

   // In mountCalculator():
   if (settings.autoExportEnabled) {
     this.autoExportTimer = new AutoExportTimer({ /* options */ });
   }

   // In close():
   if (this.autoExportTimer) {
     this.autoExportTimer.cancel();
     this.autoExportTimer = null;
   }
   ```

3. **Debounced Reset** (from calculator):
   ```javascript
   // Reset timer when calculator changes (debounced)
   const debouncedTimerReset = debounce(() => {
     this.autoExportTimer?.reset();
   }, 300);
   ```

---

## 🎬 Suggested Prompts for Phase 6

### Kick-Off Prompt (Start Here)

```
I want to implement Phase 6 of the ScopeShield spec 002: Auto-Export Feature.

CONTEXT:
- Phases 1-5 complete (calculator + export working)
- 507 tests passing
- PR #10 just merged (build migration + calculator bug fix)

GOAL:
Implement auto-export timer that triggers export 3 seconds after user stops editing the calculator.

APPROACH:
1. Use Explore agent to understand current ChangeOrderModal + ExportService integration
2. Create AutoExportTimer.js class in parallel with its tests
3. Integrate timer into ChangeOrderModal (start, reset on calculator change, cancel on close)
4. Update SettingsForm with export preferences UI (dropdown, checkbox, slider)
5. Write integration tests for timer + modal + export flow
6. Manual test with real extension to verify countdown + cancellation work

REQUIREMENTS:
- Read specs/002-change-order-generator/plan.md "Phase 6 Prerequisites" section
- Follow existing patterns from PricingCalculatorWidget
- All edits must pass existing 507 tests (0 regressions allowed)
- Countdown toast updates every second ("Auto-exporting in 3... 2... 1...")
- Clicking anywhere in modal cancels auto-export

Start by using the Explore agent to map out the integration points in ChangeOrderModal.js.
```

### After AutoExportTimer Created

```
Now integrate AutoExportTimer into ChangeOrderModal:

1. Import AutoExportTimer at top of ChangeOrderModal.js
2. Add this.autoExportTimer = null in constructor
3. In mountCalculator(), create timer instance:
   - Check if settings.autoExportEnabled is true
   - Pass delay from settings.autoExportDelay
   - Wire onExport to call ExportService with defaultExportMethod
   - Wire onCountdown to update notification toast
4. In close(), cancel and destroy timer
5. On calculator change, reset timer (debounced)

Use parallel Edit calls to update ChangeOrderModal.js in multiple places if edits are independent.
```

### For Settings UI

```
Update src/options/SettingsForm.js to add export preferences:

PARALLEL MODE: Create 3 input fields in one response:
1. Dropdown for defaultExportMethod (clipboard/pdf/text)
2. Checkbox for autoExportEnabled
3. Range slider for autoExportDelay (1-10 seconds) with value display

Wire all 3 to save on change using SettingsStorage.save().
Pre-fill from loaded settings on form init.
Add validation (delay must be 1-10).
```

### For Testing

```
Use parallel mode to create tests:

1. AutoExportTimer.test.js - Unit tests for timer logic
2. AutoExportTimerIntegration.test.js - Modal + timer + export flow
3. Update ChangeOrderModal.test.js - Add timer integration tests
4. Manual test with extension loaded

Run tests in parallel using test runner agent to catch failures early.
```

---

## ⚠️ Common Pitfalls to Avoid

### 1. Memory Leaks from Timers
**Problem**: Forgot to clear setTimeout/setInterval on modal close
**Solution**: Always call `timer.cancel()` in `modal.close()` and set to null

### 2. Race Conditions with Debounce
**Problem**: Calculator debounce (300ms) + timer reset creates double delay
**Solution**: Reset timer AFTER debounced recalculation completes, not on input change

### 3. Export During Countdown
**Problem**: User manually clicks export while auto-export countdown active
**Solution**: Cancel timer when manual export triggered (avoid double export)

### 4. Settings Not Loaded
**Problem**: Auto-export starts before settings loaded
**Solution**: Await `SettingsStorage.get()` in modal initialization, pass to timer

### 5. Toast Notification Overflow
**Problem**: Countdown toast + export success toast overlap
**Solution**: Clear countdown toast before showing success toast

---

## 🧪 Testing Strategy

### Unit Tests (AutoExportTimer.test.js)
```javascript
describe('AutoExportTimer', () => {
  it('should start countdown and call onExport after delay');
  it('should cancel countdown when cancel() called');
  it('should reset countdown when reset() called');
  it('should call onCountdown every second');
  it('should cleanup timers on destroy()');
  it('should not start if already active');
  it('should handle onExport errors gracefully');
});
```

### Integration Tests (ChangeOrderModal.test.js additions)
```javascript
describe('Auto-Export Integration', () => {
  it('should start timer after document rebuild');
  it('should reset timer when calculator changes');
  it('should cancel timer when modal closes');
  it('should cancel timer when manual export clicked');
  it('should not create timer if autoExportEnabled false');
  it('should use defaultExportMethod from settings');
});
```

### Manual Testing Checklist
- [ ] Open modal → countdown appears
- [ ] Wait 3 seconds → export triggers automatically
- [ ] Change calculator → countdown resets to 3
- [ ] Click anywhere → countdown cancels
- [ ] Close modal during countdown → no errors
- [ ] Disable in settings → no countdown appears
- [ ] Change delay to 5s → countdown shows 5... 4... 3... 2... 1...

---

## 📊 Success Metrics

**Phase 6 is complete when**:
- ✅ AutoExportTimer exists with full API (start, cancel, reset, destroy)
- ✅ Timer integrates into ChangeOrderModal without breaking existing features
- ✅ Settings page has 3 new fields (dropdown, checkbox, slider)
- ✅ Countdown toast visible and updates every second
- ✅ Auto-export triggers after delay using correct export method
- ✅ All 507+ existing tests still pass
- ✅ New tests added (≥20 new test cases for timer + integration)
- ✅ Manual testing confirms countdown, cancellation, and export work

**Performance**:
- ✅ Timer accuracy: 3000ms ±100ms
- ✅ No UI lag during countdown (toast updates should be smooth)
- ✅ No memory leaks (timer cleaned up on modal close)

**User Experience**:
- ✅ Countdown is non-intrusive (small toast, not blocking)
- ✅ Easy to cancel (click anywhere)
- ✅ Clear feedback ("Auto-exporting in X..." → "Exported as PDF!")
- ✅ Respects user preferences (can disable in settings)

---

## 🔗 Quick Links

**Spec Files:**
- [Full Specification](specs/002-change-order-generator/spec.md)
- [Implementation Plan](specs/002-change-order-generator/plan.md)
- [Task Breakdown](specs/002-change-order-generator/tasks.md)
- [Implementation Audit](specs/002-change-order-generator/IMPLEMENTATION_AUDIT.md)

**Key Source Files:**
- [ChangeOrderModal.js](src/popup/components/ChangeOrderModal.js) - Modal component (272 lines)
- [ExportService.js](src/lib/change-order/export/ExportService.js) - Export orchestrator
- [SettingsStorage.js](src/lib/storage/SettingsStorage.js) - Settings persistence
- [NotificationManager.js](src/popup/components/NotificationManager.js) - Toast UI

**Test Files:**
- [ChangeOrderModal.test.js](tests/popup/components/ChangeOrderModal.test.js) - 24 tests
- [ExportService.test.js](tests/lib/change-order/export/ExportService.test.js) - 20 tests

**Build System:**
- [vite.config.js](vite.config.js) - Uses @samrum/vite-plugin-web-extension
- [package.json](package.json) - Dependencies

---

## 🎯 Expected Timeline

| Task | Duration | Approach |
|------|----------|----------|
| **Settings UI (T050-T052)** | 1-2 hours | Parallel Edit calls for 3 form fields |
| **AutoExportTimer Core** | 2 hours | Write new file + tests in parallel |
| **Modal Integration** | 1 hour | Edit ChangeOrderModal (3-4 locations) |
| **Testing & Polish** | 1 hour | Run tests, manual verification |
| **TOTAL** | **5-6 hours** | Use parallel mode throughout |

**With Claude Code optimization**: Complete in 3-4 hours (parallel file creation, agent-driven testing)

---

## 🚨 Before You Start

**VERIFY**:
1. ✅ On `main` branch with PR #10 merged
2. ✅ Run `npm test` - should show 507/507 passing
3. ✅ Run `npm run build` - should complete without errors
4. ✅ Load extension in Chrome - popup should display detections

**If any verification fails**, fix before starting Phase 6.

**CHECKPOINT**: Read [plan.md Phase 6 Prerequisites](specs/002-change-order-generator/plan.md) section to confirm all infrastructure is available.

---

## 💡 Pro Tips

1. **Start with Settings UI** - Get T050-T052 done first (prerequisite for timer testing)
2. **Use Explore agent liberally** - Understand integration points before coding
3. **Parallel file creation** - AutoExportTimer.js + test file in one response
4. **Test incrementally** - Run tests after each component (timer → integration → settings)
5. **Manual test early** - Load extension and verify countdown appears (don't wait until end)
6. **Reference PricingCalculatorWidget** - Same widget pattern applies to AutoExportTimer
7. **Commit frequently** - After timer working, after settings UI, after integration

---

## 🎉 What Success Looks Like

**User Flow (After Phase 6)**:
1. User clicks "Generate Change Order" → Modal opens
2. User adjusts calculator (Rate: $150, Hours: 8)
3. **Countdown appears**: "Auto-exporting in 3... 2... 1..."
4. User waits → **PDF downloads automatically** (or clipboard copies, per settings)
5. Toast shows: "📄 Exported as PDF successfully!"

**Alternative Flow (Cancellation)**:
1. User clicks "Generate Change Order" → Modal opens
2. User adjusts calculator
3. Countdown appears: "Auto-exporting in 3..."
4. **User clicks anywhere** → Countdown disappears
5. User manually clicks "Export as PDF" button

**Settings Flow**:
1. User opens Settings page
2. Sees "Export Preferences" section with:
   - Default method: [Dropdown: PDF ▼]
   - ☑ Auto-export after delay
   - Delay: [====●====] 3 seconds
3. User unchecks auto-export → No countdown in future modals
4. User changes delay to 5s → Future countdowns show 5... 4... 3... 2... 1...

---

**Ready to implement Phase 6?** Start with the kick-off prompt above and leverage Claude Code's parallel mode + agents for maximum efficiency! 🚀

**Estimated completion**: 3-4 hours with optimization, 5-6 hours standard pace

**Last Updated**: 2025-11-18
**Author**: Claude (Sonnet 4.5)
**Test Status**: 507/507 passing ✅
