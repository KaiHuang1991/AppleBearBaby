import mongoose from 'mongoose'

const videoSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, default: '', trim: true },
    /** Full YouTube URL (Unlisted recommended) or 11-char video ID */
    youtubeUrl: { type: String, required: true, trim: true },
    youtubeId: { type: String, required: true, trim: true },
    /** Optional link to a product detail page */
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'product', default: null },
    category: {
      type: String,
      enum: ['product-demo', 'factory', 'tutorial', 'wholesale', 'other'],
      default: 'product-demo',
    },
    order: { type: Number, default: 0 },
    isPublished: { type: Boolean, default: true },
    views: { type: Number, default: 0 },
  },
  { timestamps: true }
)

videoSchema.index({ isPublished: 1, order: 1, createdAt: -1 })
videoSchema.index({ productId: 1, isPublished: 1 })
videoSchema.index({ youtubeId: 1 })

const videoModel = mongoose.models.video || mongoose.model('video', videoSchema)

export default videoModel
