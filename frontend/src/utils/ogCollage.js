/** Extract Cloudinary public_id from a delivery URL. */
export function extractCloudinaryPublicId(url = '') {
  if (!url.includes('res.cloudinary.com')) return null
  const afterUpload = url.split('/upload/')[1]
  if (!afterUpload) return null

  const parts = afterUpload.split('/')
  while (parts.length > 1) {
    const head = parts[0]
    if (/^v\d+$/.test(head)) {
      parts.shift()
      break
    }
    if (head.includes(',') || /^[a-z0-9_]+_[a-z0-9_,]+$/i.test(head)) {
      parts.shift()
      continue
    }
    break
  }

  const joined = parts.join('/').replace(/\.[^/.]+$/, '')
  return joined || null
}

export function getCloudinaryCloudName(url = '') {
  const match = url.match(/res\.cloudinary\.com\/([^/]+)\//i)
  return match ? match[1] : null
}

/**
 * Facebook OG canvas is 1200×630. Scale the full photo to fit inside (no crop),
 * then pad to exact card size so Facebook does not crop top/bottom.
 */
export function buildOgShareImageUrl(imageUrls = [], cloudName = '') {
  const urls = (Array.isArray(imageUrls) ? imageUrls : []).filter(Boolean)
  if (!urls.length) return ''

  const first = urls[0]
  const resolvedCloud = cloudName || getCloudinaryCloudName(first)
  const publicId = extractCloudinaryPublicId(first)

  if (resolvedCloud && publicId) {
    return `https://res.cloudinary.com/${resolvedCloud}/image/upload/c_limit,w_1200,h_630/c_pad,w_1200,h_630,b_white,g_center,q_auto,f_auto/${publicId}`
  }

  return first
}

export function buildOgShareImages(imageUrls = [], cloudName = '') {
  const url = buildOgShareImageUrl(imageUrls, cloudName)
  return url ? [url] : []
}
