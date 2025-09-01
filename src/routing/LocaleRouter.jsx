import { Outlet, useNavigate, useParams } from 'react-router-dom'
import { useEffect } from 'react'
import i18n from '../i18n'
import { SUPPORTED_LOCALES, DEFAULT_LOCALE } from '../config/locales'

export default function LocaleRouter() {
  const { locale } = useParams()
  const navigate = useNavigate()

  useEffect(() => {
    // If invalid locale segment, redirect to preferred
    if (!SUPPORTED_LOCALES.includes(locale)) {
      const preferred = getPreferredLocale()
      navigate(`/${preferred}`, { replace: true })
      return
    }
    if (i18n.resolvedLanguage !== locale) {
      i18n.changeLanguage(locale)
      try {
        localStorage.setItem('i18nextLng', locale)
      } catch {}
    }
  }, [locale, navigate])

  return <Outlet />
}

export function RedirectToPreferredLocale() {
  const navigate = useNavigate()
  useEffect(() => {
    const preferred = getPreferredLocale()
    navigate(`/${preferred}`, { replace: true })
  }, [navigate])
  return null
}

function getPreferredLocale() {
  try {
    const persisted = localStorage.getItem('i18nextLng')
    if (persisted && SUPPORTED_LOCALES.includes(persisted)) return persisted
  } catch {}
  const detected = i18n.resolvedLanguage || DEFAULT_LOCALE
  if (SUPPORTED_LOCALES.includes(detected)) return detected
  return DEFAULT_LOCALE
}
