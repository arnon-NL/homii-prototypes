/* ═══════════════════════════════════════════════════════
   Insight Engine — centralized, rule-based recommendation
   generator for Smart Insights.

   Architecture:
   - Each insight is a self-contained "rule" with an evaluate()
     function that returns null (not applicable) or an Insight object.
   - Rules only generate insights from data that actually exists
     in the system (meters, buildings, time-series).
   - Both building-level and portfolio-level views import from here.

   Categories (aligned with product sections):
     afkoeling    — Cooling performance & HOFOR tariff impact
     epc          — Energy label compliance & certificate health
     consumption  — Consumption anomalies & trends
     data-quality — Meter health, stale data, quality degradation
   ═══════════════════════════════════════════════════════ */

import { HOFOR } from "@/lib/brand";
import {
  buildings,
  getMetersForBuilding,
  getAfkoelingTimeSeries,
} from "@/lib/mockData";

/* ─── Priority ordering ─── */
const PRIORITY_ORDER = { critical: 0, high: 1, medium: 2, low: 3 };

/* ═══════════════════════════════════════════════════════
   Insight Rules
   Each rule: { id, category, evaluate(building, meters) → Insight | null }
   ═══════════════════════════════════════════════════════ */

const insightRules = [

  /* ── 1. HOFOR Tariff Surcharge Risk ──
     Source: Kamstrup READy (DH meters with hasTemperatureData)
     Triggers when avg afkøling over last 12 weeks < HOFOR krav (30°C) */
  {
    id: "afkoeling-surcharge",
    category: "afkoeling",
    evaluate(building, meters) {
      const dhMeters = meters.filter(m => m.type === "fjernvarme" && m.hasTemperatureData && m.status === "active");
      if (dhMeters.length === 0) return null;

      // Compute actual avg cooling from time-series data
      const avgCooling = computeAvgCooling(dhMeters);
      if (avgCooling === null || avgCooling >= HOFOR.standard.krav) return null;

      const improvementDeg = HOFOR.standard.krav - avgCooling;
      const annualMWh = building.area * 0.12;
      const savingDKK = Math.round(improvementDeg * HOFOR.korrektionPct * HOFOR.energiprisPerMWh * annualMWh);

      return {
        id: "afkoeling-surcharge",
        category: "afkoeling",
        priority: "critical",
        titleKey: "recTariffSurchargeTitle",
        descKey: "recTariffSurchargeDesc",
        savingDKK,
        metric: { value: `${avgCooling.toFixed(1)}°C`, target: `${HOFOR.standard.krav}°C` },
        effortKey: "effortMedium",
        timelineKey: "timeline3to6",
        dataSource: "Kamstrup READy → HOFOR",
      };
    },
  },

  /* ── 2. HOFOR Tariff Bonus Opportunity ──
     Source: Kamstrup READy (DH meters with hasTemperatureData)
     Triggers when cooling is above krav but below bonus threshold */
  {
    id: "afkoeling-bonus",
    category: "afkoeling",
    evaluate(building, meters) {
      const dhMeters = meters.filter(m => m.type === "fjernvarme" && m.hasTemperatureData && m.status === "active");
      if (dhMeters.length === 0) return null;

      const avgCooling = computeAvgCooling(dhMeters);
      if (avgCooling === null || avgCooling < HOFOR.standard.krav || avgCooling >= HOFOR.standard.bonusAbove) return null;

      const annualMWh = building.area * 0.12;
      const bonusPotential = (HOFOR.standard.bonusAbove - avgCooling) * HOFOR.korrektionPct * HOFOR.energiprisPerMWh * annualMWh;

      return {
        id: "afkoeling-bonus",
        category: "afkoeling",
        priority: "medium",
        titleKey: "recTariffBonusTitle",
        descKey: "recTariffBonusDesc",
        savingDKK: Math.round(bonusPotential),
        metric: { value: `${avgCooling.toFixed(1)}°C`, target: `≥${HOFOR.standard.bonusAbove}°C` },
        effortKey: "effortLow",
        timelineKey: "timeline1to3",
        dataSource: "Kamstrup READy → HOFOR",
      };
    },
  },

  /* ── 3. Cooling Trend Deterioration ──
     Source: Kamstrup READy time-series
     Compares last 12 weeks vs previous 12 weeks; flags if worsening >5% */
  {
    id: "afkoeling-trend",
    category: "afkoeling",
    evaluate(building, meters) {
      const dhMeters = meters.filter(m => m.type === "fjernvarme" && m.hasTemperatureData && m.status === "active");
      if (dhMeters.length === 0) return null;

      let recentSum = 0, prevSum = 0, recentCount = 0, prevCount = 0;
      for (const m of dhMeters) {
        const series = getAfkoelingTimeSeries(m.id, 52);
        if (series.length < 24) continue;
        const recent = series.slice(-12);
        const prev = series.slice(-24, -12);
        recentSum += recent.reduce((s, d) => s + d.afkoeling, 0);
        recentCount += recent.length;
        prevSum += prev.reduce((s, d) => s + d.afkoeling, 0);
        prevCount += prev.length;
      }

      if (recentCount === 0 || prevCount === 0) return null;
      const recentAvg = recentSum / recentCount;
      const prevAvg = prevSum / prevCount;
      // Higher afkøling = better cooling. If recentAvg dropped > 5% compared to prevAvg, flag it.
      const changePct = ((recentAvg - prevAvg) / prevAvg) * 100;
      if (changePct >= -5) return null; // not deteriorating significantly

      return {
        id: "afkoeling-trend",
        category: "afkoeling",
        priority: "high",
        titleKey: "recCoolingTrendTitle",
        descKey: "recCoolingTrendDesc",
        savingDKK: 0, // awareness insight, not directly monetizable
        metric: { value: `${changePct.toFixed(1)}%`, target: null },
        effortKey: "effortLow",
        timelineKey: "timeline1to3",
        dataSource: "Kamstrup READy",
      };
    },
  },

  /* ── 4. EPC Upgrade Required by 2030 ──
     Source: EMO / Energistyrelsen (building.epc)
     Triggers for buildings with EPC worse than B */
  {
    id: "epc-upgrade",
    category: "epc",
    evaluate(building) {
      const epcOrder = ["A", "B", "C", "D", "E", "F", "G"];
      const epcIdx = epcOrder.indexOf(building.epc);
      if (epcIdx <= 1) return null; // already A or B

      const stepsToB = epcIdx - 1;
      const monthsLeft = Math.max(0, Math.round((new Date("2030-01-01") - new Date()) / (1000 * 60 * 60 * 24 * 30)));
      const savingDKK = stepsToB * building.units * 1200;

      return {
        id: "epc-upgrade",
        category: "epc",
        priority: epcIdx >= 4 ? "critical" : epcIdx >= 3 ? "high" : "medium",
        titleKey: "recEpcTitle",
        descKey: "recEpcDesc",
        savingDKK,
        metric: { value: building.epc, target: "B" },
        effortKey: epcIdx >= 4 ? "effortHigh" : "effortMedium",
        timelineKey: "timeline12to24",
        extraData: { monthsLeft, stepsToB },
        dataSource: "EMO / Energistyrelsen",
      };
    },
  },

  /* ── 5. EPC Certificate Expiry ──
     Source: EMO / Energistyrelsen (building.epcExpiresDate)
     Flags buildings where EPC certificate is expired or expiring within 12 months */
  {
    id: "epc-expiry",
    category: "epc",
    evaluate(building) {
      if (!building.epcExpiresDate) return null;
      const now = new Date();
      const expiry = new Date(building.epcExpiresDate);
      const monthsLeft = Math.round((expiry - now) / (1000 * 60 * 60 * 24 * 30));

      if (monthsLeft > 12) return null; // not urgent

      const isExpired = monthsLeft <= 0;

      return {
        id: "epc-expiry",
        category: "epc",
        priority: isExpired ? "critical" : "high",
        titleKey: isExpired ? "recEpcExpiredTitle" : "recEpcExpiringSoonTitle",
        descKey: isExpired ? "recEpcExpiredDesc" : "recEpcExpiringSoonDesc",
        savingDKK: 0, // compliance insight, not monetizable
        metric: { value: isExpired ? "Expired" : `${monthsLeft} mo.`, target: null },
        effortKey: "effortMedium",
        timelineKey: "timeline3to6",
        extraData: { monthsLeft, expiryDate: building.epcExpiresDate },
        dataSource: "EMO / Energistyrelsen",
      };
    },
  },

  /* ── 6. Meter Offline / Error ──
     Source: Meter status from data integration (Kamstrup READy / Eloverblik)
     Flags meters with status "offline" or "error" */
  {
    id: "meter-offline",
    category: "data-quality",
    evaluate(building, meters) {
      const problemMeters = meters.filter(m => m.status === "offline" || m.status === "error");
      if (problemMeters.length === 0) return null;

      const meterIds = problemMeters.map(m => m.id).join(", ");
      const hasOffline = problemMeters.some(m => m.status === "offline");
      const hasError = problemMeters.some(m => m.status === "error");

      return {
        id: "meter-offline",
        category: "data-quality",
        priority: hasError ? "high" : "medium",
        titleKey: "recMeterOfflineTitle",
        descKey: "recMeterOfflineDesc",
        savingDKK: 0,
        metric: { value: `${problemMeters.length}`, target: null },
        effortKey: "effortLow",
        timelineKey: "timeline1to3",
        extraData: { meterIds, hasOffline, hasError },
        dataSource: problemMeters.map(m => m.dataSource === "kamstrup-ready" ? "Kamstrup READy" : "Eloverblik").filter((v, i, a) => a.indexOf(v) === i).join(", "),
      };
    },
  },

  /* ── 7. Data Quality Degradation ──
     Source: Meter dataQuality + lastReading.receivedDate
     Flags when meter data quality is low or data is stale (>7 days) */
  {
    id: "data-quality-low",
    category: "data-quality",
    evaluate(building, meters) {
      const now = new Date();
      const staleThresholdMs = 7 * 24 * 60 * 60 * 1000; // 7 days

      const lowQuality = meters.filter(m => m.dataQuality === "low" && m.status === "active");
      const staleMeters = meters.filter(m => {
        if (m.status !== "active") return false; // already caught by meter-offline
        const received = m.lastReading?.receivedDate ? new Date(m.lastReading.receivedDate) : null;
        return received && (now - received > staleThresholdMs);
      });

      const flagged = [...new Set([...lowQuality, ...staleMeters])];
      if (flagged.length === 0) return null;

      return {
        id: "data-quality-low",
        category: "data-quality",
        priority: "medium",
        titleKey: "recDataQualityTitle",
        descKey: "recDataQualityDesc",
        savingDKK: 0,
        metric: { value: `${flagged.length}`, target: null },
        effortKey: "effortLow",
        timelineKey: "timeline1to3",
        extraData: { meterIds: flagged.map(m => m.id).join(", ") },
        dataSource: "Data integration health",
      };
    },
  },
];

/* ═══════════════════════════════════════════════════════
   Helpers
   ═══════════════════════════════════════════════════════ */

/** Compute weighted avg afkøling from the last 12 weeks across DH meters */
function computeAvgCooling(dhMeters) {
  let totalSum = 0;
  let totalCount = 0;
  for (const m of dhMeters) {
    const series = getAfkoelingTimeSeries(m.id, 52);
    const recent = series.slice(-12);
    if (recent.length === 0) continue;
    totalSum += recent.reduce((s, d) => s + d.afkoeling, 0);
    totalCount += recent.length;
  }
  return totalCount > 0 ? totalSum / totalCount : null;
}

/* ═══════════════════════════════════════════════════════
   Public API
   ═══════════════════════════════════════════════════════ */

/**
 * Generate insights for a single building.
 * Used by the building detail page (SmartInsights component).
 */
export function generateBuildingInsights(building) {
  const meters = getMetersForBuilding(building.id);
  const insights = [];

  for (const rule of insightRules) {
    const result = rule.evaluate(building, meters);
    if (result) {
      insights.push(result);
    }
  }

  return insights.sort((a, b) => PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority]);
}

/**
 * Generate insights across all buildings in the portfolio.
 * Used by the home page. Attaches building reference to each insight.
 */
export function generatePortfolioInsights() {
  const all = [];

  for (const building of buildings) {
    const insights = generateBuildingInsights(building);
    for (const insight of insights) {
      all.push({
        ...insight,
        id: `${insight.id}-${building.id}`,
        building,
      });
    }
  }

  return all.sort((a, b) => PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority]);
}

/* ═══════════════════════════════════════════════════════
   Category Configuration — shared by all UI consumers
   ═══════════════════════════════════════════════════════ */

export const INSIGHT_CATEGORIES = {
  afkoeling:      { labelKey: { da: "Afkøling",      en: "Cooling" },       iconName: "Thermometer" },
  epc:            { labelKey: { da: "Energimærke",    en: "Energy Label" },  iconName: "Award" },
  consumption:    { labelKey: { da: "Forbrug",        en: "Consumption" },   iconName: "TrendingDown" },
  "data-quality": { labelKey: { da: "Datakvalitet",   en: "Data Quality" },  iconName: "Activity" },
};

export const PRIORITY_CONFIG = {
  critical: { bg: "#FEF2F2", border: "#FECACA", text: "#991B1B", dot: "#EF4444", label: { da: "Kritisk", en: "Critical" } },
  high:     { bg: "#FFF7ED", border: "#FED7AA", text: "#9A3412", dot: "#F97316", label: { da: "Høj", en: "High" } },
  medium:   { bg: "#FFFBEB", border: "#FDE68A", text: "#92400E", dot: "#F59E0B", label: { da: "Middel", en: "Medium" } },
  low:      { bg: "#F0FDF4", border: "#BBF7D0", text: "#166534", dot: "#22C55E", label: { da: "Lav", en: "Low" } },
};
