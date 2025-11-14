import React from 'react'
import { assets } from '../src/assets/assets'
import { useState, useEffect } from 'react'
import axios from 'axios'

const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:4000'

const Hero = () => {
  // State management
  const [slides, setSlides] = useState([])
  const [currentSlide, setCurrentSlide] = useState(0)
  const [autoPlay, setAutoPlay] = useState(true)
  const [autoPlayInterval, setAutoPlayInterval] = useState(3000)
  const [loading, setLoading] = useState(true)

  // Fetch hero configuration from backend
  useEffect(() => {
    const fetchHeroConfig = async () => {
      try {
        const response = await axios.get(`${backendUrl}/api/hero`)
        if (response.data.success) {
          const config = response.data.config
          // Only show active slides
          const activeSlides = (config.slides || []).filter(slide => slide.isActive)
          // Sort by order
          activeSlides.sort((a, b) => (a.order || 0) - (b.order || 0))
          
          setSlides(activeSlides)
          setAutoPlay(config.autoPlay !== undefined ? config.autoPlay : true)
          setAutoPlayInterval(config.autoPlayInterval || 3000)
        }
      } catch (error) {
        console.error('Error fetching hero config:', error)
        // Fallback to default slides if API fails
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
  }, [])

  // Auto play slides
  useEffect(() => {
    if (autoPlay && slides.length > 1) {
      const interval = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % slides.length)
      }, autoPlayInterval)
      return () => clearInterval(interval)
    }
  }, [autoPlay, slides.length, autoPlayInterval])

  // Switch to previous slide
  const goToPrevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length)
  }

  // Switch to next slide
  const goToNextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length)
  }

  // Jump to specific slide
  const goToSlide = (index) => {
    setCurrentSlide(index)
  }

  // Get current slide data
  const currentSlideData = slides[currentSlide] || null

  if (loading) {
    return (
      <section className='w-full'>
        <div className='relative w-full overflow-hidden rounded-none sm:rounded-none bg-slate-100 shadow-none sm:shadow-2xl'>
          <div className='flex items-center justify-center h-96'>
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </section>
    )
  }

  if (!currentSlideData) {
    return null
  }

  // Render image with optional link wrapper
  const ImageContent = () => {
    const imgElement = (
      <img 
        className='block w-full h-auto mx-auto transition-opacity duration-500 object-contain'
        src={currentSlideData.imageUrl} 
        alt={currentSlideData.title} 
      />
    )

    if (currentSlideData.linkUrl) {
      return (
        <a
          href={currentSlideData.linkUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="block w-full"
        >
          {imgElement}
        </a>
      )
    }

    return imgElement
  }

  return (
    <section className='w-full'>
      <div className='relative w-full overflow-hidden rounded-none sm:rounded-none bg-slate-100 shadow-none sm:shadow-2xl'>
        <div className='relative w-full'>
          <ImageContent />
          <div className="absolute inset-0 bg-gradient-to-b from-black/0 via-black/10 to-black/20 pointer-events-none"></div>

          {/* Product Info Overlay (hidden on small screens) */}
          <div className="hidden sm:block absolute inset-x-0 bottom-0 px-8 py-10">
            <div className="max-w-2xl md:max-w-3xl space-y-6">
              <h2 className="text-white text-3xl md:text-4xl font-bold leading-tight drop-shadow-lg">
                {currentSlideData.title}
              </h2>
              {currentSlideData.features && currentSlideData.features.length > 0 && (
                <div className="flex flex-wrap gap-3">
                  {currentSlideData.features.map((feature, idx) => (
                    <span 
                      key={idx}
                      className="bg-white/15 backdrop-blur-md text-white px-3 py-1 rounded-full text-sm font-medium border border-white/25 shadow-sm"
                    >
                      ✓ {feature}
                    </span>
                  ))}
                </div>
              )}
              {currentSlideData.linkUrl && (
                <a 
                  href={currentSlideData.linkUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-7 py-3 rounded-full text-base font-semibold hover:scale-[1.02] active:scale-[0.99] transition-transform shadow-lg shadow-orange-500/30"
                >
                  {currentSlideData.buttonText || 'View All Products'}
                  <span>→</span>
                </a>
              )}
            </div>
          </div>

          {/* Navigation buttons */}
          {slides.length > 1 && (
            <>
              <button
                type="button"
                className="hidden sm:flex absolute left-6 top-1/2 -translate-y-1/2 bg-white/25 backdrop-blur-md text-white p-3 rounded-full hover:bg-white/35 hover:scale-110 transition-all duration-300 shadow-lg border border-white/30"
                onClick={goToPrevSlide}
                aria-label="Previous slide"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button
                type="button"
                className="hidden sm:flex absolute right-6 top-1/2 -translate-y-1/2 bg-white/25 backdrop-blur-md text-white p-3 rounded-full hover:bg-white/35 hover:scale-110 transition-all duration-300 shadow-lg border border-white/30"
                onClick={goToNextSlide}
                aria-label="Next slide"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </>
          )}

          {/* Slide indicators */}
          {slides.length > 1 && (
            <div className="hidden sm:flex absolute bottom-10 left-1/2 -translate-x-1/2 gap-3">
              {slides.map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToSlide(index)}
                  className={`transition-all duration-300 rounded-full ${
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
      </div>
    </section>
  )
}

export default Hero
