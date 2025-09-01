import { useTranslation } from 'react-i18next'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { SUPPORTED_LOCALES, LOCALE_LABELS } from '../config/locales'

export default function LanguageSwitcher() {
  const { i18n } = useTranslation()
  const current = i18n.resolvedLanguage
  const navigate = useNavigate()
  const location = useLocation()
  const params = useParams()

  const onChange = (e) => {
    const lng = e.target.value
    i18n.changeLanguage(lng)
    try {
      localStorage.setItem('i18nextLng', lng)
    } catch {}
    // Replace locale prefix in current path
    const parts = location.pathname.split('/').filter(Boolean)
    if (SUPPORTED_LOCALES.includes(parts[0])) {
      parts[0] = lng
    } else {
      parts.unshift(lng)
    }
    navigate('/' + parts.join('/'))
  }

  const value = SUPPORTED_LOCALES.includes(params.locale || '') ? params.locale : current

  return (
    <select
      aria-label="Language switcher"
      className="lang-select"
      value={value}
      onChange={onChange}
    >
      {SUPPORTED_LOCALES.map((lng) => (
        <option key={lng} value={lng}>
          {LOCALE_LABELS[lng] || lng}
        </option>
      ))}
    </select>
  )
}
