# ScopeShield

**Automatically detect scope creep and generate billable change orders for freelancers**

A Chrome extension that monitors Gmail and Slack for client requests that fall outside the original project scope, highlights them, and generates professional change order templates with one click.

## 🎯 Problem

52% of freelance projects experience scope creep. Freelancers lose thousands of dollars annually because they:
- Don't notice when clients request out-of-scope work
- Feel awkward pushing back on "small" requests
- Lack templates to professionally request additional payment

## ✨ Solution

ScopeShield acts as your scope creep watchdog:

1. **Paste your project scope** (contract, proposal, or brief)
2. **Read your emails/messages** normally
3. **Get alerted** when clients request out-of-scope work (yellow highlight + notification)
4. **Generate change order** with one click (pre-filled with client name, request details, cost estimate)
5. **Track revenue protected** in dashboard ("$3,500 scope creep prevented this month")

## 🚀 Features (MVP)

- ✅ **Scope Input**: Paste original project description on first use
- ✅ **Smart Detection**: Monitors Gmail/Slack for scope creep trigger words
- ✅ **Visual Alerts**: Yellow highlight + browser notification
- ✅ **Change Order Generator**: One-click template with pre-filled details
- ✅ **Dashboard**: Shows "Scope Creep Prevented: $X this month"

## 🔐 Privacy First

- **Zero data collection**: Nothing leaves your browser
- **No backend**: Runs 100% client-side using chrome.storage.local
- **No tracking**: No analytics, no telemetry
- **You own your data**: Export/delete anytime

## 🛠️ Tech Stack

- **Extension**: Chrome Manifest V3
- **Frontend**: HTML/CSS/JavaScript (vanilla)
- **Storage**: chrome.storage.local
- **Build**: Vite
- **Testing**: Vitest

## 📦 Installation (Development)

```bash
# Clone repository
git clone https://github.com/yourusername/scope-shield.git
cd scope-shield

# Install dependencies
npm install

# Build extension
npm run build

# Load in Chrome
# 1. Open chrome://extensions/
# 2. Enable "Developer mode"
# 3. Click "Load unpacked"
# 4. Select the `dist/` directory
```

## 🧪 Testing

```bash
npm test
```

## 📘 Usage Guide (Phase 9)

### First-Time Setup
1. Install extension (see Installation above)
2. Click ScopeShield icon in Chrome toolbar
3. Navigate to **Settings** tab
4. Enter your name (required)
5. Optionally set hourly rate for pricing calculator
6. Save settings

### Using Detection
1. Open Gmail in Chrome
2. Read client emails normally
3. When scope creep detected:
   - Yellow/orange highlighting appears on trigger phrases
   - Browser notification pops up
   - Extension badge shows detection count

### Generating Change Orders
1. Click ScopeShield icon
2. Review detected scope creep items in list
3. Select items to include (checkboxes)
4. Click "Generate Change Order"
5. Review generated document
6. Edit fields if needed (click to edit inline)
7. Export using one of three options:
   - **Copy to Clipboard** - Paste into email
   - **Export as PDF** - Download professional document
   - **Export as Text** - Plain text for Slack/messaging

### Auto-Export Feature
1. Enable in Settings: "Auto-export after editing"
2. Set delay (default: 5 seconds)
3. Choose default export method
4. When generating change orders:
   - Make your edits
   - Countdown appears (5...4...3...2...1)
   - Auto-exports using your default method
   - Click anywhere to cancel countdown

## 🔧 Troubleshooting

### No Detections Showing
- **Check Gmail is open** - Extension only works on mail.google.com
- **Verify extension is enabled** - Check chrome://extensions
- **Look for trigger words** - Detection requires specific phrases (see Detection Logic)
- **Check console** - Open DevTools (F12), look for [ScopeShield] logs

### Highlighting Not Appearing
- **Gmail UI changed** - Try refreshing page (Ctrl+R)
- **Check dark mode** - Yellow highlight works in both light/dark
- **Verify no CSS conflicts** - Disable other Gmail extensions temporarily

### Change Order Generation Slow
- **Target: <5 seconds** - If slower, check:
  - Too many detections? (50+ items may take longer)
  - Slow CPU? (check Task Manager)
  - Run benchmark: `node scripts/benchmark.js`

### PDF Export Fails
- **Fallback: Export as Text** - Use text export instead
- **Check browser permissions** - Allow downloads in chrome://settings/content
- **Console errors?** - Check DevTools for jsPDF errors

### Clipboard Copy Denied
- **Use Select All button** - Appears automatically on clipboard failure
- **Grant permissions** - Chrome may block clipboard access
- **Manual copy** - Select text and Ctrl+C

### Extension Icon Not Showing
- **Pin extension** - Click puzzle piece icon, pin ScopeShield
- **Restart Chrome** - Sometimes required after installation

### Storage Quota Exceeded
- **Export to CSV** - Notification appears with export button
- **Clear old detections** - Settings → Clear History
- **Target capacity** - 1,000 detection events (~500KB)

## 🎯 Performance Benchmarks

Run performance tests:
```bash
node scripts/benchmark.js
```

**Targets:**
- Generation: <5s for 50 detections
- PDF Export: <3s
- Clipboard: <500ms
- Bundle: <600KB

Check actual bundle size:
```bash
npm run build
du -sh dist/
```

## 📖 Development Workflow

This project follows **Spec-Driven Development (SDD)** using GitHub Spec-Kit:

1. Read [CLAUDE.md](CLAUDE.md) for development guidelines
2. Read [memory/constitution.md](memory/constitution.md) for governing principles
3. Follow Spec-Kit workflow for new features:
   - `/speckit.specify` - Create feature specification
   - `/speckit.clarify` - Resolve ambiguities
   - `/speckit.plan` - Generate implementation plan
   - `/speckit.tasks` - Break down into atomic tasks
   - `/speckit.implement` - Execute implementation

## 🎨 Detection Logic (Heuristic-Based)

**Trigger words/phrases**:
- "also", "additionally", "one more thing", "quick favor"
- "while you're at it", "can you also", "by the way"
- "I forgot to mention", "actually", "instead"
- New feature requests after initial scope defined
- Requests for additional revisions beyond agreed limit

**Target accuracy**: 70%+ for MVP (validated by competitor research)

## 📊 Success Metrics

- ✅ 70%+ detection accuracy (keyword-based heuristics)
- ✅ <5 seconds to generate change order
- ✅ Works on Gmail and Slack web
- ✅ <500ms detection latency (real-time)
- ✅ Chrome Web Store approved within 2 weeks

## 🗺️ Roadmap

### Phase 1 (Days 1-3) ✅ Current
- Extension setup + basic detection on Gmail

### Phase 2 (Days 4-6)
- Change order generator + dashboard

### Phase 3 (Days 7-8)
- Slack support + polish

### Phase 4 (Days 9-10)
- Testing + Chrome Web Store submission

### Post-MVP (After 100 Users)
- AI-powered detection (context-aware)
- Multiple change order templates
- Export history to CSV
- Cross-device sync (with consent)

## 🤝 Contributing

This project follows strict constitutional governance. Before contributing:

1. Read [memory/constitution.md](memory/constitution.md)
2. Ensure changes comply with all 8 core principles
3. Include Constitution Check in feature specifications
4. Write tests before implementation

## 📄 License

MIT

## 📧 Support

For issues or questions, please open a GitHub issue.

---

**Built with Spec-Driven Development** | [View Constitution](memory/constitution.md) | [Development Guide](CLAUDE.md)
