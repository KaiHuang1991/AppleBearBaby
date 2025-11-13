import mongoose from 'mongoose'

const heroSlideSchema = new mongoose.Schema({
  imageUrl: {
    type: String,
    required: true
  },
  linkUrl: {
    type: String,
    default: '' // Optional link URL
  },
  title: {
    type: String,
    required: true
  },
  features: {
    type: [String],
    default: []
  },
  buttonText: {
    type: String,
    default: 'View All Products'
  },
  order: {
    type: Number,
    default: 0 // For ordering slides
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
})

const heroConfigSchema = new mongoose.Schema({
  slides: [heroSlideSchema],
  autoPlay: {
    type: Boolean,
    default: true
  },
  autoPlayInterval: {
    type: Number,
    default: 3000 // milliseconds
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
})

// Only one hero config document should exist
heroConfigSchema.statics.getHeroConfig = async function() {
  let config = await this.findOne()
  if (!config) {
    // Create default config if none exists
    config = new this({
      slides: [],
      autoPlay: true,
      autoPlayInterval: 3000,
      isActive: true
    })
    await config.save()
  }
  return config
}

export default mongoose.model('HeroConfig', heroConfigSchema)

