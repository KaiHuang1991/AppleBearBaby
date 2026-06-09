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
    <section className="my-14 md:my-20">
      <Title text1="Watch" text2="Our Videos" subtitle="Product demos and factory highlights — click to play." />

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
        <Link to="/videos" className="corp-btn inline-flex px-8">
          View all videos
          <span aria-hidden="true">→</span>
        </Link>
      </div>
    </section>
  )
}

export default LatestVideos
