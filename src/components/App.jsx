import React, { useState, useCallback } from "react";
import { Home, Inbox, CheckSquare, Zap } from "lucide-react";
import { LangCtx } from "@/lib/i18n";
import { brand } from "@/lib/brand";
import { t } from "@/lib/i18n";

import Sidebar from "./Sidebar";
import BuildingListPage from "./BuildingListPage";
import BuildingDetailPage from "./BuildingDetailPage";
import ServiceDetailPage from "./ServiceDetailPage";
import MetersPage from "./MetersPage";
import ReportsPage from "./ReportsPage";
import PlaceholderPage from "./PlaceholderPage";

const placeholderIcons = {
  home: Home,
  inbox: Inbox,
  tasks: CheckSquare,
  workflows: Zap,
};

export default function App() {
  const [lang, setLang] = useState("da");
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
      case "meters":
        return <MetersPage onNavigate={navigate} />;
      case "reports":
        return <ReportsPage onNavigate={navigate} reportId={navState.reportId} />;
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
        />

        <div className="flex-1 flex flex-col overflow-hidden">
          {renderPage()}
        </div>
      </div>
    </LangCtx.Provider>
  );
}
