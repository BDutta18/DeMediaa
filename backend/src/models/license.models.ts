import mongoose, { Schema, Document } from "mongoose";

export interface ILicense extends Document {
  listingId: string;
  nftId: string;
  tokenId: string;
  creator: string;
  buyer: string;
  contentHash: string;
  licenseType: "personal" | "commercial" | "exclusive";
  price: number;
  royaltyBps: number;
  royaltyAmount: number;
  currency: string;
  txHash: string;
  status: "active" | "revoked" | "expired";
  expiresAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const licenseSchema = new Schema<ILicense>(
  {
    listingId: { type: String, required: true, index: true },
    nftId: { type: String, required: true, index: true },
    tokenId: { type: String, required: true, index: true },
    creator: { type: String, required: true, index: true },
    buyer: { type: String, required: true, index: true },
    contentHash: { type: String, required: true },
    licenseType: {
      type: String,
      enum: ["personal", "commercial", "exclusive"],
      required: true,
    },
    price: { type: Number, required: true },
    royaltyBps: { type: Number, default: 1000 },
    royaltyAmount: { type: Number, default: 0 },
    currency: { type: String, default: "XLM" },
    txHash: { type: String, required: true },
    status: {
      type: String,
      enum: ["active", "revoked", "expired"],
      default: "active",
    },
    expiresAt: { type: Date },
  },
  { timestamps: true }
);

licenseSchema.index({ buyer: 1, status: 1 });
licenseSchema.index({ creator: 1, status: 1 });
licenseSchema.index({ nftId: 1, licenseType: 1 });

export default mongoose.model<ILicense>("License", licenseSchema);
