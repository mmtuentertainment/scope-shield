# Implementation Plan: Remote Selector Configuration

## Summary

Build resilience layer for ScopeShield that fetches CSS selector configurations from GitHub Gist, preventing 2-week extension downtime when Gmail updates DOM structure. Primary requirement: Zero-touch recovery for users when Gmail selectors break (1-hour developer fix vs 2-week Chrome Store review). Technical approach: Hybrid update timing (load + alarm fallback), 3-tier fallback strategy (remote → cached → bundled), fallback chain validation for Gmail A/B test handling, developer-controlled rollback via git revert.

## Technical Context

**Language/Version**: JavaScript ES2020+ (Chrome Extension environment, no transpilation needed for target browsers)

**Primary Dependencies**:
- Chrome Extension Manifest V3 APIs:
  - `chrome.alarms` (background fetch scheduling)
  - `chrome.storage.local` (config caching, 5MB quota)
  - `chrome.storage.onChanged` (cross-tab config propagation)
  - `chrome.runtime` (background/content script messaging)
- Browser APIs:
  - `fetch()` (remote config download, 500ms/10s timeouts)
  - `AbortController` (fetch timeout enforcement)
  - `document.querySelector()` (selector validation)

**Storage**:
- chrome.storage.local for config cache (~2KB per config, <1% of 5MB quota)
- Config structure: `{ config: SelectorConfig, source: string, cachedAt: ISO8601, previousVersion: string }`

**Testing**:
- Vitest for unit tests (config fetch, validation, fallback logic)
- Manual E2E testing for Gmail integration (automated E2E deferred to Feature 005)
- Coverage target: 80%+ for business logic (config manager, validator, fallback handler)

**Target Platform**: Chrome Extension (Chrome 88+, Manifest V3)

**Performance Goals**:
- Config fetch: <500ms (p95), 10s timeout max
- Validation: <50ms (synchronous DOM queries)
- Cache read: <10ms (chrome.storage.local is fast)
- No user-facing latency (background fetch, instant fallback)

**Modularity**: Files ≤250 lines (ScopeShield standard), functions ≤75 lines, extract helpers when exceeded

**Constraints**:
- No backend/server (GitHub Gist hosting only)
- Offline-first (cached config must work without network)
- No user data transmission (constitutional requirement)
- No authentication (public GitHub Gist)
- Chrome Web Store compliant (Manifest V3, minimal permissions)

**Scale/Scope**:
- MVP: 0-1000 users (GitHub Gist rate limit sufficient)
- Phase 2: 1000-3600 users (migration trigger evaluation)
- Phase 3: 3600+ users (migrate to GitHub Pages if rate limited)

## Constitution Check (GATE - Phase -1)

| Principle | Requirement | Status | Notes |
|-----------|-------------|--------|-------|
| **I. Privacy-First** | No user data transmission | ✅ PASS | Exception pre-approved (constitution.md:53-57), only config data fetched, zero user info sent |
| **II. Simplicity-First** | Heuristics for MVP | ✅ PASS | Simple fetch + validation, no AI/ML, defers complexity (no automatic health checks) |
| **III. Real-Time Performance** | <500ms detection | ✅ PASS | 500ms fetch timeout (non-blocking), fallback to cached immediately, no user-facing delay |
| **IV. Zero Infrastructure** | Client-side only | ✅ PASS | GitHub Gist hosting (no backend needed), offline-first with cached/bundled fallback |
| **V. User Value First** | Helps freelancers earn | ✅ PASS | Prevents 2-week downtime = protects revenue capture (scope creep detection stays working) |
| **VI. Chrome Web Store** | Manifest V3, min perms | ✅ PASS | Uses existing `storage` permission, no new permissions needed, compliant fetch() usage |
| **VII. Measurable Success** | ≥3 metrics defined | ✅ PASS | 5 success criteria: fetch latency, recovery time, success rate, privacy audit, offline operation |
| **VIII. Graceful Degradation** | Manual fallbacks | ✅ PASS | 3-tier fallback (remote→cached→bundled), manual "Check for Updates" button, validation safety net |

**Post-Design Re-Validation**: ✅ ALL PASS - No constitutional violations

## Project Structure

### Documentation (this feature)
```
specs/003-remote-selector-config/
├── spec.md                  # Requirements (DONE)
├── plan.md                  # This file
├── research.md              # Phase 0 output (decisions from clarifications)
├── data-model.md            # Phase 1 output (SelectorConfig, ConfigCache entities)
├── contracts/
│   └── selector-config.schema.json  # JSON Schema for selectors.json
└── tasks.md                 # Phase 2 output (/speckit.tasks)
```

### Source Code (repository root)
```
src/
├── background/
│   └── config-manager.js    # ⚠️ TEST THIS (background fetch, caching, alarms)
├── content/
│   └── content.js           # Uses config for selectors (existing, minor updates)
├── popup/
│   └── popup.js             # Manual update button (existing settings integration)
├── options/
│   └── options.js           # Settings: auto-update toggle, "Check for Updates" (new)
└── utils/
    ├── config-loader.js     # ⚠️ TEST THIS (3-tier fallback, validation)
    ├── config-validator.js  # ⚠️ TEST THIS (fallback chain validation)
    └── config-fallback.json # Bundled default config (shipped with extension)
```

**Structure Decision**: Utility-based (config management is cross-cutting concern for background + content scripts)

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| N/A | No violations | N/A |

---

## Phase 0: Research (research.md)

Generated from clarification session 2025-11-20. See [research.md](research.md) for full details.

**Key Decisions**:
1. **Constitutional Amendment**: Activate pre-approved exception in §I
2. **GitHub Hosting**: Gist (MVP) → Pages (scale trigger: >3600 users)
3. **Update Timing**: Hybrid (load + alarm fallback)
4. **Selector Validation**: Fallback chain validation (handles A/B tests)
5. **Rollback Mechanism**: Developer-initiated via git revert

---

## Phase 1: Design

### Data Model

See [data-model.md](data-model.md) for complete entity definitions.

**Core Entities**:
- **SelectorConfig**: Remote config defining CSS selectors
- **ConfigCache**: Cached config metadata in chrome.storage.local
- **ConfigFetchResult**: Result of remote fetch attempt

### API Contracts

See [contracts/selector-config.schema.json](contracts/selector-config.schema.json) for JSON Schema.

**Config Structure** (selectors.json on GitHub Gist):
```json
{
  "version": "1.2.3",
  "lastUpdated": "2025-11-20T10:30:00Z",
  "selectors": {
    "composeButton": ".T-I.T-I-KE",
    "messageBody": ".a3s.aiL",
    "senderName": ".gD",
    "subjectLine": ".hP",
    "timestamp": ".g3"
  },
  "fallbacks": {
    "composeButton": [".T-I-KE", "[role='button'][aria-label*='Compose']"],
    "messageBody": [".a3s.aiL", "[data-message-body]", ".message-content"],
    "senderName": [".gD", "[data-sender]", ".sender-name"],
    "subjectLine": [".hP", "[data-subject]", "h2.subject"],
    "timestamp": [".g3", "[data-time]", ".timestamp"]
  },
  "metadata": {
    "description": "Gmail selectors for new UI (Nov 2025)",
    "gmailVersion": "2025.11.01"
  }
}
```

### Integration Scenarios

See [quickstart.md](quickstart.md) for step-by-step examples.

**Scenario 1**: First-time extension install (fresh user)
**Scenario 2**: Gmail selector breaks (developer pushes update)
**Scenario 3**: User offline during update (alarm retry)
**Scenario 4**: Bad config rollback (developer reverts gist)

---

## Phase 2: Implementation Phases

### Phase 2.1: Config Infrastructure (Foundation)
**Duration**: 4-6 hours
**Deliverables**:
- `config-loader.js` - 3-tier fallback implementation
- `config-validator.js` - Fallback chain validation
- `config-fallback.json` - Bundled default config
- Unit tests for loader + validator (80%+ coverage)

### Phase 2.2: Background Fetch (Core Logic)
**Duration**: 4-6 hours
**Deliverables**:
- `background/config-manager.js` - Fetch orchestration
- Hybrid update timing (load + alarm)
- chrome.alarms integration
- Rate limit handling (exponential backoff)
- Unit tests for fetch logic

### Phase 2.3: Settings UI (User Control)
**Duration**: 2-3 hours
**Deliverables**:
- Manual "Check for Updates" button in options page
- Auto-update toggle (enable/disable)
- Config version display in popup footer
- Loading states, success/error toasts

### Phase 2.4: Content Script Integration
**Duration**: 2-3 hours
**Deliverables**:
- Migrate hardcoded selectors to config-based
- chrome.storage.onChanged listener (cross-tab updates)
- Graceful fallback if config invalid
- Integration tests

### Phase 2.5: Polish & Documentation
**Duration**: 2-3 hours
**Deliverables**:
- Console logging ([ScopeShield] prefix)
- Error handling edge cases
- Privacy policy update
- Developer documentation (how to update config)

**Total Estimated Time**: 15-20 hours

---

## Phase 3: Testing Strategy

### Unit Tests (Vitest)
**Coverage Target**: 80%+ business logic

**Test Files**:
- `tests/config-loader.test.js` - 3-tier fallback, timeout handling
- `tests/config-validator.test.js` - Fallback chain validation, malformed JSON
- `tests/config-manager.test.js` - Fetch logic, alarm scheduling, rate limits

**Test Cases**:
- ✅ Config fetch succeeds <500ms → cache + apply
- ✅ Config fetch times out → fallback to cached
- ✅ Cached config missing → fallback to bundled
- ✅ Validation fails (no working selectors) → reject, keep cached
- ✅ Validation passes (≥1 selector per fallback chain) → apply
- ✅ Rate limit (429) → exponential backoff (5m, 15m, 1h)
- ✅ Malformed JSON → parse error, fallback to cached
- ✅ Offline fetch → immediate cached fallback, alarm retry

### Manual Testing
**Test on Real Gmail**:
1. Install extension with bundled config → detection works
2. Push new config to GitHub Gist → auto-update within 24hr
3. Simulate selector break → push fixed config → verify recovery
4. Click "Check for Updates" → instant update (no wait for 24hr cycle)
5. Disable auto-updates in settings → verify no background fetch
6. Test offline → verify cached config still works

### E2E Testing (Deferred to Feature 005)
Automated E2E tests deferred until 100+ users (constitution Phase 2 principle)

---

## Performance Budget Validation

| Operation | Target (p95) | Maximum (p99) | Implementation |
|-----------|--------------|---------------|----------------|
| Config fetch | <500ms | <10s | AbortController timeout at 500ms |
| Validation | <50ms | <100ms | Synchronous DOM queries (fast) |
| Cache read | <10ms | <20ms | chrome.storage.local (native) |
| Cache write | <50ms | <100ms | chrome.storage.local.set() |
| Fallback selection | <5ms | <10ms | Array iteration (tiny config) |

**Bundle Size Impact**: +8KB (config-manager.js, config-loader.js, config-validator.js, bundled config)

**Total Extension Bundle**: 308KB → 316KB (within 500KB budget, 63% of limit)

---

## Security Considerations

**Threat Model**:
1. **Malicious config injection** - Attacker compromises GitHub Gist
   - **Mitigation**: Validation rejects malformed configs, developer-controlled gist
2. **MITM attack on config fetch** - Attacker intercepts HTTPS
   - **Mitigation**: GitHub enforces HTTPS (TLS 1.3), no downgrade
3. **XSS via selector injection** - Malicious selector string
   - **Mitigation**: Selectors used in `document.querySelector()` (DOM sanitized), no eval()
4. **Privacy leak via fetch** - Config URL leaks user data
   - **Mitigation**: Static GitHub URL (no query params), zero user data sent

**Privacy Audit**:
- ✅ No user data in fetch request (only config download)
- ✅ No analytics or telemetry
- ✅ Public GitHub Gist (no authentication = no user tracking)
- ✅ Console logging only (no external reporting)

---

## Rollout Strategy

**Phase 1 (When Feature Triggered)**:
1. Update constitution.md (activate exception)
2. Create GitHub Gist with initial config (copy from bundled fallback)
3. Implement feature (15-20 hours)
4. Manual testing on Gmail (3 different accounts)
5. Release extension update to Chrome Web Store
6. Monitor support requests for 7 days

**Phase 2 (If Gmail Breaks)**:
1. Developer receives "detection broken" reports
2. Inspect Gmail DOM, identify new selectors
3. Update GitHub Gist (push new config version)
4. Users auto-update within 24 hours (or manual button)
5. Verify recovery via user reports / test accounts

**Phase 3 (If Rate Limited - >3600 users)**:
1. Migrate config to GitHub Pages
2. Update CONFIG_URL in extension code
3. Release extension update
4. Monitor fetch success rate (should be 99%+)

---

## Monitoring & Observability

**Console Logging** (all operations logged with [ScopeShield] prefix):
```javascript
[ScopeShield] Checking for config update (last check: 23h ago)
[ScopeShield] Fetching config from GitHub Gist...
[ScopeShield] Config v1.2.3 fetched in 287ms
[ScopeShield] Validation passed: 5/5 selectors have working fallbacks
[ScopeShield] Config v1.2.3 cached successfully
[ScopeShield] Using cached config (v1.2.3, age: 3 days)
[ScopeShield] Config fetch timeout (>500ms), using cached v1.2.2
[ScopeShield] Rate limited (429), retry scheduled in 5 minutes
[ScopeShield] Validation failed: selector 'nonexistent' not found, keeping v1.2.2
```

**User-Facing Indicators**:
- Popup footer: "Selectors: v1.2.3 (updated 2 days ago)"
- Settings page: "Last update check: 23 hours ago"
- Toast notifications: "✓ Selectors updated to v1.2.3" (manual update only)

**No External Telemetry**: Privacy-first principle prohibits usage analytics

---

## Known Limitations (MVP)

**Intentionally Deferred**:
1. **No automatic health checks** - Developer manually validates before pushing config
2. **No config signing** - Trust GitHub's HTTPS (no PKI infrastructure)
3. **No A/B testing framework** - Single config for all users (no percentage rollout)
4. **No analytics** - Cannot measure config adoption rate (privacy-first)
5. **No multi-platform** - Gmail only (Slack/Outlook deferred)

**Future Enhancements** (Post-MVP):
- Automatic selector discovery (AI-based, requires 100+ users validation)
- Config version history UI (view past 5 versions)
- Fallback chain A/B testing (test new selectors on 10% of users)

---

## References

- **Clarifications**: All 5 questions resolved in [spec.md Clarifications section](spec.md#clarifications)
- **Constitution**: Exception pre-approved in [constitution.md:53-57](../../memory/constitution.md#L53-L57)
- **Feature 001**: Current detection engine (selectors to migrate) in [001-detection-engine/spec.md](../001-detection-engine/spec.md)
- **Chrome APIs**:
  - [chrome.alarms documentation](https://developer.chrome.com/docs/extensions/reference/api/alarms)
  - [chrome.storage.local documentation](https://developer.chrome.com/docs/extensions/reference/api/storage#property-local)
- **GitHub Gist API**: [Raw file access](https://docs.github.com/en/rest/gists/gists?apiVersion=2022-11-28#get-a-gist)

---

**Status**: Planning complete, ready for `/speckit.tasks` (task breakdown) ✅
