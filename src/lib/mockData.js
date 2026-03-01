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

/* ─── Billing Cycles ─── */
export const billingCycles = [
  { id: "2025-2026", label: "2025/2026", start: "2025-07-01", end: "2026-06-30", active: true },
  { id: "2024-2025", label: "2024/2025", start: "2024-07-01", end: "2025-06-30", active: false },
  { id: "2023-2024", label: "2023/2024", start: "2023-07-01", end: "2024-06-30", active: false },
];
