import { useTranslation } from 'react-i18next'
import Seo from '../components/Seo'

export default function Privacy() {
  const { t } = useTranslation()
  return (
    <>
      <Seo title={t('privacy.seoTitle')} description={t('privacy.seoDescription')} />
      <h1>{t('privacy.title')}</h1>

      <nav aria-label="Table of contents" style={{ margin: '1rem 0' }}>
        <ul>
          <li>
            <a href="#intro">{t('privacy.toc.intro')}</a>
          </li>
          <li>
            <a href="#data">{t('privacy.toc.data')}</a>
          </li>
          <li>
            <a href="#usage">{t('privacy.toc.usage')}</a>
          </li>
          <li>
            <a href="#rights">{t('privacy.toc.rights')}</a>
          </li>
          <li>
            <a href="#contact">{t('privacy.toc.contact')}</a>
          </li>
        </ul>
      </nav>

      <section id="intro">
        <h2>{t('privacy.toc.intro')}</h2>
        <p>{t('privacy.sections.intro')}</p>
      </section>

      <section id="data">
        <h2>{t('privacy.toc.data')}</h2>
        <p>{t('privacy.sections.data')}</p>
      </section>

      <section id="usage">
        <h2>{t('privacy.toc.usage')}</h2>
        <p>{t('privacy.sections.usage')}</p>
      </section>

      <section id="rights">
        <h2>{t('privacy.toc.rights')}</h2>
        <p>{t('privacy.sections.rights')}</p>
      </section>

      <section id="contact">
        <h2>{t('privacy.toc.contact')}</h2>
        <p>{t('privacy.sections.contact')}</p>
      </section>
    </>
  )
}
