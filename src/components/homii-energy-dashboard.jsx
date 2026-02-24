import React, { useState, useMemo, Fragment, createContext, useContext } from "react";
import {
  BarChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, ReferenceLine, Area, ComposedChart, Cell,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

/* ═══════════════════════════════════════════════════════
   DESIGN TOKENS — 4px grid, intentional palette
   ═══════════════════════════════════════════════════════ */
const brand = {
  navy:    "#1F2A44",
  blue:    "#3EB1C8",
  midBlue: "#3B8EA5",
  green:   "#22C55E",
  red:     "#EF4444",
  amber:   "#F59E0B",
  bg:      "#F8FAFC",   // slate-50
  surface: "#FFFFFF",
  border:  "#E2E8F0",   // slate-200
  muted:   "#94A3B8",   // slate-400
  text:    "#1E293B",   // slate-800
  subtle:  "#64748B",   // slate-500
};

const yearColor = {
  2021: "#CBD5E1", 2022: "#94A3B8", 2023: "#3B8EA5", 2024: "#3EB1C8", 2025: "#1F2A44",
};

/* ═══════════════════════════════════════════════════════
   HOFOR 2026 Tariff Constants
   ═══════════════════════════════════════════════════════ */
const HOFOR = {
  standard:  { krav: 30, bonusAbove: 35, surchargeBelow: 25, label: "Standard" },
  vesterbro: { krav: 25, bonusAbove: 30, surchargeBelow: 20, label: "Vesterbro (lavtemp.)" },
  korrektionPct: 0.008,
  energiprisPerMWh: 650,
  effektbetalingPerM2: 42,
};

/* ═══════════════════════════════════════════════════════
   i18n
   ═══════════════════════════════════════════════════════ */
const LangCtx = createContext("da");
const useLang = () => useContext(LangCtx);

const dict = {
  energyDashboard:    { da: "Energi Dashboard",           en: "Energy Dashboard" },
  dept:               { da: "Afdeling: KAB Ørestad",      en: "Department: KAB Ørestad" },
  tabCooling:         { da: "Afkøling",                   en: "Cooling" },
  tabGraddage:        { da: "Graddage",                   en: "Degree Days" },
  tabLegionella:      { da: "Legionella",                 en: "Legionella" },
  tabConsumption:     { da: "Forbrug",                    en: "Consumption" },
  showYears:          { da: "Vis år:",                     en: "Show years:" },
  month:              { da: "Måned",                       en: "Month" },
  total:              { da: "Total",                       en: "Total" },
  normalYear:         { da: "Normalår",                    en: "Normal year" },
  weekly:             { da: "Ugentlig",                    en: "Weekly" },
  monthly:            { da: "Månedlig",                    en: "Monthly" },
  yearly:             { da: "Årlig",                       en: "Yearly" },
  yearlyTotal:        { da: "Årlig total",                 en: "Yearly total" },
  coolingTitle:       { da: "Afkøling – Fjernvarme",      en: "Cooling – District Heating" },
  coolingSub:         { da: "Overvåg afkøling per måler eller samlet. Afkøling = MWh/m³ × 860. Gode værdier reducerer HOFORs motivationstarif.",
                        en: "Monitor cooling per meter or aggregated. Cooling = MWh/m³ × 860. Good values reduce HOFOR's motivational tariff." },
  avgCooling:         { da: "Gns. Afkøling",              en: "Avg. Cooling" },
  avgReturn:          { da: "Gns. Returtemp.",             en: "Avg. Return Temp." },
  totalCons:          { da: "Samlet Energiforbrug",        en: "Total Energy Cons." },
  status:             { da: "Status",                      en: "Status" },
  aboveReq:           { da: "Over krav",                   en: "Above requirement" },
  belowReq:           { da: "Under krav",                  en: "Below requirement" },
  goodReturn:         { da: "God retur",                   en: "Good return" },
  canImprove:         { da: "Kan forbedres",               en: "Can be improved" },
  bonus:              { da: "Bonus",                       en: "Bonus" },
  surcharge:          { da: "Tillæg",                      en: "Surcharge" },
  expectedBonus:      { da: "Forventet bonus",             en: "Expected bonus" },
  riskSurcharge:      { da: "Risiko for tillæg",           en: "Risk of surcharge" },
  chartTitle:         { da: "Fremløb, Retur & Afkøling",  en: "Supply, Return & Cooling" },
  req:                { da: "Krav",                        en: "Req." },
  supplyLine:         { da: "Fremløb (°C)",                en: "Supply (°C)" },
  returnLine:         { da: "Retur (°C)",                  en: "Return (°C)" },
  coolingLine:        { da: "Afkøling (°C)",               en: "Cooling (°C)" },
  coolingArea:        { da: "Afkøling (område)",           en: "Cooling (area)" },
  energyCons:         { da: "Energiforbrug (MWh)",         en: "Energy Consumption (MWh)" },
  consBar:            { da: "Energiforbrug (MWh)",         en: "Energy Consumption (MWh)" },
  coolingTable:       { da: "Afkølingsdata",               en: "Cooling Data" },
  period:             { da: "Periode",                     en: "Period" },
  supply:             { da: "Fremløb (°C)",                en: "Supply (°C)" },
  returnT:            { da: "Retur (°C)",                  en: "Return (°C)" },
  coolingC:           { da: "Afkøling (°C)",               en: "Cooling (°C)" },
  volume:             { da: "Volumen (m³)",                en: "Volume (m³)" },
  consCol:            { da: "Energiforbrug (MWh)",         en: "Energy Cons. (MWh)" },
  allMeters:          { da: "Alle målere (samlet)",        en: "All meters (aggregated)" },
  blockA:             { da: "Blok A – Måler 001",          en: "Block A – Meter 001" },
  blockB:             { da: "Blok B – Måler 002",          en: "Block B – Meter 002" },
  blockC:             { da: "Blok C – Måler 003",          en: "Block C – Meter 003" },
  blockD:             { da: "Blok D – Måler 004",          en: "Block D – Meter 004" },
  graddageTitle:      { da: "Graddage – GUF & GAF",       en: "Degree Days – GUF & GAF" },
  graddageSub:        { da: "Sammenlign graddagekorrigeret forbrug (GAF) over flere år. GUF = Normalårs-graddage / Aktuelle graddage. GAF = Forbrug × GUF.",
                        en: "Compare degree-day-adjusted consumption (GAF) across years. GUF = Normal-year degree days ÷ Actual degree days. GAF = Consumption × GUF." },
  gafMonthly:         { da: "GAF – Månedlig sammenligning", en: "GAF – Monthly Comparison" },
  gafYearly:          { da: "Årligt GAF-forbrug",          en: "Yearly GAF Consumption" },
  ddVsNormal:         { da: "Graddage – Aktuel vs. Normalår", en: "Degree Days – Actual vs. Normal Year" },
  ddTable:            { da: "Graddage & GUF-tabel",        en: "Degree Days & GUF Table" },
  degreeDays:         { da: "Graddage",                    en: "Degree Days" },
  rawCons:            { da: "Rå forbrug",                  en: "Raw consumption" },
  gafAdj:             { da: "GAF (korrigeret)",            en: "GAF (adjusted)" },
  actual:             { da: "Aktuel",                      en: "Actual" },
  raw:                { da: "Rå",                          en: "Raw" },
  barTitle:           { da: "Forbrug – Søjlediagrammer",   en: "Consumption – Bar Charts" },
  barSub:             { da: "Se månedlige forbrugsdata for varme, el og vand. Brug filtre til at sammenligne specifikke måneder på tværs af år.",
                        en: "View monthly consumption data for heating, electricity, and water. Use filters to compare specific months across years." },
  heat:               { da: "Varme",                       en: "Heating" },
  elec:               { da: "El",                          en: "Electricity" },
  water:              { da: "Vand",                        en: "Water" },
  compareOne:         { da: "Sammenlign én måned",         en: "Compare one month" },
  showAll:            { da: "Vis alle måneder",            en: "Show all months" },
  compAcross:         { da: "sammenligning over år",       en: "comparison across years" },
  monthlyCons:        { da: "Månedligt forbrug",           en: "Monthly consumption" },
  dataTable:          { da: "Datatabel",                   en: "Data table" },
  footerL:            { da: "homii – Prototype Dashboard | Kamstrup Metering Integration",
                        en: "homii – Prototype Dashboard | Kamstrup Metering Integration" },
  footerR:            { da: "Data: Simuleret demo-data | © 2026 homii",
                        en: "Data: Simulated demo data | © 2026 homii" },
  tariffTitle:        { da: "HOFOR Motivationstarif – Beregner", en: "HOFOR Motivational Tariff – Calculator" },
  tariffSub:          { da: "Simulér den økonomiske effekt af afkølingsforbedringer. Korrektion: 0,8% af energiprisen per grad afvigelse.",
                        en: "Simulate the financial impact of cooling improvements. Correction: 0.8% of energy price per degree deviation." },
  zone:               { da: "Zone:",                       en: "Zone:" },
  annualEnergy:       { da: "Årligt energiforbrug",        en: "Annual energy consumption" },
  effektbetaling:     { da: "Effektbetaling",              en: "Capacity charge" },
  energipris:         { da: "Energipris",                  en: "Energy price" },
  afkKorrektion:      { da: "Afkølingskorrektion",         en: "Cooling correction" },
  totalCost:          { da: "Samlet årlig omkostning",      en: "Total annual cost" },
  whatIf:             { da: "Hvad hvis afkøling forbedres med", en: "What if cooling improves by" },
  potentialSaving:    { da: "Potentiel årlig besparelse",   en: "Potential annual saving" },
  currentCooling:     { da: "Aktuel afkøling",             en: "Current cooling" },
  improvedCooling:    { da: "Forbedret afkøling",          en: "Improved cooling" },
  thresholdChange:    { da: "Krav steg fra 29°C (2025) til 30°C (2026)", en: "Requirement rose from 29°C (2025) to 30°C (2026)" },
  epcLabel:           { da: "Energimærkning",              en: "Energy Label" },
  epcReq:             { da: "Krav: B inden 2030",          en: "Required: B by 2030" },
  epcMonths:          { da: "mdr. til frist",              en: "months to deadline" },
  legionellaTitle:    { da: "Legionella – Overvågning & Compliance", en: "Legionella – Monitoring & Compliance" },
  legionellaSub:      { da: "Overvåg varmtvandstemperaturer for at sikre legionellaforebyggelse. Lovkrav: min. 50°C ved fjerneste tapsted. Anbefalet: 55–60°C i varmtvandsbeholder.",
                        en: "Monitor hot water temperatures to ensure legionella prevention. Legal requirement: min. 50°C at furthest tap point. Recommended: 55–60°C in hot water tank." },
  currentTemp:        { da: "Aktuel Temp.",                en: "Current Temp." },
  minTemp24h:         { da: "Min. Temp. (24t)",            en: "Min. Temp. (24h)" },
  daysSinceDisinf:    { da: "Dage siden desinfektion",     en: "Days since disinfection" },
  compliancePct:      { da: "Compliance",                  en: "Compliance" },
  hwTempTitle:        { da: "Varmtvandstemperatur – Seneste 30 dage", en: "Hot Water Temperature – Last 30 Days" },
  tankTemp:           { da: "Beholder (°C)",               en: "Tank (°C)" },
  tapTemp:            { da: "Tapsted (°C)",                en: "Tap point (°C)" },
  legalMin:           { da: "Lovkrav (50°C)",              en: "Legal min. (50°C)" },
  recommended:        { da: "Anbefalet (55°C)",            en: "Recommended (55°C)" },
  disinfLog:          { da: "Termisk desinfektion – Log",  en: "Thermal Disinfection – Log" },
  disinfDate:         { da: "Dato",                        en: "Date" },
  disinfDuration:     { da: "Varighed",                    en: "Duration" },
  disinfPeakTemp:     { da: "Maks. temp.",                 en: "Peak temp." },
  disinfResult:       { da: "Resultat",                    en: "Result" },
  disinfOk:           { da: "Godkendt",                    en: "Passed" },
  disinfFail:         { da: "Utilstrækkelig",              en: "Insufficient" },
  riskLevel:          { da: "Risikoniveau",                en: "Risk Level" },
  riskLow:            { da: "Lav risiko",                  en: "Low risk" },
  riskMedium:         { da: "Moderat risiko",              en: "Moderate risk" },
  riskHigh:           { da: "Høj risiko",                  en: "High risk" },
  aboveLegal:         { da: "Over lovkrav",                en: "Above legal min." },
  belowLegal:         { da: "Under lovkrav",               en: "Below legal min." },
  aboveRec:           { da: "Over anbefaling",             en: "Above recommended" },
  dangerZone:         { da: "Farezonen: 25–45°C",          en: "Danger zone: 25–45°C" },
  tempGauge:          { da: "Temperaturstatus",            en: "Temperature Status" },
  selectBuilding:     { da: "Vælg bygning:",               en: "Select building:" },
  bldgAll:            { da: "Alle bygninger (samlet)",     en: "All buildings (aggregated)" },
  bldgA:              { da: "Blok A – Beholder 1",         en: "Block A – Tank 1" },
  bldgB:              { da: "Blok B – Beholder 2",         en: "Block B – Tank 2" },
  bldgC:              { da: "Blok C – Beholder 3",         en: "Block C – Tank 3" },
  minutes:            { da: "min",                         en: "min" },
  compliant:          { da: "I overensstemmelse",          en: "Compliant" },
  nonCompliant:       { da: "Ikke i overensstemmelse",     en: "Non-compliant" },
};

const t = (k, lang) => dict[k]?.[lang] || dict[k]?.en || k;

const MS = {
  da: ["Jan","Feb","Mar","Apr","Maj","Jun","Jul","Aug","Sep","Okt","Nov","Dec"],
  en: ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"],
};
const ML = {
  da: ["Januar","Februar","Marts","April","Maj","Juni","Juli","August","September","Oktober","November","December"],
  en: ["January","February","March","April","May","June","July","August","September","October","November","December"],
};

/* ═══════════════════════════════════════════════════════
   SVG Icon System (replaces emojis for cross-platform consistency)
   ═══════════════════════════════════════════════════════ */
const Icon = {
  cooling: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
      <path d="M8 1v14M1 8h14M3.5 3.5l9 9M12.5 3.5l-9 9" />
    </svg>
  ),
  degreeDays: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
      <path d="M4 14V6M8 14V2M12 14V8" />
    </svg>
  ),
  legionella: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
      <path d="M8 2a5 5 0 0 1 5 5c0 3-2 5-5 7-3-2-5-4-5-7a5 5 0 0 1 5-5z" />
      <circle cx="8" cy="7" r="1.5" />
    </svg>
  ),
  consumption: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
      <path d="M2 14h12M3 14V8h2v6M7 14V4h2v10M11 14V6h2v8" />
    </svg>
  ),
};

/* ═══════════════════════════════════════════════════════
   Logo
   ═══════════════════════════════════════════════════════ */
const HomiiIcon = ({ size = 28, color = brand.blue }) => (
  <svg width={size} height={size * 1.2} viewBox="-1 -1 71.4 86.2" fill={color}>
    <path fillRule="evenodd" d="M69.43,26.46c0-2.87-1.43-5.54-3.82-7.13L39.46,1.92C36.58,0,32.85,0,29.97,1.92L3.82,19.33C1.43,20.93,0,23.59,0,26.46V79.03h.07v2.48a2.7,2.7,0,0,0,2.7,2.7H7.84a2.7,2.7,0,0,0,2.7-2.7V60.38c0-4.99,3.7-9.36,8.67-9.83,5.7-.54,10.51,3.96,10.51,9.55V71.17c0,7.2,5.84,13.04,13.04,13.04H62.04l7.39,0ZM40.19,71.17V60.55c0-10.65-8.12-19.79-18.75-20.47-3.96-.26-7.7.68-10.9,2.43V27.31l24.22-16.25L59.2,27.36V73.74H42.77a2.58,2.58,0,0,1-2.58-2.58Z"/>
  </svg>
);

/* ═══════════════════════════════════════════════════════
   Custom SegmentedControl (replaces ToggleGroup — Notion-style)
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
const GK = ["Jan","Feb","Mar","Apr","Maj","Jun","Jul","Aug","Sep","Okt","Nov","Dec"];
const GN = { Jan:480,Feb:410,Mar:340,Apr:210,Maj:100,Jun:30,Jul:8,Aug:15,Sep:80,Okt:230,Nov:360,Dec:460 };
const GNT = Object.values(GN).reduce((a,b)=>a+b,0);

function mkCooling(period, meter, lang) {
  const seed = meter === "all" ? 42 : meter.charCodeAt(meter.length-1);
  const r = (n) => Math.sin(seed*100+n*17)*0.5+0.5;
  const wk = lang==="da"?"Uge":"Week";
  if (period==="weekly") return Array.from({length:52},(_,n)=>{const m=Math.floor(n/4.33),w=m<3||m>9;const s=w?78+r(n)*8:68+r(n)*6,rt=w?42+r(n+100)*12:35+r(n+100)*10,c=s-rt,v=w?45+r(n+200)*30:15+r(n+200)*15;return{name:`${wk} ${n+1}`,supply:+s.toFixed(1),return:+rt.toFixed(1),cooling:+c.toFixed(1),volume:+v.toFixed(1),mwh:+((v*c)/860).toFixed(2)};});
  if (period==="monthly") return MS[lang].map((m,n)=>{const w=n<3||n>9;const s=w?80+r(n)*6:70+r(n)*5,rt=w?44+r(n+50)*10:36+r(n+50)*8,c=s-rt,v=w?190+r(n+100)*80:60+r(n+100)*50;return{name:m,supply:+s.toFixed(1),return:+rt.toFixed(1),cooling:+c.toFixed(1),volume:+v.toFixed(1),mwh:+((v*c)/860).toFixed(1)};});
  return Array.from({length:5},(_,n)=>{const y=2021+n,s=75+r(n)*5,rt=40+r(n+50)*8,c=s-rt,v=1500+r(n+100)*600;return{name:`${y}`,supply:+s.toFixed(1),return:+rt.toFixed(1),cooling:+c.toFixed(1),volume:+v.toFixed(0),mwh:+((v*c)/860).toFixed(0)};});
}

function mkGraddage() {
  const d=[];[2021,2022,2023,2024,2025].forEach(y=>{GK.forEach((m,mi)=>{const n=GN[m],f=0.85+Math.sin(y*7+mi*3)*0.15+Math.cos(y+mi*5)*0.08,a=Math.round(n*f),g=a>0?+(n/a).toFixed(3):1,ac=a*(4.2+Math.sin(y)*0.4)+Math.sin(y+mi)*30;d.push({year:y,mk:m,mi,ng:n,ag:a,guf:g,raw:+ac.toFixed(1),gaf:+(ac*g).toFixed(1)});});});return d;
}

function mkBar(lang) {
  return MS[lang].map((m,mi)=>{const e={name:m};[2021,2022,2023,2024,2025].forEach(y=>{e[`h${y}`]=+(mi<3||mi>9?120+Math.sin(y+mi)*30:25+Math.sin(y+mi)*15).toFixed(1);e[`e${y}`]=+(45+Math.sin(y*2+mi)*12).toFixed(1);e[`w${y}`]=+(800+Math.sin(y+mi*2)*200).toFixed(0);});return e;});
}

function mkLegionella(building) {
  const seed = building === "all" ? 7 : building.charCodeAt(building.length - 1);
  const r = (n) => Math.sin(seed * 100 + n * 13) * 0.5 + 0.5;
  const days = Array.from({ length: 30 }, (_, n) => {
    const day = 30 - n;
    const baseT = 56 + r(n) * 6;
    const tapDrop = 4 + r(n + 50) * 5;
    const dip = n === 12 || n === 22 ? -8 * r(n + 200) : 0;
    return { name: `D-${day}`, day, tank: +(baseT + dip).toFixed(1), tap: +(baseT - tapDrop + dip * 0.7).toFixed(1) };
  }).reverse();
  const disinfections = [
    { date: "2026-02-18", duration: 45, peakTemp: 65.2, ok: true },
    { date: "2026-02-04", duration: 40, peakTemp: 62.8, ok: true },
    { date: "2026-01-21", duration: 35, peakTemp: 58.1, ok: false },
    { date: "2026-01-07", duration: 50, peakTemp: 66.4, ok: true },
    { date: "2025-12-23", duration: 42, peakTemp: 63.5, ok: true },
  ];
  const currentTank = days[days.length - 1].tank;
  const currentTap = days[days.length - 1].tap;
  const minTap24h = Math.min(...days.slice(-3).map(d => d.tap));
  const complianceHours = days.filter(d => d.tap >= 50).length;
  return { days, disinfections, currentTank, currentTap, minTap24h, compliancePct: +((complianceHours / days.length) * 100).toFixed(0) };
}

/* ═══════════════════════════════════════════════════════
   Refined shared components
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

/* — KPI Metric — Notion-inspired: clean, restrained, hierarchical */
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

/* — Year pill selector — */
const YearPill = ({year, active, onClick}) => (
  <button
    onClick={onClick}
    className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium transition-all duration-200 ${
      active
        ? "text-white shadow-sm"
        : "text-slate-500 bg-transparent hover:bg-slate-100"
    }`}
    style={active ? {background: yearColor[year]} : {}}
  >
    {year}
  </button>
);

/* — Section header — consistent across all tabs */
const SectionHeader = ({ title, description, children }) => (
  <div className="flex flex-wrap items-start justify-between gap-4">
    <div className="min-w-0 flex-1">
      <h2 className="text-lg font-semibold" style={{color: brand.navy}}>{title}</h2>
      {description && <p className="text-sm text-slate-400 mt-1 max-w-2xl leading-relaxed">{description}</p>}
    </div>
    {children && <div className="flex flex-wrap items-center gap-2 shrink-0">{children}</div>}
  </div>
);

/* — Refined table — Attio-style: clean borders, no heavy header bars */
const DataTable = ({ headers, rows, lang }) => (
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

/* — Card Section title — */
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
   EPC Badge — refined, less noisy
   ═══════════════════════════════════════════════════════ */
const EPC_COLORS = { A: "#16A34A", B: "#22C55E", C: "#F59E0B", D: "#F97316", E: "#EF4444", F: "#DC2626", G: "#991B1B" };

function EpcBadge({ rating = "C", lang }) {
  const monthsTo2030 = useMemo(() => {
    const now = new Date();
    const deadline = new Date(2030, 0, 1);
    return Math.max(0, Math.round((deadline - now) / (1000 * 60 * 60 * 24 * 30.44)));
  }, []);
  return (
    <div className="flex items-center gap-1.5 rounded-md px-2.5 py-1" style={{ background: "rgba(255,255,255,0.08)" }}>
      <div className="w-5 h-5 rounded flex items-center justify-center text-[10px] font-bold text-white" style={{ background: EPC_COLORS[rating] }}>
        {rating}
      </div>
      <div className="text-[10px] leading-tight hidden sm:block">
        <div className="text-white/70 font-medium">{t("epcLabel", lang)}</div>
        <div className="text-white/40">{monthsTo2030} {t("epcMonths", lang)}</div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   Dashboard 1 – Cooling (Afkøling) + Tariff Simulator
   ═══════════════════════════════════════════════════════ */
function CoolingDash() {
  const lang = useLang();
  const [period, setPeriod] = useState("monthly");
  const [meter, setMeter] = useState("all");
  const [zone, setZone] = useState("standard");
  const [improveDeg, setImproveDeg] = useState(0);
  const data = useMemo(() => mkCooling(period, meter, lang), [period, meter, lang]);

  const hoforZone = HOFOR[zone];
  const thr = hoforZone.krav;

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

  const meters = [
    {id:"all",      l:t("allMeters",lang)},
    {id:"meter-001",l:t("blockA",lang)},
    {id:"meter-002",l:t("blockB",lang)},
    {id:"meter-003",l:t("blockC",lang)},
    {id:"meter-004",l:t("blockD",lang)},
  ];

  const fmtDKK = (v) => v.toLocaleString(lang==="da"?"da-DK":"en-US", { style: "currency", currency: "DKK", maximumFractionDigits: 0 });

  return (
    <div className="space-y-5">
      <SectionHeader title={t("coolingTitle",lang)} description={t("coolingSub",lang)}>
        <Select value={meter} onValueChange={setMeter}>
          <SelectTrigger className="w-[200px] h-8 text-xs"><SelectValue/></SelectTrigger>
          <SelectContent>{meters.map(m=><SelectItem key={m.id} value={m.id}>{m.l}</SelectItem>)}</SelectContent>
        </Select>
        <SegmentedControl value={period} onChange={v=>v&&setPeriod(v)} options={[
          {value:"weekly", label:t("weekly",lang)},
          {value:"monthly", label:t("monthly",lang)},
          {value:"yearly", label:t("yearly",lang)},
        ]} />
      </SectionHeader>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Metric label={t("avgCooling",lang)} value={avgC} unit="°C" sub={ok ? `${t("aboveReq",lang)} (${thr}°C)` : `${t("belowReq",lang)} (${thr}°C)`} status={ok?"good":"bad"} />
        <Metric label={t("avgReturn",lang)} value={avgR} unit="°C" sub={avgR<40?t("goodReturn",lang):t("canImprove",lang)} status={avgR<40?"good":"warn"} />
        <Metric label={t("totalCons",lang)} value={totMWh} unit="MWh" />
        <Metric label={t("status",lang)} value={ok?t("bonus",lang):t("surcharge",lang)} sub={ok?t("expectedBonus",lang):t("riskSurcharge",lang)} status={ok?"good":"bad"} />
      </div>

      {/* HOFOR Tariff Simulator */}
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
            {/* Cost breakdown */}
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
            {/* What-if slider */}
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

      {/* Charts */}
      <SectionCard title={t("chartTitle",lang)}>
        <ResponsiveContainer width="100%" height={300}>
          <ComposedChart data={data} margin={{top:5,right:20,bottom:5,left:0}}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
            <XAxis dataKey="name" tick={{fontSize:11, fill:brand.muted}} axisLine={{stroke:brand.border}} tickLine={false} />
            <YAxis tick={{fontSize:11, fill:brand.muted}} unit="°C" axisLine={false} tickLine={false} />
            <Tooltip content={<BrandTooltip/>}/>
            <Legend wrapperStyle={{fontSize:11, color:brand.subtle}} iconType="circle" iconSize={8} />
            <ReferenceLine y={thr} stroke={brand.red} strokeDasharray="6 4" strokeWidth={1.5} label={{value:`${t("req",lang)}: ${thr}°C`,fill:brand.red,fontSize:10,position:"right"}}/>
            <Area type="monotone" dataKey="cooling" fill={brand.blue} fillOpacity={0.06} stroke="none" name={t("coolingArea",lang)}/>
            <Line type="monotone" dataKey="supply" stroke={brand.red} strokeWidth={1.5} dot={false} name={t("supplyLine",lang)}/>
            <Line type="monotone" dataKey="return" stroke={brand.amber} strokeWidth={1.5} dot={false} name={t("returnLine",lang)}/>
            <Line type="monotone" dataKey="cooling" stroke={brand.blue} strokeWidth={2} dot={{r:2.5,fill:brand.blue,strokeWidth:0}} name={t("coolingLine",lang)}/>
          </ComposedChart>
        </ResponsiveContainer>
      </SectionCard>

      <SectionCard title={t("energyCons",lang)}>
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={data} margin={{top:5,right:20,bottom:5,left:0}}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
            <XAxis dataKey="name" tick={{fontSize:11, fill:brand.muted}} axisLine={{stroke:brand.border}} tickLine={false} />
            <YAxis tick={{fontSize:11, fill:brand.muted}} unit=" MWh" axisLine={false} tickLine={false} />
            <Tooltip content={<BrandTooltip/>}/>
            <Bar dataKey="mwh" name={t("consBar",lang)} radius={[3,3,0,0]} fill={brand.blue} fillOpacity={0.8} />
          </BarChart>
        </ResponsiveContainer>
      </SectionCard>

      {/* Data table */}
      <SectionCard title={t("coolingTable",lang)} noPad>
        <DataTable
          headers={[t("period",lang), t("supply",lang), t("returnT",lang), t("coolingC",lang), t("volume",lang), t("consCol",lang)]}
          rows={data.map((r,idx) => (
            <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
              <td className="px-4 py-2 text-sm font-medium" style={{color: brand.navy}}>{r.name}</td>
              <td className="px-4 py-2 text-sm text-right tabular-nums">{r.supply}</td>
              <td className={`px-4 py-2 text-sm text-right tabular-nums ${r.return > 42 ? "text-red-500" : ""}`}>{r.return}</td>
              <td className={`px-4 py-2 text-sm text-right tabular-nums font-medium ${r.cooling >= thr ? "text-emerald-600" : "text-red-500"}`}>{r.cooling}</td>
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
   Dashboard 2 – Graddage (GUF & GAF)
   ═══════════════════════════════════════════════════════ */
function GraddageDash() {
  const lang = useLang();
  const ms = MS[lang];
  const [view, setView] = useState("monthly");
  const [sel, setSel] = useState([2023,2024,2025]);
  const all = useMemo(mkGraddage,[]);
  const toggle = y => setSel(p=>p.includes(y)?p.filter(x=>x!==y):[...p,y]);

  const mv = useMemo(()=>ms.map((m,mi)=>{
    const e={name:m,ng:GN[GK[mi]]};
    sel.forEach(y=>{const r=all.find(d=>d.year===y&&d.mi===mi);if(r){e[`a${y}`]=r.ag;e[`g${y}`]=r.gaf;e[`r${y}`]=r.raw;e[`u${y}`]=r.guf;}});return e;
  }),[all,sel,ms]);

  const yt = useMemo(()=>[2021,2022,2023,2024,2025].map(y=>{
    const rows=all.filter(d=>d.year===y);
    return{name:`${y}`,ag:rows.reduce((s,r)=>s+r.ag,0),ng:GNT,guf:+(GNT/rows.reduce((s,r)=>s+r.ag,0)).toFixed(3),raw:+rows.reduce((s,r)=>s+r.raw,0).toFixed(0),gaf:+rows.reduce((s,r)=>s+r.gaf,0).toFixed(0)};
  }),[all]);

  return (
    <div className="space-y-5">
      <SectionHeader title={t("graddageTitle",lang)} description={t("graddageSub",lang)}>
        <SegmentedControl value={view} onChange={v=>v&&setView(v)} options={[
          {value:"monthly", label:t("monthly",lang)},
          {value:"yearly", label:t("yearlyTotal",lang)},
        ]} />
      </SectionHeader>

      <div className="flex flex-wrap items-center gap-1.5">
        <span className="text-xs text-slate-400 mr-1">{t("showYears",lang)}</span>
        {[2021,2022,2023,2024,2025].map(y=><YearPill key={y} year={y} active={sel.includes(y)} onClick={()=>toggle(y)}/>)}
      </div>

      {view==="yearly" && (
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
          {yt.filter(x=>sel.includes(+x.name)).map(x=>(
            <Metric key={x.name} label={`GAF ${x.name}`} value={x.gaf.toLocaleString(lang==="da"?"da-DK":"en-US")} unit="MWh"
              sub={`GUF: ${x.guf} | ${t("raw",lang)}: ${x.raw.toLocaleString(lang==="da"?"da-DK":"en-US")} MWh`} />
          ))}
        </div>
      )}

      <SectionCard title={view==="monthly"?t("gafMonthly",lang):t("gafYearly",lang)}>
        <ResponsiveContainer width="100%" height={320}>
          {view==="monthly"?(
            <BarChart data={mv} margin={{top:5,right:20,bottom:5,left:0}}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
              <XAxis dataKey="name" tick={{fontSize:11, fill:brand.muted}} axisLine={{stroke:brand.border}} tickLine={false} />
              <YAxis tick={{fontSize:11, fill:brand.muted}} unit=" MWh" axisLine={false} tickLine={false} />
              <Tooltip content={<BrandTooltip/>}/><Legend wrapperStyle={{fontSize:11}} iconType="circle" iconSize={8} />
              {sel.map(y=><Bar key={y} dataKey={`g${y}`} name={`GAF ${y}`} fill={yearColor[y]} radius={[3,3,0,0]}/>)}
            </BarChart>
          ):(
            <BarChart data={yt.filter(x=>sel.includes(+x.name))} margin={{top:5,right:20,bottom:5,left:0}}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
              <XAxis dataKey="name" tick={{fontSize:11, fill:brand.muted}} axisLine={{stroke:brand.border}} tickLine={false} />
              <YAxis tick={{fontSize:11, fill:brand.muted}} unit=" MWh" axisLine={false} tickLine={false} />
              <Tooltip content={<BrandTooltip/>}/><Legend wrapperStyle={{fontSize:11}} iconType="circle" iconSize={8} />
              <Bar dataKey="raw" name={t("rawCons",lang)} fill="#CBD5E1" radius={[3,3,0,0]}/>
              <Bar dataKey="gaf" name={t("gafAdj",lang)} fill={brand.blue} radius={[3,3,0,0]}/>
            </BarChart>
          )}
        </ResponsiveContainer>
      </SectionCard>

      <SectionCard title={t("ddVsNormal",lang)}>
        <ResponsiveContainer width="100%" height={240}>
          <ComposedChart data={mv} margin={{top:5,right:20,bottom:5,left:0}}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
            <XAxis dataKey="name" tick={{fontSize:11, fill:brand.muted}} axisLine={{stroke:brand.border}} tickLine={false} />
            <YAxis tick={{fontSize:11, fill:brand.muted}} axisLine={false} tickLine={false} />
            <Tooltip content={<BrandTooltip/>}/><Legend wrapperStyle={{fontSize:11}} iconType="circle" iconSize={8} />
            <Line type="monotone" dataKey="ng" stroke={brand.red} strokeWidth={1.5} strokeDasharray="6 4" dot={false} name={t("normalYear",lang)}/>
            {sel.map(y=><Line key={y} type="monotone" dataKey={`a${y}`} stroke={yearColor[y]} strokeWidth={1.5} dot={{r:2}} name={`${t("actual",lang)} ${y}`}/>)}
          </ComposedChart>
        </ResponsiveContainer>
      </SectionCard>

      <SectionCard title={t("ddTable",lang)} noPad>
        <DataTable
          headers={[
            t("month",lang), t("normalYear",lang),
            ...sel.flatMap(y => [`${t("degreeDays",lang)} ${y}`, "GUF", "GAF"]),
          ]}
          rows={mv.map((r,idx) => (
            <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
              <td className="px-4 py-2 text-sm font-medium" style={{color: brand.navy}}>{r.name}</td>
              <td className="px-4 py-2 text-sm text-right tabular-nums">{r.ng}</td>
              {sel.map(y => (
                <Fragment key={y}>
                  <td className="px-4 py-2 text-sm text-right tabular-nums border-l border-slate-100">{r[`a${y}`] || "–"}</td>
                  <td className="px-4 py-2 text-sm text-right tabular-nums font-medium" style={{color: brand.blue}}>{r[`u${y}`] || "–"}</td>
                  <td className="px-4 py-2 text-sm text-right tabular-nums font-medium">{r[`g${y}`]?.toFixed(0) || "–"}</td>
                </Fragment>
              ))}
            </tr>
          ))}
        />
      </SectionCard>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   Dashboard 3 – Legionella Compliance Monitor
   ═══════════════════════════════════════════════════════ */
function LegionellaDash() {
  const lang = useLang();
  const [building, setBuilding] = useState("all");
  const lData = useMemo(() => mkLegionella(building), [building]);

  const buildings = [
    { id: "all",    l: t("bldgAll", lang) },
    { id: "bldg-A", l: t("bldgA", lang) },
    { id: "bldg-B", l: t("bldgB", lang) },
    { id: "bldg-C", l: t("bldgC", lang) },
  ];

  const riskLevel = lData.currentTap >= 55 ? "low" : lData.currentTap >= 50 ? "medium" : "high";
  const riskColor = { low: brand.green, medium: brand.amber, high: brand.red }[riskLevel];
  const riskLabel = { low: t("riskLow", lang), medium: t("riskMedium", lang), high: t("riskHigh", lang) }[riskLevel];

  const GaugeBar = () => {
    const temp = lData.currentTap;
    const pct = Math.min(100, Math.max(0, ((temp - 20) / 50) * 100));
    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between text-[11px] text-slate-400">
          <span>20°C</span>
          <span className="font-medium text-slate-500">{t("tempGauge", lang)}</span>
          <span>70°C</span>
        </div>
        <div className="relative h-5 rounded-full overflow-hidden bg-slate-100">
          <div className="absolute h-full opacity-10" style={{ left: "10%", width: "40%", background: brand.red }} />
          <div className="absolute h-full w-px bg-red-400 z-10" style={{ left: "60%" }} />
          <div className="absolute h-full w-px z-10" style={{ left: "70%", background: brand.amber }} />
          <div className="absolute h-full rounded-full transition-all duration-500" style={{
            width: `${pct}%`,
            background: `linear-gradient(to right, ${brand.red}, ${brand.amber}, ${brand.green})`,
            opacity: 0.6,
          }} />
          <div className="absolute top-0 h-full w-0.5 bg-white z-20 shadow" style={{ left: `${pct}%` }}>
            <div className="absolute -top-5 left-1/2 -translate-x-1/2 text-[9px] font-bold whitespace-nowrap px-1.5 py-0.5 rounded" style={{ background: riskColor, color: "#fff" }}>
              {temp}°C
            </div>
          </div>
        </div>
        <div className="flex justify-between text-[10px] text-slate-400">
          <span style={{ marginLeft: "10%" }}>{t("dangerZone", lang)}</span>
          <span>50°C {lang === "da" ? "lovkrav" : "legal min"}</span>
          <span>55°C {lang === "da" ? "anbef." : "rec."}</span>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-5">
      <SectionHeader title={t("legionellaTitle",lang)} description={t("legionellaSub",lang)}>
        <Select value={building} onValueChange={setBuilding}>
          <SelectTrigger className="w-[220px] h-8 text-xs"><SelectValue /></SelectTrigger>
          <SelectContent>{buildings.map(b => <SelectItem key={b.id} value={b.id}>{b.l}</SelectItem>)}</SelectContent>
        </Select>
      </SectionHeader>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Metric label={t("currentTemp", lang)} value={lData.currentTap} unit="°C"
          sub={lData.currentTap >= 50 ? t("aboveLegal", lang) : t("belowLegal", lang)} status={lData.currentTap >= 50 ? "good" : "bad"} />
        <Metric label={t("minTemp24h", lang)} value={lData.minTap24h} unit="°C"
          sub={lData.minTap24h >= 50 ? t("compliant", lang) : t("nonCompliant", lang)} status={lData.minTap24h >= 50 ? "good" : "bad"} />
        <Metric label={t("daysSinceDisinf", lang)} value={6} unit={lang === "da" ? "dage" : "days"}
          sub={t("compliant", lang)} status="good" />
        <Card className="group">
          <CardContent className="p-4">
            <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wider mb-2">{t("riskLevel", lang)}</p>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full" style={{ background: riskColor }} />
              <span className="text-lg font-bold" style={{ color: riskColor }}>{riskLabel}</span>
            </div>
            <p className="text-xs mt-1.5 text-slate-400">{t("compliancePct", lang)}: {lData.compliancePct}%</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="p-5">
          <GaugeBar />
        </CardContent>
      </Card>

      <SectionCard title={t("hwTempTitle",lang)}>
        <ResponsiveContainer width="100%" height={280}>
          <ComposedChart data={lData.days} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
            <XAxis dataKey="name" tick={{ fontSize: 10, fill: brand.muted }} axisLine={{stroke:brand.border}} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: brand.muted }} unit="°C" domain={[35, 70]} axisLine={false} tickLine={false} />
            <Tooltip content={<BrandTooltip />} />
            <Legend wrapperStyle={{ fontSize: 11 }} iconType="circle" iconSize={8} />
            <ReferenceLine y={50} stroke={brand.red} strokeDasharray="6 4" strokeWidth={1.5} label={{ value: "50°C", fill: brand.red, fontSize: 10, position: "right" }} />
            <ReferenceLine y={55} stroke={brand.amber} strokeDasharray="4 4" strokeWidth={1} label={{ value: "55°C", fill: brand.amber, fontSize: 10, position: "right" }} />
            <Area type="monotone" dataKey="tank" fill={brand.blue} fillOpacity={0.04} stroke="none" />
            <Line type="monotone" dataKey="tank" stroke={brand.blue} strokeWidth={1.5} dot={false} name={t("tankTemp", lang)} />
            <Line type="monotone" dataKey="tap" stroke={brand.amber} strokeWidth={1.5} dot={{ r: 2 }} name={t("tapTemp", lang)} />
          </ComposedChart>
        </ResponsiveContainer>
      </SectionCard>

      <SectionCard title={t("disinfLog",lang)} noPad>
        <DataTable
          headers={[t("disinfDate", lang), t("disinfDuration", lang), t("disinfPeakTemp", lang), t("disinfResult", lang)]}
          rows={lData.disinfections.map((d, idx) => (
            <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
              <td className="px-4 py-2.5 text-sm font-medium" style={{ color: brand.navy }}>{d.date}</td>
              <td className="px-4 py-2.5 text-sm text-right tabular-nums">{d.duration} {t("minutes", lang)}</td>
              <td className={`px-4 py-2.5 text-sm text-right tabular-nums font-medium ${d.peakTemp >= 60 ? "text-emerald-600" : "text-red-500"}`}>{d.peakTemp}°C</td>
              <td className="px-4 py-2.5 text-right">
                <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium ${d.ok ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-600"}`}>
                  {d.ok ? t("disinfOk", lang) : t("disinfFail", lang)}
                </span>
              </td>
            </tr>
          ))}
        />
      </SectionCard>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   Dashboard 4 – Consumption Bar Charts
   ═══════════════════════════════════════════════════════ */
function BarDash() {
  const lang = useLang();
  const ml = ML[lang];
  const [res, setRes] = useState("h");
  const [cmp, setCmp] = useState(false);
  const [cmpM, setCmpM] = useState(1);
  const [vis, setVis] = useState([2023,2024,2025]);
  const data = useMemo(()=>mkBar(lang),[lang]);
  const tog = y => setVis(p=>p.includes(y)?p.filter(x=>x!==y):[...p,y]);

  const rLbl = {h:t("heat",lang),e:t("elec",lang),w:t("water",lang)}[res];
  const uLbl = {h:"MWh",e:"MWh",w:"m³"}[res];

  const cmpData = useMemo(()=>{
    if(!cmp) return null;
    return [2021,2022,2023,2024,2025].filter(y=>vis.includes(y)).map(y=>({name:`${y}`,value:data[cmpM]?.[`${res}${y}`]||0,fill:yearColor[y]}));
  },[cmp,cmpM,res,vis,data]);

  return (
    <div className="space-y-5">
      <SectionHeader title={t("barTitle",lang)} description={t("barSub",lang)}>
        <SegmentedControl value={res} onChange={v=>v&&setRes(v)} options={[
          {value:"h", label:t("heat",lang)},
          {value:"e", label:t("elec",lang)},
          {value:"w", label:t("water",lang)},
        ]} />
      </SectionHeader>

      <div className="flex flex-wrap items-center gap-1.5">
        <span className="text-xs text-slate-400 mr-1">{t("showYears",lang)}</span>
        {[2021,2022,2023,2024,2025].map(y=><YearPill key={y} year={y} active={vis.includes(y)} onClick={()=>tog(y)}/>)}
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

      <SectionCard title={cmp ? `${rLbl} – ${ml[cmpM]} (${t("compAcross",lang)})` : `${rLbl} – ${t("monthlyCons",lang)} (${uLbl})`}>
        <ResponsiveContainer width="100%" height={340}>
          {cmp?(
            <BarChart data={cmpData} margin={{top:5,right:20,bottom:5,left:0}}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
              <XAxis dataKey="name" tick={{fontSize:12, fill:brand.muted}} axisLine={{stroke:brand.border}} tickLine={false} />
              <YAxis tick={{fontSize:11, fill:brand.muted}} unit={` ${uLbl}`} axisLine={false} tickLine={false} />
              <Tooltip content={<BrandTooltip/>}/>
              <Bar dataKey="value" name={`${rLbl} (${uLbl})`} radius={[4,4,0,0]} barSize={48}>
                {cmpData?.map((d,idx)=><Cell key={idx} fill={d.fill}/>)}
              </Bar>
            </BarChart>
          ):(
            <BarChart data={data} margin={{top:5,right:20,bottom:5,left:0}}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
              <XAxis dataKey="name" tick={{fontSize:11, fill:brand.muted}} axisLine={{stroke:brand.border}} tickLine={false} />
              <YAxis tick={{fontSize:11, fill:brand.muted}} unit={` ${uLbl}`} axisLine={false} tickLine={false} />
              <Tooltip content={<BrandTooltip/>}/><Legend wrapperStyle={{fontSize:11}} iconType="circle" iconSize={8} />
              {vis.map(y=><Bar key={y} dataKey={`${res}${y}`} name={`${y}`} fill={yearColor[y]} radius={[3,3,0,0]}/>)}
            </BarChart>
          )}
        </ResponsiveContainer>
      </SectionCard>

      <SectionCard title={`${rLbl} – ${t("dataTable",lang)} (${uLbl})`} noPad>
        <DataTable
          headers={[t("month",lang), ...vis.map(y => `${y}`)]}
          rows={
            <>
              {data.map((r,idx) => (
                <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                  <td className="px-4 py-2 text-sm font-medium" style={{color: brand.navy}}>{r.name}</td>
                  {vis.map(y=><td key={y} className="px-4 py-2 text-sm text-right tabular-nums">{r[`${res}${y}`]?.toFixed(1)}</td>)}
                </tr>
              ))}
              <tr className="bg-slate-50 border-t border-slate-200 font-semibold">
                <td className="px-4 py-2.5 text-sm" style={{color: brand.navy}}>{t("total",lang)}</td>
                {vis.map(y=><td key={y} className="px-4 py-2.5 text-sm text-right tabular-nums" style={{color: brand.navy}}>{data.reduce((s,r)=>s+(r[`${res}${y}`]||0),0).toFixed(1)}</td>)}
              </tr>
            </>
          }
        />
      </SectionCard>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   App Shell — Attio/Notion-inspired header + tab system
   ═══════════════════════════════════════════════════════ */
export default function HomiiEnergyDashboard() {
  const [lang, setLang] = useState("da");

  return (
    <LangCtx.Provider value={lang}>
      <div className="min-h-screen flex flex-col" style={{fontFamily:"'Plus Jakarta Sans','Poppins',system-ui,sans-serif", background: brand.bg}}>
        <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Poppins:wght@400;500;600;700&display=swap" rel="stylesheet"/>

        {/* ─── Header ─── */}
        <header className="flex items-center justify-between px-6 h-12 shrink-0" style={{background: brand.navy}}>
          <div className="flex items-center gap-2">
            <HomiiIcon size={18} color={brand.blue}/>
            <span className="text-white text-sm font-bold tracking-tight">homii</span>
            <span className="text-[11px] ml-1.5 text-white/40 hidden sm:inline">| {t("energyDashboard",lang)}</span>
          </div>
          <div className="flex items-center gap-3">
            <EpcBadge rating="C" lang={lang} />
            <div className="w-px h-5 bg-white/10" />
            {/* Lang toggle — Notion-style segmented */}
            <div className="inline-flex rounded-md overflow-hidden bg-white/5">
              {["da","en"].map(l => (
                <button key={l} onClick={() => setLang(l)}
                  className={`px-2.5 py-1 text-[10px] font-semibold transition-all duration-200 ${
                    lang === l ? "bg-white/15 text-white" : "text-white/30 hover:text-white/50"
                  }`}>
                  {l.toUpperCase()}
                </button>
              ))}
            </div>
            <div className="w-px h-5 bg-white/10 hidden sm:block" />
            <span className="text-[10px] text-white/30 hidden sm:inline">{t("dept",lang)}</span>
            <div className="w-7 h-7 rounded-full flex items-center justify-center text-white text-[10px] font-bold" style={{background: brand.blue + "40", border: `1px solid ${brand.blue}50`}}>AB</div>
          </div>
        </header>

        {/* ─── Tab navigation ─── */}
        <Tabs defaultValue="cooling" className="flex-1 flex flex-col">
          <div className="bg-white border-b border-slate-200 px-6 shrink-0">
            <TabsList className="bg-transparent h-10 gap-0 p-0">
              {[
                { value: "cooling", label: t("tabCooling",lang), icon: Icon.cooling },
                { value: "graddage", label: t("tabGraddage",lang), icon: Icon.degreeDays },
                { value: "legionella", label: t("tabLegionella",lang), icon: Icon.legionella },
                { value: "consumption", label: t("tabConsumption",lang), icon: Icon.consumption },
              ].map(tab => (
                <TabsTrigger key={tab.value} value={tab.value}
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-[#3EB1C8] data-[state=active]:text-slate-900 data-[state=active]:shadow-none px-4 text-[13px] text-slate-400 hover:text-slate-600 transition-colors gap-1.5">
                  <span className="opacity-60">{tab.icon}</span>
                  {tab.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

          <main className="flex-1 max-w-[1120px] w-full mx-auto px-6 py-6">
            <TabsContent value="cooling"><CoolingDash/></TabsContent>
            <TabsContent value="graddage"><GraddageDash/></TabsContent>
            <TabsContent value="legionella"><LegionellaDash/></TabsContent>
            <TabsContent value="consumption"><BarDash/></TabsContent>
          </main>
        </Tabs>

        {/* ─── Footer ─── */}
        <footer className="flex items-center justify-between px-6 py-2.5 border-t border-slate-200 bg-white shrink-0">
          <div className="flex items-center gap-2">
            <HomiiIcon size={12} color={brand.muted}/>
            <span className="text-[10px] text-slate-400">{t("footerL",lang)}</span>
          </div>
          <span className="text-[10px] text-slate-300">{t("footerR",lang)}</span>
        </footer>
      </div>
    </LangCtx.Provider>
  );
}
