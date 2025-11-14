import userModel from '../models/userModel.js'
import validator from 'validator'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import crypto from 'crypto'
import { sendVerificationEmail, sendWelcomeEmail, sendPasswordResetEmail } from '../config/emailConfig.js'
import { v2 as cloudinary } from 'cloudinary'
import fs from 'fs/promises'

const createToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET)
}
// route for user login
const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body
        const user = await userModel.findOne({ email })
        if (!user) {
            return res.json({ success: false, message: "User doesn't exist" })
        }
        const isMatch = await bcrypt.compare(password, user.password)
        if (isMatch) {
            // Check if email is verified
            if (!user.isVerified) {
                return res.json({ 
                    success: false, 
                    message: "Please verify your email before logging in",
                    isVerified: false,
                    email: user.email
                })
            }
            
            const token = createToken(user._id)
            const userId = user._id
            
            // Set HttpOnly cookie for token (7 days expiry)
            res.cookie('token', token, {
                httpOnly: true, // Prevents JavaScript access (XSS protection)
                secure: process.env.NODE_ENV === 'production', // HTTPS only in production
                sameSite: 'lax', // CSRF protection
                maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
                path: '/'
            })
            
            res.json({ success: true, token, userId, userName: user.name, userEmail: user.email, avatar: user.avatar || '', joinDate: user.createdAt, isVerified: true })
        }
        else {
            res.json({ success: false, message: "Invalid Credentials" })
        }
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message })
    }
}

// route for user register
const registerUser = async (req, res) => {
    try {
        const { name, email, password } = req.body
        // checking user is already registerd or not
        const exists = await userModel.findOne({ email })
        if (exists) {
            return res.json({ success: false, message: "User already exists" })
        }
        //validating email format and strong password
        if (!validator.isEmail(email)) {
            return res.json({ success: false, message: "Please enter a valid email" })
        }
        if (password.length < 8) {
            return res.json({ success: false, message: "Password must be at least 8 characters" })
        }
        // hashing user password
        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(password, salt)

        // Generate verification token
        const verificationToken = crypto.randomBytes(32).toString('hex')
        const verificationTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours

        const newUser = new userModel({
            name,
            email,
            password: hashedPassword,
            isVerified: false,
            verificationToken,
            verificationTokenExpiry
        })
        const user = await newUser.save()

        // Send verification email
        const emailResult = await sendVerificationEmail(email, name, verificationToken)
        
        if (!emailResult.success) {
            console.error('Failed to send verification email:', emailResult.error)
        }

        // Create token but user needs to verify email
        const token = createToken(user.id)

        // Set HttpOnly cookie for token (7 days expiry)
        res.cookie('token', token, {
            httpOnly: true, // Prevents JavaScript access (XSS protection)
            secure: process.env.NODE_ENV === 'production', // HTTPS only in production
            sameSite: 'lax', // CSRF protection
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
            path: '/'
        })

        res.json({ 
            success: true, 
            token, 
            userId: user.id, 
            userName: user.name,
            isVerified: false,
            avatar: user.avatar || '',
            joinDate: user.createdAt,
            message: "Registration successful! Please check your email to verify your account."
        })
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message })
    }
}


//route for admin login

const adminLogin = async (req, res) => {
    try {
        const {email,password} =req.body
        if(email === process.env.ADMIN_EMAIL && password === process.env.ADMIN_PASSWORD)
        {
            const token = jwt.sign(email+password,process.env.JWT_SECRET)
            res.json({success:true,token})
        }
        else
        {
            res.json({success:false,message:"Invalid Credentials"})
        }

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message })
    }
}

// Get user profile
const getUserProfile = async (req, res) => {
    try {
        const userId = req.user.id; // From auth middleware
        const user = await userModel.findById(userId).select('-password');
        
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }
        
        res.json({
            success: true,
            user
        });
    } catch (error) {
        console.error('Error fetching user profile:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching user profile',
            error: error.message
        });
    }
};

// Verify email
const verifyEmail = async (req, res) => {
    try {
        const { token } = req.params;
        
        // Find user with this verification token
        const user = await userModel.findOne({
            verificationToken: token,
            verificationTokenExpiry: { $gt: Date.now() }
        });
        
        if (!user) {
            return res.json({
                success: false,
                message: 'Invalid or expired verification link'
            });
        }
        
        // Update user as verified
        user.isVerified = true;
        user.verificationToken = undefined;
        user.verificationTokenExpiry = undefined;
        await user.save();
        
        // Send welcome email
        await sendWelcomeEmail(user.email, user.name);
        
        res.json({
            success: true,
            message: 'Email verified successfully! You can now login.'
        });
    } catch (error) {
        console.error('Error verifying email:', error);
        res.json({
            success: false,
            message: 'Error verifying email',
            error: error.message
        });
    }
};

// Resend verification email
const resendVerificationEmail = async (req, res) => {
    try {
        const { email } = req.body;
        
        const user = await userModel.findOne({ email });
        
        if (!user) {
            return res.json({
                success: false,
                message: 'User not found'
            });
        }
        
        if (user.isVerified) {
            return res.json({
                success: false,
                message: 'Email is already verified'
            });
        }
        
        // Generate new verification token
        const verificationToken = crypto.randomBytes(32).toString('hex');
        const verificationTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000);
        
        user.verificationToken = verificationToken;
        user.verificationTokenExpiry = verificationTokenExpiry;
        await user.save();
        
        // Send verification email
        const emailResult = await sendVerificationEmail(email, user.name, verificationToken);
        
        if (emailResult.success) {
            res.json({
                success: true,
                message: 'Verification email sent! Please check your inbox.'
            });
        } else {
            res.json({
                success: false,
                message: 'Failed to send verification email'
            });
        }
    } catch (error) {
        console.error('Error resending verification email:', error);
        res.json({
            success: false,
            message: 'Error resending verification email',
            error: error.message
        });
    }
};

// Forgot password - send reset email
const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        
        const user = await userModel.findOne({ email });
        
        if (!user) {
            return res.json({
                success: false,
                message: 'No account found with this email'
            });
        }
        
        // Generate reset token
        const resetToken = crypto.randomBytes(32).toString('hex');
        const resetPasswordExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
        
        user.resetPasswordToken = resetToken;
        user.resetPasswordExpiry = resetPasswordExpiry;
        await user.save();
        
        // Send reset email
        const emailResult = await sendPasswordResetEmail(email, user.name, resetToken);
        
        if (emailResult.success) {
            res.json({
                success: true,
                message: 'Password reset email sent! Please check your inbox.'
            });
        } else {
            res.json({
                success: false,
                message: 'Failed to send reset email. Please try again.'
            });
        }
    } catch (error) {
        console.error('Error in forgot password:', error);
        res.json({
            success: false,
            message: 'Error processing request',
            error: error.message
        });
    }
};

// Reset password with token
const resetPassword = async (req, res) => {
    try {
        const { token } = req.params;
        const { password } = req.body;
        
        // Validate password
        if (password.length < 8) {
            return res.json({
                success: false,
                message: 'Password must be at least 8 characters'
            });
        }
        
        // Find user with valid reset token
        const user = await userModel.findOne({
            resetPasswordToken: token,
            resetPasswordExpiry: { $gt: Date.now() }
        });
        
        if (!user) {
            return res.json({
                success: false,
                message: 'Invalid or expired reset link'
            });
        }
        
        // Hash new password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        
        // Update password and clear reset token
        user.password = hashedPassword;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpiry = undefined;
        await user.save();
        
        res.json({
            success: true,
            message: 'Password reset successfully! You can now login with your new password.'
        });
    } catch (error) {
        console.error('Error resetting password:', error);
        res.json({
            success: false,
            message: 'Error resetting password',
            error: error.message
        });
    }
};

const extractCloudinaryPublicId = (url) => {
    if (!url) return null;
    try {
        const parts = url.split('/');
        const uploadIndex = parts.findIndex(part => part === 'upload');
        if (uploadIndex === -1) return null;
        const publicIdWithExtension = parts.slice(uploadIndex + 1).join('/');
        const [publicId] = publicIdWithExtension.split('.');
        return publicId;
    } catch (error) {
        return null;
    }
};

// Logout user - clear cookie
const logoutUser = async (req, res) => {
    try {
        // Clear the token cookie
        res.clearCookie('token', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            path: '/'
        })
        
        res.json({
            success: true,
            message: 'Logged out successfully'
        })
    } catch (error) {
        console.error('Error logging out:', error)
        res.json({
            success: false,
            message: 'Error logging out',
            error: error.message
        })
    }
}

const updateUserAvatar = async (req, res) => {
    try {
        const userId = req.user.id;
        const user = await userModel.findById(userId);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        if (!req.file) {
            return res.status(400).json({ success: false, message: 'Please upload an image file' });
        }

        const uploadResult = await cloudinary.uploader.upload(req.file.path, {
            folder: 'avatars',
            resource_type: 'image',
            transformation: [{ width: 400, height: 400, crop: 'fill', gravity: 'auto' }]
        });

        if (user.avatar) {
            const publicId = extractCloudinaryPublicId(user.avatar);
            if (publicId) {
                try {
                    await cloudinary.uploader.destroy(publicId);
                } catch (destroyError) {
                    console.error('Failed to delete previous avatar from Cloudinary:', destroyError.message);
                }
            }
        }

        user.avatar = uploadResult.secure_url;
        await user.save();

        res.json({ success: true, message: 'Avatar updated successfully', avatar: user.avatar });
    } catch (error) {
        console.error('Error updating avatar:', error);
        res.status(500).json({ success: false, message: error.message });
    } finally {
        if (req.file?.path) {
            try {
                await fs.unlink(req.file.path);
            } catch (cleanupError) {
                console.error('Failed to remove temp file:', cleanupError.message);
            }
        }
    }
};

export { loginUser, registerUser, adminLogin, getUserProfile, verifyEmail, resendVerificationEmail, forgotPassword, resetPassword, updateUserAvatar, logoutUser }