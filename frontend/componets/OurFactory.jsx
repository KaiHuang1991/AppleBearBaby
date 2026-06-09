import React, { useState, useEffect, useRef } from 'react'
import { homeImages, factoryCarousel } from '../src/assets/galleryAssets'

const factorySlides = [
  { url: homeImages.office, title: 'Modern Office', description: 'Professional team and modern workspace' },
  { url: homeImages.manufacturing, title: 'Production Line', description: 'Advanced automated manufacturing equipment' },
  { url: homeImages.certifications, title: 'Certifications & Awards', description: 'Quality certifications and industry recognition' },
  { url: homeImages.showroom, title: 'Product Showroom', description: 'Comprehensive baby product display' },
  ...factoryCarousel.slice(0, 4).map((url, i) => ({
    url,
    title: `Factory View ${i + 1}`,
    description: 'Inside our manufacturing facility',
  })),
]

const OurFactory = () => {
  const [offset, setOffset] = useState(0)
  const [isMobile, setIsMobile] = useState(false)
  const animationRef = useRef(null)
  const images = factorySlides.slice(0, 8)
  const doubledImages = [...images, ...images]

  useEffect(() => {
    const updateViewport = () => {
      if (typeof window !== 'undefined') setIsMobile(window.innerWidth < 768)
    }
    updateViewport()
    window.addEventListener('resize', updateViewport)
    return () => window.removeEventListener('resize', updateViewport)
  }, [])

  useEffect(() => {
    if (isMobile) {
      setOffset(0)
      if (animationRef.current) cancelAnimationFrame(animationRef.current)
      return
    }
    const speed = 0.08
    let lastTime = performance.now()
    const animate = (currentTime) => {
      const deltaTime = currentTime - lastTime
      if (deltaTime >= 16.67) {
        lastTime = currentTime
        setOffset((prev) => {
          const newOffset = prev + speed
          if (newOffset >= images.length * 33.333) return 0
          return newOffset
        })
      }
      animationRef.current = requestAnimationFrame(animate)
    }
    animationRef.current = requestAnimationFrame(animate)
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current)
    }
  }, [images.length, isMobile])

  return (
    <section className='section-alt py-12 md:py-16'>
      <div className='section-container'>
        <div className='text-center mb-8'>
          <p className='text-xs font-semibold uppercase tracking-[0.2em] text-blue-600 mb-2'>Our Factory</p>
          <h2 className='corp-section-title'>Manufacturing Excellence</h2>
        </div>
        <div className='mb-8 relative w-full'>
          {isMobile ? (
            <div className='flex snap-x snap-mandatory overflow-x-auto gap-4 pb-4'>
              {images.map((image) => (
                <div key={image.title} className='snap-center flex-shrink-0 w-full max-w-[420px]'>
                  <div className='corp-feature-card overflow-hidden p-0 h-full'>
                    <img src={image.url} alt={image.title} className='w-full h-48 object-cover' />
                    <div className='p-4 text-center space-y-1'>
                      <p className='text-base font-semibold text-slate-800'>{image.title}</p>
                      <p className='text-sm text-slate-500 leading-relaxed'>{image.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className='overflow-hidden rounded-xl'>
              <div className='flex' style={{ transform: `translateX(-${offset}%)`, transition: 'none' }}>
                {doubledImages.map((image, index) => (
                  <div key={index} className='flex-shrink-0 px-2' style={{ width: '33.333%' }}>
                    <div className='corp-feature-card overflow-hidden p-0 h-full'>
                      <img src={image.url} alt={image.title} className='w-full aspect-[4/3] object-cover' />
                      <div className='p-4 text-center space-y-2'>
                        <p className='text-lg font-semibold text-slate-800'>{image.title}</p>
                        <p className='text-sm text-slate-500 leading-relaxed'>{image.description}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        <div className='bg-white border border-slate-200 rounded-xl px-6 sm:px-10 py-6 sm:py-8 shadow-sm'>
          <p className='text-slate-600 text-base sm:text-lg leading-relaxed text-center max-w-4xl mx-auto'>
            From design to production, the entire process is carried out strictly in accordance with national quality system requirements, ensuring every product meets international testing standards.
          </p>
        </div>
      </div>
    </section>
  )
}

export default OurFactory
