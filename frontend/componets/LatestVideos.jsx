import React, { useContext, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Title from './Title'
import YouTubeEmbed from './YouTubeEmbed'
import { ShopContext } from '../context/ShopContext'

const LatestVideos = () => {
  const { api } = useContext(ShopContext)
  const [videos, setVideos] = useState([])

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await api.videosAll({ limit: 3 })
        if (data?.success) setVideos(data.videos || [])
      } catch (err) {
        console.error(err)
      }
    }
    load()
  }, [api])

  if (!videos.length) return null

  const featured = videos[0]

  return (
    <section className="my-16 sm:my-20">
      <Title text1="WATCH" text2="OUR VIDEOS" />
      <p className="w-3/4 m-auto text-xs sm:text-sm md:text-base text-gray-600 mt-4 text-center">
        Product demos and factory highlights — click to play
      </p>

      <div className="mt-8 grid md:grid-cols-2 gap-6 items-start">
        <div className="cartoon-card p-4">
          <YouTubeEmbed
            youtubeId={featured.youtubeId}
            title={featured.title}
          />
          <h3 className="font-semibold text-gray-800 mt-3">{featured.title}</h3>
        </div>
        <ul className="space-y-3">
          {videos.slice(1).map((v) => (
            <li key={v._id} className="flex gap-3 p-3 cartoon-card">
              <img src={v.thumbnail} alt="" className="w-28 aspect-video object-cover rounded-lg" />
              <div>
                <p className="font-medium text-gray-800 text-sm">{v.title}</p>
                <p className="text-xs text-gray-500 mt-1 line-clamp-2">{v.description}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>

      <div className="text-center mt-8">
        <Link
          to="/videos"
          className="cartoon-btn inline-block px-8 py-3 text-white font-semibold"
        >
          View all videos
        </Link>
      </div>
    </section>
  )
}

export default LatestVideos
