import React from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Flame, Droplets, Zap } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { brand, EPC_COLORS } from "@/lib/brand";
import { t, useLang } from "@/lib/i18n";
import { buildings } from "@/lib/mockData";
import Breadcrumbs from "./Breadcrumbs";
import DashboardContainer from "./homii-energy-dashboard";

const serviceIcons = { fjernvarme: Flame, vand: Droplets, el: Zap };
const serviceColors = { fjernvarme: "#EF4444", vand: "#3B82F6", el: "#F59E0B" };

export default function ServiceDetailPage({ buildingId, serviceId }) {
  const lang = useLang();
  const navigate = useNavigate();
  const building = buildings.find(b => b.id === buildingId);
  const service = building?.services.find(s => s.id === serviceId);

  if (!building || !service) return <div className="p-6 text-slate-400">Not found</div>;

  const SvcIcon = serviceIcons[service.type] || Flame;
  const color = serviceColors[service.type] || brand.blue;

  const crumbs = [
    { label: t("buildings", lang), to: "/buildings" },
    { label: building.name, to: `/buildings/${building.id}` },
    { label: t(service.type, lang) },
  ];

  // Only show the full dashboard for fjernvarme
  const showDashboard = service.type === "fjernvarme";

  return (
    <div className="flex-1 overflow-y-auto flex flex-col" style={{ background: brand.bg }}>
      {/* Service header */}
      <div className="bg-white border-b border-slate-200 px-6 py-4 shrink-0">
        <div className="max-w-[1120px] mx-auto">
          <Breadcrumbs items={crumbs} />
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: color + "15" }}>
              <SvcIcon size={18} style={{ color }} />
            </div>
            <div>
              <h1 className="text-lg font-semibold" style={{ color: brand.navy }}>{t(service.type, lang)}</h1>
              <div className="flex items-center gap-3 text-[11px] text-slate-400">
                <span>{t("provider", lang)}: {service.provider}</span>
                <span className="w-px h-3 bg-slate-200" />
                <span>{t("meterId", lang)}: {service.meterId}</span>
                <span className="w-px h-3 bg-slate-200" />
                <span className="inline-flex items-center rounded-full px-1.5 py-0.5 text-[10px] font-medium bg-emerald-50 text-emerald-600">
                  {service.status === "active" ? (lang === "da" ? "Aktiv" : "Active") : service.status}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Dashboard or placeholder */}
      {showDashboard ? (
        <DashboardContainer />
      ) : (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <SvcIcon size={48} strokeWidth={1} className="mx-auto mb-4 text-slate-300" />
            <h2 className="text-lg font-semibold mb-1" style={{ color: brand.navy }}>{t(service.type, lang)}</h2>
            <p className="text-sm text-slate-400">{t("comingSoon", lang)}</p>
          </div>
        </div>
      )}
    </div>
  );
}
