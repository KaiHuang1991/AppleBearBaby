import React from 'react'
import { Link } from 'react-router-dom'
import { homeImages, factoryCarousel, galleryImages } from '../src/assets/galleryAssets'

const SectionHeader = ({ eyebrow, title, subtitle, align = 'center' }) => (
  <div className={`mb-10 md:mb-12 ${align === 'center' ? 'text-center' : ''}`}>
    {eyebrow ? (
      <p className='text-xs font-semibold uppercase tracking-[0.2em] text-blue-600 mb-2'>{eyebrow}</p>
    ) : null}
    <h2 className='corp-section-title'>{title}</h2>
    {subtitle ? (
      <p className={`corp-section-subtitle mt-3 ${align === 'center' ? 'mx-auto' : ''}`}>{subtitle}</p>
    ) : null}
  </div>
)

const StatItem = ({ value, label }) => (
  <div className='text-center px-4 py-2'>
    <p className='text-3xl md:text-4xl font-bold text-blue-600'>{value}</p>
    <p className='text-sm text-slate-600 mt-1'>{label}</p>
  </div>
)

const FeatureCard = ({ title, description }) => (
  <div className='corp-feature-card h-full'>
    <h3 className='font-semibold text-slate-800 mb-2'>{title}</h3>
    <p className='text-sm text-slate-600 leading-relaxed'>{description}</p>
  </div>
)

const CategoryCard = ({ image, badge, title, description, to }) => (
  <Link to={to} className='group corp-feature-card p-0 overflow-hidden block h-full'>
    <div className='relative aspect-[4/3] overflow-hidden'>
      <img src={image} alt={title} className='w-full h-full object-cover group-hover:scale-105 transition-transform duration-300' />
      {badge ? (
        <span className='absolute top-3 left-3 bg-white/95 text-xs font-semibold text-blue-700 px-2.5 py-1 rounded-md shadow-sm'>
          {badge}
        </span>
      ) : null}
    </div>
    <div className='p-5'>
      <h3 className='font-semibold text-lg text-slate-800 mb-1'>{title}</h3>
      <p className='text-sm text-slate-600 leading-relaxed'>{description}</p>
    </div>
  </Link>
)

const WHY_CHOOSE = [
  { title: 'One-Stop Service', description: 'From mold development to mass production, we handle everything in-house.' },
  { title: 'Strict Quality Control', description: 'Rigorous inspection processes ensure every batch meets international standards.' },
  { title: '20+ Years Experience', description: 'Trusted wholesale partner serving healthcare facilities and retailers worldwide.' },
  { title: '50+ Team Members', description: 'Skilled workforce with professional engineers and QC specialists.' },
  { title: 'Advanced Equipment', description: 'Modern injection molding and automated assembly production lines.' },
  { title: '24h Online Support', description: 'Dedicated account managers respond to wholesale inquiries promptly.' },
]

const OEM_CAPABILITIES = [
  { title: 'Custom Logo & Branding', description: 'Your brand identity on every product' },
  { title: 'Custom Packaging', description: 'Unique packaging design and printing' },
  { title: 'Mold Development', description: 'In-house mold manufacturing support' },
  { title: 'Product Design', description: 'Industrial design and prototyping service' },
  { title: 'Mass Production', description: 'Scalable, consistent manufacturing' },
  { title: 'Quality Control', description: '100% inspection before shipment' },
]

const PROCESS_STEPS = [
  { step: '01', title: 'Requirement Review', description: 'Understand your specs and goals' },
  { step: '02', title: 'Product Design', description: 'Industrial design and 3D modeling' },
  { step: '03', title: 'Mold Development', description: 'Precision mold manufacturing' },
  { step: '04', title: 'Sample Confirmation', description: 'Client-approved prototypes' },
  { step: '05', title: 'Mass Production', description: 'Scalable batch manufacturing' },
  { step: '06', title: 'Delivery', description: 'Safe packaging and on-time shipping' },
]

const CERTIFICATIONS = ['ISO 9001', 'FDA', 'CE', 'BPA Free', 'LFGB', 'EN 14350']

const galleryPreview = galleryImages.filter((img) => !factoryCarousel.includes(img)).slice(0, 12)

const HomeLanding = () => {
  return (
    <>
      <section
        className='home-hero relative flex items-center'
        style={{ backgroundImage: `url(${homeImages.hero})` }}
      >
        <div className='absolute inset-0 bg-gradient-to-r from-slate-900/80 via-slate-900/65 to-slate-900/40' />
        <div className='section-container relative z-10 py-16 md:py-24'>
          <div className='max-w-2xl'>
            <span className='inline-block bg-blue-600/90 text-white text-xs font-semibold uppercase tracking-wider px-3 py-1.5 rounded mb-5'>
              OEM / ODM Manufacturer
            </span>
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

      <section className='corp-stat-bar py-10 md:py-12'>
        <div className='section-container grid grid-cols-1 sm:grid-cols-3 gap-6'>
          <StatItem value='20+' label='Years Experience' />
          <StatItem value='30+' label='Export Countries' />
          <StatItem value='20+' label='Product Lines' />
        </div>
      </section>

      <section className='section-container py-16 md:py-20'>
        <SectionHeader
          eyebrow='Product Range'
          title='Our Product Categories'
          subtitle='Premium baby feeding and care products for wholesale and OEM partners.'
        />
        <div className='grid md:grid-cols-3 gap-6 lg:gap-8'>
          <CategoryCard
            image={homeImages.categoryBottles}
            badge='100+ Styles'
            title='Baby Bottles'
            description='PP/PPSU nursing bottles for newborns to toddlers'
            to='/collection'
          />
          <CategoryCard
            image={homeImages.categoryCups}
            badge='50+ Styles'
            title='Training Cups'
            description='Spout cups, straw cups and training cups'
            to='/collection'
          />
          <CategoryCard
            image={homeImages.categoryOther}
            badge='20+ Styles'
            title='Other Products'
            description='Pacifiers, teethers, breast pumps and feeding accessories'
            to='/collection'
          />
        </div>
        <div className='text-center mt-10'>
          <Link to='/collection' className='corp-btn-outline px-8'>
            View All Products
            <span aria-hidden='true'>→</span>
          </Link>
        </div>
      </section>

      <section className='section-alt py-16 md:py-20'>
        <div className='section-container'>
          <SectionHeader
            eyebrow='Why Partner With Us'
            title='Why Choose Applebear'
            subtitle='One-stop baby product manufacturing with professional OEM/ODM experience.'
          />
          <div className='grid sm:grid-cols-2 lg:grid-cols-3 gap-5 lg:gap-6'>
            {WHY_CHOOSE.map((item) => (
              <FeatureCard key={item.title} title={item.title} description={item.description} />
            ))}
          </div>
        </div>
      </section>

      <section className='section-container py-16 md:py-20'>
        <div className='grid lg:grid-cols-2 gap-10 lg:gap-14 items-center'>
          <div className='relative'>
            <img
              src={homeImages.manufacturing}
              alt='Applebear injection molding production line'
              className='corp-image w-full aspect-[4/3] object-cover'
            />
            <div className='absolute bottom-4 left-4 bg-white rounded-lg shadow-lg px-4 py-3 border border-slate-100'>
              <p className='text-xs text-slate-500 uppercase tracking-wide'>Est. 1998</p>
              <p className='font-bold text-slate-800'>20+ Years Manufacturing</p>
            </div>
          </div>
          <div>
            <SectionHeader
              eyebrow='Why Partner With Us'
              title='World-Class Manufacturing Capabilities'
              subtitle='Our facility is equipped with advanced injection molding machines, automated assembly lines, and dedicated quality control — every product manufactured to international safety standards.'
              align='left'
            />
            <div className='grid grid-cols-2 gap-4 mb-8'>
              <div className='corp-feature-card text-center py-5 px-3'>
                <p className='text-2xl font-bold text-blue-600'>12,000㎡</p>
                <p className='text-xs text-slate-600 mt-1'>Factory Area</p>
              </div>
              <div className='corp-feature-card text-center py-5 px-3'>
                <p className='text-2xl font-bold text-blue-600'>7</p>
                <p className='text-xs text-slate-600 mt-1'>Production Lines</p>
              </div>
              <div className='corp-feature-card text-center py-5 px-3'>
                <p className='text-2xl font-bold text-blue-600'>50+</p>
                <p className='text-xs text-slate-600 mt-1'>Skilled Workers</p>
              </div>
              <div className='corp-feature-card text-center py-5 px-3'>
                <p className='text-2xl font-bold text-blue-600'>2.5M+</p>
                <p className='text-xs text-slate-600 mt-1'>Monthly Output</p>
              </div>
            </div>
            <Link to='/about' className='corp-btn'>
              Learn About Our Factory
              <span aria-hidden='true'>→</span>
            </Link>
          </div>
        </div>
      </section>

      <section className='section-alt py-16 md:py-20'>
        <div className='section-container'>
          <SectionHeader
            eyebrow='Factory Tour'
            title='Inside Our Facility'
            subtitle='Injection molding lines, automated assembly equipment, blow-molding machines, and clean-room standards — see how we manufacture at scale.'
          />
          <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5'>
            {factoryCarousel.map((src, idx) => (
              <div key={idx} className='overflow-hidden rounded-xl border border-slate-200 aspect-[4/3] shadow-sm'>
                <img src={src} alt={`Applebear production equipment ${idx + 1}`} className='w-full h-full object-cover hover:scale-105 transition-transform duration-300' />
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className='section-container py-16 md:py-20'>
        <SectionHeader
          eyebrow='Custom Development'
          title='Full-Service OEM Capabilities'
          subtitle='From concept to finished product, our OEM service covers every aspect of baby product development.'
        />
        <div className='grid lg:grid-cols-2 gap-8 items-stretch mb-10'>
          <img src={homeImages.showroom} alt='Applebear product showroom' className='corp-image w-full h-full min-h-[240px] object-cover' />
          <img src={homeImages.assembly} alt='Assembly and packaging line' className='corp-image w-full h-full min-h-[240px] object-cover' />
        </div>
        <div className='grid sm:grid-cols-2 lg:grid-cols-3 gap-5 lg:gap-6'>
          {OEM_CAPABILITIES.map((item) => (
            <FeatureCard key={item.title} title={item.title} description={item.description} />
          ))}
        </div>
        <div className='text-center mt-10'>
          <Link to='/contact' className='corp-btn px-8'>
            Learn About OEM Services
            <span aria-hidden='true'>→</span>
          </Link>
        </div>
      </section>

      <section className='section-alt py-16 md:py-20'>
        <SectionHeader
          eyebrow='How We Work'
          title='Our Production Process'
          subtitle='Every product goes through our standardized 6-step manufacturing process to ensure consistent quality and safety.'
        />
        <div className='section-container grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4'>
          {PROCESS_STEPS.map((item) => (
            <div key={item.step} className='corp-feature-card text-center py-6 px-4'>
              <p className='text-xs font-bold text-blue-600 tracking-wider mb-2'>STEP {item.step}</p>
              <h3 className='font-semibold text-slate-800 text-sm mb-2'>{item.title}</h3>
              <p className='text-xs text-slate-500 leading-relaxed'>{item.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section className='section-container py-16 md:py-20'>
        <SectionHeader
          eyebrow='Quality Assurance'
          title='International Certifications'
          subtitle='Our products meet the highest international safety standards for buyers and end consumers worldwide.'
        />
        <div className='grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-10'>
          {CERTIFICATIONS.map((cert) => (
            <div key={cert} className='corp-feature-card text-center py-5 px-3'>
              <p className='font-semibold text-slate-800 text-sm'>{cert}</p>
            </div>
          ))}
        </div>
        <div className='rounded-xl overflow-hidden border border-slate-200 shadow-sm max-w-4xl mx-auto mb-10'>
          <img src={homeImages.certifications} alt='Quality certifications and awards' className='w-full object-cover' />
        </div>
        <div className='grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3'>
          {galleryPreview.map((src, idx) => (
            <div key={idx} className='overflow-hidden rounded-lg border border-slate-200 aspect-[4/3]'>
              <img src={src} alt={`Facility photo ${idx + 1}`} className='w-full h-full object-cover' />
            </div>
          ))}
        </div>
      </section>
    </>
  )
}

export default HomeLanding
