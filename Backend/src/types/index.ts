// =====================================================
// HYDREX WATER CREDIT - TypeScript Interfaces
// =====================================================

// ==================== ENUMS ====================

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

export type CertificationStandard =
  | "Gold Standard"
  | "Verra VCS"
  | "Plan Vivo"
  | "AWS"
  | "ISO 14046";

export type Methodology =
  | "Wetland & Mangrove Restoration"
  | "Avoided Deforestation"
  | "Sustainable Agriculture"
  | "Groundwater Recharge"
  | "Irrigation Efficiency"
  | "Community Water Access";

export type ProjectType =
  | "reforestation"
  | "conservation"
  | "mangrove"
  | "renewable"
  | "efficiency"
  | "waste"
  | "agroforestry"
  | "water_quota_trading"
  | "efficiency_improvement"
  | "wastewater_management";

// ==================== USER TYPES ====================

export interface IUser {
  _id: string;
  email: string;
  password: string;
  name: string;
  company?: string;
  role: "admin" | "company" | "vvb" | "individual";
  avatar?: string;
  phone?: string;
  address?: string;
  country?: string;
  verified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface AuthRequest {
  user?: IUser;
}

// ==================== PROJECT TYPES ====================

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
  estimatedCredits: number;
  verifiedCredits: number;
  baselineConsumption: number;
  projectConsumption: number;
  leakageConsumption: number;
  netReduction: number;
  pricePerCredit: number;
  creditsAvailable: number;
}

export interface CorporateData {
  currentWaterQuota: number;
  actualConsumption: number;
  surplusDeficit: number;
  tradingIntent: "sell" | "buy";
  pricePerM3: number;
  companySize: "small" | "medium" | "large";
  industry: string;
  complianceStatus: "compliant" | "non_compliant" | "at_risk";
  lastAuditDate?: string;
  quotaExpiryDate?: string;
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

export interface Location {
  province: string;
  regency: string;
  district: string;
  village: string;
  coordinates: { lat: number; lng: number };
}

export interface BlockchainRecord {
  txHash: string;
  timestamp: string;
  action: string;
}

export interface IProject {
  _id: string;
  id: string;
  category: ProjectCategory;
  title: string;
  description: string;
  projectType: ProjectType;
  location: Location;
  areaHectares: number;
  startDate: string;
  endDate: string;
  creditingPeriodYears: number;
  status: ProjectStatus;
  progress: number;
  waterData: WaterData;
  corporateData?: CorporateData;
  currency: string;
  certificationStandard: CertificationStandard;
  methodology: Methodology;
  owner: string;
  ownerEmail: string;
  ownerCompany: string;
  ownerRole: "admin" | "company";
  team: TeamMember[];
  coverImage: string;
  galleryImages: string[];
  documents: Document[];
  verificationStatus: VerificationStatus;
  verificationSteps: VerificationStep[];
  verificationHistory: VerificationHistory[];
  vvbAssigned?: string;
  vvbContactEmail?: string;
  vvbVerificationLink?: string;
  vvbReportUrl?: string;
  adminNotes?: string;
  adminApprovalDate?: string;
  adminApprovedBy?: string;
  adminRejectionReason?: string;
  listedInMarketplace: boolean;
  marketplaceListingId?: string;
  sellerVerified: boolean;
  blockchainRecords: BlockchainRecord[];
  createdAt: string;
  updatedAt: string;
}

// ==================== ESG TYPES ====================

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
  score: number;
  weight: number;
  status: "complete" | "incomplete" | "missing";
  evidence: string[];
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
  category: string;
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

export interface GateChecks {
  hasBaseline: boolean;
  hasMRVPlan: boolean;
  hasPermits: boolean;
  hasGrievanceMechanism: boolean;
  noMajorConflicts: boolean;
}

export interface Weights {
  E: number;
  S: number;
  G: number;
}

export interface IESGScoring {
  _id: string;
  id: string;
  projectId: string;
  projectTitle: string;
  projectCategory: "community" | "corporate";
  overallScore: number;
  eScore: number;
  sScore: number;
  gScore: number;
  grade: ESGGrade;
  status: ESGStatus;
  eligibilityNotes?: string;
  locked: boolean;
  indicators: ESGIndicator[];
  evidenceCompleteness: number;
  totalEvidence: number;
  verifiedEvidence: number;
  evidenceList: ESGEvidence[];
  risks: ESGRisk[];
  keyRedFlags: string[];
  history: ESGHistory[];
  weights: Weights;
  gateChecks: GateChecks;
  createdAt: string;
  updatedAt: string;
  lastReviewedBy?: string;
  lastReviewedAt?: string;
  version: number;
  notifiedInMarketplace: boolean;
  marketplaceVisibility: boolean;
}

export interface ESGBadge {
  projectId: string;
  scoringId: string;
  overallScore: number;
  grade: ESGGrade;
  status: ESGStatus;
  eScore: number;
  sScore: number;
  gScore: number;
  eligibilityLabel: string;
  eligibilityLabelId: string;
  color: string;
  bgColor: string;
  lastUpdated: string;
  locked: boolean;
}

// ==================== MARKETPLACE TYPES ====================

export type ListingCategory = "community" | "corporate";
export type ListingStatus = "active" | "sold" | "pending" | "expired";
export type TransactionStatus =
  | "pending"
  | "processing"
  | "completed"
  | "cancelled"
  | "refunded";
export type PaymentMethod =
  | "bank_transfer"
  | "e_wallet"
  | "crypto"
  | "credit_card";

export interface CommunityProjectType {
  listingCategory: "community";
  projectType:
    | "reforestation"
    | "conservation"
    | "mangrove"
    | "renewable"
    | "efficiency"
    | "waste"
    | "agroforestry";
  certificationStandard: CertificationStandard;
  methodology: string;
  vintageYear: number;
}

export interface CorporateProjectType {
  listingCategory: "corporate";
  projectType:
    | "water_quota_trading"
    | "efficiency_improvement"
    | "wastewater_management";
  companyIndustry: string;
  companySize: "small" | "medium" | "large";
  tradingIntent: "sell" | "buy";
  currentWaterQuota: number;
  actualConsumption: number;
  surplusDeficit: number;
  complianceStatus: "compliant" | "non_compliant" | "at_risk";
  lastAuditDate?: string;
  quotaExpiryDate?: string;
}

export interface BaseListing {
  id: string;
  sellerId: string;
  sellerName: string;
  sellerType: "company" | "organization" | "individual";
  sellerVerified: boolean;
  projectId?: string;
  projectName: string;
  projectDescription: string;
  location: {
    province: string;
    country: string;
    coordinates?: { lat: number; lng: number };
  };
  availableCredits: number;
  totalCredits: number;
  pricePerTon: number;
  minimumPurchase: number;
  isVerified: boolean;
  verificationDate?: string;
  verificationBody?: string;
  registryLink?: string;
  serialNumberPrefix?: string;
  coverImage: string;
  galleryImages: string[];
  documents: { name: string; url: string; type: string }[];
  rating: number;
  totalSold: number;
  reviewCount: number;
  status: ListingStatus;
  createdAt: string;
  updatedAt: string;
  expiresAt?: string;
  featured: boolean;
  promoted: boolean;
}

export type IListing = BaseListing &
  (CommunityProjectType | CorporateProjectType);

export interface CartItem {
  listingId: string;
  listingCategory: ListingCategory;
  quantity: number;
  pricePerTon: number;
  addedAt: string;
}

export interface TransactionItem {
  listingId: string;
  listingCategory: ListingCategory;
  projectName: string;
  sellerName: string;
  quantity: number;
  pricePerTon: number;
  subtotal: number;
  certificationStandard?: CertificationStandard;
  vintageYear?: number;
  tradingIntent?: "sell" | "buy";
  companyIndustry?: string;
}

export interface ITransaction {
  _id: string;
  id: string;
  buyerId: string;
  buyerName: string;
  buyerEmail: string;
  items: TransactionItem[];
  subtotal: number;
  serviceFee: number;
  tax: number;
  total: number;
  paymentMethod: PaymentMethod;
  paymentStatus: TransactionStatus;
  paymentDate?: string;
  paymentProof?: string;
  certificateId?: string;
  certificateUrl?: string;
  serialNumbers?: string[];
  blockchainTxHash?: string;
  blockchainBlockNumber?: number;
  createdAt: string;
  completedAt?: string;
  notes?: string;
}

export interface CertificateCredit {
  listingCategory: ListingCategory;
  projectName: string;
  quantity: number;
  serialNumbers: string[];
  certificationStandard?: CertificationStandard;
  vintageYear?: number;
  tradingIntent?: "sell" | "buy";
  companyIndustry?: string;
}

export interface ICertificate {
  _id: string;
  id: string;
  transactionId: string;
  buyerName: string;
  buyerEmail: string;
  credits: CertificateCredit[];
  totalCredits: number;
  issuedAt: string;
  validUntil?: string;
  qrCode?: string;
  blockchainVerified: boolean;
  blockchainTxHash?: string;
}

export interface IContract {
  _id: string;
  id: string;
  transactionId: string;
  projectId: string;
  projectName: string;
  listingCategory: ListingCategory;
  seller: string;
  buyer: string;
  province: string;
  date: string;
  quantity: number;
  pricePerCredit: number;
  totalAmount: number;
  certificationStandard?: CertificationStandard;
  methodology?: string;
  tradingIntent?: "sell" | "buy";
  companyIndustry?: string;
  verifier: string;
  status: "active" | "completed" | "cancelled";
  blockchainTxHash?: string;
}

export interface WCPADocument {
  _id: string;
  id: string;
  contractId: string;
  transactionId: string;
  projectName: string;
  issuedAt: string;
  validUntil?: string;
}

// ==================== RESPONSE TYPES ====================

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    limit: number;
    page: number;
    total: number;
    totalPages: number;
  };
}

// ==================== STATISTICS TYPES ====================

export interface ProjectStatistics {
  totalProjects: number;
  activeProjects: number;
  totalCredits: number;
  teamMembers: number;
  marketplaceListings: number;
  pendingVerifications: number;
}

export interface ESGStatistics {
  totalScorings: number;
  eligible: number;
  conditional: number;
  notEligible: number;
  pending: number;
  averageScore: number;
  averageEScore: number;
  averageSScore: number;
  averageGScore: number;
}

export interface MarketplaceStatistics {
  totalListings: number;
  communityListings: number;
  corporateListings: number;
  totalCreditsAvailable: number;
  totalTransactions: number;
  totalCreditsSold: number;
  averagePrice: number;
}
