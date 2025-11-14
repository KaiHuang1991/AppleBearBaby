import express from 'express';
import {
  getAllBlogs,
  getBlogById,
  createBlog,
  updateBlog,
  deleteBlog,
  getBlogCategories,
  getPopularBlogs
} from '../controllers/blogController.js';
import adminAuth  from '../middleware/adminAuth.js';

const router = express.Router();

// Public routes
router.get('/all', getAllBlogs);
router.get('/categories', getBlogCategories);
router.get('/popular', getPopularBlogs);
router.get('/:id', getBlogById);

// Admin routes (protected)
router.post('/', adminAuth, createBlog);
router.put('/:id', adminAuth, updateBlog);
router.delete('/:id', adminAuth, deleteBlog);

export default router; 