import React, { useContext, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Title from '../componets/Title'
import YouTubeEmbed from '../componets/YouTubeEmbed'
import { ShopContext } from '../context/ShopContext'

const CATEGORY_LABELS = {
  'product-demo': 'Product demo',
  factory: 'Factory',
  tutorial: 'Tutorial',
  wholesale: 'Wholesale',
  other: 'Other',
}

const Videos = () => {
  const { api } = useContext(ShopContext)
  const [videos, setVideos] = useState([])
  const [loading, setLoading] = useState(true)
  const [category, setCategory] = useState('')
  const [activeVideo, setActiveVideo] = useState(null)

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        const params = { limit: 24 }
        if (category) params.category = category
        const { data } = await api.videosAll(params)
        if (data?.success) {
          const list = data.videos || []
          setVideos(list)
          setActiveVideo(list[0] || null)
        }
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [api, category])

  return (
    <div className="pt-28 pb-16 px-4 sm:px-0 min-h-screen">
      <div className="text-center mb-10">
        <Title text1="PRODUCT" text2="VIDEOS" />
        <p className="max-w-2xl mx-auto text-gray-600 text-sm sm:text-base mt-4">
          Factory tours, product demos, and how-to guides — hosted on YouTube (unlisted) and embedded here for fast
          loading on applebearbaby.net.
        </p>
      </div>

      <div className="flex flex-wrap justify-center gap-2 mb-8">
        <button
          type="button"
          onClick={() => setCategory('')}
          className={`px-4 py-2 rounded-full text-sm border transition-colors ${!category ? 'bg-blue-600 text-white border-blue-600' : 'border-gray-300 text-gray-600 hover:border-blue-400'}`}
        >
          All
        </button>
        {Object.entries(CATEGORY_LABELS).map(([value, label]) => (
          <button
            key={value}
            type="button"
            onClick={() => setCategory(value)}
            className={`px-4 py-2 rounded-full text-sm border transition-colors ${category === value ? 'bg-blue-600 text-white border-blue-600' : 'border-gray-300 text-gray-600 hover:border-blue-400'}`}
          >
            {label}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="text-center text-gray-500">Loading videos…</p>
      ) : videos.length === 0 ? (
        <p className="text-center text-gray-500">No videos published yet.</p>
      ) : (
        <div className="grid lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <div className="lg:col-span-2">
            {activeVideo ? (
              <div className="cartoon-card p-4 sm:p-6">
                <YouTubeEmbed
                  youtubeId={activeVideo.youtubeId}
                  youtubeUrl={activeVideo.youtubeUrl}
                  title={activeVideo.title}
                />
                <h2 className="text-xl font-semibold text-gray-800 mt-4">{activeVideo.title}</h2>
                {activeVideo.description ? (
                  <p className="text-gray-600 mt-2 text-sm leading-relaxed">{activeVideo.description}</p>
                ) : null}
                {activeVideo.productId?._id || activeVideo.productId ? (
                  <Link
                    to={`/product/${activeVideo.productId?._id || activeVideo.productId}`}
                    className="inline-block mt-4 text-blue-600 text-sm font-medium hover:underline"
                  >
                    View related product →
                  </Link>
                ) : null}
              </div>
            ) : null}
          </div>

          <ul className="space-y-3">
            {videos.map((video) => (
              <li key={video._id}>
                <button
                  type="button"
                  onClick={() => setActiveVideo(video)}
                  className={`w-full flex gap-3 p-3 rounded-xl border text-left transition-all ${
                    activeVideo?._id === video._id
                      ? 'border-blue-500 bg-blue-50 shadow-sm'
                      : 'border-gray-200 bg-white hover:border-blue-300'
                  }`}
                >
                  <img
                    src={video.thumbnail}
                    alt=""
                    className="w-24 aspect-video object-cover rounded-lg shrink-0"
                  />
                  <div className="min-w-0">
                    <p className="font-medium text-gray-800 text-sm line-clamp-2">{video.title}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {CATEGORY_LABELS[video.category] || video.category}
                    </p>
                  </div>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

export default Videos
