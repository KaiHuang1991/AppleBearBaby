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
    readTime: { type: Number, default: 5 }, // in minutes
    views: { type: Number, default: 0 },
    isPublished: { type: Boolean, default: true }
  },
  { timestamps: true }
);

// Create text index for search functionality
blogSchema.index({ title: 'text', content: 'text', excerpt: 'text', tags: 'text' });

const blogModel = mongoose.models.blog || mongoose.model('blog', blogSchema);

export default blogModel; 