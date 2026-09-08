import https from 'https'
import http from 'http'
import videoModel from '../models/videoModel.js'
import { parseYouTubeId } from '../utils/youtube.js'
import { HttpsProxyAgent } from 'https-proxy-agent'

const DEFAULT_HANDLE = 'user-iy7wk9in6g'
const FETCH_HEADERS = {
  'User-Agent':
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Accept-Language': 'en-US,en;q=0.9',
}

let cachedChannelId = null

function getProxyUrl() {
  return (
    process.env.YOUTUBE_HTTPS_PROXY ||
    process.env.GOOGLE_HTTPS_PROXY ||
    process.env.HTTPS_PROXY ||
    process.env.HTTP_PROXY ||
    ''
  ).trim()
}

async function fetchYouTube(url) {
  const proxyUrl = getProxyUrl()

  return new Promise((resolve, reject) => {
    const parsed = new URL(url)
    const options = {
      hostname: parsed.hostname,
      path: `${parsed.pathname}${parsed.search}`,
      headers: FETCH_HEADERS,
      method: 'GET',
    }

    if (proxyUrl) {
      options.agent = new HttpsProxyAgent(proxyUrl)
    }

    const lib = parsed.protocol === 'https:' ? https : http
    const req = lib.request(options, (res) => {
      const chunks = []
      res.on('data', (chunk) => chunks.push(chunk))
      res.on('end', () => {
        const body = Buffer.concat(chunks).toString('utf8')
        resolve({
          ok: res.statusCode >= 200 && res.statusCode < 300,
          status: res.statusCode,
          text: async () => body,
        })
      })
    })

    req.on('error', reject)
    req.setTimeout(20000, () => req.destroy(new Error('YouTube request timed out')))
    req.end()
  })
}

function getApiKey() {
  return process.env.YOUTUBE_API_KEY?.trim() || ''
}

function getChannelIdEnv() {
  return process.env.YOUTUBE_CHANNEL_ID?.trim() || ''
}

function getChannelHandle() {
  const raw = process.env.YOUTUBE_CHANNEL_HANDLE?.trim() || DEFAULT_HANDLE
  return raw.replace(/^@/, '')
}

function unescapeJsonString(value) {
  if (!value) return ''
  return value
    .replace(/\\"/g, '"')
    .replace(/\\\\/g, '\\')
    .replace(/\\n/g, '\n')
    .replace(/\\u([\dA-Fa-f]{4})/g, (_, hex) => String.fromCharCode(parseInt(hex, 16)))
}

function buildYoutubeUrl(youtubeId, { isShort = false } = {}) {
  if (isShort) return `https://www.youtube.com/shorts/${youtubeId}`
  return `https://www.youtube.com/watch?v=${youtubeId}`
}

function detectShortFromChunk(chunk, title) {
  return (
    /#shorts/i.test(title) ||
    chunk.includes('"url":"/shorts/') ||
    chunk.includes('"webPageType":"WEB_PAGE_TYPE_SHORTS"') ||
    chunk.includes('"isShort":true') ||
    /\/shorts\//.test(chunk)
  )
}

function isPlaceholderTitle(title) {
  const value = (title || '').trim()
  return !value || value === 'Untitled video' || value === 'Private video' || value === 'Deleted video'
}

function sortVideosByPublishedAt(videos) {
  return [...videos].sort((a, b) => {
    const ta = a.publishedAt?.getTime()
    const tb = b.publishedAt?.getTime()
    if (ta && tb) return tb - ta
    if (ta) return -1
    if (tb) return 1
    return 0
  })
}

async function fetchOEmbedMetadata(youtubeId, { isShort = false } = {}) {
  const pageUrl = isShort
    ? `https://www.youtube.com/shorts/${youtubeId}`
    : `https://www.youtube.com/watch?v=${youtubeId}`
  const url = `https://www.youtube.com/oembed?url=${encodeURIComponent(pageUrl)}&format=json`

  try {
    const response = await fetchYouTube(url)
    if (!response.ok) return null
    const data = JSON.parse(await response.text())
    const title = data.title?.trim()
    if (isPlaceholderTitle(title)) return null
    return { title }
  } catch {
    return null
  }
}

async function fetchWatchPageTitle(youtubeId) {
  try {
    const response = await fetchYouTube(`https://www.youtube.com/watch?v=${youtubeId}`)
    if (!response.ok) return null
    const html = await response.text()
    const ogTitle =
      html.match(/<meta property="og:title" content="([^"]+)"/)?.[1] ||
      html.match(/<meta name="title" content="([^"]+)"/)?.[1]
    const title = ogTitle?.replace(/\s*-\s*YouTube\s*$/i, '').trim()
    return isPlaceholderTitle(title) ? null : title
  } catch {
    return null
  }
}

function extractTitleNearVideoId(html, youtubeId) {
  const marker = `"videoId":"${youtubeId}"`
  const index = html.indexOf(marker)
  if (index === -1) return ''

  const window = html.slice(Math.max(0, index - 2500), index + 800)
  const patterns = [
    /"title":\{"simpleText":"((?:\\.|[^"\\])*)"/g,
    /"title":\{"runs":\[\{"text":"((?:\\.|[^"\\])*)"/g,
    /"headline":\{"simpleText":"((?:\\.|[^"\\])*)"/g,
    /"accessibility":\{"label":"((?:\\.|[^"\\])*)"/g,
  ]

  let best = ''
  for (const pattern of patterns) {
    let match
    while ((match = pattern.exec(window)) !== null) {
      const candidate = unescapeJsonString(match[1])
      if (!isPlaceholderTitle(candidate) && candidate.length > best.length) {
        best = candidate
      }
    }
  }

  return best
}

async function loadRssMetadataMap(channelId) {
  const map = new Map()
  try {
    const rssVideos = await fetchVideosViaRss(channelId)
    for (const video of rssVideos) {
      map.set(video.youtubeId, video)
    }
  } catch {
    // RSS is optional enrichment
  }
  return map
}

async function enrichVideoMetadata(video, rssMap) {
  const rss = rssMap.get(video.youtubeId)
  if (rss) {
    if (!isPlaceholderTitle(rss.title)) video.title = rss.title
    if (rss.description) video.description = rss.description
    if (rss.publishedAt) video.publishedAt = rss.publishedAt
    if (rss.isShort) video.isShort = true
  }

  if (isPlaceholderTitle(video.title)) {
    const fromPage = extractTitleNearVideoId(video._html || '', video.youtubeId)
    if (!isPlaceholderTitle(fromPage)) video.title = fromPage
  }

  if (isPlaceholderTitle(video.title)) {
    const oembed = await fetchOEmbedMetadata(video.youtubeId, { isShort: video.isShort })
    if (oembed?.title) video.title = oembed.title
  }

  if (isPlaceholderTitle(video.title)) {
    const watchTitle = await fetchWatchPageTitle(video.youtubeId)
    if (watchTitle) video.title = watchTitle
  }

  if (isPlaceholderTitle(video.title)) {
    video.title = 'Untitled video'
  }

  delete video._html
  return video
}

async function enrichVideosMetadata(videos, html) {
  let channelId = getChannelIdEnv()
  if (!channelId) {
    try {
      channelId = await resolveChannelId()
    } catch {
      channelId = null
    }
  }

  const rssMap = channelId ? await loadRssMetadataMap(channelId) : new Map()
  const enriched = []

  for (const video of videos) {
    enriched.push(await enrichVideoMetadata({ ...video, _html: html }, rssMap))
  }

  return enriched
}

function collectVideosFromHtml(html, { shortsTab = false } = {}) {
  const videos = []
  const seen = new Set()

  for (const chunk of html.split('"videoId":"').slice(1)) {
    const youtubeId = chunk.slice(0, 11)
    if (!/^[a-zA-Z0-9_-]{11}$/.test(youtubeId) || seen.has(youtubeId)) continue

    const title = extractTitleNearVideoId(html, youtubeId)
    const isShort = shortsTab || detectShortFromChunk(chunk, title)
    seen.add(youtubeId)

    videos.push({
      youtubeId,
      title: isPlaceholderTitle(title) ? 'Untitled video' : title,
      description: '',
      youtubeUrl: buildYoutubeUrl(youtubeId, { isShort }),
      publishedAt: null,
      isShort,
    })
  }

  return videos
}

async function fetchChannelTabVideos(handle, tab) {
  const suffix = tab ? `/${tab}` : ''
  const response = await fetchYouTube(`https://www.youtube.com/@${handle}${suffix}`)
  if (!response.ok) return { html: '', videos: [] }
  const html = await response.text()
  return { html, videos: collectVideosFromHtml(html, { shortsTab: tab === 'shorts' }) }
}

async function resolveChannelId() {
  if (cachedChannelId) return cachedChannelId

  const envId = getChannelIdEnv()
  if (envId) {
    cachedChannelId = envId
    return envId
  }

  const handle = getChannelHandle()
  const response = await fetchYouTube(`https://www.youtube.com/@${handle}`)
  if (!response.ok) {
    throw new Error(`Could not load YouTube channel @${handle} (${response.status})`)
  }

  const html = await response.text()
  const channelId =
    html.match(/"channelId":"(UC[\w-]{22})"/)?.[1] ||
    html.match(/"externalId":"(UC[\w-]{22})"/)?.[1]

  if (!channelId) {
    throw new Error(`Could not resolve channel ID for @${handle}. Set YOUTUBE_CHANNEL_ID in backend/.env`)
  }

  cachedChannelId = channelId
  return channelId
}

async function youtubeApiGet(path, params = {}) {
  const apiKey = getApiKey()
  if (!apiKey) {
    throw new Error('YOUTUBE_API_KEY is not configured')
  }

  const url = new URL(`https://www.googleapis.com/youtube/v3/${path}`)
  url.searchParams.set('key', apiKey)
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== '') {
      url.searchParams.set(key, String(value))
    }
  }

  const response = await fetch(url)
  const data = await response.json()

  if (!response.ok) {
    const message = data?.error?.message || response.statusText
    throw new Error(`YouTube API error: ${message}`)
  }

  return data
}

async function resolveUploadsPlaylistId() {
  const channelId = getChannelIdEnv()

  const data = channelId
    ? await youtubeApiGet('channels', { part: 'contentDetails', id: channelId })
    : await youtubeApiGet('channels', {
        part: 'contentDetails',
        forHandle: getChannelHandle(),
      })

  const channel = data.items?.[0]
  const uploadsPlaylistId = channel?.contentDetails?.relatedPlaylists?.uploads

  if (!uploadsPlaylistId) {
    throw new Error(
      channelId
        ? `YouTube channel not found for ID "${channelId}"`
        : `YouTube channel not found for handle "@${getChannelHandle()}"`
    )
  }

  return uploadsPlaylistId
}

async function fetchVideosViaApi() {
  const uploadsPlaylistId = await resolveUploadsPlaylistId()
  const videos = []
  let pageToken

  do {
    const params = {
      part: 'snippet',
      playlistId: uploadsPlaylistId,
      maxResults: 50,
    }
    if (pageToken) params.pageToken = pageToken

    const data = await youtubeApiGet('playlistItems', params)

    for (const item of data.items || []) {
      const snippet = item.snippet
      const youtubeId = snippet?.resourceId?.videoId
      if (!youtubeId || snippet?.resourceId?.kind !== 'youtube#video') continue

      const title = (snippet.title || '').trim() || 'Untitled video'
      const isShort = /#shorts/i.test(title)

      videos.push({
        youtubeId,
        title,
        description: (snippet.description || '').trim(),
        youtubeUrl: buildYoutubeUrl(youtubeId, { isShort }),
        publishedAt: snippet.publishedAt ? new Date(snippet.publishedAt) : null,
        isShort,
      })
    }

    pageToken = data.nextPageToken
  } while (pageToken)

  return videos
}

function decodeXmlText(value) {
  if (!value) return ''
  return value
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .trim()
}

function extractTag(block, tag) {
  const match = block.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, 'i'))
  return decodeXmlText(match?.[1])
}

async function fetchVideosViaRss(channelId) {
  const response = await fetchYouTube(`https://www.youtube.com/feeds/videos.xml?channel_id=${channelId}`)
  if (!response.ok) {
    throw new Error(`YouTube RSS fetch failed (${response.status})`)
  }

  const xml = await response.text()
  const entries = xml.split('<entry>').slice(1)
  const videos = []

  for (const entry of entries) {
    const block = entry.split('</entry>')[0] || entry
    const youtubeId = extractTag(block, 'yt:videoId') || extractTag(block, 'id').split(':').pop()
    if (!youtubeId || youtubeId.length !== 11) continue

    const title = extractTag(block, 'title') || 'Untitled video'
    const description = extractTag(block, 'media:description')
    const publishedRaw = extractTag(block, 'published')
    const publishedAt = publishedRaw ? new Date(publishedRaw) : null
    const isShort = /#shorts/i.test(title)

    videos.push({
      youtubeId,
      title,
      description,
      youtubeUrl: buildYoutubeUrl(youtubeId, { isShort }),
      publishedAt: Number.isNaN(publishedAt?.getTime()) ? null : publishedAt,
      isShort,
    })
  }

  return videos
}

async function fetchVideosViaChannelPage() {
  const handle = getChannelHandle()
  const [videosTab, shortsTab] = await Promise.all([
    fetchChannelTabVideos(handle, 'videos'),
    fetchChannelTabVideos(handle, 'shorts'),
  ])

  const mergedHtml = `${videosTab.html}\n${shortsTab.html}`
  const byId = new Map()

  for (const video of [...videosTab.videos, ...shortsTab.videos]) {
    const existing = byId.get(video.youtubeId)
    if (!existing) {
      byId.set(video.youtubeId, video)
      continue
    }
    if (video.isShort) existing.isShort = true
    if (video.isShort) existing.youtubeUrl = buildYoutubeUrl(video.youtubeId, { isShort: true })
    if (isPlaceholderTitle(existing.title) && !isPlaceholderTitle(video.title)) {
      existing.title = video.title
    }
  }

  let videos = [...byId.values()]

  if (videos.length === 0) {
    const channelId = await resolveChannelId()
    return fetchVideosViaRss(channelId)
  }

  videos = await enrichVideosMetadata(videos, mergedHtml)
  return sortVideosByPublishedAt(videos)
}

export async function fetchPublicChannelVideos() {
  if (getApiKey()) {
    return fetchVideosViaApi()
  }
  return fetchVideosViaChannelPage()
}

export async function syncVideosFromYouTube() {
  const remoteVideos = sortVideosByPublishedAt(await fetchPublicChannelVideos())
  const now = new Date()

  let created = 0
  let updated = 0
  let skippedManual = 0
  let shortsCount = 0

  for (let i = 0; i < remoteVideos.length; i++) {
    const remote = remoteVideos[i]
    const youtubeId = parseYouTubeId(remote.youtubeId)
    if (!youtubeId) continue
    if (remote.isShort) shortsCount += 1

    const existing = await videoModel.findOne({ youtubeId })

    if (existing) {
      if (existing.source !== 'youtube') {
        skippedManual += 1
        continue
      }

      existing.title = isPlaceholderTitle(remote.title) ? existing.title : remote.title
      if (remote.description) existing.description = remote.description
      existing.youtubeUrl = remote.youtubeUrl
      existing.youtubeId = youtubeId
      existing.youtubePublishedAt = remote.publishedAt
      existing.order = i
      existing.lastSyncedAt = now
      await existing.save()
      updated += 1
      continue
    }

    await videoModel.create({
      title: remote.title,
      description: remote.description,
      youtubeUrl: remote.youtubeUrl,
      youtubeId,
      category: remote.isShort ? 'product-demo' : 'other',
      order: i,
      isPublished: true,
      source: 'youtube',
      youtubePublishedAt: remote.publishedAt,
      lastSyncedAt: now,
    })
    created += 1
  }

  return {
    created,
    updated,
    skippedManual,
    shortsCount,
    totalRemote: remoteVideos.length,
    syncedAt: now.toISOString(),
    channel: `@${getChannelHandle()}`,
    method: getApiKey() ? 'youtube_api' : 'channel_page',
  }
}

export function isYouTubeSyncConfigured() {
  return true
}

export async function getYouTubeSyncConfigStatus() {
  let resolvedChannelId = getChannelIdEnv() || null
  try {
    if (!resolvedChannelId) resolvedChannelId = await resolveChannelId()
  } catch {
    resolvedChannelId = null
  }

  return {
    configured: true,
    hasApiKey: Boolean(getApiKey()),
    channelHandle: getChannelHandle(),
    channelId: resolvedChannelId,
    method: getApiKey() ? 'youtube_api' : 'channel_page',
    note: getApiKey()
      ? 'Full sync via YouTube Data API (includes Shorts in uploads).'
      : 'No API key: syncs titles via RSS + oEmbed (Shorts included). Unlisted Shorts must be added manually.',
  }
}
