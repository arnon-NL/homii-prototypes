/* ═══════════════════════════════════════════════════════
   Mock building & service data for the product shell
   ═══════════════════════════════════════════════════════ */

export const buildings = [
  {
    id: "kab-orestad",
    name: "KAB Ørestad",
    address: "Ørestads Boulevard 42, 2300 København S",
    epc: "C",
    units: 148,
    area: 8500,
    services: [
      { id: "fjernvarme", type: "fjernvarme", provider: "HOFOR", meterId: "KAM-DH-001", status: "active" },
      { id: "vand", type: "vand", provider: "HOFOR", meterId: "KAM-WA-012", status: "active" },
      { id: "el", type: "el", provider: "Ørsted", meterId: "KAM-EL-034", status: "active" },
    ],
    status: "active",
  },
  {
    id: "ab-soendergaard",
    name: "AB Søndergaard",
    address: "Søndergade 17, 2500 Valby",
    epc: "D",
    units: 64,
    area: 3800,
    services: [
      { id: "fjernvarme", type: "fjernvarme", provider: "HOFOR", meterId: "KAM-DH-045", status: "active" },
      { id: "vand", type: "vand", provider: "HOFOR", meterId: "KAM-WA-046", status: "active" },
    ],
    status: "active",
  },
  {
    id: "fsb-tingbjerg",
    name: "FSB Tingbjerg",
    address: "Tingbjerg Allé 8, 2700 Brønshøj",
    epc: "E",
    units: 212,
    area: 14200,
    services: [
      { id: "fjernvarme", type: "fjernvarme", provider: "HOFOR", meterId: "KAM-DH-089", status: "active" },
      { id: "vand", type: "vand", provider: "HOFOR", meterId: "KAM-WA-090", status: "active" },
      { id: "el", type: "el", provider: "Ørsted", meterId: "KAM-EL-091", status: "active" },
    ],
    status: "active",
  },
  {
    id: "aab-amager",
    name: "AAB Amager Strand",
    address: "Amager Strandvej 120, 2300 København S",
    epc: "B",
    units: 96,
    area: 6200,
    services: [
      { id: "fjernvarme", type: "fjernvarme", provider: "HOFOR", meterId: "KAM-DH-112", status: "active" },
      { id: "vand", type: "vand", provider: "HOFOR", meterId: "KAM-WA-113", status: "active" },
      { id: "el", type: "el", provider: "Ørsted", meterId: "KAM-EL-114", status: "active" },
    ],
    status: "active",
  },
];

export const billingCycles = [
  { id: "2025-2026", label: "2025/2026", start: "2025-07-01", end: "2026-06-30", active: true },
  { id: "2024-2025", label: "2024/2025", start: "2024-07-01", end: "2025-06-30", active: false },
  { id: "2023-2024", label: "2023/2024", start: "2023-07-01", end: "2024-06-30", active: false },
];
