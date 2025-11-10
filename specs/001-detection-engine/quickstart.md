# Quick Start: Gmail Scope Creep Detection Engine

**Feature**: 001-detection-engine
**Created**: 2025-11-06

This document provides integration examples, code snippets, and step-by-step guides for implementing the detection engine.

---

## Table of Contents

1. [Content Script Lifecycle](#content-script-lifecycle)
2. [Detection Flow Example](#detection-flow-example)
3. [Storage Integration](#storage-integration)
4. [Notification Integration](#notification-integration)
5. [Testing Examples](#testing-examples)

---

## Content Script Lifecycle

### Step-by-Step Flow

```
1. Gmail page loads (https://mail.google.com/*)
   ↓
2. Chrome injects content.js (manifest.json content_scripts)
   ↓
3. content.js initializes:
   - Attach MutationObserver to document.body
   - Load existing detection events from chrome.storage.local
   - Scan current visible messages (initial detection)
   ↓
4. User navigates to thread/opens email
   ↓
5. MutationObserver detects new DOM nodes
   ↓
6. Debounce function waits 300ms (batch rapid mutations)
   ↓
7. detectScopeCreep() scans new messages
   ↓
8. If match found:
   - highlightText() renders yellow background
   - sendNotification() displays browser notification
   - updateBadge() increments icon count
   - saveDetectionEvent() stores to chrome.storage.local
   ↓
9. User clicks extension icon → Popup displays events
```

### Code Example

```javascript
// src/content/content.js
import { detectScopeCreep } from '../utils/detector.js';
import { highlightText } from './highlighter.js';
import { saveDetectionEvent } from '../utils/storage.js';
import { SELECTORS } from './gmail-dom.js';

// Initialize on page load
(async function init() {
  console.log('[ScopeShield] Content script loaded');

  // Scan existing messages (initial detection)
  const existingMessages = document.querySelectorAll(SELECTORS.message);
  if (existingMessages.length > 0) {
    await scanMessages(existingMessages);
  }

  // Watch for new messages (dynamic content)
  observeGmailChanges();
})();

function observeGmailChanges() {
  const observer = new MutationObserver(debounce(async (mutations) => {
    const newMessages = mutations
      .flatMap(m => Array.from(m.addedNodes))
      .filter(node => node.matches?.(SELECTORS.message));

    if (newMessages.length > 0) {
      await scanMessages(newMessages);
    }
  }, 300)); // 300ms debounce

  observer.observe(document.body, {
    childList: true,
    subtree: true
  });

  console.log('[ScopeShield] MutationObserver attached');
}

async function scanMessages(messages) {
  const start = performance.now();

  for (const message of messages) {
    const messageBody = message.querySelector(SELECTORS.messageBody);
    if (!messageBody) continue;

    // Extract text (ignore quoted text and signatures)
    const text = extractMessageText(messageBody);

    // Run detection
    const result = detectScopeCreep(text);

    if (result.matched) {
      // Highlight detected text
      highlightText(messageBody, result.matchedText);

      // Create detection event
      const event = createDetectionEvent(message, result);

      // Save to storage
      await saveDetectionEvent(event);

      // Send notification
      chrome.runtime.sendMessage({
        type: 'SCOPE_CREEP_DETECTED',
        event
      });
    }
  }

  const elapsed = performance.now() - start;
  console.log(`[ScopeShield] Scanned ${messages.length} messages in ${elapsed.toFixed(2)}ms`);
}

function debounce(func, wait) {
  let timeout;
  return function(...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), wait);
  };
}
```

---

## Detection Flow Example

### Trigger Word Matching

```javascript
// src/utils/detector.js
import { TRIGGER_WORDS } from './trigger-words.js';

export function detectScopeCreep(text) {
  // Skip empty text
  if (!text || text.trim().length === 0) {
    return { matched: false };
  }

  // Normalize text (lowercase, trim whitespace)
  const normalizedText = text.toLowerCase().trim();

  // Test against all trigger patterns
  for (const trigger of TRIGGER_WORDS) {
    const match = normalizedText.match(trigger.pattern);

    if (match) {
      // Extract context (10 words before + after match)
      const matchIndex = match.index;
      const contextStart = Math.max(0, matchIndex - 50);
      const contextEnd = Math.min(normalizedText.length, matchIndex + match[0].length + 50);
      const context = text.substring(contextStart, contextEnd);

      return {
        matched: true,
        triggerWord: trigger.phrase,
        triggerWeight: trigger.weight,
        matchedText: match[0],
        context: context.trim()
      };
    }
  }

  return { matched: false };
}
```

### Example Inputs & Outputs

```javascript
// Test cases
const testCases = [
  {
    input: 'Also, can you add user authentication?',
    expected: {
      matched: true,
      triggerWord: 'also + action verb',
      triggerWeight: 9,
      matchedText: 'Also, can you add user authentication',
      context: 'Also, can you add user authentication?'
    }
  },
  {
    input: 'Also, thank you for your work!',
    expected: {
      matched: false // Excluded by pattern (no action verb)
    }
  },
  {
    input: 'While you\'re at it, could you update the logo?',
    expected: {
      matched: true,
      triggerWord: 'while you\'re at it',
      triggerWeight: 7,
      matchedText: 'While you\'re at it,',
      context: 'While you\'re at it, could you update the logo?'
    }
  }
];

// Run tests
for (const { input, expected } of testCases) {
  const result = detectScopeCreep(input);
  console.assert(
    result.matched === expected.matched,
    `Expected matched=${expected.matched}, got ${result.matched}`
  );
}
```

---

## Storage Integration

### Save Detection Event

```javascript
// src/utils/storage.js

export async function saveDetectionEvent(event) {
  try {
    // Get existing events
    const { detectionEvents = [] } = await chrome.storage.local.get('detectionEvents');

    // Add new event
    detectionEvents.push(event);

    // Quota management (every 10th event)
    if (detectionEvents.length % 10 === 0) {
      await manageQuota(detectionEvents);
    }

    // Save updated array
    await chrome.storage.local.set({ detectionEvents });

    console.log(`[ScopeShield] Saved detection event: ${event.id}`);
  } catch (error) {
    console.error('[ScopeShield] Failed to save detection event:', error);
  }
}

async function manageQuota(detectionEvents) {
  const bytesInUse = await chrome.storage.local.getBytesInUse();
  const quotaPct = (bytesInUse / 5242880) * 100; // 5MB = 5242880 bytes

  if (quotaPct > 80) {
    // FIFO: Remove oldest 200 events
    detectionEvents.splice(0, 200);
    console.log(`[ScopeShield] Quota at ${quotaPct.toFixed(1)}% - Rotated 200 oldest events`);
    return detectionEvents;
  }

  return detectionEvents;
}
```

### Load Detection Events

```javascript
// src/popup/popup.js

async function loadDetectionEvents() {
  const { detectionEvents = [] } = await chrome.storage.local.get('detectionEvents');

  // Sort by timestamp (most recent first)
  const sortedEvents = detectionEvents.sort((a, b) =>
    new Date(b.timestamp) - new Date(a.timestamp)
  );

  // Group by thread for display
  const eventsByThread = sortedEvents.reduce((acc, event) => {
    if (!acc[event.threadId]) {
      acc[event.threadId] = [];
    }
    acc[event.threadId].push(event);
    return acc;
  }, {});

  return eventsByThread;
}
```

### Update Acknowledged Status

```javascript
// src/popup/popup.js

async function acknowledgeEvent(eventId) {
  const { detectionEvents = [] } = await chrome.storage.local.get('detectionEvents');

  // Find and update event
  const event = detectionEvents.find(e => e.id === eventId);
  if (event) {
    event.acknowledged = true;
    await chrome.storage.local.set({ detectionEvents });

    // Update badge count
    const unacknowledgedCount = detectionEvents.filter(e => !e.acknowledged).length;
    chrome.runtime.sendMessage({
      type: 'UPDATE_BADGE',
      count: unacknowledgedCount
    });
  }
}
```

---

## Notification Integration

### Send Browser Notification

```javascript
// src/background/service-worker.js

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'SCOPE_CREEP_DETECTED') {
    sendNotification(message.event);
    updateBadge();
  }

  if (message.type === 'UPDATE_BADGE') {
    chrome.action.setBadgeText({ text: String(message.count) });
  }
});

function sendNotification(event) {
  const notificationOptions = {
    type: 'basic',
    iconUrl: chrome.runtime.getURL('assets/icons/icon128.png'),
    title: 'ScopeShield: Scope Creep Detected',
    message: `${event.sender}: "${event.detectedText.substring(0, 50)}..."`,
    priority: 2
  };

  chrome.notifications.create(event.id, notificationOptions);

  console.log(`[ScopeShield] Notification sent for event: ${event.id}`);
}

async function updateBadge() {
  const { detectionEvents = [] } = await chrome.storage.local.get('detectionEvents');
  const unacknowledgedCount = detectionEvents.filter(e => !e.acknowledged).length;

  chrome.action.setBadgeText({
    text: unacknowledgedCount > 0 ? String(unacknowledgedCount) : ''
  });

  chrome.action.setBadgeBackgroundColor({
    color: '#FFA000' // Amber
  });
}
```

### Handle Notification Click

```javascript
// src/background/service-worker.js

chrome.notifications.onClicked.addListener((notificationId) => {
  // Open popup when notification clicked
  chrome.action.openPopup();

  // Clear notification
  chrome.notifications.clear(notificationId);
});
```

---

## Testing Examples

### Unit Test: Detection Logic

```javascript
// tests/utils/detector.test.js
import { describe, it, expect } from 'vitest';
import { detectScopeCreep } from '../../src/utils/detector.js';

describe('detectScopeCreep', () => {
  it('should detect high-confidence trigger patterns', () => {
    const text = 'Also, can you add user authentication?';
    const result = detectScopeCreep(text);

    expect(result.matched).toBe(true);
    expect(result.triggerWord).toBe('also + action verb');
    expect(result.triggerWeight).toBe(9);
  });

  it('should NOT detect gratitude phrases', () => {
    const text = 'Also, thank you for your work!';
    const result = detectScopeCreep(text);

    expect(result.matched).toBe(false);
  });

  it('should detect medium-confidence patterns', () => {
    const text = 'While you\'re at it, could you update the logo?';
    const result = detectScopeCreep(text);

    expect(result.matched).toBe(true);
    expect(result.triggerWord).toBe('while you\'re at it');
    expect(result.triggerWeight).toBe(7);
  });

  it('should handle empty text', () => {
    const result = detectScopeCreep('');
    expect(result.matched).toBe(false);
  });

  it('should extract context around match', () => {
    const text = 'Thanks for the progress update. Also, can you add analytics? Let me know the timeline.';
    const result = detectScopeCreep(text);

    expect(result.matched).toBe(true);
    expect(result.context).toContain('Also, can you add analytics');
  });
});
```

### Integration Test: Storage

```javascript
// tests/utils/storage.test.js
import { describe, it, expect, beforeEach } from 'vitest';
import { saveDetectionEvent } from '../../src/utils/storage.js';

// Mock chrome.storage.local
global.chrome = {
  storage: {
    local: {
      data: {},
      get(keys) {
        return Promise.resolve(
          typeof keys === 'string'
            ? { [keys]: this.data[keys] }
            : Object.fromEntries(keys.map(k => [k, this.data[k]]))
        );
      },
      set(items) {
        Object.assign(this.data, items);
        return Promise.resolve();
      },
      getBytesInUse() {
        return Promise.resolve(
          JSON.stringify(this.data).length
        );
      }
    }
  }
};

describe('saveDetectionEvent', () => {
  beforeEach(() => {
    // Clear storage before each test
    chrome.storage.local.data = {};
  });

  it('should save detection event to storage', async () => {
    const event = {
      id: 'test-001',
      timestamp: '2025-11-06T10:30:00.000Z',
      emailSubject: 'Test Email',
      sender: 'test@example.com',
      detectedText: 'Also, can you test this?',
      triggerWord: 'also',
      triggerWeight: 9,
      emailUrl: 'https://mail.google.com/test',
      threadId: 'thread-001',
      messageId: 'msg-001',
      acknowledged: false
    };

    await saveDetectionEvent(event);

    const { detectionEvents } = await chrome.storage.local.get('detectionEvents');
    expect(detectionEvents).toHaveLength(1);
    expect(detectionEvents[0].id).toBe('test-001');
  });

  it('should append to existing events', async () => {
    const event1 = { id: 'test-001', /* ... */ };
    const event2 = { id: 'test-002', /* ... */ };

    await saveDetectionEvent(event1);
    await saveDetectionEvent(event2);

    const { detectionEvents } = await chrome.storage.local.get('detectionEvents');
    expect(detectionEvents).toHaveLength(2);
  });
});
```

### Manual Test Script

```javascript
// tests/manual/test-gmail.js
// Run in Gmail page console (DevTools)

(async function testDetection() {
  console.log('🧪 Testing ScopeShield detection...');

  // Test case 1: High-confidence trigger
  const message1 = document.createElement('div');
  message1.setAttribute('data-message-id', 'test-001');
  message1.innerHTML = '<div class="a3s">Also, can you add user authentication?</div>';
  document.body.appendChild(message1);
  await new Promise(r => setTimeout(r, 500)); // Wait for detection

  // Check if highlighted
  const highlighted1 = message1.querySelector('span[style*="background"]');
  console.assert(highlighted1 !== null, '✅ Test 1: High-confidence trigger detected');

  // Test case 2: Normal conversation (should NOT detect)
  const message2 = document.createElement('div');
  message2.setAttribute('data-message-id', 'test-002');
  message2.innerHTML = '<div class="a3s">Also, thank you for your work!</div>';
  document.body.appendChild(message2);
  await new Promise(r => setTimeout(r, 500));

  const highlighted2 = message2.querySelector('span[style*="background"]');
  console.assert(highlighted2 === null, '✅ Test 2: Normal conversation NOT detected');

  // Cleanup
  message1.remove();
  message2.remove();

  console.log('🎉 All manual tests passed!');
})();
```

---

## Performance Monitoring

### Measure Detection Latency

```javascript
// src/content/content.js

async function scanMessages(messages) {
  const start = performance.now();

  // ... detection logic ...

  const elapsed = performance.now() - start;

  // Log performance metrics
  chrome.runtime.sendMessage({
    type: 'PERFORMANCE_METRIC',
    metric: 'detection_latency',
    value: elapsed,
    messageCount: messages.length
  });

  // Warning if exceeds budget
  if (elapsed > 500) {
    console.warn(`[ScopeShield] Detection latency exceeded budget: ${elapsed.toFixed(2)}ms > 500ms`);
  }
}
```

### Collect Metrics in Background

```javascript
// src/background/service-worker.js

const performanceMetrics = [];

chrome.runtime.onMessage.addListener((message) => {
  if (message.type === 'PERFORMANCE_METRIC') {
    performanceMetrics.push({
      metric: message.metric,
      value: message.value,
      timestamp: Date.now()
    });

    // Calculate p95
    if (performanceMetrics.length >= 20) {
      const sorted = [...performanceMetrics].sort((a, b) => a.value - b.value);
      const p95Index = Math.floor(sorted.length * 0.95);
      const p95 = sorted[p95Index].value;

      console.log(`[ScopeShield] Detection latency p95: ${p95.toFixed(2)}ms`);

      // Clear old metrics (keep last 100)
      if (performanceMetrics.length > 100) {
        performanceMetrics.splice(0, 20);
      }
    }
  }
});
```

---

## Troubleshooting

### Debug Mode

```javascript
// Enable debug logging
localStorage.setItem('SCOPESHIELD_DEBUG', 'true');

// In code:
const DEBUG = localStorage.getItem('SCOPESHIELD_DEBUG') === 'true';

if (DEBUG) {
  console.log('[ScopeShield] Debug: Scanning message...', message);
}
```

### Common Issues

| Issue | Symptom | Solution |
|-------|---------|----------|
| No detection | Yellow highlights don't appear | Check Gmail selectors (inspect DOM), verify content script injected |
| False positives | Normal emails highlighted | Review trigger patterns, add exclusion rules |
| Slow performance | Latency >500ms | Enable debug mode, check message count, optimize regex patterns |
| Storage quota error | Extension stops saving events | Check chrome.storage.local quota, verify FIFO rotation working |

---

**Quick Start Complete**: ✅ Integration examples and testing guides provided

**Next**: Proceed to task breakdown (`/speckit.tasks`)
