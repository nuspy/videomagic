import { useParams } from 'react-router-dom'
import i18n from '../i18n'
import { SUPPORTED_LOCALES, DEFAULT_LOCALE } from '../config/locales'

export default function useLocalePath() {
  const params = useParams()
  const current = params.locale && SUPPORTED_LOCALES.includes(params.locale)
    ? params.locale
    : (SUPPORTED_LOCALES.includes(i18n.resolvedLanguage) ? i18n.resolvedLanguage : DEFAULT_LOCALE)

  return (path = '/') => {
    const normalized = path.startsWith('/') ? path.slice(1) : path
    return `/${current}${normalized ? '/' + normalized : ''}`
  }
}
