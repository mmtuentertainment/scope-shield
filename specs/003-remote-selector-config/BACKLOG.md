# Feature 003: Remote Selector Configuration (BACKLOG)

**Status**: Planned (Not Started)
**Created**: 2025-11-19
**Trigger**: Gmail DOM breaks OR 1000+ active users
**Priority**: HIGH (resilience)
**Dependencies**: Feature 001 (detection engine) complete
**Estimated Effort**: 15-20 hours

---

## Problem Statement

Gmail frequently updates its UI/DOM structure, changing CSS selectors used by ScopeShield's content script for detection. When selectors break, the extension stops working until a new version passes Chrome Web Store review (2-week delay minimum).

**Impact**: Extension unusable for 2 weeks during Gmail updates
**Frequency**: Gmail updates UI every 3-6 months
**User Experience**: Negative reviews, uninstalls, loss of trust

---

## Proposed Solution

**Remote Configuration System:**
1. Fetch CSS selector configs from GitHub gist or GitHub Pages
2. Cache configs in chrome.storage.local (offline-first)
3. Fallback chain: remote → cached → bundled (emergency)
4. Update check: Once per day, silent background
5. Manual override: Settings page "Check for Updates" button

**Config Structure** (JSON):
```json
{
  "version": "1.2.0",
  "lastUpdated": "2025-11-19T12:00:00Z",
  "selectors": {
    "composeButton": ".T-I.T-I-KE",
    "messageBody": ".a3s.aiL",
    "senderName": ".gD",
    "fallbacks": {
      "composeButton": [".T-I-KE", "[role='button'][aria-label*='Compose']"],
      "messageBody": [".message-body", "[data-message-body]"]
    }
  }
}
```

**Benefits**:
- Fix Gmail breaks in 1 hour (update config) vs 2 weeks (store review)
- A/B test selector changes before releasing
- Roll back bad selectors instantly
- Analytics on which selectors fail most

---

## Constitutional Considerations

**Privacy-First Principle (§I) Conflict:**

Current constitution states: "System MUST NOT transmit any user data to external servers"

**Required Exception:**
```markdown
Exception: Remote config fetching permitted IF:
1. Only config data fetched (no user data transmitted)
2. Configs cached in chrome.storage.local (offline-first)
3. Graceful degradation when fetch fails (use bundled config)
4. User notified in privacy policy: "Fetches selector configs from GitHub (no user data sent)"
5. Manual opt-out available (disable remote updates in settings)
```

**Constitutional Amendment Needed**: YES (minor version bump 1.0.0 → 1.1.0)

---

## User Stories

### User Story 1 (P1): Automatic Config Updates
As a **ScopeShield user**, I need **automatic selector updates** so that **Gmail UI changes don't break my extension**.

**Acceptance Criteria**:
- Config updates fetch silently in background (once per day)
- Extension continues working even if Gmail changes overnight
- No user action required (zero-touch recovery)

### User Story 2 (P2): Manual Update Check
As a **power user**, I need **manual "Check for Updates" button** so that **I can force config refresh when Gmail looks broken**.

**Acceptance Criteria**:
- Settings page has "Check for Updates" button
- Button shows loading state while fetching
- Success toast: "Selectors updated successfully"
- Error toast with fallback: "Using cached config"

### User Story 3 (P3): Config Versioning & Rollback
As a **developer**, I need **config version tracking** so that **I can roll back bad selector changes**.

**Acceptance Criteria**:
- Each config has semantic version (1.2.3)
- Extension stores current + previous version (rollback capability)
- Selector test validation before applying new config
- Admin dashboard shows config adoption rate

---

## Technical Approach

### Implementation Options

**Option A: GitHub Gist** (Recommended)
- **Pros**: Simple, free, version control built-in, public transparency
- **Cons**: Rate limited (60 req/hr unauthenticated), no SLA

**Option B: GitHub Pages**
- **Pros**: CDN-backed, high availability, supports JSON
- **Cons**: Requires repo setup, less dynamic

**Option C: Chrome Extension Update Manifest**
- **Pros**: Chrome-native, trusted infrastructure
- **Cons**: Complex setup, less flexible

**Decision**: Start with GitHub Gist (easiest), migrate to Pages if scale demands

### Key Design Decisions

1. **Fetch Frequency**: Once per day (balances freshness vs network cost)
2. **Cache Duration**: 7 days (config expires after 1 week, fetch required)
3. **Fallback Strategy**: Remote → Cached → Bundled (3-tier resilience)
4. **Validation**: Test selectors on DOM before applying (prevent bad configs)
5. **Rollback**: Store previous working config (one-version rollback)

---

## Success Criteria

- **SC-001**: Config updates fetch <500ms (p95)
- **SC-002**: Extension recovers from Gmail changes within 4 hours of config update
- **SC-003**: 99% config fetch success rate (over 30 days)
- **SC-004**: Zero user data transmitted during config fetch (privacy audit)
- **SC-005**: Graceful offline operation (no errors if fetch fails)

---

## Dependencies

**Before Implementation**:
1. ✅ Feature 001 (detection engine) complete and stable
2. ⏳ Constitutional amendment approved (Privacy-First exception)
3. ⏳ 1000+ active users OR Gmail DOM breaks

**Blocked By**:
- Constitutional review required before planning
- Must not implement prematurely (adds complexity without proven need)

---

## Launch Gates

**DO NOT IMPLEMENT until ONE of these conditions met:**

1. **Gmail DOM breaks**: Content script fails on >50% of test accounts
2. **1000+ active users**: Maintenance becomes critical (can't afford 2-week downtime)
3. **Multiple Gmail updates**: 3+ UI changes in 6 months (pattern of instability)

**Current Status** (2025-11-19): 0 users, Gmail selectors stable (last update: unknown)

**Recommendation**: DEFER until trigger condition met. Monitor Gmail updates quarterly.

---

## References

- **Spec-Kit Deferred Enhancements Pattern**: Pattern 4 from spec-kit-mastery skill
- **PayPlan Lessons**: Feature 016 deferred 16 items with clear triggers
- **Constitutional Governance**: Principles I (Privacy-First), IV (Zero Infrastructure)

---

**Next Steps When Triggered**:
1. Run `/speckit.specify` to create full specification
2. Run `/speckit.clarify` on constitutional exception and privacy safeguards
3. Submit constitutional amendment proposal (1.0.0 → 1.1.0)
4. Wait for approval before `/speckit.plan`
