import mongoose, { Schema, Document } from "mongoose";

export interface IBlockchainRecord extends Document {
  id: string;
  projectId: string;
  projectTitle: string;
  action: "verified" | "credited" | "updated" | "registered" | "transferred";
  txHash: string;
  blockNumber?: number;
  timestamp: string;
  dataHash?: string;
  verifier?: string;
  amount?: number;
  unit?: string;
  metadata?: Record<string, any>;
}

const BlockchainRecordSchema = new Schema<IBlockchainRecord>(
  {
    id: { type: String, required: true, unique: true },
    projectId: { type: String, required: true, index: true },
    projectTitle: { type: String, required: true },
    action: {
      type: String,
      enum: ["verified", "credited", "updated", "registered", "transferred"],
      required: true,
    },
    txHash: { type: String, required: true, unique: true },
    blockNumber: { type: Number },
    timestamp: { type: String, required: true },
    dataHash: { type: String },
    verifier: { type: String },
    amount: { type: Number },
    unit: { type: String, default: "m³" },
    metadata: { type: Schema.Types.Mixed, default: {} },
  },
  { timestamps: true },
);

BlockchainRecordSchema.index({ timestamp: -1 });
BlockchainRecordSchema.index({ action: 1 });

export default mongoose.model<IBlockchainRecord>(
  "BlockchainRecord",
  BlockchainRecordSchema,
);
