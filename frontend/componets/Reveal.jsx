import { useRef } from 'react'
import { useInView } from '../hooks/useInView'

const Reveal = ({ children, className = '', delay = 0, as: Tag = 'div' }) => {
  const ref = useRef(null)
  const inView = useInView(ref, { threshold: 0.16, rootMargin: '0px 0px -56px 0px' })

  return (
    <Tag
      ref={ref}
      className={`home-reveal${inView ? ' is-inview' : ''} ${className}`.trim()}
      style={{ '--reveal-delay': `${delay}ms` }}
    >
      {children}
    </Tag>
  )
}

export default Reveal
