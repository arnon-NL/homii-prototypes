import React, { useState, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Flame, Droplets, Zap, ArrowRight } from "lucide-react";
import { brand, EPC_COLORS } from "@/lib/brand";
import { t, useLang } from "@/lib/i18n";
import { buildings } from "@/lib/mockData";
import Breadcrumbs from "./Breadcrumbs";

const serviceIcons = { fjernvarme: Flame, vand: Droplets, el: Zap };
const serviceColors = { fjernvarme: "#EF4444", vand: "#3B82F6", el: "#F59E0B" };

export default function BuildingDetailPage({ buildingId, onNavigate }) {
  const lang = useLang();
  const building = buildings.find(b => b.id === buildingId);

  if (!building) return <div className="p-6 text-slate-400">Building not found</div>;

  const crumbs = [
    { label: t("buildings", lang), onClick: () => onNavigate({ page: "buildings" }) },
    { label: building.name },
  ];

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-[960px] mx-auto px-6 py-6">
        <Breadcrumbs items={crumbs} />

        {/* Building header */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-xl font-semibold" style={{ color: brand.navy }}>{building.name}</h1>
              <span className="inline-flex items-center justify-center w-6 h-6 rounded text-[10px] font-bold text-white"
                style={{ background: EPC_COLORS[building.epc] }}>
                {building.epc}
              </span>
            </div>
            <p className="text-sm text-slate-400">{building.address}</p>
            <div className="flex items-center gap-4 mt-2 text-xs text-slate-500">
              <span>{building.units} {t("units", lang)}</span>
              <span className="w-px h-3 bg-slate-200" />
              <span>{building.area.toLocaleString()} m² {t("area", lang)}</span>
              <span className="w-px h-3 bg-slate-200" />
              <span>{building.services.length} {t("services", lang).toLowerCase()}</span>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="services">
          <TabsList className="bg-transparent h-10 gap-0 p-0 border-b border-slate-200 w-full justify-start rounded-none">
            {[
              { value: "overview", label: t("overview", lang) },
              { value: "units", label: t("rentalUnits", lang) },
              { value: "services", label: t("services", lang) },
              { value: "tasks", label: t("tasks", lang) },
              { value: "meters", label: t("meters", lang) },
            ].map(tab => (
              <TabsTrigger key={tab.value} value={tab.value}
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-[#3EB1C8] data-[state=active]:text-slate-900 data-[state=active]:shadow-none px-4 text-[13px] text-slate-400 hover:text-slate-600 transition-colors">
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>

          {/* Services tab — functional */}
          <TabsContent value="services">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-4">
              {building.services.map(svc => {
                const SvcIcon = serviceIcons[svc.type] || Flame;
                const color = serviceColors[svc.type] || brand.blue;
                return (
                  <Card key={svc.id}
                    className="cursor-pointer hover:shadow-md transition-all group"
                    onClick={() => onNavigate({ page: "service-detail", buildingId: building.id, serviceId: svc.id })}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: color + "15" }}>
                          <SvcIcon size={16} style={{ color }} />
                        </div>
                        <ArrowRight size={14} className="text-slate-300 group-hover:text-slate-500 transition-colors" />
                      </div>
                      <h3 className="text-sm font-semibold mb-0.5" style={{ color: brand.navy }}>{t(svc.type, lang)}</h3>
                      <p className="text-[11px] text-slate-400">{t("provider", lang)}: {svc.provider}</p>
                      <p className="text-[11px] text-slate-400">{t("meterId", lang)}: {svc.meterId}</p>
                      <div className="mt-2">
                        <span className="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium bg-emerald-50 text-emerald-600">
                          {svc.status === "active" ? (lang === "da" ? "Aktiv" : "Active") : svc.status}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          {/* Overview tab — placeholder with stats */}
          <TabsContent value="overview">
            <div className="mt-4 grid grid-cols-2 lg:grid-cols-4 gap-3">
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
                <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wider mb-2">{t("epcRating", lang)}</p>
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center justify-center w-8 h-8 rounded text-sm font-bold text-white" style={{ background: EPC_COLORS[building.epc] }}>{building.epc}</span>
                  <span className="text-xs text-slate-400">{t("epcReq", lang)}</span>
                </div>
              </CardContent></Card>
              <Card><CardContent className="p-4">
                <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wider mb-2">{t("activeServices", lang)}</p>
                <span className="text-2xl font-bold tabular-nums" style={{ color: brand.navy }}>{building.services.length}</span>
              </CardContent></Card>
            </div>
          </TabsContent>

          {/* Placeholder tabs */}
          {["units", "tasks", "meters"].map(tab => (
            <TabsContent key={tab} value={tab}>
              <div className="flex items-center justify-center h-48 text-sm text-slate-400">
                {t("comingSoon", lang)}
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </div>
  );
}
