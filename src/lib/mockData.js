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
export const meters = [
  // KAB Ørestad
  { id: "KAM-DH-001", type: "fjernvarme", unit: "MWh", secondaryUnit: "m³", buildingId: "kab-orestad", supplierId: "hofor", status: "active", serialNumber: "KAM-2019-44012", installDate: "2019-03-15", readingFrequency: "hourly", dataQuality: "high", lastReading: { value: 287.4, unit: "MWh", date: "2026-02-24" } },
  { id: "KAM-WA-012", type: "vand", unit: "m³", secondaryUnit: null, buildingId: "kab-orestad", supplierId: "hofor", status: "active", serialNumber: "KAM-2019-44013", installDate: "2019-03-15", readingFrequency: "daily", dataQuality: "high", lastReading: { value: 2845, unit: "m³", date: "2026-02-24" } },
  { id: "KAM-EL-034", type: "el", unit: "MWh", secondaryUnit: null, buildingId: "kab-orestad", supplierId: "orsted", status: "active", serialNumber: "KAM-2020-55034", installDate: "2020-06-01", readingFrequency: "hourly", dataQuality: "high", lastReading: { value: 62.3, unit: "MWh", date: "2026-02-24" } },
  // AB Søndergaard
  { id: "KAM-DH-045", type: "fjernvarme", unit: "MWh", secondaryUnit: "m³", buildingId: "ab-soendergaard", supplierId: "hofor", status: "active", serialNumber: "KAM-2021-66045", installDate: "2021-01-10", readingFrequency: "hourly", dataQuality: "high", lastReading: { value: 154.8, unit: "MWh", date: "2026-02-23" } },
  { id: "KAM-WA-046", type: "vand", unit: "m³", secondaryUnit: null, buildingId: "ab-soendergaard", supplierId: "hofor", status: "offline", serialNumber: "KAM-2021-66046", installDate: "2021-01-10", readingFrequency: "daily", dataQuality: "low", lastReading: { value: 1203, unit: "m³", date: "2026-02-10" } },
  // FSB Tingbjerg
  { id: "KAM-DH-089", type: "fjernvarme", unit: "MWh", secondaryUnit: "m³", buildingId: "fsb-tingbjerg", supplierId: "hofor", status: "active", serialNumber: "KAM-2018-33089", installDate: "2018-09-01", readingFrequency: "hourly", dataQuality: "medium", lastReading: { value: 482.1, unit: "MWh", date: "2026-02-24" } },
  { id: "KAM-WA-090", type: "vand", unit: "m³", secondaryUnit: null, buildingId: "fsb-tingbjerg", supplierId: "hofor", status: "active", serialNumber: "KAM-2018-33090", installDate: "2018-09-01", readingFrequency: "daily", dataQuality: "high", lastReading: { value: 5120, unit: "m³", date: "2026-02-24" } },
  { id: "KAM-EL-091", type: "el", unit: "MWh", secondaryUnit: null, buildingId: "fsb-tingbjerg", supplierId: "orsted", status: "error", serialNumber: "KAM-2018-33091", installDate: "2018-09-01", readingFrequency: "hourly", dataQuality: "low", lastReading: { value: 98.7, unit: "MWh", date: "2026-02-15" } },
  // AAB Amager Strand
  { id: "KAM-DH-112", type: "fjernvarme", unit: "MWh", secondaryUnit: "m³", buildingId: "aab-amager", supplierId: "hofor", status: "active", serialNumber: "KAM-2022-77112", installDate: "2022-04-20", readingFrequency: "hourly", dataQuality: "high", lastReading: { value: 198.5, unit: "MWh", date: "2026-02-24" } },
  { id: "KAM-WA-113", type: "vand", unit: "m³", secondaryUnit: null, buildingId: "aab-amager", supplierId: "hofor", status: "active", serialNumber: "KAM-2022-77113", installDate: "2022-04-20", readingFrequency: "daily", dataQuality: "high", lastReading: { value: 3210, unit: "m³", date: "2026-02-24" } },
  { id: "KAM-EL-114", type: "el", unit: "MWh", secondaryUnit: null, buildingId: "aab-amager", supplierId: "orsted", status: "active", serialNumber: "KAM-2022-77114", installDate: "2022-04-20", readingFrequency: "hourly", dataQuality: "high", lastReading: { value: 45.2, unit: "MWh", date: "2026-02-24" } },
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
    units: 148,
    area: 8500,
    owner: "Boligforeningen Ørestad",
    administrator: "KAB",
    status: "active",
    contractStart: "2024-01-01",
    contractStatus: "Aktiv",
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
    units: 64,
    area: 3800,
    owner: "AB Søndergaard",
    administrator: "AB Søndergaard",
    status: "active",
    contractStart: "2024-06-01",
    contractStatus: "Aktiv",
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
    units: 212,
    area: 14200,
    owner: "Boligselskabet Tingbjerg",
    administrator: "FSB",
    status: "active",
    contractStart: "2023-01-01",
    contractStatus: "Aktiv",
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
    units: 96,
    area: 6200,
    owner: "Boligforeningen Amager Strand",
    administrator: "AAB",
    status: "active",
    contractStart: "2025-01-01",
    contractStatus: "Aktiv",
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

/* ─── Billing Cycles ─── */
export const billingCycles = [
  { id: "2025-2026", label: "2025/2026", start: "2025-07-01", end: "2026-06-30", active: true },
  { id: "2024-2025", label: "2024/2025", start: "2024-07-01", end: "2025-06-30", active: false },
  { id: "2023-2024", label: "2023/2024", start: "2023-07-01", end: "2024-06-30", active: false },
];
