import mongoose from 'mongoose'

const floatContactSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  channel: {
    type: String,
    enum: ['whatsapp', 'wechat', 'email', 'phone', 'telegram'],
    required: true,
    default: 'whatsapp',
  },
  value: {
    type: String,
    required: true,
    trim: true,
  },
  label: {
    type: String,
    trim: true,
    default: '',
  },
  qrImageUrl: {
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

const floatContactConfigSchema = new mongoose.Schema({
  contacts: [floatContactSchema],
}, {
  timestamps: true,
})

floatContactConfigSchema.statics.getConfig = async function () {
  let config = await this.findOne()
  if (!config) {
    config = new this({ contacts: [] })
    await config.save()
  }
  return config
}

const floatContactModel = mongoose.models.FloatContactConfig || mongoose.model('FloatContactConfig', floatContactConfigSchema)

export default floatContactModel
