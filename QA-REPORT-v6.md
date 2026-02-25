# UI/UX QA Report — homii Energy Dashboard v6

**Date:** 2026-02-25
**Reviewer:** Claude (UI/UX QA Skill)
**Scope:** Full prototype review — Buildings, Building Detail, Service Detail (Dashboard), Meters, Reports, Placeholders
**URL:** https://homii-prototypes.vercel.app/

---

## What's Working Well

The v6 restructuring is a significant improvement over the previous version. Several decisions deserve to be called out as strong:

**Unified consumption view.** Combining the Supply/Return/Cooling temperature chart, heating bars, and Degree Days into a single "Forbrug & Analyse" tab is the right call. These are all facets of the same user question: "How is my heating performing?" Having them on one scrollable page with shared year pill state is much better than forcing tab-switches.

**Reports as a first-class concept.** Moving Cooling analysis and Legionella compliance into their own Reports section is architecturally sound. These are analytical/compliance outputs, not daily operational views. The report index with cards → drill-in detail is a clean pattern.

**Meters page.** Full-width table with monospace IDs, type icons, clickable building links, and tabular-nums alignment — this is textbook B2B SaaS table design. Good use of Attio-style heading with inline count.

**Consistent heading pattern.** "Buildings 4", "Meters 11", "Rapporter 2" — the same `text-xl font-semibold + text-sm text-slate-400 count` pattern across all list pages creates visual consistency.

**Language toggle.** The DA/EN switch is tastefully integrated in the sidebar footer and the entire UI respects it, including sidebar section headers, table headers, and dashboard content.

---

## 1. Structural Issues (Information Architecture)

### 1.1 — Meter count mismatch: sidebar says 12, page says 11

**What:** The sidebar hardcodes `count: 12` for meters (Sidebar.jsx line 16), but the MetersPage dynamically computes `meters.length` from `buildings.flatMap(b => b.services)`, which yields 11 rows. The Meters page heading shows "11".

**Why it matters:** Data inconsistency erodes user trust. If a user sees "12" in the sidebar but "11" on the page, they'll wonder where the missing meter went.

**Fix:** Make the sidebar count dynamic. Import `buildings` in Sidebar.jsx and compute `buildings.flatMap(b => b.services).length` instead of hardcoding 12. Or better, pass counts as props from App.jsx.

### 1.2 — Building Detail is max-width constrained, but list pages are full-width

**What:** BuildingListPage and MetersPage use `px-8` (full-width), but BuildingDetailPage uses `max-w-[960px] mx-auto` (centered, narrower). The ReportsPage detail view uses `max-w-[1120px]`.

**Why it matters:** Inconsistent content width creates a jarring transition when navigating between pages. The user's eye has to readjust. More importantly, 960px is tight for a detail page that renders 3 service cards in a grid and full Smart Insights cards — the cards feel cramped.

**Fix:** Standardize on one approach. Recommendation: use `max-w-[1200px] mx-auto px-8` for all content pages, or `px-8` everywhere. The dashboard charts already have their own internal card widths, so a wider container won't hurt.

### 1.3 — Building Detail has 5 tabs, but 3 are "Coming Soon" placeholders

**What:** BuildingDetailPage renders tabs for Overview, Boligenheder, Tjenester, Opgaver, and Målere. Of these, Boligenheder (Rental Units), Opgaver (Tasks), and Målere (Meters) are all placeholder "Coming Soon".

**Why it matters:** Three empty tabs is a lot of dead space for a prototype. Users will click each tab expecting content, find nothing, and lose confidence. More importantly, the "Meters" tab at building level conflicts with the global "Meters" page — where does meter data actually live?

**Fix:** For a prototype, remove the placeholder tabs entirely or reduce to just Overview + Tjenester (the two functional tabs). If you keep Meters at the building level, it should filter to that building's meters only, which creates a meaningful distinction from the global Meters page. But for now, fewer tabs = cleaner impression.

### 1.4 — Reports are not scoped to a building

**What:** Cooling Report and Legionella Report are global — they don't reference which building they're analyzing. They use hardcoded mock data with a meter selector, but the user navigates there from a top-level "Reports" nav item with no building context.

**Why it matters:** In the real product, a property manager manages multiple buildings. A report without building context is confusing: "Which building's cooling is this showing?" The current prototype works because the demo data is all KAB Ørestad, but the architecture suggests global scope.

**Fix:** For the prototype, add a building selector or header to each report (e.g., "Cooling Report — KAB Ørestad"). Long-term, reports should either be generated per-building (accessible from Building Detail > Reports) or have a building filter at the top.

---

## 2. State Coverage Gaps

### 2.1 — No empty state for Reports

**What:** The Reports page always shows 2 report cards. There's no handling for what happens when there are zero reports.

**Why it matters:** In production, new users or buildings without enough data won't have reports yet. The page would be blank.

**Fix:** Add an empty state: "No reports generated yet. Reports become available once consumption data has been collected for at least 30 days."

### 2.2 — No loading or error states anywhere

**What:** No component in the prototype shows a loading skeleton, spinner, or error boundary. Data appears instantly because it's all in-memory mock data.

**Why it matters:** When connected to real APIs, every chart, table, and metric card will need loading and error states. If the prototype is also meant to demonstrate the UX to stakeholders, showing loading patterns communicates professional awareness.

**Fix:** Low priority for a prototype, but worth a note: the dashboard charts (Recharts) should have a skeleton state with gray placeholder shapes. Tables could use 3-4 shimmering rows.

### 2.3 — All meter statuses are "Active" — no visual variety

**What:** Every meter in the MetersPage shows a green "Aktiv" badge. There's no visual representation of other possible states (Inactive, Faulty, Disconnected).

**Why it matters:** The whole point of a status column is to help users scan for anomalies. If everything is always green, the column adds no value — it's visual noise.

**Fix:** Set 1-2 meters to different statuses in the mock data (e.g., one "Offline" in amber, one "Fejl" in red). This demonstrates the value of the status system.

### 2.4 — Cooling report chart shows only the requirement line — no actual data visible

**What:** In the Cooling Report, the Supply/Return/Cooling chart shows only the red dashed "Krav" requirement line at 30°C. The actual temperature lines (Supply, Return, Cooling area) are barely visible — they render as nearly flat lines near the bottom or are overlapping.

**Why it matters:** This is the most important visualization in the Cooling Report and it looks broken. A stakeholder seeing this would question the data quality.

**Fix:** Check the data generator for the Cooling Report — it may be producing values that are too low or identical. The Supply line should typically be 60-85°C, Return 35-50°C, and Cooling should be the delta. Ensure the Y-axis scales appropriately.

---

## 3. Interaction Issues

### 3.1 — No way to get back to Buildings from the Meters page building link

**What:** On the Meters page, clicking a building name navigates to BuildingDetailPage. However, once there, the breadcrumb trail is "Buildings > KAB Ørestad". There's no indication the user came from the Meters page.

**Why it matters:** The navigation mental model breaks. The user was browsing meters, clicked a building to check something, and now their only "back" path is through the Buildings hierarchy — not back to Meters.

**Fix:** This is acceptable for a prototype (browser back button works). In production, consider preserving navigation origin or adding a "Back to Meters" link when navigating from that context.

### 3.2 — Dashboard tab has no anchor/scroll restore

**What:** The "Forbrug & Analyse" tab is very long (cooling chart + heating bars + data table + degree days + more charts). When switching between tabs (Forbrug & Analyse → HOFOR Tarif → back), the scroll position resets to the top.

**Why it matters:** If a user was examining the Degree Days section at the bottom, switching tabs and coming back forces them to scroll down again.

**Fix:** Low priority for prototype. In production, consider either preserving scroll position per tab, or adding in-page anchor links / a sticky section navigator for the long consumption tab.

### 3.3 — No search or filter on Meters table

**What:** The Meters page shows 11 rows with no search, filter, or sort capability.

**Why it matters:** With 4 demo buildings this is fine, but a real portfolio could have hundreds of meters. The table pattern should demonstrate that filtering is part of the design.

**Fix:** Add a simple search input above the table and/or type filter pills (Fjernvarme, Vand, El) to show intent. Even non-functional placeholders signal "we've thought about scale."

### 3.4 — Report cards lack hover affordance beyond shadow

**What:** Report cards on the index page show `cursor-pointer` and a shadow on hover, but the transition is subtle. There's no visual arrow, chevron, or "View report →" CTA.

**Why it matters:** The click target isn't obvious. Users might not realize the entire card is clickable.

**Fix:** Add a subtle arrow icon or "Vis rapport →" text link at the bottom-right of each card, similar to how the service cards on BuildingDetailPage have an `ArrowRight` icon.

---

## 4. Visual Issues

### 4.1 — Year pill label "2025" uses black background — low contrast with navy text

**What:** On the "Forbrug & Analyse" tab, the year pill for 2025 uses a dark (near-black) filled style while 2023 and 2024 use the brand blue. This creates an inconsistent visual weight.

**Why it matters:** All active year pills should use the same visual treatment. The black pill looks like a different element type (maybe a "current year" indicator?), but that distinction isn't explained.

**Fix:** Either make all active pills the same color (brand blue), or if 2025 is "current year," use a slightly different but intentional treatment (e.g., an outline variant with a label "current").

### 4.2 — Sidebar "RECORDS" section header styling is very light

**What:** The "REGISTRE" / "RECORDS" section header is `text-[10px] font-semibold text-slate-400 uppercase tracking-widest`. At 10px it's barely legible and competes with the nav items below it.

**Why it matters:** Section headers in navigation should provide clear visual separation. This one is easy to miss.

**Fix:** Increase to `text-[11px]` and change color to `text-slate-500`. The tracking-widest is good — it creates clear distinction from nav items.

### 4.3 — "Senest redigeret" date on report cards is very faint

**What:** The "Last updated" timestamp on report cards uses `text-[10px] text-slate-300` — this is nearly invisible on a white background.

**Why it matters:** If the date isn't meant to be read, remove it. If it is, make it legible.

**Fix:** Change to `text-slate-400` minimum, or remove the date entirely if it's not meaningful in a prototype with static data.

### 4.4 — Smart Insights cards have colored left borders but no consistent severity palette

**What:** The Smart Insights cards on BuildingDetailPage use different background colors (red-ish for Kritisk, yellow for Høj/Middel, etc.) with left-border accents. The color mapping is severity-based, which is good. However, the specific shades don't always match the standard status palette used elsewhere.

**Why it matters:** Minor. The cards are visually distinctive and readable. Just ensure the red/amber/yellow/green used in Smart Insights matches the EPC badge colors and status badge colors conceptually.

**Fix:** Audit the color tokens once to ensure a single severity palette is used across Smart Insights, EPC badges, meter status badges, and Legionella risk levels.

---

## 5. Domain-Specific Issues

### 5.1 — Consumption data shows "2025" but chart labels show "2026" in data table header

**What:** The year pill bar shows 2023, 2024, 2025 as selectable years, but the data table header for the most recent year column shows "2025" (which is correct for the pills selected). However, some reading dates in the Meters page show "2026-02-24" — the prototype isn't clear about what the "current" date is in-universe.

**Why it matters:** Temporal consistency matters in energy management tools. If today is 2026, then 2025 data should be complete (12 months) and the current year should be 2026 with partial data.

**Fix:** Align all dates. If the prototype date is Feb 2026, the year pills should offer 2024, 2025, 2026 (with 2026 being partial). This would make the demo data feel more realistic.

### 5.2 — HOFOR Tariff calculator shows 0 kr. for cooling correction

**What:** The HOFOR Tariff tab shows "Afkølingskorrektion (0.0° × 0.8%): 0 kr." This makes the tariff simulator look broken — the whole point is to show the correction amount.

**Why it matters:** The simulator's value proposition is demonstrating financial impact. A 0 kr. correction undermines this.

**Fix:** The calculation may be correct (if current cooling is exactly at the requirement), but the "what if" slider should default to showing a non-zero scenario. Default the slider to +2°C or -2°C to immediately demonstrate the financial impact.

---

## Quick Checklist Sweep

| Check | Pass? | Note |
|-------|-------|------|
| Every domain object has one canonical home | Partial | Meters appear both as a sidebar page and as a tab on Building Detail |
| Navigation ≤ 7 top-level items | Yes | 5 nav + 2 records = 7 |
| Detail page tabs ≤ 5 | Yes | Building Detail = 5 (but 3 are empty) |
| Lifecycle states visible via badges | Partial | EPC badge ✓, meter status ✓, but all meters are "Active" |
| Temporal context clear | Partial | Year pills on dashboard ✓, but no global "current period" indicator |
| Empty state with guidance | No | No empty states anywhere |
| Table numbers right-aligned | Yes | All numeric columns use `text-right tabular-nums` |
| Tables scannable with anomaly highlighting | No | All meters are green, cooling chart data barely visible |
| Content width constrained | Mixed | List pages are full-width, detail pages are constrained differently |
| Status color system consistent | Yes | Green=good, amber=warning, red=critical used consistently |
| Cards consistent (radius, padding, shadow) | Yes | Consistent shadcn Card usage throughout |

---

## Priority Ranking

| # | Finding | Severity | Effort |
|---|---------|----------|--------|
| 1.1 | Meter count mismatch (12 vs 11) | High | 5 min |
| 2.4 | Cooling report chart shows no data | High | 15 min |
| 5.2 | Tariff calculator shows 0 kr | Medium | 10 min |
| 1.2 | Inconsistent content width | Medium | 15 min |
| 2.3 | All meters "Active" — no variety | Medium | 5 min |
| 1.3 | 3 placeholder tabs on Building Detail | Medium | 10 min |
| 5.1 | Year alignment (2025 vs 2026) | Medium | 20 min |
| 3.3 | No search/filter on Meters table | Low | 30 min |
| 1.4 | Reports not scoped to building | Low | Design decision |
| 4.1 | Year pill color inconsistency | Low | 5 min |
| 4.2 | RECORDS header too faint | Low | 2 min |
| 4.3 | Report card date too faint | Low | 2 min |
| 3.4 | Report cards lack click affordance | Low | 10 min |
