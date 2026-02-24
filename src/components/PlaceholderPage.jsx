import React from "react";
import { brand } from "@/lib/brand";
import { t, useLang } from "@/lib/i18n";

export default function PlaceholderPage({ title, icon: Icon }) {
  const lang = useLang();

  return (
    <div className="flex-1 flex items-center justify-center">
      <div className="text-center max-w-sm">
        {Icon && <Icon size={48} strokeWidth={1} className="mx-auto mb-4 text-slate-300" />}
        <h2 className="text-lg font-semibold mb-1" style={{ color: brand.navy }}>{title}</h2>
        <p className="text-sm text-slate-400">{t("comingSoon", lang)}</p>
        <p className="text-xs text-slate-300 mt-1">{t("comingSoonSub", lang)}</p>
      </div>
    </div>
  );
}
