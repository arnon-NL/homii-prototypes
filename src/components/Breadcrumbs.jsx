import React from "react";
import { ChevronRight } from "lucide-react";
import { brand } from "@/lib/brand";

export default function Breadcrumbs({ items }) {
  if (!items || items.length === 0) return null;

  return (
    <nav className="flex items-center gap-1 text-[12px] text-slate-400 mb-4">
      {items.map((item, idx) => (
        <React.Fragment key={idx}>
          {idx > 0 && <ChevronRight size={12} className="text-slate-300 mx-0.5" />}
          {item.onClick ? (
            <button
              onClick={item.onClick}
              className="hover:text-slate-600 transition-colors"
            >
              {item.label}
            </button>
          ) : (
            <span className="text-slate-700 font-medium">{item.label}</span>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
}
