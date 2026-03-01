import React, { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Database, Zap, Flame, Droplets, AlertTriangle, CheckCircle2,
  Clock, Building2, FileCheck, ShieldCheck, BarChart3,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { brand } from "@/lib/brand";
import { t, useLang } from "@/lib/i18n";
import { dataSources, getDataSourceRecords } from "@/lib/mockData";
import { StatusBadge } from "@/components/ui/status-badge";

/* ── Category → icon / color mapping ── */
const categoryMeta = {
  "meter-data":          { icon: Zap,        color: "#3B82F6", labelKey: "categoryMeterData" },
  "certification":       { icon: FileCheck,   color: "#8B5CF6", labelKey: "categoryCertification" },
  "building-attributes": { icon: Building2,   color: "#0EA5E9", labelKey: "categoryBuildingAttr" },
};

/* ── Breakdown item icons (for meter types) ── */
const breakdownIcons  = { fjernvarme: Flame, vand: Droplets, el: Zap };
const breakdownColors = { fjernvarme: "#EF4444", vand: "#3B82F6", el: "#F59E0B" };

/* EPC rating colors */
const epcColors = { A: "#16A34A", B: "#22C55E", C: "#EAB308", D: "#F59E0B", E: "#EF4444", F: "#DC2626", G: "#991B1B" };

const qualityColor = { high: "#10B981", medium: "#F59E0B", low: "#EF4444" };

/* ── Helpers ── */
const fmtDate = (iso, lang) => {
  if (!iso) return "–";
  const d = new Date(iso);
  return d.toLocaleDateString(lang === "da" ? "da-DK" : "en-GB", { day: "numeric", month: "short", year: "numeric" });
};

const fmtDateTime = (iso, lang) => {
  if (!iso) return "–";
  const d = new Date(iso);
  return d.toLocaleDateString(lang === "da" ? "da-DK" : "en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
};

const healthLabel = (pct) => `${Math.round(pct * 100)}%`;

const healthColor = (pct) => {
  if (pct >= 0.85) return "#10B981";
  if (pct >= 0.6)  return "#F59E0B";
  return "#EF4444";
};

/* ── Get the right icon for a breakdown key ── */
const getBreakdownMeta = (key, sourceCategory) => {
  // Meter type breakdowns
  if (breakdownIcons[key]) return { Icon: breakdownIcons[key], color: breakdownColors[key], labelKey: key };
  // EPC ratings
  if (/^[A-G]$/.test(key)) return { Icon: ShieldCheck, color: epcColors[key] || "#6B7280", labelKey: `epcRating${key}` };
  // Building type
  return { Icon: Building2, color: "#6B7280", labelKey: key };
};

/* ════════════════════════════════════════════════════════════ */
export default function DataSourcesPage() {
  const lang = useLang();
  const navigate = useNavigate();

  /* ── Compute records for every source ── */
  const enriched = useMemo(() => {
    return dataSources.map(src => ({
      ...src,
      records: getDataSourceRecords(src.id),
      meta: categoryMeta[src.category] || categoryMeta["meter-data"],
    }));
  }, []);

  /* ── Portfolio-wide KPIs ── */
  const connectedCount = enriched.filter(s => s.status === "connected").length;
  const totalRecords   = enriched.reduce((s, src) => s + (src.records?.total || 0), 0);
  const totalIssues    = enriched.reduce((s, src) => s + (src.records?.issueCount || 0), 0);
  const avgHealth      = totalRecords > 0
    ? enriched.reduce((s, src) => s + (src.records?.healthPct || 0) * (src.records?.total || 0), 0) / totalRecords
    : 0;
  const allIssues      = enriched.flatMap(src =>
    (src.records?.issues || []).map(issue => ({ ...issue, sourceId: src.id, sourceNameKey: src.nameKey }))
  );

  /* ── KPI card helper ── */
  const Kpi = ({ label, value, accent, sub }) => (
    <Card className="border-slate-200">
      <CardContent className="p-4">
        <div className="text-[11px] font-medium text-slate-400 uppercase tracking-wider mb-1">{label}</div>
        <div className="text-2xl font-bold tabular-nums" style={{ color: accent || brand.navy }}>{value}</div>
        {sub && <div className="text-[11px] text-slate-400 mt-0.5">{sub}</div>}
      </CardContent>
    </Card>
  );

  /* ════════════════════════════════════════════════════════ */
  return (
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-6xl mx-auto px-6 py-6 space-y-6">

        {/* ── Header ── */}
        <div>
          <h1 className="text-2xl font-bold" style={{ color: brand.navy }}>{t("dataSources", lang)}</h1>
          <p className="text-sm text-slate-500 mt-1">{t("dataSourcesSub", lang)}</p>
        </div>

        {/* ── KPI Row (source-agnostic) ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <Kpi label={t("activeSources", lang)}     value={`${connectedCount} / ${enriched.length}`} accent="#10B981"
               sub={`${enriched.length} ${t("dataSources", lang).toLowerCase()}`} />
          <Kpi label={t("totalRecords", lang)}       value={totalRecords} />
          <Kpi label={t("recordsWithIssues", lang)}  value={totalIssues}
               accent={totalIssues > 0 ? "#EF4444" : "#10B981"} />
          <Kpi label={t("overallHealth", lang)}       value={healthLabel(avgHealth)}
               accent={healthColor(avgHealth)} />
        </div>

        {/* ── Data Source Cards ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {enriched.map(src => {
            const { meta, records } = src;
            const SrcIcon = meta.icon;
            const hasIssues = (records?.issueCount || 0) > 0;
            const connectionStatus = src.status === "connected"
              ? (hasIssues ? "warning" : "active")
              : "error";

            return (
              <Card key={src.id} className="border-slate-200">
                <CardContent className="p-5 space-y-4">

                  {/* Card header */}
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg flex items-center justify-center"
                      style={{ background: meta.color + "15" }}>
                      <SrcIcon size={18} style={{ color: meta.color }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-[15px] font-semibold" style={{ color: brand.navy }}>
                          {t(src.nameKey, lang)}
                        </span>
                        <StatusBadge
                          status={connectionStatus}
                          label={hasIssues
                            ? `${records.issueCount} ${t("recordsWithIssues", lang).toLowerCase()}`
                            : t("connected", lang)}
                          lang={lang}
                        />
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5">{t(src.descKey, lang)}</div>
                    </div>
                  </div>

                  {/* Category tag */}
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-medium uppercase tracking-wider px-2 py-0.5 rounded-md"
                      style={{ background: meta.color + "10", color: meta.color }}>
                      {t(meta.labelKey, lang)}
                    </span>
                  </div>

                  {/* Divider */}
                  <div className="h-px bg-slate-100" />

                  {/* Info grid — source-agnostic 2×2 */}
                  <div className="grid grid-cols-2 gap-y-3 gap-x-4">
                    <div>
                      <div className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">{t("syncPattern", lang)}</div>
                      <div className="text-[13px] font-medium text-slate-700 mt-0.5">{t(src.syncPatternKey, lang)}</div>
                    </div>
                    <div>
                      <div className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">{t("lastSync", lang)}</div>
                      <div className="text-[13px] font-medium text-slate-700 mt-0.5 flex items-center gap-1.5">
                        <Clock size={12} className="text-slate-400" />
                        {fmtDateTime(src.lastSync, lang)}
                      </div>
                    </div>
                    <div>
                      <div className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">{t("recordsLabel", lang)}</div>
                      <div className="text-[13px] font-medium text-slate-700 mt-0.5">
                        {records?.total || 0}
                        <span className="text-slate-400 font-normal ml-1">
                          ({records?.healthy || 0} {t("healthyLabel", lang)})
                        </span>
                      </div>
                    </div>
                    <div>
                      <div className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">{t("coverageLabel", lang)}</div>
                      <div className="text-[13px] font-medium text-slate-700 mt-0.5">
                        {records?.coverage?.covered || 0} / {records?.coverage?.total || 0}
                        <span className="text-slate-400 font-normal ml-1">
                          {t("ofBuildings", lang)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Divider */}
                  <div className="h-px bg-slate-100" />

                  {/* Record breakdown (generic) */}
                  {records?.breakdown?.length > 0 && (
                    <div>
                      <div className="text-[10px] font-medium text-slate-400 uppercase tracking-wider mb-2">{t("breakdownLabel", lang)}</div>
                      <div className="flex flex-wrap gap-2">
                        {records.breakdown.map(({ key, count }) => {
                          const bm = getBreakdownMeta(key, src.category);
                          const BIcon = bm.Icon;
                          return (
                            <div key={key} className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[12px] font-medium"
                              style={{ background: bm.color + "10", color: bm.color }}>
                              <BIcon size={13} />
                              <span>{count} {t(bm.labelKey, lang)}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Health bar */}
                  {records?.qualityBreakdown && (
                    <div>
                      <div className="text-[10px] font-medium text-slate-400 uppercase tracking-wider mb-2">{t("healthLabel", lang)}</div>
                      <div className="flex gap-1 h-2 rounded-full overflow-hidden bg-slate-100">
                        {["high", "medium", "low"].map(q => {
                          const count = records.qualityBreakdown[q] || 0;
                          if (!count) return null;
                          const pct = (count / records.total) * 100;
                          return (
                            <div key={q} className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: qualityColor[q] }} />
                          );
                        })}
                      </div>
                      <div className="flex gap-3 mt-1.5">
                        {["high", "medium", "low"].map(q => {
                          const count = records.qualityBreakdown[q] || 0;
                          if (!count) return null;
                          return (
                            <div key={q} className="flex items-center gap-1 text-[11px] text-slate-500">
                              <div className="w-2 h-2 rounded-full" style={{ background: qualityColor[q] }} />
                              {t(`quality${q.charAt(0).toUpperCase() + q.slice(1)}`, lang)} ({count})
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* ── Issues Table (source-agnostic) ── */}
        {allIssues.length > 0 ? (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle size={16} className="text-amber-500" />
              <span className="text-[15px] font-semibold" style={{ color: brand.navy }}>{t("issuesAttention", lang)}</span>
              <span className="text-[11px] font-medium text-white bg-red-500 rounded-full px-2 py-0.5">{allIssues.length}</span>
            </div>
            <div className="rounded-lg border border-slate-200 bg-white overflow-hidden">
              <table className="w-full text-[13px]">
                <thead>
                  <tr className="bg-slate-50/80 text-left text-[11px] font-medium text-slate-500 uppercase tracking-wider">
                    <th className="px-4 py-2.5">{t("recordId", lang)}</th>
                    <th className="px-4 py-2.5">{t("source", lang)}</th>
                    <th className="px-4 py-2.5">{t("entity", lang)}</th>
                    <th className="px-4 py-2.5">{t("status", lang)}</th>
                    <th className="px-4 py-2.5">{t("detail", lang)}</th>
                    <th className="px-4 py-2.5">{t("lastUpdated", lang)}</th>
                  </tr>
                </thead>
                <tbody>
                  {allIssues.map((issue, idx) => {
                    const detailText = issue.detail
                      ? (typeof issue.detail === "object" ? issue.detail[lang] || issue.detail.en : issue.detail)
                      : "–";
                    return (
                      <tr key={`${issue.recordId}-${idx}`}
                        className="border-t border-slate-100 hover:bg-slate-50/80 cursor-pointer transition-colors"
                        onClick={() => navigate(issue.recordLink)}>
                        <td className="px-4 py-2.5 font-medium" style={{ color: brand.blue }}>{issue.recordId}</td>
                        <td className="px-4 py-2.5 text-slate-600">{t(issue.sourceNameKey, lang)}</td>
                        <td className="px-4 py-2.5 text-slate-600">{issue.entityLabel}</td>
                        <td className="px-4 py-2.5"><StatusBadge status={issue.status} lang={lang} /></td>
                        <td className="px-4 py-2.5 text-slate-500 text-[12px] max-w-[220px] truncate" title={detailText}>{detailText}</td>
                        <td className="px-4 py-2.5 text-slate-500">{fmtDate(issue.lastUpdated, lang)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2 text-[13px] text-emerald-600 bg-emerald-50 rounded-lg px-4 py-3 border border-emerald-100">
            <CheckCircle2 size={16} />
            <span>{t("noIssues", lang)}</span>
          </div>
        )}

      </div>
    </div>
  );
}
