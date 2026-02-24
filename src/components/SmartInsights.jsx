import React, { useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { brand, HOFOR, EPC_COLORS } from "@/lib/brand";
import { t, useLang } from "@/lib/i18n";
import { TrendingDown, AlertTriangle, ArrowRight, Zap, Flame, Shield, Award, Target, Sparkles } from "lucide-react";

/* ═══════════════════════════════════════════════════════
   Recommendation Engine — generates prioritized insights
   based on building data, HOFOR 2026 tariffs, EPC deadlines
   ═══════════════════════════════════════════════════════ */

const priorityConfig = {
  critical: { bg: "#FEF2F2", border: "#FECACA", text: "#991B1B", dot: "#EF4444", label: { da: "Kritisk", en: "Critical" } },
  high:     { bg: "#FFF7ED", border: "#FED7AA", text: "#9A3412", dot: "#F97316", label: { da: "Høj", en: "High" } },
  medium:   { bg: "#FFFBEB", border: "#FDE68A", text: "#92400E", dot: "#F59E0B", label: { da: "Middel", en: "Medium" } },
  low:      { bg: "#F0FDF4", border: "#BBF7D0", text: "#166534", dot: "#22C55E", label: { da: "Lav", en: "Low" } },
};

const categoryIcons = {
  tariff: Flame,
  epc: Award,
  legionella: Shield,
  efficiency: TrendingDown,
  compliance: Target,
};

function generateRecommendations(building, lang) {
  const recs = [];
  const hasFjernvarme = building.services.some(s => s.type === "fjernvarme");
  const hasEl = building.services.some(s => s.type === "el");

  // 1. HOFOR Motivationstarif — always relevant for fjernvarme buildings
  if (hasFjernvarme) {
    const simCooling = building.id === "kab-orestad" ? 27.8 : building.id === "fsb-tingbjerg" ? 24.5 : building.id === "ab-soendergaard" ? 22.1 : 31.2;
    const improvementDeg = Math.max(0, HOFOR.standard.krav - simCooling);
    const annualMWh = building.area * 0.12;
    const correctionSaving = improvementDeg * HOFOR.korrektionPct * HOFOR.energiprisPerMWh * annualMWh;

    if (simCooling < HOFOR.standard.krav) {
      recs.push({
        id: "tariff-surcharge",
        category: "tariff",
        priority: "critical",
        titleKey: "recTariffSurchargeTitle",
        descKey: "recTariffSurchargeDesc",
        savingDKK: Math.round(correctionSaving),
        metric: { value: `${simCooling.toFixed(1)}°C`, target: `${HOFOR.standard.krav}°C` },
        effortKey: "effortMedium",
        timelineKey: "timeline3to6",
      });
    } else if (simCooling < HOFOR.standard.bonusAbove) {
      const bonusPotential = (HOFOR.standard.bonusAbove - simCooling) * HOFOR.korrektionPct * HOFOR.energiprisPerMWh * annualMWh;
      recs.push({
        id: "tariff-bonus",
        category: "tariff",
        priority: "medium",
        titleKey: "recTariffBonusTitle",
        descKey: "recTariffBonusDesc",
        savingDKK: Math.round(bonusPotential),
        metric: { value: `${simCooling.toFixed(1)}°C`, target: `≥${HOFOR.standard.bonusAbove}°C` },
        effortKey: "effortLow",
        timelineKey: "timeline1to3",
      });
    }
  }

  // 2. EPC Upgrade Path — critical for D/E/F/G buildings (B required by 2030)
  const epcOrder = ["A", "B", "C", "D", "E", "F", "G"];
  const epcIdx = epcOrder.indexOf(building.epc);
  if (epcIdx > 1) {
    const stepsToB = epcIdx - 1;
    const monthsLeft = Math.max(0, Math.round((new Date("2030-01-01") - new Date()) / (1000 * 60 * 60 * 24 * 30)));
    const estimatedSaving = stepsToB * building.units * 1200;
    recs.push({
      id: "epc-upgrade",
      category: "epc",
      priority: epcIdx >= 4 ? "critical" : epcIdx >= 3 ? "high" : "medium",
      titleKey: "recEpcTitle",
      descKey: "recEpcDesc",
      savingDKK: estimatedSaving,
      metric: { value: building.epc, target: "B" },
      effortKey: epcIdx >= 4 ? "effortHigh" : "effortMedium",
      timelineKey: "timeline12to24",
      extraData: { monthsLeft, stepsToB },
    });
  }

  // 3. Legionella Optimization — reduce energy waste from over-heating
  if (hasFjernvarme) {
    const simTankTemp = building.id === "aab-amager" ? 62 : 58;
    if (simTankTemp > 57) {
      const overHeatDeg = simTankTemp - 55;
      const savingKwh = overHeatDeg * building.units * 365 * 0.15;
      const savingDKK = Math.round(savingKwh * 0.65);
      recs.push({
        id: "legionella-opt",
        category: "legionella",
        priority: "low",
        titleKey: "recLegionellaTitle",
        descKey: "recLegionellaDesc",
        savingDKK,
        metric: { value: `${simTankTemp}°C`, target: "55°C" },
        effortKey: "effortLow",
        timelineKey: "timeline1to3",
      });
    }
  }

  // 4. Smart Heating Curve Optimization
  if (hasFjernvarme && building.units > 100) {
    recs.push({
      id: "heating-curve",
      category: "efficiency",
      priority: "high",
      titleKey: "recHeatingCurveTitle",
      descKey: "recHeatingCurveDesc",
      savingDKK: Math.round(building.area * 8.5),
      metric: { value: "8-12%", target: null },
      effortKey: "effortLow",
      timelineKey: "timeline1to3",
    });
  }

  // 5. Sub-metering ROI for buildings without el
  if (!hasEl && building.units > 50) {
    recs.push({
      id: "submetering",
      category: "efficiency",
      priority: "medium",
      titleKey: "recSubmeteringTitle",
      descKey: "recSubmeteringDesc",
      savingDKK: Math.round(building.units * 800),
      metric: { value: `${building.units}`, target: null },
      effortKey: "effortMedium",
      timelineKey: "timeline6to12",
    });
  }

  return recs.sort((a, b) => {
    const order = { critical: 0, high: 1, medium: 2, low: 3 };
    return order[a.priority] - order[b.priority];
  });
}

/* ═══════════════════════════════════════════════════════
   UI Components
   ═══════════════════════════════════════════════════════ */

function InsightCard({ rec, lang }) {
  const p = priorityConfig[rec.priority];
  const CatIcon = categoryIcons[rec.category] || Zap;

  return (
    <div className="rounded-lg border p-4 transition-all hover:shadow-md"
      style={{ background: p.bg, borderColor: p.border }}>
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5"
          style={{ background: p.dot + "20" }}>
          <CatIcon size={16} style={{ color: p.dot }} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold"
              style={{ background: p.dot + "15", color: p.text }}>
              <span className="w-1.5 h-1.5 rounded-full" style={{ background: p.dot }} />
              {p.label[lang]}
            </span>
            <span className="text-[10px] font-medium text-slate-400">{t(rec.effortKey, lang)}</span>
          </div>
          <h4 className="text-[13px] font-semibold mb-1" style={{ color: brand.navy }}>
            {t(rec.titleKey, lang)}
          </h4>
          <p className="text-[11px] leading-relaxed mb-3" style={{ color: brand.subtle }}>
            {t(rec.descKey, lang)}
          </p>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <TrendingDown size={12} className="text-emerald-600" />
              <span className="text-sm font-bold text-emerald-700">
                {rec.savingDKK.toLocaleString("da-DK")} DKK
              </span>
              <span className="text-[10px] text-slate-400">/{lang === "da" ? "år" : "yr"}</span>
            </div>
            {rec.metric.target && (
              <div className="flex items-center gap-1 text-[10px] text-slate-500">
                <span className="font-mono font-medium" style={{ color: p.dot }}>{rec.metric.value}</span>
                <ArrowRight size={10} />
                <span className="font-mono font-medium text-emerald-600">{rec.metric.target}</span>
              </div>
            )}
            <span className="text-[10px] text-slate-400 ml-auto">{t(rec.timelineKey, lang)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SmartInsights({ building }) {
  const lang = useLang();
  const recs = useMemo(() => generateRecommendations(building, lang), [building, lang]);
  const totalSaving = recs.reduce((s, r) => s + r.savingDKK, 0);

  if (recs.length === 0) return null;

  return (
    <div className="mt-6">
      {/* Section header */}
      <div className="flex items-center gap-2 mb-4">
        <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: brand.blue + "15" }}>
          <Sparkles size={14} style={{ color: brand.blue }} />
        </div>
        <div>
          <h3 className="text-sm font-semibold" style={{ color: brand.navy }}>
            {t("smartInsightsTitle", lang)}
          </h3>
          <p className="text-[11px] text-slate-400">{t("smartInsightsSub", lang)}</p>
        </div>
        <div className="ml-auto text-right">
          <p className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">
            {t("totalPotential", lang)}
          </p>
          <p className="text-lg font-bold text-emerald-700">
            {totalSaving.toLocaleString("da-DK")} <span className="text-sm font-medium">DKK/{lang === "da" ? "år" : "yr"}</span>
          </p>
        </div>
      </div>

      {/* Recommendations */}
      <div className="flex flex-col gap-3">
        {recs.map(rec => (
          <InsightCard key={rec.id} rec={rec} lang={lang} />
        ))}
      </div>
    </div>
  );
}
