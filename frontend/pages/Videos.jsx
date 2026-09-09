import React, { useContext, useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import YouTubeEmbed from '../componets/YouTubeEmbed'
import { ShopContext } from '../context/ShopContext'
import { getProductPath } from '../src/utils/productPath'

const CATEGORY_LABELS = {
  'product-demo': 'Product demo',
  factory: 'Factory',
  tutorial: 'Tutorial',
  wholesale: 'Wholesale',
  other: 'Other',
}

const SIDEBAR_ITEMS = [
  { value: '', label: 'Home', icon: 'home' },
  { value: 'product-demo', label: 'Product demo', icon: 'play' },
  { value: 'factory', label: 'Factory', icon: 'factory' },
  { value: 'tutorial', label: 'Tutorial', icon: 'tutorial' },
  { value: 'wholesale', label: 'Wholesale', icon: 'wholesale' },
  { value: 'other', label: 'Other', icon: 'other' },
]

const CHANNEL_NAME = 'Applebear Baby'
const CHANNEL_AVATAR =
  'https://res.cloudinary.com/dzskx10vu/image/upload/v1763529649/logo_mrflxn.png'

const VIDEOS_PER_PAGE = 12

function formatViews(count) {
  if (!count) return '0 views'
  if (count >= 1_000_000) return `${(count / 1_000_000).toFixed(1).replace(/\.0$/, '')}M views`
  if (count >= 1_000) return `${(count / 1_000).toFixed(1).replace(/\.0$/, '')}K views`
  return `${count} views`
}

function formatRelativeTime(dateString) {
  if (!dateString) return ''
  const diffMs = Date.now() - new Date(dateString).getTime()
  const minutes = Math.floor(diffMs / 60_000)
  if (minutes < 60) return `${Math.max(1, minutes)} minutes ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours} hour${hours === 1 ? '' : 's'} ago`
  const days = Math.floor(hours / 24)
  if (days < 30) return `${days} day${days === 1 ? '' : 's'} ago`
  const months = Math.floor(days / 30)
  if (months < 12) return `${months} month${months === 1 ? '' : 's'} ago`
  const years = Math.floor(months / 12)
  return `${years} year${years === 1 ? '' : 's'} ago`
}

function SidebarIcon({ type }) {
  const common = 'w-5 h-5 shrink-0'
  switch (type) {
    case 'home':
      return (
        <svg className={common} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
        </svg>
      )
    case 'play':
      return (
        <svg className={common} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M8 5v14l11-7z" />
        </svg>
      )
    case 'factory':
      return (
        <svg className={common} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M22 21H2V3h2v12h2V7h4v8h2V11h4v10h2V15h2v6z" />
        </svg>
      )
    case 'tutorial':
      return (
        <svg className={common} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M12 3L1 9l4 2.18v6L12 21l7-3.82v-6L21 9 12 3zm6.82 6L12 12.72 5.18 9 12 5.28 18.82 9zM17 15.99l-5 2.73-5-2.73v-3.72L12 15l5-2.73v3.72z" />
        </svg>
      )
    case 'wholesale':
      return (
        <svg className={common} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M7 18c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2zM1 2v2h2l3.6 7.59-1.35 2.45c-.16.28-.25.61-.25.96 0 1.1.9 2 2 2h12v-2H7.42c-.14 0-.25-.11-.25-.25l.03-.12.9-1.63h7.45c.75 0 1.41-.41 1.75-1.03l3.58-6.49A1.003 1.003 0 0020 4H5.21l-.94-2H1zm16 16c-1.1 0-1.99.9-1.99 2s.89 2 1.99 2 2-.9 2-2-.9-2-2-2z" />
        </svg>
      )
    default:
      return (
        <svg className={common} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M4 6H2v14c0 1.1.9 2 2 2h14v-2H4V6zm16-4H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H8V4h12v12z" />
        </svg>
      )
  }
}

const Videos = () => {
  const { api } = useContext(ShopContext)
  const [videos, setVideos] = useState([])
  const [loading, setLoading] = useState(true)
  const [category, setCategory] = useState('')
  const [activeVideo, setActiveVideo] = useState(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [query, setQuery] = useState('')
  const [submittedQuery, setSubmittedQuery] = useState('')
  const [searchTitle, setSearchTitle] = useState(true)
  const [searchModel, setSearchModel] = useState(false)
  const [filtersOpen, setFiltersOpen] = useState(false)
  const filterRef = useRef(null)

  const searchIn = useMemo(() => {
    const fields = []
    if (searchTitle) fields.push('title')
    if (searchModel) fields.push('model')
    return fields.join(',') || 'title'
  }, [searchTitle, searchModel])

  const searchModeLabel = searchTitle && searchModel
    ? 'Title & model'
    : searchModel
      ? 'Product model'
      : 'Title'

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setSubmittedQuery(query.trim())
    }, 400)
    return () => window.clearTimeout(timer)
  }, [query])

  useEffect(() => {
    setCurrentPage(1)
  }, [category, submittedQuery, searchIn])

  useEffect(() => {
    if (!filtersOpen) return undefined
    const onPointerDown = (event) => {
      if (!filterRef.current?.contains(event.target)) setFiltersOpen(false)
    }
    document.addEventListener('mousedown', onPointerDown)
    return () => document.removeEventListener('mousedown', onPointerDown)
  }, [filtersOpen])

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        const params = { page: currentPage, limit: VIDEOS_PER_PAGE }
        if (category) params.category = category
        if (submittedQuery) {
          params.search = submittedQuery
          params.searchIn = searchIn
        }
        const { data } = await api.videosAll(params)
        if (data?.success) {
          setVideos(data.videos || [])
          setTotalPages(data.totalPages || 1)
        }
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [api, category, currentPage, submittedQuery, searchIn])

  useEffect(() => {
    if (!activeVideo) return undefined
    const onKeyDown = (event) => {
      if (event.key === 'Escape') setActiveVideo(null)
    }
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', onKeyDown)
    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [activeVideo])

  const toggleSearchField = (field) => {
    if (field === 'title') {
      if (searchTitle && !searchModel) return
      setSearchTitle((current) => !current)
      return
    }
    if (searchModel && !searchTitle) return
    setSearchModel((current) => !current)
  }

  const selectCategory = (value) => {
    setCategory(value)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const openVideo = async (video) => {
    setActiveVideo(video)
    try {
      const { data } = await api.videosRecordView(video._id)
      if (data?.success) {
        setActiveVideo((current) =>
          current?._id === video._id ? { ...current, views: data.views } : current
        )
        setVideos((prev) =>
          prev.map((item) => (item._id === video._id ? { ...item, views: data.views } : item))
        )
      }
    } catch (err) {
      console.error(err)
    }
  }

  const contentTop = 'calc(var(--navbar-height, 5.25rem) + 2rem)'

  return (
    <div
      className="videos-page bg-white min-h-screen"
      style={{ paddingTop: contentTop }}
    >
      <div className="flex max-w-[100vw]">
        <aside
          className="hidden lg:block w-[15rem] xl:w-[15.5rem] shrink-0 sticky overflow-y-auto py-3 px-3"
          style={{
            top: contentTop,
            height: 'calc(100vh - var(--navbar-height, 5.25rem) - 2rem)',
          }}
          aria-label="Video categories"
        >
          <nav className="flex flex-col gap-0.5">
            {SIDEBAR_ITEMS.map((item) => {
              const active = category === item.value
              return (
                <button
                  key={item.value || 'all'}
                  type="button"
                  onClick={() => selectCategory(item.value)}
                  className={`flex items-center gap-5 w-full px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                    active
                      ? 'bg-[#f2f2f2] text-[#0f0f0f]'
                      : 'text-[#0f0f0f] hover:bg-[#f2f2f2]'
                  }`}
                >
                  <SidebarIcon type={item.icon} />
                  <span>{item.label}</span>
                </button>
              )
            })}
          </nav>

          <hr className="my-3 border-[#e5e5e5]" />

          <div className="px-3 py-1">
            <p className="text-base font-semibold text-[#0f0f0f] mb-2">Explore</p>
            <div className="flex flex-col gap-1 text-sm">
              <Link to="/collection" className="py-2 px-0 text-[#606060] hover:text-[#0f0f0f] transition-colors">
                Wholesale catalog
              </Link>
              <Link to="/about" className="py-2 px-0 text-[#606060] hover:text-[#0f0f0f] transition-colors">
                About us
              </Link>
              <Link to="/contact" className="py-2 px-0 text-[#606060] hover:text-[#0f0f0f] transition-colors">
                Contact
              </Link>
            </div>
          </div>
        </aside>

        <main className="flex-1 min-w-0">
          <nav className="lg:hidden px-4 pb-4 flex flex-col gap-0.5 border-b border-[#e5e5e5] mb-4" aria-label="Video categories">
            {SIDEBAR_ITEMS.map((item) => {
              const active = category === item.value
              return (
                <button
                  key={`mobile-${item.value || 'all'}`}
                  type="button"
                  onClick={() => selectCategory(item.value)}
                  className={`flex items-center gap-4 w-full px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                    active
                      ? 'bg-[#f2f2f2] text-[#0f0f0f]'
                      : 'text-[#0f0f0f] hover:bg-[#f2f2f2]'
                  }`}
                >
                  <SidebarIcon type={item.icon} />
                  <span>{item.label}</span>
                </button>
              )
            })}
          </nav>

          <div className="px-4 py-4 sm:py-6">
            <form
              className="flex flex-col sm:flex-row gap-2 sm:items-center mb-6"
              onSubmit={(event) => {
                event.preventDefault()
                setSubmittedQuery(query.trim())
              }}
            >
              <label className="relative flex-1 min-w-0">
                <span className="sr-only">Search videos</span>
                <input
                  type="search"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder={searchModel && !searchTitle ? 'Search by product model' : 'Search videos'}
                  className="w-full h-11 rounded-full border border-[#ccc] bg-[#f8f8f8] pl-4 pr-12 text-sm text-[#0f0f0f] placeholder:text-[#909090] outline-none focus:border-[#1c62b9] focus:bg-white"
                />
                <button
                  type="submit"
                  className="absolute right-1.5 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full text-[#0f0f0f] hover:bg-[#e5e5e5] transition-colors"
                  aria-label="Search"
                >
                  <svg className="w-5 h-5 mx-auto" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="11" cy="11" r="7" />
                    <path d="M20 20l-3-3" />
                  </svg>
                </button>
              </label>

              <div className="relative shrink-0" ref={filterRef}>
                <button
                  type="button"
                  onClick={() => setFiltersOpen((open) => !open)}
                  className="h-11 w-full sm:w-auto min-w-[10.5rem] px-4 rounded-full border border-[#ccc] bg-white text-sm font-medium text-[#0f0f0f] flex items-center justify-between gap-2 hover:bg-[#f8f8f8]"
                  aria-haspopup="true"
                  aria-expanded={filtersOpen}
                >
                  <span className="truncate">{searchModeLabel}</span>
                  <svg className="w-4 h-4 shrink-0" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.24a.75.75 0 01-1.06 0L5.21 8.29a.75.75 0 01.02-1.08z" />
                  </svg>
                </button>
                {filtersOpen ? (
                  <div className="absolute right-0 mt-2 w-56 rounded-xl border border-[#e5e5e5] bg-white shadow-lg p-3 z-30">
                    <p className="text-xs font-semibold text-[#606060] uppercase tracking-wide mb-2">Search in</p>
                    <label className="flex items-center gap-2 py-1.5 text-sm text-[#0f0f0f] cursor-pointer">
                      <input
                        type="checkbox"
                        checked={searchTitle}
                        onChange={() => toggleSearchField('title')}
                        className="w-4 h-4 rounded border-[#ccc] text-blue-600 focus:ring-blue-500"
                      />
                      Title
                    </label>
                    <label className="flex items-center gap-2 py-1.5 text-sm text-[#0f0f0f] cursor-pointer">
                      <input
                        type="checkbox"
                        checked={searchModel}
                        onChange={() => toggleSearchField('model')}
                        className="w-4 h-4 rounded border-[#ccc] text-blue-600 focus:ring-blue-500"
                      />
                      Product model
                    </label>
                  </div>
                ) : null}
              </div>
            </form>

            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-x-4 gap-y-8">
                {Array.from({ length: 8 }).map((_, index) => (
                  <div key={index} className="animate-pulse">
                    <div className="aspect-video rounded-xl bg-[#e5e5e5]" />
                    <div className="flex gap-3 mt-3">
                      <div className="w-9 h-9 rounded-full bg-[#e5e5e5] shrink-0" />
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-[#e5e5e5] rounded w-full" />
                        <div className="h-3 bg-[#e5e5e5] rounded w-2/3" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : videos.length === 0 ? (
              <p className="text-center text-[#606060] py-16">
                {submittedQuery ? 'No videos match your search.' : 'No videos published yet.'}
              </p>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-x-4 gap-y-8">
                  {videos.map((video) => (
                    <article key={video._id} className="group cursor-pointer">
                      <button
                        type="button"
                        onClick={() => openVideo(video)}
                        className="w-full text-left"
                      >
                        <div className="relative aspect-video overflow-hidden rounded-xl bg-[#f2f2f2]">
                          <img
                            src={video.thumbnail}
                            alt=""
                            className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-[1.02]"
                          />
                          <span className="absolute bottom-1.5 right-1.5 px-1.5 py-0.5 rounded text-xs font-medium text-white bg-black/80 leading-none">
                            {CATEGORY_LABELS[video.category] || 'Video'}
                          </span>
                        </div>

                        <div className="flex gap-3 mt-3 pr-6">
                          <img
                            src={CHANNEL_AVATAR}
                            alt=""
                            className="w-9 h-9 rounded-full object-contain bg-white border border-[#e5e5e5] shrink-0 mt-0.5"
                          />
                          <div className="min-w-0 flex-1">
                            <h3 className="text-[0.95rem] font-semibold text-[#0f0f0f] leading-snug line-clamp-2">
                              {video.title}
                            </h3>
                            {video.productId?.modelNumber ? (
                              <p className="text-xs text-[#606060] mt-1 truncate">
                                Model {video.productId.modelNumber}
                              </p>
                            ) : null}
                            <p className="text-sm text-[#606060] mt-1 truncate">{CHANNEL_NAME}</p>
                            <p className="text-sm text-[#606060] truncate">
                              {formatViews(video.views)} • {formatRelativeTime(video.youtubePublishedAt || video.createdAt)}
                            </p>
                          </div>
                        </div>
                      </button>
                    </article>
                  ))}
                </div>

                {totalPages > 1 && (
                  <div className="flex flex-wrap justify-center items-center gap-3 mt-10 pt-6 border-t border-[#e5e5e5]">
                    <button
                      type="button"
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="px-4 py-2 text-sm rounded-full bg-[#f2f2f2] text-[#0f0f0f] font-medium disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#e5e5e5] transition-colors"
                    >
                      Previous
                    </button>
                    <span className="text-sm text-[#606060]">
                      Page {currentPage} of {totalPages}
                    </span>
                    <button
                      type="button"
                      onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                      className="px-4 py-2 text-sm rounded-full bg-[#f2f2f2] text-[#0f0f0f] font-medium disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#e5e5e5] transition-colors"
                    >
                      Next
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </main>
      </div>

      {activeVideo ? (
        <div
          className="fixed inset-0 z-[10000] flex items-start justify-center overflow-y-auto bg-black/70 p-4 sm:p-6"
          role="dialog"
          aria-modal="true"
          aria-label={activeVideo.title}
          onClick={() => setActiveVideo(null)}
        >
          <div
            className="relative w-full max-w-5xl my-4 sm:my-8 bg-white rounded-2xl overflow-hidden shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setActiveVideo(null)}
              className="absolute top-3 right-3 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-black/60 text-white hover:bg-black/80 transition-colors"
              aria-label="Close video"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>

            <div className="p-4 sm:p-6">
              <YouTubeEmbed
                youtubeId={activeVideo.youtubeId}
                youtubeUrl={activeVideo.youtubeUrl}
                title={activeVideo.title}
              />
              <div className="mt-4 flex gap-3">
                <img
                  src={CHANNEL_AVATAR}
                  alt=""
                  className="w-10 h-10 rounded-full object-contain bg-white border border-[#e5e5e5] shrink-0"
                />
                <div className="min-w-0">
                  <h2 className="text-lg font-semibold text-[#0f0f0f] leading-snug">{activeVideo.title}</h2>
                  <p className="text-sm text-[#606060] mt-1">
                    {CHANNEL_NAME} • {formatViews(activeVideo.views)} •{' '}
                    {formatRelativeTime(activeVideo.youtubePublishedAt || activeVideo.createdAt)}
                  </p>
                  {activeVideo.description ? (
                    <p className="text-sm text-[#0f0f0f] mt-3 leading-relaxed whitespace-pre-line">
                      {activeVideo.description}
                    </p>
                  ) : null}
                  {activeVideo.productId?._id || activeVideo.productId ? (
                    <Link
                      to={getProductPath(activeVideo.productId)}
                      className="inline-block mt-4 text-sm font-medium text-blue-600 hover:underline"
                      onClick={() => setActiveVideo(null)}
                    >
                      {activeVideo.productId?.modelNumber
                        ? `View related product (${activeVideo.productId.modelNumber}) →`
                        : 'View related product →'}
                    </Link>
                  ) : null}
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}

export default Videos
