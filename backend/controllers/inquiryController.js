import inquiryModel from '../models/inquiryModel.js'
import productModel from '../models/productModel.js'
import nodemailer from 'nodemailer'

const normalizeId = (value) => {
  if (!value) return null
  if (typeof value === 'string') return value
  if (typeof value === 'object') {
    if (value._id) return String(value._id)
    if (typeof value.toString === 'function') return value.toString()
  }
  if (typeof value === 'number') return String(value)
  return null
}

const buildInquiryProducts = async (items = []) => {
  if (!Array.isArray(items) || !items.length) {
    return { normalizedProducts: [], totalAmount: 0 }
  }

  const productIds = [...new Set(items.map(item => normalizeId(item.productId || item._id)).filter(Boolean))]
  if (!productIds.length) {
    return { normalizedProducts: [], totalAmount: 0 }
  }

  const productDocs = await productModel.find({ _id: { $in: productIds } })
  const productMap = new Map(productDocs.map(doc => [String(doc._id), doc]))

  const normalizedProducts = []
  let totalAmount = 0

  for (const item of items) {
    const productId = normalizeId(item.productId || item._id)
    if (!productId) continue

    const productDoc = productMap.get(String(productId))
    if (!productDoc) continue

    const quantity = Math.max(1, parseInt(item.quantity, 10) || 1)
    const size = item.size && typeof item.size === 'string' ? item.size : 'Default'
    const price = Number(productDoc.price) || 0

    totalAmount += price * quantity

    normalizedProducts.push({
      productId: productDoc._id,
      productName: productDoc.name,
      quantity,
      size,
      price
    })
  }

  return { normalizedProducts, totalAmount }
}

const ensureEmailConfiguration = () => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
    console.error('Email configuration missing:', {
      EMAIL_USER: process.env.EMAIL_USER ? 'set' : 'missing',
      EMAIL_PASSWORD: process.env.EMAIL_PASSWORD ? 'set' : 'missing'
    })
    return false
  }
  return true
}

const createTransporter = () => {
  return nodemailer.createTransport({
    host: 'smtp.qq.com',
    port: 465,
    secure: true,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD
    },
    logger: true,
    debug: true,
    connectionTimeout: 10000,
    socketTimeout: 10000
  })
}

const formatInquiryEmailHtml = (inquiry, currency = '$') => {
  const safeMessage = (inquiry.message || '').replace(/\n/g, '<br/>')
  const productRows = inquiry.products.map(product => `
    <tr>
      <td style="padding:8px;border:1px solid #e5e7eb;">${product.productName}</td>
      <td style="padding:8px;border:1px solid #e5e7eb;text-align:center;">${product.size}</td>
      <td style="padding:8px;border:1px solid #e5e7eb;text-align:center;">${product.quantity}</td>
      <td style="padding:8px;border:1px solid #e5e7eb;text-align:right;">${currency}${(product.price || 0).toFixed(2)}</td>
    </tr>
  `).join('')

  return `
    <div style="font-family:Arial,Helvetica,sans-serif;max-width:640px;margin:0 auto;color:#111827;">
      <h2 style="background:#1d4ed8;color:#fff;padding:16px 24px;margin:0;border-radius:12px 12px 0 0;">
        Inquiry Update from ${inquiry.userName || inquiry.userEmail}
      </h2>
      <div style="padding:24px;background:#ffffff;border:1px solid #e5e7eb;border-top:none;">
        <p style="margin:0 0 12px 0;">You have received an updated inquiry.</p>
        <div style="margin-bottom:16px;">
          <p style="margin:4px 0;"><strong>Name:</strong> ${inquiry.userName || 'N/A'}</p>
          <p style="margin:4px 0;"><strong>Email:</strong> ${inquiry.userEmail}</p>
          ${inquiry.userPhone ? `<p style="margin:4px 0;"><strong>Phone:</strong> ${inquiry.userPhone}</p>` : ''}
        </div>
        <table style="width:100%;border-collapse:collapse;margin-bottom:16px;">
          <thead>
            <tr style="background:#eff6ff;">
              <th style="padding:8px;border:1px solid #e5e7eb;text-align:left;">Product</th>
              <th style="padding:8px;border:1px solid #e5e7eb;text-align:center;">Size</th>
              <th style="padding:8px;border:1px solid #e5e7eb;text-align:center;">Quantity</th>
              <th style="padding:8px;border:1px solid #e5e7eb;text-align:right;">Unit Price</th>
            </tr>
          </thead>
          <tbody>
            ${productRows}
          </tbody>
        </table>
        <p style="font-size:16px;font-weight:600;margin:12px 0;color:#1f2937;">
          Total Amount: ${currency}${(inquiry.totalAmount || 0).toFixed(2)}
        </p>
        ${safeMessage ? `<div style="margin-top:16px;padding:16px;border-left:4px solid #3b82f6;background:#eff6ff;">
          <strong>Message:</strong><br/>${safeMessage}
        </div>` : ''}
      </div>
    </div>
  `
}

const sendInquiryUpdateEmail = async (inquiry) => {
  if (!ensureEmailConfiguration()) {
    return {
      success: true,
      skipped: true,
      message: 'Email configuration missing. Inquiry saved, email not sent.'
    }
  }

  const transporter = createTransporter()

  try {
    await transporter.verify()
  } catch (verifyError) {
    console.error('SMTP verification failed:', verifyError)
    return {
      success: false,
      message: verifyError.message || 'SMTP verification failed'
    }
  }

  const html = formatInquiryEmailHtml(inquiry)
  const mailOptions = {
    from: `"AppleBear" <${process.env.EMAIL_USER}>`,
    to: process.env.INQUIRY_RECEIVER_EMAIL || '1034201254@qq.com',
    replyTo: inquiry.userEmail,
    subject: `Inquiry Update - ${inquiry.userName || inquiry.userEmail}`,
    html
  }

  try {
    await transporter.sendMail(mailOptions)
    return { success: true, message: 'Email sent successfully' }
  } catch (error) {
    console.error('Failed to send inquiry email:', error)
    return { success: false, message: error.message || 'Failed to send inquiry email' }
  }
}

// Create new inquiry
const createInquiry = async (req, res) => {
  try {
    // Try to get userId from authenticated user first, fallback to body
    const userId = req.user?.id || req.body.userId || null
    const { userEmail, userName, userPhone, products, message, emailStatus = 'pending' } = req.body

    // Validate required fields
    if (!userEmail) {
      return res.status(400).json({
        success: false,
        message: 'User email is required'
      })
    }

    const { normalizedProducts, totalAmount } = await buildInquiryProducts(products)

    if (!normalizedProducts.length) {
      return res.status(400).json({
        success: false,
        message: 'Unable to create inquiry with provided products'
      })
    }

    const newInquiry = new inquiryModel({
      userId, // Use authenticated userId if available
      userEmail,
      userName: userName || '',
      userPhone: userPhone || '',
      products: normalizedProducts,
      message: message || '',
      totalAmount,
      emailStatus
    })

    const savedInquiry = await newInquiry.save()

    res.status(201).json({
      success: true,
      message: 'Inquiry created successfully',
      inquiry: savedInquiry
    })
  } catch (error) {
    console.error('Error creating inquiry:', error)
    res.status(500).json({
      success: false,
      message: 'Error creating inquiry',
      error: error.message
    })
  }
}

// Get all inquiries (admin only)
const getAllInquiries = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, search, emailStatus } = req.query
    
    let query = {}
    
    // Filter by status
    if (status) {
      query.status = status
    }
    
    // Filter by email status
    if (emailStatus) {
      query.emailStatus = emailStatus
    }
    
    // Search by username or email
    if (search) {
      query.$or = [
        { userName: { $regex: search, $options: 'i' } },
        { userEmail: { $regex: search, $options: 'i' } }
      ]
    }

    const skip = (page - 1) * limit
    
    const inquiries = await inquiryModel
      .find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate('userId', 'name email')

    const total = await inquiryModel.countDocuments(query)

    res.status(200).json({
      success: true,
      inquiries,
      total,
      currentPage: parseInt(page),
      totalPages: Math.ceil(total / limit)
    })
  } catch (error) {
    console.error('Error fetching inquiries:', error)
    res.status(500).json({
      success: false,
      message: 'Error fetching inquiries',
      error: error.message
    })
  }
}

// Get user's inquiries
const getUserInquiries = async (req, res) => {
  try {
    // Use authenticated user ID from middleware (always use this for security)
    // URL parameter userId is ignored - we always use authenticated user ID
    const userId = req.user?.id

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      })
    }

    const { page = 1, limit = 10, search } = req.query
    const skip = (page - 1) * limit

    // Build query - search by product name if search term provided
    let query = { userId }
    if (search && search.trim()) {
      query.$or = [
        { 'products.productName': { $regex: search.trim(), $options: 'i' } },
        { message: { $regex: search.trim(), $options: 'i' } }
      ]
    }

    const inquiries = await inquiryModel
      .find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      // No need to populate - we already have productName, price, etc. in the inquiry

    const total = await inquiryModel.countDocuments(query)

    res.status(200).json({
      success: true,
      inquiries,
      total,
      currentPage: parseInt(page),
      totalPages: Math.ceil(total / limit)
    })
  } catch (error) {
    console.error('Error fetching user inquiries:', error)
    res.status(500).json({
      success: false,
      message: 'Error fetching user inquiries',
      error: error.message
    })
  }
}

// Get single inquiry
const getInquiryById = async (req, res) => {
  try {
    const { id } = req.params

    const inquiry = await inquiryModel
      .findById(id)
      .populate('userId', 'name email')
      .populate('products.productId')

    if (!inquiry) {
      return res.status(404).json({
        success: false,
        message: 'Inquiry not found'
      })
    }

    res.status(200).json({
      success: true,
      inquiry
    })
  } catch (error) {
    console.error('Error fetching inquiry:', error)
    res.status(500).json({
      success: false,
      message: 'Error fetching inquiry',
      error: error.message
    })
  }
}

// Update inquiry status (admin only)
const updateInquiryStatus = async (req, res) => {
  try {
    const { id } = req.params
    const { status, adminResponse, emailStatus } = req.body

    const updateData = {}
    if (status) updateData.status = status
    if (adminResponse) updateData.adminResponse = adminResponse
    if (emailStatus) updateData.emailStatus = emailStatus

    const inquiry = await inquiryModel.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    )

    if (!inquiry) {
      return res.status(404).json({
        success: false,
        message: 'Inquiry not found'
      })
    }

    res.status(200).json({
      success: true,
      message: 'Inquiry updated successfully',
      inquiry
    })
  } catch (error) {
    console.error('Error updating inquiry:', error)
    res.status(500).json({
      success: false,
      message: 'Error updating inquiry',
      error: error.message
    })
  }
}

// Delete inquiry (admin only)
const deleteInquiry = async (req, res) => {
  try {
    const { id } = req.params

    const inquiry = await inquiryModel.findByIdAndDelete(id)

    if (!inquiry) {
      return res.status(404).json({
        success: false,
        message: 'Inquiry not found'
      })
    }

    res.status(200).json({
      success: true,
      message: 'Inquiry deleted successfully'
    })
  } catch (error) {
    console.error('Error deleting inquiry:', error)
    res.status(500).json({
      success: false,
      message: 'Error deleting inquiry',
      error: error.message
    })
  }
}

// Delete user's own inquiry
const deleteUserInquiry = async (req, res) => {
  try {
    const { id } = req.params
    const { userId } = req.body

    const inquiry = await inquiryModel.findOne({ _id: id, userId })

    if (!inquiry) {
      return res.status(404).json({
        success: false,
        message: 'Inquiry not found or you do not have permission to delete it'
      })
    }

    await inquiryModel.findByIdAndDelete(id)

    res.status(200).json({
      success: true,
      message: 'Inquiry deleted successfully'
    })
  } catch (error) {
    console.error('Error deleting inquiry:', error)
    res.status(500).json({
      success: false,
      message: 'Error deleting inquiry',
      error: error.message
    })
  }
}

const updateUserInquiry = async (req, res) => {
  try {
    const { id } = req.params
    const userId = req.user?.id
    const { products = [], message, userPhone } = req.body

    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' })
    }

    const inquiry = await inquiryModel.findOne({ _id: id, userId })

    if (!inquiry) {
      return res.status(404).json({ success: false, message: 'Inquiry not found' })
    }

    if (Array.isArray(products) && products.length > 0) {
      const { normalizedProducts, totalAmount } = await buildInquiryProducts(products)

      if (!normalizedProducts.length) {
        return res.status(400).json({ success: false, message: 'Unable to update inquiry with provided products' })
      }

      inquiry.products = normalizedProducts
      inquiry.totalAmount = totalAmount
    }

    if (typeof message === 'string') {
      inquiry.message = message
    }

    if (typeof userPhone === 'string') {
      inquiry.userPhone = userPhone
    }

    inquiry.status = 'pending'
    inquiry.emailStatus = 'pending'

    await inquiry.save()

    res.json({ success: true, message: 'Inquiry updated successfully', inquiry })
  } catch (error) {
    console.error('Error updating user inquiry:', error)
    res.status(500).json({ success: false, message: 'Error updating inquiry', error: error.message })
  }
}

const resendUserInquiry = async (req, res) => {
  try {
    const { id } = req.params
    const userId = req.user?.id
    const { products = [], message, userPhone } = req.body

    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' })
    }

    const inquiry = await inquiryModel.findOne({ _id: id, userId })

    if (!inquiry) {
      return res.status(404).json({ success: false, message: 'Inquiry not found' })
    }

    if (Array.isArray(products) && products.length > 0) {
      const { normalizedProducts, totalAmount } = await buildInquiryProducts(products)

      if (!normalizedProducts.length) {
        return res.status(400).json({ success: false, message: 'Unable to resend inquiry with provided products' })
      }

      inquiry.products = normalizedProducts
      inquiry.totalAmount = totalAmount
    }

    if (typeof message === 'string') {
      inquiry.message = message
    }

    if (typeof userPhone === 'string') {
      inquiry.userPhone = userPhone
    }

    inquiry.status = 'pending'
    inquiry.emailStatus = 'pending'
    await inquiry.save()

    const emailResult = await sendInquiryUpdateEmail(inquiry)

    inquiry.emailStatus = emailResult.success ? 'sent' : 'failed'
    await inquiry.save()

    res.json({
      success: true,
      message: emailResult.success
        ? 'Inquiry resent successfully'
        : `Inquiry updated but email failed: ${emailResult.message}`,
      inquiry,
      emailResult
    })
  } catch (error) {
    console.error('Error resending inquiry:', error)
    res.status(500).json({ success: false, message: 'Error resending inquiry', error: error.message })
  }
}

export {
  createInquiry,
  getAllInquiries,
  getUserInquiries,
  getInquiryById,
  updateInquiryStatus,
  deleteInquiry,
  deleteUserInquiry,
  updateUserInquiry,
  resendUserInquiry
}