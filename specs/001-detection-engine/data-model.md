# Data Model: Gmail Scope Creep Detection Engine

**Feature**: 001-detection-engine
**Created**: 2025-11-06

This document defines all entities, their attributes, relationships, validation rules, and storage schemas for the detection engine feature.

---

## Entities

### DetectionEvent

**Purpose**: Represents a single instance of detected scope creep in a Gmail thread.

**Lifecycle**:
```
Created → Stored → Displayed in popup → Acknowledged by user → Archived/Deleted at 80% quota
```

**Attributes**:

| Attribute | Type | Required | Description | Constraints |
|-----------|------|----------|-------------|-------------|
| `id` | string (UUID v4) | ✅ Yes | Unique identifier | Format: `xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx` |
| `timestamp` | string (ISO 8601) | ✅ Yes | When detected | Format: `2025-11-06T10:30:00.000Z` (UTC) |
| `emailSubject` | string | ✅ Yes | Subject line of email | Max 200 chars, truncate with "..." if longer |
| `sender` | string (email) | ✅ Yes | Who sent the email | Valid email format: `name@domain.com` |
| `senderName` | string | ❌ No | Sender display name | Max 100 chars, optional (extract from Gmail DOM if available) |
| `detectedText` | string | ✅ Yes | The trigger phrase found | Max 100 chars, preserve context (10 words before + after) |
| `triggerWord` | string | ✅ Yes | Which keyword triggered detection | Lowercase, one of: "also", "additionally", "one more thing", etc. |
| `triggerWeight` | number (1-10) | ✅ Yes | Confidence score | Higher = more likely scope creep |
| `emailUrl` | string (URL) | ✅ Yes | Gmail URL to email | Format: `https://mail.google.com/mail/u/0/#inbox/thread-id` |
| `threadId` | string | ✅ Yes | Gmail thread ID | Extract from URL or `[data-thread-id]` attribute |
| `messageId` | string | ✅ Yes | Gmail message ID | Extract from `[data-message-id]` attribute |
| `acknowledged` | boolean | ✅ Yes | User has seen/dismissed | Default: `false`, set to `true` in popup |

**Relationships**:
- None (DetectionEvent is a flat entity, no foreign keys)
- Grouped by `threadId` for display purposes (thread view in popup)

**Validation Rules**:

```javascript
// src/utils/validation.js
function validateDetectionEvent(event) {
  const errors = [];

  // Required fields
  if (!event.id || !event.id.match(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i)) {
    errors.push('Invalid or missing id (must be UUID v4)');
  }

  if (!event.timestamp || isNaN(Date.parse(event.timestamp))) {
    errors.push('Invalid or missing timestamp (must be ISO 8601)');
  }

  if (!event.emailSubject || event.emailSubject.length > 200) {
    errors.push('Invalid emailSubject (max 200 chars)');
  }

  if (!event.sender || !event.sender.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
    errors.push('Invalid or missing sender (must be valid email)');
  }

  if (!event.detectedText || event.detectedText.length > 100) {
    errors.push('Invalid detectedText (max 100 chars)');
  }

  if (!event.triggerWord || typeof event.triggerWord !== 'string') {
    errors.push('Missing triggerWord');
  }

  if (typeof event.triggerWeight !== 'number' || event.triggerWeight < 1 || event.triggerWeight > 10) {
    errors.push('Invalid triggerWeight (must be 1-10)');
  }

  if (!event.emailUrl || !event.emailUrl.startsWith('https://mail.google.com/')) {
    errors.push('Invalid emailUrl (must be Gmail URL)');
  }

  if (typeof event.acknowledged !== 'boolean') {
    errors.push('Invalid acknowledged (must be boolean)');
  }

  return errors;
}
```

**State Transitions**:

```
[New Detection] → acknowledged: false
       ↓
[User Views in Popup] → acknowledged: true
       ↓
[80% Quota Reached] → Oldest events deleted (FIFO)
```

**Storage Schema** (chrome.storage.local):

```json
{
  "detectionEvents": [
    {
      "id": "a1b2c3d4-e5f6-4789-a012-3456789abcde",
      "timestamp": "2025-11-06T10:30:00.000Z",
      "emailSubject": "Re: Website Redesign Project",
      "sender": "client@example.com",
      "senderName": "John Client",
      "detectedText": "Also, can you add user authentication and a dashboard?",
      "triggerWord": "also",
      "triggerWeight": 8,
      "emailUrl": "https://mail.google.com/mail/u/0/#inbox/18bcf123456789ab",
      "threadId": "18bcf123456789ab",
      "messageId": "18bcf987654321cd",
      "acknowledged": false
    }
  ]
}
```

**Size Estimation**:
- Average event: ~500 bytes
- 1000 events: ~500KB (10% of 5MB quota)
- 10,000 events: ~5MB (max capacity)

---

### TriggerWord

**Purpose**: Represents a scope creep detection keyword/phrase pattern.

**Note**: TriggerWord is NOT stored in chrome.storage.local. It's a static configuration defined in code.

**Attributes**:

| Attribute | Type | Required | Description | Constraints |
|-----------|------|----------|-------------|-------------|
| `phrase` | string | ✅ Yes | The trigger word/phrase | Lowercase, used in regex pattern |
| `pattern` | RegExp | ✅ Yes | Regex pattern for matching | Compiled regex object |
| `contextRequired` | boolean | ✅ Yes | Needs additional context (verb + noun) | `true` for weak triggers like "also" |
| `weight` | number (1-10) | ✅ Yes | Confidence score | Higher = more likely scope creep |
| `description` | string | ❌ No | Human-readable explanation | For debugging/documentation |

**Relationships**:
- One TriggerWord → Many DetectionEvents (via `triggerWord` field)

**Validation Rules**:
- `phrase` must be lowercase
- `pattern` must be valid RegExp
- `weight` must be 1-10
- `contextRequired` must be boolean

**Storage Schema** (code definition, not chrome.storage.local):

```javascript
// src/utils/trigger-words.js
export const TRIGGER_WORDS = [
  // High-confidence patterns (weight: 8-10)
  {
    phrase: 'also + action verb',
    pattern: /\b(also|additionally|one more thing)[,\s]+(can you|could you|would you|please)\s+(add|create|build|implement|design)/i,
    contextRequired: false,
    weight: 9,
    description: 'Strong scope creep indicator: trigger word + explicit request'
  },

  // Medium-confidence patterns (weight: 5-7)
  {
    phrase: 'while you\'re at it',
    pattern: /\bwhile you'?re at it[,\s]+/i,
    contextRequired: false,
    weight: 7,
    description: 'Common scope creep phrase: implies additional work'
  },

  {
    phrase: 'by the way',
    pattern: /\bby the way[,\s]+(?:can|could|would)/i,
    contextRequired: false,
    weight: 6,
    description: 'Casual additional request indicator'
  },

  {
    phrase: 'quick favor',
    pattern: /\bquick favor[,\s:]+/i,
    contextRequired: false,
    weight: 7,
    description: 'Minimizes scope addition (\"it\'s just a quick thing\")'
  },

  {
    phrase: 'I forgot to mention',
    pattern: /\bI forgot to mention[,\s]+/i,
    contextRequired: false,
    weight: 6,
    description: 'Late-stage scope addition'
  },

  // Low-confidence patterns (weight: 3-4)
  {
    phrase: 'also (weak)',
    pattern: /\balso[,\s]+.{0,50}(add|create|build|change|modify|update|redesign)/i,
    contextRequired: true,
    weight: 4,
    description: 'Weak trigger - requires action verb within 50 chars'
  },

  {
    phrase: 'actually',
    pattern: /\bactually[,\s]+.{0,50}(change|modify|update|instead)/i,
    contextRequired: true,
    weight: 4,
    description: 'Direction change indicator'
  },

  {
    phrase: 'instead',
    pattern: /\binstead[,\s]+.{0,50}(of|can you|could you)/i,
    contextRequired: true,
    weight: 5,
    description: 'Replacement request (scope change)'
  }
];
```

**Usage Example**:
```javascript
// src/utils/detector.js
import { TRIGGER_WORDS } from './trigger-words.js';

function detectScopeCreep(messageText) {
  for (const trigger of TRIGGER_WORDS) {
    if (trigger.pattern.test(messageText)) {
      return {
        matched: true,
        triggerWord: trigger.phrase,
        triggerWeight: trigger.weight
      };
    }
  }
  return { matched: false };
}
```

---

## Indexes

**chrome.storage.local has no native indexing**, but we can optimize queries with in-memory indexes:

### By Thread ID
```javascript
// Group events by threadId for thread view
const eventsByThread = detectionEvents.reduce((acc, event) => {
  if (!acc[event.threadId]) acc[event.threadId] = [];
  acc[event.threadId].push(event);
  return acc;
}, {});
```

### By Acknowledged Status
```javascript
// Filter unacknowledged events for badge count
const unacknowledgedCount = detectionEvents.filter(e => !e.acknowledged).length;
```

### By Timestamp (Sorted)
```javascript
// Most recent events first
const sortedEvents = detectionEvents.sort((a, b) =>
  new Date(b.timestamp) - new Date(a.timestamp)
);
```

---

## Data Migrations

### Schema Versioning

**Current Version**: v1.0.0

**Migration Strategy** (for future schema changes):
```javascript
// src/utils/storage.js
const SCHEMA_VERSION = '1.0.0';

async function migrateSchema() {
  const { schemaVersion, detectionEvents = [] } = await chrome.storage.local.get(['schemaVersion', 'detectionEvents']);

  if (!schemaVersion) {
    // First-time install, no migration needed
    await chrome.storage.local.set({ schemaVersion: SCHEMA_VERSION });
    return;
  }

  if (schemaVersion === '1.0.0') {
    // Current version, no migration
    return;
  }

  // Future migrations will go here
  // Example:
  // if (schemaVersion === '1.0.0') {
  //   // Migrate to 2.0.0
  //   const migratedEvents = detectionEvents.map(addNewField);
  //   await chrome.storage.local.set({
  //     detectionEvents: migratedEvents,
  //     schemaVersion: '2.0.0'
  //   });
  // }
}
```

---

## Performance Considerations

### Read Patterns
- **Frequency**: On popup open (1-5 times/day)
- **Query**: `chrome.storage.local.get('detectionEvents')` → All events
- **Latency**: <10ms (chrome.storage.local is fast)

### Write Patterns
- **Frequency**: On each detection (1-10 times/day)
- **Query**: Append new event to array + optional FIFO rotation
- **Latency**: <10ms (sync write, async response)

### Quota Management
- **Check frequency**: Every 10th write (not every write = performance optimization)
- **Cleanup strategy**: Delete oldest 200 events (25% of target capacity)
- **User impact**: Minimal (oldest history lost, but users care about recent detections)

---

## Data Privacy & Security

### Privacy Guarantees (Constitutional Principle I)
- ✅ All data stored locally in chrome.storage.local
- ✅ NO data transmission to external servers
- ✅ NO analytics or telemetry
- ✅ User owns and controls their data

### Security Measures
- ✅ Input validation on all fields (prevent XSS)
- ✅ Email URLs validated (only Gmail domains)
- ✅ No eval() or Function() constructors
- ✅ Content Security Policy compliant

### Data Retention
- **Automatic cleanup**: FIFO rotation at 80% quota (800 events)
- **User control**: Manual export/delete in dashboard (Feature 003)
- **Persistence**: Data persists until user uninstalls extension or clears storage

---

## Testing Data

### Test DetectionEvent Fixtures

```javascript
// tests/fixtures/detection-events.js
export const SAMPLE_EVENTS = [
  {
    id: 'test-001',
    timestamp: '2025-11-06T10:30:00.000Z',
    emailSubject: 'Re: Website Redesign Project',
    sender: 'client@example.com',
    senderName: 'John Client',
    detectedText: 'Also, can you add user authentication?',
    triggerWord: 'also',
    triggerWeight: 9,
    emailUrl: 'https://mail.google.com/mail/u/0/#inbox/thread-001',
    threadId: 'thread-001',
    messageId: 'msg-001',
    acknowledged: false
  },
  {
    id: 'test-002',
    timestamp: '2025-11-06T11:45:00.000Z',
    emailSubject: 'Re: Logo Design',
    sender: 'client2@example.com',
    senderName: 'Jane Client',
    detectedText: 'While you\'re at it, could you update the color scheme?',
    triggerWord: 'while you\'re at it',
    triggerWeight: 7,
    emailUrl: 'https://mail.google.com/mail/u/0/#inbox/thread-002',
    threadId: 'thread-002',
    messageId: 'msg-002',
    acknowledged: false
  }
];
```

### Test TriggerWord Fixtures

```javascript
// tests/fixtures/test-emails.js
export const SCOPE_CREEP_EMAILS = [
  'Also, can you add user authentication?', // Should detect
  'Additionally, could you build a dashboard?', // Should detect
  'One more thing - please create a report feature', // Should detect
  'While you\'re at it, update the logo', // Should detect
  'By the way, can we change the colors?', // Should detect
  'Quick favor - adjust the layout', // Should detect
  'I forgot to mention, we need analytics', // Should detect
  'Actually, let\'s redesign the homepage instead', // Should detect
];

export const NORMAL_EMAILS = [
  'Also, thank you for your work!', // Should NOT detect
  'Also, I\'m excited about this project', // Should NOT detect
  'By the way, when is the deadline?', // Should NOT detect (question only)
  'I appreciate your help with this', // Should NOT detect
  'Looking forward to seeing the results', // Should NOT detect
];
```

---

**Data Model Complete**: ✅ All entities defined with storage schemas and validation rules

**Next**: Create quickstart.md with integration examples
