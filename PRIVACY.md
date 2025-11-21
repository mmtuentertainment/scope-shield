# Privacy Policy - ScopeShield

**Last Updated**: November 21, 2025
**Effective Date**: November 21, 2025

## Our Privacy Commitment

ScopeShield is built with privacy as the #1 principle. **We collect ZERO user data.** Everything stays on YOUR device, under YOUR control.

## What We Store (Locally on Your Device Only)

ScopeShield stores the following information **exclusively in your browser** using `chrome.storage.local`:

### 1. Detection Events
- Timestamps of when scope creep was detected
- Email subject lines and sender names (from Gmail)
- Detected text snippets (first 100 characters)
- Your acknowledgment status

### 2. Your Settings
- Your freelancer name (for change orders)
- Your hourly rate (for pricing calculator, optional)
- Display preferences (highlight color, notification settings)
- Export preferences (default format, auto-export settings)

### 3. Change Order Drafts
- Auto-saved change order text (every 30 seconds while editing)
- Calculator state (hours, rate, cost estimate)
- Export history (last 50 change orders generated)

## Where Your Data is Stored

**ONLY in chrome.storage.local** - This is:
- Local to YOUR browser
- Synchronized to YOUR Chrome profile (if you enable Chrome Sync)
- **NEVER** sent to our servers (we have NO servers!)
- **NEVER** accessible to anyone but you
- **NEVER** used for analytics, tracking, or advertising

## What We Do NOT Collect

- ❌ We do NOT collect personal information
- ❌ We do NOT use cookies or tracking pixels
- ❌ We do NOT send data to external servers
- ❌ We do NOT use analytics or telemetry
- ❌ We do NOT sell, share, or monetize your data
- ❌ We do NOT track your browsing history
- ❌ We do NOT read emails outside of Gmail pages you visit

## Permissions Explained

ScopeShield requests these Chrome permissions:

### 1. `activeTab`
**Why we need it**: To read email content on Gmail pages when you're actively viewing them
**What we do**: Detect scope creep phrases in emails you're reading
**What we DON'T do**: Access tabs you're not actively viewing, track browsing history

### 2. `storage`
**Why we need it**: To save your settings and detection events locally
**What we do**: Store everything in `chrome.storage.local` (your device only)
**What we DON'T do**: Use `chrome.storage.sync` or send data anywhere

### 3. `notifications`
**Why we need it**: To alert you when scope creep is detected
**What we do**: Show browser notifications with detection alerts
**What we DON'T do**: Send notifications to external services or track notification clicks

### 4. `host_permissions` for `mail.google.com`
**Why we need it**: To monitor Gmail for scope creep phrases
**What we do**: Read email text on Gmail pages you visit
**What we DON'T do**: Access non-Gmail sites, monitor other email providers

## Your Data Rights

You have complete control over your data:

### Export Your Data
- Settings → Export History → Download CSV
- All detection events and change orders
- Your settings and preferences

### Delete Your Data
- Settings → Clear History → Deletes all detections
- Settings → Reset to Defaults → Clears all preferences
- Uninstall extension → Chrome automatically deletes all local storage

### Data Portability
- Export format: CSV (open in Excel, Google Sheets, etc.)
- Human-readable format
- No lock-in - your data, your control

## Third-Party Services

**We use ZERO third-party services.** No analytics (Google Analytics, etc.), no error tracking (Sentry, etc.), no CDNs, no external fonts, no external APIs.

**Exception**: Help and Feedback buttons link to GitHub (public repository) if you choose to click them. Clicking these buttons is voluntary and governed by GitHub's privacy policy.

## Children's Privacy

ScopeShield is intended for adult freelance professionals. We do not knowingly collect information from children under 13.

## Changes to This Policy

We will update this policy if our practices change. Updates will be posted with a new "Last Updated" date. Continued use after changes constitutes acceptance.

## Open Source

ScopeShield is [open source on GitHub](https://github.com/mmtuentertainment/scope-shield).

You can inspect the source code to verify our privacy claims. We welcome security audits and bug reports.

## Contact

Questions about privacy?
- [GitHub Issues](https://github.com/mmtuentertainment/scope-shield/issues)
- Or inspect the code yourself (it's open source!)

## Summary (TL;DR)

✅ **Zero data collection** - Nothing leaves your browser
✅ **Local storage only** - Everything saved on your device
✅ **No tracking** - No analytics, cookies, or telemetry
✅ **You own your data** - Export/delete anytime
✅ **Open source** - Verify our claims by reading the code

**Your privacy is not negotiable. We built ScopeShield privacy-first.**
