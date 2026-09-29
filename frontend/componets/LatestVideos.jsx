import React, { useContext, useEffect, useState } from 'react'
import { LocaleLink } from './LocaleLink'
import Title from './Title'
import YouTubeEmbed from './YouTubeEmbed'
import { ShopContext } from '../context/ShopContext'
import { useTranslation } from 'react-i18next'

const LatestVideos = () => {
  const { api } = useContext(ShopContext)
  const { t } = useTranslation()
  const [videos, setVideos] = useState([])

  const recordView = async (videoId) => {
    try {
      await api.videosRecordView(videoId)
    } catch (err) {
      console.error(err)
    }
  }

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
      <Title text1={t('videos.watch')} text2={t('videos.ourVideos')} subtitle={t('videos.subtitle')} />

      <div className="mt-8 grid md:grid-cols-2 gap-6 items-start">
        <div className="cartoon-card p-4">
          <YouTubeEmbed
            youtubeId={featured.youtubeId}
            title={featured.title}
            onActivate={() => recordView(featured._id)}
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
        <LocaleLink to="/videos" className="corp-btn inline-flex px-8">
          {t('videos.viewAll')}
          <span aria-hidden="true">→</span>
        </LocaleLink>
      </div>
    </section>
  )
}

export default LatestVideos
