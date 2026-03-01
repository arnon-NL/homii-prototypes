import React, { useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Flame, Droplets, Zap, Activity, ArrowRight, AlertTriangle, CheckCircle2 } from "lucide-react";
import { brand, EPC_COLORS } from "@/lib/brand";
import { t, useLang } from "@/lib/i18n";
import { getBuilding, getMetersForBuilding, getSuppliersForBuilding } from "@/lib/mockData";
import { StatusBadge } from "@/components/ui/status-badge";
import { AttributePanel, AttrSection, AttrRow, AttrLink } from "@/components/ui/attribute-panel";
import { InfoTooltip, TimePeriodLabel } from "@/components/ui/info-tooltip";
import Breadcrumbs from "./Breadcrumbs";
import SmartInsights from "./SmartInsights";

const typeIcons = { fjernvarme: Flame, vand: Droplets, el: Zap };
const typeColors = { fjernvarme: "#EF4444", vand: "#3B82F6", el: "#F59E0B" };

export default function BuildingDetailPage({ buildingId, onNavigate }) {
  const lang = useLang();
  const building = getBuilding(buildingId);

  if (!building) return <div className="p-6 text-slate-400">Building not found</div>;

  const meters = useMemo(() => getMetersForBuilding(buildingId), [buildingId]);
  const suppliers = useMemo(() => getSuppliersForBuilding(buildingId), [buildingId]);

  const crumbs = [
    { label: t("buildings", lang), onClick: () => onNavigate({ page: "buildings" }) },
    { label: building.name },
  ];

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-[1200px] mx-auto px-6 py-6">
        <Breadcrumbs items={crumbs} />

        {/* Building header */}
        <div className="flex items-start gap-3 mb-6">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-xl font-semibold" style={{ color: brand.navy }}>{building.name}</h1>
              <span className="inline-flex items-center justify-center w-6 h-6 rounded text-[10px] font-bold text-white"
                style={{ background: EPC_COLORS[building.epc] }}>
                {building.epc}
              </span>
              <StatusBadge status={building.status} lang={lang} />
            </div>
            <p className="text-sm text-slate-400">{building.address}</p>
            <div className="flex items-center gap-4 mt-2 text-xs text-slate-500">
              <span>{building.units} {t("units", lang)}</span>
              <span className="w-px h-3 bg-slate-200" />
              <span>{building.area.toLocaleString()} m² {t("area", lang)}</span>
              <span className="w-px h-3 bg-slate-200" />
              <span>{meters.length} {t("meters", lang).toLowerCase()}</span>
              <TimePeriodLabel text={t("currentPeriod", lang)} />
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
                  { value: "meters", label: `${t("metersTab", lang)} (${meters.length})` },
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
                      <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wider mb-2">{t("units", lang)}</p>
                      <span className="text-2xl font-bold tabular-nums" style={{ color: brand.navy }}>{building.units}</span>
                    </CardContent></Card>
                    <Card><CardContent className="p-4">
                      <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wider mb-2">{t("area", lang)}</p>
                      <span className="text-2xl font-bold tabular-nums" style={{ color: brand.navy }}>{building.area.toLocaleString()}</span>
                      <span className="text-xs font-medium text-slate-400 ml-1">m²</span>
                    </CardContent></Card>
                    <Card><CardContent className="p-4">
                      <div className="flex items-center gap-1 mb-2">
                        <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">{t("epcRating", lang)}</p>
                        <InfoTooltip text={t("tooltipEpc", lang)} />
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="inline-flex items-center justify-center w-8 h-8 rounded text-sm font-bold text-white" style={{ background: EPC_COLORS[building.epc] }}>{building.epc}</span>
                        <div>
                          <span className="text-xs text-slate-400 block">{t("epcReq", lang)}</span>
                          {building.epcExpiresDate && (() => {
                            const exp = new Date(building.epcExpiresDate);
                            const now = new Date();
                            const monthsLeft = Math.round((exp - now) / (1000 * 60 * 60 * 24 * 30));
                            const isExpired = monthsLeft <= 0;
                            const expiresSoon = monthsLeft > 0 && monthsLeft <= 12;
                            return (
                              <span className={`flex items-center gap-1 text-[10px] mt-0.5 ${isExpired ? "text-red-500 font-semibold" : expiresSoon ? "text-amber-600" : "text-slate-400"}`}>
                                {isExpired ? <AlertTriangle size={9} /> : expiresSoon ? <AlertTriangle size={9} /> : <CheckCircle2 size={9} />}
                                {isExpired ? t("epcExpired", lang) : expiresSoon ? `${t("epcExpiresSoon", lang)} (${monthsLeft} mdr.)` : t("epcValid", lang)} — {building.epcExpiresDate}
                              </span>
                            );
                          })()}
                        </div>
                      </div>
                    </CardContent></Card>
                    <Card><CardContent className="p-4">
                      <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wider mb-2">{t("meters", lang)}</p>
                      <span className="text-2xl font-bold tabular-nums" style={{ color: brand.navy }}>{meters.length}</span>
                    </CardContent></Card>
                  </div>

                  {/* SmartInsights — collapsible */}
                  <SmartInsights building={building} />
                </div>
              </TabsContent>

              {/* Meters tab */}
              <TabsContent value="meters">
                <div className="mt-4">
                  <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-slate-200 bg-slate-50/80">
                          <th className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider px-5 py-2.5 text-left">{t("meterId", lang)}</th>
                          <th className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider px-5 py-2.5 text-left">{t("meterType", lang)}</th>
                          <th className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider px-5 py-2.5 text-center">{t("meterStatus", lang)}</th>
                          <th className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider px-5 py-2.5 text-right">{t("lastReading", lang)}</th>
                          <th className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider px-5 py-2.5 text-right">{t("readingDate", lang)}</th>
                          <th className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider px-5 py-2.5 text-right"></th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {meters.map(m => {
                          const SvcIcon = typeIcons[m.type] || Flame;
                          const color = typeColors[m.type];
                          return (
                            <tr key={m.id}
                              className="hover:bg-slate-50/80 transition-colors cursor-pointer"
                              onClick={() => onNavigate({ page: "meter-detail", meterId: m.id })}
                            >
                              <td className="px-5 py-3">
                                <span className="text-sm font-mono font-medium" style={{ color: brand.navy }}>{m.id}</span>
                              </td>
                              <td className="px-5 py-3">
                                <div className="flex items-center gap-2">
                                  <div className="w-6 h-6 rounded flex items-center justify-center" style={{ background: color + "15" }}>
                                    <SvcIcon size={13} style={{ color }} />
                                  </div>
                                  <span className="text-sm text-slate-600">{t(m.type, lang)}</span>
                                </div>
                              </td>
                              <td className="px-5 py-3 text-center">
                                <StatusBadge status={m.status} lang={lang} />
                              </td>
                              <td className="px-5 py-3 text-sm text-right tabular-nums font-medium" style={{ color: brand.navy }}>
                                {m.lastReading.value} <span className="text-slate-400 font-normal">{m.lastReading.unit}</span>
                              </td>
                              <td className="px-5 py-3 text-sm text-right text-slate-400 tabular-nums">{m.lastReading.date}</td>
                              <td className="px-5 py-3 text-right">
                                <ArrowRight size={14} className="text-slate-300" />
                              </td>
                            </tr>
                          );
                        })}
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
                      <p className="text-sm font-medium" style={{ color: brand.navy }}>{t("yearBuilt", lang)}</p>
                      <p className="text-xs text-slate-400">{building.yearBuilt}</p>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>

          {/* Right: Attribute panel */}
          <AttributePanel>
            <AttrSection title={t("buildingDetails", lang)}>
              <AttrRow label={t("buildingType", lang)} value={building.buildingType} />
              <AttrRow label={t("yearBuilt", lang)} value={building.yearBuilt} />
              <AttrRow label={t("postalCode", lang)} value={building.postalCode} />
              <AttrRow label={t("municipality", lang)} value={building.municipality} />
              <AttrRow label={t("owner", lang)} value={building.owner} />
              <AttrRow label={t("administrator", lang)} value={building.administrator} />
              {building.epcCertifiedDate && (
                <AttrRow label={t("epcCertified", lang)} value={building.epcCertifiedDate} />
              )}
              {building.epcExpiresDate && (
                <AttrRow label={t("epcExpires", lang)} value={building.epcExpiresDate} />
              )}
              {building.bbrLastUpdated && (
                <AttrRow label={t("bbrLastUpdated", lang)} value={building.bbrLastUpdated} />
              )}
            </AttrSection>

            {/* BBR source note */}
            <div className="px-3 py-2 bg-slate-50/80 rounded-lg">
              <p className="text-[10px] text-slate-400 italic">{t("bbrSource", lang)}</p>
            </div>

            <AttrLink
              title={t("relationships", lang)}
              items={[
                ...meters.map(m => ({
                  label: `${t("meter", lang)}: ${m.id}`,
                  onClick: () => onNavigate({ page: "meter-detail", meterId: m.id }),
                })),
                ...suppliers.map(s => ({
                  label: `${t("supplier", lang)}: ${s.name}`,
                  onClick: () => onNavigate({ page: "supplier-detail", supplierId: s.id }),
                })),
              ]}
            />
          </AttributePanel>
        </div>
      </div>
    </div>
  );
}
