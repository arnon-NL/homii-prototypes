# Data Integration Analysis: homii Energy Dashboard for KAB

**Prepared by homii | February 2026**

---

## Executive Summary

The homii energy dashboard prototype demonstrates real-time energy monitoring, compliance tracking, and cost optimization for KAB's ~60,000 dwellings. Delivering this in production requires integrating **8 distinct data sources** across 4 categories: metering, building registry, weather/climate, and financial/compliance.

The good news: Denmark's energy data infrastructure is among the most advanced in Europe. Government-mandated platforms like Eloverblik (electricity) and BBR (building register) provide free, high-quality API access. The challenge lies in **district heating data**, which has no centralized equivalent to Eloverblik — Denmark's ~400 independent DH companies each operate their own data systems, requiring individual integration agreements.

This document maps every data point in the prototype to its real-world source, classifies each integration by difficulty, and outlines a realistic implementation path.

---

## 1. Prototype Data Inventory

Every screen in the prototype draws from specific data domains. The table below maps each feature to its underlying data requirement.

### 1.1 Building Overview (Home Page)

| Dashboard Element | Data Required | Source System |
|---|---|---|
| Building name, address, type | Building registry data | BBR (Bygnings- og Boligregistret) |
| Building area (m²), unit count | Registered floor area, dwelling count | BBR |
| Construction year | Year of construction | BBR |
| Administrator name (KAB) | Property management records | KAB's own systems / ABF registry |
| EPC rating (A–G) | Energy Performance Certificate | Sparenergi / EMO database |
| EPC potential savings | Certified improvement recommendations | Sparenergi / EMO database |

### 1.2 Meter Detail Pages

| Dashboard Element | Data Required | Source System |
|---|---|---|
| District heating consumption (MWh) | Hourly meter readings | Kamstrup READy / utility SFTP |
| Electricity consumption (MWh) | Hourly meter readings | Eloverblik / DataHub |
| Water consumption (m³) | Daily meter readings | Kamstrup READy / utility SFTP |
| Meter serial number, model | Meter asset register | Kamstrup READy / utility records |
| Reading frequency (hourly/daily) | Meter configuration | Kamstrup READy |
| Last reading timestamp + value | Latest validated reading | Respective metering source |
| Consumption trend (12 months) | Historical monthly aggregations | Calculated from raw readings |
| Drill-down: daily/hourly bars | Granular time-series data | Raw readings from source |

### 1.3 District Heating Compliance

| Dashboard Element | Data Required | Source System |
|---|---|---|
| Supply temperature (°C) | Hourly supply temp readings | Kamstrup READy / utility SFTP |
| Return temperature (°C) | Hourly return temp readings | Kamstrup READy / utility SFTP |
| Cooling (afkøling, ΔT) | Calculated: supply − return | Derived from meter readings |
| HOFOR motivational tariff correction | Tariff structure: threshold (30°C), correction factor (0.8%/°C), energy price (DKK/MWh) | HOFOR contract (PDF / manual) |
| GAF (Gennemsnitlig Afkølings-Faktor) | Weighted cooling performance index | Calculated from readings + tariff |

### 1.4 Smart Insights & Alerts

| Dashboard Element | Data Required | Source System |
|---|---|---|
| "Poor cooling performance" alert | Return temp vs. threshold over time | Derived from DH readings |
| "High consumption vs. similar buildings" | Consumption benchmarks by building type/size | BBR (typology) + aggregated readings |
| Degree-day normalization | Heating degree-day data | DMI (Danish Meteorological Institute) |
| Legionella compliance status | Hot water temp monitoring records | Building-level monitoring systems |

### 1.5 Financial / Supplier Data

| Dashboard Element | Data Required | Source System |
|---|---|---|
| Supplier name, contact, contract dates | Utility contract metadata | KAB procurement / manual entry |
| Tariff structure (fixed + variable) | Rate schedules, billing periods | Utility contracts (PDF) |
| Cost calculations (DKK) | Consumption × tariff rates | Derived from readings + tariffs |
| Billing cycle metadata | Invoice periods, payment terms | Utility billing systems |

---

## 2. Source System Profiles

### 2.1 Eloverblik / DataHub — Electricity

**Availability: Open, government-mandated**

Eloverblik is Denmark's national electricity data platform, operated by Energinet (the Danish TSO). It is the single authoritative source for all electricity consumption data in Denmark.

- **API**: REST API at `api.eloverblik.dk`
- **Authentication**: JWT token via third-party access agreement. End-users grant consent through a digital power-of-attorney (fuldmagt) flow.
- **Data granularity**: Hourly readings (15-min available for some meters)
- **History**: Up to 4 years of historical data
- **Cost**: Free
- **Data quality**: Excellent. Readings are settlement-grade (used for billing between market parties). Data is validated by the grid company before publication.
- **Update frequency**: Next-day (D+1) for most meters; near-real-time for smart meters via DataHub 3.0
- **Coverage**: 100% of Danish electricity meters

**Integration complexity: Low.** Well-documented REST API, standard OAuth-like consent flow, widely used by Danish energy companies. Several open-source client libraries exist.

**Key consideration**: The third-party access agreement requires each building owner (KAB, on behalf of housing associations) to grant digital consent per metering point. For KAB's ~60,000 dwellings, this consent flow needs to be streamlined — likely through a batch authorization agreement with Energinet.

---

### 2.2 Kamstrup READy — District Heating & Water Meters

**Availability: Commercial, paid**

Kamstrup is Denmark's dominant smart meter manufacturer. Their READy platform aggregates readings from Kamstrup meters deployed by utilities. KAB's buildings predominantly use Kamstrup meters for district heating and water.

- **API**: REST API + Webhook push notifications
- **Authentication**: Token-based (API key per utility account)
- **Data granularity**: Hourly (DH), daily (water), configurable
- **Data fields**: Consumption (energy/volume), supply temp, return temp, flow, power
- **Cost**: Paid add-on to Kamstrup's utility platform. Pricing is per-meter-per-year.
- **Data quality**: High. Meter readings are calibrated and used for utility billing.
- **Coverage**: Approximately 70% of DH meters in Greater Copenhagen are Kamstrup. Other manufacturers (Danfoss, Siemens) require separate integrations.

**Integration complexity: Medium.** The API is well-designed but requires a commercial agreement with each utility company (not directly with Kamstrup). The utility must enable API access for the specific meters associated with KAB's buildings.

**Key consideration**: District heating in Denmark has no centralized data platform like Eloverblik. Each of Denmark's ~400 district heating companies manages its own data infrastructure. For KAB (primarily served by HOFOR in Copenhagen), the initial integration is with a single utility — but scaling to buildings outside HOFOR's service area requires individual agreements with each DH company.

---

### 2.3 BBR — Building & Dwelling Register

**Availability: Open, government-mandated**

BBR (Bygnings- og Boligregistret) is Denmark's authoritative building register, maintained by municipalities and operated by the Danish Agency for Data Supply and Infrastructure (SDFI).

- **API**: REST API via Datafordeleren (`services.datafordeler.dk`)
- **Authentication**: Free registration, username/password
- **Data fields**: Address, building type, construction year, floor area, number of units, heating installation type, roof type, wall material, energy supply form
- **Cost**: Free
- **Data quality**: Very high for structural data. Legally mandated — municipalities are required to keep BBR current for all buildings. Some fields (e.g., heating installation) may be outdated for older buildings.
- **Update frequency**: Continuous (event-driven updates from municipalities)
- **Coverage**: 100% of Danish buildings

**Integration complexity: Low.** Well-documented API, no commercial agreements needed. The main challenge is the data model: BBR uses a hierarchical structure (ground → building → floor → unit) that requires careful mapping to KAB's building portfolio.

**Note**: The current REST API is being transitioned to a new service (expected Q2-Q3 2026). homii should build against the new Datafordeleren specifications to avoid migration work.

---

### 2.4 Sparenergi / EMO — Energy Performance Certificates

**Availability: Semi-open, regulated**

Energy Performance Certificates (Energimærker) are mandatory for buildings in Denmark and are stored in the EMO database, accessible through Sparenergi (operated by the Danish Energy Agency).

- **API**: Custom API available upon request (not fully public)
- **Authentication**: API key granted after application
- **Data fields**: EPC rating (A–G), specific energy consumption (kWh/m²/year), improvement recommendations with estimated savings (kWh and DKK), certificate validity period
- **Cost**: Free for non-commercial, non-marketing use
- **Data quality**: Good, but certificates are point-in-time assessments. A building's actual energy performance may differ from the certified rating. Certificates are valid for 10 years, so older buildings may have outdated ratings.
- **Coverage**: All buildings >60 m² that are sold, rented, or undergo major renovation. Coverage is high for KAB's portfolio (public housing must be certified).

**Integration complexity: Low-Medium.** The API exists but is not as well-documented as Eloverblik or BBR. Access requires a formal application explaining the use case. The restriction on marketing use means homii cannot use EPC data in sales materials without explicit permission.

---

### 2.5 DMI — Weather & Degree Days

**Availability: Open, government-mandated**

The Danish Meteorological Institute provides free weather data, including the temperature data needed to calculate heating degree days for energy normalization.

- **API**: OGC-compliant API at `opendataapi.dmi.dk/v2`
- **Authentication**: API key (free registration)
- **Data fields**: Hourly temperature, wind, precipitation. Degree-day values can be calculated from hourly temps using standard methods (base 17°C for Denmark).
- **Cost**: Free
- **Rate limits**: 500 requests per 5 seconds
- **Data quality**: Excellent. Official national weather service data.
- **Coverage**: ~80 weather stations across Denmark. For Copenhagen (KAB's primary area), multiple stations provide high-resolution data.

**Integration complexity: Low.** Standard REST API, well-documented, no commercial agreements needed. Degree-day calculation is a straightforward transformation of hourly temperature data.

---

### 2.6 HOFOR — District Heating Tariff & Compliance

**Availability: Restricted, contract-based**

HOFOR (Hovedstadsområdets Forsyningsselskab) is Copenhagen's district heating utility and KAB's primary DH supplier. Their motivational tariff structure is central to the compliance features in the dashboard.

- **API**: No public API. Tariff data is communicated through PDF contracts and annual price announcements.
- **Data fields**: Base energy price (DKK/MWh), cooling threshold (currently 30°C), correction factor (0.8% per °C deviation), bonus/penalty thresholds, billing periods
- **Tariff structure**: HOFOR's motivational tariff penalizes poor cooling performance (high return temperatures) and rewards good cooling (low return temperatures). The correction is applied per degree of deviation from the threshold.
- **Cost**: Data is available to contracted customers (KAB is a customer)
- **Update frequency**: Annual (tariff announcements), with mid-year adjustments possible

**Integration complexity: Medium-High.** There is no API to pull tariff data programmatically. The tariff structure must be manually configured in homii's system based on contract documents, and updated when HOFOR announces changes. This is manageable for a single utility but does not scale if homii expands to other DH companies, each with their own tariff models.

**Key consideration**: HOFOR's tariff model is specific to Copenhagen. Other DH companies (e.g., Vestforbrænding, AffaldVarme Aarhus) use different tariff structures. homii needs a configurable tariff engine, not a hardcoded HOFOR model.

---

### 2.7 KAB Internal Systems — Portfolio & Administration

**Availability: Private, requires partnership**

KAB maintains internal systems for building administration, including portfolio data, maintenance records, and tenant information.

- **Data fields**: Building-to-administrator mapping, property management organization, maintenance schedules, contact information
- **Systems**: Likely Unik (used by most Danish housing organizations), supplemented by internal databases
- **Cost**: Partnership/data sharing agreement with KAB

**Integration complexity: Medium.** Requires a formal data partnership with KAB. The initial prototype can work with a static portfolio export (CSV/Excel), but production deployment needs either an API integration with KAB's systems or a regular data sync.

---

### 2.8 Building-Level Monitoring — Legionella & Indoor Climate

**Availability: Fragmented, building-specific**

Legionella monitoring and indoor climate data are managed at the building level, with no centralized Danish database.

- **Regulations**: Danish building regulations require hot water systems to maintain ≥50°C at taps and ≥60°C in storage to prevent Legionella. Monitoring obligations are enforced by municipal health authorities.
- **Data sources**: Building Management Systems (BMS), IoT temperature sensors, manual inspection logs
- **Standardization**: None. Each building may use different BMS vendors (Schneider, Siemens, Honeywell), IoT platforms (LoRaWAN, Sigfox), or paper-based records.

**Integration complexity: High.** This is the most fragmented data domain. Production deployment requires either a standardized IoT sensor deployment across KAB's portfolio (capital expenditure) or integration with each building's existing BMS (highly variable).

---

## 3. Integration Difficulty Matrix

| Tier | Source | Data Domain | Cost | API Quality | Access Model | Timeline |
|---|---|---|---|---|---|---|
| **Tier 1 — Open & Ready** | Eloverblik | Electricity | Free | Excellent | Consent-based | 2-4 weeks |
| | BBR | Building data | Free | Good | Open registration | 1-2 weeks |
| | DMI | Degree days | Free | Good | Open registration | 1 week |
| **Tier 2 — Available with Effort** | Sparenergi/EMO | EPC ratings | Free | Adequate | Application-based | 2-4 weeks |
| | Kamstrup READy | DH/Water meters | Paid | Good | Commercial agreement | 4-8 weeks |
| | KAB systems | Portfolio data | Partnership | N/A | Data sharing agreement | 4-6 weeks |
| **Tier 3 — Difficult to Unlock** | HOFOR tariffs | DH compliance | Contract | None (manual) | Customer relationship | Ongoing manual |
| | Building BMS | Legionella/indoor | Variable | Fragmented | Per-building | 3-6 months |

---

## 4. Data Quality Assessment

### What's Already Good

**Electricity (Eloverblik)** — Denmark's electricity data infrastructure is world-class. The DataHub reform (completed 2016, enhanced with DataHub 3.0) means all electricity data flows through a single, regulated platform. Data is settlement-grade, meaning it's accurate enough to settle financial transactions between energy companies. For homii, this is the easiest and most reliable data source.

**Building register (BBR)** — As a legally mandated register maintained by municipalities, BBR data quality is very high for structural attributes (address, area, construction year, building type). Some secondary fields like heating installation type may be outdated for buildings that haven't been inspected recently, but for KAB's portfolio (regularly maintained public housing), data quality is expected to be excellent.

**Weather/degree days (DMI)** — National meteorological data with professional-grade quality. No concerns.

### What Needs Work

**District heating readings** — While the underlying meter data is high-quality (Kamstrup meters are precision instruments), the access path is fragmented. Unlike electricity, there is no "DH DataHub." Each utility manages its own data platform. For KAB's Copenhagen buildings, HOFOR/Kamstrup provides a clear path. But the lack of standardization means each new DH utility requires a separate integration effort.

**EPC ratings (Sparenergi)** — Data quality is good at time of certification, but certificates are valid for 10 years. A building certified in 2017 may have undergone significant renovations since. homii should flag certificate age and recommend recertification for buildings with certificates older than 5 years.

### What's Genuinely Hard

**Tariff data** — HOFOR publishes tariff information annually, but there is no machine-readable feed. Each DH company in Denmark uses a different tariff model — some with motivational cooling tariffs, some with flat rates, some with capacity-based pricing. Building a universal tariff engine that handles this variety is a significant product challenge.

**Legionella and indoor environment** — This data simply doesn't exist in a centralized or standardized form. For the prototype, it can be shown as a configuration-driven feature (building managers input their monitoring data). Long-term, homii could partner with IoT sensor companies to standardize data collection across KAB's portfolio.

---

## 5. Recommended Implementation Sequence

### Phase 1: Foundation (Weeks 1-6)

Connect the three open, free data sources that require no commercial negotiations.

1. **BBR** — Building register. Establishes the portfolio foundation: every building, its address, area, type, and year of construction. All other data attaches to this skeleton.
2. **Eloverblik** — Electricity consumption. Demonstrates real data flowing through the dashboard with the least friction. Implement the consent (fuldmagt) flow for KAB.
3. **DMI** — Degree-day data. Enables weather-normalized consumption benchmarking from day one.

**Deliverable**: Dashboard showing real electricity data for KAB buildings with degree-day normalization and building metadata from BBR.

### Phase 2: Core Energy (Weeks 4-12)

Establish the commercial partnerships for meter data and building-specific information.

4. **Kamstrup READy** — District heating and water meter readings via HOFOR. This is the critical integration for the compliance features (afkøling, HOFOR tariff correction).
5. **Sparenergi/EMO** — EPC ratings. Apply for API access, integrate building-level energy labels.
6. **KAB portfolio data** — Formalize the data-sharing agreement. Initial integration can be CSV-based, with API integration following.

**Deliverable**: Full energy dashboard with DH, electricity, water, and EPC data for KAB's HOFOR-served buildings.

### Phase 3: Compliance & Intelligence (Weeks 10-16)

Build the derived analytics layer.

7. **HOFOR tariff configuration** — Manual setup of the motivational tariff model, based on contract documents. Build a configurable tariff engine that can accommodate other DH companies later.
8. **Benchmark calculations** — Using BBR building typology + aggregated consumption data, generate "similar building" benchmarks.
9. **Alert engine** — Implement threshold-based alerts for cooling performance, consumption anomalies, and EPC recommendations.

**Deliverable**: Full compliance dashboard with HOFOR tariff simulation, benchmarking, and smart alerts.

### Phase 4: Edge Cases & Scale (Ongoing)

Address the harder integration challenges as the platform matures.

10. **Non-Kamstrup meters** — For buildings with Danfoss, Siemens, or other meter brands, build adapter integrations or manual upload workflows.
11. **Non-HOFOR utilities** — As KAB buildings outside Copenhagen are onboarded, negotiate data access with additional DH companies.
12. **Legionella / indoor monitoring** — Evaluate IoT sensor partnership or BMS integration options per building.

---

## 6. Risks and Considerations

**Consent management at scale.** Eloverblik's consent flow works per metering point. For KAB's portfolio size, homii needs a batch consent mechanism or a framework agreement with Energinet. This is solvable but requires early engagement.

**DH data fragmentation is the biggest structural risk.** Denmark's decentralized district heating landscape means there will never be a single API for all DH data. homii's architecture must assume multiple data sources per energy type, with varying data formats, update frequencies, and access models.

**Tariff model diversity.** The prototype hardcodes HOFOR's motivational tariff. In production, homii needs a configurable tariff engine. Each DH company's tariff model is unique — some use cooling-based incentives, others don't. The compliance features must be parametric, not utility-specific.

**BBR API transition.** The current BBR REST API is being phased out in favor of a new Datafordeleren service (expected Q2-Q3 2026). Building against the new API specifications now avoids a forced migration later.

**Data freshness expectations.** Different sources update at different frequencies: electricity (D+1), DH readings (depends on utility — some hourly push, some daily batch), BBR (event-driven), EPC (static until recertification). The dashboard must clearly communicate data recency to avoid misleading users with stale information.

---

## 7. Summary

The prototype demonstrates a compelling vision. The data infrastructure to support it is largely available — Denmark's open data policies and regulated energy markets provide a strong foundation. The path to production is clear for electricity (Eloverblik), building data (BBR), and weather normalization (DMI).

The primary complexity lies in district heating. The absence of a centralized DH data platform means each utility integration is a separate project. For KAB's initial deployment (primarily HOFOR-served buildings), this is manageable through a single Kamstrup/HOFOR agreement. Scaling beyond Copenhagen requires a repeatable utility onboarding process.

homii's competitive advantage will come from handling this complexity gracefully — connecting fragmented data sources into a coherent, building-centric view that feels simple to KAB's administrators, even though the underlying integration landscape is anything but.

---

*This analysis reflects the Danish energy data landscape as of February 2026. API availability and regulatory frameworks are subject to change.*
