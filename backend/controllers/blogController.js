import mongoose from 'mongoose';
import { BLOG_CATEGORY_VALUES } from '../constants/blogCategories.js';
import blogModel from '../models/blogModel.js';
import { ensureUniqueBlogSlug, findBlogBySlugOrId } from '../utils/blogSlug.js';
import { normalizeObjectIds } from '../utils/objectIds.js';
import { invalidateSitemapCache } from '../utils/sitemapService.js';
import { parseTranslations } from '../utils/locales.js';
import {
  BLOG_LIST_SELECT,
  blogListCacheKey,
  getBlogListCache,
  invalidateBlogListCache,
  setBlogListCache,
} from '../utils/blogListQuery.js';

const PRODUCT_LINK_FIELDS = 'name slug modelNumber image';
const PUBLIC_BLOG_QUERY = { isPublished: true, indexable: { $ne: false } };

function bumpBlogCaches() {
  invalidateSitemapCache();
  invalidateBlogListCache();
}

function parsePageLimit(query) {
  const page = Math.max(1, parseInt(query.page, 10) || 1);
  const limit = Math.min(50, Math.max(1, parseInt(query.limit, 10) || 12));
  return { page, limit, skip: (page - 1) * limit };
}

function listSearchQuery(search) {
  const term = String(search || '').trim();
  if (!term) return null;
  const rx = new RegExp(term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
  return {
    $or: [
      { title: rx },
      { excerpt: rx },
      { tags: rx },
      { slug: rx },
      { 'translations.zh.title': rx },
      { 'translations.es.title': rx },
      { 'translations.ar.title': rx },
      { 'translations.fr.title': rx },
    ],
  };
}

async function findBlogList(query, { page, limit, skip, category = '', search = '' }) {
  const cacheKey = blogListCacheKey({ category, search, page, limit });
  const cached = getBlogListCache(cacheKey);
  if (cached) return cached;

  const [blogs, total] = await Promise.all([
    blogModel
      .find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .select(BLOG_LIST_SELECT)
      .lean(),
    blogModel.countDocuments(query),
  ]);

  const payload = {
    success: true,
    blogs,
    total,
    currentPage: page,
    totalPages: Math.ceil(total / limit) || 1,
  };
  setBlogListCache(cacheKey, payload);
  return payload;
}

// Get all blogs with optional filtering
export const getAllBlogs = async (req, res) => {
  try {
    const { category, search } = req.query;
    const { page, limit, skip } = parsePageLimit(req.query);

    const query = { ...PUBLIC_BLOG_QUERY };
    if (category) query.category = category;
    const searchClause = listSearchQuery(search);
    if (searchClause) Object.assign(query, searchClause);

    res.status(200).json(await findBlogList(query, { page, limit, skip, category: category || '', search: search || '' }));
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching blogs',
      error: error.message
    });
  }
};

// Get single blog by slug or ID
export const getBlogById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const blog = await findBlogBySlugOrId(id);
    
    if (!blog || blog.isPublished === false) {
      return res.status(404).json({
        success: false,
        message: 'Blog not found'
      });
    }

    await Promise.all([
      blog.populate('productIds', PRODUCT_LINK_FIELDS),
      blogModel.updateOne({ _id: blog._id }, { $inc: { views: 1 } }),
    ]);
    blog.views = (blog.views || 0) + 1;

    res.status(200).json({
      success: true,
      blog
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching blog',
      error: error.message
    });
  }
};

// Create new blog (Admin only)
export const createBlog = async (req, res) => {
  try {
    const { title, content, category, author, image, excerpt, tags, readTime, isPublished, productIds } = req.body;
    const slug = await ensureUniqueBlogSlug(title);
    
    const newBlog = new blogModel({
      title,
      slug,
      content,
      category,
      author: (author && String(author).trim()) || 'AppleBear Baby',
      image,
      excerpt,
      tags: tags || [],
      readTime: readTime || 5,
      isPublished: isPublished === undefined ? true : Boolean(isPublished),
      indexable: req.body.indexable === undefined ? true : Boolean(req.body.indexable),
      productIds: normalizeObjectIds(productIds),
      translations: parseTranslations(req.body.translations, ['title', 'excerpt', 'content']) || undefined,
    });
    
    const savedBlog = await newBlog.save();
    bumpBlogCaches();
    
    res.status(201).json({
      success: true,
      message: 'Blog created successfully',
      blog: savedBlog
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating blog',
      error: error.message
    });
  }
};

// Update blog (Admin only)
export const updateBlog = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body };
    delete updateData.slug;

    const existing = await findBlogBySlugOrId(id);
    if (!existing) {
      return res.status(404).json({
        success: false,
        message: 'Blog not found'
      });
    }

    const nextTitle = updateData.title !== undefined ? updateData.title : existing.title;
    if (!existing.slug || (updateData.title && updateData.title !== existing.title)) {
      updateData.slug = await ensureUniqueBlogSlug(nextTitle, { excludeId: existing._id });
    }
    if (updateData.productIds !== undefined) {
      updateData.productIds = normalizeObjectIds(updateData.productIds);
    }
    if (updateData.translations !== undefined) {
      updateData.translations = parseTranslations(updateData.translations, ['title', 'excerpt', 'content']) || {};
    }
    
    const blog = await blogModel.findByIdAndUpdate(
      existing._id,
      updateData,
      { new: true, runValidators: true }
    );
    
    bumpBlogCaches();
    
    res.status(200).json({
      success: true,
      message: 'Blog updated successfully',
      blog
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating blog',
      error: error.message
    });
  }
};

// Delete blog (Admin only)
export const deleteBlog = async (req, res) => {
  try {
    const { id } = req.params;
    const existing = await findBlogBySlugOrId(id);
    
    if (!existing) {
      return res.status(404).json({
        success: false,
        message: 'Blog not found'
      });
    }

    await blogModel.findByIdAndDelete(existing._id);
    bumpBlogCaches();
    
    res.status(200).json({
      success: true,
      message: 'Blog deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting blog',
      error: error.message
    });
  }
};

// Get blog categories
export const getBlogCategories = async (req, res) => {
  try {
    res.status(200).json({
      success: true,
      categories: BLOG_CATEGORY_VALUES
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching categories',
      error: error.message
    });
  }
};

export const getAdminBlogs = async (req, res) => {
  try {
    const { category, search } = req.query;
    const { page, limit, skip } = parsePageLimit(req.query);
    const query = {};

    if (category) query.category = category;
    const searchClause = listSearchQuery(search);
    if (searchClause) Object.assign(query, searchClause);

    const [blogs, total] = await Promise.all([
      blogModel
        .find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .select(BLOG_LIST_SELECT)
        .lean(),
      blogModel.countDocuments(query),
    ]);

    res.status(200).json({
      success: true,
      blogs,
      total,
      currentPage: page,
      totalPages: Math.ceil(total / limit) || 1
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching blogs',
      error: error.message
    });
  }
};

export const getBlogsByProduct = async (req, res) => {
  try {
    const { productId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ success: false, message: 'Invalid product id' });
    }

    const blogs = await blogModel
      .find({ productIds: productId, ...PUBLIC_BLOG_QUERY })
      .sort({ createdAt: -1 })
      .select(BLOG_LIST_SELECT)
      .lean();

    res.json({ success: true, blogs });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching product blogs',
      error: error.message
    });
  }
};

export const syncProductBlogs = async (req, res) => {
  try {
    const { productId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ success: false, message: 'Invalid product id' });
    }

    const nextIds = normalizeObjectIds(req.body.blogIds);
    const currentlyLinked = await blogModel.find({ productIds: productId }).select('_id');
    const currentIds = currentlyLinked.map((blog) => String(blog._id));
    const toAdd = nextIds.filter((id) => !currentIds.includes(id));
    const toRemove = currentIds.filter((id) => !nextIds.includes(id));

    if (toAdd.length) {
      await blogModel.updateMany(
        { _id: { $in: toAdd } },
        { $addToSet: { productIds: productId } }
      );
    }
    if (toRemove.length) {
      await blogModel.updateMany(
        { _id: { $in: toRemove } },
        { $pull: { productIds: productId } }
      );
    }

    bumpBlogCaches();

    const blogs = await blogModel
      .find({ productIds: productId })
      .sort({ createdAt: -1 })
      .select(BLOG_LIST_SELECT)
      .lean();

    res.json({ success: true, blogs });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error syncing product blogs',
      error: error.message
    });
  }
};

// Get popular blogs
export const getPopularBlogs = async (req, res) => {
  try {
    const blogs = await blogModel
      .find(PUBLIC_BLOG_QUERY)
      .sort({ views: -1 })
      .limit(5)
      .select(BLOG_LIST_SELECT)
      .lean();
    
    res.status(200).json({
      success: true,
      blogs
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching popular blogs',
      error: error.message
    });
  }
};
