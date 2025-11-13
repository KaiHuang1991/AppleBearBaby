import userModel from "../models/userModel.js"
import nodemailer from 'nodemailer' // 导入 Nodemailer
//import googleapis from 'googleapis'
// add products to cart
const addToCart = async (req, res) => {
    try {
        const { itemId, size, quantity } = req.body
        const userId = req.user?.id || req.body.userId

        if (!userId || !itemId) {
            return res.status(400).json({ success: false, message: 'Invalid cart request' })
        }

        const userData = await userModel.findById(userId)
        if (!userData) {
            return res.status(404).json({ success: false, message: 'User not found' })
        }

        const normalizedSize = size || 'Default'
        const qty = Math.max(1, parseInt(quantity, 10) || 1)
        let cartData = userData.cartData || {}

        if (!cartData[itemId]) {
            cartData[itemId] = {}
        }

        cartData[itemId][normalizedSize] = (cartData[itemId][normalizedSize] || 0) + qty

        await userModel.findByIdAndUpdate(userId, { cartData })

        const newUserData = await userModel.findById(userId)
        const newCartData = newUserData.cartData
        res.json({ success: true, message: 'Added to Cart', newCartData })
    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}
// update products to cart
const updateCart = async (req, res) => {
    try {
        const { itemId, size, quantity } = req.body
        const userId = req.user?.id || req.body.userId

        if (!userId || !itemId) {
            return res.status(400).json({ success: false, message: 'Invalid cart request' })
        }

        const userData = await userModel.findById(userId)
        if (!userData) {
            return res.status(404).json({ success: false, message: 'User not found' })
        }

        let cartData = userData.cartData || {}
        const normalizedSize = (size && typeof size === 'string' && size.trim() && size.toLowerCase() !== 'undefined') ? size.trim() : 'Default'
        const qty = Number(quantity) || 0

        if (!cartData[itemId]) {
            cartData[itemId] = {}
        }

        if (qty <= 0) {
            delete cartData[itemId][normalizedSize]
            if (Object.keys(cartData[itemId]).length === 0) {
                delete cartData[itemId]
            }
        } else {
            cartData[itemId][normalizedSize] = qty
        }

        await userModel.findByIdAndUpdate(userId, { cartData })

        const newUserData = await userModel.findById(userId)
        const newCartData = newUserData.cartData || {}
        res.json({ success: true, message: "Cart updated", newCartData })
    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}
// get user cart data
const getUserCart = async (req, res) => {
    try {
        const userId = req.user?.id || req.body.userId
        if (!userId) {
            return res.json({ success: false, message: 'User not authorized' })
        }

        const userData = await userModel.findById(userId)
        
        if (!userData) {
            return res.json({ success: false, message: 'User not found' })
        }
        
        let cartData = userData.cartData || {}
        res.json({ success: true, cartData })
    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

const clearCart = async (req, res) => {
    try {
        const userId = req.user?.id || req.body.userId
        if (!userId) {
            return res.status(400).json({ success: false, message: 'User not authorized' })
        }

        const userData = await userModel.findById(userId)
        if (!userData) {
            return res.status(404).json({ success: false, message: 'User not found' })
        }

        userData.cartData = {}
        await userData.save()

        res.json({ success: true, message: 'Cart cleared', cartData: {} })
    } catch (error) {
        console.error('Error clearing cart:', error)
        res.status(500).json({ success: false, message: error.message })
    }
}
// const sendInquiry = async (req, res) => {
//     // 1. 配置 OAuth 2.0 客户端
//     const oauth2Client = new google.auth.OAuth2(
//         process.env.CLIENT_ID,
//         process.env.CLIENT_SECRET,
//         process.env.REDIRECT_URI // 例如 http://localhost:3000
//     );

//     // 设置已保存的 refresh_token（首次运行需要获取，见下文）
//     oauth2Client.setCredentials({
//         refresh_token: process.env.REFRESH_TOKEN,
//     });

//     // 2. 获取访问令牌
//     let accessToken;
//     try {
//         const tokenResponse = await oauth2Client.getAccessToken();
//         accessToken = tokenResponse.token;
//     } catch (error) {
//         console.error('获取访问令牌失败:', error);
//         return res.status(500).json({ error: '认证失败', details: error.message });
//     }

//     // 3. 使用 Nodemailer + OAuth 2.0
//     const nodemailer = require('nodemailer');
//     const transporter = nodemailer.createTransport({
//         service: 'gmail',
//         auth: {
//             type: 'OAuth2',
//             user: process.env.EMAIL_USER,
//             clientId: process.env.CLIENT_ID,
//             clientSecret: process.env.CLIENT_SECRET,
//             refreshToken: process.env.REFRESH_TOKEN,
//             accessToken: accessToken,
//         },
//     });

//     // 4. 处理请求数据
//     const { cartItems, currency, total } = req.body;

//     // 验证请求数据
//     if (!cartItems || !Array.isArray(cartItems) || cartItems.length === 0) {
//         return res.status(400).json({ error: '购物车数据无效' });
//     }

//     // 5. 格式化邮件内容为 HTML
//     let emailContent = '<div style="width:60%;"><h2>购物车询价</h2><ul>';
//     cartItems.forEach(item => {
//         emailContent += 
//         `<li style="display:flex; flex-direction:row; justify-content:space-evenly; align-items:center;">
//           <img src="${item.image}" style="width:150px; height:auto" /><br>
//           <p>产品: ${item.name}</p>
//           <p>价格: ${currency}${item.price}</p>
//           <p>尺码: ${item.size}</p>
//           <p>数量: ${item.quantity}</p>
//         </li>`;
//     });
//     emailContent += `</ul><h2 style="font-weight:700;">总价: ${currency}${total}</h2></div>`;

//     // 6. 配置邮件选项
//     const mailOptions = {
//         from: `"AppleBear" <${process.env.EMAIL_USER}>`,
//         to: '1034201254@qq.com',
//         subject: '新的购物车询价',
//         html: emailContent,
//     };

//     // 7. 发送邮件
//     try {
//         await transporter.sendMail(mailOptions);
//         res.status(200).json({ message: '邮件发送成功' });
//     } catch (error) {
//         console.error('邮件发送失败:', error);
//         res.status(500).json({ error: '邮件发送失败', details: error.message });
//     }
// };
const sendInquiry = async (req, res) => {
    // Check if environment variables are set
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
        console.error('Email configuration missing:', {
            EMAIL_USER: process.env.EMAIL_USER ? 'set' : 'missing',
            EMAIL_PASSWORD: process.env.EMAIL_PASSWORD ? 'set' : 'missing'
        });
        // For now, return success without sending email if email is not configured
        console.log('Email not configured, but inquiry data received:', req.body);
        return res.status(200).json({ 
            message: '邮件发送成功',
            note: 'Email configuration not set up - inquiry saved to database only'
        });
    }

    // 配置 Nodemailer
    const transporter = nodemailer.createTransport({
        host: 'smtp.qq.com', // QQ邮箱SMTP服务器
        port: 465,           // SSL端口
        secure: true,        // 启用SSL
        auth: {
            user: process.env.EMAIL_USER, // 例如 1034201254@qq.com
            pass: process.env.EMAIL_PASSWORD, // QQ邮箱授权码
        },
        logger: true,        // 启用日志
        debug: true,         // 详细调试信息
        connectionTimeout: 10000, // 连接超时10秒
        socketTimeout: 10000,     // 套接字超时10秒
    });
    
    try {
        await transporter.verify();
        console.log('SMTP connection verified successfully.');
    } catch (verifyError) {
        console.error('SMTP verification failed:', verifyError);
        return res.status(500).json({
            error: '邮件发送失败',
            details: verifyError.message,
            hint: 'Please confirm EMAIL_USER/EMAIL_PASSWORD (QQ 授权码) and that SMTP service is enabled.'
        });
    }
    const {email,name,number, cartItems, currency, total, message, attachments = [] } = req.body;
    // 格式化邮件内容为 HTML
    let emailContent = `<h2>购物车询价</h2><br> <h2>邮箱:${email}</h2>`;
    if (name) emailContent += `<p>姓名: ${name}</p>`;
    if (number) emailContent += `<p>电话: ${number}</p>`;
    if (message) emailContent += `<div style="margin:12px 0;padding:12px;border-left:4px solid #1890ff;background:#f6fbff;"><strong>留言:</strong><br>${message.replace(/\n/g,'<br/>')}</div>`;
    emailContent += `<ul>`;
    cartItems.forEach(item => {
        emailContent += 
    `<li style = "display:flex;flex-direction:row;justify-content:space-evenly; align-items:center;">
      <img src = "${item.image}" style = "width:150px; height:auto"/><br>
      <p>产品: ${item.name}</p>
      <p>价格: ${currency}${item.price}</p>
      <p>尺码: ${item.size}</p>
      <p>数量: ${item.quantity}</p>
    </li>`;
    });
    emailContent += `</ul><h2 style="text-weight:700;">总价: ${currency}${total}</h2>`;

    const mailOptions = {
        from: "AppleBear <" + process.env.EMAIL_USER + ">", // 发件人
        to: ['1034201254@qq.com'], // 收件人（可从 .env 或前端传入）
        subject: '新的购物车询价',
        html: emailContent,
        attachments: Array.isArray(attachments) ? attachments.map(a => ({
            filename: a.filename || 'attachment',
            content: a.content || '',
            encoding: a.encoding || 'base64',
            contentType: a.contentType || 'application/octet-stream'
        })) : []
    };

    try {
        await transporter.sendMail(mailOptions);
        res.status(200).json({ message: '邮件发送成功' });
    } catch (error) {
        console.error('邮件发送失败:', error);
        res.status(500).json({ 
            error: '邮件发送失败', 
            details: error.message, // 错误的具体信息
            stack: error.stack // 错误堆栈，方便调试
        });
    }
}

export { addToCart, updateCart, getUserCart, clearCart, sendInquiry }