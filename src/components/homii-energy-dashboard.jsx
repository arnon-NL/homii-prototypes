import React, { useState, useMemo, Fragment, createContext, useContext } from "react";
import { BarChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine, Area, ComposedChart, Cell } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

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
   i18n
   ═══════════════════════════════════════════════════════ */
const LangCtx = createContext("da");
const useLang = () => useContext(LangCtx);

const dict = {
  energyDashboard:    { da: "Energi Dashboard",           en: "Energy Dashboard" },
  dept:               { da: "Afdeling: KAB Ørestad",      en: "Department: KAB Ørestad" },
  tabCooling:         { da: "Afkøling",                   en: "Cooling" },
  tabGraddage:        { da: "Graddage",                   en: "Degree Days" },
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
  coolingSub:         { da: "Overvåg afkøling per måler eller samlet. Afkøling = MWh/m³ × 860. Gode værdier reducerer motivationstariffen.",
                        en: "Monitor cooling per meter or aggregated. Cooling = MWh/m³ × 860. Good values reduce the motivational tariff." },
  avgCooling:         { da: "Gns. Afkøling",              en: "Avg. Cooling" },
  avgReturn:          { da: "Gns. Returtemp.",             en: "Avg. Return Temp." },
  totalCons:          { da: "Samlet Forbrug",              en: "Total Consumption" },
  status:             { da: "Status",                      en: "Status" },
  aboveReq:           { da: "Over krav",                   en: "Above requirement" },
  belowReq:           { da: "Under krav",                  en: "Below requirement" },
  goodReturn:         { da: "God retur",                   en: "Good return" },
  canImprove:         { da: "Kan forbedres",               en: "Can be improved" },
  bonus:              { da: "Bonus",                       en: "Bonus" },
  surcharge:          { da: "Merudg.",                     en: "Surcharge" },
  expectedBonus:      { da: "Forventet bonus",             en: "Expected bonus" },
  riskSurcharge:      { da: "Risiko for tillæg",           en: "Risk of surcharge" },
  chartTitle:         { da: "Fremløb, Retur & Afkøling",  en: "Supply, Return & Cooling" },
  req:                { da: "Krav",                        en: "Req." },
  supplyLine:         { da: "Fremløb (°C)",                en: "Supply (°C)" },
  returnLine:         { da: "Retur (°C)",                  en: "Return (°C)" },
  coolingLine:        { da: "Afkøling (°C)",               en: "Cooling (°C)" },
  coolingArea:        { da: "Afkøling (område)",           en: "Cooling (area)" },
  energyCons:         { da: "Energiforbrug (MWh)",         en: "Energy Consumption (MWh)" },
  consBar:            { da: "Forbrug (MWh)",               en: "Consumption (MWh)" },
  coolingTable:       { da: "Afkølingsdata",               en: "Cooling Data" },
  period:             { da: "Periode",                     en: "Period" },
  supply:             { da: "Fremløb (°C)",                en: "Supply (°C)" },
  returnT:            { da: "Retur (°C)",                  en: "Return (°C)" },
  coolingC:           { da: "Afkøling (°C)",               en: "Cooling (°C)" },
  volume:             { da: "Volumen (m³)",                en: "Volume (m³)" },
  consCol:            { da: "Forbrug (MWh)",               en: "Consumption (MWh)" },
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
  footerR:            { da: "Data: Simuleret demo-data | © 2025 homii",
                        en: "Data: Simulated demo data | © 2025 homii" },
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
   Mock data
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
   Dashboard 1 – Cooling
   ═══════════════════════════════════════════════════════ */
function CoolingDash() {
  const lang = useLang();
  const [period,setPeriod] = useState("monthly");
  const [meter,setMeter] = useState("all");
  const data = useMemo(()=>mkCooling(period,meter,lang),[period,meter,lang]);

  const avg = (k) => +(data.reduce((s,d)=>s+d[k],0)/data.length).toFixed(1);
  const avgC = avg("cooling"), avgR = avg("return"), totMWh = data.reduce((s,d)=>s+d.mwh,0).toFixed(1);
  const thr = 29, ok = avgC >= thr;

  const meters = [
    {id:"all",      l:i("allMeters",lang)},
    {id:"meter-001",l:i("blockA",lang)},
    {id:"meter-002",l:i("blockB",lang)},
    {id:"meter-003",l:i("blockC",lang)},
    {id:"meter-004",l:i("blockD",lang)},
  ];

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

      {/* GAF bar chart */}
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

      {/* Degree-day line chart */}
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

      {/* Table */}
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
   Dashboard 3 – Bar Charts
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

      {/* Chart */}
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

      {/* Table */}
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
              <TabsTrigger value="consumption" className="rounded-none border-b-2 border-transparent data-[state=active]:border-[#3EB1C8] data-[state=active]:shadow-none px-5 text-sm">
                <span className="mr-1.5">&#128200;</span>{i("tabConsumption",lang)}
              </TabsTrigger>
            </TabsList>
          </div>

          <main className="max-w-6xl mx-auto px-8 py-7">
            <TabsContent value="cooling"><CoolingDash/></TabsContent>
            <TabsContent value="graddage"><GraddageDash/></TabsContent>
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
