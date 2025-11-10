# Spec-Kit: Tasks (Stage 4)

You are now in **Stage 4: Task Breakdown** of the Spec-Driven Development workflow.

## Your Task

Break down the implementation plan into atomic, dependency-ordered tasks that can be completed in 30-90 minutes each. This enables parallel work, clear progress tracking, and easier debugging.

## Context

- **Project**: ScopeShield
- **Input**: specs/###-feature-name/plan.md (must exist)
- **Output**: specs/###-feature-name/tasks.md

## Pre-Task Validation

Before creating tasks, verify:
- [ ] plan.md exists and is complete
- [ ] Architecture is clearly defined
- [ ] Data model documented
- [ ] Function contracts specified
- [ ] Testing strategy defined

## Tasks Template

Create tasks.md with the following structure:

```markdown
# Tasks: [Feature Name]

**Feature ID**: ###-feature-name
**Status**: Ready for Implementation
**Created**: [ISO Date]
**Total Tasks**: [Number]
**Estimated Time**: [X hours]

## Task Categories

### 🏗️ Infrastructure (Tasks 1-X)
Setup, configuration, and foundational code

### 🧠 Business Logic (Tasks X-Y)
Core algorithms and functionality

### 🎨 UI/UX (Tasks Y-Z)
User interface and visual elements

### 🧪 Testing (Tasks Z-N)
Unit tests, integration tests, manual testing

### 📝 Documentation (Tasks N-M)
Code comments, user docs, technical docs

## Task List

---

### Task 001: [Task Title]

**Category**: 🏗️ Infrastructure
**Estimated Time**: 45 minutes
**Priority**: P0 (Blocking)
**Status**: ⬜ Not Started

**Description**:
[Clear, specific description of what needs to be done]

**Acceptance Criteria**:
- [ ] [Specific, testable criterion]
- [ ] [Specific, testable criterion]
- [ ] [Specific, testable criterion]

**Dependencies**: None (or Task ###, Task ###)

**Files to Create/Modify**:
- `src/path/file.js` - [Purpose]
- `tests/path/file.test.js` - [Purpose]

**Implementation Notes**:
- [Technical hint or consideration]
- [Performance consideration]
- [Edge case to handle]

**Validation**:
```bash
# Commands to verify task completion
npm test path/file.test.js
```

---

[Repeat for each task]

---

## Dependency Graph

```
Task 001 (Foundation)
  ├─→ Task 002 (Data Model)
  │     ├─→ Task 005 (Business Logic)
  │     └─→ Task 006 (Storage Tests)
  └─→ Task 003 (Utilities)
        └─→ Task 004 (UI Components)
```

## Implementation Order

**Phase 1: Foundation** (Parallel)
- Task 001, 003 can be done simultaneously

**Phase 2: Core** (Sequential)
- Task 002 → Task 005 (depends on data model)

**Phase 3: Integration** (Parallel)
- Task 004, 006 can be done after Phase 2

**Phase 4: Testing** (Sequential)
- All tests after core implementation

## Progress Tracking

| Task | Status | Assignee | Hours | Completed |
|------|--------|----------|-------|-----------|
| 001 | ⬜ | - | 0.75 | - |
| 002 | ⬜ | - | 1.0 | - |
| 003 | ⬜ | - | 0.5 | - |

**Legend**:
- ⬜ Not Started
- 🟦 In Progress
- ✅ Completed
- ⚠️ Blocked

## Quick Start Guide

**To begin implementation**:
1. Start with Task 001 (foundation tasks have no dependencies)
2. Run tests after each task to validate
3. Update task status in this file
4. Move to next task in dependency order

**For parallel work**:
- Tasks with no shared dependencies can be done simultaneously
- Check dependency graph before starting

## Risk Register

| Task | Risk | Mitigation |
|------|------|------------|
| [Task #] | [What could go wrong] | [How to prevent/handle] |

## Definition of Done (DoD)

A task is considered complete when:
- [ ] All acceptance criteria met
- [ ] Code written and follows style guide
- [ ] Unit tests written and passing
- [ ] No new linter errors introduced
- [ ] Code reviewed (if team project)
- [ ] Manual testing completed (if UI task)
- [ ] Documentation updated (if public API)
- [ ] Performance validated (if performance-critical)

## Next Steps

After tasks are defined:
1. Review task breakdown with stakeholders (if applicable)
2. Run `/speckit.implement` to begin implementation
3. Update task statuses as you progress
```

## Task Writing Guidelines

### Atomic Tasks

Each task should:
- Be completable in 30-90 minutes
- Have a clear start and end point
- Produce testable output
- Be independent or have explicit dependencies

**Too large**: "Implement detection engine"
**Good**: "Write keyword matching function with tests"

### Clear Acceptance Criteria

Each task needs 2-5 specific, testable criteria:
- ❌ "Function works correctly"
- ✅ "Function returns true when message contains trigger words"
- ✅ "Function returns false when message is clean"
- ✅ "Function handles empty input without errors"

### Dependency Ordering

Tasks should be ordered so:
1. Infrastructure comes first (file structure, configs, utilities)
2. Data models before business logic
3. Business logic before UI
4. Core features before tests
5. Tests before optimization

### Priority Levels

- **P0 (Blocking)**: Must complete for feature to function
- **P1 (High)**: Important for good UX, should complete
- **P2 (Medium)**: Nice to have, can defer
- **P3 (Low)**: Polish, optimization, future enhancement

## Task Categories Explained

### 🏗️ Infrastructure
- File/directory creation
- Build configuration
- Utility functions
- Helper classes
- Error handling setup

### 🧠 Business Logic
- Core algorithms
- Data processing
- Validation logic
- State management
- API integrations (if any)

### 🎨 UI/UX
- HTML structure
- CSS styling
- DOM manipulation
- Event handlers
- Visual feedback

### 🧪 Testing
- Unit test files
- Integration tests
- Test fixtures/mocks
- Performance tests
- Manual test scripts

### 📝 Documentation
- JSDoc comments
- README updates
- API documentation
- User guides
- Inline code comments

## Example Task Breakdown

**Feature**: Scope Creep Detection Engine

**Tasks**:
1. Create detector.js file structure (15 min)
2. Define trigger words array constant (10 min)
3. Implement keyword matching function (45 min)
4. Write unit tests for keyword matching (30 min)
5. Add case-insensitive matching (20 min)
6. Handle phrase detection (multi-word) (45 min)
7. Write integration test with sample emails (30 min)
8. Add performance logging (20 min)
9. Optimize detection for large messages (45 min)
10. Document API with JSDoc (15 min)

**Total**: ~4.5 hours

## Constitutional Alignment

Tasks must ensure:
- **Privacy**: No network calls, localStorage only
- **Performance**: Include performance validation tasks
- **Testing**: Test tasks for every feature task
- **Graceful Degradation**: Error handling tasks
- **Measurable Success**: Instrumentation tasks

## Instructions

1. **Read Implementation Plan**: Load specs/###-feature-name/plan.md
2. **Identify Major Components**: List all files/modules to create
3. **Break Down by Category**: Group tasks into 5 categories
4. **Create Atomic Tasks**: Each 30-90 minutes
5. **Define Dependencies**: Map task relationships
6. **Add Acceptance Criteria**: 2-5 testable criteria per task
7. **Estimate Time**: Be realistic, add buffer
8. **Order Tasks**: Foundation → Core → Integration → Testing
9. **Generate tasks.md**: Write complete task breakdown
10. **Create Progress Table**: Initialize tracking

---

**Ready to create task breakdown.** Which feature should I break down into tasks?
