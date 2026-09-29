import React, { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { buildTrackingUrl, TRACKING_CARRIERS } from '../src/shipmentTracking'

const ShipmentTracker = () => {
  const { t } = useTranslation()
  const [carrierId, setCarrierId] = useState('dhl')
  const [code, setCode] = useState('')
  const [error, setError] = useState('')

  const carrier = useMemo(
    () => TRACKING_CARRIERS.find((item) => item.id === carrierId) || TRACKING_CARRIERS[0],
    [carrierId]
  )
  const trackBullets = t('shipping.trackBullets', { returnObjects: true })

  const onSubmit = (event) => {
    event.preventDefault()
    const url = buildTrackingUrl(carrierId, code)
    if (!url) {
      setError(t('shipping.trackError'))
      return
    }
    setError('')
    window.open(url, '_blank', 'noopener,noreferrer')
  }

  return (
    <section id='track' className='section-container py-16 md:py-24'>
      <div className='grid lg:grid-cols-2 gap-10 lg:gap-16 items-start'>
        <div>
          <p className='text-xs font-semibold uppercase tracking-[0.18em] text-blue-600 mb-3'>
            {t('shipping.trackEyebrow')}
          </p>
          <h2 className='corp-section-title mb-4'>{t('shipping.trackHeading')}</h2>
          <p className='text-slate-600 leading-relaxed mb-6'>
            {t('shipping.trackLead')}
          </p>
          <ul className='corp-check-list'>
            {(Array.isArray(trackBullets) ? trackBullets : []).map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>

        <form className='corp-feature-card p-6 sm:p-8 md:p-10' onSubmit={onSubmit}>
          <label className='block mb-5'>
            <span className='text-sm font-medium text-slate-700'>{t('shipping.carrier')}</span>
            <select
              value={carrierId}
              onChange={(event) => {
                setCarrierId(event.target.value)
                setError('')
              }}
              className='mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20'
            >
              {TRACKING_CARRIERS.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.id === 'auto' ? t('shipping.autoDetect') : item.label}
                </option>
              ))}
            </select>
            <span className='mt-1.5 block text-xs text-slate-500'>
              {t(`shipping.hints.${carrier.id}`, { defaultValue: carrier.hint })}
            </span>
          </label>

          <label className='block mb-6'>
            <span className='text-sm font-medium text-slate-700'>
              {t('shipping.trackingNumber')} <span className='text-red-500'>*</span>
            </span>
            <input
              type='text'
              value={code}
              onChange={(event) => {
                setCode(event.target.value)
                setError('')
              }}
              placeholder='e.g. 1234567890'
              autoComplete='off'
              spellCheck={false}
              className='mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20'
            />
          </label>

          {error ? <p className='mb-4 text-sm text-red-600'>{error}</p> : null}

          <button type='submit' className='corp-btn w-full sm:w-auto'>
            {t('shipping.trackBtn')}
            <span aria-hidden='true'>→</span>
          </button>
        </form>
      </div>
    </section>
  )
}

export default ShipmentTracker
