import React from "react";

const variants = {
  active:  { bg: "bg-emerald-50", text: "text-emerald-600" },
  success: { bg: "bg-emerald-50", text: "text-emerald-600" },
  good:    { bg: "bg-emerald-50", text: "text-emerald-600" },
  warning: { bg: "bg-amber-50",   text: "text-amber-600" },
  offline: { bg: "bg-amber-50",   text: "text-amber-600" },
  error:   { bg: "bg-red-50",     text: "text-red-600" },
  bad:     { bg: "bg-red-50",     text: "text-red-600" },
  neutral: { bg: "bg-slate-100",  text: "text-slate-500" },
};

export function StatusBadge({ status, label, size = "sm" }) {
  const v = variants[status] || variants.neutral;
  const sizeClass = size === "xs" ? "text-[9px] px-1.5 py-0" : "text-[10px] px-2 py-0.5";
  return (
    <span className={`inline-flex items-center rounded-full font-medium ${v.bg} ${v.text} ${sizeClass}`}>
      {label}
    </span>
  );
}

export function StatusDot({ status, size = 6 }) {
  const colors = {
    active: "#22C55E", success: "#22C55E", good: "#22C55E",
    warning: "#F59E0B", offline: "#F59E0B",
    error: "#EF4444", bad: "#EF4444",
    neutral: "#94A3B8",
    high: "#22C55E", medium: "#F59E0B", low: "#EF4444",
  };
  return <span className="inline-block rounded-full shrink-0" style={{ width: size, height: size, background: colors[status] || colors.neutral }} />;
}
