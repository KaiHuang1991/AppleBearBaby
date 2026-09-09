import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import HomeImage from './HomeImage'
import Reveal from './Reveal'

const CategoryCard = ({ image, title, slug }) => (
  <Link to={slug ? `/collection/${slug}` : '/collection'} className='group home-category-card corp-feature-card p-0 overflow-hidden block h-full'>
    <div className='relative aspect-square overflow-hidden bg-slate-50'>
      <HomeImage
        src={image}
        alt={title}
        className='w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300'
        wrapperClassName='w-full h-full'
      />
    </div>
    <div className='px-3 py-4 text-center'>
      <h3 className='font-semibold text-sm sm:text-base text-slate-800 group-hover:text-blue-600 transition-colors'>{title}</h3>
    </div>
  </Link>
)

const getPerView = () => {
  if (typeof window === 'undefined') return 4
  if (window.innerWidth < 640) return 2
  if (window.innerWidth < 1024) return 3
  return 4
}

const HomeCategorySlider = ({ items = [] }) => {
  const [perView, setPerView] = useState(getPerView)
  const [offset, setOffset] = useState(0)
  const [paused, setPaused] = useState(false)
  const max = Math.max(0, items.length - perView)

  useEffect(() => {
    const onResize = () => setPerView(getPerView())
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  useEffect(() => {
    setOffset((current) => Math.min(current, max))
  }, [max])

  const go = useCallback((dir) => {
    setOffset((current) => {
      if (max <= 0) return 0
      const next = current + dir
      if (next < 0) return max
      if (next > max) return 0
      return next
    })
  }, [max])

  useEffect(() => {
    if (paused || max <= 0) return undefined
    const timer = window.setInterval(() => go(1), 4200)
    return () => window.clearInterval(timer)
  }, [paused, max, go])

  const cardWidth = `${100 / perView}%`

  return (
    <div
      className='home-category-slider'
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <button
        type='button'
        className='home-slider-arrow home-slider-arrow--rail home-slider-arrow--prev'
        aria-label='Previous categories'
        onClick={() => go(-1)}
      >
        <span aria-hidden='true'>‹</span>
      </button>
      <div className='home-category-viewport'>
        <div
          className='home-category-track'
          style={{ transform: `translateX(-${offset * (100 / perView)}%)` }}
        >
          {items.map((item, i) => (
            <div
              key={item.slug || item.title}
              className='home-category-slide'
              style={{ flexBasis: cardWidth, maxWidth: cardWidth }}
            >
              <Reveal delay={Math.min(i, 4) * 80}>
                <CategoryCard image={item.image} title={item.title} slug={item.slug} />
              </Reveal>
            </div>
          ))}
        </div>
      </div>
      <button
        type='button'
        className='home-slider-arrow home-slider-arrow--rail home-slider-arrow--next'
        aria-label='Next categories'
        onClick={() => go(1)}
      >
        <span aria-hidden='true'>›</span>
      </button>
    </div>
  )
}

export default HomeCategorySlider
