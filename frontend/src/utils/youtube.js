/** Client-side YouTube ID parser (mirrors backend/utils/youtube.js) */
export function parseYouTubeId(input) {
  if (!input) return null
  const s = String(input).trim()
  if (/^[a-zA-Z0-9_-]{11}$/.test(s)) return s

  try {
    const u = new URL(s.startsWith('http') ? s : `https://${s}`)
    const host = u.hostname.replace(/^www\./, '')

    if (host === 'youtu.be') {
      const id = u.pathname.slice(1).split('/')[0]
      return id && id.length === 11 ? id : null
    }

    if (host === 'youtube.com' || host === 'm.youtube.com') {
      const v = u.searchParams.get('v')
      if (v && v.length === 11) return v
      const embed = u.pathname.match(/\/embed\/([a-zA-Z0-9_-]{11})/)
      if (embed) return embed[1]
      const shorts = u.pathname.match(/\/shorts\/([a-zA-Z0-9_-]{11})/)
      if (shorts) return shorts[1]
    }
  } catch {
    return null
  }

  return null
}

export function youtubeThumbnailUrl(videoId, quality = 'hqdefault') {
  if (!videoId) return ''
  return `https://i.ytimg.com/vi/${videoId}/${quality}.jpg`
}

/**
 * Build YouTube embed URL. Uses youtube.com (not nocookie) + origin — reduces
 * "请登录以确认你不是聊天机器人" on many sites vs nocookie-only embeds.
 */
export function youtubeEmbedSrc(videoId, { nocookie = false } = {}) {
  if (!videoId) return ''
  const params = new URLSearchParams({
    rel: '0',
    modestbranding: '1',
    iv_load_policy: '3',
    playsinline: '1',
    autoplay: '1',
    enablejsapi: '1',
  })

  if (typeof window !== 'undefined' && window.location?.origin) {
    params.set('origin', window.location.origin)
  }

  const host = nocookie ? 'www.youtube-nocookie.com' : 'www.youtube.com'
  return `https://${host}/embed/${videoId}?${params.toString()}`
}

export function youtubeWatchUrl(videoId) {
  if (!videoId) return ''
  return `https://www.youtube.com/watch?v=${videoId}`
}
