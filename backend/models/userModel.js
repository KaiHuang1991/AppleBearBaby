import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    cartData: { type: Object, default: {} },
    reviews: [{ type: mongoose.Schema.Types.ObjectId, ref: 'review' }],
    isVerified: { type: Boolean, default: false },
    verificationToken: { type: String },
    verificationTokenExpiry: { type: Date },
    resetPasswordToken: { type: String },
    resetPasswordExpiry: { type: Date },
    avatar: { type: String, default: '' }
  },
  { minimize: false, timestamps: true }
);


userSchema.index({ email: 1 });//1：表示索引的排序方向，1 表示升序（ascending order）。如果使用 -1，则表示降序（descending order）。

const userModel = mongoose.models.user || mongoose.model('user', userSchema);

export default userModel;