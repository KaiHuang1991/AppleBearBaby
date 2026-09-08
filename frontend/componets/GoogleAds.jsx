import { useEffect } from 'react'
import { initGoogleAds } from '../src/googleAds'

/** Injects Google Ads gtag after idle / short delay so it does not compete with LCP. */
const GoogleAds = () => {
  useEffect(() => {
    let idleId
    let timerId
    const run = () => initGoogleAds()
    if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
      idleId = window.requestIdleCallback(run, { timeout: 4000 })
    } else {
      timerId = window.setTimeout(run, 3000)
    }
    return () => {
      if (idleId != null && typeof window.cancelIdleCallback === 'function') {
        window.cancelIdleCallback(idleId)
      }
      if (timerId != null) window.clearTimeout(timerId)
    }
  }, [])

  return null
}

export default GoogleAds
