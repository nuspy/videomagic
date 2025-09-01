import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'
import { SUPPORTED_LOCALES, DEFAULT_LOCALE } from './config/locales'

// Eagerly import all common.json translation files
const modules = import.meta.glob('./locales/*/common.json', { eager: true })

const resources = {}
for (const [path, mod] of Object.entries(modules)) {
  const match = path.match(/\.\/locales\/([^/]+)\/common\.json$/)
  if (match) {
    const lng = match[1]
    if (SUPPORTED_LOCALES.includes(lng)) {
      resources[lng] = { common: mod.default || mod }
    }
  }
}

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: DEFAULT_LOCALE,
    supportedLngs: SUPPORTED_LOCALES,
    ns: ['common'],
    defaultNS: 'common',
    load: 'languageOnly',
    detection: {
      order: ['querystring', 'localStorage', 'cookie', 'navigator'],
      caches: ['localStorage'],
    },
    interpolation: { escapeValue: false },
    returnNull: false,
    react: { useSuspense: false },
  })

// Sync <html lang> attribute
i18n.on('languageChanged', (lng) => {
  if (typeof document !== 'undefined') {
    document.documentElement.setAttribute('lang', lng)
  }
})

// Initialize html lang at startup
if (typeof document !== 'undefined') {
  document.documentElement.setAttribute('lang', i18n.resolvedLanguage || DEFAULT_LOCALE)
}

export default i18n
