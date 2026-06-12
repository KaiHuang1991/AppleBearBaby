import React from 'react'
import { Link } from 'react-router-dom'
import { homeImages, factoryCarousel } from '../src/assets/galleryAssets'
import { productCategories } from '../src/assets/categoryAssets'
import { certificationItems } from '../src/assets/certificationAssets'
import OemFlowSection from './OemFlowSection'
import HomeSection, { SectionHeader } from './HomeSection'
import HomeImage from './HomeImage'
import AnimatedMetric from './AnimatedMetric'

const WhyChooseIcon = ({ type }) => {
  const props = { width: 22, height: 22, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.75, strokeLinecap: 'round', strokeLinejoin: 'round' }

  switch (type) {
    case 'service':
      return (
        <svg {...props} aria-hidden='true'>
          <path d='M3 21h18' />
          <path d='M5 21V7l8-4v18' />
          <path d='M19 21V11l-6-4' />
          <path d='M9 9v0' /><path d='M9 12v0' /><path d='M9 15v0' /><path d='M9 18v0' />
        </svg>
      )
    case 'quality':
      return (
        <svg {...props} aria-hidden='true'>
          <path d='M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z' />
          <path d='M9 12l2 2 4-4' />
        </svg>
      )
    case 'experience':
      return (
        <svg {...props} aria-hidden='true'>
          <circle cx='12' cy='12' r='10' />
          <path d='M12 6v6l4 2' />
        </svg>
      )
    case 'team':
      return (
        <svg {...props} aria-hidden='true'>
          <path d='M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2' />
          <circle cx='9' cy='7' r='4' />
          <path d='M22 21v-2a4 4 0 0 0-3-3.87' />
          <path d='M16 3.13a4 4 0 0 1 0 7.75' />
        </svg>
      )
    case 'equipment':
      return (
        <svg {...props} aria-hidden='true'>
          <rect x='2' y='6' width='20' height='12' rx='2' />
          <path d='M6 10h.01' /><path d='M10 10h.01' /><path d='M14 10h.01' />
          <path d='M6 14h12' />
          <path d='M12 6V3' />
        </svg>
      )
    case 'support':
      return (
        <svg {...props} aria-hidden='true'>
          <path d='M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z' />
          <path d='M8 10h.01' /><path d='M12 10h.01' /><path d='M16 10h.01' />
        </svg>
      )
    default:
      return null
  }
}

const WhyChooseCard = ({ icon, title, description }) => (
  <div className='home-why-card'>
    <span className='home-why-icon'>
      <WhyChooseIcon type={icon} />
    </span>
    <h3 className='home-why-title'>{title}</h3>
    <p className='home-why-desc'>{description}</p>
  </div>
)

const CertificationCard = ({ image, title }) => (
  <div className='home-cert-card'>
    <div className='home-cert-frame'>
      <div className='home-cert-image-wrap'>
        <HomeImage
          src={image}
          alt={title}
          className='w-full h-full object-cover object-top'
          wrapperClassName='w-full h-full'
        />
      </div>
    </div>
    <div className='home-cert-caption'>
      <p className='font-semibold text-xs sm:text-sm text-slate-800 leading-snug'>{title}</p>
    </div>
  </div>
)

const CategoryCard = ({ image, title, slug }) => (
  <Link to={slug ? `/collection/${slug}` : '/collection'} className='group home-category-card corp-feature-card p-0 overflow-hidden block h-full'>
    <div className='relative aspect-square overflow-hidden bg-slate-50'>
      <HomeImage
        src={image}
        alt={title}
        className='w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300'
        wrapperClassName='w-full h-full'
      />
    </div>
    <div className='px-3 py-4 text-center'>
      <h3 className='font-semibold text-sm sm:text-base text-slate-800 group-hover:text-blue-600 transition-colors'>{title}</h3>
    </div>
  </Link>
)

const WHY_CHOOSE = [
  { icon: 'service', title: 'One-Stop Service', description: 'From mold development to mass production, we handle everything in-house.' },
  { icon: 'quality', title: 'Strict Quality Control', description: 'Rigorous inspection processes ensure every batch meets international standards.' },
  { icon: 'experience', title: '20+ Years Experience', description: 'Trusted wholesale partner serving healthcare facilities and retailers worldwide.' },
  { icon: 'team', title: '50+ Team Members', description: 'Skilled workforce with professional engineers and QC specialists.' },
  { icon: 'equipment', title: 'Advanced Equipment', description: 'Modern injection molding and automated assembly production lines.' },
  { icon: 'support', title: '24h Online Support', description: 'Dedicated account managers respond to wholesale inquiries promptly.' },
]

const PROCESS_STEPS = [
  { step: '01', title: 'Requirement Review', description: 'Understand your specs and goals' },
  { step: '02', title: 'Product Design', description: 'Industrial design and 3D modeling' },
  { step: '03', title: 'Mold Development', description: 'Precision mold manufacturing' },
  { step: '04', title: 'Sample Confirmation', description: 'Client-approved prototypes' },
  { step: '05', title: 'Mass Production', description: 'Scalable batch manufacturing' },
  { step: '06', title: 'Delivery', description: 'Safe packaging and on-time shipping' },
]

const MANUFACTURING_METRICS = [
  { value: '12,000㎡', label: 'Factory Area' },
  { value: '7', label: 'Production Lines' },
  { value: '50+', label: 'Skilled Workers' },
  { value: '2.5M+', label: 'Monthly Output' },
]

const HomeLanding = () => {
  return (
    <>
      <section
        className='home-section home-section--hero home-hero relative flex items-center'
        style={{ backgroundImage: `url(${homeImages.hero})` }}
      >
        <div className='home-section-bg home-hero-overlay' aria-hidden='true' />
        <div className='section-container relative z-10 py-16 md:py-24'>
          <div className='max-w-2xl home-hero-content'>
            <span className='home-hero-badge'>OEM / ODM Manufacturer</span>
            <h1 className='text-3xl sm:text-4xl lg:text-5xl font-bold text-white leading-tight mb-5'>
              One-Stop Baby Bottle &amp; Sippy Cup Manufacturer
            </h1>
            <p className='text-base sm:text-lg text-slate-200 leading-relaxed mb-8 max-w-xl'>
              Professional OEM/ODM factory with over 20 years of experience — from custom design and mold development to mass production for wholesale buyers worldwide.
            </p>
            <div className='flex flex-wrap gap-3'>
              <Link to='/collection' className='corp-btn px-6 py-3'>
                Browse Wholesale Catalog
                <span aria-hidden='true'>→</span>
              </Link>
              <Link to='/contact' className='corp-btn-outline bg-white/10 text-white border-white/30 hover:bg-white/20 hover:border-white/50 px-6 py-3'>
                Get Free Quote
              </Link>
            </div>
          </div>
        </div>
      </section>

      <HomeSection variant='stats' innerClassName='home-stat-grid'>
        <AnimatedMetric value='20+' label='Years Experience' />
        <AnimatedMetric value='30+' label='Export Countries' />
        <AnimatedMetric value='20+' label='Product Lines' />
      </HomeSection>

      <HomeSection variant='categories'>
        <SectionHeader
          index={1}
          eyebrow='Product Range'
          title='Our Product'
          highlight='Categories'
          subtitle='Premium baby feeding and care products for wholesale and OEM partners.'
        />
        <div className='grid grid-cols-2 md:grid-cols-4 gap-4 lg:gap-6'>
          {productCategories.map((item) => (
            <CategoryCard key={item.slug} image={item.image} title={item.title} slug={item.slug} />
          ))}
        </div>
        <div className='text-center mt-10'>
          <Link to='/collection' className='corp-btn-outline px-8'>
            View All Products
            <span aria-hidden='true'>→</span>
          </Link>
        </div>
      </HomeSection>

      <HomeSection variant='why'>
        <SectionHeader
          index={2}
          eyebrow='Why Partner With Us'
          title='Why Choose'
          highlight='Applebear'
          subtitle='One-stop baby product manufacturing with professional OEM/ODM experience.'
          dark
        />
        <div className='home-why-grid'>
          {WHY_CHOOSE.map((item) => (
            <WhyChooseCard key={item.title} icon={item.icon} title={item.title} description={item.description} />
          ))}
        </div>
      </HomeSection>

      <HomeSection variant='manufacturing'>
        <div className='grid lg:grid-cols-2 gap-10 lg:gap-14 items-center'>
          <div className='relative home-manufacturing-visual'>
            <HomeImage
              src={homeImages.manufacturing}
              alt='Applebear injection molding production line'
              className='corp-image w-full aspect-[4/3] object-cover'
              wrapperClassName='w-full aspect-[4/3]'
            />
            <div className='home-manufacturing-badge'>
              <p className='text-xs text-slate-500 uppercase tracking-wide'>Est. 1998</p>
              <p className='font-bold text-slate-800'>20+ Years Manufacturing</p>
            </div>
          </div>
          <div>
            <SectionHeader
              index={3}
              eyebrow='Capabilities'
              title='World-Class Manufacturing'
              highlight='Capabilities'
              subtitle='Our facility is equipped with advanced injection molding machines, automated assembly lines, and dedicated quality control — every product manufactured to international safety standards.'
              align='left'
            />
            <div className='grid grid-cols-2 gap-4 mb-8'>
              {MANUFACTURING_METRICS.map((item) => (
                <AnimatedMetric
                  key={item.label}
                  value={item.value}
                  label={item.label}
                  wrapperClassName='home-metric-chip'
                  valueClassName='home-metric-value'
                  labelClassName='home-metric-label'
                />
              ))}
            </div>
            <Link to='/about' className='corp-btn'>
              Learn About Our Factory
              <span aria-hidden='true'>→</span>
            </Link>
          </div>
        </div>
      </HomeSection>

      <HomeSection variant='factory'>
        <SectionHeader
          index={4}
          eyebrow='Factory Tour'
          title='Inside Our'
          highlight='Facility'
          subtitle='Injection molding lines, automated assembly equipment, blow-molding machines, and clean-room standards — see how we manufacture at scale.'
          dark
        />
        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5'>
          {factoryCarousel.map((src, idx) => (
            <div key={idx} className='home-factory-photo'>
              <HomeImage
                src={src}
                alt={`Applebear production equipment ${idx + 1}`}
                className='w-full h-full object-cover'
                wrapperClassName='w-full h-full'
              />
            </div>
          ))}
        </div>
      </HomeSection>

      <OemFlowSection />

      <HomeSection variant='process'>
        <SectionHeader
          index={6}
          eyebrow='How We Work'
          title='Our Production'
          highlight='Process'
          subtitle='Every product goes through our standardized 6-step manufacturing process to ensure consistent quality and safety.'
        />
        <div className='home-process-grid'>
          {PROCESS_STEPS.map((item) => (
            <div key={item.step} className='home-process-card' data-step={item.step}>
              <span className='home-process-num' aria-hidden='true'>{item.step}</span>
              <p className='home-process-label'>STEP {item.step}</p>
              <h3 className='font-semibold text-slate-800 text-sm mb-2'>{item.title}</h3>
              <p className='text-xs text-slate-500 leading-relaxed'>{item.description}</p>
            </div>
          ))}
        </div>
      </HomeSection>

      <HomeSection variant='quality'>
        <SectionHeader
          index={7}
          eyebrow='Quality Assurance'
          title='International'
          highlight='Certifications'
          subtitle='Our products meet the highest international safety standards for buyers and end consumers worldwide.'
        />
        <div className='grid grid-cols-2 md:grid-cols-4 gap-4 lg:gap-6'>
          {certificationItems.map((item) => (
            <CertificationCard key={item.title} {...item} />
          ))}
        </div>
      </HomeSection>
    </>
  )
}

export default HomeLanding
