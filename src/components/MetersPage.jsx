import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Flame, Droplets, Zap, Search } from "lucide-react";
import { brand } from "@/lib/brand";
import { t, useLang } from "@/lib/i18n";
import { meters as allMeters, getBuilding, getSupplier } from "@/lib/mockData";
import { StatusBadge } from "@/components/ui/status-badge";

const typeIcons = { fjernvarme: Flame, vand: Droplets, el: Zap };
const typeColors = { fjernvarme: "#EF4444", vand: "#3B82F6", el: "#F59E0B" };

export default function MetersPage() {
  const lang = useLang();
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");

  const meterRows = useMemo(() => {
    return allMeters.map(m => {
      const building = getBuilding(m.buildingId);
      const supplier = getSupplier(m.supplierId);
      return {
        ...m,
        buildingName: building?.name || m.buildingId,
        supplierName: supplier?.name || m.supplierId,
      };
    });
  }, []);

  const filtered = useMemo(() => {
    let result = meterRows;
    if (typeFilter !== "all") result = result.filter(m => m.type === typeFilter);
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(m =>
        m.id.toLowerCase().includes(q) ||
        m.buildingName.toLowerCase().includes(q) ||
        m.supplierName.toLowerCase().includes(q)
      );
    }
    return result;
  }, [meterRows, search, typeFilter]);

  const typeFilters = [
    { value: "all", label: lang === "da" ? "Alle" : "All" },
    { value: "fjernvarme", label: t("fjernvarme", lang) },
    { value: "vand", label: t("vand", lang) },
    { value: "el", label: t("el", lang) },
  ];

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-4 sm:py-6">
        <div className="flex items-baseline gap-2.5 mb-5">
          <h1 className="text-xl font-semibold" style={{ color: brand.navy }}>{t("meters", lang)}</h1>
          <span className="text-sm text-slate-400">{filtered.length}</span>
        </div>

        {/* Search & filter bar */}
        <div className="flex flex-wrap items-center gap-3 mb-4">
          <div className="relative flex-1 min-w-[200px] max-w-[320px]">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder={lang === "da" ? "Søg måler, bygning..." : "Search meter, building..."}
              className="w-full h-8 pl-8 pr-3 text-sm rounded-lg border border-slate-200 bg-white text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#3EB1C8]/30 focus:border-[#3EB1C8] transition-all"
            />
          </div>
          <div className="inline-flex items-center rounded-lg bg-slate-100 p-0.5">
            {typeFilters.map(f => (
              <button
                key={f.value}
                onClick={() => setTypeFilter(f.value)}
                className={`px-3 h-7 rounded-md text-xs font-medium transition-all ${
                  typeFilter === f.value
                    ? "bg-white text-slate-900 shadow-sm"
                    : "text-slate-500 hover:text-slate-700"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Mobile card view */}
        <div className="block md:hidden space-y-3">
          {filtered.map(m => {
            const SvcIcon = typeIcons[m.type] || Flame;
            const color = typeColors[m.type];
            return (
              <button
                key={m.id}
                onClick={() => navigate(`/meters/${m.id}`)}
                className="w-full text-left rounded-lg border border-slate-200 bg-white p-4 hover:border-[#3EB1C8] hover:shadow-md transition-all"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="text-[13px] font-mono font-semibold tracking-tight mb-1" style={{ color: brand.navy }}>{m.id}</div>
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-5 h-5 rounded flex items-center justify-center flex-shrink-0" style={{ background: color + "15" }}>
                        <SvcIcon size={12} style={{ color }} />
                      </div>
                      <span className="text-xs text-slate-600">{t(m.type, lang)}</span>
                    </div>
                    <div className="text-sm font-medium text-slate-700 truncate">{m.buildingName}</div>
                  </div>
                  <div className="flex-shrink-0">
                    <StatusBadge status={m.status} lang={lang} />
                  </div>
                </div>
                <div className="mt-3 pt-3 border-t border-slate-100">
                  <div className="text-xs text-slate-500 mb-1">{t("lastReading", lang)}</div>
                  <div className="text-sm font-medium tabular-nums" style={{ color: brand.navy }}>
                    {m.lastReading.value} <span className="text-slate-400 font-normal">{m.lastReading.unit}</span>
                  </div>
                </div>
              </button>
            );
          })}
          {filtered.length === 0 && (
            <div className="px-4 py-8 text-center text-sm text-slate-400">
              {lang === "da" ? "Ingen målere fundet" : "No meters found"}
            </div>
          )}
        </div>

        {/* Desktop table view */}
        <div className="hidden md:block overflow-x-auto rounded-lg border border-slate-200 bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/80">
                <th className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider px-3 sm:px-5 py-2.5 text-left">{t("meterId", lang)}</th>
                <th className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider px-3 sm:px-5 py-2.5 text-left">{t("meterType", lang)}</th>
                <th className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider px-3 sm:px-5 py-2.5 text-left">{t("building", lang)}</th>
                <th className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider px-3 sm:px-5 py-2.5 text-left">{t("supplier", lang)}</th>
                <th className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider px-3 sm:px-5 py-2.5 text-center">{t("meterStatus", lang)}</th>
                <th className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider px-3 sm:px-5 py-2.5 text-right">{t("lastReading", lang)}</th>
                <th className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider px-3 sm:px-5 py-2.5 text-right">{t("readingDate", lang)}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map(m => {
                const SvcIcon = typeIcons[m.type] || Flame;
                const color = typeColors[m.type];
                return (
                  <tr key={m.id}
                    className="hover:bg-slate-50/80 transition-colors cursor-pointer"
                    onClick={() => navigate(`/meters/${m.id}`)}
                  >
                    <td className="px-3 sm:px-5 py-3">
                      <span className="text-[13px] font-mono font-semibold tracking-tight" style={{ color: brand.navy }}>{m.id}</span>
                    </td>
                    <td className="px-3 sm:px-5 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded flex items-center justify-center" style={{ background: color + "15" }}>
                          <SvcIcon size={13} style={{ color }} />
                        </div>
                        <span className="text-sm text-slate-600">{t(m.type, lang)}</span>
                      </div>
                    </td>
                    <td className="px-3 sm:px-5 py-3">
                      <button
                        className="text-sm text-slate-600 hover:text-[#3EB1C8] transition-colors"
                        onClick={(e) => { e.stopPropagation(); navigate(`/buildings/${m.buildingId}`); }}
                      >
                        {m.buildingName}
                      </button>
                    </td>
                    <td className="px-3 sm:px-5 py-3">
                      <button
                        className="text-sm text-slate-500 hover:text-[#3EB1C8] transition-colors"
                        onClick={(e) => { e.stopPropagation(); navigate(`/suppliers/${m.supplierId}`); }}
                      >
                        {m.supplierName}
                      </button>
                    </td>
                    <td className="px-3 sm:px-5 py-3 text-center">
                      <StatusBadge status={m.status} lang={lang} />
                    </td>
                    <td className="px-3 sm:px-5 py-3 text-sm text-right tabular-nums font-medium" style={{ color: brand.navy }}>
                      {m.lastReading.value} <span className="text-slate-400 font-normal">{m.lastReading.unit}</span>
                    </td>
                    <td className="px-3 sm:px-5 py-3 text-sm text-right text-slate-400 tabular-nums">{m.lastReading.date}</td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-3 sm:px-5 py-8 text-center text-sm text-slate-400">
                    {lang === "da" ? "Ingen målere fundet" : "No meters found"}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
