import mongoose, { Schema, Document } from "mongoose";

export interface IUser extends Document {
  address: string;
  name?: string;
  email?: string;
  avatar?: string;
  bio?: string;
  banner?: string;
  accentColor?: string;
  showcaseTitle?: string;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema: Schema<IUser> = new Schema(
  {
    // ✅ Wallet address is the unique identifier
    address: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    // ✅ Optional profile fields
    name: {
      type: String,
      trim: true,
    },
    email: {
      type: String,
      trim: true,
    },
    avatar: {
      type: String, // URL to profile image (IPFS or CDN)
    },
    bio: {
      type: String,
      maxlength: 200,
      trim: true,
    },
    banner: {
      type: String,
      trim: true,
    },
    accentColor: {
      type: String,
      trim: true,
      default: "#3b82f6",
    },
    showcaseTitle: {
      type: String,
      trim: true,
      default: "My Creation Vault",
    },
  },
  {
    timestamps: true, // auto adds createdAt & updatedAt
  }
);

export default mongoose.model<IUser>("User", userSchema);
