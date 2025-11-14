# Popup Tests

## Test Structure

```
tests/popup/
├── components/          # Unit tests for individual components
│   ├── DetectionListRenderer.test.js
│   ├── DetectionEventHandlers.test.js
│   ├── BadgeManager.test.js
├── utils/              # Utility function tests
│   ├── FormatHelpers.test.js
│   ├── debounce.test.js
├── integration/        # Integration/workflow tests
│   └── PopupFlow.test.js
└── performance/        # Performance benchmarks (Constitution III)
    ├── DetectionListPerformance.test.js
    └── DetectionListStress.test.js
```

## Test Environment

**DOM Testing**: jsdom (configured in vitest.config.js)
- Simulates browser DOM APIs
- `document.createElement()`, `querySelector()`, etc. work as expected
- Chrome APIs mocked in `tests/setup.js`

**Performance Testing**: Uses `performance.now()` for accurate timing
- Constitution Principle III: <500ms render time
- Validates DocumentFragment optimization

## Running Tests

```bash
# All popup tests
npm test tests/popup

# By category
npm test tests/popup/components
npm test tests/popup/integration
npm test tests/popup/performance

# Single file
npm test tests/popup/components/DetectionListRenderer.test.js
```

## Coverage

Run `npm test tests/popup` for current test counts and `npm test -- --coverage` for detailed coverage metrics.

**Target**: 80%+ code coverage (vitest.config.js thresholds)
