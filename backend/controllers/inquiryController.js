import inquiryModel from '../models/inquiryModel.js'
import productModel from '../models/productModel.js'
import nodemailer from 'nodemailer'

const buildThreadMessages = (inquiry) => {
  const raw = inquiry.toObject ? inquiry.toObject() : { ...inquiry }
  let list = Array.isArray(raw.messages) && raw.messages.length
    ? raw.messages.map((m) => ({
        author: m.author,
        body: m.body,
        createdAt: m.createdAt || raw.createdAt
      }))
    : []

  if (!list.length && raw.message) {
    list.push({
      author: 'user',
      body: raw.message,
      createdAt: raw.createdAt || new Date(0)
    })
  }

  if (raw.adminResponse) {
    const hasAdmin = list.some((m) => m.author === 'admin')
    if (!hasAdmin) {
      list.push({
        author: 'admin',
        body: raw.adminResponse,
        createdAt: raw.updatedAt || raw.createdAt
      })
    }
  }

  list.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
  return list
}

const threadHasAdminReply = (messages) => messages.some((m) => m.author === 'admin')

const seedLegacyUserMessage = (inquiry) => {
  if (!inquiry.messages || inquiry.messages.length === 0) {
    const legacy = (inquiry.message || '').trim()
    if (legacy) {
      inquiry.messages = inquiry.messages || []
      inquiry.messages.push({
        author: 'user',
        body: legacy,
        createdAt: inquiry.createdAt || new Date()
      })
    }
  }
}

const hydrateInquiry = (inquiry, { includeMessages = true } = {}) => {
  if (!inquiry) return null
  const obj = inquiry.toObject ? inquiry.toObject() : { ...inquiry }
  /** When messages are not selected from DB, thread is rebuilt from legacy `message` which may be all user bodies joined with \\n\\n (see postUserInquiryMessage). */
  const hadLoadedMessages = Array.isArray(obj.messages) && obj.messages.length > 0
  const messages = buildThreadMessages(obj)
  obj.messages = includeMessages ? messages : undefined
  const last = messages.length ? messages[messages.length - 1] : null

  /** True last speaker for list (no messages selected) vs thread view. */
  const lastAuthor =
    hadLoadedMessages && last
      ? last.author
      : obj.lastMessageAuthor === 'admin' || obj.lastMessageAuthor === 'user'
        ? obj.lastMessageAuthor
        : last?.author || null

  /** Admin UI: Replied only when the store sent the latest message; Pending when the customer spoke last or thread is empty. */
  if (obj.status === 'completed' || obj.status === 'cancelled') {
    obj.displayStatus = obj.status
  } else {
    obj.displayStatus = lastAuthor === 'admin' ? 'replied' : 'pending'
  }

  obj.awaitingAdminReply = lastAuthor === 'user'

  /** Customer list badge: when messages are not loaded, synthetic `last` from buildThreadMessages can disagree with the real thread (preview uses lastMessageAuthor). Use denormalized lastMessageAuthor + admin signals for the list; full messages when loaded (chat page). */
  if (obj.status === 'completed' || obj.status === 'cancelled') {
    obj.customerThreadStatus = obj.status
  } else if (obj.status === 'responded') {
    obj.customerThreadStatus = 'replied'
  } else if (hadLoadedMessages) {
    const hasAdmin = threadHasAdminReply(messages)
    obj.customerThreadStatus =
      hasAdmin && last && last.author === 'user' ? 'replied' : 'pending'
  } else {
    const hasAdmin =
      threadHasAdminReply(messages) ||
      Boolean(String(obj.adminResponse || '').trim()) ||
      obj.status === 'replied' ||
      obj.status === 'responded'
    const lastAuthor =
      obj.lastMessageAuthor === 'admin' || obj.lastMessageAuthor === 'user'
        ? obj.lastMessageAuthor
        : last?.author || ''
    obj.customerThreadStatus =
      hasAdmin && lastAuthor === 'user' ? 'replied' : 'pending'
  }

  const customerDisplayName =
    (obj.userName && String(obj.userName).trim()) ||
    (typeof obj.userId === 'object' &&
      obj.userId &&
      String(obj.userId.name || '').trim()) ||
    (obj.userEmail && String(obj.userEmail).trim()) ||
    (typeof obj.userId === 'object' &&
      obj.userId &&
      String(obj.userId.email || '').trim()) ||
    'Customer'
  const storeDisplayName =
    (process.env.INQUIRY_STORE_DISPLAY_NAME && String(process.env.INQUIRY_STORE_DISPLAY_NAME).trim()) ||
    'Store'

  let previewAuthor = ''
  let previewBody = ''
  if (hadLoadedMessages && messages.length) {
    const lm = messages[messages.length - 1]
    previewAuthor = lm.author
    previewBody = lm.body != null && lm.body !== undefined ? String(lm.body) : ''
  } else if (
    (obj.lastMessageAuthor === 'user' || obj.lastMessageAuthor === 'admin') &&
    obj.lastMessageBody
  ) {
    previewAuthor = obj.lastMessageAuthor
    previewBody = String(obj.lastMessageBody).trim()
  } else if (messages.length) {
    const lm = messages[messages.length - 1]
    previewAuthor = lm.author
    previewBody = lm.body != null && lm.body !== undefined ? String(lm.body) : ''
    if (previewAuthor === 'user' && previewBody.includes('\n\n')) {
      const segs = previewBody.split(/\n\n/).map((s) => s.trim()).filter(Boolean)
      if (segs.length > 1) previewBody = segs[segs.length - 1]
    }
  }

  const senderName = previewAuthor === 'admin' ? storeDisplayName : customerDisplayName
  obj.latestThreadMessageLine = previewBody ? `${senderName}: ${previewBody}` : ''
  return obj
}

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
  
  // 检查必需的邮箱配置
  if (!process.env.INQUIRY_RECEIVER_EMAIL) {
    console.error('错误: INQUIRY_RECEIVER_EMAIL未在.env文件中设置');
    return {
      success: false,
      message: 'Email configuration missing. Please set INQUIRY_RECEIVER_EMAIL in .env file.'
    };
  }
  
  const mailOptions = {
    from: `"AppleBear" <${process.env.EMAIL_USER}>`,
    to: process.env.INQUIRY_RECEIVER_EMAIL,
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
    const { userEmail, userName, userPhone, products, message, emailStatus } = req.body

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

    const bodyText = (message || '').trim()
    const now = new Date()
    const notifyByEmail = process.env.INQUIRY_NOTIFY_ON_CREATE === 'true'
    const initialMessages = bodyText
      ? [{ author: 'user', body: bodyText, createdAt: now }]
      : []

    const newInquiry = new inquiryModel({
      userId, // Use authenticated userId if available
      userEmail,
      userName: userName || '',
      userPhone: userPhone || '',
      products: normalizedProducts,
      message: bodyText,
      totalAmount,
      messages: initialMessages,
      lastActivityAt: now,
      lastMessageBody: bodyText.slice(0, 500),
      lastMessageAuthor: bodyText ? 'user' : '',
      lastMessageAt: bodyText ? now : undefined,
      hasUnreadAdminReply: false,
      hasUnreadUserMessageForAdmin: true,
      emailStatus: notifyByEmail ? (emailStatus || 'pending') : 'skipped'
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

// Profile stats: total inquiries + pending quotes (awaiting store reply)
const getUserInquiryStats = async (req, res) => {
  try {
    const userId = req.user?.id
    if (!userId) {
      return res.status(401).json({ success: false, message: 'User not authenticated' })
    }

    const inquiries = await inquiryModel
      .find({ userId })
      .select('status lastMessageAuthor adminResponse message')

    let pending = 0
    for (const inv of inquiries) {
      const h = hydrateInquiry(inv, { includeMessages: false })
      if (h?.customerThreadStatus === 'pending') pending++
    }

    res.status(200).json({
      success: true,
      total: inquiries.length,
      pending
    })
  } catch (error) {
    console.error('Error fetching user inquiry stats:', error)
    res.status(500).json({
      success: false,
      message: 'Error fetching inquiry statistics',
      error: error.message
    })
  }
}

// Get count of inquiries with unread admin replies (logged-in customer)
const getUserInquiryUnreadCount = async (req, res) => {
  try {
    const userId = req.user?.id
    if (!userId) {
      return res.status(401).json({ success: false, message: 'User not authenticated' })
    }
    const count = await inquiryModel.countDocuments({ userId, hasUnreadAdminReply: true })
    res.status(200).json({ success: true, count })
  } catch (error) {
    console.error('Error counting user inquiry unread:', error)
    res.status(500).json({
      success: false,
      message: 'Error counting unread inquiries',
      error: error.message
    })
  }
}

// Admin: count inquiries with new customer messages since admin last read
const getAdminInquiryUnreadCount = async (req, res) => {
  try {
    const count = await inquiryModel.countDocuments({ hasUnreadUserMessageForAdmin: true })
    res.status(200).json({ success: true, count })
  } catch (error) {
    console.error('Error counting unread inquiries:', error)
    res.status(500).json({ success: false, message: 'Error counting unread inquiries', error: error.message })
  }
}

const getAllInquiries = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, search, messageStatus } = req.query

    const conditions = []

    if (status) {
      conditions.push({ status })
    }

    const ms = typeof messageStatus === 'string' ? messageStatus.trim().toLowerCase() : ''
    if (ms === 'replied') {
      conditions.push({ lastMessageAuthor: 'admin' })
    } else if (ms === 'pending') {
      conditions.push({
        $or: [
          { lastMessageAuthor: 'user' },
          { lastMessageAuthor: '' },
          { lastMessageAuthor: null },
          { lastMessageAuthor: { $exists: false } }
        ]
      })
    }

    if (search && String(search).trim()) {
      const q = String(search).trim()
      conditions.push({
        $or: [
          { userName: { $regex: q, $options: 'i' } },
          { userEmail: { $regex: q, $options: 'i' } }
        ]
      })
    }

    let query = {}
    if (conditions.length === 1) {
      query = conditions[0]
    } else if (conditions.length > 1) {
      query.$and = conditions
    }

    const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10)

    const inquiries = await inquiryModel
      .find(query)
      .select('-messages')
      .sort({
        hasUnreadUserMessageForAdmin: -1,
        lastActivityAt: -1,
        updatedAt: -1
      })
      .skip(skip)
      .limit(parseInt(limit, 10))
      .populate('userId', 'name email')
      .populate('products.productId')

    const total = await inquiryModel.countDocuments(query)

    const hydrated = inquiries.map((inv) => {
      try {
        return hydrateInquiry(inv, { includeMessages: false })
      } catch (e) {
        console.error('hydrateInquiry failed for', inv?._id, e)
        const plain = inv.toObject ? inv.toObject() : { ...inv }
        return {
          ...plain,
          displayStatus:
            plain.status === 'completed' || plain.status === 'cancelled'
              ? plain.status
              : plain.lastMessageAuthor === 'admin'
                ? 'replied'
                : 'pending',
          customerThreadStatus: plain.status === 'completed' || plain.status === 'cancelled' ? plain.status : 'pending',
          latestThreadMessageLine: '',
          awaitingAdminReply: plain.lastMessageAuthor === 'user'
        }
      }
    })

    res.status(200).json({
      success: true,
      inquiries: hydrated,
      total,
      currentPage: parseInt(page),
      totalPages: Math.ceil(total / parseInt(limit, 10))
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
      .select('-messages')
      .sort({ hasUnreadAdminReply: -1, lastActivityAt: -1, updatedAt: -1, createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      // No need to populate - we already have productName, price, etc. in the inquiry

    const hydrated = inquiries.map((inv) => hydrateInquiry(inv, { includeMessages: false }))
    const total = await inquiryModel.countDocuments(query)

    res.status(200).json({
      success: true,
      inquiries: hydrated,
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

// Get single inquiry (owner only; marks thread as read)
const getInquiryById = async (req, res) => {
  try {
    const { id } = req.params
    const userId = req.user?.id

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      })
    }

    const inquiry = await inquiryModel
      .findOne({ _id: id, userId })
      .populate('products.productId')

    if (!inquiry) {
      return res.status(404).json({
        success: false,
        message: 'Inquiry not found'
      })
    }

    inquiry.hasUnreadAdminReply = false
    inquiry.userLastReadAt = new Date()
    await inquiry.save()

    res.status(200).json({
      success: true,
      inquiry: hydrateInquiry(inquiry, { includeMessages: true })
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

const getAdminInquiryThread = async (req, res) => {
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

    inquiry.hasUnreadUserMessageForAdmin = false
    inquiry.adminLastReadAt = new Date()
    await inquiry.save()

    res.status(200).json({
      success: true,
      inquiry: hydrateInquiry(inquiry, { includeMessages: true })
    })
  } catch (error) {
    console.error('Error fetching inquiry (admin):', error)
    res.status(500).json({
      success: false,
      message: 'Error fetching inquiry',
      error: error.message
    })
  }
}

const postUserInquiryMessage = async (req, res) => {
  try {
    const { id } = req.params
    const userId = req.user?.id
    const text = (req.body?.text || req.body?.message || '').trim()

    if (!userId) {
      return res.status(401).json({ success: false, message: 'User not authenticated' })
    }
    if (!text) {
      return res.status(400).json({ success: false, message: 'Message is required' })
    }

    const inquiry = await inquiryModel.findOne({ _id: id, userId })
    if (!inquiry) {
      return res.status(404).json({ success: false, message: 'Inquiry not found' })
    }

    const now = new Date()
    seedLegacyUserMessage(inquiry)
    inquiry.messages.push({ author: 'user', body: text, createdAt: now })

    const merged = buildThreadMessages(inquiry)
    inquiry.message = merged.filter((m) => m.author === 'user').map((m) => m.body).join('\n\n')

    inquiry.lastActivityAt = now
    inquiry.lastMessageBody = text.slice(0, 500)
    inquiry.lastMessageAuthor = 'user'
    inquiry.lastMessageAt = now
    inquiry.status = threadHasAdminReply(merged) ? 'replied' : 'pending'
    inquiry.hasUnreadUserMessageForAdmin = true

    await inquiry.save()

    res.status(200).json({
      success: true,
      inquiry: hydrateInquiry(inquiry, { includeMessages: true })
    })
  } catch (error) {
    console.error('Error posting user inquiry message:', error)
    res.status(500).json({
      success: false,
      message: 'Error posting message',
      error: error.message
    })
  }
}

const postAdminInquiryMessage = async (req, res) => {
  try {
    const { id } = req.params
    const text = (req.body?.text || req.body?.message || '').trim()

    if (!text) {
      return res.status(400).json({ success: false, message: 'Message is required' })
    }

    const inquiry = await inquiryModel.findById(id)
    if (!inquiry) {
      return res.status(404).json({ success: false, message: 'Inquiry not found' })
    }

    const now = new Date()
    seedLegacyUserMessage(inquiry)
    inquiry.messages.push({ author: 'admin', body: text, createdAt: now })
    inquiry.adminResponse = text
    inquiry.status = 'replied'
    inquiry.lastActivityAt = now
    inquiry.lastMessageBody = text.slice(0, 500)
    inquiry.lastMessageAuthor = 'admin'
    inquiry.lastMessageAt = now
    inquiry.hasUnreadAdminReply = true
    inquiry.hasUnreadUserMessageForAdmin = false

    await inquiry.save()

    res.status(200).json({
      success: true,
      inquiry: hydrateInquiry(inquiry, { includeMessages: true })
    })
  } catch (error) {
    console.error('Error posting admin inquiry message:', error)
    res.status(500).json({
      success: false,
      message: 'Error posting message',
      error: error.message
    })
  }
}

// Update inquiry status (admin only)
const updateInquiryStatus = async (req, res) => {
  try {
    const { id } = req.params
    const { status, adminResponse, emailStatus } = req.body

    const inquiry = await inquiryModel.findById(id)
    if (!inquiry) {
      return res.status(404).json({
        success: false,
        message: 'Inquiry not found'
      })
    }

    if (status) inquiry.status = status
    if (emailStatus) inquiry.emailStatus = emailStatus

    if (typeof adminResponse === 'string' && adminResponse.trim()) {
      const t = adminResponse.trim()
      inquiry.adminResponse = t
      const lastAdmin = [...inquiry.messages].reverse().find((m) => m.author === 'admin')
      const isNew = !lastAdmin || lastAdmin.body !== t
      const now = new Date()
      if (isNew) {
        seedLegacyUserMessage(inquiry)
        inquiry.messages.push({ author: 'admin', body: t, createdAt: now })
      }
      inquiry.status = 'replied'
      inquiry.lastActivityAt = now
      inquiry.lastMessageBody = t.slice(0, 500)
      inquiry.lastMessageAuthor = 'admin'
      inquiry.lastMessageAt = now
      inquiry.hasUnreadAdminReply = true
      inquiry.hasUnreadUserMessageForAdmin = false
    } else if (adminResponse === '') {
      inquiry.adminResponse = ''
    }

    await inquiry.save()

    res.status(200).json({
      success: true,
      message: 'Inquiry updated successfully',
      inquiry: hydrateInquiry(inquiry, { includeMessages: true })
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
    const userId = req.user?.id

    if (!userId) {
      return res.status(401).json({ success: false, message: 'User not authenticated' })
    }

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

    const merged = buildThreadMessages(inquiry)
    inquiry.status = threadHasAdminReply(merged) ? 'replied' : 'pending'
    inquiry.emailStatus = 'skipped'

    await inquiry.save()

    res.json({ success: true, message: 'Inquiry updated successfully', inquiry: hydrateInquiry(inquiry, { includeMessages: true }) })
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
  getAdminInquiryUnreadCount,
  getUserInquiryUnreadCount,
  getUserInquiryStats,
  getAllInquiries,
  getUserInquiries,
  getInquiryById,
  getAdminInquiryThread,
  postUserInquiryMessage,
  postAdminInquiryMessage,
  updateInquiryStatus,
  deleteInquiry,
  deleteUserInquiry,
  updateUserInquiry,
  resendUserInquiry
}