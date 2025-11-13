# Feature Specification: Change Order Generator

**Feature Branch**: `002-change-order-generator`
**Created**: 2025-11-11
**Status**: Clarified
**Last Updated**: 2025-11-11

## User Scenarios & Testing (MANDATORY)

### User Story 1 - One-Click Change Order Generation (Priority: P0) 🎯 MVP

As a **freelancer who detected scope creep**, I need **one-click professional change order generation** so that **I can quickly send clients a billable request without manually writing documents from scratch**.

**Why this priority**: Core value proposition. Detection without monetization path leaves money on the table. Freelancers avoid confrontation because it's time-consuming and awkward. One-click removes friction and captures billable work.

**Independent Test**: With scope creep detected (from Feature 001), click "Generate Change Order" button in extension popup. Verify change order template appears within 5 seconds with pre-filled client name, detected request, and placeholder cost estimate.

**Acceptance Scenarios**:
1. **Given** user clicks "Generate Change Order" for detected scope creep item, **When** generation runs, **Then** complete change order document appears within 5 seconds with pre-filled details
2. **Given** change order template generated, **When** user reviews document, **Then** document includes: client name (from email), original scope summary, requested change (detected text), estimated cost (placeholder $XXX), professional formatting
3. **Given** multiple scope creep items detected, **When** user generates change order, **Then** system prompts to select which items to include (supports bundling multiple requests into single change order)

---

### User Story 2 - Professional Document Formatting (Priority: P0) 🎯 MVP

As a **freelancer**, I need **professionally formatted change order documents** so that **clients take my pricing requests seriously and I maintain professional credibility**.

**Why this priority**: Poorly formatted documents signal unprofessionalism and reduce payment probability. Professional formatting increases perceived legitimacy, makes pricing discussions easier, and reflects industry standards.

**Independent Test**: Generate change order, verify document includes: header with "Change Order #[ID]", date, client/freelancer names, clear sections (Original Scope, Requested Changes, Cost Impact, Payment Terms), professional typography (readable fonts, proper spacing).

**Acceptance Scenarios**:
1. **Given** change order generated, **When** user reviews formatting, **Then** document includes professional header with "Change Order #[Sequential-ID]", current date, clear section headings
2. **Given** change order document, **When** user reads content, **Then** sections are clearly delineated: "Original Scope Agreement", "Requested Changes" (bulleted list), "Cost Impact" (itemized), "Revised Timeline", "Payment Terms"
3. **Given** change order displayed, **When** user checks typography, **Then** document uses:
   - Professional sans-serif font (Arial, Helvetica, or system default)
   - Body text: 14-16px font size
   - Headings: 18-24px font size
   - Line spacing: 1.5
   - Adequate margins (1 inch minimum or equivalent 72px)

---

### User Story 3 - Easy Export and Sharing (Priority: P0) 🎯 MVP

As a **freelancer**, I need **quick copy-to-clipboard or export options** so that **I can immediately send change orders to clients via email, Slack, or document attachments without manual reformatting**.

**Why this priority**: Friction kills follow-through. Freelancers detect scope creep but lose motivation if sending takes >2 minutes. Instant export ensures they capitalize on detection momentum.

**Independent Test**: With change order generated, verify "Copy to Clipboard" button copies formatted text instantly. Verify "Export as PDF" button downloads PDF file within 3 seconds. Verify "Export as Text" provides plain text version.

**Acceptance Scenarios**:
1. **Given** change order displayed, **When** user clicks "Copy to Clipboard", **Then** formatted text copied to clipboard within 500ms, success notification appears ("Copied! Ready to paste")
2. **Given** change order displayed, **When** user clicks "Export as PDF", **Then** browser downloads PDF file within 3 seconds with filename format "ChangeOrder_[ClientName]_[Date].pdf"
3. **Given** change order displayed, **When** user clicks "Export as Text", **Then** plain text version (no formatting, markdown-compatible) copies to clipboard for pasting into emails/Slack

---

### User Story 4 - Editable Templates (Priority: P1)

As a **freelancer**, I need **editable change order fields** so that **I can customize cost estimates, timelines, and payment terms before sending to clients**.

**Why this priority**: Pre-filled data is 80% accurate, but freelancers need final control over pricing, timelines, and terms. Non-editable templates feel rigid and reduce utility.

**Independent Test**: With change order generated, click any field (cost estimate, timeline, payment terms). Verify field becomes editable inline. Modify values, verify changes persist. Export document, verify updated values appear.

**Acceptance Scenarios**:
1. **Given** change order displayed, **When** user clicks cost estimate placeholder "$XXX", **Then** field becomes editable input OR optional calculator appears (hourly rate × hours → suggestion)
2. **Given** user uses pricing calculator, **When** user enters hourly rate ($150) and estimated hours (8), **Then** cost estimate auto-fills with "$1,200" and user can accept or override
3. **Given** editable change order, **When** user modifies "Revised Timeline" from placeholder to "5 business days", **Then** timeline updates in all document references (header summary, detailed breakdown)
4. **Given** user edits payment terms from "Net 30" to "50% upfront, 50% on completion", **When** user exports to PDF, **Then** PDF reflects updated payment terms

---

### Edge Cases

- **What happens when detected text is too long (>500 characters)?**
  - Truncate to first 200 characters + "..." in change order
  - Include full text in expandable "Details" section

- **What happens when client name can't be extracted from email?**
  - Use "Client" as placeholder
  - Prompt user to edit before exporting
  - Remember client name for future change orders (chrome.storage.local)

- **What happens when user generates multiple change orders for same client?**
  - Auto-increment change order number: "Change Order #001", "#002", "#003"
  - Store history in chrome.storage.local
  - Allow viewing past change orders in dashboard

- **What happens when user generates change order without detected scope creep?**
  - Show "Manual Change Order" option in popup
  - Provide blank template with editable fields
  - Skip pre-filling (user enters all details)

- **What happens when export fails (PDF generation error, clipboard permission denied)?**
  - Show error message with fallback: "Copy failed. Please select text manually."
  - For PDF errors: Offer "Export as Text" alternative
  - Log error to console for debugging

- **What happens when user closes popup before editing?**
  - Save draft change order to chrome.storage.local
  - Show "Resume Draft" option when popup reopens
  - Auto-delete drafts after 7 days

- **What happens when generating first change order for new client?**
  - Original scope field is empty (no history)
  - Prompt user to enter scope manually
  - Save entered scope for future change orders with same client (pre-fill next time)

- **What happens when user hasn't set their name in Settings?**
  - Prompt "Enter your name" during first change order generation
  - Save name to Settings (chrome.storage.local) as default
  - Pre-fill name in all future change orders (editable per-order)

- **What happens when auto-export fails (settings enabled but export errors)?**
  - Show error notification: "Auto-export failed. Please export manually."
  - Display manual export buttons (Copy, PDF, Text)
  - Don't disable auto-export setting (could be temporary error)
  - Log error to console for debugging

## Requirements (MANDATORY)

### Functional Requirements

- **FR-001**: System MUST generate change order document within 5 seconds of user clicking "Generate Change Order" button (p95 latency)

- **FR-002**: System MUST pre-fill change order with: client name (extracted from email sender), detected request text (first 200 chars), original scope summary (pre-filled from last change order for same client OR blank if first-time), freelancer name (from Settings), cost estimate placeholder ($XXX), current date

- **FR-003**: System MUST format change order with professional structure: Header (Change Order #ID, Date), "Original Scope Agreement" section, "Requested Changes" section (bulleted list), "Cost Impact" section (itemized), "Revised Timeline" section, "Payment Terms" section, "Signatures" section (Client/Freelancer signature lines)

- **FR-004**: System MUST assign sequential change order numbers per client, formatted as 3-digit zero-padded strings ("001", "002", ..., "999") stored in changeOrderNumber field. Display format MUST include "#" prefix in UI ("Change Order #001") but stored value is "001" (no prefix).

- **FR-005**: System MUST support "Copy to Clipboard" action that copies formatted change order text within 500ms with success notification

- **FR-006**: System MUST support "Export as PDF" action that generates and downloads PDF file within 3 seconds with filename format "ChangeOrder_[ClientName]_[YYYY-MM-DD].pdf"

- **FR-007**: System MUST support "Export as Text" action that copies plain text (markdown-compatible) version to clipboard for email/Slack pasting

- **FR-008**: System MUST allow inline editing of all dynamic fields: cost estimate, revised timeline, payment terms, additional notes (changes persist until export or popup close)

- **FR-009**: System MUST save draft change orders to chrome.storage.local when user closes popup before exporting (auto-delete drafts after 7 days)

- **FR-010**: System MUST support manual change order creation (blank template) when no scope creep detected, with all fields editable

- **FR-011**: System MUST store change order history (last 50 generated change orders per client) in chrome.storage.local for future reference

- **FR-012**: System MUST provide optional pricing calculator in cost estimate field that calculates: hourly rate × estimated hours = suggested cost estimate (user can accept suggestion or enter custom amount). Calculator MUST validate inputs: hourlyRate > 0 and ≤ $10,000, estimatedHours > 0 and ≤ 1,000. Invalid inputs MUST display inline error messages with suggested ranges.

- **FR-013**: System MUST provide Settings page with fields: freelancer name (required), hourly rate (optional, for calculator), default export method (Copy/PDF/Text), enable auto-export (checkbox)

- **FR-014**: System MUST support auto-export feature (when enabled in Settings) that automatically exports change order using default export method after user finishes editing (with 3-second delay to allow final edits)

- **FR-015**: System MUST provide checkbox UI to select multiple detected scope creep items when generating change order. Selected items MUST combine into single requestedChanges list. UI MUST appear when 2+ detections exist for same client.

- **FR-016**: System MUST detect first-run scenario (freelancerName empty in Settings) and prompt user to enter name before allowing change order generation. Prompt MUST appear as modal dialog with required text input field. System MUST save entered name to Settings for future reuse.

- **FR-017**: System MUST track all export events in ExportHistory (changeOrderId, exportedAt timestamp, exportFormat, optional recipientEmail). History MUST persist to chrome.storage.local. System MUST provide export history view in dashboard.

### Key Entities

- **ChangeOrder**: Represents a generated change order document
  - `id` (string, UUID): Unique identifier
  - `changeOrderNumber` (string): Sequential number "#001", "#002" (per client)
  - `clientName` (string): Client name (from email or user-entered)
  - `clientEmail` (string): Client email address
  - `freelancerName` (string): User's name (from settings)
  - `dateCreated` (ISO 8601 string): Timestamp of generation
  - `originalScope` (string, max 500 chars): Summary of original project scope
  - `requestedChanges` (array of strings): List of scope creep requests (detected text)
  - `costEstimate` (string): Estimated additional cost (user-editable)
  - `revisedTimeline` (string): Updated project timeline (user-editable)
  - `paymentTerms` (string): Payment conditions (default "Net 30", user-editable)
  - `additionalNotes` (string, optional): Custom notes from freelancer
  - `status` (enum): "draft", "generated", "exported"
  - `exportedAt` (ISO 8601 string, nullable): When exported
  - `exportFormat` (enum, nullable): "pdf", "text", "clipboard"

- **ChangeOrderTemplate**: Represents the document structure
  - `templateId` (string): Template identifier ("professional-v1")
  - `sections` (array): Ordered list of document sections
  - `formatting` (object): Typography, spacing, colors
  - `placeholders` (object): Variable substitution mappings

- **ExportHistory**: Tracks exported change orders
  - `changeOrderId` (string, UUID): Reference to ChangeOrder
  - `exportedAt` (ISO 8601 string): Timestamp
  - `exportFormat` (enum): "pdf", "text", "clipboard"
  - `recipientEmail` (string, optional): Who received it

- **FreelancerSettings**: Stores user preferences
  - `freelancerName` (string, required): User's professional name for change orders
  - `hourlyRate` (number, optional): Default hourly rate for pricing calculator (USD)
  - `defaultExportMethod` (enum): "clipboard", "pdf", "text" (default: "clipboard")
  - `autoExportEnabled` (boolean): Whether to auto-export after editing (default: false)
  - `autoExportDelay` (number): Seconds to wait before auto-export (default: 3)

## Success Criteria (MANDATORY)

### Measurable Outcomes

- **SC-001**: Change order generation completes in <5 seconds (p95) measured from button click to document render using performance.now()

- **SC-002**: Copy to clipboard succeeds in <500ms (p95) measured from button click to clipboard write completion

- **SC-003**: PDF export completes in <3 seconds (p95) measured from button click to file download initiation

- **SC-004**: 90%+ of generated change orders include all required sections (Header, Original Scope, Requested Changes, Cost Impact, Timeline, Payment Terms, Signatures) validated by automated testing

- **SC-005**: Change order document readability score ≥60 (Flesch Reading Ease) validated by automated text analysis

- **SC-006**: Extension bundle size increase <100KB after adding change order feature (total <600KB) validated by build output

- **SC-007**: User testing shows 80%+ of freelancers successfully generate and export change order within 2 minutes of first use (5 user test sessions)

## Constitution Check (Phase -1 Gate)

| Principle | Requirement | Status | Notes |
|-----------|-------------|--------|-------|
| I. Privacy-First | No data transmission, all storage chrome.storage.local | ✅ PASS | Change orders stored locally, no API calls |
| II. Simplicity-First | Template-based generation (no AI/ML) | ✅ PASS | Pure string templating with variable substitution |
| III. Real-Time Performance | <5s generation, <500ms clipboard, <3s PDF export | ✅ PASS | Performance budgets defined in FR-001, FR-005, FR-006 |
| IV. Zero Infrastructure | Client-side PDF generation (no backend) | ✅ PASS | Use browser APIs (jsPDF or similar client-side library) |
| V. User Value First | Directly helps freelancers generate billable change orders | ✅ PASS | Core P0 feature: convert detected scope creep to revenue |
| VI. Chrome Web Store | No additional permissions required (uses existing storage) | ✅ PASS | Reuses activeTab, storage, notifications from Feature 001 |
| VII. Measurable Success | 7 metrics defined (SC-001 to SC-007) | ✅ PASS | Generation speed, export speed, completeness, readability, bundle size, user testing |
| VIII. Graceful Degradation | Fallback to text export if PDF fails | ✅ PASS | FR-007 provides text export alternative, manual text selection fallback for clipboard |

**Overall**: ✅ ALL PASS

## Out of Scope (Not in MVP)

- ❌ Multiple change order templates (only "Professional V1" in MVP)
- ❌ Custom template editor (Phase 2)
- ❌ Email integration (auto-send change orders via Gmail API) (Phase 3, requires additional permissions)
- ❌ E-signature integration (DocuSign, HelloSign) (Post-MVP, after 100 users)
- ❌ Change order versioning (tracking edits after export) (Phase 2)
- ❌ Multi-currency support (USD only in MVP) (Phase 3)
- ❌ Tax calculations (cost estimate is pre-tax, user adds manually) (Post-MVP)
- ❌ Change order analytics dashboard (Feature 003)

## Open Questions

1. **Should PDF generation happen client-side or require backend service?**
   - **Suggested Answer**: A) Client-side using jsPDF library (500KB bundle, no backend)
   - **Rationale**: Aligns with Constitution Principle IV (Zero Infrastructure). Client-side PDF libraries exist (jsPDF, pdfMake, html2pdf.js) with ~100-500KB bundle size. Backend PDF generation violates privacy-first principle (requires sending change order content to server) and adds hosting costs.
   - **Decision**: ✅ RESOLVED - Client-side PDF generation using jsPDF or similar
   - **Alternative Rejected**: Backend service (violates Privacy-First and Zero Infrastructure)

2. **Should cost estimate have default pricing guidance (hourly rate * estimated hours)?**
   - **Decision**: ✅ RESOLVED - Option B (Optional hourly rate calculator)
   - **User Selected**: B) Optional hourly rate calculator (user inputs rate + hours → suggests estimate)
   - **Rationale**: Freelancers struggle with pricing (40% undercharge due to uncertainty). Calculator reduces pricing anxiety while keeping final control with user. Simple implementation (~50 lines JS), <1KB bundle impact, aligns with Simplicity-First (no AI/ML).
   - **Implementation**: Cost estimate field shows calculator icon → expands to show hourly rate × estimated hours → calculates suggestion → user can accept or override. Hourly rate saved to Settings for future reuse.
   - **Alternatives Rejected**:
     - A) No calculator - leaves pricing anxiety unresolved
     - C) Smart suggestions (ML) - violates Constitution Principle II (Simplicity-First)

3. **Should change order history be searchable/filterable?**
   - **Decision**: ✅ RESOLVED - Chronological list only for MVP
   - **Rationale**: Searchable history requires UI complexity (search input, filters, pagination) and increases bundle size. Chronological list of last 50 change orders sufficient for MVP (avg freelancer generates 5-10/month). Search becomes valuable after 100+ change orders (6-12 months of use).
   - **Phase 2**: Add search by client name, date range, cost amount in dashboard feature

4. **Where/when does the user provide the original project scope?**
   - **Decision**: ✅ RESOLVED - Option C (Optional pre-fill from past change orders)
   - **User Selected**: C) Pre-fill scope from last change order for same client, allow editing
   - **Rationale**: Best UX - first change order for client → user enters scope manually, subsequent → auto-filled from last (editable). Per-client accuracy (different clients have different scopes). No Feature 001 changes needed (keeps detection focused). Simple fallback (no history → blank field).
   - **Implementation**: When generating change order, query chrome.storage.local for last ChangeOrder with same clientEmail → pre-fill originalScope field → user can edit if project changed → save for next reuse.
   - **Alternatives Rejected**:
     - A) First-time setup in Feature 001 - adds complexity to detection feature
     - B) Per-change-order manual entry - repetitive for same client

5. **How does the system obtain the freelancer's name?**
   - **Decision**: ✅ RESOLVED - Option A (One-time Settings)
   - **User Selected**: A) One-time settings - "Your Name" field in extension Settings page
   - **Rationale**: Professional consistency (same name on all change orders). One-time setup (10-second configuration). Common pattern (invoicing/contract tools). Editable per-change-order if needed (Settings provide default, inline edit available).
   - **Implementation**: Settings page with "Your Name" input → saved to chrome.storage.local → pre-filled in all change orders → user can override inline. If settings empty on first generation → prompt "Enter your name" → save to settings.
   - **Alternatives Rejected**:
     - B) Per-change-order entry - repetitive
     - C) Extract from Gmail - may not match professional name
     - D) Pre-fill from last - less consistent than settings

6. **Should the system remember user's preferred export method?**
   - **Decision**: ✅ RESOLVED - Option C (Settings with auto-export option)
   - **User Selected**: C) Allow setting default export in Settings, with optional auto-export after editing
   - **Rationale**: Maximum workflow efficiency for repeat users. Settings provide control (default method + auto-export toggle). Auto-export with 3-second delay allows final edits. Graceful fallback if auto-export fails (show manual buttons).
   - **Implementation**: Settings page with "Default Export Method" dropdown (Clipboard/PDF/Text) + "Auto-export after editing" checkbox + "Auto-export delay" input (default 3s). When auto-export enabled → 3-second countdown after last edit → auto-triggers default export method → shows success notification OR error + manual buttons.
   - **Alternatives Rejected**:
     - A) No preference - missed optimization opportunity
     - B) Remember last used - less explicit than settings

## Dependencies

- Feature 001 (Detection Engine): Scope creep detection events provide pre-filled data for change orders
- chrome.storage.local API: Store change order history, drafts, sequential numbering
- chrome.clipboard API: Copy to clipboard functionality (requires user interaction, no special permission)
- PDF generation library: Client-side PDF creation (jsPDF, pdfMake, or html2pdf.js) (~100-500KB bundle increase)
- Date formatting library: Professional date display (date-fns or Intl.DateTimeFormat) (~10KB or browser built-in)

## Success Metrics Instrumentation

| Metric | Measurement Method | Threshold |
|--------|-------------------|-----------|
| Generation Speed | `performance.now()` before/after template population | <5s (p95) |
| Clipboard Speed | `performance.now()` before/after clipboard write | <500ms (p95) |
| PDF Export Speed | `performance.now()` before/after PDF download | <3s (p95) |
| Document Completeness | Automated test: verify all 7 required sections present | 90%+ pass rate |
| Readability Score | Flesch Reading Ease algorithm on generated text | ≥60 (college level) |
| Bundle Size | Webpack/Vite build output after PDF library added | <600KB total |
| User Testing | 5 freelancers complete task: detect scope creep → generate → export | 80%+ complete <2min |

## Acceptance Criteria Checklist

- [X] All 4 user stories independently testable (US1: Generation, US2: Formatting, US3: Export, US4: Editing with calculator)
- [X] All 14 functional requirements (FR-001 to FR-014) testable and unambiguous
- [X] Success criteria measurable with specific thresholds (7 metrics: SC-001 to SC-007)
- [X] Constitution Check validates all 8 principles (✅ ALL PASS)
- [X] Edge cases identified with handling strategy (9 edge cases documented)
- [X] No implementation details (specific PDF library choice deferred to planning)
- [X] All open questions resolved (6 total: Q1-Q6 all ✅ RESOLVED)

## Quality Checklist

- [ ] No mentions of specific JavaScript libraries (jsPDF mentioned in context, not mandated)
- [ ] No mentions of specific algorithms (template string substitution implied, not detailed)
- [ ] Requirements focused on "what" not "how" (FR-001 says <5s, not "use Web Workers")
- [ ] Success criteria are quantifiable (<5s, <500ms, 90%+, ≥60 score)
- [ ] Each user story has clear business value statement (P0: captures billable work)
- [ ] Edge cases include failure modes and recovery strategies (PDF fails → text export)
- [ ] Key entities defined with attributes and relationships (ChangeOrder, ChangeOrderTemplate)

---

## Clarification Summary

**Total Questions Resolved**: 6
- ✅ Q1: PDF generation approach (client-side)
- ✅ Q2: Pricing calculator (Option B - optional hourly rate calculator)
- ✅ Q3: Change order history searchability (chronological only for MVP)
- ✅ Q4: Original scope storage (Option C - pre-fill from past change orders)
- ✅ Q5: Freelancer name source (Option A - one-time Settings)
- ✅ Q6: Export preference (Option C - Settings with auto-export)

**Specification Status**: ✅ **FULLY CLARIFIED** - Ready for planning phase

**Impact Summary**:
- **New FRs Added**: 3 (FR-012: Pricing calculator, FR-013: Settings page, FR-014: Auto-export)
- **Edge Cases Added**: 4 (first-time client, missing name, auto-export failure, scope pre-fill)
- **New Entity**: FreelancerSettings (stores user preferences)
- **User Story Updated**: US4 (added pricing calculator scenarios)

---

**Next Steps**: Proceed to `/speckit.plan` with technical implementation design. Recommend including: Vite bundler, jsPDF for client-side PDF generation, chrome.storage.local for persistence, vanilla JavaScript (no frameworks), Settings page UI, pricing calculator widget.
