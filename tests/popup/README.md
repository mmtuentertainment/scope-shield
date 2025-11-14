# Popup Tests

## Test Structure

```
tests/popup/
├── components/          # Unit tests for individual components
│   ├── DetectionListRenderer.test.js (29 tests)
│   ├── DetectionEventHandlers.test.js (25 tests)
│   ├── BadgeManager.test.js (6 tests)
├── utils/              # Utility function tests
│   ├── FormatHelpers.test.js (9 tests)
│   ├── debounce.test.js (4 tests)
├── integration/        # Integration/workflow tests
│   └── PopupFlow.test.js (5 tests)
└── performance/        # Performance benchmarks (Constitution III)
    └── DetectionListPerformance.test.js (6 tests)
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

**Current**: 65+ tests across 6 test files
- Unit tests: 56 tests
- Integration tests: 5 tests
- Performance tests: 6 tests

**Target**: 80%+ code coverage (vitest.config.js thresholds)
