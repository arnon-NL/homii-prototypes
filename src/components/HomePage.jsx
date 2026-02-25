import React, { useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { brand, HOFOR, EPC_COLORS } from "@/lib/brand";
import { t, useLang } from "@/lib/i18n";
import { buildings, meters, getMetersForBuilding } from "@/lib/mockData";
import {
  Building2, Gauge, TrendingDown, AlertTriangle, ArrowRight,
  Zap, Flame, Shield, Award, Target, Sparkles, ChevronDown,
  ChevronUp, ExternalLink,
} from "lucide-react";

/* ═══════════════════════════════════════════════════════
   Reuse the recommendation engine from SmartInsights
   but run it across ALL buildings for portfolio view
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

const categoryLabels = {
  tariff:     { da: "Tarif",         en: "Tariff" },
  epc:        { da: "Energimærke",   en: "Energy Label" },
  legionella: { da: "Legionella",    en: "Legionella" },
  efficiency: { da: "Effektivitet",  en: "Efficiency" },
  compliance: { da: "Compliance",    en: "Compliance" },
};

function generateAllRecommendations(lang) {
  const all = [];
  for (const building of buildings) {
    const recs = [];
    const buildingMeters = getMetersForBuilding(building.id);
    const hasFjernvarme = buildingMeters.some(m => m.type === "fjernvarme");
    const hasEl = buildingMeters.some(m => m.type === "el");

    if (hasFjernvarme) {
      const simCooling = building.id === "kab-orestad" ? 27.8 : building.id === "fsb-tingbjerg" ? 24.5 : building.id === "ab-soendergaard" ? 22.1 : 31.2;
      const improvementDeg = Math.max(0, HOFOR.standard.krav - simCooling);
      const annualMWh = building.area * 0.12;
      const correctionSaving = improvementDeg * HOFOR.korrektionPct * HOFOR.energiprisPerMWh * annualMWh;

      if (simCooling < HOFOR.standard.krav) {
        recs.push({
          id: `tariff-surcharge-${building.id}`,
          category: "tariff",
          priority: "critical",
          titleKey: "recTariffSurchargeTitle",
          descKey: "recTariffSurchargeDesc",
          savingDKK: Math.round(correctionSaving),
          metric: { value: `${simCooling.toFixed(1)}°C`, target: `${HOFOR.standard.krav}°C` },
          effortKey: "effortMedium",
          timelineKey: "timeline3to6",
          building,
        });
      } else if (simCooling < HOFOR.standard.bonusAbove) {
        const bonusPotential = (HOFOR.standard.bonusAbove - simCooling) * HOFOR.korrektionPct * HOFOR.energiprisPerMWh * annualMWh;
        recs.push({
          id: `tariff-bonus-${building.id}`,
          category: "tariff",
          priority: "medium",
          titleKey: "recTariffBonusTitle",
          descKey: "recTariffBonusDesc",
          savingDKK: Math.round(bonusPotential),
          metric: { value: `${simCooling.toFixed(1)}°C`, target: `≥${HOFOR.standard.bonusAbove}°C` },
          effortKey: "effortLow",
          timelineKey: "timeline1to3",
          building,
        });
      }
    }

    const epcOrder = ["A", "B", "C", "D", "E", "F", "G"];
    const epcIdx = epcOrder.indexOf(building.epc);
    if (epcIdx > 1) {
      const stepsToB = epcIdx - 1;
      const estimatedSaving = stepsToB * building.units * 1200;
      recs.push({
        id: `epc-upgrade-${building.id}`,
        category: "epc",
        priority: epcIdx >= 4 ? "critical" : epcIdx >= 3 ? "high" : "medium",
        titleKey: "recEpcTitle",
        descKey: "recEpcDesc",
        savingDKK: estimatedSaving,
        metric: { value: building.epc, target: "B" },
        effortKey: epcIdx >= 4 ? "effortHigh" : "effortMedium",
        timelineKey: "timeline12to24",
        building,
      });
    }

    if (hasFjernvarme) {
      const simReturnTemp = building.id === "aab-amager" ? 47 : building.id === "kab-orestad" ? 44 : 42;
      if (simReturnTemp > 43) {
        const overDeg = simReturnTemp - 43;
        const savingKwh = overDeg * building.units * 365 * 0.15;
        recs.push({
          id: `legionella-opt-${building.id}`,
          category: "legionella",
          priority: "low",
          titleKey: "recLegionellaTitle",
          descKey: "recLegionellaDesc",
          savingDKK: Math.round(savingKwh * 0.65),
          metric: { value: `${simReturnTemp}°C`, target: "≤43°C" },
          effortKey: "effortLow",
          timelineKey: "timeline1to3",
          building,
        });
      }
    }

    if (hasFjernvarme && building.units > 100) {
      recs.push({
        id: `heating-curve-${building.id}`,
        category: "efficiency",
        priority: "high",
        titleKey: "recHeatingCurveTitle",
        descKey: "recHeatingCurveDesc",
        savingDKK: Math.round(building.area * 8.5),
        metric: { value: "8-12%", target: null },
        effortKey: "effortLow",
        timelineKey: "timeline1to3",
        building,
      });
    }

    if (!hasEl && building.units > 50) {
      recs.push({
        id: `submetering-${building.id}`,
        category: "efficiency",
        priority: "medium",
        titleKey: "recSubmeteringTitle",
        descKey: "recSubmeteringDesc",
        savingDKK: Math.round(building.units * 800),
        metric: { value: `${building.units}`, target: null },
        effortKey: "effortMedium",
        timelineKey: "timeline6to12",
        building,
      });
    }

    all.push(...recs);
  }

  return all.sort((a, b) => {
    const order = { critical: 0, high: 1, medium: 2, low: 3 };
    return order[a.priority] - order[b.priority];
  });
}

/* ═══════════════════════════════════════════════════════
   Portfolio KPI Card
   ═══════════════════════════════════════════════════════ */
function KpiCard({ icon: IconComp, label, value, sub, color }) {
  return (
    <Card>
      <CardContent className="p-4 flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
          style={{ background: (color || brand.blue) + "12" }}>
          <IconComp size={18} style={{ color: color || brand.blue }} />
        </div>
        <div>
          <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">{label}</p>
          <p className="text-xl font-bold tabular-nums" style={{ color: brand.navy }}>{value}</p>
          {sub && <p className="text-[11px] text-slate-400">{sub}</p>}
        </div>
      </CardContent>
    </Card>
  );
}

/* ═══════════════════════════════════════════════════════
   Insight row — compact for portfolio view
   ═══════════════════════════════════════════════════════ */
function InsightRow({ rec, lang, onNavigate }) {
  const p = priorityConfig[rec.priority];
  const CatIcon = categoryIcons[rec.category] || Zap;

  return (
    <div
      className="flex items-center gap-3 px-4 py-3 rounded-lg border transition-all hover:shadow-sm cursor-pointer group"
      style={{ borderColor: p.border, background: p.bg + "60" }}
      onClick={() => onNavigate({ page: "building-detail", buildingId: rec.building.id })}
    >
      {/* Icon */}
      <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
        style={{ background: p.dot + "18" }}>
        <CatIcon size={14} style={{ color: p.dot }} />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <h4 className="text-[13px] font-semibold truncate" style={{ color: brand.navy }}>
            {t(rec.titleKey, lang)}
          </h4>
          <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold shrink-0"
            style={{ background: p.dot + "15", color: p.text }}>
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: p.dot }} />
            {p.label[lang]}
          </span>
        </div>
        <div className="flex items-center gap-2 text-[11px] text-slate-400">
          <Building2 size={10} />
          <span className="font-medium group-hover:text-[#3EB1C8] transition-colors">{rec.building.name}</span>
          <span>·</span>
          <span>{t(rec.effortKey, lang)}</span>
          <span>·</span>
          <span>{t(rec.timelineKey, lang)}</span>
        </div>
      </div>

      {/* Metric */}
      {rec.metric.target && (
        <div className="hidden sm:flex items-center gap-1.5 text-[11px] shrink-0">
          <span className="font-mono font-medium" style={{ color: p.dot }}>{rec.metric.value}</span>
          <ArrowRight size={10} className="text-slate-300" />
          <span className="font-mono font-medium text-emerald-600">{rec.metric.target}</span>
        </div>
      )}

      {/* Saving */}
      <div className="text-right shrink-0">
        <p className="text-sm font-bold text-emerald-700 tabular-nums">
          {rec.savingDKK.toLocaleString("da-DK")} DKK
        </p>
        <p className="text-[10px] text-slate-400">/{lang === "da" ? "år" : "yr"}</p>
      </div>

      <ExternalLink size={12} className="text-slate-300 group-hover:text-slate-500 shrink-0" />
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   Category summary pill
   ═══════════════════════════════════════════════════════ */
function CategoryFilter({ category, count, savings, active, onClick, lang }) {
  const CatIcon = categoryIcons[category] || Zap;
  const label = categoryLabels[category]?.[lang] || category;
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-all border ${
        active
          ? "bg-white shadow-sm border-slate-200 text-slate-900"
          : "bg-transparent border-transparent text-slate-500 hover:bg-slate-100"
      }`}
    >
      <CatIcon size={13} />
      <span>{label}</span>
      <span className="text-[10px] bg-slate-100 rounded-full px-1.5 py-0.5 tabular-nums">{count}</span>
    </button>
  );
}

/* ═══════════════════════════════════════════════════════
   Home Page
   ═══════════════════════════════════════════════════════ */
export default function HomePage({ onNavigate }) {
  const lang = useLang();
  const [activeCategory, setActiveCategory] = useState(null);
  const [showAll, setShowAll] = useState(false);

  const allRecs = useMemo(() => generateAllRecommendations(lang), [lang]);
  const totalSaving = allRecs.reduce((s, r) => s + r.savingDKK, 0);

  // Group by category
  const categories = useMemo(() => {
    const map = {};
    for (const rec of allRecs) {
      if (!map[rec.category]) map[rec.category] = { count: 0, savings: 0 };
      map[rec.category].count++;
      map[rec.category].savings += rec.savingDKK;
    }
    return map;
  }, [allRecs]);

  // Priority counts
  const criticalCount = allRecs.filter(r => r.priority === "critical").length;
  const highCount = allRecs.filter(r => r.priority === "high").length;

  // Filtered recs
  const filteredRecs = activeCategory
    ? allRecs.filter(r => r.category === activeCategory)
    : allRecs;
  const displayRecs = showAll ? filteredRecs : filteredRecs.slice(0, 6);

  // Portfolio-level meter stats
  const activeMeters = meters.filter(m => m.status === "active").length;
  const errorMeters = meters.filter(m => m.status === "error" || m.status === "offline").length;

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-[1100px] mx-auto px-8 py-6 space-y-6">

        {/* Header */}
        <div>
          <h1 className="text-xl font-semibold" style={{ color: brand.navy }}>
            {lang === "da" ? "Porteføljeoversigt" : "Portfolio Overview"}
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            {lang === "da"
              ? `${buildings.length} bygninger · ${meters.length} målere · ${new Date().toLocaleDateString(lang === "da" ? "da-DK" : "en-US", { month: "long", year: "numeric" })}`
              : `${buildings.length} buildings · ${meters.length} meters · ${new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" })}`}
          </p>
        </div>

        {/* KPI Strip */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <KpiCard
            icon={Building2}
            label={t("buildings", lang)}
            value={buildings.length}
            sub={`${buildings.filter(b => b.status === "active").length} ${t("active", lang).toLowerCase()}`}
          />
          <KpiCard
            icon={Gauge}
            label={t("meters", lang)}
            value={meters.length}
            sub={errorMeters > 0
              ? `${activeMeters} ${t("active", lang).toLowerCase()} · ${errorMeters} ${lang === "da" ? "advarsel" : "alert"}`
              : `${activeMeters} ${t("active", lang).toLowerCase()}`}
            color={errorMeters > 0 ? brand.amber : brand.blue}
          />
          <KpiCard
            icon={AlertTriangle}
            label={lang === "da" ? "Kritiske indsatser" : "Critical Actions"}
            value={criticalCount}
            sub={`${highCount} ${lang === "da" ? "høj prioritet" : "high priority"}`}
            color={criticalCount > 0 ? brand.red : brand.green}
          />
          <KpiCard
            icon={TrendingDown}
            label={lang === "da" ? "Besparelsespotentiale" : "Savings Potential"}
            value={`${(totalSaving / 1000).toFixed(0)}k`}
            sub={`DKK/${lang === "da" ? "år" : "yr"} · ${allRecs.length} ${t("insightsCount", lang)}`}
            color={brand.green}
          />
        </div>

        {/* Smart Insights Section */}
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: brand.blue + "12" }}>
              <Sparkles size={16} style={{ color: brand.blue }} />
            </div>
            <div className="flex-1">
              <h2 className="text-base font-semibold" style={{ color: brand.navy }}>
                {t("smartInsightsTitle", lang)}
              </h2>
              <p className="text-[12px] text-slate-400">
                {lang === "da"
                  ? "Prioriterede anbefalinger på tværs af hele porteføljen"
                  : "Prioritized recommendations across the entire portfolio"}
              </p>
            </div>
            <div className="text-right">
              <p className="text-lg font-bold text-emerald-700 tabular-nums">
                {totalSaving.toLocaleString("da-DK")} DKK
              </p>
              <p className="text-[10px] text-slate-400 uppercase tracking-wider">{t("totalPotential", lang)}</p>
            </div>
          </div>

          {/* Category filters */}
          <div className="flex flex-wrap items-center gap-1">
            <button
              onClick={() => setActiveCategory(null)}
              className={`inline-flex items-center gap-1 px-3 py-2 rounded-lg text-xs font-medium transition-all border ${
                !activeCategory
                  ? "bg-white shadow-sm border-slate-200 text-slate-900"
                  : "bg-transparent border-transparent text-slate-500 hover:bg-slate-100"
              }`}
            >
              {lang === "da" ? "Alle" : "All"}
              <span className="text-[10px] bg-slate-100 rounded-full px-1.5 py-0.5 tabular-nums">{allRecs.length}</span>
            </button>
            {Object.entries(categories).map(([cat, { count, savings }]) => (
              <CategoryFilter
                key={cat}
                category={cat}
                count={count}
                savings={savings}
                active={activeCategory === cat}
                onClick={() => setActiveCategory(activeCategory === cat ? null : cat)}
                lang={lang}
              />
            ))}
          </div>

          {/* Insight list */}
          <div className="space-y-2">
            {displayRecs.map(rec => (
              <InsightRow key={rec.id} rec={rec} lang={lang} onNavigate={onNavigate} />
            ))}
          </div>

          {filteredRecs.length > 6 && (
            <button
              onClick={() => setShowAll(!showAll)}
              className="flex items-center gap-1.5 mx-auto text-xs font-medium text-slate-400 hover:text-slate-600 transition-colors py-2"
            >
              {showAll
                ? <><ChevronUp size={14} /> {lang === "da" ? "Vis færre" : "Show less"}</>
                : <><ChevronDown size={14} /> {lang === "da" ? `Vis alle ${filteredRecs.length} anbefalinger` : `Show all ${filteredRecs.length} recommendations`}</>}
            </button>
          )}
        </div>

        {/* Quick links — building overview */}
        <div className="space-y-3">
          <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">
            {t("buildings", lang)}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {buildings.map(b => {
              const bMeters = getMetersForBuilding(b.id);
              const bRecs = allRecs.filter(r => r.building.id === b.id);
              const bSaving = bRecs.reduce((s, r) => s + r.savingDKK, 0);
              const critCount = bRecs.filter(r => r.priority === "critical").length;
              return (
                <Card
                  key={b.id}
                  className="cursor-pointer hover:shadow-md transition-all group"
                  onClick={() => onNavigate({ page: "building-detail", buildingId: b.id })}
                >
                  <CardContent className="p-4 flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
                      style={{ background: brand.blue + "10" }}>
                      <Building2 size={18} style={{ color: brand.blue }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-[13px] font-semibold group-hover:text-[#3EB1C8] transition-colors truncate" style={{ color: brand.navy }}>
                        {b.name}
                      </h3>
                      <p className="text-[11px] text-slate-400 truncate">{b.address}</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="inline-flex items-center justify-center w-6 h-6 rounded text-[10px] font-bold text-white"
                        style={{ background: EPC_COLORS[b.epc] }}>
                        {b.epc}
                      </span>
                      <div className="text-right">
                        <p className="text-[11px] font-medium tabular-nums" style={{ color: brand.navy }}>{bMeters.length} {lang === "da" ? "målere" : "meters"}</p>
                        {critCount > 0 && (
                          <p className="text-[10px] font-medium text-red-500">{critCount} {lang === "da" ? "kritisk" : "critical"}</p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
