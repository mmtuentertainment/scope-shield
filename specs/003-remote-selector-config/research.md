# Research: Remote Selector Configuration

**Feature**: 003-remote-selector-config
**Research Date**: 2025-11-20
**Source**: Clarification session (5 questions resolved)

---

## Decision 1: Constitutional Amendment Structure

**Context**: Spec requires Privacy-First exception for remote config fetching. Constitution currently prohibits ALL external data transmission.

**Options Considered**:
1. **Add exception paragraph to §I** after rationale, version bump to 1.1.0
2. **Reword entire §I principle** to include remote config as allowed use case
3. **Activate existing "Future Consideration"** placeholder at constitution.md:53-57

**Decision**: **Option 3** - Activate existing placeholder

**Rationale**:
- Exception criteria already pre-approved in constitution.md:53-57:
  > **Future Consideration** (Feature 003 - Remote Selector Config):
  > - IF remote config fetching is needed (Gmail resilience), requires constitutional exception
  > - Exception criteria: (a) no user data transmitted, (b) config cached locally, (c) graceful offline fallback
- Minimal disruption: Change "Future Consideration" → "Active Exception (v1.1.0)"
- Audit trail: Shows feature was planned from project inception
- Faster approval: Not introducing new exception, activating planned one
- Similar to PayPlan's phased constitutional principles

**Constitutional Impact**: MINOR version bump (1.0.0 → 1.1.0)

**Implementation**: Update constitution.md §I before running `/speckit.plan` (governance requirement)

**References**:
- ScopeShield constitution: [memory/constitution.md:53-57](../../memory/constitution.md#L53-L57)
- Spec-Kit governance: Amendments require version bump + documentation

---

## Decision 2: GitHub Hosting - Gist vs Pages

**Context**: Config needs external hosting. GitHub Gist (simple) vs GitHub Pages (CDN-backed) tradeoff.

**Options Considered**:
1. **GitHub Gist only** (MVP) - Simplest, sufficient for <3600 users, rate limited (60 req/hr)
2. **GitHub Pages only** (MVP) - Best performance, no rate limits, more complex setup
3. **Gist → Pages migration path** - Start simple, upgrade when needed
4. **Dual URLs** (try Gist, fallback Pages) - Maximum resilience, 2x maintenance

**Decision**: **Option 3** - Start with Gist, migrate to Pages if rate limited

**Rationale**:
- **Right-size for MVP**: 0 users means rate limit (60/hr) won't be hit
- **Defer complexity**: Don't build Pages infrastructure until proven need
- **Clear migration trigger**: When rate limiting occurs (>3,600 users @ 1 req/day each)
- **Same JSON format**: Config schema identical (zero code changes, just URL swap)
- **Cost-effective**: Both free forever (no paid infrastructure)

**Rate Limit Capacity**:
- 60 requests/hour = 1,440 requests/day
- 1 request per user per day = supports **1,440 simultaneous users**
- With staggered timing (24hr window) = supports **~3,600 users** comfortably

**Implementation**:
```javascript
// Config URL (single source of truth in config-manager.js)
const CONFIG_URL = "https://gist.githubusercontent.com/[user]/[gist-id]/raw/selectors.json";

// Future migration (when triggered):
// const CONFIG_URL = "https://[username].github.io/scopeshield-config/selectors.json";
```

**Migration Trigger**: Rate limiting occurs (429 responses) OR proactive at 3,000 users (buffer)

**References**:
- GitHub Gist API: [Raw file access](https://docs.github.com/en/rest/gists/gists?apiVersion=2022-11-28#get-a-gist)
- GitHub Pages: [Publishing from repository](https://docs.github.com/en/pages/getting-started-with-github-pages)
- Rate limits: [GitHub API rate limiting](https://docs.github.com/en/rest/overview/rate-limits-for-the-rest-api)

---

## Decision 3: Update Timing - When to Check for Config Updates

**Context**: Spec requires "once per 24 hours" but doesn't specify exact trigger moment.

**Options Considered**:
1. **On first Gmail page load each day** - Immediate freshness, may delay page load by <500ms
2. **Fixed time (3am local)** via chrome.alarms - Predictable, never blocks user, may update while offline
3. **Idle detection** after 10 min - Updates when user idle, unpredictable timing
4. **Hybrid (load + alarm fallback)** - Try on load (500ms timeout), retry via alarm if offline

**Decision**: **Option 4** - Hybrid approach (load + alarm fallback)

**Rationale**:
- **Real-time performance compliance**: 500ms timeout prevents blocking (Constitution §III: <500ms budget)
- **Graceful degradation**: Falls back to cached immediately if network slow (Constitution §VIII)
- **Resilient retry**: Alarm retries in background if user was offline during load
- **User-centric timing**: Updates when user likely to benefit (starting work session)
- **Proven pattern**: Used by major extensions (uBlock Origin, Privacy Badger)

**Implementation Logic**:
```javascript
// On extension load (first Gmail page of day)
async function checkForUpdates() {
  const lastCheck = await getLastCheckTimestamp();
  const hoursSinceCheck = (Date.now() - lastCheck) / (1000 * 60 * 60);

  if (hoursSinceCheck >= 24) {
    // Try immediate fetch (500ms timeout)
    const config = await fetchConfigWithTimeout(500);

    if (!config) {
      // Offline or slow → use cached, schedule alarm retry
      chrome.alarms.create('configRetry', { delayInMinutes: 60 });
      return useCachedConfig();
    }

    return applyNewConfig(config);
  }
}

// Alarm retry (if load-time fetch failed)
chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === 'configRetry') {
    fetchConfigWithTimeout(10000); // 10s timeout (no user blocking)
  }
});
```

**Constitutional Alignment**:
- Real-Time Performance (§III): 500ms timeout, non-blocking
- Graceful Degradation (§VIII): Fallback to cached, alarm retry

**References**:
- chrome.alarms API: [Scheduling documentation](https://developer.chrome.com/docs/extensions/reference/api/alarms)
- AbortController: [MDN timeout example](https://developer.mozilla.org/en-US/docs/Web/API/AbortController)

---

## Decision 4: Selector Validation Strictness

**Context**: Gmail runs A/B tests with different DOM structures for different users. Need to decide validation strictness.

**Options Considered**:
1. **ALL selectors must exist** (strict) - Safest, may reject valid configs during A/B tests
2. **Only critical selectors** (messageBody, senderName) - Flexible, complex logic to define "critical"
3. **At least ONE selector from each fallback chain** - Most flexible, handles Gmail variants

**Decision**: **Option 3** - Fallback chain validation

**Rationale**:
- **Handles Gmail A/B tests**: Different users see different DOM simultaneously
- **Graceful degradation**: If primary selector missing but fallback exists → PASS
- **Real-world pattern**: Used by major extensions (Grammarly, Honey)
- **Example**: Config with `messageBody: [".a3s.aiL", "[data-message-body]"]`
  - User A (old UI): `.a3s.aiL` exists → PASS
  - User B (new UI): `[data-message-body]` exists → PASS
  - Both users accept same config ✓

**Validation Implementation**:
```javascript
// Validation: For each element, at least ONE fallback must work
function validateConfig(config) {
  for (const key in config.fallbacks) {
    const chain = config.fallbacks[key];
    const anyExist = chain.some(sel => document.querySelector(sel));
    if (!anyExist) {
      console.warn(`[ScopeShield] Validation failed: No working selector for '${key}'`);
      return false; // FAIL - no working selector for this element
    }
  }
  console.log(`[ScopeShield] Validation passed: All elements have ≥1 working selector`);
  return true; // PASS - all elements have ≥1 working selector
}
```

**Edge Case Handling**:
- **Gmail rollout (20% new UI)**: Both old and new selectors in fallback chain
- **Gmail deprecates old selector**: New config removes old from fallback chain
- **Malformed selector**: `querySelector()` throws → catch, mark as non-existent

**Constitutional Alignment**: Graceful Degradation (§VIII) - "System MUST fail gracefully"

**References**:
- A/B testing patterns: [Google's gradual rollout strategy](https://web.dev/articles/performance-optimizing-content-efficiency#progressive-enhancement)
- Extension selector resilience: [uBlock Origin selector fallback](https://github.com/gorhill/uBlock/wiki/Static-filter-syntax#selector-list)

---

## Decision 5: Rollback Mechanism - Recovery from Bad Configs

**Context**: If developer pushes broken config (v1.3.0 with invalid selectors), how to recover?

**Options Considered**:
1. **Automatic rollback** (extension detects failures) - Instant recovery, complex health checks
2. **Manual user rollback** (user clicks "Restore Previous") - User control, requires awareness
3. **Developer rollback** (reverts GitHub gist commit) - Centralized control, 1-24hr recovery

**Decision**: **Option 3** - Developer-initiated rollback via GitHub gist revert

**Rationale**:
- **Simplest implementation**: No automatic health check logic needed
- **Developer has context**: Knows what broke and why (user reports, testing)
- **Centralized control**: One revert fixes all users (vs individual manual actions)
- **Natural pattern**: Already using git for version control
- **Proven at scale**: How major extensions handle config rollbacks (uBlock Origin)

**Rollback Workflow**:
```bash
# Developer receives reports: "Detection stopped working!"

# 1. Identify bad config version
git log gist-selector-config

# 2. Revert to previous working version
git revert <commit-hash>  # Or reset to previous commit

# 3. Push rollback
git push

# 4. Users auto-update within 24 hours (or manual "Check for Updates")
# Extension fetches "new" config (which is actually v1.2.3 again)
```

**Edge Case Handling**:
- **Version numbering**: Developer can bump to v1.3.1 with note "Rollback to v1.2.3 selectors"
- **Emergency rollback**: Users can manually click "Check for Updates" (instant fix vs waiting 24hr)
- **Validation safety net**: Even if bad config fetched, validation rejects it (keeps cached v1.2.3)

**Why NOT Automatic Rollback**:
- **Complex detection**: How to define "broken"? (false negatives common)
- **False alarms**: New Gmail UI might look "broken" but is actually valid
- **Testing burden**: Need comprehensive health checks (detection rate, error rates)

**Why NOT Manual User Rollback**:
- **User awareness required**: Most users won't know something broke
- **Support burden**: "How do I rollback?" support requests
- **Inconsistent recovery**: Some users rollback, others don't (fragmented state)

**Recovery Time**:
- Automatic update cycle: 1-24 hours (next time user loads Gmail)
- Manual "Check for Updates": Instant (user-initiated)
- Validation rejection: Immediate (bad config never applied)

**Constitutional Alignment**: Zero Infrastructure (§IV) - minimizes extension complexity

**References**:
- Git revert: [Undoing changes documentation](https://git-scm.com/book/en/v2/Git-Basics-Undoing-Things)
- uBlock Origin rollback: [Asset update mechanism](https://github.com/gorhill/uBlock/wiki/Dashboard:-Filter-lists#update-now)

---

## Summary of Research

**Total Decisions**: 5 critical clarifications resolved
**Research Duration**: ~15 minutes (clarification session)
**Constitutional Impact**: 1 amendment required (activate pre-approved exception)
**Technical Complexity**: LOW (all decisions favor simplicity over premature optimization)

**Key Principles Applied**:
1. **Start simple, scale later** (Gist → Pages migration)
2. **Leverage existing infrastructure** (GitHub, git version control)
3. **Favor developer control** (rollback, config updates)
4. **Respect constitutional limits** (no user data, offline-first, <500ms budget)
5. **Learn from proven patterns** (major extensions, Chrome best practices)

**Risks Identified**:
- **GitHub Gist downtime**: Mitigated by cached + bundled fallback
- **Rate limiting at scale**: Mitigated by migration path to Pages
- **Bad config deployment**: Mitigated by validation + developer rollback
- **A/B test conflicts**: Mitigated by fallback chain validation

**Next Steps**: Generate [data-model.md](data-model.md) and [contracts/](contracts/) (JSON schema)
