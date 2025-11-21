# ScopeShield User Guide

**Welcome to ScopeShield!** This guide will help you get started protecting yourself from scope creep.

---

## What is ScopeShield?

ScopeShield automatically watches your Gmail for clients requesting work outside your original agreement (scope creep), and helps you generate professional change orders to get paid for that extra work.

**In 3 seconds**: Detects scope creep → Alerts you → Generates billable change order

---

## Quick Start (First-Time Setup)

### Step 1: Install the Extension
1. Install ScopeShield from Chrome Web Store
2. Click the ScopeShield icon in your Chrome toolbar
3. **Welcome screen appears** - Enter your name (this appears on change orders)
4. Click "Get Started"

**✅ You're done!** The extension is now monitoring Gmail for scope creep.

### Step 2: Open Gmail
1. Navigate to `mail.google.com`
2. Open any email from a client
3. ScopeShield is now watching for scope creep phrases

**That's it!** You're protected.

---

## How It Works

### 1. Automatic Detection

ScopeShield scans emails for common scope creep phrases:
- "Also, can you..."
- "While you're at it..."
- "One more thing..."
- "Quick favor..."
- "I forgot to mention..."
- "Actually, instead of..."
- And 40+ more patterns

### 2. Visual Alerts

When scope creep is detected:
- **Yellow highlight** appears on the trigger phrase in Gmail
- **Browser notification** pops up: "ScopeShield: Scope creep detected"
- **Extension badge** shows count (number on icon)

### 3. Generate Change Order

1. Click the ScopeShield icon
2. See list of detected scope creep items
3. Click "Generate Change Order"
4. Review the pre-filled professional document
5. Edit cost estimate, timeline, payment terms
6. Export as PDF, copy to clipboard, or export as text

### 4. Send to Client

Paste into email or attach PDF:
> "Hi [Client], Per our conversation, the requested changes are outside our original scope. Attached is a change order for $XXX. Please review and let me know if you'd like to proceed."

---

## Features Explained

### Detection

**What it detects**: Requests for work outside your original agreement
**Where it works**: Gmail only (Slack coming later)
**Accuracy**: ~75% (catches most scope creep, some false alarms)

**Customize detection**:
- Settings → Confidence threshold → Choose "All", "Medium", or "High"
- Higher threshold = fewer false alarms, may miss subtle scope creep
- Lower threshold = catches everything, more false alarms

### Change Order Generator

**One-click professional documents** with:
- Your name (auto-filled from settings)
- Client name (extracted from email)
- Original scope summary
- Requested changes (from detected text)
- Cost estimate (use pricing calculator)
- Revised timeline
- Payment terms (default: "Net 30")

**Edit anything**: Click any field to edit inline

**Pricing Calculator**:
1. Click in "Cost Estimate" field
2. Click calculator icon
3. Enter: Hourly rate × Hours
4. Calculator suggests cost
5. Accept or override

**Export options**:
- **PDF**: Professional document for email attachment
- **Clipboard**: Copy formatted text to paste in email
- **Text**: Plain text for Slack/messaging apps

### Auto-Export (Time-Saver!)

**Enabled by default** - automatically exports after you edit:
1. Generate change order
2. Make your edits (cost, timeline, etc.)
3. Countdown appears: "Auto-exporting in 5...4...3..."
4. Automatically copies to clipboard OR downloads PDF
5. Click anywhere to cancel countdown

**Configure**:
- Settings → Auto-export delay → Choose 1-10 seconds
- Settings → Default export method → Choose PDF/Clipboard/Text

### Draft Persistence

**Never lose your work**:
- Extension auto-saves change orders every 30 seconds
- Close popup mid-edit → draft saved
- Reopen popup → "Resume Draft" button appears
- Drafts expire after 7 days (auto-deleted)

---

## Common Questions (FAQ)

### "Why isn't scope creep detected?"

**Possible reasons**:
1. **Email doesn't contain trigger words** - Detection needs phrases like "also", "can you also", etc.
2. **Confidence threshold too high** - Settings → Lower threshold to "Medium" or "All"
3. **Gmail not refreshed** - Refresh Gmail page after installing extension
4. **Detection disabled** - Settings → Check "Highlight detected text" is enabled

**Test detection**: Have a friend send you an email with "Also, can you add user authentication?" - should be highlighted in yellow.

### "How do I know it's working?"

**Signs it's working**:
- ✅ Extension icon shows count badge (e.g., "3")
- ✅ Yellow highlights appear in Gmail emails
- ✅ Browser notifications pop up when scope creep found
- ✅ Detections list in popup shows items

**How to test**:
1. Open Gmail
2. Search for old emails with "also can you"
3. Yellow highlighting should appear
4. If not → check Settings → ensure detection enabled

### "What if I don't know my hourly rate?"

**Hourly rate is OPTIONAL**:
- Pricing calculator won't work without it
- But you can still generate change orders
- Just manually type your cost estimate (e.g., "$500")
- Skip calculator, enter cost directly

**Average freelance rates** (for reference):
- Junior: $50-75/hour
- Mid-level: $75-125/hour
- Senior: $125-250/hour
- Expert: $250-500/hour

### "Is my data safe?"

**YES - 100% privacy-first**:
- ✅ Everything stays in YOUR browser (chrome.storage.local)
- ✅ ZERO data sent to external servers
- ✅ NO analytics, tracking, or cookies
- ✅ NO backend - we have no servers!
- ✅ Open source - verify yourself: [GitHub](https://github.com/mmtuentertainment/scope-shield)

See [PRIVACY.md](../PRIVACY.md) for full policy.

### "Can I customize trigger words?"

**Not in v1.0** (coming in future update):
- Current version uses 50+ pre-defined patterns
- Based on research of common scope creep phrases
- ~75% accuracy

**Workaround**: Use manual change order button (always visible) to create change orders for any email, even if not detected.

### "Does it work on Slack/Outlook/other platforms?"

**Gmail only for v1.0**:
- Slack support planned for v2.0 (after 100 users)
- Outlook planned for v3.0
- Focus on Gmail first (most freelancers use it)

### "Why did I get a false alarm?"

**False positives happen** (~25% of alerts):
- Detection is keyword-based (no AI yet)
- Phrases like "Also, thank you..." may trigger
- Higher confidence threshold reduces false alarms

**Acknowledge false alarms**: Click checkmark (✓) button on detection item to dismiss.

### "How do I export all my change orders?"

**Export history**:
1. Settings → Scroll to bottom
2. Click "Export History" (coming in v1.1)
3. Download CSV with all change orders

**Current workaround**: Generate change orders one at a time, save PDFs to folder.

### "Can I delete all detection history?"

**Yes**:
1. Click ScopeShield icon
2. Click "Clear All" button
3. Confirm deletion
4. All detection history deleted (cannot undo)

**Partial deletion**: Click (✓) button on individual items to acknowledge/hide them.

---

## Troubleshooting

### Problem: "No detections showing"

**Solutions**:
1. ✅ Open Gmail (`mail.google.com`)
2. ✅ Check extension is enabled (chrome://extensions)
3. ✅ Look for trigger words ("also can you", "one more thing")
4. ✅ Lower confidence threshold (Settings → "All" or "Medium")
5. ✅ Refresh Gmail page
6. ✅ Check Settings → "Highlight detected text" is checked

### Problem: "Highlighting not appearing"

**Solutions**:
1. ✅ Refresh Gmail page (Ctrl+R or Cmd+R)
2. ✅ Check dark mode - yellow highlight works in both light and dark
3. ✅ Verify no CSS conflicts (disable other Gmail extensions temporarily)
4. ✅ Settings → Check "Highlight detected text" enabled
5. ✅ Settings → Confidence threshold not set to "High" (may miss detections)

### Problem: "Change order generation fails"

**Solutions**:
1. ✅ Enter your name in Settings (required!)
2. ✅ Check Settings → Verify freelancer name is saved
3. ✅ Try manual change order (always visible button)
4. ✅ Check console (F12) for errors

### Problem: "PDF export fails"

**Solutions**:
1. ✅ Use "Export as Text" instead (fallback option)
2. ✅ Check browser download permissions (chrome://settings/content)
3. ✅ Try clipboard export, paste into Word, save as PDF
4. ✅ Check console (F12) for jsPDF errors

### Problem: "Clipboard copy denied"

**Solutions**:
1. ✅ Click "Select All" button (appears automatically on clipboard failure)
2. ✅ Grant clipboard permissions in Chrome settings
3. ✅ Manual copy: Select text with mouse, Ctrl+C (or Cmd+C)

### Problem: "Extension icon not showing"

**Solutions**:
1. ✅ Pin extension: Click puzzle piece icon, pin ScopeShield
2. ✅ Restart Chrome
3. ✅ Check chrome://extensions → ScopeShield is enabled

### Problem: "Storage quota exceeded"

**Solutions**:
1. ✅ Export to CSV (notification appears with export button)
2. ✅ Click "Clear All" to delete old detections
3. ✅ Acknowledge old items (click ✓) to archive them
4. ✅ Extension holds ~1,000 detection events before filling storage

---

## Advanced Features

### Manual Change Order

**Use case**: Create change order without automatic detection
1. Click ScopeShield icon
2. Click "Manual Change Order" button (always visible)
3. Fill out all fields manually
4. Export normally

**When to use**:
- Scope creep wasn't detected automatically
- Creating change order for phone call discussion
- Bundling multiple small requests

### Settings Explained

**Profile Information**:
- **Freelancer name** (required): Appears on change orders
- **Hourly rate** (optional): Used by pricing calculator

**Detection Settings**:
- **Show browser notifications**: Pop-ups when scope creep detected
- **Highlight detected text**: Yellow highlighting in Gmail
- **Confidence threshold**: Sensitivity (All/Medium/High)

**Visual Settings**:
- **Highlight color**: Customize highlight color (default: yellow)
- **Highlight opacity**: Adjust transparency (default: 80%)

**Export Settings**:
- **Default export method**: PDF, Clipboard, or Text
- **Auto-export enabled**: Automatic export after editing
- **Auto-export delay**: Countdown time (1-10 seconds)

---

## Tips & Best Practices

### Tip 1: Configure Your Rate

Even if you don't use the pricing calculator, having your hourly rate saved makes quoting faster. You can always override the suggestion.

### Tip 2: Lower Threshold at First

Start with "All" or "Medium" confidence to see all detections. Once you understand what triggers, raise to "High" to reduce noise.

### Tip 3: Review Before Sending

Always review generated change orders before sending. Edit:
- Cost estimate (realistic pricing)
- Timeline (buffer time for unknowns)
- Payment terms (50% upfront recommended for scope changes)

### Tip 4: Acknowledge False Alarms

Click ✓ to dismiss detections that aren't scope creep. Keeps your list clean and badge count accurate.

### Tip 5: Use Manual Button for Catch-All

If you sense scope creep but it wasn't detected, use the Manual Change Order button. Trust your instincts!

---

## Keyboard Shortcuts

- **Ctrl+Shift+S** (or Cmd+Shift+S): Open ScopeShield popup
- **Esc**: Close modals
- **Tab**: Navigate form fields
- **Enter**: Submit forms

---

## Getting Help

### In the Extension
- Click "Help" button in popup → Opens this guide
- Click "Feedback" button → Report bugs or request features

### Documentation
- **This guide**: How to use ScopeShield
- **[README.md](../README.md)**: Project overview and technical details
- **[PRIVACY.md](../PRIVACY.md)**: Privacy policy (we collect ZERO data)
- **[Manual Testing Checklist](../MANUAL-TESTING.md)**: For developers testing extension

### Support
- **Bug reports**: [GitHub Issues](https://github.com/mmtuentertainment/scope-shield/issues)
- **Feature requests**: [GitHub Issues](https://github.com/mmtuentertainment/scope-shield/issues)
- **Source code**: [GitHub Repo](https://github.com/mmtuentertainment/scope-shield)

---

## What's Next?

**ScopeShield is free** and will always have a free tier.

**Planned features** (based on user feedback):
- Slack integration
- Custom trigger words
- Multi-template support
- Team collaboration
- Change order analytics

**Your feedback matters!** Tell us what you need: [Submit Feedback](https://github.com/mmtuentertainment/scope-shield/issues/new)

---

**Protect your scope. Get paid fairly. Use ScopeShield.**
