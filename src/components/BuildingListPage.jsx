import React from "react";
import { useNavigate } from "react-router-dom";
import { brand, EPC_COLORS } from "@/lib/brand";
import { t, useLang } from "@/lib/i18n";
import { buildings, getMetersForBuilding } from "@/lib/mockData";
import { StatusBadge } from "@/components/ui/status-badge";

export default function BuildingListPage() {
  const lang = useLang();
  const navigate = useNavigate();

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-4 sm:py-6">
        {/* Attio-style header: title + count inline */}
        <div className="flex items-baseline gap-2.5 mb-5">
          <h1 className="text-xl font-semibold" style={{ color: brand.navy }}>{t("buildings", lang)}</h1>
          <span className="text-sm text-slate-400">{buildings.length}</span>
        </div>

        {/* Mobile card view */}
        <div className="block md:hidden space-y-3">
          {buildings.map(b => {
            const meterCount = getMetersForBuilding(b.id).length;
            return (
              <div
                key={b.id}
                onClick={() => navigate(`/buildings/${b.id}`)}
                className="bg-white rounded-lg border border-slate-200 p-4 cursor-pointer hover:border-slate-300 hover:shadow-sm transition-all active:bg-slate-50"
              >
                {/* Building name and EPC badge */}
                <div className="flex items-start justify-between gap-3 mb-2">
                  <h3 className="text-sm font-semibold flex-1" style={{ color: brand.navy }}>{b.name}</h3>
                  <span className="inline-flex items-center justify-center w-6 h-6 rounded text-[10px] font-bold text-white flex-shrink-0"
                    style={{ background: EPC_COLORS[b.epc] }}>
                    {b.epc}
                  </span>
                </div>

                {/* Address */}
                <p className="text-xs text-slate-500 mb-3">{b.address}</p>

                {/* Status and counts */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex-1">
                    <StatusBadge status={b.status} lang={lang} />
                  </div>
                  <div className="flex gap-4 text-xs text-slate-600">
                    <div className="text-right">
                      <div className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">{t("units", lang)}</div>
                      <div className="font-semibold tabular-nums">{b.units}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">{t("meters", lang)}</div>
                      <div className="font-semibold tabular-nums">{meterCount}</div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Full-width table - hidden on mobile */}
        <div className="hidden md:block overflow-x-auto rounded-lg border border-slate-200 bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/80">
                <th className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider px-3 sm:px-5 py-2.5 text-left">{lang === "da" ? "Navn" : "Name"}</th>
                <th className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider px-3 sm:px-5 py-2.5 text-left">{t("address", lang)}</th>
                <th className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider px-3 sm:px-5 py-2.5 text-center">{t("epcRating", lang)}</th>
                <th className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider px-3 sm:px-5 py-2.5 text-center">{t("meterStatus", lang)}</th>
                <th className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider px-3 sm:px-5 py-2.5 text-right">{t("units", lang)}</th>
                <th className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider px-3 sm:px-5 py-2.5 text-right">{t("meters", lang)}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {buildings.map(b => {
                const meterCount = getMetersForBuilding(b.id).length;
                return (
                  <tr
                    key={b.id}
                    onClick={() => navigate(`/buildings/${b.id}`)}
                    className="hover:bg-slate-50/80 transition-colors cursor-pointer group"
                  >
                    <td className="px-3 sm:px-5 py-3">
                      <span className="text-sm font-medium group-hover:text-[#3EB1C8] transition-colors" style={{ color: brand.navy }}>{b.name}</span>
                    </td>
                    <td className="px-3 sm:px-5 py-3 text-sm text-slate-500">{b.address}</td>
                    <td className="px-3 sm:px-5 py-3 text-center">
                      <span className="inline-flex items-center justify-center w-6 h-6 rounded text-[10px] font-bold text-white"
                        style={{ background: EPC_COLORS[b.epc] }}>
                        {b.epc}
                      </span>
                    </td>
                    <td className="px-3 sm:px-5 py-3 text-center">
                      <StatusBadge status={b.status} lang={lang} />
                    </td>
                    <td className="px-3 sm:px-5 py-3 text-sm text-right tabular-nums text-slate-600">{b.units}</td>
                    <td className="px-3 sm:px-5 py-3 text-sm text-right tabular-nums text-slate-600">{meterCount}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
