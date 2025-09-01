import { useTranslation } from 'react-i18next'
import Seo from '../components/Seo'

export default function Dashboard() {
  const { t } = useTranslation()

  return (
    <>
      <Seo title={t('dashboard.seoTitle')} description={t('dashboard.seoDescription')} />
      <h1>{t('dashboard.title')}</h1>
      <p>{t('dashboard.description')}</p>
    </>
  )
}
