<!--
SYNC IMPACT REPORT
Generated: 2025-11-06
Constitution Version: 1.0.0 (Initial Ratification)
Status: NEW - First constitution for ScopeShield project

TEMPLATES TO CREATE:
- [ ] templates/plan-template.md (Constitution Check section referencing all 8 principles)
- [ ] templates/spec-template.md (Scope alignment with privacy-first and user value principles)
- [ ] templates/tasks-template.md (Task categorization by principle: Privacy, Performance, Value Delivery)

PROPAGATION CHECKLIST:
Phase 1 (This file):
  ✅ Constitution created with 8 core principles
  ✅ Semantic versioning established (1.0.0)
  ✅ Governance procedures defined
  ✅ All placeholders replaced with concrete values

Phase 2 (Next steps - after initialization):
  - [ ] Generate plan-template.md with Constitution Check gate (validates all 8 principles)
  - [ ] Generate spec-template.md with privacy and value alignment requirements
  - [ ] Generate tasks-template.md with principle-based categories
  - [ ] Create CLAUDE.md referencing constitutional principles
  - [ ] Update README.md with governance overview

VALIDATION CHECKS:
  ✅ No remaining bracket placeholders
  ✅ Version matches report (1.0.0)
  ✅ Dates in ISO format (2025-11-06)
  ✅ Principles are declarative and testable
  ✅ Clear MUST statements for non-negotiable rules
  ✅ Explicit rationale for each principle
  ✅ Compliance review process defined
-->

# ScopeShield Constitution

## Core Principles

### I. Privacy-First Architecture

System MUST store all user data exclusively in browser using chrome.storage.local.
System MUST NOT transmit any user data (scope definitions, detected messages, client information, change orders) to external servers, analytics services, or third-party APIs.

**Rationale**: Freelancers handle confidential client communications containing sensitive business information, NDA-protected content, and competitive intelligence. Any data transmission creates legal liability, privacy risks, and erodes user trust. Client-side storage eliminates these risks entirely while enabling offline functionality and zero hosting costs.

**Test Criteria**:
- Network monitor shows zero outbound requests containing user data
- chrome.storage.local is only persistence mechanism
- No analytics tracking user behavior or content
- Privacy policy explicitly states "no data collection"

### II. Simplicity-First for MVP

System MUST use deterministic heuristic-based detection (keyword matching, phrase patterns) for MVP.
System MUST NOT implement machine learning, AI models, or natural language processing until market validation achieved (100 active users for 30 consecutive days with 70%+ detection accuracy).

**Rationale**: AI/ML adds massive complexity: model training infrastructure, TensorFlow/PyTorch dependencies (100MB+ bundle size), prompt engineering, API costs, accuracy tuning, and maintenance burden. Keyword heuristics can achieve 70%+ accuracy (validated by competitor research) with <10KB of JavaScript. Ship fast, validate market demand, iterate based on real user feedback.

**Test Criteria**:
- Detection logic uses only string matching and regular expressions
- Extension bundle size <500KB
- No ML library dependencies in package.json
- Detection accuracy ≥70% on test corpus (20 sample messages)

### III. Real-Time Performance (NON-NEGOTIABLE)

System MUST detect scope creep and render visual indicators within 500ms of page content load.
System MUST NOT block, delay, or visibly interfere with user's normal email/messaging workflow.

**Rationale**: Freelancers read 20-50 client messages daily. Detection must be instant and invisible. Any lag >500ms is perceptible and breaks trust. Slow extensions get uninstalled. Performance is a feature, not an optimization.

**Performance Budget**:
| Operation | Target (p95) | Maximum (p99) |
|-----------|--------------|---------------|
| Content script load | <50ms | <100ms |
| Scope creep detection | <300ms | <500ms |
| Highlight rendering | <50ms | <100ms |
| Change order generation | <3s | <5s |
| Popup dashboard load | <200ms | <500ms |

### IV. Zero Infrastructure Dependency

System MUST run entirely client-side without requiring backend services, databases, or APIs for core functionality (detection, highlighting, change order generation, dashboard).
System MAY use external services only for non-core features (email integration, cloud sync) with explicit user consent and graceful degradation when unavailable.

**Rationale**: Backend = hosting costs ($20-100/month), deployment complexity (CI/CD, monitoring, logs), maintenance burden (security patches, scaling), uptime concerns (99.9% SLA), and single point of failure. Client-side = zero infrastructure costs, infinite scalability (Chrome handles distribution), simpler testing, and easier debugging. Enables sustainable bootstrapped growth to 1000+ users without operational burden.

**Test Criteria**:
- Extension functions identically offline vs online
- No API calls required for scope detection, highlighting, or change order generation
- Chrome Web Store is only distribution requirement
- Local testing possible without internet connection

### V. User Value Over Feature Completeness

System MUST prioritize features that directly help freelancers prevent scope creep and generate billable change orders.
System MUST validate feature value with user feedback before building secondary features (analytics, team collaboration, advanced templates).

**Rationale**: Freelancers lose $5K-50K annually to scope creep (research validated). Mission is helping them get paid fairly for extra work. Every feature must answer: "Does this directly help freelancers make more money?" Features that don't contribute to revenue protection are distractions that delay launch and add maintenance burden.

**Feature Priority Framework**:
| Priority | Definition | Launch Gate |
|----------|------------|-------------|
| **P0** (Core) | Blocks launch, solves core problem | Must ship v1.0 |
| **P1** (High) | Significantly increases revenue capture | Week 2 post-launch |
| **P2** (Medium) | Improves workflow efficiency | Month 2, after 100 users |
| **P3** (Low) | Nice-to-have, marginal value | Backlog, user-requested only |

### VI. Chrome Web Store Compliance

System MUST comply with Chrome Extension Manifest V3 specification and Chrome Web Store Developer Program Policies.
System MUST request only minimum necessary permissions: activeTab, storage, notifications.
System MUST provide clear justification for each permission in privacy policy.

**Rationale**: Chrome Web Store is ONLY distribution channel (53% of web users). Rejection = launch delay of 1-2 weeks minimum, potentially indefinite if violations are severe. Over-requesting permissions reduces installation rates by 40-70% (Google research). Users distrust extensions that ask for excessive access.

**Test Criteria**:
- Manifest version: 3 (V2 deprecated January 2024)
- Permissions limited to: activeTab, storage, notifications
- Privacy policy published and linked in manifest
- No obfuscated code (violates CWS policy §4.8)
- Clear permission justifications in store listing

**Explicitly NOT Requested**: tabs, cookies, webRequest, history, <all_urls>

### VII. Measurable Success Criteria

System MUST define quantifiable success metrics for each feature and validate hypotheses with real user data before scaling.
System MUST instrument core user flows (scope input, detection events, change order generation, false positives) to enable data-driven decisions.

**Rationale**: Without metrics, we're optimizing blindly. Freelancers' time is valuable - broken features cause real financial harm. Data-driven decisions prevent feature bloat, identify usability issues early, and keep us focused on revenue impact.

**Core Metrics**:
| Metric | Target (MVP) | Decision Threshold |
|--------|--------------|-------------------|
| **Detection Accuracy** | 70%+ | <60% → Pause launch |
| **False Positive Rate** | <30% | >40% → Rework logic |
| **Change Orders Generated** | 40%+ of detections | <20% → UX problem |
| **$ Amount Tracked** | Avg $500/month per user | <$200 → Value prop unclear |

**Launch Gates**:
- 🚪 Gate 1 (Pre-launch): 70%+ accuracy on test corpus
- 🚪 Gate 2 (Week 1): 50+ installs, <5% uninstall rate
- 🚪 Gate 3 (Week 4): 100 active users, 40%+ generate change orders
- 🚪 Gate 4 (Month 2): <30% false positives, 4+ star rating

### VIII. Graceful Degradation

System MUST fail gracefully when errors occur (detection failures, storage quota exceeded, DOM mutations) and provide manual fallback options for all automated features.
System MUST display clear, actionable error messages that help users understand what went wrong and how to proceed.

**Rationale**: Heuristics produce false positives/negatives. Gmail/Slack update their DOM (breaks selectors). Chrome storage has 5MB quota (can fill up). Extensions can be disabled by corporate IT. Users must never be stuck without a workaround.

**Failure Modes & Fallbacks**:
| Failure Scenario | Fallback Behavior |
|-----------------|-------------------|
| **Detection fails** (regex error, timeout) | Show manual detection button |
| **Storage quota exceeded** (5MB limit) | Prompt to archive, offer CSV export |
| **DOM selector breaks** (Gmail update) | Disable highlighting, show notification-only |
| **Change order generation fails** | Provide blank template |
| **Content script blocked** (CSP violation) | Show extension icon badge with count |

## Development Workflow

### Test-First Approach
Detection logic MUST have unit tests written before implementation.
Tests MUST cover: normal cases, edge cases, false positives, performance.
TDD cycle: Write test → Test fails → Implement → Test passes → Refactor.

### Code Review Requirements
All changes MUST pass automated checks before merge:
- ESLint (no errors, max 5 warnings)
- Performance budget validated (bundle size <500KB)
- Manual testing on Gmail + Slack
- Constitutional compliance verified

### Quality Gates
| Gate | Requirement | Enforced By |
|------|-------------|-------------|
| **Pre-commit** | Lint passes, tests pass | Git hooks |
| **Pre-merge** | Code review approved, manual testing done | GitHub |
| **Pre-release** | Chrome Web Store submission review passed | Manual |

## Technical Constraints

### Technology Stack
- **Runtime**: Chrome Extension Manifest V3
- **Frontend**: HTML/CSS/JavaScript (vanilla, no frameworks for MVP)
- **Storage**: chrome.storage.local (5MB quota)
- **Build**: Vite for bundling
- **Testing**: Vitest for unit tests
- **No backend, no APIs, no databases**

### Performance Standards
- Extension bundle: <500KB
- Content script execution: <100ms
- Detection latency: <500ms (p95)
- Memory footprint: <50MB
- CPU usage: <5% average

### Security Requirements
- No eval() or Function() constructors
- No inline scripts (CSP compliant)
- No external script loading
- All user data encrypted at rest (chrome.storage.local handles this)
- Input sanitization for all user-entered data

## Governance

### Amendment Procedure
Constitutional amendments require:
1. Written proposal with rationale and impact analysis
2. Review of all dependent templates and documentation
3. Community feedback if 100+ users affected
4. Documentation in this file with version bump
5. Propagation to all templates and guidance files

### Versioning Policy (Semantic Versioning)
- **MAJOR** (2.0.0): Backward incompatible principle changes (e.g., remove Privacy-First)
- **MINOR** (1.1.0): New principle added or existing principle materially expanded
- **PATCH** (1.0.1): Clarifications, typos, wording fixes, non-semantic refinements

### Compliance Review
Every feature specification MUST include Constitution Check section validating adherence to all 8 principles.

**Constitution Check Format**:
```
## Constitution Check (Phase -1 Gate)

| Principle | Requirement | Status | Notes |
|-----------|-------------|--------|-------|
| I. Privacy-First | No data transmission | ✅/⚠️/❌ | ... |
| II. Simplicity-First | Heuristics only (MVP) | ✅/⚠️/❌ | ... |
...
```

**Status Definitions**:
- ✅ **PASS**: Fully compliant
- ⚠️ **WARN**: Partially compliant, document mitigation
- ❌ **FAIL**: Violates principle, blocks planning until resolved

### Conflict Resolution
When principles conflict, apply precedence hierarchy:
1. **Privacy-First** > All other principles (non-negotiable)
2. **User Value** > Technical elegance or feature completeness
3. **Simplicity** > Performance optimization (for MVP only)
4. **Zero Infrastructure** > Advanced features requiring backend

Document conflicts in Architecture Decision Records (ADRs).

**Version**: 1.0.0 | **Ratified**: 2025-11-06 | **Last Amended**: 2025-11-06
