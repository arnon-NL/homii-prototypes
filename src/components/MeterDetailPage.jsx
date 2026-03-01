import React, { useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Flame, Droplets, Zap, Activity, ChevronRight, AlertCircle, Radio, Clock } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Line, ComposedChart, Legend, ReferenceLine } from "recharts";
import { brand, EPC_COLORS, HOFOR } from "@/lib/brand";
import { t, useLang, MS, ML } from "@/lib/i18n";
import { getMeter, getBuilding, getSupplier, meters, billingCycles } from "@/lib/mockData";
import { StatusBadge } from "@/components/ui/status-badge";
import { AttributePanel, AttrSection, AttrRow, AttrLink } from "@/components/ui/attribute-panel";
import { InfoTooltip, TimePeriodLabel } from "@/components/ui/info-tooltip";
import Breadcrumbs from "./Breadcrumbs";

const typeIcons = { fjernvarme: Flame, vand: Droplets, el: Zap };
const typeColors = { fjernvarme: "#EF4444", vand: "#3B82F6", el: "#F59E0B" };

/* ── Seeded pseudo-random helper ── */
const seeded = (seed) => (n) => Math.sin(seed * 137 + n * 31) * 0.5 + 0.5;

/* ═══════════════════════════════════════════════════════
   Data generators — values scaled to match lastReading
   ═══════════════════════════════════════════════════════ */

/* Monthly readings — scaled so Feb (latest month) ≈ lastReading value */
function generateMonthlyReadings(meter, lang) {
  const ms = MS[lang];
  const r = seeded(meter.id.split("").reduce((s, c) => s + c.charCodeAt(0), 0));
  const latestValue = meter.lastReading.value;
  const LATEST_MONTH = 1; // Feb = index 1 (latest data month)

  // Seasonal profile per utility type
  const profile = meter.type === "fjernvarme"
    ? [1.6, 1.5, 1.3, 0.8, 0.3, 0.1, 0.05, 0.05, 0.3, 0.9, 1.3, 1.6]
    : meter.type === "vand"
    ? [1.0, 0.95, 0.95, 1.0, 1.05, 1.1, 1.1, 1.05, 1.0, 0.95, 0.95, 0.95]
    : [1.1, 1.05, 1.0, 0.95, 0.9, 0.85, 0.85, 0.9, 0.95, 1.0, 1.05, 1.15];

  const factors = ms.map((_, i) => profile[i] + r(i) * 0.15);
  const latestFactor = factors[LATEST_MONTH];

  // Scale so latest month's bar ≈ lastReading.value, others proportional
  return ms.map((month, i) => ({
    name: month,
    value: +((latestValue * factors[i]) / latestFactor).toFixed(1),
    _monthIdx: i,
  }));
}

/* Daily readings for a given month — scaled to that month's total */
function generateDailyData(meter, monthIdx, monthlyTotal) {
  const seed = meter.id.split("").reduce((s, c) => s + c.charCodeAt(0), 0);
  const r = (n) => Math.sin(seed * 200 + monthIdx * 50 + n * 13) * 0.5 + 0.5;
  const daysInMonth = new Date(2026, monthIdx + 1, 0).getDate();
  const rawValues = Array.from({ length: daysInMonth }, (_, d) => 0.7 + r(d) * 0.6);
  const rawSum = rawValues.reduce((a, b) => a + b, 0);

  return rawValues.map((v, d) => ({
    name: `${d + 1}`,
    day: d + 1,
    value: +((monthlyTotal * v) / rawSum).toFixed(2),
  }));
}

/* Hourly readings for a given day — scaled to that day's total */
function generateHourlyData(meter, monthIdx, dayOfMonth, dailyTotal) {
  const seed = meter.id.split("").reduce((s, c) => s + c.charCodeAt(0), 0);
  const r = (n) => Math.sin(seed * 300 + monthIdx * 70 + dayOfMonth * 30 + n * 7) * 0.5 + 0.5;
  // Typical hourly consumption profile
  const profile = [0.3,0.2,0.2,0.2,0.3,0.5,0.8,1.0,0.9,0.8,0.7,0.7,0.8,0.7,0.7,0.8,0.9,1.0,1.0,0.9,0.8,0.6,0.4,0.3];
  const rawValues = profile.map((p, h) => p + r(h) * 0.3);
  const rawSum = rawValues.reduce((a, b) => a + b, 0);

  return rawValues.map((v, h) => ({
    name: `${String(h).padStart(2, "0")}:00`,
    value: +((dailyTotal * v) / rawSum).toFixed(3),
  }));
}

/* Recent readings table — 48 entries for hourly, 10 for daily */
function generateRecentReadings(meter) {
  const seed = meter.id.split("").reduce((s, c) => s + c.charCodeAt(0), 0);
  const r = (n) => Math.sin(seed * 77 + n * 23) * 0.5 + 0.5;
  const baseValue = meter.lastReading.value;
  const isHourly = meter.readingFrequency === "hourly";
  const count = isHourly ? 48 : 10;
  return Array.from({ length: count }, (_, i) => {
    const date = new Date("2026-02-24T14:00:00");
    if (isHourly) {
      date.setHours(date.getHours() - i);
    } else {
      date.setDate(date.getDate() - i);
    }
    const diff = r(i) * (baseValue * 0.005);
    const dateStr = isHourly
      ? `${date.toISOString().split("T")[0]} ${String(date.getHours()).padStart(2,"0")}:00`
      : date.toISOString().split("T")[0];
    return {
      date: dateStr,
      value: +(baseValue - diff * i * 0.1).toFixed(1),
      unit: meter.lastReading.unit,
    };
  });
}

/* Temperature data for DH meters — configurable number of days */
function generateTempData(meter, days) {
  const seed = meter.id.split("").reduce((s, c) => s + c.charCodeAt(0), 0);
  const r = (n) => Math.sin(seed * 100 + n * 17) * 0.5 + 0.5;
  return Array.from({ length: days }, (_, n) => {
    const daysAgo = days - n;
    const d = new Date("2026-02-24");
    d.setDate(d.getDate() - daysAgo);
    // Seasonal: winter months (Nov-Feb) are colder → higher supply
    const month = d.getMonth();
    const isWinter = month <= 2 || month >= 10;
    const supply = isWinter ? 78 + r(n) * 8 : 68 + r(n) * 6;
    const ret = isWinter ? 42 + r(n + 100) * 12 : 35 + r(n + 100) * 10;
    const cooling = supply - ret;
    // Label: for ≤90 days show "D-N", for longer show month abbreviation at month boundaries
    let label;
    if (days <= 90) {
      label = `D-${daysAgo}`;
    } else {
      label = `${d.getDate() === 1 || n === 0 ? MS.en[month].substring(0,3) : ""}`;
    }
    return {
      name: label || "",
      fullDate: d.toISOString().split("T")[0],
      supply: +supply.toFixed(1),
      return: +ret.toFixed(1),
      cooling: +cooling.toFixed(1),
    };
  });
}

/* ── Shared tooltip ── */
const BrandTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg px-3 py-2.5 shadow-xl text-xs border" style={{ background: brand.surface, borderColor: brand.border }}>
      <div className="font-semibold mb-1.5" style={{ color: brand.navy }}>{label}</div>
      {payload.map((p, idx) => (
        <div key={idx} className="flex items-center gap-2 py-0.5" style={{ color: brand.text }}>
          <span className="w-2 h-2 rounded-full shrink-0" style={{ background: p.color }} />
          <span className="text-slate-500">{p.name}:</span>
          <span className="font-semibold ml-auto tabular-nums">{typeof p.value === "number" ? p.value.toFixed(1) : p.value}</span>
        </div>
      ))}
    </div>
  );
};

/* ── Temp tooltip with full date ── */
const TempTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  const fullDate = payload[0]?.payload?.fullDate || label;
  return (
    <div className="rounded-lg px-3 py-2.5 shadow-xl text-xs border" style={{ background: brand.surface, borderColor: brand.border }}>
      <div className="font-semibold mb-1.5" style={{ color: brand.navy }}>{fullDate}</div>
      {payload.map((p, idx) => (
        <div key={idx} className="flex items-center gap-2 py-0.5" style={{ color: brand.text }}>
          <span className="w-2 h-2 rounded-full shrink-0" style={{ background: p.color }} />
          <span className="text-slate-500">{p.name}:</span>
          <span className="font-semibold ml-auto tabular-nums">{typeof p.value === "number" ? p.value.toFixed(1) : p.value}</span>
        </div>
      ))}
    </div>
  );
};

/* ═══════════════════════════════════════════════════════
   Component
   ═══════════════════════════════════════════════════════ */
export default function MeterDetailPage() {
  const { meterId } = useParams();
  const navigate = useNavigate();
  const lang = useLang();
  const meter = getMeter(meterId);

  /* ── Zoom & range state ── */
  const [chartZoom, setChartZoom] = useState({ level: "year" });
  const [tempRange, setTempRange] = useState(30);

  if (!meter) return <div className="p-6 text-slate-400">Meter not found</div>;

  const building = getBuilding(meter.buildingId);
  const supplier = getSupplier(meter.supplierId);
  const SvcIcon = typeIcons[meter.type] || Flame;
  const color = typeColors[meter.type];
  const isHourly = meter.readingFrequency === "hourly";

  /* ── Data ── */
  const monthlyData = useMemo(() => generateMonthlyReadings(meter, lang), [meter, lang]);
  const recentReadings = useMemo(() => generateRecentReadings(meter), [meter]);
  const tempData = useMemo(() => (meter.type === "fjernvarme" && meter.hasTemperatureData) ? generateTempData(meter, tempRange) : null, [meter, tempRange]);
  const showTempUnavailable = meter.type === "fjernvarme" && !meter.hasTemperatureData;

  /* Drill-down chart data */
  const zoomData = useMemo(() => {
    if (chartZoom.level === "year") return monthlyData;
    if (chartZoom.level === "month") {
      const monthValue = monthlyData[chartZoom.monthIdx]?.value || 0;
      return generateDailyData(meter, chartZoom.monthIdx, monthValue);
    }
    if (chartZoom.level === "day") {
      const monthValue = monthlyData[chartZoom.monthIdx]?.value || 0;
      const dailyData = generateDailyData(meter, chartZoom.monthIdx, monthValue);
      const dayValue = dailyData.find(d => d.day === chartZoom.dayOfMonth)?.value || 0;
      return generateHourlyData(meter, chartZoom.monthIdx, chartZoom.dayOfMonth, dayValue);
    }
    return monthlyData;
  }, [chartZoom, monthlyData, meter]);

  /* Can we drill deeper from current level? */
  const canDrillDown = chartZoom.level === "year" || (chartZoom.level === "month" && isHourly);

  const crumbs = [
    { label: t("meters", lang), to: "/meters" },
    { label: meter.id },
  ];

  const freqLabel = meter.readingFrequency === "hourly" ? t("hourly", lang) : t("daily", lang);
  const qualityLabel = meter.dataQuality === "high" ? t("high", lang) : meter.dataQuality === "medium" ? t("medium", lang) : t("low", lang);
  const qualityColor = meter.dataQuality === "high" ? "#22C55E" : meter.dataQuality === "medium" ? "#F59E0B" : "#EF4444";

  /* Chart period label */
  const periodLabel = chartZoom.level === "year"
    ? t("last12Months", lang)
    : chartZoom.level === "month"
    ? `${ML[lang][chartZoom.monthIdx]} 2026`
    : `${chartZoom.dayOfMonth}. ${MS[lang][chartZoom.monthIdx]} 2026`;

  /* Handle bar click for drill-down */
  const handleBarClick = (data, index) => {
    if (chartZoom.level === "year") {
      const monthIdx = data?._monthIdx ?? index;
      setChartZoom({ level: "month", monthIdx });
    } else if (chartZoom.level === "month" && isHourly) {
      const dayOfMonth = data?.day ?? (index + 1);
      setChartZoom({ ...chartZoom, level: "day", dayOfMonth });
    }
  };

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-[1200px] mx-auto px-6 py-6">
        <Breadcrumbs items={crumbs} />

        {/* Meter header */}
        <div className="flex items-start gap-3 mb-6">
          <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: color + "15" }}>
            <SvcIcon size={20} style={{ color }} />
          </div>
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-xl font-semibold font-mono" style={{ color: brand.navy }}>{meter.id}</h1>
              <StatusBadge status={meter.status} lang={lang} />
            </div>
            <div className="flex items-center gap-2">
              <p className="text-sm text-slate-400">{t(meter.type, lang)} — {building?.name || meter.buildingId}</p>
              {/* Data source badge */}
              <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium bg-slate-100 text-slate-500">
                <Radio size={8} />
                {meter.dataSource === "eloverblik" ? t("viaEloverblik", lang) : t("viaKamstrupReady", lang)}
              </span>
            </div>
            <div className="flex items-center gap-4 mt-1.5 text-xs text-slate-500">
              <span>{t("lastReading", lang)}: <strong className="font-medium">{meter.lastReading.value} {meter.lastReading.unit}</strong></span>
              <span className="w-px h-3 bg-slate-200" />
              <span>{meter.lastReading.date}</span>
              {meter.lastReading.receivedDate && meter.lastReading.receivedDate !== meter.lastReading.date && (
                <>
                  <span className="w-px h-3 bg-slate-200" />
                  <span className="flex items-center gap-1 text-amber-600">
                    <Clock size={10} />
                    {t("dataReceivedAt", lang)}: {meter.lastReading.receivedDate}
                  </span>
                </>
              )}
              <TimePeriodLabel text={t("last12Months", lang)} />
            </div>
          </div>
        </div>

        {/* D+1 delay banner for Eloverblik meters */}
        {meter.dataSource === "eloverblik" && (
          <div className="flex items-center gap-2 mb-4 px-3 py-2 rounded-lg bg-amber-50 border border-amber-200/60">
            <Clock size={13} className="text-amber-500 shrink-0" />
            <p className="text-[11px] text-amber-700">{t("dataDelayD1", lang)}</p>
          </div>
        )}

        {/* Diagnostic context for offline/error meters */}
        {meter.statusDetail && (
          <div className="flex items-center gap-2 mb-4 px-3 py-2 rounded-lg border"
            style={{
              background: meter.status === "error" ? "#FEF2F2" : "#FFFBEB",
              borderColor: meter.status === "error" ? "#FECACA" : "#FDE68A",
            }}>
            <AlertCircle size={13} className={meter.status === "error" ? "text-red-500" : "text-amber-500"} />
            <p className="text-[11px]" style={{ color: meter.status === "error" ? "#991B1B" : "#92400E" }}>
              {meter.statusDetail[lang] || meter.statusDetail.en}
            </p>
          </div>
        )}

        {/* Billing cycle label */}
        {(() => { const activeCycle = billingCycles.find(c => c.active); return activeCycle ? (
          <div className="flex items-center gap-2 mb-4 text-[11px] text-slate-400">
            <span className="font-medium">{t("billingCycleLabel", lang)}:</span>
            <span className="bg-slate-100 rounded px-2 py-0.5 font-mono text-[10px]">{activeCycle.label}</span>
            <span className="text-slate-300">({activeCycle.start} → {activeCycle.end})</span>
          </div>
        ) : null; })()}

        {/* Content: tabs + attribute panel */}
        <div className="flex gap-6">
          <div className="flex-1 min-w-0">
            <Tabs defaultValue="overview">
              <TabsList className="bg-transparent h-10 gap-0 p-0 border-b border-slate-200 w-full justify-start rounded-none">
                {[
                  { value: "overview", label: t("overview", lang) },
                  { value: "readings", label: t("readings", lang) },
                  { value: "activity", label: t("activity", lang) },
                ].map(tab => (
                  <TabsTrigger key={tab.value} value={tab.value}
                    className="rounded-none border-b-2 border-transparent data-[state=active]:border-[#3EB1C8] data-[state=active]:text-slate-900 data-[state=active]:shadow-none px-4 text-[13px] text-slate-400 hover:text-slate-600 transition-colors">
                    {tab.label}
                  </TabsTrigger>
                ))}
              </TabsList>

              {/* Overview tab */}
              <TabsContent value="overview">
                <div className="mt-4 space-y-4">
                  {/* KPI cards */}
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                    <Card><CardContent className="p-4">
                      <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wider mb-2">{t("lastReading", lang)}</p>
                      <span className="text-2xl font-bold tabular-nums" style={{ color: brand.navy }}>{meter.lastReading.value}</span>
                      <span className="text-xs font-medium text-slate-400 ml-1">{meter.lastReading.unit}</span>
                    </CardContent></Card>
                    <Card><CardContent className="p-4">
                      <div className="flex items-center gap-1 mb-2">
                        <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">{t("dataQuality", lang)}</p>
                        <InfoTooltip text={t("tooltipDataQuality", lang)} />
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full" style={{ background: qualityColor }} />
                        <span className="text-lg font-bold" style={{ color: brand.navy }}>{qualityLabel}</span>
                      </div>
                    </CardContent></Card>
                    <Card><CardContent className="p-4">
                      <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wider mb-2">{t("readingFrequency", lang)}</p>
                      <span className="text-lg font-bold" style={{ color: brand.navy }}>{freqLabel}</span>
                    </CardContent></Card>
                    <Card><CardContent className="p-4">
                      <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wider mb-2">{t("meterStatus", lang)}</p>
                      <StatusBadge status={meter.status} lang={lang} size="lg" />
                    </CardContent></Card>
                  </div>

                  {/* ── Consumption trend — zoomable ── */}
                  <Card>
                    <CardContent className="p-5">
                      {/* Chart header */}
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="text-[13px] font-semibold text-slate-600">{t("consumptionTrend", lang)}</h3>
                        <TimePeriodLabel text={periodLabel} />
                      </div>

                      {/* Zoom breadcrumb */}
                      {chartZoom.level !== "year" && (
                        <div className="flex items-center gap-1 text-[11px] text-slate-400 mb-2">
                          <button onClick={() => setChartZoom({ level: "year" })}
                            className="hover:text-[#3EB1C8] transition-colors cursor-pointer">
                            {t("last12Months", lang)}
                          </button>
                          <ChevronRight size={10} />
                          {chartZoom.level === "month" && (
                            <span className="text-slate-600 font-medium">{ML[lang][chartZoom.monthIdx]}</span>
                          )}
                          {chartZoom.level === "day" && (
                            <>
                              <button onClick={() => setChartZoom({ level: "month", monthIdx: chartZoom.monthIdx })}
                                className="hover:text-[#3EB1C8] transition-colors cursor-pointer">
                                {ML[lang][chartZoom.monthIdx]}
                              </button>
                              <ChevronRight size={10} />
                              <span className="text-slate-600 font-medium">{chartZoom.dayOfMonth}. {MS[lang][chartZoom.monthIdx]}</span>
                            </>
                          )}
                        </div>
                      )}

                      {/* Drill-down hint */}
                      {canDrillDown && (
                        <p className="text-[10px] text-slate-300 mb-2">
                          {chartZoom.level === "year" ? t("clickForDaily", lang) : t("clickForHourly", lang)}
                        </p>
                      )}

                      <ResponsiveContainer width="100%" height={200}>
                        <ComposedChart data={zoomData} margin={{ top: 5, right: 10, bottom: 5, left: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                          <XAxis dataKey="name" tick={{ fontSize: 11, fill: brand.muted }} axisLine={{ stroke: brand.border }} tickLine={false}
                            interval={chartZoom.level === "day" ? 1 : "preserveStartEnd"} />
                          <YAxis tick={{ fontSize: 11, fill: brand.muted }} unit={` ${meter.lastReading.unit}`} axisLine={false} tickLine={false} />
                          <Tooltip content={<BrandTooltip />} />
                          <Bar dataKey="value" name={t(meter.type, lang)} fill={color} fillOpacity={canDrillDown ? 0.2 : 0.15}
                            radius={[3, 3, 0, 0]}
                            cursor={canDrillDown ? "pointer" : "default"}
                            onClick={(data, index) => canDrillDown && handleBarClick(data, index)} />
                          <Line type="monotone" dataKey="value" stroke={color} strokeWidth={2}
                            dot={{ r: 2.5, fill: color, strokeWidth: 0 }} name={t(meter.type, lang)} />
                        </ComposedChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>

                  {/* ── Temperature chart (DH only) — with range selector ── */}
                  {tempData && (
                    <Card>
                      <CardContent className="p-5">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <h3 className="text-[13px] font-semibold text-slate-600">{t("chartTitle", lang)}</h3>
                            {/* Tariff version label */}
                            <span className="text-[10px] bg-slate-100 text-slate-400 rounded px-1.5 py-0.5 font-medium">
                              {HOFOR.tariffVersion} · {t("tariffSourceContract", lang)}
                            </span>
                          </div>
                          {/* Time range pills */}
                          <div className="flex items-center gap-1">
                            {[
                              { days: 30, label: t("last30d", lang) },
                              { days: 90, label: t("last90d", lang) },
                              { days: 180, label: t("last6m", lang) },
                              { days: 365, label: t("last1y", lang) },
                            ].map(opt => (
                              <button key={opt.days} onClick={() => setTempRange(opt.days)}
                                className={`px-2.5 py-0.5 text-[11px] rounded-full transition-colors ${
                                  tempRange === opt.days
                                    ? "bg-[#3EB1C8] text-white font-medium"
                                    : "text-slate-400 hover:text-slate-600 hover:bg-slate-100"
                                }`}>
                                {opt.label}
                              </button>
                            ))}
                          </div>
                        </div>
                        <ResponsiveContainer width="100%" height={240}>
                          <ComposedChart data={tempData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                            <XAxis dataKey="name" tick={{ fontSize: 10, fill: brand.muted }} axisLine={{ stroke: brand.border }} tickLine={false}
                              interval={tempRange <= 90 ? "preserveStartEnd" : 0} />
                            <YAxis tick={{ fontSize: 11, fill: brand.muted }} unit="°C" domain={[0, 90]} axisLine={false} tickLine={false} />
                            <Tooltip content={<TempTooltip />} />
                            <Legend wrapperStyle={{ fontSize: 11, color: brand.subtle }} iconType="circle" iconSize={8} />
                            <ReferenceLine y={HOFOR.standard.krav} stroke={brand.red} strokeDasharray="6 4" strokeWidth={1.5}
                              label={{ value: `${lang === "da" ? "Krav" : "Req."}: ${HOFOR.standard.krav}°C`, fill: brand.red, fontSize: 10, position: "right" }} />
                            <Line type="monotone" dataKey="supply" stroke={brand.red} strokeWidth={1.5} dot={false} name={t("supplyLine", lang)} />
                            <Line type="monotone" dataKey="return" stroke={brand.amber} strokeWidth={1.5} dot={false} name={t("returnLine", lang)} />
                            <Line type="monotone" dataKey="cooling" stroke={brand.blue} strokeWidth={2}
                              dot={tempRange <= 90 ? { r: 2, fill: brand.blue, strokeWidth: 0 } : false}
                              name={t("coolingLine", lang)} />
                          </ComposedChart>
                        </ResponsiveContainer>
                      </CardContent>
                    </Card>
                  )}

                  {/* Temperature data unavailable — legacy meter */}
                  {showTempUnavailable && (
                    <Card>
                      <CardContent className="p-5">
                        <div className="flex items-center gap-3 py-6">
                          <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-slate-100">
                            <AlertCircle size={18} className="text-slate-400" />
                          </div>
                          <div>
                            <h3 className="text-[13px] font-semibold text-slate-500">{t("tempDataUnavailable", lang)}</h3>
                            <p className="text-[11px] text-slate-400 mt-0.5 max-w-md">{t("tempDataUnavailableSub", lang)}</p>
                            {meter.statusDetail && (
                              <p className="text-[10px] text-slate-300 mt-1 italic">{meter.statusDetail[lang] || meter.statusDetail.en}</p>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </TabsContent>

              {/* Readings tab */}
              <TabsContent value="readings">
                <div className="mt-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-semibold" style={{ color: brand.navy }}>{t("recentReadings", lang)}</h3>
                    <TimePeriodLabel text={isHourly ? (lang === "da" ? "Seneste 48 timer" : "Last 48 hours") : t("last12Months", lang)} />
                  </div>
                  <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white max-h-[500px] overflow-y-auto">
                    <table className="w-full text-sm">
                      <thead className="sticky top-0 z-10">
                        <tr className="border-b border-slate-200 bg-slate-50/80">
                          <th className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider px-5 py-2.5 text-left">{t("date", lang)}</th>
                          <th className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider px-5 py-2.5 text-right">{t("value", lang)}</th>
                          <th className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider px-5 py-2.5 text-right">{t("meterUnit", lang)}</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {recentReadings.map((r, i) => (
                          <tr key={i} className="hover:bg-slate-50/80 transition-colors">
                            <td className="px-5 py-3 text-sm font-medium" style={{ color: brand.navy }}>{r.date}</td>
                            <td className="px-5 py-3 text-sm text-right tabular-nums font-medium" style={{ color: brand.navy }}>{r.value}</td>
                            <td className="px-5 py-3 text-sm text-right text-slate-400">{r.unit}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </TabsContent>

              {/* Activity tab */}
              <TabsContent value="activity">
                <div className="mt-4 space-y-3">
                  <div className="flex items-start gap-3 p-3 rounded-lg bg-slate-50">
                    <Activity size={14} className="text-slate-400 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium" style={{ color: brand.navy }}>{t("lastDataReceived", lang)}</p>
                      <p className="text-xs text-slate-400">{meter.lastReading.date}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 rounded-lg bg-slate-50">
                    <Activity size={14} className="text-slate-400 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium" style={{ color: brand.navy }}>{t("meterCreated", lang)}</p>
                      <p className="text-xs text-slate-400">{meter.installDate}</p>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>

          {/* Right: Attribute panel */}
          <AttributePanel>
            <AttrSection title={t("meterDetails", lang)}>
              <AttrRow label={t("meterId", lang)} value={meter.id} />
              <AttrRow label={t("meterType", lang)} value={t(meter.type, lang)} />
              <AttrRow label={t("serialNumber", lang)} value={meter.serialNumber} />
              <AttrRow label={t("installDate", lang)} value={meter.installDate} />
              <AttrRow label={t("meterUnit", lang)} value={meter.unit} />
              <AttrRow label={t("readingFrequency", lang)} value={freqLabel} />
              <AttrRow label={t("dataQuality", lang)} value={qualityLabel} color={qualityColor} />
              <AttrRow label={t("dataSource", lang)} value={meter.dataSource === "eloverblik" ? "Eloverblik" : "Kamstrup READy"} />
            </AttrSection>

            <AttrLink
              title={t("relationships", lang)}
              items={[
                ...(building ? [{
                  label: `${t("building", lang)}: ${building.name}`,
                  onClick: () => navigate(`/buildings/${building.id}`),
                }] : []),
                ...(supplier ? [{
                  label: `${t("supplier", lang)}: ${supplier.name}`,
                  onClick: () => navigate(`/suppliers/${supplier.id}`),
                }] : []),
              ]}
            />
          </AttributePanel>
        </div>
      </div>
    </div>
  );
}
