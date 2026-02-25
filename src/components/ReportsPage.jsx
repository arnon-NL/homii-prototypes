import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, ArrowRight, Thermometer, Shield } from "lucide-react";
import { brand, Icon } from "@/lib/brand";
import { t, useLang } from "@/lib/i18n";
import { CoolingReport, LegionellaReport } from "./homii-energy-dashboard";
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
];

export default function ReportsPage({ onNavigate, reportId }) {
  const lang = useLang();

  // Report detail view
  if (reportId) {
    const report = reports.find(r => r.id === reportId);
    const crumbs = [
      { label: t("reports", lang), onClick: () => onNavigate({ page: "reports" }) },
      { label: t(report?.titleKey || "reports", lang) },
    ];

    return (
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-[1200px] mx-auto px-8 py-6">
          <Breadcrumbs items={crumbs} />
          <div className="mb-6">
            <button
              onClick={() => onNavigate({ page: "reports" })}
              className="flex items-center gap-1.5 text-sm text-slate-400 hover:text-slate-600 transition-colors mb-3"
            >
              <ArrowLeft size={14} />
              {t("back", lang)}
            </button>
          </div>
          {reportId === "cooling" && <CoolingReport />}
          {reportId === "legionella" && <LegionellaReport />}
        </div>
      </div>
    );
  }

  // Report index view
  return (
    <div className="flex-1 overflow-y-auto">
      <div className="px-8 py-6">
        <div className="flex items-baseline gap-2.5 mb-5">
          <h1 className="text-xl font-semibold" style={{ color: brand.navy }}>{t("reports", lang)}</h1>
          <span className="text-sm text-slate-400">{reports.length}</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {reports.map(report => {
            const RIcon = report.icon;
            return (
              <Card
                key={report.id}
                className="cursor-pointer hover:shadow-md transition-all group"
                onClick={() => onNavigate({ page: "reports", reportId: report.id })}
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
