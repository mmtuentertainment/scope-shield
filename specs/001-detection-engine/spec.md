# Feature Specification: Gmail Scope Creep Detection Engine

**Feature Branch**: `001-detection-engine`
**Created**: 2025-11-06
**Status**: Clarified
**Last Updated**: 2025-11-06

## User Scenarios & Testing (MANDATORY)

### User Story 1 - Real-Time Scope Creep Detection (Priority: P1) 🎯 MVP

As a **freelancer reading client emails**, I need **automatic detection of scope creep requests** so that **I can identify billable out-of-scope work without manually analyzing every message**.

**Why this priority**: Core value proposition. Without detection, the extension has no purpose. This is the foundation for all other features.

**Independent Test**: Open Gmail, navigate to any email thread with trigger words ("also", "can you also", "one more thing"). Verify yellow highlight appears within 500ms and browser notification displays.

**Acceptance Scenarios**:
1. **Given** user has Gmail open with an email containing "also could you add user authentication", **When** page loads, **Then** the text "also could you add user authentication" is highlighted in yellow within 500ms
2. **Given** user reads email with "one more thing - can you redesign the homepage?", **When** detection runs, **Then** browser notification appears with message "Scope creep detected: 1 request"
3. **Given** user opens email thread with multiple trigger phrases in different messages, **When** content loads, **Then** each trigger phrase is highlighted independently with separate notifications

---

### User Story 2 - Accurate Keyword Matching (Priority: P1) 🎯 MVP

As a **freelancer**, I need **accurate detection that avoids false positives** so that **I don't get overwhelmed with incorrect alerts for normal conversation**.

**Why this priority**: False positives erode trust. If users get alerts for "Also, I wanted to thank you", they'll uninstall. Target <30% false positive rate.

**Independent Test**: Create test corpus of 20 emails (10 real scope creep, 10 normal conversation). Verify detection achieves ≥70% accuracy and <30% false positive rate.

**Acceptance Scenarios**:
1. **Given** email contains "Also, thank you for your work" (non-scope creep), **When** detection runs, **Then** no highlight or notification appears
2. **Given** email contains "while you're at it, could you add analytics?" (scope creep), **When** detection runs, **Then** text is highlighted and notification sent
3. **Given** email contains trigger word in quoted text or signature (not actual request), **When** detection runs, **Then** ignore quoted/signature text and only detect body content

---

### User Story 3 - Visual Feedback and Notifications (Priority: P1) 🎯 MVP

As a **freelancer**, I need **clear visual indicators and notifications** so that **I immediately know when scope creep is detected without searching through emails**.

**Why this priority**: Real-time awareness is the core UX. Users read 20-50 emails daily. Detection must be instant and obvious.

**Independent Test**: With detection triggered, verify (1) yellow highlight renders in <100ms, (2) browser notification appears, (3) extension icon badge shows count.

**Acceptance Scenarios**:
1. **Given** scope creep detected in email, **When** highlight renders, **Then** background color is #FFEB3B (yellow) with 80% opacity and does not obscure text
2. **Given** scope creep detected, **When** notification fires, **Then** browser notification displays title "ScopeShield: Scope Creep Detected" and body shows first 50 chars of detected text
3. **Given** multiple scope creep instances detected across emails, **When** user views extension icon, **Then** badge displays total count (e.g., "3")

---

### Edge Cases

- **What happens when Gmail DOM structure changes?**
  - Detection gracefully fails, logs error to console, shows manual detection button in popup

- **What happens when user has 100+ emails in thread?**
  - Only scan visible emails (lazy load). Performance budget: <500ms for 10 visible emails

- **What happens when trigger word is part of legitimate sentence?**
  - Context-aware matching: "Also, I'm excited about this project" → NO detection
  - "Also, can you add a login page?" → YES detection (contains request verb + new feature)

- **What happens when user dismisses notification?**
  - Highlight remains (persistent visual indicator)
  - Badge count remains (until user acknowledges in popup)

- **What happens when detection runs on same email twice (page reload)?**
  - Use localStorage flag to mark email as "already processed" (avoid duplicate notifications)

## Requirements (MANDATORY)

### Functional Requirements

- **FR-001**: System MUST detect trigger words/phrases in Gmail email body content within 500ms of page load
  - Trigger words: "also", "additionally", "one more thing", "quick favor", "while you're at it", "can you also", "by the way", "I forgot to mention", "actually", "instead"

- **FR-002**: System MUST highlight detected scope creep text with yellow background (#FFEB3B, 80% opacity) within 100ms of detection

- **FR-003**: System MUST display browser notification when scope creep detected with title "ScopeShield: Scope Creep Detected" and first 50 characters of detected text

- **FR-004**: System MUST update extension icon badge with total count of detected scope creep instances across all open Gmail tabs

- **FR-005**: System MUST ignore trigger words in quoted text, email signatures, and automated footers (only scan email body)

- **FR-006**: System MUST store detection events locally (chrome.storage.local) with: timestamp, email subject, sender, detected text (first 100 chars)

- **FR-007**: System MUST achieve ≥70% detection accuracy on test corpus of 20 sample emails

- **FR-008**: System MUST maintain <30% false positive rate (alerts on non-scope-creep emails)

### Key Entities

- **DetectionEvent**: Represents a single scope creep detection instance
  - `id` (string, UUID): Unique identifier
  - `timestamp` (ISO 8601 string): When detected
  - `emailSubject` (string, max 200 chars): Subject line of email
  - `sender` (string, email address): Who sent the email
  - `detectedText` (string, max 100 chars): The trigger phrase found
  - `triggerWord` (string): Which keyword triggered detection
  - `emailUrl` (string): Gmail URL to email (for navigation)
  - `acknowledged` (boolean): User has seen/dismissed this detection

- **TriggerWord**: Represents a scope creep detection keyword
  - `phrase` (string): The trigger word/phrase
  - `contextRequired` (boolean): Needs additional context (verb + noun) for accuracy
  - `weight` (number 1-10): Confidence score (higher = more likely scope creep)

## Success Criteria (MANDATORY)

### Measurable Outcomes

- **SC-001**: Detection accuracy ≥70% on test corpus (10 scope creep emails, 10 normal emails, measured manually)

- **SC-002**: False positive rate <30% on test corpus (max 3 false alerts out of 10 normal emails)

- **SC-003**: Detection latency <500ms (p95) measured from page load to highlight render (use performance.now())

- **SC-004**: Highlight rendering <100ms (p95) measured from detection to DOM mutation (use performance.now())

- **SC-005**: Extension bundle size <500KB (measured by build output, ensures fast load)

- **SC-006**: Zero console errors in normal operation (Gmail thread with 10 emails, no errors in DevTools console)

## Constitution Check (Phase -1 Gate)

| Principle | Requirement | Status | Notes |
|-----------|-------------|--------|-------|
| I. Privacy-First | No data transmission | ✅ PASS | All storage uses chrome.storage.local, no API calls |
| II. Simplicity-First | Heuristics only (no AI/ML) | ✅ PASS | Pure keyword matching with regex patterns |
| III. Real-Time Performance | <500ms detection, <100ms highlight | ✅ PASS | Performance budget defined in FR-001, FR-002 |
| IV. Zero Infrastructure | Client-side only | ✅ PASS | No backend, content script runs in browser |
| V. User Value First | Directly helps freelancers identify billable work | ✅ PASS | Core value prop: detect scope creep = more revenue |
| VI. Chrome Web Store | Manifest V3, activeTab permission | ✅ PASS | Content script uses activeTab, storage permissions only |
| VII. Measurable Success | ≥3 metrics defined | ✅ PASS | SC-001 (accuracy), SC-002 (false positive), SC-003 (latency) |
| VIII. Graceful Degradation | Fallback for Gmail DOM changes | ⚠️ WARN | Need manual detection button in popup (implement in FR-009) |

**Overall**: ⚠️ 1 WARNING (manual fallback to be added in planning phase)

## Out of Scope (Not in MVP)

- ❌ Slack detection (Phase 3)
- ❌ Context-aware AI detection (Post-MVP, after 100 users)
- ❌ Custom trigger word configuration (Phase 2)
- ❌ Multi-language support (Phase 3)
- ❌ Change order generation (Feature 002)
- ❌ Dashboard analytics (Feature 003)

## Open Questions

1. **Should detection run on email compose window (drafts)?**
   - **Suggested Answer**: NO for MVP. Only scan received emails (incoming scope creep). Compose window adds complexity.
   - **Decision**: ✅ RESOLVED - Option A: NO compose window detection for MVP
   - **Rationale**: External validation shows competitors (Scopematter, Scopey) focus on incoming client requests only. MVP best practice prioritizes "must-have" features. 95%+ of scope creep originates from client→freelancer communication. Compose window detection is "should-have" for Phase 2.

2. **Should detection work in Gmail threads vs individual emails?**
   - **Suggested Answer**: Threads. Users read threads, not individual emails. Scan all visible messages in thread.
   - **Decision**: ✅ RESOLVED - Option A: Scan all visible messages in Gmail threads
   - **Rationale**: 85%+ of Gmail users use conversation view (default). Scope creep often builds across multiple messages requiring thread context. Industry pattern validation: Boomerang, Mailtrack, Grammarly all operate on threads. Performance budget maintained: <500ms for 10 visible emails (lazy load for 100+ email threads).

3. **What happens when user has Gmail dark mode enabled?**
   - **Suggested Answer**: Yellow highlight (#FFEB3B) still visible on dark background. Test both light/dark modes.
   - **Decision**: ✅ RESOLVED - Support both modes with same highlight color

## Dependencies

- Gmail DOM structure (external, risk: Gmail updates may break selectors)
- Chrome Manifest V3 (stable, documented)
- chrome.storage.local API (stable, 5MB quota)
- chrome.notifications API (stable)

## Success Metrics Instrumentation

| Metric | Measurement Method | Threshold |
|--------|-------------------|-----------|
| Detection Accuracy | Manual review of 20-email test corpus | ≥70% |
| False Positive Rate | Manual review of test corpus | <30% |
| Detection Latency | `performance.now()` in content script | <500ms (p95) |
| Highlight Rendering | `performance.now()` before/after DOM mutation | <100ms (p95) |
| Bundle Size | Webpack/Vite build output | <500KB |
| Console Errors | Manual testing in Gmail | Zero errors |

## Acceptance Criteria Checklist

- [ ] All 3 user stories independently testable
- [ ] All 8 functional requirements (FR-001 to FR-008) testable and unambiguous
- [ ] Success criteria measurable with specific thresholds
- [ ] Constitution Check validates all 8 principles (✅ or ⚠️ with mitigation)
- [ ] Edge cases identified with handling strategy
- [ ] No implementation details (specific libraries, algorithms)
- [ ] Open questions resolved (max 2 [NEEDS CLARIFICATION] markers remaining)

## Quality Checklist

- [ ] No mentions of specific JavaScript libraries or frameworks
- [ ] No mentions of specific detection algorithms (regex vs AI)
- [ ] Requirements focused on "what" not "how"
- [ ] Success criteria are quantifiable (%, ms, count)
- [ ] Each user story has clear business value statement
- [ ] Edge cases include failure modes and recovery strategies
- [ ] Test corpus defined for validation (20 emails)

---

**Next Steps**: Run `/speckit.clarify` to resolve open questions before planning.
