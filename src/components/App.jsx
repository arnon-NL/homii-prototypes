import React, { useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { Home, Inbox, CheckSquare, Zap } from "lucide-react";
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

  return (
    <LangCtx.Provider value={lang}>
      <div className="h-screen flex overflow-hidden" style={{ fontFamily: "'Plus Jakarta Sans','Poppins',system-ui,sans-serif", background: brand.bg }}>
        <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Poppins:wght@400;500;600;700&display=swap" rel="stylesheet"/>

        <Sidebar
          lang={lang}
          onLangChange={setLang}
        />

        <div className="flex-1 flex flex-col overflow-hidden">
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
