import { useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
  DEFAULT_LOCALE,
  applyDocumentLocale,
  getLocaleFromPath,
  isHomePath,
  readStoredLocale,
  setCurrentLocale,
  withLocale,
  writeStoredLocale,
} from '../src/i18n/locales'

const LocaleSync = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const { i18n } = useTranslation()
  const locale = getLocaleFromPath(location.pathname)

  useEffect(() => {
    setCurrentLocale(locale)
    applyDocumentLocale(locale)
    if (i18n.language !== locale) {
      i18n.changeLanguage(locale)
    }
    writeStoredLocale(locale)
  }, [locale, i18n])

  useEffect(() => {
    if (!isHomePath(location.pathname) || locale !== DEFAULT_LOCALE) return
    if (typeof window === 'undefined') return
    if (sessionStorage.getItem('abb-locale-applied') === '1') return
    const stored = readStoredLocale()
    sessionStorage.setItem('abb-locale-applied', '1')
    if (stored && stored !== DEFAULT_LOCALE) {
      navigate(withLocale('/', stored), { replace: true })
    }
  }, [locale, location.pathname, navigate])

  return null
}

export default LocaleSync
