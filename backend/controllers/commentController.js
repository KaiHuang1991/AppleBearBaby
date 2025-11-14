import mongoose from 'mongoose';
import commentModel from '../models/commentModel.js';

// Get comments for a blog
export const getComments = async (req, res) => {
  try {
    const { blogId } = req.params;
    
    const comments = await commentModel
      .find({ blogId })
      .sort({ createdAt: -1 })
      .populate('userId', 'name');
    
    res.status(200).json({
      success: true,
      comments
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching comments',
      error: error.message
    });
  }
};

// Add a comment
export const addComment = async (req, res) => {
  try {
    const { blogId, content, userName } = req.body;
    const userId = req.user.id; // From auth middleware
    
    console.log('Adding comment with data:', { blogId, content, userName, userId });
    
    // Validate required fields
    if (!blogId || !content || !userName) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: blogId, content, or userName'
      });
    }
    
    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(blogId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid blog ID format'
      });
    }
    
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid user ID format'
      });
    }
    
    const newComment = new commentModel({
      blogId,
      userId,
      userName,
      content
    });
    
    const savedComment = await newComment.save();
    
    // Populate user info
    await savedComment.populate('userId', 'name');
    
    res.status(201).json({
      success: true,
      message: 'Comment added successfully',
      comment: savedComment
    });
  } catch (error) {
    console.error('Error adding comment:', error);
    res.status(500).json({
      success: false,
      message: 'Error adding comment',
      error: error.message
    });
  }
};

// Update a comment
export const updateComment = async (req, res) => {
  try {
    const { id } = req.params;
    const { content } = req.body;
    const userId = req.user.id;
    
    const comment = await commentModel.findById(id);
    
    if (!comment) {
      return res.status(404).json({
        success: false,
        message: 'Comment not found'
      });
    }
    
    // Check if user owns the comment
    if (comment.userId.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'You can only edit your own comments'
      });
    }
    
    comment.content = content;
    comment.isEdited = true;
    const updatedComment = await comment.save();
    
    await updatedComment.populate('userId', 'name');
    
    res.status(200).json({
      success: true,
      message: 'Comment updated successfully',
      comment: updatedComment
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating comment',
      error: error.message
    });
  }
};

// Delete a comment
export const deleteComment = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    
    const comment = await commentModel.findById(id);
    
    if (!comment) {
      return res.status(404).json({
        success: false,
        message: 'Comment not found'
      });
    }
    
    // Check if user owns the comment
    if (comment.userId.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'You can only delete your own comments'
      });
    }
    
    await commentModel.findByIdAndDelete(id);
    
    res.status(200).json({
      success: true,
      message: 'Comment deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting comment',
      error: error.message
    });
  }
};