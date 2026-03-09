import mongoose, { Schema, Document } from "mongoose";

// Transaction Item Schema
const TransactionItemSchema = new Schema({
  listingId: { type: String, required: true },
  listingCategory: { type: String, required: true },
  projectName: { type: String, required: true },
  sellerName: { type: String, required: true },
  quantity: { type: Number, required: true },
  pricePerTon: { type: Number, required: true },
  subtotal: { type: Number, required: true },
  certificationStandard: { type: String },
  vintageYear: { type: Number },
  tradingIntent: { type: String },
  companyIndustry: { type: String },
});

// Main Transaction Schema
const TransactionSchema = new Schema(
  {
    id: {
      type: String,
      required: true,
      unique: true,
    },
    buyerId: {
      type: String,
      required: true,
    },
    buyerName: {
      type: String,
      required: true,
    },
    buyerEmail: {
      type: String,
      required: true,
    },
    items: {
      type: [TransactionItemSchema],
      default: [],
    },
    subtotal: {
      type: Number,
      required: true,
    },
    serviceFee: {
      type: Number,
      required: true,
    },
    tax: {
      type: Number,
      required: true,
    },
    total: {
      type: Number,
      required: true,
    },
    paymentMethod: {
      type: String,
      enum: ["bank_transfer", "e_wallet", "crypto", "credit_card"],
      required: true,
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "processing", "completed", "cancelled", "refunded"],
      default: "pending",
    },
    paymentDate: {
      type: String,
    },
    paymentProof: {
      type: String,
    },
    certificateId: {
      type: String,
    },
    certificateUrl: {
      type: String,
    },
    serialNumbers: [
      {
        type: String,
      },
    ],
    blockchainTxHash: {
      type: String,
    },
    blockchainBlockNumber: {
      type: Number,
    },
    completedAt: {
      type: String,
    },
    notes: {
      type: String,
    },
  },
  {
    timestamps: true,
  },
);

// Certificate Credit Schema
const CertificateCreditSchema = new Schema({
  listingCategory: { type: String, required: true },
  projectName: { type: String, required: true },
  quantity: { type: Number, required: true },
  serialNumbers: [{ type: String }],
  certificationStandard: { type: String },
  vintageYear: { type: Number },
  tradingIntent: { type: String },
  companyIndustry: { type: String },
});

// Certificate Schema
const CertificateSchema = new Schema(
  {
    id: {
      type: String,
      required: true,
      unique: true,
    },
    transactionId: {
      type: String,
      required: true,
    },
    buyerName: {
      type: String,
      required: true,
    },
    buyerEmail: {
      type: String,
      required: true,
    },
    credits: {
      type: [CertificateCreditSchema],
      default: [],
    },
    totalCredits: {
      type: Number,
      required: true,
    },
    issuedAt: {
      type: String,
      required: true,
    },
    validUntil: {
      type: String,
    },
    qrCode: {
      type: String,
    },
    blockchainVerified: {
      type: Boolean,
      default: false,
    },
    blockchainTxHash: {
      type: String,
    },
  },
  {
    timestamps: true,
  },
);

// Contract Schema
const ContractSchema = new Schema(
  {
    id: {
      type: String,
      required: true,
      unique: true,
    },
    transactionId: {
      type: String,
      required: true,
    },
    projectId: {
      type: String,
      required: true,
    },
    projectName: {
      type: String,
      required: true,
    },
    listingCategory: {
      type: String,
      required: true,
    },
    seller: {
      type: String,
      required: true,
    },
    buyer: {
      type: String,
      required: true,
    },
    province: {
      type: String,
      required: true,
    },
    date: {
      type: String,
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
    },
    pricePerCredit: {
      type: Number,
      required: true,
    },
    totalAmount: {
      type: Number,
      required: true,
    },
    certificationStandard: {
      type: String,
    },
    methodology: {
      type: String,
    },
    tradingIntent: {
      type: String,
    },
    companyIndustry: {
      type: String,
    },
    verifier: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["active", "completed", "cancelled"],
      default: "active",
    },
    blockchainTxHash: {
      type: String,
    },
  },
  {
    timestamps: true,
  },
);

// WCPA Document Schema
const WCPADocumentSchema = new Schema(
  {
    id: {
      type: String,
      required: true,
      unique: true,
    },
    contractId: {
      type: String,
      required: true,
    },
    transactionId: {
      type: String,
      required: true,
    },
    projectName: {
      type: String,
      required: true,
    },
    issuedAt: {
      type: String,
      required: true,
    },
    validUntil: {
      type: String,
    },
  },
  {
    timestamps: true,
  },
);

export const Transaction = mongoose.model("Transaction", TransactionSchema);
export const Certificate = mongoose.model("Certificate", CertificateSchema);
export const Contract = mongoose.model("Contract", ContractSchema);
export const WCPA = mongoose.model("WCPA", WCPADocumentSchema);

export default {
  Transaction,
  Certificate,
  Contract,
  WCPA,
};
