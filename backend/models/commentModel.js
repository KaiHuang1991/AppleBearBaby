import mongoose from 'mongoose';

const commentSchema = new mongoose.Schema(
  {
    blogId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'blog', 
      required: true 
    },
    userId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'user', 
      required: true 
    },
    userName: { type: String, required: true },
    content: { type: String, required: true },
    isEdited: { type: Boolean, default: false }
  },
  { timestamps: true }
);

const commentModel = mongoose.models.comment || mongoose.model('comment', commentSchema);

export default commentModel; 