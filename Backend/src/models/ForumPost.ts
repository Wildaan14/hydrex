import mongoose, { Schema, Document } from "mongoose";

interface IReply {
  id: string;
  content: string;
  author: string;
  authorRole: string;
  authorId: string;
  createdAt: string;
  likes: number;
  likedBy: string[];
}

export interface IForumPost extends Document {
  id: string;
  title: string;
  content: string;
  author: string;
  authorRole: string;
  authorId: string;
  category:
    | "general"
    | "technical"
    | "regulation"
    | "marketplace"
    | "project"
    | "announcement";
  tags: string[];
  likes: number;
  likedBy: string[];
  views: number;
  replies: IReply[];
  isPinned: boolean;
  isLocked: boolean;
  isApproved: boolean;
  imageUrl?: string;
}

const ReplySchema = new Schema<IReply>({
  id: { type: String, required: true },
  content: { type: String, required: true },
  author: { type: String, required: true },
  authorRole: { type: String, default: "member" },
  authorId: { type: String, required: true },
  createdAt: { type: String, required: true },
  likes: { type: Number, default: 0 },
  likedBy: [{ type: String }],
});

const ForumPostSchema = new Schema<IForumPost>(
  {
    id: { type: String, required: true, unique: true },
    title: { type: String, required: true, maxlength: 200 },
    content: { type: String, required: true },
    author: { type: String, required: true },
    authorRole: { type: String, default: "member" },
    authorId: { type: String, required: true },
    category: {
      type: String,
      enum: [
        "general",
        "technical",
        "regulation",
        "marketplace",
        "project",
        "announcement",
      ],
      default: "general",
    },
    tags: [{ type: String }],
    likes: { type: Number, default: 0 },
    likedBy: [{ type: String }],
    views: { type: Number, default: 0 },
    replies: [ReplySchema],
    isPinned: { type: Boolean, default: false },
    isLocked: { type: Boolean, default: false },
    isApproved: { type: Boolean, default: true },
    imageUrl: { type: String },
  },
  { timestamps: true },
);

ForumPostSchema.index({ category: 1 });
ForumPostSchema.index({ isPinned: -1, createdAt: -1 });
ForumPostSchema.index({ tags: 1 });

export default mongoose.model<IForumPost>("ForumPost", ForumPostSchema);
