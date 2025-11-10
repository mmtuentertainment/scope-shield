# Spec-Kit: Plan (Stage 3)

You are now in **Stage 3: Planning** of the Spec-Driven Development workflow.

## Your Task

Generate a detailed implementation plan that translates the technology-agnostic specification into concrete technical architecture, data models, and implementation contracts.

## Context

- **Project**: ScopeShield
- **Tech Stack**: Chrome Extension Manifest V3, Vanilla JavaScript, Vite, Vitest
- **Constitution**: memory/constitution.md
- **Input**: specs/###-feature-name/spec.md (must be clarified first)
- **Output**: specs/###-feature-name/plan.md

## Pre-Planning Validation

Before planning, verify:
- [ ] Specification exists and is complete
- [ ] `/speckit.clarify` has been run (no open questions)
- [ ] Constitution Check shows no ❌ FAIL status
- [ ] All requirements have acceptance criteria

## Plan Template

Create plan.md with the following structure:

```markdown
# Implementation Plan: [Feature Name]

**Feature ID**: ###-feature-name
**Status**: Planning Complete
**Created**: [ISO Date]
**Last Updated**: [ISO Date]

## Architecture Overview

### Component Diagram

```
[ASCII diagram showing components and their relationships]
```

### Component Descriptions

**Component 1: [Name]**
- **Purpose**: [What it does]
- **Location**: src/[path]/[file].js
- **Responsibilities**: [List of responsibilities]
- **Dependencies**: [List of dependencies]

[Repeat for each component]

### Data Flow

1. [Step 1: User action triggers...]
2. [Step 2: Component X processes...]
3. [Step 3: Data stored in...]
4. [Step 4: UI updates with...]

## Data Model

See: specs/###-feature-name/data-model.md

**Summary**:
- [Entity 1]: [Brief description]
- [Entity 2]: [Brief description]

### Storage Schema

**chrome.storage.local structure**:
```json
{
  "scopeShield": {
    "entity1": {
      "field1": "type",
      "field2": "type"
    }
  }
}
```

**Size estimate**: [X KB] per [unit] (quota: 5MB)

## API Contracts

See: specs/###-feature-name/contracts/

**Summary**:
- `function1()`: [Purpose]
- `function2()`: [Purpose]

### Core Functions

#### Function: `functionName(param1, param2)`

**Purpose**: [What this function does]

**Input**:
- `param1` (type): [Description]
- `param2` (type): [Description]

**Output**:
- Returns: (type): [Description]
- Throws: [Error types and when]

**Side Effects**: [Any state changes or storage updates]

**Performance**: [Target execution time]

## File Structure

```
src/
├── [component-directory]/
│   ├── [file1].js          # [Purpose]
│   ├── [file2].js          # [Purpose]
│   └── [file3].css         # [Purpose]
└── utils/
    └── [utility].js        # [Purpose]

tests/
└── [component-directory]/
    └── [file1].test.js     # [Test coverage]
```

## Implementation Phases

### Phase 1: Core Infrastructure
**Estimated time**: [X hours]
- [ ] Create file structure
- [ ] Define data models
- [ ] Set up storage utilities
- [ ] Write unit tests for utilities

### Phase 2: Business Logic
**Estimated time**: [X hours]
- [ ] Implement core algorithm
- [ ] Add error handling
- [ ] Write integration tests

### Phase 3: UI Integration
**Estimated time**: [X hours]
- [ ] Create UI components
- [ ] Connect to business logic
- [ ] Add visual feedback
- [ ] Test on Gmail/Slack

### Phase 4: Polish & Optimization
**Estimated time**: [X hours]
- [ ] Performance optimization
- [ ] Edge case handling
- [ ] Accessibility improvements
- [ ] Documentation

**Total Estimated Time**: [Sum] hours

## Technical Decisions

### Decision 1: [Topic]
**Chosen**: [Option]
**Rationale**: [Why, with constitutional alignment]
**Trade-offs**: [What we're giving up]

[Repeat for major decisions]

## Performance Budget

| Operation | Target (p95) | Maximum (p99) | Strategy |
|-----------|--------------|---------------|----------|
| [Operation] | [Time] | [Time] | [How to achieve] |

## Error Handling Strategy

| Error Type | Detection | Recovery | User Feedback |
|------------|-----------|----------|---------------|
| [Error scenario] | [How to detect] | [Fallback behavior] | [What user sees] |

## Testing Strategy

### Unit Tests
- **Coverage target**: 80%+
- **Files**: [List test files]
- **Key test cases**: [List critical scenarios]

### Integration Tests
- **Scope**: [What to test end-to-end]
- **Test data**: [How to generate/mock]

### Manual Testing
- **Platforms**: Gmail (Chrome), Slack (Chrome)
- **Test scenarios**: [List user flows to verify]

## Security Considerations

- **Input validation**: [What inputs to sanitize]
- **XSS prevention**: [How to prevent injection]
- **CSP compliance**: [Any CSP concerns]
- **Permissions**: [What permissions required and why]

## Accessibility

- **Keyboard navigation**: [How to support]
- **Screen readers**: [ARIA labels needed]
- **Color contrast**: [WCAG compliance]

## Dependencies

### External Libraries
- [Library name]: [Version, purpose, bundle size impact]

### Internal Dependencies
- [Component this depends on]

## Rollout Plan

1. **Development**: [Timeline]
2. **Testing**: [Who tests, what scenarios]
3. **Deployment**: Build and load unpacked
4. **Validation**: Check metrics after [time period]

## Risks & Mitigations

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| [Risk description] | High/Med/Low | High/Med/Low | [How to mitigate] |

## Open Implementation Questions

- [ ] [Technical question needing resolution during implementation]

## Next Steps

After planning is complete:
1. Run `/speckit.tasks` to generate atomic task breakdown
2. Review plan with team/stakeholders if needed
3. Run `/speckit.implement` to begin implementation

---

## Validation Checklist

Before marking plan as complete:
- [ ] All components identified with clear responsibilities
- [ ] Data model defined with storage estimates
- [ ] Function signatures documented
- [ ] File structure planned
- [ ] Performance targets set for all operations
- [ ] Error handling strategy defined
- [ ] Test strategy covers unit + integration + manual
- [ ] Constitutional compliance maintained
- [ ] Total time estimate provided
```

## Instructions

1. **Read Specification**: Load specs/###-feature-name/spec.md
2. **Design Architecture**: Plan components, data flow, and interactions
3. **Create Data Model**: Define entities and storage schema → data-model.md
4. **Define Contracts**: Specify function signatures → contracts/
5. **Estimate Effort**: Break into phases with time estimates
6. **Document Decisions**: Explain technical choices with rationale
7. **Set Performance Budgets**: Specific targets aligned with constitution
8. **Plan Testing**: Unit, integration, and manual test strategies
9. **Validate**: Check against constitutional principles
10. **Generate plan.md**: Write comprehensive plan document

## Supporting Files to Create

### data-model.md

```markdown
# Data Model: [Feature Name]

## Entity: [EntityName]

**Purpose**: [What this entity represents]

**Fields**:
- `field1` (type, required): [Description]
- `field2` (type, optional): [Description]

**Relationships**: [How this relates to other entities]

**Storage Location**: chrome.storage.local.scopeShield.[key]

**Size Estimate**: [X bytes per instance]

[Repeat for each entity]
```

### contracts/[component].md

Document key function signatures and contracts for each component.

## Architecture Patterns to Consider

**For Chrome Extensions**:
- Service worker for background tasks
- Content scripts for page injection
- Message passing between components
- Storage event listeners for sync

**For ScopeShield specifically**:
- Observer pattern for DOM monitoring
- Strategy pattern for multiple detection algorithms
- Template pattern for change order generation
- Singleton pattern for storage manager

## Constitutional Alignment

Every technical decision must answer:
1. **Privacy**: Does this keep data local?
2. **Simplicity**: Is this the simplest approach?
3. **Performance**: Does this meet <500ms targets?
4. **Infrastructure**: Does this avoid backend needs?
5. **Value**: Does this help freelancers earn more?

---

**Ready to plan.** Which feature should I create an implementation plan for?
