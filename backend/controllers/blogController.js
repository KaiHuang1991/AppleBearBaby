import mongoose from 'mongoose';
import { BLOG_CATEGORY_VALUES } from '../constants/blogCategories.js';
import blogModel from '../models/blogModel.js';
import { ensureUniqueBlogSlug, findBlogBySlugOrId } from '../utils/blogSlug.js';
import { normalizeObjectIds } from '../utils/objectIds.js';
import { invalidateSitemapCache } from '../utils/sitemapService.js';

const PRODUCT_LINK_FIELDS = 'name slug modelNumber image';

// Get all blogs with optional filtering
export const getAllBlogs = async (req, res) => {
  try {
    const { category, search, page = 1, limit = 10 } = req.query;
    
    let query = { isPublished: true };
    
    // Filter by category
    if (category) {
      query.category = category;
    }
    
    // Search functionality
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } },
        { excerpt: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }
    
    const skip = (page - 1) * limit;
    
    const blogs = await blogModel
      .find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .select('-content'); // Don't send full content in list
    
    const total = await blogModel.countDocuments(query);
    
    res.status(200).json({
      success: true,
      blogs,
      total,
      currentPage: parseInt(page),
      totalPages: Math.ceil(total / limit)
    });
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
    
    if (!blog) {
      return res.status(404).json({
        success: false,
        message: 'Blog not found'
      });
    }
    
    // Increment view count
    blog.views += 1;
    await blog.save();
    await blog.populate('productIds', PRODUCT_LINK_FIELDS);
    
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
      productIds: normalizeObjectIds(productIds),
    });
    
    const savedBlog = await newBlog.save();
    invalidateSitemapCache();
    
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
    
    const blog = await blogModel.findByIdAndUpdate(
      existing._id,
      updateData,
      { new: true, runValidators: true }
    );
    
    invalidateSitemapCache();
    
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
    invalidateSitemapCache();
    
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
    const { category, search, page = 1, limit = 10 } = req.query;
    const query = {};

    if (category) query.category = category;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } },
        { excerpt: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    const skip = (page - 1) * limit;
    const blogs = await blogModel
      .find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .select('-content');

    const total = await blogModel.countDocuments(query);

    res.status(200).json({
      success: true,
      blogs,
      total,
      currentPage: parseInt(page),
      totalPages: Math.ceil(total / limit)
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
      .find({ productIds: productId, isPublished: true })
      .sort({ createdAt: -1 })
      .select('-content')
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

    const blogs = await blogModel
      .find({ productIds: productId })
      .sort({ createdAt: -1 })
      .select('-content');

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
      .find({ isPublished: true })
      .sort({ views: -1 })
      .limit(5)
      .select('-content');
    
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
