import { isYouTubeSyncConfigured, syncVideosFromYouTube } from '../services/youtubeSyncService.js'

export function scheduleYouTubeSync() {
  if (process.env.YOUTUBE_SYNC_CRON !== 'true') return
  if (!isYouTubeSyncConfigured()) {
    console.warn('[YouTube sync] YOUTUBE_SYNC_CRON=true but sync is not configured (need YOUTUBE_API_KEY or YOUTUBE_CHANNEL_ID)')
    return
  }

  const intervalMs = Number(process.env.YOUTUBE_SYNC_INTERVAL_MS) || 24 * 60 * 60 * 1000

  const run = async () => {
    try {
      const result = await syncVideosFromYouTube()
      console.log('[YouTube sync]', result)
    } catch (error) {
      console.error('[YouTube sync failed]', error.message)
    }
  }

  const initialDelayMs = Number(process.env.YOUTUBE_SYNC_INITIAL_DELAY_MS) || 60_000
  setTimeout(run, initialDelayMs)
  setInterval(run, intervalMs)

  console.log(`[YouTube sync] Scheduled every ${Math.round(intervalMs / 3600000)}h (first run in ${Math.round(initialDelayMs / 1000)}s)`)
}
