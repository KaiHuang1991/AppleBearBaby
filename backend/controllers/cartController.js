import userModel from "../models/userModel.js"
import { sendInquiryNotificationEmail } from '../utils/inquiryEmail.js'
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
    const { email, name, number, cartItems = [], currency = '$', total = 0, message, attachments = [] } = req.body

    if (!email) {
        return res.status(400).json({
            error: '邮件发送失败',
            message: 'Email is required'
        })
    }

    if (!message || !String(message).trim()) {
        return res.status(400).json({
            error: '邮件发送失败',
            message: 'Inquiry message is required'
        })
    }

    const emailResult = await sendInquiryNotificationEmail({
        userEmail: email,
        userName: name,
        userPhone: number,
        message,
        products: Array.isArray(cartItems) ? cartItems : [],
        totalAmount: total,
        currency,
        attachments
    })

    if (!emailResult.success) {
        return res.status(500).json({
            error: '邮件发送失败',
            details: emailResult.message
        })
    }

    return res.status(200).json({ message: '邮件发送成功' })
}

export { addToCart, updateCart, getUserCart, clearCart, sendInquiry }