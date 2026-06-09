import React from 'react'
import { Link } from 'react-router-dom'
import designIcon from '../src/assets/oem/design.png'
import patternEvaluation from '../src/assets/oem/pattern-evaluation.png'
import visualConfirmation from '../src/assets/oem/visual-confirmation.png'
import toolingPrinting from '../src/assets/oem/tooling-printing.png'
import logistics from '../src/assets/oem/logistics.png'
import OemPrintingBranch from './OemPrintingBranch'
import HomeSection, { SectionHeader } from './HomeSection'

const FLOW_STEPS = [
  {
    step: '01',
    icon: designIcon,
    iconAlt: 'Design and graphic assets',
    heading: 'Asset Submission',
    script: 'Client sends Logo/Images',
    bodyTitle: 'Logo & Graphic Assets',
    bodyDesc: 'Clients provide their brand Logo, artwork files, and any packaging design concepts or briefs.',
  },
  {
    step: '02',
    icon: patternEvaluation,
    iconAlt: 'Pattern evaluation',
    heading: 'Pattern Evaluation',
    script: 'Expert analysis: Hot Transfer or Screen Printing',
    bodyTitle: 'Printing Method Analysis',
    bodyDesc: 'Our team analyzes the number of colors in the pattern to determine the optimal printing technique.',
  },
  {
    step: '04',
    icon: visualConfirmation,
    iconAlt: 'Visual confirmation',
    heading: 'Visual Confirmation',
    script: 'Confirm print & packaging',
    bodyTitle: 'Design Mockup Approval',
    bodyDesc: 'We create and confirm production-ready printing plates/films. For packaging, if needed, our design team can finalize the client\'s concept.',
  },
  {
    step: '05',
    icon: toolingPrinting,
    iconAlt: 'Tooling and printing',
    heading: 'Tooling & Printing',
    script: 'Print plates created & packaging sent to printing factory',
    bodyTitle: 'Plate Production & Factory Orders',
    bodyDesc: 'Print plates or film rolls are manufactured. Final packaging designs are sent to our specialized printing factory.',
  },
  {
    step: '06',
    icon: logistics,
    iconAlt: 'Logistics and distribution',
    heading: 'Logistics & Distribution',
    script: 'Efficient global shipping',
    bodyTitle: 'Order Fulfillment',
    bodyDesc: 'Customized products are completed, efficiently packaged in custom boxes, and prepared for streamlined global delivery.',
  },
]

const OemStepCard = ({ step, icon, iconAlt, heading, script, bodyTitle, bodyDesc }) => (
  <div className='oem-step-card'>
    <div className='oem-step-icon-wrap'>
      <img src={icon} alt={iconAlt} className='oem-step-icon-img' />
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
        <OemStepCard {...FLOW_STEPS[1]} />
        <OemPrintingBranch />
        <OemStepCard {...FLOW_STEPS[2]} />
        <OemFlowArrow />
        <OemStepCard {...FLOW_STEPS[3]} />
        <OemFlowArrow />
        <OemStepCard {...FLOW_STEPS[4]} />
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
