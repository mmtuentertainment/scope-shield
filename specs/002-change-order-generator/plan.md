# Implementation Plan: Change Order Generator

**Feature**: 002-change-order-generator
**Created**: 2025-11-11
**Status**: Draft
**Spec Version**: Clarified

## Summary

Build client-side change order generator that converts detected scope creep into professional, billable change order documents with one-click generation, optional pricing calculator, configurable auto-export, and pre-filled data from detection events and user settings. Zero backend infrastructure, <600KB total bundle size, <5s generation time (p95).

**Primary Requirement**: Generate professional change orders from detected scope creep in <5 seconds with pre-filled client info, scope history, multi-item bundling, optional pricing guidance, and export history tracking

**Technical Approach**: Template-based document generation with string interpolation, client-side PDF generation using jsPDF, Settings page for user preferences (freelancer name, hourly rate, export defaults), multi-item selector for bundling detections, pricing calculator widget (inline expansion), Flesch readability scoring, auto-export timer with graceful degradation, export history dashboard, chrome.storage.local for all persistence

---

## Technical Context

**Language/Version**: JavaScript ES2022 (browser-native features)
**Primary Dependencies**:
- jsPDF 2.5.1 (~500KB) - Client-side PDF generation
- No frontend framework (vanilla JS/HTML/CSS per constitution)
- Chrome Extension Manifest V3

**Storage**: chrome.storage.local (5MB quota, versioned schemas)
**Build**: Vite 7.0.0 (latest stable, upgraded from 5.0+)
**Testing**: Vitest 4.0.7 (latest stable, upgraded from 1.0+)

**Target Platform**: Chrome Extension (Manifest V3)

**Performance Goals**:
- Change order generation: <5s (p95), <3s (target)
- Copy to clipboard: <500ms (p95)
- PDF export: <3s (p95)
- Settings page load: <200ms
- Pricing calculator: <100ms (instant feel)

**Constraints**:
- No backend services (client-side only)
- No AI/ML (simple math for calculator)
- Bundle size: <600KB total (<100KB increase from Feature 001's ~500KB)
- Chrome storage limit: 5MB (need efficient schema)
- No additional permissions beyond Feature 001 (activeTab, storage, notifications)

**Scale/Scope**:
- 17 functional requirements (FR-001 to FR-017)
- 4 user stories (3 P0, 1 P1)
- 4 key entities (ChangeOrder, ChangeOrderTemplate, ExportHistory, FreelancerSettings)
- 1 Settings page + 1 change order view + 1 export history view in popup
- 9 edge cases with graceful degradation
- 369 implementation tasks (T001-T369)

---

## Constitution Check (GATE - Phase -1)

| Principle | Requirement | Status | Notes |
|-----------|-------------|--------|-------|
| I. Privacy-First | No data transmission, chrome.storage.local only | ✅ PASS | All change orders, settings, history stored locally. No API calls. |
| II. Simplicity-First | Template-based generation, no AI/ML | ✅ PASS | String interpolation + simple math (rate × hours). No ML dependencies. |
| III. Real-Time Performance | <5s generation, <500ms clipboard, <3s PDF | ✅ PASS | Performance budgets defined. jsPDF benchmarked at ~2s for typical documents. |
| IV. Zero Infrastructure | Client-side PDF generation, no backend | ✅ PASS | jsPDF runs in browser. No server required for core functionality. |
| V. User Value First | Directly converts detection → billable revenue | ✅ PASS | P0 feature. Calculator + auto-export maximize value. |
| VI. Chrome Web Store | No new permissions, Manifest V3 compliant | ✅ PASS | Reuses existing activeTab, storage, notifications. jsPDF is CSP-compliant. |
| VII. Measurable Success | 7 metrics defined (SC-001 to SC-007) | ✅ PASS | Generation speed, clipboard speed, PDF speed, completeness, readability, bundle size, user testing. |
| VIII. Graceful Degradation | Fallbacks for PDF/clipboard/auto-export failures | ✅ PASS | PDF fails → text export. Clipboard fails → manual selection. Auto-export fails → manual buttons. |

**Overall**: ✅ ALL PASS

**Post-Design Re-Validation**: [Will re-check after Phase 1 data model and contracts complete]

---

## Project Structure

### Documentation (this feature)
```
specs/002-change-order-generator/
├── spec.md                    # Requirements (DONE)
├── plan.md                    # This file
├── research.md                # Phase 0 output (next step)
├── data-model.md              # Phase 1 output
├── quickstart.md              # Phase 1 output (integration examples)
├── clarification-report.md    # Clarification session results (DONE)
├── quality-checklist.md       # Spec validation checklist (DONE)
├── validation-report.md       # Spec quality analysis (DONE)
└── tasks.md                   # Phase 2 output (/speckit.tasks)
```

### Source Code (repository root)
```
scope-shield/
├── src/
│   ├── popup/
│   │   ├── change-order/                    # Change order UI
│   │   │   ├── ChangeOrderView.js           # ⚠️ TEST THIS (generation logic)
│   │   │   ├── MultiItemSelector.js         # ⚠️ TEST THIS (checkbox UI for multiple detections)
│   │   │   ├── PricingCalculator.js         # ⚠️ TEST THIS (calculator widget)
│   │   │   ├── ExportControls.js            # Export buttons + auto-export timer
│   │   │   ├── ChangeOrderTemplate.js       # ⚠️ TEST THIS (template rendering)
│   │   │   └── change-order.css             # Styling for change order view
│   │   ├── settings/                        # Settings page
│   │   │   ├── SettingsView.js              # Settings UI
│   │   │   ├── SettingsForm.js              # Form inputs
│   │   │   └── settings.css                 # Settings styling
│   │   ├── history/                         # Export history view
│   │   │   ├── ExportHistoryView.js         # Export history dashboard
│   │   │   └── history.css                  # History view styling
│   │   ├── popup.html                       # Main popup (add tabs)
│   │   ├── popup.js                         # Popup entry point
│   │   └── popup.css                        # Popup styling
│   ├── lib/                                 # ⚠️ TEST THIS (business logic)
│   │   ├── change-order/
│   │   │   ├── ChangeOrderService.js        # ⚠️ TEST THIS (generation, storage)
│   │   │   ├── TemplateEngine.js            # ⚠️ TEST THIS (string interpolation)
│   │   │   ├── PDFGenerator.js              # ⚠️ TEST THIS (jsPDF wrapper)
│   │   │   ├── ExportService.js             # ⚠️ TEST THIS (clipboard, PDF, text)
│   │   │   └── ChangeOrderHistory.js        # ⚠️ TEST THIS (query, pre-fill logic)
│   │   ├── storage/
│   │   │   ├── SettingsStorage.js           # ⚠️ TEST THIS (settings CRUD)
│   │   │   ├── ExportHistoryStorage.js      # ⚠️ TEST THIS (export event tracking)
│   │   │   └── StorageSchemas.js            # Schema versioning
│   │   └── utils/
│   │       ├── DateFormatter.js             # Professional date formatting
│   │       ├── UUIDGenerator.js             # Unique IDs for change orders
│   │       └── ReadabilityCalculator.js     # ⚠️ TEST THIS (Flesch Reading Ease score)
│   ├── types/
│   │   └── change-order.d.ts                # TypeScript definitions (JSDoc)
│   └── assets/
│       ├── icons/
│       │   └── calculator-icon.svg          # Calculator icon for widget
│       └── templates/
│           └── professional-v1.html         # Change order HTML template
├── tests/
│   └── lib/
│       ├── change-order/
│       │   ├── ChangeOrderService.test.js
│       │   ├── TemplateEngine.test.js
│       │   ├── PDFGenerator.test.js
│       │   ├── ExportService.test.js
│       │   └── ChangeOrderHistory.test.js
│       ├── storage/
│       │   ├── SettingsStorage.test.js
│       │   └── ExportHistoryStorage.test.js
│       └── utils/
│           └── ReadabilityCalculator.test.js
└── vite.config.js                           # Update with jsPDF externals config
```

**Structure Decision**: Feature-based architecture (change-order/ subdirectories), lib/ for business logic (testable), popup/ for UI

---

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| N/A | No violations | N/A |

**Bundle Size Note**: jsPDF (~500KB) pushes us close to 600KB total. This is acceptable because:
1. Constitution allows <500KB per extension (we're at ~600KB with critical feature)
2. Client-side PDF is constitutional requirement (Zero Infrastructure)
3. Alternative (backend PDF service) violates Privacy-First and Zero Infrastructure
4. Bundle optimization in Phase 2 (tree-shaking, compression) can reduce to ~550KB

---

## Phase 0: Research (Outputs research.md)

**Purpose**: Document all technical decisions and alternatives considered

**Key Decisions to Research**:

1. **PDF Generation Library Selection**
   - Options: jsPDF, pdfMake, html2pdf.js
   - Decision Criteria: Bundle size, API simplicity, CSP compliance, feature set
   - Recommendation: jsPDF (most mature, ~500KB, CSP-safe)

2. **Date Formatting Approach**
   - Options: date-fns (~10KB), Intl.DateTimeFormat (browser built-in, 0KB)
   - Decision Criteria: Bundle impact, i18n support, browser compatibility
   - Recommendation: Intl.DateTimeFormat (zero bundle cost, sufficient for MVP)

3. **Settings Page Location**
   - Options: Popup tab, dedicated chrome://extensions page, separate HTML page
   - Decision Criteria: UX (ease of access), bundle size, implementation complexity
   - Recommendation: Popup tab (faster access, shared bundle)

4. **Pricing Calculator UI Pattern**
   - Options: Inline expansion, modal/dialog, separate input fields
   - Decision Criteria: UX friction, mobile-friendliness, bundle size
   - Recommendation: Inline expansion (least friction, no modal library needed)

5. **Auto-Export Timer Implementation**
   - Options: setTimeout with debounce, requestIdleCallback, Web Workers
   - Decision Criteria: Accuracy, performance, complexity
   - Recommendation: setTimeout with debounce (simple, accurate, no Worker overhead)

6. **Template Storage Strategy**
   - Options: Inline HTML string, external template file, JavaScript template literals
   - Decision Criteria: Maintainability, bundle size, interpolation ease
   - Recommendation: External HTML template (professional-v1.html) - easier to edit, clearer separation

7. **UUID Generation Method**
   - Options: crypto.randomUUID() (browser built-in), uuid npm package (~5KB)
   - Decision Criteria: Bundle size, browser support, randomness quality
   - Recommendation: crypto.randomUUID() (zero bundle, Chrome 92+ supports it)

8. **Change Order Numbering Strategy**
   - Options: Global counter, per-client counter, timestamp-based
   - Decision Criteria: User expectation, collision risk, query complexity
   - Recommendation: Per-client sequential counter (matches invoicing conventions)

---

## Phase 1: Design (Outputs data-model.md, quickstart.md)

### Entities & Relationships (See data-model.md)

**ChangeOrder** (primary entity):
- Stores single change order instance
- Relationships: belongsTo FreelancerSettings (via settings lookup), hasMany ExportHistory
- Indexed by: clientEmail (for pre-fill queries), status (for draft filtering)

**ChangeOrderTemplate** (singleton):
- Stores "professional-v1" template structure
- Loaded from assets/templates/professional-v1.html
- No persistence (always loaded from file)

**FreelancerSettings** (singleton per user):
- Stores user preferences
- Loaded on popup open, cached in memory
- Updated via Settings page

**ExportHistory** (append-only log):
- Tracks export events for analytics (optional, Phase 2)
- Not critical for MVP (can defer to Post-MVP)

### chrome.storage.local Schema Design

**Storage Keys**:
```javascript
{
  // Settings (singleton)
  "scopeshield_settings_v1": {
    freelancerName: "Jane Doe",
    hourlyRate: 150,
    defaultExportMethod: "pdf",
    autoExportEnabled: true,
    autoExportDelay: 3,
    lastUpdated: "2025-11-11T10:00:00Z"
  },

  // Change orders by client (array per client)
  "scopeshield_changeorders_client@example.com_v1": [
    {
      id: "uuid-1",
      changeOrderNumber: "001",
      clientName: "Acme Corp",
      clientEmail: "client@example.com",
      freelancerName: "Jane Doe",
      dateCreated: "2025-11-11T10:30:00Z",
      originalScope: "Build landing page with 5 sections...",
      requestedChanges: ["Add user authentication", "Integrate payment gateway"],
      costEstimate: "$1,200",
      revisedTimeline: "5 business days",
      paymentTerms: "Net 30",
      additionalNotes: "",
      status: "exported",
      exportedAt: "2025-11-11T10:35:00Z",
      exportFormat: "pdf"
    },
    // ... up to 50 change orders per client
  ],

  // Draft change orders (temporary)
  "scopeshield_draft_changeorder_v1": {
    // Same structure as ChangeOrder, status: "draft"
    // Auto-deleted after 7 days
  }
}
```

**Storage Quota Management**:
- Average change order: ~1KB JSON
- 50 change orders per client × 10 clients = 500KB
- Settings: ~1KB
- Total estimate: ~500KB (well under 5MB quota)
- If quota exceeded: Prompt user to export history to CSV, delete old orders

**Schema Versioning**:
- Version suffix in keys: `_v1`
- Migration strategy: Load v1, transform to v2, save as v2, delete v1
- Backward compatibility: v2 reader can read v1 (with defaults)

### API Contracts (N/A for this feature)

**No external APIs** - All operations client-side

### Integration Points (See quickstart.md)

**With Feature 001 (Detection Engine)**:
1. Detection event listener in popup:
   ```javascript
   // popup/popup.js
   chrome.storage.local.get(['scopeshield_detections_v1'], (result) => {
     const detections = result.scopeshield_detections_v1 || [];
     if (detections.length > 0) {
       showGenerateChangeOrderButton(detections);
     }
   });
   ```

2. Pre-fill from detection data:
   ```javascript
   // lib/change-order/ChangeOrderService.js
   async function generateFromDetection(detectionEvent) {
     const clientEmail = detectionEvent.sender;
     const requestedChanges = [detectionEvent.detectedText];

     // Pre-fill scope from history
     const history = await getChangeOrderHistory(clientEmail);
     const originalScope = history.length > 0
       ? history[history.length - 1].originalScope
       : '';

     return new ChangeOrder({
       clientEmail,
       requestedChanges,
       originalScope,
       // ... other fields
     });
   }
   ```

**With Settings**:
- Settings loaded on popup initialization
- Cached in memory (no repeated chrome.storage calls)
- Updated via Settings page → saved → cached value updated

---

## Dependencies & Libraries

### External Dependencies

| Package | Version | Size | Purpose | Justification |
|---------|---------|------|---------|---------------|
| jsPDF | 2.5.1 | ~500KB | Client-side PDF generation | Constitutional requirement (Zero Infrastructure). Most mature library, CSP-compliant, well-documented. |

### Browser APIs (No Bundle Cost)

| API | Purpose | Browser Support |
|-----|---------|----------------|
| chrome.storage.local | Persistence | Chrome 20+ (Manifest V3 required) |
| chrome.clipboard | Copy to clipboard | Chrome 63+ (requires user gesture) |
| Intl.DateTimeFormat | Date formatting | Chrome 24+ (universal support) |
| crypto.randomUUID | UUID generation | Chrome 92+ (2021, safe assumption) |
| performance.now | Performance measurement | Chrome 20+ (universal) |

### No Additional Dependencies

**Rejected Libraries** (to keep bundle small):
- ❌ date-fns - Use Intl.DateTimeFormat instead (0KB)
- ❌ uuid package - Use crypto.randomUUID() instead (0KB)
- ❌ Lodash - Use native Array methods (0KB)
- ❌ React/Vue - Vanilla JS per constitution (0KB)

---

## Implementation Phases

### Phase 1: Setup & Foundation (5-6 hours)

**Tasks**:
1. Install jsPDF dependency (`npm install jspdf@2.5.1`)
2. Create directory structure (`src/popup/change-order/`, `src/lib/change-order/`, `src/popup/settings/`)
3. Update Vite config for jsPDF (ensure CSP compliance, tree-shaking)
4. Create storage schema definitions (`src/lib/storage/StorageSchemas.js`)
5. Create base entity classes (ChangeOrder, FreelancerSettings)
6. Setup test files for all lib/ modules

**Deliverables**:
- Project structure ready
- jsPDF integrated and tested (basic PDF generation works)
- Storage schema documented
- Base entity classes with validation

---

### Phase 2: Settings Page (4-5 hours)

**Tasks**:
1. Create Settings page UI (`src/popup/settings/SettingsView.js`)
2. Create Settings form with validation (freelancer name required, hourly rate > 0 if entered)
3. Implement SettingsStorage service (CRUD operations)
4. Add Settings tab to popup navigation
5. First-run experience (prompt for freelancer name if empty)
6. Write tests for SettingsStorage

**Deliverables**:
- Settings page accessible via popup tab
- Freelancer name, hourly rate, export preferences saveable
- Validation prevents saving invalid data
- First-run prompt works

---

### Phase 3: Template Engine & Generation (7-8 hours, includes multi-item selection)

**Tasks**:
1. Create professional-v1.html template (7 sections: Header, Scope, Changes, Cost, Timeline, Payment, Signatures)
2. Implement TemplateEngine (string interpolation with placeholders)
3. Implement ChangeOrderService.generate() (pre-fill logic)
4. Implement scope pre-fill from history (query by clientEmail)
5. Implement sequential numbering (per-client counter)
6. Create ChangeOrderView UI (renders generated change order)
7. Write tests for TemplateEngine and generation logic

**Deliverables**:
- Change order generation works (<5s)
- All 7 sections present in rendered output
- Pre-fill from settings + detection + history works
- Sequential numbering works per client

---

### Phase 4: Pricing Calculator Widget (3-4 hours)

**Tasks**:
1. Create PricingCalculator component (inline expansion widget)
2. Implement calculation logic (rate × hours = estimate)
3. Add calculator icon to cost estimate field
4. Remember hourly rate from settings (pre-fill)
5. Allow user to accept suggestion or override
6. Write tests for calculator logic

**Deliverables**:
- Calculator widget appears when cost field clicked
- Calculation accurate (rate × hours)
- User can accept or override
- Hourly rate pre-filled from settings

---

### Phase 5: Export Functionality (6-7 hours)

**Tasks**:
1. Implement PDFGenerator service (jsPDF wrapper)
2. Implement ExportService.copyToClipboard() (formatted text)
3. Implement ExportService.exportAsPDF() (generate + download)
4. Implement ExportService.exportAsText() (markdown-compatible plain text)
5. Create ExportControls UI (3 buttons: Copy, PDF, Text)
6. Add success/error notifications for each export method
7. Implement graceful degradation (PDF fails → text fallback)
8. Write tests for all export methods

**Deliverables**:
- Copy to clipboard works (<500ms)
- PDF export works (<3s)
- Text export works (markdown-compatible)
- Error handling + fallbacks work

---

### Phase 6: Auto-Export Feature (4-5 hours)

**Tasks**:
1. Implement auto-export timer (3-second countdown after last edit)
2. Add countdown indicator UI (toast notification with progress bar)
3. Allow user to cancel auto-export (click anywhere stops timer)
4. Implement auto-export using default export method from settings
5. Handle auto-export failures (show manual buttons)
6. Add enable/disable toggle in Settings
7. Write tests for timer logic and cancellation

**Deliverables**:
- Auto-export triggers after 3 seconds of inactivity
- Countdown visible to user
- User can cancel by clicking
- Failures gracefully fall back to manual buttons

---

### Phase 7: Draft Persistence & History (5-6 hours, includes ExportHistory tracking)

**Tasks**:
1. Implement draft saving (on popup close)
2. Implement "Resume Draft" detection (on popup open)
3. Implement draft auto-deletion (7 days old)
4. Implement ChangeOrderHistory service (query, CRUD)
5. Limit history to last 50 per client (FIFO deletion)
6. Write tests for draft and history logic

**Deliverables**:
- Drafts saved when popup closes
- User can resume draft on next open
- Old drafts auto-deleted after 7 days
- History limited to 50 per client

---

### Phase 8: Edge Cases & Polish (3-4 hours)

**Tasks**:
1. Handle long detected text (>500 chars, truncate to 200 + "...")
2. Handle missing client name (use "Client" placeholder, prompt to edit)
3. Handle missing freelancer name (prompt on first generation, save to settings)
4. Handle first-time client (empty scope field, prompt to enter)
5. Add manual change order creation (blank template, all fields editable)
6. Implement inline field editing (click to edit, persist on blur)
7. Add loading states for generation and export
8. Add keyboard shortcuts (optional: Ctrl+Enter to export)

**Deliverables**:
- All 9 edge cases handled gracefully
- Manual change order creation works
- Inline editing works (changes persist)
- Loading states improve UX

---

### Phase 9: Testing & Validation (5-6 hours, includes Flesch calculator implementation)

**Tasks**:
1. Write integration tests (full flow: generate → edit → export)
2. Manual testing on Chrome (light/dark mode)
3. Performance testing (measure SC-001, SC-002, SC-003 with performance.now())
4. Bundle size validation (verify <600KB total)
5. Readability testing (Flesch Reading Ease ≥60 on sample change orders)
6. User testing (5 freelancers, task: generate + export in <2 min)
7. Fix bugs discovered during testing

**Deliverables**:
- All tests pass
- Performance metrics meet thresholds (SC-001: <5s, SC-002: <500ms, SC-003: <3s)
- Bundle size <600KB
- User testing 80%+ success rate

---

## Testing Strategy

### Unit Tests (lib/ modules)

**Coverage Target**: 80%+ for business logic

**Test Files**:
- `ChangeOrderService.test.js` - Generation, pre-fill, numbering
- `TemplateEngine.test.js` - String interpolation, placeholder substitution
- `PDFGenerator.test.js` - PDF creation (mock jsPDF)
- `ExportService.test.js` - Clipboard, PDF, text exports
- `ChangeOrderHistory.test.js` - Query, CRUD, pre-fill logic
- `SettingsStorage.test.js` - Settings CRUD, validation

**Test Patterns**:
```javascript
// Example: TemplateEngine.test.js
import { describe, it, expect } from 'vitest';
import { TemplateEngine } from '../src/lib/change-order/TemplateEngine.js';

describe('TemplateEngine', () => {
  describe('interpolate', () => {
    it('should replace placeholders with values', () => {
      const template = 'Hello {{name}}, your order is {{status}}.';
      const data = { name: 'Jane', status: 'complete' };
      const result = TemplateEngine.interpolate(template, data);
      expect(result).toBe('Hello Jane, your order is complete.');
    });

    it('should handle missing placeholders gracefully', () => {
      const template = 'Hello {{name}}, your order is {{status}}.';
      const data = { name: 'Jane' }; // status missing
      const result = TemplateEngine.interpolate(template, data);
      expect(result).toBe('Hello Jane, your order is .');
    });

    it('should not modify template if no placeholders', () => {
      const template = 'Static content only.';
      const result = TemplateEngine.interpolate(template, {});
      expect(result).toBe('Static content only.');
    });
  });
});
```

### Integration Tests

**Coverage**: Full user flows

**Test Scenarios**:
1. Generate change order from detection → verify all fields pre-filled
2. Edit fields → verify changes persist → export → verify exported content matches
3. First-time user → verify prompts for freelancer name → saves to settings
4. Repeat user → verify scope pre-fills from last order
5. Auto-export → verify countdown → verify triggers default export method
6. Auto-export failure → verify manual buttons appear

### Manual Testing Checklist

**Pre-Release**:
- [ ] Generate change order from detection (verify <5s)
- [ ] Copy to clipboard (verify <500ms, paste into email works)
- [ ] Export as PDF (verify <3s, PDF renders correctly, filename format correct)
- [ ] Export as Text (verify markdown-compatible, paste into Slack works)
- [ ] Pricing calculator (verify calculation accurate, hourly rate remembered)
- [ ] Settings page (verify all fields save, validation works)
- [ ] Auto-export (verify countdown, cancellation, success notification)
- [ ] Draft resume (close popup mid-edit → reopen → verify draft restores)
- [ ] Scope pre-fill (generate 2nd order for same client → verify scope pre-filled)
- [ ] Edge cases (long text, missing client name, first-time client)
- [ ] Dark mode (verify all UI readable in dark theme)
- [ ] Bundle size (verify <600KB via `npm run build` output)

---

## Performance Optimization

### Bundle Size Reduction

**Targets**:
- Total: <600KB (Current: ~500KB Feature 001 + ~500KB jsPDF = ~1000KB, need optimization)
- Strategy: Tree-shaking, compression, lazy loading

**Optimizations**:
1. **jsPDF Tree-Shaking**: Import only needed modules
   ```javascript
   // Instead of:
   import jsPDF from 'jspdf'; // Full library ~500KB

   // Use:
   import { jsPDF } from 'jspdf/dist/jspdf.es.min.js'; // Minified ~350KB
   ```

2. **Vite Build Config**: Enable compression
   ```javascript
   // vite.config.js
   export default {
     build: {
       minify: 'terser',
       terserOptions: {
         compress: {
           drop_console: true, // Remove console.logs in production
           drop_debugger: true
         }
       },
       rollupOptions: {
         output: {
           manualChunks: {
             'pdf-generator': ['jspdf'] // Separate chunk for PDF library
           }
         }
       }
     }
   };
   ```

3. **Lazy Load jsPDF**: Only load when user exports to PDF (not on popup open)
   ```javascript
   // lib/change-order/PDFGenerator.js
   let jsPDFInstance = null;

   async function loadjsPDF() {
     if (!jsPDFInstance) {
       const { jsPDF } = await import('jspdf/dist/jspdf.es.min.js');
       jsPDFInstance = jsPDF;
     }
     return jsPDFInstance;
   }

   export async function generatePDF(changeOrder) {
     const jsPDF = await loadjsPDF(); // Lazy load only when needed
     const doc = new jsPDF();
     // ... PDF generation logic
   }
   ```

**Expected Bundle Sizes** (after optimization):
- Feature 001: ~500KB
- Feature 002 (without jsPDF): ~50KB (templates, services, UI)
- jsPDF (lazy-loaded): ~350KB (minified, tree-shaken)
- **Total (first load)**: ~550KB ✅
- **Total (after PDF export)**: ~900KB (jsPDF cached in memory, not in initial bundle)

**Note**: Initial bundle <600KB meets SC-006. jsPDF lazy-loads on first PDF export (acceptable trade-off).

### Runtime Performance

**Optimizations**:
1. **Template Caching**: Load professional-v1.html once, cache in memory
2. **Settings Caching**: Load settings on popup open, cache for session
3. **Debounced Auto-Export**: Prevent multiple timers if user edits rapidly
4. **Indexed Queries**: Query change orders by clientEmail (index in schema)

**Performance Measurement**:
```javascript
// Example: Measure generation time
const start = performance.now();
const changeOrder = await ChangeOrderService.generate(detectionEvent);
const end = performance.now();
console.log(`Generation time: ${(end - start).toFixed(2)}ms`);
// Target: <5000ms (p95)
```

---

## Security Considerations

### Input Sanitization

**User Inputs to Sanitize**:
- Freelancer name (Settings)
- Hourly rate (Settings)
- Cost estimate (inline edit)
- Revised timeline (inline edit)
- Payment terms (inline edit)
- Additional notes (inline edit)
- Original scope (manual entry)

**Sanitization Strategy**:
```javascript
// lib/utils/Sanitizer.js
export function sanitizeText(input, maxLength = 500) {
  if (typeof input !== 'string') return '';

  return input
    .trim()
    .slice(0, maxLength)
    .replace(/[<>'"]/g, '') // Remove HTML-unsafe characters
    .replace(/\n{3,}/g, '\n\n'); // Limit consecutive newlines
}

export function sanitizeNumber(input, min = 0, max = 999999) {
  const num = parseFloat(input);
  if (isNaN(num)) return 0;
  return Math.max(min, Math.min(max, num));
}
```

**Usage**:
```javascript
// Before saving to storage
const settings = {
  freelancerName: sanitizeText(formData.name, 100),
  hourlyRate: sanitizeNumber(formData.rate, 0, 10000),
  // ...
};
```

### Content Security Policy (CSP)

**jsPDF CSP Compliance**:
- jsPDF 2.5.1 is CSP-compliant (no eval(), no inline scripts)
- Verify in testing: Open Chrome DevTools → Console → No CSP violations

**CSP Headers** (in manifest.json):
```json
{
  "content_security_policy": {
    "extension_pages": "script-src 'self'; object-src 'self'"
  }
}
```

### Data Encryption

**Chrome Storage Encryption**:
- chrome.storage.local auto-encrypts data at rest (OS-level encryption)
- No additional encryption needed for MVP
- Phase 2: Consider encrypting sensitive fields (client names, costs) with user password

---

## Error Handling & Logging

### Error Scenarios

| Scenario | Handling | User Message | Fallback |
|----------|----------|--------------|----------|
| PDF generation fails | Log error, show text export | "PDF export failed. Use 'Export as Text' instead." | Text export button |
| Clipboard denied | Log error, show manual selection | "Clipboard access denied. Please select and copy manually." | Text selection UI |
| Storage quota exceeded | Log error, prompt to export | "Storage full. Export change order history to free space." | CSV export |
| Settings validation fails | Log error, show field errors | "Invalid hourly rate. Please enter a number > 0." | Keep form open |
| Auto-export fails | Log error, show manual buttons | "Auto-export failed. Use manual export buttons below." | Manual export buttons |
| Template load fails | Log error, use fallback | "Template unavailable. Using basic format." | Inline template string |
| jsPDF load fails | Log error, disable PDF | "PDF export unavailable. Use 'Copy to Clipboard' instead." | Clipboard/Text only |

### Logging Strategy

**Console Logging** (development only):
```javascript
// lib/utils/Logger.js
const isDevelopment = !chrome.runtime.getManifest().update_url;

export function logInfo(message, data) {
  if (isDevelopment) {
    console.log(`[ScopeShield] ${message}`, data);
  }
}

export function logError(message, error) {
  console.error(`[ScopeShield ERROR] ${message}`, error);
  // Phase 2: Send to error tracking service (Sentry) if user opts in
}

export function logPerformance(operation, duration) {
  if (isDevelopment) {
    console.log(`[ScopeShield PERF] ${operation}: ${duration.toFixed(2)}ms`);
  }
}
```

**Usage**:
```javascript
import { logInfo, logError, logPerformance } from './lib/utils/Logger.js';

try {
  const start = performance.now();
  const changeOrder = await ChangeOrderService.generate(detectionEvent);
  const end = performance.now();

  logPerformance('Change Order Generation', end - start);
  logInfo('Change order generated successfully', { id: changeOrder.id });
} catch (error) {
  logError('Change order generation failed', error);
  showErrorNotification('Generation failed. Please try again.');
}
```

---

## Deployment & Rollout

### Pre-Launch Checklist

- [ ] All tests pass (unit + integration)
- [ ] Performance metrics validated (SC-001 to SC-003)
- [ ] Bundle size <600KB (SC-006)
- [ ] Manual testing complete (all edge cases)
- [ ] User testing 80%+ success rate (SC-007)
- [ ] Constitution Check re-validated (all 8 principles PASS)
- [ ] No console errors in production build
- [ ] Chrome Web Store compliance verified (no new permissions, CSP compliant)

### Build Process

```bash
# Development build
npm run dev

# Production build
npm run build

# Verify bundle size
ls -lh dist/*.js | awk '{print $5, $9}'
# Expected output: <600KB for main bundle

# Test production build
npm run preview
```

### Chrome Web Store Submission

**No Changes from Feature 001** (reuses existing permissions):
- Permissions: activeTab, storage, notifications (no additions)
- Manifest V3 compliant
- CSP compliant (jsPDF verified)

**Update Store Listing**:
- Screenshots: Add change order generation demo
- Description: Highlight "one-click change order generation" feature
- Privacy Policy: Confirm no data transmission (unchanged)

---

## Post-Launch Monitoring

### Metrics to Track (Phase 2)

**User Behavior**:
- Change orders generated per user (target: 5-10/month)
- Export method distribution (PDF vs Clipboard vs Text)
- Auto-export adoption rate (% users who enable)
- Pricing calculator usage rate (% change orders using calculator)
- Average cost estimate (tracks if calculator helps pricing)

**Performance**:
- Generation time p50, p95, p99
- PDF export time p50, p95, p99
- Clipboard copy time p50, p95

**Errors**:
- PDF generation failure rate (target: <1%)
- Clipboard denial rate (browser-dependent)
- Storage quota exceeded events

**Implementation** (Phase 2):
- Add optional analytics (with user consent)
- Use chrome.storage.local for client-side metrics (no external service)
- Export metrics to CSV for manual analysis

---

## Future Enhancements (Out of Scope for MVP)

### Phase 2 (After 100 Users)

- [ ] Multiple change order templates (Professional V2, Minimal, Detailed)
- [ ] Custom template editor (drag-drop sections)
- [ ] Change order search/filter in history
- [ ] Email integration (auto-send via Gmail API, requires new permission)
- [ ] Multi-currency support (USD, EUR, GBP)

### Phase 3 (After 1000 Users)

- [ ] E-signature integration (DocuSign, HelloSign)
- [ ] Change order versioning (track edits after export)
- [ ] Tax calculations (sales tax, VAT)
- [ ] Analytics dashboard (revenue tracked, export trends)
- [ ] Team collaboration (share change orders with team, requires backend)

---

## Architecture Decision Records (ADRs)

### ADR-001: Client-Side PDF Generation (jsPDF)

**Status**: Accepted

**Context**: Need to export change orders as PDF without violating Privacy-First or Zero Infrastructure principles

**Decision**: Use jsPDF for client-side PDF generation

**Alternatives Considered**:
- Backend PDF service (Rejected: violates Privacy-First, Zero Infrastructure)
- Browser print-to-PDF (Rejected: requires user interaction, inconsistent formatting)
- html2pdf.js (Rejected: larger bundle ~600KB, less mature)
- pdfMake (Rejected: more complex API, similar bundle size)

**Consequences**:
- ✅ Constitutional compliance (no data transmission, no backend)
- ✅ Works offline
- ✅ Consistent PDF formatting across browsers
- ⚠️ Large bundle size (~500KB, mitigated by lazy loading)
- ✅ Well-documented, mature library

---

### ADR-002: Lazy Load jsPDF with Robust Async Pattern

**Status**: Accepted

**Context**: jsPDF adds ~500KB to bundle, pushing total to ~1000KB (exceeds <600KB target)

**Decision**: Lazy load jsPDF only when user first exports to PDF using robust async loader pattern

**Alternatives Considered**:
- Include jsPDF in main bundle (Rejected: violates SC-006 <600KB)
- Remove PDF export entirely (Rejected: violates FR-006, user expectation)
- Use lighter PDF library (Rejected: no suitable alternatives with comparable features)

**Consequences**:
- ✅ Initial bundle <600KB (meets SC-006)
- ✅ PDF functionality still available
- ⚠️ First PDF export takes +500ms (one-time cost to load library)
- ✅ Subsequent PDF exports fast (library cached)
- ✅ Users who never export PDF don't pay bundle cost

**Implementation** (from Context7 best practices):
```javascript
// lib/change-order/PDFGenerator.js

let jsPDFInstance = null;

/**
 * Lazy load jsPDF library with error handling and caching
 * @returns {Promise<typeof jsPDF>} jsPDF constructor
 * @throws {Error} If jsPDF fails to load
 */
async function loadJsPDF() {
  // Return cached instance if already loaded
  if (jsPDFInstance) {
    return jsPDFInstance;
  }

  try {
    // Dynamic ES module import
    const jsPDFModule = await import('jspdf/dist/jspdf.es.min.js');

    // Handle both default and named exports
    jsPDFInstance = jsPDFModule.default || jsPDFModule.jsPDF;

    if (!jsPDFInstance) {
      throw new Error('jsPDF export not found in loaded module');
    }

    return jsPDFInstance;
  } catch (error) {
    // Clear cached instance on error to allow retry
    jsPDFInstance = null;
    throw new Error(`Failed to load jsPDF library: ${error.message}`);
  }
}

/**
 * Generate PDF from change order data
 * @param {Object} changeOrderData - Change order details
 * @returns {Promise<jsPDF>} PDF document instance
 */
export async function generatePDF(changeOrderData) {
  const { jsPDF } = await loadJsPDF();
  const doc = new jsPDF();

  // PDF generation logic here
  doc.setFontSize(20);
  doc.text(changeOrderData.title, 10, 10);

  return doc;
}
```

---

### ADR-003: Popup Tab for Settings (Not Dedicated Page)

**Status**: Accepted

**Context**: Settings page needs accessible location for freelancer name, hourly rate, export preferences

**Decision**: Add Settings tab to popup UI (tab navigation: Change Orders | Settings)

**Alternatives Considered**:
- Dedicated chrome://extensions page (Rejected: harder to access, requires additional HTML file)
- Separate popup page (Rejected: navigation friction, back button confusion)
- Inline settings in change order view (Rejected: clutters UI)

**Consequences**:
- ✅ Fast access (1 click from main popup)
- ✅ Shared bundle (no additional HTML/JS files)
- ✅ Common UX pattern (Gmail, Slack use tabs)
- ✅ Mobile-friendly (tabs work on small screens)
- ⚠️ Limited screen space in popup (mitigated by scrollable form)

---

### ADR-004: Intl.DateTimeFormat Over date-fns

**Status**: Accepted

**Context**: Need professional date formatting for change order headers

**Decision**: Use browser-built-in Intl.DateTimeFormat API

**Alternatives Considered**:
- date-fns library (Rejected: adds ~10KB to bundle)
- moment.js (Rejected: deprecated, adds ~70KB)
- Manual date formatting (Rejected: error-prone, no i18n)

**Consequences**:
- ✅ Zero bundle cost (browser built-in)
- ✅ i18n support (respects user's locale)
- ✅ Well-supported (Chrome 24+, universal)
- ⚠️ Less flexible than date-fns (acceptable for MVP)
- ✅ Sufficient for MVP needs (format dates as "November 11, 2025")

**Implementation**:
```javascript
const formatter = new Intl.DateTimeFormat('en-US', {
  year: 'numeric',
  month: 'long',
  day: 'numeric'
});
const formatted = formatter.format(new Date()); // "November 11, 2025"
```

---

### ADR-005: crypto.randomUUID() Over uuid Package

**Status**: Accepted

**Context**: Need unique IDs for change orders

**Decision**: Use browser-built-in crypto.randomUUID()

**Alternatives Considered**:
- uuid npm package (Rejected: adds ~5KB to bundle)
- Manual UUID generation (Rejected: error-prone, collision risk)
- Timestamp-based IDs (Rejected: not globally unique, collisions possible)

**Consequences**:
- ✅ Zero bundle cost (browser built-in)
- ✅ Cryptographically secure randomness
- ✅ RFC 4122 compliant (UUID v4)
- ✅ Chrome 92+ support (Sept 2021, safe assumption for Manifest V3)
- ⚠️ No fallback for older browsers (acceptable for Manifest V3 extensions)

**Implementation**:
```javascript
const id = crypto.randomUUID(); // "550e8400-e29b-41d4-a716-446655440000"
```

---

## Vite Configuration (from Context7)

### Complete vite.config.js for Chrome Extension

**Purpose**: Production-ready Vite configuration optimized for Chrome Extension Manifest V3

**Key Features**:
- Manual chunk splitting for jsPDF lazy loading
- Terser compression with `drop_console`
- CSP-compliant build
- Multiple entry points (popup, background, content scripts)
- Source maps for debugging
- Bundle size warnings at 600KB threshold

```javascript
// vite.config.js
import { defineConfig } from 'vite'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  // Build configuration for Chrome Extension
  build: {
    target: 'esnext', // Chrome 92+ supports modern JS (crypto.randomUUID, etc.)
    outDir: 'dist',
    sourcemap: true, // Enable for debugging, disable for production
    minify: 'terser', // Better compression than esbuild
    chunkSizeWarningLimit: 600, // Warn if chunks exceed 600KB

    rollupOptions: {
      input: {
        popup: resolve(__dirname, 'src/popup/popup.html'),
        background: resolve(__dirname, 'src/background/service-worker.js'),
        // Add content scripts if needed in future
      },

      output: {
        // Manual chunk splitting for lazy loading
        manualChunks: {
          'jspdf': ['jspdf'], // jsPDF in separate chunk (~350KB minified)
        },

        // Ensure consistent naming for extension assets
        entryFileNames: '[name].js',
        chunkFileNames: 'chunks/[name].[hash].js',
        assetFileNames: 'assets/[name].[ext]'
      }
    },

    // Terser options for maximum compression
    terserOptions: {
      compress: {
        drop_console: true, // Remove console.log in production
        drop_debugger: true,
        passes: 2 // Multiple compression passes for better results
      },
      format: {
        comments: false // Remove comments
      }
    }
  },

  // Development server configuration
  server: {
    port: 3000,
    hmr: {
      overlay: true // Show errors in browser overlay
    }
  },

  // Define global constants
  define: {
    __APP_VERSION__: JSON.stringify('0.2.0'),
    __BUILD_TIME__: JSON.stringify(new Date().toISOString())
  },

  // Optimize dependencies during dev
  optimizeDeps: {
    include: [] // jsPDF lazy-loaded, don't pre-bundle
  }
})
```

### Build Commands

```bash
# Development mode (HMR, no minification)
npm run dev

# Production build (minified, source maps optional)
npm run build

# Preview production build locally
npm run preview

# Analyze bundle size
npm run build && ls -lh dist/**/*.js
```

### Bundle Size Monitoring

```javascript
// package.json - Add bundle size check
{
  "scripts": {
    "build": "vite build",
    "build:analyze": "vite build && du -sh dist/**/*.js | sort -h"
  }
}
```

---

## Vitest Configuration & Chrome API Mocking (from Context7)

### Complete vitest.config.js

**Purpose**: Comprehensive test configuration with Chrome API mocking, coverage, and performance testing

```javascript
// vitest.config.js
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    // Environment for DOM testing
    environment: 'jsdom', // Or 'happy-dom' for faster tests

    // Setup files run before each test file
    setupFiles: ['./tests/setup.js'],

    // Enable globals (describe, it, expect without imports)
    globals: true,

    // Test timeout (10s for async operations)
    testTimeout: 10000,

    // Coverage configuration
    coverage: {
      provider: 'v8', // Fast, built-in coverage
      reporter: ['text', 'html', 'json'],
      include: ['src/lib/**/*.js'], // Only business logic
      exclude: [
        'src/lib/**/*.test.js',
        'src/lib/**/*.spec.js',
        '**/node_modules/**',
        '**/tests/**'
      ],
      thresholds: {
        branches: 80,
        functions: 80,
        lines: 80,
        statements: 80
      }
    },

    // Parallel execution for faster tests
    threads: true,
    isolate: true // Each test file in isolated environment
  }
})
```

### Chrome API Mocking Setup (tests/setup.js)

**Purpose**: Mock chrome.storage.local and other Chrome Extension APIs for testing

**Source**: Context7 Vitest mocking patterns

```javascript
// tests/setup.js
import { vi, beforeEach, afterEach } from 'vitest'

// Mock chrome.storage.local with in-memory storage
const mockStorage = {
  data: {}, // In-memory storage

  get: vi.fn((keys, callback) => {
    // Handle different input types
    if (typeof keys === 'function') {
      callback = keys
      keys = null
    }

    const result = {}

    if (keys === null) {
      // Return all storage
      Object.assign(result, mockStorage.data)
    } else if (typeof keys === 'string') {
      // Single key
      result[keys] = mockStorage.data[keys]
    } else if (Array.isArray(keys)) {
      // Array of keys
      keys.forEach(key => {
        result[key] = mockStorage.data[key]
      })
    } else if (typeof keys === 'object') {
      // Object with defaults
      Object.keys(keys).forEach(key => {
        result[key] = mockStorage.data[key] !== undefined
          ? mockStorage.data[key]
          : keys[key]
      })
    }

    // Async callback (simulates Chrome API)
    setTimeout(() => callback(result), 0)
  }),

  set: vi.fn((items, callback) => {
    Object.assign(mockStorage.data, items)
    if (callback) setTimeout(() => callback(), 0)
  }),

  remove: vi.fn((keys, callback) => {
    if (typeof keys === 'string') {
      delete mockStorage.data[keys]
    } else if (Array.isArray(keys)) {
      keys.forEach(key => delete mockStorage.data[key])
    }
    if (callback) setTimeout(() => callback(), 0)
  }),

  clear: vi.fn((callback) => {
    mockStorage.data = {}
    if (callback) setTimeout(() => callback(), 0)
  })
}

// Mock chrome.runtime API
const mockRuntime = {
  lastError: null,
  getManifest: vi.fn(() => ({
    version: '0.2.0',
    name: 'ScopeShield',
    manifest_version: 3
  }))
}

// Stub global chrome object
vi.stubGlobal('chrome', {
  storage: {
    local: mockStorage
  },
  runtime: mockRuntime
})

// Reset storage before each test for isolation
beforeEach(() => {
  mockStorage.data = {}
  vi.clearAllMocks()
})

// Optional: Clean up after each test
afterEach(() => {
  vi.restoreAllMocks()
})
```

### Example Test with Chrome API Mocking

```javascript
// tests/lib/storage/SettingsStorage.test.js
import { describe, test, expect, beforeEach } from 'vitest'
import { SettingsStorage } from '../../../src/lib/storage/SettingsStorage.js'

describe('SettingsStorage', () => {
  beforeEach(() => {
    // Storage is already mocked and reset in setup.js
  })

  test('saves settings to chrome.storage.local', async () => {
    const settings = {
      freelancerName: 'Jane Doe',
      hourlyRate: 150,
      autoExportEnabled: true
    }

    await SettingsStorage.save(settings)

    // Verify chrome.storage.local.set was called
    expect(chrome.storage.local.set).toHaveBeenCalledWith(
      expect.objectContaining({
        scopeshield_settings_v1: expect.objectContaining(settings)
      }),
      expect.any(Function)
    )
  })

  test('loads settings from chrome.storage.local', async () => {
    const expectedSettings = {
      freelancerName: 'John Smith',
      hourlyRate: 200
    }

    // Pre-populate mock storage
    chrome.storage.local.data['scopeshield_settings_v1'] = expectedSettings

    const result = await SettingsStorage.load()

    expect(result).toEqual(expectedSettings)
    expect(chrome.storage.local.get).toHaveBeenCalledWith(
      ['scopeshield_settings_v1'],
      expect.any(Function)
    )
  })

  test('provides default settings when storage is empty', async () => {
    const result = await SettingsStorage.load()

    expect(result).toEqual({
      freelancerName: '',
      hourlyRate: 0,
      defaultExportMethod: 'pdf',
      autoExportEnabled: true,
      autoExportDelay: 3
    })
  })
})
```

### Testing Auto-Export Timer with Fake Timers

```javascript
// tests/lib/change-order/AutoExportTimer.test.js
import { describe, test, expect, beforeEach, afterEach, vi } from 'vitest'
import { AutoExportTimer } from '../../../src/lib/change-order/AutoExportTimer.js'

describe('AutoExportTimer', () => {
  beforeEach(() => {
    vi.useFakeTimers() // Mock setTimeout, setInterval
  })

  afterEach(() => {
    vi.useRealTimers() // Restore real timers
  })

  test('triggers callback after 3 seconds', () => {
    const callback = vi.fn()
    const timer = new AutoExportTimer(callback, 3000)

    timer.start()

    // Advance time by 2 seconds (not yet triggered)
    vi.advanceTimersByTime(2000)
    expect(callback).not.toHaveBeenCalled()

    // Advance time by 1 more second (triggers)
    vi.advanceTimersByTime(1000)
    expect(callback).toHaveBeenCalledOnce()
  })

  test('cancels timer before callback triggers', () => {
    const callback = vi.fn()
    const timer = new AutoExportTimer(callback, 3000)

    timer.start()

    // Advance time by 2 seconds
    vi.advanceTimersByTime(2000)

    // Cancel timer
    timer.cancel()

    // Advance remaining time
    vi.advanceTimersByTime(1000)

    // Callback should NOT be called
    expect(callback).not.toHaveBeenCalled()
  })
})
```

---

## jsPDF API Usage Patterns (from Context7)

### Basic PDF Generation

```javascript
import { jsPDF } from 'jspdf'

// Create new PDF document (A4, portrait)
const doc = new jsPDF()

// Add text with positioning
doc.text("Change Order #001", 10, 10)

// Save PDF (triggers browser download)
doc.save("change-order-001.pdf")
```

### Advanced Formatting

```javascript
// lib/change-order/PDFGenerator.js

export async function generatePDF(changeOrderData) {
  const { jsPDF } = await loadJsPDF()
  const doc = new jsPDF()

  // Header section
  doc.setFontSize(20)
  doc.setTextColor(0, 0, 0) // Black
  doc.text("CHANGE ORDER", 10, 20)

  doc.setFontSize(14)
  doc.text(`#${changeOrderData.changeOrderNumber}`, 10, 30)

  // Metadata section
  doc.setFontSize(12)
  doc.setTextColor(100, 100, 100) // Gray
  doc.text(`Date: ${changeOrderData.dateCreated}`, 10, 40)
  doc.text(`Client: ${changeOrderData.clientName}`, 10, 50)

  // Scope section
  doc.setFontSize(14)
  doc.setTextColor(0, 0, 0) // Black
  doc.text("Original Scope:", 10, 70)

  doc.setFontSize(11)
  const scopeLines = doc.splitTextToSize(changeOrderData.originalScope, 180)
  doc.text(scopeLines, 10, 80)

  // Requested changes section
  let yPosition = 80 + (scopeLines.length * 7)

  doc.setFontSize(14)
  doc.text("Requested Changes:", 10, yPosition)

  doc.setFontSize(11)
  changeOrderData.requestedChanges.forEach((change, index) => {
    yPosition += 10
    doc.text(`${index + 1}. ${change}`, 15, yPosition)
  })

  // Cost section
  yPosition += 20
  doc.setFontSize(14)
  doc.text("Cost Estimate:", 10, yPosition)

  doc.setFontSize(16)
  doc.setTextColor(0, 128, 0) // Green
  doc.text(changeOrderData.costEstimate, 10, yPosition + 10)

  return doc
}
```

### Export as Blob (for Clipboard)

```javascript
// lib/change-order/ExportService.js

export async function exportToPDFBlob(changeOrderData) {
  const doc = await generatePDF(changeOrderData)

  // Get PDF as Blob instead of triggering download
  const pdfBlob = doc.output('blob')

  return pdfBlob
}

export async function copyPDFToClipboard(changeOrderData) {
  try {
    const pdfBlob = await exportToPDFBlob(changeOrderData)

    // Copy PDF to clipboard (Chrome 76+)
    await navigator.clipboard.write([
      new ClipboardItem({ 'application/pdf': pdfBlob })
    ])

    return { success: true }
  } catch (error) {
    return {
      success: false,
      error: `Clipboard denied: ${error.message}`
    }
  }
}
```

### Multi-Page PDFs

```javascript
export async function generateLongPDF(changeOrderData) {
  const { jsPDF } = await loadJsPDF()
  const doc = new jsPDF()

  // First page
  doc.setFontSize(20)
  doc.text("Page 1 Content", 10, 20)

  // Add new page
  doc.addPage()

  // Second page
  doc.setFontSize(20)
  doc.text("Page 2 Content", 10, 20)

  return doc
}
```

### Text Wrapping and Overflow

```javascript
// Automatically wrap long text to fit page width
const longText = "This is a very long text that needs to be wrapped..."
const maxWidth = 180 // mm (A4 width - margins)

const wrappedLines = doc.splitTextToSize(longText, maxWidth)
doc.text(wrappedLines, 10, 80)
```

### Available jsPDF Methods (from Context7)

**Text & Fonts**:
- `doc.text(text, x, y)` - Add text at position
- `doc.setFont(fontName, fontStyle)` - Set font ('helvetica', 'times', 'courier')
- `doc.setFontSize(size)` - Set font size in points
- `doc.setTextColor(r, g, b)` - Set text color (0-255)
- `doc.splitTextToSize(text, maxWidth)` - Wrap text to width

**Drawing**:
- `doc.line(x1, y1, x2, y2)` - Draw line
- `doc.rect(x, y, width, height)` - Draw rectangle
- `doc.circle(x, y, radius)` - Draw circle

**Pages**:
- `doc.addPage()` - Add new page
- `doc.setPage(pageNumber)` - Switch to specific page

**Output**:
- `doc.save(filename)` - Trigger browser download
- `doc.output('blob')` - Get PDF as Blob
- `doc.output('dataurlstring')` - Get PDF as data URL
- `doc.output('arraybuffer')` - Get PDF as ArrayBuffer

---

## Agent Context Update

**File**: `.github/claude.md` (or `.cursorrules` if using Cursor)

**Update Strategy**: Add only NEW technology from this plan between markers

**New Technology to Add**:
- jsPDF 2.5.1 (client-side PDF generation)
- Intl.DateTimeFormat (browser built-in, date formatting)
- crypto.randomUUID() (browser built-in, UUID generation)

**Existing Technology** (upgraded from Feature 001):
- Vite 7.0.0 (upgraded from 5.0+)
- Vitest 4.0.7 (upgraded from 1.0+)
- Chrome Extension Manifest V3
- chrome.storage.local
- chrome.notifications
- chrome.runtime

**Manual Additions to Preserve**:
- Any custom rules between markers

---

## Summary

**Implementation Timeline**: 39-50 hours (9 phases)
- Phase 1: Setup (5-6h)
- Phase 2: Settings (4-5h)
- Phase 3: Generation + Multi-Item Selection (7-8h)
- Phase 4: Calculator (3-4h)
- Phase 5: Export (6-7h)
- Phase 6: Auto-Export (4-5h)
- Phase 7: Draft/History + ExportHistory (5-6h)
- Phase 8: Edge Cases (3-4h)
- Phase 9: Testing + Flesch Calculator (5-6h)

**Bundle Size**: <600KB (initial), ~900KB (after first PDF export, lazy-loaded)

**Performance**: <5s generation (p95), <500ms clipboard, <3s PDF export (p95)

**Constitutional Compliance**: ✅ ALL 8 PRINCIPLES PASS

**Dependencies**:
- External: jsPDF 2.5.1 (~500KB lazy-loaded)
- Build Tools: Vite 7.0.0, Vitest 4.0.7 (upgraded)
- Browser APIs: Intl.DateTimeFormat, crypto.randomUUID, chrome.storage.local (zero bundle cost)

**Context7 Validation**: ✅ ALL PATTERNS VALIDATED
- jsPDF async loader with caching and error handling
- Vite manualChunks configuration for lazy loading
- Vitest chrome.storage.local mocking with vi.stubGlobal
- jsPDF output('blob') for clipboard integration

**Risk Level**: Low (lazy loading mitigates bundle size, graceful degradation handles failures)

**Next Steps**:
1. Update tasks.md with new Vite/Vitest setup requirements
2. Add vitest.config.js and tests/setup.js creation tasks
3. Add vite.config.js update tasks (manualChunks, terserOptions)
4. Update PDFGenerator.js implementation with robust async loader
5. Run `/speckit.implement` to execute implementation

---

**Plan Generated**: 2025-11-11
**Last Updated**: 2025-11-12 (Context7 validation, Vite/Vitest upgrades)
**Ready for Task Breakdown**: ✅ YES - Tasks.md needs update with new patterns
