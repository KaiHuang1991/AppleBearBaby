import React, { useMemo } from 'react'
import { Link } from 'react-router-dom'
import Seo from '../componets/Seo'
import { OEM_FAQS, buildFaqPageJsonLd } from '../src/oemFaq'

const Faq = () => {
  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://applebearbaby.net'
  const jsonLd = useMemo(() => buildFaqPageJsonLd(origin, OEM_FAQS), [origin])

  return (
    <div className='page-shell bg-white'>
      <Seo
        title='OEM FAQ'
        description='AppleBear Baby OEM FAQ from the Yiwu factory: MOQ, lead time, ISO 9001, PP and glass bottles, private-label print, samples, and bulk shipping for wholesale buyers.'
        keywords='OEM baby bottle FAQ, baby bottle MOQ China, OEM lead time, ISO 9001 baby bottle factory Yiwu'
        jsonLd={jsonLd}
      />

      <section className='section-container py-16 md:py-24'>
        <div className='mx-auto w-full max-w-3xl text-center'>
          <p className='text-xs font-semibold uppercase tracking-[0.18em] text-blue-600 mb-3'>
            Wholesale buyers
          </p>
          <h1 className='corp-section-title mb-4'>OEM FAQ for AppleBear Baby</h1>
          <p className='text-slate-600 leading-relaxed mb-4'>
            AppleBear Baby is the brand of Zhejiang YouZhi Maternal and Child Co., Ltd. in Yiwu,
            Zhejiang, China — a baby feeding bottle OEM/ODM manufacturer with ISO 9001:2015.
            These answers are the same figures we use on quotes: carton MOQ on stock molds,
            sample and bulk lead times, materials, print, and how bulk freight is booked.
          </p>
          <p className='text-slate-600 leading-relaxed mb-12'>
            Longer factory notes live on the{' '}
            <Link to='/blogs' className='text-blue-600 font-medium hover:underline'>
              OEM buyer guides
            </Link>
            , including{' '}
            <Link
              to='/blog/moq-samples-and-lead-time-what-to-ask-before-ordering-baby-bottles'
              className='text-blue-600 font-medium hover:underline'
            >
              MOQ, samples, and lead time
            </Link>{' '}
            and{' '}
            <Link
              to='/blog/how-we-ship-oem-orders-from-yiwu-your-agent-alibaba-logistics-or-fcl'
              className='text-blue-600 font-medium hover:underline'
            >
              factory shipping from Yiwu
            </Link>
            .
          </p>

          <div className='space-y-4 text-left'>
            {OEM_FAQS.map((item) => (
              <details
                key={item.question}
                className='corp-feature-card p-5 sm:p-6 group'
              >
                <summary className='cursor-pointer list-none font-semibold text-slate-800 pr-6 relative'>
                  {item.question}
                  <span className='absolute right-0 top-0 text-blue-600 group-open:rotate-45 transition-transform'>
                    +
                  </span>
                </summary>
                <p className='mt-3 text-sm text-slate-600 leading-relaxed'>{item.answer}</p>
              </details>
            ))}
          </div>

          <div className='mt-12 flex flex-wrap justify-center gap-3'>
            <Link to='/contact' className='corp-btn'>
              Request a factory quote
              <span aria-hidden='true'>→</span>
            </Link>
            <Link to='/collection' className='corp-btn-outline'>
              Browse wholesale catalog
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}

export default Faq
