# ScopeShield Architecture Overview (Phase 9)

**Purpose**: System design documentation for developers and contributors

**Last Updated**: 2025-11-20 (Phase 9 Complete)

---

## System Overview

**Architecture Pattern**: Chrome Extension (Manifest V3) with Content Scripts + Background Worker

**Core Principles** (from [memory/constitution.md](memory/constitution.md)):
1. Privacy-First (local storage only)
2. Simplicity-First (heuristics, no AI/ML)
3. Real-Time Performance (<500ms detection)
4. Zero Infrastructure (no backend)

---

## Component Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Gmail (mail.google.com)                  │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ CONTENT SCRIPT (content.js)                             │ │
│  │ - Monitors DOM with MutationObserver                    │ │
│  │ - Scans messages for trigger words                      │ │
│  │ - Highlights detected text (yellow/orange)              │ │
│  │ - Sends detection events to background worker           │ │
│  └────────────────────────────────────────────────────────┘ │
│                           ↓                                   │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ HIGHLIGHTER (highlighter.js)                            │ │
│  │ - Finds text nodes in DOM                               │ │
│  │ - Wraps matches in <span> with CSS                      │ │
│  │ - Color-codes by confidence (high/medium/low)           │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│        BACKGROUND SERVICE WORKER (service-worker.js)         │
├─────────────────────────────────────────────────────────────┤
│  - Receives detection events                                 │
│  - Sends browser notifications                               │
│  - Updates extension badge count                             │
│  - Manages chrome.storage.local persistence                  │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                 CHROME.STORAGE.LOCAL (5MB)                   │
├─────────────────────────────────────────────────────────────┤
│  - detectionEvents[] - Scope creep instances                 │
│  - freelancerSettings - User preferences                     │
│  - changeOrderDraft - Active draft                           │
│  - exportHistory[] - Export events                           │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│              EXTENSION POPUP (popup.html)                    │
├─────────────────────────────────────────────────────────────┤
│  ┌──────────────────────────────────────────────────────┐  │
│  │ DETECTION LIST (DetectionListRenderer)                │  │
│  │ - Displays all detected scope creep                   │  │
│  │ - Checkboxes for multi-item selection                 │  │
│  │ - "Generate Change Order" button                      │  │
│  └──────────────────────────────────────────────────────┘  │
│                         ↓                                    │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ CHANGE ORDER MODAL (ChangeOrderModal)                 │  │
│  │ - Displays generated document (HTML template)         │  │
│  │ - Inline field editing (Phase 9)                      │  │
│  │ - Pricing calculator widget                           │  │
│  │ - Export controls (PDF, Clipboard, Text)              │  │
│  │ - Auto-export timer (countdown)                       │  │
│  └──────────────────────────────────────────────────────┘  │
│                         ↓                                    │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ CHANGE ORDER BUILDER (ChangeOrderBuilder)             │  │
│  │ - Loads detections + settings                         │  │
│  │ - Estimates hours (2h per detection)                  │  │
│  │ - Calculates costs (hourly rate × hours)              │  │
│  │ - Renders template with TemplateEngine                │  │
│  └──────────────────────────────────────────────────────┘  │
│                         ↓                                    │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ EXPORT SERVICE (PDFGenerator, ClipboardExport, etc.)  │  │
│  │ - PDF: jsPDF library (lazy-loaded)                    │  │
│  │ - Clipboard: navigator.clipboard API                  │  │
│  │ - Text: File download with FilenameUtils              │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

---

## Data Flow

### Detection Flow
```
1. User opens Gmail
2. content.js: MutationObserver detects new messages
3. content.js: extractMessageText() gets email body
4. detector.js: detectScopeCreep() matches trigger patterns
5. highlighter.js: Highlights matched text in DOM
6. content.js → service-worker.js: Send 'SCOPE_CREEP_DETECTED' message
7. service-worker.js: Show notification + update badge
8. service-worker.js → chrome.storage.local: Save DetectionEvent
```

### Change Order Generation Flow
```
1. User clicks extension icon
2. popup.js: Load detectionEvents from chrome.storage.local
3. User selects detections, clicks "Generate Change Order"
4. ChangeOrderBuilder.build(detections, settings):
   - Estimate hours (2h per detection)
   - Calculate cost (hourlyRate × totalHours)
   - Render HTML template with data
5. ChangeOrderModal displays document
6. InlineFieldEditor enables editing (Phase 9)
7. User exports via PDF/Clipboard/Text
8. ExportHistoryStorage saves export event
```

---

## Key Components

### Detection Engine (Spec 001)

**Files**:
- `src/content/content.js` (484 lines) - Main content script
- `src/utils/detector.js` (300 lines) - Trigger word matching
- `src/utils/trigger-words.js` (225 lines) - Pattern library
- `src/content/highlighter.js` (222 lines) - DOM highlighting
- `src/content/gmail-dom.js` (215 lines) - Gmail selectors

**Trigger Word Patterns**: 18 patterns in 3 confidence tiers
- High (8-10): "also" + action verb
- Medium (5-7): "while you're at it"
- Low (3-4): "also" weak (requires context)

**Performance Budget**:
- Detection: <300ms p95 (target), <500ms p99 (max)
- Highlighting: <50ms p95, <100ms p99

### Change Order Generator (Spec 002)

**Files**:
- `src/lib/change-order/ChangeOrderBuilder.js` (232 lines) - Document generation
- `src/lib/change-order/TemplateEngine.js` (77 lines) - Template rendering
- `src/popup/components/ChangeOrderModal.js` (446 lines) - Modal UI
- `src/popup/components/PricingCalculatorWidget.js` (292 lines) - Calculator
- `src/popup/components/ExportControls.js` (443 lines) - Export buttons

**Template System**:
- Variables: `{{variableName}}`
- Loops: `{{@each items}}...{{/@each}}`
- Conditionals: `{{@if condition}}...{{/@if}}`
- HTML output with data-field attributes (Phase 9)

**Performance Budget**:
- Generation: <3s p95 (target), <5s p99 (max)
- PDF Export: <3s p95
- Clipboard: <500ms p95

---

## Storage Schema

### DetectionEvent
```json
{
  "id": "uuid-v4",
  "timestamp": "2025-11-20T10:30:00.000Z",
  "emailSubject": "Re: Website Project",
  "sender": "client@example.com",
  "senderName": "John Client",
  "detectedText": "Also, can you add authentication?",
  "triggerWord": "also",
  "triggerWeight": 9,
  "emailUrl": "https://mail.google.com/mail/u/0/#inbox/thread-id",
  "threadId": "thread-id",
  "messageId": "message-id",
  "acknowledged": false
}
```

### FreelancerSettings
```json
{
  "freelancerName": "Your Name",
  "hourlyRate": 150,
  "defaultExportMethod": "clipboard",
  "autoExportEnabled": false,
  "autoExportDelay": 5
}
```

### ExportHistory
```json
{
  "id": "uuid-v4",
  "exportedAt": "2025-11-20T11:00:00.000Z",
  "exportFormat": "pdf",
  "clientName": "Client Name",
  "fileName": "ChangeOrder_Client_2025-11-20.pdf"
}
```

---

## Security Model

### XSS Prevention
- ✅ NO `innerHTML` with unsanitized user content
- ✅ `innerHTML` used ONLY with TemplateEngine output (pre-sanitized data in controlled structure)
- ✅ `textContent` for direct user-provided data
- ✅ Input sanitization via `Sanitizer.sanitizeText()`
- ✅ CSP-compliant (no inline scripts)

### Privacy Guarantees
- ✅ NO network requests (all local processing)
- ✅ NO analytics or tracking
- ✅ NO data transmission to servers
- ✅ chrome.storage.local only (5MB quota)

### Permissions (Minimal)
- `activeTab` - Access current Gmail tab
- `storage` - Save detections and settings
- `notifications` - Browser notifications

**NO**: webRequest, <all_urls>, cookies, history, tabs

---

## Performance Optimizations

### Detection Performance
1. **Debouncing** - 300ms delay for rapid mutations
2. **Lazy evaluation** - Stop on first pattern match
3. **Viewport filtering** - Only scan visible messages
4. **Memoization** - Cache compiled regex patterns

### Storage Performance
1. **Quota management** - FIFO rotation at 80% (delete oldest 200)
2. **Batch writes** - Combine multiple storage operations
3. **Atomic reads** - Single chrome.storage.local.get() call

### Bundle Optimization
1. **Lazy loading** - jsPDF loaded on-demand
2. **Tree shaking** - Vite removes unused code
3. **No frameworks** - Vanilla JS (target: <600KB uncompressed, ~210KB gzipped)

---

## Testing Strategy

### Unit Tests (Vitest)
- **Coverage**: 80%+ for business logic (`src/lib/**`)
- **Files**: detector.test.js, ChangeOrderBuilder.test.js, etc.
- **Current**: 686 tests, 100% passing

### Manual Testing
- **Checklist**: [MANUAL-TESTING.md](MANUAL-TESTING.md)
- **Frequency**: Before each release
- **Duration**: ~30 minutes (15 test scenarios)

### E2E Testing (Future - Spec 005)
- **Trigger**: 100+ users OR manual testing >1 hour
- **Tool**: Puppeteer with Chrome extension loading
- **Coverage**: Critical paths (Gmail→Detection→Export)

---

## Build & Deployment

### Development Build
```bash
npm run dev
```
- Hot reload enabled
- Source maps included
- No minification

### Production Build
```bash
npm run build
```
- Output: `dist/` directory
- Minified (terser)
- Tree-shaken
- Ready for Chrome Web Store

### Extension Loading (Development)
1. `chrome://extensions/`
2. Enable "Developer mode"
3. "Load unpacked" → Select `dist/`
4. Reload extension after code changes

---

## Scaling Considerations

### Current Capacity (MVP)
- **Users**: 100-1,000 (no backend limits)
- **Detections**: 1,000 per user (~500KB storage)
- **Gmail threads**: 2-100 messages per thread
- **Performance**: <500ms for 10 visible emails

### Future Scaling (Post-MVP)
- **Remote config** (Spec 003): Gmail selector updates without Chrome Web Store review
- **Slack integration** (Spec 004): Workspace bot for team communication
- **AI enhancement** (Post-100 users): Optional GPT-4o via BYOK
- **Cross-platform dashboard** (Spec 006+): Unified view across Gmail + Slack + Upwork

---

## Dependencies

### Runtime Dependencies
- `jspdf@3.0.3` - Client-side PDF generation (~500KB)

### Development Dependencies
- `vite@7.0.0` - Build tool
- `vitest@4.0.7` - Test runner
- `@samrum/vite-plugin-web-extension@5.0.0` - Extension bundling
- `eslint@8.57.0` - Code quality

### External APIs
- **NONE** (constitutional requirement - no backend)

---

## Error Handling Strategy

### Graceful Degradation (Constitution Principle VIII)

| Failure Mode | Detection | Fallback |
|--------------|-----------|----------|
| Gmail DOM breaks | Selector mismatch | Show manual detection button |
| Storage quota exceeded | 80% capacity check | FIFO rotation (delete oldest 200) |
| PDF generation fails | jsPDF error | Offer "Export as Text" |
| Clipboard denied | Permission error | Show "Select All" button |
| Auto-export fails | Export error | Display manual export buttons |

### Error Logging
- Console: `[ScopeShield]` prefix for all logs
- Levels: logInfo(), logWarning(), logError()
- User notifications: showNotification() for actionable errors

---

## Configuration

### Manifest V3 (manifest.json)
```json
{
  "manifest_version": 3,
  "name": "ScopeShield",
  "version": "1.0.0",
  "permissions": ["storage", "notifications"],
  "host_permissions": ["*://mail.google.com/*"],
  "content_scripts": [{
    "matches": ["*://mail.google.com/*"],
    "js": ["content.js"],
    "css": ["content-styles.css"]
  }],
  "background": {
    "service_worker": "service-worker.js"
  },
  "action": {
    "default_popup": "popup.html"
  }
}
```

### Vite Configuration
- Base path: `''` (relative paths for extension)
- Tree shaking: Disabled (preserves DOMContentLoaded init)
- Plugin: `@samrum/vite-plugin-web-extension`

---

## Development Patterns

### Code Organization
- **Feature-based**: Each feature in `src/features/` (future)
- **Utility-based**: Current MVP uses `src/utils/` (simpler for single feature)
- **Test co-location**: Tests mirror `src/` structure in `tests/`

### File Size Limits (from .claude/code-standards.md)
- Production: <500 lines (target), <800 lines (hard limit)
- Functions: <50 lines (target), <75 lines (max)
- Complexity: <10 (target), <15 (max)

### Extraction Patterns (when exceeding limits)
- Templates: Extract HTML/JSX generation
- Handlers: Extract event handlers
- Formatters: Extract data transformation

---

## Future Architecture (Post-MVP)

### Phase 2 (After 100 Users)
- Slack Workspace Bot (OAuth app, separate from Chrome extension)
- Optional AI enhancement (user-provided OpenAI API key)
- Enhanced pattern library (50+ triggers)

### Phase 3 (After 500 Users)
- Upwork integration (job alerts, not messaging)
- Cross-platform detection dashboard
- Team features (shared patterns, analytics)

### Phase 4 (After 1,000 Users)
- Advanced analytics
- Revenue tracking dashboard
- Client risk scores

---

## Key Design Decisions

### Decision 1: Why Vanilla JS (No React)?
- **Bundle size**: React adds ~120KB (violates <500KB budget)
- **Complexity**: No build-time JSX compilation needed
- **Performance**: Direct DOM manipulation faster for small UI
- **Constitutional**: Simplicity-First principle

### Decision 2: Why Keyword Matching (No AI)?
- **Constitutional**: Simplicity-First (no ML until 100 users)
- **Accuracy**: 75% achievable with heuristics (validated)
- **Bundle**: AI models add 100MB+ (violates bundle budget)
- **Privacy**: Local keywords vs API calls (Privacy-First)

### Decision 3: Why Gmail-Only (Not Slack)?
- **Fastest ship**: Chrome extension simpler than OAuth bot
- **Niche validation**: 50M email-first freelancers (consultants, writers)
- **Technical fit**: Slack requires workspace bot (different architecture)
- **Iterative**: Add Slack in Phase 2 if demand validated

### Decision 4: Why HTML Template Refactor (Phase 9)?
- **Inline editing**: Required data-field attributes (not possible with plain text)
- **Professional formatting**: HTML allows better typography
- **Expandable details**: Buttons require HTML structure
- **Future flexibility**: Easier to add formatting options

---

## Performance Monitoring

### Key Metrics
- Detection latency: `performance.now()` in content script
- Generation time: `performance.now()` in ChangeOrderBuilder
- Export times: Measured in ExportControls
- Bundle size: Vite build output

### Benchmarking
```bash
node scripts/benchmark.js
```

Measures:
- Generation: 1, 5, 10, 25, 50 detections (10 iterations each, calculate p95)
- Bundle: `npm run build && du -sh dist/`

---

## Constitutional Compliance

Every feature MUST pass Constitution Check (8 principles):
1. ✅ Privacy-First (local storage only)
2. ✅ Simplicity-First (heuristics for MVP)
3. ✅ Real-Time Performance (<500ms detection)
4. ✅ Zero Infrastructure (no backend)
5. ✅ User Value First (revenue protection)
6. ✅ Chrome Web Store (Manifest V3, minimal permissions)
7. ✅ Measurable Success (≥3 metrics per feature)
8. ✅ Graceful Degradation (fallbacks for failures)

See [memory/constitution.md](memory/constitution.md) for complete details.

---

## References

- **Constitution**: [memory/constitution.md](memory/constitution.md)
- **Spec 001**: [specs/001-detection-engine/](specs/001-detection-engine/)
- **Spec 002**: [specs/002-change-order-generator/](specs/002-change-order-generator/)
- **Code Standards**: [.claude/code-standards.md](../.claude/code-standards.md)
- **Development Guide**: [CLAUDE.md](CLAUDE.md)

---

**Version**: 1.0.0 (MVP Architecture)
**Status**: Current as of Phase 9 completion
**Next**: Platform expansion architecture (Spec 003+)
