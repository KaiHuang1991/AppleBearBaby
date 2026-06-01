import nodemailer from 'nodemailer'

const ensureEmailConfiguration = () => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
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
    logger: process.env.NODE_ENV !== 'production',
    debug: process.env.NODE_ENV !== 'production',
    connectionTimeout: 10000,
    socketTimeout: 10000
  })
}

const escapeHtml = (value = '') =>
  String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')

const normalizeProductLine = (product) => ({
  name: product.productName || product.name || 'Unknown Product',
  size: product.size || 'Default',
  quantity: product.quantity || 1,
  price: Number(product.price) || 0,
  image: product.image || ''
})

export const buildInquiryNotificationHtml = ({
  userEmail,
  userName,
  userPhone,
  message,
  products = [],
  totalAmount = 0,
  currency = '$'
}) => {
  const safeMessage = escapeHtml(message || '').replace(/\n/g, '<br/>')
  const lines = (Array.isArray(products) ? products : []).map(normalizeProductLine)

  const productSection = lines.length
    ? `
      <table style="width:100%;border-collapse:collapse;margin:16px 0;">
        <thead>
          <tr style="background:#eff6ff;">
            <th style="padding:8px;border:1px solid #e5e7eb;text-align:left;">Product</th>
            <th style="padding:8px;border:1px solid #e5e7eb;text-align:center;">Size</th>
            <th style="padding:8px;border:1px solid #e5e7eb;text-align:center;">Qty</th>
            <th style="padding:8px;border:1px solid #e5e7eb;text-align:right;">Unit Price</th>
          </tr>
        </thead>
        <tbody>
          ${lines.map((item) => `
            <tr>
              <td style="padding:8px;border:1px solid #e5e7eb;">
                ${item.image ? `<img src="${escapeHtml(item.image)}" alt="" style="width:64px;height:64px;object-fit:cover;border-radius:6px;margin-right:8px;vertical-align:middle;" />` : ''}
                ${escapeHtml(item.name)}
              </td>
              <td style="padding:8px;border:1px solid #e5e7eb;text-align:center;">${escapeHtml(item.size)}</td>
              <td style="padding:8px;border:1px solid #e5e7eb;text-align:center;">${item.quantity}</td>
              <td style="padding:8px;border:1px solid #e5e7eb;text-align:right;">${currency}${item.price.toFixed(2)}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
      <p style="font-size:16px;font-weight:600;margin:12px 0;color:#1f2937;">
        Total Amount: ${currency}${Number(totalAmount || 0).toFixed(2)}
      </p>
    `
    : `<p style="margin:16px 0;color:#6b7280;"><em>General inquiry — no products selected.</em></p>`

  return `
    <div style="font-family:Arial,Helvetica,sans-serif;max-width:640px;margin:0 auto;color:#111827;">
      <h2 style="background:#1d4ed8;color:#fff;padding:16px 24px;margin:0;border-radius:12px 12px 0 0;">
        New Wholesale Inquiry
      </h2>
      <div style="padding:24px;background:#ffffff;border:1px solid #e5e7eb;border-top:none;border-radius:0 0 12px 12px;">
        <div style="margin-bottom:16px;">
          <p style="margin:4px 0;"><strong>Name:</strong> ${escapeHtml(userName || 'N/A')}</p>
          <p style="margin:4px 0;"><strong>Email:</strong> ${escapeHtml(userEmail)}</p>
          ${userPhone ? `<p style="margin:4px 0;"><strong>Phone:</strong> ${escapeHtml(userPhone)}</p>` : ''}
        </div>
        ${productSection}
        ${safeMessage ? `
          <div style="margin-top:16px;padding:16px;border-left:4px solid #3b82f6;background:#eff6ff;">
            <strong>Inquiry Message:</strong><br/>${safeMessage}
          </div>
        ` : ''}
      </div>
    </div>
  `
}

export const sendInquiryNotificationEmail = async ({
  userEmail,
  userName,
  userPhone,
  message,
  products = [],
  totalAmount = 0,
  currency = '$',
  attachments = [],
  subject
}) => {
  if (!ensureEmailConfiguration()) {
    return {
      success: false,
      message: 'Email credentials are not configured.'
    }
  }

  if (!process.env.INQUIRY_RECEIVER_EMAIL) {
    return {
      success: false,
      message: 'INQUIRY_RECEIVER_EMAIL is not configured.'
    }
  }

  if (!userEmail) {
    return {
      success: false,
      message: 'User email is required.'
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

  const html = buildInquiryNotificationHtml({
    userEmail,
    userName,
    userPhone,
    message,
    products,
    totalAmount,
    currency
  })

  const hasProducts = Array.isArray(products) && products.length > 0
  const mailSubject =
    subject ||
    (hasProducts
      ? `New Cart Inquiry - ${userName || userEmail}`
      : `New General Inquiry - ${userName || userEmail}`)

  const mailOptions = {
    from: `"AppleBear" <${process.env.EMAIL_USER}>`,
    to: process.env.INQUIRY_RECEIVER_EMAIL,
    replyTo: userEmail,
    subject: mailSubject,
    html,
    attachments: Array.isArray(attachments)
      ? attachments.map((a) => ({
          filename: a.filename || a.name || 'attachment',
          content: a.content || '',
          encoding: a.encoding || 'base64',
          contentType: a.contentType || a.type || 'application/octet-stream'
        }))
      : []
  }

  try {
    await transporter.sendMail(mailOptions)
    return { success: true, message: 'Email sent successfully' }
  } catch (error) {
    console.error('Failed to send inquiry email:', error)
    return { success: false, message: error.message || 'Failed to send inquiry email' }
  }
}
