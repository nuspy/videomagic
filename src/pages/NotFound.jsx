import { useTranslation } from 'react-i18next'
import Seo from '../components/Seo'

export default function NotFound() {
  const { t } = useTranslation()

  return (
    <>
      <Seo title={t('notFound.seoTitle')} description={t('notFound.seoDescription')} />
      <h1>{t('notFound.title')}</h1>
      <p>{t('notFound.description')}</p>
    </>
  )
}
