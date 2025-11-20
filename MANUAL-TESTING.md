# Manual Testing Guide (Phase 9)

**Purpose**: QA checklist for validating ScopeShield functionality before releases

**When to Use**: Before each Chrome Web Store submission, after major changes

---

## Test Environment Setup

### Prerequisites
1. Chrome browser (latest version)
2. Gmail account with test emails
3. Extension loaded unpacked from `dist/` directory
4. DevTools open (F12) for console monitoring

### Test Data Preparation
1. Create Gmail test thread with scope creep phrases:
   - "Also, can you add user authentication?"
   - "While you're at it, update the color scheme"
   - "One more thing - can you create a report?"
2. Create normal conversation emails (no trigger words)
3. Have test client names ready

---

## Test Scenarios (15 Total)

### Detection Flow (5 tests)

**TEST 1: Gmail Detection**
- [ ] Open Gmail test account
- [ ] Navigate to thread with "Also, can you add..." email
- [ ] **VERIFY**: Yellow highlight appears on trigger phrase (<500ms)
- [ ] **VERIFY**: Browser notification pops up
- [ ] **VERIFY**: Extension badge shows count "1"

**TEST 2: Multiple Detections**
- [ ] Open thread with 3 different trigger phrases
- [ ] **VERIFY**: All 3 phrases highlighted independently
- [ ] **VERIFY**: Badge shows "3"
- [ ] **VERIFY**: No duplicate notifications

**TEST 3: False Positive Prevention**
- [ ] Open email with "Also, thank you for your work"
- [ ] **VERIFY**: NO highlighting (should be excluded)
- [ ] **VERIFY**: NO notification
- [ ] **VERIFY**: Badge count unchanged

**TEST 4: Quoted Text Exclusion**
- [ ] Open email with trigger word in quoted reply
- [ ] **VERIFY**: Quoted text NOT highlighted
- [ ] **VERIFY**: Only body text detected

**TEST 5: Dark Mode Compatibility**
- [ ] Enable Gmail dark mode (Settings → Theme → Dark)
- [ ] Trigger detection
- [ ] **VERIFY**: Yellow highlight visible on dark background
- [ ] **VERIFY**: All UI elements readable

---

### Change Order Generation (5 tests)

**TEST 6: Generate from Detection**
- [ ] Click extension icon with 1+ detections
- [ ] Click detection item
- [ ] Click "Generate Change Order"
- [ ] **VERIFY**: Modal opens within 5 seconds
- [ ] **VERIFY**: Document includes client name, detected text, date
- [ ] **VERIFY**: Pricing calculator shown if hourly rate set

**TEST 7: Multi-Item Selection**
- [ ] Have 3+ detections in list
- [ ] Check 2 detection checkboxes
- [ ] Click "Generate Change Order"
- [ ] **VERIFY**: Document includes both selected items
- [ ] **VERIFY**: Unselected items NOT included

**TEST 8: Manual Creation (No Detections)**
- [ ] Clear all detections (or use fresh install)
- [ ] Click extension icon
- [ ] Click "Manual Change Order" button
- [ ] **VERIFY**: Blank template opens
- [ ] **VERIFY**: All fields editable

**TEST 9: Pricing Calculator**
- [ ] Generate change order
- [ ] Enter hourly rate: $150
- [ ] Enter estimated hours: 8
- [ ] **VERIFY**: Cost updates to "$1,200.00"
- [ ] **VERIFY**: Document updates immediately
- [ ] **VERIFY**: Calculation accurate

**TEST 10: Inline Field Editing (Phase 9)**
- [ ] Generate change order
- [ ] Click cost estimate field
- [ ] Edit value to "$2,500"
- [ ] Click outside field (blur)
- [ ] **VERIFY**: Value updates in document
- [ ] **VERIFY**: Auto-export timer resets (if enabled)
- [ ] **VERIFY**: XSS prevented (try entering `<script>alert('xss')</script>`)

---

### Export Flow (3 tests)

**TEST 11: Copy to Clipboard**
- [ ] Generate change order
- [ ] Click "Copy to Clipboard"
- [ ] **VERIFY**: Success notification appears (<500ms)
- [ ] Paste into text editor (Ctrl+V)
- [ ] **VERIFY**: Full change order text pastes correctly
- [ ] **VERIFY**: Formatting preserved

**TEST 12: Export as PDF**
- [ ] Generate change order
- [ ] Click "Export as PDF"
- [ ] **VERIFY**: PDF downloads within 3 seconds
- [ ] **VERIFY**: Filename matches pattern: `ChangeOrder_<ClientName>_<YYYY-MM-DD>.pdf` (e.g., "ChangeOrder_ClientName_2025-11-20.pdf")
- [ ] Open PDF
- [ ] **VERIFY**: All sections visible, formatting professional

**TEST 13: Export as Text**
- [ ] Generate change order
- [ ] Click "Export as Text"
- [ ] **VERIFY**: Text file downloads
- [ ] **VERIFY**: Plain text format (no HTML)
- [ ] **VERIFY**: Markdown-compatible

---

### Settings & Edge Cases (2 tests)

**TEST 14: Settings Persistence**
- [ ] Open Settings tab
- [ ] Enter name: "Test Freelancer"
- [ ] Set hourly rate: $125
- [ ] Enable auto-export
- [ ] Save settings
- [ ] Close and reopen extension
- [ ] **VERIFY**: All settings persisted

**TEST 15: Missing Client Name (Phase 9)**
- [ ] Generate change order with detection missing sender
- [ ] **VERIFY**: "Client" placeholder appears
- [ ] **VERIFY**: Field has yellow background (#FFF9C4)
- [ ] **VERIFY**: Tooltip shows "Please edit client name"
- [ ] Click to edit, change to "Real Client"
- [ ] **VERIFY**: Yellow highlight removes after edit

---

## Performance Validation

### Timing Checks
- [ ] Generation time: <5s for 10 detections
- [ ] Clipboard copy: <500ms
- [ ] PDF export: <3s
- [ ] Detection latency: <500ms (use DevTools Performance)

### Bundle Size Check
```bash
npm run build
du -sh dist/
```
- [ ] **VERIFY**: Total <600KB

### Console Errors
- [ ] **VERIFY**: Zero errors in DevTools Console during normal operation
- [ ] **VERIFY**: Zero network requests (privacy check)

---

## Test Matrix (Quick Checklist)

| Test # | Feature | Status | Notes |
|--------|---------|--------|-------|
| 1 | Gmail Detection | ⬜ | |
| 2 | Multiple Detections | ⬜ | |
| 3 | False Positive Prevention | ⬜ | |
| 4 | Quoted Text Exclusion | ⬜ | |
| 5 | Dark Mode | ⬜ | |
| 6 | Generate from Detection | ⬜ | |
| 7 | Multi-Item Selection | ⬜ | |
| 8 | Manual Creation | ⬜ | |
| 9 | Pricing Calculator | ⬜ | |
| 10 | Inline Field Editing | ⬜ | Phase 9 |
| 11 | Copy to Clipboard | ⬜ | |
| 12 | Export as PDF | ⬜ | |
| 13 | Export as Text | ⬜ | |
| 14 | Settings Persistence | ⬜ | |
| 15 | Missing Client Name | ⬜ | Phase 9 |

**Pass Criteria**: 15/15 tests passing

---

## Regression Testing

After ANY code changes, run:
1. **Unit tests**: `npm test` (686 tests must pass)
2. **Manual smoke test**: Tests 1, 6, 11 minimum
3. **Full regression**: All 15 tests before Chrome Web Store submission

---

## Bug Reporting Template

```markdown
**Test #**: [1-15]
**Expected**: [What should happen]
**Actual**: [What happened instead]
**Steps to Reproduce**:
1.
2.
3.
**Console Errors**: [Paste from DevTools]
**Screenshot**: [Attach if visual issue]
```

---

**Last Updated**: 2025-11-20 (Phase 9)
**Test Coverage**: Spec 001 (Detection) + Spec 002 (Change Orders)
**Next**: Create automated E2E tests (Spec 005 - after 100 users)
