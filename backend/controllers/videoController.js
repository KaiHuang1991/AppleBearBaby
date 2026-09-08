import videoModel from '../models/videoModel.js'
import { parseYouTubeId, youtubeThumbnailUrl } from '../utils/youtube.js'
import { getYouTubeSyncConfigStatus, syncVideosFromYouTube } from '../services/youtubeSyncService.js'

function normalizeVideoPayload(body, existing) {
  const title = body.title !== undefined ? String(body.title).trim() : existing?.title
  const description =
    body.description !== undefined ? String(body.description).trim() : existing?.description ?? ''

  let youtubeId = existing?.youtubeId
  if (body.youtubeUrl !== undefined || body.youtubeId !== undefined) {
    const raw = body.youtubeUrl ?? body.youtubeId ?? ''
    youtubeId = parseYouTubeId(raw)
    if (!youtubeId) {
      return { error: 'Invalid YouTube URL or video ID' }
    }
  }

  if (!title) {
    return { error: 'Title is required' }
  }

  const payload = {
    title,
    description,
    youtubeId,
    youtubeUrl: body.youtubeUrl !== undefined ? String(body.youtubeUrl).trim() : existing?.youtubeUrl,
    category: body.category ?? existing?.category ?? 'product-demo',
    order: body.order !== undefined ? Number(body.order) : existing?.order ?? 0,
    isPublished:
      body.isPublished !== undefined
        ? body.isPublished === true || body.isPublished === 'true'
        : existing?.isPublished ?? true,
  }

  if (body.productId === '' || body.productId === null) {
    payload.productId = null
  } else if (body.productId !== undefined) {
    payload.productId = body.productId
  }

  return { payload }
}

export const getAllVideos = async (req, res) => {
  try {
    const { category, search, page = 1, limit = 12, productId } = req.query
    const query = { isPublished: true }

    if (category) query.category = category
    if (productId) query.productId = productId

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ]
    }

    const skip = (Number(page) - 1) * Number(limit)
    const videos = await videoModel
      .find(query)
      .sort({ order: 1, youtubePublishedAt: -1, createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit, 10))
      .populate('productId', 'name slug')
      .lean()

    const enriched = videos.map((v) => ({
      ...v,
      thumbnail: youtubeThumbnailUrl(v.youtubeId),
    }))

    const total = await videoModel.countDocuments(query)

    res.json({
      success: true,
      videos: enriched,
      total,
      currentPage: parseInt(page, 10),
      totalPages: Math.ceil(total / limit),
    })
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching videos', error: error.message })
  }
}

export const getAllVideosAdmin = async (req, res) => {
  try {
    const videos = await videoModel.find().sort({ order: 1, youtubePublishedAt: -1, createdAt: -1 }).lean()
    res.json({
      success: true,
      videos: videos.map((v) => ({ ...v, thumbnail: youtubeThumbnailUrl(v.youtubeId) })),
    })
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching videos', error: error.message })
  }
}

export const getVideoById = async (req, res) => {
  try {
    const video = await videoModel.findById(req.params.id).populate('productId', 'name')
    if (!video || !video.isPublished) {
      return res.status(404).json({ success: false, message: 'Video not found' })
    }

    const obj = video.toObject()
    obj.thumbnail = youtubeThumbnailUrl(obj.youtubeId)

    res.json({ success: true, video: obj })
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching video', error: error.message })
  }
}

export const recordVideoView = async (req, res) => {
  try {
    const video = await videoModel
      .findOneAndUpdate(
        { _id: req.params.id, isPublished: true },
        { $inc: { views: 1 } },
        { new: true }
      )
      .select('views')

    if (!video) {
      return res.status(404).json({ success: false, message: 'Video not found' })
    }

    res.json({ success: true, views: video.views })
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error recording view', error: error.message })
  }
}

export const getVideosByProduct = async (req, res) => {
  try {
    const videos = await videoModel
      .find({ productId: req.params.productId, isPublished: true })
      .sort({ order: 1, youtubePublishedAt: -1, createdAt: -1 })
      .lean()

    res.json({
      success: true,
      videos: videos.map((v) => ({ ...v, thumbnail: youtubeThumbnailUrl(v.youtubeId) })),
    })
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching product videos', error: error.message })
  }
}

export const createVideo = async (req, res) => {
  try {
    const normalized = normalizeVideoPayload(req.body)
    if (normalized.error) {
      return res.status(400).json({ success: false, message: normalized.error })
    }

    const id = normalized.payload.youtubeId
    const video = new videoModel({
      ...normalized.payload,
      source: 'manual',
      youtubeUrl: String(req.body.youtubeUrl || '').trim() || `https://www.youtube.com/watch?v=${id}`,
    })
    await video.save()

    res.status(201).json({ success: true, message: 'Video created', video })
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error creating video', error: error.message })
  }
}

export const updateVideo = async (req, res) => {
  try {
    const video = await videoModel.findById(req.params.id)
    if (!video) {
      return res.status(404).json({ success: false, message: 'Video not found' })
    }

    const normalized = normalizeVideoPayload(req.body, video)
    if (normalized.error) {
      return res.status(400).json({ success: false, message: normalized.error })
    }

    Object.assign(video, normalized.payload)
    if (req.body.youtubeUrl !== undefined) {
      video.youtubeUrl = String(req.body.youtubeUrl).trim()
    }
    await video.save()

    res.json({ success: true, message: 'Video updated', video })
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error updating video', error: error.message })
  }
}

export const deleteVideo = async (req, res) => {
  try {
    const video = await videoModel.findByIdAndDelete(req.params.id)
    if (!video) {
      return res.status(404).json({ success: false, message: 'Video not found' })
    }
    res.json({ success: true, message: 'Video deleted' })
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error deleting video', error: error.message })
  }
}

export const getYouTubeSyncStatus = async (req, res) => {
  try {
    const lastSynced = await videoModel
      .findOne({ source: 'youtube', lastSyncedAt: { $ne: null } })
      .sort({ lastSyncedAt: -1 })
      .select('lastSyncedAt')
      .lean()

    const config = await getYouTubeSyncConfigStatus()

    res.json({
      success: true,
      ...config,
      cronEnabled: process.env.YOUTUBE_SYNC_CRON === 'true',
      lastSyncedAt: lastSynced?.lastSyncedAt || null,
    })
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error reading sync status', error: error.message })
  }
}

export const syncYouTubeVideos = async (req, res) => {
  try {
    const result = await syncVideosFromYouTube()
    res.json({
      success: true,
      message: `Sync complete: ${result.created} new, ${result.updated} updated, ${result.shortsCount} Shorts, ${result.skippedManual} manual entries unchanged`,
      ...result,
    })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || 'YouTube sync failed' })
  }
}
