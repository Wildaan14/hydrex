// =====================================================
// HYDREX WATER CREDIT - Constants
// =====================================================

// Certification Standards
export const CERTIFICATION_STANDARDS = [
  "Gold Standard",
  "Verra VCS",
  "Plan Vivo",
  "AWS",
  "ISO 14046",
] as const;

// Methodologies
export const METHODOLOGIES = [
  "Wetland & Mangrove Restoration",
  "Avoided Deforestation",
  "Sustainable Agriculture",
  "Groundwater Recharge",
  "Irrigation Efficiency",
  "Community Water Access",
] as const;

// Community Project Types
export const COMMUNITY_PROJECT_TYPES = [
  "reforestation",
  "conservation",
  "mangrove",
  "renewable",
  "efficiency",
  "waste",
  "agroforestry",
] as const;

// Corporate Project Types
export const CORPORATE_PROJECT_TYPES = [
  "water_quota_trading",
  "efficiency_improvement",
  "wastewater_management",
] as const;

// Company Sizes
export const COMPANY_SIZES = ["small", "medium", "large"] as const;

// User Roles
export const USER_ROLES = ["admin", "company", "vvb", "individual"] as const;

// Payment Methods
export const PAYMENT_METHODS = [
  "bank_transfer",
  "e_wallet",
  "crypto",
  "credit_card",
] as const;

// Project Status
export const PROJECT_STATUS = [
  "draft",
  "pending",
  "under_verification",
  "verified",
  "rejected",
  "running",
  "completed",
] as const;

// Verification Status
export const VERIFICATION_STATUS = [
  "not_started",
  "pending",
  "under_review",
  "verified",
  "rejected",
] as const;

// Step Status
export const STEP_STATUS = [
  "pending",
  "active",
  "completed",
  "failed",
] as const;

// ESG Grades
export const ESG_GRADES = [
  "A+",
  "A",
  "A-",
  "B+",
  "B",
  "B-",
  "C+",
  "C",
  "C-",
  "D",
  "F",
] as const;

// Risk Levels
export const RISK_LEVELS = ["low", "medium", "high", "critical"] as const;

// Listing Status
export const LISTING_STATUS = ["active", "sold", "pending", "expired"] as const;

// Transaction Status
export const TRANSACTION_STATUS = [
  "pending",
  "processing",
  "completed",
  "cancelled",
  "refunded",
] as const;

// Compliance Status
export const COMPLIANCE_STATUS = [
  "compliant",
  "non_compliant",
  "at_risk",
] as const;

// Trading Intent
export const TRADING_INTENT = ["sell", "buy"] as const;

// Default Weights for ESG
export const DEFAULT_ESG_WEIGHTS = {
  E: 50,
  S: 25,
  G: 25,
} as const;

// Service Fee Percentage (2.5%)
export const SERVICE_FEE_PERCENTAGE = 0.025;

// Tax Percentage (11%)
export const TAX_PERCENTAGE = 0.11;

// Minimum Purchase
export const MINIMUM_PURCHASE = 1;

// Pagination Defaults
export const DEFAULT_PAGE_LIMIT = 10;
export const MAX_PAGE_LIMIT = 100;

// File Upload
export const ALLOWED_FILE_TYPES = [
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/gif",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
];

// API Response Messages
export const MESSAGES = {
  // Auth
  REGISTER_SUCCESS: "User registered successfully",
  LOGIN_SUCCESS: "Login successful",
  LOGOUT_SUCCESS: "Logout successful",
  TOKEN_EXPIRED: "Token has expired",
  INVALID_CREDENTIALS: "Invalid email or password",

  // Projects
  PROJECT_CREATED: "Project created successfully",
  PROJECT_UPDATED: "Project updated successfully",
  PROJECT_DELETED: "Project deleted successfully",
  PROJECT_NOT_FOUND: "Project not found",

  // Verification
  VERIFICATION_STEP_UPDATED: "Verification step updated",
  VVB_ASSIGNED: "VVB assigned successfully",
  PROJECT_APPROVED: "Project approved successfully",
  PROJECT_REJECTED: "Project rejected",

  // ESG
  ESG_CREATED: "ESG scoring created successfully",
  ESG_UPDATED: "ESG scoring updated successfully",
  ESG_LOCKED: "ESG scoring locked",
  ESG_UNLOCKED: "ESG scoring unlocked",

  // Marketplace
  LISTING_CREATED: "Listing created successfully",
  LISTING_UPDATED: "Listing updated successfully",
  TRANSACTION_CREATED: "Transaction created successfully",
  TRANSACTION_COMPLETED: "Transaction completed",

  // General
  UNAUTHORIZED: "You are not authorized to perform this action",
  NOT_FOUND: "Resource not found",
  SERVER_ERROR: "Internal server error",
  VALIDATION_ERROR: "Validation error",
} as const;
