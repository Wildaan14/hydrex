import mongoose, { Schema, Document } from "mongoose";

export interface INews extends Document {
  id: string;
  title: string;
  summary: string;
  content: string;
  author: string;
  authorId: string;
  category:
    | "regulation"
    | "technology"
    | "market"
    | "environment"
    | "policy"
    | "general";
  imageUrl?: string;
  tags: string[];
  isPublished: boolean;
  publishedAt?: string;
  viewCount: number;
  source?: string;
  externalUrl?: string;
}

const NewsSchema = new Schema<INews>(
  {
    id: { type: String, required: true, unique: true },
    title: { type: String, required: true, maxlength: 300 },
    summary: { type: String, required: true, maxlength: 500 },
    content: { type: String, required: true },
    author: { type: String, required: true },
    authorId: { type: String, required: true },
    category: {
      type: String,
      enum: [
        "regulation",
        "technology",
        "market",
        "environment",
        "policy",
        "general",
      ],
      default: "general",
    },
    imageUrl: { type: String },
    tags: [{ type: String }],
    isPublished: { type: Boolean, default: false },
    publishedAt: { type: String },
    viewCount: { type: Number, default: 0 },
    source: { type: String },
    externalUrl: { type: String },
  },
  { timestamps: true },
);

NewsSchema.index({ isPublished: 1, publishedAt: -1 });
NewsSchema.index({ category: 1 });
NewsSchema.index({ tags: 1 });

export default mongoose.model<INews>("News", NewsSchema);
