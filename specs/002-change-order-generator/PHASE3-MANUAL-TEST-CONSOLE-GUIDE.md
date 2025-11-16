# Phase 3 Manual Testing - Chrome DevTools Console Guide
**Paranoid Pablo Edition**

This guide provides Chrome DevTools Console commands to complete manual testing of the ScopeShield Phase 3 Change Order Generator.

---

## Setup Instructions

### 1. Open Extension Popup DevTools

1. **Load the extension** in Chrome:
   - Go to `chrome://extensions/`
   - Enable "Developer mode"
   - Extension should be loaded at: `/home/matt/Idea-dreams/scope-shield/dist`
   - Extension ID: `lecdhepgnhlackpfhibcimophmlbgigd`

2. **Open the extension popup**:
   - Click the ScopeShield extension icon in Chrome toolbar
   - OR navigate to: `chrome-extension://lecdhepgnhlackpfhibcimophmlbgigd/src/popup/popup.html`

3. **Open DevTools for the popup**:
   - Right-click anywhere in the popup → "Inspect"
   - OR press `Ctrl+Shift+I` (Linux/Windows) / `Cmd+Option+I` (Mac)
   - Click the **Console** tab

4. **Keep DevTools open** while running commands below

---

## Pre-Test: Clear All Storage

**Run this before each test scenario:**

```javascript
// Clear all storage
chrome.storage.local.clear(() => {
  console.log('✅ Storage cleared');
});
```

---

## Test Scenario 1: Single Detection Change Order

### Step 1: Set Freelancer Name

```javascript
chrome.storage.local.set({
  scopeshield_settings_v1: {
    freelancerName: "John Developer",
    hourlyRate: 150
  }
}, () => console.log('✅ Settings saved'));
```

### Step 2: Inject Single Detection

```javascript
chrome.storage.local.set({
  detectionEvents: [{
    id: 'single-001',
    sender: 'solo@client.com',
    senderName: 'Solo Client',
    detectedText: 'Can you add a user dashboard with analytics?',
    triggerWord: 'can',
    triggerWeight: 8,
    timestamp: Date.now(),
    acknowledged: false,
    url: 'https://mail.google.com'
  }]
}, () => console.log('✅ Detection injected'));
```

### Step 3: Reload Popup

Close and reopen the popup (or press `Ctrl+R` in the popup)

### Step 4: Verify

**Expected Results:**
- ✅ Detections tab shows **1 total detection**
- ✅ Unacknowledged shows **1**
- ✅ Detection item displays: "Solo Client" - "Can you add a user dashboard..."
- ✅ **No multi-item selector appears** (only 1 detection)

### Step 5: Generate Change Order

Click the **"Generate Change Order"** button

### Step 6: Verify Change Order

**Expected Results:**
- ✅ Change order document appears below
- ✅ Document number: **#001**
- ✅ Date: Today's date
- ✅ Client: "Solo Client"
- ✅ Freelancer: "John Developer"
- ✅ Requested Changes: "Can you add a user dashboard with analytics?"
- ✅ All 7 sections present
- ✅ No console errors

**Check Console for Performance:**
```javascript
// Should show generation time <5 seconds
// Look for: [ChangeOrderService.generate] Generation complete { duration: '...ms' }
```

**Verify Storage (Run in Console):**
```javascript
chrome.storage.local.get('detectionEvents', (result) => {
  const events = result.detectionEvents || [];
  const acknowledged = events.filter(e => e.acknowledged).length;
  console.log(`✅ Detections acknowledged: ${acknowledged} / ${events.length}`);
  // Should show: ✅ Detections acknowledged: 1 / 1
});
```

---

## Test Scenario 2: Multi-Item Bundling (2-5 Detections)

### Step 1: Clear Storage

```javascript
chrome.storage.local.clear(() => console.log('✅ Storage cleared'));
```

### Step 2: Set Freelancer Name

```javascript
chrome.storage.local.set({
  scopeshield_settings_v1: {
    freelancerName: "John Developer",
    hourlyRate: 150
  }
}, () => console.log('✅ Settings saved'));
```

### Step 3: Inject Multiple Detections (Same Client)

```javascript
chrome.storage.local.set({
  detectionEvents: [
    {
      id: 'multi-001',
      sender: 'multi@client.com',
      senderName: 'Multi Client',
      detectedText: 'Add dark mode support',
      triggerWord: 'add',
      triggerWeight: 8,
      timestamp: Date.now() - 3600000, // 1 hour ago
      acknowledged: false,
      url: 'https://mail.google.com'
    },
    {
      id: 'multi-002',
      sender: 'multi@client.com',
      senderName: 'Multi Client',
      detectedText: 'Implement user authentication',
      triggerWord: 'implement',
      triggerWeight: 9,
      timestamp: Date.now() - 7200000, // 2 hours ago
      acknowledged: false,
      url: 'https://mail.google.com'
    },
    {
      id: 'multi-003',
      sender: 'multi@client.com',
      senderName: 'Multi Client',
      detectedText: 'Add mobile responsiveness',
      triggerWord: 'add',
      triggerWeight: 7,
      timestamp: Date.now() - 1800000, // 30 mins ago
      acknowledged: false,
      url: 'https://mail.google.com'
    }
  ]
}, () => console.log('✅ 3 detections injected'));
```

### Step 4: Reload Popup

Close and reopen the popup

### Step 5: Verify Detections

**Expected Results:**
- ✅ Total: **3**
- ✅ Unacknowledged: **3**
- ✅ All 3 detections visible

### Step 6: Generate Change Order

Click **"Generate Change Order"** button

### Step 7: Verify Multi-Item Selector

**Expected Results:**
- ✅ **Modal appears** with "Select Detections to Include"
- ✅ All 3 detections listed with checkboxes
- ✅ All checkboxes **checked by default**
- ✅ Selection count: "**3** of 3 items selected"
- ✅ "Select All (3)" button visible
- ✅ "Deselect All" button visible

### Step 8: Test Selection Controls

1. Click **"Deselect All"**
   - ✅ All checkboxes uncheck
   - ✅ Count: "**0** of 3 items selected"

2. Click **"Select All"**
   - ✅ All checkboxes check
   - ✅ Count: "**3** of 3 items selected"

3. **Manually uncheck 1 checkbox** (middle one)
   - ✅ Count: "**2** of 3 items selected"

### Step 9: Test Cancel

Click **"Cancel"** button
- ✅ Modal closes
- ✅ No change order generated
- ✅ Detections remain unacknowledged

### Step 10: Generate with Partial Selection

1. Click "Generate Change Order" again
2. Uncheck the middle detection
3. Click **"Generate Change Order"** button (in modal)

### Step 11: Verify Change Order

**Expected Results:**
- ✅ Change order generated
- ✅ Requested Changes shows **2 bullet points**:
  - "Add dark mode support"
  - "Add mobile responsiveness"
- ✅ Middle item ("Implement user authentication") **NOT included**

### Step 12: Verify Acknowledgment

**Run in Console:**
```javascript
chrome.storage.local.get('detectionEvents', (result) => {
  const events = result.detectionEvents || [];
  const acked = events.filter(e => e.acknowledged).length;
  const unacked = events.filter(e => !e.acknowledged).length;
  console.log(`✅ Acknowledged: ${acked}, Unacknowledged: ${unacked}`);
  // Should show: ✅ Acknowledged: 2, Unacknowledged: 1
});
```

---

## Test Scenario 3: First-Time Client (No History)

### Step 1: Clear All Storage

```javascript
chrome.storage.local.clear(() => console.log('✅ Storage cleared'));
```

### Step 2: Set Freelancer Name

```javascript
chrome.storage.local.set({
  scopeshield_settings_v1: {
    freelancerName: "John Developer",
    hourlyRate: 150
  }
}, () => console.log('✅ Settings saved'));
```

### Step 3: Inject Detection from New Client

```javascript
chrome.storage.local.set({
  detectionEvents: [{
    id: 'new-client-001',
    sender: 'newclient@example.com',
    senderName: 'New Client Corp',
    detectedText: 'Add reporting dashboard',
    triggerWord: 'add',
    triggerWeight: 8,
    timestamp: Date.now(),
    acknowledged: false,
    url: 'https://mail.google.com'
  }]
}, () => console.log('✅ Detection injected'));
```

### Step 4: Reload Popup & Generate

1. Reload popup
2. Click "Generate Change Order"

### Step 5: Verify

**Expected Results:**
- ✅ **Original Scope Section**: "No original scope defined" (placeholder)
- ✅ Change order number: **#001** (first order for this client)
- ✅ All other fields populated correctly

---

## Test Scenario 4: Repeat Client (Scope Pre-fill)

### Step 1: Add History with Original Scope

**Run after Scenario 3:**

```javascript
chrome.storage.local.get('scopeshield_changeorder_history_v1', (result) => {
  const history = result.scopeshield_changeorder_history_v1 || {};
  const clientOrders = history['newclient@example.com'] || [];

  if (clientOrders.length > 0) {
    // Add original scope to first order
    clientOrders[0].originalScope = 'Build a web application with user management and basic CRUD operations';
    history['newclient@example.com'] = clientOrders;

    chrome.storage.local.set({ scopeshield_changeorder_history_v1: history }, () => {
      console.log('✅ Original scope added to history');
    });
  } else {
    console.error('❌ No orders found for newclient@example.com');
  }
});
```

### Step 2: Inject Second Detection

```javascript
chrome.storage.local.get('detectionEvents', (result) => {
  const events = result.detectionEvents || [];
  events.push({
    id: 'repeat-client-001',
    sender: 'newclient@example.com',
    senderName: 'New Client Corp',
    detectedText: 'Add admin dashboard with analytics',
    triggerWord: 'add',
    triggerWeight: 8,
    timestamp: Date.now(),
    acknowledged: false,
    url: 'https://mail.google.com'
  });
  chrome.storage.local.set({ detectionEvents: events }, () => {
    console.log('✅ Second detection added');
  });
});
```

### Step 3: Reload Popup & Generate

1. Reload popup
2. Click "Generate Change Order"

### Step 4: Verify

**Expected Results:**
- ✅ **Original Scope Pre-filled**: "Build a web application with user management and basic CRUD operations"
- ✅ Change order number: **#002** (second order for this client)
- ✅ Console shows: `[ChangeOrderService._loadOriginalScope] Pre-filled from history`

---

## Test Scenario 5: Sequential Numbering (CRITICAL)

### Step 1: Clear Storage & Setup History

```javascript
chrome.storage.local.clear(() => {
  console.log('✅ Storage cleared');

  // Create history with multiple clients
  chrome.storage.local.set({
    scopeshield_changeorder_history_v1: {
      'client1@example.com': [
        {
          id: 'co-1',
          changeOrderNumber: '#001',
          clientEmail: 'client1@example.com',
          dateCreated: new Date().toISOString()
        },
        {
          id: 'co-2',
          changeOrderNumber: '#002',
          clientEmail: 'client1@example.com',
          dateCreated: new Date().toISOString()
        }
      ],
      'client2@example.com': [
        {
          id: 'co-3',
          changeOrderNumber: '#001',
          clientEmail: 'client2@example.com',
          dateCreated: new Date().toISOString()
        }
      ]
    }
  }, () => console.log('✅ History created'));
});
```

### Step 2: Inject Detections for Both Clients

```javascript
chrome.storage.local.set({
  detectionEvents: [
    {
      id: 'seq-001',
      sender: 'client1@example.com',
      senderName: 'Client One',
      detectedText: 'Add feature X',
      triggerWord: 'add',
      triggerWeight: 8,
      timestamp: Date.now(),
      acknowledged: false,
      url: 'https://mail.google.com'
    },
    {
      id: 'seq-002',
      sender: 'client2@example.com',
      senderName: 'Client Two',
      detectedText: 'Add feature Y',
      triggerWord: 'add',
      triggerWeight: 8,
      timestamp: Date.now() - 1000,
      acknowledged: false,
      url: 'https://mail.google.com'
    }
  ]
}, () => console.log('✅ Detections injected'));
```

### Step 3: Generate for Client One

1. Reload popup
2. Select Client One detection (first one)
3. Generate change order
4. **Verify**: Change order number should be **#003** (continues from #002)

### Step 4: Generate for Client Two

1. Reload popup
2. Select Client Two detection
3. Generate change order
4. **Verify**: Change order number should be **#002** (continues from #001)

### Step 5: Verify Numbering

**Expected Results:**
- ✅ Client 1: **#003** (independent sequence)
- ✅ Client 2: **#002** (independent sequence)
- ✅ Numbering is **per-client**, not global

---

## Test Scenario 6: Long Text Truncation

### Step 1: Clear Storage

```javascript
chrome.storage.local.clear(() => console.log('✅ Storage cleared'));
```

### Step 2: Inject Detection with 600 Characters

```javascript
const longText = 'A'.repeat(600); // 600 characters

chrome.storage.local.set({
  detectionEvents: [{
    id: 'long-001',
    sender: 'long@client.com',
    senderName: 'Long Text Client',
    detectedText: longText,
    triggerWord: 'test',
    triggerWeight: 8,
    timestamp: Date.now(),
    acknowledged: false,
    url: 'https://mail.google.com'
  }]
}, () => console.log('✅ Detection with 600 chars injected'));
```

### Step 3: Generate Change Order

1. Reload popup
2. Generate change order

### Step 4: Verify Truncation

**Expected Results:**
- ✅ **Requested Changes**: Text shows **203 characters** (200 + "...")
- ✅ Text ends with "..."
- ✅ Console shows: `[ChangeOrderService._extractRequestedChanges] Text truncated { originalLength: 600, truncatedLength: 203 }`

### Test Boundary: Exactly 500 chars

```javascript
const boundaryText = 'B'.repeat(500); // Exactly 500

chrome.storage.local.set({
  detectionEvents: [{
    id: 'boundary-500',
    sender: 'test@client.com',
    senderName: 'Boundary Client',
    detectedText: boundaryText,
    triggerWord: 'test',
    triggerWeight: 8,
    timestamp: Date.now(),
    acknowledged: false,
    url: 'https://mail.google.com'
  }]
}, () => console.log('✅ Detection with 500 chars injected'));
```

**Expected**: NO truncation (≤500 is allowed)

---

## Test Scenario 7: Missing Freelancer Name

### Step 1: Clear All Settings

```javascript
chrome.storage.local.remove('scopeshield_settings_v1', () => {
  console.log('✅ Settings removed');
});
```

### Step 2: Inject Detection

```javascript
chrome.storage.local.set({
  detectionEvents: [{
    id: 'no-freelancer-001',
    sender: 'test@client.com',
    senderName: 'Test Client',
    detectedText: 'Add feature',
    triggerWord: 'add',
    triggerWeight: 8,
    timestamp: Date.now(),
    acknowledged: false,
    url: 'https://mail.google.com'
  }]
}, () => console.log('✅ Detection injected'));
```

### Step 3: Generate Change Order

1. Reload popup
2. Generate change order

### Step 4: Verify

**Expected Results:**
- ✅ Freelancer name shows: **"Your Name"** (placeholder)
- ✅ **No errors** in console
- ✅ Generation completes successfully

### Step 5: Set Name & Test Again

```javascript
chrome.storage.local.set({
  scopeshield_settings_v1: {
    freelancerName: "Jane Developer",
    hourlyRate: 150
  }
}, () => console.log('✅ Name set'));
```

Generate another change order:
- ✅ Freelancer name now shows: **"Jane Developer"**

---

## Test Scenario 8: Performance Validation

### Step 1: Inject 10 Detections

```javascript
const detections = [];
for (let i = 0; i < 10; i++) {
  detections.push({
    id: `perf-${String(i).padStart(3, '0')}`,
    sender: 'perf@client.com',
    senderName: 'Performance Client',
    detectedText: `Add feature ${i+1}`,
    triggerWord: 'add',
    triggerWeight: 8,
    timestamp: Date.now() - (i * 1000),
    acknowledged: false,
    url: 'https://mail.google.com'
  });
}

chrome.storage.local.set({ detectionEvents: detections }, () => {
  console.log('✅ 10 detections injected');
});
```

### Step 2: Measure Performance

1. Reload popup
2. **Start timing**: Open DevTools Network tab → Check "Disable cache" → Reload
3. Select all detections
4. Click "Generate Change Order"
5. **Check console** for:

```
[ChangeOrderService.generate] Generation complete { duration: '...ms' }
```

### Step 3: Verify

**Expected Results:**
- ✅ Generation time: **<5000ms** (5 seconds)
- ✅ Typical: 200-800ms
- ✅ No performance warnings

**If >5000ms, console shows:**
```
[ChangeOrderService.generate] Generation exceeded 5s threshold { duration: '...ms', threshold: '5000ms' }
```

---

## Test Scenario 10: Error Handling

### Test 10.1: Invalid Detection Event

```javascript
chrome.storage.local.set({
  detectionEvents: [{
    id: 'invalid-001',
    // Missing sender field
    detectedText: 'Test',
    timestamp: Date.now(),
    acknowledged: false
  }]
}, () => console.log('✅ Invalid detection injected'));
```

**Expected:**
- ✅ Generates with placeholders ("Client", "unknown@client.com")
- ✅ No crash
- ✅ May show warning in console

---

## Verification Commands

### Check All Storage

```javascript
chrome.storage.local.get(null, (result) => {
  console.log('📦 All storage:', result);
});
```

### Check Specific Keys

```javascript
chrome.storage.local.get([
  'scopeshield_settings_v1',
  'detectionEvents',
  'scopeshield_changeorder_history_v1'
], (result) => {
  console.log('Settings:', result.scopeshield_settings_v1);
  console.log('Detections:', result.detectionEvents?.length || 0);
  console.log('History:', Object.keys(result.scopeshield_changeorder_history_v1 || {}).length, 'clients');
});
```

### Count Acknowledged Detections

```javascript
chrome.storage.local.get('detectionEvents', (result) => {
  const events = result.detectionEvents || [];
  const acked = events.filter(e => e.acknowledged).length;
  console.log(`Acknowledged: ${acked} / ${events.length}`);
});
```

### View Change Order History

```javascript
chrome.storage.local.get('scopeshield_changeorder_history_v1', (result) => {
  const history = result.scopeshield_changeorder_history_v1 || {};
  Object.entries(history).forEach(([email, orders]) => {
    console.log(`\n${email}:`);
    orders.forEach(order => {
      console.log(`  ${order.changeOrderNumber} - ${order.dateCreated}`);
    });
  });
});
```

---

## Visual Inspection Checklist

After generating a change order, verify:

### Document Structure
- [ ] Header centered with "Change Order" title
- [ ] Change order number prominent (#001, #002, etc.)
- [ ] Date, client, freelancer names formatted
- [ ] 7 sections clearly delineated
- [ ] Section headings larger and bold

### Typography
- [ ] Body text 14-16px
- [ ] Headings 18-24px
- [ ] Line spacing 1.5
- [ ] Sans-serif font

### Spacing
- [ ] Document margins ~1 inch
- [ ] Spacing between sections ~36px
- [ ] Spacing within sections ~12px
- [ ] Signature blocks separated

### Lists
- [ ] Requested changes as **bulleted list** (not plain text)
- [ ] Bullet points visible (disc style)
- [ ] List items indented
- [ ] List spacing between items

### Colors
- [ ] Headers: Dark (#111827)
- [ ] Body: Medium gray (#374151)
- [ ] Borders: Light gray (#e5e7eb)
- [ ] No harsh black

### Professional Appearance
- [ ] Clean, modern design
- [ ] Print-ready
- [ ] No broken layout
- [ ] No overlapping text
- [ ] No missing sections

---

## Troubleshooting

### Issue: Commands Don't Work

**Solution:**
1. Make sure DevTools is open for the **extension popup**, not a regular page
2. URL should be: `chrome-extension://lecdhepgnhlackpfhibcimophmlbgigd/...`
3. `chrome.storage` API only works in extension contexts

### Issue: "chrome is not defined"

**Solution:**
- You're in the wrong context
- Right-click the extension popup → "Inspect" → Console tab

### Issue: Changes Don't Appear

**Solution:**
1. **Reload the popup** after setting storage
2. Close and reopen the popup
3. Or press `Ctrl+R` in the popup window

### Issue: Storage Quota Exceeded

**Solution:**
```javascript
chrome.storage.local.clear(() => console.log('✅ Cleared'));
```

---

## Test Results Template

Use this template to record your test results:

```
## Test Execution Results

**Date**: _______________
**Tester**: _______________
**Chrome Version**: _______________

| Scenario | Pass/Fail | Notes |
|----------|-----------|-------|
| 1. Single Detection | ☐ PASS ☐ FAIL | |
| 2. Multi-Item Bundling | ☐ PASS ☐ FAIL | |
| 3. First-Time Client | ☐ PASS ☐ FAIL | |
| 4. Repeat Client | ☐ PASS ☐ FAIL | |
| 5. Sequential Numbering | ☐ PASS ☐ FAIL | |
| 6. Text Truncation | ☐ PASS ☐ FAIL | |
| 7. Missing Freelancer | ☐ PASS ☐ FAIL | |
| 8. Performance | ☐ PASS ☐ FAIL | |
| 10. Error Handling | ☐ PASS ☐ FAIL | |
| Visual Inspection | ☐ PASS ☐ FAIL | |

**Overall Status**: ☐ READY TO SHIP  ☐ ISSUES FOUND

**Issues Found**: _______________________________________________

**Recommendations**: _______________________________________________
```

---

## Next Steps

After completing manual testing:

1. ✅ **All tests pass** → Proceed to Phase 4 (Pricing Calculator Widget)
2. ❌ **Issues found** → Document in GitHub Issues, prioritize, fix
3. 📊 **Performance concerns** → Profile and optimize
4. 🎨 **Visual issues** → Update CSS and retest

---

**Good luck with testing! 🚀**

*For questions or issues, see the main [PHASE3-MANUAL-TESTING-GUIDE.md](./PHASE3-MANUAL-TESTING-GUIDE.md)*
