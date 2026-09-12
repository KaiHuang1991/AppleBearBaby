import React from 'react'
import { Link } from 'react-router-dom'
import ProductShipping from '../componets/ProductShipping'

const Shipping = () => {
  return (
    <div className='page-shell bg-white'>
      <section className='page-hero page-hero--tall' style={{ background: 'linear-gradient(135deg, #eff6ff 0%, #e0f2fe 48%, #ffffff 100%)' }}>
        <div className='page-hero-content'>
          <h1>Shipping &amp; returns for wholesale buyers</h1>
          <p>
            AppleBear Baby ships samples and production lots from Yiwu, Zhejiang. Choose a courier for samples, or sea freight / your own China forwarder for bulk.
          </p>
        </div>
      </section>

      <section className='section-container py-12 md:py-16'>
        <ProductShipping />

        <div className='mt-10 grid gap-6 md:grid-cols-2'>
          <div className='rounded-2xl border border-slate-200 p-6'>
            <h2 className='text-lg font-semibold text-slate-900 mb-3'>How to quote freight</h2>
            <p className='text-sm text-slate-600 leading-relaxed mb-3'>
              Send destination country, sample or bulk quantity, and whether you already have a China forwarder. We reply with a packing list estimate and the available lanes.
            </p>
            <Link to='/contact' className='text-sm font-semibold text-blue-600 hover:underline'>
              Request a shipping quote
            </Link>
          </div>
          <div id='returns' className='rounded-2xl border border-slate-200 p-6'>
            <h2 className='text-lg font-semibold text-slate-900 mb-3'>Return policy</h2>
            <p className='text-sm text-slate-600 leading-relaxed'>
              Report factory quality defects within 15 days of arrival, with photos and order details. We arrange replacement or credit after inspection. Custom OEM, printed, or made-to-order goods cannot be returned because of a change of mind. Return shipping is quoted case by case.
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}

export default Shipping
