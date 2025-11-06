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
