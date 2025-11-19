# Feature 005: E2E Test Automation (BACKLOG)

**Status**: Planned (Not Started)
**Created**: 2025-11-19
**Trigger**: 100+ active users OR manual testing >1 hour per release
**Priority**: HIGH (testing efficiency)
**Dependencies**: Feature 001, 002 stable
**Estimated Effort**: 20-25 hours
**Constitutional Alignment**: Quality-First Principle (Phase 2: E2E testing at 100-1K users)

---

## Problem Statement

Manual testing following PHASE3-MANUAL-TESTING-GUIDE.md takes **30 minutes per release**:
- Load extension in Chrome
- Navigate to Gmail test account
- Trigger scope creep detection
- Verify highlighting
- Open popup, check detections
- Generate change order
- Test calculator, export (PDF, clipboard, text)
- Verify all 15 test scenarios

**Impact**:
- Time-consuming (30 min × 10 releases/month = 5 hours/month)
- Error-prone (easy to skip steps)
- Not scalable (>100 users need regression testing)
- Blocks rapid iteration

---

## Proposed Solution

**Puppeteer-Based E2E Test Suite:**

1. **Setup**: Puppeteer with Chrome extension loading
2. **Gmail Flow**: Navigate to Gmail, inject test emails
3. **Detection Flow**: Verify content script highlights scope creep
4. **Popup Flow**: Open extension, verify detection count
5. **Change Order Flow**: Generate, edit calculator, verify document updates
6. **Export Flow**: Test PDF, clipboard, text exports
7. **Settings Flow**: Modify settings, verify persistence

**Test Execution**: 5 minutes (vs 30 min manual)

**Scope** (Phased Rollout):
- **Phase 1** (100-1K users): 5 smoke tests (critical paths only)
- **Phase 2** (1K-10K users): 15-20 tests (full regression suite)
- **Phase 3** (10K+ users): Visual regression (screenshot comparison)

---

## Constitutional Alignment

**Principle VI: Quality-First (Phased TDD)**

From constitution:
```markdown
Phase 1 (0-100 users): Manual testing acceptable
Phase 2 (100-1K users): Add E2E smoke tests (critical paths)
Phase 3 (1K-10K users): Full E2E regression suite
```

**Current Status** (2025-11-19): 0 users → Phase 1 (manual testing)

**Do NOT implement until:** User count >100 OR manual testing becomes unsustainable (>1 hour/release)

---

## User Stories

### User Story 1 (P1): Gmail→Detection→Popup Smoke Test
As a **developer**, I need **automated Gmail flow test** so that **critical detection path is validated in <2 minutes**.

**Acceptance Criteria**:
- Test navigates to Gmail, injects scope creep email
- Verifies highlighting appears within 500ms
- Opens popup, verifies detection count = 1
- Execution time <2 minutes

### User Story 2 (P2): Change Order Generation E2E
As a **developer**, I need **automated change order test** so that **export flow is validated without manual clicking**.

**Acceptance Criteria**:
- Test clicks "Generate Change Order"
- Adjusts calculator (rate: $150, hours: 8)
- Verifies document updates with new pricing
- Tests all 3 export methods (PDF, clipboard, text)
- Execution time <3 minutes

### User Story 3 (P3): CI Integration
As a **developer**, I need **E2E tests in GitHub Actions** so that **PRs are validated automatically**.

**Acceptance Criteria**:
- E2E tests run on every PR
- Tests run in headless Chrome
- PR blocked if E2E tests fail
- Results posted as PR comment

---

## Technical Approach

### Tools & Libraries

**Primary**: Puppeteer (Chrome extension support)
```javascript
import puppeteer from 'puppeteer';

const browser = await puppeteer.launch({
  headless: false,
  args: [
    `--disable-extensions-except=${extensionPath}`,
    `--load-extension=${extensionPath}`
  ]
});
```

**Reference Pattern**: PayPlan Feature 063
- **What it did**: Set up comprehensive test infrastructure (168 tests, 85%+ coverage)
- **Lessons**: Start small (5 tests), expand incrementally, keep execution <15s
- **Pattern**: Smoke tests first, full regression later

**Alternative**: Manual Testing Assistant skill (if available)
- Interactive testing with browser automation
- Screenshot comparison
- Console monitoring

---

## Success Criteria

- **SC-001**: E2E test suite executes in <5 minutes (vs 30min manual)
- **SC-002**: 100% critical path coverage (Gmail→Detection→Popup→Export)
- **SC-003**: CI integration runs on every PR
- **SC-004**: Tests catch 90%+ of UI regressions
- **SC-005**: Test maintenance <1 hour per month

---

## Implementation Phases (When Triggered)

### Phase 1: Smoke Tests (5-8 hours)
- Setup Puppeteer with extension loading
- Test 1: Gmail detection flow
- Test 2: Popup display
- Test 3: Change order generation
- Test 4: PDF export
- Test 5: Settings persistence

### Phase 2: Full Regression (8-10 hours)
- Add 10-15 additional test scenarios
- Edge cases (empty data, max length, special chars)
- Error handling paths
- All export methods

### Phase 3: CI Integration (3-5 hours)
- GitHub Actions workflow
- Headless Chrome setup
- Artifact upload (screenshots, PDFs)
- PR comment reporting

### Phase 4: Visual Regression (4-6 hours)
- Screenshot comparison
- Pixel-diff thresholds
- Baseline image management

---

## Launch Gates

**DO NOT IMPLEMENT until:**

1. **100+ active users**: Testing burden justifies automation investment
2. **Manual testing >1 hour**: Current 30min acceptable, automation overhead not worth it yet
3. **Multiple test failures per release**: Manual testing error rate >10%

**Current Status**: Manual testing is working fine, defer until scale demands it.

**Monitoring**: Track manual testing time per release. When it exceeds 1 hour, trigger Feature 005.

---

## References

- **PayPlan Feature 063**: Test Suite Infrastructure (19.9 hours, 168 tests, 11.47s execution)
- **Spec-Kit Phased TDD**: E2E testing deferred to Phase 2 (100-1K users)
- **Constitutional Principle VI**: Quality-First with phased rollout

---

**Next Steps When Triggered**:
1. Run `/speckit.specify` for full E2E automation spec
2. Research Puppeteer + chrome-extension testing patterns
3. Start with 3 smoke tests (minimal viable E2E)
4. Expand incrementally based on failure patterns
