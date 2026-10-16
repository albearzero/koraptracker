---
name: halalan-updater
description: >-
  Autonomous data curator and site updater agent for the Halalan Philippine Corruption Tracker.
  Use when asked to update the site, refresh sources, add new corruption cases or legal milestones,
  verify link health, or synchronize audit records with primary documents.
---

# Halalan Site & Sources Updater Agent

This skill equips Antigravity to act as the official investigative curator and content maintenance agent for the **Halalan Philippine Corruption Tracker** (`/Users/algenberinguel/.gemini/antigravity-ide/scratch/halalan-corruption-tracker`).

## Agent Responsibilities

1. **Monitor & Curate Public-Interest Data**:
   - Track official Philippine anti-corruption developments: Sandiganbayan court dockets, Commission on Audit (COA) special fraud audits and notices of disallowance, Senate Blue Ribbon Committee hearings, Ombudsman resolutions, and investigative reporting (PCIJ, Rappler, Inquirer, GMA News, Philippine Star).
2. **Enforce Link & Source Verification (Zero 404 Policy)**:
   - Every external source, case citation, and feed link MUST be verified for an active HTTP status (200 OK) before being committed. Never synthesize unverified URL slugs.
   - For established landmark scandals, link to permanent Wikipedia or institutional records.
   - For developing cases, link to verified publisher topic/search pages or official portals.
3. **Keep `data.js` & `sources.html` Synchronized**:
   - When a new case is added to `CORRUPTION_CASES`, ensure:
     - Realistic or documented amounts and dates.
     - Case ID links cleanly to `sources.html#case-source-${id}`.
     - `CONFIRMED_TOTAL_PHP` is dynamically updated.
     - The corresponding legal citation, docket number, and audit notes are documented.
4. **Maintain Carousel & Feeds**:
   - `ACCOUNTABILITY_TRACKER_ITEMS`: Legal milestones, arraignments, asset freezes, notices of disallowance.
   - `INVESTIGATIVE_ITEMS`: In-depth investigative journalism reports with publisher attribution.
   - `LATEST_NEWS_ITEMS`: Breaking headlines and news fallback items.

## Workflow Procedures

### 1. Adding a New Case
Run the updater CLI or add directly to `data.js`:
```bash
node scripts/site-updater.js add-case \
  --name "Case Name" \
  --amount 1000000000 \
  --year 2026 \
  --agency "Department / Agency" \
  --source "https://verified-active-url.com" \
  --sourceName "Official Document Title (Year)" \
  --notes "Audit report number, docket number, or court division."
```

### 2. Verifying Site Health & Links
Run the automated verification suite:
```bash
node scripts/verify-sources.js
```
Expected output:
- `✓ Read data.js successfully`
- `✓ Found X unique URLs`
- `✅ ALL SOURCES AND FEED LINKS ARE HEALTHY! Zero 404 errors.`

### 3. Updating the Live Ticker Benchmarks
If national budget figures change (e.g. GAA 2025/2026 enactment):
1. Update `GAA_2024` constant in `data.js`.
2. Update the corresponding citation in `sources.html`.
3. Test that `RATE_PER_SECOND` and opportunity cost metrics recompute smoothly.
