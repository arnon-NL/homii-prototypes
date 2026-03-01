import React, { useMemo, useState } from "react";
import { brand } from "@/lib/brand";
import { t, useLang } from "@/lib/i18n";
import {
  generateBuildingInsights,
  INSIGHT_CATEGORIES,
  PRIORITY_CONFIG,
} from "@/lib/insightEngine";
import {
  TrendingDown, ArrowRight, Zap, Thermometer, Award, Activity,
  Sparkles, ChevronDown, ChevronUp,
} from "lucide-react";

/* ═══════════════════════════════════════════════════════
   Category Icon Mapping
   ═══════════════════════════════════════════════════════ */
const iconMap = {
  Thermometer,
  Award,
  TrendingDown,
  Activity,
};

function getCategoryIcon(category) {
  const cfg = INSIGHT_CATEGORIES[category];
  return cfg ? (iconMap[cfg.iconName] || Zap) : Zap;
}

/* ═══════════════════════════════════════════════════════
   Insight Card — single recommendation display
   ═══════════════════════════════════════════════════════ */
function InsightCard({ rec, lang }) {
  const p = PRIORITY_CONFIG[rec.priority];
  const CatIcon = getCategoryIcon(rec.category);

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
            {rec.savingDKK > 0 && (
              <div className="flex items-center gap-1.5">
                <TrendingDown size={12} className="text-emerald-600" />
                <span className="text-sm font-bold text-emerald-700">
                  {rec.savingDKK.toLocaleString("da-DK")} DKK
                </span>
                <span className="text-[10px] text-slate-400">/{lang === "da" ? "år" : "yr"}</span>
              </div>
            )}
            {rec.metric.target && (
              <div className="flex items-center gap-1 text-[10px] text-slate-500">
                <span className="font-mono font-medium" style={{ color: p.dot }}>{rec.metric.value}</span>
                <ArrowRight size={10} />
                <span className="font-mono font-medium text-emerald-600">{rec.metric.target}</span>
              </div>
            )}
            {!rec.metric.target && rec.metric.value && (
              <div className="flex items-center gap-1 text-[10px] text-slate-500">
                <span className="font-mono font-medium" style={{ color: p.dot }}>{rec.metric.value}</span>
              </div>
            )}
            <span className="text-[10px] text-slate-400 ml-auto">{t(rec.timelineKey, lang)}</span>
          </div>
          {rec.dataSource && (
            <p className="text-[9px] text-slate-300 mt-2 uppercase tracking-wider">{rec.dataSource}</p>
          )}
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   SmartInsights — collapsible building-level widget
   ═══════════════════════════════════════════════════════ */
export default function SmartInsights({ building }) {
  const lang = useLang();
  const [expanded, setExpanded] = useState(false);
  const recs = useMemo(() => generateBuildingInsights(building), [building]);
  const totalSaving = recs.reduce((s, r) => s + r.savingDKK, 0);

  if (recs.length === 0) return null;

  return (
    <div className="mt-4">
      {/* Collapsible header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-2 p-3 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors"
      >
        <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: brand.blue + "15" }}>
          <Sparkles size={14} style={{ color: brand.blue }} />
        </div>
        <div className="flex-1 text-left">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold" style={{ color: brand.navy }}>
              {t("smartInsightsTitle", lang)}
            </h3>
            <span className="text-[11px] text-slate-400">
              {recs.length} {t("insightsCount", lang)}
            </span>
          </div>
        </div>
        <div className="text-right mr-2">
          {totalSaving > 0 && (
            <>
              <p className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">
                {t("totalPotential", lang)}
              </p>
              <p className="text-sm font-bold text-emerald-700">
                {totalSaving.toLocaleString("da-DK")} DKK/{lang === "da" ? "år" : "yr"}
              </p>
            </>
          )}
        </div>
        {expanded ? <ChevronUp size={16} className="text-slate-400" /> : <ChevronDown size={16} className="text-slate-400" />}
      </button>

      {/* Expanded recommendations */}
      {expanded && (
        <div className="flex flex-col gap-3 mt-3">
          {recs.map(rec => (
            <InsightCard key={rec.id} rec={rec} lang={lang} />
          ))}
        </div>
      )}
    </div>
  );
}
