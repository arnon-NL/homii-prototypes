import React from "react";

/* ═══════════════════════════════════════════════════════
   DESIGN TOKENS — 4px grid, intentional palette
   ═══════════════════════════════════════════════════════ */
export const brand = {
  navy:    "#1F2A44",
  blue:    "#3EB1C8",
  midBlue: "#3B8EA5",
  green:   "#22C55E",
  red:     "#EF4444",
  amber:   "#F59E0B",
  bg:      "#F8FAFC",
  surface: "#FFFFFF",
  border:  "#E2E8F0",
  muted:   "#94A3B8",
  text:    "#1E293B",
  subtle:  "#64748B",
};

export const yearColor = {
  2021: "#CBD5E1", 2022: "#94A3B8", 2023: "#64748B", 2024: "#3B8EA5", 2025: "#3EB1C8", 2026: "#1F2A44",
};

/* ═══════════════════════════════════════════════════════
   HOFOR 2026 Tariff Constants
   ═══════════════════════════════════════════════════════ */
export const HOFOR = {
  standard:  { krav: 30, bonusAbove: 35, surchargeBelow: 25, label: "Standard" },
  vesterbro: { krav: 25, bonusAbove: 30, surchargeBelow: 20, label: "Vesterbro (lavtemp.)" },
  korrektionPct: 0.008,
  energiprisPerMWh: 650,
  effektbetalingPerM2: 42,
};

/* ═══════════════════════════════════════════════════════
   SVG Icon System
   ═══════════════════════════════════════════════════════ */
export const Icon = {
  cooling: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
      <path d="M8 1v14M1 8h14M3.5 3.5l9 9M12.5 3.5l-9 9" />
    </svg>
  ),
  degreeDays: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
      <path d="M4 14V6M8 14V2M12 14V8" />
    </svg>
  ),
  legionella: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
      <path d="M8 2a5 5 0 0 1 5 5c0 3-2 5-5 7-3-2-5-4-5-7a5 5 0 0 1 5-5z" />
      <circle cx="8" cy="7" r="1.5" />
    </svg>
  ),
  consumption: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
      <path d="M2 14h12M3 14V8h2v6M7 14V4h2v10M11 14V6h2v8" />
    </svg>
  ),
};

/* ═══════════════════════════════════════════════════════
   Logo
   ═══════════════════════════════════════════════════════ */
export const HomiiIcon = ({ size = 28, color = brand.blue }) => (
  <svg width={size} height={size * 1.2} viewBox="-1 -1 71.4 86.2" fill={color}>
    <path fillRule="evenodd" d="M69.43,26.46c0-2.87-1.43-5.54-3.82-7.13L39.46,1.92C36.58,0,32.85,0,29.97,1.92L3.82,19.33C1.43,20.93,0,23.59,0,26.46V79.03h.07v2.48a2.7,2.7,0,0,0,2.7,2.7H7.84a2.7,2.7,0,0,0,2.7-2.7V60.38c0-4.99,3.7-9.36,8.67-9.83,5.7-.54,10.51,3.96,10.51,9.55V71.17c0,7.2,5.84,13.04,13.04,13.04H62.04l7.39,0ZM40.19,71.17V60.55c0-10.65-8.12-19.79-18.75-20.47-3.96-.26-7.7.68-10.9,2.43V27.31l24.22-16.25L59.2,27.36V73.74H42.77a2.58,2.58,0,0,1-2.58-2.58Z"/>
  </svg>
);

/* ═══════════════════════════════════════════════════════
   EPC Badge Colors
   ═══════════════════════════════════════════════════════ */
export const EPC_COLORS = { A: "#16A34A", B: "#22C55E", C: "#F59E0B", D: "#F97316", E: "#EF4444", F: "#DC2626", G: "#991B1B" };
