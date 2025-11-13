import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  image: { type: [String], required: true }, // 修改為 String 陣列，假設儲存圖片 URL
  category: { type: String, required: true },
  categoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'category' },
  subCategory: { type: String },
  subCategoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'category', default: null },
  thirdCategory: { type: String },
  thirdCategoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'category', default: null },
  sizes: { type: [String], required: true }, // 修改為 String 陣列
  bestseller: { type: Boolean, required: true },
  attributes: [{
    attribute: { type: mongoose.Schema.Types.ObjectId, ref: 'attribute', required: true },
    value: { type: String, trim: true, default: '' }
  }],
  date: { type: Number, required: true },
  reviews: [{ type: mongoose.Schema.Types.ObjectId, ref: 'review' }],
  averageRating: { type: Number, default: 0 },
});

productSchema.index({ reviews: 1 });
productSchema.index({ categoryId: 1 });
productSchema.index({ 'attributes.attribute': 1 });

const productModel = mongoose.models.product || mongoose.model('product', productSchema);

export default productModel;