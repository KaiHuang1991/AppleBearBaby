import React from 'react'
import { useTranslation } from 'react-i18next'
import { LocaleLink } from './LocaleLink'
import { BULK_OPTIONS, RETURN_POLICY_DAYS, SAMPLE_CARRIERS } from '../src/commercePolicy'
import '../styles/ProductDescription.css'

const IconParcel = () => (
  <svg className='product-ship-icon' width='40' height='40' viewBox='0 0 48 48' fill='none' aria-hidden='true'>
    <rect x='8' y='14' width='32' height='24' rx='3' stroke='currentColor' strokeWidth='1.8' />
    <path d='M8 22h32M24 14v24M16 14l8-6 8 6' stroke='currentColor' strokeWidth='1.8' strokeLinejoin='round' />
  </svg>
)

const IconShip = () => (
  <svg className='product-ship-icon' width='40' height='40' viewBox='0 0 48 48' fill='none' aria-hidden='true'>
    <path d='M8 30l4 8h24l4-8H8z' stroke='currentColor' strokeWidth='1.8' strokeLinejoin='round' />
    <path d='M12 30V18h16l6 12' stroke='currentColor' strokeWidth='1.8' strokeLinejoin='round' />
    <path d='M20 18V12h8v6' stroke='currentColor' strokeWidth='1.8' />
    <path d='M6 38c4 3 10 4 18 4s14-1 18-4' stroke='currentColor' strokeWidth='1.6' strokeLinecap='round' />
  </svg>
)

const ProductShipping = ({ compact = false }) => {
  const { t } = useTranslation()
  return (
    <section className={`product-shipping ${compact ? 'product-shipping--compact' : ''}`} aria-labelledby='product-shipping-title'>
      <div className='product-shipping-pattern' aria-hidden='true' />
      <div className='product-shipping-head'>
        <p className='product-shipping-kicker'>{t('product.shipKicker')}</p>
        <h2 id='product-shipping-title' className='product-shipping-title'>
          {t('product.shipTitle')}
        </h2>
        <p className='product-shipping-lead'>
          {t('product.shipLead')}
        </p>
      </div>

      <div className='product-shipping-grid'>
        <article className='product-ship-card product-ship-card--sample'>
          <div className='product-ship-card-top'>
            <span className='product-ship-badge'>{t('product.samples')}</span>
            <IconParcel />
          </div>
          <h3>{t('product.samplesTitle')}</h3>
          <p>{t('product.samplesBody')}</p>
          <ul>
            {SAMPLE_CARRIERS.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </article>

        <article className='product-ship-card product-ship-card--bulk'>
          <div className='product-ship-card-top'>
            <span className='product-ship-badge product-ship-badge--bulk'>{t('product.bulk')}</span>
            <IconShip />
          </div>
          <h3>{t('product.bulkTitle')}</h3>
          <p>{t('product.bulkBody')}</p>
          <ul>
            {BULK_OPTIONS.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </article>
      </div>

      <div id='returns' className='product-shipping-return'>
        <p>
          <strong>{t('product.returnsLabel')}</strong> {t('product.returnsBody', { days: RETURN_POLICY_DAYS })}
        </p>
        <LocaleLink to='/shipping' className='product-shipping-link'>
          {t('product.fullPolicy')}
        </LocaleLink>
        {' · '}
        <LocaleLink to='/shipping#track' className='product-shipping-link'>
          {t('product.track')}
        </LocaleLink>
      </div>
    </section>
  )
}

export default ProductShipping
