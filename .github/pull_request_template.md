## Description
<!-- Provide a clear and concise description of the changes -->

## Type of Change
<!-- Check all that apply -->
- [ ] 🐛 Bug fix (non-breaking change fixing an issue)
- [ ] ✨ New feature (non-breaking change adding functionality)
- [ ] 💥 Breaking change (fix or feature causing existing functionality to break)
- [ ] 📝 Documentation update
- [ ] 🎨 Style/UI change
- [ ] ⚡ Performance improvement
- [ ] 🧪 Test addition/update
- [ ] 🔧 Configuration change

## Constitutional Compliance
<!-- Validate against the 8 core principles in memory/constitution.md -->

- [ ] **Privacy-First**: No data transmitted outside browser, chrome.storage.local only
- [ ] **Simplicity-First**: Vanilla JS, no unnecessary dependencies
- [ ] **Real-Time Performance**: Detection <500ms, highlighting <100ms
- [ ] **Zero Infrastructure**: No servers, APIs, or cloud dependencies
- [ ] **User Value**: Solves real freelancer problem
- [ ] **Chrome Web Store Compliance**: Manifest V3, proper permissions
- [ ] **Measurable Success**: Maintains/improves accuracy metrics
- [ ] **Graceful Degradation**: Fallback selectors for Gmail changes

## Spec-Kit Artifacts
<!-- If this is a new feature, link to spec artifacts -->

- [ ] Specification: `specs/XXX-feature-name/spec.md`
- [ ] Implementation Plan: `specs/XXX-feature-name/plan.md`
- [ ] Task Breakdown: `specs/XXX-feature-name/tasks.md`
- [ ] N/A - Not a new feature

## Testing
<!-- Describe the tests you've added/updated -->

### Test Coverage
- [ ] Unit tests added/updated
- [ ] Integration tests added/updated
- [ ] Accuracy validation tests added/updated
- [ ] Performance benchmarks added/updated

### Test Results
```
# Paste test output here
npm test
```

### Accuracy Metrics
<!-- Only for detector changes -->
- Detection Rate: __%  (target: ≥75%)
- False Positive Rate: __%  (target: <25%)
- Overall Accuracy: __%  (target: ≥75%)

### Performance Metrics
<!-- Only for performance-sensitive changes -->
- Detection Latency (P95): __ms  (target: <500ms)
- Highlighting Time (P95): __ms  (target: <100ms)
- Bundle Size Impact: __KB  (target: keep total <500KB)

## Gmail Compatibility
<!-- If this touches Gmail integration -->

- [ ] Tested in Gmail classic view
- [ ] Tested in Gmail new view
- [ ] Tested with multiple message types
- [ ] Fallback selectors implemented
- [ ] Handles SPA navigation
- [ ] N/A - Doesn't touch Gmail integration

## Security Checklist
<!-- For any code that handles user data or permissions -->

- [ ] No XSS vulnerabilities (no unsafe innerHTML)
- [ ] Input validation implemented
- [ ] No eval() or Function() constructor usage
- [ ] No new permissions added to manifest.json
- [ ] Data sanitization implemented
- [ ] N/A - No security-sensitive changes

## Breaking Changes
<!-- List any breaking changes and migration steps -->

None / Describe here:

## Screenshots/Videos
<!-- If UI changes, include before/after screenshots or demo video -->

## Checklist
<!-- General quality checks -->

- [ ] Code follows project style guidelines
- [ ] Self-review completed
- [ ] Comments added for complex logic
- [ ] JSDoc added for new public functions
- [ ] Documentation updated (if needed)
- [ ] No console.log (except [ScopeShield] prefixed logging)
- [ ] Error handling with try/catch
- [ ] Build succeeds (`npm run build`)
- [ ] All tests pass (`npm test`)

## Additional Context
<!-- Add any other context about the PR here -->

## Related Issues
<!-- Link to related issues -->
Fixes #
Closes #
Related to #

---

## For Reviewers

### Review Focus Areas
<!-- Help reviewers know what to focus on -->

- [ ] Constitutional compliance
- [ ] Security/privacy
- [ ] Performance
- [ ] Gmail integration stability
- [ ] Detection accuracy
- [ ] Code quality
- [ ] Testing coverage

### Questions for Reviewers
<!-- Any specific questions or concerns -->

1.
2.

---

**Note**: This PR will be automatically reviewed by Claude Code Review bot against our constitutional principles and project standards.