import React from "react";
import { ArrowUpRight } from "lucide-react";
import { brand } from "@/lib/brand";

/**
 * Attio-style attribute panel — right-side grouped property sections.
 *
 * Usage:
 *   <AttributePanel>
 *     <AttrSection title="Bygningsdata">
 *       <AttrRow label="Adresse" value="Ørestads..." />
 *       <AttrRow label="Postnr" value="2300" />
 *     </AttrSection>
 *   </AttributePanel>
 */

export function AttributePanel({ children }) {
  return (
    <div className="w-full xl:w-[280px] shrink-0 xl:border-l border-t xl:border-t-0 border-slate-200 bg-slate-50/50 overflow-y-auto mt-6 xl:mt-0 pt-6 xl:pt-0">
      <div className="px-4 py-4 space-y-5">
        {children}
      </div>
    </div>
  );
}

export function AttrSection({ title, children }) {
  return (
    <div>
      <h3 className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-2.5">{title}</h3>
      <div className="space-y-2">
        {children}
      </div>
    </div>
  );
}

export function AttrRow({ label, value, onClick, color }) {
  const Val = onClick ? "button" : "span";
  return (
    <div className="flex items-baseline justify-between gap-2 min-h-[22px]">
      <span className="text-[11px] text-slate-400 shrink-0">{label}</span>
      <Val
        className={`text-[12px] font-medium text-right truncate max-w-[160px] ${onClick ? "hover:text-[#3EB1C8] cursor-pointer transition-colors" : ""}`}
        style={{ color: color || brand.navy }}
        onClick={onClick}
        title={typeof value === "string" ? value : undefined}
      >
        {value}
      </Val>
    </div>
  );
}

export function AttrLink({ title, label, items, onItemClick }) {
  return (
    <div>
      <h3 className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-2.5">{title || label}</h3>
      <div className="space-y-1">
        {items.map((item, i) => (
          <button
            key={i}
            onClick={() => item.onClick ? item.onClick() : onItemClick?.(item)}
            className="group flex items-center gap-1 text-[12px] font-medium text-left transition-colors text-[#3B8EA5] hover:text-[#3EB1C8] hover:underline"
          >
            <span>{item.label}</span>
            <ArrowUpRight size={11} className="opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
          </button>
        ))}
      </div>
    </div>
  );
}
