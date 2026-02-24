import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { brand, EPC_COLORS } from "@/lib/brand";
import { t, useLang } from "@/lib/i18n";
import { buildings } from "@/lib/mockData";
import Breadcrumbs from "./Breadcrumbs";

export default function BuildingListPage({ onNavigate }) {
  const lang = useLang();

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-[960px] mx-auto px-6 py-6">
        <Breadcrumbs items={[{ label: t("buildings", lang) }]} />

        <div className="flex items-center justify-between mb-5">
          <div>
            <h1 className="text-xl font-semibold" style={{ color: brand.navy }}>{t("buildings", lang)}</h1>
            <p className="text-sm text-slate-400 mt-0.5">{buildings.length} {t("buildings", lang).toLowerCase()}</p>
          </div>
        </div>

        {/* Building table */}
        <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/80">
                <th className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider px-4 py-2.5 text-left">{lang === "da" ? "Navn" : "Name"}</th>
                <th className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider px-4 py-2.5 text-left">{t("address", lang)}</th>
                <th className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider px-4 py-2.5 text-center">{t("epcRating", lang)}</th>
                <th className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider px-4 py-2.5 text-right">{t("units", lang)}</th>
                <th className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider px-4 py-2.5 text-right">{t("activeServices", lang)}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {buildings.map(b => (
                <tr
                  key={b.id}
                  onClick={() => onNavigate({ page: "building-detail", buildingId: b.id })}
                  className="hover:bg-slate-50/80 transition-colors cursor-pointer group"
                >
                  <td className="px-4 py-3">
                    <span className="text-sm font-medium group-hover:text-[#3EB1C8] transition-colors" style={{ color: brand.navy }}>{b.name}</span>
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-500">{b.address}</td>
                  <td className="px-4 py-3 text-center">
                    <span className="inline-flex items-center justify-center w-6 h-6 rounded text-[10px] font-bold text-white"
                      style={{ background: EPC_COLORS[b.epc] }}>
                      {b.epc}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-right tabular-nums text-slate-600">{b.units}</td>
                  <td className="px-4 py-3 text-sm text-right tabular-nums text-slate-600">{b.services.length}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
