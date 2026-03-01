import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, ArrowRight, Thermometer, Shield, BarChart3, Zap } from "lucide-react";
import { brand } from "@/lib/brand";
import { t, useLang } from "@/lib/i18n";
import { CoolingReport, LegionellaReport } from "./homii-energy-dashboard";
import { TimePeriodLabel } from "@/components/ui/info-tooltip";
import Breadcrumbs from "./Breadcrumbs";

const reports = [
  {
    id: "cooling",
    icon: Thermometer,
    color: brand.blue,
    titleKey: "reportCoolingTitle",
    descKey: "reportCoolingDesc",
    updatedKey: "reportUpdated",
  },
  {
    id: "legionella",
    icon: Shield,
    color: brand.amber,
    titleKey: "reportLegionellaTitle",
    descKey: "reportLegionellaDesc",
    updatedKey: "reportUpdated",
  },
  {
    id: "epc",
    icon: BarChart3,
    color: "#22C55E",
    titleKey: "reportEpcTitle",
    descKey: "reportEpcDesc",
    updatedKey: "reportUpdated",
  },
  {
    id: "consumption",
    icon: Zap,
    color: "#F59E0B",
    titleKey: "reportConsumptionTitle",
    descKey: "reportConsumptionDesc",
    updatedKey: "reportUpdated",
  },
];

export default function ReportsPage() {
  const { reportId } = useParams();
  const navigate = useNavigate();
  const lang = useLang();

  // Report detail view
  if (reportId) {
    const report = reports.find(r => r.id === reportId);
    const crumbs = [
      { label: t("reports", lang), to: "/reports" },
      { label: t(report?.titleKey || "reports", lang) },
    ];

    return (
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-[1200px] mx-auto px-8 py-6">
          <Breadcrumbs items={crumbs} />
          <div className="mb-6">
            <button
              onClick={() => navigate("/reports")}
              className="flex items-center gap-1.5 text-sm text-slate-400 hover:text-slate-600 transition-colors mb-3"
            >
              <ArrowLeft size={14} />
              {t("back", lang)}
            </button>
          </div>
          {reportId === "cooling" && <CoolingReport navigate={navigate} />}
          {reportId === "legionella" && <LegionellaReport navigate={navigate} />}
          {reportId === "epc" && (
            <div className="space-y-4">
              <div className="text-center py-12 text-slate-400">
                <BarChart3 size={40} className="mx-auto mb-3 text-slate-300" />
                <p className="text-sm font-medium" style={{ color: brand.navy }}>{t("reportEpcTitle", lang)}</p>
                <p className="text-xs text-slate-400 mt-1">{t("portfolioOverview", lang)}</p>
              </div>
            </div>
          )}
          {reportId === "consumption" && (
            <div className="space-y-4">
              <div className="text-center py-12 text-slate-400">
                <Zap size={40} className="mx-auto mb-3 text-slate-300" />
                <p className="text-sm font-medium" style={{ color: brand.navy }}>{t("reportConsumptionTitle", lang)}</p>
                <p className="text-xs text-slate-400 mt-1">{t("portfolioOverview", lang)}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Report index view — portfolio-level
  return (
    <div className="flex-1 overflow-y-auto">
      <div className="px-8 py-6">
        <div className="flex items-center gap-3 mb-5">
          <h1 className="text-xl font-semibold" style={{ color: brand.navy }}>{t("reports", lang)}</h1>
          <span className="text-sm text-slate-400">{reports.length}</span>
          <TimePeriodLabel text={t("portfolioOverview", lang)} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {reports.map(report => {
            const RIcon = report.icon;
            return (
              <Card
                key={report.id}
                className="cursor-pointer hover:shadow-md transition-all group"
                onClick={() => navigate(`/reports/${report.id}`)}
              >
                <CardContent className="p-5">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
                      style={{ background: report.color + "15" }}>
                      <RIcon size={20} style={{ color: report.color }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-semibold mb-1 group-hover:text-[#3EB1C8] transition-colors" style={{ color: brand.navy }}>
                        {t(report.titleKey, lang)}
                      </h3>
                      <p className="text-[12px] text-slate-400 leading-relaxed">
                        {t(report.descKey, lang)}
                      </p>
                      <p className="text-[11px] text-slate-400 mt-2">
                        {t(report.updatedKey, lang)}: 2026-02-24
                      </p>
                    </div>
                    <ArrowRight size={14} className="text-slate-300 group-hover:text-slate-500 transition-colors mt-1 shrink-0" />
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
