import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";

// ==================== TYPES ====================

// NEW: Project Category - Community vs Corporate
export type ProjectCategory = "community" | "corporate";

export type ProjectStatus =
  | "draft"
  | "pending"
  | "under_verification"
  | "verified"
  | "rejected"
  | "running"
  | "completed";
export type VerificationStatus =
  | "not_started"
  | "pending"
  | "under_review"
  | "verified"
  | "rejected";
export type StepStatus = "pending" | "active" | "completed" | "failed";

// Standar Water Credit Internasional
export type CertificationStandard =
  | "Gold Standard"
  | "Verra VCS"
  | "Plan Vivo"
  | "AWS" // Alliance for Water Stewardship
  | "ISO 14046"; // Water Footprint

// Metodologi sesuai standar water credit
export type Methodology =
  | "Wetland & Mangrove Restoration"
  | "Avoided Deforestation"
  | "Sustainable Agriculture"
  | "Groundwater Recharge"
  | "Irrigation Efficiency"
  | "Community Water Access";

// Updated ProjectType - includes both community and corporate types
export type ProjectType =
  // Community project types (conservation)
  | "reforestation"
  | "conservation"
  | "mangrove"
  | "renewable"
  | "efficiency"
  | "waste"
  | "agroforestry"
  // Corporate project types (water quota trading)
  | "water_quota_trading"
  | "efficiency_improvement"
  | "wastewater_management";

export interface VerificationStep {
  id: number;
  name: string;
  nameEn: string;
  status: StepStatus;
  date?: string;
  description?: string;
  descriptionEn?: string;
  verifier?: string;
  notes?: string;
}

export interface WaterData {
  estimatedCredits: number; // m³
  verifiedCredits: number; // m³
  baselineConsumption: number;
  projectConsumption: number;
  leakageConsumption: number;
  netReduction: number;
  pricePerCredit: number; // price per m³ in project currency
  creditsAvailable: number; // Available for sale
}

// NEW: Corporate Project Data
export interface CorporateData {
  currentWaterQuota: number; // m³/year allocated by government
  actualConsumption: number; // m³/year actually used
  surplusDeficit: number; // positive = surplus, negative = deficit
  tradingIntent: "sell" | "buy"; // selling surplus or buying quota
  pricePerM3: number; // price per m³ for trading
  companySize: "small" | "medium" | "large";
  industry: string; // e.g., "Manufacturing", "Agriculture"
  complianceStatus: "compliant" | "non_compliant" | "at_risk";
  lastAuditDate?: string;
  quotaExpiryDate?: string; // when quota needs renewal
}

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  email: string;
}

export interface Document {
  id: string;
  name: string;
  type: string;
  url: string;
  uploadedAt: string;
  uploadedBy: string;
}

export interface VerificationHistory {
  id: string;
  date: string;
  action: string;
  performedBy: string;
  verifier?: string;
  notes?: string;
}

export interface Project {
  id: string;

  // NEW: Project Category
  category: ProjectCategory; // "community" | "corporate"

  title: string;
  description: string;
  projectType: ProjectType;

  // Location
  location: {
    province: string;
    regency: string;
    district: string;
    village: string;
    coordinates: { lat: number; lng: number };
  };
  areaHectares: number;

  // Timeline
  startDate: string;
  endDate: string;
  creditingPeriodYears: number;

  // Status
  status: ProjectStatus;
  progress: number; // 0-100

  // Water Credit Data (for community projects)
  waterData: WaterData;

  // NEW: Corporate Data (for corporate projects only)
  corporateData?: CorporateData;

  // Currency for pricePerCredit (ISO 4217: USD, IDR, MYR, etc.)
  currency: string;

  // Certification & Methodology - UPDATED
  certificationStandard: CertificationStandard;
  methodology: Methodology;

  // Owner Information - NEW
  owner: string; // Display name
  ownerEmail: string; // Email for filtering
  ownerCompany: string; // Company name
  ownerRole: "admin" | "company"; // Who created this

  // Team
  team: TeamMember[];

  // Media
  coverImage: string;
  galleryImages: string[];

  // Documents
  documents: Document[];

  // Verification - ENHANCED
  verificationStatus: VerificationStatus;
  verificationSteps: VerificationStep[];
  verificationHistory: VerificationHistory[];

  // VVB Integration - NEW
  vvbAssigned?: string; // VVB organization name
  vvbContactEmail?: string;
  vvbVerificationLink?: string; // External link to VVB portal
  vvbReportUrl?: string;

  // Admin Controls - NEW
  adminNotes?: string;
  adminApprovalDate?: string;
  adminApprovedBy?: string;
  adminRejectionReason?: string;

  // Marketplace Integration
  listedInMarketplace: boolean;
  marketplaceListingId?: string;
  sellerVerified: boolean;

  // Blockchain
  blockchainRecords: Array<{
    txHash: string;
    timestamp: string;
    action: string;
  }>;

  createdAt: string;
  updatedAt: string;
}

// ==================== CONTEXT ====================

interface ProjectContextType {
  projects: Project[];

  // CRUD Operations
  addProject: (
    project: Omit<
      Project,
      | "id"
      | "createdAt"
      | "updatedAt"
      | "verificationSteps"
      | "verificationHistory"
      | "blockchainRecords"
    >,
  ) => void;
  updateProject: (id: string, updates: Partial<Project>) => void;
  deleteProject: (id: string) => void;
  getProject: (id: string) => Project | undefined;

  // Role-based Filtering - NEW
  getProjectsByOwner: (ownerEmail: string) => Project[];
  getAllProjects: () => Project[]; // Admin only

  // Verification Management - NEW
  updateVerificationStep: (
    projectId: string,
    stepId: number,
    status: StepStatus,
    verifier?: string,
    notes?: string,
  ) => void;
  assignVVB: (
    projectId: string,
    vvbName: string,
    vvbEmail: string,
    vvbLink: string,
  ) => void;

  // Admin Actions - NEW
  approveProject: (
    projectId: string,
    adminEmail: string,
    notes?: string,
  ) => void;
  rejectProject: (
    projectId: string,
    adminEmail: string,
    reason: string,
  ) => void;
  certifyProject: (projectId: string, adminEmail: string) => void;

  // Marketplace
  listInMarketplace: (projectId: string, listingId: string) => void;

  // Statistics - Role-aware
  getStatistics: (ownerEmail?: string) => {
    totalProjects: number;
    activeProjects: number;
    totalCredits: number;
    teamMembers: number;
    marketplaceListings: number;
    pendingVerifications: number;
  };
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

const STORAGE_KEY = "hydrex-projects-v2";

// In-memory fallback storage
let memoryStorage: Project[] = [];
let useMemoryStorage = false;

// Check if localStorage is available
const isLocalStorageAvailable = (): boolean => {
  try {
    const test = "__localStorage_test__";
    localStorage.setItem(test, test);
    localStorage.removeItem(test);
    return true;
  } catch (e) {
    console.warn("⚠️ localStorage not available, using in-memory storage");
    return false;
  }
};

// Helper to get stored projects
const getStoredProjects = (): Project[] => {
  if (typeof window === "undefined") return [];

  // Check localStorage availability
  if (!isLocalStorageAvailable()) {
    useMemoryStorage = true;
    console.log("📦 Using in-memory storage (localStorage unavailable)");
    return memoryStorage;
  }

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      console.log("📭 No projects found in localStorage");
      return [];
    }
    const parsed = JSON.parse(stored);
    console.log(
      `📂 Loaded ${parsed.length} projects from localStorage (${(stored.length / 1024).toFixed(1)} KB)`,
    );
    return parsed;
  } catch (error) {
    console.error("❌ Error reading from localStorage:", error);
    useMemoryStorage = true;
    return memoryStorage;
  }
};

// Helper to save projects
const saveProjects = (projects: Project[]) => {
  if (typeof window === "undefined") return;

  // Save to memory storage as backup
  memoryStorage = projects;

  // Try to save to localStorage
  if (useMemoryStorage || !isLocalStorageAvailable()) {
    console.log("📦 Saved to in-memory storage (localStorage blocked)");
    return;
  }

  try {
    const serialized = JSON.stringify(projects);
    localStorage.setItem(STORAGE_KEY, serialized);
    console.log(
      `✅ Saved ${projects.length} projects to localStorage (${(serialized.length / 1024).toFixed(1)} KB)`,
    );
  } catch (error) {
    console.error("❌ Error saving to localStorage:", error);
    useMemoryStorage = true;
    console.log("📦 Fallback to in-memory storage");
  }
};

// Default verification steps template
const createVerificationSteps = (): VerificationStep[] => [
  {
    id: 1,
    name: "Upload Dokumen Proyek",
    nameEn: "Project Document Upload",
    status: "completed",
    description:
      "Dokumen PDD, Baseline Study, dan dokumen pendukung telah diupload",
    descriptionEn: "PDD, Baseline Study, and supporting documents uploaded",
    verifier: "HydrEx Platform",
    date: new Date().toISOString().split("T")[0],
  },
  {
    id: 2,
    name: "Screening Administratif",
    nameEn: "Administrative Screening",
    status: "active",
    description:
      "Platform melakukan review kelengkapan dokumen dan kesesuaian kategori",
    descriptionEn:
      "Platform reviews document completeness and category compliance",
  },
  {
    id: 3,
    name: "Validasi oleh VVB",
    nameEn: "Validation by VVB",
    status: "pending",
    description:
      "Validation & Verification Body melakukan validasi metodologi dan baseline",
    descriptionEn: "VVB validates methodology and baseline assessment",
  },
  {
    id: 4,
    name: "Verifikasi Lapangan",
    nameEn: "Field Verification",
    status: "pending",
    description: "Kunjungan lapangan dan verifikasi kondisi aktual proyek",
    descriptionEn: "Field visit and actual project condition verification",
  },
  {
    id: 5,
    name: "Sertifikasi & Registry",
    nameEn: "Certification & Registry",
    status: "pending",
    description: "Penerbitan water credit dan pencatatan di registry",
    descriptionEn: "Water credit issuance and registry recording",
  },
];

// Generate blockchain transaction
const generateBlockchainTx = (action: string) => ({
  txHash: `0x${Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join("")}`,
  timestamp: new Date().toISOString(),
  action,
});

export const ProjectProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load projects on mount
  useEffect(() => {
    const loaded = getStoredProjects();
    console.log(
      `📂 ProjectContext: Loaded ${loaded.length} projects from storage`,
    );
    setProjects(loaded);
    setIsLoaded(true);
  }, []);

  // Save projects when changed (only after initial load)
  useEffect(() => {
    if (!isLoaded) return; // Skip save during initial load
    console.log(
      `💾 ProjectContext: Saving ${projects.length} projects to storage`,
    );
    saveProjects(projects);
  }, [projects, isLoaded]);

  // Add Project
  const addProject = (
    projectData: Omit<
      Project,
      | "id"
      | "createdAt"
      | "updatedAt"
      | "verificationSteps"
      | "verificationHistory"
      | "blockchainRecords"
    >,
  ) => {
    const newProject: Project = {
      ...projectData,
      id: `PROJ-${Date.now()}`,
      verificationSteps: createVerificationSteps(),
      verificationHistory: [
        {
          id: `VH-${Date.now()}`,
          date: new Date().toISOString(),
          action: "Project created and submitted for review",
          performedBy: projectData.ownerEmail,
          notes: "Initial project submission",
        },
      ],
      blockchainRecords: [generateBlockchainTx("Project Created")],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    console.log(
      `➕ Adding new project: ${newProject.id} - ${newProject.title}`,
    );
    setProjects((prev) => [...prev, newProject]);
  };

  // Update Project
  const updateProject = (id: string, updates: Partial<Project>) => {
    console.log(`✏️ Updating project: ${id}`);
    setProjects((prev) =>
      prev.map((p) =>
        p.id === id
          ? { ...p, ...updates, updatedAt: new Date().toISOString() }
          : p,
      ),
    );
  };

  // Delete Project
  const deleteProject = (id: string) => {
    console.log(`🗑️ Deleting project: ${id}`);
    setProjects((prev) => prev.filter((p) => p.id !== id));
  };

  // Get Project
  const getProject = (id: string) => {
    return projects.find((p) => p.id === id);
  };

  // Get Projects by Owner (Company view)
  const getProjectsByOwner = (ownerEmail: string) => {
    return projects.filter((p) => p.ownerEmail === ownerEmail);
  };

  // Get All Projects (Admin view)
  const getAllProjects = () => {
    return projects;
  };

  // Update Verification Step
  const updateVerificationStep = (
    projectId: string,
    stepId: number,
    status: StepStatus,
    verifier?: string,
    notes?: string,
  ) => {
    setProjects((prev) =>
      prev.map((project) => {
        if (project.id !== projectId) return project;

        const updatedSteps = project.verificationSteps.map((step) => {
          if (step.id === stepId) {
            return {
              ...step,
              status,
              verifier: verifier || step.verifier,
              notes: notes || step.notes,
              date:
                status === "completed"
                  ? new Date().toISOString().split("T")[0]
                  : step.date,
            };
          }

          // Auto-activate next step when current completed
          if (step.id === stepId + 1 && status === "completed") {
            return { ...step, status: "active" as StepStatus };
          }

          return step;
        });

        // Check if all steps completed
        const allCompleted = updatedSteps.every(
          (s) => s.status === "completed",
        );

        const updatedHistory = [
          ...project.verificationHistory,
          {
            id: `VH-${Date.now()}`,
            date: new Date().toISOString(),
            action: `Verification step ${stepId} updated to ${status}`,
            performedBy: verifier || "System",
            verifier,
            notes,
          },
        ];

        const updatedBlockchain = [
          ...project.blockchainRecords,
          generateBlockchainTx(`Verification Step ${stepId}: ${status}`),
        ];

        return {
          ...project,
          verificationSteps: updatedSteps,
          verificationHistory: updatedHistory,
          blockchainRecords: updatedBlockchain,
          verificationStatus: allCompleted
            ? ("verified" as VerificationStatus)
            : project.verificationStatus,
          status: allCompleted ? ("verified" as ProjectStatus) : project.status,
          updatedAt: new Date().toISOString(),
        };
      }),
    );
  };

  // Assign VVB
  const assignVVB = (
    projectId: string,
    vvbName: string,
    vvbEmail: string,
    vvbLink: string,
  ) => {
    setProjects((prev) =>
      prev.map((project) => {
        if (project.id !== projectId) return project;

        const updatedHistory = [
          ...project.verificationHistory,
          {
            id: `VH-${Date.now()}`,
            date: new Date().toISOString(),
            action: `VVB assigned: ${vvbName}`,
            performedBy: "Admin",
            verifier: vvbName,
          },
        ];

        return {
          ...project,
          vvbAssigned: vvbName,
          vvbContactEmail: vvbEmail,
          vvbVerificationLink: vvbLink,
          verificationHistory: updatedHistory,
          status: "under_verification" as ProjectStatus,
          updatedAt: new Date().toISOString(),
        };
      }),
    );
  };

  // Approve Project (Admin)
  const approveProject = (
    projectId: string,
    adminEmail: string,
    notes?: string,
  ) => {
    console.log(`✅ Admin approving project: ${projectId}`);
    setProjects((prev) =>
      prev.map((project) => {
        if (project.id !== projectId) return project;

        // Update step 2 to completed
        const updatedSteps = project.verificationSteps.map((step) => {
          if (step.id === 2) {
            return {
              ...step,
              status: "completed" as StepStatus,
              verifier: adminEmail,
              notes: notes || "Administrative screening completed",
              date: new Date().toISOString().split("T")[0],
            };
          }
          if (step.id === 3) {
            return { ...step, status: "active" as StepStatus };
          }
          return step;
        });

        const updatedHistory = [
          ...project.verificationHistory,
          {
            id: `VH-${Date.now()}`,
            date: new Date().toISOString(),
            action: "Project approved by admin",
            performedBy: adminEmail,
            notes,
          },
        ];

        const updatedBlockchain = [
          ...project.blockchainRecords,
          generateBlockchainTx("Admin Approval"),
        ];

        return {
          ...project,
          verificationSteps: updatedSteps,
          verificationHistory: updatedHistory,
          blockchainRecords: updatedBlockchain,
          adminApprovalDate: new Date().toISOString(),
          adminApprovedBy: adminEmail,
          adminNotes: notes,
          status: "under_verification" as ProjectStatus,
          updatedAt: new Date().toISOString(),
        };
      }),
    );
  };

  // Reject Project (Admin)
  const rejectProject = (
    projectId: string,
    adminEmail: string,
    reason: string,
  ) => {
    setProjects((prev) =>
      prev.map((project) => {
        if (project.id !== projectId) return project;

        // Update step 2 to failed
        const updatedSteps = project.verificationSteps.map((step) => {
          if (step.id === 2) {
            return {
              ...step,
              status: "failed" as StepStatus,
              verifier: adminEmail,
              notes: reason,
              date: new Date().toISOString().split("T")[0],
            };
          }
          return step;
        });

        const updatedHistory = [
          ...project.verificationHistory,
          {
            id: `VH-${Date.now()}`,
            date: new Date().toISOString(),
            action: "Project rejected by admin",
            performedBy: adminEmail,
            notes: reason,
          },
        ];

        const updatedBlockchain = [
          ...project.blockchainRecords,
          generateBlockchainTx("Admin Rejection"),
        ];

        return {
          ...project,
          verificationSteps: updatedSteps,
          verificationHistory: updatedHistory,
          blockchainRecords: updatedBlockchain,
          adminRejectionReason: reason,
          status: "rejected" as ProjectStatus,
          verificationStatus: "rejected" as VerificationStatus,
          updatedAt: new Date().toISOString(),
        };
      }),
    );
  };

  // Certify Project (Admin)
  const certifyProject = (projectId: string, adminEmail: string) => {
    setProjects((prev) =>
      prev.map((project) => {
        if (project.id !== projectId) return project;

        // Complete final step
        const updatedSteps = project.verificationSteps.map((step) => {
          if (step.id === 5) {
            return {
              ...step,
              status: "completed" as StepStatus,
              verifier: adminEmail,
              notes: "Project certified and credits issued",
              date: new Date().toISOString().split("T")[0],
            };
          }
          return step;
        });

        const updatedHistory = [
          ...project.verificationHistory,
          {
            id: `VH-${Date.now()}`,
            date: new Date().toISOString(),
            action: "Project certified and credits issued",
            performedBy: adminEmail,
          },
        ];

        const updatedBlockchain = [
          ...project.blockchainRecords,
          generateBlockchainTx("Certification Issued"),
          generateBlockchainTx(
            `${project.waterData.estimatedCredits} m³ Credits Issued`,
          ),
        ];

        return {
          ...project,
          verificationSteps: updatedSteps,
          verificationHistory: updatedHistory,
          blockchainRecords: updatedBlockchain,
          verificationStatus: "verified" as VerificationStatus,
          status: "verified" as ProjectStatus,
          waterData: {
            ...project.waterData,
            verifiedCredits: project.waterData.estimatedCredits,
            creditsAvailable: project.waterData.estimatedCredits,
          },
          sellerVerified: true,
          updatedAt: new Date().toISOString(),
        };
      }),
    );
  };

  // List in Marketplace
  const listInMarketplace = (projectId: string, listingId: string) => {
    const project = projects.find((p) => p.id === projectId);
    if (!project) {
      console.error("❌ Project not found:", projectId);
      return;
    }

    console.log(
      `🛒 Listing project in marketplace: ${projectId} → ${listingId}`,
    );

    // Update project status
    setProjects((prev) =>
      prev.map((p) => {
        if (p.id !== projectId) return p;

        const updatedBlockchain = [
          ...p.blockchainRecords,
          generateBlockchainTx("Listed in Marketplace"),
        ];

        return {
          ...p,
          listedInMarketplace: true,
          marketplaceListingId: listingId,
          blockchainRecords: updatedBlockchain,
          updatedAt: new Date().toISOString(),
        };
      }),
    );
  };

  // Get Statistics (Role-aware)
  const getStatistics = (ownerEmail?: string) => {
    const relevantProjects = ownerEmail
      ? projects.filter((p) => p.ownerEmail === ownerEmail)
      : projects;

    return {
      totalProjects: relevantProjects.length,
      activeProjects: relevantProjects.filter(
        (p) => p.status === "running" || p.status === "under_verification",
      ).length,
      totalCredits: relevantProjects.reduce(
        (sum, p) => sum + p.waterData.estimatedCredits,
        0,
      ),
      teamMembers: relevantProjects.reduce((sum, p) => sum + p.team.length, 0),
      marketplaceListings: relevantProjects.filter((p) => p.listedInMarketplace)
        .length,
      pendingVerifications: relevantProjects.filter(
        (p) => p.status === "pending" || p.status === "under_verification",
      ).length,
    };
  };

  return (
    <ProjectContext.Provider
      value={{
        projects,
        addProject,
        updateProject,
        deleteProject,
        getProject,
        getProjectsByOwner,
        getAllProjects,
        updateVerificationStep,
        assignVVB,
        approveProject,
        rejectProject,
        certifyProject,
        listInMarketplace,
        getStatistics,
      }}
    >
      {children}
    </ProjectContext.Provider>
  );
};

export const useProjects = (): ProjectContextType => {
  const context = useContext(ProjectContext);
  if (context === undefined) {
    throw new Error("useProjects must be used within a ProjectProvider");
  }
  return context;
};

export default ProjectContext;
