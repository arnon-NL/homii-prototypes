import React, { useState, useMemo, useEffect, Fragment } from "react";
import {
  BarChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, ReferenceLine, Area, ComposedChart, Cell,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";

import { brand, yearColor, HOFOR, Icon } from "@/lib/brand";
import { useLang, t, MS, ML } from "@/lib/i18n";
import { meters as allMeters, buildings, getBuilding, suppliers, getDhMetersSummary, getAfkoelingAggregated, getGraddageForMeter, GK, GN, GNT } from "@/lib/mockData";

/* ═══════════════════════════════════════════════════════
   Custom SegmentedControl (Notion-style)
   ═══════════════════════════════════════════════════════ */
function SegmentedControl({ value, onChange, options, size = "sm" }) {
  const sizeClasses = size === "sm" ? "text-xs h-7" : "text-sm h-8";
  return (
    <div className={`inline-flex items-center rounded-lg bg-slate-100 p-0.5 ${sizeClasses}`}>
      {options.map(opt => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          className={`relative px-3 rounded-md font-medium transition-all duration-200 ${sizeClasses} ${
            value === opt.value
              ? "bg-white text-slate-900 shadow-sm"
              : "text-slate-500 hover:text-slate-700"
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   Mock data generators
   ═══════════════════════════════════════════════════════ */
/* HOFOR Afkøling threshold — configurable per zone */
const AFKOELING_THRESHOLD = HOFOR.standard.krav; // 30 kWh/m³

function mkCooling(period, meter, lang) {
  const seed = meter === "all" ? 42 : meter.charCodeAt(meter.length-1);
  const r = (n) => Math.sin(seed*100+n*17)*0.5+0.5;
  /* Meter-reading noise: makes mwh slightly different from (v*c)/860 so
     afkoeling ≠ cooling °C. Simulates real-world meter reading variance. */
  const noise = (n) => 0.92 + Math.sin(seed*7+n*31)*0.12; // ±12 % energy meter variance
  const wk = lang==="da"?"Uge":"Week";
  const mkRow = (name, s, rt, v, n) => {
    const c = s - rt;
    const mwh = +((v * c * noise(n)) / 860).toFixed(2);
    const afkoeling = v > 0 ? +((mwh / v) * 860).toFixed(1) : 0;
    return { name, supply:+s.toFixed(1), return:+rt.toFixed(1), cooling:+c.toFixed(1), volume:+v.toFixed(1), mwh, afkoeling };
  };
  if (period==="weekly") return Array.from({length:52},(_,n)=>{const m=Math.floor(n/4.33),w=m<3||m>9;const s=w?78+r(n)*8:68+r(n)*6,rt=w?42+r(n+100)*12:35+r(n+100)*10,v=w?45+r(n+200)*30:15+r(n+200)*15;return mkRow(`${wk} ${n+1}`,s,rt,v,n);});
  if (period==="monthly") return MS[lang].map((m,n)=>{const w=n<3||n>9;const s=w?80+r(n)*6:70+r(n)*5,rt=w?44+r(n+50)*10:36+r(n+50)*8,v=w?190+r(n+100)*80:60+r(n+100)*50;return mkRow(m,s,rt,v,n);});
  return Array.from({length:5},(_,n)=>{const y=2022+n,s=75+r(n)*5,rt=40+r(n+50)*8,v=1500+r(n+100)*600;return mkRow(`${y}`,s,rt,v,n);});
}

function mkBar(lang) {
  return MS[lang].map((m,mi)=>{const e={name:m};[2022,2023,2024,2025,2026].forEach(y=>{e[`h${y}`]=+(mi<3||mi>9?120+Math.sin(y+mi)*30:25+Math.sin(y+mi)*15).toFixed(1);e[`e${y}`]=+(45+Math.sin(y*2+mi)*12).toFixed(1);e[`w${y}`]=+(800+Math.sin(y+mi*2)*200).toFixed(0);});return e;});
}

/* ═══════════════════════════════════════════════════════
   Shared components
   ═══════════════════════════════════════════════════════ */
const BrandTooltip = ({active, payload, label}) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg px-3 py-2.5 shadow-xl text-xs border" style={{background: brand.surface, borderColor: brand.border}}>
      <div className="font-semibold mb-1.5" style={{color: brand.navy}}>{label}</div>
      {payload.map((p,idx) => (
        <div key={idx} className="flex items-center gap-2 py-0.5" style={{color: brand.text}}>
          <span className="w-2 h-2 rounded-full shrink-0" style={{background: p.color}}/>
          <span className="text-slate-500">{p.name}:</span>
          <span className="font-semibold ml-auto tabular-nums">{typeof p.value === "number" ? p.value.toFixed(1) : p.value}</span>
        </div>
      ))}
    </div>
  );
};

const Metric = ({ label, value, unit, sub, status }) => {
  const statusColor = status === "good" ? brand.green : status === "warn" ? brand.amber : status === "bad" ? brand.red : null;
  return (
    <Card className="group">
      <CardContent className="p-4">
        <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wider mb-2">{label}</p>
        <div className="flex items-baseline gap-1">
          <span className="text-2xl font-bold tabular-nums" style={{color: brand.navy}}>{value}</span>
          {unit && <span className="text-xs font-medium text-slate-400">{unit}</span>}
        </div>
        {sub && (
          <p className="text-xs mt-1.5 flex items-center gap-1.5">
            {statusColor && <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{background: statusColor}} />}
            <span style={{color: statusColor || brand.muted}}>{sub}</span>
          </p>
        )}
      </CardContent>
    </Card>
  );
};

const YearPill = ({year, active, onClick}) => (
  <button
    onClick={onClick}
    className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium transition-all duration-200 ${
      active ? "text-white shadow-sm" : "text-slate-500 bg-transparent hover:bg-slate-100"
    }`}
    style={active ? {background: yearColor[year]} : {}}
  >
    {year}
  </button>
);

const SectionHeader = ({ title, description, children }) => (
  <div className="flex flex-wrap items-start justify-between gap-4">
    <div className="min-w-0 flex-1">
      <h2 className="text-lg font-semibold" style={{color: brand.navy}}>{title}</h2>
      {description && <p className="text-sm text-slate-400 mt-1 max-w-2xl leading-relaxed">{description}</p>}
    </div>
    {children && <div className="flex flex-wrap items-center gap-2 shrink-0">{children}</div>}
  </div>
);

const DataTable = ({ headers, rows }) => (
  <div className="overflow-x-auto rounded-lg border border-slate-200">
    <table className="w-full text-sm">
      <thead>
        <tr className="border-b border-slate-200 bg-slate-50/80">
          {headers.map((h, i) => (
            <th key={i} className={`text-[11px] font-semibold text-slate-500 uppercase tracking-wider px-4 py-2.5 ${i === 0 ? "text-left" : "text-right"}`}>{h}</th>
          ))}
        </tr>
      </thead>
      <tbody className="divide-y divide-slate-100">
        {rows}
      </tbody>
    </table>
  </div>
);

const SectionCard = ({ title, children, noPad }) => (
  <Card>
    {title && (
      <CardHeader className="pb-0 pt-4 px-5">
        <CardTitle className="text-[13px] font-semibold text-slate-600">{title}</CardTitle>
      </CardHeader>
    )}
    <CardContent className={noPad ? "p-0" : "px-5 pb-5 pt-3"}>
      {children}
    </CardContent>
  </Card>
);

/* ═══════════════════════════════════════════════════════
   Custom meter aggregation picker (Improvement 4)
   ═══════════════════════════════════════════════════════ */
function MeterCheckboxPicker({ meters, selected, onChange, lang }) {
  const [open, setOpen] = useState(false);
  const count = selected.length;
  const allIds = meters.filter(m => m.id !== "all").map(m => m.id);
  const allSelected = allIds.every(id => selected.includes(id));
  return (
    <div className="relative">
      <Button variant="outline" size="sm" className="text-[11px] h-8 px-3 gap-1.5" onClick={() => setOpen(!open)}>
        {t("customSelection", lang)}
        {count > 0 && <span className="rounded-full bg-slate-100 text-slate-600 px-1.5 text-[10px] font-semibold">{count} {t("metersSelected", lang)}</span>}
      </Button>
      {open && (
        <div className="absolute top-full mt-1 left-0 z-50 w-56 rounded-lg border border-slate-200 bg-white shadow-lg p-2"
          onMouseLeave={() => setOpen(false)}>
          <label className="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-slate-50 cursor-pointer text-xs">
            <input type="checkbox" className="rounded border-slate-300"
              checked={allSelected} onChange={() => onChange(allSelected ? [] : [...allIds])} />
            <span className="font-medium">{t("allMeters", lang)}</span>
          </label>
          <div className="h-px bg-slate-100 my-1" />
          {meters.filter(m => m.id !== "all").map(m => (
            <label key={m.id} className="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-slate-50 cursor-pointer text-xs">
              <input type="checkbox" className="rounded border-slate-300"
                checked={selected.includes(m.id)}
                onChange={() => onChange(selected.includes(m.id) ? selected.filter(x => x !== m.id) : [...selected, m.id])} />
              <span>{m.l}</span>
            </label>
          ))}
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   Date range selector (Improvement 5)
   ═══════════════════════════════════════════════════════ */
function DateRangeSelector({ value, onChange, lang }) {
  return (
    <div className="flex items-center gap-2">
      <SegmentedControl value={value} onChange={onChange} options={[
        { value: "12m", label: t("last12Months", lang) },
        { value: "all", label: t("allData", lang) },
      ]} />
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   Tab 1 — Unified Consumption & Analysis
   Combines: Cooling temps, Heating bars, Degree Days
   ═══════════════════════════════════════════════════════ */
function ConsumptionDash() {
  const lang = useLang();
  const ms = MS[lang];
  const ml = ML[lang];

  // Cooling state
  const [period, setPeriod] = useState("monthly");
  const [meter, setMeter] = useState("all");
  const [compareMeter, setCompareMeter] = useState("none");
  const [customMeters, setCustomMeters] = useState([]);
  const [dateRange, setDateRange] = useState("12m");
  const coolData = useMemo(() => {
    const raw = mkCooling(period, meter, lang);
    if (dateRange === "12m" && period === "weekly") return raw.slice(-52); // last 12 months
    return raw;
  }, [period, meter, lang, dateRange]);
  const compareData = useMemo(() => compareMeter !== "none" ? mkCooling(period, compareMeter, lang) : null, [period, compareMeter, lang]);
  const thr = AFKOELING_THRESHOLD;

  // Afkøling KPI
  const avgAfkoeling = +(coolData.reduce((s,d)=>s+d.afkoeling,0)/coolData.length).toFixed(1);
  const afkOk = avgAfkoeling <= thr;

  // Heating bars state
  const [vis, setVis] = useState([2024,2025,2026]);
  const [cmp, setCmp] = useState(false);
  const [cmpM, setCmpM] = useState(1);
  const barData = useMemo(() => mkBar(lang), [lang]);
  const tog = y => setVis(p => p.includes(y) ? p.filter(x=>x!==y) : [...p,y]);

  const cmpData = useMemo(() => {
    if (!cmp) return null;
    return [2022,2023,2024,2025,2026].filter(y=>vis.includes(y)).map(y=>({name:`${y}`,value:barData[cmpM]?.[`h${y}`]||0,fill:yearColor[y]}));
  }, [cmp,cmpM,vis,barData]);

  const meters = [
    {id:"all",      l:t("allMeters",lang)},
    {id:"meter-001",l:t("blockA",lang)},
    {id:"meter-002",l:t("blockB",lang)},
    {id:"meter-003",l:t("blockC",lang)},
    {id:"meter-004",l:t("blockD",lang)},
  ];

  return (
    <div className="space-y-6">
      {/* — Section: Supply, Return & Cooling Temperatures — */}
      <div className="space-y-4">
        <SectionHeader title={t("chartTitle",lang)} description={t("coolingSub",lang)}>
          <Select value={meter} onValueChange={setMeter}>
            <SelectTrigger className="w-[200px] h-8 text-xs"><SelectValue/></SelectTrigger>
            <SelectContent>{meters.map(m=><SelectItem key={m.id} value={m.id}>{m.l}</SelectItem>)}</SelectContent>
          </Select>
          <MeterCheckboxPicker meters={meters} selected={customMeters} onChange={setCustomMeters} lang={lang} />
          <DateRangeSelector value={dateRange} onChange={v=>v&&setDateRange(v)} lang={lang} />
          <SegmentedControl value={period} onChange={v=>v&&setPeriod(v)} options={[
            {value:"weekly", label:t("weekly",lang)},
            {value:"monthly", label:t("monthly",lang)},
            {value:"yearly", label:t("yearly",lang)},
          ]} />
        </SectionHeader>

        <SectionCard title={null}>
          <ResponsiveContainer width="100%" height={280}>
            <ComposedChart data={coolData} margin={{top:5,right:20,bottom:5,left:0}}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
              <XAxis dataKey="name" tick={{fontSize:11, fill:brand.muted}} axisLine={{stroke:brand.border}} tickLine={false} />
              <YAxis tick={{fontSize:11, fill:brand.muted}} unit="°C" domain={[0, 90]} axisLine={false} tickLine={false} />
              <Tooltip content={<BrandTooltip/>}/>
              <Legend wrapperStyle={{fontSize:11, color:brand.subtle}} iconType="circle" iconSize={8} />
              <ReferenceLine y={thr} stroke={brand.red} strokeDasharray="6 4" strokeWidth={1.5} label={{value:`${t("req",lang)}: ${thr}°C`,fill:brand.red,fontSize:10,position:"right"}}/>
              <Line type="monotone" dataKey="supply" stroke={brand.red} strokeWidth={1.5} dot={false} name={t("supplyLine",lang)}/>
              <Line type="monotone" dataKey="return" stroke={brand.amber} strokeWidth={1.5} dot={false} name={t("returnLine",lang)}/>
              <Line type="monotone" dataKey="cooling" stroke={brand.blue} strokeWidth={2} dot={{r:2.5,fill:brand.blue,strokeWidth:0}} name={t("coolingLine",lang)}/>
            </ComposedChart>
          </ResponsiveContainer>
        </SectionCard>
      </div>

      <div className="h-px bg-slate-200" />

      {/* — Section: Afkøling (kWh/m³) Trend — */}
      <div className="space-y-4">
        <SectionHeader title={t("afkoelingTrendTitle",lang)} description={t("afkoelingTrendSub",lang)}>
          <Select value={compareMeter} onValueChange={setCompareMeter}>
            <SelectTrigger className="w-[200px] h-8 text-xs"><SelectValue placeholder={t("compareWith",lang)}/></SelectTrigger>
            <SelectContent>
              <SelectItem value="none">{t("noComparison",lang)}</SelectItem>
              {meters.filter(m=>m.id!==meter).map(m=><SelectItem key={m.id} value={m.id}>{m.l}</SelectItem>)}
            </SelectContent>
          </Select>
        </SectionHeader>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <Metric label={t("afkoelingKpi",lang)} value={avgAfkoeling} unit={t("afkoelingUnit",lang)}
            sub={afkOk ? `${t("belowThreshold",lang)} (${thr})` : `${t("aboveThreshold",lang)} (${thr})`} status={afkOk?"good":"bad"} />
          <Metric label={t("avgCooling",lang)} value={(coolData.reduce((s,d)=>s+d.cooling,0)/coolData.length).toFixed(1)} unit="°C"
            sub={lang==="da"?"Fremløb − retur":"Supply − return"} />
          <Metric label={t("totalCons",lang)} value={coolData.reduce((s,d)=>s+d.mwh,0).toFixed(1)} unit="MWh" />
          <Metric label={t("volume",lang)} value={coolData.reduce((s,d)=>s+d.volume,0).toFixed(0)} unit="m³" />
        </div>

        <SectionCard title={null}>
          <ResponsiveContainer width="100%" height={280}>
            <ComposedChart data={coolData} margin={{top:5,right:20,bottom:5,left:0}}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
              <XAxis dataKey="name" tick={{fontSize:11, fill:brand.muted}} axisLine={{stroke:brand.border}} tickLine={false} />
              <YAxis tick={{fontSize:11, fill:brand.muted}} unit=" kWh/m³" axisLine={false} tickLine={false} />
              <Tooltip content={<BrandTooltip/>}/>
              <Legend wrapperStyle={{fontSize:11, color:brand.subtle}} iconType="circle" iconSize={8} />
              {/* Shaded area above threshold = surcharge zone */}
              <ReferenceLine y={thr} stroke={brand.red} strokeDasharray="6 4" strokeWidth={1.5}
                label={{value:`${t("hoforThreshold",lang)}: ${thr} kWh/m³`,fill:brand.red,fontSize:10,position:"right"}} />
              <Area type="monotone" dataKey="afkoeling" fill={brand.blue} fillOpacity={0.08} stroke="none" legendType="none" />
              <Line type="monotone" dataKey="afkoeling" stroke={brand.blue} strokeWidth={2} dot={{r:2.5,fill:brand.blue,strokeWidth:0}} name={t("afkoelingLine",lang)} />
              {compareData && (
                <Line type="monotone" data={compareData} dataKey="afkoeling" stroke={brand.midBlue} strokeWidth={1.5} strokeDasharray="6 3" dot={false}
                  name={`${t("afkoelingLine",lang)} (${meters.find(m=>m.id===compareMeter)?.l || compareMeter})`} />
              )}
            </ComposedChart>
          </ResponsiveContainer>
        </SectionCard>
      </div>

      <div className="h-px bg-slate-200" />

      {/* — Section: Heating Consumption Bars — */}
      <div className="space-y-4">
        <SectionHeader title={t("heatingConsTitle",lang)} description={t("heatingConsSub",lang)} />

        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-xs text-slate-400 mr-1">{t("showYears",lang)}</span>
          {[2022,2023,2024,2025,2026].map(y=><YearPill key={y} year={y} active={vis.includes(y)} onClick={()=>tog(y)}/>)}
          <span className="w-px h-4 bg-slate-200 mx-2"/>
          <Button variant="outline" size="sm" className="text-[11px] h-7 px-2.5" onClick={()=>setCmp(!cmp)}>
            {cmp?t("showAll",lang):t("compareOne",lang)}
          </Button>
          {cmp && (
            <Select value={`${cmpM}`} onValueChange={v=>setCmpM(parseInt(v))}>
              <SelectTrigger className="w-[130px] h-7 text-xs"><SelectValue/></SelectTrigger>
              <SelectContent>{ml.map((m,idx)=><SelectItem key={idx} value={`${idx}`}>{m}</SelectItem>)}</SelectContent>
            </Select>
          )}
        </div>

        <SectionCard title={cmp ? `${t("heat",lang)} – ${ml[cmpM]} (${t("compAcross",lang)})` : `${t("heat",lang)} – ${t("monthlyCons",lang)} (MWh)`}>
          <ResponsiveContainer width="100%" height={300}>
            {cmp ? (
              <BarChart data={cmpData} margin={{top:5,right:20,bottom:5,left:0}}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                <XAxis dataKey="name" tick={{fontSize:12, fill:brand.muted}} axisLine={{stroke:brand.border}} tickLine={false} />
                <YAxis tick={{fontSize:11, fill:brand.muted}} unit=" MWh" axisLine={false} tickLine={false} />
                <Tooltip content={<BrandTooltip/>}/>
                <Bar dataKey="value" name={`${t("heat",lang)} (MWh)`} radius={[4,4,0,0]} barSize={48}>
                  {cmpData?.map((d,idx)=><Cell key={idx} fill={d.fill}/>)}
                </Bar>
              </BarChart>
            ) : (
              <BarChart data={barData} margin={{top:5,right:20,bottom:5,left:0}}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                <XAxis dataKey="name" tick={{fontSize:11, fill:brand.muted}} axisLine={{stroke:brand.border}} tickLine={false} />
                <YAxis tick={{fontSize:11, fill:brand.muted}} unit=" MWh" axisLine={false} tickLine={false} />
                <Tooltip content={<BrandTooltip/>}/><Legend wrapperStyle={{fontSize:11}} iconType="circle" iconSize={8} />
                {vis.map(y=><Bar key={y} dataKey={`h${y}`} name={`${y}`} fill={yearColor[y]} radius={[3,3,0,0]}/>)}
              </BarChart>
            )}
          </ResponsiveContainer>
        </SectionCard>

        <SectionCard title={`${t("heat",lang)} – ${t("dataTable",lang)} (MWh)`} noPad>
          <DataTable
            headers={[t("month",lang), ...vis.map(y => `${y}`)]}
            rows={
              <>
                {barData.map((r,idx) => (
                  <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-4 py-2 text-sm font-medium" style={{color: brand.navy}}>{r.name}</td>
                    {vis.map(y=><td key={y} className="px-4 py-2 text-sm text-right tabular-nums">{r[`h${y}`]?.toFixed(1)}</td>)}
                  </tr>
                ))}
                <tr className="bg-slate-50 border-t border-slate-200 font-semibold">
                  <td className="px-4 py-2.5 text-sm" style={{color: brand.navy}}>{t("total",lang)}</td>
                  {vis.map(y=><td key={y} className="px-4 py-2.5 text-sm text-right tabular-nums" style={{color: brand.navy}}>{barData.reduce((s,r)=>s+(r[`h${y}`]||0),0).toFixed(1)}</td>)}
                </tr>
              </>
            }
          />
        </SectionCard>
      </div>

    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   Tab 2 — HOFOR Tariff Simulator
   ═══════════════════════════════════════════════════════ */
function TariffDash() {
  const lang = useLang();
  const [period, setPeriod] = useState("monthly");
  const [meter, setMeter] = useState("all");
  const [zone, setZone] = useState("standard");
  const [improveDeg, setImproveDeg] = useState(2);
  const data = useMemo(() => mkCooling(period, meter, lang), [period, meter, lang]);

  const hoforZone = HOFOR[zone];
  const thr = hoforZone.krav; // zone-specific threshold for tariff

  const avg = (k) => +(data.reduce((s,d)=>s+d[k],0)/data.length).toFixed(1);
  const avgC = avg("cooling"), avgR = avg("return"), totMWh = +data.reduce((s,d)=>s+d.mwh,0).toFixed(1);
  const ok = avgC >= thr;

  const estimatedMWh = period === "monthly" ? totMWh : (period === "weekly" ? totMWh / 52 * 12 : totMWh);
  const energiCost = estimatedMWh * HOFOR.energiprisPerMWh;
  const effektCost = 8500 * HOFOR.effektbetalingPerM2;
  const deviation = avgC - thr;
  const deviationImproved = (avgC + improveDeg) - thr;
  const beyondNeutral = deviation > 5 ? deviation - 5 : deviation < -5 ? deviation + 5 : 0;
  const beyondNeutralImproved = deviationImproved > 5 ? deviationImproved - 5 : deviationImproved < -5 ? deviationImproved + 5 : 0;
  const korrektion = beyondNeutral * HOFOR.korrektionPct * energiCost;
  const korrektionImproved = beyondNeutralImproved * HOFOR.korrektionPct * energiCost;
  const totalCostVal = effektCost + energiCost - korrektion;
  const totalCostImproved = effektCost + energiCost - korrektionImproved;
  const saving = totalCostVal - totalCostImproved;

  const fmtDKK = (v) => v.toLocaleString(lang==="da"?"da-DK":"en-US", { style: "currency", currency: "DKK", maximumFractionDigits: 0 });

  return (
    <div className="space-y-5">
      <SectionHeader title={t("tariffTitle",lang)} description={t("tariffSub",lang)} />

      {/* Context metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Metric label={t("avgCooling",lang)} value={avgC} unit="°C" sub={ok ? `${t("aboveReq",lang)} (${thr}°C)` : `${t("belowReq",lang)} (${thr}°C)`} status={ok?"good":"bad"} />
        <Metric label={t("avgReturn",lang)} value={avgR} unit="°C" sub={avgR<40?t("goodReturn",lang):t("canImprove",lang)} status={avgR<40?"good":"warn"} />
        <Metric label={t("totalCons",lang)} value={totMWh} unit="MWh" />
        <Metric label={t("status",lang)} value={ok?t("bonus",lang):t("surcharge",lang)} sub={ok?t("expectedBonus",lang):t("riskSurcharge",lang)} status={ok?"good":"bad"} />
      </div>

      {/* Tariff calculator */}
      <Card>
        <CardHeader className="pb-0 pt-4 px-5">
          <div className="flex items-center justify-between">
            <CardTitle className="text-[13px] font-semibold text-slate-600">{t("tariffTitle",lang)}</CardTitle>
            <SegmentedControl value={zone} onChange={v=>v&&setZone(v)} options={[
              {value:"standard", label:"Standard"},
              {value:"vesterbro", label:"Vesterbro"},
            ]} />
          </div>
          <p className="text-xs text-slate-400 mt-1">{t("tariffSub",lang)}</p>
          <p className="text-[11px] mt-1 font-medium" style={{color: brand.amber}}>{t("thresholdChange",lang)}</p>
        </CardHeader>
        <CardContent className="px-5 pb-5 pt-3">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <div className="space-y-2.5">
              {[
                { label: `${t("effektbetaling",lang)} (8.500 m²)`, val: fmtDKK(effektCost) },
                { label: `${t("energipris",lang)} (${estimatedMWh.toFixed(0)} MWh × ${HOFOR.energiprisPerMWh} DKK)`, val: fmtDKK(energiCost) },
                { label: `${t("afkKorrektion",lang)} (${beyondNeutral > 0 ? "+" : ""}${beyondNeutral.toFixed(1)}° × 0,8%)`, val: `${korrektion > 0 ? "−" : korrektion < 0 ? "+" : ""}${fmtDKK(Math.abs(korrektion))}`, color: korrektion > 0 ? brand.green : korrektion < 0 ? brand.red : null },
              ].map((row, i) => (
                <div key={i} className="flex justify-between items-center text-sm">
                  <span className="text-slate-400">{row.label}</span>
                  <span className="font-medium tabular-nums" style={row.color ? {color: row.color} : {color: brand.text}}>{row.val}</span>
                </div>
              ))}
              <div className="border-t border-slate-200 pt-2.5 flex justify-between items-center">
                <span className="text-sm font-semibold" style={{color: brand.navy}}>{t("totalCost",lang)}</span>
                <span className="text-lg font-bold tabular-nums" style={{color: brand.navy}}>{fmtDKK(totalCostVal)}</span>
              </div>
            </div>
            <div className="space-y-3 rounded-lg p-4 bg-slate-50">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-slate-600">{t("whatIf",lang)}</span>
                <span className="text-lg font-bold tabular-nums" style={{color: brand.blue}}>+{improveDeg}°C</span>
              </div>
              <input
                type="range" min="0" max="10" step="1" value={improveDeg}
                onChange={e => setImproveDeg(+e.target.value)}
                className="w-full h-1.5 rounded-full appearance-none cursor-pointer"
                style={{
                  background: `linear-gradient(to right, ${brand.blue} ${improveDeg * 10}%, ${brand.border} ${improveDeg * 10}%)`,
                  accentColor: brand.blue,
                }}
              />
              <div className="flex justify-between text-[11px] text-slate-400">
                <span>{t("currentCooling",lang)}: {avgC.toFixed(1)}°C</span>
                <span>{t("improvedCooling",lang)}: {(avgC + improveDeg).toFixed(1)}°C</span>
              </div>
              {improveDeg > 0 && (
                <div className="rounded-lg p-3 text-center bg-emerald-50 border border-emerald-100">
                  <p className="text-[11px] text-emerald-600 font-medium">{t("potentialSaving",lang)}</p>
                  <p className="text-xl font-bold text-emerald-600 tabular-nums">{fmtDKK(Math.max(0, saving))}</p>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   Exported Reports — for the Reports page
   ═══════════════════════════════════════════════════════ */
export function CoolingReport({ navigate }) {
  const lang = useLang();
  const [view, setView] = useState("portfolio"); // "portfolio" | "detail"
  const [selectedMeter, setSelectedMeter] = useState(null);
  const [period, setPeriod] = useState("weekly");
  const [supplierFilter, setSupplierFilter] = useState("hofor"); // default to HOFOR
  const [search, setSearch] = useState("");
  const [tableLimit, setTableLimit] = useState(15);
  const [visibleMeterIds, setVisibleMeterIds] = useState(null); // null = "all" (auto-derived from filtered)
  const thr = AFKOELING_THRESHOLD;

  // All DH meter summaries
  const dhSummary = useMemo(() => getDhMetersSummary(), []);

  // Supplier filter options (only suppliers that have DH meters)
  const dhSupplierIds = [...new Set(dhSummary.map(m => m.supplierId))];
  const dhSuppliers = dhSupplierIds.map(id => suppliers.find(s => s.id === id)).filter(Boolean);

  // Filtered meters: supplier → search
  const filtered = useMemo(() => {
    let list = dhSummary;
    if (supplierFilter !== "all") list = list.filter(m => m.supplierId === supplierFilter);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(m => m.meterId.toLowerCase().includes(q) || m.buildingName.toLowerCase().includes(q));
    }
    return list;
  }, [dhSummary, supplierFilter, search]);

  const sorted = useMemo(() => [...filtered].sort((a, b) => a.avgAfkoeling - b.avgAfkoeling), [filtered]);

  // Visible meters for the chart (only meters with temperature data can show afkøling)
  const allFilteredTempIds = useMemo(() => new Set(filtered.filter(m => m.hasTemperatureData).map(m => m.meterId)), [filtered]);
  // Reset selection when filter changes
  useEffect(() => { setVisibleMeterIds(null); }, [supplierFilter, search]);
  const visibleSet = visibleMeterIds || allFilteredTempIds;
  const toggleMeter = (id) => {
    const current = new Set(visibleSet);
    if (current.has(id)) current.delete(id); else current.add(id);
    setVisibleMeterIds(current);
  };
  const selectAllMeters = () => setVisibleMeterIds(null);
  const deselectAllMeters = () => setVisibleMeterIds(new Set());

  // Meters with actual temperature data (can calculate afkøling)
  const metersWithTemp = filtered.filter(m => m.hasTemperatureData);
  const metersWithoutTemp = filtered.filter(m => !m.hasTemperatureData);

  // Portfolio KPIs (only meters with temperature data)
  const portfolioAvg = metersWithTemp.length > 0 ? +(metersWithTemp.reduce((s, m) => s + m.avgAfkoeling, 0) / metersWithTemp.length).toFixed(1) : 0;
  const inBonus = metersWithTemp.filter(m => m.avgAfkoeling <= thr).length;
  const inSurcharge = metersWithTemp.filter(m => m.avgAfkoeling > thr).length;
  const isBonus = portfolioAvg <= thr;

  // Financial impact (only meters with temp data contribute)
  const totalArea = metersWithTemp.reduce((s, m) => s + m.buildingArea, 0);
  const annualMWh = totalArea * 0.12;
  const deviation = portfolioAvg - thr;
  const correction = deviation * HOFOR.korrektionPct * HOFOR.energiprisPerMWh * annualMWh;

  // Chart data: build aggregated series per meter for the selected period, filtered by visible selection
  const chartData = useMemo(() => {
    const vis = filtered.filter(m => visibleSet.has(m.meterId));
    if (period === "weekly") {
      return vis.map(m => ({ ...m }));
    }
    if (period === "monthly") {
      return vis.map(m => {
        const agg = getAfkoelingAggregated(m.meterId, "monthly");
        return { ...m, series: agg.map(d => ({ ...d, week: d.month })) };
      });
    }
    // yearly — single data point per meter, bar chart is better
    return vis.map(m => {
      const agg = getAfkoelingAggregated(m.meterId, "yearly");
      return { ...m, series: agg.map(d => ({ ...d, week: 1 })) };
    });
  }, [filtered, period, visibleSet]);

  // X-axis config per period
  const xAxisConfig = period === "weekly"
    ? { dataKey: "week", type: "number", domain: [1, 52], tickFormatter: w => `W${w}` }
    : period === "monthly"
    ? { dataKey: "week", type: "number", domain: [1, 12], tickFormatter: m => MS[lang]?.[m - 1] || m }
    : { dataKey: "week", type: "number", domain: [1, 1], tickFormatter: () => "2026" };

  // Detail mode data
  const detailData = useMemo(() => selectedMeter ? mkCooling(period === "weekly" ? "weekly" : period, selectedMeter, lang) : null, [period, selectedMeter, lang]);

  const openDetail = (meterId) => {
    setSelectedMeter(meterId);
    setView("detail");
  };

  /* ── Mini sparkline (SVG) ── */
  const Sparkline = ({ data, threshold }) => {
    if (!data || data.length === 0) return <span className="text-[10px] text-slate-300">—</span>;
    const w = 80, h = 24, pad = 2;
    const min = Math.min(...data) - 2, max = Math.max(...data) + 2;
    const range = max - min || 1;
    const pts = data.map((v, i) => `${pad + (i / (data.length - 1)) * (w - pad * 2)},${pad + (1 - (v - min) / range) * (h - pad * 2)}`).join(" ");
    const thrY = pad + (1 - (threshold - min) / range) * (h - pad * 2);
    return (
      <svg width={w} height={h} className="inline-block">
        <line x1={pad} y1={thrY} x2={w - pad} y2={thrY} stroke={brand.red} strokeWidth={0.5} strokeDasharray="2 2" opacity={0.5} />
        <polyline points={pts} fill="none" stroke={brand.blue} strokeWidth={1.5} />
      </svg>
    );
  };

  /* ── Tariff position badge ── */
  const TariffBadge = ({ afk }) => {
    if (afk <= thr) return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />{t("bonus", lang)}</span>;
    return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-red-50 text-red-600"><span className="w-1.5 h-1.5 rounded-full bg-red-500" />{t("surcharge", lang)}</span>;
  };

  // Chart line colors — consistent per meter across renders
  const LINE_COLORS = [brand.blue, brand.midBlue, brand.amber, brand.green, "#8B5CF6", "#EC4899", "#14B8A6", "#F97316", "#6366F1", "#84CC16"];

  /* ════════════════════════════════════════════
     PORTFOLIO VIEW
     ════════════════════════════════════════════ */
  if (view === "portfolio") {
    const visibleRows = sorted.slice(0, tableLimit);
    const hasMore = sorted.length > tableLimit;

    return (
      <div className="space-y-5">
        {/* Header + controls */}
        <SectionHeader title={t("coolingTitle", lang)} description={t("portfolioCoolingSub", lang)}>
          <SegmentedControl value={period} onChange={v => v && setPeriod(v)} options={[
            { value: "weekly", label: t("weekly", lang) },
            { value: "monthly", label: t("monthly", lang) },
            { value: "yearly", label: t("yearly", lang) },
          ]} />
        </SectionHeader>

        {/* KPIs */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
          <Metric label={t("portfolioAvg", lang)} value={portfolioAvg} unit="kWh/m³"
            sub={isBonus ? `${t("belowThreshold", lang)} (${thr})` : `${t("aboveThreshold", lang)} (${thr})`}
            status={isBonus ? "good" : "bad"} />
          <Metric label={t("tariffPosition", lang)}
            value={isBonus ? t("bonus", lang) : t("surcharge", lang)}
            sub={isBonus ? t("expectedBonus", lang) : t("riskSurcharge", lang)}
            status={isBonus ? "good" : "bad"} />
          <Metric label={t("financialImpact", lang)}
            value={`${correction > 0 ? "+" : ""}${Math.round(Math.abs(correction)).toLocaleString()}`}
            unit={`DKK${t("perYear", lang)}`}
            sub={isBonus ? t("annualSaving", lang) : t("annualCost", lang)}
            status={isBonus ? "good" : "bad"} />
          <Metric label={t("metersInBonus", lang)} value={inBonus} unit={`/ ${metersWithTemp.length}`} status={inBonus === metersWithTemp.length ? "good" : "warn"}
            sub={metersWithoutTemp.length > 0 ? `${metersWithoutTemp.length} ${t("noTempData", lang).toLowerCase()}` : undefined} />
          <Metric label={t("metersInSurcharge", lang)} value={inSurcharge} unit={`/ ${metersWithTemp.length}`} status={inSurcharge === 0 ? "good" : "bad"} />
        </div>

        {/* Meter (de)selection chips */}
        {/* Meter (de)selection chips */}
        <div className="bg-white rounded-xl border border-slate-200 px-4 py-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{t("selectedMeters", lang)} ({visibleSet.size} / {metersWithTemp.length})</span>
            <div className="flex gap-2">
              <button onClick={selectAllMeters} className="text-[11px] font-medium px-2 py-0.5 rounded hover:bg-slate-100 transition-colors" style={{ color: brand.blue }}>{t("selectAll", lang)}</button>
              <button onClick={deselectAllMeters} className="text-[11px] font-medium px-2 py-0.5 rounded hover:bg-slate-100 transition-colors text-slate-400">{t("deselectAll", lang)}</button>
            </div>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {filtered.map((m, idx) => {
              const hasTemp = m.hasTemperatureData;
              const active = hasTemp && visibleSet.has(m.meterId);
              const color = LINE_COLORS[idx % LINE_COLORS.length];
              if (!hasTemp) {
                // No temperature data — show as disabled chip
                return (
                  <span key={m.meterId} className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium border border-dashed border-slate-200 text-slate-300 bg-slate-50 cursor-not-allowed" title={t("noTempData", lang)}>
                    <span className="w-2 h-2 rounded-full border border-slate-200 bg-slate-100" />
                    {m.buildingName}
                    <span className="text-[10px] text-slate-300">—</span>
                  </span>
                );
              }
              return (
                <button key={m.meterId} onClick={() => toggleMeter(m.meterId)}
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium border transition-all ${active ? "border-transparent text-white shadow-sm" : "border-slate-200 text-slate-400 bg-white hover:bg-slate-50"}`}
                  style={active ? { backgroundColor: color } : {}}
                >
                  <span className={`w-2 h-2 rounded-full border ${active ? "bg-white border-white/50" : "border-slate-300"}`} />
                  {m.buildingName}
                  <span className={`text-[10px] tabular-nums ${active ? "text-white/70" : "text-slate-300"}`}>{m.avgAfkoeling}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Portfolio afkøling chart — with period toggle */}
        <SectionCard title={t("afkoelingTrendTitle", lang)}>
          <p className="text-xs text-slate-400 mb-3">{t("afkoelingTrendSub", lang)}</p>
          {period !== "yearly" ? (
            <ResponsiveContainer width="100%" height={300}>
              <ComposedChart margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                <XAxis {...xAxisConfig} tick={{ fontSize: 11, fill: brand.muted }} axisLine={{ stroke: brand.border }} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: brand.muted }} unit=" kWh/m³" axisLine={false} tickLine={false} />
                <Tooltip content={<BrandTooltip />} />
                <Legend wrapperStyle={{ fontSize: 11, color: brand.subtle }} iconType="circle" iconSize={8} />
                <ReferenceLine y={thr} stroke={brand.red} strokeDasharray="6 4" strokeWidth={1.5}
                  label={{ value: `${t("supplierThreshold", lang)}: ${thr}`, fill: brand.red, fontSize: 10, position: "right" }} />
                {chartData.map((m, idx) => (
                  <Line key={m.meterId} data={m.series} type="monotone" dataKey="afkoeling"
                    stroke={LINE_COLORS[idx % LINE_COLORS.length]} strokeWidth={1.5}
                    dot={false} name={m.buildingName} />
                ))}
              </ComposedChart>
            </ResponsiveContainer>
          ) : (
            /* Yearly view — horizontal bar chart comparing meters (filtered by visible selection) */
            <ResponsiveContainer width="100%" height={Math.max(180, chartData.length * 36 + 40)}>
              <BarChart data={chartData.map(m => ({ name: m.buildingName, afkoeling: m.avgAfkoeling }))} layout="vertical" margin={{ top: 5, right: 30, bottom: 5, left: 120 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 11, fill: brand.muted }} unit=" kWh/m³" axisLine={false} tickLine={false} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: brand.navy }} width={110} axisLine={false} tickLine={false} />
                <Tooltip content={<BrandTooltip />} />
                <ReferenceLine x={thr} stroke={brand.red} strokeDasharray="6 4" strokeWidth={1.5}
                  label={{ value: `${t("supplierThreshold", lang)}: ${thr}`, fill: brand.red, fontSize: 10, position: "top" }} />
                <Bar dataKey="afkoeling" name={t("afkoelingLine", lang)} radius={[0, 3, 3, 0]}>
                  {chartData.map((m, idx) => (
                    <Cell key={idx} fill={m.avgAfkoeling <= thr ? brand.green : brand.red} fillOpacity={0.7} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </SectionCard>

        {/* Meter comparison table — with supplier filter + search */}
        <SectionCard title={t("meterComparison", lang)} noPad>
          <div className="px-5 pt-3 pb-3 flex flex-wrap items-center gap-3 border-b border-slate-100">
            <p className="text-xs text-slate-400 flex-1 min-w-[200px]">{t("meterComparisonSub", lang)}</p>
            {/* Supplier filter */}
            <Select value={supplierFilter} onValueChange={setSupplierFilter}>
              <SelectTrigger className="w-[180px] h-8 text-xs"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("allSuppliers", lang)}</SelectItem>
                {dhSuppliers.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
              </SelectContent>
            </Select>
            {/* Search */}
            <div className="relative">
              <input
                type="text"
                value={search}
                onChange={e => { setSearch(e.target.value); setTableLimit(15); }}
                placeholder={t("searchMeters", lang)}
                className="h-8 w-[200px] text-xs rounded-lg border border-slate-200 px-3 pr-7 focus:outline-none focus:border-slate-300 focus:ring-1 focus:ring-slate-200 placeholder:text-slate-300"
              />
              {search && (
                <button onClick={() => setSearch("")} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs">✕</button>
              )}
            </div>
            {/* Count */}
            <span className="text-[11px] text-slate-400 tabular-nums">
              {t("showingXofY", lang)} {Math.min(tableLimit, sorted.length)} {t("ofTotal", lang)} {sorted.length}
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/80">
                  <th className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider px-5 py-2.5 text-left">{t("meterId", lang)}</th>
                  <th className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider px-5 py-2.5 text-left">{t("buildingName", lang)}</th>
                  <th className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider px-5 py-2.5 text-right">{t("currentAfkoeling", lang)}</th>
                  <th className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider px-5 py-2.5 text-right">{t("deviationFromKrav", lang)}</th>
                  <th className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider px-5 py-2.5 text-center">{t("tariffPosition", lang)}</th>
                  <th className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider px-5 py-2.5 text-center">{t("trend12w", lang)}</th>
                  <th className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider px-5 py-2.5 text-right"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {visibleRows.map(m => {
                  const hasTemp = m.hasTemperatureData;
                  const dev = hasTemp ? +(m.avgAfkoeling - thr).toFixed(1) : null;
                  return (
                    <tr key={m.meterId} className={`transition-colors ${hasTemp ? "hover:bg-slate-50/80 cursor-pointer" : "bg-slate-50/40 opacity-60"}`} onClick={() => hasTemp && openDetail(m.meterId)}>
                      <td className="px-5 py-2.5">
                        <span className="text-sm font-mono font-medium" style={{ color: brand.navy }}>{m.meterId}</span>
                        {!hasTemp && <span className="ml-1.5 text-[9px] text-amber-600 bg-amber-50 px-1 py-0.5 rounded font-medium">{t("noTempData", lang)}</span>}
                      </td>
                      <td className="px-5 py-2.5 text-sm text-slate-600">{m.buildingName}</td>
                      <td className="px-5 py-2.5 text-right">
                        {hasTemp ? (<>
                          <span className={`text-sm font-semibold tabular-nums ${m.avgAfkoeling <= thr ? "text-emerald-600" : m.avgAfkoeling <= thr * 1.1 ? "text-amber-500" : "text-red-500"}`}>
                            {m.avgAfkoeling}
                          </span>
                          <span className="text-xs text-slate-400 ml-1">kWh/m³</span>
                        </>) : <span className="text-xs text-slate-300">—</span>}
                      </td>
                      <td className="px-5 py-2.5 text-right">
                        {hasTemp ? (
                          <span className={`text-sm tabular-nums font-medium ${dev <= 0 ? "text-emerald-600" : "text-red-500"}`}>
                            {dev > 0 ? "+" : ""}{dev}
                          </span>
                        ) : <span className="text-xs text-slate-300">—</span>}
                      </td>
                      <td className="px-5 py-2.5 text-center">{hasTemp ? <TariffBadge afk={m.avgAfkoeling} /> : <span className="text-xs text-slate-300">—</span>}</td>
                      <td className="px-5 py-2.5 text-center">{hasTemp ? <Sparkline data={m.sparkline} threshold={thr} /> : <span className="text-xs text-slate-300">—</span>}</td>
                      <td className="px-5 py-2.5 text-right">
                        {hasTemp ? (
                          <button className="text-[11px] font-medium px-2 py-1 rounded hover:bg-slate-100 transition-colors" style={{ color: brand.blue }}>
                            {t("detailedView", lang)} →
                          </button>
                        ) : null}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {/* Show more / less + portfolio average footer */}
          <div className="flex items-center justify-between px-5 py-2.5 bg-slate-50/80 border-t border-slate-200">
            <div className="flex items-center gap-3">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{t("portfolioAvg", lang)}</span>
              <span className={`text-sm font-bold tabular-nums ${portfolioAvg <= thr ? "text-emerald-600" : "text-red-500"}`}>
                {portfolioAvg} <span className="text-slate-400 font-normal text-xs">kWh/m³</span>
              </span>
            </div>
            {sorted.length > 15 && (
              <button
                onClick={() => setTableLimit(prev => prev >= sorted.length ? 15 : sorted.length)}
                className="text-[11px] font-medium px-3 py-1 rounded-lg hover:bg-slate-100 transition-colors"
                style={{ color: brand.blue }}
              >
                {tableLimit >= sorted.length ? t("showLess", lang) : `${t("showMore", lang)} (${sorted.length - tableLimit})`}
              </button>
            )}
          </div>
        </SectionCard>
      </div>
    );
  }

  /* ════════════════════════════════════════════
     DETAIL VIEW — single meter: afkøling only
     ════════════════════════════════════════════ */
  const data = detailData || [];
  const avgAfk = data.length > 0 ? +(data.reduce((s, d) => s + d.afkoeling, 0) / data.length).toFixed(1) : 0;
  const afkOk = avgAfk <= thr;
  const meterInfo = allMeters.find(m => m.id === selectedMeter);
  const bldgInfo = meterInfo ? getBuilding(meterInfo.buildingId) : null;

  return (
    <div className="space-y-5">
      {/* Back bar */}
      <div className="flex flex-wrap items-center gap-3">
        <button onClick={() => { setView("portfolio"); setSelectedMeter(null); }}
          className="text-[11px] font-medium px-2.5 py-1.5 rounded-lg hover:bg-slate-100 transition-colors border border-slate-200 flex items-center gap-1"
          style={{ color: brand.navy }}>
          ← {t("backToPortfolio", lang)}
        </button>
        <div className="flex-1 min-w-0">
          <span className="text-sm font-semibold" style={{ color: brand.navy }}>{selectedMeter}</span>
          {bldgInfo && <span className="text-sm text-slate-400 ml-2">— {bldgInfo.name}</span>}
        </div>
        {navigate && selectedMeter && (
          <button onClick={() => navigate(`/meters/${selectedMeter}`)}
            className="text-[11px] font-medium px-2 py-1 rounded hover:bg-slate-100 transition-colors"
            style={{ color: brand.blue }}>
            {lang === "da" ? "Åbn måler →" : "Open meter →"}
          </button>
        )}
      </div>

      <SectionHeader title={t("meterAfkoelingDetail", lang)} description={t("meterAfkoelingDetailSub", lang)}>
        <SegmentedControl value={period} onChange={v => v && setPeriod(v)} options={[
          { value: "weekly", label: t("weekly", lang) },
          { value: "monthly", label: t("monthly", lang) },
          { value: "yearly", label: t("yearly", lang) },
        ]} />
      </SectionHeader>

      {/* Single KPI row: just afkøling + tariff status */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
        <Metric label={t("afkoelingKpi", lang)} value={avgAfk} unit={t("afkoelingUnit", lang)}
          sub={afkOk ? `${t("belowThreshold", lang)} (${thr})` : `${t("aboveThreshold", lang)} (${thr})`} status={afkOk ? "good" : "bad"} />
        <Metric label={t("tariffPosition", lang)}
          value={afkOk ? t("bonus", lang) : t("surcharge", lang)}
          sub={afkOk ? t("expectedBonus", lang) : t("riskSurcharge", lang)}
          status={afkOk ? "good" : "bad"} />
        <Metric label={t("supplierThreshold", lang)} value={thr} unit="kWh/m³"
          sub={`${HOFOR.tariffVersion}`} />
      </div>

      {/* Afkøling trend — single meter, no comparison */}
      <SectionCard title={t("afkoelingTrendTitle", lang)}>
        <p className="text-xs text-slate-400 mb-3">{t("afkoelingTrendSub", lang)}</p>
        <ResponsiveContainer width="100%" height={280}>
          <ComposedChart data={data} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
            <XAxis dataKey="name" tick={{ fontSize: 11, fill: brand.muted }} axisLine={{ stroke: brand.border }} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: brand.muted }} unit=" kWh/m³" axisLine={false} tickLine={false} />
            <Tooltip content={<BrandTooltip />} />
            <ReferenceLine y={thr} stroke={brand.red} strokeDasharray="6 4" strokeWidth={1.5}
              label={{ value: `${t("hoforThreshold", lang)}: ${thr} kWh/m³`, fill: brand.red, fontSize: 10, position: "right" }} />
            <Area type="monotone" dataKey="afkoeling" fill={brand.blue} fillOpacity={0.08} stroke="none" />
            <Line type="monotone" dataKey="afkoeling" stroke={brand.blue} strokeWidth={2} dot={{ r: 2.5, fill: brand.blue, strokeWidth: 0 }} name={t("afkoelingLine", lang)} />
          </ComposedChart>
        </ResponsiveContainer>
      </SectionCard>

      {/* Data table — afkøling only (no supply/return/cooling columns) */}
      <SectionCard title={t("coolingTable", lang)} noPad>
        <DataTable
          headers={[t("period", lang), t("afkoelingCol", lang), t("volume", lang), t("consCol", lang)]}
          rows={data.map((r, idx) => (
            <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
              <td className="px-4 py-2 text-sm font-medium" style={{ color: brand.navy }}>{r.name}</td>
              <td className={`px-4 py-2 text-sm text-right tabular-nums font-medium ${r.afkoeling <= thr ? "text-emerald-600" : r.afkoeling <= thr * 1.1 ? "text-amber-500" : "text-red-500"}`}>{r.afkoeling}</td>
              <td className="px-4 py-2 text-sm text-right tabular-nums">{r.volume}</td>
              <td className="px-4 py-2 text-sm text-right tabular-nums">{r.mwh}</td>
            </tr>
          ))}
        />
      </SectionCard>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   Graddage (GAF) Portfolio Report
   ═══════════════════════════════════════════════════════ */
export function GraddageReport({ navigate }) {
  const lang = useLang();
  const [supplierFilter, setSupplierFilter] = useState("hofor");
  const [search, setSearch] = useState("");
  const [vis, setVis] = useState([2024, 2025, 2026]);
  const [period, setPeriod] = useState("monthly");
  const [visibleMeterIds, setVisibleMeterIds] = useState(null);

  const tog = y => setVis(p => p.includes(y) ? p.filter(x => x !== y) : [...p, y]);

  // DH meters only
  const dhMeters = useMemo(() => allMeters.filter(m => m.type === "fjernvarme"), []);
  const dhSupplierIds = [...new Set(dhMeters.map(m => m.supplierId).filter(Boolean))];
  const dhSuppliers = dhSupplierIds.map(id => suppliers.find(s => s.id === id)).filter(Boolean);

  // Filtered meters
  const filtered = useMemo(() => {
    let list = dhMeters.map(m => {
      const bldg = buildings.find(b => b.id === m.buildingId);
      return { ...m, buildingName: bldg?.name || "", area: bldg?.area || 0 };
    });
    if (supplierFilter !== "all") list = list.filter(m => m.supplierId === supplierFilter);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(m => m.id.toLowerCase().includes(q) || m.buildingName.toLowerCase().includes(q));
    }
    return list;
  }, [dhMeters, supplierFilter, search]);

  // Graddage data per meter
  const graddageData = useMemo(() => filtered.map(m => ({
    ...m,
    gd: getGraddageForMeter(m.id),
  })), [filtered]);

  // Visible meter selection
  const allFilteredIds = useMemo(() => new Set(filtered.map(m => m.id)), [filtered]);
  useEffect(() => { setVisibleMeterIds(null); }, [supplierFilter, search]);
  const visibleSet = visibleMeterIds || allFilteredIds;
  const toggleMeter = (id) => {
    const current = new Set(visibleSet);
    if (current.has(id)) current.delete(id); else current.add(id);
    setVisibleMeterIds(current);
  };

  // Portfolio-level aggregated GAF data for visible meters
  const portfolioMonthly = useMemo(() => {
    const visMeters = graddageData.filter(m => visibleSet.has(m.id));
    return GK.map((mk, mi) => {
      const row = { name: mk, ng: GN[mk] };
      vis.forEach(y => {
        let totalRaw = 0, totalGaf = 0, totalDd = 0, count = 0;
        visMeters.forEach(m => {
          const pt = m.gd.data.find(d => d.year === y && d.monthIdx === mi);
          if (pt) { totalRaw += pt.raw; totalGaf += pt.gaf; totalDd += pt.degreeDays; count++; }
        });
        row[`r${y}`] = +totalRaw.toFixed(1);
        row[`g${y}`] = +totalGaf.toFixed(1);
        row[`a${y}`] = count > 0 ? Math.round(totalDd / count) : 0;
      });
      return row;
    });
  }, [graddageData, vis, visibleSet]);

  // Portfolio yearly totals
  const portfolioYearly = useMemo(() => {
    const visMeters = graddageData.filter(m => visibleSet.has(m.id));
    return [2022, 2023, 2024, 2025, 2026].map(y => {
      let totalRaw = 0, totalGaf = 0, totalDd = 0, count = 0;
      visMeters.forEach(m => {
        const yData = m.gd.data.filter(d => d.year === y);
        totalRaw += yData.reduce((s, d) => s + d.raw, 0);
        totalGaf += yData.reduce((s, d) => s + d.gaf, 0);
        totalDd += yData.reduce((s, d) => s + d.degreeDays, 0);
        if (yData.length > 0) count++;
      });
      const avgGuf = totalDd > 0 ? +(GNT / (totalDd / (count || 1))).toFixed(3) : 1;
      return { name: `${y}`, raw: +totalRaw.toFixed(0), gaf: +totalGaf.toFixed(0), dd: Math.round(totalDd / (count || 1)), guf: avgGuf };
    });
  }, [graddageData, vis, visibleSet]);

  // KPIs for current year
  const currentYear = portfolioYearly.find(y => y.name === "2026") || { raw: 0, gaf: 0, dd: 0, guf: 1 };

  // Table: per-meter yearly summary for visible years
  const tableData = useMemo(() => graddageData.map(m => {
    const yearly = vis.map(y => {
      const yData = m.gd.data.filter(d => d.year === y);
      const raw = yData.reduce((s, d) => s + d.raw, 0);
      const gaf = yData.reduce((s, d) => s + d.gaf, 0);
      const dd = yData.reduce((s, d) => s + d.degreeDays, 0);
      const guf = dd > 0 ? +(GNT / dd).toFixed(3) : 1;
      return { year: y, raw: +raw.toFixed(0), gaf: +gaf.toFixed(0), guf, deviation: raw > 0 ? +(((gaf - raw) / raw) * 100).toFixed(1) : 0 };
    });
    return { ...m, yearly };
  }), [graddageData, vis]);

  // Meter colors for chart lines
  const COLORS = [brand.blue, brand.midBlue, brand.amber, brand.green, "#8B5CF6", "#EC4899", "#14B8A6", "#F97316", "#6366F1", "#84CC16"];

  const selectAllMeters = () => setVisibleMeterIds(null);
  const deselectAllMeters = () => setVisibleMeterIds(new Set());

  return (
    <div className="space-y-5">
      {/* Header + period control — matches CoolingReport pattern */}
      <SectionHeader title={t("reportGraddageTitle", lang)} description={t("reportGraddageDesc", lang)}>
        <SegmentedControl value={period} onChange={v => v && setPeriod(v)} options={[
          { value: "monthly", label: t("monthly", lang) },
          { value: "yearly", label: t("yearlyTotal", lang) },
        ]} />
      </SectionHeader>

      {/* KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Metric label={`${t("gafAdj", lang)} 2026`} value={currentYear.gaf.toLocaleString(lang === "da" ? "da-DK" : "en-US")} unit="MWh" sub={`${t("rawCons", lang)}: ${currentYear.raw.toLocaleString(lang === "da" ? "da-DK" : "en-US")} MWh`} />
        <Metric label={t("degreeDays", lang) + " 2026"} value={currentYear.dd.toLocaleString(lang === "da" ? "da-DK" : "en-US")} sub={`${t("normalYear", lang)}: ${GNT.toLocaleString(lang === "da" ? "da-DK" : "en-US")}`} />
        <Metric label="GUF 2026" value={currentYear.guf.toFixed(3)} sub={currentYear.guf > 1 ? `${t("colderThanNormal", lang)}` : `${t("warmerThanNormal", lang)}`} />
        <Metric label={t("dhMetersCount", lang)} value={`${filtered.length}`} sub={`${visibleSet.size} ${t("selected", lang)}`} />
      </div>

      {/* Meter (de)selection chips — matches CoolingReport pattern */}
      <div className="bg-white rounded-xl border border-slate-200 px-4 py-3">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{t("selectedMeters", lang)} ({visibleSet.size} / {filtered.length})</span>
          <div className="flex gap-2">
            <button onClick={selectAllMeters} className="text-[11px] font-medium px-2 py-0.5 rounded hover:bg-slate-100 transition-colors" style={{ color: brand.blue }}>{t("selectAll", lang)}</button>
            <button onClick={deselectAllMeters} className="text-[11px] font-medium px-2 py-0.5 rounded hover:bg-slate-100 transition-colors text-slate-400">{t("deselectAll", lang)}</button>
          </div>
        </div>
        {/* Year pills */}
        <div className="flex flex-wrap items-center gap-1.5 mb-2">
          <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mr-1">{t("showYears", lang)}</span>
          {[2022, 2023, 2024, 2025, 2026].map(y => (
            <button key={y} onClick={() => tog(y)}
              className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium transition-all duration-200 ${vis.includes(y) ? "text-white shadow-sm" : "text-slate-500 bg-transparent hover:bg-slate-100"}`}
              style={vis.includes(y) ? { background: yearColor[y] } : {}}>
              {y}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap gap-1.5">
          {filtered.map((m, idx) => {
            const on = visibleSet.has(m.id);
            const col = COLORS[idx % COLORS.length];
            return (
              <button key={m.id} onClick={() => toggleMeter(m.id)}
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium border transition-all ${on ? "border-transparent text-white shadow-sm" : "border-slate-200 text-slate-400 bg-white hover:bg-slate-50"}`}
                style={on ? { backgroundColor: col } : {}}>
                <span className={`w-2 h-2 rounded-full border ${on ? "bg-white border-white/50" : "border-slate-300"}`} />
                {m.buildingName}
              </button>
            );
          })}
        </div>
      </div>

      {/* GAF Chart */}
      <SectionCard title={period === "monthly" ? t("gafMonthly", lang) : t("gafYearly", lang)}>
        <ResponsiveContainer width="100%" height={300}>
          {period === "monthly" ? (
            <BarChart data={portfolioMonthly} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: brand.muted }} axisLine={{ stroke: brand.border }} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: brand.muted }} unit=" MWh" axisLine={false} tickLine={false} />
              <Tooltip content={<BrandTooltip />} />
              <Legend wrapperStyle={{ fontSize: 11 }} iconType="circle" iconSize={8} />
              {vis.map(y => <Bar key={y} dataKey={`g${y}`} name={`GAF ${y}`} fill={yearColor[y]} radius={[3, 3, 0, 0]} />)}
            </BarChart>
          ) : (
            <BarChart data={portfolioYearly.filter(x => vis.includes(+x.name))} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: brand.muted }} axisLine={{ stroke: brand.border }} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: brand.muted }} unit=" MWh" axisLine={false} tickLine={false} />
              <Tooltip content={<BrandTooltip />} />
              <Legend wrapperStyle={{ fontSize: 11 }} iconType="circle" iconSize={8} />
              <Bar dataKey="raw" name={t("rawCons", lang)} fill="#CBD5E1" radius={[3, 3, 0, 0]} />
              <Bar dataKey="gaf" name={t("gafAdj", lang)} fill={brand.blue} radius={[3, 3, 0, 0]} />
            </BarChart>
          )}
        </ResponsiveContainer>
      </SectionCard>

      {/* Degree Days vs Normal Year */}
      <SectionCard title={t("ddVsNormal", lang)}>
        <ResponsiveContainer width="100%" height={220}>
          <ComposedChart data={portfolioMonthly} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
            <XAxis dataKey="name" tick={{ fontSize: 11, fill: brand.muted }} axisLine={{ stroke: brand.border }} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: brand.muted }} axisLine={false} tickLine={false} />
            <Tooltip content={<BrandTooltip />} />
            <Legend wrapperStyle={{ fontSize: 11 }} iconType="circle" iconSize={8} />
            <Line type="monotone" dataKey="ng" stroke={brand.red} strokeWidth={1.5} strokeDasharray="6 4" dot={false} name={t("normalYear", lang)} />
            {vis.map(y => <Line key={y} type="monotone" dataKey={`a${y}`} stroke={yearColor[y]} strokeWidth={1.5} dot={{ r: 2 }} name={`${t("actual", lang)} ${y}`} />)}
          </ComposedChart>
        </ResponsiveContainer>
      </SectionCard>

      {/* Meter comparison table — with supplier filter + search (matches CoolingReport pattern) */}
      <SectionCard title={t("meterComparison", lang)} noPad>
        <div className="flex flex-wrap items-center gap-2 px-4 py-3 border-b border-slate-100">
          <Select value={supplierFilter} onValueChange={setSupplierFilter}>
            <SelectTrigger className="w-[160px] h-8 text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("allSuppliers", lang)}</SelectItem>
              {dhSuppliers.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
            </SelectContent>
          </Select>
          <input
            type="text" placeholder={t("searchMeter", lang)} value={search} onChange={e => setSearch(e.target.value)}
            className="h-8 w-[180px] rounded-md border border-slate-200 px-2.5 text-xs placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-[#3EB1C8]"
          />
          <span className="ml-auto text-[11px] text-slate-400">{filtered.length} {t("meters", lang)}</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/80 text-[11px]" style={{ color: brand.muted }}>
                <th className="px-4 py-2.5 text-left font-medium">{t("meter", lang)}</th>
                <th className="px-4 py-2.5 text-left font-medium">{t("building", lang)}</th>
                {vis.map(y => (
                  <Fragment key={y}>
                    <th className="px-4 py-2.5 text-right font-medium">{t("rawCons", lang)} {y}</th>
                    <th className="px-4 py-2.5 text-right font-medium">GAF {y}</th>
                    <th className="px-4 py-2.5 text-right font-medium">GUF {y}</th>
                  </Fragment>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {tableData.map((m) => (
                <tr key={m.id} className="hover:bg-slate-50 cursor-pointer transition-colors"
                  onClick={() => navigate(`/meter/${m.id}`)}>
                  <td className="px-4 py-2 text-sm font-medium" style={{ color: brand.navy }}>{m.id}</td>
                  <td className="px-4 py-2 text-sm text-slate-500">{m.buildingName}</td>
                  {m.yearly.filter(yd => vis.includes(yd.year)).map(yd => (
                    <Fragment key={yd.year}>
                      <td className="px-4 py-2 text-sm text-right tabular-nums">{yd.raw.toLocaleString(lang === "da" ? "da-DK" : "en-US")}</td>
                      <td className="px-4 py-2 text-sm text-right tabular-nums font-medium" style={{ color: brand.blue }}>{yd.gaf.toLocaleString(lang === "da" ? "da-DK" : "en-US")}</td>
                      <td className="px-4 py-2 text-sm text-right tabular-nums">{yd.guf}</td>
                    </Fragment>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SectionCard>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   DashboardContainer — 2 tabs: Consumption & Tariff
   ═══════════════════════════════════════════════════════ */
const tabDefs = [
  { value: "consumption", icon: Icon.consumption, labelKey: "tabConsumptionAnalysis" },
  { value: "tariff", icon: Icon.cooling, labelKey: "tabTariff" },
];

export default function DashboardContainer() {
  const lang = useLang();

  return (
    <Tabs defaultValue="consumption" className="flex-1 flex flex-col">
      <div className="bg-white border-b border-slate-200 px-6 shrink-0">
        <TabsList className="bg-transparent h-10 gap-0 p-0">
          {tabDefs.map(tab => (
            <TabsTrigger key={tab.value} value={tab.value}
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-[#3EB1C8] data-[state=active]:text-slate-900 data-[state=active]:shadow-none px-4 text-[13px] text-slate-400 hover:text-slate-600 transition-colors gap-1.5">
              <span className="opacity-60">{tab.icon}</span>
              {t(tab.labelKey, lang)}
            </TabsTrigger>
          ))}
        </TabsList>
      </div>

      <main className="flex-1 max-w-[1200px] w-full mx-auto px-6 py-6 overflow-y-auto">
        <TabsContent value="consumption"><ConsumptionDash/></TabsContent>
        <TabsContent value="tariff"><TariffDash/></TabsContent>
      </main>
    </Tabs>
  );
}
