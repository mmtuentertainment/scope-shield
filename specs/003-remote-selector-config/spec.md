# Feature Specification: Remote Selector Configuration

**Feature Branch**: `003-remote-selector-config`
**Created**: 2025-11-20
**Status**: 📋 Specified (DEFERRED - awaiting trigger conditions)
**Last Updated**: 2025-11-20
**Implementation**: BLOCKED until trigger condition met (see Launch Gates below)

**⚠️ DEFERRAL NOTICE**: This feature is **fully specified and ready to implement**, but intentionally deferred until ONE of these conditions met:
1. Gmail DOM breaks (detection fails on >50% of test accounts)
2. 1000+ active users (maintenance becomes critical)
3. 3+ Gmail UI changes in 6 months (pattern of instability)

**Current Status** (2025-11-20): 0 users, Gmail selectors stable
**Estimated Implementation**: 1 hour when triggered (15-20 hours if starting from scratch)

---

## Constitutional Exception Required

**⚖️ Privacy-First Principle (§I) - Exception Pre-Approved**:

Constitution already includes placeholder at [§I lines 53-57](../../memory/constitution.md#L53-L57):

> **Future Consideration** (Feature 003 - Remote Selector Config):
> - IF remote config fetching is needed (Gmail resilience), requires constitutional exception
> - Exception criteria: (a) no user data transmitted, (b) config cached locally, (c) graceful offline fallback

**CLARIFIED (2025-11-20)**: Activate existing exception when implementing this feature.

**Amendment Action Required**:
```markdown
Change "Future Consideration" → "Active Exception (v1.1.0)" in constitution.md §I

Active Exception (v1.1.0 - Feature 003): Remote Selector Configuration
Remote configuration fetching IS PERMITTED if ALL conditions met:
  1. NO user data transmitted (only CSS selector config fetched)
  2. Configs cached in chrome.storage.local (offline-first)
  3. Graceful offline fallback (use bundled/cached config)
  4. User notified in privacy policy
  5. Manual opt-out available in settings
  6. All fetches logged to console with [ScopeShield] prefix
```

**Constitutional Amendment**: YES
- Version bump: 1.0.0 → 1.1.0 (MINOR - activating pre-approved exception)
- Amendment date: When feature is triggered for implementation
- Approval process: Update constitution.md before `/speckit.plan`

---

## Clarifications

### Session 2025-11-20 (Pre-Implementation Planning)

**Q1: Constitutional amendment structure?**
- **Answer**: Option C - Activate existing "Future Consideration" placeholder
- **Rationale**: Exception criteria pre-approved in constitution.md:53-57, minimal disruption
- **Action**: Change "Future Consideration" → "Active Exception (v1.1.0)" when implementing

**Q2: GitHub hosting - Gist vs Pages?**
- **Answer**: Option C - Start with GitHub Gist, migrate to Pages if rate limited
- **Rationale**: Gist simpler (5-min setup), sufficient for <3,600 users, clear migration path
- **Implementation**:
  - MVP: `https://gist.githubusercontent.com/[user]/[gist-id]/raw/selectors.json`
  - Migration trigger: Rate limiting occurs (>3,600 active users)
  - Pages URL format: `https://[username].github.io/scopeshield-config/selectors.json`
- **Rate limit capacity**: 60 req/hr = 1,440 req/day = ~3,600 users @ 1 req/24hr each

**Q3: Update timing - when to check for config updates?**
- **Answer**: Option D - Hybrid (on load + alarm fallback)
- **Rationale**: Balances freshness, performance, and resilience
- **Implementation**:
  - Primary: Check on first Gmail page load each day (if >24hr since last check)
  - Timeout: 500ms (complies with Real-Time Performance §III)
  - Fallback: Use cached config immediately if fetch slow/offline
  - Retry: Schedule chrome.alarms retry in 1 hour if fetch failed
  - No blocking: User never waits for config fetch
- **Constitutional alignment**: Real-Time Performance (§III), Graceful Degradation (§VIII)

**Q4: Selector validation strictness - how to validate new configs?**
- **Answer**: Option C - At least ONE selector from each fallback chain must exist
- **Rationale**: Handles Gmail A/B tests (different users see different DOM simultaneously)
- **Implementation**:
  ```javascript
  // Validation: For each element, at least ONE fallback must work
  function validateConfig(config) {
    for (const key in config.fallbacks) {
      const chain = config.fallbacks[key];
      const anyExist = chain.some(sel => document.querySelector(sel));
      if (!anyExist) return false; // FAIL - no working selector
    }
    return true; // PASS - all elements have ≥1 working selector
  }
  ```
- **Example**: Config with `messageBody: [".a3s.aiL", "[data-message-body]"]`
  - User A (old UI): `.a3s.aiL` exists → PASS
  - User B (new UI): `[data-message-body]` exists → PASS
- **Constitutional alignment**: Graceful Degradation (§VIII)

**Q5: Rollback mechanism - how to recover from bad configs?**
- **Answer**: Option C - Developer-initiated rollback via GitHub gist revert
- **Rationale**: Simplest implementation, centralized control, proven pattern
- **Implementation**:
  ```bash
  # Developer workflow for rollback
  git log gist-selector-config  # Identify bad config commit
  git revert <commit-hash>      # Revert to previous working version
  git push                      # Users auto-update within 24hr
  ```
- **Recovery time**: 1-24 hours (automatic via normal update cycle)
- **Emergency recovery**: Users can click "Check for Updates" for instant rollback
- **Safety net**: Validation rejects bad configs even if fetched (keeps cached version)
- **Version strategy**: Can bump to v1.3.1 with note "Rollback to v1.2.3 selectors"
- **Constitutional alignment**: Zero Infrastructure (§IV) - minimal extension complexity

**Summary**: 5 critical clarifications resolved, ready for planning phase ✅

---

## User Scenarios & Testing (MANDATORY)

### User Story 1 - Automatic Selector Recovery (Priority: P0) 🎯 MVP

As a **ScopeShield user**, I need **automatic CSS selector updates** so that **Gmail UI changes don't break my extension without requiring Chrome Store updates**.

**Why this priority**: Without this, Gmail updates cause 2-week downtime (Chrome Store review delay). Automatic recovery means 1-hour fix vs 2-week outage. This is THE core value of this feature - preventing catastrophic failure.

**Independent Test**: Simulate Gmail selector change (rename `.a3s.aiL` to `.new-message-body`), push new config to GitHub gist, wait 24 hours OR click "Check for Updates" in settings. Verify detection resumes working automatically without extension update.

**Acceptance Scenarios**:
1. **Given** Gmail changes DOM structure breaking current selectors, **When** developer pushes updated config to GitHub gist, **Then** extension automatically fetches new config within 24 hours and detection resumes
2. **Given** new config fetched successfully, **When** user reads Gmail, **Then** detection works with new selectors without user action required (zero-touch recovery)
3. **Given** config fetch happens in background, **When** update completes, **Then** user sees subtle success notification: "Selectors updated (v1.2.3)" in extension icon tooltip

---

### User Story 2 - Manual Update Check (Priority: P1)

As a **power user who notices detection stopped working**, I need **manual "Check for Updates" button** so that **I can force config refresh immediately instead of waiting 24 hours**.

**Why this priority**: Automatic updates happen daily, but impatient users want instant fix. Manual button provides control and reduces support requests ("detection broken, when will it be fixed?").

**Independent Test**: Open settings page, click "Check for Updates" button. Verify loading spinner appears, config fetches from GitHub, success toast displays "Selectors updated to v1.2.3", detection resumes immediately.

**Acceptance Scenarios**:
1. **Given** settings page open, **When** user clicks "Check for Updates" button, **Then** button shows loading state (spinner icon), disables to prevent double-click, and fetches latest config
2. **Given** manual update completes successfully, **When** fetch finishes, **Then** success toast appears: "✓ Selectors updated to v1.2.3" with green background, auto-dismiss after 5 seconds
3. **Given** manual update fails (network error, GitHub down), **When** fetch fails, **Then** error toast appears: "⚠ Update failed. Using cached config (v1.2.0)" with fallback message

---

### User Story 3 - Graceful Offline Operation (Priority: P0) 🎯 MVP

As a **ScopeShield user**, I need **extension to work offline** so that **network failures or GitHub outages don't break detection**.

**Why this priority**: Zero Infrastructure principle (§IV) requires offline capability. Users shouldn't experience failures due to external service downtime. Cached configs provide resilience.

**Independent Test**: Disconnect internet, reload Gmail. Verify detection still works using cached config. Check console logs show "[ScopeShield] Using cached config (v1.2.0, age: 3 days)" without errors.

**Acceptance Scenarios**:
1. **Given** user offline (no network), **When** extension loads, **Then** detection uses cached config from chrome.storage.local without errors
2. **Given** cached config exists (age: 3 days), **When** extension loads, **Then** console logs "[ScopeShield] Using cached config (v1.2.0, cached 3 days ago)" for transparency
3. **Given** no cached config AND no network (fresh install offline), **When** extension loads, **Then** detection uses bundled fallback config (shipped with extension) and logs warning "[ScopeShield] Using bundled fallback config (v1.0.0)"

---

### User Story 4 - Config Version Tracking (Priority: P2)

As a **developer maintaining ScopeShield**, I need **config version visibility** so that **I can debug selector issues and validate config adoption rate**.

**Why this priority**: Debugging requires knowing which config version users have. Adoption metrics help determine if updates are working. Lower priority than core functionality but valuable for maintenance.

**Independent Test**: Open extension popup, check footer shows "Selectors: v1.2.3 (updated 2 days ago)". Click version number, verify tooltip shows full version details and update history.

**Acceptance Scenarios**:
1. **Given** popup open, **When** user views footer, **Then** config version displays as "Selectors: v1.2.3 (updated 2 days ago)" in small gray text
2. **Given** user clicks version number, **When** tooltip appears, **Then** shows: current version, last update timestamp, previous version (rollback capability), source (remote/cached/bundled)
3. **Given** developer needs adoption metrics, **When** viewing analytics (future), **Then** extension reports config version in telemetry (if user opts in)

---

### User Story 5 - Selector Validation Before Apply (Priority: P1)

As a **user**, I need **automatic validation of new selectors** so that **broken config updates don't make detection worse**.

**Why this priority**: Bad configs could break detection. Validation ensures new selectors actually exist in DOM before applying. Prevents developer errors from affecting users.

**Independent Test**: Push config with invalid selector (`.nonexistent-class`), trigger update. Verify extension tests selector on current Gmail page, rejects invalid config, keeps using cached version, logs warning.

**Acceptance Scenarios**:
1. **Given** new config fetched with selector `.nonexistent-class`, **When** extension validates against current Gmail DOM, **Then** validation fails, new config rejected, cached config retained
2. **Given** validation fails, **When** user checks console, **Then** logs "[ScopeShield] Config v1.3.0 validation failed: selector '.nonexistent-class' not found. Keeping v1.2.3"
3. **Given** validation passes (selectors exist), **When** applying new config, **Then** detection switches to new selectors, success logged, cached config updated

---

### Edge Cases

- **What happens when GitHub gist rate limit exceeded (60 req/hr unauthenticated)?**
  - Use cached config (offline fallback)
  - Retry with exponential backoff: 5 min → 15 min → 1 hour
  - Log rate limit error to console
  - Show warning in settings: "⚠ Rate limited. Next check: 1 hour"

- **What happens when fetched config is malformed JSON?**
  - JSON parse fails → reject config
  - Keep using cached/bundled config
  - Log error: "[ScopeShield] Config v1.3.0 parse error: Invalid JSON"
  - Developer can roll back GitHub gist to previous version

- **What happens when new config has selectors that don't exist in current Gmail?**
  - Validation checks: `document.querySelector(selector) !== null`
  - If validation fails → reject config
  - If validation passes → apply and cache
  - Handles Gmail A/B tests (new UI rollout)

- **What happens when user manually disables auto-updates in settings?**
  - Stop background fetch timer
  - "Check for Updates" button still works (manual only)
  - Show warning: "⚠ Auto-updates disabled. Detection may break on Gmail updates."
  - Developer can re-enable anytime

- **What happens when Chrome extension update bundles new fallback config?**
  - Extension compares versions: bundled vs cached
  - If bundled newer → replace cached with bundled
  - Log: "[ScopeShield] Extension updated. Bundled config v1.5.0 > cached v1.4.0. Using bundled."
  - Ensures store updates override stale caches

- **What happens when config fetch takes >10 seconds (slow network)?**
  - Timeout at 10 seconds
  - Use cached config immediately (no blocking)
  - Retry in background with exponential backoff
  - User never waits (performance budget maintained)

- **What happens when multiple Gmail tabs open during config update?**
  - chrome.storage.local change event propagates to all tabs
  - All content scripts reload with new config
  - Detection resumes in all tabs simultaneously
  - No manual refresh required

- **What happens when config rollback needed (v1.3.0 broken, revert to v1.2.3)?**
  - Developer reverts GitHub gist to previous commit
  - Extensions fetch "new" config (which is actually v1.2.3 again)
  - Version number may be same or developer bumps to v1.3.1 (rollback marker)
  - Extensions apply rolled-back config, detection recovers
  - **Emergency recovery**: Users can click "Check for Updates" in settings for instant rollback (vs waiting 1-24 hours for auto-update cycle)
    - Expected recovery time: <3 seconds (manual button → immediate fetch → rolled-back config applied)
    - Use case: User reports "detection broken", developer has pushed rollback, user clicks button for instant fix

---

## Requirements (MANDATORY)

### Functional Requirements

- **FR-001**: System MUST fetch CSS selector config from GitHub gist/Pages once per 24 hours in background using chrome.alarms API (no blocking)

- **FR-002**: System MUST cache fetched config in chrome.storage.local with metadata: version (semver string), lastUpdated (ISO 8601 timestamp), source ("remote"/"bundled"/"cached"), selectors object

- **FR-003**: System MUST implement 3-tier fallback strategy: (1) Fetch from remote GitHub URL, (2) Use cached config if remote fails, (3) Use bundled config if cache empty (fresh install offline)

- **FR-004**: System MUST validate fetched config before applying: (a) Valid JSON schema, (b) Required fields present (version, selectors), (c) Selectors exist in current DOM (document.querySelector checks)

- **FR-005**: System MUST timeout remote fetch at 10 seconds, fallback to cached config immediately, retry in background with exponential backoff (5min → 15min → 1hr)

- **FR-006**: System MUST provide manual "Check for Updates" button in settings page that fetches config immediately, shows loading state, displays success/error toast

- **FR-007**: System MUST log all config operations to console with [ScopeShield] prefix: fetch attempts, validation results, fallback usage, errors (transparency for debugging)

- **FR-008**: System MUST display current config version in extension popup footer: "Selectors: v1.2.3 (updated 2 days ago)" with tooltip showing full details

- **FR-009**: System MUST allow user to disable auto-updates in settings page (manual updates only), with warning message about potential breakage risk

- **FR-010**: System MUST propagate config updates to all open Gmail tabs via chrome.storage.onChanged event listener (no manual refresh required)

- **FR-011**: System MUST transmit ZERO user data during config fetch (privacy-first compliance): no analytics, no usage stats, no detection events, only selector config download

- **FR-012**: System MUST handle GitHub rate limits gracefully: detect 429 response, use cached config, show rate limit warning in settings, retry after rate limit window expires

### Key Entities

- **SelectorConfig**: Remote configuration defining CSS selectors
  - `version` (string, semver format): Config version (e.g., "1.2.3")
  - `lastUpdated` (string, ISO 8601): When config was published
  - `selectors` (object): CSS selector mappings
    - `composeButton` (string): Selector for Gmail compose button
    - `messageBody` (string): Selector for email message body
    - `senderName` (string): Selector for sender name
    - `subjectLine` (string): Selector for email subject
    - `timestamp` (string): Selector for message timestamp
  - `fallbacks` (object): Fallback selector chains per element
    - `composeButton` (string[]): Ordered fallback selectors
    - `messageBody` (string[]): Ordered fallback selectors
  - `metadata` (object): Additional config info
    - `description` (string): Change notes
    - `gmailVersion` (string): Gmail UI version this config targets

- **ConfigCache**: Cached config metadata in chrome.storage.local
  - `config` (SelectorConfig): Full config object
  - `source` (string enum): "remote" | "bundled" | "cached"
  - `cachedAt` (string, ISO 8601): When cached locally
  - `fetchedFrom` (string, URL): GitHub gist/Pages URL
  - `previousVersion` (string, semver): Previous config version (rollback)

- **ConfigFetchResult**: Result of remote fetch attempt
  - `success` (boolean): Fetch succeeded
  - `config` (SelectorConfig | null): Fetched config if successful
  - `error` (string | null): Error message if failed
  - `statusCode` (number): HTTP status code
  - `latency` (number, ms): Fetch duration
  - `source` (string): "remote" | "cached" | "bundled" (used after fetch)

### Non-Functional Requirements

- **NFR-001 (Performance)**: Config fetch MUST complete in <500ms (p95 latency) or timeout at 10s
- **NFR-002 (Availability)**: Detection MUST work 100% offline using cached/bundled config (zero external dependencies)
- **NFR-003 (Privacy)**: Config fetch MUST transmit zero user data, telemetry, or analytics (constitutional compliance)
- **NFR-004 (Reliability)**: Config validation MUST prevent broken selectors from breaking detection (fail-safe)
- **NFR-005 (Maintainability)**: Config format MUST support semantic versioning, rollback, and A/B testing
- **NFR-006 (Transparency)**: All config operations MUST log to console for user/developer visibility

---

## Success Criteria (MANDATORY)

### Measurable Outcomes

- **SC-001**: Config fetch completes in <500ms (p95 latency), <10s timeout enforced
- **SC-002**: Extension recovers from Gmail DOM changes within 24 hours of developer pushing updated config (auto-update cycle) OR instantly via manual "Check for Updates" (user-initiated)
- **SC-003**: Config fetch succeeds 99%+ over 30 days (excluding user offline periods)
- **SC-004**: ZERO user data transmitted during config fetch (privacy audit: network monitor shows only config download)
- **SC-005**: Detection works 100% offline using cached/bundled config (no errors in console when offline)
- **SC-006**: Config validation rejects 100% of malformed configs (invalid JSON, missing selectors, non-existent DOM elements)
- **SC-007**: Manual "Check for Updates" button succeeds <3 seconds in 95% of cases (fast network assumed)

---

## Out of Scope (Explicitly NOT Included)

❌ **NOT in MVP**:
- Config encryption (GitHub gist is public, configs contain no secrets)
- Multi-platform support (Slack, Outlook) - Gmail only for MVP
- Analytics on config adoption rate (privacy-first, no telemetry)
- Admin dashboard for config management (GitHub gist UI sufficient)
- Automatic selector discovery (AI-based) - manual selector updates only
- Config A/B testing framework (push single config, all users get same version)
- User-customizable selectors (developer-controlled only)
- Config signing/verification (trust GitHub's HTTPS, no PKI needed)

---

## Future Enhancements (Deferred to Post-MVP)

### Enhancement 1: GitHub Pages Migration

**Trigger**: Rate limiting occurs (>3,600 active users hitting 429 responses)
**Priority**: HIGH (when triggered)
**Effort**: 2-3 hours
**Status**: CLARIFIED in Q2 (2025-11-20) - Clear migration path documented

**Problem**: GitHub Gist rate limited to 60 requests/hour (sufficient for 3,600 users @ 1 req/day, insufficient for 5,000+ users)

**Solution**: Migrate config hosting to GitHub Pages (CDN-backed, unlimited requests)

**Migration Tasks** (when triggered):
1. Create GitHub repository: `scopeshield-config`
2. Enable GitHub Pages in repo settings (deploy from main branch)
3. Copy `selectors.json` to repo root: `/selectors.json`
4. Update CONFIG_URL in `src/background/config-manager.js`:
   ```javascript
   // Before (Gist):
   const CONFIG_URL = "https://gist.githubusercontent.com/[user]/[gist-id]/raw/selectors.json";

   // After (Pages):
   const CONFIG_URL = "https://[username].github.io/scopeshield-config/selectors.json";
   ```
5. Test fetch from Pages URL (verify CORS headers, latency)
6. Release extension update to Chrome Web Store (version bump for CONFIG_URL change)
7. Monitor fetch success rate for 7 days (should be 99%+, no 429 errors)

**Timeline**: Same-day migration (config JSON format identical, zero schema changes)

**Specification**: Create `specs/003-remote-selector-config/GITHUB-PAGES-MIGRATION.md` when triggered

**References**:
- Clarification Q2: [spec.md#clarifications](spec.md#clarifications) - Migration path documented
- GitHub Pages docs: [Publishing from repository](https://docs.github.com/en/pages/getting-started-with-github-pages)

---

## Launch Gates (Deferral Conditions)

**🚪 DO NOT IMPLEMENT until ONE of these conditions met**:

### Gate 1: Gmail DOM Breakage
**Condition**: Content script detection fails on >50% of test Gmail accounts
**Validation**: Test on 10 different Gmail accounts (personal, workspace, different locales)
**Current Status** (2025-11-20): ✅ PASS - Detection working 100%

### Gate 2: Scale Threshold
**Condition**: 1000+ active users (30-day active)
**Validation**: Chrome Web Store analytics
**Current Status** (2025-11-20): 0 users (extension not launched)
**Rationale**: Maintenance becomes critical at scale - can't afford 2-week downtime

### Gate 3: Gmail Update Frequency
**Condition**: 3+ Gmail UI changes in 6 months breaking selectors
**Validation**: Track Gmail updates in changelog
**Current Status** (2025-11-20): 0 tracked updates (new project)
**Rationale**: Pattern of instability justifies resilience investment

### Recommendation
**DEFER** until Gate 1 triggered. Gates 2-3 are secondary indicators.

**Monitoring Plan**:
- Quarterly manual check: Test detection on fresh Gmail accounts
- User reports: Track "detection stopped working" support requests
- Gmail changelog: Monitor https://workspaceupdates.googleblog.com/search/label/Gmail

---

## Dependencies

**Feature Dependencies**:
- ✅ Feature 001 (Detection Engine) - COMPLETE (selectors to migrate to remote config)
- ⏳ Constitutional Amendment - PENDING (Privacy-First exception approval)

**Technical Dependencies**:
- chrome.alarms API (background fetch scheduling)
- chrome.storage.local (config caching)
- chrome.storage.onChanged (cross-tab propagation)
- fetch() API (remote config download)

**External Dependencies**:
- **GitHub Gist** (MVP hosting - CLARIFIED 2025-11-20)
  - URL: `https://gist.githubusercontent.com/[user]/[gist-id]/raw/selectors.json`
  - Rate limit: 60 req/hr (sufficient for <3,600 users)
  - Migration to GitHub Pages when rate limiting occurs
- No authentication required (public gist)
- No CORS issues (GitHub serves with permissive CORS headers)

---

## References

- **BACKLOG.md**: Original deferral document (converted to this spec)
- **Feature 001 spec.md**: Current detection engine (selectors to migrate)
- **Constitution §I (Privacy-First)**: Exception required for remote fetching
- **Constitution §IV (Zero Infrastructure)**: Offline-first requirement
- **Spec-Kit Pattern 4**: Deferred Enhancements Tracking (spec-kit-mastery skill)
- **PayPlan Feature 016**: Example of 16 deferred items with clear triggers

---

**Next Steps When Triggered**:
1. ✅ Specification complete (this file)
2. ⏳ Run `/speckit.clarify` - Resolve constitutional exception questions
3. ⏳ Submit constitutional amendment (1.0.0 → 1.1.0)
4. ⏳ Wait for amendment approval
5. ⏳ Run `/speckit.plan` - Technical design
6. ⏳ Run `/speckit.tasks` - Atomic breakdown
7. ⏳ Run `/speckit.implement` - 15-20 hours implementation

**Estimated Timeline When Triggered**: 1-2 days (2 hours planning + 16 hours implementation + 4 hours review)
