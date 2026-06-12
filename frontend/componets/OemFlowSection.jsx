import React from 'react'
import { Link } from 'react-router-dom'
import { oemFlowImages } from '../src/assets/oemAssets'
import OemPrintingBranch from './OemPrintingBranch'
import HomeSection, { SectionHeader } from './HomeSection'

const FLOW_STEPS = [
  {
    step: '01',
    icon: oemFlowImages.design,
    iconAlt: 'Product design and asset submission',
    heading: 'Asset Submission',
    script: 'Client sends Logo/Images',
    bodyTitle: 'Logo & Graphic Assets',
    bodyDesc: 'Clients provide their brand Logo, artwork files, and any packaging design concepts or briefs.',
    flowchart: true,
  },
  {
    step: '04',
    icon: oemFlowImages.visualConfirmation,
    iconAlt: 'Visual confirmation on light table',
    heading: 'Visual Confirmation',
    script: 'Confirm print & packaging',
    bodyTitle: 'Design Mockup Approval',
    bodyDesc: 'We create and confirm production-ready printing plates/films. For packaging, if needed, our design team can finalize the client\'s concept.',
    flowchart: true,
  },
  {
    step: '05',
    icon: oemFlowImages.toolingProduction,
    iconAlt: 'Tooling and mass production',
    heading: 'Tooling & Printing',
    script: 'Print plates created & packaging sent to printing factory',
    bodyTitle: 'Plate Production & Factory Orders',
    bodyDesc: 'Print plates or film rolls are manufactured. Final packaging designs are sent to our specialized printing factory.',
    flowchart: true,
  },
  {
    step: '06',
    icon: oemFlowImages.logistics,
    iconAlt: 'Logistics and distribution',
    heading: 'Logistics & Distribution',
    script: 'Efficient global shipping',
    bodyTitle: 'Order Fulfillment',
    bodyDesc: 'Customized products are completed, efficiently packaged in custom boxes, and prepared for streamlined global delivery.',
    flowchart: true,
  },
]

const OemStepCard = ({ step, icon, iconAlt, heading, script, bodyTitle, bodyDesc, flowchart = false }) => (
  <div className={`oem-step-card${flowchart ? ' oem-step-card--flowchart' : ''}`}>
    <div className={flowchart ? 'oem-step-flowchart-wrap' : 'oem-step-icon-wrap'}>
      <img
        src={icon}
        alt={iconAlt}
        className={flowchart ? 'oem-step-flowchart-img' : 'oem-step-icon-img'}
      />
    </div>
    <div className='oem-step-heading'>
      <p className='oem-step-num'>STEP {step}</p>
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

const OemFlowSection = () => (
  <HomeSection variant='oem' innerClassName='home-oem-panel'>
    <SectionHeader
      index={5}
      eyebrow='Custom Development'
      title='Full-Service OEM'
      highlight='Capabilities'
      subtitle='From concept to finished product, our OEM service covers every aspect of baby product development.'
    />

    <div className='oem-flow'>
      <div className='oem-flow-row'>
        <OemStepCard {...FLOW_STEPS[0]} />
        <OemFlowArrow />
        <OemPrintingBranch />
        <OemStepCard {...FLOW_STEPS[1]} />
        <OemFlowArrow />
        <OemStepCard {...FLOW_STEPS[2]} />
        <OemFlowArrow />
        <OemStepCard {...FLOW_STEPS[3]} />
      </div>
    </div>

    <div className='text-center mt-10 md:mt-12'>
      <Link to='/contact' className='corp-btn px-8'>
        Start Your OEM Project
        <span aria-hidden='true'>→</span>
      </Link>
    </div>
  </HomeSection>
)

export default OemFlowSection
