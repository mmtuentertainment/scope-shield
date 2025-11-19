# Phase 7: Draft Persistence & History - Rehydration Prompt

**Context Date**: 2025-11-19
**Current Branch**: `main` (PR #12 merged - Phase 6 complete!)
**Test Status**: ✅ 543/543 tests passing
**Phases Complete**: 1-6 (45% overall, 85-100% per phase)

---

## 🎯 Mission: Implement Phase 7 Draft Persistence & History

**User Stories**:
- As a freelancer who closes the popup mid-edit, I want my draft saved so I don't lose work
- As a freelancer generating multiple change orders, I want to see my export history for reference
- As a freelancer with repeat clients, I want quick access to past change orders

**Value**: Prevents data loss (draft auto-save) + provides audit trail (export history) + enables workflow continuity

---

## 📊 Current Status (Post-Audit Accuracy)

### Phases 1-6 Completion (Updated 2025-11-19)

**Overall**: 45% complete (167/374 tasks)

| Phase | Status | Notes |
|-------|--------|-------|
| **Phase 1-2** | 97% ✅ | Foundation + Settings |
| **Phase 3** | 85% ✅ | Template engine complete, history deferred to Phase 7 |
| **Phase 4** | 95% ✅ | Calculator widget complete |
| **Phase 5** | 96% ✅ | PDF, Clipboard, Text export ALL working |
| **Phase 6** | 100% ✅ | Auto-export timer with 5-second countdown |
| **Phase 7** | 0% ⏳ | **← YOU ARE HERE** |

**Key Insight**: Phases 3-6 are substantially complete. The "58%, 39%, 0%" from old tasks.md was inaccurate - features ARE working, tasks just weren't marked complete.

---

## 📦 What's Already Built (Verified Working)

### ✅ Complete Export System (Phase 5 - 96% Complete)

**ALL export services exist and work:**

1. **PDFGenerator.js** ✅
   ```javascript
   await PDFGenerator.generatePDF(text, metadata);
   // Creates professional PDF with jsPDF
   // Downloads as: ChangeOrder_ClientName_2025-11-19.pdf
   ```

2. **ClipboardExport.js** ✅
   ```javascript
   await ClipboardExport.copyToClipboard(text);
   // Copies formatted text to clipboard
   // Uses navigator.clipboard.writeText()
   ```

3. **TextExport.js** ✅
   ```javascript
   await TextExport.downloadAsText(text, metadata);
   // Downloads plain text file
   ```

4. **ExportService.js** ✅ (Orchestrator)
   ```javascript
   const result = await ExportService.export(text, method, metadata);
   // method: 'pdf' | 'clipboard' | 'text'
   // Returns: {success: boolean, error?: string}
   ```

5. **ExportControls.js** ✅ (UI Component)
   - 3 buttons: Copy, PDF, Text
   - Loading states, success/error notifications
   - Integrated in ChangeOrderModal

**Tests**: 20 tests for export services, all passing

---

### ✅ Auto-Export System (Phase 6 - 100% Complete)

1. **AutoExportTimer.js** ✅ (216 lines)
   - 5-second countdown (user feedback: less panic-inducing than 3s)
   - start(), cancel(), reset(), destroy()
   - Continuous auto-export on calculator edits
   - 36 comprehensive tests

2. **Modal Integration** ✅
   - Countdown notification with accessibility (ARIA)
   - Click-to-cancel (anywhere in modal)
   - Toast notifications (z-index fixed above modal)
   - Settings integration (enabled/disabled, delay, method)

3. **File Structure** ✅ (Code Standards Compliant)
   - ChangeOrderModal.js: 329 lines (was 571)
   - ChangeOrderModalIntegrations.js: 262 lines (extracted)
   - Modular design ready for Phase 7-9 growth

---

### ✅ Storage Infrastructure (Ready for Phase 7)

1. **SettingsStorage.js** ✅
   - Pattern to follow for DraftStorage
   - get(), save(), validate()
   - FreelancerSettings model with autoExportEnabled, autoExportDelay

2. **DetectionEventsStorage.js** ✅
   - Pattern to follow for ExportHistoryStorage
   - Array storage with CRUD
   - getAll(), save(), delete()

3. **StorageSchemas.js** ✅
   - Versioned schemas (v1.0)
   - Default values
   - Migration helpers (if needed)

4. **localStorage Quota**: 5MB available
   - Current usage: ~50-100KB (settings + detections)
   - Headroom: ~4.9MB for drafts + history

---

## 🚧 What Needs to Be Built (Phase 7 - 35 Tasks)

### Component 1: DraftStorage (T213-T224) - 2-3 hours

**NEW FILE**: `src/lib/change-order/DraftStorage.js`

**Purpose**: Auto-save change order drafts on popup close, restore on reopen

**API**:
```javascript
class DraftStorage {
  static async save(draftData) {
    // Save to: scopeshield_draft_changeorder_v1
    // Data: {text, rate, hours, metadata, savedAt}
  }

  static async load() {
    // Returns: draft object or null
  }

  static async delete() {
    // Remove draft
  }

  static async cleanOldDrafts() {
    // Delete drafts >7 days old
  }

  static async hasDraft() {
    // Fast boolean check for UI
  }
}
```

**Integration Points**:
- `popup.js`: Add `window.onbeforeunload` → save draft
- `popup.js`: On initialize() → check hasDraft() → show "Resume Draft" button
- `DetectionEventHandlers.js`: After export success → delete draft
- Run cleanOldDrafts() on every popup open (background cleanup)

**Tests**: DraftStorage.test.js (12 tasks: T222-T224, etc.)

---

### Component 2: Export History (T232-T240) - 2-3 hours

**NEW FILE**: `src/lib/storage/ExportHistoryStorage.js`

**Purpose**: Track every export for audit trail

**Data Model**:
```javascript
{
  id: 'uuid-v4',
  changeOrderId: 'CO-001' (if available),
  clientName: 'Acme Corp',
  exportMethod: 'pdf' | 'clipboard' | 'text',
  exportedAt: '2025-11-19T12:00:00Z',
  metadata: { freelancerName, totalCost }
}
```

**API**:
```javascript
ExportHistoryStorage.save(exportEvent);
ExportHistoryStorage.getAll(); // Last 100
ExportHistoryStorage.getByClient(clientName);
```

**NEW FILE**: `src/popup/history/ExportHistoryView.js`

**UI Component**: Display export history in popup

**Features**:
- Chronological list (most recent first)
- Last 100 entries (FIFO deletion)
- Click entry → view change order details (read-only modal)
- "History" tab in popup navigation

**Integration Point**:
- `ExportService.js`: After successful export → `ExportHistoryStorage.save(event)`

**Tests**: ExportHistoryStorage.test.js, history view tests

---

### Component 3: History Management (T225-T231) - 1-2 hours

**ENHANCEMENT**: `src/lib/change-order/ChangeOrderHistory.js` (if exists, or create)

**Purpose**: Store change orders with 50-order limit per client

**Features**:
- FIFO deletion (oldest removed when saving 51st)
- Index by clientEmail for fast queries
- getLastForClient(email) → pre-fill original scope
- getAllForClient(email) → client history view

**Note**: May be deferred further if not needed for MVP. Primary Phase 7 focus is **draft persistence + export history**.

---

## 📋 Implementation Tasks (T213-T246, 35 tasks)

### Priority 1: Draft Persistence (MUST HAVE)
- T213-T224: DraftStorage + tests (12 tasks)
- **Why first**: Prevents data loss, highest user value

### Priority 2: Export History (SHOULD HAVE)
- T232-T240: ExportHistoryStorage + UI (9 tasks)
- **Why second**: Audit trail, nice-to-have but not critical

### Priority 3: Change Order History (COULD DEFER)
- T225-T231: ChangeOrderHistory enhancements (7 tasks)
- **Why last**: Pre-fill feature, defer if time-constrained

**Recommendation**: Implement Priorities 1-2 (draft + export history), defer Priority 3 to Phase 8 if needed.

---

## 🚀 Getting Started - Use Spec-Kit Mastery

### Step 1: Activate Spec-Kit Guidance

```bash
Use spec-kit-mastery skill to guide Phase 7 implementation
```

**Why**: Provides deferred enhancements pattern, storage strategies, test-first guidance

### Step 2: Explore Current Architecture

```
Use Task tool with Explore agent to:
1. Understand popup.js lifecycle (where to add beforeunload listener)
2. Review ExportService.js (where to add history logging)
3. Check DetectionEventsStorage pattern (array storage for history)
4. Map ChangeOrderModal state extraction (what to save in draft)
```

### Step 3: Implement in Parallel

**Track A: Draft Persistence**
```
Create in parallel:
1. DraftStorage.js (service)
2. DraftStorage.test.js (tests)
3. popup.js modifications (beforeunload, Resume Draft button)
```

**Track B: Export History**
```
Create in parallel:
1. ExportHistoryStorage.js (service)
2. ExportHistoryView.js (UI)
3. history.css (styling)
4. ExportService.js integration (log events)
```

**All parallel!** Complete in 1 iteration instead of 6.

---

## ✅ Acceptance Criteria

### Functional
1. ✅ Draft saves when popup closes (no user action required)
2. ✅ "Resume Draft" button appears if draft exists
3. ✅ Draft loads with all calculator values + document text
4. ✅ Draft deletes after successful export
5. ✅ Old drafts (>7 days) auto-delete
6. ✅ Every export creates history entry
7. ✅ History view shows last 100 exports, chronological
8. ✅ Clicking history entry shows change order (read-only)

### Performance
1. ✅ Draft save: <100ms (non-blocking)
2. ✅ Draft load: <200ms
3. ✅ History view: <500ms (100 entries)
4. ✅ localStorage: <5MB total

### Quality
1. ✅ 543+ tests passing (0 regressions)
2. ✅ New tests: ≥20 (draft + history coverage)
3. ✅ Manual testing: Draft → close → reopen → resume works
4. ✅ Quota exceeded handled gracefully

---

## ⚠️ Common Pitfalls

1. **Blocking popup close**: Don't await save in beforeunload (fire-and-forget)
2. **Stale drafts**: Run cleanOldDrafts() on EVERY popup open
3. **Quota exceeded**: Handle gracefully, delete oldest history entries
4. **Draft conflicts**: Confirm before discarding unsaved draft
5. **History duplicates**: Accept them (audit trail shows all exports)

---

## 🎬 Kick-Off Prompt

```
Implement Phase 7 of ScopeShield spec 002: Draft Persistence & History

CONTEXT:
- Phases 1-6 complete (45% overall, 167/374 tasks)
- Phase 5: ALL export services working (PDF, clipboard, text)
- Phase 6: Auto-export timer complete (5-second countdown)
- 543 tests passing, 0 regressions

GOAL:
Add draft auto-save + export history tracking (35 tasks: T213-T246)

APPROACH:
1. Activate spec-kit-mastery skill
2. Use Explore agent to understand popup lifecycle + ExportService integration
3. Create DraftStorage + ExportHistoryStorage in parallel
4. Integrate: popup beforeunload, Resume Draft button, History view
5. Test: Draft persistence + export history tracking
6. Manual verify: Close mid-edit → reopen → resume workflow

REQUIREMENTS:
- Read specs/002/.../plan.md Phase 7 section
- Follow SettingsStorage pattern for DraftStorage
- Follow DetectionEventsStorage pattern for ExportHistoryStorage
- Draft save <100ms (non-blocking popup close)
- All 543 tests must still pass

Ready to start Phase 7!
```

---

**Last Updated**: 2025-11-19 (Post-Audit)
**Accuracy**: Based on verified task completion status
**Test Status**: 543/543 passing ✅
**Phase 6 Status**: COMPLETE ✅ (PR #12 merged)
**Next**: Phase 7 (Draft + History) - 35 tasks, 5-8 hour estimate
