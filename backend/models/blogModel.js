import mongoose from 'mongoose';

const blogSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    content: { type: String, required: true },
    category: {
      type: String,
      required: true,
      enum: ['baby-nursing', 'baby-feeding', 'baby-products', 'baby-care', 'product-guide', 'wholesale', 'safety', 'sustainability', 'feeding']
    },
    author: { type: String, required: true },
    image: { type: String, default: '' },
    excerpt: { type: String, required: true },
    tags: [{ type: String }],
    /** SEO-friendly URL segment, e.g. oem-baby-bottle-buying-guide */
    slug: { type: String, trim: true, lowercase: true, sparse: true, unique: true },
    readTime: { type: Number, default: 5 }, // in minutes
    views: { type: Number, default: 0 },
    isPublished: { type: Boolean, default: true },
    /** Products this guide belongs to — same idea as video.productId, but a guide can cover a family */
    productIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'product' }]
  },
  { timestamps: true }
);

// Create text index for search functionality
blogSchema.index({ title: 'text', content: 'text', excerpt: 'text', tags: 'text' });
blogSchema.index({ productIds: 1, isPublished: 1 });

const blogModel = mongoose.models.blog || mongoose.model('blog', blogSchema);

export default blogModel; 