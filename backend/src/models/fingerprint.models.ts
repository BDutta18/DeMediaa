import mongoose, { Schema, Document } from "mongoose"

export interface IContentFingerprint extends Document {
  nftId: string
  tokenId: string
  author: string
  ipfsHash: string
  phash: string
  dhash: string
  ahash: string
  crc32: string
  ssdeep: string
  sha256: string
  width: number
  height: number
  mimeType: string
  fileSize: number
  createdAt: Date
}

const contentFingerprintSchema = new Schema<IContentFingerprint>(
  {
    nftId: { type: String, required: true, index: true },
    tokenId: { type: String, required: true, unique: true },
    author: { type: String, required: true, index: true },
    ipfsHash: { type: String, required: true, index: true },
    phash: { type: String, required: true, index: true },
    dhash: { type: String, required: true },
    ahash: { type: String, required: true },
    crc32: { type: String, required: true },
    ssdeep: { type: String, required: true },
    sha256: { type: String, required: true, index: true },
    width: { type: Number, default: 0 },
    height: { type: Number, default: 0 },
    mimeType: { type: String, default: "image/unknown" },
    fileSize: { type: Number, default: 0 },
  },
  { timestamps: true },
)

contentFingerprintSchema.index({ phash: 1, sha256: 1 })

export default mongoose.model<IContentFingerprint>("ContentFingerprint", contentFingerprintSchema)
