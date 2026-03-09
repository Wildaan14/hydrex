import mongoose, { Schema, Document } from "mongoose";

// Sub-schemas
const VerificationStepSchema = new Schema({
  id: { type: Number, required: true },
  name: { type: String, required: true },
  nameEn: { type: String, required: true },
  status: {
    type: String,
    enum: ["pending", "active", "completed", "failed"],
    default: "pending",
  },
  date: { type: String },
  description: { type: String },
  descriptionEn: { type: String },
  verifier: { type: String },
  notes: { type: String },
});

const WaterDataSchema = new Schema({
  estimatedCredits: { type: Number, default: 0 },
  verifiedCredits: { type: Number, default: 0 },
  baselineConsumption: { type: Number, default: 0 },
  projectConsumption: { type: Number, default: 0 },
  leakageConsumption: { type: Number, default: 0 },
  netReduction: { type: Number, default: 0 },
  pricePerCredit: { type: Number, default: 0 },
  creditsAvailable: { type: Number, default: 0 },
});

const CorporateDataSchema = new Schema({
  currentWaterQuota: { type: Number, default: 0 },
  actualConsumption: { type: Number, default: 0 },
  surplusDeficit: { type: Number, default: 0 },
  tradingIntent: { type: String, enum: ["sell", "buy"] },
  pricePerM3: { type: Number, default: 0 },
  companySize: { type: String, enum: ["small", "medium", "large"] },
  industry: { type: String },
  complianceStatus: {
    type: String,
    enum: ["compliant", "non_compliant", "at_risk"],
    default: "compliant",
  },
  lastAuditDate: { type: String },
  quotaExpiryDate: { type: String },
});

const TeamMemberSchema = new Schema({
  id: { type: String, required: true },
  name: { type: String, required: true },
  role: { type: String, required: true },
  email: { type: String, required: true },
});

const DocumentSchema = new Schema({
  id: { type: String, required: true },
  name: { type: String, required: true },
  type: { type: String, required: true },
  url: { type: String, required: true },
  uploadedAt: { type: String, required: true },
  uploadedBy: { type: String, required: true },
});

const VerificationHistorySchema = new Schema({
  id: { type: String, required: true },
  date: { type: String, required: true },
  action: { type: String, required: true },
  performedBy: { type: String, required: true },
  verifier: { type: String },
  notes: { type: String },
});

const LocationSchema = new Schema({
  province: { type: String, required: true },
  regency: { type: String, required: true },
  district: { type: String, required: true },
  village: { type: String, required: true },
  coordinates: {
    lat: { type: Number },
    lng: { type: Number },
  },
});

const BlockchainRecordSchema = new Schema({
  txHash: { type: String, required: true },
  timestamp: { type: String, required: true },
  action: { type: String, required: true },
});

// Main Project Schema
const ProjectSchema = new Schema(
  {
    id: {
      type: String,
      required: true,
      unique: true,
    },
    category: {
      type: String,
      enum: ["community", "corporate"],
      required: true,
    },
    title: {
      type: String,
      required: [true, "Project title is required"],
      trim: true,
    },
    description: {
      type: String,
      required: [true, "Project description is required"],
    },
    projectType: {
      type: String,
      required: true,
    },
    location: {
      type: LocationSchema,
      required: true,
    },
    areaHectares: {
      type: Number,
      default: 0,
    },
    startDate: {
      type: String,
      required: true,
    },
    endDate: {
      type: String,
      required: true,
    },
    creditingPeriodYears: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: [
        "draft",
        "pending",
        "under_verification",
        "verified",
        "rejected",
        "running",
        "completed",
      ],
      default: "draft",
    },
    progress: {
      type: Number,
      default: 0,
    },
    waterData: {
      type: WaterDataSchema,
      default: () => ({}),
    },
    corporateData: {
      type: CorporateDataSchema,
    },
    currency: {
      type: String,
      default: "USD",
    },
    certificationStandard: {
      type: String,
      required: true,
    },
    methodology: {
      type: String,
      required: true,
    },
    owner: {
      type: String,
      required: true,
    },
    ownerEmail: {
      type: String,
      required: true,
    },
    ownerCompany: {
      type: String,
      default: "",
    },
    ownerRole: {
      type: String,
      enum: ["admin", "company"],
      default: "company",
    },
    team: {
      type: [TeamMemberSchema],
      default: [],
    },
    coverImage: {
      type: String,
      default: "",
    },
    galleryImages: {
      type: [String],
      default: [],
    },
    documents: {
      type: [DocumentSchema],
      default: [],
    },
    verificationStatus: {
      type: String,
      enum: ["not_started", "pending", "under_review", "verified", "rejected"],
      default: "not_started",
    },
    verificationSteps: {
      type: [VerificationStepSchema],
      default: [],
    },
    verificationHistory: {
      type: [VerificationHistorySchema],
      default: [],
    },
    vvbAssigned: {
      type: String,
    },
    vvbContactEmail: {
      type: String,
    },
    vvbVerificationLink: {
      type: String,
    },
    vvbReportUrl: {
      type: String,
    },
    adminNotes: {
      type: String,
    },
    adminApprovalDate: {
      type: String,
    },
    adminApprovedBy: {
      type: String,
    },
    adminRejectionReason: {
      type: String,
    },
    listedInMarketplace: {
      type: Boolean,
      default: false,
    },
    marketplaceListingId: {
      type: String,
    },
    sellerVerified: {
      type: Boolean,
      default: false,
    },
    blockchainRecords: {
      type: [BlockchainRecordSchema],
      default: [],
    },
  },
  {
    timestamps: true,
  },
);

export default mongoose.model("Project", ProjectSchema);
