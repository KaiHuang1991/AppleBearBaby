import React, { useMemo, useState } from 'react'
import { buildTrackingUrl, TRACKING_CARRIERS } from '../src/shipmentTracking'

const ShipmentTracker = () => {
  const [carrierId, setCarrierId] = useState('dhl')
  const [code, setCode] = useState('')
  const [error, setError] = useState('')

  const carrier = useMemo(
    () => TRACKING_CARRIERS.find((item) => item.id === carrierId) || TRACKING_CARRIERS[0],
    [carrierId]
  )

  const onSubmit = (event) => {
    event.preventDefault()
    const url = buildTrackingUrl(carrierId, code)
    if (!url) {
      setError('Enter the tracking number from your shipping notice.')
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
            Track a shipment
          </p>
          <h2 className='corp-section-title mb-4'>Track a courier shipment</h2>
          <p className='text-slate-600 leading-relaxed mb-6'>
            Paste the number we send after the sample or production lot leaves Yiwu. China Post, DHL, FedEx, and TNT open on the carrier site. We do not store the number.
          </p>
          <ul className='corp-check-list'>
            <li>Sea freight uses a bill of lading or your China forwarder portal, not this box</li>
            <li>If the lane is unclear, choose Auto detect (17TRACK)</li>
          </ul>
        </div>

        <form className='corp-feature-card p-6 sm:p-8 md:p-10' onSubmit={onSubmit}>
          <label className='block mb-5'>
            <span className='text-sm font-medium text-slate-700'>Carrier</span>
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
                  {item.label}
                </option>
              ))}
            </select>
            <span className='mt-1.5 block text-xs text-slate-500'>{carrier.hint}</span>
          </label>

          <label className='block mb-6'>
            <span className='text-sm font-medium text-slate-700'>
              Tracking number <span className='text-red-500'>*</span>
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
            Track shipment
            <span aria-hidden='true'>→</span>
          </button>
        </form>
      </div>
    </section>
  )
}

export default ShipmentTracker
