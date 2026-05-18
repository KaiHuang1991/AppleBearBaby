import React, { useState } from 'react'
import { parseYouTubeId, youtubeEmbedSrc, youtubeThumbnailUrl, youtubeWatchUrl } from '../src/utils/youtube'
import './YouTubeEmbed.css'

/**
 * Lightweight YouTube embed (similar goals to Next.js @next/third-parties YouTubeEmbed).
 * - Lazy-loads iframe only after click (fast initial page load)
 * - Uses youtube-nocookie.com with rel=0 & modestbranding=1
 */
const YouTubeEmbed = ({ youtubeUrl, youtubeId, title = 'YouTube video', className = '' }) => {
  const id = youtubeId || parseYouTubeId(youtubeUrl)
  const [activated, setActivated] = useState(false)

  if (!id) {
    return (
      <div className={`youtube-embed flex items-center justify-center text-sm text-gray-500 ${className}`}>
        Invalid YouTube link
      </div>
    )
  }

  const poster = youtubeThumbnailUrl(id, 'maxresdefault')
  const posterFallback = youtubeThumbnailUrl(id, 'hqdefault')

  const watchUrl = youtubeWatchUrl(id)

  return (
    <div className={`youtube-embed ${className}`.trim()}>
      {activated ? (
        <>
          <iframe
            className="youtube-embed__iframe"
            src={youtubeEmbedSrc(id)}
            title={title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            loading="lazy"
            referrerPolicy="strict-origin-when-cross-origin"
          />
          <p className="mt-2 text-center text-xs text-gray-500">
            若提示需要登录 YouTube，请先在浏览器登录 Google 账号，或{' '}
            <a
              href={watchUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
            >
              在 YouTube 打开此视频
            </a>
          </p>
        </>
      ) : (
        <button
          type="button"
          className="youtube-embed__poster"
          onClick={() => setActivated(true)}
          aria-label={`Play video: ${title}`}
        >
          <img
            src={poster}
            alt=""
            onError={(e) => {
              if (e.currentTarget.src !== posterFallback) e.currentTarget.src = posterFallback
            }}
          />
          <span className="youtube-embed__play" aria-hidden="true" />
        </button>
      )}
    </div>
  )
}

export default YouTubeEmbed
