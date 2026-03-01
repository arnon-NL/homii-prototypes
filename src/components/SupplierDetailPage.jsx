import React, { useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Truck, Flame, Droplets, Zap, Activity, ArrowRight } from "lucide-react";
import { brand } from "@/lib/brand";
import { t, useLang } from "@/lib/i18n";
import { getSupplier, getMetersForSupplier, getBuildingsForSupplier } from "@/lib/mockData";
import { StatusBadge } from "@/components/ui/status-badge";
import { AttributePanel, AttrSection, AttrRow, AttrLink } from "@/components/ui/attribute-panel";
import { TimePeriodLabel } from "@/components/ui/info-tooltip";
import Breadcrumbs from "./Breadcrumbs";

const typeIcons = { fjernvarme: Flame, vand: Droplets, el: Zap };
const typeColors = { fjernvarme: "#EF4444", vand: "#3B82F6", el: "#F59E0B" };

export default function SupplierDetailPage() {
  const { supplierId } = useParams();
  const navigate = useNavigate();
  const lang = useLang();
  const supplier = getSupplier(supplierId);

  if (!supplier) return <div className="p-6 text-slate-400">Supplier not found</div>;

  const meters = useMemo(() => getMetersForSupplier(supplierId), [supplierId]);
  const buildings = useMemo(() => getBuildingsForSupplier(supplierId), [supplierId]);

  const crumbs = [
    { label: t("suppliers", lang), to: "/suppliers" },
    { label: supplier.name },
  ];

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-[1200px] mx-auto px-6 py-6">
        <Breadcrumbs items={crumbs} />

        {/* Supplier header */}
        <div className="flex items-start gap-3 mb-6">
          <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-slate-100">
            <Truck size={20} className="text-slate-500" />
          </div>
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-xl font-semibold" style={{ color: brand.navy }}>{supplier.name}</h1>
              <StatusBadge status={supplier.status} lang={lang} />
            </div>
            <p className="text-sm text-slate-400">{supplier.address}</p>
            <div className="flex items-center gap-4 mt-1.5 text-xs text-slate-500">
              <span>{supplier.utilityTypes.map(u => t(u, lang)).join(", ")}</span>
              <span className="w-px h-3 bg-slate-200" />
              <span>{meters.length} {t("meters", lang).toLowerCase()}</span>
              <span className="w-px h-3 bg-slate-200" />
              <span>{buildings.length} {t("buildings", lang).toLowerCase()}</span>
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
                  { value: "tariffs", label: t("tariffs", lang) },
                  { value: "meters", label: `${t("connectedMeters", lang)} (${meters.length})` },
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
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                    <Card><CardContent className="p-4">
                      <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wider mb-2">{t("connectedMeters", lang)}</p>
                      <span className="text-2xl font-bold tabular-nums" style={{ color: brand.navy }}>{meters.length}</span>
                    </CardContent></Card>
                    <Card><CardContent className="p-4">
                      <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wider mb-2">{t("connectedBuildings", lang)}</p>
                      <span className="text-2xl font-bold tabular-nums" style={{ color: brand.navy }}>{buildings.length}</span>
                    </CardContent></Card>
                    <Card><CardContent className="p-4">
                      <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wider mb-2">{t("utilityTypes", lang)}</p>
                      <span className="text-sm font-medium" style={{ color: brand.navy }}>
                        {supplier.utilityTypes.map(u => t(u, lang)).join(", ")}
                      </span>
                    </CardContent></Card>
                    <Card><CardContent className="p-4">
                      <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wider mb-2">{t("contractPeriod", lang)}</p>
                      <span className="text-sm font-medium" style={{ color: brand.navy }}>
                        {supplier.contractPeriod.start} — {supplier.contractPeriod.end}
                      </span>
                    </CardContent></Card>
                  </div>

                  {/* Connected buildings */}
                  <Card>
                    <CardContent className="p-5">
                      <h3 className="text-[13px] font-semibold text-slate-600 mb-3">{t("connectedBuildings", lang)}</h3>
                      <div className="space-y-2">
                        {buildings.map(b => (
                          <div key={b.id}
                            className="flex items-center justify-between p-3 rounded-lg bg-slate-50 hover:bg-slate-100 cursor-pointer transition-colors"
                            onClick={() => navigate(`/buildings/${b.id}`)}
                          >
                            <div>
                              <p className="text-sm font-medium" style={{ color: brand.navy }}>{b.name}</p>
                              <p className="text-xs text-slate-400">{b.address}</p>
                            </div>
                            <ArrowRight size={14} className="text-slate-300" />
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              {/* Tariffs tab */}
              <TabsContent value="tariffs">
                <div className="mt-4 space-y-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-semibold" style={{ color: brand.navy }}>{t("activeTariffs", lang)}</h3>
                    <TimePeriodLabel text={t("currentPeriod", lang)} />
                  </div>
                  <div className="space-y-3">
                    {supplier.activeTariffs.map((tariff, i) => (
                      <Card key={i}>
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm font-medium" style={{ color: brand.navy }}>{tariff}</p>
                              <p className="text-xs text-slate-400 mt-0.5">
                                {t("contractPeriod", lang)}: {supplier.contractPeriod.start} — {supplier.contractPeriod.end}
                              </p>
                            </div>
                            <StatusBadge status="active" lang={lang} />
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              </TabsContent>

              {/* Connected meters tab */}
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
            </Tabs>
          </div>

          {/* Right: Attribute panel */}
          <AttributePanel>
            <AttrSection title={t("supplierDetails", lang)}>
              <AttrRow label={t("contact", lang)} value={supplier.contact} />
              <AttrRow label={t("phone", lang)} value={supplier.phone} />
              <AttrRow label={t("utilityTypes", lang)} value={supplier.utilityTypes.map(u => t(u, lang)).join(", ")} />
              <AttrRow label={t("contractPeriod", lang)} value={`${supplier.contractPeriod.start} — ${supplier.contractPeriod.end}`} />
            </AttrSection>

            <AttrLink
              title={t("relationships", lang)}
              items={[
                ...buildings.map(b => ({
                  label: `${t("building", lang)}: ${b.name}`,
                  onClick: () => navigate(`/buildings/${b.id}`),
                })),
                ...meters.slice(0, 5).map(m => ({
                  label: `${t("meter", lang)}: ${m.id}`,
                  onClick: () => navigate(`/meters/${m.id}`),
                })),
              ]}
            />
          </AttributePanel>
        </div>
      </div>
    </div>
  );
}
