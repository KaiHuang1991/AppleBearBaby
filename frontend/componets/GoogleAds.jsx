import { useEffect } from 'react'
import { initGoogleAds } from '../src/googleAds'

/** Injects Google Ads gtag on mount when VITE_GOOGLE_ADS_ID is set. */
const GoogleAds = () => {
  useEffect(() => {
    initGoogleAds()
  }, [])

  return null
}

export default GoogleAds
