import React from 'react'
import { Link } from 'react-router-dom'
import { assets } from '../src/assets/assets'

const FeatureIcon = ({ children }) => (
  <div className='corp-icon-circle mb-4'>{children}</div>
)

const StatItem = ({ value, label }) => (
  <div className='text-center px-4'>
    <p className='text-3xl md:text-4xl font-bold text-blue-600'>{value}</p>
    <p className='text-sm text-slate-600 mt-1'>{label}</p>
  </div>
)

const About = () => {
  return (
    <div className='page-shell bg-white'>
      <section
        className='page-hero page-hero--tall'
        style={{ backgroundImage: `url(${assets.about_hero})`, backgroundPosition: 'center center' }}
      >
        <div className='page-hero-content'>
          <h1>About Applebear: Trusted Partner in Baby Product Manufacturing</h1>
          <p>
            We are a professional baby product manufacturer dedicated to quality, safety, and innovation — serving wholesale buyers worldwide.
          </p>
        </div>
      </section>

      <section className='section-container py-16 md:py-24'>
        <div className='grid lg:grid-cols-2 gap-10 lg:gap-16 items-center'>
          <img
            className='corp-image w-full aspect-[16/9] object-cover object-center'
            src={assets.about_company}
            alt='ZheJiang YouZhi Maternal and Child Co., LTD company building'
          />
          <div>
            <h2 className='corp-section-title mb-4'>Our Company</h2>
            <p className='text-slate-600 leading-relaxed mb-6'>
              Established in 1998, Applebear has grown into a trusted wholesale supplier serving healthcare facilities, hospitals, daycare centers, and retailers across the globe. Our comprehensive product line includes feeding supplies, safety products, and hygiene essentials.
            </p>
            <ul className='corp-check-list mb-8'>
              <li>International safety standards compliance</li>
              <li>Rigorous quality control at every production stage</li>
              <li>Competitive wholesale pricing for bulk orders</li>
              <li>Reliable supply chain and dedicated account support</li>
            </ul>
            <Link to='/contact' className='corp-btn'>
              Learn More About Us
              <span aria-hidden='true'>→</span>
            </Link>
          </div>
        </div>
      </section>

      <section className='section-alt py-16 md:py-24'>
        <div className='section-container'>
          <div className='text-center mb-12'>
            <h2 className='corp-section-title'>Why Choose Applebear</h2>
            <p className='corp-section-subtitle mx-auto'>
              We combine manufacturing excellence with wholesale-friendly service to help your business grow.
            </p>
          </div>
          <div className='grid sm:grid-cols-2 lg:grid-cols-4 gap-6'>
            <div className='corp-feature-card text-center'>
              <FeatureIcon>
                <svg className='w-6 h-6' fill='none' stroke='currentColor' viewBox='0 0 24 24'><path strokeLinecap='round' strokeLinejoin='round' strokeWidth={1.8} d='M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z' /></svg>
              </FeatureIcon>
              <h3 className='font-semibold text-slate-800 mb-2'>Quality Assurance</h3>
              <p className='text-sm text-slate-600 leading-relaxed'>All products meet or exceed international safety standards with rigorous QC processes.</p>
            </div>
            <div className='corp-feature-card text-center'>
              <FeatureIcon>
                <svg className='w-6 h-6' fill='none' stroke='currentColor' viewBox='0 0 24 24'><path strokeLinecap='round' strokeLinejoin='round' strokeWidth={1.8} d='M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4' /></svg>
              </FeatureIcon>
              <h3 className='font-semibold text-slate-800 mb-2'>Bulk Ordering</h3>
              <p className='text-sm text-slate-600 leading-relaxed'>Streamlined wholesale ordering with volume discounts and reliable fulfillment.</p>
            </div>
            <div className='corp-feature-card text-center'>
              <FeatureIcon>
                <svg className='w-6 h-6' fill='none' stroke='currentColor' viewBox='0 0 24 24'><path strokeLinecap='round' strokeLinejoin='round' strokeWidth={1.8} d='M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z' /></svg>
              </FeatureIcon>
              <h3 className='font-semibold text-slate-800 mb-2'>Dedicated Support</h3>
              <p className='text-sm text-slate-600 leading-relaxed'>Personal account managers and responsive support for wholesale clients.</p>
            </div>
            <div className='corp-feature-card text-center'>
              <FeatureIcon>
                <svg className='w-6 h-6' fill='none' stroke='currentColor' viewBox='0 0 24 24'><path strokeLinecap='round' strokeLinejoin='round' strokeWidth={1.8} d='M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z' /></svg>
              </FeatureIcon>
              <h3 className='font-semibold text-slate-800 mb-2'>Global Reach</h3>
              <p className='text-sm text-slate-600 leading-relaxed'>Serving healthcare and retail partners across international markets since 1998.</p>
            </div>
          </div>
        </div>
      </section>

      <section className='corp-stat-bar py-12 md:py-14'>
        <div className='section-container grid grid-cols-2 lg:grid-cols-4 gap-8'>
          <StatItem value='20+' label='Years Experience' />
          <StatItem value='50+' label='Team Members' />
          <StatItem value='20+' label='Product Lines' />
          <StatItem value='30+' label='Countries Served' />
        </div>
      </section>

      <section className='section-container py-16 md:py-24'>
        <div className='grid lg:grid-cols-2 gap-10 lg:gap-16 items-center'>
          <div className='order-2 lg:order-1'>
            <h2 className='corp-section-title mb-4'>Our Factory</h2>
            <p className='text-slate-600 leading-relaxed mb-6'>
              From design to production, every step follows strict national quality system requirements. Our advanced manufacturing facilities ensure each product meets international testing standards.
            </p>
            <ul className='corp-check-list mb-8'>
              <li>Advanced automated production lines</li>
              <li>Certified quality management systems</li>
              <li>Comprehensive product testing laboratory</li>
              <li>Scalable capacity for bulk wholesale orders</li>
            </ul>
            <Link to='/videos' className='corp-btn'>
              View Factory Tour
              <span aria-hidden='true'>→</span>
            </Link>
          </div>
          <img
            className='corp-image w-full aspect-[4/3] object-cover order-1 lg:order-2'
            src={assets.about_factory}
            alt='Applebear manufacturing facility with automated production lines'
          />
        </div>
      </section>

      <section className='section-alt py-16 md:py-24'>
        <div className='section-container'>
          <div className='grid lg:grid-cols-2 gap-10 lg:gap-16 items-center'>
            <img
              className='corp-image w-full aspect-[4/3] object-cover'
              src={assets.office}
              alt='Applebear team'
            />
            <div>
              <h2 className='corp-section-title mb-4'>Our Team</h2>
              <p className='text-slate-600 leading-relaxed mb-6'>
                With 100+ professionals across design, production, quality control, and sales, we deliver consistent quality and reliable supply chain management for wholesale partners.
              </p>
              <ul className='corp-check-list mb-8'>
                <li>Experienced R&D and product design team</li>
                <li>Dedicated QC specialists on every line</li>
                <li>Multilingual sales and support staff</li>
                <li>Long-term partnerships with global buyers</li>
              </ul>
              <Link to='/contact' className='corp-btn'>
                Contact Our Team
                <span aria-hidden='true'>→</span>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default About
