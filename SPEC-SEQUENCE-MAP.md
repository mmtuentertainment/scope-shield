# ScopeShield Spec Sequence Map - Beach Money Blueprint

**Purpose**: Master roadmap showing complete spec sequence from current state to passive income
**Last Updated**: 2025-11-20
**Research-Informed**: 25 Tavily searches, 150+ sources, complete market validation

---

## Vision: Automated Passive Income Product

**NOT**: "Ship MVP, become full-time support engineer"
**YES**: "Product runs itself, makes money while you're on the beach"

---

## Execution Status

| Spec | Name | Status | Phase | Beach Money Impact |
|------|------|--------|-------|-------------------|
| **001** | Detection Engine | ✅ COMPLETE | Foundation | Enables core value prop |
| **002** | Change Order Generator | ✅ COMPLETE | Foundation | Monetization path |
| **003** | Pattern Expansion (18→50+) | 📋 NEXT | Quality | 75-85% accuracy (trust) |
| **004** | Accuracy Validation | 📋 PLANNED | Quality | Production confidence |
| **005** | Chrome Web Store Prep | 📋 PLANNED | Launch | Users can find it |
| **006** | Store Submission & Approval | 📋 PLANNED | Launch | Users can install |
| **007** | Error Monitoring (Sentry) | 📋 PLANNED | Automation | Self-healing |
| **008** | Usage Analytics | 📋 PLANNED | Automation | Data-driven decisions |
| **009** | Launch Campaign (PH, HN) | 📋 PLANNED | Marketing | User acquisition |
| **010** | SEO & Landing Page | 📋 PLANNED | Marketing | Organic discovery |
| **011** | User Onboarding Flow | 📋 PLANNED | Marketing | Retention |
| **012** | Remote Selector Config | 📋 PLANNED | Automation | Gmail-proof |
| **013** | Self-Service Support | 📋 PLANNED | Automation | Reduce support burden |
| **014** | E2E Test Automation | 📋 PLANNED | Automation | Regression prevention |
| **015** | Freemium Gates | 📋 PLANNED | Revenue | Upgrade prompts |
| **016** | Stripe Integration | 📋 PLANNED | Revenue | Payment processing |
| **017** | Retention Automation | 📋 PLANNED | Revenue | Churn prevention |
| **018** | Slack Bot Integration | 🔒 GATED | Expansion | Platform growth |
| **019** | Upwork Alerts Integration | 🔒 GATED | Expansion | Market expansion |
| **020** | AI Enhancement (BYOK) | 🔒 GATED | Expansion | Accuracy boost |

**Legend:**
- ✅ COMPLETE - Spec implemented, all phases done
- ⏳ IN PROGRESS - Spec active, some phases remaining
- 📋 NEXT/PLANNED - Ready to spec, not started
- 🔒 GATED - Conditional (triggered by metrics)

---

## Phase Groupings

### FOUNDATION (DONE ✅)
**Specs 001-002** - Core product functionality
- Detection engine (Gmail monitoring, trigger words)
- Change order generation (templates, export, calculator)
- **Status**: COMPLETE (Phases 1-9 all done)
- **Outcome**: Product works end-to-end

### QUALITY LAYER (Week 1-2)
**Specs 003-005** - Make it reliable before launch
- **003**: Pattern expansion (18→50+ patterns, research-validated)
- **004**: Production validation (50-email corpus, 75%+ accuracy gate)
- **005**: Chrome Web Store preparation (listing, screenshots, privacy policy)
- **Gate**: Product works reliably at target accuracy → READY TO DEPLOY

### DEPLOYMENT LAYER (Week 2-3)
**Specs 006-008** - Get users, monitor performance
- **006**: Chrome Web Store submission (upload, approval process)
- **007**: Error monitoring (Sentry integration, console logging, feedback forms)
- **008**: Usage analytics (installs, detections, conversions - privacy-safe)
- **Gate**: Extension live, users installing → READY TO MARKET

### MARKETING LAYER (Week 3-4)
**Specs 009-011** - Get discovered, retain users
- **009**: Launch campaign (Product Hunt, Hacker News, Reddit, demo video)
- **010**: SEO & content (landing page, blog posts, comparison vs Scopematter)
- **011**: User onboarding (tutorial, demo mode, email drip campaign)
- **Gate**: 100+ users, organic discovery working → READY TO AUTOMATE

### AUTOMATION LAYER (Month 2-3)
**Specs 012-014** - Reduce maintenance burden
- **012**: Remote selector config (Gmail DOM resilience, no Store review delays)
- **013**: Self-service support (FAQ bot, documentation search, troubleshooting wizard)
- **014**: E2E test automation (Puppeteer, CI/CD, regression prevention)
- **Gate**: Product runs itself, minimal support → READY TO MONETIZE

### REVENUE LAYER (Month 3-6)
**Specs 015-017** - Passive income engine
- **015**: Freemium gates (10 detections/month free, upgrade prompts)
- **016**: Stripe integration (subscription management, billing automation)
- **017**: Retention engine (email automation, churn prevention, upgrade incentives)
- **Gate**: Making money passively → BEACH ACHIEVED 🏖️

### EXPANSION LAYER (Month 6+, Conditional)
**Specs 018-020** - Optional growth (triggered by metrics)
- **018**: Slack Bot (trigger: 100+ users AND 50%+ request Slack)
- **019**: Upwork Alerts (trigger: 500+ users AND PMF validated)
- **020**: AI Enhancement (trigger: 100+ users AND accuracy plateau <75%)
- **Gate**: Market demands expansion → SCALE REVENUE

---

## Detailed Spec Descriptions

### Spec 003: Pattern Expansion (Research-Validated)

**Trigger**: IMMEDIATE (before launch)
**Effort**: 8-12 hours
**Priority**: 🔴 CRITICAL (launch blocker)

**What**: Expand trigger word library from 18 → 50+ patterns using Tavily research findings

**Why**: Current 18 patterns achieve 75% accuracy on test corpus. Research shows 32 additional patterns exist in real freelance emails ("Can you just...", "Let's also include...", "It would be great if...") that will boost accuracy to 75-85% and reduce false positives from 25% → 12-15%.

**Deliverables**:
- Updated trigger-words.js (+32 new patterns)
- 50-email production test corpus (real Upwork/Fiverr threads)
- Validated accuracy report (75%+ gate before launch)

**Success Criteria**:
- ≥75% detection accuracy on 50-email production corpus
- <20% false positive rate (tightened from <30%)
- All patterns tested in trigger-words.test.js

---

### Spec 004: Production Accuracy Validation

**Trigger**: IMMEDIATE (before launch)
**Effort**: 4-6 hours
**Priority**: 🔴 CRITICAL (confidence gate)

**What**: Validate detection accuracy on real-world email corpus before Chrome Web Store launch

**Why**: Current validation uses 20-email test corpus (lab conditions). Need production validation with real Upwork/Fiverr threads, direct client emails, and edge cases to confidently claim "75% accuracy" in store listing.

**Deliverables**:
- 50-email production corpus (gathered from r/freelance, anonymized)
- Accuracy test script (automated measurement)
- Validation report (documented in spec 001 research.md)

**Success Criteria**:
- ≥75% true positive rate (≥37/50 scope creep emails detected)
- <20% false positive rate (≤10/50 normal emails flagged)
- Zero critical bugs found during validation

---

### Spec 005: Chrome Web Store Preparation

**Trigger**: After specs 003-004 pass accuracy gates
**Effort**: 6-8 hours
**Priority**: 🟡 HIGH (launch enabler)

**What**: Create all assets required for Chrome Web Store submission

**Deliverables**:
- Store listing (title, description, category, keywords)
- Screenshots (5 images: detection, modal, settings, export flow)
- Privacy policy (local-only, no tracking, GDPR-compliant)
- Promotional images (1400x560 banner, 440x280 small tile)
- Demo video (15-30 seconds, optional but recommended)

**Success Criteria**:
- Store listing optimized for "scope creep" keyword searches
- Screenshots show clear value prop (detection → change order → export)
- Privacy policy compliant with Chrome Web Store requirements

---

### Spec 006: Chrome Web Store Submission

**Trigger**: After spec 005 assets complete
**Effort**: 2-4 hours (+ 1-3 day review wait)
**Priority**: 🟡 HIGH (deployment gate)

**What**: Submit extension to Chrome Web Store and obtain approval

**Deliverables**:
- Extension package uploaded
- Developer account verified ($5 one-time fee)
- Review approval (1-3 business days typically)
- Public store listing live

**Success Criteria**:
- Extension approved without violations
- Listed in Chrome Web Store within 3 days
- Installable by public users

---

### Spec 007: Error Monitoring & Feedback

**Trigger**: After spec 006 (extension live)
**Effort**: 8-12 hours
**Priority**: 🟡 HIGH (quality assurance)

**What**: Automated error tracking and user feedback collection

**Deliverables**:
- Sentry integration (client-side error tracking)
- Feedback form in popup (simple 1-5 rating + optional comment)
- Console logging aggregation
- Error notification system

**Success Criteria**:
- All JavaScript errors logged to Sentry
- <5% error rate among active users
- Feedback form submission rate ≥10%

---

### Spec 008: Usage Analytics (Privacy-Safe)

**Trigger**: After spec 006 (extension live)
**Effort**: 6-8 hours
**Priority**: 🟢 MEDIUM (data-driven decisions)

**What**: Track product usage metrics without violating privacy principles

**Deliverables**:
- Local analytics (chrome.storage.local counters only)
- Metrics: detections/day, change orders/week, exports/format
- Weekly summary dashboard in popup
- NO external analytics (privacy-first)

**Success Criteria**:
- Zero network requests (privacy audit pass)
- Users can see their own stats (detections prevented, $ saved)
- Data exportable by user (CSV)

---

### Spec 009: Launch Campaign

**Trigger**: After 50+ installs from organic/direct (week 1-2)
**Effort**: 8-12 hours
**Priority**: 🟢 MEDIUM (user acquisition)

**What**: Coordinated launch on Product Hunt, Hacker News, Reddit

**Deliverables**:
- Product Hunt submission (tagline, demo GIF, hunter outreach)
- Hacker News Show HN post (technical angle, privacy-first positioning)
- Reddit posts (r/freelance, r/consulting, r/SideProject)
- Demo video (YouTube, 2-3 minutes)
- Email outreach to beta users

**Success Criteria**:
- Product Hunt: Top 10 daily (100+ upvotes)
- Hacker News: Front page (50+ points)
- 200+ installs from launch week

---

### Spec 010: SEO & Landing Page

**Trigger**: After spec 009 launch
**Effort**: 12-16 hours
**Priority**: 🟢 MEDIUM (organic discovery)

**What**: Dedicated landing page with search engine optimization for "scope creep detection"

**Deliverables**:
- Landing page (scopeshield.dev or similar)
- Search optimization (keywords: scope creep, freelance, change order)
- Comparison page (vs Scopematter, vs PM tools)
- Blog posts (3-5 articles on scope creep prevention)
- Schema markup for search engines

**Success Criteria**:
- Rank top 10 for "scope creep Chrome extension"
- Organic installs >20% of total
- Landing page conversion rate ≥5%

---

### Spec 011: User Onboarding Flow

**Trigger**: After 100+ users, identify friction points
**Effort**: 6-10 hours
**Priority**: 🟢 MEDIUM (retention)

**What**: Interactive tutorial and email drip campaign for new users

**Deliverables**:
- First-run tutorial (5-step walkthrough)
- Demo mode (sample detections, fake data)
- Email drip (Day 1, 3, 7, 14, 30)
- In-app tips (contextual help)

**Success Criteria**:
- 80%+ users complete tutorial
- 20%+ weekly retention (Week 1 → Week 2)
- Email open rate ≥30%

---

### Spec 012: Remote Selector Configuration

**Trigger**: Gmail DOM breaks OR 1,000+ users
**Effort**: 15-20 hours
**Priority**: 🟡 HIGH (resilience)

**What**: Fetch Gmail selector configs from remote (GitHub gist) to survive DOM changes

**Deliverables**:
- Config fetching system (GitHub gist → chrome.storage.local cache)
- Fallback chain (remote → cached → bundled)
- Settings page "Update Selectors" button
- Constitutional exception (Privacy-First - remote fetch allowed for configs only)

**Success Criteria**:
- Extension recovers from Gmail changes within 4 hours (vs 2-week Store review)
- 99% config fetch success rate
- Zero user data transmitted (privacy audit)

**Constitutional Note**: Requires amendment v1.0.1 → v1.1.0 (MINOR)

---

### Spec 013: Self-Service Support System

**Trigger**: Support requests >5/week
**Effort**: 10-15 hours
**Priority**: 🟢 MEDIUM (reduce time burden)

**What**: Automated FAQ, documentation search, troubleshooting wizard

**Deliverables**:
- FAQ page (10-15 common questions)
- Documentation search (local indexing)
- Troubleshooting wizard (decision tree for common issues)
- "Report Bug" integration (prefilled GitHub issue template)

**Success Criteria**:
- 70%+ support questions self-resolved
- Support time <2 hours/week
- User satisfaction ≥4/5 stars

---

### Spec 014: E2E Test Automation

**Trigger**: 100+ users OR manual testing >1 hour/release
**Effort**: 20-25 hours
**Priority**: 🟡 HIGH (quality automation)

**What**: Puppeteer-based automated testing for regression prevention

**Deliverables**:
- 5 smoke tests (critical paths)
- CI/CD integration (GitHub Actions)
- Visual regression testing (screenshot comparison)
- Automated regression on every PR

**Success Criteria**:
- E2E tests run in <5 minutes
- 100% critical path coverage
- CI blocks PRs on test failures

---

### Spec 015: Freemium Infrastructure

**Trigger**: 100+ users AND clear paid demand
**Effort**: 12-16 hours
**Priority**: 🟡 HIGH (revenue enabler)

**What**: Usage limits, upgrade prompts, pricing tiers

**Deliverables**:
- Free tier: 10 detections/month, all features
- Paid tier: Unlimited detections, $9/month
- Upgrade prompts (after 10 detections)
- Pricing page (value proposition, comparison)

**Success Criteria**:
- 2-5% free-to-paid conversion (industry standard)
- Upgrade prompts don't annoy users (<10% negative feedback)
- Clear value proposition for paid tier

---

### Spec 016: Payment Integration (Stripe)

**Trigger**: After spec 015 AND 5+ users request paid
**Effort**: 15-20 hours
**Priority**: 🟡 HIGH (revenue critical)

**What**: Stripe subscription management, billing automation

**Deliverables**:
- Stripe checkout integration
- Subscription management (create, cancel, update)
- Billing portal link
- Receipt emails (via Stripe)
- Grace period handling (failed payments)

**Success Criteria**:
- Checkout conversion rate ≥50%
- Payment success rate ≥95%
- Churn from payment failures <5%

**Constitutional Note**: Requires backend for Stripe webhooks (minimal Express.js)
- Exception: Payment processing only, no user data storage

---

### Spec 017: Retention & Churn Prevention

**Trigger**: After spec 016 AND 20+ paid users
**Effort**: 10-15 hours
**Priority**: 🟢 MEDIUM (LTV optimization)

**What**: Automated email campaigns, upgrade incentives, win-back flows

**Deliverables**:
- Email automation (weekly summaries: "You saved $500 this week")
- Churn prediction (engagement drops → win-back email)
- Upgrade incentives (annual discount, referral bonuses)
- NPS surveys (quarterly)

**Success Criteria**:
- Monthly churn <10%
- NPS score ≥40
- Email engagement ≥20% open rate

---

### Spec 018: Slack Workspace Bot [GATED]

**Triggers (ALL must be met)**:
- ✅ 100+ active Gmail users
- ✅ 20%+ weekly retention validated
- ✅ 50%+ users request Slack in feedback surveys

**Effort**: 25-35 hours
**Priority**: 🔵 EXPANSION (conditional)

**What**: Slack Events API bot for workspace message detection

**Deliverables**:
- OAuth Slack app (workspace installation)
- Events API webhook handler (minimal backend)
- Same 50+ trigger patterns applied to Slack messages
- Unified detection storage (Gmail + Slack in chrome.storage.local)

**Success Criteria**:
- Workspace admin approval rate ≥30%
- Detection accuracy parity with Gmail (75%+)
- No Gmail user churn from Slack addition

**Constitutional Note**: Requires Principle IV exception (minimal OAuth backend)

---

### Spec 019: Upwork Job Alerts Integration [GATED]

**Triggers (ALL must be met)**:
- ✅ 500+ active users (Gmail + Slack combined)
- ✅ Product-Market Fit validated (3%+ paid, <10% churn)
- ✅ Unit economics positive (LTV > 3x CAC)

**Effort**: 20-30 hours
**Priority**: 🔵 EXPANSION (conditional)

**What**: Monitor Upwork job postings for scope hints (NOT message monitoring)

**Deliverables**:
- Upwork OAuth integration
- Job posting monitoring (RSS feed or API)
- Scope hint detection in job descriptions
- Alert system (email when risky job posted)

**Success Criteria**:
- Job alert accuracy ≥60% (lower bar than email)
- User opt-in rate ≥40% (Upwork users only)
- No privacy violations (only public job data)

---

### Spec 020: AI Enhancement (Optional BYOK) [GATED]

**Triggers (ANY can trigger)**:
- ✅ 100+ users request AI accuracy boost
- ✅ Keyword accuracy plateaus <75% despite pattern expansion
- ✅ Scopematter adds AI (competitive pressure)

**Effort**: 15-20 hours
**Priority**: 🔵 EXPANSION (conditional)

**What**: Optional GPT-4o-mini enhancement via user-provided API key

**Deliverables**:
- Settings: "OpenAI API Key" field (optional, encrypted storage)
- AI toggle (enable/disable per detection)
- Hybrid mode (keywords first, AI for low-confidence)
- Usage transparency (show token count, cost estimate)

**Success Criteria**:
- Accuracy boost: 75-85% → 90%+
- User cost: ~$0.03/month (affordable)
- Privacy maintained (user's key, requests from their account)
- 20%+ of paid users enable AI

---

## Decision Gates & Triggers

### When to Start Each Spec

**Specs 003-005 (Quality)**: START IMMEDIATELY
- No triggers needed, pre-launch requirements

**Specs 006-008 (Deployment)**: After quality gates pass
- Gate: 75%+ accuracy validated

**Specs 009-011 (Marketing)**: After extension live
- Gate: 50+ installs from organic/direct

**Specs 012-014 (Automation)**: Triggered by metrics
- 012: Gmail breaks OR 1,000 users
- 013: Support >5 requests/week
- 014: 100+ users OR manual testing >1 hour

**Specs 015-017 (Revenue)**: Triggered by user demand
- 015: 100+ users AND clear paid demand
- 016: 5+ users request paid tier
- 017: 20+ paid subscribers

**Specs 018-020 (Expansion)**: Triggered by success metrics
- 018: 100 users + 50% request Slack
- 019: 500 users + PMF validated
- 020: 100 users + accuracy <75%

---

## Execution Commitment

**I WILL execute each spec's plan EXACTLY as written**:
- No skipping tasks mid-implementation
- No "this isn't MVP-worthy" decisions
- If something seems wrong, STOP and ask
- Mark complete ONLY when 100% done

**Spec sequence is ORDERED**:
- Finish N before starting N+1 (no jumping ahead)
- Exception: Gated specs (can skip if triggers not met)

---

## Beach Money Checklist

Product achieves "beach money" status when:

- [ ] **Automated**: Runs without daily intervention (specs 007, 012-014)
- [ ] **Discoverable**: Users find it organically (specs 009-011)
- [ ] **Profitable**: Making money passively (specs 015-017)
- [ ] **Scalable**: Growth doesn't increase support burden (spec 013)
- [ ] **Resilient**: Survives Gmail updates without me (spec 012)
- [ ] **Retained**: Users stick around (spec 011, 017)

**Target**: All 6 checkboxes ✅ by Month 6

---

## Next Steps

1. **Review this roadmap** - Adjust spec priorities/triggers as needed
2. **Start Spec 003** - Run `/speckit.specify` for pattern expansion
3. **Execute sequentially** - 003 → 004 → 005 → 006... until beach achieved 🏖️

---

**Version**: 1.0.0
**Last Updated**: 2025-11-20 (Post-Spec 002 Phase 9 completion)
**Research Basis**: 25 Tavily searches, 43 .md files audited, complete market validation
**Status**: Ready for execution - Spec 003 next!
