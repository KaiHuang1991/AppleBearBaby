import React, { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { LocaleLink } from './LocaleLink'
import { getProductFaqs } from '../src/oemFaq'
import { useShopLocale } from '../src/i18n/localized'

const ProductOemFaq = () => {
  const { t } = useTranslation()
  const locale = useShopLocale()
  const faqs = useMemo(() => getProductFaqs(locale), [locale])

  return (
    <section className='section-container mt-10 sm:mt-14 pb-8' aria-labelledby='product-oem-faq'>
      <div className='max-w-3xl'>
        <p className='text-xs font-semibold uppercase tracking-[0.18em] text-blue-600 mb-3'>
          {t('faq.eyebrow')}
        </p>
        <h2 id='product-oem-faq' className='corp-section-title mb-3'>
          {t('product.faqTitle')}
        </h2>
        <p className='text-slate-600 text-sm leading-relaxed mb-6'>
          <LocaleLink to='/faq' className='text-blue-600 font-medium hover:underline'>
            {t('common.oemFaq')}
          </LocaleLink>
        </p>
        <div className='space-y-3'>
          {faqs.map((item) => (
            <details key={item.question} className='rounded-xl border border-slate-200 bg-white p-4'>
              <summary className='cursor-pointer font-medium text-slate-800'>{item.question}</summary>
              <p className='mt-2 text-sm text-slate-600 leading-relaxed'>{item.answer}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  )
}

export default ProductOemFaq
