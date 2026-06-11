import React, { useEffect, useMemo, useRef, useState } from 'react'
import { useInView } from '../hooks/useInView'

const parseMetricValue = (value) => {
  const normalized = String(value).replace(/,/g, '')
  const match = normalized.match(/^(\d+(?:\.\d+)?)(.*)$/)
  if (!match) return null

  const raw = match[1]
  return {
    target: Number(raw),
    suffix: match[2] || '',
    useComma: String(value).includes(','),
    isDecimal: raw.includes('.'),
  }
}

const formatMetricValue = (current, { suffix, useComma, isDecimal }) => {
  let display
  if (useComma) display = Math.round(current).toLocaleString('en-US')
  else if (isDecimal) display = current.toFixed(1)
  else display = String(Math.round(current))

  return `${display}${suffix}`
}

const AnimatedMetric = ({
  value,
  label,
  valueClassName = 'home-stat-value',
  labelClassName = 'home-stat-label',
  wrapperClassName = 'home-stat-item',
  duration = 900,
}) => {
  const ref = useRef(null)
  const inView = useInView(ref, { threshold: 0.4 })
  const parsed = useMemo(() => parseMetricValue(value), [value])
  const [display, setDisplay] = useState(() => (parsed ? formatMetricValue(0, parsed) : value))

  useEffect(() => {
    if (!inView) return undefined
    if (!parsed) {
      setDisplay(value)
      return undefined
    }

    const start = performance.now()
    let frame = 0

    const tick = (now) => {
      const progress = Math.min((now - start) / duration, 1)
      const eased = 1 - (1 - progress) ** 3
      setDisplay(formatMetricValue(parsed.target * eased, parsed))
      if (progress < 1) frame = requestAnimationFrame(tick)
    }

    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [inView, value, duration, parsed])

  return (
    <div ref={ref} className={wrapperClassName}>
      <p className={valueClassName}>{display}</p>
      {label ? <p className={labelClassName}>{label}</p> : null}
    </div>
  )
}

export default AnimatedMetric
