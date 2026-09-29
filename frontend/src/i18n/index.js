import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import { DEFAULT_LOCALE, getLocaleFromPath } from './locales'
import en from './locales/en.json'
import zh from './locales/zh.json'
import es from './locales/es.json'
import ar from './locales/ar.json'
import fr from './locales/fr.json'

const initialLng =
  typeof window !== 'undefined' ? getLocaleFromPath(window.location.pathname) : DEFAULT_LOCALE

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    zh: { translation: zh },
    es: { translation: es },
    ar: { translation: ar },
    fr: { translation: fr },
  },
  lng: initialLng,
  fallbackLng: DEFAULT_LOCALE,
  interpolation: { escapeValue: false },
  returnNull: false,
  react: { useSuspense: false },
})

export default i18n
