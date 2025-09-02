import { useTranslation } from 'react-i18next'
import Seo from '../components/Seo'

export default function Terms() {
  const { t } = useTranslation()
  return (
    <>
      <Seo title={t('terms.seoTitle')} description={t('terms.seoDescription')} />
      <h1>{t('terms.title')}</h1>

      <nav aria-label="Table of contents" style={{ margin: '1rem 0' }}>
        <ul>
          <li>
            <a href="#intro">{t('terms.toc.intro')}</a>
          </li>
          <li>
            <a href="#use">{t('terms.toc.use')}</a>
          </li>
          <li>
            <a href="#payments">{t('terms.toc.payments')}</a>
          </li>
          <li>
            <a href="#termination">{t('terms.toc.termination')}</a>
          </li>
          <li>
            <a href="#governing-law">{t('terms.toc.law')}</a>
          </li>
        </ul>
      </nav>

      <section id="intro">
        <h2>{t('terms.toc.intro')}</h2>
        <p>{t('terms.sections.intro')}</p>
      </section>

      <section id="use">
        <h2>{t('terms.toc.use')}</h2>
        <p>{t('terms.sections.use')}</p>
      </section>

      <section id="payments">
        <h2>{t('terms.toc.payments')}</h2>
        <p>{t('terms.sections.payments')}</p>
      </section>

      <section id="termination">
        <h2>{t('terms.toc.termination')}</h2>
        <p>{t('terms.sections.termination')}</p>
      </section>

      <section id="governing-law">
        <h2>{t('terms.toc.law')}</h2>
        <p>{t('terms.sections.law')}</p>
      </section>
    </>
  )
}
