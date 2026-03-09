import mongoose, { Schema, Document } from "mongoose";
import bcrypt from "bcryptjs";

export interface IUserModel extends Document {
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
  isEmailVerified: boolean;
  verificationToken?: string;
  verificationTokenExpires?: Date;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const UserSchema = new Schema<IUserModel>(
  {
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
      select: false,
    },
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },
    company: {
      type: String,
      trim: true,
    },
    role: {
      type: String,
      enum: ["admin", "company", "vvb", "individual"],
      default: "individual",
    },
    avatar: {
      type: String,
    },
    phone: {
      type: String,
    },
    address: {
      type: String,
    },
    country: {
      type: String,
    },
    verified: {
      type: Boolean,
      default: false,
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    verificationToken: String,
    verificationTokenExpires: Date,
  },
  {
    timestamps: true,
  },
);

// Hash password before saving
UserSchema.pre("save", async function (next) {
  if (!this.isModified("password") || !this.password) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password method
UserSchema.methods.comparePassword = async function (
  candidatePassword: string,
): Promise<boolean> {
  if (!this.password) return false;
  return bcrypt.compare(candidatePassword, this.password);
};

export default mongoose.model<IUserModel>("User", UserSchema);
