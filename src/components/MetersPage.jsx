import React, { useMemo } from "react";
import { Flame, Droplets, Zap } from "lucide-react";
import { brand } from "@/lib/brand";
import { t, useLang } from "@/lib/i18n";
import { buildings } from "@/lib/mockData";

const typeIcons = { fjernvarme: Flame, vand: Droplets, el: Zap };
const typeColors = { fjernvarme: "#EF4444", vand: "#3B82F6", el: "#F59E0B" };

function simulateReading(meterId, type) {
  const seed = meterId.split("").reduce((s, c) => s + c.charCodeAt(0), 0);
  const r = Math.sin(seed * 137) * 0.5 + 0.5;
  if (type === "fjernvarme") return { value: (120 + r * 380).toFixed(1), unit: "MWh", date: "2026-02-23" };
  if (type === "vand") return { value: (800 + r * 4200).toFixed(0), unit: "m³", date: "2026-02-24" };
  return { value: (35 + r * 65).toFixed(1), unit: "MWh", date: "2026-02-24" };
}

export default function MetersPage({ onNavigate }) {
  const lang = useLang();

  const meters = useMemo(() => {
    return buildings.flatMap(b =>
      b.services.map(svc => {
        const reading = simulateReading(svc.meterId, svc.type);
        return {
          id: svc.meterId,
          type: svc.type,
          buildingId: b.id,
          buildingName: b.name,
          provider: svc.provider,
          status: svc.status,
          lastValue: reading.value,
          lastUnit: reading.unit,
          lastDate: reading.date,
        };
      })
    );
  }, []);

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="px-8 py-6">
        <div className="flex items-baseline gap-2.5 mb-5">
          <h1 className="text-xl font-semibold" style={{ color: brand.navy }}>{t("meters", lang)}</h1>
          <span className="text-sm text-slate-400">{meters.length}</span>
        </div>

        <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/80">
                <th className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider px-5 py-2.5 text-left">{t("meterId", lang)}</th>
                <th className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider px-5 py-2.5 text-left">{t("meterType", lang)}</th>
                <th className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider px-5 py-2.5 text-left">{t("building", lang)}</th>
                <th className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider px-5 py-2.5 text-left">{t("provider", lang)}</th>
                <th className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider px-5 py-2.5 text-center">{t("meterStatus", lang)}</th>
                <th className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider px-5 py-2.5 text-right">{t("lastReading", lang)}</th>
                <th className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider px-5 py-2.5 text-right">{t("readingDate", lang)}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {meters.map(m => {
                const SvcIcon = typeIcons[m.type] || Flame;
                const color = typeColors[m.type];
                return (
                  <tr key={m.id} className="hover:bg-slate-50/80 transition-colors">
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
                    <td className="px-5 py-3">
                      <button
                        className="text-sm text-slate-600 hover:text-[#3EB1C8] transition-colors"
                        onClick={() => onNavigate({ page: "building-detail", buildingId: m.buildingId })}
                      >
                        {m.buildingName}
                      </button>
                    </td>
                    <td className="px-5 py-3 text-sm text-slate-500">{m.provider}</td>
                    <td className="px-5 py-3 text-center">
                      <span className="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium bg-emerald-50 text-emerald-600">
                        {m.status === "active" ? (lang === "da" ? "Aktiv" : "Active") : m.status}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-sm text-right tabular-nums font-medium" style={{ color: brand.navy }}>
                      {m.lastValue} <span className="text-slate-400 font-normal">{m.lastUnit}</span>
                    </td>
                    <td className="px-5 py-3 text-sm text-right text-slate-400 tabular-nums">{m.lastDate}</td>
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
