import React from 'react'
import { useTranslation } from 'react-i18next'
import { LocaleLink } from './LocaleLink'
import { oemFlowImages } from '../src/assets/oemAssets'
import OemPrintingBranch from './OemPrintingBranch'
import HomeSection, { SectionHeader } from './HomeSection'
import Reveal from './Reveal'

const FLOW_META = [
  { step: '01', icon: oemFlowImages.design, iconAlt: 'Product design and asset submission', flowchart: true },
  { step: '04', icon: oemFlowImages.visualConfirmation, iconAlt: 'Visual confirmation on light table', flowchart: true },
  { step: '05', icon: oemFlowImages.toolingProduction, iconAlt: 'Tooling and mass production', flowchart: true },
  { step: '06', icon: oemFlowImages.logistics, iconAlt: 'Logistics and distribution', flowchart: true },
]

const OemStepCard = ({ step, icon, iconAlt, heading, script, bodyTitle, bodyDesc, flowchart = false, stepLabel }) => (
  <div className={`oem-step-card${flowchart ? ' oem-step-card--flowchart' : ''}`}>
    <div className={flowchart ? 'oem-step-flowchart-wrap' : 'oem-step-icon-wrap'}>
      <img
        src={icon}
        alt={iconAlt}
        className={flowchart ? 'oem-step-flowchart-img' : 'oem-step-icon-img'}
      />
    </div>
    <div className='oem-step-heading'>
      <p className='oem-step-num'>{stepLabel || `STEP ${step}`}</p>
      <h3 className='oem-step-heading-title'>{heading}</h3>
      <p className='oem-step-heading-script'>{script}</p>
    </div>
    <div className='oem-step-body'>
      <p>
        <span className='oem-step-body-label'>{bodyTitle}:</span>{' '}
        {bodyDesc}
      </p>
    </div>
  </div>
)

const OemFlowArrow = () => (
  <span className='oem-flow-arrow' aria-hidden='true'>→</span>
)

const OemFlowSection = () => {
  const { t } = useTranslation()
  const copy = t('home.flow', { returnObjects: true })
  const steps = FLOW_META.map((meta, i) => ({
    ...meta,
    ...(Array.isArray(copy) ? copy[i] : {}),
    stepLabel: t('home.processStep', { n: meta.step }),
  }))

  return (
  <HomeSection variant='oem' innerClassName='home-oem-panel'>
    <Reveal>
      <SectionHeader
        index={5}
        eyebrow={t('home.oemEyebrow')}
        title={t('home.oemTitle')}
        highlight={t('home.oemHighlight')}
        subtitle={t('home.oemSubtitle')}
      />
    </Reveal>

    <div className='oem-flow'>
      <div className='oem-flow-row'>
        <Reveal delay={40}><OemStepCard {...steps[0]} /></Reveal>
        <OemFlowArrow />
        <Reveal delay={120}><OemPrintingBranch /></Reveal>
        <Reveal delay={180}><OemStepCard {...steps[1]} /></Reveal>
        <OemFlowArrow />
        <Reveal delay={240}><OemStepCard {...steps[2]} /></Reveal>
        <OemFlowArrow />
        <Reveal delay={300}><OemStepCard {...steps[3]} /></Reveal>
      </div>
    </div>

    <div className='text-center mt-10 md:mt-12 flex flex-wrap justify-center gap-3'>
      <LocaleLink to='/contact' className='corp-btn px-8'>
        {t('common.startOem')}
        <span aria-hidden='true'>→</span>
      </LocaleLink>
      <LocaleLink to='/faq' className='corp-btn-outline px-8'>
        {t('common.oemFaq')}
      </LocaleLink>
    </div>
  </HomeSection>
  )
}

export default OemFlowSection
