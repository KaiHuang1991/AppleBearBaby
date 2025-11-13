import mongoose from 'mongoose'

const inquirySchema = new mongoose.Schema({
  userId: {
  type: mongoose.Schema.Types.ObjectId,
  ref: 'user',
  required: false
  },
  userEmail: {
    type: String,
    required: true
  },
  userName: {
  type: String,
  required: false,
  default: ''
  },
  userPhone: {
    type: String,
    default: ''
  },
  products: [{
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'product', // Changed to lowercase to match productModel
      required: true
    },
    productName: {
      type: String,
      required: true
    },
    quantity: {
      type: Number,
      required: true
    },
    size: {
      type: String,
      required: true
    },
    price: {
      type: Number,
      required: true
    }
  }],
  status: {
    type: String,
    enum: ['pending', 'responded', 'completed', 'cancelled'],
    default: 'pending'
  },
  emailStatus: {
    type: String,
    enum: ['pending', 'sent', 'failed'],
    default: 'pending'
  },
  message: {
    type: String,
    default: ''
  },
  adminResponse: {
    type: String,
    default: ''
  },
  totalAmount: {
    type: Number,
    required: true
  }
}, {
  timestamps: true
})

export default mongoose.model('Inquiry', inquirySchema) 