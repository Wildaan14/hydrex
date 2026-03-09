import mongoose, { Schema, Document } from "mongoose";

export interface IMRVReport extends Document {
  id: string;
  projectId: string;
  projectName: string;
  reportType: "mrv" | "emission" | "certificate" | "esg" | "audit";
  status: "ready" | "generating" | "failed";
  period?: string;
  generatedBy: string;
  location: string;
  credits?: number;
  category: "community" | "corporate";
  industry?: string;
  surplusDeficit?: number;
  tradingIntent?: "sell" | "buy";
  projectStatus:
    | "draft"
    | "pending"
    | "under_verification"
    | "verified"
    | "rejected"
    | "running"
    | "completed";
  description: string;
  fileSize?: string;
  data?: Record<string, any>;
}

const MRVReportSchema = new Schema<IMRVReport>(
  {
    id: { type: String, required: true, unique: true },
    projectId: { type: String, required: true, index: true },
    projectName: { type: String, required: true },
    reportType: {
      type: String,
      enum: ["mrv", "emission", "certificate", "esg", "audit"],
      required: true,
    },
    status: {
      type: String,
      enum: ["ready", "generating", "failed"],
      default: "generating",
    },
    period: { type: String },
    generatedBy: { type: String, required: true },
    location: { type: String, default: "—" },
    credits: { type: Number },
    category: {
      type: String,
      enum: ["community", "corporate"],
      default: "community",
    },
    industry: { type: String },
    surplusDeficit: { type: Number },
    tradingIntent: { type: String, enum: ["sell", "buy"] },
    projectStatus: {
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
    description: { type: String, required: true },
    fileSize: { type: String, default: "—" },
    data: { type: Schema.Types.Mixed, default: {} },
  },
  { timestamps: true },
);

MRVReportSchema.index({ projectId: 1, reportType: 1 });
MRVReportSchema.index({ category: 1 });
MRVReportSchema.index({ projectStatus: 1 });

export default mongoose.model<IMRVReport>("MRVReport", MRVReportSchema);
