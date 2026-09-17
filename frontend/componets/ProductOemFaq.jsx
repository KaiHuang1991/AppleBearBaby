import React from 'react'
import { Link } from 'react-router-dom'
import { PRODUCT_FAQS } from '../src/oemFaq'

const ProductOemFaq = () => (
  <section className='section-container mt-10 sm:mt-14 pb-8' aria-labelledby='product-oem-faq'>
    <div className='max-w-3xl'>
      <p className='text-xs font-semibold uppercase tracking-[0.18em] text-blue-600 mb-3'>
        OEM buying
      </p>
      <h2 id='product-oem-faq' className='corp-section-title mb-3'>
        Factory FAQ for this SKU family
      </h2>
      <p className='text-slate-600 text-sm leading-relaxed mb-6'>
        Same answers we use on wholesale RFQs. Full list:{' '}
        <Link to='/faq' className='text-blue-600 font-medium hover:underline'>
          AppleBear Baby OEM FAQ
        </Link>
        .
      </p>
      <div className='space-y-3'>
        {PRODUCT_FAQS.map((item) => (
          <details key={item.question} className='rounded-xl border border-slate-200 bg-white p-4'>
            <summary className='cursor-pointer font-medium text-slate-800'>{item.question}</summary>
            <p className='mt-2 text-sm text-slate-600 leading-relaxed'>{item.answer}</p>
          </details>
        ))}
      </div>
    </div>
  </section>
)

export default ProductOemFaq
