import React, { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { LocaleLink } from '../componets/LocaleLink'
import Seo from '../componets/Seo'
import { buildFaqPageJsonLd, getOemFaqs } from '../src/oemFaq'
import { useShopLocale } from '../src/i18n/localized'

const Faq = () => {
  const { t } = useTranslation()
  const locale = useShopLocale()
  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://applebearbaby.net'
  const faqs = useMemo(() => getOemFaqs(locale), [locale])
  const jsonLd = useMemo(() => buildFaqPageJsonLd(origin, faqs, locale), [origin, faqs, locale])
  const seo = t('seo./faq', { returnObjects: true })

  return (
    <div className='page-shell bg-white'>
      <Seo
        title={seo.title || t('faq.title')}
        description={seo.description}
        keywords='OEM baby bottle FAQ, baby bottle MOQ China, OEM lead time, ISO 9001 baby bottle factory Yiwu'
        jsonLd={jsonLd}
      />

      <section className='section-container py-16 md:py-24'>
        <div className='mx-auto w-full max-w-3xl text-center'>
          <p className='text-xs font-semibold uppercase tracking-[0.18em] text-blue-600 mb-3'>
            {t('faq.eyebrow')}
          </p>
          <h1 className='corp-section-title mb-4'>{t('faq.title')}</h1>
          <p className='text-slate-600 leading-relaxed mb-4'>{t('faq.lead')}</p>
          <p className='text-slate-600 leading-relaxed mb-12'>
            {t('faq.more')}{' '}
            <LocaleLink to='/blogs' className='text-blue-600 font-medium hover:underline'>
              {t('faq.guides')}
            </LocaleLink>
            {', '}
            <LocaleLink
              to='/blog/moq-samples-and-lead-time-what-to-ask-before-ordering-baby-bottles'
              className='text-blue-600 font-medium hover:underline'
            >
              {t('faq.moq')}
            </LocaleLink>
            {', '}
            <LocaleLink
              to='/blog/how-we-ship-oem-orders-from-yiwu-your-agent-alibaba-logistics-or-fcl'
              className='text-blue-600 font-medium hover:underline'
            >
              {t('faq.ship')}
            </LocaleLink>
            .
          </p>

          <div className='space-y-4 text-left'>
            {faqs.map((item) => (
              <details
                key={item.question}
                className='corp-feature-card p-5 sm:p-6 group'
              >
                <summary className='cursor-pointer list-none font-semibold text-slate-800 pr-6 relative'>
                  {item.question}
                  <span className='absolute right-0 top-0 text-blue-600 group-open:rotate-45 transition-transform rtl:right-auto rtl:left-0'>
                    +
                  </span>
                </summary>
                <p className='mt-3 text-sm text-slate-600 leading-relaxed'>{item.answer}</p>
              </details>
            ))}
          </div>

          <div className='mt-12 flex flex-wrap justify-center gap-3'>
            <LocaleLink to='/contact' className='corp-btn'>
              {t('common.requestQuote')}
              <span aria-hidden='true'>→</span>
            </LocaleLink>
            <LocaleLink to='/collection' className='corp-btn-outline'>
              {t('footer.catalog')}
            </LocaleLink>
          </div>
        </div>
      </section>
    </div>
  )
}

export default Faq
