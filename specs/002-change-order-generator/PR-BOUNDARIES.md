# PR Boundaries for Spec 002: Change Order Generator

**Strategy**: Multiple PRs per spec with logical functional boundaries

## Boundary Criteria

A PR boundary should:
- ✅ Deliver complete, testable user value (not half a feature)
- ✅ Have natural integration checkpoint (MVP vs enhancements)
- ✅ Be independently reviewable (<2000 lines changed)
- ✅ Pass all tests and quality gates
- ✅ Include documentation updates relevant to that scope

## PR #1: Core Functionality (Phases 1-5) + Modular Refactoring

**Status**: READY TO CREATE
**Scope**: Minimum viable change order generator

### Included Phases

**Phase 1: Setup & Foundation** (BLOCKS all user stories)
- Storage initialization
- Basic data structures (ChangeOrder model)
- Core utilities (Logger, Sanitizer, DateFormatter)

**Phase 2: Settings Page** (Foundational for US4)
- SettingsStorage service
- Settings UI (freelancer name, hourly rate)
- Settings persistence

**Phase 3: Template Engine & Change Order Generation** (US1, US2)
- ChangeOrderService (generation orchestration)
- TemplateEngine (markdown formatting)
- ChangeOrderNumbering (sequential numbering)
- ChangeOrderHistory (storage + retrieval)
- ChangeOrderView (UI display)
- Multi-item bundling support

**Phase 4: Pricing Calculator Widget** (US4)
- PricingCalculator service (calculation logic)
- PricingCalculatorWidget UI
- Settings integration (hourly rate persistence)

**Phase 5: Export Functionality** (US3)
- PDFGenerator service (jsPDF wrapper)
- ExportService (PDF, clipboard, text export)
- ExportControls UI
- Graceful degradation (PDF → text fallback)

**PLUS: Modular Architecture Refactoring**
- 6 files refactored (373 → 124-264 lines)
- 13 new focused modules created
- 250-line standard compliance
- Documentation updates (5 files)

### User Value Delivered

Users can:
- ✅ Generate change orders from detected scope creep
- ✅ Bundle multiple detections into one change order
- ✅ Calculate pricing with inline calculator
- ✅ Export as PDF, clipboard, or text file
- ✅ Sequential numbering per client
- ✅ Automatic pre-filling from history

**This is a complete MVP** - users can accomplish their main goal (get paid for scope creep)

### Metrics

- **Files Changed**: ~35 files (6 refactored + 13 new + 16 original)
- **Lines Added**: ~2300 lines
- **Lines Removed**: ~800 lines (refactoring)
- **Net Change**: ~1500 lines
- **Tests**: 152+ passing
- **Coverage**: 80%+ business logic

### Quality Gates

- ✅ All tests passing
- ✅ ESLint clean
- ✅ Constitutional compliance validated
- ✅ 250-line modular standard (4/6 fully compliant, 2/6 within 15 lines)
- ✅ Documentation updated

---

## PR #2: Enhancements & Polish (Phases 6-9)

**Status**: PENDING (create after PR #1 merged)
**Scope**: Quality-of-life improvements and edge case handling

### Included Phases

**Phase 6: Auto-Export Feature** (US3 Enhancement)
- AutoExportTimer service
- Countdown UI
- Auto-export integration
- User cancellation support

**Phase 7: Draft Persistence & History** (Cross-Cutting)
- DraftStorage service (resume interrupted work)
- History view UI
- ExportHistory tracking
- 50-order FIFO limit per client

**Phase 8: Edge Cases & Polish** (All User Stories)
- Long text truncation with expand
- Missing data placeholders
- Storage quota handling
- Invalid detection events
- Empty change orders
- UI polish (loading states, error recovery)

**Phase 9: Testing & Validation** (Quality Gates)
- Integration testing
- Manual testing checklist
- Bug fixes
- Performance validation
- Accuracy measurements

### User Value Delivered

Users get:
- ✅ Auto-export convenience (no manual clicks)
- ✅ Draft recovery (don't lose work)
- ✅ History browsing (view past orders)
- ✅ Export history (track what was sent)
- ✅ Edge case handling (robust error recovery)
- ✅ Production quality (comprehensive testing)

### Estimated Metrics

- **Files Changed**: ~20 files
- **Lines Added**: ~1200 lines
- **Tests**: +40-50 tests
- **Duration**: 12-15 hours development

---

## Why These Boundaries Are Logical

### PR #1 Boundary Justification

**Functional Completeness**:
- Users can complete entire workflow: detect → generate → calculate → export
- No broken functionality (all features work end-to-end)
- Clear stopping point (export button clicked, PDF downloaded)

**Independence**:
- Phases 1-5 don't depend on Phases 6-9
- Auto-export is enhancement, not requirement
- History is nice-to-have, not core
- Edge cases don't block core functionality

**Reviewability**:
- ~1500 net lines (manageable in 2-3 hour review)
- Clear scope (core generation + export)
- Refactoring is atomic (complete, not half-done)

**Risk**:
- Low merge conflict risk (core features stabilized)
- Easy rollback if issues (self-contained)
- Can ship to users for feedback

### PR #2 Boundary Justification

**Enhancement Focus**:
- All features build on top of PR #1
- No fundamental changes to core architecture
- Applies approved modular patterns from PR #1

**User Feedback Integration**:
- Can incorporate user feedback from PR #1 testing
- Edge cases based on real usage patterns
- Polish based on observed friction points

**Lower Risk**:
- Core functionality already validated
- Enhancements are additive (don't break existing)
- Can defer non-critical features if needed

---

## PR Splitting Decision Framework (For Future Specs)

Use this framework to decide PR boundaries:

### Criteria for PR Boundary

Split when **ANY** of these is true:

1. **Functional Completeness** - User can accomplish complete workflow
2. **Natural Integration Point** - MVP vs enhancements, core vs polish
3. **Size Threshold** - PR would exceed 2000 lines changed
4. **Dependency Boundary** - Subsequent phases depend on feedback from current
5. **Review Complexity** - Architectural changes need validation before continuing
6. **Reduced Risk** - Merge conflicts, rollback complexity, blast radius

### Single PR Indicators

Keep in one PR when **ALL** of these are true:

1. Total changes <1500 lines
2. All phases tightly coupled (can't split without breaking)
3. No natural functional boundary
4. Review can complete in <3 hours
5. Low merge conflict risk
6. No architectural validation needed

---

## Application to Spec 002

### PR #1 Rationale

✅ **Functional Completeness**: Users can generate + export change orders
✅ **Natural Integration Point**: MVP core vs enhancements
✅ **Size Threshold**: ~1500 lines (under 2000 limit)
✅ **Dependency Boundary**: Need architectural feedback before continuing
✅ **Review Complexity**: Modular refactoring needs validation
✅ **Reduced Risk**: Checkpoint before adding more complexity

**Decision**: SPLIT HERE

### PR #2 Rationale

- Builds on validated architecture from PR #1
- Enhancements are lower priority (P1 vs P2)
- Can defer if user feedback requires pivot
- Smaller scope (no refactoring, just features)

**Decision**: SEPARATE PR

---

## Documentation of This Approach

**Where Documented**:
- This file: `specs/002-change-order-generator/PR-BOUNDARIES.md`
- Referenced in: PR descriptions
- Pattern for: Future specs with 6+ phases

**Benefits**:
- Clear boundaries defined upfront
- Reviewers understand scope
- Future specs can reference this pattern
- Decision criteria documented (not arbitrary)

---

## Next Steps

1. Create PR #1 with title:
   ```
   feat(002): Change Order Generator Core (Phases 1-5) + Modular Architecture
   ```

2. After PR #1 merged:
   - Apply any architectural feedback to existing code
   - Implement Phases 6-9 with approved patterns
   - Create PR #2 with enhancements

3. Update this file if boundaries need adjustment based on actual development
