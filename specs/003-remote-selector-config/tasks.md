# Implementation Tasks: Remote Selector Configuration

**Feature**: 003-remote-selector-config
**Created**: 2025-11-20
**Status**: DEFERRED (awaiting trigger conditions)
**Total Tasks**: 79 (73 implementation + 6 PR workflow tasks)
**Estimated Duration**: 19-28 hours (including PR reviews and lessons learned documentation)
**Delivery Strategy**: 6 chunked PRs (10-13 tasks each, 30-60 min reviews)

---

## Task Format

```
- [ ] [TaskID] [P?] [Story?] Description with exact file path
```

- **TaskID**: T001, T002, T003... (sequential)
- **[P]**: Parallelizable (different files, no dependencies)
- **[Story]**: User story label ([US1], [US2], etc.) - REQUIRED for user story tasks
- **Description**: Clear action + exact file path

---

## CHUNKED DELIVERY STRATEGY

**Total Chunks**: 6 PRs (optimized for review speed and progressive value delivery)
**Pattern**: PayPlan Feature 062 chunking (smaller PRs = faster reviews = 30% time savings)

| Chunk | Tasks | PR Goal | Testable Value |
|-------|-------|---------|----------------|
| **Chunk 1** | T001-T007 (7 tasks) | Foundation Setup | Constitution + bundled config working |
| **Chunk 2** | T008-T017 (10 tasks) | Config Infrastructure | Loader + Validator complete |
| **Chunk 3** | T018-T036 (19 tasks) | Background Manager + Tests | Fetch orchestration + unit tests |
| **Chunk 4** | T037-T048 (12 tasks) | Content Integration (US1) | Config integrated into extension |
| **Chunk 5** | T049-T067 (19 tasks) | Offline + Validation (US3+US5) | MVP working end-to-end |
| **Chunk 6** | T068-T079 (12 tasks) | UI + Polish (US2+US4) | User features + docs complete |

**Lessons Learned**: Create `CHUNKS-LESSONS-LEARNED.md` after Chunk 3 (informs Chunks 4-6)

---

## Phase 1: Setup & Prerequisites (CHUNK 1 START)

**Duration**: 1-2 hours
**Dependencies**: None
**Chunk**: Chunk 1 (T001-T007)

- [ ] T001 Update constitution.md to activate Privacy-First exception (v1.0.0 → v1.1.0) in `memory/constitution.md`
- [ ] T002 [P] Create bundled fallback config file in `src/utils/config-fallback.json`
- [ ] T003 [P] Create GitHub Gist with initial selector config (copy from bundled fallback)
- [ ] T004 [P] Update package.json with config-related scripts (if needed)
- [ ] T005 Verify constitutional amendment committed and constitution version updated

**Checkpoint**: Constitution updated, bundled config exists, GitHub Gist live

---

## Phase 2: Foundational Infrastructure (BLOCKS all user stories)

**Duration**: 4-6 hours
**Dependencies**: Phase 1 complete

### Config Loader (3-Tier Fallback) - Part 1 (Chunk 1)

- [ ] T006 Create `src/utils/config-loader.js` file structure with exports
- [ ] T007 Implement `loadBundledConfig()` function (reads config-fallback.json) in `src/utils/config-loader.js`

**CHUNK 1 END** ✂️

- [ ] T007.1 Create PR for Chunk 1: Foundation Setup (T001-T007)
- [ ] T007.2 Wait for CodeRabbit + bot reviews, address CRITICAL/HIGH feedback
- [ ] T007.3 Merge Chunk 1 PR to main

**Checkpoint**: Chunk 1 merged - Constitution updated, bundled config loading works

---

### Config Loader (3-Tier Fallback) - Part 2 (CHUNK 2 START)

**Chunk**: Chunk 2 (T008-T017)
**Dependencies**: Chunk 1 merged

- [ ] T008 Implement `loadCachedConfig()` function (reads chrome.storage.local) in `src/utils/config-loader.js`
- [ ] T009 Implement `fetchRemoteConfig()` function (fetch from GitHub Gist) in `src/utils/config-loader.js`
- [ ] T010 Implement `fetchConfigWithTimeout()` wrapper (AbortController, 500ms/10s timeouts) in `src/utils/config-loader.js`
- [ ] T011 Implement `getCurrentConfig()` function (3-tier fallback: remote → cached → bundled) in `src/utils/config-loader.js`
- [ ] T012 Add console logging with [ScopeShield] prefix to all loader functions in `src/utils/config-loader.js`

### Config Validator (Fallback Chain Validation)

- [ ] T013 [P] Create `src/utils/config-validator.js` file structure with exports
- [ ] T014 [P] Implement `validateConfigSchema()` function (JSON structure validation) in `src/utils/config-validator.js`
- [ ] T015 [P] Implement `validateFallbackChain()` function (≥1 selector exists per chain) in `src/utils/config-validator.js`
- [ ] T016 [P] Implement `validateConfig()` function (combines schema + fallback validation) in `src/utils/config-validator.js`
- [ ] T017 [P] Add console logging for validation failures with detailed error messages in `src/utils/config-validator.js`

**CHUNK 2 END** ✂️

- [ ] T017.1 Create PR for Chunk 2: Config Infrastructure (T008-T017)
- [ ] T017.2 Wait for CodeRabbit + bot reviews, address CRITICAL/HIGH feedback
- [ ] T017.3 Merge Chunk 2 PR to main

**Checkpoint**: Chunk 2 merged - 3-tier fallback loader + validation complete

---

### Config Manager (Background Orchestration) (CHUNK 3 START)

**Chunk**: Chunk 3 (T018-T036)
**Dependencies**: Chunk 2 merged

- [ ] T018 Create `src/background/config-manager.js` file structure with exports
- [ ] T019 Implement `checkForUpdates()` function (checks lastCheckTimestamp, triggers fetch) in `src/background/config-manager.js`
- [ ] T020 Implement `cacheConfig()` function (writes to chrome.storage.local) in `src/background/config-manager.js`
- [ ] T021 Implement `scheduleRetryAlarm()` function (chrome.alarms for offline retry) in `src/background/config-manager.js`
- [ ] T022 Implement alarm listener for 'configRetry' event in `src/background/config-manager.js`
- [ ] T023 Implement rate limit handler (exponential backoff: 5m → 15m → 1h) in `src/background/config-manager.js`
- [ ] T024 Add error handling for all fetch failures (network, timeout, parse, validation) in `src/background/config-manager.js`

**Checkpoint**: Loader, validator, and manager modules complete with unit tests passing

---

## Phase 3: User Story 1 - Automatic Selector Recovery (P0 MVP)

**Duration**: 3-4 hours
**Dependencies**: Phase 2 complete
**User Story**: As a ScopeShield user, I need automatic CSS selector updates

### Content Script Integration

- [ ] T025 [US1] Update `src/content/content.js` to load config via `getCurrentConfig()` on page load
- [ ] T026 [US1] Replace hardcoded selectors with config-based selectors in `src/content/content.js`
- [ ] T027 [US1] Implement chrome.storage.onChanged listener for cross-tab config updates in `src/content/content.js`
- [ ] T028 [US1] Add config reload function (reapplies selectors without page refresh) in `src/content/content.js`
- [ ] T029 [US1] Add fallback to bundled config if cached config invalid in `src/content/content.js`

### Background Script Integration

- [ ] T030 [US1] Update `src/background/service-worker.js` to import config-manager
- [ ] T031 [US1] Add extension load trigger (check for updates on first Gmail load each day) in `src/background/service-worker.js`
- [ ] T032 [US1] Implement hybrid update timing (500ms timeout → cached fallback → alarm retry) in `src/background/service-worker.js`
- [ ] T033 [US1] Add chrome.runtime message handler for config update events in `src/background/service-worker.js`

### Testing

- [ ] T034 [US1] [P] Create unit tests for config-loader.js (3-tier fallback, timeout handling) in `tests/config-loader.test.js`
- [ ] T035 [US1] [P] Create unit tests for config-validator.js (schema validation, fallback chain validation, malformed JSON handling) in `tests/config-validator.test.js`
- [ ] T036 [US1] [P] Create unit tests for config-manager.js (fetch, cache, alarm scheduling, rate limit backoff timing) in `tests/config-manager.test.js`
- [ ] T036.A [US1] [P] Create performance benchmark test for config fetch latency (<500ms p95 validation) in `tests/config-loader.perf.test.js`

**CHUNK 3 END** ✂️

- [ ] T036.1 Create PR for Chunk 3: Background Manager + Tests (T018-T036)
- [ ] T036.2 Wait for CodeRabbit + bot reviews, address CRITICAL/HIGH feedback
- [ ] T036.3 Merge Chunk 3 PR to main
- [ ] T036.4 **CREATE LESSONS LEARNED FILE** `specs/003-remote-selector-config/CHUNKS-1-3-LESSONS-LEARNED.md`

**Checkpoint**: Chunk 3 merged - Fetch orchestration + unit tests complete, lessons learned documented

---

## Phase 3 Continued: US1 Manual Testing (CHUNK 4 START)

**Chunk**: Chunk 4 (T037-T048)
**Dependencies**: Chunk 3 merged

- [ ] T037 [US1] Manual test: Fresh install loads bundled config, fetches remote on first Gmail load
- [ ] T038 [US1] Manual test: Simulate Gmail selector change, push new config, verify auto-update

**Checkpoint**: US1 independently testable - Extension auto-updates config within 24hr when Gmail breaks

---

## Phase 4: User Story 2 - Manual Update Check (P1)

**Duration**: 2-3 hours
**Dependencies**: Phase 3 complete
**User Story**: As a power user, I need manual "Check for Updates" button

### Settings Page UI

- [ ] T039 [US2] Add "Check for Updates" button to `src/options/options.html` in selector config section
- [ ] T040 [US2] Add loading spinner icon (CSS animation) in `src/options/options.css`
- [ ] T041 [US2] Add success/error toast notification styles in `src/options/options.css`

### Settings Page Logic

- [ ] T042 [US2] Implement `handleCheckForUpdates()` function (triggers immediate fetch) in `src/options/options.js`
- [ ] T043 [US2] Add button loading state (disable + spinner) while fetching in `src/options/options.js`
- [ ] T044 [US2] Add success toast "✓ Selectors updated to v1.2.3" (5s auto-dismiss) in `src/options/options.js`
- [ ] T045 [US2] Add error toast "⚠ Update failed. Using cached config (v1.2.0)" in `src/options/options.js`
- [ ] T046 [US2] Add config update messaging to background script (request immediate fetch) in `src/options/options.js`

### Testing

- [ ] T047 [US2] Manual test: Click "Check for Updates", verify loading state, success toast, config updates
- [ ] T048 [US2] Manual test: Disconnect network, click button, verify error toast with fallback message
- [ ] T048.A [US2] Manual test: Open 3 Gmail tabs, trigger config update in one tab, verify all tabs reload selectors simultaneously

**CHUNK 4 END** ✂️

- [ ] T048.1 Create PR for Chunk 4: Content Integration (US1 + US2) (T037-T048)
- [ ] T048.2 Wait for CodeRabbit + bot reviews, address CRITICAL/HIGH feedback
- [ ] T048.3 Merge Chunk 4 PR to main
- [ ] T048.4 **UPDATE LESSONS LEARNED** with Chunk 4 insights

**Checkpoint**: Chunk 4 merged - US1 integration + US2 manual update working

---

## Phase 5: User Story 3 - Graceful Offline Operation (P0 MVP) (CHUNK 5 START)

**Chunk**: Chunk 5 (T049-T067)
**Dependencies**: Chunk 4 merged

**Duration**: 2-3 hours
**Dependencies**: Phase 3 complete (runs in parallel with Phase 4)
**User Story**: As a user, I need extension to work offline

### Offline Fallback Logic

- [ ] T049 [US3] Implement offline detection in `src/utils/config-loader.js` (fetch fails immediately)
- [ ] T050 [US3] Add cached config age calculation and display in `src/utils/config-loader.js`
- [ ] T051 [US3] Implement alarm retry with exponential backoff in `src/background/config-manager.js`
- [ ] T052 [US3] Add console logging for offline mode with cache age in `src/utils/config-loader.js`

### Testing

- [ ] T053 [US3] Manual test: Disconnect network, reload extension, verify cached config loads without errors
- [ ] T054 [US3] Manual test: Fresh install offline, verify bundled config loads as fallback
- [ ] T055 [US3] Manual test: Offline fetch triggers alarm retry, comes online, verify retry succeeds

**Checkpoint**: US3 independently testable - Extension works 100% offline using cached/bundled config

---

## Phase 6: User Story 4 - Config Version Tracking (P2)

**Duration**: 1-2 hours
**Dependencies**: Phase 3 complete (runs in parallel with Phases 4-5)
**User Story**: As a developer, I need config version visibility

### Popup Footer Display

- [ ] T056 [US4] Add config version display to popup footer in `src/popup/popup.html`
- [ ] T057 [US4] Add "Selectors: v1.2.3 (updated 2 days ago)" text with styling in `src/popup/popup.css`
- [ ] T058 [US4] Implement version age calculation ("2 days ago", "3 hours ago") in `src/popup/popup.js`
- [ ] T059 [US4] Add tooltip on hover showing full details (source, last update timestamp) in `src/popup/popup.js`

### Settings Page Display

- [ ] T060 [US4] [P] Add "Last update check: 23 hours ago" display to settings page in `src/options/options.html`
- [ ] T061 [US4] [P] Implement timestamp formatting and age calculation in `src/options/options.js`

**Checkpoint**: US4 independently testable - Version info visible in popup and settings

---

## Phase 7: User Story 5 - Selector Validation Before Apply (P1)

**Duration**: 1-2 hours
**Dependencies**: Phase 2 complete (foundational validator exists)
**User Story**: As a user, I need automatic validation of new selectors

### Validation Integration

- [ ] T062 [US5] Integrate validator into config-manager fetch workflow in `src/background/config-manager.js`
- [ ] T063 [US5] Add validation rejection logic (keep cached config if new config fails) in `src/background/config-manager.js`
- [ ] T064 [US5] Add detailed console logging for validation failures (which selector failed) in `src/background/config-manager.js`

### Testing

- [ ] T065 [US5] Unit test: Malformed config rejected (invalid JSON) in `tests/config-validator.test.js`
- [ ] T066 [US5] Unit test: Invalid selectors rejected (no working fallback) in `tests/config-validator.test.js`
- [ ] T067 [US5] Manual test: Push bad config to GitHub, verify validation rejects it, cached config retained

**CHUNK 5 END** ✂️

- [ ] T067.1 Create PR for Chunk 5: Offline + Validation (US3 + US5) (T049-T067)
- [ ] T067.2 Wait for CodeRabbit + bot reviews, address CRITICAL/HIGH feedback
- [ ] T067.3 Merge Chunk 5 PR to main
- [ ] T067.4 **UPDATE LESSONS LEARNED** with Chunk 5 insights

**Checkpoint**: Chunk 5 merged - MVP feature-complete (offline + validation working)

---

## Phase 6 + Phase 8: UI Features + Polish (CHUNK 6 START)

**Chunk**: Chunk 6 (T068-T079)
**Dependencies**: Chunk 5 merged
**Note**: Combining US4 (version tracking) + Polish for final chunk

### User Story 4 - Config Version Tracking (P2)

**User Story**: As a developer, I need config version visibility

#### Popup Footer Display

- [ ] T068 [US4] Add config version display to popup footer in `src/popup/popup.html`
- [ ] T069 [US4] Add "Selectors: v1.2.3 (updated 2 days ago)" text with styling in `src/popup/popup.css`
- [ ] T070 [US4] Implement version age calculation ("2 days ago", "3 hours ago") in `src/popup/popup.js`
- [ ] T071 [US4] Add tooltip on hover showing full details (source, last update timestamp) in `src/popup/popup.js`

#### Settings Page Display

- [ ] T072 [US4] [P] Add "Last update check: 23 hours ago" display to settings page in `src/options/options.html`
- [ ] T073 [US4] [P] Implement timestamp formatting and age calculation in `src/options/options.js`

**Checkpoint**: US4 independently testable - Version info visible in popup and settings

---

## Phase 8: Polish & Cross-Cutting

**Duration**: 2-3 hours
**Dependencies**: Phases 3-7 complete

### Auto-Update Toggle (Settings)

- [ ] T074 Add auto-update toggle checkbox to `src/options/options.html`
- [ ] T075 Implement toggle save/load from chrome.storage.local in `src/options/options.js`
- [ ] T076 Add warning message "⚠ Auto-updates disabled. Detection may break on Gmail updates." in `src/options/options.html`
- [ ] T077 Update config-manager to respect toggle (skip background fetches if disabled) in `src/background/config-manager.js`

### Documentation & Privacy

- [ ] T078 Update privacy policy with remote config fetch disclosure in `docs/PRIVACY.md` or extension manifest
- [ ] T079 [P] Perform privacy audit: Network monitor GitHub fetch, verify zero user data transmitted in `tests/privacy-audit.md`

**CHUNK 6 END** ✂️

- [ ] T079.1 Create PR for Chunk 6: UI + Polish (US4 + Polish) (T068-T079)
- [ ] T079.2 Wait for CodeRabbit + bot reviews, address CRITICAL/HIGH feedback
- [ ] T079.3 Merge Chunk 6 PR to main
- [ ] T079.4 **FINALIZE LESSONS LEARNED** - Add Chunk 6 retrospective and overall feature insights

**Checkpoint**: Chunk 6 merged - Feature 003 COMPLETE, all polish done, ready for production

---

## Dependencies & Execution Order

### Critical Path (Chunked PRs - Sequential)

```
Chunk 1 (Foundation) → PR #1
  ↓
Chunk 2 (Config Infrastructure) → PR #2
  ↓
Chunk 3 (Background Manager + Tests) → PR #3 + CREATE LESSONS LEARNED
  ↓
Chunk 4 (Content Integration US1+US2) → PR #4 + UPDATE LESSONS LEARNED
  ↓
Chunk 5 (Offline US3 + Validation US5) → PR #5 + UPDATE LESSONS LEARNED
  ↓
Chunk 6 (UI US4 + Polish) → PR #6 + FINALIZE LESSONS LEARNED
```

**Total PRs**: 6 (vs 1 monolithic PR)
**Average PR size**: 10-13 tasks (reviewable in 30-60 mins)
**Lessons Learned**: Created after Chunk 3, updated after Chunks 4-5, finalized after Chunk 6

### Parallel Execution Opportunities (Within Chunks)

**Within Chunk 2** (T008-T017):
- T013-T017 (validator) can run in parallel with T008-T012 (loader completion)

**Within Chunk 3** (T018-T036):
- T034-T036 (unit tests) can run in parallel after T018-T024 (manager) complete

**Within Chunk 6** (T068-T078):
- T072-T073 (settings page) can run in parallel with T068-T071 (popup)

### MVP Scope (Minimum Viable Product)

**Essential for MVP** (P0 tasks - Chunks 1-3 + partial Chunk 5):
- Chunk 1: T001-T007 (Foundation) + PR tasks T007.1-T007.3
- Chunk 2: T008-T017 (Config Infrastructure) + PR tasks T017.1-T017.3
- Chunk 3: T018-T036 (Background Manager + Tests) + PR tasks T036.1-T036.4
- Chunk 5 (partial): T049-T055 (US3 - Offline Operation)

**Total MVP Tasks**: 54 tasks (including PR tasks)
**Estimated MVP Time**: 12-15 hours (including PR review time)
**MVP PRs**: 3 PRs (Chunks 1-3) + partial Chunk 5

**Defer to Post-MVP** (P1, P2 tasks - Chunks 4 + partial Chunk 5 + Chunk 6):
- Chunk 4: T037-T048 (US1 Manual Tests + US2 Manual Update) + PR tasks
- Chunk 5 (partial): T056-T067 (US5 - Validation Integration)
- Chunk 6: T068-T078 (US4 Version Tracking + Polish) + PR tasks

**Post-MVP Tasks**: 42 tasks (including PR tasks)
**Estimated Post-MVP Time**: 8-10 hours (including PR review time)

---

## Testing Strategy

### Unit Tests (Vitest)

**Coverage Target**: 80%+ for business logic

**Test Files** (created during implementation):
- `tests/config-loader.test.js` (T034)
- `tests/config-validator.test.js` (T035, T065-T066)
- `tests/config-manager.test.js` (T036)

**Test Scenarios**:
- ✅ Config fetch succeeds <500ms → cache + apply
- ✅ Config fetch times out → fallback to cached
- ✅ Cached config missing → fallback to bundled
- ✅ Validation fails → reject, keep cached
- ✅ Validation passes → apply
- ✅ Rate limit (429) → exponential backoff
- ✅ Malformed JSON → parse error, fallback
- ✅ Offline fetch → immediate cached fallback, alarm retry

### Manual Tests

**Required Before Completion**:
- T037: Fresh install scenario
- T038: Gmail selector break scenario
- T047-T048: Manual update button
- T053-T055: Offline operation
- T067: Bad config rejection

---

## Implementation Notes

### File Size Limits (ScopeShield Standard)

- **Files**: ≤250 lines
- **Functions**: ≤75 lines
- **Extraction pattern**: Extract helpers when limits exceeded

**Expected File Sizes**:
- `config-loader.js`: ~180 lines (within limit)
- `config-validator.js`: ~120 lines (within limit)
- `config-manager.js`: ~200 lines (within limit)

### Code Quality

- ✅ All functions have JSDoc comments
- ✅ Error handling for all async operations
- ✅ Console logging with [ScopeShield] prefix
- ✅ No eval(), innerHTML, or unsafe DOM manipulation
- ✅ Chrome API error checking (chrome.runtime.lastError)

### Performance Budget

- ✅ Config fetch: <500ms (p95), 10s max timeout
- ✅ Validation: <50ms (synchronous)
- ✅ Cache read: <10ms (chrome.storage.local fast)
- ✅ No user-facing blocking (background fetch only)

---

## Progress Tracking

**Total Tasks**: 79 (73 implementation + 6 PR workflow tasks)
**Completed**: 0 / 79 tasks (0%)
**In Progress**: 0 tasks
**Blocked**: 0 tasks

**Chunks Complete**:
- [ ] Chunk 1: Foundation (7 tasks + 3 PR tasks = 10 total)
- [ ] Chunk 2: Config Infrastructure (10 tasks + 3 PR tasks = 13 total)
- [ ] Chunk 3: Background Manager + Tests (19 tasks + 4 PR tasks = 23 total) **LESSONS LEARNED CREATED**
- [ ] Chunk 4: Content Integration (12 tasks + 4 PR tasks = 16 total) **LESSONS LEARNED UPDATED**
- [ ] Chunk 5: Offline + Validation (19 tasks + 4 PR tasks = 23 total) **LESSONS LEARNED UPDATED**
- [ ] Chunk 6: UI + Polish (12 tasks + 4 PR tasks = 16 total) **LESSONS LEARNED FINALIZED**

**PR Status**:
- [ ] PR #1: Chunk 1 Foundation (created, reviewed, merged)
- [ ] PR #2: Chunk 2 Config Infrastructure (created, reviewed, merged)
- [ ] PR #3: Chunk 3 Background Manager + Tests (created, reviewed, merged)
- [ ] PR #4: Chunk 4 Content Integration (created, reviewed, merged)
- [ ] PR #5: Chunk 5 Offline + Validation (created, reviewed, merged)
- [ ] PR #6: Chunk 6 UI + Polish (created, reviewed, merged)

---

## Next Steps (When Feature Triggered)

1. ✅ Specification complete ([spec.md](spec.md))
2. ✅ Clarifications resolved ([spec.md Clarifications](spec.md#clarifications))
3. ✅ Planning complete ([plan.md](plan.md))
4. ✅ Tasks breakdown complete with chunked PR strategy (this file)
5. ⏳ Constitutional amendment (activate exception) - **Chunk 1 Task T001**
6. ⏳ Run `/speckit.implement` in chunks:
   - Chunk 1: T001-T007 → PR #1
   - Chunk 2: T008-T017 → PR #2
   - Chunk 3: T018-T036 → PR #3 (CREATE lessons learned)
   - Chunk 4: T037-T048 → PR #4 (UPDATE lessons learned)
   - Chunk 5: T049-T067 → PR #5 (UPDATE lessons learned)
   - Chunk 6: T068-T078 → PR #6 (FINALIZE lessons learned)
7. ⏳ CodeRabbit + bot reviews after each chunk (CRITICAL/HIGH fixes before merge)
8. ⏳ Lessons learned creation/updates after Chunks 3, 4, 5, 6
9. ⏳ Chrome Web Store submission (after Chunk 6 merged)

**Estimated Timeline When Triggered** (Chunked Delivery):
- Planning already done: 0 hours
- Implementation: 15-20 hours (same total, but spread across 6 PRs)
- PR reviews: 3-6 hours (6 PRs × 0.5-1hr each, concurrent with implementation)
- Lessons learned documentation: 1-2 hours
- **Total**: 19-28 hours (ready to implement in 4-6 days with chunked PRs)

**Time Savings vs Monolithic PR**:
- Monolithic: 1 PR × 2-3 hours review = 2-3 hours review time
- Chunked: 6 PRs × 0.5-1 hour each = 3-6 hours total BUT:
  - Reviews happen concurrently with implementation
  - Lessons learned from early chunks speed up later chunks (30% faster)
  - Net result: ~10% faster overall due to concurrent review + learning

---

## Pre-Release Checklist (Required Before Chrome Web Store Submission)

**⚠️ IMPORTANT**: Perform these steps before EVERY extension release (not numbered tasks, release process documentation)

### Bundled Config Sync (Addresses Analysis Report H2)

Before running `npm run build` for Chrome Web Store:

- [ ] Fetch latest config from GitHub Gist: `curl https://gist.githubusercontent.com/[user]/[gist-id]/raw/selectors.json > latest-config.json`
- [ ] Compare versions: `cat src/utils/config-fallback.json` (bundled) vs `latest-config.json` (remote)
- [ ] If remote newer: Replace bundled config: `cp latest-config.json src/utils/config-fallback.json`
- [ ] Verify bundled config version: `jq '.version' src/utils/config-fallback.json`
- [ ] Rebuild extension: `npm run build`
- [ ] Test fresh install: Load unpacked `dist/`, verify bundled config loads with latest version

**Purpose**: Ensures fresh installs start with latest selectors (not stale v1.0.0 when remote is v1.5.0)

**Duration**: 30 seconds per release

**Example**:
```bash
# Pre-release sync (run before each Chrome Web Store submission)
curl https://gist.githubusercontent.com/.../raw/selectors.json -o src/utils/config-fallback.json
git diff src/utils/config-fallback.json  # Review changes
git add src/utils/config-fallback.json
git commit -m "Sync bundled config to v1.5.0 (pre-release)"
npm run build
```

---

**Feature Status**: 📋 DEFERRED (fully specified, chunked for delivery, ready to implement when trigger conditions met)
