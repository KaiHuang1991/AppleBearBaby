import React from 'react'
import { useTranslation } from 'react-i18next'
import { LocaleLink } from '../componets/LocaleLink'
import { assets } from '../src/assets/assets'
import ShipmentTracker from '../componets/ShipmentTracker'
import { BULK_OPTIONS, RETURN_POLICY_DAYS, SAMPLE_CARRIERS } from '../src/commercePolicy'

const IconBox = () => (
  <svg className='w-6 h-6' fill='none' stroke='currentColor' viewBox='0 0 24 24' aria-hidden='true'>
    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={1.8} d='M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4' />
  </svg>
)

const IconShip = () => (
  <svg className='w-6 h-6' fill='none' stroke='currentColor' viewBox='0 0 24 24' aria-hidden='true'>
    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={1.8} d='M3 17l1.5-4h15L21 17M4 17h16l-1 3H5l-1-3zm4-8h3V6H8v3zm5 0h3V6h-3v3zM4 13h16' />
  </svg>
)

const IconQuote = () => (
  <svg className='w-6 h-6' fill='none' stroke='currentColor' viewBox='0 0 24 24' aria-hidden='true'>
    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={1.8} d='M8 7V3m8 4V3M4 11h16M5 5h14a2 2 0 012 2v12a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2z' />
  </svg>
)

const IconShield = () => (
  <svg className='w-6 h-6' fill='none' stroke='currentColor' viewBox='0 0 24 24' aria-hidden='true'>
    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={1.8} d='M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z' />
  </svg>
)

const STEPS = [
  {
    n: '01',
    title: 'Share destination & volume',
    text: 'Country, sample or bulk quantity, and whether you already have a China forwarder.',
  },
  {
    n: '02',
    title: 'Packing list estimate',
    text: 'We reply with carton sizes, weight, and the lanes that fit the shipment.',
  },
  {
    n: '03',
    title: 'Confirm the lane',
    text: 'Pick a courier for samples, or FCL / LCL / your forwarder for production lots.',
  },
]

const Shipping = () => {
  const { t } = useTranslation()
  const steps = t('shipping.steps', { returnObjects: true })
  const sampleCarriers = t('shipping.sampleCarriers', { returnObjects: true })
  const bulkOptions = t('shipping.bulkOptions', { returnObjects: true })
  const returnBullets = t('shipping.returnBullets', { returnObjects: true })
  return (
    <div className='page-shell bg-white'>
      <section
        className='page-hero page-hero--shipping'
        style={{ backgroundImage: `url(${assets.shipping_hero})` }}
      >
        <div className='page-hero-content'>
          <p className='mb-3 text-xs font-semibold uppercase tracking-[0.22em] text-blue-100'>
            {t('shipping.eyebrow')}
          </p>
          <h1>{t('shipping.heroTitle')}</h1>
          <p>
            {t('shipping.heroText')}
          </p>
        </div>
      </section>

      <section className='corp-stat-bar py-10 md:py-12'>
        <div className='section-container grid grid-cols-2 lg:grid-cols-4 gap-8'>
          <div className='text-center px-2'>
            <p className='text-2xl md:text-3xl font-bold text-blue-600'>Yiwu</p>
            <p className='text-sm text-slate-600 mt-1'>{t('shipping.origin')}</p>
          </div>
          <div className='text-center px-2'>
            <p className='text-2xl md:text-3xl font-bold text-blue-600'>{t('shipping.lanesCount')}</p>
            <p className='text-sm text-slate-600 mt-1'>{t('shipping.lanes')}</p>
          </div>
          <div className='text-center px-2'>
            <p className='text-2xl md:text-3xl font-bold text-blue-600'>FCL / LCL</p>
            <p className='text-sm text-slate-600 mt-1'>{t('shipping.ocean')}</p>
          </div>
          <div className='text-center px-2'>
            <p className='text-2xl md:text-3xl font-bold text-blue-600'>{t('shipping.days', { count: RETURN_POLICY_DAYS })}</p>
            <p className='text-sm text-slate-600 mt-1'>{t('shipping.returns')}</p>
          </div>
        </div>
      </section>

      <section className='section-container py-16 md:py-24'>
        <div className='text-center mb-12'>
          <h2 className='corp-section-title'>{t('shipping.laneTitle')}</h2>
          <p className='corp-section-subtitle mx-auto'>
            {t('shipping.laneSubtitle')}
          </p>
        </div>

        <div className='grid md:grid-cols-2 gap-6 lg:gap-8'>
          <article className='corp-feature-card h-full'>
            <div className='flex items-center justify-between gap-3 mb-5'>
              <div className='corp-icon-circle'>
                <IconBox />
              </div>
              <span className='inline-flex items-center rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-blue-700'>
                {t('shipping.samplesBadge')}
              </span>
            </div>
            <h3 className='text-xl font-semibold text-slate-900 mb-3'>{t('shipping.samplesHeading')}</h3>
            <p className='text-sm text-slate-600 leading-relaxed mb-5'>
              {t('shipping.samplesBody')}
            </p>
            <ul className='flex flex-wrap gap-2'>
              {(Array.isArray(sampleCarriers) ? sampleCarriers : SAMPLE_CARRIERS).map((item) => (
                <li
                  key={item}
                  className='rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-700'
                >
                  {item}
                </li>
              ))}
            </ul>
          </article>

          <article className='corp-feature-card h-full'>
            <div className='flex items-center justify-between gap-3 mb-5'>
              <div className='corp-icon-circle'>
                <IconShip />
              </div>
              <span className='inline-flex items-center rounded-full bg-sky-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-sky-700'>
                {t('shipping.bulkBadge')}
              </span>
            </div>
            <h3 className='text-xl font-semibold text-slate-900 mb-3'>{t('shipping.bulkHeading')}</h3>
            <p className='text-sm text-slate-600 leading-relaxed mb-5'>
              {t('shipping.bulkBody')}
            </p>
            <ul className='flex flex-wrap gap-2'>
              {(Array.isArray(bulkOptions) ? bulkOptions : BULK_OPTIONS).map((item) => (
                <li
                  key={item}
                  className='rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-700'
                >
                  {item}
                </li>
              ))}
            </ul>
          </article>
        </div>
      </section>

      <section className='section-alt'>
        <ShipmentTracker />
      </section>

      <section className='section-container py-16 md:py-24'>
          <div className='text-center mb-12'>
            <h2 className='corp-section-title'>{t('shipping.stepsTitle')}</h2>
            <p className='corp-section-subtitle mx-auto'>
              {t('shipping.stepsSubtitle')}
            </p>
          </div>
          <div className='grid md:grid-cols-3 gap-6'>
            {(Array.isArray(steps) ? steps : STEPS).map((step, i) => (
              <div key={STEPS[i]?.n || i} className='corp-feature-card'>
                <p className='text-xs font-bold tracking-[0.18em] text-blue-600 mb-3'>{t('shipping.stepLabel', { n: STEPS[i]?.n })}</p>
                <h3 className='font-semibold text-slate-800 mb-2'>{step.title}</h3>
                <p className='text-sm text-slate-600 leading-relaxed'>{step.text}</p>
              </div>
            ))}
          </div>
      </section>

      <section id='returns' className='section-container py-16 md:py-24'>
        <div className='grid lg:grid-cols-2 gap-10 lg:gap-16 items-start'>
          <div>
            <div className='corp-icon-circle mb-5'>
              <IconShield />
            </div>
            <h2 className='corp-section-title mb-4'>{t('shipping.returnTitle')}</h2>
            <p className='text-slate-600 leading-relaxed mb-6'>
              {t('shipping.returnText', { days: RETURN_POLICY_DAYS })}
            </p>
            <ul className='corp-check-list'>
              {(Array.isArray(returnBullets) ? returnBullets : []).map((item) => (
                <li key={item}>{String(item).replace(/\{\{days\}\}/g, String(RETURN_POLICY_DAYS))}</li>
              ))}
            </ul>
          </div>

          <div className='corp-feature-card p-8 md:p-10'>
            <div className='corp-icon-circle mb-5'>
              <IconQuote />
            </div>
            <h2 className='text-2xl font-bold text-slate-800 mb-2'>{t('shipping.quoteTitle')}</h2>
            <p className='text-slate-500 text-sm leading-relaxed mb-8'>
              {t('shipping.quoteText')}
            </p>
            <div className='flex flex-wrap gap-3'>
              <LocaleLink to='/contact' className='corp-btn'>
                {t('shipping.quoteCta')}
                <span aria-hidden='true'>→</span>
              </LocaleLink>
              <LocaleLink to='/collection' className='corp-btn-outline'>
                {t('shipping.browseCatalog')}
              </LocaleLink>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default Shipping
