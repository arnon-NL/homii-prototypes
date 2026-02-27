import React, { useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Flame, Droplets, Zap, Activity } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Line, ComposedChart, Legend, ReferenceLine } from "recharts";
import { brand, EPC_COLORS, HOFOR } from "@/lib/brand";
import { t, useLang, MS } from "@/lib/i18n";
import { getMeter, getBuilding, getSupplier, meters } from "@/lib/mockData";
import { StatusBadge } from "@/components/ui/status-badge";
import { AttributePanel, AttrSection, AttrRow, AttrLink } from "@/components/ui/attribute-panel";
import { InfoTooltip, TimePeriodLabel } from "@/components/ui/info-tooltip";
import Breadcrumbs from "./Breadcrumbs";

const typeIcons = { fjernvarme: Flame, vand: Droplets, el: Zap };
const typeColors = { fjernvarme: "#EF4444", vand: "#3B82F6", el: "#F59E0B" };

/* Generate simulated monthly readings for a meter */
function generateReadings(meter, lang) {
  const ms = MS[lang];
  const seed = meter.id.split("").reduce((s, c) => s + c.charCodeAt(0), 0);
  const r = (n) => Math.sin(seed * 137 + n * 31) * 0.5 + 0.5;

  return ms.map((month, i) => {
    const isWinter = i < 3 || i > 9;
    let value;
    if (meter.type === "fjernvarme") {
      value = isWinter ? 30 + r(i) * 20 : 5 + r(i) * 10;
    } else if (meter.type === "vand") {
      value = 200 + r(i) * 150;
    } else {
      value = 4 + r(i) * 6;
    }
    return { name: month, value: +value.toFixed(1) };
  });
}

/* Generate simulated recent readings table — respects readingFrequency */
function generateRecentReadings(meter) {
  const seed = meter.id.split("").reduce((s, c) => s + c.charCodeAt(0), 0);
  const r = (n) => Math.sin(seed * 77 + n * 23) * 0.5 + 0.5;
  const baseValue = meter.lastReading.value;
  const isHourly = meter.readingFrequency === "hourly";
  const count = isHourly ? 24 : 10; // 24 hourly readings or 10 daily readings
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

/* Generate temperature data for DH meters (supply/return/cooling) */
function generateTempData(meter) {
  const seed = meter.id.split("").reduce((s, c) => s + c.charCodeAt(0), 0);
  const r = (n) => Math.sin(seed * 100 + n * 17) * 0.5 + 0.5;
  return Array.from({ length: 30 }, (_, n) => {
    const day = 30 - n;
    const isWinter = true; // Feb is winter
    const supply = isWinter ? 78 + r(n) * 8 : 68 + r(n) * 6;
    const ret = isWinter ? 42 + r(n + 100) * 12 : 35 + r(n + 100) * 10;
    const cooling = supply - ret;
    return {
      name: `D-${day}`,
      supply: +supply.toFixed(1),
      return: +ret.toFixed(1),
      cooling: +cooling.toFixed(1),
    };
  });
}

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

export default function MeterDetailPage({ meterId, onNavigate }) {
  const lang = useLang();
  const meter = getMeter(meterId);

  if (!meter) return <div className="p-6 text-slate-400">Meter not found</div>;

  const building = getBuilding(meter.buildingId);
  const supplier = getSupplier(meter.supplierId);
  const SvcIcon = typeIcons[meter.type] || Flame;
  const color = typeColors[meter.type];

  const chartData = useMemo(() => generateReadings(meter, lang), [meter, lang]);
  const recentReadings = useMemo(() => generateRecentReadings(meter), [meter]);
  const tempData = useMemo(() => meter.type === "fjernvarme" ? generateTempData(meter) : null, [meter]);

  const crumbs = [
    { label: t("meters", lang), onClick: () => onNavigate({ page: "meters" }) },
    { label: meter.id },
  ];

  const freqLabel = meter.readingFrequency === "hourly" ? t("hourly", lang) : t("daily", lang);
  const qualityLabel = meter.dataQuality === "high" ? t("high", lang) : meter.dataQuality === "medium" ? t("medium", lang) : t("low", lang);
  const qualityColor = meter.dataQuality === "high" ? "#22C55E" : meter.dataQuality === "medium" ? "#F59E0B" : "#EF4444";

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
            <p className="text-sm text-slate-400">{t(meter.type, lang)} — {building?.name || meter.buildingId}</p>
            <div className="flex items-center gap-4 mt-1.5 text-xs text-slate-500">
              <span>{t("lastReading", lang)}: <strong className="font-medium">{meter.lastReading.value} {meter.lastReading.unit}</strong></span>
              <span className="w-px h-3 bg-slate-200" />
              <span>{meter.lastReading.date}</span>
              <TimePeriodLabel text={t("last12Months", lang)} />
            </div>
          </div>
        </div>

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

                  {/* Consumption trend sparkline */}
                  <Card>
                    <CardContent className="p-5">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-[13px] font-semibold text-slate-600">{t("consumptionTrend", lang)}</h3>
                        <TimePeriodLabel text={t("last12Months", lang)} />
                      </div>
                      <ResponsiveContainer width="100%" height={200}>
                        <ComposedChart data={chartData} margin={{ top: 5, right: 10, bottom: 5, left: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                          <XAxis dataKey="name" tick={{ fontSize: 11, fill: brand.muted }} axisLine={{ stroke: brand.border }} tickLine={false} />
                          <YAxis tick={{ fontSize: 11, fill: brand.muted }} unit={` ${meter.lastReading.unit}`} axisLine={false} tickLine={false} />
                          <Tooltip content={<BrandTooltip />} />
                          <Bar dataKey="value" name={t(meter.type, lang)} fill={color} fillOpacity={0.15} radius={[3, 3, 0, 0]} />
                          <Line type="monotone" dataKey="value" stroke={color} strokeWidth={2} dot={{ r: 2.5, fill: color, strokeWidth: 0 }} name={t(meter.type, lang)} />
                        </ComposedChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>

                  {/* Temperature chart for DH meters: Supply, Return & Cooling */}
                  {tempData && (
                    <Card>
                      <CardContent className="p-5">
                        <div className="flex items-center justify-between mb-3">
                          <h3 className="text-[13px] font-semibold text-slate-600">{t("chartTitle", lang)}</h3>
                          <TimePeriodLabel text={lang === "da" ? "Seneste 30 dage" : "Last 30 days"} />
                        </div>
                        <ResponsiveContainer width="100%" height={240}>
                          <ComposedChart data={tempData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                            <XAxis dataKey="name" tick={{ fontSize: 10, fill: brand.muted }} axisLine={{ stroke: brand.border }} tickLine={false} />
                            <YAxis tick={{ fontSize: 11, fill: brand.muted }} unit="°C" domain={[0, 90]} axisLine={false} tickLine={false} />
                            <Tooltip content={<BrandTooltip />} />
                            <Legend wrapperStyle={{ fontSize: 11, color: brand.subtle }} iconType="circle" iconSize={8} />
                            <ReferenceLine y={HOFOR.standard.krav} stroke={brand.red} strokeDasharray="6 4" strokeWidth={1.5}
                              label={{ value: `${lang === "da" ? "Krav" : "Req."}: ${HOFOR.standard.krav}°C`, fill: brand.red, fontSize: 10, position: "right" }} />
                            <Line type="monotone" dataKey="supply" stroke={brand.red} strokeWidth={1.5} dot={false} name={t("supplyLine", lang)} />
                            <Line type="monotone" dataKey="return" stroke={brand.amber} strokeWidth={1.5} dot={false} name={t("returnLine", lang)} />
                            <Line type="monotone" dataKey="cooling" stroke={brand.blue} strokeWidth={2} dot={{ r: 2, fill: brand.blue, strokeWidth: 0 }} name={t("coolingLine", lang)} />
                          </ComposedChart>
                        </ResponsiveContainer>
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
                    <TimePeriodLabel text={t("last12Months", lang)} />
                  </div>
                  <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
                    <table className="w-full text-sm">
                      <thead>
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
            </AttrSection>

            <AttrLink
              title={t("relationships", lang)}
              items={[
                ...(building ? [{
                  label: `${t("building", lang)}: ${building.name}`,
                  onClick: () => onNavigate({ page: "building-detail", buildingId: building.id }),
                }] : []),
                ...(supplier ? [{
                  label: `${t("supplier", lang)}: ${supplier.name}`,
                  onClick: () => onNavigate({ page: "supplier-detail", supplierId: supplier.id }),
                }] : []),
              ]}
            />
          </AttributePanel>
        </div>
      </div>
    </div>
  );
}
