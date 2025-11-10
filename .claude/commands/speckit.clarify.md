# Spec-Kit: Clarify (Stage 2)

You are now in **Stage 2: Clarification** of the Spec-Driven Development workflow.

## Your Task

Resolve all open questions and ambiguities in the feature specification BEFORE moving to the planning stage. This is a **CRITICAL gate** - planning with unresolved ambiguities leads to rework and technical debt.

## Context

- **Project**: ScopeShield
- **Constitution**: memory/constitution.md
- **Current Spec**: specs/###-feature-name/spec.md
- **Output**: Updated spec.md with resolved questions

## Clarification Process

### 1. Review Open Questions

Read the current specification and identify:
- Open questions listed in the "Open Questions" section
- Ambiguous requirements that could be interpreted multiple ways
- Missing acceptance criteria or success metrics
- Constitutional concerns marked as ⚠️ or ❌
- Edge cases without defined behavior

### 2. Resolution Strategy

For each open question, determine:

**A. Can be resolved through research?**
- Check existing codebase
- Review Chrome Extension documentation
- Check Gmail/Slack DOM structure
- Review competitor approaches

**B. Requires architectural decision?**
- Propose 2-3 alternatives
- Evaluate trade-offs (performance, complexity, maintainability)
- Recommend best option with rationale

**C. Requires user input?**
- Ask specific, focused questions
- Provide context and options
- Explain implications of each choice

### 3. Update Specification

After resolving questions:
- Update spec.md with clarifications
- Mark resolved questions as ✅
- Add new requirements if needed
- Update Constitution Check if status changed
- Bump "Last Updated" date

## Decision Framework

When making architectural decisions, apply constitutional precedence:

1. **Privacy-First** > All other principles (non-negotiable)
2. **User Value** > Technical elegance or feature completeness
3. **Simplicity** > Performance optimization (for MVP only)
4. **Zero Infrastructure** > Advanced features requiring backend

Document decisions in format:

```markdown
## Decision: [Topic]

**Question**: [What needs to be decided?]

**Options**:
1. Option A: [Description]
   - Pros: [List]
   - Cons: [List]
   - Constitutional impact: [Analysis]

2. Option B: [Description]
   - Pros: [List]
   - Cons: [List]
   - Constitutional impact: [Analysis]

**Decision**: Option [A/B] selected

**Rationale**: [Why this option aligns best with constitution and user value]
```

## Common Clarification Topics

### For Detection Engine
- Which trigger words/phrases to use?
- How to handle false positives?
- What detection threshold to use?
- How to store detected messages?

### For UI Components
- Where to place visual indicators?
- What colors/styles to use?
- How to handle conflicts with Gmail/Slack UI?
- Mobile vs desktop behavior?

### For Storage
- What data structure to use?
- How to handle 5MB storage quota?
- When to archive old data?
- What fields are required?

### For Performance
- What is acceptable detection latency?
- How to optimize DOM scanning?
- When to debounce/throttle operations?
- How to measure performance?

## Output Format

After clarification:

```markdown
## Clarification Summary

**Total Questions**: [Number]
**Resolved**: [Number] ✅
**Requires User Input**: [Number] ❓
**Status**: [READY FOR PLANNING / BLOCKED]

### Resolved Questions

1. ✅ [Question] → [Resolution]
2. ✅ [Question] → [Resolution]

### Questions for User

1. ❓ [Question requiring user input]
   - Option A: [Description]
   - Option B: [Description]
   - Recommendation: [Your suggestion]

### Constitutional Impact

[Any changes to Constitution Check status]

## Next Steps

- If READY FOR PLANNING: Run `/speckit.plan`
- If BLOCKED: Wait for user responses, then re-run `/speckit.clarify`
```

## Quality Gates

Before marking as "READY FOR PLANNING":
- [ ] All open questions resolved or have clear user input requests
- [ ] All requirements have specific, testable acceptance criteria
- [ ] ≥3 success metrics defined with measurement methods
- [ ] Constitution Check has no ❌ FAIL status
- [ ] Edge cases have defined behavior
- [ ] No ambiguous terms like "fast", "good", "simple" without quantification

## Instructions

1. **Read Current Spec**: Load specs/###-feature-name/spec.md
2. **Identify Ambiguities**: List all unclear or missing information
3. **Research Where Possible**: Use available tools to resolve questions
4. **Make Decisions**: Apply constitutional framework for architectural choices
5. **Ask User for Guidance**: On business decisions or unclear requirements
6. **Update Specification**: Write clarifications back to spec.md
7. **Generate Summary**: Report clarification status

---

**Ready to clarify.** Which feature specification should I clarify?
