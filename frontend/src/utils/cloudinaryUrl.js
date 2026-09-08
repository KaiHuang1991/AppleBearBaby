import { extractCloudinaryPublicId, getCloudinaryCloudName } from './ogCollage.js'

/**
 * Rebuild a Cloudinary delivery URL with display-sized transforms.
 * Falls back to the original URL when the source is not Cloudinary.
 */
export function optimizeCloudinaryUrl(url = '', { width = 800, height, crop = 'limit' } = {}) {
  if (!url || typeof url !== 'string') return url
  if (!url.includes('res.cloudinary.com') || !url.includes('/upload/')) return url

  const cloud = getCloudinaryCloudName(url)
  const publicId = extractCloudinaryPublicId(url)
  if (!cloud || !publicId) {
    const parts = [`c_${crop}`, `w_${width}`, height ? `h_${height}` : '', 'q_auto', 'f_auto'].filter(Boolean)
    return url.replace('/upload/', `/upload/${parts.join(',')}/`)
  }

  const transforms = [`c_${crop}`, `w_${width}`, height ? `h_${height}` : '', 'q_auto', 'f_auto']
    .filter(Boolean)
    .join(',')
  return `https://res.cloudinary.com/${cloud}/image/upload/${transforms}/${publicId}`
}
