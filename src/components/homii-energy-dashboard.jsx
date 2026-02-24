import React, { useState, useMemo, Fragment, createContext, useContext } from "react";
import { BarChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine, Area, ComposedChart, Cell } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

/* ═══════════════════════════════════════════════════════
   Custom ToggleGroup (replaces @/components/ui/toggle-group)
   ═══════════════════════════════════════════════════════ */
function ToggleGroup({ type, value, onValueChange, className, children }) {
  return (
    <div className={`inline-flex items-center rounded-lg border border-slate-200 bg-white overflow-hidden ${className || ""}`}>
      {React.Children.map(children, child =>
        child ? React.cloneElement(child, { _selected: child.props.value === value, _onSelect: onValueChange }) : null
      )}
    </div>
  );
}
function ToggleGroupItem({ value, _selected, _onSelect, className, children }) {
  return (
    <button
      onClick={() => _onSelect?.(value)}
      className={`px-3 py-1.5 text-xs font-medium transition-all ${
        _selected
          ? "bg-slate-100 text-slate-900 font-semibold"
          : "text-slate-500 hover:text-slate-700 hover:bg-slate-50"
      } ${className || ""}`}
    >
      {children}
    </button>
  );
}

/* ═══════════════════════════════════════════════════════
   homii brand tokens
   ═══════════════════════════════════════════════════════ */
const brand = {
  navy: "#1F2A44",
  blue: "#3EB1C8",
  midBlue: "#3B8EA5",
  green: "#8ECDA0",
  red: "#E85D5D",
  amber: "#F5A623",
};

const yearColor = { 2021: "#94A3B8", 2022: "#64748B", 2023: "#3B8EA5", 2024: "#3EB1C8", 2025: "#1F2A44" };

/* ═══════════════════════════════════════════════════════
   HOFOR 2026 Tariff Constants
   ═══════════════════════════════════════════════════════ */
const HOFOR = {
  standard: { krav: 30, bonusAbove: 35, surchargeBelow: 25, label: "Standard" },
  vesterbro: { krav: 25, bonusAbove: 30, surchargeBelow: 20, label: "Vesterbro (lavtemp.)" },
  korrektionPct: 0.008, // 0.8% per degree
  energiprisPerMWh: 650, // DKK/MWh approximate HOFOR 2026
  effektbetalingPerM2: 42, // DKK/m²/year approximate
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
  totalCons:          { da: "Samlet Energiforbrug",        en: "Total Energy Consumption" },
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
  consCol:            { da: "Energiforbrug (MWh)",         en: "Energy Consumption (MWh)" },
  allMeters:          { da: "Alle målere (samlet)",        en: "All meters (aggregated)" },
  blockA:             { da: "Blok A – Måler 001",          en: "Block A – Meter 001" },
  blockB:             { da: "Blok B – Måler 002",          en: "Block B – Meter 002" },
  blockC:             { da: "Blok C – Måler 003",          en: "Block C – Meter 003" },
  blockD:             { da: "Blok D – Måler 004",          en: "Block D – Meter 004" },
  graddageTitle:      { da: "Graddage – GUF & GAF Benchmark", en: "Degree Days – GUF & GAF Benchmark" },
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
  // Tariff simulator
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
  // EPC
  epcLabel:           { da: "Energimærkning",              en: "Energy Label" },
  epcReq:             { da: "Krav: B inden 2030",          en: "Required: B by 2030" },
  epcMonths:          { da: "mdr. til frist",              en: "months to deadline" },
  // Legionella
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

const i = (k, lang) => dict[k]?.[lang] || dict[k]?.en || k;

const MS = { da: ["Jan","Feb","Mar","Apr","Maj","Jun","Jul","Aug","Sep","Okt","Nov","Dec"],
             en: ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"] };
const ML = { da: ["Januar","Februar","Marts","April","Maj","Juni","Juli","August","September","Oktober","November","December"],
             en: ["January","February","March","April","May","June","July","August","September","October","November","December"] };

/* ═══════════════════════════════════════════════════════
   Logo
   ═══════════════════════════════════════════════════════ */
const HomiiIcon = ({ size = 28, color = brand.blue }) => (
  <svg width={size} height={size * 1.2} viewBox="-1 -1 71.4 86.2" fill={color}>
    <path fillRule="evenodd" d="M69.43,26.46c0-2.87-1.43-5.54-3.82-7.13L39.46,1.92C36.58,0,32.85,0,29.97,1.92L3.82,19.33C1.43,20.93,0,23.59,0,26.46V79.03h.07v2.48a2.7,2.7,0,0,0,2.7,2.7H7.84a2.7,2.7,0,0,0,2.7-2.7V60.38c0-4.99,3.7-9.36,8.67-9.83,5.7-.54,10.51,3.96,10.51,9.55V71.17c0,7.2,5.84,13.04,13.04,13.04H62.04l7.39,0ZM40.19,71.17V60.55c0-10.65-8.12-19.79-18.75-20.47-3.96-.26-7.7.68-10.9,2.43V27.31l24.22-16.25L59.2,27.36V73.74H42.77a2.58,2.58,0,0,1-2.58-2.58Z"/>
  </svg>
);

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
  // 30-day temperature data
  const days = Array.from({ length: 30 }, (_, n) => {
    const day = 30 - n;
    const baseT = 56 + r(n) * 6; // tank: 56-62°C
    const tapDrop = 4 + r(n + 50) * 5; // tap is 4-9°C lower
    const dip = n === 12 || n === 22 ? -8 * r(n + 200) : 0; // occasional dips
    return {
      name: `D-${day}`,
      day,
      tank: +(baseT + dip).toFixed(1),
      tap: +(baseT - tapDrop + dip * 0.7).toFixed(1),
    };
  }).reverse();
  // Disinfection log
  const disinfections = [
    { date: "2026-02-18", duration: 45, peakTemp: 65.2, ok: true },
    { date: "2026-02-04", duration: 40, peakTemp: 62.8, ok: true },
    { date: "2026-01-21", duration: 35, peakTemp: 58.1, ok: false },
    { date: "2026-01-07", duration: 50, peakTemp: 66.4, ok: true },
    { date: "2025-12-23", duration: 42, peakTemp: 63.5, ok: true },
  ];
  const currentTank = days[days.length - 1].tank;
  const currentTap = days[days.length - 1].tap;
  const minTap24h = Math.min(...days.slice(-1).map(d => d.tap), ...days.slice(-3).map(d => d.tap));
  const complianceHours = days.filter(d => d.tap >= 50).length;
  return { days, disinfections, currentTank, currentTap, minTap24h, compliancePct: +((complianceHours / days.length) * 100).toFixed(0) };
}

/* ═══════════════════════════════════════════════════════
   Shared tiny components
   ═══════════════════════════════════════════════════════ */
const BrandTooltip = ({active,payload,label}) => {
  if (!active||!payload?.length) return null;
  return (
    <div className="rounded-lg px-3 py-2 shadow-lg text-xs" style={{background:brand.navy}}>
      <div className="font-semibold mb-1" style={{color:brand.blue}}>{label}</div>
      {payload.map((p,idx)=>(
        <div key={idx} className="flex items-center gap-2 text-white/90">
          <span className="w-2 h-2 rounded-full inline-block" style={{background:p.color}}/>
          <span className="opacity-70">{p.name}:</span>
          <span className="font-semibold">{typeof p.value==="number"?p.value.toFixed(1):p.value}</span>
        </div>
      ))}
    </div>
  );
};

const KpiCard = ({label,value,unit,trend,good}) => (
  <Card className="text-center">
    <CardContent className="pt-5 pb-4 px-4">
      <p className="text-[11px] uppercase tracking-widest text-muted-foreground mb-1">{label}</p>
      <p className="text-3xl font-extrabold" style={{color:brand.navy}}>{value}<span className="text-sm font-normal text-muted-foreground ml-1">{unit}</span></p>
      {trend && <p className={`text-xs mt-1 ${good===true?"text-emerald-600":good===false?"text-red-500":"text-muted-foreground"}`}>{trend}</p>}
    </CardContent>
  </Card>
);

const YearChip = ({year,active,onClick}) => (
  <Badge variant={active?"default":"outline"} className="cursor-pointer select-none transition-all text-xs px-3 py-1"
    style={active?{background:yearColor[year],borderColor:yearColor[year],color:"#fff"}:{borderColor:yearColor[year],color:yearColor[year]}}
    onClick={onClick}>{year}</Badge>
);

/* ═══════════════════════════════════════════════════════
   EPC Badge Component
   ═══════════════════════════════════════════════════════ */
const EPC_COLORS = { A: "#16A34A", B: "#22C55E", C: "#F5A623", D: "#F97316", E: "#EF4444", F: "#DC2626", G: "#991B1B" };

function EpcBadge({ rating = "C", lang }) {
  const monthsTo2030 = useMemo(() => {
    const now = new Date();
    const deadline = new Date(2030, 0, 1);
    return Math.max(0, Math.round((deadline - now) / (1000 * 60 * 60 * 24 * 30.44)));
  }, []);

  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-1.5 rounded-md px-2 py-1" style={{ background: "rgba(255,255,255,0.1)" }}>
        <div className="w-6 h-6 rounded flex items-center justify-center text-xs font-extrabold text-white" style={{ background: EPC_COLORS[rating] }}>
          {rating}
        </div>
        <div className="text-[10px] leading-tight">
          <div className="text-white/80 font-medium">{i("epcLabel", lang)}</div>
          <div className="text-white/50">{i("epcReq", lang)} · {monthsTo2030} {i("epcMonths", lang)}</div>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   Dashboard 1 – Cooling (Afkøling) + Tariff Simulator
   ═══════════════════════════════════════════════════════ */
function CoolingDash() {
  const lang = useLang();
  const [period,setPeriod] = useState("monthly");
  const [meter,setMeter] = useState("all");
  const [zone, setZone] = useState("standard");
  const [improveDeg, setImproveDeg] = useState(0);
  const data = useMemo(()=>mkCooling(period,meter,lang),[period,meter,lang]);

  const hoforZone = HOFOR[zone];
  const thr = hoforZone.krav;

  const avg = (k) => +(data.reduce((s,d)=>s+d[k],0)/data.length).toFixed(1);
  const avgC = avg("cooling"), avgR = avg("return"), totMWh = +data.reduce((s,d)=>s+d.mwh,0).toFixed(1);
  const ok = avgC >= thr;

  // Tariff calculation
  const annualMWh = period === "yearly" ? totMWh : totMWh * (period === "weekly" ? 1 : 1);
  const estimatedMWh = period === "monthly" ? totMWh : (period === "weekly" ? totMWh / 52 * 12 : totMWh);
  const energiCost = estimatedMWh * HOFOR.energiprisPerMWh;
  const effektCost = 8500 * HOFOR.effektbetalingPerM2; // 8500 m² typical social housing
  const deviation = avgC - thr;
  const deviationImproved = (avgC + improveDeg) - thr;
  const beyondNeutral = deviation > 5 ? deviation - 5 : deviation < -5 ? deviation + 5 : 0;
  const beyondNeutralImproved = deviationImproved > 5 ? deviationImproved - 5 : deviationImproved < -5 ? deviationImproved + 5 : 0;
  const korrektion = beyondNeutral * HOFOR.korrektionPct * energiCost;
  const korrektionImproved = beyondNeutralImproved * HOFOR.korrektionPct * energiCost;
  const totalCost = effektCost + energiCost - korrektion;
  const totalCostImproved = effektCost + energiCost - korrektionImproved;
  const saving = totalCost - totalCostImproved;

  const meters = [
    {id:"all",      l:i("allMeters",lang)},
    {id:"meter-001",l:i("blockA",lang)},
    {id:"meter-002",l:i("blockB",lang)},
    {id:"meter-003",l:i("blockC",lang)},
    {id:"meter-004",l:i("blockD",lang)},
  ];

  const fmtDKK = (v) => v.toLocaleString(lang==="da"?"da-DK":"en-US", { style: "currency", currency: "DKK", maximumFractionDigits: 0 });

  return (
    <div className="space-y-6">
      {/* Header row */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold" style={{color:brand.navy}}>{i("coolingTitle",lang)}</h2>
          <p className="text-sm text-muted-foreground mt-1 max-w-2xl">{i("coolingSub",lang)}</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Select value={meter} onValueChange={setMeter}>
            <SelectTrigger className="w-[220px]"><SelectValue/></SelectTrigger>
            <SelectContent>{meters.map(m=><SelectItem key={m.id} value={m.id}>{m.l}</SelectItem>)}</SelectContent>
          </Select>
          <ToggleGroup type="single" value={period} onValueChange={v=>v&&setPeriod(v)}>
            <ToggleGroupItem value="weekly">{i("weekly",lang)}</ToggleGroupItem>
            <ToggleGroupItem value="monthly">{i("monthly",lang)}</ToggleGroupItem>
            <ToggleGroupItem value="yearly">{i("yearly",lang)}</ToggleGroupItem>
          </ToggleGroup>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard label={i("avgCooling",lang)} value={avgC} unit="°C" trend={ok?`${i("aboveReq",lang)} (${thr}°C)`:`${i("belowReq",lang)} (${thr}°C)`} good={ok}/>
        <KpiCard label={i("avgReturn",lang)} value={avgR} unit="°C" trend={avgR<40?i("goodReturn",lang):i("canImprove",lang)} good={avgR<40}/>
        <KpiCard label={i("totalCons",lang)} value={totMWh} unit="MWh"/>
        <KpiCard label={i("status",lang)} value={ok?i("bonus",lang):i("surcharge",lang)} unit="" trend={ok?i("expectedBonus",lang):i("riskSurcharge",lang)} good={ok}/>
      </div>

      {/* HOFOR Tariff Simulator */}
      <Card className="border-2" style={{ borderColor: brand.blue + "40" }}>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-bold" style={{color:brand.navy}}>{i("tariffTitle",lang)}</CardTitle>
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">{i("zone",lang)}</span>
              <ToggleGroup type="single" value={zone} onValueChange={v=>v&&setZone(v)}>
                <ToggleGroupItem value="standard">Standard</ToggleGroupItem>
                <ToggleGroupItem value="vesterbro">Vesterbro</ToggleGroupItem>
              </ToggleGroup>
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-1">{i("tariffSub",lang)}</p>
          <p className="text-[11px] mt-1 font-medium" style={{ color: brand.amber }}>{i("thresholdChange",lang)}</p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left: cost breakdown */}
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">{i("effektbetaling",lang)} (8.500 m²)</span>
                <span className="font-semibold">{fmtDKK(effektCost)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">{i("energipris",lang)} ({estimatedMWh.toFixed(0)} MWh × {HOFOR.energiprisPerMWh} DKK)</span>
                <span className="font-semibold">{fmtDKK(energiCost)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">{i("afkKorrektion",lang)} ({beyondNeutral > 0 ? "+" : ""}{beyondNeutral.toFixed(1)}° × 0,8%)</span>
                <span className={`font-semibold ${korrektion > 0 ? "text-emerald-600" : korrektion < 0 ? "text-red-500" : ""}`}>
                  {korrektion > 0 ? "−" : korrektion < 0 ? "+" : ""}{fmtDKK(Math.abs(korrektion))}
                </span>
              </div>
              <div className="border-t pt-2 flex justify-between text-sm">
                <span className="font-bold" style={{ color: brand.navy }}>{i("totalCost",lang)}</span>
                <span className="font-extrabold text-lg" style={{ color: brand.navy }}>{fmtDKK(totalCost)}</span>
              </div>
            </div>
            {/* Right: what-if slider */}
            <div className="space-y-3 rounded-lg p-4" style={{ background: brand.navy + "08" }}>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium" style={{ color: brand.navy }}>{i("whatIf",lang)}</span>
                <span className="text-lg font-extrabold" style={{ color: brand.blue }}>+{improveDeg}°C</span>
              </div>
              <input
                type="range" min="0" max="10" step="1" value={improveDeg}
                onChange={e => setImproveDeg(+e.target.value)}
                className="w-full h-2 rounded-lg appearance-none cursor-pointer"
                style={{
                  background: `linear-gradient(to right, ${brand.blue} ${improveDeg * 10}%, #e2e8f0 ${improveDeg * 10}%)`,
                  accentColor: brand.blue,
                }}
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{i("currentCooling",lang)}: {avgC.toFixed(1)}°C</span>
                <span>{i("improvedCooling",lang)}: {(avgC + improveDeg).toFixed(1)}°C</span>
              </div>
              {improveDeg > 0 && (
                <div className="rounded-lg p-3 text-center" style={{ background: brand.green + "20" }}>
                  <p className="text-xs text-muted-foreground">{i("potentialSaving",lang)}</p>
                  <p className="text-2xl font-extrabold text-emerald-600">{fmtDKK(Math.max(0, saving))}</p>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Line chart */}
      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-sm font-bold" style={{color:brand.navy}}>{i("chartTitle",lang)}</CardTitle></CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={320}>
            <ComposedChart data={data} margin={{top:5,right:20,bottom:5,left:0}}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted"/>
              <XAxis dataKey="name" tick={{fontSize:11}} className="text-muted-foreground"/>
              <YAxis tick={{fontSize:11}} unit="°C"/>
              <Tooltip content={<BrandTooltip/>}/>
              <Legend wrapperStyle={{fontSize:12}}/>
              <ReferenceLine y={thr} stroke={brand.red} strokeDasharray="6 4" strokeWidth={2} label={{value:`${i("req",lang)}: ${thr}°C`,fill:brand.red,fontSize:11,position:"right"}}/>
              <Area type="monotone" dataKey="cooling" fill={brand.blue} fillOpacity={0.08} stroke="none" name={i("coolingArea",lang)}/>
              <Line type="monotone" dataKey="supply" stroke={brand.red} strokeWidth={2} dot={false} name={i("supplyLine",lang)}/>
              <Line type="monotone" dataKey="return" stroke={brand.amber} strokeWidth={2} dot={false} name={i("returnLine",lang)}/>
              <Line type="monotone" dataKey="cooling" stroke={brand.blue} strokeWidth={2.5} dot={{r:3,fill:brand.blue}} name={i("coolingLine",lang)}/>
            </ComposedChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Bar chart */}
      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-sm font-bold" style={{color:brand.navy}}>{i("energyCons",lang)}</CardTitle></CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={data} margin={{top:5,right:20,bottom:5,left:0}}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted"/>
              <XAxis dataKey="name" tick={{fontSize:11}}/>
              <YAxis tick={{fontSize:11}} unit=" MWh"/>
              <Tooltip content={<BrandTooltip/>}/>
              <Bar dataKey="mwh" name={i("consBar",lang)} radius={[4,4,0,0]}>
                {data.map((_,idx)=><Cell key={idx} fill={idx%2===0?brand.navy:brand.blue}/>)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Data table */}
      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-sm font-bold" style={{color:brand.navy}}>{i("coolingTable",lang)}</CardTitle></CardHeader>
        <CardContent className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{background:brand.navy}}>
                {[i("period",lang),i("supply",lang),i("returnT",lang),i("coolingC",lang),i("volume",lang),i("consCol",lang)].map(h=>(
                  <th key={h} className="text-white font-semibold text-xs px-3 py-2 text-left">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.map((r,idx)=>(
                <tr key={idx} className={idx%2===0?"bg-white":"bg-slate-50"}>
                  <td className="px-3 py-1.5 font-semibold" style={{color:brand.navy}}>{r.name}</td>
                  <td className="px-3 py-1.5">{r.supply}</td>
                  <td className={`px-3 py-1.5 ${r.return>42?"text-red-500":""}`}>{r.return}</td>
                  <td className={`px-3 py-1.5 font-semibold ${r.cooling>=thr?"text-emerald-600":"text-red-500"}`}>{r.cooling}</td>
                  <td className="px-3 py-1.5">{r.volume}</td>
                  <td className="px-3 py-1.5">{r.mwh}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   Dashboard 2 – Graddage (GUF & GAF)
   ═══════════════════════════════════════════════════════ */
function GraddageDash() {
  const lang = useLang();
  const ms = MS[lang];
  const [view,setView] = useState("monthly");
  const [sel,setSel] = useState([2023,2024,2025]);
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
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold" style={{color:brand.navy}}>{i("graddageTitle",lang)}</h2>
          <p className="text-sm text-muted-foreground mt-1 max-w-2xl">{i("graddageSub",lang)}</p>
        </div>
        <ToggleGroup type="single" value={view} onValueChange={v=>v&&setView(v)}>
          <ToggleGroupItem value="monthly">{i("monthly",lang)}</ToggleGroupItem>
          <ToggleGroupItem value="yearly">{i("yearlyTotal",lang)}</ToggleGroupItem>
        </ToggleGroup>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs text-muted-foreground mr-1">{i("showYears",lang)}</span>
        {[2021,2022,2023,2024,2025].map(y=><YearChip key={y} year={y} active={sel.includes(y)} onClick={()=>toggle(y)}/>)}
      </div>

      {view==="yearly" && (
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          {yt.filter(t=>sel.includes(+t.name)).map(t=>(
            <KpiCard key={t.name} label={`GAF ${t.name}`} value={t.gaf.toLocaleString(lang==="da"?"da-DK":"en-US")} unit="MWh"
              trend={`GUF: ${t.guf} | ${i("raw",lang)}: ${t.raw.toLocaleString(lang==="da"?"da-DK":"en-US")} MWh`}/>
          ))}
        </div>
      )}

      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-sm font-bold" style={{color:brand.navy}}>{view==="monthly"?i("gafMonthly",lang):i("gafYearly",lang)}</CardTitle></CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={340}>
            {view==="monthly"?(
              <BarChart data={mv} margin={{top:5,right:20,bottom:5,left:0}}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted"/>
                <XAxis dataKey="name" tick={{fontSize:11}}/><YAxis tick={{fontSize:11}} unit=" MWh"/>
                <Tooltip content={<BrandTooltip/>}/><Legend wrapperStyle={{fontSize:12}}/>
                {sel.map(y=><Bar key={y} dataKey={`g${y}`} name={`GAF ${y}`} fill={yearColor[y]} radius={[3,3,0,0]}/>)}
              </BarChart>
            ):(
              <BarChart data={yt.filter(t=>sel.includes(+t.name))} margin={{top:5,right:20,bottom:5,left:0}}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted"/>
                <XAxis dataKey="name" tick={{fontSize:11}}/><YAxis tick={{fontSize:11}} unit=" MWh"/>
                <Tooltip content={<BrandTooltip/>}/><Legend wrapperStyle={{fontSize:12}}/>
                <Bar dataKey="raw" name={i("rawCons",lang)} fill="#94A3B8" radius={[3,3,0,0]}/>
                <Bar dataKey="gaf" name={i("gafAdj",lang)} fill={brand.blue} radius={[3,3,0,0]}/>
              </BarChart>
            )}
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-sm font-bold" style={{color:brand.navy}}>{i("ddVsNormal",lang)}</CardTitle></CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={260}>
            <ComposedChart data={mv} margin={{top:5,right:20,bottom:5,left:0}}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted"/>
              <XAxis dataKey="name" tick={{fontSize:11}}/><YAxis tick={{fontSize:11}}/>
              <Tooltip content={<BrandTooltip/>}/><Legend wrapperStyle={{fontSize:12}}/>
              <Line type="monotone" dataKey="ng" stroke={brand.red} strokeWidth={2} strokeDasharray="6 4" dot={false} name={i("normalYear",lang)}/>
              {sel.map(y=><Line key={y} type="monotone" dataKey={`a${y}`} stroke={yearColor[y]} strokeWidth={2} dot={{r:2}} name={`${i("actual",lang)} ${y}`}/>)}
            </ComposedChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-sm font-bold" style={{color:brand.navy}}>{i("ddTable",lang)}</CardTitle></CardHeader>
        <CardContent className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{background:brand.navy}}>
                <th className="text-white text-xs font-semibold px-3 py-2 text-left">{i("month",lang)}</th>
                <th className="text-white text-xs font-semibold px-3 py-2 text-right">{i("normalYear",lang)}</th>
                {sel.map(y=><Fragment key={y}>
                  <th className="text-white text-xs font-semibold px-3 py-2 text-right border-l border-white/20">{i("degreeDays",lang)} {y}</th>
                  <th className="text-white text-xs font-semibold px-3 py-2 text-right">GUF</th>
                  <th className="text-white text-xs font-semibold px-3 py-2 text-right">GAF</th>
                </Fragment>)}
              </tr>
            </thead>
            <tbody>
              {mv.map((r,idx)=>(
                <tr key={idx} className={idx%2===0?"bg-white":"bg-slate-50"}>
                  <td className="px-3 py-1.5 font-semibold" style={{color:brand.navy}}>{r.name}</td>
                  <td className="px-3 py-1.5 text-right">{r.ng}</td>
                  {sel.map(y=><Fragment key={y}>
                    <td className="px-3 py-1.5 text-right border-l border-slate-200">{r[`a${y}`]||"–"}</td>
                    <td className="px-3 py-1.5 text-right font-semibold" style={{color:brand.blue}}>{r[`u${y}`]||"–"}</td>
                    <td className="px-3 py-1.5 text-right font-semibold">{r[`g${y}`]?.toFixed(0)||"–"}</td>
                  </Fragment>)}
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
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
    { id: "all",  l: i("bldgAll", lang) },
    { id: "bldg-A", l: i("bldgA", lang) },
    { id: "bldg-B", l: i("bldgB", lang) },
    { id: "bldg-C", l: i("bldgC", lang) },
  ];

  const riskLevel = lData.currentTap >= 55 ? "low" : lData.currentTap >= 50 ? "medium" : "high";
  const riskColor = { low: brand.green, medium: brand.amber, high: brand.red }[riskLevel];
  const riskLabel = { low: i("riskLow", lang), medium: i("riskMedium", lang), high: i("riskHigh", lang) }[riskLevel];

  // Temperature gauge segments
  const GaugeBar = () => {
    const temp = lData.currentTap;
    const pct = Math.min(100, Math.max(0, ((temp - 20) / 50) * 100));
    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>20°C</span>
          <span className="font-semibold" style={{ color: brand.navy }}>{i("tempGauge", lang)}</span>
          <span>70°C</span>
        </div>
        <div className="relative h-6 rounded-full overflow-hidden bg-slate-100">
          {/* Danger zone (25-45°C) */}
          <div className="absolute h-full opacity-15" style={{ left: "10%", width: "40%", background: brand.red }} />
          {/* Legal min marker (50°C) */}
          <div className="absolute h-full w-0.5 bg-red-500 z-10" style={{ left: "60%" }} />
          {/* Recommended marker (55°C) */}
          <div className="absolute h-full w-0.5 z-10" style={{ left: "70%", background: brand.amber }} />
          {/* Current temp fill */}
          <div className="absolute h-full rounded-full transition-all duration-500" style={{
            width: `${pct}%`,
            background: `linear-gradient(to right, ${brand.red}, ${brand.amber}, ${brand.green})`,
            opacity: 0.7,
          }} />
          {/* Current temp indicator */}
          <div className="absolute top-0 h-full w-1 bg-white z-20 shadow-md" style={{ left: `${pct}%` }}>
            <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] font-bold whitespace-nowrap px-1 rounded" style={{ background: riskColor, color: "#fff" }}>
              {temp}°C
            </div>
          </div>
        </div>
        <div className="flex justify-between text-[10px] text-muted-foreground">
          <span style={{ marginLeft: "10%" }}>{i("dangerZone", lang)}</span>
          <span style={{ marginLeft: "5%" }}>50°C {lang === "da" ? "lovkrav" : "legal min"}</span>
          <span>55°C {lang === "da" ? "anbef." : "rec."}</span>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold" style={{ color: brand.navy }}>{i("legionellaTitle", lang)}</h2>
          <p className="text-sm text-muted-foreground mt-1 max-w-2xl">{i("legionellaSub", lang)}</p>
        </div>
        <Select value={building} onValueChange={setBuilding}>
          <SelectTrigger className="w-[240px]"><SelectValue /></SelectTrigger>
          <SelectContent>{buildings.map(b => <SelectItem key={b.id} value={b.id}>{b.l}</SelectItem>)}</SelectContent>
        </Select>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard label={i("currentTemp", lang)} value={lData.currentTap} unit="°C"
          trend={lData.currentTap >= 50 ? i("aboveLegal", lang) : i("belowLegal", lang)} good={lData.currentTap >= 50} />
        <KpiCard label={i("minTemp24h", lang)} value={lData.minTap24h} unit="°C"
          trend={lData.minTap24h >= 50 ? i("compliant", lang) : i("nonCompliant", lang)} good={lData.minTap24h >= 50} />
        <KpiCard label={i("daysSinceDisinf", lang)} value={6} unit={lang === "da" ? "dage" : "days"}
          trend={6 <= 14 ? i("compliant", lang) : i("canImprove", lang)} good={6 <= 14} />
        <Card className="text-center">
          <CardContent className="pt-5 pb-4 px-4">
            <p className="text-[11px] uppercase tracking-widest text-muted-foreground mb-1">{i("riskLevel", lang)}</p>
            <div className="flex items-center justify-center gap-2">
              <div className="w-3 h-3 rounded-full" style={{ background: riskColor }} />
              <p className="text-xl font-extrabold" style={{ color: riskColor }}>{riskLabel}</p>
            </div>
            <p className="text-xs mt-1 text-muted-foreground">{i("compliancePct", lang)}: {lData.compliancePct}%</p>
          </CardContent>
        </Card>
      </div>

      {/* Temperature Gauge */}
      <Card>
        <CardContent className="pt-5 pb-4">
          <GaugeBar />
        </CardContent>
      </Card>

      {/* Temperature Timeline */}
      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-sm font-bold" style={{ color: brand.navy }}>{i("hwTempTitle", lang)}</CardTitle></CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <ComposedChart data={lData.days} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis dataKey="name" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 11 }} unit="°C" domain={[35, 70]} />
              <Tooltip content={<BrandTooltip />} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <ReferenceLine y={50} stroke={brand.red} strokeDasharray="6 4" strokeWidth={2} label={{ value: "50°C", fill: brand.red, fontSize: 10, position: "right" }} />
              <ReferenceLine y={55} stroke={brand.amber} strokeDasharray="4 4" strokeWidth={1.5} label={{ value: "55°C", fill: brand.amber, fontSize: 10, position: "right" }} />
              <Area type="monotone" dataKey="tank" fill={brand.blue} fillOpacity={0.06} stroke="none" />
              <Line type="monotone" dataKey="tank" stroke={brand.blue} strokeWidth={2} dot={false} name={i("tankTemp", lang)} />
              <Line type="monotone" dataKey="tap" stroke={brand.amber} strokeWidth={2} dot={{ r: 2 }} name={i("tapTemp", lang)} />
            </ComposedChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Disinfection Log */}
      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-sm font-bold" style={{ color: brand.navy }}>{i("disinfLog", lang)}</CardTitle></CardHeader>
        <CardContent className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ background: brand.navy }}>
                {[i("disinfDate", lang), i("disinfDuration", lang), i("disinfPeakTemp", lang), i("disinfResult", lang)].map(h => (
                  <th key={h} className="text-white font-semibold text-xs px-3 py-2 text-left">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {lData.disinfections.map((d, idx) => (
                <tr key={idx} className={idx % 2 === 0 ? "bg-white" : "bg-slate-50"}>
                  <td className="px-3 py-1.5 font-semibold" style={{ color: brand.navy }}>{d.date}</td>
                  <td className="px-3 py-1.5">{d.duration} {i("minutes", lang)}</td>
                  <td className={`px-3 py-1.5 font-semibold ${d.peakTemp >= 60 ? "text-emerald-600" : "text-red-500"}`}>{d.peakTemp}°C</td>
                  <td className="px-3 py-1.5">
                    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${d.ok ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"}`}>
                      {d.ok ? i("disinfOk", lang) : i("disinfFail", lang)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   Dashboard 4 – Bar Charts (Forbrug)
   ═══════════════════════════════════════════════════════ */
function BarDash() {
  const lang = useLang();
  const ml = ML[lang];
  const [res,setRes] = useState("h");
  const [cmp,setCmp] = useState(false);
  const [cmpM,setCmpM] = useState(1);
  const [vis,setVis] = useState([2023,2024,2025]);
  const data = useMemo(()=>mkBar(lang),[lang]);
  const tog = y => setVis(p=>p.includes(y)?p.filter(x=>x!==y):[...p,y]);

  const rLbl = {h:i("heat",lang),e:i("elec",lang),w:i("water",lang)}[res];
  const uLbl = {h:"MWh",e:"MWh",w:"m³"}[res];

  const cmpData = useMemo(()=>{
    if(!cmp) return null;
    return [2021,2022,2023,2024,2025].filter(y=>vis.includes(y)).map(y=>({name:`${y}`,value:data[cmpM]?.[`${res}${y}`]||0,fill:yearColor[y]}));
  },[cmp,cmpM,res,vis,data]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold" style={{color:brand.navy}}>{i("barTitle",lang)}</h2>
          <p className="text-sm text-muted-foreground mt-1 max-w-2xl">{i("barSub",lang)}</p>
        </div>
        <ToggleGroup type="single" value={res} onValueChange={v=>v&&setRes(v)}>
          <ToggleGroupItem value="h">{i("heat",lang)}</ToggleGroupItem>
          <ToggleGroupItem value="e">{i("elec",lang)}</ToggleGroupItem>
          <ToggleGroupItem value="w">{i("water",lang)}</ToggleGroupItem>
        </ToggleGroup>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs text-muted-foreground mr-1">{i("showYears",lang)}</span>
        {[2021,2022,2023,2024,2025].map(y=><YearChip key={y} year={y} active={vis.includes(y)} onClick={()=>tog(y)}/>)}
        <span className="w-px h-5 bg-slate-300 mx-2"/>
        <Button variant="outline" size="sm" className="text-xs h-7" onClick={()=>setCmp(!cmp)}>
          {cmp?i("showAll",lang):i("compareOne",lang)}
        </Button>
        {cmp && (
          <Select value={`${cmpM}`} onValueChange={v=>setCmpM(parseInt(v))}>
            <SelectTrigger className="w-[140px] h-7 text-xs"><SelectValue/></SelectTrigger>
            <SelectContent>{ml.map((m,idx)=><SelectItem key={idx} value={`${idx}`}>{m}</SelectItem>)}</SelectContent>
          </Select>
        )}
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-bold" style={{color:brand.navy}}>
            {cmp?`${rLbl} – ${ml[cmpM]} (${i("compAcross",lang)})`:`${rLbl} – ${i("monthlyCons",lang)} (${uLbl})`}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={360}>
            {cmp?(
              <BarChart data={cmpData} margin={{top:5,right:20,bottom:5,left:0}}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted"/>
                <XAxis dataKey="name" tick={{fontSize:12}}/><YAxis tick={{fontSize:11}} unit={` ${uLbl}`}/>
                <Tooltip content={<BrandTooltip/>}/>
                <Bar dataKey="value" name={`${rLbl} (${uLbl})`} radius={[6,6,0,0]} barSize={56}>
                  {cmpData?.map((d,idx)=><Cell key={idx} fill={d.fill}/>)}
                </Bar>
              </BarChart>
            ):(
              <BarChart data={data} margin={{top:5,right:20,bottom:5,left:0}}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted"/>
                <XAxis dataKey="name" tick={{fontSize:11}}/><YAxis tick={{fontSize:11}} unit={` ${uLbl}`}/>
                <Tooltip content={<BrandTooltip/>}/><Legend wrapperStyle={{fontSize:12}}/>
                {vis.map(y=><Bar key={y} dataKey={`${res}${y}`} name={`${y}`} fill={yearColor[y]} radius={[3,3,0,0]}/>)}
              </BarChart>
            )}
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-sm font-bold" style={{color:brand.navy}}>{rLbl} – {i("dataTable",lang)} ({uLbl})</CardTitle></CardHeader>
        <CardContent className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{background:brand.navy}}>
                <th className="text-white text-xs font-semibold px-3 py-2 text-left">{i("month",lang)}</th>
                {vis.map(y=><th key={y} className="text-white text-xs font-semibold px-3 py-2 text-right">{y}</th>)}
              </tr>
            </thead>
            <tbody>
              {data.map((r,idx)=>(
                <tr key={idx} className={idx%2===0?"bg-white":"bg-slate-50"}>
                  <td className="px-3 py-1.5 font-semibold" style={{color:brand.navy}}>{r.name}</td>
                  {vis.map(y=><td key={y} className="px-3 py-1.5 text-right">{r[`${res}${y}`]?.toFixed(1)}</td>)}
                </tr>
              ))}
              <tr style={{background:brand.navy}}>
                <td className="px-3 py-2 text-white font-bold">{i("total",lang)}</td>
                {vis.map(y=><td key={y} className="px-3 py-2 text-white font-bold text-right">{data.reduce((s,r)=>s+(r[`${res}${y}`]||0),0).toFixed(1)}</td>)}
              </tr>
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   App Shell
   ═══════════════════════════════════════════════════════ */
export default function HomiiEnergyDashboard() {
  const [lang,setLang] = useState("da");

  return (
    <LangCtx.Provider value={lang}>
      <div className="min-h-screen bg-slate-50" style={{fontFamily:"'Plus Jakarta Sans','Poppins',system-ui,sans-serif"}}>
        <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Poppins:wght@400;500;600;700&display=swap" rel="stylesheet"/>

        {/* ─── Header ─── */}
        <header className="flex items-center justify-between px-8 h-14" style={{background:brand.navy}}>
          <div className="flex items-center gap-2.5">
            <HomiiIcon size={22} color={brand.blue}/>
            <span className="text-white text-lg font-extrabold tracking-tight">homii</span>
            <span className="text-sm ml-2 opacity-80" style={{color:brand.blue}}>| {i("energyDashboard",lang)}</span>
          </div>
          <div className="flex items-center gap-4">
            <EpcBadge rating="C" lang={lang} />
            {/* Lang toggle */}
            <div className="inline-flex rounded-md overflow-hidden border" style={{borderColor:brand.midBlue}}>
              {["da","en"].map(l=>(
                <button key={l} onClick={()=>setLang(l)} className="px-3 py-1 text-xs font-medium transition-all"
                  style={{background:lang===l?brand.blue:"transparent",color:lang===l?"#fff":"#94A3B8"}}>
                  {l.toUpperCase()}
                </button>
              ))}
            </div>
            <span className="text-xs text-slate-400 hidden sm:inline">{i("dept",lang)}</span>
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold" style={{background:brand.blue}}>AB</div>
          </div>
        </header>

        {/* ─── Tab navigation + content ─── */}
        <Tabs defaultValue="cooling" className="w-full">
          <div className="bg-white border-b px-8">
            <TabsList className="bg-transparent h-12 gap-0 p-0">
              <TabsTrigger value="cooling" className="rounded-none border-b-2 border-transparent data-[state=active]:border-[#3EB1C8] data-[state=active]:shadow-none px-5 text-sm">
                <span className="mr-1.5">&#10052;&#65039;</span>{i("tabCooling",lang)}
              </TabsTrigger>
              <TabsTrigger value="graddage" className="rounded-none border-b-2 border-transparent data-[state=active]:border-[#3EB1C8] data-[state=active]:shadow-none px-5 text-sm">
                <span className="mr-1.5">&#128202;</span>{i("tabGraddage",lang)}
              </TabsTrigger>
              <TabsTrigger value="legionella" className="rounded-none border-b-2 border-transparent data-[state=active]:border-[#3EB1C8] data-[state=active]:shadow-none px-5 text-sm">
                <span className="mr-1.5">&#129440;</span>{i("tabLegionella",lang)}
              </TabsTrigger>
              <TabsTrigger value="consumption" className="rounded-none border-b-2 border-transparent data-[state=active]:border-[#3EB1C8] data-[state=active]:shadow-none px-5 text-sm">
                <span className="mr-1.5">&#128200;</span>{i("tabConsumption",lang)}
              </TabsTrigger>
            </TabsList>
          </div>

          <main className="max-w-6xl mx-auto px-8 py-7">
            <TabsContent value="cooling"><CoolingDash/></TabsContent>
            <TabsContent value="graddage"><GraddageDash/></TabsContent>
            <TabsContent value="legionella"><LegionellaDash/></TabsContent>
            <TabsContent value="consumption"><BarDash/></TabsContent>
          </main>
        </Tabs>

        {/* ─── Footer ─── */}
        <footer className="flex items-center justify-between px-8 py-3" style={{background:brand.navy}}>
          <div className="flex items-center gap-2">
            <HomiiIcon size={14} color={brand.blue}/>
            <span className="text-[11px] text-slate-400">{i("footerL",lang)}</span>
          </div>
          <span className="text-[11px] text-slate-500">{i("footerR",lang)}</span>
        </footer>
      </div>
    </LangCtx.Provider>
  );
}
