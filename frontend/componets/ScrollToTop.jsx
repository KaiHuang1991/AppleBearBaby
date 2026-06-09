import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'

const ScrollToTop = () => {
  const { pathname } = useLocation()
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'smooth' })
  }, [pathname])

  useEffect(() => {
    const handleScroll = () => setIsVisible(window.scrollY > 200)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  if (!isVisible) return null

  return (
    <button
      type='button'
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      className='fixed bottom-8 right-8 z-[1000] flex h-11 w-11 items-center justify-center rounded-full bg-blue-600 text-white shadow-lg hover:bg-blue-700 transition-colors'
      aria-label='Scroll to top'
    >
      <svg xmlns='http://www.w3.org/2000/svg' className='h-5 w-5' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
        <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M5 15l7-7 7 7' />
      </svg>
    </button>
  )
}

export default ScrollToTop
