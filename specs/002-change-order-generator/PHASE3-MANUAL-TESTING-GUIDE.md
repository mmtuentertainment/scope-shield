# Phase 3 Manual Testing Guide: Template Engine & Change Order Generation

**Feature**: Change Order Generator (Phase 3 Implementation)
**Test Date**: 2025-11-12
**Version**: Phase 3 Complete (T065-T126)
**Tester**: _______________

---

## Test Coverage Status

### ✅ Automated Unit Tests (Complete)
- **124 tests passing** across 5 test suites
- **TemplateEngine** (19 tests): Interpolation, caching, XSS protection, error handling
- **ChangeOrderHistory** (21 tests): Storage, retrieval, FIFO deletion, multi-client isolation
- **ChangeOrderNumbering** (34 tests): Sequential numbering, formatting, validation
- **ChangeOrderService** (36 tests): Generation, bundling, data integration, error handling
- **ChangeOrder** (14 tests): Validation, serialization, state management

### ⚠️ Manual Testing Required
This guide covers:
- **UI/UX verification**: Visual appearance, layout, responsive design
- **User workflows**: End-to-end scenarios from detection to change order
- **Integration**: Popup interaction, storage persistence, cross-component behavior
- **Performance**: Real-world timing under actual extension environment

**Note**: Unit tests validate business logic and data handling. Manual tests verify the user experience.

---

## Table of Contents

1. [Prerequisites & Setup](#prerequisites--setup)
2. [Test Scenario 1: Single Detection Change Order](#test-scenario-1-single-detection-change-order)
3. [Test Scenario 2: Multi-Item Bundling (2-5 Detections)](#test-scenario-2-multi-item-bundling-2-5-detections)
4. [Test Scenario 3: First-Time Client (No History)](#test-scenario-3-first-time-client-no-history)
5. [Test Scenario 4: Repeat Client (Scope Pre-fill)](#test-scenario-4-repeat-client-scope-pre-fill)
6. [Test Scenario 5: Sequential Numbering](#test-scenario-5-sequential-numbering)
7. [Test Scenario 6: Long Text Truncation](#test-scenario-6-long-text-truncation)
8. [Test Scenario 7: Missing Freelancer Name](#test-scenario-7-missing-freelancer-name)
9. [Test Scenario 8: Performance Validation](#test-scenario-8-performance-validation)
10. [Test Scenario 9: Template Rendering](#test-scenario-9-template-rendering)
11. [Test Scenario 10: Error Handling](#test-scenario-10-error-handling)
12. [Visual Inspection Checklist](#visual-inspection-checklist)
13. [Integration Verification](#integration-verification)
14. [Known Issues & Limitations](#known-issues--limitations)

---

## Prerequisites & Setup

### Before Testing

1. **Build the extension**
   ```bash
   cd /home/matt/Idea-dreams/scope-shield
   npm run build
   ```

2. **Load unpacked extension in Chrome**
   - Open `chrome://extensions/`
   - Enable "Developer mode" (top right)
   - Click "Load unpacked"
   - Select `/home/matt/Idea-dreams/scope-shield/dist`

3. **Open Chrome DevTools**
   - Right-click extension popup → Inspect
   - Keep Console tab open to monitor logs

4. **Clear existing data (fresh start)**
   - Open popup
   - Chrome DevTools Console:
   ```javascript
   chrome.storage.local.clear()
   ```
   - Reload extension

### Test Data Setup

You'll need **simulated detection events** in chrome.storage.local. Use DevTools Console:

```javascript
// Add test detection events
const testDetections = [
  {
    id: 'det-001',
    sender: 'client1@example.com',
    senderName: 'Alice Johnson',
    detectedText: 'Can you also add a dark mode feature?',
    triggerWord: 'also',
    triggerWeight: 8,
    timestamp: Date.now() - 3600000, // 1 hour ago
    acknowledged: false,
    url: 'https://mail.google.com'
  },
  {
    id: 'det-002',
    sender: 'client1@example.com',
    senderName: 'Alice Johnson',
    detectedText: 'Could you implement user authentication with OAuth?',
    triggerWord: 'could',
    triggerWeight: 7,
    timestamp: Date.now() - 7200000, // 2 hours ago
    acknowledged: false,
    url: 'https://mail.google.com'
  },
  {
    id: 'det-003',
    sender: 'client2@example.com',
    senderName: 'Bob Smith',
    detectedText: 'Would it be possible to add mobile responsiveness?',
    triggerWord: 'would',
    triggerWeight: 9,
    timestamp: Date.now() - 1800000, // 30 mins ago
    acknowledged: false,
    url: 'https://mail.google.com'
  }
];

chrome.storage.local.set({ detectionEvents: testDetections }, () => {
  console.log('Test detections added');
});
```

### Configure Freelancer Settings

In popup → Settings tab:
- **Freelancer Name**: "John Developer"
- **Hourly Rate**: 150 (optional)
- Click "Save Settings"

---

## Test Scenario 1: Single Detection Change Order

**Objective**: Generate change order from a single scope creep detection

### Steps

1. **Inject single detection** (DevTools Console):
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
   });
   ```

2. **Reload popup** (close and reopen)

3. **Verify detection appears**
   - Check: Detections tab shows "1" total detection
   - Check: Unacknowledged shows "1"
   - Check: Detection item displays correctly

4. **Click "Generate Change Order" button**

5. **Observe behavior**
   - Multi-item selector should **NOT appear** (only 1 detection)
   - Toast notification: "Generating change order..."
   - Change order document should render below

### Expected Results

✅ **Change Order Document Visible**
- Header shows "Change Order" title
- Document number: "#001" (first order)
- Date: Today's date (e.g., "November 12, 2025")
- Client: "Solo Client"
- Freelancer: "John Developer"

✅ **Sections Present**
1. **Original Scope Agreement**: Empty or placeholder (first-time client)
2. **Requested Changes**: "Can you add a user dashboard with analytics?" (bulleted list)
3. **Cost Impact**: "$XXX" (placeholder)
4. **Revised Timeline**: Empty or "To be determined"
5. **Payment Terms**: "Net 30"
6. **Additional Notes**: "No additional notes"
7. **Signatures**: Client and Freelancer signature lines

✅ **Console Logs** (check DevTools):
```
[ScopeShield] Starting change order generation { totalDetections: 1 }
[ChangeOrderService.generate] Starting generation { eventCount: 1 }
[ChangeOrderHistory.save] Change order saved { clientEmail: 'solo@client.com', changeOrderId: '...', totalOrders: 1 }
[TemplateEngine.render] Render complete { duration: '...ms' }
[ScopeShield] Change order generated successfully { changeOrderId: '...', changeOrderNumber: '#001' }
```

✅ **Performance**
- Generation time: **<5 seconds**
- Check console for performance warning if >5s

✅ **Detection Acknowledged**
- Detection item shows "acknowledged" styling (grayed out)
- Unacknowledged count decreases to 0

### Pass/Fail Criteria

- [ ] Single detection generates without multi-item selector
- [ ] Change order number is #001
- [ ] All 7 sections are present and formatted
- [ ] Client name extracted correctly
- [ ] Freelancer name from settings appears
- [ ] Generation completes in <5s
- [ ] Detection marked as acknowledged
- [ ] No errors in console

**Result**: ☐ PASS  ☐ FAIL

**Notes**: _______________________________________________

---

## Test Scenario 2: Multi-Item Bundling (2-5 Detections)

**Objective**: Verify multi-item selector for bundling multiple detections

### Steps

1. **Inject multiple detections** (DevTools Console):
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
         timestamp: Date.now() - 3600000,
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
         timestamp: Date.now() - 7200000,
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
         timestamp: Date.now() - 1800000,
         acknowledged: false,
         url: 'https://mail.google.com'
       }
     ]
   });
   ```

2. **Reload popup**

3. **Verify 3 detections appear**
   - Total: 3
   - Unacknowledged: 3

4. **Click "Generate Change Order"**

### Expected Results: Multi-Item Selector

✅ **Modal Dialog Appears**
- Title: "Select Detections to Include"
- Subtitle explains bundling
- Dark overlay (rgba(0, 0, 0, 0.5))

✅ **Multi-Item Selector Visible**
- All 3 detections listed with checkboxes
- Each item shows:
  - Checkbox (checked by default)
  - Client name: "Multi Client"
  - Timestamp (formatted)
  - Detection text (truncated if >100 chars)

✅ **Controls Present**
- "Select All (3)" button
- "Deselect All" button
- Selection count: "**3** of 3 items selected"

### Steps Continued

5. **Test "Deselect All" button**
   - Click button
   - All checkboxes uncheck
   - Selection count: "**0** of 3 items selected"

6. **Test "Select All" button**
   - Click button
   - All checkboxes check
   - Selection count: "**3** of 3 items selected"

7. **Manually deselect 1 item** (uncheck middle checkbox)
   - Selection count: "**2** of 3 items selected"

8. **Click "Cancel" button**
   - Modal closes
   - No change order generated
   - Detections remain unacknowledged

9. **Repeat**: Click "Generate Change Order" again

10. **Deselect 1 item, click "Generate Change Order" button**

### Expected Results: Generated Change Order

✅ **Change Order Generated**
- Number: "#001"
- Client: "Multi Client"
- Requested Changes section shows **2 bullet points**:
  - "Add dark mode support"
  - "Add mobile responsiveness"
- 3rd item ("Implement user authentication") **NOT included**

✅ **Only Selected Detections Acknowledged**
- 2 detections marked acknowledged
- 1 detection remains unacknowledged
- Unacknowledged count: 1

### Pass/Fail Criteria

- [ ] Multi-item selector appears for 2+ detections
- [ ] All checkboxes start checked by default
- [ ] "Select All" / "Deselect All" work correctly
- [ ] Individual checkbox toggle updates selection count
- [ ] Cancel button closes without generating
- [ ] Generate button creates change order with selected items only
- [ ] Requested Changes section lists all selected items as bullets
- [ ] Only selected detections marked as acknowledged
- [ ] Modal styling correct (overlay, centered, scrollable)

**Result**: ☐ PASS  ☐ FAIL

**Notes**: _______________________________________________

---

## Test Scenario 3: First-Time Client (No History)

**Objective**: Verify empty original scope for new clients

### Steps

1. **Clear all storage**
   ```javascript
   chrome.storage.local.clear()
   ```

2. **Inject detection from new client**
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
   });
   ```

3. **Set freelancer name in Settings**

4. **Generate change order**

### Expected Results

✅ **Original Scope Section**
- Text: "No original scope defined" (placeholder)
- **NOT pre-filled** (first-time client)

✅ **Change Order Number**
- "#001" (first order for this client)

✅ **All Other Fields Populated**
- Client name, freelancer name, date, requested changes

### Pass/Fail Criteria

- [ ] Original scope is empty/placeholder for first-time client
- [ ] Change order number starts at #001
- [ ] No errors generating for new client

**Result**: ☐ PASS  ☐ FAIL

**Notes**: _______________________________________________

---

## Test Scenario 4: Repeat Client (Scope Pre-fill)

**Objective**: Verify original scope pre-fills from history

### Prerequisites

**Must run Test Scenario 3 first** to create initial change order

### Steps

1. **Manually add original scope to first order** (simulate filled scope):
   ```javascript
   chrome.storage.local.get('scopeshield_changeorder_history_v1', (result) => {
     const history = result.scopeshield_changeorder_history_v1 || {};
     const clientOrders = history['newclient@example.com'] || [];

     if (clientOrders.length > 0) {
       clientOrders[0].originalScope = 'Build a web application with user management and basic CRUD operations';
       history['newclient@example.com'] = clientOrders;

       chrome.storage.local.set({ scopeshield_changeorder_history_v1: history }, () => {
         console.log('Original scope added to history');
       });
     }
   });
   ```

2. **Inject 2nd detection from same client**
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
     chrome.storage.local.set({ detectionEvents: events });
   });
   ```

3. **Reload popup**

4. **Generate change order**

### Expected Results

✅ **Original Scope Pre-filled**
- Text: "Build a web application with user management and basic CRUD operations"
- **Automatically loaded** from client's last change order

✅ **Change Order Number Incremented**
- "#002" (second order for this client)

✅ **Console Log Confirms Pre-fill**
```
[ChangeOrderService._loadOriginalScope] Pre-filled from history { clientEmail: 'newclient@example.com', lastOrderId: '...' }
```

### Pass/Fail Criteria

- [ ] Original scope pre-fills from last order
- [ ] Change order number increments to #002
- [ ] Console confirms pre-fill from history
- [ ] No errors in console

**Result**: ☐ PASS  ☐ FAIL

**Notes**: _______________________________________________

---

## Test Scenario 5: Sequential Numbering

**Objective**: Verify change order numbers increment correctly per client

### Steps

1. **Clear storage, set up 2 clients with history**
   ```javascript
   chrome.storage.local.set({
     scopeshield_changeorder_history_v1: {
       'client1@example.com': [
         { id: 'co-1', changeOrderNumber: '#001', clientEmail: 'client1@example.com', dateCreated: new Date().toISOString() },
         { id: 'co-2', changeOrderNumber: '#002', clientEmail: 'client1@example.com', dateCreated: new Date().toISOString() }
       ],
       'client2@example.com': [
         { id: 'co-3', changeOrderNumber: '#001', clientEmail: 'client2@example.com', dateCreated: new Date().toISOString() }
       ]
     }
   });
   ```

2. **Inject detections from both clients**
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
   });
   ```

3. **Generate change order for Client One** (first detection)

4. **Verify change order number**: Should be **#003**

5. **Generate change order for Client Two** (second detection)

6. **Verify change order number**: Should be **#002**

### Expected Results

✅ **Client One Numbering**
- History: #001, #002
- New order: **#003** ✅

✅ **Client Two Numbering**
- History: #001
- New order: **#002** ✅

✅ **Numbering is Per-Client**
- Different clients maintain separate sequences
- Numbers don't conflict

### Pass/Fail Criteria

- [ ] Client 1 gets #003 (continues from #002)
- [ ] Client 2 gets #002 (continues from #001)
- [ ] Numbering is independent per client
- [ ] Zero-padding consistent (3 digits: #001, #002, #003)

**Result**: ☐ PASS  ☐ FAIL

**Notes**: _______________________________________________

---

## Test Scenario 6: Long Text Truncation

**Objective**: Verify text >500 chars truncates to 200 chars + "..."

### Steps

1. **Inject detection with very long text**
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
   });
   ```

2. **Generate change order**

3. **Inspect Requested Changes section**

### Expected Results

✅ **Text Truncated**
- Original length: 600 chars
- Displayed length: **203 chars** (200 + "...")
- Ends with "..."

✅ **Console Log**
```
[ChangeOrderService._extractRequestedChanges] Text truncated { originalLength: 600, truncatedLength: 203 }
```

### Test with Boundary Values

**Test 1: Exactly 500 chars (boundary)**
```javascript
chrome.storage.local.set({
  detectionEvents: [{
    id: 'boundary-500',
    sender: 'test@client.com',
    senderName: 'Boundary Client',
    detectedText: 'B'.repeat(500), // Exactly 500
    triggerWord: 'test',
    triggerWeight: 8,
    timestamp: Date.now(),
    acknowledged: false,
    url: 'https://mail.google.com'
  }]
});
```
- **Expected**: NO truncation (≤500 is allowed)

**Test 2: 501 chars (just over boundary)**
```javascript
// Change 500 to 501 in above code
```
- **Expected**: Truncates to 200 + "..."

### Pass/Fail Criteria

- [ ] Text >500 chars truncates to 200 + "..."
- [ ] Text ≤500 chars does NOT truncate
- [ ] Console logs truncation event
- [ ] Truncated text still readable (ends at word boundary ideally)

**Result**: ☐ PASS  ☐ FAIL

**Notes**: _______________________________________________

---

## Test Scenario 7: Missing Freelancer Name

**Objective**: Verify placeholder when freelancer name not set

### Steps

1. **Clear settings**
   ```javascript
   chrome.storage.local.remove('scopeshield_settings_v1')
   ```

2. **Inject detection**
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
   });
   ```

3. **Generate change order WITHOUT setting freelancer name**

### Expected Results

✅ **Freelancer Name Placeholder**
- Header shows: "Your Name" (placeholder)
- Signature section shows: "Your Name"

✅ **No Errors**
- Generation completes successfully
- Console has no errors

### Steps Continued

4. **Go to Settings tab**

5. **Set freelancer name**: "Jane Developer"

6. **Generate another change order**

### Expected Results After Setting

✅ **Freelancer Name Updated**
- Header shows: "Jane Developer"
- Signature section shows: "Jane Developer"

### Pass/Fail Criteria

- [ ] Missing freelancer name shows "Your Name" placeholder
- [ ] No errors when freelancer name is missing
- [ ] After setting name, subsequent orders use real name
- [ ] Name persists across popup reopens

**Result**: ☐ PASS  ☐ FAIL

**Notes**: _______________________________________________

---

## Test Scenario 8: Performance Validation

**Objective**: Verify generation completes within 5s threshold

### Steps

1. **Inject 1 simple detection**

2. **Open DevTools Console**

3. **Click "Generate Change Order"**

4. **Monitor console for performance logs**

### Expected Results

✅ **Performance Log Present**
```
[ChangeOrderService.generate] Generation complete { duration: '...ms' }
[TemplateEngine.render] Render complete { duration: '...ms' }
```

✅ **Generation Time <5 seconds**
- Total duration: **<5000ms**
- Typical: 200-800ms

✅ **NO Performance Warning**
- If >5s, console shows:
```
[ChangeOrderService.generate] Generation exceeded 5s threshold { duration: '...ms', threshold: '5000ms' }
```

### Test with Heavy Load

**Inject 10 detections, select all, generate**

Expected:
- Still completes in <5s
- Performance degrades gracefully

### Pass/Fail Criteria

- [ ] Single detection: <1 second
- [ ] 10 detections: <5 seconds
- [ ] Performance logs appear in console
- [ ] No performance warnings for normal use

**Result**: ☐ PASS  ☐ FAIL

**Notes**: _______________________________________________

---

## Test Scenario 9: Template Rendering

**Objective**: Verify template renders all sections correctly

### Steps

1. **Generate complete change order** (with all fields)

2. **Inspect rendered HTML** (DevTools Elements tab)

3. **Verify structure**

### Expected Results

✅ **7 Sections Present**

**1. Header Section**
```html
<header class="document-header">
  <h1 class="document-title">Change Order</h1>
  <div class="document-number">#001</div>
  <div class="document-meta">
    <!-- Date, Client, Freelancer -->
  </div>
</header>
```

**2. Original Scope Agreement**
```html
<section class="section">
  <h2 class="section-heading">1. Original Scope Agreement</h2>
  <div class="section-content">
    <p>[Scope text or placeholder]</p>
  </div>
</section>
```

**3. Requested Changes** (as bulleted list)
```html
<section class="section">
  <h2 class="section-heading">2. Requested Changes</h2>
  <div class="section-content">
    <ul>
      <li>First change</li>
      <li>Second change</li>
    </ul>
  </div>
</section>
```

**4. Cost Impact**
```html
<section class="section">
  <h2 class="section-heading">3. Cost Impact</h2>
  <div class="section-content">
    <p><strong>Additional Cost:</strong> $XXX</p>
  </div>
</section>
```

**5. Revised Timeline**
```html
<section class="section">
  <h2 class="section-heading">4. Revised Timeline</h2>
  <div class="section-content">
    <p>[Timeline text or "To be determined"]</p>
  </div>
</section>
```

**6. Payment Terms**
```html
<section class="section">
  <h2 class="section-heading">5. Payment Terms</h2>
  <div class="section-content">
    <p>Net 30</p>
  </div>
</section>
```

**7. Signatures**
```html
<section class="section">
  <h2 class="section-heading">7. Signatures</h2>
  <div class="signatures">
    <div class="signature-block">
      <!-- Client signature line -->
    </div>
    <div class="signature-block">
      <!-- Freelancer signature line -->
    </div>
  </div>
</section>
```

### Visual Verification

✅ **Typography**
- Body text: 14-16px
- Headings: 18-24px (section headings larger than body)
- Line spacing: 1.5

✅ **Layout**
- Centered document (max-width: 850px)
- Adequate margins (72px/1 inch)
- Professional appearance

✅ **Colors**
- Headers: Dark gray (#111827)
- Body text: Medium gray (#374151)
- Borders: Light gray (#e5e7eb)

### Pass/Fail Criteria

- [ ] All 7 sections render correctly
- [ ] Sections numbered 1-7
- [ ] Bulleted list for requested changes (not plain text)
- [ ] Typography matches spec (14-16px body, 18-24px headings)
- [ ] Professional appearance (clean, readable)
- [ ] No rendering errors (broken layout, missing sections)

**Result**: ☐ PASS  ☐ FAIL

**Notes**: _______________________________________________

---

## Test Scenario 10: Error Handling

**Objective**: Verify graceful error handling

### Test 10.1: Invalid Detection Event

**Steps**:
1. Inject malformed detection (missing required fields)
   ```javascript
   chrome.storage.local.set({
     detectionEvents: [{
       id: 'invalid-001',
       // Missing sender field
       detectedText: 'Test',
       timestamp: Date.now(),
       acknowledged: false
     }]
   });
   ```

2. Generate change order

**Expected**:
- Generates with placeholders ("Client", "unknown@client.com")
- No crash
- Console may show warning

### Test 10.2: Storage Quota Exceeded

**Steps**:
1. Fill storage near quota (simulate)
2. Generate change order

**Expected**:
- Error notification: "Storage quota exceeded..."
- Console error logged
- UI remains functional

### Test 10.3: Template Load Failure

**Steps**:
1. Check DevTools Network tab
2. Verify professional-v1.html loads

**Expected**:
- Template loads successfully (200 OK)
- If fails: Error message shown

### Pass/Fail Criteria

- [ ] Malformed data doesn't crash extension
- [ ] Placeholders used for missing data
- [ ] Storage errors handled gracefully
- [ ] Template load errors caught and logged

**Result**: ☐ PASS  ☐ FAIL

**Notes**: _______________________________________________

---

## Visual Inspection Checklist

**Open generated change order, verify visually:**

### Document Structure
- [ ] Header centered with clear title "Change Order"
- [ ] Change order number prominent (#001, #002, etc.)
- [ ] Date, client, freelancer names aligned/formatted
- [ ] 7 sections clearly delineated
- [ ] Section headings stand out (larger, bold)

### Typography
- [ ] Body text readable (14-16px)
- [ ] Headings larger than body (18-24px)
- [ ] Line spacing adequate (1.5)
- [ ] Font: Sans-serif (system font)

### Spacing
- [ ] Adequate margins around document (1 inch / 72px)
- [ ] Spacing between sections (36px)
- [ ] Spacing within sections (12px)
- [ ] Signature blocks separated (48px gap)

### Lists
- [ ] Requested changes as bulleted list (not plain text)
- [ ] Bullet points visible (disc style)
- [ ] List items indented (24px)
- [ ] List spacing (8px between items)

### Colors
- [ ] Headers: Dark (#111827)
- [ ] Body: Medium gray (#374151)
- [ ] Borders: Light gray (#e5e7eb)
- [ ] No harsh black text (use grays)

### Professional Appearance
- [ ] Clean, modern design
- [ ] Print-ready (looks good when printed)
- [ ] No broken layout
- [ ] No overlapping text
- [ ] No missing sections

**Overall Visual Rating**: ☐ Excellent  ☐ Good  ☐ Fair  ☐ Poor

**Notes**: _______________________________________________

---

## Integration Verification

### Verify End-to-End Flow

**Steps**:

1. **Start with clean state**
   - Clear storage
   - Set freelancer name in Settings

2. **Inject 3 detections from same client**

3. **Generate first change order**
   - Verify multi-item selector appears
   - Select 2 items
   - Generate

4. **Verify:**
   - [ ] Change order #001 created
   - [ ] 2 items in requested changes
   - [ ] 2 detections acknowledged
   - [ ] 1 detection remains unacknowledged
   - [ ] Change order saved to history

5. **Generate second change order** (from remaining detection)
   - Verify single detection flow (no selector)
   - Generate

6. **Verify:**
   - [ ] Change order #002 created
   - [ ] Original scope pre-filled from #001
   - [ ] Sequential numbering works
   - [ ] All detections now acknowledged
   - [ ] 2 orders in history for client

### Storage Verification

**Check chrome.storage.local**:

```javascript
chrome.storage.local.get(null, (result) => {
  console.log('All storage:', result);
});
```

✅ **Verify Keys Present**:
- `scopeshield_settings_v1` (freelancer settings)
- `scopeshield_changeorder_history_v1` (change order history)
- `detectionEvents` (detection events)

✅ **Verify History Structure**:
```javascript
{
  "scopeshield_changeorder_history_v1": {
    "client@example.com": [
      {
        "id": "...",
        "changeOrderNumber": "#001",
        "clientName": "Client Name",
        "clientEmail": "client@example.com",
        "freelancerName": "John Developer",
        "dateCreated": "November 12, 2025",
        "originalScope": "...",
        "requestedChanges": ["...", "..."],
        "costEstimate": "$XXX",
        "revisedTimeline": "",
        "paymentTerms": "Net 30",
        "additionalNotes": "",
        "status": "generated",
        "exportedAt": null,
        "exportFormat": null
      },
      // ... up to 50 orders per client
    ]
  }
}
```

### Pass/Fail Criteria

- [ ] Complete flow works start-to-finish
- [ ] Multi-item and single-item flows both work
- [ ] Sequential numbering persists
- [ ] History pre-fill works
- [ ] Storage structure correct
- [ ] No data loss between steps

**Result**: ☐ PASS  ☐ FAIL

**Notes**: _______________________________________________

---

## Known Issues & Limitations

### Current Phase 3 Limitations

1. **No Edit Functionality** (Phase 4)
   - Change order fields are read-only
   - Cannot edit cost estimate, timeline, payment terms inline
   - Pricing calculator widget not yet implemented

2. **No Export Options** (Phase 5)
   - Cannot export to PDF
   - Cannot copy to clipboard
   - Cannot export as text
   - No auto-export timer

3. **Test Coverage**
   - ✅ Unit tests complete (124 tests passing)
   - ✅ All services tested (ChangeOrderHistory, ChangeOrderNumbering, ChangeOrderService)
   - ✅ TemplateEngine fully tested (19 tests)
   - ❌ No automated integration tests yet
   - Manual verification still required for UI/UX

4. **No History View** (Phase 7)
   - Cannot view past change orders
   - Cannot search history
   - Cannot delete old orders

### Expected Behaviors

✅ **Normal**:
- Placeholder values for missing data ("Your Name", "$XXX")
- Empty original scope for first-time clients
- Detections marked acknowledged after generation

✅ **By Design**:
- Template cached after first load (performance)
- FIFO deletion after 50 orders per client (storage management)
- Sequential numbering per client (not global)

---

## Test Results Summary

**Date**: _______________
**Tester**: _______________
**Build Version**: _______________

| Test Scenario | Pass/Fail | Critical Issues | Notes |
|---------------|-----------|-----------------|-------|
| 1. Single Detection | ☐ PASS ☐ FAIL | | |
| 2. Multi-Item Bundling | ☐ PASS ☐ FAIL | | |
| 3. First-Time Client | ☐ PASS ☐ FAIL | | |
| 4. Repeat Client | ☐ PASS ☐ FAIL | | |
| 5. Sequential Numbering | ☐ PASS ☐ FAIL | | |
| 6. Long Text Truncation | ☐ PASS ☐ FAIL | | |
| 7. Missing Freelancer | ☐ PASS ☐ FAIL | | |
| 8. Performance | ☐ PASS ☐ FAIL | | |
| 9. Template Rendering | ☐ PASS ☐ FAIL | | |
| 10. Error Handling | ☐ PASS ☐ FAIL | | |
| Visual Inspection | ☐ PASS ☐ FAIL | | |
| Integration | ☐ PASS ☐ FAIL | | |

**Overall Phase 3 Status**: ☐ READY TO SHIP  ☐ ISSUES FOUND  ☐ BLOCKED

**Critical Issues Found**: _______________

**Recommendations**: _______________

---

## Next Steps After Testing

### If All Tests Pass ✅
- [ ] Proceed to Phase 4: Pricing Calculator Widget
- [ ] Create automated integration tests (e.g., Puppeteer/Playwright)
- [ ] Consider adding E2E tests for full user workflows

### If Issues Found ❌
- [ ] Document issues in GitHub Issues or Linear
- [ ] Prioritize: CRITICAL → HIGH → MEDIUM → LOW
- [ ] Fix critical issues before proceeding
- [ ] Re-test after fixes

---

**End of Manual Testing Guide**
