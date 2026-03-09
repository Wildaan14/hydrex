// HYDREX — VWBA 2.0 Hydrological Calculator
// Volumetric Water Benefit Accounting Platform
// Water Footprint · Water Stock · Water Credit · VWB Methods (D-1 to D-9)
// Integrated PDF download via waterPdfGenerator

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "../context/LanguageContext";
import { useTheme } from "../components/ThemeProvider";
import {
  Droplets,
  Calculator,
  CheckCircle,
  Info,
  RefreshCw,
  BarChart3,
  FileText,
  Activity,
  Download,
  FileDown,
  Leaf,
  CloudRain,
  Factory,
  Sprout,
  Recycle,
  Home,
  ChevronDown,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  Table2,
} from "lucide-react";
import {
  generateWaterFootprintPDF,
  generateWaterStockPDF,
  generateWaterCreditPDF,
  generateCompleteWaterReportPDF,
} from "../services/waterPdfGenerator";
import type {
  WaterFootprintData,
  WaterStockData,
  WaterCreditData,
  HydrexReportData,
} from "../services/waterPdfGenerator";

// ═══════════════════════════════════════════════════════════════
// THEME COLORS
// ═══════════════════════════════════════════════════════════════

const darkC = {
  ocean: "#0ea5e9",
  teal: "#14b8a6",
  emerald: "#10b981",
  amber: "#f59e0b",
  rose: "#f43f5e",
  purple: "#a78bfa",
  ink: "#050d1a",
  card: "#0a1628",
  surface: "#0f1f38",
  border: "rgba(14,165,233,0.18)",
  text: "#e2f0ff",
  muted: "#6b8cad",
};

const lightC = {
  ocean: "#0284c7",
  teal: "#0d9488",
  emerald: "#059669",
  amber: "#d97706",
  rose: "#e11d48",
  purple: "#7c3aed",
  ink: "#f0f9ff",
  card: "#ffffff",
  surface: "#f1f5f9",
  border: "rgba(2,132,199,0.2)",
  text: "#0c4a6e",
  muted: "#0369a1",
};

// ═══════════════════════════════════════════════════════════════
// VWBA 2.0 CONSTANTS & STANDARDS
// ═══════════════════════════════════════════════════════════════

const CURVE_NUMBERS = {
  forest_good: 36,
  forest_fair: 60,
  grassland_good: 39,
  grassland_fair: 61,
  agricultural_good: 67,
  agricultural_poor: 81,
  urban_impervious: 98,
  wetland: 98,
};

const RETURN_FLOW = {
  flood_irrigation: 30,
  sprinkler: 15,
  drip: 5,
  surface_water: 20,
};

const WATER_STANDARDS = {
  reasonable_access: 20,
  basic_hygiene: 2,
  handwashing: 1.5,
  flush_toilet: 30,
  pour_flush: 4,
};

const RUNOFF_COEF = {
  concrete: 0.85,
  asphalt: 0.9,
  metal_roof: 0.9,
  tile_roof: 0.85,
  gravel: 0.5,
  lawn_flat: 0.2,
  lawn_steep: 0.35,
  forest: 0.1,
};

const BMP_FACTORS = {
  bioretention: 80,
  rain_garden: 75,
  green_roof: 60,
  permeable_pavement: 90,
  constructed_wetland: 85,
  retention_pond: 70,
  detention_pond: 50,
};

const PROJECT_TYPES = [
  {
    value: "groundwater_recharge",
    label: "💧 Recharge Air Tanah (D-4)",
    method: "D-4",
  },
  {
    value: "rainwater_harvesting",
    label: "🌧️ Panen Air Hujan (D-4)",
    method: "D-4",
  },
  {
    value: "wetland_restoration",
    label: "🌿 Restorasi Lahan Basah (D-5)",
    method: "D-5",
  },
  { value: "stormwater_bmp", label: "🌊 Stormwater BMP (D-5)", method: "D-5" },
  {
    value: "wash_supply",
    label: "🚰 WASH Penyediaan Air (D-3)",
    method: "D-3",
  },
  {
    value: "wastewater_treatment",
    label: "🔬 Pengolahan Limbah (D-6)",
    method: "D-6",
  },
  { value: "reforestation", label: "🌳 Reforestasi (D-1/D-4)", method: "D-1" },
  {
    value: "irrigation_efficiency",
    label: "🌾 Efisiensi Irigasi (D-2)",
    method: "D-2",
  },
];

// ═══════════════════════════════════════════════════════════════
// CALCULATION FUNCTIONS
// ═══════════════════════════════════════════════════════════════

// D-1: Curve Number Method
function calculateCurveNumberRunoff(P: number, CN: number): number {
  const S = 25400 / CN - 254;
  const threshold = 0.2 * S;
  if (P > threshold) {
    return Math.pow(P - threshold, 2) / (P + 0.8 * S);
  }
  return 0;
}

// D-2: Consumption
function calculateConsumption(
  withdrawal: number,
  returnFlowPercent: number,
): number {
  return withdrawal * (1 - returnFlowPercent / 100);
}

// D-3: Volume Provided
function calculateVolumeProvided(
  option: string,
  value1: number,
  value2: number,
  value3: number,
): number {
  if (option === "metered") return value1;
  if (option === "capacity") return value1 * value2 * value3;
  if (option === "beneficiaries") return (value1 * value2 * value3) / 1000;
  return 0;
}

// D-4: Recharge Method
function calculateRecharge(
  catchmentArea: number,
  runoffCoef: number,
  precipitation: number,
  storageCapacity: number,
  timesFilled: number,
  evaporation: number,
  withdrawal: number,
): number {
  const availableSupply = catchmentArea * runoffCoef * (precipitation / 1000);
  const storagePotential = storageCapacity * timesFilled;
  const volumeCaptured = Math.min(availableSupply, storagePotential);
  return Math.max(0, volumeCaptured - evaporation - withdrawal);
}

// D-5: Volume Captured
function calculateVolumeCaptured(
  precipitation: number,
  area: number,
  runoffCoef: number,
  reductionFactor: number,
): number {
  const supplyVolume = (precipitation / 1000) * area * runoffCoef;
  return supplyVolume * (reductionFactor / 100);
}

// D-6: Volume Treated
function calculateVolumeTreated(
  annualVolume: number,
  numChallenges: number,
  influentConc: number,
  effluentConc: number,
  targetConc: number,
): number {
  const incrementalImprovement = influentConc - effluentConc;
  const totalImprovementNeeded = influentConc - targetConc;

  if (totalImprovementNeeded <= 0) return 0;

  const fractionImproved = Math.min(
    1.0,
    incrementalImprovement / totalImprovementNeeded,
  );
  return annualVolume * (1 / numChallenges) * fractionImproved;
}

// Water Stock
function calculateWaterStock(
  precipitation: number,
  evapotranspiration: number,
  surfaceRunoff: number,
  totalWithdrawal: number,
  watershedArea: number,
) {
  const areaM2 = watershedArea * 1_000_000;
  const P_vol = (precipitation / 1000) * areaM2;
  const ET_vol = (evapotranspiration / 1000) * areaM2;
  const Q_vol = (surfaceRunoff / 1000) * areaM2;
  const deltaS = P_vol - ET_vol - Q_vol - totalWithdrawal;

  let status = "";
  let pressureLevel = "";
  let recommendation = "";

  if (deltaS > 5_000_000) {
    status = "Surplus Besar";
    pressureLevel = "Rendah";
    recommendation =
      "DAS dalam kondisi baik. Dapat menerima aktivitas tambahan dengan monitoring berkala.";
  } else if (deltaS > 0) {
    status = "Surplus Kecil";
    pressureLevel = "Sedang";
    recommendation =
      "DAS dalam kondisi cukup. Pertahankan dan lakukan monitoring rutin.";
  } else if (deltaS > -5_000_000) {
    status = "Defisit Ringan";
    pressureLevel = "Tinggi";
    recommendation =
      "DAS mulai tertekan. Implementasikan program konservasi dan kurangi konsumsi.";
  } else {
    status = "Defisit Berat";
    pressureLevel = "Sangat Tinggi";
    recommendation =
      "DAS mengalami tekanan kritis. WAJIB implementasi proyek konservasi dan water credit segera.";
  }

  return {
    deltaS,
    status,
    pressureLevel,
    recommendation,
    P_vol,
    ET_vol,
    Q_vol,
  };
}

// Water Footprint
function calculateWaterFootprint(
  withdrawal: number,
  returnFlow: number,
  sector: string,
) {
  const netConsumption = withdrawal - returnFlow;
  const blueWater = withdrawal;

  let category = "";
  let status = "";

  if (netConsumption < 1_000_000) {
    category = "Rendah";
    status = "Konsumsi dalam batas wajar — pertahankan efisiensi";
  } else if (netConsumption < 10_000_000) {
    category = "Sedang";
    status = "Perlu monitoring rutin dan strategi efisiensi air";
  } else if (netConsumption < 50_000_000) {
    category = "Tinggi";
    status = "Perlu strategi efisiensi agresif dan water credit";
  } else {
    category = "Sangat Tinggi - Kritis";
    status = "Wajib kurangi konsumsi dan peroleh water credit segera";
  }

  return { netConsumption, blueWater, category, status };
}

// Water Credit
function calculateWaterCredit(
  volumeWithProject: number,
  volumeWithoutProject: number,
  fundingContribution: number,
  projectType: string,
) {
  const vwb = volumeWithProject - volumeWithoutProject;
  const eligibleCredit = vwb * (fundingContribution / 100);

  let projectImpact = "";
  if (vwb > 100_000) {
    projectImpact =
      "Positif Besar — Kontribusi signifikan terhadap ketersediaan air";
  } else if (vwb > 10_000) {
    projectImpact = "Positif Sedang — Meningkatkan ketahanan air lokal";
  } else if (vwb > 0) {
    projectImpact = "Positif Ringan — Dampak terbatas namun berkontribusi";
  } else if (vwb === 0) {
    projectImpact = "Netral — Tidak ada perubahan volumetrik";
  } else {
    projectImpact = "Negatif — Mengurangi ketersediaan air";
  }

  return { vwb, eligibleCredit, projectImpact };
}

// ═══════════════════════════════════════════════════════════════
// NRECA MODEL ENGINE
// ═══════════════════════════════════════════════════════════════

const NRECA_MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "Mei",
  "Jun",
  "Jul",
  "Agu",
  "Sep",
  "Okt",
  "Nov",
  "Des",
];

interface NRECAMonthlyInput {
  year: number;
  month: number;
  days: number;
  rainfall: number; // R (mm)
  pet: number; // PET (mm)
  qObs?: number; // Debit observasi (m³/s)
}

interface NRECAParams {
  PSUB: number;
  GWF: number;
  Cr: number;
  Wo_i: number;
  Gw_i: number;
  Ra: number;
  A: number;
}

interface NRECAResult {
  year: number;
  month: number;
  days: number;
  R: number;
  PET: number;
  Wo: number;
  Wi: number;
  STOR_RATIO: number;
  PRECIP_PET: number;
  AET_PET: number;
  AET: number;
  WATER_BALANCE: number;
  EXCESS_MOIST_RATIO: number;
  EXCESS_MOIST: number;
  DELTA_STORAGE: number;
  RECHG_GW: number;
  BEGIN_GW: number;
  END_GW: number;
  GW_FLOW: number;
  DIRECT_FLOW: number;
  TOTAL_DISCH_mm: number;
  Qcomp: number;
  Qobs?: number;
  sqError?: number;
  sqObsDev?: number;
}

function nrecaCalcAETPET(storRatio: number, precipPET: number): number {
  if (precipPET >= 1.0) return 1.0;
  return Math.min(1.0, storRatio + precipPET);
}

function nrecaExcessRatio(storRatio: number): number {
  if (storRatio >= 2.0) return 0.99;
  if (storRatio <= 0.1) return 0.01;
  return Math.min(0.99, Math.max(0.01, Math.pow(storRatio / 2.0, 0.5)));
}

function runNRECA(
  inputs: NRECAMonthlyInput[],
  params: NRECAParams,
): NRECAResult[] {
  const { PSUB, GWF, Cr, Wo_i, Gw_i, Ra, A } = params;
  const Nom = 100 + 0.2 * Ra;
  const results: NRECAResult[] = [];
  let Wo = Wo_i;
  let GwBegin = Gw_i;

  for (const inp of inputs) {
    const PET = Cr * inp.pet;
    const STOR_RATIO = Wo / Nom;
    const PRECIP_PET = PET > 0 ? inp.rainfall / PET : inp.rainfall / 0.001;
    const AET_PET = nrecaCalcAETPET(STOR_RATIO, PRECIP_PET);
    const AET = AET_PET * PET;
    const WATER_BALANCE = inp.rainfall - AET;
    const EXCESS_MOIST_RATIO = nrecaExcessRatio(STOR_RATIO);
    const EXCESS_MOIST = Math.max(0, WATER_BALANCE * EXCESS_MOIST_RATIO);
    const DELTA_STORAGE = WATER_BALANCE - EXCESS_MOIST;
    const Wi = Math.max(0, Wo + DELTA_STORAGE);
    const RECHG_GW = EXCESS_MOIST * PSUB;
    const DIRECT_FLOW = EXCESS_MOIST * (1 - PSUB);
    const BEGIN_GW = GwBegin;
    const END_GW = BEGIN_GW + RECHG_GW;
    const GW_FLOW = END_GW * GWF;
    const END_GW_after = END_GW - GW_FLOW;
    const TOTAL_DISCH_mm = DIRECT_FLOW + GW_FLOW;
    const secPerMonth = inp.days * 86400;
    const areaM2 = A * 1e6;
    const Qcomp = ((TOTAL_DISCH_mm / 1000) * areaM2) / secPerMonth;
    const sqError =
      inp.qObs !== undefined ? Math.pow(Qcomp - inp.qObs, 2) : undefined;

    results.push({
      year: inp.year,
      month: inp.month,
      days: inp.days,
      R: inp.rainfall,
      PET,
      Wo,
      Wi,
      STOR_RATIO,
      PRECIP_PET,
      AET_PET,
      AET,
      WATER_BALANCE,
      EXCESS_MOIST_RATIO,
      EXCESS_MOIST,
      DELTA_STORAGE,
      RECHG_GW,
      BEGIN_GW,
      END_GW,
      GW_FLOW,
      DIRECT_FLOW,
      TOTAL_DISCH_mm,
      Qcomp,
      Qobs: inp.qObs,
      sqError,
    });

    Wo = Wi;
    GwBegin = END_GW_after;
  }

  // Calculate sqObsDev for NSE
  const obsVals = results
    .filter((r) => r.Qobs !== undefined)
    .map((r) => r.Qobs!);
  const Qo_mean =
    obsVals.length > 0
      ? obsVals.reduce((a, b) => a + b, 0) / obsVals.length
      : 0;
  results.forEach((r) => {
    if (r.Qobs !== undefined) r.sqObsDev = Math.pow(r.Qobs - Qo_mean, 2);
  });
  return results;
}

function calcNRECAStats(results: NRECAResult[]) {
  const compVals = results.map((r) => r.Qcomp);
  const obsVals = results
    .filter((r) => r.Qobs !== undefined)
    .map((r) => r.Qobs!);
  const mean = (a: number[]) =>
    a.length ? a.reduce((s, v) => s + v, 0) / a.length : 0;
  const withObs = results.filter(
    (r) => r.Qobs !== undefined && r.sqError !== undefined,
  );
  const sumSqErr = withObs.reduce((s, r) => s + r.sqError!, 0);
  const sumSqDev = withObs.reduce((s, r) => s + r.sqObsDev!, 0);
  const NSE = sumSqDev > 0 ? 1 - sumSqErr / sumSqDev : NaN;
  let r = 0;
  if (obsVals.length > 0 && obsVals.length === compVals.length) {
    const mO = mean(obsVals);
    const mC = mean(compVals);
    const num = obsVals.reduce(
      (s, o, i) => s + (o - mO) * (compVals[i] - mC),
      0,
    );
    const dA = Math.sqrt(obsVals.reduce((s, o) => s + Math.pow(o - mO, 2), 0));
    const dB = Math.sqrt(
      compVals.reduce((s, c) => s + Math.pow(c - mean(compVals), 2), 0),
    );
    r = dA * dB > 0 ? num / (dA * dB) : 0;
  }
  return {
    meanObs: mean(obsVals),
    minObs: obsVals.length ? Math.min(...obsVals) : 0,
    maxObs: obsVals.length ? Math.max(...obsVals) : 0,
    meanComp: mean(compVals),
    minComp: Math.min(...compVals),
    maxComp: Math.max(...compVals),
    r,
    NSE,
  };
}

const NRECA_DEFAULT_DATA: NRECAMonthlyInput[] = [
  { year: 2007, month: 1, days: 31, rainfall: 264.8, pet: 145.9, qObs: 35.2 },
  { year: 2007, month: 2, days: 28, rainfall: 426.8, pet: 140.9, qObs: 69.4 },
  { year: 2007, month: 3, days: 31, rainfall: 815.0, pet: 156.7, qObs: 51.3 },
  { year: 2007, month: 4, days: 30, rainfall: 233.7, pet: 157.9, qObs: 30.7 },
  { year: 2007, month: 5, days: 31, rainfall: 280.7, pet: 170.6, qObs: 10.2 },
  { year: 2007, month: 6, days: 30, rainfall: 346.2, pet: 152.0, qObs: 13.8 },
  { year: 2007, month: 7, days: 31, rainfall: 372.3, pet: 145.9, qObs: 20.0 },
  { year: 2007, month: 8, days: 31, rainfall: 308.8, pet: 151.9, qObs: 35.1 },
  { year: 2007, month: 9, days: 30, rainfall: 539.2, pet: 137.5, qObs: 20.1 },
  { year: 2007, month: 10, days: 31, rainfall: 602.2, pet: 142.3, qObs: 14.4 },
  { year: 2007, month: 11, days: 30, rainfall: 580.0, pet: 132.4, qObs: 12.6 },
  { year: 2007, month: 12, days: 31, rainfall: 205.9, pet: 135.6, qObs: 9.18 },
];

const NRECA_DEFAULT_PARAMS: NRECAParams = {
  PSUB: 0.87,
  GWF: 0.2,
  Cr: 0.8,
  Wo_i: 700.0,
  Gw_i: 20.0,
  Ra: 2000.0,
  A: 513.403,
};

// ═══════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════

interface WaterFootprintInput {
  withdrawal: number;
  returnFlow: number;
  sector: string;
}

interface WaterStockInput {
  precipitation: number;
  evapotranspiration: number;
  surfaceRunoff: number;
  totalWithdrawal: number;
  watershedArea: number;
}

interface WaterCreditInput {
  volumeWithProject: number;
  volumeWithoutProject: number;
  projectType: string;
  fundingContribution: number;
}

interface VWBAMethodInput {
  method: string;
  cnPrecipitation?: number;
  cnCurveNumber?: number;
  cnArea?: number;
  cnDays?: number;
  d2Withdrawal?: number;
  d2ReturnFlow?: number;
  d3Option?: string;
  d3Value1?: number;
  d3Value2?: number;
  d3Value3?: number;
  d4CatchmentArea?: number;
  d4RunoffCoef?: number;
  d4Precipitation?: number;
  d4StorageCapacity?: number;
  d4TimesFilled?: number;
  d4Evaporation?: number;
  d4Withdrawal?: number;
  d5Precipitation?: number;
  d5Area?: number;
  d5RunoffCoef?: number;
  d5ReductionFactor?: number;
  d6AnnualVolume?: number;
  d6NumChallenges?: number;
  d6Influent?: number;
  d6Effluent?: number;
  d6Target?: number;
}

interface CalculationResults {
  waterFootprint?: {
    netConsumption: number;
    blueWater: number;
    status: string;
    category: string;
  };
  waterStock?: {
    deltaS: number;
    status: string;
    pressureLevel: string;
    recommendation: string;
    P_vol: number;
    ET_vol: number;
    Q_vol: number;
  };
  waterCredit?: {
    vwb: number;
    eligibleCredit: number;
    projectImpact: string;
  };
  vwbaMethod?: {
    method: string;
    result: number;
    unit: string;
    description: string;
  };
}

// ═══════════════════════════════════════════════════════════════
// HELPER FUNCTIONS
// ═══════════════════════════════════════════════════════════════

const fmt = (n: number) =>
  n.toLocaleString("id-ID", { maximumFractionDigits: 1 });

const statusColor = (s: string, C: typeof darkC): string => {
  if (
    s.includes("Surplus") ||
    s.includes("Positif Besar") ||
    s.includes("Seimbang") ||
    s.includes("Rendah") ||
    s.includes("baik") ||
    s.includes("Efisien")
  )
    return C.emerald;
  if (s.includes("Sedang") || s.includes("Netral") || s.includes("Ringan"))
    return C.amber;
  return C.rose;
};

// ═══════════════════════════════════════════════════════════════
// SUB-COMPONENTS
// ═══════════════════════════════════════════════════════════════

const FormulaBox: React.FC<{ formula: string; vars: [string, string][] }> = ({
  formula,
  vars,
}) => {
  const { theme: colorTheme } = useTheme();
  const C = colorTheme === "dark" ? darkC : lightC;
  return (
    <div
      style={{
        background: "rgba(14,165,233,0.06)",
        border: `1px solid ${C.border}`,
        borderRadius: 12,
        padding: "14px 18px",
        marginBottom: 20,
      }}
    >
      <div
        style={{
          fontFamily: "'JetBrains Mono', 'Courier New', monospace",
          color: C.ocean,
          fontSize: 13,
          fontWeight: 700,
          marginBottom: 10,
        }}
      >
        {formula}
      </div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "4px 24px",
        }}
      >
        {vars.map(([sym, desc]) => (
          <div key={sym} style={{ fontSize: 11.5, color: C.muted }}>
            <span style={{ color: C.teal, fontFamily: "monospace" }}>{sym}</span>{" "}
            = {desc}
          </div>
        ))}
      </div>
    </div>
  );
};

const InputField: React.FC<{
  label: string;
  unit?: string;
  value: number;
  hint?: string;
  onChange: (v: number) => void;
}> = ({ label, unit, value, hint, onChange }) => {
  const { theme: colorTheme } = useTheme();
  const C = colorTheme === "dark" ? darkC : lightC;
  return (
    <div style={{ marginBottom: 18 }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: 6,
        }}
      >
        <label style={{ color: C.text, fontSize: 13, fontWeight: 600 }}>
          {label}
        </label>
        {unit && <span style={{ color: C.muted, fontSize: 12 }}>{unit}</span>}
      </div>
      <input
        type="number"
        min={0}
        value={value || ""}
        onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
        placeholder="0"
        style={{
          width: "100%",
          background: C.surface,
          color: C.text,
          border: `1px solid ${C.border}`,
          borderRadius: 10,
          padding: "11px 14px",
          fontSize: 15,
          outline: "none",
          boxSizing: "border-box",
          transition: "border-color 0.2s",
        }}
        onFocus={(e) => (e.target.style.borderColor = C.ocean)}
        onBlur={(e) => (e.target.style.borderColor = C.border)}
      />
      {hint && (
        <div style={{ color: C.muted, fontSize: 11, marginTop: 5 }}>{hint}</div>
      )}
    </div>
  );
};

const SelectField: React.FC<{
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}> = ({ label, value, onChange, options }) => {
  const { theme: colorTheme } = useTheme();
  const C = colorTheme === "dark" ? darkC : lightC;
  return (
    <div style={{ marginBottom: 18 }}>
      <label
        style={{
          display: "block",
          color: C.text,
          fontSize: 13,
          fontWeight: 600,
          marginBottom: 6,
        }}
      >
        {label}
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{
          width: "100%",
          background: C.surface,
          color: C.text,
          border: `1px solid ${C.border}`,
          borderRadius: 10,
          padding: "11px 14px",
          fontSize: 14,
          outline: "none",
          cursor: "pointer",
          appearance: "none",
          boxSizing: "border-box",
        }}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
};

const ResultCard: React.FC<{
  label: string;
  value: string;
  color?: string;
  sub?: string;
}> = ({ label, value, color, sub }) => {
  const { theme: colorTheme } = useTheme();
  const C = colorTheme === "dark" ? darkC : lightC;
  const _color = color ?? C.text;
  return (
    <div
      style={{
        background: C.card,
        border: `1px solid ${C.border}`,
        borderRadius: 12,
        padding: "16px 18px",
      }}
    >
      <div
        style={{
          color: C.muted,
          fontSize: 11,
          textTransform: "uppercase",
          letterSpacing: 1.2,
          marginBottom: 6,
        }}
      >
        {label}
      </div>
      <div style={{ color: _color, fontSize: 20, fontWeight: 800, lineHeight: 1.1 }}>
        {value}
      </div>
      {sub && (
        <div style={{ color: C.muted, fontSize: 11, marginTop: 5 }}>{sub}</div>
      )}
    </div>
  );
};

const CalcButton: React.FC<{
  onClick: () => void;
  label: string;
  color?: string;
}> = ({ onClick, label, color }) => {
  const { theme: colorTheme } = useTheme();
  const C = colorTheme === "dark" ? darkC : lightC;
  const _color = color ?? C.ocean;
  return (
    <button
      onClick={onClick}
      style={{
        flex: 1,
        background: `linear-gradient(135deg, ${_color}, ${_color}cc)`,
        color: "#fff",
        border: "none",
        borderRadius: 10,
        padding: "13px 20px",
        fontSize: 14,
        fontWeight: 700,
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        boxShadow: `0 4px 20px ${_color}40`,
        transition: "transform 0.15s",
      }}
      onMouseEnter={(e) => (e.currentTarget.style.transform = "translateY(-1px)")}
      onMouseLeave={(e) => (e.currentTarget.style.transform = "translateY(0)")}
    >
      <Calculator size={16} />
      {label}
    </button>
  );
};

const ResetButton: React.FC<{ onClick: () => void }> = ({ onClick }) => {
  const { theme: colorTheme } = useTheme();
  const C = colorTheme === "dark" ? darkC : lightC;
  return (
    <button
      onClick={onClick}
      style={{
        background: "transparent",
        color: C.muted,
        border: `1px solid ${C.border}`,
        borderRadius: 10,
        padding: "13px 18px",
        fontSize: 14,
        fontWeight: 600,
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        gap: 8,
        transition: "color 0.2s, border-color 0.2s",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.color = C.text;
        e.currentTarget.style.borderColor = C.ocean;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.color = C.muted;
        e.currentTarget.style.borderColor = C.border;
      }}
    >
      <RefreshCw size={16} />
      Reset
    </button>
  );
};

const DownloadButton: React.FC<{
  onClick: () => void;
  label: string;
  loading: boolean;
  color?: string;
  variant?: "solid" | "outline";
}> = ({ onClick, label, loading, color, variant = "outline" }) => {
  const { theme: colorTheme } = useTheme();
  const C = colorTheme === "dark" ? darkC : lightC;
  const _color = color ?? C.ocean;
  return (
    <button
      onClick={onClick}
      disabled={loading}
      style={{
        background:
          variant === "solid"
            ? `linear-gradient(135deg, ${_color}, ${_color}cc)`
            : "transparent",
        color: variant === "solid" ? "#fff" : _color,
        border: `1px solid ${_color}`,
        borderRadius: 10,
        padding: "10px 16px",
        fontSize: 13,
        fontWeight: 600,
        cursor: loading ? "not-allowed" : "pointer",
        display: "flex",
        alignItems: "center",
        gap: 8,
        opacity: loading ? 0.6 : 1,
        transition: "all 0.2s",
      }}
      onMouseEnter={(e) =>
        !loading && (e.currentTarget.style.transform = "translateY(-1px)")
      }
      onMouseLeave={(e) =>
        !loading && (e.currentTarget.style.transform = "translateY(0)")
      }
    >
      {loading ? (
        <RefreshCw size={14} className="spinning" />
      ) : (
        <Download size={14} />
      )}
      {loading ? "Membuat PDF..." : label}
    </button>
  );
};

// ═══════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════

const HydrologicalCalculator: React.FC = () => {
  const { t, language } = useLanguage();
  const { theme: colorTheme } = useTheme();
  const C = colorTheme === "dark" ? darkC : lightC;
  const [activeTab, setActiveTab] = useState<
    "footprint" | "stock" | "credit" | "vwba" | "nreca"
  >("footprint");

  // ── NRECA State ──
  const [nrecaParams, setNrecaParams] =
    useState<NRECAParams>(NRECA_DEFAULT_PARAMS);
  const [nrecaData, setNrecaData] =
    useState<NRECAMonthlyInput[]>(NRECA_DEFAULT_DATA);
  const [nrecaResults, setNrecaResults] = useState<NRECAResult[] | null>(null);
  const [nrecaStats, setNrecaStats] = useState<ReturnType<
    typeof calcNRECAStats
  > | null>(null);
  const [nrecaSubTab, setNrecaSubTab] = useState<
    "params" | "data" | "results" | "charts"
  >("params");
  const [nrecaShowTable, setNrecaShowTable] = useState(false);

  const handleNRECACalc = () => {
    const res = runNRECA(nrecaData, nrecaParams);
    const st = calcNRECAStats(res);
    setNrecaResults(res);
    setNrecaStats(st);
    setNrecaSubTab("results");
  };

  const handleNRECAReset = () => {
    setNrecaParams(NRECA_DEFAULT_PARAMS);
    setNrecaData(NRECA_DEFAULT_DATA);
    setNrecaResults(null);
    setNrecaStats(null);
    setNrecaSubTab("params");
  };

  const setNrecaMonthField = (
    idx: number,
    field: keyof NRECAMonthlyInput,
    val: number,
  ) => {
    setNrecaData((prev) => {
      const next = [...prev];
      next[idx] = { ...next[idx], [field]: val };
      return next;
    });
  };

  const addNrecaYear = () => {
    const last = nrecaData[nrecaData.length - 1];
    const nextYear = last.month === 12 ? last.year + 1 : last.year;
    const nextMonth = last.month === 12 ? 1 : last.month + 1;
    const dpm = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    const rows: NRECAMonthlyInput[] = [];
    let yr = nextYear;
    let mo = nextMonth;
    for (let i = 0; i < 12; i++) {
      rows.push({
        year: yr,
        month: mo,
        days: dpm[mo - 1],
        rainfall: 0,
        pet: 0,
      });
      mo++;
      if (mo > 12) {
        mo = 1;
        yr++;
      }
    }
    setNrecaData((prev) => [...prev, ...rows]);
  };

  // State for inputs
  const [footprintInput, setFootprintInput] = useState<WaterFootprintInput>({
    withdrawal: 0,
    returnFlow: 0,
    sector: "industrial",
  });

  const [stockInput, setStockInput] = useState<WaterStockInput>({
    precipitation: 0,
    evapotranspiration: 0,
    surfaceRunoff: 0,
    totalWithdrawal: 0,
    watershedArea: 0,
  });

  const [creditInput, setCreditInput] = useState<WaterCreditInput>({
    volumeWithProject: 0,
    volumeWithoutProject: 0,
    projectType: "groundwater_recharge",
    fundingContribution: 50,
  });

  const [vwbaInput, setVwbaInput] = useState<VWBAMethodInput>({
    method: "D-1",
    cnPrecipitation: 0,
    cnCurveNumber: 60,
    cnArea: 0,
    cnDays: 365,
    d2Withdrawal: 0,
    d2ReturnFlow: 20,
    d3Option: "metered",
    d3Value1: 0,
    d3Value2: 0,
    d3Value3: 365,
    d4CatchmentArea: 0,
    d4RunoffCoef: 0.85,
    d4Precipitation: 0,
    d4StorageCapacity: 0,
    d4TimesFilled: 1,
    d4Evaporation: 0,
    d4Withdrawal: 0,
    d5Precipitation: 0,
    d5Area: 0,
    d5RunoffCoef: 0.85,
    d5ReductionFactor: 80,
    d6AnnualVolume: 0,
    d6NumChallenges: 1,
    d6Influent: 200,
    d6Effluent: 100,
    d6Target: 50,
  });

  // State for results
  const [results, setResults] = useState<CalculationResults>({});
  const [hasFootprint, setHasFootprint] = useState(false);
  const [hasStock, setHasStock] = useState(false);
  const [hasCredit, setHasCredit] = useState(false);
  const [hasVWBA, setHasVWBA] = useState(false);

  // PDF loading states
  const [pdfLoading, setPdfLoading] = useState({
    footprint: false,
    stock: false,
    credit: false,
    complete: false,
  });

  const allDone = hasFootprint && hasStock && hasCredit;

  // Calculation handlers
  const handleFootprintCalc = () => {
    const result = calculateWaterFootprint(
      footprintInput.withdrawal,
      footprintInput.returnFlow,
      footprintInput.sector,
    );
    setResults((prev) => ({ ...prev, waterFootprint: result }));
    setHasFootprint(true);
  };

  const handleStockCalc = () => {
    const result = calculateWaterStock(
      stockInput.precipitation,
      stockInput.evapotranspiration,
      stockInput.surfaceRunoff,
      stockInput.totalWithdrawal,
      stockInput.watershedArea,
    );
    setResults((prev) => ({ ...prev, waterStock: result }));
    setHasStock(true);
  };

  const handleCreditCalc = () => {
    const result = calculateWaterCredit(
      creditInput.volumeWithProject,
      creditInput.volumeWithoutProject,
      creditInput.fundingContribution,
      creditInput.projectType,
    );
    setResults((prev) => ({ ...prev, waterCredit: result }));
    setHasCredit(true);
  };

  const handleVWBACalc = () => {
    let result = 0;
    let unit = "m³/tahun";
    let description = "";

    switch (vwbaInput.method) {
      case "D-1":
        if (
          vwbaInput.cnPrecipitation &&
          vwbaInput.cnCurveNumber &&
          vwbaInput.cnArea &&
          vwbaInput.cnDays
        ) {
          const dailyRunoff = calculateCurveNumberRunoff(
            vwbaInput.cnPrecipitation,
            vwbaInput.cnCurveNumber,
          );
          result = (dailyRunoff / 1000) * vwbaInput.cnArea * vwbaInput.cnDays;
          description = "Reduced Runoff (Pengurangan Limpasan)";
        }
        break;

      case "D-2":
        if (vwbaInput.d2Withdrawal && vwbaInput.d2ReturnFlow !== undefined) {
          result =
            vwbaInput.d2Withdrawal -
            calculateConsumption(
              vwbaInput.d2Withdrawal,
              vwbaInput.d2ReturnFlow,
            );
          description = "Reduced Consumption (Pengurangan Konsumsi)";
        }
        break;

      case "D-3":
        result = calculateVolumeProvided(
          vwbaInput.d3Option || "metered",
          vwbaInput.d3Value1 || 0,
          vwbaInput.d3Value2 || 0,
          vwbaInput.d3Value3 || 0,
        );
        description = "Volume Provided (Volume Air Tersedia)";
        break;

      case "D-4":
        result = calculateRecharge(
          vwbaInput.d4CatchmentArea || 0,
          vwbaInput.d4RunoffCoef || 0,
          vwbaInput.d4Precipitation || 0,
          vwbaInput.d4StorageCapacity || 0,
          vwbaInput.d4TimesFilled || 1,
          vwbaInput.d4Evaporation || 0,
          vwbaInput.d4Withdrawal || 0,
        );
        description = "Increased Recharge (Peningkatan Imbuhan)";
        break;

      case "D-5":
        result = calculateVolumeCaptured(
          vwbaInput.d5Precipitation || 0,
          vwbaInput.d5Area || 0,
          vwbaInput.d5RunoffCoef || 0,
          vwbaInput.d5ReductionFactor || 0,
        );
        description = "Volume Captured (Volume Tertangkap)";
        break;

      case "D-6":
        result = calculateVolumeTreated(
          vwbaInput.d6AnnualVolume || 0,
          vwbaInput.d6NumChallenges || 1,
          vwbaInput.d6Influent || 0,
          vwbaInput.d6Effluent || 0,
          vwbaInput.d6Target || 0,
        );
        description = "Volume Treated (Volume Terolah)";
        break;
    }

    setResults((prev) => ({
      ...prev,
      vwbaMethod: {
        method: vwbaInput.method,
        result,
        unit,
        description,
      },
    }));
    setHasVWBA(true);
  };

  const handleReset = () => {
    setFootprintInput({ withdrawal: 0, returnFlow: 0, sector: "industrial" });
    setStockInput({
      precipitation: 0,
      evapotranspiration: 0,
      surfaceRunoff: 0,
      totalWithdrawal: 0,
      watershedArea: 0,
    });
    setCreditInput({
      volumeWithProject: 0,
      volumeWithoutProject: 0,
      projectType: "groundwater_recharge",
      fundingContribution: 50,
    });
    setVwbaInput({
      method: "D-1",
      cnPrecipitation: 0,
      cnCurveNumber: 60,
      cnArea: 0,
      cnDays: 365,
      d2Withdrawal: 0,
      d2ReturnFlow: 20,
      d3Option: "metered",
      d3Value1: 0,
      d3Value2: 0,
      d3Value3: 365,
      d4CatchmentArea: 0,
      d4RunoffCoef: 0.85,
      d4Precipitation: 0,
      d4StorageCapacity: 0,
      d4TimesFilled: 1,
      d4Evaporation: 0,
      d4Withdrawal: 0,
      d5Precipitation: 0,
      d5Area: 0,
      d5RunoffCoef: 0.85,
      d5ReductionFactor: 80,
      d6AnnualVolume: 0,
      d6NumChallenges: 1,
      d6Influent: 200,
      d6Effluent: 100,
      d6Target: 50,
    });
    setResults({});
    setHasFootprint(false);
    setHasStock(false);
    setHasCredit(false);
    setHasVWBA(false);
  };

  // PDF generation handlers
  const handleDownload = async (
    type: "footprint" | "stock" | "credit" | "complete",
  ) => {
    setPdfLoading((prev) => ({ ...prev, [type]: true }));

    try {
      if (type === "footprint" && results.waterFootprint) {
        const data: WaterFootprintData = {
          sector: footprintInput.sector,
          withdrawal: footprintInput.withdrawal,
          returnFlow: footprintInput.returnFlow,
          netConsumption: results.waterFootprint.netConsumption,
          blueWater: results.waterFootprint.blueWater,
          status: results.waterFootprint.status,
          category: results.waterFootprint.category,
        };
        await generateWaterFootprintPDF(data, "id");
      } else if (type === "stock" && results.waterStock) {
        const data: WaterStockData = {
          watershedArea: stockInput.watershedArea,
          precipitation: stockInput.precipitation,
          evapotranspiration: stockInput.evapotranspiration,
          surfaceRunoff: stockInput.surfaceRunoff,
          totalWithdrawal: stockInput.totalWithdrawal,
          deltaS: results.waterStock.deltaS,
          status: results.waterStock.status,
          pressureLevel: results.waterStock.pressureLevel,
          recommendation: results.waterStock.recommendation,
          P_vol: results.waterStock.P_vol,
          ET_vol: results.waterStock.ET_vol,
          Q_vol: results.waterStock.Q_vol,
        };
        await generateWaterStockPDF(data, "id");
      } else if (type === "credit" && results.waterCredit) {
        const data: WaterCreditData = {
          projectType: creditInput.projectType,
          volumeWithProject: creditInput.volumeWithProject,
          volumeWithoutProject: creditInput.volumeWithoutProject,
          fundingContribution: creditInput.fundingContribution,
          vwb: results.waterCredit.vwb,
          eligibleCredit: results.waterCredit.eligibleCredit,
          projectImpact: results.waterCredit.projectImpact,
        };
        await generateWaterCreditPDF(data, "id");
      } else if (
        type === "complete" &&
        results.waterFootprint &&
        results.waterStock &&
        results.waterCredit
      ) {
        const data: HydrexReportData = {
          waterFootprint: {
            sector: footprintInput.sector,
            withdrawal: footprintInput.withdrawal,
            returnFlow: footprintInput.returnFlow,
            netConsumption: results.waterFootprint.netConsumption,
            blueWater: results.waterFootprint.blueWater,
            status: results.waterFootprint.status,
            category: results.waterFootprint.category,
          },
          waterStock: {
            watershedArea: stockInput.watershedArea,
            precipitation: stockInput.precipitation,
            evapotranspiration: stockInput.evapotranspiration,
            surfaceRunoff: stockInput.surfaceRunoff,
            totalWithdrawal: stockInput.totalWithdrawal,
            deltaS: results.waterStock.deltaS,
            status: results.waterStock.status,
            pressureLevel: results.waterStock.pressureLevel,
            recommendation: results.waterStock.recommendation,
            P_vol: results.waterStock.P_vol,
            ET_vol: results.waterStock.ET_vol,
            Q_vol: results.waterStock.Q_vol,
          },
          waterCredit: {
            projectType: creditInput.projectType,
            volumeWithProject: creditInput.volumeWithProject,
            volumeWithoutProject: creditInput.volumeWithoutProject,
            fundingContribution: creditInput.fundingContribution,
            vwb: results.waterCredit.vwb,
            eligibleCredit: results.waterCredit.eligibleCredit,
            projectImpact: results.waterCredit.projectImpact,
          },
          language: "id",
          reportDate: new Date().toLocaleDateString("id-ID"),
        };
        await generateCompleteWaterReportPDF(data);
      }
    } catch (error) {
      console.error("Error generating PDF:", error);
      alert("Gagal membuat PDF. Silakan coba lagi.");
    } finally {
      setPdfLoading((prev) => ({ ...prev, [type]: false }));
    }
  };

  // Card style
  const cardStyle: React.CSSProperties = {
    background: `linear-gradient(135deg, ${C.card}, ${C.surface})`,
    border: `1px solid ${C.border}`,
    borderRadius: 16,
    padding: 24,
    marginBottom: 24,
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: `linear-gradient(135deg, ${C.ink}, ${C.card})`,
        padding: "40px 20px",
      }}
    >
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 48 }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 12,
              marginBottom: 16,
            }}
          >
            <Droplets size={40} color={C.ocean} />
            <h1
              style={{
                fontSize: 36,
                fontWeight: 900,
                color: C.text,
                margin: 0,
              }}
            >
              HYDREX VWBA 2.0
            </h1>
          </div>
          <p style={{ color: C.muted, fontSize: 15, margin: 0 }}>
            Volumetric Water Benefit Accounting Calculator
          </p>
          <p style={{ color: C.muted, fontSize: 13, marginTop: 8 }}>
            {language === "id" ? "WRI · LimnoTech · BlueRisk · BEF — Appendix D (D-1 s/d D-9)" : "WRI · LimnoTech · BlueRisk · BEF — Appendix D (D-1 to D-9)"}
          </p>
        </div>

        {/* Tabs */}
        <div
          style={{
            display: "flex",
            gap: 10,
            marginBottom: 28,
            justifyContent: "center",
            flexWrap: "wrap",
          }}
        >
          {(
            [
              {
                id: "footprint",
                label: "Water Footprint",
                icon: Factory,
                color: C.ocean,
              },
              {
                id: "stock",
                label: "Water Stock",
                icon: Activity,
                color: C.teal,
              },
              {
                id: "credit",
                label: "Water Credit",
                icon: CheckCircle,
                color: C.emerald,
              },
              {
                id: "vwba",
                label: "VWBA Methods",
                icon: CloudRain,
                color: C.purple,
              },
              {
                id: "nreca",
                label: "Model NRECA",
                icon: BarChart3,
                color: C.amber,
              },
            ] as const
          ).map((tab) => {
            const active = activeTab === tab.id;
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "11px 22px",
                  borderRadius: 12,
                  cursor: "pointer",
                  border: active
                    ? `1px solid ${tab.color}60`
                    : `1px solid ${C.border}`,
                  background: active
                    ? `linear-gradient(135deg, ${tab.color}22, ${tab.color}0a)`
                    : "transparent",
                  color: active ? tab.color : C.muted,
                  fontSize: 14,
                  fontWeight: active ? 700 : 500,
                  transition: "all 0.2s",
                  boxShadow: active ? `0 0 20px ${tab.color}20` : "none",
                }}
              >
                <Icon size={16} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Reset Button */}
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            marginBottom: 20,
          }}
        >
          <ResetButton onClick={handleReset} />
        </div>

        <AnimatePresence mode="wait">
          {/* TAB 1: WATER FOOTPRINT */}
          {activeTab === "footprint" && (
            <motion.div
              key="footprint"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
            >
              <div style={cardStyle}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    marginBottom: 24,
                  }}
                >
                  <div
                    style={{
                      padding: 10,
                      borderRadius: 12,
                      background: "rgba(14,165,233,0.2)",
                    }}
                  >
                    <Factory size={24} color={C.ocean} />
                  </div>
                  <div>
                    <div
                      style={{ fontSize: 20, fontWeight: 800, color: C.ocean }}
                    >
                      Water Footprint
                    </div>
                    <div style={{ fontSize: 13, color: C.muted }}>
                      {language === "id" ? "D-2 Withdrawal & Consumption — Jejak konsumsi air" : "D-2 Withdrawal & Consumption — Water consumption footprint"}
                    </div>
                  </div>
                </div>

                <FormulaBox
                  formula="Net Consumption = Withdrawal - Return Flow"
                  vars={[
                    [
                      "Withdrawal",
                      language === "id" ? "Total air yang ditarik dari sumber (m³/tahun)" : "Total water withdrawn from source (m³/year)",
                    ],
                    [
                      "Return Flow",
                      language === "id" ? "Air yang dikembalikan ke sumber (m³/tahun)" : "Water returned to source (m³/year)",
                    ],
                    [
                      "Net Consumption",
                      language === "id" ? "Konsumsi bersih/tidak kembali (m³/tahun)" : "Net consumption/non-returned (m³/year)",
                    ],
                    ["Blue Water", language === "id" ? "Air hilang dari sistem hidrologis" : "Water lost from hydrological system"],
                  ]}
                />

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: 16,
                    marginBottom: 20,
                  }}
                >
                  <InputField
                    label="Total Withdrawal"
                    unit={language === "id" ? "m³/tahun" : "m³/year"}
                    value={footprintInput.withdrawal}
                    onChange={(v) =>
                      setFootprintInput((prev) => ({ ...prev, withdrawal: v }))
                    }
                    hint={language === "id" ? "Total air yang ditarik dari sumber air" : "Total water withdrawn from source"}
                  />
                  <InputField
                    label="Return Flow"
                    unit={language === "id" ? "m³/tahun" : "m³/year"}
                    value={footprintInput.returnFlow}
                    onChange={(v) =>
                      setFootprintInput((prev) => ({ ...prev, returnFlow: v }))
                    }
                    hint={language === "id" ? "Air yang dikembalikan ke ekosistem" : "Water returned to ecosystem"}
                  />
                </div>

                <SelectField
                  label={language === "id" ? "Sektor Industri" : "Industry Sector"}
                  value={footprintInput.sector}
                  onChange={(v) =>
                    setFootprintInput((prev) => ({ ...prev, sector: v }))
                  }
                  options={[
                    { value: "industrial", label: language === "id" ? "Industri Manufaktur" : "Manufacturing Industry" },
                    { value: "agriculture", label: language === "id" ? "Pertanian & Irigasi" : "Agriculture & Irrigation" },
                    { value: "mining", label: language === "id" ? "Pertambangan" : "Mining" },
                    { value: "energy", label: language === "id" ? "Energi & Pembangkit" : "Energy & Power" },
                    { value: "commercial", label: language === "id" ? "Komersial & Jasa" : "Commercial & Services" },
                  ]}
                />

                <div style={{ display: "flex", gap: 12 }}>
                  <CalcButton
                    onClick={handleFootprintCalc}
                    label={language === "id" ? "Hitung Water Footprint" : "Calculate Water Footprint"}
                    color={C.ocean}
                  />
                </div>

                <AnimatePresence>
                  {hasFootprint && results.waterFootprint && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      style={{ marginTop: 24 }}
                    >
                      <div
                        style={{
                          display: "grid",
                          gridTemplateColumns: "repeat(3, 1fr)",
                          gap: 12,
                          marginBottom: 16,
                        }}
                      >
                        <ResultCard
                          label="Net Consumption"
                          value={`${fmt(results.waterFootprint.netConsumption)} m³`}
                          color={C.ocean}
                        />
                        <ResultCard
                          label="Blue Water"
                          value={`${fmt(results.waterFootprint.blueWater)} m³`}
                          color={C.teal}
                        />
                        <ResultCard
                          label={language === "id" ? "Kategori" : "Category"}
                          value={results.waterFootprint.category}
                          color={statusColor(results.waterFootprint.category, C)}
                        />
                      </div>
                      <div
                        style={{
                          background: "rgba(14,165,233,0.06)",
                          border: `1px solid ${C.border}`,
                          borderRadius: 10,
                          padding: "14px 16px",
                        }}
                      >
                        <div
                          style={{ display: "flex", gap: 8, marginBottom: 8 }}
                        >
                          <Info
                            size={15}
                            color={C.ocean}
                            style={{ flexShrink: 0 }}
                          />
                          <strong style={{ fontSize: 13, color: C.ocean }}>
                            Status
                          </strong>
                        </div>
                        <div
                          style={{
                            fontSize: 12,
                            color: C.muted,
                            lineHeight: 1.8,
                          }}
                        >
                          {results.waterFootprint.status}
                        </div>
                      </div>
                      <div style={{ marginTop: 16 }}>
                        <DownloadButton
                          onClick={() => handleDownload("footprint")}
                          label={language === "id" ? "Unduh Water Footprint PDF" : "Download Water Footprint PDF"}
                          loading={pdfLoading.footprint}
                          color={C.ocean}
                        />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          )}

          {/* TAB 2: WATER STOCK */}
          {activeTab === "stock" && (
            <motion.div
              key="stock"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
            >
              <div style={cardStyle}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    marginBottom: 24,
                  }}
                >
                  <div
                    style={{
                      padding: 10,
                      borderRadius: 12,
                      background: "rgba(20,184,166,0.2)",
                    }}
                  >
                    <Activity size={24} color={C.teal} />
                  </div>
                  <div>
                    <div
                      style={{ fontSize: 20, fontWeight: 800, color: C.teal }}
                    >
                      Water Stock (DAS)
                    </div>
                    <div style={{ fontSize: 13, color: C.muted }}>
                      {language === "id" ? "Simplified Water Balance — Keseimbangan hidrologi DAS" : "Simplified Water Balance — Watershed hydrological balance"}
                    </div>
                  </div>
                </div>

                <FormulaBox
                  formula="ΔS = P - ET - Q - W"
                  vars={[
                    ["ΔS", language === "id" ? "Perubahan stok air DAS (m³/tahun)" : "Watershed water stock change (m³/year)"],
                    ["P", language === "id" ? "Presipitasi total (mm/tahun)" : "Total precipitation (mm/year)"],
                    ["ET", language === "id" ? "Evapotranspirasi (mm/tahun)" : "Evapotranspiration (mm/year)"],
                    ["Q", language === "id" ? "Surface runoff (mm/tahun)" : "Surface runoff (mm/year)"],
                    ["W", language === "id" ? "Total withdrawal dari DAS (m³/tahun)" : "Total withdrawal from watershed (m³/year)"],
                  ]}
                />

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(2, 1fr)",
                    gap: 16,
                    marginBottom: 20,
                  }}
                >
                  <InputField
                    label="Presipitasi (P)"
                    unit={language === "id" ? "mm/tahun" : "mm/year"}
                    value={stockInput.precipitation}
                    onChange={(v) =>
                      setStockInput((prev) => ({ ...prev, precipitation: v }))
                    }
                    hint={language === "id" ? "Curah hujan tahunan di DAS" : "Annual rainfall in watershed"}
                  />
                  <InputField
                    label="Evapotranspirasi (ET)"
                    unit={language === "id" ? "mm/tahun" : "mm/year"}
                    value={stockInput.evapotranspiration}
                    onChange={(v) =>
                      setStockInput((prev) => ({
                        ...prev,
                        evapotranspiration: v,
                      }))
                    }
                    hint={language === "id" ? "Penguapan dari tanah + transpirasi tanaman" : "Evaporation from soil + plant transpiration"}
                  />
                  <InputField
                    label="Surface Runoff (Q)"
                    unit={language === "id" ? "mm/tahun" : "mm/year"}
                    value={stockInput.surfaceRunoff}
                    onChange={(v) =>
                      setStockInput((prev) => ({ ...prev, surfaceRunoff: v }))
                    }
                    hint={language === "id" ? "Limpasan permukaan tahunan" : "Annual surface runoff"}
                  />
                  <InputField
                    label="Total Withdrawal (W)"
                    unit={language === "id" ? "m³/tahun" : "m³/year"}
                    value={stockInput.totalWithdrawal}
                    onChange={(v) =>
                      setStockInput((prev) => ({ ...prev, totalWithdrawal: v }))
                    }
                    hint={language === "id" ? "Total pengambilan air dari DAS" : "Total water withdrawal from watershed"}
                  />
                  <InputField
                    label="Watershed Area"
                    unit="km²"
                    value={stockInput.watershedArea}
                    onChange={(v) =>
                      setStockInput((prev) => ({ ...prev, watershedArea: v }))
                    }
                    hint={language === "id" ? "Luas DAS untuk konversi volume" : "Watershed area for volume conversion"}
                  />
                </div>

                <div style={{ display: "flex", gap: 12 }}>
                  <CalcButton
                    onClick={handleStockCalc}
                    label={language === "id" ? "Hitung Water Stock" : "Calculate Water Stock"}
                    color={C.teal}
                  />
                </div>

                <AnimatePresence>
                  {hasStock && results.waterStock && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      style={{ marginTop: 24 }}
                    >
                      <div
                        style={{
                          display: "grid",
                          gridTemplateColumns: "repeat(4, 1fr)",
                          gap: 12,
                          marginBottom: 16,
                        }}
                      >
                        <ResultCard
                          label={language === "id" ? "ΔS (Perubahan Stok)" : "ΔS (Stock Change)"}
                          value={`${results.waterStock.deltaS >= 0 ? "+" : ""}${fmt(results.waterStock.deltaS)} m³`}
                          color={
                            results.waterStock.deltaS >= 0 ? C.emerald : C.rose
                          }
                        />
                        <ResultCard
                          label={language === "id" ? "Status DAS" : "Watershed Status"}
                          value={results.waterStock.status}
                          color={statusColor(results.waterStock.status, C)}
                        />
                        <ResultCard
                          label={language === "id" ? "Tekanan" : "Pressure Level"}
                          value={results.waterStock.pressureLevel}
                          color={statusColor(results.waterStock.pressureLevel, C)}
                        />
                        <ResultCard
                          label="P Volume"
                          value={`${fmt(results.waterStock.P_vol)} m³`}
                          color={C.teal}
                          sub={language === "id" ? "Presipitasi total" : "Total Precipitation"}
                        />
                      </div>
                      <div
                        style={{
                          background: "rgba(20,184,166,0.06)",
                          border: `1px solid ${C.border}`,
                          borderRadius: 10,
                          padding: "14px 16px",
                        }}
                      >
                        <div
                          style={{ display: "flex", gap: 8, marginBottom: 8 }}
                        >
                          <Info
                            size={15}
                            color={C.teal}
                            style={{ flexShrink: 0 }}
                          />
                          <strong style={{ fontSize: 13, color: C.teal }}>
                            {language === "id" ? "Rekomendasi" : "Recommendation"}
                          </strong>
                        </div>
                        <div
                          style={{
                            fontSize: 12,
                            color: C.muted,
                            lineHeight: 1.8,
                          }}
                        >
                          {results.waterStock.recommendation}
                        </div>
                      </div>
                      <div style={{ marginTop: 16 }}>
                        <DownloadButton
                          onClick={() => handleDownload("stock")}
                          label={language === "id" ? "Unduh Water Stock PDF" : "Download Water Stock PDF"}
                          loading={pdfLoading.stock}
                          color={C.teal}
                        />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          )}

          {/* TAB 3: WATER CREDIT */}
          {activeTab === "credit" && (
            <motion.div
              key="credit"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
            >
              <div style={cardStyle}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    marginBottom: 24,
                  }}
                >
                  <div
                    style={{
                      padding: 10,
                      borderRadius: 12,
                      background: "rgba(16,185,129,0.2)",
                    }}
                  >
                    <CheckCircle size={24} color={C.emerald} />
                  </div>
                  <div>
                    <div
                      style={{
                        fontSize: 20,
                        fontWeight: 800,
                        color: C.emerald,
                      }}
                    >
                      Water Credit (VWB)
                    </div>
                    <div style={{ fontSize: 13, color: C.muted }}>
                      {language === "id" ? "Volumetric Water Benefit dari proyek konservasi" : "Volumetric Water Benefit from conservation projects"}
                    </div>
                  </div>
                </div>

                <FormulaBox
                  formula="VWB = V(with-project) - V(without-project)"
                  vars={[
                    ["VWB", language === "id" ? "Volumetric Water Benefit (m³/tahun)" : "Volumetric Water Benefit (m³/year)"],
                    ["V(with)", language === "id" ? "Volume air dengan intervensi proyek" : "Water volume with project intervention"],
                    ["V(without)", language === "id" ? "Volume baseline tanpa proyek" : "Baseline volume without project"],
                    ["Eligible Credit", language === "id" ? "VWB × (% Kontribusi / 100)" : "VWB × (% Contribution / 100)"],
                  ]}
                />

                <SelectField
                  label={language === "id" ? "Tipe Proyek VWBA" : "VWBA Project Type"}
                  value={creditInput.projectType}
                  onChange={(v) =>
                    setCreditInput((prev) => ({ ...prev, projectType: v }))
                  }
                  options={PROJECT_TYPES}
                />

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(2, 1fr)",
                    gap: 16,
                    marginBottom: 20,
                  }}
                >
                  <InputField
                    label="Volume With Project"
                    unit={language === "id" ? "m³/tahun" : "m³/year"}
                    value={creditInput.volumeWithProject}
                    onChange={(v) =>
                      setCreditInput((prev) => ({
                        ...prev,
                        volumeWithProject: v,
                      }))
                    }
                    hint={language === "id" ? "Volume air dengan intervensi" : "Water volume with intervention"}
                  />
                  <InputField
                    label="Volume Without Project (Baseline)"
                    unit={language === "id" ? "m³/tahun" : "m³/year"}
                    value={creditInput.volumeWithoutProject}
                    onChange={(v) =>
                      setCreditInput((prev) => ({
                        ...prev,
                        volumeWithoutProject: v,
                      }))
                    }
                    hint={language === "id" ? "Volume tanpa proyek (baseline)" : "Volume without project (baseline)"}
                  />
                </div>

                <div style={{ marginBottom: 20 }}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      marginBottom: 8,
                    }}
                  >
                    <label
                      style={{ color: C.text, fontSize: 13, fontWeight: 600 }}
                    >
                      Funding Contribution
                    </label>
                    <span
                      style={{
                        color: C.emerald,
                        fontWeight: 700,
                        fontSize: 15,
                      }}
                    >
                      {creditInput.fundingContribution}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={creditInput.fundingContribution}
                    onChange={(e) =>
                      setCreditInput((prev) => ({
                        ...prev,
                        fundingContribution: parseFloat(e.target.value),
                      }))
                    }
                    style={{
                      width: "100%",
                      accentColor: C.emerald,
                      cursor: "pointer",
                    }}
                  />
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      color: C.muted,
                      fontSize: 11,
                      marginTop: 4,
                    }}
                  >
                    <span>0%</span>
                    <span>50%</span>
                    <span>100%</span>
                  </div>
                </div>

                <div style={{ display: "flex", gap: 12 }}>
                  <CalcButton
                    onClick={handleCreditCalc}
                    label={language === "id" ? "Hitung Water Credit" : "Calculate Water Credit"}
                    color={C.emerald}
                  />
                </div>

                <AnimatePresence>
                  {hasCredit && results.waterCredit && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      style={{ marginTop: 24 }}
                    >
                      <div
                        style={{
                          display: "grid",
                          gridTemplateColumns: "repeat(3, 1fr)",
                          gap: 12,
                          marginBottom: 16,
                        }}
                      >
                        <ResultCard
                          label="VWB"
                          value={`${results.waterCredit.vwb >= 0 ? "+" : ""}${fmt(results.waterCredit.vwb)} m³/thn`}
                          color={
                            results.waterCredit.vwb >= 0 ? C.emerald : C.rose
                          }
                          sub="Volumetric Water Benefit"
                        />
                        <ResultCard
                          label="Eligible Water Credit"
                          value={`${fmt(results.waterCredit.eligibleCredit)} m³/thn`}
                          color={C.emerald}
                          sub={language === "id" ? `${creditInput.fundingContribution}% kontribusi pendanaan` : `${creditInput.fundingContribution}% funding contribution`}
                        />
                        <ResultCard
                          label={language === "id" ? "Dampak Proyek" : "Project Impact"}
                          value={
                            results.waterCredit.projectImpact.split("—")[0]
                          }
                          color={statusColor(results.waterCredit.projectImpact, C)}
                          sub={results.waterCredit.projectImpact
                            .split("—")[1]
                            ?.trim()}
                        />
                      </div>
                      <div
                        style={{
                          background: "rgba(16,185,129,0.06)",
                          border: `1px solid ${C.border}`,
                          borderRadius: 10,
                          padding: "14px 16px",
                        }}
                      >
                        <div
                          style={{ display: "flex", gap: 8, marginBottom: 8 }}
                        >
                          <Info
                            size={15}
                            color={C.emerald}
                            style={{ flexShrink: 0 }}
                          />
                          <strong style={{ fontSize: 13, color: C.emerald }}>
                            {language === "id" ? "Persyaratan VWBA 2.0" : "VWBA 2.0 Requirements"}
                          </strong>
                        </div>
                        <div
                          style={{
                            fontSize: 12,
                            color: C.muted,
                            lineHeight: 1.8,
                          }}
                        >
                          ① Setiap kredit dicatat dalam registry dan hanya dapat
                          digunakan sekali (retirement) &nbsp; ② Transaksi
                          kredit hanya dalam DAS yang sama atau memiliki
                          konektivitas hidrologis &nbsp; ③ Baseline
                          terverifikasi dan metode kuantifikasi terdokumentasi
                          &nbsp; ④ Verifikasi independen diperlukan untuk
                          validasi kredit
                        </div>
                      </div>
                      <div style={{ marginTop: 16 }}>
                        <DownloadButton
                          onClick={() => handleDownload("credit")}
                          label={language === "id" ? "Unduh Water Credit PDF" : "Download Water Credit PDF"}
                          loading={pdfLoading.credit}
                          color={C.emerald}
                        />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          )}

          {/* TAB 4: VWBA METHODS */}
          {activeTab === "vwba" && (
            <motion.div
              key="vwba"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
            >
              <div
                style={{
                  ...cardStyle,
                  borderColor: "rgba(167,139,250,0.35)",
                  background:
                    "linear-gradient(135deg, rgba(167,139,250,0.08), rgba(14,165,233,0.05))",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    marginBottom: 24,
                  }}
                >
                  <div
                    style={{
                      padding: 10,
                      borderRadius: 12,
                      background: "rgba(167,139,250,0.2)",
                    }}
                  >
                    <CloudRain size={24} color={C.purple} />
                  </div>
                  <div>
                    <div
                      style={{ fontSize: 20, fontWeight: 800, color: C.purple }}
                    >
                      VWBA Methods (Appendix D)
                    </div>
                    <div style={{ fontSize: 13, color: C.muted }}>
                      {language === "id" ? "Metode perhitungan D-1 sampai D-6" : "Calculation methods D-1 to D-6"}
                    </div>
                  </div>
                </div>

                <SelectField
                  label={language === "id" ? "Pilih Metode VWBA" : "Select VWBA Method"}
                  value={vwbaInput.method}
                  onChange={(v) =>
                    setVwbaInput((prev) => ({ ...prev, method: v }))
                  }
                  options={[
                    {
                      value: "D-1",
                      label: "D-1: Curve Number Method (Runoff Reduction)",
                    },
                    { value: "D-2", label: "D-2: Withdrawal & Consumption" },
                    { value: "D-3", label: "D-3: Volume Provided (WASH)" },
                    { value: "D-4", label: "D-4: Recharge Method" },
                    {
                      value: "D-5",
                      label: "D-5: Volume Captured (Stormwater)",
                    },
                    { value: "D-6", label: "D-6: Volume Treated (Wastewater)" },
                  ]}
                />

                {/* D-1: Curve Number */}
                {vwbaInput.method === "D-1" && (
                  <div style={{ marginTop: 20 }}>
                    <FormulaBox
                      formula="Q = (P - 0.2S)² / (P + 0.8S)    where S = (25400/CN) - 254"
                      vars={[
                        ["Q", "Runoff harian (mm)"],
                        ["P", "Presipitasi harian (mm)"],
                        ["CN", "Curve Number (30-98)"],
                        ["S", "Potensi retensi maksimum (mm)"],
                      ]}
                    />
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(2, 1fr)",
                        gap: 16,
                      }}
                    >
                      <InputField
                        label="Daily Precipitation"
                        unit="mm/hari"
                        value={vwbaInput.cnPrecipitation || 0}
                        onChange={(v) =>
                          setVwbaInput((prev) => ({
                            ...prev,
                            cnPrecipitation: v,
                          }))
                        }
                      />
                      <InputField
                        label="Curve Number (CN)"
                        unit="30-98"
                        value={vwbaInput.cnCurveNumber || 60}
                        onChange={(v) =>
                          setVwbaInput((prev) => ({
                            ...prev,
                            cnCurveNumber: v,
                          }))
                        }
                        hint="Forest:36-60, Grassland:39-61, Agriculture:67-81, Urban:98"
                      />
                      <InputField
                        label="Surface Area"
                        unit="m²"
                        value={vwbaInput.cnArea || 0}
                        onChange={(v) =>
                          setVwbaInput((prev) => ({ ...prev, cnArea: v }))
                        }
                      />
                      <InputField
                        label="Days per Year"
                        unit={language === "id" ? "hari" : "days"}
                        value={vwbaInput.cnDays || 365}
                        onChange={(v) =>
                          setVwbaInput((prev) => ({ ...prev, cnDays: v }))
                        }
                      />
                    </div>
                  </div>
                )}

                {/* D-2: Consumption */}
                {vwbaInput.method === "D-2" && (
                  <div style={{ marginTop: 20 }}>
                    <FormulaBox
                      formula="Consumption = Withdrawal × (1 - Return Flow %)"
                      vars={[
                        ["Withdrawal", language === "id" ? "Total air yang ditarik (m³/tahun)" : "Total water withdrawn (m³/year)"],
                        ["Return Flow", language === "id" ? "Persentase air kembali ke sumber" : "Percentage of water returned to source"],
                        ["Consumption", language === "id" ? "Konsumsi bersih (m³/tahun)" : "Net consumption (m³/year)"],
                      ]}
                    />
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(2, 1fr)",
                        gap: 16,
                      }}
                    >
                      <InputField
                        label="Withdrawal Volume"
                        unit={language === "id" ? "m³/tahun" : "m³/year"}
                        value={vwbaInput.d2Withdrawal || 0}
                        onChange={(v) =>
                          setVwbaInput((prev) => ({ ...prev, d2Withdrawal: v }))
                        }
                      />
                      <InputField
                        label="Return Flow Fraction"
                        unit="%"
                        value={vwbaInput.d2ReturnFlow || 20}
                        onChange={(v) =>
                          setVwbaInput((prev) => ({ ...prev, d2ReturnFlow: v }))
                        }
                        hint="Flood:30%, Sprinkler:15%, Drip:5%"
                      />
                    </div>
                  </div>
                )}

                {/* D-3: Volume Provided */}
                {vwbaInput.method === "D-3" && (
                  <div style={{ marginTop: 20 }}>
                    <FormulaBox
                      formula="Volume = Option based (Metered / Capacity / Beneficiaries)"
                      vars={[
                        ["Metered", language === "id" ? "Data terukur langsung (m³/tahun)" : "Directly measured data (m³/year)"],
                        ["Capacity", language === "id" ? "Kapasitas × Operating Time × Days" : "Capacity × Operating Time × Days"],
                        [
                          "Beneficiaries",
                          language === "id" ? "Jumlah × L/person/day × Days / 1000" : "Count × L/person/day × Days / 1000",
                        ],
                      ]}
                    />
                    <SelectField
                      label="Calculation Option"
                      value={vwbaInput.d3Option || "metered"}
                      onChange={(v) =>
                        setVwbaInput((prev) => ({ ...prev, d3Option: v }))
                      }
                      options={[
                        { value: "metered", label: "Option 1: Metered Data" },
                        {
                          value: "capacity",
                          label: "Option 2: System Capacity",
                        },
                        {
                          value: "beneficiaries",
                          label: "Option 3: Beneficiaries",
                        },
                      ]}
                    />
                    {vwbaInput.d3Option === "metered" && (
                      <InputField
                        label="Metered Volume"
                        unit={language === "id" ? "m³/tahun" : "m³/year"}
                        value={vwbaInput.d3Value1 || 0}
                        onChange={(v) =>
                          setVwbaInput((prev) => ({ ...prev, d3Value1: v }))
                        }
                      />
                    )}
                    {vwbaInput.d3Option === "capacity" && (
                      <div
                        style={{
                          display: "grid",
                          gridTemplateColumns: "repeat(3, 1fr)",
                          gap: 16,
                        }}
                      >
                        <InputField
                          label="System Capacity"
                          unit="m³/day"
                          value={vwbaInput.d3Value1 || 0}
                          onChange={(v) =>
                            setVwbaInput((prev) => ({ ...prev, d3Value1: v }))
                          }
                        />
                        <InputField
                          label="Operating Time"
                          unit="hours/day"
                          value={vwbaInput.d3Value2 || 0}
                          onChange={(v) =>
                            setVwbaInput((prev) => ({ ...prev, d3Value2: v }))
                          }
                        />
                        <InputField
                          label="Days Active"
                          unit="days/year"
                          value={vwbaInput.d3Value3 || 365}
                          onChange={(v) =>
                            setVwbaInput((prev) => ({ ...prev, d3Value3: v }))
                          }
                        />
                      </div>
                    )}
                    {vwbaInput.d3Option === "beneficiaries" && (
                      <div
                        style={{
                          display: "grid",
                          gridTemplateColumns: "repeat(3, 1fr)",
                          gap: 16,
                        }}
                      >
                        <InputField
                          label="Number of Beneficiaries"
                          unit={language === "id" ? "orang" : "people"}
                          value={vwbaInput.d3Value1 || 0}
                          onChange={(v) =>
                            setVwbaInput((prev) => ({ ...prev, d3Value1: v }))
                          }
                        />
                        <InputField
                          label="Per Capita Volume"
                          unit="L/person/day"
                          value={vwbaInput.d3Value2 || 20}
                          onChange={(v) =>
                            setVwbaInput((prev) => ({ ...prev, d3Value2: v }))
                          }
                          hint="WHO standard: 20 L/person/day"
                        />
                        <InputField
                          label="Days of Access"
                          unit="days/year"
                          value={vwbaInput.d3Value3 || 365}
                          onChange={(v) =>
                            setVwbaInput((prev) => ({ ...prev, d3Value3: v }))
                          }
                        />
                      </div>
                    )}
                  </div>
                )}

                {/* D-4: Recharge */}
                {vwbaInput.method === "D-4" && (
                  <div style={{ marginTop: 20 }}>
                    <FormulaBox
                      formula="Recharge = min(Supply, Storage) - Evaporation - Withdrawal"
                      vars={[
                        ["Supply", "Catchment × Runoff Coef × Precipitation"],
                        ["Storage", "Design Capacity × Times Filled"],
                        ["Recharge", "Volume recharged to groundwater (m³)"],
                      ]}
                    />
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(2, 1fr)",
                        gap: 16,
                      }}
                    >
                      <InputField
                        label="Catchment Area"
                        unit="m²"
                        value={vwbaInput.d4CatchmentArea || 0}
                        onChange={(v) =>
                          setVwbaInput((prev) => ({
                            ...prev,
                            d4CatchmentArea: v,
                          }))
                        }
                      />
                      <InputField
                        label="Runoff Coefficient"
                        unit="0-1"
                        value={vwbaInput.d4RunoffCoef || 0.85}
                        onChange={(v) =>
                          setVwbaInput((prev) => ({ ...prev, d4RunoffCoef: v }))
                        }
                        hint="Concrete:0.85, Metal roof:0.90, Lawn:0.20"
                      />
                      <InputField
                        label="Annual Precipitation"
                        unit="mm/year"
                        value={vwbaInput.d4Precipitation || 0}
                        onChange={(v) =>
                          setVwbaInput((prev) => ({
                            ...prev,
                            d4Precipitation: v,
                          }))
                        }
                      />
                      <InputField
                        label="Storage Capacity"
                        unit="m³"
                        value={vwbaInput.d4StorageCapacity || 0}
                        onChange={(v) =>
                          setVwbaInput((prev) => ({
                            ...prev,
                            d4StorageCapacity: v,
                          }))
                        }
                      />
                      <InputField
                        label="Times Filled/Year"
                        unit={language === "id" ? "kali" : "times"}
                        value={vwbaInput.d4TimesFilled || 1}
                        onChange={(v) =>
                          setVwbaInput((prev) => ({
                            ...prev,
                            d4TimesFilled: v,
                          }))
                        }
                      />
                      <InputField
                        label="Evaporation Loss"
                        unit="m³/year"
                        value={vwbaInput.d4Evaporation || 0}
                        onChange={(v) =>
                          setVwbaInput((prev) => ({
                            ...prev,
                            d4Evaporation: v,
                          }))
                        }
                      />
                      <InputField
                        label="Withdrawal Loss"
                        unit="m³/year"
                        value={vwbaInput.d4Withdrawal || 0}
                        onChange={(v) =>
                          setVwbaInput((prev) => ({ ...prev, d4Withdrawal: v }))
                        }
                      />
                    </div>
                  </div>
                )}

                {/* D-5: Volume Captured */}
                {vwbaInput.method === "D-5" && (
                  <div style={{ marginTop: 20 }}>
                    <FormulaBox
                      formula="Volume Captured = Supply × Reduction Factor"
                      vars={[
                        ["Supply", "(Precipitation/1000) × Area × Runoff Coef"],
                        ["Reduction Factor", "BMP-specific percentage (%)"],
                        ["Volume Captured", "Stormwater captured by BMP (m³)"],
                      ]}
                    />
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(2, 1fr)",
                        gap: 16,
                      }}
                    >
                      <InputField
                        label="Annual Precipitation"
                        unit="mm/year"
                        value={vwbaInput.d5Precipitation || 0}
                        onChange={(v) =>
                          setVwbaInput((prev) => ({
                            ...prev,
                            d5Precipitation: v,
                          }))
                        }
                      />
                      <InputField
                        label="Catchment Area"
                        unit="m²"
                        value={vwbaInput.d5Area || 0}
                        onChange={(v) =>
                          setVwbaInput((prev) => ({ ...prev, d5Area: v }))
                        }
                      />
                      <InputField
                        label="Runoff Coefficient"
                        unit="0-1"
                        value={vwbaInput.d5RunoffCoef || 0.85}
                        onChange={(v) =>
                          setVwbaInput((prev) => ({ ...prev, d5RunoffCoef: v }))
                        }
                      />
                      <InputField
                        label="BMP Reduction Factor"
                        unit="%"
                        value={vwbaInput.d5ReductionFactor || 80}
                        onChange={(v) =>
                          setVwbaInput((prev) => ({
                            ...prev,
                            d5ReductionFactor: v,
                          }))
                        }
                        hint="Bioretention:80%, Rain garden:75%, Permeable:90%"
                      />
                    </div>
                  </div>
                )}

                {/* D-6: Volume Treated */}
                {vwbaInput.method === "D-6" && (
                  <div style={{ marginTop: 20 }}>
                    <FormulaBox
                      formula="VWB = Annual Volume × (1/N) × Fraction Improved"
                      vars={[
                        ["Annual Volume", language === "id" ? "Volume air terolah per tahun (m³)" : "Water volume treated per year (m³)"],
                        ["N", language === "id" ? "Jumlah tantangan kualitas air" : "Number of water quality challenges"],
                        [
                          "Fraction Improved",
                          "(Influent - Effluent) / (Influent - Target)",
                        ],
                      ]}
                    />
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(2, 1fr)",
                        gap: 16,
                      }}
                    >
                      <InputField
                        label="Annual Volume Treated"
                        unit="m³/year"
                        value={vwbaInput.d6AnnualVolume || 0}
                        onChange={(v) =>
                          setVwbaInput((prev) => ({
                            ...prev,
                            d6AnnualVolume: v,
                          }))
                        }
                      />
                      <InputField
                        label="Number of Challenges"
                        unit={language === "id" ? "jumlah" : "count"}
                        value={vwbaInput.d6NumChallenges || 1}
                        onChange={(v) =>
                          setVwbaInput((prev) => ({
                            ...prev,
                            d6NumChallenges: v,
                          }))
                        }
                      />
                      <InputField
                        label="Influent Concentration"
                        unit="mg/L"
                        value={vwbaInput.d6Influent || 200}
                        onChange={(v) =>
                          setVwbaInput((prev) => ({ ...prev, d6Influent: v }))
                        }
                        hint="TSS typical: 200 mg/L"
                      />
                      <InputField
                        label="Effluent Concentration"
                        unit="mg/L"
                        value={vwbaInput.d6Effluent || 100}
                        onChange={(v) =>
                          setVwbaInput((prev) => ({ ...prev, d6Effluent: v }))
                        }
                      />
                      <InputField
                        label="Target Concentration"
                        unit="mg/L"
                        value={vwbaInput.d6Target || 50}
                        onChange={(v) =>
                          setVwbaInput((prev) => ({ ...prev, d6Target: v }))
                        }
                        hint="TSS target: 50 mg/L"
                      />
                    </div>
                  </div>
                )}

                <div style={{ display: "flex", gap: 12, marginTop: 20 }}>
                  <CalcButton
                    onClick={handleVWBACalc}
                    label={language === "id" ? "Hitung VWB Method" : "Calculate VWB Method"}
                    color={C.purple}
                  />
                </div>

                <AnimatePresence>
                  {hasVWBA && results.vwbaMethod && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      style={{ marginTop: 24 }}
                    >
                      <div
                        style={{
                          display: "grid",
                          gridTemplateColumns: "1fr 1fr 1fr",
                          gap: 12,
                        }}
                      >
                        <ResultCard
                          label="Method"
                          value={results.vwbaMethod.method}
                          color={C.purple}
                        />
                        <ResultCard
                          label="Result"
                          value={`${fmt(results.vwbaMethod.result)} ${results.vwbaMethod.unit}`}
                          color={C.emerald}
                        />
                        <ResultCard
                          label="Indicator"
                          value={results.vwbaMethod.description.split("(")[0]}
                          color={C.ocean}
                          sub={results.vwbaMethod.description
                            .split("(")[1]
                            ?.replace(")", "")}
                        />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          )}
          {/* TAB 5: MODEL NRECA */}
          {activeTab === "nreca" && (
            <motion.div
              key="nreca"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
            >
              {/* Sub-tab bar */}
              <div
                style={{
                  display: "flex",
                  gap: 8,
                  marginBottom: 20,
                  flexWrap: "wrap",
                }}
              >
                {(
                  [
                    { key: "params", label: t("nreca_tab_params") },
                    { key: "data", label: t("nreca_tab_data") },
                    { key: "results", label: t("nreca_tab_results") },
                    { key: "charts", label: t("nreca_tab_charts") },
                  ] as const
                ).map((st) => (
                  <button
                    key={st.key}
                    onClick={() => setNrecaSubTab(st.key)}
                    style={{
                      background:
                        nrecaSubTab === st.key
                          ? `linear-gradient(135deg, ${C.amber}, ${C.amber}cc)`
                          : "rgba(245,158,11,0.08)",
                      color: nrecaSubTab === st.key ? "#fff" : C.muted,
                      border: `1px solid ${nrecaSubTab === st.key ? "transparent" : C.border}`,
                      borderRadius: 9,
                      padding: "9px 18px",
                      fontSize: 13,
                      fontWeight: 600,
                      cursor: "pointer",
                      transition: "all 0.2s",
                    }}
                  >
                    {st.label}
                  </button>
                ))}
                <button
                  onClick={handleNRECAReset}
                  style={{
                    marginLeft: "auto",
                    background: "transparent",
                    color: C.muted,
                    border: `1px solid ${C.border}`,
                    borderRadius: 9,
                    padding: "9px 14px",
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                  }}
                >
                  <RefreshCw size={13} /> {t("nreca_reset")}
                </button>
              </div>

              {/* ── SUB-TAB: PARAMETER ── */}
              {nrecaSubTab === "params" && (
                <div
                  style={{ ...cardStyle, borderColor: "rgba(245,158,11,0.25)" }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 12,
                      marginBottom: 24,
                    }}
                  >
                    <div
                      style={{
                        padding: 10,
                        borderRadius: 12,
                        background: "rgba(245,158,11,0.15)",
                      }}
                    >
                      <Activity size={22} color={C.amber} />
                    </div>
                    <div>
                      <div
                        style={{
                          fontSize: 20,
                          fontWeight: 800,
                          color: C.amber,
                        }}
                      >
                        {t("nreca_params_title")}
                      </div>
                      <div style={{ fontSize: 13, color: C.muted }}>
                        {t("nreca_params_subtitle")}
                      </div>
                    </div>
                  </div>

                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: 32,
                    }}
                  >
                    {/* Left: sliders */}
                    <div>
                      <div
                        style={{
                          fontSize: 11,
                          color: C.muted,
                          fontWeight: 700,
                          textTransform: "uppercase",
                          letterSpacing: 1.2,
                          marginBottom: 14,
                        }}
                      >
                        {t("nreca_params_main")} / Main Parameters
                      </div>

                      {/* PSUB slider */}
                      {[
                        {
                          key: "PSUB" as const,
                          label: "PSUB — Percent Subsurface",
                          min: 0.3,
                          max: 0.9,
                          hint: t("nreca_psub_hint"),
                        },
                        {
                          key: "GWF" as const,
                          label: "GWF — Groundwater Flow Factor",
                          min: 0.2,
                          max: 0.8,
                          hint: t("nreca_gwf_hint"),
                        },
                        {
                          key: "Cr" as const,
                          label: t("nreca_cr_label"),
                          min: 0.4,
                          max: 0.9,
                          hint: t("nreca_cr_hint"),
                        },
                      ].map((p) => (
                        <div key={p.key} style={{ marginBottom: 18 }}>
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              marginBottom: 5,
                            }}
                          >
                            <label
                              style={{
                                color: C.text,
                                fontSize: 13,
                                fontWeight: 600,
                              }}
                            >
                              {p.label}
                            </label>
                            <span
                              style={{
                                color: C.amber,
                                fontWeight: 700,
                                fontFamily: "monospace",
                                fontSize: 14,
                              }}
                            >
                              {nrecaParams[p.key].toFixed(2)}
                            </span>
                          </div>
                          <input
                            type="range"
                            min={p.min}
                            max={p.max}
                            step={0.01}
                            value={nrecaParams[p.key]}
                            onChange={(e) =>
                              setNrecaParams((prev) => ({
                                ...prev,
                                [p.key]: parseFloat(e.target.value),
                              }))
                            }
                            style={{
                              width: "100%",
                              accentColor: C.amber,
                              cursor: "pointer",
                            }}
                          />
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              marginTop: 3,
                            }}
                          >
                            <span style={{ color: C.muted, fontSize: 10 }}>
                              {p.min}
                            </span>
                            <span style={{ color: C.muted, fontSize: 10 }}>
                              {p.hint}
                            </span>
                            <span style={{ color: C.muted, fontSize: 10 }}>
                              {p.max}
                            </span>
                          </div>
                        </div>
                      ))}

                      <div
                        style={{
                          display: "grid",
                          gridTemplateColumns: "1fr 1fr",
                          gap: 12,
                        }}
                      >
                        {[
                          {
                            key: "Wo_i" as const,
                            label: "Wo-i (Initial Moisture)",
                            unit: "mm",
                            hint: "Initial Moisture Storage",
                          },
                          {
                            key: "Gw_i" as const,
                            label: "Gw-i (Initial GW Storage)",
                            unit: "mm",
                            hint: "Initial Groundwater Storage",
                          },
                          {
                            key: "Ra" as const,
                            label: "Ra — Rata² Hujan Tahunan",
                            unit: "mm/thn",
                            hint: `Nom = ${(100 + 0.2 * nrecaParams.Ra).toFixed(0)} mm`,
                          },
                          {
                            key: "A" as const,
                            label: "A — Luas DAS (Catchment)",
                            unit: "km²",
                            hint: "",
                          },
                        ].map((f) => (
                          <div key={f.key} style={{ marginBottom: 16 }}>
                            <div
                              style={{
                                display: "flex",
                                justifyContent: "space-between",
                                marginBottom: 5,
                              }}
                            >
                              <label
                                style={{
                                  color: C.text,
                                  fontSize: 12,
                                  fontWeight: 600,
                                }}
                              >
                                {f.label}
                              </label>
                              <span style={{ color: C.muted, fontSize: 11 }}>
                                {f.unit}
                              </span>
                            </div>
                            <input
                              type="number"
                              step="0.1"
                              value={nrecaParams[f.key] || ""}
                              onChange={(e) =>
                                setNrecaParams((prev) => ({
                                  ...prev,
                                  [f.key]: parseFloat(e.target.value) || 0,
                                }))
                              }
                              style={{
                                width: "100%",
                                background: C.surface,
                                color: C.text,
                                border: `1px solid ${C.border}`,
                                borderRadius: 9,
                                padding: "10px 12px",
                                fontSize: 13,
                                outline: "none",
                                boxSizing: "border-box",
                              }}
                              onFocus={(e) =>
                                (e.target.style.borderColor = C.amber)
                              }
                              onBlur={(e) =>
                                (e.target.style.borderColor = C.border)
                              }
                            />
                            {f.hint && (
                              <div
                                style={{
                                  color: C.muted,
                                  fontSize: 10,
                                  marginTop: 3,
                                }}
                              >
                                {f.hint}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Right: reference tables */}
                    <div>
                      <div
                        style={{
                          fontSize: 11,
                          color: C.muted,
                          fontWeight: 700,
                          textTransform: "uppercase",
                          letterSpacing: 1.2,
                          marginBottom: 14,
                        }}
                      >
                        Tabel Kemiringan → Cr
                      </div>
                      <table
                        style={{
                          width: "100%",
                          borderCollapse: "collapse",
                          fontSize: 13,
                          marginBottom: 22,
                        }}
                      >
                        <thead>
                          <tr style={{ background: "rgba(245,158,11,0.1)" }}>
                            <th
                              style={{
                                padding: "9px 14px",
                                textAlign: "left",
                                color: C.muted,
                                fontWeight: 600,
                                borderBottom: `1px solid ${C.border}`,
                              }}
                            >
                              Kemiringan (m/Km)
                            </th>
                            <th
                              style={{
                                padding: "9px 14px",
                                textAlign: "center",
                                color: C.muted,
                                fontWeight: 600,
                                borderBottom: `1px solid ${C.border}`,
                              }}
                            >
                              Cr
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {[
                            ["0 – 50", "0.9"],
                            ["51 – 100", "0.8"],
                            ["101 – 200", "0.6"],
                            ["> 200", "0.4"],
                          ].map(([r, v]) => (
                            <tr
                              key={r}
                              style={{
                                borderBottom: `1px solid ${C.border}30`,
                              }}
                            >
                              <td
                                style={{ padding: "8px 14px", color: C.text }}
                              >
                                {r}
                              </td>
                              <td
                                style={{
                                  padding: "8px 14px",
                                  textAlign: "center",
                                  color: C.amber,
                                  fontWeight: 700,
                                  fontFamily: "monospace",
                                }}
                              >
                                {v}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>

                      <div
                        style={{
                          fontSize: 11,
                          color: C.muted,
                          fontWeight: 700,
                          textTransform: "uppercase",
                          letterSpacing: 1.2,
                          marginBottom: 12,
                        }}
                      >
                        {t("nreca_nse_formula_title")} / NSE Formula
                      </div>
                      <div
                        style={{
                          background: "rgba(245,158,11,0.06)",
                          border: `1px solid ${C.border}`,
                          borderRadius: 10,
                          padding: "14px 16px",
                          marginBottom: 18,
                        }}
                      >
                        <div
                          style={{
                            fontFamily: "monospace",
                            color: C.amber,
                            fontSize: 13,
                            marginBottom: 8,
                          }}
                        >
                          E = 1 − [Σ(Qm − Qo)²] / [Σ(Qo − Q̄o)²]
                        </div>
                        <div
                          style={{
                            fontSize: 11,
                            color: C.muted,
                            lineHeight: 1.7,
                          }}
                        >
                          <span style={{ color: C.teal }}>Qm</span> = Debit
                          model (m³/s) &nbsp;·&nbsp;
                          <span style={{ color: C.teal }}>Qo</span> = Debit
                          observasi &nbsp;·&nbsp;
                          <span style={{ color: C.teal }}>Q̄o</span> = Rata-rata
                          observasi
                        </div>
                      </div>

                      <div
                        style={{
                          fontSize: 11,
                          color: C.muted,
                          fontWeight: 700,
                          textTransform: "uppercase",
                          letterSpacing: 1.2,
                          marginBottom: 10,
                        }}
                      >
                        {t("nreca_nse_class_title")}
                      </div>
                      {[
                        {
                          range: "NSE > 0.75",
                          label: "Very Good",
                          color: C.emerald,
                        },
                        { range: "0.65 – 0.75", label: "Good", color: C.teal },
                        {
                          range: "0.50 – 0.65",
                          label: "Satisfactory",
                          color: C.amber,
                        },
                        {
                          range: "NSE ≤ 0.50",
                          label: "Unsatisfactory",
                          color: C.rose,
                        },
                      ].map((r) => (
                        <div
                          key={r.label}
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            padding: "6px 10px",
                            borderRadius: 7,
                            marginBottom: 4,
                            background: r.color + "11",
                            border: `1px solid ${r.color}33`,
                          }}
                        >
                          <span style={{ color: C.text, fontSize: 12 }}>
                            {r.range}
                          </span>
                          <span
                            style={{
                              color: r.color,
                              fontSize: 12,
                              fontWeight: 700,
                            }}
                          >
                            {r.label}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div style={{ display: "flex", gap: 12, marginTop: 24 }}>
                    <CalcButton
                      onClick={handleNRECACalc}
                      label={t("nreca_run_btn")}
                      color={C.amber}
                    />
                  </div>
                </div>
              )}

              {/* ── SUB-TAB: DATA ── */}
              {nrecaSubTab === "data" && (
                <div
                  style={{ ...cardStyle, borderColor: "rgba(245,158,11,0.25)" }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 12,
                      marginBottom: 20,
                    }}
                  >
                    <div
                      style={{
                        padding: 10,
                        borderRadius: 12,
                        background: "rgba(245,158,11,0.15)",
                      }}
                    >
                      <BarChart3 size={22} color={C.amber} />
                    </div>
                    <div>
                      <div
                        style={{
                          fontSize: 20,
                          fontWeight: 800,
                          color: C.amber,
                        }}
                      >
                        Data Input Bulanan / Monthly Input Data
                      </div>
                      <div style={{ fontSize: 13, color: C.muted }}>
                        Hujan (R) · PET · Debit Observasi (opsional) — Rainfall
                        · PET · Observed Flow (optional for calibration)
                      </div>
                    </div>
                  </div>
                  <div style={{ overflowX: "auto" }}>
                    <table
                      style={{
                        width: "100%",
                        borderCollapse: "collapse",
                        fontSize: 12,
                      }}
                    >
                      <thead>
                        <tr style={{ background: "rgba(245,158,11,0.1)" }}>
                          {[
                            "#",
                            "Tahun / Year",
                            "Bulan / Month",
                            "#Hari / Days",
                            "Hujan R (mm) / Rainfall",
                            "PET (mm)",
                            "Q Obs (m³/s)",
                          ].map((h, i) => (
                            <th
                              key={i}
                              style={{
                                padding: "10px 10px",
                                textAlign: i < 4 ? "center" : "right",
                                color: C.muted,
                                fontWeight: 600,
                                borderBottom: `1px solid ${C.border}`,
                                whiteSpace: "nowrap",
                              }}
                            >
                              {h}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {nrecaData.map((row, idx) => (
                          <tr
                            key={idx}
                            style={{
                              borderBottom: `1px solid ${C.border}22`,
                              background:
                                idx % 2 === 0
                                  ? "transparent"
                                  : "rgba(245,158,11,0.02)",
                            }}
                          >
                            <td
                              style={{
                                padding: "6px 10px",
                                textAlign: "center",
                                color: C.muted,
                                fontSize: 11,
                              }}
                            >
                              {idx + 1}
                            </td>
                            <td
                              style={{
                                padding: "6px 10px",
                                textAlign: "center",
                                color: C.muted,
                              }}
                            >
                              {row.year}
                            </td>
                            <td
                              style={{
                                padding: "6px 10px",
                                textAlign: "center",
                                color: C.text,
                                fontWeight: 600,
                              }}
                            >
                              {NRECA_MONTHS[row.month - 1]}
                            </td>
                            <td
                              style={{
                                padding: "4px 6px",
                                textAlign: "center",
                              }}
                            >
                              <input
                                type="number"
                                value={row.days}
                                min={28}
                                max={31}
                                onChange={(e) =>
                                  setNrecaMonthField(
                                    idx,
                                    "days",
                                    parseInt(e.target.value) || 30,
                                  )
                                }
                                style={{
                                  width: 50,
                                  background: C.surface,
                                  color: C.text,
                                  border: `1px solid ${C.border}`,
                                  borderRadius: 6,
                                  padding: "4px 6px",
                                  fontSize: 12,
                                  textAlign: "center",
                                  outline: "none",
                                }}
                              />
                            </td>
                            {(["rainfall", "pet", "qObs"] as const).map(
                              (field) => (
                                <td key={field} style={{ padding: "4px 6px" }}>
                                  <input
                                    type="number"
                                    step="0.1"
                                    min={0}
                                    value={
                                      row[field] !== undefined ? row[field] : ""
                                    }
                                    placeholder="-"
                                    onChange={(e) =>
                                      setNrecaMonthField(
                                        idx,
                                        field,
                                        parseFloat(e.target.value) || 0,
                                      )
                                    }
                                    style={{
                                      width: "100%",
                                      minWidth: 80,
                                      background: C.surface,
                                      color:
                                        field === "qObs" ? C.ocean : C.text,
                                      border: `1px solid ${C.border}`,
                                      borderRadius: 6,
                                      padding: "5px 8px",
                                      fontSize: 12,
                                      outline: "none",
                                      textAlign: "right",
                                      boxSizing: "border-box" as const,
                                    }}
                                    onFocus={(e) =>
                                      (e.target.style.borderColor = C.amber)
                                    }
                                    onBlur={(e) =>
                                      (e.target.style.borderColor = C.border)
                                    }
                                  />
                                </td>
                              ),
                            )}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div style={{ display: "flex", gap: 12, marginTop: 18 }}>
                    <button
                      onClick={addNrecaYear}
                      style={{
                        background: "rgba(245,158,11,0.12)",
                        color: C.amber,
                        border: `1px solid ${C.amber}44`,
                        borderRadius: 9,
                        padding: "10px 18px",
                        fontSize: 13,
                        fontWeight: 600,
                        cursor: "pointer",
                      }}
                    >
                      + Tambah 12 Baris (1 Tahun)
                    </button>
                    <CalcButton
                      onClick={handleNRECACalc}
                      label="Hitung Sekarang"
                      color={C.amber}
                    />
                  </div>
                </div>
              )}

              {/* ── SUB-TAB: RESULTS ── */}
              {nrecaSubTab === "results" && (
                <div>
                  {!nrecaResults ? (
                    <div
                      style={{
                        ...cardStyle,
                        textAlign: "center",
                        padding: "60px 32px",
                      }}
                    >
                      <AlertCircle
                        size={36}
                        color={C.muted}
                        style={{ marginBottom: 12 }}
                      />
                      <div style={{ color: C.muted, fontSize: 15 }}>
                        {t("nreca_run_first")}
                      </div>
                    </div>
                  ) : (
                    <>
                      {/* Stats Cards */}
                      <div
                        style={{
                          ...cardStyle,
                          borderColor: "rgba(245,158,11,0.25)",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 12,
                            marginBottom: 20,
                          }}
                        >
                          <div
                            style={{
                              padding: 10,
                              borderRadius: 12,
                              background: "rgba(16,185,129,0.15)",
                            }}
                          >
                            <CheckCircle size={22} color={C.emerald} />
                          </div>
                          <div>
                            <div
                              style={{
                                fontSize: 20,
                                fontWeight: 800,
                                color: C.emerald,
                              }}
                            >
                              {t("nreca_results_title")}
                            </div>
                            <div style={{ fontSize: 13, color: C.muted }}>
                              {t("nreca_results_subtitle")}
                            </div>
                          </div>
                        </div>

                        {/* NSE Badge */}
                        {nrecaStats && (
                          <div
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              gap: 8,
                              marginBottom: 20,
                              background:
                                (nrecaStats.NSE > 0.65
                                  ? C.emerald
                                  : nrecaStats.NSE > 0.5
                                    ? C.amber
                                    : C.rose) + "22",
                              border: `1px solid ${nrecaStats.NSE > 0.65 ? C.emerald : nrecaStats.NSE > 0.5 ? C.amber : C.rose}55`,
                              borderRadius: 20,
                              padding: "8px 16px",
                            }}
                          >
                            <div
                              style={{
                                width: 8,
                                height: 8,
                                borderRadius: "50%",
                                background:
                                  nrecaStats.NSE > 0.65
                                    ? C.emerald
                                    : nrecaStats.NSE > 0.5
                                      ? C.amber
                                      : C.rose,
                              }}
                            />
                            <span
                              style={{
                                color:
                                  nrecaStats.NSE > 0.65
                                    ? C.emerald
                                    : nrecaStats.NSE > 0.5
                                      ? C.amber
                                      : C.rose,
                                fontWeight: 700,
                                fontSize: 14,
                              }}
                            >
                              NSE ={" "}
                              {isNaN(nrecaStats.NSE)
                                ? "N/A"
                                : nrecaStats.NSE.toFixed(3)}
                              &nbsp;—&nbsp;
                              {isNaN(nrecaStats.NSE)
                                ? t("nreca_no_obs")
                                : nrecaStats.NSE > 0.75
                                  ? "Very Good"
                                  : nrecaStats.NSE > 0.65
                                    ? "Good"
                                    : nrecaStats.NSE > 0.5
                                      ? "Satisfactory"
                                      : "Unsatisfactory"}
                            </span>
                          </div>
                        )}

                        <div
                          style={{
                            display: "grid",
                            gridTemplateColumns: "repeat(3, 1fr)",
                            gap: 12,
                            marginBottom: 16,
                          }}
                        >
                          {nrecaStats &&
                            [
                              {
                                label: t("nreca_mean_obs"),
                                value: `${nrecaStats.meanObs.toFixed(2)} m³/s`,
                                color: C.ocean,
                              },
                              {
                                label: t("nreca_mean_model"),
                                value: `${nrecaStats.meanComp.toFixed(2)} m³/s`,
                                color: C.amber,
                              },
                              {
                                label: t("nreca_corr_coef"),
                                value: nrecaStats.r.toFixed(3),
                                color: nrecaStats.r > 0.7 ? C.emerald : C.rose,
                              },
                              {
                                label: t("nreca_min_data_model"),
                                value: `${nrecaStats.minObs.toFixed(1)} / ${nrecaStats.minComp.toFixed(1)}`,
                                color: C.teal,
                              },
                              {
                                label: t("nreca_max_data_model"),
                                value: `${nrecaStats.maxObs.toFixed(1)} / ${nrecaStats.maxComp.toFixed(1)}`,
                                color: C.teal,
                              },
                              {
                                label: t("nreca_nom_formula"),
                                value: `${(100 + 0.2 * nrecaParams.Ra).toFixed(1)} mm`,
                                color: C.purple,
                              },
                            ].map((c) => (
                              <ResultCard
                                key={c.label}
                                label={c.label}
                                value={c.value}
                                color={c.color}
                              />
                            ))}
                        </div>
                      </div>

                      {/* ── Metric Legend / Panduan Metrik ── */}
                      <div
                        style={{
                          ...cardStyle,
                          borderColor: "rgba(245,158,11,0.22)",
                          marginBottom: 16,
                        }}
                      >
                        <div
                          style={{
                            fontSize: 12,
                            fontWeight: 700,
                            color: C.amber,
                            textTransform: "uppercase",
                            letterSpacing: 1.2,
                            marginBottom: 14,
                            display: "flex",
                            alignItems: "center",
                            gap: 8,
                          }}
                        >
                          <Info size={14} color={C.amber} />
                          {t("nreca_metric_guide_title")}
                        </div>
                        <div
                          style={{
                            display: "grid",
                            gridTemplateColumns:
                              "repeat(auto-fill, minmax(240px, 1fr))",
                            gap: 10,
                          }}
                        >
                          {[
                            {
                              abbr: "NSE",
                              full: "Nash-Sutcliffe Efficiency",
                              desc: t("nreca_metric_nse_desc"),
                              range: t("nreca_metric_nse_range"),
                              color: C.amber,
                            },
                            {
                              abbr: "r",
                              full: "Pearson Correlation Coefficient",
                              desc: t("nreca_metric_r_desc"),
                              range: t("nreca_metric_r_range"),
                              color: C.ocean,
                            },
                            {
                              abbr: "Qcomp",
                              full: "Computed / Model Streamflow (m³/s)",
                              desc: t("nreca_metric_qcomp_desc"),
                              range: t("nreca_metric_qcomp_range"),
                              color: C.amber,
                            },
                            {
                              abbr: "Qobs",
                              full: "Observed Streamflow (m³/s)",
                              desc: t("nreca_metric_qobs_desc"),
                              range: t("nreca_metric_qobs_range"),
                              color: C.ocean,
                            },
                            {
                              abbr: "PET",
                              full: "Potential Evapotranspiration",
                              desc: t("nreca_metric_pet_desc"),
                              range: t("nreca_metric_pet_range"),
                              color: C.teal,
                            },
                            {
                              abbr: "AET",
                              full: "Actual Evapotranspiration",
                              desc: t("nreca_metric_aet_desc"),
                              range: t("nreca_metric_aet_range"),
                              color: C.teal,
                            },
                            {
                              abbr: "PSUB",
                              full: "Percent Subsurface",
                              desc: t("nreca_metric_psub_desc"),
                              range: t("nreca_metric_psub_range"),
                              color: C.purple,
                            },
                            {
                              abbr: "GWF",
                              full: "Groundwater Flow Factor",
                              desc: t("nreca_metric_gwf_desc"),
                              range: t("nreca_metric_gwf_range"),
                              color: C.purple,
                            },
                            {
                              abbr: "Nom / Ra",
                              full: "Nominal Storage / Mean Annual Rainfall",
                              desc: t("nreca_metric_nom_desc"),
                              range: t("nreca_metric_nom_range"),
                              color: C.emerald,
                            },
                            {
                              abbr: "Cr",
                              full: "ET Reduction Coefficient",
                              desc: t("nreca_metric_cr_desc"),
                              range: t("nreca_metric_cr_range"),
                              color: C.emerald,
                            },
                          ].map((m) => (
                            <div
                              key={m.abbr}
                              style={{
                                background: m.color + "0d",
                                border: `1px solid ${m.color}33`,
                                borderRadius: 10,
                                padding: "12px 14px",
                              }}
                            >
                              <div
                                style={{
                                  display: "flex",
                                  alignItems: "baseline",
                                  gap: 8,
                                  marginBottom: 4,
                                }}
                              >
                                <span
                                  style={{
                                    fontFamily: "monospace",
                                    fontWeight: 800,
                                    fontSize: 15,
                                    color: m.color,
                                  }}
                                >
                                  {m.abbr}
                                </span>
                                <span style={{ fontSize: 11, color: C.muted }}>
                                  {m.full}
                                </span>
                              </div>
                              <div
                                style={{
                                  fontSize: 11,
                                  color: "#c0d8ef",
                                  lineHeight: 1.6,
                                  marginBottom: 6,
                                }}
                              >
                                {m.desc}
                              </div>
                              <div
                                style={{
                                  fontSize: 10,
                                  color: m.color,
                                  fontWeight: 600,
                                  background: m.color + "15",
                                  borderRadius: 5,
                                  padding: "3px 8px",
                                  display: "inline-block",
                                }}
                              >
                                ✦ {m.range}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Detail Table */}
                      <div
                        style={{
                          ...cardStyle,
                          borderColor: "rgba(167,139,250,0.25)",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            marginBottom: 16,
                          }}
                        >
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 10,
                            }}
                          >
                            <div
                              style={{
                                padding: 9,
                                borderRadius: 10,
                                background: C.purple + "22",
                              }}
                            >
                              <TrendingUp size={18} color={C.purple} />
                            </div>
                            <div>
                              <div
                                style={{
                                  fontSize: 16,
                                  fontWeight: 800,
                                  color: C.purple,
                                }}
                              >
                                {t("nreca_table_title")}
                              </div>
                              <div style={{ fontSize: 12, color: C.muted }}>
                                {t("nreca_table_subtitle")}
                              </div>
                            </div>
                          </div>
                          <button
                            onClick={() => setNrecaShowTable((prev) => !prev)}
                            style={{
                              background: C.purple + "18",
                              border: `1px solid ${C.purple}44`,
                              color: C.purple,
                              borderRadius: 8,
                              padding: "8px 14px",
                              fontSize: 13,
                              fontWeight: 600,
                              cursor: "pointer",
                              display: "flex",
                              alignItems: "center",
                              gap: 6,
                            }}
                          >
                            {nrecaShowTable
                              ? t("nreca_table_hide")
                              : t("nreca_table_show")}
                            <ChevronDown
                              size={14}
                              style={{
                                transform: nrecaShowTable
                                  ? "rotate(180deg)"
                                  : "none",
                                transition: "0.2s",
                              }}
                            />
                          </button>
                        </div>

                        <AnimatePresence>
                          {nrecaShowTable && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: "auto" }}
                              exit={{ opacity: 0, height: 0 }}
                              style={{ overflow: "hidden" }}
                            >
                              <div style={{ overflowX: "auto" }}>
                                <table
                                  style={{
                                    width: "100%",
                                    borderCollapse: "collapse",
                                    fontSize: 10.5,
                                    minWidth: 1500,
                                  }}
                                >
                                  <thead>
                                    <tr
                                      style={{
                                        background: "rgba(167,139,250,0.1)",
                                      }}
                                    >
                                      {[
                                        "Thn",
                                        "Bln",
                                        "#Hari",
                                        "R (mm)",
                                        "PET (mm)",
                                        "Wo",
                                        "Wi",
                                        "Stor Ratio",
                                        "R/PET",
                                        "AET/PET",
                                        "AET",
                                        "Water Bal",
                                        "Exc Moist R",
                                        "Exc Moist (mm)",
                                        "ΔStorage",
                                        "Rechg GW",
                                        "Begin GW",
                                        "End GW",
                                        "GW Flow",
                                        "Direct Flow",
                                        "Total (mm)",
                                        "Qcomp",
                                        "Qobs",
                                        "(Qm-Qo)²",
                                      ].map((h, i) => (
                                        <th
                                          key={i}
                                          style={{
                                            padding: "8px 7px",
                                            textAlign: "center",
                                            color: C.muted,
                                            fontWeight: 600,
                                            borderBottom: `1px solid ${C.border}`,
                                            whiteSpace: "nowrap",
                                            fontSize: 10,
                                          }}
                                        >
                                          {h}
                                        </th>
                                      ))}
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {nrecaResults.map((r, idx) => (
                                      <tr
                                        key={idx}
                                        style={{
                                          borderBottom: `1px solid ${C.border}22`,
                                          background:
                                            idx % 2 === 0
                                              ? "transparent"
                                              : "rgba(167,139,250,0.02)",
                                        }}
                                      >
                                        {[
                                          r.year,
                                          NRECA_MONTHS[r.month - 1],
                                          r.days,
                                          r.R.toFixed(1),
                                          r.PET.toFixed(1),
                                          r.Wo.toFixed(1),
                                          r.Wi.toFixed(1),
                                          r.STOR_RATIO.toFixed(2),
                                          r.PRECIP_PET.toFixed(2),
                                          r.AET_PET.toFixed(2),
                                          r.AET.toFixed(2),
                                          r.WATER_BALANCE.toFixed(2),
                                          r.EXCESS_MOIST_RATIO.toFixed(2),
                                          r.EXCESS_MOIST.toFixed(2),
                                          r.DELTA_STORAGE.toFixed(2),
                                          r.RECHG_GW.toFixed(2),
                                          r.BEGIN_GW.toFixed(2),
                                          r.END_GW.toFixed(2),
                                          r.GW_FLOW.toFixed(2),
                                          r.DIRECT_FLOW.toFixed(2),
                                          r.TOTAL_DISCH_mm.toFixed(2),
                                          r.Qcomp.toFixed(2),
                                          r.Qobs !== undefined
                                            ? r.Qobs.toFixed(2)
                                            : "-",
                                          r.sqError !== undefined
                                            ? r.sqError.toFixed(2)
                                            : "-",
                                        ].map((cell, ci) => (
                                          <td
                                            key={ci}
                                            style={{
                                              padding: "6px 7px",
                                              textAlign: "center",
                                              color:
                                                ci === 21
                                                  ? C.amber
                                                  : ci === 22
                                                    ? C.ocean
                                                    : C.text,
                                              fontWeight: ci >= 21 ? 700 : 400,
                                              fontFamily:
                                                ci >= 3
                                                  ? "monospace"
                                                  : "inherit",
                                            }}
                                          >
                                            {String(cell)}
                                          </td>
                                        ))}
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* ── SUB-TAB: CHARTS ── */}
              {nrecaSubTab === "charts" && (
                <div
                  style={{ ...cardStyle, borderColor: "rgba(245,158,11,0.25)" }}
                >
                  {!nrecaResults ? (
                    <div style={{ textAlign: "center", padding: "60px 0" }}>
                      <AlertCircle
                        size={36}
                        color={C.muted}
                        style={{ marginBottom: 12 }}
                      />
                      <div style={{ color: C.muted }}>
                        Belum ada hasil. Hitung terlebih dahulu di tab
                        Parameter.
                      </div>
                    </div>
                  ) : (
                    <>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 12,
                          marginBottom: 24,
                        }}
                      >
                        <div
                          style={{
                            padding: 10,
                            borderRadius: 12,
                            background: "rgba(245,158,11,0.15)",
                          }}
                        >
                          <TrendingUp size={22} color={C.amber} />
                        </div>
                        <div>
                          <div
                            style={{
                              fontSize: 20,
                              fontWeight: 800,
                              color: C.amber,
                            }}
                          >
                            Grafik Kalibrasi
                          </div>
                          <div style={{ fontSize: 13, color: C.muted }}>
                            {t("nreca_charts_subtitle")}
                            Storage
                          </div>
                        </div>
                      </div>

                      {/* Time Series SVG */}
                      {(() => {
                        const data = nrecaResults;
                        const allV = [
                          ...data.map((d) => d.Qcomp),
                          ...data
                            .filter((d) => d.Qobs != null)
                            .map((d) => d.Qobs!),
                        ];
                        const maxV = Math.max(...allV, 0.01);
                        const n = data.length;
                        const W = 700,
                          H = 180,
                          pl = 44,
                          pb = 30,
                          pt = 14,
                          pr = 14;
                        const cw = W - pl - pr,
                          ch = H - pt - pb;
                        const xf = (i: number) =>
                          pl + (i / Math.max(n - 1, 1)) * cw;
                        const yf = (v: number) => pt + ch - (v / maxV) * ch;
                        const compPath = data
                          .map(
                            (d, i) =>
                              `${i === 0 ? "M" : "L"} ${xf(i)} ${yf(d.Qcomp)}`,
                          )
                          .join(" ");
                        const obsPath = data
                          .filter((d) => d.Qobs != null)
                          .map((d, _, arr) => {
                            const i = data.indexOf(d);
                            return `${i === data.indexOf(arr[0]) ? "M" : "L"} ${xf(i)} ${yf(d.Qobs!)}`;
                          })
                          .join(" ");
                        return (
                          <div
                            style={{
                              background: "rgba(245,158,11,0.04)",
                              borderRadius: 12,
                              padding: "14px 16px",
                              border: `1px solid ${C.border}`,
                              marginBottom: 16,
                            }}
                          >
                            <div
                              style={{
                                fontSize: 12,
                                fontWeight: 700,
                                color: C.muted,
                                textTransform: "uppercase",
                                letterSpacing: 1,
                                marginBottom: 10,
                              }}
                            >
                              {t("nreca_chart_timeseries_title")}
                            </div>
                            <div
                              style={{
                                fontSize: 11,
                                color: C.muted,
                                marginBottom: 8,
                                display: "flex",
                                flexWrap: "wrap",
                                gap: 16,
                              }}
                            >
                              <span>
                                📏{" "}
                                <strong style={{ color: C.ocean }}>
                                  {t("nreca_axis_xaxis")}
                                </strong>
                                :{" "}
                                {t("nreca_chart_timeseries_xaxis")
                                  .replace("Sumbu X: ", "")
                                  .replace("X-axis: ", "")}
                              </span>
                              <span>
                                📐{" "}
                                <strong style={{ color: C.ocean }}>
                                  {t("nreca_axis_yaxis")}
                                </strong>
                                :{" "}
                                {t("nreca_chart_timeseries_yaxis")
                                  .replace("Sumbu Y: ", "")
                                  .replace("Y-axis: ", "")}
                              </span>
                            </div>
                            <svg
                              viewBox={`0 0 ${W} ${H}`}
                              style={{ width: "100%", height: "auto" }}
                            >
                              <text
                                x={10}
                                y={pt + ch / 2}
                                textAnchor="middle"
                                transform={`rotate(-90, 10, ${pt + ch / 2})`}
                                style={{
                                  fontSize: 8,
                                  fill: C.muted,
                                  fontWeight: 600,
                                }}
                              >
                                Q (m³/s)
                              </text>
                              {[0, 0.25, 0.5, 0.75, 1].map((t, i) => (
                                <g key={i}>
                                  <line
                                    x1={pl}
                                    y1={pt + ch - t * ch}
                                    x2={pl + cw}
                                    y2={pt + ch - t * ch}
                                    stroke="rgba(14,165,233,0.08)"
                                    strokeWidth={1}
                                    strokeDasharray="3,3"
                                  />
                                  <text
                                    x={pl - 4}
                                    y={pt + ch - t * ch + 4}
                                    textAnchor="end"
                                    style={{ fontSize: 9, fill: C.muted }}
                                  >
                                    {(t * maxV).toFixed(1)}
                                  </text>
                                </g>
                              ))}
                              {data
                                .filter((_, i) => i % 3 === 0)
                                .map((d, i) => (
                                  <text
                                    key={i}
                                    x={xf(i * 3)}
                                    y={H - 4}
                                    textAnchor="middle"
                                    style={{ fontSize: 8, fill: C.muted }}
                                  >
                                    {NRECA_MONTHS[d.month - 1]}'
                                    {String(d.year).slice(-2)}
                                  </text>
                                ))}
                              {obsPath && (
                                <path
                                  d={obsPath}
                                  fill="none"
                                  stroke={C.ocean}
                                  strokeWidth={2}
                                  strokeLinejoin="round"
                                />
                              )}
                              <path
                                d={compPath}
                                fill="none"
                                stroke={C.amber}
                                strokeWidth={2}
                                strokeDasharray="5,2"
                                strokeLinejoin="round"
                              />
                              {data.map((d, i) => (
                                <g key={i}>
                                  {d.Qobs != null && (
                                    <circle
                                      cx={xf(i)}
                                      cy={yf(d.Qobs)}
                                      r={3}
                                      fill={C.ocean}
                                    />
                                  )}
                                  <circle
                                    cx={xf(i)}
                                    cy={yf(d.Qcomp)}
                                    r={2.5}
                                    fill={C.amber}
                                  />
                                </g>
                              ))}
                            </svg>
                            <div
                              style={{ display: "flex", gap: 20, marginTop: 6 }}
                            >
                              <div
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 6,
                                }}
                              >
                                <div
                                  style={{
                                    width: 20,
                                    height: 2,
                                    background: C.ocean,
                                    borderRadius: 1,
                                  }}
                                />
                                <span style={{ fontSize: 11, color: C.muted }}>
                                  Data Observasi
                                </span>
                              </div>
                              <div
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 6,
                                }}
                              >
                                <div
                                  style={{
                                    width: 20,
                                    height: 2,
                                    background: C.amber,
                                    borderRadius: 1,
                                  }}
                                />
                                <span style={{ fontSize: 11, color: C.muted }}>
                                  Model (dashed)
                                </span>
                              </div>
                            </div>
                          </div>
                        );
                      })()}

                      {/* Duration Curve SVG */}
                      {(() => {
                        const sorted = (a: number[]) =>
                          [...a].sort((x, y) => y - x);
                        const obsArr = nrecaResults
                          .filter((r) => r.Qobs != null)
                          .map((r) => r.Qobs!);
                        const compArr = nrecaResults.map((r) => r.Qcomp);
                        const obsS = sorted(obsArr);
                        const compS = sorted(compArr);
                        const n = Math.max(obsS.length, compS.length);
                        const probOf = (i: number, len: number) =>
                          (i + 1) / (len + 1);
                        const allV = [...obsS, ...compS];
                        const maxV = Math.max(...allV, 0.01);
                        const W = 700,
                          H = 170,
                          pl = 44,
                          pb = 28,
                          pt = 12,
                          pr = 12;
                        const cw = W - pl - pr,
                          ch = H - pt - pb;
                        const xf = (p: number) => pl + p * cw;
                        const yf = (v: number) => pt + ch - (v / maxV) * ch;
                        const obsPath = obsS
                          .map(
                            (v, i) =>
                              `${i === 0 ? "M" : "L"} ${xf(probOf(i, obsS.length))} ${yf(v)}`,
                          )
                          .join(" ");
                        const compPath = compS
                          .map(
                            (v, i) =>
                              `${i === 0 ? "M" : "L"} ${xf(probOf(i, compS.length))} ${yf(v)}`,
                          )
                          .join(" ");
                        return (
                          <div
                            style={{
                              background: "rgba(245,158,11,0.04)",
                              borderRadius: 12,
                              padding: "14px 16px",
                              border: `1px solid ${C.border}`,
                              marginBottom: 16,
                            }}
                          >
                            <div
                              style={{
                                fontSize: 12,
                                fontWeight: 700,
                                color: C.muted,
                                textTransform: "uppercase",
                                letterSpacing: 1,
                                marginBottom: 10,
                              }}
                            >
                              {t("nreca_chart_duration_title")}
                            </div>
                            <div
                              style={{
                                fontSize: 11,
                                color: C.muted,
                                marginBottom: 8,
                                display: "flex",
                                flexWrap: "wrap",
                                gap: 16,
                              }}
                            >
                              <span>
                                📏{" "}
                                <strong style={{ color: C.ocean }}>
                                  {t("nreca_axis_xaxis")}
                                </strong>
                                :{" "}
                                {t("nreca_chart_duration_xaxis")
                                  .replace("Sumbu X: ", "")
                                  .replace("X-axis: ", "")}
                              </span>
                              <span>
                                📐{" "}
                                <strong style={{ color: C.ocean }}>
                                  {t("nreca_axis_yaxis")}
                                </strong>
                                :{" "}
                                {t("nreca_chart_duration_yaxis")
                                  .replace("Sumbu Y: ", "")
                                  .replace("Y-axis: ", "")}
                              </span>
                            </div>
                            <div
                              style={{
                                fontSize: 10,
                                color: "#8ba4c0",
                                marginBottom: 8,
                              }}
                            >
                              {t("nreca_chart_duration_tip")}
                            </div>
                            <svg
                              viewBox={`0 0 ${W} ${H}`}
                              style={{ width: "100%", height: "auto" }}
                            >
                              <text
                                x={10}
                                y={pt + ch / 2}
                                textAnchor="middle"
                                transform={`rotate(-90, 10, ${pt + ch / 2})`}
                                style={{
                                  fontSize: 8,
                                  fill: C.muted,
                                  fontWeight: 600,
                                }}
                              >
                                Q (m³/s)
                              </text>
                              {[0, 0.25, 0.5, 0.75, 1].map((t, i) => (
                                <g key={i}>
                                  <line
                                    x1={pl}
                                    y1={pt + ch - t * ch}
                                    x2={pl + cw}
                                    y2={pt + ch - t * ch}
                                    stroke="rgba(14,165,233,0.08)"
                                    strokeWidth={1}
                                    strokeDasharray="3,3"
                                  />
                                  <text
                                    x={pl - 4}
                                    y={pt + ch - t * ch + 4}
                                    textAnchor="end"
                                    style={{ fontSize: 9, fill: C.muted }}
                                  >
                                    {(t * maxV).toFixed(1)}
                                  </text>
                                </g>
                              ))}
                              {[0, 0.2, 0.4, 0.6, 0.8, 1].map((t, i) => (
                                <g key={i}>
                                  <line
                                    x1={xf(t)}
                                    y1={pt}
                                    x2={xf(t)}
                                    y2={pt + ch}
                                    stroke="rgba(14,165,233,0.06)"
                                    strokeWidth={1}
                                  />
                                  <text
                                    x={xf(t)}
                                    y={H - 4}
                                    textAnchor="middle"
                                    style={{ fontSize: 9, fill: C.muted }}
                                  >
                                    {t.toFixed(1)}
                                  </text>
                                </g>
                              ))}
                              {obsArr.length > 0 && (
                                <path
                                  d={obsPath}
                                  fill="none"
                                  stroke={C.ocean}
                                  strokeWidth={2}
                                />
                              )}
                              <path
                                d={compPath}
                                fill="none"
                                stroke={C.amber}
                                strokeWidth={2}
                                strokeDasharray="5,2"
                              />
                            </svg>
                          </div>
                        );
                      })()}

                      {/* Moisture & GW Storage */}
                      {(["moisture", "gw"] as const).map((type) => {
                        const vals = nrecaResults.map((r) =>
                          type === "moisture" ? r.Wo : r.BEGIN_GW,
                        );
                        const maxV = Math.max(...vals, 0.01);
                        const color = type === "moisture" ? C.ocean : C.teal;
                        const label =
                          type === "moisture"
                            ? "Moisture Storage"
                            : "GW Storage";
                        const W = 700,
                          H = 130,
                          pl = 44,
                          pb = 24,
                          pt = 10,
                          pr = 10;
                        const cw = W - pl - pr,
                          ch = H - pt - pb;
                        const xf = (i: number) =>
                          pl + (i / Math.max(vals.length - 1, 1)) * cw;
                        const yf = (v: number) => pt + ch - (v / maxV) * ch;
                        const path = vals
                          .map(
                            (v, i) =>
                              `${i === 0 ? "M" : "L"} ${xf(i)} ${yf(v)}`,
                          )
                          .join(" ");
                        return (
                          <div
                            key={type}
                            style={{
                              background: `rgba(14,165,233,0.04)`,
                              borderRadius: 12,
                              padding: "14px 16px",
                              border: `1px solid ${C.border}`,
                              marginBottom: 14,
                            }}
                          >
                            <div
                              style={{
                                fontSize: 12,
                                fontWeight: 700,
                                color: C.muted,
                                textTransform: "uppercase",
                                letterSpacing: 1,
                                marginBottom: 10,
                              }}
                            >
                              Kalibrasi {label} (mm)
                            </div>
                            <div
                              style={{
                                fontSize: 11,
                                color: C.muted,
                                marginBottom: 8,
                                display: "flex",
                                flexWrap: "wrap",
                                gap: 16,
                              }}
                            >
                              <span>
                                📏{" "}
                                <strong style={{ color }}>
                                  Sumbu X / X-axis
                                </strong>
                                : Waktu — Time (Month/Year)
                              </span>
                              <span>
                                📐{" "}
                                <strong style={{ color }}>
                                  Sumbu Y / Y-axis
                                </strong>
                                :{" "}
                                {type === "moisture"
                                  ? "Kelembaban Tanah / Soil Moisture Storage (mm)"
                                  : "Simpanan Air Tanah / Groundwater Storage (mm)"}
                              </span>
                            </div>
                            <svg
                              viewBox={`0 0 ${W} ${H}`}
                              style={{ width: "100%", height: "auto" }}
                            >
                              {[0, 0.5, 1].map((t, i) => (
                                <g key={i}>
                                  <line
                                    x1={pl}
                                    y1={pt + ch - t * ch}
                                    x2={pl + cw}
                                    y2={pt + ch - t * ch}
                                    stroke="rgba(14,165,233,0.07)"
                                    strokeWidth={1}
                                    strokeDasharray="3,3"
                                  />
                                  <text
                                    x={pl - 4}
                                    y={pt + ch - t * ch + 4}
                                    textAnchor="end"
                                    style={{ fontSize: 9, fill: C.muted }}
                                  >
                                    {(t * maxV).toFixed(0)}
                                  </text>
                                </g>
                              ))}
                              <path
                                d={path}
                                fill="none"
                                stroke={color}
                                strokeWidth={2.5}
                                strokeLinejoin="round"
                              />
                              {nrecaResults
                                .filter((_, i) => i % 3 === 0)
                                .map((r, i) => (
                                  <text
                                    key={i}
                                    x={xf(i * 3)}
                                    y={H - 4}
                                    textAnchor="middle"
                                    style={{ fontSize: 8, fill: C.muted }}
                                  >
                                    {NRECA_MONTHS[r.month - 1]}'
                                    {String(r.year).slice(-2)}
                                  </text>
                                ))}
                            </svg>
                          </div>
                        );
                      })}

                      {/* Performance Summary */}
                      {nrecaStats && (
                        <div
                          style={{
                            padding: "16px 20px",
                            borderRadius: 12,
                            background:
                              nrecaStats.NSE > 0.65
                                ? "rgba(16,185,129,0.08)"
                                : "rgba(244,63,94,0.08)",
                            border: `1px solid ${nrecaStats.NSE > 0.65 ? C.emerald : C.rose}40`,
                            display: "flex",
                            gap: 12,
                            alignItems: "flex-start",
                          }}
                        >
                          {nrecaStats.NSE > 0.65 ? (
                            <CheckCircle
                              size={20}
                              color={C.emerald}
                              style={{ flexShrink: 0, marginTop: 2 }}
                            />
                          ) : (
                            <AlertCircle
                              size={20}
                              color={C.rose}
                              style={{ flexShrink: 0, marginTop: 2 }}
                            />
                          )}
                          <div>
                            <div
                              style={{
                                fontWeight: 800,
                                fontSize: 15,
                                marginBottom: 5,
                                color:
                                  nrecaStats.NSE > 0.65 ? C.emerald : C.rose,
                              }}
                            >
                              {isNaN(nrecaStats.NSE)
                                ? t("nreca_no_obs")
                                : nrecaStats.NSE > 0.75
                                  ? t("nreca_calib_very_good")
                                  : nrecaStats.NSE > 0.65
                                    ? t("nreca_calib_good")
                                    : nrecaStats.NSE > 0.5
                                      ? t("nreca_calib_satisfactory")
                                      : t("nreca_calib_unsatisfactory")}
                            </div>
                            <div
                              style={{
                                fontSize: 13,
                                color: "#c0d8ef",
                                lineHeight: 1.6,
                              }}
                            >
                              NSE ={" "}
                              <strong style={{ color: C.amber }}>
                                {isNaN(nrecaStats.NSE)
                                  ? "N/A"
                                  : nrecaStats.NSE.toFixed(3)}
                              </strong>
                              &nbsp;|&nbsp; r ={" "}
                              <strong style={{ color: C.teal }}>
                                {nrecaStats.r.toFixed(3)}
                              </strong>
                              &nbsp;|&nbsp; Rerata Model ={" "}
                              <strong style={{ color: C.amber }}>
                                {nrecaStats.meanComp.toFixed(2)} m³/s
                              </strong>
                              &nbsp;|&nbsp; Rerata Data ={" "}
                              <strong style={{ color: C.ocean }}>
                                {nrecaStats.meanObs.toFixed(2)} m³/s
                              </strong>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* ── Rekap Probabilitas Debit ── */}
                      {nrecaResults &&
                        nrecaResults.length > 0 &&
                        (() => {
                          // compute exceedance probability from sorted obs and comp
                          const obsArr = nrecaResults
                            .filter((r) => r.Qobs != null)
                            .map((r) => r.Qobs!);
                          const compArr = nrecaResults.map((r) => r.Qcomp);
                          const sorted = (a: number[]) =>
                            [...a].sort((x, y) => y - x);
                          const obsS = sorted(obsArr);
                          const compS = sorted(compArr);
                          const qAtProb = (arr: number[], p: number) => {
                            if (arr.length === 0) return null;
                            const idx = Math.round(p * (arr.length - 1));
                            return arr[Math.min(idx, arr.length - 1)];
                          };
                          const rows = [
                            {
                              key: "Q95",
                              p: 0.95,
                              label: "Q95",
                              use: t("nreca_rekap_q95_use"),
                              color: C.teal,
                            },
                            {
                              key: "Q90",
                              p: 0.9,
                              label: "Q90",
                              use: t("nreca_rekap_q90_use"),
                              color: C.ocean,
                            },
                            {
                              key: "Q80",
                              p: 0.8,
                              label: "Q80",
                              use: t("nreca_rekap_q80_use"),
                              color: C.emerald,
                            },
                            {
                              key: "Q60",
                              p: 0.6,
                              label: "Q60",
                              use: t("nreca_rekap_q60_use"),
                              color: C.purple,
                            },
                            {
                              key: "Q50",
                              p: 0.5,
                              label: "Q50",
                              use: t("nreca_rekap_q50_use"),
                              color: C.amber,
                            },
                            {
                              key: "Q40",
                              p: 0.4,
                              label: "Q40",
                              use: t("nreca_rekap_q40_use"),
                              color: C.rose,
                            },
                            {
                              key: "Q20",
                              p: 0.2,
                              label: "Q20",
                              use: t("nreca_rekap_q20_use"),
                              color: C.rose,
                            },
                          ];
                          return (
                            <div
                              style={{
                                background: "rgba(14,165,233,0.04)",
                                borderRadius: 14,
                                padding: "18px 20px",
                                border: `1px solid rgba(14,165,233,0.25)`,
                                marginTop: 8,
                              }}
                            >
                              <div
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 10,
                                  marginBottom: 4,
                                }}
                              >
                                <BarChart3 size={16} color={C.ocean} />
                                <span
                                  style={{
                                    fontWeight: 800,
                                    fontSize: 15,
                                    color: C.ocean,
                                  }}
                                >
                                  {t("nreca_rekap_title")}
                                </span>
                              </div>
                              <div
                                style={{
                                  fontSize: 11,
                                  color: C.muted,
                                  marginBottom: 8,
                                }}
                              >
                                {t("nreca_rekap_subtitle")}
                              </div>
                              {/* Q range note */}
                              <div
                                style={{
                                  background: "rgba(245,158,11,0.08)",
                                  border: `1px solid rgba(245,158,11,0.25)`,
                                  borderRadius: 8,
                                  padding: "8px 14px",
                                  marginBottom: 14,
                                  fontSize: 11,
                                  color: "#c0d8ef",
                                  lineHeight: 1.7,
                                }}
                              >
                                <strong style={{ color: C.amber }}>
                                  💡{" "}
                                  {t("nreca_axis_xaxis")
                                    .replace("Sumbu X", "")
                                    .replace("X-axis", "")
                                    .trim()}
                                  :
                                </strong>
                                &nbsp;{t("nreca_chart_duration_tip")}
                              </div>
                              <div style={{ overflowX: "auto" }}>
                                <table
                                  style={{
                                    width: "100%",
                                    borderCollapse: "collapse",
                                    fontSize: 12,
                                    minWidth: 560,
                                  }}
                                >
                                  <thead>
                                    <tr
                                      style={{
                                        background: "rgba(14,165,233,0.1)",
                                      }}
                                    >
                                      {[
                                        t("nreca_rekap_col_prob"),
                                        t("nreca_rekap_col_qobs"),
                                        t("nreca_rekap_col_qmodel"),
                                        t("nreca_rekap_col_use"),
                                      ].map((h) => (
                                        <th
                                          key={h}
                                          style={{
                                            padding: "8px 12px",
                                            textAlign: "left",
                                            color: C.ocean,
                                            fontWeight: 700,
                                            fontSize: 11,
                                            borderBottom: `1px solid rgba(14,165,233,0.2)`,
                                          }}
                                        >
                                          {h}
                                        </th>
                                      ))}
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {rows.map((row, i) => {
                                      const qO = qAtProb(obsS, row.p);
                                      const qC = qAtProb(compS, row.p);
                                      return (
                                        <tr
                                          key={row.key}
                                          style={{
                                            background:
                                              i % 2 === 0
                                                ? "rgba(255,255,255,0.02)"
                                                : "transparent",
                                          }}
                                        >
                                          <td
                                            style={{
                                              padding: "8px 12px",
                                              borderBottom: `1px solid rgba(14,165,233,0.08)`,
                                            }}
                                          >
                                            <span
                                              style={{
                                                fontFamily: "monospace",
                                                fontWeight: 800,
                                                fontSize: 13,
                                                color: row.color,
                                              }}
                                            >
                                              {row.label}
                                            </span>
                                            <span
                                              style={{
                                                fontSize: 10,
                                                color: C.muted,
                                                marginLeft: 8,
                                              }}
                                            >
                                              P = {(row.p * 100).toFixed(0)}%
                                            </span>
                                          </td>
                                          <td
                                            style={{
                                              padding: "8px 12px",
                                              borderBottom: `1px solid rgba(14,165,233,0.08)`,
                                              color: C.ocean,
                                              fontWeight: 700,
                                            }}
                                          >
                                            {qO != null ? qO.toFixed(2) : "—"}
                                          </td>
                                          <td
                                            style={{
                                              padding: "8px 12px",
                                              borderBottom: `1px solid rgba(14,165,233,0.08)`,
                                              color: C.amber,
                                              fontWeight: 700,
                                            }}
                                          >
                                            {qC != null ? qC.toFixed(2) : "—"}
                                          </td>
                                          <td
                                            style={{
                                              padding: "8px 12px",
                                              borderBottom: `1px solid rgba(14,165,233,0.08)`,
                                              color: C.text,
                                              fontSize: 12,
                                            }}
                                          >
                                            {row.use}
                                          </td>
                                        </tr>
                                      );
                                    })}
                                  </tbody>
                                </table>
                              </div>
                              <div
                                style={{
                                  marginTop: 10,
                                  fontSize: 10,
                                  color: C.muted,
                                  lineHeight: 1.7,
                                }}
                              >
                                {t("nreca_rekap_method_note")}
                              </div>
                            </div>
                          );
                        })()}
                    </>
                  )}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {allDone && (
            <motion.div
              key="integrated"
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              style={{
                ...cardStyle,
                borderColor: "rgba(139,92,246,0.35)",
                background:
                  "linear-gradient(135deg, rgba(139,92,246,0.08), rgba(14,165,233,0.05))",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  justifyContent: "space-between",
                  marginBottom: 24,
                  flexWrap: "wrap",
                  gap: 16,
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div
                    style={{
                      padding: 8,
                      borderRadius: 10,
                      background: "rgba(139,92,246,0.2)",
                    }}
                  >
                    <FileText size={20} color="#a78bfa" />
                  </div>
                  <div>
                    <div
                      style={{
                        fontSize: 18,
                        fontWeight: 800,
                        color: "#a78bfa",
                      }}
                    >
                      Analisis Terintegrasi
                    </div>
                    <div style={{ fontSize: 12, color: C.muted }}>
                      Penilaian keberlanjutan komprehensif berbasis tiga pilar
                      VWBA
                    </div>
                  </div>
                </div>
                <DownloadButton
                  onClick={() => handleDownload("complete")}
                  label={language === "id" ? "Unduh Laporan Lengkap" : "Download Complete Report"}
                  loading={pdfLoading.complete}
                  color="#a78bfa"
                  variant="solid"
                />
              </div>

              {(() => {
                const excess =
                  results.waterFootprint!.netConsumption -
                  Math.abs(results.waterStock!.deltaS);
                const balanced = excess <= 0;
                return (
                  <div
                    style={{
                      padding: "16px 20px",
                      borderRadius: 12,
                      marginBottom: 20,
                      background: balanced
                        ? "rgba(16,185,129,0.1)"
                        : "rgba(244,63,94,0.1)",
                      border: `1px solid ${balanced ? C.emerald : C.rose}40`,
                      display: "flex",
                      gap: 12,
                      alignItems: "flex-start",
                    }}
                  >
                    {balanced ? (
                      <CheckCircle
                        size={20}
                        color={C.emerald}
                        style={{ flexShrink: 0, marginTop: 2 }}
                      />
                    ) : (
                      <Info
                        size={20}
                        color={C.rose}
                        style={{ flexShrink: 0, marginTop: 2 }}
                      />
                    )}
                    <div>
                      <div
                        style={{
                          fontWeight: 800,
                          fontSize: 15,
                          color: balanced ? C.emerald : C.rose,
                          marginBottom: 6,
                        }}
                      >
                        Status: {balanced ? "SEIMBANG ✓" : "TIDAK SEIMBANG ✗"}
                      </div>
                      <div
                        style={{
                          fontSize: 13,
                          color: "#c0d8ef",
                          lineHeight: 1.6,
                        }}
                      >
                        {balanced
                          ? "Konsumsi bersih perusahaan masih dalam batas keberlanjutan DAS. Monitoring berkala tetap diperlukan."
                          : `Konsumsi bersih (${fmt(results.waterFootprint!.netConsumption)} m³/thn) melebihi kapasitas DAS. Wajib memperoleh water credit minimal `}
                        {!balanced && (
                          <strong style={{ color: C.rose }}>
                            {fmt(excess)} m³/tahun
                          </strong>
                        )}
                        {!balanced && " untuk keseimbangan hidrologis."}
                      </div>
                    </div>
                  </div>
                );
              })()}

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(3, 1fr)",
                  gap: 12,
                  marginBottom: 20,
                }}
              >
                {[
                  {
                    label: "Net Consumption",
                    value: `${fmt(results.waterFootprint!.netConsumption)} m³`,
                    color: C.ocean,
                  },
                  {
                    label: "ΔS Stok Air",
                    value: `${results.waterStock!.deltaS >= 0 ? "+" : ""}${fmt(results.waterStock!.deltaS)} m³`,
                    color: results.waterStock!.deltaS >= 0 ? C.emerald : C.rose,
                  },
                  {
                    label: "Eligible VWB Credit",
                    value: `${fmt(results.waterCredit!.eligibleCredit)} m³`,
                    color: C.emerald,
                  },
                ].map((item) => (
                  <div
                    key={item.label}
                    style={{
                      background: "rgba(10,22,40,0.8)",
                      borderRadius: 10,
                      padding: "12px 14px",
                      textAlign: "center",
                      border: `1px solid ${C.border}`,
                    }}
                  >
                    <div
                      style={{
                        fontSize: 10,
                        color: C.muted,
                        textTransform: "uppercase",
                        letterSpacing: 1,
                        marginBottom: 6,
                      }}
                    >
                      {item.label}
                    </div>
                    <div
                      style={{
                        color: item.color,
                        fontWeight: 800,
                        fontSize: 16,
                      }}
                    >
                      {item.value}
                    </div>
                  </div>
                ))}
              </div>

              <div>
                <div
                  style={{
                    fontSize: 12,
                    color: C.muted,
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: 1.5,
                    marginBottom: 12,
                  }}
                >
                  Rekomendasi Aksi
                </div>
                <div
                  style={{ display: "flex", flexDirection: "column", gap: 8 }}
                >
                  {[
                    ...(results.waterStock!.deltaS < 0
                      ? [
                          {
                            color: C.rose,
                            text: "DAS mengalami defisit — prioritaskan proyek konservasi segera",
                          },
                        ]
                      : []),
                    ...(results.waterFootprint!.category.includes("Kritis")
                      ? [
                          {
                            color: C.rose,
                            text: "Water footprint kritis — wajib kurangi konsumsi dan peroleh water credit",
                          },
                        ]
                      : []),
                    ...(results.waterCredit!.vwb > 0
                      ? [
                          {
                            color: C.emerald,
                            text: `Proyek menghasilkan ${fmt(results.waterCredit!.eligibleCredit)} m³/thn VWB credit yang eligible`,
                          },
                        ]
                      : []),
                    {
                      color: C.ocean,
                      text: "Pastikan semua transaksi kredit tercatat dalam registry HYDREX",
                    },
                    {
                      color: C.ocean,
                      text: "Verifikasi independen diperlukan untuk validasi kredit (VWBA 2.0 Step 5)",
                    },
                  ].map((item, i) => (
                    <div
                      key={i}
                      style={{
                        display: "flex",
                        alignItems: "flex-start",
                        gap: 10,
                      }}
                    >
                      <div
                        style={{
                          width: 6,
                          height: 6,
                          borderRadius: "50%",
                          background: item.color,
                          flexShrink: 0,
                          marginTop: 7,
                        }}
                      />
                      <span
                        style={{
                          fontSize: 13,
                          color: "#c0d8ef",
                          lineHeight: 1.6,
                        }}
                      >
                        {item.text}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div
                style={{
                  marginTop: 24,
                  paddingTop: 20,
                  borderTop: `1px solid ${C.border}`,
                }}
              >
                <div
                  style={{
                    fontSize: 12,
                    color: C.muted,
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: 1.5,
                    marginBottom: 14,
                  }}
                >
                  <FileDown
                    size={14}
                    style={{
                      display: "inline",
                      marginRight: 6,
                      verticalAlign: "middle",
                    }}
                  />
                  Unduh Laporan Individual
                </div>
                <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                  <DownloadButton
                    onClick={() => handleDownload("footprint")}
                    label="Water Footprint PDF"
                    loading={pdfLoading.footprint}
                    color={C.ocean}
                  />
                  <DownloadButton
                    onClick={() => handleDownload("stock")}
                    label="Water Stock PDF"
                    loading={pdfLoading.stock}
                    color={C.teal}
                  />
                  <DownloadButton
                    onClick={() => handleDownload("credit")}
                    label="Water Credit PDF"
                    loading={pdfLoading.credit}
                    color={C.emerald}
                  />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Footer */}
        <div
          style={{
            textAlign: "center",
            color: C.muted,
            fontSize: 11,
            marginTop: 40,
            letterSpacing: 0.3,
          }}
        >
          Berdasarkan <strong style={{ color: C.ocean }}>VWBA 2.0</strong> — WRI
          · LimnoTech · BlueRisk · BEF &nbsp;|&nbsp; Appendix D: D-1 s/d D-9
        </div>
      </div>

      {/* Spinning animation */}
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .spinning {
          animation: spin 1s linear infinite;
        }
      `}</style>
    </div>
  );
};

export default HydrologicalCalculator;
