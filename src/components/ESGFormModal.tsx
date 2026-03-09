/**
 * ============================================================================
 * HYDREX WATER CREDIT — ESG FORM MODAL
 * ============================================================================
 * Comprehensive input form for all ESG scoring data, triggered from
 * ProjectsPage or ESGScoringPage when a project needs ESG data filled.
 *
 * Sections:
 *  A. Identitas Proyek (carried from project, read-only + supplements)
 *  B. Klaim Water Credit (core of E pillar)
 *  C. Dampak Lingkungan Lain (E supporting)
 *  D. Sosial (S)
 *  E. Tata Kelola (G)
 *  F. Dokumen Bukti (Evidence upload)
 *  G. Gate Checks (mandatory)
 */

import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  ChevronRight,
  ChevronLeft,
  CheckCircle,
  AlertCircle,
  Upload,
  Droplets,
  Leaf,
  Users,
  Shield,
  FileText,
  MapPin,
  Building2,
  Info,
  AlertTriangle,
  Trash2,
  Plus,
  Check,
} from "lucide-react";
import { useLanguage } from "../context/LanguageContext";
import { useESG, ESGScoring } from "../context/ESGContext";
import { useTheme } from "./ThemeProvider";
import { lightPageTheme, darkPageTheme } from "../utils/appTheme";

// ============================================================================
// TYPES
// ============================================================================

interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  uploadedAt: string;
  category: string;
}

export interface ESGFormData {
  // Section A - Project identity (pre-filled from project)
  projectId: string;
  projectTitle: string;
  projectType: "replenishment" | "efficiency" | "quality";
  location: string;
  coordinates: string;
  catchmentArea: string;
  picName: string;
  picOrganization: string;
  picContact: string;

  // Section B - Water Credit Claim (E - core)
  baseline: string;
  baselinePeriod: string;
  targetBenefit: string;
  targetBenefitUnit: "m3" | "quality" | "both";
  creditPeriod: string;
  calculationMethod: string;
  calculationFile: string | null;
  leakageRisk: "yes" | "no" | "partial";
  leakageMitigation: string;
  permanenceRisk: "yes" | "no" | "partial";
  permanenceMitigation: string;
  additionality: string;
  waterQualityParams: string;
  waterQualityStandard: string;

  // Section C - Environmental supporting (E)
  energySource: string;
  ghgEstimate: string;
  wasteHandling: "yes" | "no";
  wasteSOP: string;
  biodiversityImpact: string;
  climateRisk: string;

  // Section D - Social (S)
  stakeholderConsultation: "yes" | "no" | "partial";
  consultationEvidence: string;
  communityWaterAccess: "improved" | "neutral" | "impacted";
  communityAccessDetails: string;
  grievanceChannel: string;
  grievanceSLA: string;
  ohsSOP: "yes" | "no";
  incidentLog: "yes" | "no";
  noForcedLabor: boolean;
  noChildLabor: boolean;
  benefitSharing: string;

  // Section E - Governance (G)
  permits: string[];
  organizationStructure: string;
  conflictOfInterest: boolean;
  antiCorruptionPolicy: "yes" | "no";
  methodologyDoc: "yes" | "no";
  mrvPlanMetrics: string;
  mrvPlanFrequency: string;
  mrvPlanTools: string;
  qaQc: string;
  readyForThirdParty: "yes" | "no" | "planning";
  dataAuditLog: "yes" | "no";

  // Gate checks
  gateChecks: {
    hasBaseline: boolean;
    hasMRVPlan: boolean;
    hasPermits: boolean;
    hasGrievanceMechanism: boolean;
    noMajorConflicts: boolean;
  };
}

interface ESGFormModalProps {
  projectId: string;
  projectTitle: string;
  projectType?: string;
  projectCategory?: "community" | "corporate";
  location?: string;
  onClose: () => void;
  onSuccess: (esgId: string) => void;
  existingData?: Partial<ESGFormData>;
}

// ============================================================================
// HELPERS
// ============================================================================
const esgSemanticColors = {
  danger: "#ef4444",
  warning: "#f59e0b",
  success: "#22c55e",
};

const STEPS = [
  {
    id: 1,
    key: "identity",
    icon: Building2,
    labelId: "Identitas Proyek",
    labelEn: "Project Identity",
  },
  {
    id: 2,
    key: "water",
    icon: Droplets,
    labelId: "Klaim Water Credit",
    labelEn: "Water Credit Claim",
  },
  {
    id: 3,
    key: "env",
    icon: Leaf,
    labelId: "Lingkungan (E)",
    labelEn: "Environment (E)",
  },
  {
    id: 4,
    key: "social",
    icon: Users,
    labelId: "Sosial (S)",
    labelEn: "Social (S)",
  },
  {
    id: 5,
    key: "gov",
    icon: Shield,
    labelId: "Tata Kelola (G)",
    labelEn: "Governance (G)",
  },
  {
    id: 6,
    key: "docs",
    icon: FileText,
    labelId: "Dokumen Bukti",
    labelEn: "Evidence Docs",
  },
  {
    id: 7,
    key: "gate",
    icon: Check,
    labelId: "Gate & Review",
    labelEn: "Gate & Review",
  },
];

const CALCULATION_METHODS = [
  "FAO Penman-Monteith",
  "IPCC Tier 1",
  "IPCC Tier 2",
  "Alliance for Water Stewardship (AWS)",
  "GRI 303",
  "ISO 14046 Water Footprint",
  "WRI Aqueduct",
  "Custom/Internal Method",
];

const PERMIT_TYPES = [
  "Izin Lokasi",
  "AMDAL / UKL-UPL",
  "Izin Pengambilan Air",
  "Izin Pembuangan",
  "Izin Operasi",
  "Sertifikat Lahan",
];

// ============================================================================
// SCORE CALCULATOR
// ============================================================================
const calculateIndicatorScores = (form: ESGFormData) => {
  const indicators = [];

  // E1 - Water Impact (Additionality) weight:30
  let e1 = 0;
  if (form.additionality) e1 += 50;
  if (form.baseline && form.baselinePeriod) e1 += 30;
  if (form.targetBenefit) e1 += 20;
  indicators.push({
    id: "E1",
    category: "E",
    score: Math.min(e1, 100),
    weight: 30,
    status: e1 > 0 ? (e1 >= 80 ? "complete" : "incomplete") : "missing",
    name: "Dampak Air (Additionality)",
    nameEn: "Water Impact (Additionality)",
    evidence: [],
    lastUpdated: new Date().toISOString(),
  });

  // E2 - Benefit Quantification weight:25
  let e2 = 0;
  if (form.targetBenefit) e2 += 40;
  if (form.calculationMethod && form.calculationMethod !== "") e2 += 40;
  if (form.calculationFile) e2 += 20;
  indicators.push({
    id: "E2",
    category: "E",
    score: Math.min(e2, 100),
    weight: 25,
    status: e2 > 0 ? (e2 >= 80 ? "complete" : "incomplete") : "missing",
    name: "Kuantifikasi Manfaat",
    nameEn: "Benefit Quantification",
    evidence: [],
    lastUpdated: new Date().toISOString(),
  });

  // E3 - Water Quality weight:15
  let e3 = 0;
  if (
    form.targetBenefitUnit === "quality" ||
    form.targetBenefitUnit === "both"
  ) {
    if (form.waterQualityParams) e3 += 50;
    if (form.waterQualityStandard) e3 += 50;
  } else e3 = 70; // not applicable for replenishment
  indicators.push({
    id: "E3",
    category: "E",
    score: Math.min(e3, 100),
    weight: 15,
    status: e3 > 0 ? (e3 >= 80 ? "complete" : "incomplete") : "missing",
    name: "Kualitas Air",
    nameEn: "Water Quality",
    evidence: [],
    lastUpdated: new Date().toISOString(),
  });

  // E4 - Permanence & Leakage weight:15
  let e4 = 0;
  if (form.leakageRisk === "no") e4 += 50;
  else if (form.leakageMitigation) e4 += 30;
  if (form.permanenceRisk === "no") e4 += 50;
  else if (form.permanenceMitigation) e4 += 30;
  indicators.push({
    id: "E4",
    category: "E",
    score: Math.min(e4, 100),
    weight: 15,
    status: e4 > 0 ? (e4 >= 80 ? "complete" : "incomplete") : "missing",
    name: "Permanence & Leakage",
    nameEn: "Permanence & Leakage",
    evidence: [],
    lastUpdated: new Date().toISOString(),
  });

  // E5 - Biodiversity weight:10
  let e5 = form.biodiversityImpact ? 70 : 0;
  if (form.biodiversityImpact.length > 50) e5 = 100;
  indicators.push({
    id: "E5",
    category: "E",
    score: Math.min(e5, 100),
    weight: 10,
    status: e5 > 0 ? (e5 >= 80 ? "complete" : "incomplete") : "missing",
    name: "Biodiversitas & Ekosistem",
    nameEn: "Biodiversity & Ecosystem",
    evidence: [],
    lastUpdated: new Date().toISOString(),
  });

  // E6 - Energy & Emissions weight:5
  let e6 = form.energySource ? 50 : 0;
  if (form.ghgEstimate) e6 = 100;
  indicators.push({
    id: "E6",
    category: "E",
    score: Math.min(e6, 100),
    weight: 5,
    status: e6 > 0 ? (e6 >= 80 ? "complete" : "incomplete") : "missing",
    name: "Energi & Emisi",
    nameEn: "Energy & Emissions",
    evidence: [],
    lastUpdated: new Date().toISOString(),
  });

  // S1 - Stakeholder Engagement weight:30
  let s1 = 0;
  if (form.stakeholderConsultation === "yes") s1 = 100;
  else if (form.stakeholderConsultation === "partial") s1 = 50;
  if (form.consultationEvidence) s1 = Math.min(s1 + 20, 100);
  indicators.push({
    id: "S1",
    category: "S",
    score: Math.min(s1, 100),
    weight: 30,
    status: s1 > 0 ? (s1 >= 80 ? "complete" : "incomplete") : "missing",
    name: "Keterlibatan Stakeholder",
    nameEn: "Stakeholder Engagement",
    evidence: [],
    lastUpdated: new Date().toISOString(),
  });

  // S2 - Community Rights weight:25
  let s2 = 0;
  if (form.communityWaterAccess === "improved") s2 = 100;
  else if (form.communityWaterAccess === "neutral") s2 = 70;
  else s2 = 20;
  if (form.communityAccessDetails) s2 = Math.min(s2 + 10, 100);
  indicators.push({
    id: "S2",
    category: "S",
    score: Math.min(s2, 100),
    weight: 25,
    status: s2 > 0 ? (s2 >= 80 ? "complete" : "incomplete") : "missing",
    name: "Hak Masyarakat & Dampak Sosial",
    nameEn: "Community Rights & Social Impact",
    evidence: [],
    lastUpdated: new Date().toISOString(),
  });

  // S3 - Grievance Mechanism weight:20
  let s3 = 0;
  if (form.grievanceChannel) s3 += 60;
  if (form.grievanceSLA) s3 += 40;
  indicators.push({
    id: "S3",
    category: "S",
    score: Math.min(s3, 100),
    weight: 20,
    status: s3 > 0 ? (s3 >= 80 ? "complete" : "incomplete") : "missing",
    name: "Mekanisme Keluhan",
    nameEn: "Grievance Mechanism",
    evidence: [],
    lastUpdated: new Date().toISOString(),
  });

  // S4 - OHS weight:15
  let s4 = 0;
  if (form.ohsSOP === "yes") s4 += 60;
  if (form.incidentLog === "yes") s4 += 40;
  indicators.push({
    id: "S4",
    category: "S",
    score: Math.min(s4, 100),
    weight: 15,
    status: s4 > 0 ? (s4 >= 80 ? "complete" : "incomplete") : "missing",
    name: "K3 & Keselamatan Kerja",
    nameEn: "OHS & Safety",
    evidence: [],
    lastUpdated: new Date().toISOString(),
  });

  // S5 - Benefit Sharing weight:10
  let s5 = form.benefitSharing ? 70 : 0;
  if (form.benefitSharing.length > 50) s5 = 100;
  indicators.push({
    id: "S5",
    category: "S",
    score: Math.min(s5, 100),
    weight: 10,
    status: s5 > 0 ? (s5 >= 80 ? "complete" : "incomplete") : "missing",
    name: "Benefit Sharing",
    nameEn: "Benefit Sharing",
    evidence: [],
    lastUpdated: new Date().toISOString(),
  });

  // G1 - Legal & Permits weight:25
  let g1 = Math.min(form.permits.length * 20, 100);
  indicators.push({
    id: "G1",
    category: "G",
    score: Math.min(g1, 100),
    weight: 25,
    status: g1 > 0 ? (g1 >= 80 ? "complete" : "incomplete") : "missing",
    name: "Legal & Perizinan",
    nameEn: "Legal & Permits",
    evidence: [],
    lastUpdated: new Date().toISOString(),
  });

  // G2 - Organization weight:15
  let g2 = form.organizationStructure ? 60 : 0;
  if (form.conflictOfInterest) g2 = Math.min(g2 + 40, 100);
  indicators.push({
    id: "G2",
    category: "G",
    score: Math.min(g2, 100),
    weight: 15,
    status: g2 > 0 ? (g2 >= 80 ? "complete" : "incomplete") : "missing",
    name: "Struktur Organisasi & PIC",
    nameEn: "Organization Structure & PIC",
    evidence: [],
    lastUpdated: new Date().toISOString(),
  });

  // G3 - Anti-Fraud weight:15
  let g3 = form.antiCorruptionPolicy === "yes" ? 100 : 0;
  indicators.push({
    id: "G3",
    category: "G",
    score: Math.min(g3, 100),
    weight: 15,
    status: g3 > 0 ? (g3 >= 80 ? "complete" : "incomplete") : "missing",
    name: "Anti-Fraud & Anti-Korupsi",
    nameEn: "Anti-Fraud & Anti-Corruption",
    evidence: [],
    lastUpdated: new Date().toISOString(),
  });

  // G4 - Transparency weight:20
  let g4 = form.methodologyDoc === "yes" ? 100 : 0;
  indicators.push({
    id: "G4",
    category: "G",
    score: Math.min(g4, 100),
    weight: 20,
    status: g4 > 0 ? (g4 >= 80 ? "complete" : "incomplete") : "missing",
    name: "Transparansi Data & Metodologi",
    nameEn: "Data & Methodology Transparency",
    evidence: [],
    lastUpdated: new Date().toISOString(),
  });

  // G5 - MRV Plan weight:20
  let g5 = 0;
  if (form.mrvPlanMetrics) g5 += 40;
  if (form.mrvPlanFrequency) g5 += 30;
  if (form.mrvPlanTools) g5 += 30;
  indicators.push({
    id: "G5",
    category: "G",
    score: Math.min(g5, 100),
    weight: 20,
    status: g5 > 0 ? (g5 >= 80 ? "complete" : "incomplete") : "missing",
    name: "MRV Plan",
    nameEn: "MRV Plan",
    evidence: [],
    lastUpdated: new Date().toISOString(),
  });

  // G6 - Audit Trail weight:5
  let g6 = form.dataAuditLog === "yes" ? 100 : 0;
  indicators.push({
    id: "G6",
    category: "G",
    score: Math.min(g6, 100),
    weight: 5,
    status: g6 > 0 ? (g6 >= 80 ? "complete" : "incomplete") : "missing",
    name: "Audit Trail",
    nameEn: "Audit Trail",
    evidence: [],
    lastUpdated: new Date().toISOString(),
  });

  return indicators;
};

const computeScores = (
  indicators: ReturnType<typeof calculateIndicatorScores>,
  weights: { E: number; S: number; G: number },
) => {
  const calcCat = (cat: string) => {
    const catInds = indicators.filter((i) => i.category === cat);
    const totalW = catInds.reduce((s, i) => s + i.weight, 0);
    if (!totalW) return 0;
    return Math.round(
      catInds.reduce((s, i) => s + (i.score * i.weight) / totalW, 0),
    );
  };
  const eScore = calcCat("E");
  const sScore = calcCat("S");
  const gScore = calcCat("G");
  const overall = Math.round(
    eScore * (weights.E / 100) +
      sScore * (weights.S / 100) +
      gScore * (weights.G / 100),
  );
  return { eScore, sScore, gScore, overall };
};

// ============================================================================
// REUSABLE FIELD COMPONENTS — defined OUTSIDE the modal to prevent
// React from treating them as new components on every render (fixes cursor jump)
// ============================================================================

const Label: React.FC<{ text: string; required?: boolean }> = ({
  text,
  required,
}) => {
  const { theme: colorTheme } = useTheme();
  const theme = { ...(colorTheme === "dark" ? darkPageTheme : lightPageTheme), ...esgSemanticColors };
  return (
    <label
      className="block text-sm font-medium mb-1"
      style={{ color: theme.textSecondary }}
    >
      {text}
      {required && <span style={{ color: theme.danger }}> *</span>}
    </label>
  );
};

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  required?: boolean;
}
const FormInput: React.FC<InputProps> = ({
  label,
  required,
  onFocus,
  onBlur,
  ...props
}) => {
  const { theme: colorTheme } = useTheme();
  const theme = { ...(colorTheme === "dark" ? darkPageTheme : lightPageTheme), ...esgSemanticColors };
  return (
    <div>
      {label && <Label text={label} required={required} />}
      <input
        {...props}
        className="w-full px-3 py-2.5 rounded-xl text-sm outline-none transition-colors"
        style={{
          backgroundColor: theme.bgDark,
          border: `1px solid ${theme.border}`,
          color: theme.textPrimary,
        }}
        onFocus={(e) => {
          (e.target as HTMLInputElement).style.borderColor = theme.primary;
          onFocus?.(e);
        }}
        onBlur={(e) => {
          (e.target as HTMLInputElement).style.borderColor = theme.border;
          onBlur?.(e);
        }}
      />
    </div>
  );
};

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  required?: boolean;
}
const FormTextarea: React.FC<TextareaProps> = ({
  label,
  required,
  onFocus,
  onBlur,
  ...props
}) => {
  const { theme: colorTheme } = useTheme();
  const theme = { ...(colorTheme === "dark" ? darkPageTheme : lightPageTheme), ...esgSemanticColors };
  return (
  <div>
    {label && <Label text={label} required={required} />}
    <textarea
      {...props}
      rows={3}
      className="w-full px-3 py-2.5 rounded-xl text-sm outline-none transition-colors resize-none"
      style={{
        backgroundColor: theme.bgDark,
        border: `1px solid ${theme.border}`,
        color: theme.textPrimary,
      }}
      onFocus={(e) => {
        (e.target as HTMLTextAreaElement).style.borderColor = theme.primary;
        onFocus?.(e);
      }}
      onBlur={(e) => {
        (e.target as HTMLTextAreaElement).style.borderColor = theme.border;
        onBlur?.(e);
      }}
    />
  </div>
  );
};

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  required?: boolean;
  options: { value: string; label: string }[];
}
const FormSelect: React.FC<SelectProps> = ({
  label,
  required,
  options,
  ...props
}) => {
  const { theme: colorTheme } = useTheme();
  const theme = { ...(colorTheme === "dark" ? darkPageTheme : lightPageTheme), ...esgSemanticColors };
  return (
    <div>
      {label && <Label text={label} required={required} />}
      <select
        {...props}
        className="w-full px-3 py-2.5 rounded-xl text-sm outline-none"
        style={{
          backgroundColor: theme.bgDark,
          border: `1px solid ${theme.border}`,
          color: theme.textPrimary,
        }}
      >
        {options.map((o) => (
          <option
            key={o.value}
            value={o.value}
            style={{ backgroundColor: theme.bgCard }}
          >
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
};

interface RadioGroupProps {
  label: string;
  required?: boolean;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}
const FormRadioGroup: React.FC<RadioGroupProps> = ({
  label,
  required,
  value,
  onChange,
  options,
}) => {
  const { theme: colorTheme } = useTheme();
  const theme = { ...(colorTheme === "dark" ? darkPageTheme : lightPageTheme), ...esgSemanticColors };
  return (
    <div>
      <Label text={label} required={required} />
      <div className="flex flex-wrap gap-3 mt-1">
        {options.map((o) => (
          <button
            key={o.value}
            type="button"
            onClick={() => onChange(o.value)}
            className="px-4 py-2 rounded-lg text-sm font-medium transition-all"
            style={{
              backgroundColor:
                value === o.value ? `${theme.primary}20` : theme.bgDark,
              border: `1px solid ${value === o.value ? theme.primary : theme.border}`,
              color: value === o.value ? theme.primary : theme.textSecondary,
            }}
          >
            {o.label}
          </button>
        ))}
      </div>
    </div>
  );
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================
export const ESGFormModal: React.FC<ESGFormModalProps> = ({
  projectId,
  projectTitle,
  projectType = "replenishment",
  projectCategory = "community",
  location = "",
  onClose,
  onSuccess,
  existingData,
}) => {
  const { language } = useLanguage();
  const { theme: colorTheme } = useTheme();
  const theme = { ...(colorTheme === "dark" ? darkPageTheme : lightPageTheme), ...esgSemanticColors };
  const { addESGScoring, updateESGScoring, getESGScoringByProject } = useESG();
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState<ESGFormData>({
    projectId,
    projectTitle,
    projectType: (projectType as any) || "replenishment",
    location,
    coordinates: existingData?.coordinates || "",
    catchmentArea: existingData?.catchmentArea || "",
    picName: existingData?.picName || "",
    picOrganization: existingData?.picOrganization || "",
    picContact: existingData?.picContact || "",
    baseline: existingData?.baseline || "",
    baselinePeriod: existingData?.baselinePeriod || "",
    targetBenefit: existingData?.targetBenefit || "",
    targetBenefitUnit: existingData?.targetBenefitUnit || "m3",
    creditPeriod: existingData?.creditPeriod || "",
    calculationMethod: existingData?.calculationMethod || "",
    calculationFile: null,
    leakageRisk: existingData?.leakageRisk || "no",
    leakageMitigation: existingData?.leakageMitigation || "",
    permanenceRisk: existingData?.permanenceRisk || "no",
    permanenceMitigation: existingData?.permanenceMitigation || "",
    additionality: existingData?.additionality || "",
    waterQualityParams: existingData?.waterQualityParams || "",
    waterQualityStandard: existingData?.waterQualityStandard || "",
    energySource: existingData?.energySource || "",
    ghgEstimate: existingData?.ghgEstimate || "",
    wasteHandling: existingData?.wasteHandling || "no",
    wasteSOP: existingData?.wasteSOP || "",
    biodiversityImpact: existingData?.biodiversityImpact || "",
    climateRisk: existingData?.climateRisk || "",
    stakeholderConsultation: existingData?.stakeholderConsultation || "no",
    consultationEvidence: existingData?.consultationEvidence || "",
    communityWaterAccess: existingData?.communityWaterAccess || "neutral",
    communityAccessDetails: existingData?.communityAccessDetails || "",
    grievanceChannel: existingData?.grievanceChannel || "",
    grievanceSLA: existingData?.grievanceSLA || "",
    ohsSOP: existingData?.ohsSOP || "no",
    incidentLog: existingData?.incidentLog || "no",
    noForcedLabor:
      existingData?.noForcedLabor !== undefined
        ? existingData.noForcedLabor
        : false,
    noChildLabor:
      existingData?.noChildLabor !== undefined
        ? existingData.noChildLabor
        : false,
    benefitSharing: existingData?.benefitSharing || "",
    permits: existingData?.permits || [],
    organizationStructure: existingData?.organizationStructure || "",
    conflictOfInterest:
      existingData?.conflictOfInterest !== undefined
        ? existingData.conflictOfInterest
        : false,
    antiCorruptionPolicy: existingData?.antiCorruptionPolicy || "no",
    methodologyDoc: existingData?.methodologyDoc || "no",
    mrvPlanMetrics: existingData?.mrvPlanMetrics || "",
    mrvPlanFrequency: existingData?.mrvPlanFrequency || "",
    mrvPlanTools: existingData?.mrvPlanTools || "",
    qaQc: existingData?.qaQc || "",
    readyForThirdParty: existingData?.readyForThirdParty || "planning",
    dataAuditLog: existingData?.dataAuditLog || "no",
    gateChecks: existingData?.gateChecks || {
      hasBaseline: false,
      hasMRVPlan: false,
      hasPermits: false,
      hasGrievanceMechanism: false,
      noMajorConflicts: false,
    },
  });

  // ============================================================================
  // STEP VALIDATION — required fields per step
  // ============================================================================
  const [validationError, setValidationError] = useState("");

  const set = (field: keyof ESGFormData, val: any) => {
    setValidationError("");
    setForm((prev) => ({ ...prev, [field]: val }));
  };

  const validateStep = (currentStep: number): boolean => {
    const lang = language;
    const err = (msg: string) => {
      setValidationError(msg);
      return false;
    };

    switch (currentStep) {
      case 1: // Identitas Proyek
        if (!form.picName.trim())
          return err(
            lang === "id" ? "Nama PIC wajib diisi" : "PIC Name is required",
          );
        if (!form.picOrganization.trim())
          return err(
            lang === "id"
              ? "Organisasi wajib diisi"
              : "Organization is required",
          );
        if (!form.picContact.trim())
          return err(
            lang === "id"
              ? "Kontak (Email/WA) wajib diisi"
              : "Contact is required",
          );
        break;
      case 2: // Water Credit Claim
        if (!form.baseline.trim())
          return err(
            lang === "id"
              ? "Kondisi Baseline wajib diisi"
              : "Baseline condition is required",
          );
        if (!form.baselinePeriod.trim())
          return err(
            lang === "id"
              ? "Periode Baseline wajib diisi"
              : "Baseline period is required",
          );
        if (!form.creditPeriod.trim())
          return err(
            lang === "id"
              ? "Periode Kredit wajib diisi"
              : "Credit period is required",
          );
        if (!form.additionality.trim())
          return err(
            lang === "id"
              ? "Additionality wajib diisi"
              : "Additionality is required",
          );
        if (!form.targetBenefit.trim())
          return err(
            lang === "id"
              ? "Target Manfaat Air wajib diisi"
              : "Water benefit target is required",
          );
        if (!form.calculationMethod)
          return err(
            lang === "id"
              ? "Metode Perhitungan wajib dipilih"
              : "Calculation method is required",
          );
        break;
      case 4: // Sosial
        if (!form.grievanceChannel.trim())
          return err(
            lang === "id"
              ? "Kanal Mekanisme Keluhan wajib diisi"
              : "Grievance channel is required",
          );
        break;
      case 5: // Governance
        if (form.permits.length === 0)
          return err(
            lang === "id"
              ? "Pilih minimal 1 dokumen perizinan"
              : "Select at least 1 permit document",
          );
        if (!form.mrvPlanMetrics.trim())
          return err(
            lang === "id"
              ? "Indikator Monitoring MRV wajib diisi"
              : "MRV monitoring indicators are required",
          );
        if (!form.mrvPlanFrequency.trim())
          return err(
            lang === "id"
              ? "Frekuensi Monitoring wajib diisi"
              : "Monitoring frequency is required",
          );
        break;
    }
    setValidationError("");
    return true;
  };

  const handleNext = () => {
    if (validateStep(step)) {
      setStep((s) => Math.min(STEPS.length, s + 1));
    }
  };

  // Auto-derive gate checks from form data
  const derivedGateChecks = {
    hasBaseline: !!(form.baseline && form.baselinePeriod),
    hasMRVPlan: !!(form.mrvPlanMetrics && form.mrvPlanFrequency),
    hasPermits: form.permits.length >= 1,
    hasGrievanceMechanism: !!form.grievanceChannel,
    noMajorConflicts:
      form.communityWaterAccess !== "impacted" || !!form.communityAccessDetails,
  };

  // Live score preview
  const indicators = calculateIndicatorScores({
    ...form,
    gateChecks: derivedGateChecks,
  });
  const weights = { E: 50, S: 25, G: 25 };
  const { eScore, sScore, gScore, overall } = computeScores(
    indicators,
    weights,
  );
  const allGatesPassed = Object.values(derivedGateChecks).every(Boolean);
  const status = allGatesPassed
    ? overall >= 80
      ? "eligible"
      : overall >= 65
        ? "conditional"
        : "not_eligible"
    : "not_eligible";
  const grade =
    overall >= 97
      ? "A+"
      : overall >= 93
        ? "A"
        : overall >= 90
          ? "A-"
          : overall >= 87
            ? "B+"
            : overall >= 83
              ? "B"
              : overall >= 80
                ? "B-"
                : overall >= 77
                  ? "C+"
                  : overall >= 73
                    ? "C"
                    : overall >= 70
                      ? "C-"
                      : overall >= 60
                        ? "D"
                        : "F";

  const togglePermit = (p: string) => {
    set(
      "permits",
      form.permits.includes(p)
        ? form.permits.filter((x) => x !== p)
        : [...form.permits, p],
    );
  };

  const handleFileUpload =
    (category: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (!files) return;
      const newFiles: UploadedFile[] = Array.from(files).map((f) => ({
        id: `F-${Date.now()}-${Math.random()}`,
        name: f.name,
        size: f.size,
        type: f.type,
        uploadedAt: new Date().toISOString(),
        category,
      }));
      setUploadedFiles((prev) => [...prev, ...newFiles]);
      if (category === "calculation")
        set("calculationFile", newFiles[0]?.name || null);
    };

  const removeFile = (id: string) =>
    setUploadedFiles((prev) => prev.filter((f) => f.id !== id));

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const existing = getESGScoringByProject(projectId);
      const completedCount = indicators.filter(
        (i) => i.status === "complete",
      ).length;
      const evidenceCompleteness = Math.round(
        (completedCount / indicators.length) * 100,
      );

      const scoringData: Omit<
        ESGScoring,
        | "id"
        | "createdAt"
        | "updatedAt"
        | "history"
        | "version"
        | "locked"
        | "evidenceList"
      > = {
        projectId,
        projectTitle,
        projectCategory,
        overallScore: overall,
        eScore,
        sScore,
        gScore,
        grade: grade as any,
        status: status as any,
        eligibilityNotes: !allGatesPassed
          ? "Gate checks not fully passed"
          : undefined,
        indicators: indicators as any,
        evidenceCompleteness,
        totalEvidence: uploadedFiles.length,
        verifiedEvidence: 0,
        risks: [],
        keyRedFlags: [
          ...(!derivedGateChecks.hasBaseline
            ? ["Dokumen baseline belum ada"]
            : []),
          ...(!derivedGateChecks.hasMRVPlan ? ["MRV Plan belum lengkap"] : []),
          ...(!derivedGateChecks.hasPermits
            ? ["Perizinan belum dilengkapi"]
            : []),
          ...(!derivedGateChecks.hasGrievanceMechanism
            ? ["Mekanisme keluhan belum ada"]
            : []),
          ...(form.communityWaterAccess === "impacted"
            ? ["Risiko dampak akses air masyarakat"]
            : []),
        ],
        weights,
        gateChecks: derivedGateChecks,
        notifiedInMarketplace: false,
        marketplaceVisibility: status === "eligible",
      };

      let esgId: string;
      if (existing) {
        updateESGScoring(existing.id, {
          ...scoringData,
          updatedAt: new Date().toISOString(),
        } as any);
        esgId = existing.id;
      } else {
        esgId = addESGScoring(scoringData);
      }
      onSuccess(esgId);
    } finally {
      setSubmitting(false);
    }
  };

  // ============================================================================
  // RENDER HELPERS — components are defined outside (see above) to prevent cursor jump
  // ============================================================================

  const FileUploadZone: React.FC<{
    category: string;
    label: string;
    description?: string;
  }> = ({ category, label, description }) => {
    const catFiles = uploadedFiles.filter((f) => f.category === category);
    return (
      <div>
        <Label text={label} />
        {description && (
          <p className="text-xs mb-2" style={{ color: theme.textMuted }}>
            {description}
          </p>
        )}
        <div
          className="border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-colors"
          style={{ borderColor: theme.border }}
          onClick={() => {
            if (fileInputRef.current) {
              fileInputRef.current.setAttribute("data-category", category);
              fileInputRef.current.click();
            }
          }}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            const dt = e.dataTransfer;
            if (dt.files) {
              const newFiles: UploadedFile[] = Array.from(dt.files).map(
                (f) => ({
                  id: `F-${Date.now()}-${Math.random()}`,
                  name: f.name,
                  size: f.size,
                  type: f.type,
                  uploadedAt: new Date().toISOString(),
                  category,
                }),
              );
              setUploadedFiles((prev) => [...prev, ...newFiles]);
            }
          }}
        >
          <Upload
            className="w-5 h-5 mx-auto mb-1"
            style={{ color: theme.textMuted }}
          />
          <p className="text-xs" style={{ color: theme.textMuted }}>
            {language === "id"
              ? "Klik atau drag file ke sini"
              : "Click or drag files here"}
          </p>
        </div>
        {catFiles.length > 0 && (
          <div className="mt-2 space-y-1">
            {catFiles.map((f) => (
              <div
                key={f.id}
                className="flex items-center justify-between px-3 py-1.5 rounded-lg"
                style={{ backgroundColor: theme.bgDark }}
              >
                <span
                  className="text-xs truncate flex-1"
                  style={{ color: theme.textSecondary }}
                >
                  {f.name}
                </span>
                <button
                  onClick={() => removeFile(f.id)}
                  className="ml-2 text-red-400 hover:text-red-300"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  // ============================================================================
  // STEP CONTENT
  // ============================================================================
  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label
                  text={language === "id" ? "Nama Proyek" : "Project Name"}
                />
                <div
                  className="px-3 py-2.5 rounded-xl text-sm"
                  style={{
                    backgroundColor: `${theme.primary}10`,
                    border: `1px solid ${theme.primary}30`,
                    color: theme.primary,
                  }}
                >
                  {form.projectTitle}
                </div>
              </div>
              <FormSelect
                label={language === "id" ? "Jenis Proyek" : "Project Type"}
                required
                value={form.projectType}
                onChange={(e) => set("projectType", e.target.value)}
                options={[
                  { value: "replenishment", label: "Replenishment" },
                  { value: "efficiency", label: "Efficiency" },
                  { value: "quality", label: "Quality" },
                ]}
              />
            </div>
            <FormInput
              label={
                language === "id" ? "Lokasi / Daerah" : "Location / Region"
              }
              value={form.location}
              onChange={(e) => set("location", e.target.value)}
              placeholder="Provinsi, Kota, Negara"
            />
            <div className="grid grid-cols-2 gap-4">
              <FormInput
                label={
                  language === "id"
                    ? "Koordinat (Lat, Lon)"
                    : "Coordinates (Lat, Lon)"
                }
                value={form.coordinates}
                onChange={(e) => set("coordinates", e.target.value)}
                placeholder="-7.123456, 107.654321"
              />
              <FormInput
                label={
                  language === "id"
                    ? "Wilayah DAS / Catchment"
                    : "Watershed / Catchment Area"
                }
                value={form.catchmentArea}
                onChange={(e) => set("catchmentArea", e.target.value)}
                placeholder="Nama DAS atau kode catchment"
              />
            </div>
            <div
              className="pt-2"
              style={{ borderTop: `1px solid ${theme.border}` }}
            >
              <p
                className="text-xs font-semibold mb-3"
                style={{ color: theme.textMuted }}
              >
                PIC / Penanggung Jawab
              </p>
              <div className="grid grid-cols-3 gap-3">
                <FormInput
                  label={language === "id" ? "Nama PIC" : "PIC Name"}
                  required
                  value={form.picName}
                  onChange={(e) => set("picName", e.target.value)}
                  placeholder="Nama lengkap"
                />
                <FormInput
                  label={language === "id" ? "Organisasi" : "Organization"}
                  required
                  value={form.picOrganization}
                  onChange={(e) => set("picOrganization", e.target.value)}
                  placeholder="Nama perusahaan/lembaga"
                />
                <FormInput
                  label={
                    language === "id"
                      ? "Kontak (Email/WA)"
                      : "Contact (Email/WA)"
                  }
                  required
                  value={form.picContact}
                  onChange={(e) => set("picContact", e.target.value)}
                  placeholder="email@contoh.com"
                />
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-4">
            <div
              className="p-3 rounded-xl"
              style={{
                backgroundColor: `${theme.primary}10`,
                border: `1px solid ${theme.primary}20`,
              }}
            >
              <div className="flex items-start gap-2">
                <Info
                  className="w-4 h-4 mt-0.5 flex-shrink-0"
                  style={{ color: theme.primary }}
                />
                <p className="text-xs" style={{ color: theme.textSecondary }}>
                  {language === "id"
                    ? "Bagian ini adalah inti dari Water Credit. Isi dengan data yang akurat dan terverifikasi. Data ini akan menentukan bobot terbesar dari skor E (50% dari total ESG)."
                    : "This section is the core of the Water Credit. Fill with accurate, verifiable data. It drives the largest portion of the E pillar score (50% of total ESG)."}
                </p>
              </div>
            </div>
            <FormTextarea
              label={
                language === "id"
                  ? "Kondisi Baseline (situasi sebelum proyek)"
                  : "Baseline Condition (pre-project situation)"
              }
              required
              value={form.baseline}
              onChange={(e) => set("baseline", e.target.value)}
              placeholder="Jelaskan kondisi awal sumber daya air sebelum proyek dimulai..."
            />
            <div className="grid grid-cols-2 gap-4">
              <FormInput
                label={
                  language === "id" ? "Periode Baseline" : "Baseline Period"
                }
                required
                value={form.baselinePeriod}
                onChange={(e) => set("baselinePeriod", e.target.value)}
                placeholder="Jan 2022 – Des 2022"
              />
              <FormInput
                label={language === "id" ? "Periode Kredit" : "Credit Period"}
                required
                value={form.creditPeriod}
                onChange={(e) => set("creditPeriod", e.target.value)}
                placeholder="Jan 2023 – Des 2025 (3 tahun)"
              />
            </div>
            <FormTextarea
              label={
                language === "id"
                  ? "Additionality – Mengapa proyek ini benar-benar menambah manfaat?"
                  : "Additionality – Why does this project truly add benefits?"
              }
              required
              value={form.additionality}
              onChange={(e) => set("additionality", e.target.value)}
              placeholder="Jelaskan bahwa manfaat proyek tidak akan terjadi tanpa intervensi proyek ini (tanpa kredit)..."
            />
            <div className="grid grid-cols-2 gap-4">
              <FormInput
                label={
                  language === "id"
                    ? "Target Manfaat Air"
                    : "Water Benefit Target"
                }
                required
                value={form.targetBenefit}
                onChange={(e) => set("targetBenefit", e.target.value)}
                placeholder="mis. 50.000 m³/tahun"
              />
              <FormRadioGroup
                label={language === "id" ? "Satuan Manfaat" : "Benefit Unit"}
                value={form.targetBenefitUnit}
                onChange={(v: string) => set("targetBenefitUnit", v)}
                options={[
                  { value: "m3", label: "m³ (Volume)" },
                  { value: "quality", label: "Kualitas" },
                  { value: "both", label: "Keduanya" },
                ]}
              />
            </div>
            {(form.targetBenefitUnit === "quality" ||
              form.targetBenefitUnit === "both") && (
              <div className="grid grid-cols-2 gap-4">
                <FormInput
                  label={
                    language === "id"
                      ? "Parameter Kualitas Air"
                      : "Water Quality Parameters"
                  }
                  value={form.waterQualityParams}
                  onChange={(e) => set("waterQualityParams", e.target.value)}
                  placeholder="BOD, COD, pH, TSS, dll."
                />
                <FormInput
                  label={
                    language === "id" ? "Standar Baku Mutu" : "Quality Standard"
                  }
                  value={form.waterQualityStandard}
                  onChange={(e) => set("waterQualityStandard", e.target.value)}
                  placeholder="PP 22/2021, Kelas II, dll."
                />
              </div>
            )}
            <FormSelect
              label={
                language === "id" ? "Metode Perhitungan" : "Calculation Method"
              }
              required
              value={form.calculationMethod}
              onChange={(e) => set("calculationMethod", e.target.value)}
              options={[
                {
                  value: "",
                  label:
                    language === "id"
                      ? "-- Pilih metode --"
                      : "-- Select method --",
                },
                ...CALCULATION_METHODS.map((m) => ({ value: m, label: m })),
              ]}
            />
            <div className="grid grid-cols-2 gap-4">
              <FormRadioGroup
                label={
                  language === "id"
                    ? "Risiko Leakage (masalah berpindah lokasi)?"
                    : "Leakage Risk (problem shifts elsewhere)?"
                }
                value={form.leakageRisk}
                onChange={(v: string) => set("leakageRisk", v)}
                options={[
                  { value: "no", label: "Tidak" },
                  { value: "partial", label: "Sebagian" },
                  { value: "yes", label: "Ya" },
                ]}
              />
              <FormRadioGroup
                label={
                  language === "id"
                    ? "Risiko Permanence (manfaat tidak bertahan)?"
                    : "Permanence Risk (benefits may not last)?"
                }
                value={form.permanenceRisk}
                onChange={(v: string) => set("permanenceRisk", v)}
                options={[
                  { value: "no", label: "Tidak" },
                  { value: "partial", label: "Sebagian" },
                  { value: "yes", label: "Ya" },
                ]}
              />
            </div>
            {form.leakageRisk !== "no" && (
              <FormInput
                label={
                  language === "id" ? "Mitigasi Leakage" : "Leakage Mitigation"
                }
                value={form.leakageMitigation}
                onChange={(e) => set("leakageMitigation", e.target.value)}
                placeholder="Jelaskan langkah mitigasi..."
              />
            )}
            {form.permanenceRisk !== "no" && (
              <FormInput
                label={
                  language === "id"
                    ? "Mitigasi Permanence"
                    : "Permanence Mitigation"
                }
                value={form.permanenceMitigation}
                onChange={(e) => set("permanenceMitigation", e.target.value)}
                placeholder="Jelaskan langkah mitigasi..."
              />
            )}
          </div>
        );

      case 3:
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormInput
                label={
                  language === "id"
                    ? "Sumber Energi Operasi"
                    : "Operational Energy Source"
                }
                value={form.energySource}
                onChange={(e) => set("energySource", e.target.value)}
                placeholder="PLN, genset, solar panel, dll."
              />
              <FormInput
                label={
                  language === "id"
                    ? "Estimasi GHG dari Operasi (tCO₂e/tahun)"
                    : "GHG Estimate from Operations (tCO₂e/yr)"
                }
                value={form.ghgEstimate}
                onChange={(e) => set("ghgEstimate", e.target.value)}
                placeholder="mis. 12 tCO₂e/tahun"
                type="text"
              />
            </div>
            <FormRadioGroup
              label={
                language === "id"
                  ? "Ada penanganan limbah / bahan kimia?"
                  : "Is there waste / chemical handling?"
              }
              value={form.wasteHandling}
              onChange={(v: string) => set("wasteHandling", v)}
              options={[
                { value: "yes", label: language === "id" ? "Ya" : "Yes" },
                { value: "no", label: language === "id" ? "Tidak" : "No" },
              ]}
            />
            {form.wasteHandling === "yes" && (
              <FormTextarea
                label={
                  language === "id"
                    ? "SOP Penanganan Limbah/Kimia"
                    : "Waste/Chemical Handling SOP"
                }
                value={form.wasteSOP}
                onChange={(e) => set("wasteSOP", e.target.value)}
                placeholder="Jelaskan prosedur penanganan limbah, chemical yang digunakan, dan cara pembuangan aman..."
              />
            )}
            <FormTextarea
              label={
                language === "id"
                  ? "Dampak terhadap Biodiversitas & Ekosistem"
                  : "Biodiversity & Ecosystem Impact"
              }
              value={form.biodiversityImpact}
              onChange={(e) => set("biodiversityImpact", e.target.value)}
              placeholder="Jelaskan dampak proyek terhadap habitat, wetland, riparian zone, atau spesies lokal..."
            />
            <FormTextarea
              label={
                language === "id"
                  ? "Risiko & Ketahanan Iklim"
                  : "Climate Risk & Resilience"
              }
              value={form.climateRisk}
              onChange={(e) => set("climateRisk", e.target.value)}
              placeholder="Jelaskan risiko kekeringan/banjir terhadap performa proyek, dan strategi adaptasinya..."
            />
          </div>
        );

      case 4:
        return (
          <div className="space-y-4">
            <FormRadioGroup
              label={
                language === "id"
                  ? "Konsultasi Stakeholder / Warga telah dilakukan?"
                  : "Stakeholder / Community consultation done?"
              }
              required
              value={form.stakeholderConsultation}
              onChange={(v: string) => set("stakeholderConsultation", v)}
              options={[
                {
                  value: "yes",
                  label: language === "id" ? "Sudah lengkap" : "Complete",
                },
                {
                  value: "partial",
                  label: language === "id" ? "Sebagian" : "Partial",
                },
                { value: "no", label: language === "id" ? "Belum" : "Not yet" },
              ]}
            />
            {form.stakeholderConsultation !== "no" && (
              <FormTextarea
                label={
                  language === "id"
                    ? "Bukti Konsultasi (notulen, BA, daftar hadir)"
                    : "Consultation Evidence (minutes, BA, attendance)"
                }
                value={form.consultationEvidence}
                onChange={(e) => set("consultationEvidence", e.target.value)}
                placeholder="Jelaskan dokumen bukti yang tersedia..."
              />
            )}
            <FormRadioGroup
              label={
                language === "id"
                  ? "Dampak proyek terhadap akses air masyarakat"
                  : "Project impact on community water access"
              }
              required
              value={form.communityWaterAccess}
              onChange={(v: string) => set("communityWaterAccess", v)}
              options={[
                {
                  value: "improved",
                  label: language === "id" ? "Meningkat" : "Improved",
                },
                {
                  value: "neutral",
                  label: language === "id" ? "Netral" : "Neutral",
                },
                {
                  value: "impacted",
                  label:
                    language === "id"
                      ? "Terdampak negatif"
                      : "Negatively impacted",
                },
              ]}
            />
            {form.communityWaterAccess !== "improved" && (
              <FormTextarea
                label={
                  language === "id"
                    ? "Penjelasan & Mitigasi"
                    : "Explanation & Mitigation"
                }
                value={form.communityAccessDetails}
                onChange={(e) => set("communityAccessDetails", e.target.value)}
                placeholder="Jelaskan dampak dan langkah mitigasi yang diambil..."
              />
            )}
            <div className="grid grid-cols-2 gap-4">
              <FormInput
                label={
                  language === "id"
                    ? "Kanal Mekanisme Keluhan"
                    : "Grievance Mechanism Channel"
                }
                required
                value={form.grievanceChannel}
                onChange={(e) => set("grievanceChannel", e.target.value)}
                placeholder="WA, email, kotak saran, dll."
              />
              <FormInput
                label={
                  language === "id"
                    ? "SLA Penyelesaian Keluhan"
                    : "Grievance Resolution SLA"
                }
                value={form.grievanceSLA}
                onChange={(e) => set("grievanceSLA", e.target.value)}
                placeholder="mis. 7 hari kerja"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <FormRadioGroup
                label={
                  language === "id"
                    ? "Ada SOP K3/Keselamatan Kerja?"
                    : "Is there an OHS/Safety SOP?"
                }
                value={form.ohsSOP}
                onChange={(v: string) => set("ohsSOP", v)}
                options={[
                  { value: "yes", label: language === "id" ? "Ya" : "Yes" },
                  { value: "no", label: "No" },
                ]}
              />
              <FormRadioGroup
                label={
                  language === "id"
                    ? "Ada log insiden/kecelakaan?"
                    : "Is there an incident log?"
                }
                value={form.incidentLog}
                onChange={(v: string) => set("incidentLog", v)}
                options={[
                  { value: "yes", label: language === "id" ? "Ya" : "Yes" },
                  { value: "no", label: "No" },
                ]}
              />
            </div>
            <div
              className="p-4 rounded-xl space-y-3"
              style={{ backgroundColor: theme.bgDark }}
            >
              <p
                className="text-sm font-medium"
                style={{ color: theme.textSecondary }}
              >
                {language === "id"
                  ? "Deklarasi Ketenagakerjaan"
                  : "Labor Declarations"}
              </p>
              {[
                {
                  key: "noForcedLabor",
                  label:
                    language === "id"
                      ? "Tidak ada kerja paksa dalam proyek ini"
                      : "No forced labor in this project",
                },
                {
                  key: "noChildLabor",
                  label:
                    language === "id"
                      ? "Tidak ada pekerja anak dalam proyek ini"
                      : "No child labor in this project",
                },
              ].map((d) => (
                <label
                  key={d.key}
                  className="flex items-center gap-3 cursor-pointer"
                >
                  <div
                    className="w-5 h-5 rounded flex items-center justify-center flex-shrink-0"
                    style={{
                      backgroundColor: (form as any)[d.key]
                        ? theme.success
                        : "transparent",
                      border: `2px solid ${(form as any)[d.key] ? theme.success : theme.border}`,
                    }}
                    onClick={() => set(d.key as any, !(form as any)[d.key])}
                  >
                    {(form as any)[d.key] && (
                      <Check className="w-3 h-3 text-white" />
                    )}
                  </div>
                  <span
                    className="text-sm"
                    style={{ color: theme.textSecondary }}
                  >
                    {d.label}
                  </span>
                </label>
              ))}
            </div>
            <FormTextarea
              label={
                language === "id"
                  ? "Benefit Sharing – Manfaat ekonomi lokal"
                  : "Benefit Sharing – Local economic benefits"
              }
              value={form.benefitSharing}
              onChange={(e) => set("benefitSharing", e.target.value)}
              placeholder="Jelaskan pekerjaan lokal, pelatihan, revenue share, atau kontribusi ekonomi lainnya..."
            />
          </div>
        );

      case 5:
        return (
          <div className="space-y-4">
            <div>
              <Label
                text={
                  language === "id"
                    ? "Dokumen Legal & Perizinan yang dimiliki"
                    : "Legal Documents & Permits available"
                }
                required
              />
              <div className="grid grid-cols-2 gap-2 mt-1">
                {PERMIT_TYPES.map((p) => (
                  <label
                    key={p}
                    className="flex items-center gap-2 cursor-pointer p-2.5 rounded-lg"
                    style={{
                      backgroundColor: form.permits.includes(p)
                        ? `${theme.success}10`
                        : theme.bgDark,
                      border: `1px solid ${form.permits.includes(p) ? theme.success : theme.border}`,
                    }}
                    onClick={() => togglePermit(p)}
                  >
                    <div
                      className="w-4 h-4 rounded flex items-center justify-center flex-shrink-0"
                      style={{
                        backgroundColor: form.permits.includes(p)
                          ? theme.success
                          : "transparent",
                        border: `2px solid ${form.permits.includes(p) ? theme.success : theme.border}`,
                      }}
                    >
                      {form.permits.includes(p) && (
                        <Check className="w-2.5 h-2.5 text-white" />
                      )}
                    </div>
                    <span
                      className="text-xs"
                      style={{
                        color: form.permits.includes(p)
                          ? theme.success
                          : theme.textSecondary,
                      }}
                    >
                      {p}
                    </span>
                  </label>
                ))}
              </div>
            </div>
            <FormTextarea
              label={
                language === "id"
                  ? "Struktur Organisasi Pengelola"
                  : "Management Organization Structure"
              }
              value={form.organizationStructure}
              onChange={(e) => set("organizationStructure", e.target.value)}
              placeholder="Jelaskan struktur organisasi, jabatan, dan tanggung jawab masing-masing..."
            />
            <label
              className="flex items-center gap-3 cursor-pointer p-3 rounded-xl"
              style={{
                backgroundColor: form.conflictOfInterest
                  ? `${theme.success}10`
                  : theme.bgDark,
                border: `1px solid ${form.conflictOfInterest ? theme.success : theme.border}`,
              }}
              onClick={() =>
                set("conflictOfInterest", !form.conflictOfInterest)
              }
            >
              <div
                className="w-5 h-5 rounded flex items-center justify-center flex-shrink-0"
                style={{
                  backgroundColor: form.conflictOfInterest
                    ? theme.success
                    : "transparent",
                  border: `2px solid ${form.conflictOfInterest ? theme.success : theme.border}`,
                }}
              >
                {form.conflictOfInterest && (
                  <Check className="w-3 h-3 text-white" />
                )}
              </div>
              <span className="text-sm" style={{ color: theme.textSecondary }}>
                {language === "id"
                  ? "Deklarasi tidak ada konflik kepentingan dari PIC/pengelola"
                  : "Declaration of no conflict of interest from PIC/management"}
              </span>
            </label>
            <div className="grid grid-cols-2 gap-4">
              <FormRadioGroup
                label={
                  language === "id"
                    ? "Ada kebijakan Anti-Korupsi / Anti-Fraud?"
                    : "Is there an Anti-Corruption / Anti-Fraud policy?"
                }
                value={form.antiCorruptionPolicy}
                onChange={(v: string) => set("antiCorruptionPolicy", v)}
                options={[
                  { value: "yes", label: language === "id" ? "Ya" : "Yes" },
                  { value: "no", label: "No" },
                ]}
              />
              <FormRadioGroup
                label={
                  language === "id"
                    ? "Ada dokumen metodologi & asumsi perhitungan?"
                    : "Is there a methodology & assumption document?"
                }
                value={form.methodologyDoc}
                onChange={(v: string) => set("methodologyDoc", v)}
                options={[
                  { value: "yes", label: language === "id" ? "Ya" : "Yes" },
                  { value: "no", label: "No" },
                ]}
              />
            </div>
            <div
              className="p-4 rounded-xl space-y-3"
              style={{ backgroundColor: theme.bgDark }}
            >
              <p
                className="text-sm font-semibold"
                style={{ color: theme.textSecondary }}
              >
                MRV Plan (Monitoring, Reporting, Verification)
              </p>
              <FormTextarea
                label={
                  language === "id"
                    ? "Apa yang diukur / indikator monitoring"
                    : "What is measured / monitoring indicators"
                }
                required
                value={form.mrvPlanMetrics}
                onChange={(e) => set("mrvPlanMetrics", e.target.value)}
                placeholder="Volume air (flow meter), kualitas air (lab), curah hujan, dll."
              />
              <div className="grid grid-cols-2 gap-3">
                <FormInput
                  label={
                    language === "id"
                      ? "Frekuensi Monitoring"
                      : "Monitoring Frequency"
                  }
                  required
                  value={form.mrvPlanFrequency}
                  onChange={(e) => set("mrvPlanFrequency", e.target.value)}
                  placeholder="Bulanan, Kuartalan, dll."
                />
                <FormInput
                  label={
                    language === "id"
                      ? "Alat / Instrumen"
                      : "Tools / Instruments"
                  }
                  value={form.mrvPlanTools}
                  onChange={(e) => set("mrvPlanTools", e.target.value)}
                  placeholder="Flow meter, sensor IoT, sampling lab"
                />
              </div>
              <FormTextarea
                label={
                  language === "id"
                    ? "QA/QC – Kontrol kualitas data"
                    : "QA/QC – Data quality control"
                }
                value={form.qaQc}
                onChange={(e) => set("qaQc", e.target.value)}
                placeholder="Jelaskan prosedur verifikasi dan kontrol kualitas data monitoring..."
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <FormRadioGroup
                label={
                  language === "id"
                    ? "Kesiapan verifikasi pihak ketiga"
                    : "Third-party verification readiness"
                }
                value={form.readyForThirdParty}
                onChange={(v: string) => set("readyForThirdParty", v)}
                options={[
                  { value: "yes", label: language === "id" ? "Siap" : "Ready" },
                  {
                    value: "planning",
                    label: language === "id" ? "Dalam Rencana" : "Planning",
                  },
                  {
                    value: "no",
                    label: language === "id" ? "Belum" : "Not yet",
                  },
                ]}
              />
              <FormRadioGroup
                label={
                  language === "id"
                    ? "Ada audit trail / log perubahan data?"
                    : "Is there an audit trail / data change log?"
                }
                value={form.dataAuditLog}
                onChange={(v: string) => set("dataAuditLog", v)}
                options={[
                  { value: "yes", label: language === "id" ? "Ya" : "Yes" },
                  { value: "no", label: "No" },
                ]}
              />
            </div>
          </div>
        );

      case 6:
        return (
          <div className="space-y-5">
            <div
              className="p-3 rounded-xl"
              style={{
                backgroundColor: `${theme.warning}10`,
                border: `1px solid ${theme.warning}20`,
              }}
            >
              <div className="flex items-start gap-2">
                <AlertTriangle
                  className="w-4 h-4 mt-0.5 flex-shrink-0"
                  style={{ color: theme.warning }}
                />
                <p className="text-xs" style={{ color: theme.textSecondary }}>
                  {language === "id"
                    ? "Proyek wajib melengkapi dokumen minimal sebelum dapat dinilai ESG. Dokumen yang belum diupload akan mengurangi kelengkapan evidence."
                    : "Projects must complete mandatory documents before ESG scoring. Missing documents reduce evidence completeness score."}
                </p>
              </div>
            </div>
            <FileUploadZone
              category="baseline"
              label={
                language === "id"
                  ? "📄 Dokumen Baseline (wajib)"
                  : "📄 Baseline Document (mandatory)"
              }
              description={
                language === "id"
                  ? "Kondisi awal proyek, data historis sumber daya air"
                  : "Project initial conditions, historical water resource data"
              }
            />
            <FileUploadZone
              category="map"
              label={
                language === "id"
                  ? "🗺️ Peta Lokasi & Catchment (wajib)"
                  : "🗺️ Location & Catchment Map (mandatory)"
              }
              description={
                language === "id"
                  ? "Peta wilayah proyek dan batas DAS/catchment"
                  : "Project area map and watershed/catchment boundaries"
              }
            />
            <FileUploadZone
              category="calculation"
              label={
                language === "id"
                  ? "📊 Dokumen Metode & Perhitungan Klaim (wajib)"
                  : "📊 Method & Claim Calculation Document (mandatory)"
              }
              description={
                language === "id"
                  ? "Spreadsheet dan dokumen metodologi perhitungan manfaat air"
                  : "Spreadsheet and methodology document for water benefit calculation"
              }
            />
            <FileUploadZone
              category="mrv"
              label={
                language === "id"
                  ? "📋 MRV Plan (wajib)"
                  : "📋 MRV Plan (mandatory)"
              }
              description={
                language === "id"
                  ? "Rencana monitoring, reporting, dan verifikasi yang terstruktur"
                  : "Structured monitoring, reporting, and verification plan"
              }
            />
            <FileUploadZone
              category="permits"
              label={
                language === "id"
                  ? "📁 Perizinan & AMDAL/UKL-UPL (wajib)"
                  : "📁 Permits & Environmental Clearance (mandatory)"
              }
              description={
                language === "id"
                  ? "Seluruh dokumen perizinan yang relevan"
                  : "All relevant permit documents"
              }
            />
            <FileUploadZone
              category="consultation"
              label={
                language === "id"
                  ? "🤝 Bukti Konsultasi Warga (wajib)"
                  : "🤝 Community Consultation Evidence (mandatory)"
              }
              description={
                language === "id"
                  ? "Notulen, BA, daftar hadir, foto/video sosialisasi"
                  : "Minutes, MoU/BA, attendance lists, socialization photos/videos"
              }
            />
            <FileUploadZone
              category="grievance"
              label={
                language === "id"
                  ? "📢 SOP Mekanisme Keluhan (wajib)"
                  : "📢 Grievance Mechanism SOP (mandatory)"
              }
              description={
                language === "id"
                  ? "Dokumen prosedur penanganan keluhan"
                  : "Grievance handling procedure document"
              }
            />
            <FileUploadZone
              category="lab"
              label={
                language === "id"
                  ? "🧪 Hasil Uji Lab Kualitas Air (jika ada)"
                  : "🧪 Water Quality Lab Results (if applicable)"
              }
              description={
                language === "id"
                  ? "Laporan hasil uji lab untuk proyek berbasis kualitas air"
                  : "Lab test reports for water quality projects"
              }
            />
            <FileUploadZone
              category="monitoring"
              label={
                language === "id"
                  ? "📈 Laporan Monitoring Berkala (jika ada)"
                  : "📈 Periodic Monitoring Reports (if available)"
              }
              description={
                language === "id"
                  ? "Data sensor/flow meter, log monitoring"
                  : "Sensor/flow meter data, monitoring logs"
              }
            />
            <FileUploadZone
              category="verifier"
              label={
                language === "id"
                  ? "✅ Laporan Verifikator (jika ada)"
                  : "✅ Verifier Report (if available)"
              }
              description={
                language === "id"
                  ? "Laporan dari verifikasi pihak ketiga jika sudah dilakukan"
                  : "Third-party verification report if already conducted"
              }
            />
            <div
              className="flex items-center justify-between p-3 rounded-xl"
              style={{ backgroundColor: theme.bgDark }}
            >
              <span className="text-sm" style={{ color: theme.textSecondary }}>
                {language === "id"
                  ? "Total dokumen diupload"
                  : "Total documents uploaded"}
              </span>
              <span
                className="font-bold"
                style={{
                  color:
                    uploadedFiles.length > 0 ? theme.success : theme.textMuted,
                }}
              >
                {uploadedFiles.length} {language === "id" ? "file" : "files"}
              </span>
            </div>
          </div>
        );

      case 7:
        const gateItems = [
          {
            key: "hasBaseline",
            label:
              language === "id"
                ? "Dokumen baseline ada"
                : "Baseline document available",
            passed: derivedGateChecks.hasBaseline,
          },
          {
            key: "hasMRVPlan",
            label:
              language === "id" ? "MRV Plan tersedia" : "MRV Plan available",
            passed: derivedGateChecks.hasMRVPlan,
          },
          {
            key: "hasPermits",
            label:
              language === "id"
                ? "Perizinan minimal ada"
                : "Minimum permits available",
            passed: derivedGateChecks.hasPermits,
          },
          {
            key: "hasGrievanceMechanism",
            label:
              language === "id"
                ? "Mekanisme keluhan tersedia"
                : "Grievance mechanism available",
            passed: derivedGateChecks.hasGrievanceMechanism,
          },
          {
            key: "noMajorConflicts",
            label:
              language === "id"
                ? "Tidak ada konflik sosial besar / ada mitigasi"
                : "No major social conflicts / has mitigation",
            passed: derivedGateChecks.noMajorConflicts,
          },
        ];
        return (
          <div className="space-y-5">
            {/* Score Preview */}
            <div
              className="p-5 rounded-2xl"
              style={{
                backgroundColor: theme.bgDark,
                border: `1px solid ${theme.border}`,
              }}
            >
              <p
                className="text-sm font-semibold mb-4"
                style={{ color: theme.textMuted }}
              >
                {language === "id"
                  ? "Preview Skor ESG (Live)"
                  : "ESG Score Preview (Live)"}
              </p>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p
                    className="text-5xl font-black"
                    style={{
                      color:
                        overall >= 80
                          ? theme.success
                          : overall >= 65
                            ? theme.primary
                            : theme.danger,
                    }}
                  >
                    {overall}
                  </p>
                  <p
                    className="text-sm mt-1"
                    style={{ color: theme.textMuted }}
                  >
                    Overall ESG Score
                  </p>
                </div>
                <div className="text-right">
                  <div
                    className="text-2xl font-bold px-4 py-2 rounded-xl inline-block"
                    style={{
                      backgroundColor: `${overall >= 80 ? theme.success : overall >= 65 ? theme.primary : theme.danger}20`,
                      color:
                        overall >= 80
                          ? theme.success
                          : overall >= 65
                            ? theme.primary
                            : theme.danger,
                    }}
                  >
                    {grade}
                  </div>
                  <div
                    className={`mt-2 text-xs font-semibold px-3 py-1 rounded-full inline-block ${status === "eligible" ? "text-green-400 bg-green-400/10" : status === "conditional" ? "text-yellow-400 bg-yellow-400/10" : "text-red-400 bg-red-400/10"}`}
                  >
                    {status === "eligible"
                      ? "✅ ELIGIBLE"
                      : status === "conditional"
                        ? "⚠️ CONDITIONAL"
                        : "❌ NOT ELIGIBLE"}
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                {[
                  {
                    label: "E (Environmental)",
                    score: eScore,
                    color: "#22c55e",
                    weight: "50%",
                  },
                  {
                    label: "S (Social)",
                    score: sScore,
                    color: "#3b82f6",
                    weight: "25%",
                  },
                  {
                    label: "G (Governance)",
                    score: gScore,
                    color: "#a855f7",
                    weight: "25%",
                  },
                ].map((cat) => (
                  <div
                    key={cat.label}
                    className="p-3 rounded-xl text-center"
                    style={{
                      backgroundColor: `${cat.color}10`,
                      border: `1px solid ${cat.color}20`,
                    }}
                  >
                    <p
                      className="text-2xl font-bold mb-0.5"
                      style={{ color: cat.color }}
                    >
                      {cat.score}
                    </p>
                    <p className="text-xs" style={{ color: theme.textMuted }}>
                      {cat.label}
                    </p>
                    <p
                      className="text-xs mt-1"
                      style={{ color: theme.textMuted }}
                    >
                      Bobot {cat.weight}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Gate Checks */}
            <div
              className="p-4 rounded-2xl space-y-3"
              style={{
                backgroundColor: theme.bgDark,
                border: `1px solid ${theme.border}`,
              }}
            >
              <p
                className="text-sm font-semibold"
                style={{ color: theme.textSecondary }}
              >
                {language === "id"
                  ? "Gate Checks (Syarat Wajib)"
                  : "Gate Checks (Mandatory Requirements)"}
              </p>
              {gateItems.map((g) => (
                <div key={g.key} className="flex items-center gap-3">
                  {g.passed ? (
                    <CheckCircle
                      className="w-4 h-4 flex-shrink-0"
                      style={{ color: theme.success }}
                    />
                  ) : (
                    <AlertCircle
                      className="w-4 h-4 flex-shrink-0"
                      style={{ color: theme.danger }}
                    />
                  )}
                  <span
                    className="text-sm flex-1"
                    style={{
                      color: g.passed ? theme.textSecondary : theme.danger,
                    }}
                  >
                    {g.label}
                  </span>
                  <span
                    className="text-xs font-semibold"
                    style={{ color: g.passed ? theme.success : theme.danger }}
                  >
                    {g.passed
                      ? language === "id"
                        ? "Lulus"
                        : "Pass"
                      : language === "id"
                        ? "Gagal"
                        : "Fail"}
                  </span>
                </div>
              ))}
              {!allGatesPassed && (
                <div
                  className="pt-2 mt-2"
                  style={{ borderTop: `1px solid ${theme.border}` }}
                >
                  <p className="text-xs" style={{ color: theme.danger }}>
                    {language === "id"
                      ? "⚠️ Gate check belum semua lulus → proyek akan berstatus Not Eligible walaupun skor numerik tinggi."
                      : "⚠️ Not all gate checks passed → project will be Not Eligible even if numerical score is high."}
                  </p>
                </div>
              )}
            </div>

            {/* Evidence Summary */}
            <div
              className="flex items-center justify-between p-4 rounded-xl"
              style={{
                backgroundColor: theme.bgDark,
                border: `1px solid ${theme.border}`,
              }}
            >
              <div>
                <p
                  className="text-sm font-medium"
                  style={{ color: theme.textSecondary }}
                >
                  Evidence Completeness
                </p>
                <p
                  className="text-xs mt-0.5"
                  style={{ color: theme.textMuted }}
                >
                  {indicators.filter((i) => i.status === "complete").length}/
                  {indicators.length}{" "}
                  {language === "id"
                    ? "indikator lengkap"
                    : "indicators complete"}
                </p>
              </div>
              <p
                className="text-2xl font-bold"
                style={{ color: theme.primary }}
              >
                {Math.round(
                  (indicators.filter((i) => i.status === "complete").length /
                    indicators.length) *
                    100,
                )}
                %
              </p>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  // ============================================================================
  // RENDER
  // ============================================================================
  const currentStep = STEPS[step - 1];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: "rgba(0,0,0,0.85)" }}
    >
      <motion.div
        initial={{ scale: 0.96, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        className="w-full max-w-2xl rounded-2xl flex flex-col"
        style={{
          backgroundColor: theme.bgCard,
          border: `1px solid ${theme.border}`,
          maxHeight: "90vh",
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between p-5"
          style={{ borderBottom: `1px solid ${theme.border}` }}
        >
          <div className="flex items-center gap-3">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: `${theme.primary}20` }}
            >
              <currentStep.icon
                className="w-4 h-4"
                style={{ color: theme.primary }}
              />
            </div>
            <div>
              <p
                className="font-semibold text-sm"
                style={{ color: theme.textPrimary }}
              >
                {language === "id" ? currentStep.labelId : currentStep.labelEn}
              </p>
              <p className="text-xs" style={{ color: theme.textMuted }}>
                {language === "id"
                  ? `Langkah ${step} dari ${STEPS.length}`
                  : `Step ${step} of ${STEPS.length}`}{" "}
                — {form.projectTitle}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg transition-colors hover:bg-white/10"
          >
            <X className="w-4 h-4" style={{ color: theme.textMuted }} />
          </button>
        </div>

        {/* Step Progress */}
        <div
          className="px-5 py-3"
          style={{ borderBottom: `1px solid ${theme.border}` }}
        >
          <div className="flex gap-1.5">
            {STEPS.map((s) => (
              <div
                key={s.id}
                className="flex-1 h-1.5 rounded-full transition-all"
                style={{
                  backgroundColor:
                    s.id < step
                      ? theme.success
                      : s.id === step
                        ? theme.primary
                        : theme.border,
                }}
              />
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.15 }}
            >
              {renderStep()}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Validation Error */}
        {validationError && (
          <div
            className="mx-5 mb-0 -mt-1 flex items-center gap-2 px-3 py-2 rounded-lg"
            style={{
              backgroundColor: `${theme.danger}15`,
              border: `1px solid ${theme.danger}30`,
            }}
          >
            <AlertCircle
              className="w-3.5 h-3.5 flex-shrink-0"
              style={{ color: theme.danger }}
            />
            <p className="text-xs" style={{ color: theme.danger }}>
              {validationError}
            </p>
          </div>
        )}

        {/* Footer */}
        <div
          className="flex items-center justify-between p-5"
          style={{ borderTop: `1px solid ${theme.border}` }}
        >
          <button
            onClick={() => {
              setValidationError("");
              setStep((s) => Math.max(1, s - 1));
            }}
            disabled={step === 1}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all disabled:opacity-30"
            style={{
              backgroundColor: theme.bgDark,
              color: theme.textSecondary,
            }}
          >
            <ChevronLeft className="w-4 h-4" />
            {language === "id" ? "Sebelumnya" : "Previous"}
          </button>

          <div
            className="flex items-center gap-2 text-xs"
            style={{ color: theme.textMuted }}
          >
            <div
              className="w-2 h-2 rounded-full"
              style={{
                backgroundColor: allGatesPassed
                  ? theme.success
                  : overall > 0
                    ? theme.warning
                    : theme.border,
              }}
            />
            {overall > 0
              ? `Score: ${overall} (${grade})`
              : language === "id"
                ? "Mengisi data..."
                : "Filling data..."}
          </div>

          {step < STEPS.length ? (
            <button
              onClick={handleNext}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium text-white"
              style={{
                background: `linear-gradient(135deg, ${theme.primary}, ${theme.secondary})`,
              }}
            >
              {language === "id" ? "Selanjutnya" : "Next"}
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium text-white disabled:opacity-60"
              style={{
                background: `linear-gradient(135deg, ${theme.success}, ${theme.secondary})`,
              }}
            >
              {submitting ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <CheckCircle className="w-4 h-4" />
              )}
              {language === "id"
                ? "Simpan & Hitung Skor ESG"
                : "Save & Calculate ESG Score"}
            </button>
          )}
        </div>

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          multiple
          className="hidden"
          onChange={(e) => {
            const category =
              fileInputRef.current?.getAttribute("data-category") || "other";
            handleFileUpload(category)(e);
          }}
        />
      </motion.div>
    </motion.div>
  );
};

export default ESGFormModal;
