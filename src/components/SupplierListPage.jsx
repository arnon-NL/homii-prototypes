import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Truck, Search, ArrowRight } from "lucide-react";
import { brand } from "@/lib/brand";
import { t, useLang } from "@/lib/i18n";
import { suppliers, getMetersForSupplier, getBuildingsForSupplier } from "@/lib/mockData";
import { StatusBadge } from "@/components/ui/status-badge";

export default function SupplierListPage() {
  const lang = useLang();
  const navigate = useNavigate();
  const [search, setSearch] = useState("");

  const rows = useMemo(() => {
    return suppliers.map(s => ({
      ...s,
      meterCount: getMetersForSupplier(s.id).length,
      buildingCount: getBuildingsForSupplier(s.id).length,
      utilityLabels: s.utilityTypes.map(u => t(u, lang)).join(", "),
    }));
  }, [lang]);

  const filtered = useMemo(() => {
    if (!search.trim()) return rows;
    const q = search.toLowerCase();
    return rows.filter(s =>
      s.name.toLowerCase().includes(q) ||
      s.contact.toLowerCase().includes(q) ||
      s.utilityLabels.toLowerCase().includes(q)
    );
  }, [rows, search]);

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-[1200px] mx-auto px-6 py-6">
        <div className="flex items-baseline gap-2.5 mb-5">
          <h1 className="text-xl font-semibold" style={{ color: brand.navy }}>{t("suppliers", lang)}</h1>
          <span className="text-sm text-slate-400">{filtered.length}</span>
        </div>

        {/* Search bar */}
        <div className="flex flex-wrap items-center gap-3 mb-4">
          <div className="relative flex-1 min-w-[200px] max-w-[320px]">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder={lang === "da" ? "Søg leverandør..." : "Search supplier..."}
              className="w-full h-8 pl-8 pr-3 text-sm rounded-lg border border-slate-200 bg-white text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#3EB1C8]/30 focus:border-[#3EB1C8] transition-all"
            />
          </div>
        </div>

        <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/80">
                <th className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider px-5 py-2.5 text-left">{t("supplier", lang)}</th>
                <th className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider px-5 py-2.5 text-left">{t("utilityTypes", lang)}</th>
                <th className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider px-5 py-2.5 text-center">{t("meterStatus", lang)}</th>
                <th className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider px-5 py-2.5 text-right">{t("meters", lang)}</th>
                <th className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider px-5 py-2.5 text-right">{t("buildings", lang)}</th>
                <th className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider px-5 py-2.5 text-left">{t("contact", lang)}</th>
                <th className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider px-5 py-2.5 text-right"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map(s => (
                <tr key={s.id}
                  className="hover:bg-slate-50/80 transition-colors cursor-pointer"
                  onClick={() => navigate(`/suppliers/${s.id}`)}
                >
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-slate-100">
                        <Truck size={15} className="text-slate-500" />
                      </div>
                      <span className="text-sm font-medium" style={{ color: brand.navy }}>{s.name}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-sm text-slate-500">{s.utilityLabels}</td>
                  <td className="px-5 py-3 text-center">
                    <StatusBadge status={s.status} lang={lang} />
                  </td>
                  <td className="px-5 py-3 text-sm text-right tabular-nums font-medium" style={{ color: brand.navy }}>{s.meterCount}</td>
                  <td className="px-5 py-3 text-sm text-right tabular-nums font-medium" style={{ color: brand.navy }}>{s.buildingCount}</td>
                  <td className="px-5 py-3 text-sm text-slate-400">{s.contact}</td>
                  <td className="px-5 py-3 text-right">
                    <ArrowRight size={14} className="text-slate-300" />
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-5 py-8 text-center text-sm text-slate-400">
                    {lang === "da" ? "Ingen leverandører fundet" : "No suppliers found"}
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
