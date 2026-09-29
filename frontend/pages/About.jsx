import React from 'react'
import { useTranslation } from 'react-i18next'
import { LocaleLink } from '../componets/LocaleLink'
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
  const { t } = useTranslation()
  const bullets = t('about.bullets', { returnObjects: true })
  const features = t('about.features', { returnObjects: true })
  const factoryBullets = t('about.factoryBullets', { returnObjects: true })
  const teamBullets = t('about.teamBullets', { returnObjects: true })
  return (
    <div className='page-shell bg-white'>
      <section
        className='page-hero page-hero--tall'
        style={{ backgroundImage: `url(${assets.about_hero})`, backgroundPosition: 'center center' }}
      >
        <div className='page-hero-content'>
          <h1>{t('about.heroTitle')}</h1>
          <p>
            {t('about.heroText')}
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
            <h2 className='corp-section-title mb-4'>{t('about.companyTitle')}</h2>
            <p className='text-slate-600 leading-relaxed mb-6'>
              {t('about.companyText')}
            </p>
            <ul className='corp-check-list mb-8'>
              {(Array.isArray(bullets) ? bullets : []).map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
            <LocaleLink to='/contact' className='corp-btn'>
              {t('common.learnMore')}
              <span aria-hidden='true'>→</span>
            </LocaleLink>
          </div>
        </div>
      </section>

      <section className='section-alt py-16 md:py-24'>
        <div className='section-container'>
          <div className='text-center mb-12'>
            <h2 className='corp-section-title'>{t('about.whyTitle')}</h2>
            <p className='corp-section-subtitle mx-auto'>
              {t('about.whySubtitle')}
            </p>
          </div>
          <div className='grid sm:grid-cols-2 lg:grid-cols-4 gap-6'>
            <div className='corp-feature-card text-center'>
              <FeatureIcon>
                <svg className='w-6 h-6' fill='none' stroke='currentColor' viewBox='0 0 24 24'><path strokeLinecap='round' strokeLinejoin='round' strokeWidth={1.8} d='M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z' /></svg>
              </FeatureIcon>
              <h3 className='font-semibold text-slate-800 mb-2'>{features[0]?.title}</h3>
              <p className='text-sm text-slate-600 leading-relaxed'>{features[0]?.text}</p>
            </div>
            <div className='corp-feature-card text-center'>
              <FeatureIcon>
                <svg className='w-6 h-6' fill='none' stroke='currentColor' viewBox='0 0 24 24'><path strokeLinecap='round' strokeLinejoin='round' strokeWidth={1.8} d='M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4' /></svg>
              </FeatureIcon>
              <h3 className='font-semibold text-slate-800 mb-2'>{features[1]?.title}</h3>
              <p className='text-sm text-slate-600 leading-relaxed'>{features[1]?.text}</p>
            </div>
            <div className='corp-feature-card text-center'>
              <FeatureIcon>
                <svg className='w-6 h-6' fill='none' stroke='currentColor' viewBox='0 0 24 24'><path strokeLinecap='round' strokeLinejoin='round' strokeWidth={1.8} d='M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z' /></svg>
              </FeatureIcon>
              <h3 className='font-semibold text-slate-800 mb-2'>{features[2]?.title}</h3>
              <p className='text-sm text-slate-600 leading-relaxed'>{features[2]?.text}</p>
            </div>
            <div className='corp-feature-card text-center'>
              <FeatureIcon>
                <svg className='w-6 h-6' fill='none' stroke='currentColor' viewBox='0 0 24 24'><path strokeLinecap='round' strokeLinejoin='round' strokeWidth={1.8} d='M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z' /></svg>
              </FeatureIcon>
              <h3 className='font-semibold text-slate-800 mb-2'>{features[3]?.title}</h3>
              <p className='text-sm text-slate-600 leading-relaxed'>{features[3]?.text}</p>
            </div>
          </div>
        </div>
      </section>

      <section className='corp-stat-bar py-12 md:py-14'>
        <div className='section-container grid grid-cols-2 lg:grid-cols-4 gap-8'>
          <StatItem value='12,000㎡' label={t('about.statArea')} />
          <StatItem value='7' label={t('about.statLines')} />
          <StatItem value='2.5M+' label={t('about.statOutput')} />
          <StatItem value='ISO 9001' label={t('about.statQuality')} />
        </div>
      </section>

      <section className='section-container py-16 md:py-24'>
        <div className='grid lg:grid-cols-2 gap-10 lg:gap-16 items-center'>
          <div className='order-2 lg:order-1'>
            <h2 className='corp-section-title mb-4'>{t('about.factoryTitle')}</h2>
            <p className='text-slate-600 leading-relaxed mb-6'>
              {t('about.factoryText')}
            </p>
            <ul className='corp-check-list mb-8'>
              {(Array.isArray(factoryBullets) ? factoryBullets : []).map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
            <LocaleLink to='/videos' className='corp-btn'>
              {t('about.factoryCta')}
              <span aria-hidden='true'>→</span>
            </LocaleLink>
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
              <h2 className='corp-section-title mb-4'>{t('about.teamTitle')}</h2>
              <p className='text-slate-600 leading-relaxed mb-6'>
                {t('about.teamText')}
              </p>
              <ul className='corp-check-list mb-8'>
                {(Array.isArray(teamBullets) ? teamBullets : []).map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
              <LocaleLink to='/contact' className='corp-btn'>
                {t('about.teamCta')}
                <span aria-hidden='true'>→</span>
              </LocaleLink>
            </div>
          </div>
        </div>
      </section>

      <section className='section-container py-16 md:py-24'>
        <div className='max-w-3xl'>
          <h2 className='corp-section-title mb-4'>{t('about.alibabaTitle')}</h2>
          <p className='text-slate-600 leading-relaxed mb-6'>
            {t('about.alibabaText')}{' '}
            <a
              href='https://ywyouzhi.en.alibaba.com'
              target='_blank'
              rel='noopener noreferrer'
              className='text-blue-600 font-medium hover:underline'
            >
              ywyouzhi.en.alibaba.com
            </a>
          </p>
          <p className='text-slate-600 leading-relaxed mb-6'>
            {t('about.guidesLead')}{' '}
            <LocaleLink to='/faq' className='text-blue-600 font-medium hover:underline'>
              {t('common.oemFaq')}
            </LocaleLink>
            ,{' '}
            <LocaleLink
              to='/blog/moq-samples-and-lead-time-what-to-ask-before-ordering-baby-bottles'
              className='text-blue-600 font-medium hover:underline'
            >
              {t('about.moqLink')}
            </LocaleLink>
            ,{' '}
            <LocaleLink
              to='/blog/how-we-ship-oem-orders-from-yiwu-your-agent-alibaba-logistics-or-fcl'
              className='text-blue-600 font-medium hover:underline'
            >
              {t('about.shipLink')}
            </LocaleLink>
            ,{' '}
            <LocaleLink
              to='/blog/pp-vs-ppsu-vs-glass-baby-bottles-which-material-to-specify-in-an-oem-rfq'
              className='text-blue-600 font-medium hover:underline'
            >
              {t('about.materialLink')}
            </LocaleLink>
            .
          </p>
          <LocaleLink to='/contact' className='corp-btn'>
            {t('common.requestQuote')}
            <span aria-hidden='true'>→</span>
          </LocaleLink>
        </div>
      </section>
    </div>
  )
}

export default About
