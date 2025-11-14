import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'user', required: true },
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'product', required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  media: [{ type: String }],
  isApproved: { type: Boolean, default: false },
});

// 添加索引以優化查詢
reviewSchema.index({ userId: 1 });
reviewSchema.index({ productId: 1 });
reviewSchema.index({ productId: 1, createdAt: -1 }); // 复合索引用于排序查询

const reviewModel = mongoose.models.review || mongoose.model('review', reviewSchema);

export default reviewModel;
export { reviewSchema };