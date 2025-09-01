import { useTranslation } from 'react-i18next'
import Seo from '../components/Seo'

export default function Home() {
  const { t } = useTranslation()

  return (
    <>
      <Seo title={t('home.seoTitle')} description={t('home.seoDescription')} />
      <h1>{t('home.title')}</h1>
      <p>{t('home.description')}</p>
    </>
  )
}
