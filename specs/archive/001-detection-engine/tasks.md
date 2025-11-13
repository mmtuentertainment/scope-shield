# Tasks: Gmail Scope Creep Detection Engine

**Feature**: 001-detection-engine
**Created**: 2025-11-06
**Status**: Ready for Implementation
**Spec**: [spec.md](spec.md)
**Plan**: [plan.md](plan.md)

## Task Format

- `- [ ]` Checkbox for tracking completion
- `[TaskID]` Sequential identifier (T001, T002, etc.)
- `[P]` Parallel marker - tasks that can be executed simultaneously (different files, no dependencies)
- `[USX]` User story label - marks tasks for specific user stories
- Description with exact file path

---

## Phase 1: Setup & Configuration

Foundation tasks that block all user stories. Must be completed sequentially.

- [ ] T001 Install project dependencies (`npm install`) in scope-shield/
- [ ] T002 Create feature branch `git checkout -b 001-detection-engine`
- [ ] T003 Update manifest.json to add content_scripts configuration for Gmail in src/manifest.json
- [ ] T004 Create basic project structure directories: src/content/, src/utils/, src/background/, src/types/, tests/utils/
- [ ] T005 Configure Vite build to handle Chrome extension structure in vite.config.js

---

## Phase 2: Foundational Components (BLOCKS all user stories)

Core infrastructure required before implementing any user story. Some tasks can run in parallel.

- [ ] T006 Create Chrome storage wrapper utility in src/utils/storage.js
- [ ] T007 [P] Create DetectionEvent entity type definition in src/types/detection-event.js
- [ ] T008 [P] Create Gmail DOM selector constants in src/content/gmail-dom.js
- [ ] T009 [P] Create debounce utility function in src/utils/helpers.js
- [ ] T010 Create trigger word patterns configuration in src/utils/trigger-words.js
- [ ] T011 Create UUID generator utility for event IDs in src/utils/uuid.js
- [ ] T012 [P] Create basic background service worker structure in src/background/service-worker.js

---

## Phase 3: User Story 1 - Real-Time Detection (P1) 🎯 MVP

[US1] As a freelancer, I need automatic detection of scope creep requests.

- [ ] T013 [US1] Create detector.js with detectScopeCreep() function in src/utils/detector.js
- [ ] T014 [US1] Implement regex pattern matching for high-confidence triggers (also + action verb) in src/utils/detector.js
- [ ] T015 [US1] Implement regex pattern matching for medium-confidence triggers (while you're at it) in src/utils/detector.js
- [ ] T016 [US1] Implement regex pattern matching for low-confidence triggers (requires context) in src/utils/detector.js
- [ ] T017 [US1] Create content.js main content script structure in src/content/content.js
- [ ] T018 [US1] Implement MutationObserver with 300ms debounce in src/content/content.js
- [ ] T019 [US1] Implement scanMessages() function to process Gmail thread messages in src/content/content.js
- [ ] T020 [US1] Implement extractMessageText() to get clean text (ignore quotes/signatures) in src/content/content.js
- [ ] T021 [US1] Connect detector to content script for real-time scanning in src/content/content.js
- [ ] T022 [US1] [P] Write unit tests for detectScopeCreep() with 20-email corpus in tests/utils/detector.test.js
- [ ] T023 [US1] [P] Write unit tests for trigger word patterns (all 8 patterns) in tests/utils/trigger-words.test.js

**Checkpoint**: User Story 1 independently testable - Load extension in Gmail, emails with trigger words should be detected

---

## Phase 4: User Story 2 - Accurate Matching (P1) 🎯 MVP

[US2] As a freelancer, I need accurate detection that avoids false positives.

- [ ] T024 [US2] Implement exclusion patterns for gratitude phrases ("thank you") in src/utils/detector.js
- [ ] T025 [US2] Implement exclusion for questions without action verbs in src/utils/detector.js
- [ ] T026 [US2] Implement quoted text detection and filtering in src/content/content.js
- [ ] T027 [US2] Implement Gmail signature detection and filtering in src/content/content.js
- [ ] T028 [US2] Add context extraction (10 words before/after match) in src/utils/detector.js
- [ ] T029 [US2] Implement trigger weight scoring system (1-10 confidence) in src/utils/detector.js
- [ ] T030 [US2] [P] Create test corpus of 20 emails (10 scope creep, 10 normal) in tests/fixtures/test-emails.js
- [ ] T031 [US2] [P] Write accuracy validation tests (≥70% detection, <30% false positive) in tests/utils/detector.test.js

**Checkpoint**: User Story 2 independently testable - Run tests, verify 70%+ accuracy and <30% false positives

---

## Phase 5: User Story 3 - Visual Feedback (P1) 🎯 MVP

[US3] As a freelancer, I need clear visual indicators and notifications.

- [ ] T032 [US3] Create highlighter.js with highlightText() function in src/content/highlighter.js
- [ ] T033 [US3] Create content.css with yellow highlight styles (#FFEB3B, 80% opacity) in src/content/content.css
- [ ] T034 [US3] Implement DOM text node wrapping with <span> for highlighting in src/content/highlighter.js
- [ ] T035 [US3] Test highlight visibility in both Gmail light and dark modes in src/content/content.css
- [ ] T036 [US3] Implement browser notification creation in src/background/service-worker.js
- [ ] T037 [US3] Create notification click handler to open popup in src/background/service-worker.js
- [ ] T038 [US3] Implement badge count update on extension icon in src/background/service-worker.js
- [ ] T039 [US3] Create message passing between content script and background worker in src/content/content.js
- [ ] T040 [US3] Implement saveDetectionEvent() with DetectionEvent creation in src/utils/storage.js
- [ ] T041 [US3] [P] Create basic popup.html structure in src/popup/popup.html
- [ ] T042 [US3] [P] Create popup.js to display detection events in src/popup/popup.js
- [ ] T043 [US3] [P] Create popup.css with basic styles in src/popup/popup.css

**Checkpoint**: User Story 3 independently testable - Trigger detection, verify yellow highlight + notification + badge

---

## Phase 6: Storage & Quota Management

Cross-cutting concerns that enhance all user stories.

- [ ] T044 Implement FIFO rotation at 80% quota (delete oldest 200 events) in src/utils/storage.js
- [ ] T045 Implement quota checking every 10th write (performance optimization) in src/utils/storage.js
- [ ] T046 Implement event acknowledgment status updates in src/popup/popup.js
- [ ] T047 Create getDetectionEvents() with sorting by timestamp in src/utils/storage.js
- [ ] T048 Create groupEventsByThread() for threaded display in src/popup/popup.js
- [ ] T049 [P] Write storage wrapper unit tests with mock chrome.storage.local in tests/utils/storage.test.js

---

## Phase 7: Performance Optimization

Ensure all performance targets are met.

- [ ] T050 Add performance.now() timing to detectScopeCreep() in src/utils/detector.js
- [ ] T051 Add performance.now() timing to highlight rendering in src/content/highlighter.js
- [ ] T052 Implement lazy loading for threads with >10 messages in src/content/content.js
- [ ] T053 Add performance metrics collection in background worker in src/background/service-worker.js
- [ ] T054 Calculate and log p95 latency metrics in src/background/service-worker.js
- [ ] T055 [P] Create performance benchmark test suite in tests/performance/benchmark.test.js

---

## Phase 8: Error Handling & Graceful Degradation

Implement fallbacks for failure scenarios.

- [ ] T056 Add try-catch error handling to detectScopeCreep() in src/utils/detector.js
- [ ] T057 Implement Gmail DOM selector fallback chain (data-* → ARIA → CSS) in src/content/gmail-dom.js
- [ ] T058 Add console error logging with [ScopeShield] prefix throughout all modules
- [ ] T059 Handle chrome.storage.local quota exceeded errors in src/utils/storage.js
- [ ] T060 Add debug mode toggle via localStorage in src/content/content.js

---

## Phase 9: Testing & Validation

Final testing to ensure all success criteria are met.

- [ ] T061 Manual test: Gmail thread with 10 emails loads in <500ms
- [ ] T062 Manual test: Yellow highlight appears in <100ms after detection
- [ ] T063 Manual test: Browser notifications display correctly
- [ ] T064 Manual test: Extension works offline (disconnect internet)
- [ ] T065 Run full test suite: `npm test` (verify 80%+ coverage)
- [ ] T066 Build extension: `npm run build` (verify bundle <500KB)
- [ ] T067 Load unpacked extension in Chrome and test on real Gmail account
- [ ] T068 Validate 70%+ accuracy on 20-email test corpus
- [ ] T069 Document any remaining issues or edge cases in README.md

---

## Dependencies & Execution Order

### Sequential Dependencies
```
Phase 1 (Setup) → Phase 2 (Foundational) → User Stories can run in parallel
T001 → T002 → T003 → T004 → T005 (must run in order)
T006 (storage) → T040 (saveDetectionEvent)
T010 (trigger words) → T013-T016 (detector implementation)
```

### Parallel Opportunities
```
After Phase 2 complete:
- [US1] T013-T023 (Detection logic)
- [US2] T024-T031 (Accuracy improvements)
- [US3] T032-T043 (Visual feedback)
Can all run simultaneously (different modules)

Within phases:
- Tasks marked [P] can run in parallel
- Different test files can be written simultaneously
```

### Critical Path
```
Shortest path to working MVP:
T001-T005 (Setup) → T006-T012 (Foundation) → T013-T021 (US1 Detection) → T032-T039 (US3 Visual)
= Minimum 26 tasks for basic working extension
```

---

## Task Summary

**Total Tasks**: 69

**By Phase**:
- Phase 1 (Setup): 5 tasks
- Phase 2 (Foundational): 7 tasks
- Phase 3 (US1 - Detection): 11 tasks
- Phase 4 (US2 - Accuracy): 8 tasks
- Phase 5 (US3 - Visual): 12 tasks
- Phase 6 (Storage): 6 tasks
- Phase 7 (Performance): 6 tasks
- Phase 8 (Error Handling): 5 tasks
- Phase 9 (Testing): 9 tasks

**By Priority**:
- P1 (MVP - Must Have): 43 tasks (Phases 1-5)
- P2 (Should Have): 17 tasks (Phases 6-8)
- P3 (Nice to Have): 9 tasks (Phase 9 validation)

**Parallel Tasks**: 19 tasks marked [P] can run simultaneously

**Estimated Time**:
- Sequential tasks: ~16 hours
- Parallel tasks: ~8 hours (if done simultaneously)
- Testing & validation: ~4 hours
- **Total**: 2-3 days with single developer, 1-2 days with parallel execution

---

## Success Criteria Checklist

Before marking complete, verify:

- [ ] Detection accuracy ≥70% on test corpus
- [ ] False positive rate <30% on test corpus
- [ ] Detection latency <500ms (p95)
- [ ] Highlight rendering <100ms (p95)
- [ ] Bundle size <500KB
- [ ] Zero console errors in normal operation
- [ ] All unit tests passing with 80%+ coverage
- [ ] Manual testing completed on real Gmail account
- [ ] Works offline (no internet connection required)
- [ ] Constitutional principles validated (privacy, simplicity, performance)

---

**Ready for Implementation**: Run `/speckit.implement` to begin executing tasks