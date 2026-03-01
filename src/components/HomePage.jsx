import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { brand, EPC_COLORS, HOFOR } from "@/lib/brand";
import { t, useLang } from "@/lib/i18n";
import { buildings, meters, getMetersForBuilding } from "@/lib/mockData";
import {
  generatePortfolioInsights,
  INSIGHT_CATEGORIES,
  PRIORITY_CONFIG,
} from "@/lib/insightEngine";
import {
  Building2, Gauge, TrendingDown, AlertTriangle, ArrowRight,
  Zap, Thermometer, Award, Activity, Sparkles, ChevronDown,
  ChevronUp, ExternalLink, BookOpen, MapPin, FileText, Scale, Link2,
} from "lucide-react";
import { InfoTooltip } from "@/components/ui/info-tooltip";

/* ═══════════════════════════════════════════════════════
   Icon mapping (from engine category config)
   ═══════════════════════════════════════════════════════ */
const iconMap = { Thermometer, Award, TrendingDown, Activity };

function getCategoryIcon(category) {
  const cfg = INSIGHT_CATEGORIES[category];
  return cfg ? (iconMap[cfg.iconName] || Zap) : Zap;
}

function getCategoryLabel(category, lang) {
  const cfg = INSIGHT_CATEGORIES[category];
  return cfg?.labelKey?.[lang] || category;
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
function InsightRow({ rec, lang, navigate }) {
  const p = PRIORITY_CONFIG[rec.priority];
  const CatIcon = getCategoryIcon(rec.category);

  return (
    <div
      className="flex items-center gap-3 px-4 py-3 rounded-lg border transition-all hover:shadow-sm cursor-pointer group"
      style={{ borderColor: p.border, background: p.bg + "60" }}
      onClick={() => navigate(`/buildings/${rec.building.id}`)}
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
      {rec.savingDKK > 0 && (
        <div className="text-right shrink-0">
          <p className="text-sm font-bold text-emerald-700 tabular-nums">
            {rec.savingDKK.toLocaleString("da-DK")} DKK
          </p>
          <p className="text-[10px] text-slate-400">/{lang === "da" ? "år" : "yr"}</p>
        </div>
      )}

      <ExternalLink size={12} className="text-slate-300 group-hover:text-slate-500 shrink-0" />
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   Category filter pill
   ═══════════════════════════════════════════════════════ */
function CategoryFilter({ category, count, active, onClick, lang }) {
  const CatIcon = getCategoryIcon(category);
  const label = getCategoryLabel(category, lang);
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
   Savings Methodology Panel — expandable documentation
   with derived configuration values + source attribution
   ═══════════════════════════════════════════════════════ */
function MethodologyPanel({ lang }) {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const methods = [
    { titleKey: "methodTariffTitle", descKey: "methodTariffDesc", icon: Thermometer, color: "#EF4444", sourceTag: "Kamstrup READy + HOFOR" },
    { titleKey: "methodEpcTitle", descKey: "methodEpcDesc", icon: Award, color: "#F59E0B", sourceTag: "EMO / Energistyrelsen" },
    { titleKey: "methodDataQualityTitle", descKey: "methodDataQualityDesc", icon: Activity, color: "#3B82F6", sourceTag: "Data integration health" },
  ];

  /* Derive tariff zone summary from building data */
  const zoneSummary = useMemo(() => {
    const zones = buildings.map(b => b.hoforZone || "standard");
    const unique = [...new Set(zones)];
    if (unique.length === 1) {
      return {
        key: unique[0] === "vesterbro" ? "configTariffZoneVesterbro" : "configTariffZoneStandard",
        mixed: false,
        counts: null,
      };
    }
    const stdCount = zones.filter(z => z === "standard").length;
    const vestCount = zones.filter(z => z === "vesterbro").length;
    return {
      key: "configTariffZoneMixed",
      mixed: true,
      counts: { standard: stdCount, vesterbro: vestCount },
    };
  }, []);

  /* Active config parameters — derived, not user-set */
  const configItems = [
    {
      icon: Thermometer,
      color: "#EF4444",
      label: t("configTariffZone", lang),
      value: zoneSummary.mixed
        ? `${t("configTariffZoneMixed", lang)}`
        : t(zoneSummary.key, lang),
      detail: zoneSummary.mixed
        ? `${zoneSummary.counts.standard} × Standard, ${zoneSummary.counts.vesterbro} × Vesterbro`
        : null,
      source: t("configSupplierContract", lang),
      sourceIcon: FileText,
      link: "/suppliers/hofor",
    },
    {
      icon: Zap,
      color: "#EF4444",
      label: t("configEnergyPrice", lang),
      value: `${HOFOR.energiprisPerMWh} DKK/MWh`,
      detail: `${HOFOR.tariffVersion} · ${lang === "da" ? "gyldig fra" : "effective"} ${HOFOR.tariffEffective}`,
      source: t("configSupplierContract", lang),
      sourceIcon: FileText,
      link: "/suppliers/hofor",
    },
    {
      icon: Award,
      color: "#F59E0B",
      label: t("configEpcTarget", lang),
      value: t("configEpcTargetVal", lang),
      detail: null,
      source: t("configRegulation", lang),
      sourceIcon: Scale,
      link: null,
    },
    {
      icon: MapPin,
      color: "#3B82F6",
      label: t("configNormalYear", lang),
      value: t("configNormalYearVal", lang),
      detail: `GNT = ${Object.values({Jan:480,Feb:410,Mar:340,Apr:210,Maj:100,Jun:30,Jul:8,Aug:15,Sep:80,Okt:230,Nov:360,Dec:460}).reduce((a,b)=>a+b,0)} ${lang === "da" ? "graddage" : "degree days"}`,
      source: t("configBuildingAddress", lang),
      sourceIcon: Building2,
      link: "/buildings",
    },
  ];

  return (
    <div className="mt-1">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 text-[11px] font-medium text-slate-400 hover:text-slate-600 transition-colors"
      >
        <BookOpen size={12} />
        {t("savingsMethodology", lang)}
        {open ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
      </button>
      {open && (
        <div className="mt-3 rounded-lg border border-slate-200 bg-white p-4 space-y-4">

          {/* ── Section 1: Active Configuration ── */}
          <div>
            <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wider mb-2.5">{t("activeConfig", lang)}</p>
            <div className="space-y-2">
              {configItems.map((c, i) => {
                const CIcon = c.icon;
                const SIcon = c.sourceIcon;
                return (
                  <div key={i} className="flex items-start gap-2.5">
                    <div className="w-5 h-5 rounded flex items-center justify-center shrink-0 mt-0.5" style={{ background: c.color + "12" }}>
                      <CIcon size={11} style={{ color: c.color }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline gap-1.5 flex-wrap">
                        <span className="text-[11px] text-slate-400">{c.label}</span>
                        <span className="text-[12px] font-semibold" style={{ color: brand.navy }}>{c.value}</span>
                      </div>
                      {c.detail && (
                        <p className="text-[10px] text-slate-400 mt-0.5">{c.detail}</p>
                      )}
                      <div className="flex items-center gap-1 mt-0.5">
                        <SIcon size={9} className="text-slate-300 shrink-0" />
                        <span className="text-[9px] text-slate-400">{t("configDerivedFrom", lang)}: {c.source}</span>
                        {c.link && (
                          <button
                            onClick={() => navigate(c.link)}
                            className="text-[9px] font-medium hover:underline flex items-center gap-0.5 ml-0.5"
                            style={{ color: brand.blue }}
                          >
                            <Link2 size={8} />
                            {lang === "da" ? "vis" : "view"}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="h-px bg-slate-100" />

          {/* ── Section 2: Calculation Methods (existing) ── */}
          <div>
            <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wider mb-2.5">{t("savingsMethodologySub", lang)}</p>
            {methods.map(m => {
              const MIcon = m.icon;
              return (
                <div key={m.titleKey} className="flex items-start gap-2.5 mb-2.5">
                  <div className="w-6 h-6 rounded flex items-center justify-center shrink-0 mt-0.5" style={{ background: m.color + "12" }}>
                    <MIcon size={12} style={{ color: m.color }} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-[12px] font-semibold" style={{ color: brand.navy }}>{t(m.titleKey, lang)}</p>
                      {m.sourceTag && (
                        <span className="text-[9px] bg-slate-100 text-slate-400 rounded px-1.5 py-0.5 font-medium shrink-0">{m.sourceTag}</span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500 leading-relaxed">{t(m.descKey, lang)}</p>
                  </div>
                </div>
              );
            })}
          </div>

          <p className="text-[10px] text-slate-400 italic border-t border-slate-100 pt-2">{t("methodDisclaimer", lang)}</p>
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   Home Page
   ═══════════════════════════════════════════════════════ */
export default function HomePage() {
  const lang = useLang();
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState(null);
  const [showAll, setShowAll] = useState(false);

  const allRecs = useMemo(() => generatePortfolioInsights(), []);
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
      <div className="max-w-[1200px] mx-auto px-6 py-6 space-y-6">

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
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
                style={{ background: brand.green + "12" }}>
                <TrendingDown size={18} style={{ color: brand.green }} />
              </div>
              <div>
                <div className="flex items-center gap-1">
                  <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">{lang === "da" ? "Besparelsespotentiale" : "Savings Potential"}</p>
                  <InfoTooltip text={t("tooltipSavings", lang)} />
                </div>
                <p className="text-xl font-bold tabular-nums" style={{ color: brand.navy }}>{`${(totalSaving / 1000).toFixed(0)}k`}</p>
                <p className="text-[11px] text-slate-400">{`DKK/${lang === "da" ? "år" : "yr"} · ${allRecs.length} ${t("insightsCount", lang)}`}</p>
              </div>
            </CardContent>
          </Card>
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
                  ? "Prioriterede anbefalinger baseret på løbende dataanalyse"
                  : "Prioritized recommendations based on ongoing data analysis"}
              </p>
            </div>
            {totalSaving > 0 && (
              <div className="text-right">
                <p className="text-lg font-bold text-emerald-700 tabular-nums">
                  {totalSaving.toLocaleString("da-DK")} DKK
                </p>
                <p className="text-[10px] text-slate-400 uppercase tracking-wider">{t("totalPotential", lang)}</p>
              </div>
            )}
          </div>

          {/* Methodology — expandable documentation */}
          <MethodologyPanel lang={lang} />

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
            {Object.entries(categories).map(([cat, { count }]) => (
              <CategoryFilter
                key={cat}
                category={cat}
                count={count}
                active={activeCategory === cat}
                onClick={() => setActiveCategory(activeCategory === cat ? null : cat)}
                lang={lang}
              />
            ))}
          </div>

          {/* Insight list */}
          <div className="space-y-2">
            {displayRecs.map(rec => (
              <InsightRow key={rec.id} rec={rec} lang={lang} navigate={navigate} />
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
              const critCount = bRecs.filter(r => r.priority === "critical").length;
              const issueMeters = bMeters.filter(m => m.status === "error" || m.status === "offline").length;
              const allReporting = issueMeters === 0;
              return (
                <Card
                  key={b.id}
                  className="cursor-pointer hover:shadow-md transition-all group"
                  onClick={() => navigate(`/buildings/${b.id}`)}
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
                      {/* Data completeness indicator */}
                      <div className="flex items-center gap-1.5 mt-1">
                        <span className={`w-1.5 h-1.5 rounded-full ${allReporting ? "bg-emerald-400" : "bg-amber-400"}`} />
                        <span className="text-[10px] text-slate-400">
                          {allReporting
                            ? t("allMetersReporting", lang)
                            : `${issueMeters} ${t("metersWithIssues", lang)}`}
                        </span>
                      </div>
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
