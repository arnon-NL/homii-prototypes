import React from "react";
import { NavLink } from "react-router-dom";
import { Home, Inbox, CheckSquare, BarChart3, Zap, Building2, Gauge, Truck, Search, Database } from "lucide-react";
import { brand, HomiiIcon } from "@/lib/brand";
import { t } from "@/lib/i18n";
import { buildings, meters, suppliers } from "@/lib/mockData";

const navItems = [
  { path: "/",          icon: Home,        key: "home" },
  { path: "/inbox",     icon: Inbox,       key: "inbox" },
  { path: "/tasks",     icon: CheckSquare, key: "tasks" },
];

const recordItems = [
  { path: "/buildings", icon: Building2, key: "buildings", count: buildings.length },
  { path: "/meters",    icon: Gauge,     key: "meters",    count: meters.length },
  { path: "/suppliers", icon: Truck,     key: "suppliers",  count: suppliers.length },
];

const analyseItems = [
  { path: "/reports",   icon: BarChart3, key: "reports" },
];

const systemItems = [
  { path: "/workflows",    icon: Zap,       key: "workflows" },
  { path: "/data-sources", icon: Database,  key: "dataSources" },
];

function NavButton({ item, lang, showCount }) {
  const Icon = item.icon;
  return (
    <NavLink
      to={item.path}
      end={item.path === "/"}
      className={({ isActive }) =>
        `w-full flex items-center gap-2.5 h-8 px-2.5 rounded-md text-[13px] transition-colors no-underline ${
          isActive
            ? "bg-slate-200/60 text-slate-900 font-medium"
            : "text-slate-600 hover:bg-slate-100 hover:text-slate-800"
        }`
      }
    >
      {({ isActive }) => (
        <>
          <Icon size={15} strokeWidth={isActive ? 2 : 1.5} />
          <span className="flex-1 text-left">{t(item.key, lang)}</span>
          {showCount && item.count != null && (
            <span className="text-[10px] text-slate-400 tabular-nums">{item.count}</span>
          )}
        </>
      )}
    </NavLink>
  );
}

function SectionLabel({ label }) {
  return (
    <div className="px-2.5 py-1 text-[10px] font-semibold text-slate-400 uppercase tracking-widest">
      {label}
    </div>
  );
}

export default function Sidebar({ lang, onLangChange }) {
  return (
    <aside className="w-60 shrink-0 border-r border-slate-200 bg-slate-50 flex flex-col h-full select-none">
      {/* Org header — KAB workspace */}
      <div className="px-3 pt-4 pb-2.5">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-[11px] font-extrabold tracking-wide"
            style={{ background: "#1A3C6E" }}>KAB</div>
          <div className="flex-1 min-w-0">
            <span className="text-[13px] font-semibold block truncate" style={{ color: brand.navy }}>KAB</span>
            <div className="flex items-center gap-1 mt-0.5">
              <HomiiIcon size={10} color={brand.blue} />
              <span className="text-[9px] text-slate-400 font-medium">powered by homii</span>
            </div>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="px-3 pb-2">
        <div className="flex items-center gap-2 h-8 px-2.5 rounded-md bg-slate-200/50 border border-slate-200/80 text-slate-400 cursor-pointer hover:bg-slate-200/80 transition-colors">
          <Search size={13} strokeWidth={2} />
          <span className="text-[12px]">{lang === "da" ? "Søg..." : "Search..."}</span>
          <span className="ml-auto text-[10px] font-mono text-slate-300 bg-white/60 px-1.5 py-0.5 rounded border border-slate-200/80">⌘K</span>
        </div>
      </div>

      <div className="h-px bg-slate-200 mx-3" />

      {/* Navigation */}
      <nav className="flex-1 px-2 py-2 space-y-0.5 overflow-y-auto">
        {navItems.map(item => (
          <NavButton key={item.path} item={item} lang={lang} />
        ))}

        <div className="h-px bg-slate-200 my-2 mx-1" />

        <SectionLabel label={t("records", lang)} />
        {recordItems.map(item => (
          <NavButton key={item.path} item={item} lang={lang} showCount />
        ))}

        <div className="h-px bg-slate-200 my-2 mx-1" />

        <SectionLabel label={t("analyse", lang)} />
        {analyseItems.map(item => (
          <NavButton key={item.path} item={item} lang={lang} />
        ))}

        <div className="h-px bg-slate-200 my-2 mx-1" />

        <SectionLabel label={t("system", lang)} />
        {systemItems.map(item => (
          <NavButton key={item.path} item={item} lang={lang} />
        ))}
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
