import React, { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Database, Zap, Flame, Droplets, AlertTriangle, CheckCircle2, Clock, Thermometer } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { brand } from "@/lib/brand";
import { t, useLang } from "@/lib/i18n";
import { meters as allMeters, getBuilding } from "@/lib/mockData";
import { StatusBadge } from "@/components/ui/status-badge";

/* ── type icons / colors (reuse from MetersPage pattern) ── */
const typeIcons  = { fjernvarme: Flame, vand: Droplets, el: Zap };
const typeColors = { fjernvarme: "#EF4444", vand: "#3B82F6", el: "#F59E0B" };

const qualityMap   = { high: 3, medium: 2, low: 1 };
const qualityLabel = { high: "qualityHigh", medium: "qualityMedium", low: "qualityLow" };
const qualityColor = { high: "#10B981", medium: "#F59E0B", low: "#EF4444" };

/* ── Source metadata ── */
const sourceMeta = {
  eloverblik:      { icon: Zap,      nameKey: "viaEloverblik",    descKey: "eloverblikDesc",  latencyKey: "dPlus1" },
  "kamstrup-ready": { icon: Database, nameKey: "viaKamstrupReady", descKey: "kamstrupDesc",    latencyKey: "realTime" },
};

/* ── Helpers ── */
const fmtDate = (iso, lang) => {
  if (!iso) return "–";
  const d = new Date(iso);
  return d.toLocaleDateString(lang === "da" ? "da-DK" : "en-GB", { day: "numeric", month: "short", year: "numeric" });
};

const qualityLabelFromAvg = (avg, lang) => {
  if (avg >= 2.5) return t("qualityHigh", lang);
  if (avg >= 1.5) return t("qualityMedium", lang);
  return t("qualityLow", lang);
};

/* ════════════════════════════════════════════════════════════ */
export default function DataSourcesPage() {
  const lang = useLang();
  const navigate = useNavigate();

  /* ── Aggregate per data source ── */
  const sources = useMemo(() => {
    const groups = { eloverblik: [], "kamstrup-ready": [] };
    allMeters.forEach(m => { if (groups[m.dataSource]) groups[m.dataSource].push(m); });

    return Object.entries(groups).map(([key, list]) => {
      const active  = list.filter(m => m.status === "active");
      const issues  = list.filter(m => m.status !== "active");
      const avgQual = list.length ? list.reduce((s, m) => s + qualityMap[m.dataQuality], 0) / list.length : 0;
      const latestSync = list.reduce((mx, m) => (m.lastReading.receivedDate > mx ? m.lastReading.receivedDate : mx), "");

      const typeBreakdown = {};
      list.forEach(m => { typeBreakdown[m.type] = (typeBreakdown[m.type] || 0) + 1; });

      const qualityBreakdown = {};
      list.forEach(m => { qualityBreakdown[m.dataQuality] = (qualityBreakdown[m.dataQuality] || 0) + 1; });

      const tempCount = list.filter(m => m.hasTemperatureData).length;

      return { key, meters: list, active, issues, avgQual, latestSync, typeBreakdown, qualityBreakdown, tempCount };
    });
  }, []);

  const totalMeters  = sources.reduce((s, src) => s + src.meters.length, 0);
  const activeTotal  = sources.reduce((s, src) => s + src.active.length, 0);
  const issueTotal   = sources.reduce((s, src) => s + src.issues.length, 0);
  const avgQualAll   = totalMeters ? sources.reduce((s, src) => s + src.avgQual * src.meters.length, 0) / totalMeters : 0;
  const allIssues    = sources.flatMap(src => src.issues);

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

        {/* ── KPI Row ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <Kpi label={t("totalMeters", lang)}      value={totalMeters} />
          <Kpi label={t("activeMeters", lang)}      value={activeTotal}  accent="#10B981" />
          <Kpi label={t("metersWithIssues", lang)}  value={issueTotal}   accent={issueTotal > 0 ? "#EF4444" : "#10B981"} />
          <Kpi label={t("dataQualityAvg", lang)}    value={qualityLabelFromAvg(avgQualAll, lang)}
               accent={avgQualAll >= 2.5 ? "#10B981" : avgQualAll >= 1.5 ? "#F59E0B" : "#EF4444"} />
        </div>

        {/* ── Data Source Cards ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {sources.map(src => {
            const meta = sourceMeta[src.key];
            const SrcIcon = meta.icon;
            const hasIssues = src.issues.length > 0;
            const connectionStatus = hasIssues ? "warning" : "active";

            return (
              <Card key={src.key} className="border-slate-200">
                <CardContent className="p-5 space-y-4">

                  {/* Card header */}
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg flex items-center justify-center"
                      style={{ background: (src.key === "eloverblik" ? "#F59E0B" : "#3B82F6") + "15" }}>
                      <SrcIcon size={18} style={{ color: src.key === "eloverblik" ? "#F59E0B" : "#3B82F6" }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-[15px] font-semibold" style={{ color: brand.navy }}>
                          {t(meta.nameKey, lang)}
                        </span>
                        <StatusBadge status={connectionStatus} label={hasIssues ? `${src.issues.length} ${t("metersWithIssues", lang)}` : t("connected", lang)} lang={lang} />
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5">{t(meta.descKey, lang)}</div>
                    </div>
                  </div>

                  {/* Divider */}
                  <div className="h-px bg-slate-100" />

                  {/* Info grid */}
                  <div className="grid grid-cols-2 gap-y-3 gap-x-4">
                    <div>
                      <div className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">{t("latency", lang)}</div>
                      <div className="text-[13px] font-medium text-slate-700 mt-0.5">{t(meta.latencyKey, lang)}</div>
                    </div>
                    <div>
                      <div className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">{t("lastSync", lang)}</div>
                      <div className="text-[13px] font-medium text-slate-700 mt-0.5 flex items-center gap-1.5">
                        <Clock size={12} className="text-slate-400" />
                        {fmtDate(src.latestSync, lang)}
                      </div>
                    </div>
                    <div>
                      <div className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">{t("totalMeters", lang)}</div>
                      <div className="text-[13px] font-medium text-slate-700 mt-0.5">{src.meters.length}</div>
                    </div>
                    <div>
                      <div className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">{t("dataQualityAvg", lang)}</div>
                      <div className="text-[13px] font-medium mt-0.5" style={{ color: src.avgQual >= 2.5 ? "#10B981" : src.avgQual >= 1.5 ? "#F59E0B" : "#EF4444" }}>
                        {qualityLabelFromAvg(src.avgQual, lang)}
                      </div>
                    </div>
                  </div>

                  {/* Divider */}
                  <div className="h-px bg-slate-100" />

                  {/* Meter type breakdown */}
                  <div>
                    <div className="text-[10px] font-medium text-slate-400 uppercase tracking-wider mb-2">{t("meterType", lang)}</div>
                    <div className="flex flex-wrap gap-2">
                      {Object.entries(src.typeBreakdown).map(([type, count]) => {
                        const TIcon = typeIcons[type] || Flame;
                        const color = typeColors[type] || "#6B7280";
                        return (
                          <div key={type} className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[12px] font-medium"
                            style={{ background: color + "10", color }}>
                            <TIcon size={13} />
                            <span>{count} {t(type, lang)}</span>
                          </div>
                        );
                      })}
                    </div>
                    {src.tempCount > 0 && (
                      <div className="flex items-center gap-1.5 mt-2 text-[11px] text-slate-400">
                        <Thermometer size={12} />
                        <span>{src.tempCount} {t("tempDataCount", lang)}</span>
                      </div>
                    )}
                  </div>

                  {/* Quality breakdown */}
                  <div>
                    <div className="text-[10px] font-medium text-slate-400 uppercase tracking-wider mb-2">{t("dataQualityAvg", lang)}</div>
                    <div className="flex gap-1 h-2 rounded-full overflow-hidden bg-slate-100">
                      {["high", "medium", "low"].map(q => {
                        const count = src.qualityBreakdown[q] || 0;
                        if (!count) return null;
                        const pct = (count / src.meters.length) * 100;
                        return (
                          <div key={q} className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: qualityColor[q] }} />
                        );
                      })}
                    </div>
                    <div className="flex gap-3 mt-1.5">
                      {["high", "medium", "low"].map(q => {
                        const count = src.qualityBreakdown[q] || 0;
                        if (!count) return null;
                        return (
                          <div key={q} className="flex items-center gap-1 text-[11px] text-slate-500">
                            <div className="w-2 h-2 rounded-full" style={{ background: qualityColor[q] }} />
                            {t(qualityLabel[q], lang)} ({count})
                          </div>
                        );
                      })}
                    </div>
                  </div>

                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* ── Issues Table ── */}
        {allIssues.length > 0 ? (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle size={16} className="text-amber-500" />
              <span className="text-[15px] font-semibold" style={{ color: brand.navy }}>{t("metersAttention", lang)}</span>
              <span className="text-[11px] font-medium text-white bg-red-500 rounded-full px-2 py-0.5">{allIssues.length}</span>
            </div>
            <div className="rounded-lg border border-slate-200 bg-white overflow-hidden">
              <table className="w-full text-[13px]">
                <thead>
                  <tr className="bg-slate-50/80 text-left text-[11px] font-medium text-slate-500 uppercase tracking-wider">
                    <th className="px-4 py-2.5">{t("meterId", lang)}</th>
                    <th className="px-4 py-2.5">{t("meterType", lang)}</th>
                    <th className="px-4 py-2.5">{t("building", lang)}</th>
                    <th className="px-4 py-2.5">{t("dataSource", lang)}</th>
                    <th className="px-4 py-2.5">{t("status", lang)}</th>
                    <th className="px-4 py-2.5">{t("detail", lang)}</th>
                    <th className="px-4 py-2.5">{t("lastSync", lang)}</th>
                  </tr>
                </thead>
                <tbody>
                  {allIssues.map(m => {
                    const building = getBuilding(m.buildingId);
                    const TIcon = typeIcons[m.type] || Flame;
                    const detailText = m.statusDetail
                      ? (typeof m.statusDetail === "object" ? m.statusDetail[lang] || m.statusDetail.en : m.statusDetail)
                      : "–";
                    return (
                      <tr key={m.id} className="border-t border-slate-100 hover:bg-slate-50/80 cursor-pointer transition-colors"
                        onClick={() => navigate(`/meters/${m.id}`)}>
                        <td className="px-4 py-2.5 font-medium" style={{ color: brand.blue }}>{m.id}</td>
                        <td className="px-4 py-2.5">
                          <div className="flex items-center gap-1.5">
                            <TIcon size={13} style={{ color: typeColors[m.type] }} />
                            <span className="text-slate-600">{t(m.type, lang)}</span>
                          </div>
                        </td>
                        <td className="px-4 py-2.5 text-slate-600">{building?.name || m.buildingId}</td>
                        <td className="px-4 py-2.5 text-slate-600">{t(m.dataSource === "eloverblik" ? "viaEloverblik" : "viaKamstrupReady", lang)}</td>
                        <td className="px-4 py-2.5"><StatusBadge status={m.status} lang={lang} /></td>
                        <td className="px-4 py-2.5 text-slate-500 text-[12px] max-w-[220px] truncate" title={detailText}>{detailText}</td>
                        <td className="px-4 py-2.5 text-slate-500">{fmtDate(m.lastReading.receivedDate, lang)}</td>
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
