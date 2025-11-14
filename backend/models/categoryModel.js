import mongoose from 'mongoose'

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  slug: {
    type: String,
    trim: true,
    lowercase: true,
  },
  parent: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'category',
    default: null,
  },
  attributes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'attribute',
  }],
  isActive: {
    type: Boolean,
    default: true,
  },
}, {
  timestamps: true,
})

categorySchema.index({ name: 1, parent: 1 }, { unique: true })

categorySchema.pre('save', function (next) {
  if (!this.slug) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .trim()
      .replace(/\s+/g, '-')
  }
  next()
})

const categoryModel = mongoose.models.category || mongoose.model('category', categorySchema)

export default categoryModel

