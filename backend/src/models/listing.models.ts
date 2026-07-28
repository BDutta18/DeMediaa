import mongoose, { Schema, Document } from "mongoose";

export interface IListing extends Document {
  nftId: string;
  tokenId: string;
  creator: string;
  contentHash: string;
  name: string;
  description: string;
  imageURL: string;
  licenseTypes: {
    personal: number;
    commercial: number;
    exclusive: number;
  };
  royaltyBps: number;
  active: boolean;
  totalLicensesSold: number;
  totalRevenue: number;
  registryTxHash?: string;
  createdAt: Date;
  updatedAt: Date;
}

const listingSchema = new Schema<IListing>(
  {
    nftId: { type: String, required: true, index: true },
    tokenId: { type: String, required: true, unique: true },
    creator: { type: String, required: true, index: true },
    contentHash: { type: String, required: true, index: true },
    name: { type: String, required: true },
    description: { type: String, required: true },
    imageURL: { type: String, required: true },
    licenseTypes: {
      personal: { type: Number, required: true, min: 0 },
      commercial: { type: Number, required: true, min: 0 },
      exclusive: { type: Number, required: true, min: 0 },
    },
    royaltyBps: { type: Number, default: 1000, min: 0, max: 10000 },
    active: { type: Boolean, default: true },
    totalLicensesSold: { type: Number, default: 0 },
    totalRevenue: { type: Number, default: 0 },
    registryTxHash: { type: String },
  },
  { timestamps: true }
);

listingSchema.index({ active: 1, createdAt: -1 });
listingSchema.index({ creator: 1, active: 1 });

export default mongoose.model<IListing>("Listing", listingSchema);
