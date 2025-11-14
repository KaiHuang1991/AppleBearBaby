import mongoose from 'mongoose'

const attributeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    unique: true,
  },
  label: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    trim: true,
  },
  color: {
    type: String,
    trim: true,
    default: '#3b82f6',
  },
  isActive: {
    type: Boolean,
    default: true,
  },
}, {
  timestamps: true,
})

const attributeModel = mongoose.models.attribute || mongoose.model('attribute', attributeSchema)

export default attributeModel

