import { useEffect } from 'react'
import { initGoogleAds } from '../src/googleAds'

/** Fallback only: index.html already installs gtag in <head>. */
const GoogleAds = () => {
  useEffect(() => {
    initGoogleAds()
  }, [])

  return null
}

export default GoogleAds
