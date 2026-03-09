import mongoose, { Schema, Document } from "mongoose";

// Sub-schemas
const ESGIndicatorSchema = new Schema({
  id: { type: String, required: true },
  name: { type: String, required: true },
  nameEn: { type: String, required: true },
  category: { type: String, enum: ["E", "S", "G"], required: true },
  score: { type: Number, default: 0 },
  weight: { type: Number, default: 0 },
  status: {
    type: String,
    enum: ["complete", "incomplete", "missing"],
    default: "missing",
  },
  evidence: [{ type: String }],
  notes: { type: String },
  lastUpdated: { type: String },
});

const ESGEvidenceSchema = new Schema({
  id: { type: String, required: true },
  name: { type: String, required: true },
  type: { type: String, required: true },
  url: { type: String, required: true },
  uploadedAt: { type: String, required: true },
  uploadedBy: { type: String, required: true },
  indicatorId: { type: String, required: true },
  verified: { type: Boolean, default: false },
  category: { type: String },
});

const ESGRiskSchema = new Schema({
  id: { type: String, required: true },
  level: {
    type: String,
    enum: ["low", "medium", "high", "critical"],
    required: true,
  },
  category: { type: String, enum: ["E", "S", "G"], required: true },
  title: { type: String, required: true },
  titleEn: { type: String, required: true },
  description: { type: String, required: true },
  descriptionEn: { type: String, required: true },
  mitigation: { type: String },
  mitigationEn: { type: String },
});

const ESGHistorySchema = new Schema({
  id: { type: String, required: true },
  date: { type: String, required: true },
  overallScore: { type: Number, required: true },
  eScore: { type: Number, required: true },
  sScore: { type: Number, required: true },
  gScore: { type: Number, required: true },
  grade: { type: String, required: true },
  changedBy: { type: String, required: true },
  reason: { type: String, required: true },
});

const WeightsSchema = new Schema({
  E: { type: Number, default: 50 },
  S: { type: Number, default: 25 },
  G: { type: Number, default: 25 },
});

const GateChecksSchema = new Schema({
  hasBaseline: { type: Boolean, default: false },
  hasMRVPlan: { type: Boolean, default: false },
  hasPermits: { type: Boolean, default: false },
  hasGrievanceMechanism: { type: Boolean, default: false },
  noMajorConflicts: { type: Boolean, default: false },
});

// Main ESG Scoring Schema
const ESGScoringSchema = new Schema(
  {
    id: {
      type: String,
      required: true,
      unique: true,
    },
    projectId: {
      type: String,
      required: true,
    },
    projectTitle: {
      type: String,
      required: true,
    },
    projectCategory: {
      type: String,
      enum: ["community", "corporate"],
      required: true,
    },
    overallScore: {
      type: Number,
      default: 0,
    },
    eScore: {
      type: Number,
      default: 0,
    },
    sScore: {
      type: Number,
      default: 0,
    },
    gScore: {
      type: Number,
      default: 0,
    },
    grade: {
      type: String,
      default: "F",
    },
    status: {
      type: String,
      enum: ["eligible", "conditional", "not_eligible", "pending"],
      default: "pending",
    },
    eligibilityNotes: {
      type: String,
    },
    locked: {
      type: Boolean,
      default: false,
    },
    indicators: {
      type: [ESGIndicatorSchema],
      default: [],
    },
    evidenceCompleteness: {
      type: Number,
      default: 0,
    },
    totalEvidence: {
      type: Number,
      default: 0,
    },
    verifiedEvidence: {
      type: Number,
      default: 0,
    },
    evidenceList: {
      type: [ESGEvidenceSchema],
      default: [],
    },
    risks: {
      type: [ESGRiskSchema],
      default: [],
    },
    keyRedFlags: [
      {
        type: String,
      },
    ],
    history: {
      type: [ESGHistorySchema],
      default: [],
    },
    weights: {
      type: WeightsSchema,
      default: () => ({}),
    },
    gateChecks: {
      type: GateChecksSchema,
      default: () => ({}),
    },
    lastReviewedBy: {
      type: String,
    },
    lastReviewedAt: {
      type: String,
    },
    version: {
      type: Number,
      default: 1,
    },
    notifiedInMarketplace: {
      type: Boolean,
      default: false,
    },
    marketplaceVisibility: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
);

export default mongoose.model("ESGScoring", ESGScoringSchema);
