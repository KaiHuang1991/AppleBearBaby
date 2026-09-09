import { useEffect, useState } from 'react'

const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

export const useInView = (ref, { threshold = 0.15, rootMargin = '0px 0px -40px 0px', once = true } = {}) => {
  const [inView, setInView] = useState(() => prefersReducedMotion())

  useEffect(() => {
    const el = ref.current
    if (!el) return undefined

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true)
          if (once) observer.disconnect()
        }
      },
      { threshold, rootMargin }
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [ref, threshold, rootMargin, once])

  return inView
}
