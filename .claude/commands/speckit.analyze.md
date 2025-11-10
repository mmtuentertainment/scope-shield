# Spec-Kit: Analyze (Stage 6)

You are now in **Stage 6: Analysis** of the Spec-Driven Development workflow.

## Your Task

Validate cross-artifact consistency across spec.md, plan.md, tasks.md, and implementation code. Identify gaps, inconsistencies, and potential issues before they become bugs.

## Context

- **Project**: ScopeShield
- **Input Files**:
  - specs/###-feature-name/spec.md
  - specs/###-feature-name/plan.md
  - specs/###-feature-name/tasks.md
  - src/ (implementation code)
- **Output**: Analysis report with findings and recommendations

## When to Run Analysis

- **Before Implementation**: Validate planning artifacts are consistent
- **During Implementation**: Check code aligns with plan
- **After Implementation**: Verify all requirements met
- **Before PR/Commit**: Final validation

## Analysis Checklist

### 1. Specification Completeness

- [ ] All user stories have acceptance criteria
- [ ] ≥3 success metrics defined
- [ ] Constitution Check completed (no ❌ FAIL)
- [ ] Edge cases documented
- [ ] Non-functional requirements specified
- [ ] Out of scope explicitly stated

### 2. Plan Alignment with Spec

- [ ] All functional requirements mapped to components
- [ ] Data model supports all user stories
- [ ] Performance budgets align with constitution
- [ ] Error handling covers all edge cases
- [ ] Testing strategy covers acceptance criteria
- [ ] Function contracts match requirements

### 3. Task Completeness

- [ ] All planned components have tasks
- [ ] Every function in contracts has implementation task
- [ ] Test tasks for each feature task
- [ ] Dependencies correctly ordered
- [ ] Time estimates realistic
- [ ] All tasks have acceptance criteria

### 4. Code Alignment with Plan

- [ ] File structure matches plan
- [ ] Function signatures match contracts
- [ ] Data model implemented as specified
- [ ] Performance meets budgets
- [ ] Error handling implemented
- [ ] Tests cover acceptance criteria

### 5. Constitutional Compliance

- [ ] Privacy: No data transmission detected
- [ ] Simplicity: No unnecessary complexity
- [ ] Performance: Meets <500ms targets
- [ ] Infrastructure: No backend dependencies
- [ ] User Value: Feature helps freelancers earn
- [ ] Chrome Web Store: Compliant with policies
- [ ] Measurable: Success metrics instrumentable
- [ ] Graceful Degradation: Fallbacks implemented

## Analysis Report Template

```markdown
# Analysis Report: [Feature Name]

**Feature ID**: ###-feature-name
**Analysis Date**: [ISO Date]
**Artifacts Analyzed**: spec.md, plan.md, tasks.md, [code files]
**Overall Status**: ✅ PASS / ⚠️ WARNINGS / ❌ ISSUES FOUND

---

## Executive Summary

[1-2 paragraph summary of key findings]

**Critical Issues**: [Number]
**Warnings**: [Number]
**Recommendations**: [Number]

---

## Detailed Findings

### Category 1: Specification Completeness

**Status**: ✅ PASS / ⚠️ WARN / ❌ FAIL

**Findings**:
- ✅ [What's good]
- ⚠️ [What needs attention]
- ❌ [What's broken]

**Recommendations**:
1. [Action item]
2. [Action item]

---

### Category 2: Spec ↔ Plan Alignment

**Status**: ✅ PASS / ⚠️ WARN / ❌ FAIL

**Gaps Identified**:
| Requirement | Spec | Plan | Issue |
|-------------|------|------|-------|
| REQ-001 | ✅ | ❌ | No component assigned |
| REQ-002 | ✅ | ⚠️ | Partially addressed |

**Recommendations**:
1. [Action item]

---

### Category 3: Plan ↔ Tasks Alignment

**Status**: ✅ PASS / ⚠️ WARN / ❌ FAIL

**Coverage Analysis**:
- **Components planned**: [Number]
- **Components with tasks**: [Number]
- **Coverage**: [Percentage]%

**Missing Tasks**:
- [Component] → No tasks defined
- [Function] → No implementation task

**Recommendations**:
1. [Action item]

---

### Category 4: Code ↔ Plan Alignment

**Status**: ✅ PASS / ⚠️ WARN / ❌ FAIL

**Implementation Status**:
| Planned Component | File | Status | Issues |
|-------------------|------|--------|--------|
| Detector | src/utils/detector.js | ✅ Complete | None |
| Storage | src/utils/storage.js | ⚠️ Partial | Missing error handling |

**Contract Violations**:
- Function `detectScopeCreep()` signature doesn't match plan
- Missing return type validation in `generateChangeOrder()`

**Recommendations**:
1. [Action item]

---

### Category 5: Constitutional Compliance

**Status**: ✅ PASS / ⚠️ WARN / ❌ FAIL

| Principle | Status | Evidence | Issue |
|-----------|--------|----------|-------|
| I. Privacy-First | ✅ | No network calls found | - |
| II. Simplicity | ✅ | Only keyword matching used | - |
| III. Performance | ⚠️ | Detection: 600ms (target: 500ms) | Exceeds budget |
| IV. Infrastructure | ✅ | No backend code | - |
| V. User Value | ✅ | Generates change orders | - |
| VI. Chrome Web Store | ✅ | Manifest V3, min permissions | - |
| VII. Measurable | ⚠️ | Only 2 metrics instrumented | Need 1 more |
| VIII. Graceful Degradation | ❌ | No fallback for detection failure | Missing |

**Recommendations**:
1. Optimize detection to meet 500ms target
2. Add third success metric tracking
3. Implement manual detection fallback button

---

### Category 6: Testing Coverage

**Status**: ✅ PASS / ⚠️ WARN / ❌ FAIL

**Test Coverage**:
- **Unit tests**: [X]% coverage (target: 80%)
- **Integration tests**: [Number] scenarios
- **Manual tests**: [Number] flows documented

**Acceptance Criteria Coverage**:
| User Story | Criteria | Tests | Coverage |
|------------|----------|-------|----------|
| US-001 | 5 criteria | 4 tests | 80% |
| US-002 | 3 criteria | 3 tests | 100% |

**Missing Tests**:
- Edge case: Empty message input
- Error case: Storage quota exceeded
- Performance: Detection under load

**Recommendations**:
1. [Action item]

---

## Risk Assessment

| Risk | Severity | Likelihood | Impact | Mitigation |
|------|----------|------------|--------|------------|
| [Risk] | High/Med/Low | High/Med/Low | [Description] | [Action] |

---

## Action Items

### Critical (Must Fix Before Merge)
1. [ ] [Action with owner and deadline]
2. [ ] [Action with owner and deadline]

### Important (Should Fix)
1. [ ] [Action]
2. [ ] [Action]

### Nice to Have (Can Defer)
1. [ ] [Action]
2. [ ] [Action]

---

## Metrics

**Artifact Quality Scores**:
- Specification: [X]/100
- Plan: [X]/100
- Tasks: [X]/100
- Implementation: [X]/100
- Overall: [X]/100

**Time Investment**:
- Estimated (from tasks): [X] hours
- Actual (if implemented): [X] hours
- Variance: [±X]%

---

## Conclusion

[Final assessment and go/no-go recommendation]

**Recommendation**: ✅ APPROVED / ⚠️ APPROVED WITH CONDITIONS / ❌ REQUIRES REWORK

**Next Steps**:
1. [Next action]
2. [Next action]

---

**Analyzed by**: Claude (Spec-Kit v1.0)
**Report Version**: 1.0
```

## Analysis Techniques

### Requirement Traceability Matrix

Track each requirement from spec → plan → tasks → code:

```
REQ-001: Detect scope creep in messages
  ├─ Plan: Component "Detector" (src/utils/detector.js)
  │   └─ Function: detectScopeCreep(message)
  ├─ Tasks: Task 005 (Implement keyword matching)
  └─ Code: ✅ Implemented, tested
```

### Dependency Analysis

Visualize dependencies and identify circular dependencies or missing links:

```
spec.md (defines WHAT)
  └─→ plan.md (defines HOW)
       └─→ tasks.md (defines STEPS)
            └─→ code (implements STEPS)
```

### Gap Analysis

Compare artifacts to find missing elements:

```
Spec Requirements: 10
Plan Components:    9  ← Missing 1 requirement mapping
Task Count:        15
Code Files:        12  ← Missing 3 planned components
```

## Common Issues to Look For

### Specification Issues
- Vague requirements ("fast", "good", "easy")
- Missing acceptance criteria
- Undefined edge cases
- Unmeasurable success metrics

### Plan Issues
- Components without clear responsibilities
- Missing error handling strategy
- Unrealistic performance budgets
- No testing strategy

### Task Issues
- Tasks too large (>90 min)
- Missing dependencies
- No acceptance criteria
- Unclear "done" definition

### Implementation Issues
- Code doesn't match function contracts
- Missing error handling
- Performance not validated
- Tests don't cover acceptance criteria

## Instructions

1. **Gather Artifacts**: Read spec.md, plan.md, tasks.md, and relevant code
2. **Run Checklist**: Go through all 5 analysis categories
3. **Identify Issues**: Document ❌ failures and ⚠️ warnings
4. **Assess Severity**: Categorize as Critical/Important/Nice-to-Have
5. **Generate Report**: Create comprehensive analysis report
6. **Provide Recommendations**: Specific, actionable fixes
7. **Make Decision**: Approve, approve with conditions, or require rework

---

**Ready to analyze.** Which feature should I analyze for consistency?
