import mongoose from 'mongoose';
import reviewModel from '../models/reviewModel.js';
import { v2 as cloudinary } from 'cloudinary';

// Get reviews for a product
export const getProductReviews = async (req, res) => {
  try {
    const { productId } = req.params;
    
    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid product ID format'
      });
    }
    
    const reviews = await reviewModel
      .find({ productId, isApproved: true })
      .sort({ createdAt: -1 })
      .populate('userId', 'name');
    
    res.status(200).json({
      success: true,
      reviews
    });
  } catch (error) {
    console.error('Error fetching reviews:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching reviews',
      error: error.message
    });
  }
};

// Add a review
export const addReview = async (req, res) => {
  try {
    const { productId, rating, comment } = req.body;
    const userId = req.user.id; // Get userId from authenticated token
    
    console.log('Adding review with data:', { productId, rating, comment, userId });
    
    // Validate required fields
    if (!productId || !rating || !comment) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: productId, rating, or comment'
      });
    }
    
    // Validate ObjectId formats
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid product ID format'
      });
    }
    
    // Validate rating range
    const ratingNum = Number(rating);
    if (isNaN(ratingNum) || ratingNum < 1 || ratingNum > 5) {
      return res.status(400).json({
        success: false,
        message: 'Rating must be between 1 and 5'
      });
    }
    
    // 已移除防重复检查 - 允许用户多次评论同一产品
    
    // Handle media uploads
    const mediaUrls = [];
    if (req.files && req.files.media) {
      for (const file of req.files.media) {
        try {
          const result = await cloudinary.uploader.upload(file.path, {
            resource_type: 'auto',
            folder: 'reviews'
          });
          mediaUrls.push(result.secure_url);
        } catch (uploadError) {
          console.error('Error uploading media:', uploadError);
        }
      }
    }
    
    const newReview = new reviewModel({
      userId,
      productId,
      rating: ratingNum,
      comment,
      media: mediaUrls,
      isApproved: true // Auto-approve reviews (change to false if you want manual approval)
    });
    
    const savedReview = await newReview.save();
    
    // Populate user info
    await savedReview.populate('userId', 'name');
    
    res.status(201).json({
      success: true,
      message: 'Review added successfully',
      review: savedReview
    });
  } catch (error) {
    console.error('Error adding review:', error);
    res.status(500).json({
      success: false,
      message: 'Error adding review',
      error: error.message
    });
  }
};

// Update a review
export const updateReview = async (req, res) => {
  try {
    const { id } = req.params;
    const { rating, comment } = req.body;
    const userId = req.user.id;
    
    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid review ID format'
      });
    }
    
    const review = await reviewModel.findById(id);
    
    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }
    
    // Check if user owns the review
    if (review.userId.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'You can only edit your own reviews'
      });
    }
    
    // Update fields if provided
    if (rating !== undefined) {
      const ratingNum = Number(rating);
      if (isNaN(ratingNum) || ratingNum < 1 || ratingNum > 5) {
        return res.status(400).json({
          success: false,
          message: 'Rating must be between 1 and 5'
        });
      }
      review.rating = ratingNum;
    }
    
    if (comment !== undefined) {
      review.comment = comment;
    }
    
    const updatedReview = await review.save();
    
    await updatedReview.populate('userId', 'name');
    
    res.status(200).json({
      success: true,
      message: 'Review updated successfully',
      review: updatedReview
    });
  } catch (error) {
    console.error('Error updating review:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating review',
      error: error.message
    });
  }
};

// Delete a review
export const deleteReview = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    
    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid review ID format'
      });
    }
    
    const review = await reviewModel.findById(id);
    
    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }
    
    // Check if user owns the review
    if (review.userId.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'You can only delete your own reviews'
      });
    }
    
    // Delete media from cloudinary if exists
    if (review.media && review.media.length > 0) {
      for (const mediaUrl of review.media) {
        try {
          // Extract public_id from cloudinary URL
          const publicId = mediaUrl.split('/').slice(-2).join('/').split('.')[0];
          await cloudinary.uploader.destroy(publicId);
        } catch (deleteError) {
          console.error('Error deleting media from cloudinary:', deleteError);
        }
      }
    }
    
    await reviewModel.findByIdAndDelete(id);
    
    res.status(200).json({
      success: true,
      message: 'Review deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting review:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting review',
      error: error.message
    });
  }
};













