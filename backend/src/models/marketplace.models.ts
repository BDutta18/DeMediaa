import mongoose, { Schema, Document } from "mongoose"

export interface IWishlist extends Document {
  userAddress: string
  nftId: string
  tokenId: string
  creator: string
  name: string
  imageURL: string
  priceSnapshot: number
  createdAt: Date
  updatedAt: Date
}

export interface IFollow extends Document {
  followerAddress: string
  creatorAddress: string
  creatorName?: string
  creatorAvatar?: string
  createdAt: Date
  updatedAt: Date
}

export interface IReview extends Document {
  nftId: string
  tokenId: string
  creator: string
  reviewerAddress: string
  rating: number
  title: string
  body: string
  helpfulCount: number
  status: "published" | "flagged" | "hidden"
  createdAt: Date
  updatedAt: Date
}

export interface INotification extends Document {
  recipientAddress: string
  actorAddress?: string
  type: "sale" | "purchase" | "review" | "follow" | "wishlist" | "download" | "system"
  title: string
  message: string
  href?: string
  read: boolean
  metadata?: Record<string, unknown>
  createdAt: Date
  updatedAt: Date
}

export interface IActivity extends Document {
  actorAddress: string
  type: "view" | "wishlist" | "follow" | "review" | "download" | "purchase" | "share"
  nftId?: string
  tokenId?: string
  creatorAddress?: string
  metadata?: Record<string, unknown>
  createdAt: Date
  updatedAt: Date
}

export interface IDownloadRecord extends Document {
  userAddress: string
  nftId: string
  tokenId: string
  creatorAddress: string
  licenseType?: "personal" | "commercial" | "exclusive"
  source: "purchase" | "download"
  fileName?: string
  downloadUrl?: string
  createdAt: Date
  updatedAt: Date
}

const wishlistSchema = new Schema<IWishlist>(
  {
    userAddress: { type: String, required: true, lowercase: true, index: true },
    nftId: { type: String, required: true, index: true },
    tokenId: { type: String, required: true, index: true },
    creator: { type: String, required: true, lowercase: true, index: true },
    name: { type: String, required: true },
    imageURL: { type: String, required: true },
    priceSnapshot: { type: Number, default: 0 },
  },
  { timestamps: true },
)

wishlistSchema.index({ userAddress: 1, tokenId: 1 }, { unique: true })

const followSchema = new Schema<IFollow>(
  {
    followerAddress: { type: String, required: true, lowercase: true, index: true },
    creatorAddress: { type: String, required: true, lowercase: true, index: true },
    creatorName: { type: String },
    creatorAvatar: { type: String },
  },
  { timestamps: true },
)

followSchema.index({ followerAddress: 1, creatorAddress: 1 }, { unique: true })

const reviewSchema = new Schema<IReview>(
  {
    nftId: { type: String, required: true, index: true },
    tokenId: { type: String, required: true, index: true },
    creator: { type: String, required: true, lowercase: true, index: true },
    reviewerAddress: { type: String, required: true, lowercase: true, index: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    title: { type: String, required: true, trim: true, maxlength: 120 },
    body: { type: String, required: true, trim: true, maxlength: 500 },
    helpfulCount: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ["published", "flagged", "hidden"],
      default: "published",
    },
  },
  { timestamps: true },
)

reviewSchema.index({ tokenId: 1, reviewerAddress: 1 }, { unique: true })
reviewSchema.index({ creator: 1, rating: -1 })

const notificationSchema = new Schema<INotification>(
  {
    recipientAddress: { type: String, required: true, lowercase: true, index: true },
    actorAddress: { type: String, lowercase: true },
    type: {
      type: String,
      enum: ["sale", "purchase", "review", "follow", "wishlist", "download", "system"],
      default: "system",
      index: true,
    },
    title: { type: String, required: true },
    message: { type: String, required: true },
    href: { type: String },
    read: { type: Boolean, default: false, index: true },
    metadata: { type: Schema.Types.Mixed },
  },
  { timestamps: true },
)

notificationSchema.index({ recipientAddress: 1, read: 1, createdAt: -1 })

const activitySchema = new Schema<IActivity>(
  {
    actorAddress: { type: String, required: true, lowercase: true, index: true },
    type: {
      type: String,
      enum: ["view", "wishlist", "follow", "review", "download", "purchase", "share"],
      required: true,
      index: true,
    },
    nftId: { type: String, index: true },
    tokenId: { type: String, index: true },
    creatorAddress: { type: String, lowercase: true, index: true },
    metadata: { type: Schema.Types.Mixed },
  },
  { timestamps: true },
)

activitySchema.index({ creatorAddress: 1, type: 1, createdAt: -1 })

const downloadRecordSchema = new Schema<IDownloadRecord>(
  {
    userAddress: { type: String, required: true, lowercase: true, index: true },
    nftId: { type: String, required: true, index: true },
    tokenId: { type: String, required: true, index: true },
    creatorAddress: { type: String, required: true, lowercase: true, index: true },
    licenseType: {
      type: String,
      enum: ["personal", "commercial", "exclusive"],
    },
    source: {
      type: String,
      enum: ["purchase", "download"],
      default: "download",
    },
    fileName: { type: String },
    downloadUrl: { type: String },
  },
  { timestamps: true },
)

downloadRecordSchema.index({ userAddress: 1, createdAt: -1 })
downloadRecordSchema.index({ creatorAddress: 1, createdAt: -1 })

export const WishlistModel =
  mongoose.models.Wishlist || mongoose.model<IWishlist>("Wishlist", wishlistSchema)

export const FollowModel = mongoose.models.Follow || mongoose.model<IFollow>("Follow", followSchema)

export const ReviewModel = mongoose.models.Review || mongoose.model<IReview>("Review", reviewSchema)

export const NotificationModel =
  mongoose.models.Notification || mongoose.model<INotification>("Notification", notificationSchema)

export const ActivityModel =
  mongoose.models.Activity || mongoose.model<IActivity>("Activity", activitySchema)

export const DownloadRecordModel =
  mongoose.models.DownloadRecord ||
  mongoose.model<IDownloadRecord>("DownloadRecord", downloadRecordSchema)
