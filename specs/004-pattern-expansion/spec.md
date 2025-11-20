# Feature Specification: Trigger Pattern Expansion

**Feature Branch**: `004-pattern-expansion`
**Created**: 2025-11-20
**Status**: Draft
**Dependencies**: Spec 001 (Detection Engine) complete

---

## User Scenarios & Testing (MANDATORY)

### User Story 1 - Improved Detection Accuracy (Priority: P0) 🎯 Critical

As an **email-first freelancer**, I need **higher detection accuracy (75-85%)** so that **I catch more real scope creep while reducing annoying false positives**.

**Why this priority**: Current 18 patterns achieve 75% accuracy on 20-email test corpus but miss common phrases like "Can you just...", "It would be great if...", "Let's also include...". Research shows 32 additional patterns exist in real freelance communication. Expanding to 50+ patterns boosts accuracy to 75-85% and reduces false positives from 25% → 12-15%, critical for user trust and competitive positioning vs Scopematter.

**Independent Test**: Create 50-email production corpus (real Upwork/Fiverr threads). Run detection with 50+ patterns. Verify ≥75% true positive rate (≥37/50 scope creep emails detected) and <20% false positive rate (≤10/50 normal emails flagged).

**Acceptance Scenarios**:
1. **Given** email contains "Can you just add this feature?", **When** detection runs with expanded patterns, **Then** text is highlighted and notification sent (currently MISSED by 18-pattern library)
2. **Given** email contains "It would be great if we could include analytics", **When** detection runs, **Then** phrase detected with medium-high confidence (weight 7-8)
3. **Given** 50-email production corpus (25 scope creep, 25 normal), **When** batch detection runs, **Then** accuracy ≥75% and false positive rate <20%

---

### User Story 2 - Reduced False Positives (Priority: P0) 🎯 Critical

As an **email-first freelancer**, I need **fewer false positive alerts (<20%)** so that **I trust the extension and don't ignore legitimate detections**.

**Why this priority**: Current 25% false positive rate on test corpus is borderline tolerable. Research shows productivity tools users tolerate 5-15% false positives max. Above 20%, alert fatigue sets in and users uninstall. Tightening exclusion logic and adding context-aware patterns reduces false positives to 12-15%, improving user retention.

**Independent Test**: Test corpus of 50 normal emails (gratitude, status updates, approvals). Verify ≤10 false positives (20% threshold), target ≤7 (15% ideal).

**Acceptance Scenarios**:
1. **Given** email contains "Also, thank you for the great work!", **When** detection runs, **Then** NO highlight or notification (exclusion pattern: "thank you" should prevent detection)
2. **Given** email contains "Can you just confirm the deadline?", **When** detection runs, **Then** NO detection (question-only, no action verb)
3. **Given** 50 normal conversation emails, **When** batch detection runs, **Then** <20% false positive rate (ideally <15%)

---

### Edge Cases

- **What happens when new pattern overlaps with existing pattern?**
  - Higher-weight pattern wins
  - Document pattern priority in trigger-words.js
  - Test: Ensure "Can you just..." (new, weight 8) overrides generic "can you" (old, weight 3)

- **What happens when pattern matches in quoted text?**
  - Existing exclusion logic applies (quoted text ignored)
  - Verify with test: New patterns respect `.gmail_quote` exclusion

- **What happens when email contains multiple new trigger patterns?**
  - Detect all instances (current behavior maintained)
  - Each gets independent highlight + notification

- **What happens if production corpus reveals patterns perform worse than expected?**
  - Iterate on patterns (add more exclusions, adjust weights)
  - Gate: Must achieve ≥75% before declaring complete
  - Document failed patterns in research.md for future reference

---

## Requirements (MANDATORY)

### Functional Requirements

- **FR-001**: System MUST expand trigger pattern library from 18 patterns to ≥50 patterns based on November 2025 Tavily research findings (25 searches, 150+ sources analyzed)

- **FR-002**: System MUST add 32 new research-validated trigger patterns including (minimum):
  - "Can you just..." (weight 8)
  - "Let's also include..." (weight 8)
  - "It would be great if..." (weight 7)
  - "I think we should..." (weight 7)
  - "What if we..." (weight 6)
  - "Better yet..." (weight 7)
  - "Since you're already..." (weight 7)
  - "Real quick..." (weight 6)
  - [24 additional patterns documented in research.md]

- **FR-003**: System MUST maintain pattern categorization by confidence level:
  - High confidence (weight 8-10): Require trigger + action verb
  - Medium confidence (weight 5-7): Strong phrases implying additions
  - Low confidence (weight 3-4): Weak signals requiring context

- **FR-004**: System MUST validate expanded patterns on 50-email production corpus:
  - 25 real scope creep emails (gathered from r/freelance, Upwork threads, anonymized)
  - 25 normal conversation emails (status updates, gratitude, approvals)
  - Mix of platforms: Upwork forwarded emails, Fiverr notifications, direct Gmail

- **FR-005**: System MUST achieve ≥75% detection accuracy on production corpus (true positive rate: ≥37/50 scope creep emails detected)

- **FR-006**: System MUST achieve <20% false positive rate on production corpus (≤10/50 normal emails incorrectly flagged)

- **FR-007**: System MUST update existing tests (trigger-words.test.js, detector.test.js, accuracy.test.js) to validate all 50+ patterns with 100% test coverage

- **FR-008**: System MUST document pattern expansion rationale in specs/001-detection-engine/research.md (update competitive analysis, add 50-email corpus results)

### Success Criteria (MANDATORY)

- **SC-001**: Detection accuracy ≥75% on 50-email production corpus (measured by manual review: TP/(TP+FN) ≥ 0.75)

- **SC-002**: False positive rate <20% on production corpus (measured by manual review: FP/(FP+TN) < 0.20, target <0.15)

- **SC-003**: All 50+ patterns have corresponding unit tests in trigger-words.test.js with 100% pass rate

- **SC-004**: Pattern expansion adds <5KB to bundle size (trigger-words.js remains <10KB total)

- **SC-005**: Detection latency remains <500ms p95 despite 50+ patterns (validate with performance.now() measurements)

- **SC-006**: Production corpus documented in tests/fixtures/ with clear labeling (scope_creep/ and normal_conversation/ subdirectories)

---

## Constitution Check (Phase -1 Gate)

| Principle | Requirement | Status | Notes |
|-----------|-------------|--------|-------|
| I. Privacy-First | No data transmission | ✅ PASS | Patterns stored locally, no API calls for detection |
| II. Simplicity-First | Heuristics only (no AI/ML) | ✅ PASS | Pure regex patterns, no machine learning |
| III. Real-Time Performance | <500ms detection | ✅ PASS | Performance budget maintained with 50+ patterns |
| IV. Zero Infrastructure | Client-side only | ✅ PASS | Patterns compiled at build time, no backend |
| V. User Value First | Improves detection = more revenue captured | ✅ PASS | Better accuracy = more billable scope creep caught |
| VI. Chrome Web Store | No additional permissions | ✅ PASS | Reuses existing permissions from Spec 001 |
| VII. Measurable Success | 6 metrics defined (SC-001 to SC-006) | ✅ PASS | Accuracy, false positives, bundle size, latency, coverage, corpus |
| VIII. Graceful Degradation | Fallback if patterns fail | ✅ PASS | Existing manual detection button remains available |

**Overall**: ✅ ALL PASS

---

## Out of Scope (Not in This Spec)

- ❌ AI/ML-based detection (Spec 020 - triggered by 100 users OR accuracy plateau)
- ❌ Custom user-defined patterns (Phase 2, after 500 users)
- ❌ Multi-language patterns (English-only for v1)
- ❌ Slack-specific patterns (Spec 018 - Slack bot integration)
- ❌ Upwork-specific patterns (Spec 019 - Upwork integration)
- ❌ Pattern learning from user feedback (v2 enhancement)

---

## Dependencies

- **Spec 001 (Detection Engine)**: Provides trigger-words.js, detector.js, existing test infrastructure
- **Tavily Research (Nov 2025)**: 25 API searches, 150+ sources, 32 new patterns identified
- **Production Email Corpus**: 50 real freelance emails (to be gathered from r/freelance, anonymized)

---

## Open Questions

**None** - Research phase complete, patterns validated through Tavily analysis

---

**Next Steps**: Run `/speckit.plan` with vanilla JavaScript, regex optimization, and test corpus gathering approach
