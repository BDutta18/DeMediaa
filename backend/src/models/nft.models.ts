import mongoose, { Schema, Document } from "mongoose"

export interface INFT extends Document {
  author: string
  owner: string
  name: string
  description: string
  category?: string
  tags?: string[]
  price: number
  forSale: boolean
  imageURL: string
  metadataURL: string
  ipfsHash: string
  contentId?: string
  registryTxHash?: string
  tokenId: string
  txHash: string
  viewCount: number
  downloadCount: number
}

const nftSchema = new Schema<INFT>(
  {
    author: { type: String, required: true },
    owner: {
      type: String,
      default: function () {
        return this.author
      },
    },
    name: { type: String, required: true },
    description: { type: String, required: true },
    category: { type: String, trim: true, default: "General" },
    tags: [{ type: String, trim: true }],
    price: { type: Number, default: 0 },
    forSale: { type: Boolean, default: false },
    imageURL: { type: String, required: true },
    metadataURL: { type: String, required: true },
    ipfsHash: { type: String, required: true },
    contentId: { type: String },
    registryTxHash: { type: String },
    tokenId: { type: String, required: true },
    txHash: { type: String, required: true },
    viewCount: { type: Number, default: 0 },
    downloadCount: { type: Number, default: 0 },
  },
  { timestamps: true },
)

export default mongoose.model<INFT>("Nft", nftSchema)
