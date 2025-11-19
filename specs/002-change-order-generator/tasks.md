# Tasks: Change Order Generator

**Feature**: 002-change-order-generator
**Created**: 2025-11-11
**Last Updated**: 2025-11-18 (PR #12 - Phase 6 auto-export implementation complete)
**Status**: In Progress - 28% Complete (103/369 tasks)
**Total Tasks**: 369 (T001-T369, all sequential, no duplicates)
**Estimated Duration**: 39-50 hours (18-22 hours remaining for MVP)

---

## Implementation Status Summary

**Completed PRs:**
- ✅ PR #6: Phase 1 (Foundation) + Phase 2 (Settings) - 60/64 tasks (94%)
- ✅ PR #7: Popup Refactoring - Not in spec scope (quality improvement)
- ✅ PR #8: Phase 3 (Template Engine + Builder) - 43/80 tasks (54%)

**In Progress:**
- ⏳ PR #9: Phase 4 (Calculator UI) + Phase 5 (Export) - 0/83 tasks

**Overall Progress:**
- Phase 1-2: 97% complete ✅
- Phase 3: 58% complete ⚠️ (core generation working, history/numbering deferred)
- Phase 4: 39% complete ⚠️ (calculation logic done, widget UI pending)
- Phase 5-9: 0% complete ⏳ (planned for PR #9+)

**Key Architectural Decisions:**
1. Template engine split into 3 modular files (TemplateEngine, TemplateProcessor, TemplateHelpers)
2. Plain text template instead of HTML for MVP simplicity
3. Calculator logic inline in ChangeOrderBuilder (no separate PricingCalculator.js)
4. Multi-item selection integrated into DetectionListRenderer (no separate component)
5. Change order UI integrated into popup (no separate change-order/ directory)

**Deferred to Future PRs:**
- Change order history (Phase 7)
- Sequential numbering
- Original scope pre-fill
- Payment terms, revised timeline, signatures
- Auto-export (Phase 6)
- Draft persistence (Phase 7)
- Edge cases and polish (Phase 8-9)

See `IMPLEMENTATION_AUDIT.md` for detailed analysis.

---

## Task Format Reference

```
- [ ] [T###] [P?] [Story?] Description with exact file path
```

- **T###**: Sequential task ID (T001, T002, etc.)
- **[P]**: Parallelizable (different files, no dependencies)
- **[Story]**: User story label ([US1], [US2], [US3], [US4])
- **Description**: Clear action with exact file path

---

## Phase 1: Setup & Foundation (BLOCKS all user stories)

**Duration**: 5-6 hours
**Parallelization**: None (foundational setup must be sequential)

### Project Dependencies

- [x] [T001] Install jsPDF dependency: `npm install jspdf@2.5.1` (NOTE: Installed jspdf@3.0.3 - latest version)
- [x] [T002] Verify jsPDF installation with test PDF generation in `tests/jspdf-test.js` (tests/lib/jspdf.test.js)
- [x] [T003] Update `vite.config.js` - Set `build.target: 'esnext'` for Chrome 92+ modern JS features
- [x] [T004] Update `vite.config.js` - Configure `rollupOptions.output.manualChunks` to separate 'jspdf' into dedicated chunk (NOTE: Used `manualChunks: undefined` to prevent code splitting)
- [x] [T005] Update `vite.config.js` - Add `terserOptions` with `compress.drop_console: true`, `compress.passes: 2` (NOTE: Uses pure_funcs instead of drop_console to preserve errors/warnings)
- [x] [T006] Update `vite.config.js` - Set `chunkSizeWarningLimit: 600` to enforce bundle size budget
- [x] [T007] Update `vite.config.js` - Add `define` for `__APP_VERSION__` and `__BUILD_TIME__` constants
- [x] [T008] Create `vitest.config.js` with environment: 'jsdom', setupFiles: ['./tests/setup.js'], globals: true
- [x] [T009] Add coverage configuration to `vitest.config.js` - provider: 'v8', thresholds: 80% for branches/functions/lines
- [x] [T010] Create `tests/setup.js` with chrome.storage.local mock using vi.stubGlobal (full implementation from Context7)

### Directory Structure

- [ ] [T011] Create directory `src/popup/change-order/` (NOTE: Not created - change order UI integrated directly into popup)
- [x] [T012] Create directory `src/popup/settings/`
- [x] [T013] Create directory `src/lib/change-order/`
- [x] [T014] Create directory `src/lib/storage/`
- [x] [T015] Create directory `src/lib/utils/`
- [x] [T016] Create directory `src/assets/templates/` (empty with .gitkeep - templates inline in ChangeOrderBuilder)
- [x] [T017] Create directory `src/assets/icons/`
- [x] [T018] Create directory `tests/lib/change-order/`

### Base Files & Schemas

- [x] [T019] Create `src/lib/storage/StorageSchemas.js` with schema version constants and migration helpers
- [x] [T020] Create `src/lib/utils/UUIDGenerator.js` wrapper for crypto.randomUUID()
- [x] [T021] Create `src/lib/utils/DateFormatter.js` wrapper for Intl.DateTimeFormat
- [x] [T022] Create `src/lib/utils/Sanitizer.js` with sanitizeText() and sanitizeNumber() functions
- [x] [T023] Create `src/lib/utils/Logger.js` with logInfo(), logError(), logPerformance() functions
- [x] [T024] Create `src/types/change-order.d.ts` with TypeScript definitions for ChangeOrder, FreelancerSettings entities

### Base Entity Classes

- [x] [T025] Create `src/lib/change-order/ChangeOrder.js` entity class with validation
- [x] [T026] Add ChangeOrder.validate() method to check required fields
- [x] [T027] Add ChangeOrder.toJSON() method for storage serialization
- [x] [T028] Add ChangeOrder.fromJSON() static method for deserialization
- [x] [T029] Create `src/lib/storage/FreelancerSettings.js` entity class
- [x] [T030] Add FreelancerSettings.validate() method (freelancerName required, hourlyRate > 0)
- [x] [T031] Add FreelancerSettings.getDefaults() static method for first-run defaults

### Test Setup

- [x] [T032] Create `tests/lib/change-order/ChangeOrder.test.js` with basic structure
- [x] [T033] Create `tests/lib/storage/StorageSchemas.test.js` for schema versioning tests
- [x] [T034] Create `tests/lib/utils/Sanitizer.test.js` for input sanitization tests
- [x] [T035] Run `npm test` to verify test infrastructure works

**Checkpoint**: Foundation ready - all directories created, base classes defined, tests scaffolded ✅ COMPLETE (PR #6)

---

## Phase 2: Settings Page (Foundational for US4)

**Duration**: 4-5 hours
**Parallelization**: Limited (SettingsStorage first, then UI)

### Settings Storage Service

- [x] [T036] Create `src/lib/storage/SettingsStorage.js` with get(), save(), validate() methods (NOTE: Implemented as load(), save() in FreelancerSettings class)
- [x] [T037] Implement SettingsStorage.get() to load settings from chrome.storage.local with key `scopeshield_settings_v1`
- [x] [T038] Implement SettingsStorage.save() to persist settings with validation
- [x] [T039] Implement SettingsStorage.getDefaults() for first-run (empty freelancerName, no hourlyRate)
- [x] [T040] Add error handling for storage quota exceeded in SettingsStorage.save()
- [x] [T041] Create `tests/lib/storage/SettingsStorage.test.js` with CRUD tests
- [x] [T042] Write test: SettingsStorage.get() returns defaults if no settings exist
- [x] [T043] Write test: SettingsStorage.save() validates freelancerName is required
- [x] [T044] Write test: SettingsStorage.save() validates hourlyRate > 0 if provided

### Settings UI

- [x] [T045] [P] Create `src/popup/settings/SettingsView.js` with render() method
- [x] [T046] [P] Create `src/popup/settings/SettingsForm.js` with form HTML structure (NOTE: Split into SettingsForm.js + SettingsFormTemplate.js)
- [x] [T047] [P] Create `src/popup/settings/settings.css` with styling
- [x] [T048] Add freelancer name input field to SettingsForm with validation (required)
- [x] [T049] Add hourly rate input field to SettingsForm with validation (optional, must be > 0)
- [x] [T050] Add default export method dropdown to SettingsForm (clipboard/pdf/text) (Already implemented in settings UI)
- [x] [T051] Add auto-export enabled checkbox to SettingsForm (Already implemented in settings UI)
- [x] [T052] Add auto-export delay input to SettingsForm (1-10 seconds, default 3) (Already implemented in settings UI)
- [x] [T053] Implement SettingsForm.save() to call SettingsStorage.save() with sanitized inputs
- [x] [T054] Implement SettingsForm.load() to populate form from SettingsStorage.get()
- [x] [T055] Add success notification after saving settings (uses NotificationManager)
- [x] [T056] Add error notification if validation fails

### Popup Integration

- [x] [T057] Update `src/popup/popup.html` to add Settings tab navigation
- [x] [T058] Update `src/popup/popup.js` to load SettingsView when Settings tab clicked
- [x] [T059] Add CSS for tab navigation in `src/popup/popup.css`
- [x] [T060] Cache loaded settings in memory to avoid repeated chrome.storage calls

### First-Run Experience

- [x] [T061] Create `src/lib/utils/FirstRunDetector.js` to check if freelancerName is empty
- [x] [T062] Show welcome modal on first popup open if freelancerName empty (WelcomeModal.js)
- [x] [T063] Prompt "Enter your name to get started" in welcome modal
- [x] [T064] Save freelancerName to settings after welcome modal submission

**Checkpoint**: Settings page accessible, freelancer name + hourly rate saveable, validation works ✅ COMPLETE (PR #6)

---

## Phase 3: Template Engine & Change Order Generation (US1, US2)

**Duration**: 7-8 hours (includes multi-item selection +2h)
**Parallelization**: Template creation parallel with service logic

### Professional Template

- [x] [T065] [P] [US2] Create `src/assets/templates/professional-v1.html` with 7-section structure (NOTE: Template inline in ChangeOrderBuilder.getTemplate())
- [x] [T066] [P] [US2] Add Header section to template: "Change Order #{{changeOrderNumber}}", date, client/freelancer names (NOTE: Simplified - no changeOrderNumber, uses generatedDate + freelancerName)
- [ ] [T067] [P] [US2] Add "Original Scope Agreement" section with {{originalScope}} placeholder (DEFERRED - not in MVP)
- [x] [T068] [P] [US2] Add "Requested Changes" section with bulleted list {{requestedChanges}} (uses {{@each detections}} loop)
- [x] [T069] [P] [US2] Add "Cost Impact" section with itemized {{costEstimate}} (uses totalCost with conditional {{@if hasHourlyRate}})
- [ ] [T070] [P] [US2] Add "Revised Timeline" section with {{revisedTimeline}} placeholder (DEFERRED - not in MVP)
- [ ] [T071] [P] [US2] Add "Payment Terms" section with {{paymentTerms}} placeholder (DEFERRED - not in MVP)
- [ ] [T072] [P] [US2] Add "Signatures" section with Client/Freelancer signature lines (DEFERRED - not in MVP)
- [ ] [T073] [P] [US2] Add CSS styling to template: sans-serif font, 14-16px body, 18-24px headings, 1.5 line-spacing (DEFERRED - plain text template for MVP)

### Template Engine

- [x] [T074] [P] [US1] Create `src/lib/change-order/TemplateEngine.js` with interpolate() method (NOTE: Uses render() instead of interpolate())
- [x] [T075] [P] [US1] Implement TemplateEngine.interpolate() to replace {{placeholder}} with values (NOTE: Split into TemplateHelpers.replaceVariables())
- [x] [T076] [P] [US1] Handle missing placeholders gracefully (replace with empty string)
- [x] [T077] [P] [US1] Handle array placeholders for requestedChanges (convert to bulleted list) (NOTE: Uses {{@each}} loops instead - more powerful)
- [x] [T078] [P] [US1] Cache loaded template in memory (load professional-v1.html once) (NOTE: Template is inline string, no need to cache)
- [x] [T079] [P] [US1] Create `tests/lib/change-order/TemplateEngine.test.js`
- [x] [T080] [P] [US1] Write test: interpolate() replaces simple placeholders
- [x] [T081] [P] [US1] Write test: interpolate() handles missing placeholders
- [x] [T082] [P] [US1] Write test: interpolate() converts arrays to bulleted lists (NOTE: Tests {{@each}} loops instead)

### Change Order Service

- [x] [T083] [US1] Create `src/lib/change-order/ChangeOrderService.js` with generate() method (NOTE: Implemented as ChangeOrderBuilder.build())
- [x] [T084] [US1] Implement ChangeOrderService.generate(detectionEvent) to create ChangeOrder from detection (NOTE: build() takes array of detections)
- [ ] [T085] [US1] Extract clientName and clientEmail from detectionEvent.sender (DEFERRED - not in MVP, uses sender field directly)
- [ ] [T086] [US1] Extract requestedChanges from detectionEvent.detectedText (truncate to 200 chars if >500) (DEFERRED - no truncation in MVP)
- [x] [T087] [US1] Load freelancerName from SettingsStorage (prompt if empty) (loads FreelancerSettings)
- [ ] [T088] [US1] Pre-fill originalScope from ChangeOrderHistory.getLastForClient(clientEmail) (DEFERRED - no history in MVP)
- [x] [T089] [US1] Generate current date using DateFormatter (uses Date.toISOString())
- [ ] [T090] [US1] Assign sequential changeOrderNumber using getNextNumberForClient(clientEmail) (DEFERRED - not in MVP)
- [ ] [T091] [US1] Set default values: costEstimate "$XXX", paymentTerms "Net 30", revisedTimeline "" (DEFERRED - calculates cost from hourlyRate * hours)
- [ ] [T092] [US1] Save generated ChangeOrder to chrome.storage.local (DEFERRED - not saved automatically in MVP)
- [x] [T093] [US1] Return ChangeOrder instance (returns formatted string document)
- [x] [T094] [US1] Create `tests/lib/change-order/ChangeOrderService.test.js` (ChangeOrderBuilder.test.js)
- [x] [T095] [US1] Write test: generate() creates ChangeOrder with all required fields
- [ ] [T096] [US1] Write test: generate() pre-fills scope from history if available (DEFERRED - no history)
- [ ] [T097] [US1] Write test: generate() uses empty scope for first-time client (DEFERRED - no history)

### Change Order History Service

- [ ] [T098] [US1] Create `src/lib/change-order/ChangeOrderHistory.js` with query methods (DEFERRED to Phase 7)
- [ ] [T099] [US1] Implement getLastForClient(clientEmail) to query chrome.storage.local (DEFERRED to Phase 7)
- [ ] [T100] [US1] Implement getAllForClient(clientEmail) to return all change orders (max 50) (DEFERRED to Phase 7)
- [ ] [T101] [US1] Implement save(changeOrder) to append to client's history (DEFERRED to Phase 7)
- [ ] [T102] [US1] Implement FIFO deletion if history exceeds 50 per client (DEFERRED to Phase 7)
- [ ] [T103] [US1] Index change orders by clientEmail for fast queries (DEFERRED to Phase 7)
- [ ] [T104] [US1] Create `tests/lib/change-order/ChangeOrderHistory.test.js` (DEFERRED to Phase 7)
- [ ] [T105] [US1] Write test: getLastForClient() returns most recent order (DEFERRED to Phase 7)
- [ ] [T106] [US1] Write test: save() enforces 50-order limit per client (DEFERRED to Phase 7)

### Sequential Numbering

- [ ] [T107] [US1] Create `src/lib/change-order/ChangeOrderNumbering.js` with getNextNumberForClient() (DEFERRED - not in MVP)
- [ ] [T108] [US1] Implement getNextNumberForClient(clientEmail) to query history and increment (DEFERRED - not in MVP)
- [ ] [T109] [US1] Format change order numbers as "001", "002", "003" (3 digits, zero-padded) (DEFERRED - not in MVP)
- [ ] [T110] [US1] Handle first change order for client (return "001") (DEFERRED - not in MVP)
- [ ] [T111] [US1] Create `tests/lib/change-order/ChangeOrderNumbering.test.js` (DEFERRED - not in MVP)
- [ ] [T112] [US1] Write test: getNextNumberForClient() returns "001" for new client (DEFERRED - not in MVP)
- [ ] [T113] [US1] Write test: getNextNumberForClient() increments from last number (DEFERRED - not in MVP)

### Change Order View UI

- [x] [T114] [US1] [US2] Create `src/popup/change-order/ChangeOrderView.js` with render() method (NOTE: Integrated into DetectionEventHandlers.js)
- [x] [T115] [US1] [US2] Implement ChangeOrderView.render(changeOrder) to display formatted document
- [x] [T116] [US1] [US2] Use TemplateEngine to populate professional-v1.html with changeOrder data
- [ ] [T117] [US1] [US2] Create `src/popup/change-order/change-order.css` with styling (NOTE: Uses inline styles in popup.css)
- [x] [T118] [US1] [US2] Add "Generate Change Order" button to popup when detections exist
- [x] [T119] [US1] [US2] Show ChangeOrderView when "Generate Change Order" clicked
- [x] [T120] [US1] [US2] Measure generation time with performance.now() (log if >5s)
- [ ] [T121] [P] [US1] Create `src/popup/change-order/MultiItemSelector.js` component (NOTE: Integrated into DetectionListRenderer - checkboxes on each detection)
- [x] [T122] [P] [US1] Add checkbox for each detection in MultiItemSelector with "Select all" option
- [x] [T123] [US1] Update ChangeOrderService.generate() to accept array of detectionEvents (ChangeOrderBuilder.build() accepts array)
- [x] [T124] [US1] Combine multiple detectedText items into single requestedChanges array in generate()
- [x] [T125] [US1] Write test: Multi-item generation combines 3 requests correctly
- [x] [T126] [US1] Write test: Multi-item selector only appears when 2+ detections exist

**Checkpoint**: Change order generation works, all 7 sections present, pre-fill from history works, sequential numbering works, multi-item bundling works ✅ PARTIALLY COMPLETE (PR #8) - Core generation works, history/numbering deferred

---

## Phase 4: Pricing Calculator Widget (US4)

**Duration**: 3-4 hours
**Parallelization**: Calculator logic and UI can be developed in parallel

### Calculator Logic

- [x] [T127] [P] [US4] Create `src/lib/change-order/PricingCalculator.js` with calculate() method (NOTE: Implemented inline in ChangeOrderBuilder.calculateCost())
- [x] [T128] [P] [US4] Implement PricingCalculator.calculate(hourlyRate, estimatedHours) → returns cost estimate
- [x] [T129] [P] [US4] Format output as currency string (e.g., "$1,200") (formatted to 2 decimal places)
- [x] [T130] [P] [US4] Validate inputs: hourlyRate > 0, estimatedHours > 0
- [x] [T131] [P] [US4] Create `tests/lib/change-order/PricingCalculator.test.js` (tests in ChangeOrderBuilder.test.js)
- [x] [T132] [P] [US4] Write test: calculate(150, 8) returns "$1,200"
- [x] [T133] [P] [US4] Write test: calculate() validates inputs (throws if invalid)

### Calculator Widget UI

- [ ] [T134] [P] [US4] Create `src/popup/change-order/PricingCalculatorWidget.js` component (DEFERRED to PR #9)
- [ ] [T135] [P] [US4] Add calculator icon to cost estimate field (calculator-icon.svg) (DEFERRED to PR #9)
- [ ] [T136] [P] [US4] Implement inline expansion when cost field clicked (show/hide calculator) (DEFERRED to PR #9)
- [ ] [T137] [P] [US4] Add hourly rate input field to calculator widget (DEFERRED to PR #9)
- [ ] [T138] [P] [US4] Add estimated hours input field to calculator widget (DEFERRED to PR #9)
- [ ] [T139] [P] [US4] Pre-fill hourly rate from SettingsStorage if available (DEFERRED to PR #9)
- [ ] [T140] [P] [US4] Auto-calculate on input change (debounce 300ms) (DEFERRED to PR #9)
- [ ] [T141] [P] [US4] Show suggested cost estimate below inputs (DEFERRED to PR #9)
- [ ] [T142] [P] [US4] Add "Accept" button to apply suggestion to cost field (DEFERRED to PR #9)
- [ ] [T143] [P] [US4] Add "Override" option to manually enter different cost (DEFERRED to PR #9)
- [ ] [T144] [P] [US4] Remember hourly rate in SettingsStorage after first use (DEFERRED to PR #9)

**Checkpoint**: Calculator widget appears on cost field click, calculation accurate, hourly rate pre-filled from settings (NOTE: Calculation logic complete, widget UI deferred to PR #9)

---

## Phase 5: Export Functionality (US3)

**Duration**: 6-7 hours
**Parallelization**: PDF, clipboard, and text export services can be developed in parallel

### PDF Generator Service

- [ ] [T145] [P] [US3] Create `src/lib/change-order/PDFGenerator.js` with generatePDF() method (DEFERRED to PR #9)
- [ ] [T146] [P] [US3] Implement lazy loading for jsPDF: `await import('jspdf/dist/jspdf.es.min.js')` (DEFERRED to PR #9)
- [ ] [T147] [P] [US3] Implement PDFGenerator.generatePDF(changeOrder) to create PDF document (DEFERRED to PR #9)
- [ ] [T148] [P] [US3] Map change order sections to PDF layout (7 sections) (DEFERRED to PR #9)
- [ ] [T149] [P] [US3] Add professional typography to PDF (sans-serif font, 14-16px body, 18-24px headings) (DEFERRED to PR #9)
- [ ] [T150] [P] [US3] Format filename as "ChangeOrder_[ClientName]_[YYYY-MM-DD].pdf" (DEFERRED to PR #9)
- [ ] [T151] [P] [US3] Trigger browser download with jsPDF.save() (DEFERRED to PR #9)
- [ ] [T152] [P] [US3] Measure PDF generation time with performance.now() (log if >3s) (DEFERRED to PR #9)
- [ ] [T153] [P] [US3] Create `tests/lib/change-order/PDFGenerator.test.js` (DEFERRED to PR #9)
- [ ] [T154] [P] [US3] Write test: generatePDF() creates PDF with all 7 sections (mock jsPDF) (DEFERRED to PR #9)
- [ ] [T155] [P] [US3] Write test: generatePDF() formats filename correctly (DEFERRED to PR #9)

### Clipboard Export Service

- [ ] [T156] [P] [US3] Create `src/lib/change-order/ClipboardExport.js` with copyToClipboard() method
- [ ] [T157] [P] [US3] Implement ClipboardExport.copyToClipboard(changeOrder) to copy formatted text
- [ ] [T158] [P] [US3] Format change order as rich text (preserve sections, headings, bullets)
- [ ] [T159] [P] [US3] Use navigator.clipboard.writeText() API
- [ ] [T160] [P] [US3] Measure clipboard write time with performance.now() (log if >500ms)
- [ ] [T161] [P] [US3] Handle clipboard permission denied error (show manual selection fallback)
- [ ] [T162] [P] [US3] Create `tests/lib/change-order/ClipboardExport.test.js`
- [ ] [T163] [P] [US3] Write test: copyToClipboard() formats text correctly
- [ ] [T164] [P] [US3] Write test: copyToClipboard() handles permission denied gracefully

### Text Export Service

- [ ] [T165] [P] [US3] Create `src/lib/change-order/TextExport.js` with exportAsText() method
- [ ] [T166] [P] [US3] Implement TextExport.exportAsText(changeOrder) to create markdown-compatible plain text
- [ ] [T167] [P] [US3] Format with markdown headers (#, ##) and lists (-)
- [ ] [T168] [P] [US3] Copy to clipboard using navigator.clipboard.writeText()
- [ ] [T169] [P] [US3] Create `tests/lib/change-order/TextExport.test.js`
- [ ] [T170] [P] [US3] Write test: exportAsText() creates markdown-compatible format

### Export Service Orchestrator

- [ ] [T171] [US3] Create `src/lib/change-order/ExportService.js` to orchestrate all export methods
- [ ] [T172] [US3] Implement ExportService.export(changeOrder, method) with method: "pdf" | "clipboard" | "text"
- [ ] [T173] [US3] Route to appropriate export service based on method
- [ ] [T174] [US3] Update ChangeOrder.status to "exported" after successful export
- [ ] [T175] [US3] Save exportedAt timestamp and exportFormat to ChangeOrder
- [ ] [T176] [US3] Add entry to ExportHistory (optional, Phase 2)
- [ ] [T177] [US3] Return success/error result
- [ ] [T178] [US3] Create `tests/lib/change-order/ExportService.test.js`
- [ ] [T179] [US3] Write test: export() routes to correct service based on method

### Export Controls UI

- [ ] [T180] [US3] Create `src/popup/change-order/ExportControls.js` component
- [ ] [T181] [US3] Add "Copy to Clipboard" button with click handler
- [ ] [T182] [US3] Add "Export as PDF" button with click handler
- [ ] [T183] [US3] Add "Export as Text" button with click handler
- [ ] [T184] [US3] Show success notification after successful export ("Copied! Ready to paste")
- [ ] [T185] [US3] Show error notification if export fails with fallback suggestion
- [ ] [T186] [US3] Disable buttons during export (loading state)
- [ ] [T187] [US3] Re-enable buttons after export completes or fails

### Graceful Degradation

- [ ] [T188] [US3] Implement PDF failure fallback: Show "Export as Text" button if PDF fails
- [ ] [T189] [US3] Implement clipboard failure fallback: Show manual text selection UI
- [ ] [T190] [US3] Log all export errors to console with error context

**Checkpoint**: All 3 export methods work (PDF <3s, clipboard <500ms, text instant), error handling with fallbacks

---

## Phase 6: Auto-Export Feature (US3 Enhancement)

**Duration**: 4-5 hours
**Parallelization**: Timer logic and UI can be developed separately

### Auto-Export Timer Logic

- [x] [T191] [P] [US3] Create `src/lib/change-order/AutoExportTimer.js` with start(), cancel() methods
- [x] [T192] [P] [US3] Implement AutoExportTimer.start(callback, delay) to trigger after delay seconds
- [x] [T193] [P] [US3] Implement debouncing: Reset timer if user edits before countdown completes
- [x] [T194] [P] [US3] Implement AutoExportTimer.cancel() to stop countdown
- [x] [T195] [P] [US3] Emit countdown events for UI (3... 2... 1...)
- [x] [T196] [P] [US3] Create `tests/lib/change-order/AutoExportTimer.test.js`
- [x] [T197] [P] [US3] Write test: start() triggers callback after delay
- [x] [T198] [P] [US3] Write test: cancel() stops countdown
- [x] [T199] [P] [US3] Write test: debouncing resets timer on new edit

### Auto-Export Integration

- [x] [T200] [US3] Update ChangeOrderModal to start auto-export timer after document rebuild
- [x] [T201] [US3] Load auto-export settings (enabled, default method, delay) from SettingsStorage
- [x] [T202] [US3] Skip auto-export if autoExportEnabled is false
- [x] [T203] [US3] Call ExportService.export() with defaultExportMethod when timer completes
- [x] [T204] [US3] Handle auto-export failure: Show error notification + manual buttons
- [x] [T205] [US3] Don't disable auto-export setting if export fails (could be temporary)

### Auto-Export UI

- [x] [T206] [P] [US3] Create countdown indicator component (countdown notification in modal)
- [x] [T207] [P] [US3] Show countdown updates (3s → 0s) via text
- [x] [T208] [P] [US3] Display message: "Auto-exporting in Xs... (click anywhere to cancel)"
- [x] [T209] [P] [US3] Allow user to cancel: Click anywhere to stop timer
- [x] [T210] [P] [US3] Show "Auto-export cancelled" notification if user clicks
- [x] [T211] [P] [US3] Show success notification after auto-export completes
- [x] [T212] [P] [US3] Show error notification with manual buttons if auto-export fails

**Checkpoint**: Auto-export triggers after 3 seconds, countdown visible, user can cancel, failures fall back to manual buttons

---

## Phase 7: Draft Persistence & History (Cross-Cutting)

**Duration**: 5-6 hours (includes ExportHistory tracking +2h)
**Parallelization**: Draft, history, and export history logic are independent

### Draft Persistence

- [ ] [T213] [P] Create `src/lib/change-order/DraftStorage.js` with save(), load(), delete() methods
- [ ] [T214] [P] Implement DraftStorage.save(changeOrder) to save to key `scopeshield_draft_changeorder_v1`
- [ ] [T215] [P] Implement DraftStorage.load() to retrieve saved draft
- [ ] [T216] [P] Implement DraftStorage.delete() to remove draft after export
- [ ] [T217] [P] Save draft when popup closes (listen to window.onbeforeunload)
- [ ] [T218] [P] Detect draft on popup open: Show "Resume Draft" button if draft exists
- [ ] [T219] [P] Load draft into ChangeOrderView when "Resume Draft" clicked
- [ ] [T220] [P] Delete draft after successful export
- [ ] [T221] [P] Implement auto-deletion for drafts older than 7 days
- [ ] [T222] [P] Create `tests/lib/change-order/DraftStorage.test.js`
- [ ] [T223] [P] Write test: save() persists draft to storage
- [ ] [T224] [P] Write test: auto-delete removes drafts older than 7 days

### History Management

- [ ] [T225] [P] Update ChangeOrderHistory to enforce 50-order limit per client
- [ ] [T226] [P] Implement FIFO deletion: Remove oldest order when saving 51st
- [ ] [T227] [P] Add index by clientEmail for fast queries
- [ ] [T228] [P] Create history view UI (chronological list, no search for MVP)
- [ ] [T229] [P] Show last 50 change orders in history view
- [ ] [T230] [P] Add "View History" link in popup
- [ ] [T231] [P] Allow clicking history item to view details (read-only)

### Export History Tracking

- [ ] [T232] [P] Create `src/lib/storage/ExportHistoryStorage.js` with save(), getAll(), getByChangeOrder()
- [ ] [T233] [P] Implement ExportHistoryStorage.save(exportEvent) to append to chrome.storage.local
- [ ] [T234] Update ExportService to create ExportHistory entry after each successful export
- [ ] [T235] [P] Create export history view UI in `src/popup/history/ExportHistoryView.js`
- [ ] [T236] [P] Add "Export History" tab to popup navigation
- [ ] [T237] [P] Display chronological list of exports (most recent first, last 100 entries)
- [ ] [T238] [P] Add click handler to view change order details from history (read-only)
- [ ] [T239] [P] Write test: ExportHistoryStorage saves entries correctly
- [ ] [T240] [P] Write test: Export history view displays entries chronologically

**Checkpoint**: Drafts save on popup close, resume on reopen, auto-delete after 7 days; History limited to 50 per client; Export history tracking works

---

## Phase 8: Edge Cases & Polish (All User Stories)

**Duration**: 3-4 hours
**Parallelization**: All edge case handlers are independent

### Edge Case: Long Detected Text

- [ ] [T241] [P] [US1] Truncate requestedChanges to 200 chars if >500 in ChangeOrderService.generate()
- [ ] [T242] [P] [US1] Add "..." suffix to truncated text
- [ ] [T243] [P] [US1] Create expandable "Details" section in ChangeOrderView for full text
- [ ] [T244] [P] [US1] Write test: generate() truncates long text correctly

### Edge Case: Missing Client Name

- [ ] [T245] [P] [US1] Use "Client" as placeholder if clientName can't be extracted
- [ ] [T246] [P] [US1] Highlight clientName field with yellow background to prompt edit
- [ ] [T247] [P] [US1] Show tooltip: "Please edit client name before exporting"
- [ ] [T248] [P] [US1] Remember edited client name in history for future reuse
- [ ] [T249] [P] [US1] Write test: generate() uses "Client" placeholder if name missing

### Edge Case: Missing Freelancer Name

- [ ] [T250] [P] [US1] Detect empty freelancerName in SettingsStorage.get()
- [ ] [T251] [P] [US1] Show prompt modal: "Enter your name to continue"
- [ ] [T252] [P] [US1] Save entered name to SettingsStorage
- [ ] [T253] [P] [US1] Pre-fill freelancerName in all future change orders
- [ ] [T254] [P] [US1] Write test: FirstRunDetector prompts if freelancerName empty

### Edge Case: First-Time Client

- [ ] [T255] [P] [US1] Leave originalScope field empty if no history for client
- [ ] [T256] [P] [US1] Show placeholder text: "Enter original project scope"
- [ ] [T257] [P] [US1] Save entered scope to history for future pre-fill
- [ ] [T258] [P] [US1] Write test: getLastForClient() returns null for new client

### Edge Case: Auto-Export Failure

- [ ] [T259] [P] [US3] Catch errors in AutoExportTimer callback
- [ ] [T260] [P] [US3] Show error notification: "Auto-export failed. Please export manually."
- [ ] [T261] [P] [US3] Display manual export buttons (Copy, PDF, Text)
- [ ] [T262] [P] [US3] Don't disable auto-export setting (failure could be temporary)
- [ ] [T263] [P] [US3] Log error to console for debugging
- [ ] [T264] [P] [US3] Write test: AutoExportTimer handles callback errors gracefully

### Edge Case: PDF Generation Failure

- [ ] [T265] [P] [US3] Catch jsPDF errors in PDFGenerator.generatePDF()
- [ ] [T266] [P] [US3] Show error notification: "PDF export failed. Use 'Export as Text' instead."
- [ ] [T267] [P] [US3] Highlight "Export as Text" button as fallback
- [ ] [T268] [P] [US3] Log error to console with jsPDF error details
- [ ] [T269] [P] [US3] Write test: PDFGenerator handles jsPDF errors

### Edge Case: Clipboard Permission Denied

- [ ] [T270] [P] [US3] Catch clipboard permission errors in ClipboardExport
- [ ] [T271] [P] [US3] Show error notification: "Clipboard access denied. Please select and copy manually."
- [ ] [T272] [P] [US3] Display change order text with "Select All" button
- [ ] [T273] [P] [US3] Auto-select text when "Select All" clicked
- [ ] [T274] [P] [US3] Write test: ClipboardExport handles permission denied

### Edge Case: Storage Quota Exceeded

- [ ] [T275] [P] Add storage quota check in ChangeOrderHistory.save()
- [ ] [T276] [P] Show error notification: "Storage full. Export change order history to free space."
- [ ] [T277] [P] Offer CSV export button to download history
- [ ] [T278] [P] Implement CSV export in ChangeOrderHistory.exportToCSV()
- [ ] [T279] [P] Delete old change orders after CSV export confirmation
- [ ] [T280] [P] Write test: ChangeOrderHistory handles quota exceeded

### Manual Change Order Creation

- [ ] [T281] [P] [US1] Add "Manual Change Order" button to popup when no detections exist
- [ ] [T282] [P] [US1] Create blank ChangeOrder with empty fields
- [ ] [T283] [P] [US1] Make all fields editable (no pre-fill)
- [ ] [T284] [P] [US1] Use "001" as changeOrderNumber for manual orders
- [ ] [T285] [P] [US1] Write test: Manual creation works without detection events

### Inline Field Editing

- [ ] [T286] [P] [US4] Make costEstimate field editable on click (contenteditable)
- [ ] [T287] [P] [US4] Make revisedTimeline field editable on click
- [ ] [T288] [P] [US4] Make paymentTerms field editable on click
- [ ] [T289] [P] [US4] Make additionalNotes field editable on click
- [ ] [T290] [P] [US4] Make originalScope field editable on click
- [ ] [T291] [P] [US4] Persist changes on blur (save to ChangeOrder instance)
- [ ] [T292] [P] [US4] Sanitize inputs before saving (use Sanitizer.sanitizeText())
- [ ] [T293] [P] [US4] Reset auto-export timer on each edit (debounce)
- [ ] [T294] [P] [US4] Write test: Inline editing updates ChangeOrder fields

### Loading States

- [ ] [T295] [P] [US1] Show loading spinner during change order generation
- [ ] [T296] [P] [US3] Show loading spinner during PDF export
- [ ] [T297] [P] [US3] Disable export buttons while exporting
- [ ] [T298] [P] [US3] Re-enable buttons after export completes

### Keyboard Shortcuts (Optional)

- [ ] [T299] [P] Add Ctrl+Enter keyboard shortcut to trigger default export
- [ ] [T300] [P] Add Esc keyboard shortcut to cancel auto-export countdown
- [ ] [T301] [P] Add Tab navigation for editable fields

**Checkpoint**: All 9 edge cases handled, manual creation works, inline editing works, loading states improve UX

---

## Phase 9: Testing & Validation (Quality Gates)

**Duration**: 5-6 hours (includes Flesch calculator implementation +1h)
**Parallelization**: Different test types can run in parallel

### Unit Tests

- [ ] [T302] [P] Run all unit tests: `npm test`
- [ ] [T303] [P] Verify 80%+ coverage for lib/ modules (business logic)
- [ ] [T304] [P] Fix failing tests if any
- [ ] [T305] [P] Add missing tests for uncovered code paths

### Integration Tests

- [ ] [T306] [P] Create `tests/integration/change-order-flow.test.js`
- [ ] [T307] [P] Write test: Full flow - detect scope creep → generate → export PDF
- [ ] [T308] [P] Write test: Edit fields → verify changes persist → export
- [ ] [T309] [P] Write test: First-time user → prompt for name → save to settings
- [ ] [T310] [P] Write test: Repeat user → scope pre-fills from history
- [ ] [T311] [P] Write test: Auto-export → countdown → triggers default export
- [ ] [T312] [P] Write test: Auto-export failure → manual buttons appear
- [ ] [T313] [P] Run integration tests: `npm test tests/integration/`

### Performance Testing

- [ ] [T314] [P] Measure generation time (SC-001): Should be <5s (p95)
- [ ] [T315] [P] Measure clipboard time (SC-002): Should be <500ms (p95)
- [ ] [T316] [P] Measure PDF export time (SC-003): Should be <3s (p95)
- [ ] [T317] [P] Run performance tests 10 times, calculate p95
- [ ] [T318] [P] Log performance results to console
- [ ] [T319] [P] Optimize if any metric exceeds threshold

### Bundle Size Validation

- [ ] [T320] [P] Build production bundle: `npm run build`
- [ ] [T321] [P] Measure total bundle size: `ls -lh dist/*.js`
- [ ] [T322] [P] Verify main bundle <600KB (SC-006)
- [ ] [T323] [P] Verify jsPDF chunk is lazy-loaded (not in main bundle)
- [ ] [T324] [P] Optimize if bundle exceeds 600KB (tree-shaking, compression)

### Readability Testing

- [ ] [T325] [P] Generate 5 sample change orders
- [ ] [T326] [P] Calculate Flesch Reading Ease score for each (SC-005)
- [ ] [T327] [P] Verify average score ≥60 (college level)
- [ ] [T328] [P] Simplify language if score <60 (remove jargon, shorter sentences)
- [ ] [T329] [P] Create `src/lib/utils/ReadabilityCalculator.js` with calculateFleschScore(text) method
- [ ] [T330] [P] Implement Flesch Reading Ease algorithm: 206.835 - 1.015×(words/sentences) - 84.6×(syllables/words)
- [ ] [T331] [P] Add syllable counter helper function (vowel group counting)
- [ ] [T332] [P] Add sentence/word parsing helpers (split by periods, spaces)
- [ ] [T333] [P] Write test: calculateFleschScore() returns 60+ for sample professional text
- [ ] [T334] [P] Write test: Syllable counter accuracy on 20 common words
- [ ] [T335] [P] Update T310-T312 to use ReadabilityCalculator.calculateFleschScore()

### Manual Testing

- [ ] [T336] Test: Generate change order from detection → Verify <5s, all fields pre-filled
- [ ] [T337] Test: Copy to clipboard → Verify <500ms, paste into email works
- [ ] [T338] Test: Export as PDF → Verify <3s, PDF renders correctly, filename correct
- [ ] [T339] Test: Export as Text → Verify markdown-compatible, paste into Slack works
- [ ] [T340] Test: Pricing calculator → Verify calculation accurate ($150 × 8 = $1,200)
- [ ] [T341] Test: Settings page → Verify all fields save, validation works
- [ ] [T342] Test: Auto-export → Verify countdown (3s), cancellation works, success notification
- [ ] [T343] Test: Draft resume → Close popup mid-edit → Reopen → Verify draft restores
- [ ] [T344] Test: Scope pre-fill → Generate 2nd order for same client → Verify scope pre-filled
- [ ] [T345] Test: Long text → Verify truncation to 200 chars + "..."
- [ ] [T346] Test: Missing client name → Verify "Client" placeholder, prompt to edit
- [ ] [T347] Test: First-time client → Verify empty scope, prompt to enter
- [ ] [T348] Test: Dark mode → Verify all UI readable in dark theme
- [ ] [T349] Test: Chrome DevTools Console → Verify no errors during normal operation
- [ ] [T350] Test: Network tab → Verify zero outbound requests (privacy check)

### User Testing

- [ ] [T351] Recruit 5 freelancers for user testing
- [ ] [T352] Task: "Generate and export a change order in under 2 minutes"
- [ ] [T353] Observe user workflow, note friction points
- [ ] [T354] Measure completion time for each user
- [ ] [T355] Calculate success rate: Should be 80%+ (SC-007)
- [ ] [T356] Collect qualitative feedback (what was confusing, what worked well)
- [ ] [T357] Fix critical usability issues discovered
- [ ] [T358] Re-test with 2 users to verify fixes work

### Bug Fixes

- [ ] [T359] Create bug tracker spreadsheet (ID, description, severity, status)
- [ ] [T360] Log all bugs discovered during testing
- [ ] [T361] Prioritize bugs: CRITICAL (blocks export), HIGH (poor UX), MEDIUM (edge case), LOW (nice-to-have)
- [ ] [T362] Fix all CRITICAL bugs before proceeding
- [ ] [T363] Fix all HIGH bugs before proceeding
- [ ] [T364] Fix MEDIUM bugs if time allows (or defer to Phase 2)
- [ ] [T365] Defer LOW bugs to Phase 2 backlog

### Final Validation

- [ ] [T366] Re-run all tests after bug fixes: `npm test`
- [ ] [T367] Re-measure performance metrics (SC-001, SC-002, SC-003)
- [ ] [T368] Re-measure bundle size (SC-006)
- [ ] [T369] Re-validate Constitution Check (all 8 principles still PASS)

**Checkpoint**: All tests pass, performance metrics meet thresholds (<5s, <3s, <500ms), bundle <600KB, user testing 80%+ success

### Template Engine Error Handling (Code Review Suggestion)

- [ ] [T370] [P] Enhance TemplateProcessor error handling for malformed inputs
- [ ] [T371] [P] Add comprehensive validation (missing delimiters, circular refs, deep nesting)
- [ ] [T372] [P] Implement safe fallback rendering (return raw text or error message on parse failure)
- [ ] [T373] [P] Add user-facing error notification: "Template could not be processed. Using basic format."
- [ ] [T374] [P] Log template parsing errors with input context for debugging

**Checkpoint**: Template engine handles all edge cases gracefully, users never see broken documents

---

## Dependencies & Execution Order

### Critical Path (Must Be Sequential)

```
T001-T030 (Setup) → BLOCKS ALL
    ↓
T031-T059 (Settings) → BLOCKS US4 calculator (needs hourly rate storage)
    ↓
T060-T115 (Generation) → BLOCKS US1, US2, US3, US4 (core functionality)
    ↓
T116-T133 (Calculator) → Enhances US4 (depends on Settings + Generation)
    ↓
T134-T179 (Export) → Completes US3 (depends on Generation)
    ↓
T180-T201 (Auto-Export) → Enhances US3 (depends on Export)
    ↓
T202-T220 (Draft/History) → Cross-cutting (depends on Generation)
    ↓
T221-T281 (Edge Cases) → Polish (depends on all features)
    ↓
T282-T342 (Testing) → Validation (depends on all implementation)
```

### Parallel Opportunities

**Phase 1: Setup** - Sequential (foundational)

**Phase 2: Settings** - Limited parallelization:
- T031-T039 (Storage) BEFORE T040-T059 (UI)
- T040-T051 (UI files) can be created in parallel

**Phase 3: Generation** - Moderate parallelization:
- T060-T068 (Template) [P] parallel with T069-T077 (TemplateEngine)
- T078-T092 (Service), T093-T101 (History), T102-T108 (Numbering) can overlap after Setup
- T109-T115 (UI) requires T060-T108 complete

**Phase 4: Calculator** - High parallelization:
- T116-T122 (Logic) [P] parallel with T123-T133 (UI)

**Phase 5: Export** - High parallelization:
- T134-T144 (PDF) [P] parallel with T145-T153 (Clipboard) [P] parallel with T154-T159 (Text)
- T160-T168 (Orchestrator) requires above complete
- T169-T179 (UI) can start after T160

**Phase 6: Auto-Export** - High parallelization:
- T180-T188 (Timer) [P] parallel with T195-T201 (UI)
- T189-T194 (Integration) requires Timer complete

**Phase 7: Draft/History** - High parallelization:
- T202-T213 (Draft) [P] parallel with T214-T220 (History)

**Phase 8: Edge Cases** - High parallelization:
- All edge case handlers [P] independent (T221-T281)

**Phase 9: Testing** - Moderate parallelization:
- Unit tests [P], Integration tests [P], Performance tests [P] can run in parallel
- Manual testing sequential
- Bug fixes sequential (depends on test results)

### Estimated Parallel Efficiency

**Without Parallelization**: ~65 hours (sequential execution)
**With Parallelization**: ~39-50 hours (40-50% time savings)

**Maximum Parallelization**: Phases 4, 5, 7, 8 (up to 3-4 tasks simultaneously)

---

## MVP Scope (Phase 1 Launch)

**Must-Have** (blocks launch):
- T001-T030: Setup & Foundation ✅
- T031-T059: Settings Page ✅
- T060-T115: Template Engine & Generation ✅
- T134-T179: Export Functionality (PDF, Clipboard, Text) ✅
- T221-T274: Core Edge Cases ✅
- T282-T342: Testing & Validation ✅

**Should-Have** (high value, include if time allows):
- T116-T133: Pricing Calculator ✅
- T180-T201: Auto-Export ✅
- T202-T220: Draft Persistence & History ✅

**Could-Have** (nice-to-have, defer if tight deadline):
- T275-T278: Loading States
- T279-T281: Keyboard Shortcuts

**Total MVP Tasks**: 342+ tasks (369 total, can defer loading states/keyboard shortcuts T290-T296 to Phase 2)

---

## Post-Implementation Checklist

### Before Creating PR

- [ ] All tests pass (`npm test`)
- [ ] Bundle size <600KB (`npm run build`)
- [ ] Performance metrics validated (SC-001: <5s, SC-002: <500ms, SC-003: <3s)
- [ ] Manual testing complete (all edge cases tested)
- [ ] User testing 80%+ success rate
- [ ] No console errors in production build
- [ ] Constitution Check re-validated (all 8 principles PASS)

### PR Description

Include:
- Summary of implementation (14 FRs, 4 user stories, 9 edge cases)
- Performance metrics (generation time, export time, bundle size)
- Screenshots (change order view, settings page, calculator widget, export options)
- Test coverage report (80%+ for business logic)
- User testing results (5 users, 80%+ success rate, completion times)
- Known issues (if any, with workarounds)
- Phase 2 backlog items (deferred features)

---

**Tasks Generated**: 2025-11-11
**Ready for Implementation**: ✅ YES
**Next Command**: `/speckit.implement` (or implement manually following task order)
