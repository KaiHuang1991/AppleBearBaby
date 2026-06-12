import React from 'react'
import { oemFlowImages } from '../src/assets/oemAssets'

const OemPrintingBranch = () => (
  <div className='oem-step-card oem-step-card--flowchart'>
    <div className='oem-step-flowchart-wrap'>
      <img
        src={oemFlowImages.printingMethods}
        alt='Screen printing and heat transfer process flowchart'
        className='oem-step-flowchart-img'
      />
    </div>
    <div className='oem-step-heading'>
      <p className='oem-step-num'>STEP 02–03</p>
      <h3 className='oem-step-heading-title'>Printing Method Selection</h3>
      <p className='oem-step-heading-script'>Screen Printing or Heat Transfer</p>
    </div>
    <div className='oem-step-body'>
      <p>
        <span className='oem-step-body-label'>Printing Options</span>: Silk Screen for fewer colors;
        Heat Transfer for multi-color or gradient patterns.
      </p>
    </div>
  </div>
)

export default OemPrintingBranch
