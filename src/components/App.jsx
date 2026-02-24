import React, { useState, useCallback } from "react";
import { Home, Inbox, CheckSquare, BarChart3, Zap, Building2, Gauge } from "lucide-react";
import { LangCtx } from "@/lib/i18n";
import { brand, HomiiIcon } from "@/lib/brand";
import { t } from "@/lib/i18n";

import Sidebar from "./Sidebar";
import BuildingListPage from "./BuildingListPage";
import BuildingDetailPage from "./BuildingDetailPage";
import ServiceDetailPage from "./ServiceDetailPage";
import PlaceholderPage from "./PlaceholderPage";

const placeholderIcons = {
  home: Home,
  inbox: Inbox,
  tasks: CheckSquare,
  reports: BarChart3,
  workflows: Zap,
  meters: Gauge,
};

export default function App() {
  const [lang, setLang] = useState("da");
  const [cycle, setCycle] = useState("2025-2026");
  const [navState, setNavState] = useState({ page: "buildings" });

  const navigate = useCallback((state) => {
    setNavState(state);
  }, []);

  const renderPage = () => {
    switch (navState.page) {
      case "buildings":
        return <BuildingListPage onNavigate={navigate} />;
      case "building-detail":
        return <BuildingDetailPage buildingId={navState.buildingId} onNavigate={navigate} />;
      case "service-detail":
        return <ServiceDetailPage buildingId={navState.buildingId} serviceId={navState.serviceId} onNavigate={navigate} />;
      default: {
        const Icon = placeholderIcons[navState.page] || Home;
        const title = t(navState.page, lang);
        return <PlaceholderPage title={title} icon={Icon} />;
      }
    }
  };

  return (
    <LangCtx.Provider value={lang}>
      <div className="h-screen flex overflow-hidden" style={{ fontFamily: "'Plus Jakarta Sans','Poppins',system-ui,sans-serif", background: brand.bg }}>
        <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Poppins:wght@400;500;600;700&display=swap" rel="stylesheet"/>

        <Sidebar
          activePage={navState.page}
          onNavigate={navigate}
          lang={lang}
          onLangChange={setLang}
          cycle={cycle}
          onCycleChange={setCycle}
        />

        <div className="flex-1 flex flex-col overflow-hidden">
          {renderPage()}
        </div>
      </div>
    </LangCtx.Provider>
  );
}
