import pkg from 'nodemailer';
const { createTransport } = pkg;

// 创建邮件发送器
const createTransporter = () => {
  // QQ 邮箱配置
  const { EMAIL_USER, EMAIL_PASSWORD } = process.env;

  if (!EMAIL_USER || !EMAIL_PASSWORD) {
    throw new Error('Email credentials are not configured. Please set EMAIL_USER and EMAIL_PASSWORD in your environment.');
  }

  return createTransport({
    host: 'smtp.qq.com',
    port: 465,
    secure: true,
    auth: {
      user: EMAIL_USER,
      pass: EMAIL_PASSWORD
    },
    logger: process.env.NODE_ENV !== 'production',
    debug: process.env.NODE_ENV !== 'production'
  });
};

// 发送验证邮件
export const sendVerificationEmail = async (email, name, verificationToken) => {
  try {
    const transporter = createTransporter();
    await transporter.verify();
    
    const verificationUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/verify-email/${verificationToken}`;
    
    const mailOptions = {
      from: `"Apple Bear Baby" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: '🍎 Verify Your Email - Apple Bear Baby',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body { font-family: 'Arial', sans-serif; background-color: #f5f5f5; margin: 0; padding: 0; }
            .container { max-width: 600px; margin: 40px auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
            .header { background: linear-gradient(135deg, #2196F3 0%, #00BCD4 100%); padding: 40px; text-align: center; }
            .header h1 { color: white; margin: 0; font-size: 28px; }
            .content { padding: 40px; }
            .content h2 { color: #333; margin-bottom: 20px; }
            .content p { color: #666; line-height: 1.6; margin-bottom: 20px; }
            .button { display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #2196F3, #00BCD4); color: white; text-decoration: none; border-radius: 25px; font-weight: bold; margin: 20px 0; }
            .button:hover { opacity: 0.9; }
            .footer { background: #f9f9f9; padding: 20px; text-align: center; color: #999; font-size: 12px; }
            .icon { font-size: 48px; margin-bottom: 20px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="icon">🍎⭐</div>
              <h1>Welcome to Apple Bear Baby!</h1>
            </div>
            <div class="content">
              <h2>Hi ${name}! 👋</h2>
              <p>Thank you for registering with Apple Bear Baby - your trusted wholesale supplier of premium baby care products!</p>
              <p>To complete your registration and start exploring our wholesale catalog, please verify your email address by clicking the button below:</p>
              <div style="text-align: center;">
                <a href="${verificationUrl}" class="button">✅ Verify My Email</a>
              </div>
              <p style="color: #999; font-size: 14px; margin-top: 30px;">
                If the button doesn't work, copy and paste this link into your browser:<br>
                <a href="${verificationUrl}" style="color: #2196F3; word-break: break-all;">${verificationUrl}</a>
              </p>
              <p style="color: #ff9800; font-size: 14px; margin-top: 20px;">
                ⚠️ This link will expire in 24 hours.
              </p>
            </div>
            <div class="footer">
              <p>© 2025 Apple Bear Baby | Premium Baby Care Products</p>
              <p>If you didn't create this account, please ignore this email.</p>
            </div>
          </div>
        </body>
        </html>
      `
    };
    
    const info = await transporter.sendMail(mailOptions);
    console.log('Verification email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending verification email:', error);
    return { success: false, error: error.message };
  }
};

// 发送验证成功邮件
export const sendWelcomeEmail = async (email, name) => {
  try {
    const transporter = createTransporter();
    await transporter.verify();
    
    const mailOptions = {
      from: `"Apple Bear Baby" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: '🎉 Welcome to Apple Bear Baby!',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <style>
            body { font-family: Arial, sans-serif; background-color: #f5f5f5; margin: 0; padding: 0; }
            .container { max-width: 600px; margin: 40px auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
            .header { background: linear-gradient(135deg, #2196F3 0%, #00BCD4 100%); padding: 40px; text-align: center; color: white; }
            .content { padding: 40px; }
            .footer { background: #f9f9f9; padding: 20px; text-align: center; color: #999; font-size: 12px; }
            .button { display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #2196F3, #00BCD4); color: white; text-decoration: none; border-radius: 25px; font-weight: bold; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎉 Email Verified Successfully!</h1>
            </div>
            <div class="content">
              <h2>Welcome, ${name}! 🎊</h2>
              <p>Your email has been verified successfully. You can now enjoy all the features of Apple Bear Baby!</p>
              <h3>What's Next? 🚀</h3>
              <ul>
                <li>Browse our premium baby care products</li>
                <li>Request wholesale quotes</li>
                <li>Access exclusive deals for bulk orders</li>
                <li>Get dedicated support for your business</li>
              </ul>
              <div style="text-align: center;">
                <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}" class="button">🛍️ Start Shopping</a>
              </div>
            </div>
            <div class="footer">
              <p>© 2025 Apple Bear Baby | Premium Baby Care Products</p>
            </div>
          </div>
        </body>
        </html>
      `
    };
    
    await transporter.sendMail(mailOptions);
    console.log('Welcome email sent to:', email);
    return { success: true };
  } catch (error) {
    console.error('Error sending welcome email:', error);
    return { success: false, error: error.message };
  }
};

// 发送密码重置邮件
export const sendPasswordResetEmail = async (email, name, resetToken) => {
  try {
    const transporter = createTransporter();
    await transporter.verify();
    
    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password/${resetToken}`;
    
    const mailOptions = {
      from: `"Apple Bear Baby" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: '🔐 Reset Your Password - Apple Bear Baby',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <style>
            body { font-family: Arial, sans-serif; background-color: #f5f5f5; margin: 0; padding: 0; }
            .container { max-width: 600px; margin: 40px auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
            .header { background: linear-gradient(135deg, #f44336 0%, #ff9800 100%); padding: 40px; text-align: center; color: white; }
            .content { padding: 40px; }
            .footer { background: #f9f9f9; padding: 20px; text-align: center; color: #999; font-size: 12px; }
            .button { display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #f44336, #ff9800); color: white; text-decoration: none; border-radius: 25px; font-weight: bold; margin: 20px 0; }
            .warning { background: #fff3cd; border-left: 4px solid #ff9800; padding: 12px; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div style="font-size: 48px; margin-bottom: 20px;">🔐</div>
              <h1>Password Reset Request</h1>
            </div>
            <div class="content">
              <h2>Hi ${name}! 👋</h2>
              <p>We received a request to reset your password for your Apple Bear Baby account.</p>
              <p>Click the button below to create a new password:</p>
              <div style="text-align: center;">
                <a href="${resetUrl}" class="button">🔑 Reset My Password</a>
              </div>
              <div class="warning">
                <strong>⚠️ Security Notice:</strong><br>
                • This link will expire in <strong>1 hour</strong><br>
                • If you didn't request this, please ignore this email<br>
                • Your password will remain unchanged
              </div>
              <p style="color: #999; font-size: 14px; margin-top: 30px;">
                If the button doesn't work, copy and paste this link into your browser:<br>
                <a href="${resetUrl}" style="color: #f44336; word-break: break-all;">${resetUrl}</a>
              </p>
            </div>
            <div class="footer">
              <p>© 2025 Apple Bear Baby | Premium Baby Care Products</p>
              <p>This is an automated email. Please do not reply.</p>
            </div>
          </div>
        </body>
        </html>
      `
    };
    
    const info = await transporter.sendMail(mailOptions);
    console.log('Password reset email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending password reset email:', error);
    return { success: false, error: error.message };
  }
};

export default { sendVerificationEmail, sendWelcomeEmail, sendPasswordResetEmail };

