import React from "react";
import { brand } from "@/lib/brand";

/* ── Locale-aware number formatting (da-DK) ── */
const fmtNum = (v, decimals = 0) => {
  if (v == null || isNaN(v)) return "–";
  return v.toLocaleString("da-DK", { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
};

/**
 * BrandTooltip — consistent Recharts tooltip across all chart types.
 */
export const BrandTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg px-3 py-2.5 shadow-xl text-xs border" style={{ background: brand.surface, borderColor: brand.border }}>
      <div className="font-semibold mb-1.5" style={{ color: brand.navy }}>{label}</div>
      {payload.map((p, idx) => (
        <div key={idx} className="flex items-center gap-2 py-0.5" style={{ color: brand.text }}>
          <span className="w-2 h-2 rounded-full shrink-0" style={{ background: p.color }} />
          <span className="text-slate-500">{p.name}:</span>
          <span className="font-semibold ml-auto tabular-nums">{typeof p.value === "number" ? fmtNum(p.value, 1) : p.value}</span>
        </div>
      ))}
    </div>
  );
};
