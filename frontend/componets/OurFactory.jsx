import React, { useState, useEffect, useRef } from 'react'
import { assets } from '../src/assets/assets'

const OurFactory = () => {
  const [offset, setOffset] = useState(0)
  const [isMobile, setIsMobile] = useState(false)
  const animationRef = useRef(null)
  
  // 工厂图片数组
  const factoryImages = [
    {
      url: assets.office, // 办公室场景
      title: 'Modern Office',
      description: 'Professional team and modern workspace'
    },
    {
      url: assets.productionLine, // 生产线场景
      title: 'Production Line',
      description: 'Advanced automated manufacturing equipment'
    },
    {
      url: assets.certificates, // 证书墙
      title: 'Certifications & Awards',
      description: 'Quality certifications and industry recognition'
    },
    {
      url: assets.frontView, // 产品展示室
      title: 'Product Showroom',
      description: 'Comprehensive baby product display'
    }
  ]

  // 复制图片数组以实现无缝循环
  const doubledImages = [...factoryImages, ...factoryImages]

  // Track viewport to adapt layout
  useEffect(() => {
    const updateViewport = () => {
      if (typeof window !== 'undefined') {
        setIsMobile(window.innerWidth < 768)
      }
    }

    updateViewport()
    window.addEventListener('resize', updateViewport)
    return () => window.removeEventListener('resize', updateViewport)
  }, [])

  // 连续滑动动画（仅在非移动端启用）
  useEffect(() => {
    if (isMobile) {
      setOffset(0)
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
      return
    }

    const speed = 0.08 // 滑动速度（百分比/帧）
    let lastTime = performance.now()

    const animate = (currentTime) => {
      const deltaTime = currentTime - lastTime
      
      if (deltaTime >= 16.67) {
        lastTime = currentTime
        
        setOffset((prev) => {
          const newOffset = prev + speed
          if (newOffset >= factoryImages.length * 33.333) {
            return 0
          }
          return newOffset
        })
      }
      
      animationRef.current = requestAnimationFrame(animate)
    }

    animationRef.current = requestAnimationFrame(animate)

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [factoryImages.length, isMobile])

  return (
    <div className='w-full relative'>
      <div className="absolute inset-0 cartoon-bg z-0"></div>
      <div className="absolute inset-0 cartoon-hearts opacity-10 z-0"></div>
      <div className="absolute top-16 left-12 w-16 h-16 bg-blue-200/30 gentle-float z-0"></div>
      <div className="absolute bottom-20 right-16 w-12 h-12 bg-cyan-200/30 gentle-bounce z-0"></div>
      <div className='absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-white/0 via-white/40 to-transparent z-0'></div>
      <div className='absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-white/0 via-white/40 to-transparent z-0'></div>
      {/* Image Gallery Section - Full Width Continuous Scrolling with Photo Frame Effect */}
      <div className='mb-8 sm:mb-10 relative w-full px-4 sm:px-8 z-10'>
        {isMobile ? (
          <div className='flex snap-x snap-mandatory overflow-x-auto gap-4 pb-6'>
            {factoryImages.map((image) => (
              <div 
                key={image.title}
                className='snap-center flex-shrink-0 w-full max-w-[420px]'
              >
                <div className='bg-white p-4 shadow-xl h-full flex flex-col justify-between'>
                  <div className='relative overflow-hidden'>
                    <img 
                      src={image.url}
                      alt={image.title}
                      className='w-full h-48 object-cover'
                      onError={(e) => {
                        e.currentTarget.src = 'https://via.placeholder.com/600x400/4A90E2/ffffff?text=' + encodeURIComponent(image.title)
                      }}
                    />
                  </div>
                  <div className='mt-3 text-center space-y-1'>
                    <p className='text-base font-semibold text-gray-800'>{image.title}</p>
                    <p className='text-sm text-gray-500 leading-relaxed'>{image.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className='overflow-hidden'>
            <div 
              className='flex'
              style={{ 
                transform: `translateX(-${offset}%)`,
                transition: 'none'
              }}
            >
              {doubledImages.map((image, index) => (
                <div 
                  key={index}
                  className='flex-shrink-0 px-1'
                  style={{width: '33.333%'}}
                >
                  <div className='bg-white p-4 mt-5 sm:p-5 shadow-xl relative h-full flex flex-col justify-between'>
                    <div className='relative'>
                      <img 
                        src={image.url}
                        alt={image.title}
                        className='w-full h-full object-cover'
                        onError={(e) => {
                          e.currentTarget.src = 'https://via.placeholder.com/600x400/4A90E2/ffffff?text=' + encodeURIComponent(image.title)
                        }}
                      />
                    </div>
                    <div className='mt-4 text-center space-y-2'>
                      <p className='text-lg font-semibold text-gray-800'>{image.title}</p>
                      <p className='text-sm text-gray-500 leading-relaxed'>{image.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Description Text Block with Navigation Arrows */}
      <div className='px-6 sm:px-12 md:px-16 relative z-10'>
        {/* Left Arrow Button */}
        <button 
          className='hidden md:flex absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-blue-100 items-center justify-center hover:bg-blue-200 transition-colors duration-300 shadow-md z-10'
        >
          <span className='text-blue-600 text-xl font-bold'>←</span>
        </button>

        {/* Right Arrow Button */}
        <button 
          className='hidden md:flex absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-blue-100 items-center justify-center hover:bg-blue-200 transition-colors duration-300 shadow-md z-10'
        >
          <span className='text-blue-600 text-xl font-bold'>→</span>
        </button>

        {/* Description Text */}
        <div className='bg-white/70 backdrop-blur-lg border border-white/60 shadow-lg px-6 sm:px-10 md:px-14 py-8'>
          <p className='text-gray-700 text-base sm:text-lg md:text-xl leading-relaxed text-center'>
            From design to production, the entire production and management process is carried out strictly in accordance with the requirements of the national quality system, to ensure that every product meets international testing standards. Therefore, please rest assured that our products are safe for human use. Our service philosophy is to provide products with the most reasonable prices and the most comprehensive services.
          </p>
        </div>
      </div>
    </div>
  )
}

export default OurFactory

