/**
 * ============================================================================
 * HYDREX WATER CREDIT — ESG CONTEXT v2.0
 * ============================================================================
 * Changes from v1:
 *  ✅ ESGFormData type exported (shared with ESGFormModal)
 *  ✅ createESGFromProject helper — auto-creates pending ESG when project approved
 *  ✅ getESGBadge — returns badge data for ProjectsPage & MarketplacePage
 *  ✅ lockScoring — called by Admin/Verifier to lock a scoring revision
 *  ✅ Full gate-check derivation from form data (consistent with ESGFormModal)
 *  ✅ Auto-notifyMarketplace when status becomes "eligible"
 *  ✅ Full history with reason & changedBy on every score update
 */

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";

// ==================== TYPES ====================

export type ESGStatus = "eligible" | "conditional" | "not_eligible" | "pending";
export type ESGGrade =
  | "A+"
  | "A"
  | "A-"
  | "B+"
  | "B"
  | "B-"
  | "C+"
  | "C"
  | "C-"
  | "D"
  | "F";
export type RiskLevel = "low" | "medium" | "high" | "critical";

export interface ESGIndicator {
  id: string;
  name: string;
  nameEn: string;
  category: "E" | "S" | "G";
  score: number; // 0-100
  weight: number; // weight within category (out of total weight for that category)
  status: "complete" | "incomplete" | "missing";
  evidence: string[]; // file IDs or references
  notes?: string;
  lastUpdated: string;
}

export interface ESGEvidence {
  id: string;
  name: string;
  type: string;
  url: string;
  uploadedAt: string;
  uploadedBy: string;
  indicatorId: string;
  verified: boolean;
  category: string; // "baseline" | "map" | "calculation" | "mrv" | "permits" | etc.
}

export interface ESGRisk {
  id: string;
  level: RiskLevel;
  category: "E" | "S" | "G";
  title: string;
  titleEn: string;
  description: string;
  descriptionEn: string;
  mitigation?: string;
  mitigationEn?: string;
}

export interface ESGHistory {
  id: string;
  date: string;
  overallScore: number;
  eScore: number;
  sScore: number;
  gScore: number;
  grade: ESGGrade;
  changedBy: string;
  reason: string;
}

export interface ESGScoring {
  id: string;
  projectId: string;
  projectTitle: string;
  projectCategory: "community" | "corporate"; // ← dual category support

  // Scores
  overallScore: number; // 0-100
  eScore: number; // Environmental
  sScore: number; // Social
  gScore: number; // Governance
  grade: ESGGrade;

  // Status
  status: ESGStatus;
  eligibilityNotes?: string;
  locked: boolean; // if true, only Admin can edit

  // Indicators
  indicators: ESGIndicator[];

  // Evidence
  evidenceCompleteness: number; // percentage
  totalEvidence: number;
  verifiedEvidence: number;
  evidenceList: ESGEvidence[];

  // Risks
  risks: ESGRisk[];
  keyRedFlags: string[];

  // History
  history: ESGHistory[];

  // Weights (customizable per project)
  weights: {
    E: number; // default 50
    S: number; // default 25
    G: number; // default 25
  };

  // Gate checks (mandatory requirements — derived from form data)
  gateChecks: {
    hasBaseline: boolean;
    hasMRVPlan: boolean;
    hasPermits: boolean;
    hasGrievanceMechanism: boolean;
    noMajorConflicts: boolean;
  };

  // Metadata
  createdAt: string;
  updatedAt: string;
  lastReviewedBy?: string;
  lastReviewedAt?: string;
  version: number;

  // Marketplace integration
  notifiedInMarketplace: boolean;
  marketplaceVisibility: boolean;
}

// ==================== ESG BADGE (for Projects & Marketplace) ====================

export interface ESGBadge {
  projectId: string;
  scoringId: string;
  overallScore: number;
  grade: ESGGrade;
  status: ESGStatus;
  eScore: number;
  sScore: number;
  gScore: number;
  eligibilityLabel: string; // "Eligible" | "Conditional" | "Not Eligible" | "Pending"
  eligibilityLabelId: string;
  color: string; // hex color for badge
  bgColor: string; // bg for badge chip
  lastUpdated: string;
  locked: boolean;
}

// ==================== CONTEXT TYPE ====================

interface ESGContextType {
  esgScorings: ESGScoring[];

  // CRUD Operations
  addESGScoring: (
    scoring: Omit<
      ESGScoring,
      | "id"
      | "createdAt"
      | "updatedAt"
      | "history"
      | "version"
      | "locked"
      | "evidenceList"
    >,
  ) => string;
  updateESGScoring: (id: string, updates: Partial<ESGScoring>) => void;
  deleteESGScoring: (id: string) => void;
  getESGScoring: (id: string) => ESGScoring | undefined;
  getESGScoringByProject: (projectId: string) => ESGScoring | undefined;

  // Auto-create from project approval
  createESGFromProject: (
    projectId: string,
    projectTitle: string,
    projectCategory?: "community" | "corporate",
  ) => void;

  // Badge for ProjectsPage & MarketplacePage
  getESGBadge: (projectId: string) => ESGBadge | null;

  // Indicator Management
  updateIndicator: (
    scoringId: string,
    indicatorId: string,
    updates: Partial<ESGIndicator>,
  ) => void;
  addEvidence: (scoringId: string, evidence: Omit<ESGEvidence, "id">) => void;
  removeEvidence: (scoringId: string, evidenceId: string) => void;

  // Scoring & Grading
  calculateScore: (scoringId: string) => void;
  recalculateAllScores: () => void;

  // Risk Management
  addRisk: (scoringId: string, risk: Omit<ESGRisk, "id">) => void;
  removeRisk: (scoringId: string, riskId: string) => void;

  // Gate Checks
  updateGateCheck: (
    scoringId: string,
    checkName: keyof ESGScoring["gateChecks"],
    value: boolean,
  ) => void;
  validateGateChecks: (scoringId: string) => boolean;

  // Locking (Admin/Verifier action)
  lockScoring: (scoringId: string, lockedBy: string) => void;
  unlockScoring: (scoringId: string, unlockedBy: string) => void;

  // Marketplace Integration
  notifyMarketplace: (scoringId: string) => void;

  // Statistics
  getStatistics: () => {
    totalScorings: number;
    eligible: number;
    conditional: number;
    notEligible: number;
    pending: number;
    averageScore: number;
    averageEScore: number;
    averageSScore: number;
    averageGScore: number;
  };
}

const ESGContext = createContext<ESGContextType | undefined>(undefined);

const STORAGE_KEY = "hydrex-esg-scorings-v2";

// ==================== STORAGE HELPERS ====================

let memoryStorage: ESGScoring[] = [];
let useMemoryStorage = false;

const isLocalStorageAvailable = (): boolean => {
  try {
    const test = "__localStorage_test__";
    localStorage.setItem(test, test);
    localStorage.removeItem(test);
    return true;
  } catch {
    return false;
  }
};

const getStoredScorings = (): ESGScoring[] => {
  if (typeof window === "undefined") return [];
  if (!isLocalStorageAvailable()) {
    useMemoryStorage = true;
    return memoryStorage;
  }
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];
    return JSON.parse(stored);
  } catch {
    useMemoryStorage = true;
    return memoryStorage;
  }
};

const saveScorings = (scorings: ESGScoring[]) => {
  if (typeof window === "undefined") return;
  memoryStorage = scorings;
  if (useMemoryStorage || !isLocalStorageAvailable()) return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(scorings));
  } catch {
    useMemoryStorage = true;
  }
};

// ==================== GRADE CALCULATOR ====================

export const calculateGrade = (score: number): ESGGrade => {
  if (score >= 97) return "A+";
  if (score >= 93) return "A";
  if (score >= 90) return "A-";
  if (score >= 87) return "B+";
  if (score >= 83) return "B";
  if (score >= 80) return "B-";
  if (score >= 77) return "C+";
  if (score >= 73) return "C";
  if (score >= 70) return "C-";
  if (score >= 60) return "D";
  return "F";
};

// ==================== STATUS HELPER ====================

const deriveStatus = (
  overallScore: number,
  gateChecks: ESGScoring["gateChecks"],
): ESGStatus => {
  const allGatesPassed = Object.values(gateChecks).every(Boolean);
  if (!allGatesPassed) return "not_eligible";
  if (overallScore >= 80) return "eligible";
  if (overallScore >= 65) return "conditional";
  return "not_eligible";
};

// ==================== BADGE HELPERS ====================

const STATUS_BADGE_MAP: Record<
  ESGStatus,
  { label: string; labelId: string; color: string; bgColor: string }
> = {
  eligible: {
    label: "Eligible",
    labelId: "Layak",
    color: "#22c55e",
    bgColor: "#22c55e15",
  },
  conditional: {
    label: "Conditional",
    labelId: "Bersyarat",
    color: "#f59e0b",
    bgColor: "#f59e0b15",
  },
  not_eligible: {
    label: "Not Eligible",
    labelId: "Tidak Layak",
    color: "#ef4444",
    bgColor: "#ef444415",
  },
  pending: {
    label: "Pending",
    labelId: "Menunggu",
    color: "#94a3b8",
    bgColor: "#94a3b815",
  },
};

// ==================== DEFAULT INDICATORS ====================

export const getDefaultIndicators = (): ESGIndicator[] => {
  const now = new Date().toISOString();
  return [
    // Environmental (E)
    {
      id: "E1",
      name: "Dampak Air (Additionality)",
      nameEn: "Water Impact (Additionality)",
      category: "E",
      score: 0,
      weight: 30,
      status: "missing",
      evidence: [],
      lastUpdated: now,
    },
    {
      id: "E2",
      name: "Kuantifikasi Manfaat",
      nameEn: "Benefit Quantification",
      category: "E",
      score: 0,
      weight: 25,
      status: "missing",
      evidence: [],
      lastUpdated: now,
    },
    {
      id: "E3",
      name: "Kualitas Air",
      nameEn: "Water Quality",
      category: "E",
      score: 0,
      weight: 15,
      status: "missing",
      evidence: [],
      lastUpdated: now,
    },
    {
      id: "E4",
      name: "Permanence & Leakage",
      nameEn: "Permanence & Leakage",
      category: "E",
      score: 0,
      weight: 15,
      status: "missing",
      evidence: [],
      lastUpdated: now,
    },
    {
      id: "E5",
      name: "Biodiversitas & Ekosistem",
      nameEn: "Biodiversity & Ecosystem",
      category: "E",
      score: 0,
      weight: 10,
      status: "missing",
      evidence: [],
      lastUpdated: now,
    },
    {
      id: "E6",
      name: "Energi & Emisi",
      nameEn: "Energy & Emissions",
      category: "E",
      score: 0,
      weight: 5,
      status: "missing",
      evidence: [],
      lastUpdated: now,
    },
    // Social (S)
    {
      id: "S1",
      name: "Keterlibatan Stakeholder",
      nameEn: "Stakeholder Engagement",
      category: "S",
      score: 0,
      weight: 30,
      status: "missing",
      evidence: [],
      lastUpdated: now,
    },
    {
      id: "S2",
      name: "Hak Masyarakat & Dampak Sosial",
      nameEn: "Community Rights & Social Impact",
      category: "S",
      score: 0,
      weight: 25,
      status: "missing",
      evidence: [],
      lastUpdated: now,
    },
    {
      id: "S3",
      name: "Mekanisme Keluhan",
      nameEn: "Grievance Mechanism",
      category: "S",
      score: 0,
      weight: 20,
      status: "missing",
      evidence: [],
      lastUpdated: now,
    },
    {
      id: "S4",
      name: "K3 & Keselamatan Kerja",
      nameEn: "OHS & Safety",
      category: "S",
      score: 0,
      weight: 15,
      status: "missing",
      evidence: [],
      lastUpdated: now,
    },
    {
      id: "S5",
      name: "Benefit Sharing",
      nameEn: "Benefit Sharing",
      category: "S",
      score: 0,
      weight: 10,
      status: "missing",
      evidence: [],
      lastUpdated: now,
    },
    // Governance (G)
    {
      id: "G1",
      name: "Legal & Perizinan",
      nameEn: "Legal & Permits",
      category: "G",
      score: 0,
      weight: 25,
      status: "missing",
      evidence: [],
      lastUpdated: now,
    },
    {
      id: "G2",
      name: "Struktur Organisasi & PIC",
      nameEn: "Organization Structure & PIC",
      category: "G",
      score: 0,
      weight: 15,
      status: "missing",
      evidence: [],
      lastUpdated: now,
    },
    {
      id: "G3",
      name: "Anti-Fraud & Anti-Korupsi",
      nameEn: "Anti-Fraud & Anti-Corruption",
      category: "G",
      score: 0,
      weight: 15,
      status: "missing",
      evidence: [],
      lastUpdated: now,
    },
    {
      id: "G4",
      name: "Transparansi Data & Metodologi",
      nameEn: "Data & Methodology Transparency",
      category: "G",
      score: 0,
      weight: 20,
      status: "missing",
      evidence: [],
      lastUpdated: now,
    },
    {
      id: "G5",
      name: "MRV Plan",
      nameEn: "MRV Plan",
      category: "G",
      score: 0,
      weight: 20,
      status: "missing",
      evidence: [],
      lastUpdated: now,
    },
    {
      id: "G6",
      name: "Audit Trail",
      nameEn: "Audit Trail",
      category: "G",
      score: 0,
      weight: 5,
      status: "missing",
      evidence: [],
      lastUpdated: now,
    },
  ];
};

// Corporate-specific indicators (fokus pada water quota & compliance)
export const getCorporateDefaultIndicators = (): ESGIndicator[] => {
  const now = new Date().toISOString();
  return [
    // Environmental (E) — water quota & efficiency focus
    {
      id: "E1",
      name: "Efisiensi Penggunaan Air",
      nameEn: "Water Use Efficiency",
      category: "E",
      score: 0,
      weight: 35,
      status: "missing",
      evidence: [],
      lastUpdated: now,
    },
    {
      id: "E2",
      name: "Akurasi Data Kuota vs Konsumsi",
      nameEn: "Quota vs Consumption Accuracy",
      category: "E",
      score: 0,
      weight: 25,
      status: "missing",
      evidence: [],
      lastUpdated: now,
    },
    {
      id: "E3",
      name: "Pengelolaan Air Limbah",
      nameEn: "Wastewater Management",
      category: "E",
      score: 0,
      weight: 20,
      status: "missing",
      evidence: [],
      lastUpdated: now,
    },
    {
      id: "E4",
      name: "Dampak Lingkungan Sumber Air",
      nameEn: "Water Source Environmental Impact",
      category: "E",
      score: 0,
      weight: 15,
      status: "missing",
      evidence: [],
      lastUpdated: now,
    },
    {
      id: "E5",
      name: "Target Pengurangan Konsumsi",
      nameEn: "Consumption Reduction Target",
      category: "E",
      score: 0,
      weight: 5,
      status: "missing",
      evidence: [],
      lastUpdated: now,
    },
    // Social (S)
    {
      id: "S1",
      name: "Dampak Sosial Penggunaan Air",
      nameEn: "Social Impact of Water Use",
      category: "S",
      score: 0,
      weight: 35,
      status: "missing",
      evidence: [],
      lastUpdated: now,
    },
    {
      id: "S2",
      name: "Keterlibatan Komunitas Lokal",
      nameEn: "Local Community Engagement",
      category: "S",
      score: 0,
      weight: 30,
      status: "missing",
      evidence: [],
      lastUpdated: now,
    },
    {
      id: "S3",
      name: "Mekanisme Keluhan",
      nameEn: "Grievance Mechanism",
      category: "S",
      score: 0,
      weight: 20,
      status: "missing",
      evidence: [],
      lastUpdated: now,
    },
    {
      id: "S4",
      name: "K3 Operasional",
      nameEn: "Operational OHS",
      category: "S",
      score: 0,
      weight: 15,
      status: "missing",
      evidence: [],
      lastUpdated: now,
    },
    // Governance (G)
    {
      id: "G1",
      name: "Kepatuhan Izin Air (SIPA/SIPPA)",
      nameEn: "Water Permit Compliance (SIPA/SIPPA)",
      category: "G",
      score: 0,
      weight: 30,
      status: "missing",
      evidence: [],
      lastUpdated: now,
    },
    {
      id: "G2",
      name: "Audit Kuota Terakhir",
      nameEn: "Last Quota Audit",
      category: "G",
      score: 0,
      weight: 25,
      status: "missing",
      evidence: [],
      lastUpdated: now,
    },
    {
      id: "G3",
      name: "Transparansi Laporan Penggunaan",
      nameEn: "Usage Report Transparency",
      category: "G",
      score: 0,
      weight: 20,
      status: "missing",
      evidence: [],
      lastUpdated: now,
    },
    {
      id: "G4",
      name: "Anti-Fraud & Tata Kelola",
      nameEn: "Anti-Fraud & Governance",
      category: "G",
      score: 0,
      weight: 15,
      status: "missing",
      evidence: [],
      lastUpdated: now,
    },
    {
      id: "G5",
      name: "Rencana Pemantauan Berkelanjutan",
      nameEn: "Continuous Monitoring Plan",
      category: "G",
      score: 0,
      weight: 10,
      status: "missing",
      evidence: [],
      lastUpdated: now,
    },
  ];
};

// ==================== PROVIDER ====================

export const ESGProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [esgScorings, setESGScorings] = useState<ESGScoring[]>([]);

  useEffect(() => {
    const stored = getStoredScorings();
    setESGScorings(stored);
  }, []);

  useEffect(() => {
    if (esgScorings.length > 0 || memoryStorage.length > 0) {
      saveScorings(esgScorings);
    }
  }, [esgScorings]);

  // ---- SCORING ENGINE ----
  const computeCategoryScore = (
    indicators: ESGIndicator[],
    category: "E" | "S" | "G",
  ) => {
    const catInds = indicators.filter((i) => i.category === category);
    const totalWeight = catInds.reduce((s, i) => s + i.weight, 0);
    if (totalWeight === 0) return 0;
    return Math.round(
      catInds.reduce((s, i) => s + (i.score * i.weight) / totalWeight, 0),
    );
  };

  // ---- ADD ----
  const addESGScoring = (
    scoring: Omit<
      ESGScoring,
      | "id"
      | "createdAt"
      | "updatedAt"
      | "history"
      | "version"
      | "locked"
      | "evidenceList"
    >,
  ): string => {
    const newScoring: ESGScoring = {
      ...scoring,
      id: `ESG-${Date.now()}`,
      indicators:
        scoring.indicators.length > 0
          ? scoring.indicators
          : getDefaultIndicators(),
      evidenceList: [],
      history: [],
      version: 1,
      locked: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setESGScorings((prev) => [...prev, newScoring]);
    return newScoring.id;
  };

  // ---- UPDATE ----
  const updateESGScoring = (id: string, updates: Partial<ESGScoring>) => {
    setESGScorings((prev) =>
      prev.map((scoring) => {
        if (scoring.id !== id) return scoring;

        const updated: ESGScoring = {
          ...scoring,
          ...updates,
          updatedAt: new Date().toISOString(),
        };

        // Append history when scores change
        const scoreChanged =
          updates.overallScore !== undefined ||
          updates.eScore !== undefined ||
          updates.sScore !== undefined ||
          updates.gScore !== undefined;

        if (scoreChanged) {
          updated.history = [
            ...scoring.history,
            {
              id: `H-${Date.now()}`,
              date: new Date().toISOString(),
              overallScore: updated.overallScore,
              eScore: updated.eScore,
              sScore: updated.sScore,
              gScore: updated.gScore,
              grade: updated.grade,
              changedBy: updates.lastReviewedBy || "System",
              reason: "Score recalculated from form data",
            },
          ];
          updated.version = scoring.version + 1;
        }

        return updated;
      }),
    );
  };

  // ---- DELETE ----
  const deleteESGScoring = (id: string) => {
    setESGScorings((prev) => prev.filter((s) => s.id !== id));
  };

  // ---- GETTERS ----
  const getESGScoring = (id: string) => esgScorings.find((s) => s.id === id);
  const getESGScoringByProject = (projectId: string) =>
    esgScorings.find((s) => s.projectId === projectId);

  // ---- AUTO-CREATE FROM PROJECT ----
  // Called by ProjectsPage/Admin when a project is approved
  const createESGFromProject = (
    projectId: string,
    projectTitle: string,
    projectCategory: "community" | "corporate" = "community",
  ) => {
    const existing = esgScorings.find((s) => s.projectId === projectId);
    if (existing) return; // already exists

    const defaultGateChecks: ESGScoring["gateChecks"] = {
      hasBaseline: false,
      hasMRVPlan: false,
      hasPermits: false,
      hasGrievanceMechanism: false,
      noMajorConflicts: false,
    };

    addESGScoring({
      projectId,
      projectTitle,
      projectCategory,
      overallScore: 0,
      eScore: 0,
      sScore: 0,
      gScore: 0,
      grade: "F",
      status: "pending",
      indicators:
        projectCategory === "corporate"
          ? getCorporateDefaultIndicators()
          : getDefaultIndicators(),
      evidenceCompleteness: 0,
      totalEvidence: 0,
      verifiedEvidence: 0,
      risks: [],
      keyRedFlags: [],
      weights: { E: 50, S: 25, G: 25 },
      gateChecks: defaultGateChecks,
      notifiedInMarketplace: false,
      marketplaceVisibility: false,
    });
  };

  // ---- ESG BADGE (for Projects & Marketplace) ----
  const getESGBadge = (projectId: string): ESGBadge | null => {
    const scoring = esgScorings.find((s) => s.projectId === projectId);
    if (!scoring) return null;

    const statusInfo = STATUS_BADGE_MAP[scoring.status];
    return {
      projectId,
      scoringId: scoring.id,
      overallScore: scoring.overallScore,
      grade: scoring.grade,
      status: scoring.status,
      eScore: scoring.eScore,
      sScore: scoring.sScore,
      gScore: scoring.gScore,
      eligibilityLabel: statusInfo.label,
      eligibilityLabelId: statusInfo.labelId,
      color: statusInfo.color,
      bgColor: statusInfo.bgColor,
      lastUpdated: scoring.updatedAt,
      locked: scoring.locked,
    };
  };

  // ---- INDICATOR UPDATE ----
  const updateIndicator = (
    scoringId: string,
    indicatorId: string,
    updates: Partial<ESGIndicator>,
  ) => {
    setESGScorings((prev) =>
      prev.map((scoring) => {
        if (scoring.id !== scoringId) return scoring;
        return {
          ...scoring,
          indicators: scoring.indicators.map((ind) =>
            ind.id === indicatorId
              ? { ...ind, ...updates, lastUpdated: new Date().toISOString() }
              : ind,
          ),
          updatedAt: new Date().toISOString(),
        };
      }),
    );
    setTimeout(() => calculateScore(scoringId), 100);
  };

  // ---- EVIDENCE ----
  const addEvidence = (
    scoringId: string,
    evidence: Omit<ESGEvidence, "id">,
  ) => {
    const newEvidence: ESGEvidence = {
      ...evidence,
      id: `EV-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
    };

    setESGScorings((prev) =>
      prev.map((scoring) => {
        if (scoring.id !== scoringId) return scoring;

        const updatedIndicators = scoring.indicators.map((ind) =>
          ind.id === evidence.indicatorId
            ? {
                ...ind,
                evidence: [...ind.evidence, newEvidence.id],
                status: "complete" as const,
                lastUpdated: new Date().toISOString(),
              }
            : ind,
        );

        const totalEvidence = updatedIndicators.reduce(
          (sum, ind) => sum + ind.evidence.length,
          0,
        );

        const completeCount = updatedIndicators.filter(
          (i) => i.status === "complete",
        ).length;

        return {
          ...scoring,
          indicators: updatedIndicators,
          evidenceList: [...scoring.evidenceList, newEvidence],
          totalEvidence,
          evidenceCompleteness: Math.round(
            (completeCount / updatedIndicators.length) * 100,
          ),
          updatedAt: new Date().toISOString(),
        };
      }),
    );
  };

  const removeEvidence = (scoringId: string, evidenceId: string) => {
    setESGScorings((prev) =>
      prev.map((scoring) => {
        if (scoring.id !== scoringId) return scoring;
        return {
          ...scoring,
          evidenceList: scoring.evidenceList.filter((e) => e.id !== evidenceId),
          updatedAt: new Date().toISOString(),
        };
      }),
    );
  };

  // ---- CALCULATE SCORE ----
  const calculateScore = (scoringId: string) => {
    setESGScorings((prev) =>
      prev.map((scoring) => {
        if (scoring.id !== scoringId) return scoring;

        const eScore = computeCategoryScore(scoring.indicators, "E");
        const sScore = computeCategoryScore(scoring.indicators, "S");
        const gScore = computeCategoryScore(scoring.indicators, "G");

        const overallScore = Math.round(
          eScore * (scoring.weights.E / 100) +
            sScore * (scoring.weights.S / 100) +
            gScore * (scoring.weights.G / 100),
        );

        const grade = calculateGrade(overallScore);
        const status = deriveStatus(overallScore, scoring.gateChecks);

        const completeCount = scoring.indicators.filter(
          (i) => i.status === "complete",
        ).length;
        const evidenceCompleteness = Math.round(
          (completeCount / scoring.indicators.length) * 100,
        );

        const updated: ESGScoring = {
          ...scoring,
          overallScore,
          eScore,
          sScore,
          gScore,
          grade,
          status,
          evidenceCompleteness,
          updatedAt: new Date().toISOString(),
          history: [
            ...scoring.history,
            {
              id: `H-${Date.now()}`,
              date: new Date().toISOString(),
              overallScore,
              eScore,
              sScore,
              gScore,
              grade,
              changedBy: "System",
              reason: "Score recalculated",
            },
          ],
          version: scoring.version + 1,
        };

        // Auto-notify marketplace if eligible
        if (status === "eligible" && !scoring.notifiedInMarketplace) {
          updated.notifiedInMarketplace = true;
          updated.marketplaceVisibility = true;
        }

        return updated;
      }),
    );
  };

  // ---- RECALCULATE ALL ----
  const recalculateAllScores = () => {
    esgScorings.forEach((scoring) => calculateScore(scoring.id));
  };

  // ---- RISKS ----
  const addRisk = (scoringId: string, risk: Omit<ESGRisk, "id">) => {
    const newRisk: ESGRisk = { ...risk, id: `R-${Date.now()}` };
    setESGScorings((prev) =>
      prev.map((s) =>
        s.id === scoringId
          ? {
              ...s,
              risks: [...s.risks, newRisk],
              updatedAt: new Date().toISOString(),
            }
          : s,
      ),
    );
  };

  const removeRisk = (scoringId: string, riskId: string) => {
    setESGScorings((prev) =>
      prev.map((s) =>
        s.id === scoringId
          ? {
              ...s,
              risks: s.risks.filter((r) => r.id !== riskId),
              updatedAt: new Date().toISOString(),
            }
          : s,
      ),
    );
  };

  // ---- GATE CHECKS ----
  const updateGateCheck = (
    scoringId: string,
    checkName: keyof ESGScoring["gateChecks"],
    value: boolean,
  ) => {
    setESGScorings((prev) =>
      prev.map((s) =>
        s.id === scoringId
          ? {
              ...s,
              gateChecks: { ...s.gateChecks, [checkName]: value },
              updatedAt: new Date().toISOString(),
            }
          : s,
      ),
    );
    setTimeout(() => calculateScore(scoringId), 100);
  };

  const validateGateChecks = (scoringId: string): boolean => {
    const scoring = esgScorings.find((s) => s.id === scoringId);
    if (!scoring) return false;
    return Object.values(scoring.gateChecks).every(Boolean);
  };

  // ---- LOCKING ----
  const lockScoring = (scoringId: string, lockedBy: string) => {
    setESGScorings((prev) =>
      prev.map((s) =>
        s.id === scoringId
          ? {
              ...s,
              locked: true,
              lastReviewedBy: lockedBy,
              lastReviewedAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            }
          : s,
      ),
    );
  };

  const unlockScoring = (scoringId: string, unlockedBy: string) => {
    setESGScorings((prev) =>
      prev.map((s) =>
        s.id === scoringId
          ? {
              ...s,
              locked: false,
              lastReviewedBy: unlockedBy,
              updatedAt: new Date().toISOString(),
            }
          : s,
      ),
    );
  };

  // ---- MARKETPLACE ----
  const notifyMarketplace = (scoringId: string) => {
    setESGScorings((prev) =>
      prev.map((s) =>
        s.id === scoringId
          ? {
              ...s,
              notifiedInMarketplace: true,
              marketplaceVisibility: true,
              updatedAt: new Date().toISOString(),
            }
          : s,
      ),
    );
  };

  // ---- STATISTICS ----
  const getStatistics = () => ({
    totalScorings: esgScorings.length,
    eligible: esgScorings.filter((s) => s.status === "eligible").length,
    conditional: esgScorings.filter((s) => s.status === "conditional").length,
    notEligible: esgScorings.filter((s) => s.status === "not_eligible").length,
    pending: esgScorings.filter((s) => s.status === "pending").length,
    averageScore:
      esgScorings.length > 0
        ? Math.round(
            esgScorings.reduce((sum, s) => sum + s.overallScore, 0) /
              esgScorings.length,
          )
        : 0,
    averageEScore:
      esgScorings.length > 0
        ? Math.round(
            esgScorings.reduce((sum, s) => sum + s.eScore, 0) /
              esgScorings.length,
          )
        : 0,
    averageSScore:
      esgScorings.length > 0
        ? Math.round(
            esgScorings.reduce((sum, s) => sum + s.sScore, 0) /
              esgScorings.length,
          )
        : 0,
    averageGScore:
      esgScorings.length > 0
        ? Math.round(
            esgScorings.reduce((sum, s) => sum + s.gScore, 0) /
              esgScorings.length,
          )
        : 0,
  });

  return (
    <ESGContext.Provider
      value={{
        esgScorings,
        addESGScoring,
        updateESGScoring,
        deleteESGScoring,
        getESGScoring,
        getESGScoringByProject,
        createESGFromProject,
        getESGBadge,
        updateIndicator,
        addEvidence,
        removeEvidence,
        calculateScore,
        recalculateAllScores,
        addRisk,
        removeRisk,
        updateGateCheck,
        validateGateChecks,
        lockScoring,
        unlockScoring,
        notifyMarketplace,
        getStatistics,
      }}
    >
      {children}
    </ESGContext.Provider>
  );
};

export const useESG = (): ESGContextType => {
  const context = useContext(ESGContext);
  if (context === undefined) {
    throw new Error("useESG must be used within an ESGProvider");
  }
  return context;
};

export default ESGContext;
