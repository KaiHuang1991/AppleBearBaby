import { useCallback, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { LocaleLink } from './LocaleLink'
import { homeImages } from '../src/assets/galleryAssets'

const HERO_SLIDE_IMAGES = [
  homeImages.hero,
  homeImages.manufacturing,
  homeImages.assembly,
].filter(Boolean)

const HomeHeroSlider = () => {
  const { t } = useTranslation()
  const [index, setIndex] = useState(0)
  const [paused, setPaused] = useState(false)
  const slides = t('home.hero', { returnObjects: true })
  const list = Array.isArray(slides)
    ? slides.map((item, i) => ({ ...item, image: HERO_SLIDE_IMAGES[i] })).filter((item) => item.image)
    : []
  const slide = list[index] || list[0]
  const count = list.length

  const go = useCallback((next) => {
    setIndex((current) => {
      if (!count) return 0
      return (current + next + count) % count
    })
  }, [count])

  useEffect(() => {
    if (paused || count < 2) return undefined
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const timer = window.setInterval(() => go(1), reduced ? 8000 : 5600)
    return () => window.clearInterval(timer)
  }, [paused, count, go])

  if (!slide) return null

  return (
    <section
      className='home-section home-section--hero home-hero relative flex items-center'
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className='home-hero-slides' aria-hidden='true'>
        {list.map((item, i) => (
          <div key={item.image} className={`home-hero-slide${i === index ? ' is-active' : ''}`}>
            {i === index ? (
              <img
                key={index}
                src={item.image}
                alt=''
                className='home-hero-kenburns'
              />
            ) : (
              <img src={item.image} alt='' />
            )}
          </div>
        ))}
      </div>
      <div className='home-section-bg home-hero-overlay' aria-hidden='true' />

      <div className='section-container relative z-10 py-16 md:py-24'>
        <div key={index} className='max-w-2xl home-hero-content'>
          <span className='home-hero-badge home-hero-layer home-hero-layer--1'>{slide.badge}</span>
          <h1 className='text-3xl sm:text-4xl lg:text-5xl font-bold text-white leading-tight mb-5 home-hero-layer home-hero-layer--2'>
            {slide.title}
          </h1>
          <p className='text-base sm:text-lg text-slate-200 leading-relaxed mb-8 max-w-xl home-hero-layer home-hero-layer--3'>
            {slide.text}
          </p>
          <div className='flex flex-wrap gap-3 home-hero-layer home-hero-layer--4'>
            <LocaleLink to='/collection' className='corp-btn px-6 py-3'>
              {t('common.viewAll')}
              <span aria-hidden='true'>→</span>
            </LocaleLink>
            <LocaleLink to='/contact' className='corp-btn-outline bg-white/10 text-white border-white/30 hover:bg-white/20 hover:border-white/50 px-6 py-3'>
              {t('common.getQuote')}
            </LocaleLink>
          </div>
        </div>
      </div>

      {count > 1 ? (
        <>
          <button
            type='button'
            className='home-slider-arrow home-slider-arrow--prev'
            aria-label='Previous slide'
            onClick={() => go(-1)}
          >
            <span aria-hidden='true'>‹</span>
          </button>
          <button
            type='button'
            className='home-slider-arrow home-slider-arrow--next'
            aria-label='Next slide'
            onClick={() => go(1)}
          >
            <span aria-hidden='true'>›</span>
          </button>
          <div className='home-hero-dots' role='tablist' aria-label='Hero slides'>
            {list.map((item, i) => (
              <button
                key={item.image}
                type='button'
                role='tab'
                aria-selected={i === index}
                aria-label={`Show slide ${i + 1}`}
                className={`home-hero-dot${i === index ? ' is-active' : ''}`}
                onClick={() => setIndex(i)}
              />
            ))}
          </div>
        </>
      ) : null}
    </section>
  )
}

export default HomeHeroSlider
