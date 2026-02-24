import React from "react";
import { Home, Inbox, CheckSquare, BarChart3, Zap, Building2, Gauge } from "lucide-react";
import { brand, HomiiIcon } from "@/lib/brand";
import { t } from "@/lib/i18n";

const navItems = [
  { id: "home",      icon: Home,        key: "home" },
  { id: "inbox",     icon: Inbox,       key: "inbox" },
  { id: "tasks",     icon: CheckSquare, key: "tasks" },
  { id: "reports",   icon: BarChart3,   key: "reports" },
  { id: "workflows", icon: Zap,         key: "workflows" },
];

const recordItems = [
  { id: "buildings", icon: Building2, key: "buildings", count: 4 },
  { id: "meters",    icon: Gauge,     key: "meters",    count: 12 },
];

export default function Sidebar({ activePage, onNavigate, lang, onLangChange }) {
  return (
    <aside className="w-60 shrink-0 border-r border-slate-200 bg-slate-50/80 flex flex-col h-full select-none">
      {/* Logo + Org */}
      <div className="px-4 pt-4 pb-3">
        <div className="flex items-center gap-2">
          <HomiiIcon size={18} color={brand.blue} />
          <span className="text-sm font-bold tracking-tight" style={{ color: brand.navy }}>homii</span>
        </div>
      </div>

      <div className="h-px bg-slate-200 mx-3" />

      {/* Navigation */}
      <nav className="flex-1 px-2 py-2 space-y-0.5 overflow-y-auto">
        {navItems.map(item => {
          const Icon = item.icon;
          const isActive = activePage === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate({ page: item.id })}
              className={`w-full flex items-center gap-2.5 h-8 px-2.5 rounded-md text-[13px] transition-colors ${
                isActive
                  ? "bg-slate-200/60 text-slate-900 font-medium"
                  : "text-slate-500 hover:bg-slate-100 hover:text-slate-700"
              }`}
            >
              <Icon size={15} strokeWidth={isActive ? 2 : 1.5} />
              {t(item.key, lang)}
            </button>
          );
        })}

        <div className="h-px bg-slate-200 my-2 mx-1" />

        <div className="px-2.5 py-1 text-[10px] font-semibold text-slate-400 uppercase tracking-widest">
          {t("records", lang)}
        </div>
        {recordItems.map(item => {
          const Icon = item.icon;
          const isActive = activePage === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate({ page: item.id })}
              className={`w-full flex items-center gap-2.5 h-8 px-2.5 rounded-md text-[13px] transition-colors ${
                isActive
                  ? "bg-slate-200/60 text-slate-900 font-medium"
                  : "text-slate-500 hover:bg-slate-100 hover:text-slate-700"
              }`}
            >
              <Icon size={15} strokeWidth={isActive ? 2 : 1.5} />
              <span className="flex-1 text-left">{t(item.key, lang)}</span>
              <span className="text-[10px] text-slate-400 tabular-nums">{item.count}</span>
            </button>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="border-t border-slate-200 px-3 py-2.5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full flex items-center justify-center text-white text-[9px] font-bold"
            style={{ background: brand.blue + "40", border: `1px solid ${brand.blue}50` }}>AB</div>
          <span className="text-[11px] text-slate-500">Admin</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="inline-flex rounded-md overflow-hidden bg-slate-200/60">
            {["da", "en"].map(l => (
              <button key={l} onClick={() => onLangChange(l)}
                className={`px-2 py-0.5 text-[9px] font-semibold transition-all ${
                  lang === l ? "bg-white text-slate-700 shadow-sm" : "text-slate-400 hover:text-slate-600"
                }`}>
                {l.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
      </div>
    </aside>
  );
}
