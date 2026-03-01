import React, { useState } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { Home, Inbox, CheckSquare, Zap, Menu, X } from "lucide-react";
import { LangCtx } from "@/lib/i18n";
import { brand } from "@/lib/brand";
import { t } from "@/lib/i18n";

import Sidebar from "./Sidebar";
import HomePage from "./HomePage";
import BuildingListPage from "./BuildingListPage";
import BuildingDetailPage from "./BuildingDetailPage";
import MeterDetailPage from "./MeterDetailPage";
import MetersPage from "./MetersPage";
import SupplierListPage from "./SupplierListPage";
import SupplierDetailPage from "./SupplierDetailPage";
import ReportsPage from "./ReportsPage";
import PlaceholderPage from "./PlaceholderPage";

const placeholderIcons = {
  inbox: Inbox,
  tasks: CheckSquare,
  workflows: Zap,
  "data-sources": Home,
};

function PlaceholderRoute({ pageKey }) {
  const Icon = placeholderIcons[pageKey] || Home;
  return <PlaceholderPage title={pageKey} icon={Icon} />;
}

export default function App() {
  const [lang, setLang] = useState("da");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  // Close mobile sidebar on navigation
  React.useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  return (
    <LangCtx.Provider value={lang}>
      <div className="h-screen flex overflow-hidden" style={{ fontFamily: "'Plus Jakarta Sans','Poppins',system-ui,sans-serif", background: brand.bg }}>
        <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Poppins:wght@400;500;600;700&display=swap" rel="stylesheet"/>

        {/* Mobile header bar */}
        <div className="lg:hidden fixed top-0 left-0 right-0 z-40 h-12 bg-white border-b border-slate-200 flex items-center px-4 gap-3">
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="text-slate-600 hover:text-slate-900 transition-colors">
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
          <span className="text-[13px] font-semibold" style={{ color: brand.navy }}>KAB</span>
        </div>

        {/* Sidebar: hidden on mobile unless toggled, always visible on lg+ */}
        {sidebarOpen && (
          <div className="lg:hidden fixed inset-0 z-30 bg-black/30" onClick={() => setSidebarOpen(false)} />
        )}
        <div className={`fixed lg:static z-30 h-full transition-transform duration-200 ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}>
          <Sidebar
            lang={lang}
            onLangChange={setLang}
          />
        </div>

        {/* Main content — offset on mobile for top bar */}
        <div className="flex-1 flex flex-col overflow-hidden pt-12 lg:pt-0">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/buildings" element={<BuildingListPage />} />
            <Route path="/buildings/:buildingId" element={<BuildingDetailPage />} />
            <Route path="/meters" element={<MetersPage />} />
            <Route path="/meters/:meterId" element={<MeterDetailPage />} />
            <Route path="/suppliers" element={<SupplierListPage />} />
            <Route path="/suppliers/:supplierId" element={<SupplierDetailPage />} />
            <Route path="/reports" element={<ReportsPage />} />
            <Route path="/reports/:reportId" element={<ReportsPage />} />
            <Route path="/inbox" element={<PlaceholderRoute pageKey="inbox" />} />
            <Route path="/tasks" element={<PlaceholderRoute pageKey="tasks" />} />
            <Route path="/workflows" element={<PlaceholderRoute pageKey="workflows" />} />
            <Route path="/data-sources" element={<PlaceholderRoute pageKey="data-sources" />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </div>
    </LangCtx.Provider>
  );
}
