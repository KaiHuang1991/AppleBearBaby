import { useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
  LOCALE_META,
  SUPPORTED_LOCALES,
  getLocaleFromPath,
  stripLocale,
  withLocale,
  writeStoredLocale,
} from '../src/i18n/locales'

const LanguageSwitcher = () => {
  const { t } = useTranslation()
  const location = useLocation()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const rootRef = useRef(null)
  const locale = getLocaleFromPath(location.pathname)
  const current = LOCALE_META[locale]

  useEffect(() => {
    if (!open) return undefined
    const onClick = (event) => {
      if (rootRef.current && !rootRef.current.contains(event.target)) setOpen(false)
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [open])

  const switchTo = (nextLocale) => {
    writeStoredLocale(nextLocale)
    const nextPath = withLocale(`${stripLocale(location.pathname)}${location.search}${location.hash}`, nextLocale)
    setOpen(false)
    if (nextPath !== `${location.pathname}${location.search}${location.hash}`) {
      navigate(nextPath)
    }
  }

  return (
    <div className="language-switcher relative" ref={rootRef}>
      <button
        type="button"
        className="language-switcher-btn inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold tracking-wide text-slate-700 hover:border-blue-300 hover:text-blue-600"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={t('nav.language')}
        onClick={() => setOpen((value) => !value)}
      >
        <span>{current?.label || 'EN'}</span>
        <svg className="h-3 w-3 opacity-70" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
          <path d="M5.23 7.21a.75.75 0 011.06.02L10 11.17l3.71-3.94a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" />
        </svg>
      </button>
      {open ? (
        <ul
          className="language-switcher-menu absolute right-0 top-full z-[70] mt-2 min-w-[9.5rem] overflow-hidden rounded-lg border border-slate-200 bg-white py-1 shadow-lg rtl:right-auto rtl:left-0"
          role="listbox"
        >
          {SUPPORTED_LOCALES.map((code) => {
            const meta = LOCALE_META[code]
            const active = code === locale
            return (
              <li key={code} role="option" aria-selected={active}>
                <button
                  type="button"
                  className={`flex w-full items-center justify-between px-3 py-1.5 text-left text-sm ${
                    active ? 'bg-blue-50 font-semibold text-blue-700' : 'text-slate-700 hover:bg-slate-50'
                  }`}
                  onClick={() => switchTo(code)}
                >
                  <span>{meta.native}</span>
                  <span className="text-[11px] text-slate-400">{meta.label}</span>
                </button>
              </li>
            )
          })}
        </ul>
      ) : null}
    </div>
  )
}

export default LanguageSwitcher
