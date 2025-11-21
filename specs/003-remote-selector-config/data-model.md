# Data Model: Remote Selector Configuration

**Feature**: 003-remote-selector-config
**Model Version**: 1.0.0
**Last Updated**: 2025-11-20

---

## Entities

### SelectorConfig

**Purpose**: Remote configuration defining CSS selectors for Gmail DOM elements

**Attributes**:
- `version` (string, semver format, required): Config version (e.g., "1.2.3")
  - **Validation**: Must match semver regex `/^\d+\.\d+\.\d+$/`
  - **Example**: "1.2.3", "2.0.0", "1.0.0-beta" (NOT allowed - must be stable semver)
- `lastUpdated` (string, ISO 8601, required): When config was published by developer
  - **Validation**: Valid ISO 8601 timestamp in UTC
  - **Example**: "2025-11-20T10:30:00Z"
- `selectors` (object, required): CSS selector mappings for Gmail elements
  - `composeButton` (string, required): Selector for Gmail compose button
  - `messageBody` (string, required): Selector for email message body
  - `senderName` (string, required): Selector for sender name
  - `subjectLine` (string, required): Selector for email subject
  - `timestamp` (string, required): Selector for message timestamp
  - **Validation**: Each selector must be valid CSS selector syntax (tested with `document.querySelector()`)
- `fallbacks` (object, required): Fallback selector chains per element (handles Gmail A/B tests)
  - `composeButton` (string[], required): Ordered fallback selectors (try in sequence)
  - `messageBody` (string[], required): Ordered fallback selectors
  - `senderName` (string[], required): Ordered fallback selectors
  - `subjectLine` (string[], required): Ordered fallback selectors
  - `timestamp` (string[], required): Ordered fallback selectors
  - **Validation**: Each array must have ≥1 element, all strings must be valid CSS selectors
  - **Usage**: Try fallbacks in order: `fallbacks.messageBody.some(sel => document.querySelector(sel))`
- `metadata` (object, optional): Additional config information (not used by extension, for developer reference)
  - `description` (string, optional): Human-readable change notes
  - `gmailVersion` (string, optional): Gmail UI version this config targets

**Relationships**: None (standalone config)

**Validation Rules**:
- `version`: Must be semver format (MAJOR.MINOR.PATCH)
- `lastUpdated`: Must be valid ISO 8601 UTC timestamp
- `selectors`: All required keys must be present (5 total)
- `fallbacks`: All required keys must be present, each array has ≥1 element
- **Cross-field validation**: At least ONE selector from each `fallbacks` array must exist in current DOM (validated before applying config)

**State Transitions**: N/A (immutable once published to GitHub Gist)

**Example**:
```json
{
  "version": "1.2.3",
  "lastUpdated": "2025-11-20T10:30:00Z",
  "selectors": {
    "composeButton": ".T-I.T-I-KE",
    "messageBody": ".a3s.aiL",
    "senderName": ".gD",
    "subjectLine": ".hP",
    "timestamp": ".g3"
  },
  "fallbacks": {
    "composeButton": [".T-I-KE", "[role='button'][aria-label*='Compose']"],
    "messageBody": [".a3s.aiL", "[data-message-body]", ".message-content"],
    "senderName": [".gD", "[data-sender]", ".sender-name"],
    "subjectLine": [".hP", "[data-subject]", "h2.subject"],
    "timestamp": [".g3", "[data-time]", ".timestamp"]
  },
  "metadata": {
    "description": "Gmail selectors for new UI (Nov 2025)",
    "gmailVersion": "2025.11.01"
  }
}
```

---

### ConfigCache

**Purpose**: Cached config metadata stored in chrome.storage.local

**Attributes**:
- `config` (SelectorConfig, required): Full config object (nested structure from remote fetch)
- `source` (string enum, required): Where config came from
  - **Values**: "remote" (fetched from GitHub), "cached" (from chrome.storage.local), "bundled" (shipped with extension)
  - **Validation**: Must be one of three exact values
- `cachedAt` (string, ISO 8601, required): When config was cached locally
  - **Validation**: Valid ISO 8601 timestamp in UTC
  - **Example**: "2025-11-20T14:45:00Z"
- `fetchedFrom` (string, URL, required): GitHub Gist/Pages URL where config was fetched
  - **Validation**: Must be valid HTTPS URL
  - **Example**: "https://gist.githubusercontent.com/user/abc123/raw/selectors.json"
- `previousVersion` (string, semver, optional): Previous config version (for rollback capability)
  - **Validation**: Must be semver format or null
  - **Usage**: If current config invalid, rollback to `previousVersion`
  - **Example**: "1.2.2" (previous version before upgrading to 1.2.3)
- `lastCheckTimestamp` (number, Unix ms, required): When last update check occurred
  - **Validation**: Must be positive integer (Unix timestamp in milliseconds)
  - **Usage**: Determine if 24 hours elapsed since last check
  - **Example**: 1700489400000 (Nov 20, 2025 14:30:00 UTC)

**Relationships**: Contains one `SelectorConfig` (composition)

**Validation Rules**:
- `config`: Must be valid SelectorConfig (nested validation)
- `source`: Must be "remote", "cached", or "bundled"
- `cachedAt`: Must be ISO 8601 UTC timestamp
- `fetchedFrom`: Must be valid HTTPS URL starting with `https://`
- `previousVersion`: If present, must be semver format
- `lastCheckTimestamp`: Must be ≤ current time (can't be in future)

**State Transitions**:
1. **Fresh install** → source: "bundled", config: from bundled fallback file
2. **First fetch** → source: "remote", config: from GitHub, previousVersion: null
3. **Update fetch** → source: "remote", previousVersion: previous config.version
4. **Offline use** → source: "cached", config: from chrome.storage.local

**Storage Schema** (chrome.storage.local):
```json
{
  "selectorConfig": {
    "config": {
      "version": "1.2.3",
      "lastUpdated": "2025-11-20T10:30:00Z",
      "selectors": { ... },
      "fallbacks": { ... },
      "metadata": { ... }
    },
    "source": "remote",
    "cachedAt": "2025-11-20T14:45:00Z",
    "fetchedFrom": "https://gist.githubusercontent.com/user/abc123/raw/selectors.json",
    "previousVersion": "1.2.2",
    "lastCheckTimestamp": 1700489400000
  }
}
```

**Storage Key**: `"selectorConfig"` (single cache entry in chrome.storage.local)

**Storage Size**: ~2KB per config (well within 5MB chrome.storage.local quota)

---

### ConfigFetchResult

**Purpose**: Result of remote fetch attempt (transient, not persisted)

**Attributes**:
- `success` (boolean, required): Whether fetch succeeded
- `config` (SelectorConfig | null, required): Fetched config if successful, null if failed
- `error` (string | null, required): Error message if failed, null if successful
  - **Example Errors**:
    - "Fetch timeout (>500ms)"
    - "Network error: ERR_CONNECTION_REFUSED"
    - "Rate limited (429)"
    - "Invalid JSON: Unexpected token"
    - "Validation failed: selector '.nonexistent' not found"
- `statusCode` (number, required): HTTP status code from fetch
  - **Values**: 200 (success), 404 (not found), 429 (rate limited), 0 (network error/timeout)
- `latency` (number, ms, required): Fetch duration in milliseconds
  - **Validation**: Must be ≥0
  - **Example**: 287 (287ms fetch time)
- `source` (string enum, required): Which fallback tier was used after fetch attempt
  - **Values**: "remote" (fetch succeeded), "cached" (fetch failed, used cache), "bundled" (fetch + cache failed, used bundled)
  - **Validation**: Must be one of three exact values

**Relationships**: Contains zero or one `SelectorConfig` (optional composition)

**Validation Rules**:
- `success`: If true, `config` must be non-null and `error` must be null
- `success`: If false, `config` must be null and `error` must be non-null string
- `statusCode`: Must be valid HTTP status code (0-599)
- `latency`: Must be ≥0 (non-negative)
- `source`: Must be "remote", "cached", or "bundled"

**Lifecycle**: Created during fetch attempt, used to update ConfigCache, then discarded (not persisted)

**Example (Success)**:
```json
{
  "success": true,
  "config": { /* SelectorConfig object */ },
  "error": null,
  "statusCode": 200,
  "latency": 287,
  "source": "remote"
}
```

**Example (Failure - Timeout)**:
```json
{
  "success": false,
  "config": null,
  "error": "Fetch timeout (>500ms)",
  "statusCode": 0,
  "latency": 500,
  "source": "cached"
}
```

**Example (Failure - Rate Limit)**:
```json
{
  "success": false,
  "config": null,
  "error": "Rate limited (429)",
  "statusCode": 429,
  "latency": 123,
  "source": "cached"
}
```

---

## Entity Relationships

```
┌─────────────────┐
│ ConfigFetchResult│
│ (Transient)     │
└────────┬────────┘
         │ contains 0-1
         ▼
┌─────────────────┐       ┌──────────────┐
│  ConfigCache    │───────┤SelectorConfig│
│ (Persistent)    │contains│ (Immutable)  │
└─────────────────┘   1   └──────────────┘
```

**Persistence**:
- **SelectorConfig**: Immutable (fetched from GitHub Gist, never modified by extension)
- **ConfigCache**: Persistent (chrome.storage.local, survives extension restarts)
- **ConfigFetchResult**: Transient (in-memory during fetch, discarded after caching)

---

## Storage Schema (Complete)

**chrome.storage.local structure**:
```json
{
  "selectorConfig": {
    "config": {
      "version": "1.2.3",
      "lastUpdated": "2025-11-20T10:30:00Z",
      "selectors": {
        "composeButton": ".T-I.T-I-KE",
        "messageBody": ".a3s.aiL",
        "senderName": ".gD",
        "subjectLine": ".hP",
        "timestamp": ".g3"
      },
      "fallbacks": {
        "composeButton": [".T-I-KE", "[role='button'][aria-label*='Compose']"],
        "messageBody": [".a3s.aiL", "[data-message-body]", ".message-content"],
        "senderName": [".gD", "[data-sender]", ".sender-name"],
        "subjectLine": [".hP", "[data-subject]", "h2.subject"],
        "timestamp": [".g3", "[data-time]", ".timestamp"]
      },
      "metadata": {
        "description": "Gmail selectors for new UI (Nov 2025)",
        "gmailVersion": "2025.11.01"
      }
    },
    "source": "remote",
    "cachedAt": "2025-11-20T14:45:00Z",
    "fetchedFrom": "https://gist.githubusercontent.com/user/abc123/raw/selectors.json",
    "previousVersion": "1.2.2",
    "lastCheckTimestamp": 1700489400000
  }
}
```

**Storage Quota Usage**:
- Config JSON: ~1.5KB (5 selectors × 2 fallbacks × ~100 bytes average)
- Metadata: ~0.3KB
- Cache metadata: ~0.2KB
- **Total**: ~2KB per config (0.04% of 5MB quota)

---

## Validation Flow

### Config Fetch & Validation

```
1. Fetch from GitHub Gist
   ↓
2. Parse JSON (validate structure)
   ↓
3. Validate SelectorConfig schema (all required fields present)
   ↓
4. Validate fallback chains (at least ONE selector per chain exists in DOM)
   ↓ (all validations pass)
5. Cache in chrome.storage.local as ConfigCache
   ↓
6. Apply to content script (update selectors)
```

### Fallback Chain Validation

```javascript
// For each element in config.fallbacks
for (const key in config.fallbacks) {
  const chain = config.fallbacks[key];

  // At least ONE selector must exist
  const anyExist = chain.some(selector => {
    try {
      return document.querySelector(selector) !== null;
    } catch (e) {
      // Invalid selector syntax → treat as non-existent
      return false;
    }
  });

  if (!anyExist) {
    // FAIL - No working selector for this element
    return false;
  }
}

// PASS - All elements have ≥1 working selector
return true;
```

---

## Version Evolution

### Config Version Lifecycle

**v1.0.0** (Initial bundled):
- Shipped with extension
- Selectors for current Gmail UI (Nov 2025)
- No fallback chains (single selector per element)

**v1.1.0** (First remote update):
- Add fallback chains for each selector
- Prepare for Gmail A/B testing

**v1.2.0** (Gmail UI change):
- Update primary selectors to new Gmail UI
- Keep old selectors as fallbacks
- 80% of users on new UI, 20% on old UI

**v1.3.0** (Bad config - rolled back):
- Developer mistakenly uses invalid selectors
- Validation rejects config
- Users keep using v1.2.0 (cached)

**v1.3.1** (Rollback):
- Developer reverts to v1.2.0 selectors
- Version bumped to indicate rollback
- Metadata: "Rollback to v1.2.0 selectors"

---

## References

- **JSON Schema**: See [contracts/selector-config.schema.json](contracts/selector-config.schema.json)
- **Validation Logic**: See config-validator.js (implementation)
- **Chrome Storage Docs**: [chrome.storage.local API](https://developer.chrome.com/docs/extensions/reference/api/storage#property-local)
- **Semantic Versioning**: [semver.org](https://semver.org/)
