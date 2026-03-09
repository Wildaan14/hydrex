import mongoose, { Schema, Document } from "mongoose";

// Sub-schemas
const ListingLocationSchema = new Schema({
  province: { type: String, required: true },
  country: { type: String, required: true },
  coordinates: {
    lat: { type: Number },
    lng: { type: Number },
  },
});

const ListingDocumentSchema = new Schema({
  name: { type: String, required: true },
  url: { type: String, required: true },
  type: { type: String, required: true },
});

// Base Listing Schema (shared fields)
const BaseListingSchema = new Schema(
  {
    id: {
      type: String,
      required: true,
      unique: true,
    },
    sellerId: {
      type: String,
      required: true,
    },
    sellerName: {
      type: String,
      required: true,
    },
    sellerType: {
      type: String,
      enum: ["company", "organization", "individual"],
      required: true,
    },
    sellerVerified: {
      type: Boolean,
      default: false,
    },
    projectId: {
      type: String,
    },
    projectName: {
      type: String,
      required: true,
    },
    projectDescription: {
      type: String,
      required: true,
    },
    location: {
      type: ListingLocationSchema,
      required: true,
    },
    availableCredits: {
      type: Number,
      default: 0,
    },
    totalCredits: {
      type: Number,
      default: 0,
    },
    pricePerTon: {
      type: Number,
      default: 0,
    },
    minimumPurchase: {
      type: Number,
      default: 1,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    verificationDate: {
      type: String,
    },
    verificationBody: {
      type: String,
    },
    registryLink: {
      type: String,
    },
    serialNumberPrefix: {
      type: String,
    },
    coverImage: {
      type: String,
      default: "",
    },
    galleryImages: [
      {
        type: String,
      },
    ],
    documents: {
      type: [ListingDocumentSchema],
      default: [],
    },
    rating: {
      type: Number,
      default: 0,
    },
    totalSold: {
      type: Number,
      default: 0,
    },
    reviewCount: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ["active", "sold", "pending", "expired"],
      default: "active",
    },
    expiresAt: {
      type: String,
    },
    featured: {
      type: Boolean,
      default: false,
    },
    promoted: {
      type: Boolean,
      default: false,
    },
    // Category field (using 'type' instead of 'listingCategory' to avoid conflict)
    category: {
      type: String,
      enum: ["community", "corporate"],
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

// Community Listing specific fields
const CommunityListingSchema = new Schema({
  projectType: {
    type: String,
    required: true,
  },
  certificationStandard: {
    type: String,
    required: true,
  },
  methodology: {
    type: String,
    required: true,
  },
  vintageYear: {
    type: Number,
    required: true,
  },
});

// Corporate Listing specific fields
const CorporateListingSchema = new Schema({
  projectType: {
    type: String,
    required: true,
  },
  companyIndustry: {
    type: String,
    required: true,
  },
  companySize: {
    type: String,
    enum: ["small", "medium", "large"],
    required: true,
  },
  tradingIntent: {
    type: String,
    enum: ["sell", "buy"],
    required: true,
  },
  currentWaterQuota: {
    type: Number,
    default: 0,
  },
  actualConsumption: {
    type: Number,
    default: 0,
  },
  surplusDeficit: {
    type: Number,
    default: 0,
  },
  complianceStatus: {
    type: String,
    enum: ["compliant", "non_compliant", "at_risk"],
    default: "compliant",
  },
  lastAuditDate: {
    type: String,
  },
  quotaExpiryDate: {
    type: String,
  },
});

// Create base model
const Listing = mongoose.model("Listing", BaseListingSchema);

// Create discriminators
const CommunityListing = Listing.discriminator(
  "community",
  CommunityListingSchema,
);
const CorporateListing = Listing.discriminator(
  "corporate",
  CorporateListingSchema,
);

export { Listing, CommunityListing, CorporateListing };
export default Listing;
