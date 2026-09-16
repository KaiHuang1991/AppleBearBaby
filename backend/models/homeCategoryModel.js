import mongoose from 'mongoose'

const homeCategoryTileSchema = new mongoose.Schema({
  categoryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'category',
    required: true,
  },
  title: {
    type: String,
    trim: true,
    default: '',
  },
  imageUrl: {
    type: String,
    trim: true,
    default: '',
  },
  order: {
    type: Number,
    default: 0,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
}, {
  timestamps: true,
})

const homeCategoryConfigSchema = new mongoose.Schema({
  tiles: [homeCategoryTileSchema],
}, {
  timestamps: true,
})

homeCategoryConfigSchema.statics.getConfig = async function () {
  let config = await this.findOne()
  if (!config) {
    config = new this({ tiles: [] })
    await config.save()
  }
  return config
}

const homeCategoryModel = mongoose.models.HomeCategoryConfig || mongoose.model('HomeCategoryConfig', homeCategoryConfigSchema)

export default homeCategoryModel
