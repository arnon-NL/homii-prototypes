/* ═══════════════════════════════════════════════════════
   Mock data — Object-oriented model (v2)
   Core objects: Building, Meter, Supplier, Utility, Report
   ═══════════════════════════════════════════════════════ */

/* ─── Utilities (system-defined enum) ─── */
export const utilities = [
  { id: "fjernvarme", unit: "MWh", secondaryUnit: "m³" },
  { id: "vand",       unit: "m³",  secondaryUnit: null },
  { id: "el",         unit: "MWh", secondaryUnit: null },
];

/* ─── Suppliers ─── */
export const suppliers = [
  {
    id: "hofor",
    name: "HOFOR",
    contact: "kundeservice@hofor.dk",
    phone: "+45 33 95 33 95",
    utilityTypes: ["fjernvarme", "vand"],
    contractPeriod: { start: "2024-01-01", end: "2026-12-31" },
    status: "active",
    activeTariffs: ["Motivationstarif 2026", "Vandafgift 2026"],
    address: "Ørestads Boulevard 35, 2300 København S",
  },
  {
    id: "orsted",
    name: "Ørsted",
    contact: "erhverv@orsted.dk",
    phone: "+45 99 55 11 11",
    utilityTypes: ["el"],
    contractPeriod: { start: "2024-07-01", end: "2027-06-30" },
    status: "active",
    activeTariffs: ["Erhvervstarif C"],
    address: "Nesa Allé 1, 2820 Gentofte",
  },
  {
    id: "trefor",
    name: "Trefor",
    contact: "support@trefor.dk",
    phone: "+45 76 22 22 22",
    utilityTypes: ["el", "vand"],
    contractPeriod: { start: "2025-01-01", end: "2027-12-31" },
    status: "active",
    activeTariffs: ["Flexel 2026"],
    address: "Kokbjerg 30, 6000 Kolding",
  },
];

/* ─── Meters (first-class objects) ─── */
/* dataSource: where data is fetched from (Eloverblik, Kamstrup READy, etc.)
   hasTemperatureData: whether DH meter reports supply/return temps (not all do)
   statusDetail: diagnostic context for offline/error states */
export const meters = [
  // KAB Ørestad
  { id: "KAM-DH-001", type: "fjernvarme", unit: "MWh", secondaryUnit: "m³", buildingId: "kab-orestad", supplierId: "hofor", status: "active", serialNumber: "KAM-2019-44012", installDate: "2019-03-15", readingFrequency: "hourly", dataQuality: "high", dataSource: "kamstrup-ready", hasTemperatureData: true, statusDetail: null, lastReading: { value: 287.4, unit: "MWh", date: "2026-02-24", receivedDate: "2026-02-24" } },
  { id: "KAM-WA-012", type: "vand", unit: "m³", secondaryUnit: null, buildingId: "kab-orestad", supplierId: "hofor", status: "active", serialNumber: "KAM-2019-44013", installDate: "2019-03-15", readingFrequency: "daily", dataQuality: "high", dataSource: "kamstrup-ready", hasTemperatureData: false, statusDetail: null, lastReading: { value: 2845, unit: "m³", date: "2026-02-24", receivedDate: "2026-02-24" } },
  { id: "KAM-EL-034", type: "el", unit: "MWh", secondaryUnit: null, buildingId: "kab-orestad", supplierId: "orsted", status: "active", serialNumber: "KAM-2020-55034", installDate: "2020-06-01", readingFrequency: "hourly", dataQuality: "high", dataSource: "eloverblik", hasTemperatureData: false, statusDetail: null, lastReading: { value: 62.3, unit: "MWh", date: "2026-02-23", receivedDate: "2026-02-24" } },
  // AB Søndergaard
  { id: "KAM-DH-045", type: "fjernvarme", unit: "MWh", secondaryUnit: "m³", buildingId: "ab-soendergaard", supplierId: "hofor", status: "active", serialNumber: "KAM-2021-66045", installDate: "2021-01-10", readingFrequency: "hourly", dataQuality: "high", dataSource: "kamstrup-ready", hasTemperatureData: true, statusDetail: null, lastReading: { value: 154.8, unit: "MWh", date: "2026-02-23", receivedDate: "2026-02-23" } },
  { id: "KAM-WA-046", type: "vand", unit: "m³", secondaryUnit: null, buildingId: "ab-soendergaard", supplierId: "hofor", status: "offline", serialNumber: "KAM-2021-66046", installDate: "2021-01-10", readingFrequency: "daily", dataQuality: "low", dataSource: "kamstrup-ready", hasTemperatureData: false, statusDetail: { da: "Intet signal i 14 dage — seneste gateway-ping 10. feb", en: "No signal for 14 days — last gateway ping Feb 10" }, lastReading: { value: 1203, unit: "m³", date: "2026-02-10", receivedDate: "2026-02-10" } },
  // FSB Tingbjerg
  { id: "KAM-DH-089", type: "fjernvarme", unit: "MWh", secondaryUnit: "m³", buildingId: "fsb-tingbjerg", supplierId: "hofor", status: "active", serialNumber: "KAM-2018-33089", installDate: "2018-09-01", readingFrequency: "hourly", dataQuality: "medium", dataSource: "kamstrup-ready", hasTemperatureData: false, statusDetail: { da: "Ældre måler — kun energi + volumen, ingen temperaturdata", en: "Legacy meter — energy + volume only, no temperature data" }, lastReading: { value: 482.1, unit: "MWh", date: "2026-02-24", receivedDate: "2026-02-24" } },
  { id: "KAM-WA-090", type: "vand", unit: "m³", secondaryUnit: null, buildingId: "fsb-tingbjerg", supplierId: "hofor", status: "active", serialNumber: "KAM-2018-33090", installDate: "2018-09-01", readingFrequency: "daily", dataQuality: "high", dataSource: "kamstrup-ready", hasTemperatureData: false, statusDetail: null, lastReading: { value: 5120, unit: "m³", date: "2026-02-24", receivedDate: "2026-02-24" } },
  { id: "KAM-EL-091", type: "el", unit: "MWh", secondaryUnit: null, buildingId: "fsb-tingbjerg", supplierId: "orsted", status: "error", serialNumber: "KAM-2018-33091", installDate: "2018-09-01", readingFrequency: "hourly", dataQuality: "low", dataSource: "eloverblik", hasTemperatureData: false, statusDetail: { da: "Checksumfejl på seneste 3 aflæsninger — afventer genvalidering", en: "Checksum error on last 3 readings — awaiting revalidation" }, lastReading: { value: 98.7, unit: "MWh", date: "2026-02-15", receivedDate: "2026-02-16" } },
  // AAB Amager Strand
  { id: "KAM-DH-112", type: "fjernvarme", unit: "MWh", secondaryUnit: "m³", buildingId: "aab-amager", supplierId: "hofor", status: "active", serialNumber: "KAM-2022-77112", installDate: "2022-04-20", readingFrequency: "hourly", dataQuality: "high", dataSource: "kamstrup-ready", hasTemperatureData: true, statusDetail: null, lastReading: { value: 198.5, unit: "MWh", date: "2026-02-24", receivedDate: "2026-02-24" } },
  { id: "KAM-WA-113", type: "vand", unit: "m³", secondaryUnit: null, buildingId: "aab-amager", supplierId: "hofor", status: "active", serialNumber: "KAM-2022-77113", installDate: "2022-04-20", readingFrequency: "daily", dataQuality: "high", dataSource: "kamstrup-ready", hasTemperatureData: false, statusDetail: null, lastReading: { value: 3210, unit: "m³", date: "2026-02-24", receivedDate: "2026-02-24" } },
  { id: "KAM-EL-114", type: "el", unit: "MWh", secondaryUnit: null, buildingId: "aab-amager", supplierId: "orsted", status: "active", serialNumber: "KAM-2022-77114", installDate: "2022-04-20", readingFrequency: "hourly", dataQuality: "high", dataSource: "eloverblik", hasTemperatureData: false, statusDetail: null, lastReading: { value: 45.2, unit: "MWh", date: "2026-02-23", receivedDate: "2026-02-24" } },
];

/* ─── Buildings ─── */
export const buildings = [
  {
    id: "kab-orestad",
    name: "KAB Ørestad",
    address: "Ørestads Boulevard 42, 2300 København S",
    postalCode: "2300",
    municipality: "København",
    yearBuilt: 2008,
    buildingType: "Etagebolig",
    epc: "C",
    epcCertifiedDate: "2020-03-15",
    epcExpiresDate: "2030-03-15",
    units: 148,
    area: 8500,
    owner: "Boligforeningen Ørestad",
    administrator: "KAB",
    status: "active",
    homiiOnboarded: "2024-01-01",
    homiiStatus: "Aktiv",
    bbrLastUpdated: "2025-11-02",
  },
  {
    id: "ab-soendergaard",
    name: "AB Søndergaard",
    address: "Søndergade 17, 2500 Valby",
    postalCode: "2500",
    municipality: "København",
    yearBuilt: 1962,
    buildingType: "Etagebolig",
    epc: "D",
    epcCertifiedDate: "2018-06-22",
    epcExpiresDate: "2028-06-22",
    units: 64,
    area: 3800,
    owner: "AB Søndergaard",
    administrator: "KAB",
    status: "active",
    homiiOnboarded: "2024-06-01",
    homiiStatus: "Aktiv",
    bbrLastUpdated: "2025-09-18",
  },
  {
    id: "fsb-tingbjerg",
    name: "FSB Tingbjerg",
    address: "Tingbjerg Allé 8, 2700 Brønshøj",
    postalCode: "2700",
    municipality: "København",
    yearBuilt: 1955,
    buildingType: "Etagebolig",
    epc: "E",
    epcCertifiedDate: "2016-01-10",
    epcExpiresDate: "2026-01-10",
    units: 212,
    area: 14200,
    owner: "Boligselskabet Tingbjerg",
    administrator: "KAB",
    status: "active",
    homiiOnboarded: "2023-01-01",
    homiiStatus: "Aktiv",
    bbrLastUpdated: "2024-12-05",
  },
  {
    id: "aab-amager",
    name: "AAB Amager Strand",
    address: "Amager Strandvej 120, 2300 København S",
    postalCode: "2300",
    municipality: "København",
    yearBuilt: 2015,
    buildingType: "Etagebolig",
    epc: "B",
    epcCertifiedDate: "2023-09-01",
    epcExpiresDate: "2033-09-01",
    units: 96,
    area: 6200,
    owner: "Boligforeningen Amager Strand",
    administrator: "KAB",
    status: "active",
    homiiOnboarded: "2025-01-01",
    homiiStatus: "Aktiv",
    bbrLastUpdated: "2025-12-14",
  },
];

/* ─── Helper: get meters/suppliers for a building ─── */
export function getMetersForBuilding(buildingId) {
  return meters.filter(m => m.buildingId === buildingId);
}

export function getSuppliersForBuilding(buildingId) {
  const buildingMeters = getMetersForBuilding(buildingId);
  const supplierIds = [...new Set(buildingMeters.map(m => m.supplierId))];
  return supplierIds.map(sid => suppliers.find(s => s.id === sid)).filter(Boolean);
}

export function getMetersForSupplier(supplierId) {
  return meters.filter(m => m.supplierId === supplierId);
}

export function getBuildingsForSupplier(supplierId) {
  const supplierMeters = getMetersForSupplier(supplierId);
  const buildingIds = [...new Set(supplierMeters.map(m => m.buildingId))];
  return buildingIds.map(bid => buildings.find(b => b.id === bid)).filter(Boolean);
}

export function getMeter(meterId) {
  return meters.find(m => m.id === meterId);
}

export function getBuilding(buildingId) {
  return buildings.find(b => b.id === buildingId);
}

export function getSupplier(supplierId) {
  return suppliers.find(s => s.id === supplierId);
}

/* ─── Afkøling (cooling) time-series per DH meter ─── */
/* Generates weekly afkøling data for sparklines and aggregation.
   Each data point: { week, afkoeling (kWh/m³), mwh, volume (m³), supply, return } */
export function getAfkoelingTimeSeries(meterId, weeks = 52) {
  const m = meters.find(x => x.id === meterId);
  if (!m || m.type !== "fjernvarme") return [];
  // No temperature sensors → cannot derive afkøling
  if (!m.hasTemperatureData) return [];
  const seed = meterId.charCodeAt(meterId.length - 1) + meterId.charCodeAt(meterId.length - 3) * 7;
  const r = (n) => Math.sin(seed * 100 + n * 17) * 0.5 + 0.5;

  // Building-specific baseline afkøling — newer buildings cool better
  const bldg = buildings.find(b => b.id === m.buildingId);
  const yearBuilt = bldg?.yearBuilt || 1970;
  const baseAfk = yearBuilt > 2010 ? 26 + r(0) * 4    // Modern: 26-30
               : yearBuilt > 1990 ? 29 + r(0) * 5     // Mid: 29-34
               :                     32 + r(0) * 6;    // Old: 32-38

  return Array.from({ length: weeks }, (_, n) => {
    const winterFactor = n < 13 || n > 39 ? 1 : 0.85; // Summer = better cooling
    const noise = Math.sin(seed * 7 + n * 31) * 2;
    const afk = +(baseAfk * winterFactor + noise).toFixed(1);
    const volume = +(winterFactor * (45 + r(n + 200) * 30)).toFixed(1);
    const mwh = +((volume * afk) / 860).toFixed(2);
    const supply = +(75 + r(n) * 8).toFixed(1);
    const retTemp = +(supply - (afk / 860 * 1000 / (volume > 0 ? 1 : 0.001))).toFixed(1);
    return { week: n + 1, afkoeling: afk, mwh, volume, supply, return: Math.max(30, Math.min(55, +(supply - afk * 0.35 + noise * 0.5).toFixed(1))) };
  });
}

/* Aggregate weekly series into monthly or yearly for portfolio chart */
export function getAfkoelingAggregated(meterId, period = "weekly") {
  const weekly = getAfkoelingTimeSeries(meterId, 52);
  if (period === "weekly") return weekly;
  if (period === "monthly") {
    const months = [];
    for (let m = 0; m < 12; m++) {
      const start = Math.round(m * 4.33), end = Math.round((m + 1) * 4.33);
      const slice = weekly.slice(start, end);
      if (slice.length === 0) continue;
      const avg = +(slice.reduce((s, d) => s + d.afkoeling, 0) / slice.length).toFixed(1);
      months.push({ month: m + 1, afkoeling: avg });
    }
    return months;
  }
  // yearly — single point
  const avg = +(weekly.reduce((s, d) => s + d.afkoeling, 0) / weekly.length).toFixed(1);
  return [{ year: 2026, afkoeling: avg }];
}

/* Get all DH meters with their current afkøling summary */
export function getDhMetersSummary() {
  return meters
    .filter(m => m.type === "fjernvarme")
    .map(m => {
      const series = getAfkoelingTimeSeries(m.id, 52);
      const recent12 = series.slice(-12);
      const avgAfk = recent12.length > 0 ? +(recent12.reduce((s, d) => s + d.afkoeling, 0) / recent12.length).toFixed(1) : 0;
      const bldg = buildings.find(b => b.id === m.buildingId);
      return {
        meterId: m.id,
        buildingId: m.buildingId,
        buildingName: bldg?.name || m.buildingId,
        buildingArea: bldg?.area || 0,
        avgAfkoeling: avgAfk,
        hasTemperatureData: m.hasTemperatureData,
        sparkline: recent12.map(d => d.afkoeling),
        series,
        status: m.status,
        supplierId: m.supplierId,
      };
    });
}

/* ─── Degree Days (Graddage) ─── */
export const GK = ["Jan","Feb","Mar","Apr","Maj","Jun","Jul","Aug","Sep","Okt","Nov","Dec"];
export const GN = { Jan:480,Feb:410,Mar:340,Apr:210,Maj:100,Jun:30,Jul:8,Aug:15,Sep:80,Okt:230,Nov:360,Dec:460 };
export const GNT = Object.values(GN).reduce((a,b)=>a+b,0);

/** Portfolio-level graddage data: 5 years × 12 months */
export function mkGraddage() {
  const d=[];[2022,2023,2024,2025,2026].forEach(y=>{GK.forEach((m,mi)=>{const n=GN[m],f=0.85+Math.sin(y*7+mi*3)*0.15+Math.cos(y+mi*5)*0.08,a=Math.round(n*f),g=a>0?+(n/a).toFixed(3):1,ac=a*(4.2+Math.sin(y)*0.4)+Math.sin(y+mi)*30;d.push({year:y,mk:m,mi,ng:n,ag:a,guf:g,raw:+ac.toFixed(1),gaf:+(ac*g).toFixed(1)});});});return d;
}

/** Per-meter graddage data: multi-year GAF-adjusted consumption for a specific DH meter.
 *  Returns { meterId, data: [{ year, month, monthIdx, raw, degreeDays, normalDegreeDays, guf, gaf }] }
 */
export function getGraddageForMeter(meterId) {
  const m = meters.find(x => x.id === meterId);
  if (!m || m.type !== "fjernvarme") return { meterId, data: [] };

  const seed = m.id.split("").reduce((s, c) => s + c.charCodeAt(0), 0);
  const r = (n) => Math.sin(seed * 137 + n * 31) * 0.5 + 0.5;
  const bldg = buildings.find(b => b.id === m.buildingId);
  const baseConsumption = m.lastReading.value || 200; // annual MWh baseline
  const area = bldg?.area || 3000;

  // Fjernvarme seasonal shape (same as MeterDetailPage)
  const profile = [1.6, 1.5, 1.3, 0.8, 0.3, 0.1, 0.05, 0.05, 0.3, 0.9, 1.3, 1.6];
  const profileSum = profile.reduce((s, v) => s + v, 0);

  const data = [];
  [2022, 2023, 2024, 2025, 2026].forEach(y => {
    // Year-over-year consumption drift (newer buildings improve slightly)
    const yearFactor = 1 + (y - 2024) * 0.02 + Math.sin(seed + y * 3) * 0.04;

    GK.forEach((mk, mi) => {
      const ng = GN[mk]; // normal degree days
      const ddFactor = 0.85 + Math.sin(y * 7 + mi * 3) * 0.15 + Math.cos(y + mi * 5) * 0.08;
      const ag = Math.round(ng * ddFactor); // actual degree days
      const guf = ag > 0 ? +(ng / ag).toFixed(3) : 1;

      // Raw consumption: proportional to seasonal profile + meter-specific noise
      const monthShare = profile[mi] / profileSum;
      const raw = +(baseConsumption * monthShare * yearFactor * (1 + r(y * 12 + mi) * 0.12)).toFixed(1);
      const gaf = +(raw * guf).toFixed(1);

      data.push({ year: y, month: mk, monthIdx: mi, raw, degreeDays: ag, normalDegreeDays: ng, guf, gaf });
    });
  });

  return { meterId, data };
}

/* ─── Historical Monthly Consumption (all utility types, 5 years) ─── */
/** Generates 5 years × 12 months of monthly consumption for ANY meter type.
 *  Returns { meterId, data: [{ year, monthIdx, value }] }
 *  Current year (2026) values match generateMonthlyReadings() output for consistency.
 */
export function getHistoricalMonthly(meterId) {
  const m = meters.find(x => x.id === meterId);
  if (!m) return { meterId, data: [] };

  const seed = m.id.split("").reduce((s, c) => s + c.charCodeAt(0), 0);
  const r = (n) => Math.sin(seed * 137 + n * 31) * 0.5 + 0.5;
  const baseValue = m.lastReading.value || 100;

  // Seasonal profiles per utility type (same as MeterDetailPage)
  const profile = m.type === "fjernvarme"
    ? [1.6, 1.5, 1.3, 0.8, 0.3, 0.1, 0.05, 0.05, 0.3, 0.9, 1.3, 1.6]
    : m.type === "vand"
    ? [1.0, 0.95, 0.95, 1.0, 1.05, 1.1, 1.1, 1.05, 1.0, 0.95, 0.95, 0.95]
    : [1.1, 1.05, 1.0, 0.95, 0.9, 0.85, 0.85, 0.9, 0.95, 1.0, 1.05, 1.15];

  const LATEST_MONTH = 1; // Feb = index 1 (current latest data month)
  const factors = profile.map((p, i) => p + r(i) * 0.15);
  const latestFactor = factors[LATEST_MONTH];

  const data = [];
  [2022, 2023, 2024, 2025, 2026].forEach(y => {
    // Year-over-year drift: slight trend + meter-specific noise
    const yearDrift = 1 + (y - 2024) * 0.015 + Math.sin(seed + y * 3) * 0.035;

    profile.forEach((_, mi) => {
      const value = +((baseValue * factors[mi] / latestFactor) * yearDrift * (1 + r(y * 12 + mi) * 0.08)).toFixed(1);
      data.push({ year: y, monthIdx: mi, value });
    });
  });

  return { meterId, data };
}

/* ─── Billing Cycles ─── */
export const billingCycles = [
  { id: "2025-2026", label: "2025/2026", start: "2025-07-01", end: "2026-06-30", active: true },
  { id: "2024-2025", label: "2024/2025", start: "2024-07-01", end: "2025-06-30", active: false },
  { id: "2023-2024", label: "2023/2024", start: "2023-07-01", end: "2024-06-30", active: false },
];

/* ═══════════════════════════════════════════════════════
   Data Sources — source-agnostic integration registry
   Each source declares what it syncs, how often, and its
   current health. The DataSourcesPage renders these
   generically regardless of entity type.
   ═══════════════════════════════════════════════════════ */

export const dataSources = [
  {
    id: "eloverblik",
    nameKey: "srcEloverblik",
    descKey: "srcEloverblikDesc",
    category: "meter-data",
    entityType: "meters",
    syncPattern: "daily",          // D+1
    syncPatternKey: "dPlus1",
    status: "connected",
    lastSync: "2026-02-24T06:12:00Z",
    /* records are computed dynamically from meters[] via getDataSourceRecords() */
  },
  {
    id: "kamstrup-ready",
    nameKey: "srcKamstrupReady",
    descKey: "srcKamstrupReadyDesc",
    category: "meter-data",
    entityType: "meters",
    syncPattern: "realtime",
    syncPatternKey: "realTime",
    status: "connected",
    lastSync: "2026-02-24T14:38:00Z",
  },
  {
    id: "epc-energistyrelsen",
    nameKey: "srcEpcEnergistyrelsen",
    descKey: "srcEpcEnergistyrelsenDesc",
    category: "certification",
    entityType: "buildings",
    syncPattern: "weekly",
    syncPatternKey: "syncWeekly",
    status: "connected",
    lastSync: "2026-02-22T02:00:00Z",
  },
  {
    id: "bbr",
    nameKey: "srcBbr",
    descKey: "srcBbrDesc",
    category: "building-attributes",
    entityType: "buildings",
    syncPattern: "weekly",
    syncPatternKey: "syncWeekly",
    status: "connected",
    lastSync: "2026-02-23T03:00:00Z",
  },
  {
    id: "housing-corp",
    nameKey: "srcHousingCorp",
    descKey: "srcHousingCorpDesc",
    category: "building-attributes",
    entityType: "buildings",
    syncPattern: "monthly",
    syncPatternKey: "syncMonthly",
    status: "connected",
    lastSync: "2026-02-01T08:30:00Z",
  },
];

/**
 * Compute records, health, coverage, and breakdowns for each data source.
 * This keeps the source definitions clean and derives everything from the
 * core data arrays (meters[], buildings[]).
 */
export function getDataSourceRecords(sourceId) {
  const src = dataSources.find(s => s.id === sourceId);
  if (!src) return null;

  /* ── Meter-based sources ── */
  if (src.entityType === "meters") {
    const list = meters.filter(m => m.dataSource === sourceId);
    const healthy = list.filter(m => m.status === "active");
    const issues = list.filter(m => m.status !== "active");
    // healthPct: proportion of meters rated high or medium quality (0–1)
    const okCount = list.filter(m => m.dataQuality === "high" || m.dataQuality === "medium").length;
    const healthPct = list.length ? okCount / list.length : 0;

    // Type breakdown (fjernvarme/vand/el)
    const breakdown = {};
    list.forEach(m => { breakdown[m.type] = (breakdown[m.type] || 0) + 1; });

    // Quality breakdown
    const qualityBreakdown = {};
    list.forEach(m => { qualityBreakdown[m.dataQuality] = (qualityBreakdown[m.dataQuality] || 0) + 1; });

    // Coverage: how many buildings have at least one meter from this source
    const coveredBuildings = new Set(list.map(m => m.buildingId));

    // Issue details
    const issueDetails = issues.map(m => ({
      recordId: m.id,
      entityLabel: getBuilding(m.buildingId)?.name || m.buildingId,
      entityLink: `/buildings/${m.buildingId}`,
      recordLink: `/meters/${m.id}`,
      status: m.status,
      detail: m.statusDetail,
      lastUpdated: m.lastReading?.receivedDate || null,
    }));

    return {
      total: list.length,
      healthy: healthy.length,
      issueCount: issues.length,
      healthPct,
      coverage: { covered: coveredBuildings.size, total: buildings.length },
      breakdown: Object.entries(breakdown).map(([key, count]) => ({ key, count })),
      qualityBreakdown,
      issues: issueDetails,
    };
  }

  /* ── EPC certification source ── */
  if (sourceId === "epc-energistyrelsen") {
    const withEpc = buildings.filter(b => b.epc);
    const now = new Date("2026-03-01");
    const healthy = withEpc.filter(b => new Date(b.epcExpiresDate) > now);
    const expired = withEpc.filter(b => new Date(b.epcExpiresDate) <= now);

    // EPC rating breakdown
    const breakdown = {};
    withEpc.forEach(b => { breakdown[b.epc] = (breakdown[b.epc] || 0) + 1; });

    // healthPct: proportion of EPCs still valid (0–1)
    const healthPct = withEpc.length ? healthy.length / withEpc.length : 0;

    // Quality breakdown: valid vs expired
    const qualityBreakdown = { high: healthy.length };
    if (expired.length > 0) qualityBreakdown.low = expired.length;

    const issueDetails = expired.map(b => ({
      recordId: `EPC-${b.epc}-${b.id}`,
      entityLabel: b.name,
      entityLink: `/buildings/${b.id}`,
      recordLink: `/buildings/${b.id}`,
      status: "error",
      detail: { da: `EPC ${b.epc} udløbet ${new Date(b.epcExpiresDate).toLocaleDateString("da-DK")}`, en: `EPC ${b.epc} expired ${new Date(b.epcExpiresDate).toLocaleDateString("en-GB")}` },
      lastUpdated: b.epcCertifiedDate,
    }));

    return {
      total: withEpc.length,
      healthy: healthy.length,
      issueCount: expired.length,
      healthPct,
      coverage: { covered: withEpc.length, total: buildings.length },
      breakdown: Object.entries(breakdown).map(([key, count]) => ({ key, count })),
      qualityBreakdown,
      issues: issueDetails,
    };
  }

  /* ── BBR — public building & dwelling register ── */
  if (sourceId === "bbr") {
    // BBR fields: address, yearBuilt, buildingType, area, municipality
    const bbrFields = b => b.address && b.yearBuilt && b.buildingType && b.area && b.municipality;
    const complete = buildings.filter(bbrFields);
    const incomplete = buildings.filter(b => !bbrFields(b));

    // Breakdown: by building type
    const breakdown = {};
    buildings.forEach(b => { breakdown[b.buildingType || "Unknown"] = (breakdown[b.buildingType || "Unknown"] || 0) + 1; });

    const healthPct = buildings.length ? complete.length / buildings.length : 0;

    const qualityBreakdown = { high: complete.length };
    if (incomplete.length > 0) qualityBreakdown.low = incomplete.length;

    const issueDetails = incomplete.map(b => ({
      recordId: `BBR-${b.id}`,
      entityLabel: b.name,
      entityLink: `/buildings/${b.id}`,
      recordLink: `/buildings/${b.id}`,
      status: "warning",
      detail: { da: "Ufuldstændige BBR-stamdata", en: "Incomplete BBR master data" },
      lastUpdated: b.bbrLastUpdated || null,
    }));

    return {
      total: buildings.length,
      healthy: complete.length,
      issueCount: incomplete.length,
      healthPct,
      coverage: { covered: buildings.length, total: buildings.length },
      breakdown: Object.entries(breakdown).map(([key, count]) => ({ key, count })),
      qualityBreakdown,
      issues: issueDetails,
    };
  }

  /* ── Housing corporation (KAB) — internal property management data ── */
  if (sourceId === "housing-corp") {
    // KAB fields: units, owner, administrator
    const kabFields = b => b.units && b.owner && b.administrator;
    const complete = buildings.filter(kabFields);
    const incomplete = buildings.filter(b => !kabFields(b));

    // Breakdown: by administrator
    const breakdown = {};
    buildings.forEach(b => { breakdown[b.administrator || "Unknown"] = (breakdown[b.administrator || "Unknown"] || 0) + 1; });

    const healthPct = buildings.length ? complete.length / buildings.length : 0;

    const qualityBreakdown = { high: complete.length };
    if (incomplete.length > 0) qualityBreakdown.low = incomplete.length;

    const issueDetails = incomplete.map(b => ({
      recordId: `KAB-${b.id}`,
      entityLabel: b.name,
      entityLink: `/buildings/${b.id}`,
      recordLink: `/buildings/${b.id}`,
      status: "warning",
      detail: { da: "Ufuldstændige ejendomsdata fra boligforening", en: "Incomplete property data from housing corporation" },
      lastUpdated: null,
    }));

    return {
      total: buildings.length,
      healthy: complete.length,
      issueCount: incomplete.length,
      healthPct,
      coverage: { covered: buildings.length, total: buildings.length },
      breakdown: Object.entries(breakdown).map(([key, count]) => ({ key, count })),
      qualityBreakdown,
      issues: issueDetails,
    };
  }

  return null;
}
