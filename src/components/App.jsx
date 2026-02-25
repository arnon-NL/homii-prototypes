import React, { useState, useCallback } from "react";
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
  home: Home,
  inbox: Inbox,
  tasks: CheckSquare,
  workflows: Zap,
};

export default function App() {
  const [lang, setLang] = useState("da");
  const [navState, setNavState] = useState({ page: "home" });

  const navigate = useCallback((state) => {
    setNavState(state);
  }, []);

  const renderPage = () => {
    switch (navState.page) {
      case "home":
        return <HomePage onNavigate={navigate} />;
      case "buildings":
        return <BuildingListPage onNavigate={navigate} />;
      case "building-detail":
        return <BuildingDetailPage buildingId={navState.buildingId} onNavigate={navigate} />;
      case "meters":
        return <MetersPage onNavigate={navigate} />;
      case "meter-detail":
        return <MeterDetailPage meterId={navState.meterId} onNavigate={navigate} />;
      case "suppliers":
        return <SupplierListPage onNavigate={navigate} />;
      case "supplier-detail":
        return <SupplierDetailPage supplierId={navState.supplierId} onNavigate={navigate} />;
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
