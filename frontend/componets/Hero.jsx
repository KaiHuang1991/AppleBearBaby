import React from 'react'
import { useState, useEffect, useContext, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { ShopContext } from '../context/ShopContext'

const isInternalLink = (url) => {
  if (!url) return false
  if (url.startsWith('/')) return true
  try {
    const parsed = new URL(url, window.location.origin)
    return parsed.origin === window.location.origin
  } catch {
    return false
  }
}

const getInternalPath = (url) => {
  if (url.startsWith('/')) return url
  try {
    const parsed = new URL(url)
    return `${parsed.pathname}${parsed.search}${parsed.hash}`
  } catch {
    return url
  }
}

const heroCarouselClass =
  'hero-carousel hero-carousel--fullbleed relative w-full overflow-hidden bg-transparent shadow-none'

const SlideImage = ({ slide, isActive, variant = 'carousel' }) => {
  const imgClass =
    variant === 'mobile'
      ? 'hero-slide-image block w-full h-auto max-w-full'
      : 'hero-slide-image block h-full w-full object-contain object-center'

  const imgElement = (
    <img
      className={imgClass}
      src={slide.imageUrl}
      alt={slide.title || 'Hero banner'}
      loading={isActive ? 'eager' : 'lazy'}
      draggable={false}
    />
  )

  const wrapClass =
    variant === 'mobile' ? 'block w-full leading-[0]' : 'flex h-full w-full items-center justify-center'

  if (!slide.linkUrl) {
    return <div className={wrapClass}>{imgElement}</div>
  }

  if (isInternalLink(slide.linkUrl)) {
    return (
      <Link to={getInternalPath(slide.linkUrl)} className={wrapClass}>
        {imgElement}
      </Link>
    )
  }

  return (
    <a
      href={slide.linkUrl}
      target='_blank'
      rel='noopener noreferrer'
      className={wrapClass}
    >
      {imgElement}
    </a>
  )
}

const Hero = () => {
  const { api } = useContext(ShopContext)
  const [slides, setSlides] = useState([])
  const [currentSlide, setCurrentSlide] = useState(0)
  const [autoPlay, setAutoPlay] = useState(true)
  const [autoPlayInterval, setAutoPlayInterval] = useState(3000)
  const [loading, setLoading] = useState(true)
  const [slideDimensions, setSlideDimensions] = useState({})

  useEffect(() => {
    const fetchHeroConfig = async () => {
      try {
        const response = await api.heroList()
        if (response.data.success) {
          const config = response.data.config
          const activeSlides = (config.slides || []).filter(slide => slide.isActive)
          activeSlides.sort((a, b) => (a.order || 0) - (b.order || 0))

          setSlides(activeSlides)
          setAutoPlay(config.autoPlay !== undefined ? config.autoPlay : true)
          setAutoPlayInterval(config.autoPlayInterval || 3000)
        }
      } catch (error) {
        console.error('Error fetching hero config:', error)
        setSlides([
          {
            imageUrl: 'https://s.alicdn.com/@sc02/kf/Hc0a7aeb5b0bf49b9a18ddca526f2ae59O.jpg?hasNWGrade=1',
            linkUrl: '',
            title: 'Apple Bear Premium Baby Feeding Bottles',
            features: ['BPA Free', 'Safe Materials', 'Easy Clean'],
            buttonText: 'View All Products'
          }
        ])
      } finally {
        setLoading(false)
      }
    }

    fetchHeroConfig()
  }, [api])

  useEffect(() => {
    slides.forEach((slide) => {
      const url = slide?.imageUrl
      if (!url) return
      const img = new Image()
      img.onload = () => {
        if (!img.naturalWidth || !img.naturalHeight) return
        setSlideDimensions((prev) => {
          if (prev[url]) return prev
          return {
            ...prev,
            [url]: { w: img.naturalWidth, h: img.naturalHeight },
          }
        })
      }
      img.src = url
    })
  }, [slides])

  useEffect(() => {
    if (autoPlay && slides.length > 1) {
      const interval = setInterval(() => {
        setCurrentSlide(prev => (prev + 1) % slides.length)
      }, autoPlayInterval)
      return () => clearInterval(interval)
    }
  }, [autoPlay, slides.length, autoPlayInterval])

  const goToPrevSlide = useCallback(() => {
    setCurrentSlide(prev => (prev - 1 + slides.length) % slides.length)
  }, [slides.length])

  const goToNextSlide = useCallback(() => {
    setCurrentSlide(prev => (prev + 1) % slides.length)
  }, [slides.length])

  const goToSlide = useCallback((index) => {
    setCurrentSlide(index)
  }, [])

  const currentSlideData = slides[currentSlide] || null
  const currentDims = currentSlideData?.imageUrl
    ? slideDimensions[currentSlideData.imageUrl]
    : null
  const carouselStyle = currentDims
    ? { aspectRatio: `${currentDims.w} / ${currentDims.h}` }
    : undefined

  if (loading) {
    return (
      <section className='w-full'>
        <div className={`${heroCarouselClass} hero-carousel--loading flex items-center justify-center`}>
          <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600'></div>
        </div>
      </section>
    )
  }

  if (!currentSlideData) {
    return null
  }

  const renderSlideButton = (slide) => {
    if (!slide.linkUrl) return null

    const buttonClass =
      'inline-flex items-center gap-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-5 py-2 sm:px-6 sm:py-2.5 lg:px-7 lg:py-3 rounded-full text-sm sm:text-base font-semibold hover:scale-[1.02] active:scale-[0.99] transition-transform duration-300 shadow-lg shadow-orange-500/30'

    if (isInternalLink(slide.linkUrl)) {
      return (
        <Link to={getInternalPath(slide.linkUrl)} className={buttonClass}>
          {slide.buttonText || 'View All Products'}
          <span>{'\u2192'}</span>
        </Link>
      )
    }

    return (
      <a href={slide.linkUrl} target='_blank' rel='noopener noreferrer' className={buttonClass}>
        {slide.buttonText || 'View All Products'}
        <span>{'\u2192'}</span>
      </a>
    )
  }

  const renderMobileHero = () => (
    <div className='hero-carousel hero-carousel--mobile relative w-full overflow-hidden'>
      {slides.map((slide, index) => (
        <div
          key={slide._id || slide.imageUrl || index}
          className={index === currentSlide ? 'block w-full' : 'hidden'}
          aria-hidden={index !== currentSlide}
        >
          <SlideImage slide={slide} isActive={index === currentSlide} variant='mobile' />
        </div>
      ))}
    </div>
  )

  const renderDesktopHero = () => (
    <div
      className={`${heroCarouselClass}${currentDims ? ' hero-carousel--sized' : ''}`}
      style={carouselStyle}
    >
      {slides.map((slide, index) => (
        <div
          key={slide._id || slide.imageUrl || index}
          className={`hero-slide-layer absolute inset-0 ${
            index === currentSlide ? 'is-active opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
          }`}
          aria-hidden={index !== currentSlide}
        >
          <SlideImage slide={slide} isActive={index === currentSlide} />
        </div>
      ))}

      <div className='absolute inset-0 bg-gradient-to-b from-black/0 via-black/10 to-black/20 pointer-events-none z-20' />

      {/* Caption overlay: tablet only — desktop banners already include title/CTA in the image */}
      <div className='hidden sm:block lg:hidden absolute inset-x-0 bottom-0 px-4 sm:px-6 py-3 sm:py-4 z-30 pointer-events-none bg-gradient-to-t from-black/55 via-black/25 to-transparent'>
          <div key={currentSlide} className='hero-slide-content max-w-xl space-y-2 sm:space-y-3 pointer-events-auto'>
            <h2 className='text-white text-lg sm:text-xl font-bold leading-snug drop-shadow-lg line-clamp-2'>
              {currentSlideData.title}
            </h2>
            {currentSlideData.features && currentSlideData.features.length > 0 && (
              <div className='flex flex-wrap gap-2'>
                {currentSlideData.features.map((feature, idx) => (
                  <span
                    key={idx}
                    className='bg-white/15 backdrop-blur-md text-white px-2.5 py-0.5 rounded-full text-xs font-medium border border-white/25 shadow-sm'
                  >
                    {'\u2713 '}{feature}
                  </span>
                ))}
              </div>
            )}
            {renderSlideButton(currentSlideData)}
          </div>
        </div>

        {slides.length > 1 && (
          <>
            <button
              type='button'
              className='hidden sm:flex absolute left-6 top-1/2 -translate-y-1/2 z-40 bg-white/25 backdrop-blur-md text-white p-3 rounded-full hover:bg-white/35 hover:scale-110 transition-all duration-300 shadow-lg border border-white/30'
              onClick={goToPrevSlide}
              aria-label='Previous slide'
            >
              <svg className='w-6 h-6' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M15 19l-7-7 7-7' />
              </svg>
            </button>
            <button
              type='button'
              className='hidden sm:flex absolute right-6 top-1/2 -translate-y-1/2 z-40 bg-white/25 backdrop-blur-md text-white p-3 rounded-full hover:bg-white/35 hover:scale-110 transition-all duration-300 shadow-lg border border-white/30'
              onClick={goToNextSlide}
              aria-label='Next slide'
            >
              <svg className='w-6 h-6' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M9 5l7 7-7 7' />
              </svg>
            </button>
          </>
        )}

      {slides.length > 1 && (
        <div className='hidden sm:flex absolute bottom-3 sm:bottom-4 lg:bottom-5 left-1/2 -translate-x-1/2 gap-2 z-40'>
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`transition-all duration-500 ease-in-out rounded-full ${
                index === currentSlide
                  ? 'w-8 sm:w-10 h-2 bg-white shadow-lg'
                  : 'w-2 h-2 bg-white/50 hover:bg-white/80'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  )

  return (
    <section className='w-full leading-[0]'>
      <div className='lg:hidden'>{renderMobileHero()}</div>
      <div className='hidden lg:block'>{renderDesktopHero()}</div>
    </section>
  )
}

export default Hero
