import React, { useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Flame, Droplets, Zap, Activity, ArrowRight, AlertTriangle, CheckCircle2, Radio, FileText, Settings, UserCheck, Bell, Wrench } from "lucide-react";
import { brand, EPC_COLORS } from "@/lib/brand";
import { t, useLang } from "@/lib/i18n";
import { getBuilding, getMetersForBuilding, getSuppliersForBuilding, dataSources } from "@/lib/mockData";
import { StatusBadge } from "@/components/ui/status-badge";
import { AttributePanel, AttrSection, AttrRow, AttrLink } from "@/components/ui/attribute-panel";
import { InfoTooltip, TimePeriodLabel } from "@/components/ui/info-tooltip";
import Breadcrumbs from "./Breadcrumbs";
import SmartInsights from "./SmartInsights";

const typeIcons = { fjernvarme: Flame, vand: Droplets, el: Zap };
const typeColors = { fjernvarme: "#EF4444", vand: "#3B82F6", el: "#F59E0B" };

export default function BuildingDetailPage() {
  const { buildingId } = useParams();
  const navigate = useNavigate();
  const lang = useLang();
  const building = getBuilding(buildingId);

  if (!building) return <div className="p-6 text-slate-400">Building not found</div>;

  const meters = useMemo(() => getMetersForBuilding(buildingId), [buildingId]);
  const suppliers = useMemo(() => getSuppliersForBuilding(buildingId), [buildingId]);

  const crumbs = [
    { label: t("buildings", lang), to: "/buildings" },
    { label: building.name },
  ];

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-4 sm:py-6">
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
            <div className="flex flex-wrap items-center gap-2 sm:gap-4 mt-2 text-xs text-slate-500">
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
        <div className="flex flex-col xl:flex-row gap-6">
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
                  {/* Mobile meter cards */}
                  <div className="block md:hidden space-y-3">
                    {meters.map(m => {
                      const SvcIcon = typeIcons[m.type] || Flame;
                      const color = typeColors[m.type];
                      return (
                        <button key={m.id} onClick={() => navigate(`/meters/${m.id}`)}
                          className="w-full text-left rounded-lg border border-slate-200 bg-white p-4 hover:border-[#3EB1C8] hover:shadow-md transition-all">
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex-1 min-w-0">
                              <div className="text-xs font-mono font-medium mb-1" style={{ color: brand.navy }}>{m.id}</div>
                              <div className="flex items-center gap-2 mb-2">
                                <div className="w-5 h-5 rounded flex items-center justify-center" style={{ background: color + "15" }}>
                                  <SvcIcon size={12} style={{ color }} />
                                </div>
                                <span className="text-xs text-slate-600">{t(m.type, lang)}</span>
                              </div>
                            </div>
                            <StatusBadge status={m.status} lang={lang} />
                          </div>
                          <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between">
                            <div>
                              <div className="text-[11px] text-slate-400">{t("lastReading", lang)}</div>
                              <div className="text-sm font-medium tabular-nums" style={{ color: brand.navy }}>
                                {m.lastReading.value} <span className="text-slate-400 font-normal">{m.lastReading.unit}</span>
                              </div>
                            </div>
                            <div className="text-xs text-slate-400">{m.lastReading.date}</div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                  <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white hidden md:block">
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
                              onClick={() => navigate(`/meters/${m.id}`)}
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
                <div className="mt-4 space-y-0.5">
                  {/* Activity timeline — realistic log entries */}
                  {[
                    { icon: Radio, color: "#3EB1C8", title: lang === "da" ? "Målerdata synkroniseret" : "Meter data synced", desc: lang === "da" ? "Alle 3 målere modtog data fra Kamstrup READy" : "All 3 meters received data from Kamstrup READy", time: "2026-03-04 08:12", user: "System" },
                    { icon: Bell, color: "#F59E0B", title: lang === "da" ? "Afkølingsalarm udløst" : "Cooling alarm triggered", desc: lang === "da" ? "KAM-DH-001: Afkøling under 25°C i 3 sammenhængende dage" : "KAM-DH-001: Cooling below 25°C for 3 consecutive days", time: "2026-03-02 14:30", user: "System" },
                    { icon: FileText, color: "#3B8EA5", title: lang === "da" ? "Energirapport genereret" : "Energy report generated", desc: lang === "da" ? "Månedlig forbrugsrapport for februar 2026" : "Monthly consumption report for February 2026", time: "2026-03-01 06:00", user: "System" },
                    { icon: UserCheck, color: "#22C55E", title: lang === "da" ? "EPC-certifikat verificeret" : "EPC certificate verified", desc: lang === "da" ? `Energimærke ${building.epc} bekræftet — gyldig til ${building.epcExpiresDate || "N/A"}` : `Energy label ${building.epc} confirmed — valid until ${building.epcExpiresDate || "N/A"}`, time: "2026-02-28 10:45", user: "Arnon K." },
                    { icon: Settings, color: "#64748B", title: lang === "da" ? "Bygningsdata opdateret fra BBR" : "Building data updated from BBR", desc: lang === "da" ? "Areal, enheder og bygningstype synkroniseret" : "Area, units and building type synced", time: "2026-02-25 09:00", user: "System" },
                    { icon: Wrench, color: "#EF4444", title: lang === "da" ? "Vandmåler offline i 48 timer" : "Water meter offline for 48 hours", desc: lang === "da" ? "KAM-WA-012: Ingen data modtaget — alarm sendt til driftsteam" : "KAM-WA-012: No data received — alert sent to ops team", time: "2026-02-20 16:15", user: "System" },
                    { icon: Radio, color: "#3EB1C8", title: lang === "da" ? "Ny måler tilknyttet" : "New meter linked", desc: lang === "da" ? "KAM-EL-034 tilknyttet bygning via Eloverblik" : "KAM-EL-034 linked to building via Eloverblik", time: "2026-02-15 11:30", user: "Arnon K." },
                    { icon: CheckCircle2, color: "#22C55E", title: lang === "da" ? "Leverandørkontrakt bekræftet" : "Supplier contract confirmed", desc: lang === "da" ? "HOFOR kontrakt 2024–2026 bekræftet og gyldig" : "HOFOR contract 2024–2026 confirmed and valid", time: "2026-01-15 09:00", user: "System" },
                    { icon: Activity, color: "#94A3B8", title: lang === "da" ? "Bygning onboardet i homii" : "Building onboarded in homii", desc: lang === "da" ? `Oprettet med ${meters.length} målere og BBR-data` : `Created with ${meters.length} meters and BBR data`, time: building.homiiOnboarded || "2024-01-01", user: "System" },
                  ].map((entry, i) => {
                    const IconComp = entry.icon;
                    return (
                      <div key={i} className="flex items-start gap-3 p-3 rounded-lg hover:bg-slate-50 transition-colors">
                        <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5" style={{ background: entry.color + "15" }}>
                          <IconComp size={13} style={{ color: entry.color }} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <p className="text-[13px] font-medium" style={{ color: brand.navy }}>{entry.title}</p>
                            <span className="text-[10px] text-slate-400 shrink-0 tabular-nums">{entry.time}</span>
                          </div>
                          <p className="text-[11px] text-slate-400 mt-0.5">{entry.desc}</p>
                          <span className="text-[10px] text-slate-300 mt-0.5 block">{entry.user}</span>
                        </div>
                      </div>
                    );
                  })}
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
              {(() => {
                const bbrSource = dataSources.find(s => s.id === "bbr");
                if (!bbrSource?.lastSync) return null;
                const d = new Date(bbrSource.lastSync);
                const formatted = d.toLocaleDateString(lang === "da" ? "da-DK" : "en-GB", { day: "numeric", month: "short", year: "numeric" });
                return <AttrRow label={t("bbrLastSynced", lang)} value={formatted} />;
              })()}
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
                  onClick: () => navigate(`/meters/${m.id}`),
                })),
                ...suppliers.map(s => ({
                  label: `${t("supplier", lang)}: ${s.name}`,
                  onClick: () => navigate(`/suppliers/${s.id}`),
                })),
              ]}
            />
          </AttributePanel>
        </div>
      </div>
    </div>
  );
}
