# Spec-Kit: Specify (Stage 1)

You are now in **Stage 1: Specification** of the Spec-Driven Development workflow.

## Your Task

Create a comprehensive feature specification for the requested feature. The specification must be **technology-agnostic** and focus on WHAT needs to be built, not HOW.

## Context

- **Project**: ScopeShield - Chrome extension for detecting scope creep in freelance projects
- **Constitution**: memory/constitution.md (8 core principles)
- **Feature Directory**: specs/###-feature-name/
- **Output File**: specs/###-feature-name/spec.md

## Specification Template

Create a spec.md file with the following structure:

```markdown
# Feature: [Feature Name]

**Feature ID**: ###-feature-name
**Status**: Specifying
**Created**: [ISO Date]
**Last Updated**: [ISO Date]

## Problem Statement

[What user problem does this solve? Be specific with user research/data]

## User Stories

### Primary User Story
As a [user type],
I want to [action],
So that [benefit/value].

**Acceptance Criteria**:
- [ ] [Specific, testable criterion]
- [ ] [Specific, testable criterion]
- [ ] [Specific, testable criterion]

### Secondary User Stories (if applicable)
[Additional user stories following same format]

## Success Metrics

| Metric | Target | Measurement Method |
|--------|--------|-------------------|
| [Metric name] | [Quantifiable target] | [How to measure] |
| [Metric name] | [Quantifiable target] | [How to measure] |
| [Metric name] | [Quantifiable target] | [How to measure] |

**Minimum**: ≥3 metrics required per Constitution Principle VII

## Functional Requirements

### Must Have (P0)
- REQ-001: [Requirement description]
- REQ-002: [Requirement description]

### Should Have (P1)
- REQ-003: [Requirement description]

### Could Have (P2)
- REQ-004: [Requirement description]

## Non-Functional Requirements

### Performance
- [Performance requirement with specific target]

### Security
- [Security requirement]

### Privacy
- [Privacy requirement - CRITICAL per Constitution]

### Usability
- [Usability requirement]

## Edge Cases & Error Handling

| Edge Case | Expected Behavior |
|-----------|------------------|
| [Scenario] | [How system should respond] |

## Dependencies

- **Blocks**: [List of features that depend on this]
- **Blocked By**: [List of features this depends on]
- **Related**: [Related features]

## Out of Scope

[Explicitly state what this feature will NOT include to prevent scope creep]

## Constitution Check (Phase -1 Gate)

| Principle | Requirement | Status | Notes |
|-----------|-------------|--------|-------|
| I. Privacy-First | No data transmission | ✅/⚠️/❌ | [Details] |
| II. Simplicity-First | Heuristics only (MVP) | ✅/⚠️/❌ | [Details] |
| III. Real-Time Performance | <500ms detection | ✅/⚠️/❌ | [Details] |
| IV. Zero Infrastructure | Client-side only | ✅/⚠️/❌ | [Details] |
| V. User Value First | Helps freelancers earn | ✅/⚠️/❌ | [Details] |
| VI. Chrome Web Store | Manifest V3, min permissions | ✅/⚠️/❌ | [Details] |
| VII. Measurable Success | ≥3 metrics defined | ✅/⚠️/❌ | [Details] |
| VIII. Graceful Degradation | Fallback for failures | ✅/⚠️/❌ | [Details] |

**Status Definitions**:
- ✅ **PASS**: Fully compliant
- ⚠️ **WARN**: Partially compliant, document mitigation
- ❌ **FAIL**: Violates principle, blocks planning until resolved

**Gate Decision**: [PASS/WARN/FAIL] - [Explanation]

## Open Questions

- [ ] [Question requiring clarification before planning]
- [ ] [Question requiring clarification before planning]

## Next Steps

After specification is complete:
1. Run `/speckit.clarify` to resolve open questions
2. Then run `/speckit.plan` to generate implementation plan
```

## Instructions

1. **Determine Feature Number**: Check existing specs/ directory for the next sequential number (001, 002, 003...)
2. **Create Feature Directory**: mkdir -p specs/###-feature-name/
3. **Generate Specification**: Create spec.md following the template above
4. **Validate Against Constitution**: Complete the Constitution Check table honestly
5. **Identify Open Questions**: List any ambiguities that need clarification

## Constitutional Requirements

- **Must include**: Problem statement, user stories, ≥3 success metrics, acceptance criteria
- **Must validate**: All 8 constitutional principles (no ❌ FAIL allowed)
- **Must be technology-agnostic**: No mention of specific implementation details (functions, classes, APIs)
- **Must be testable**: All requirements should have clear pass/fail criteria

## Example Feature Numbers

- 001-scope-input-storage
- 002-detection-engine
- 003-visual-highlighting
- 004-change-order-generator
- 005-dashboard-popup

## Output

After creating the specification:
1. Display the Constitution Check summary
2. List the Open Questions count
3. Recommend running `/speckit.clarify` if open questions exist

---

**Ready to specify a feature.** What feature should I create a specification for?
