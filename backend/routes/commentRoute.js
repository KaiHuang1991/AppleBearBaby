import express from 'express';
import {
  getComments,
  addComment,
  updateComment,
  deleteComment
} from '../controllers/commentController.js';
import authUser  from '../middleware/auth.js';

const router = express.Router();

// Get comments for a blog (public)
router.get('/blog/:blogId', getComments);

// Comment operations (authenticated users)
router.post('/add', authUser, addComment);
router.put('/update/:id', authUser, updateComment);
router.delete('/delete/:id', authUser, deleteComment);

export default router; 