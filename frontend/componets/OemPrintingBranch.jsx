import React from 'react'
import { useTranslation } from 'react-i18next'
import { oemFlowImages } from '../src/assets/oemAssets'

const OemPrintingBranch = () => {
  const { t } = useTranslation()
  return (
    <div className='oem-step-card oem-step-card--flowchart'>
      <div className='oem-step-flowchart-wrap'>
        <img
          src={oemFlowImages.printingMethods}
          alt={t('home.printHeading')}
          className='oem-step-flowchart-img'
        />
      </div>
      <div className='oem-step-heading'>
        <p className='oem-step-num'>{t('home.processStep', { n: '02–03' })}</p>
        <h3 className='oem-step-heading-title'>{t('home.printHeading')}</h3>
        <p className='oem-step-heading-script'>{t('home.printScript')}</p>
      </div>
      <div className='oem-step-body'>
        <p>
          <span className='oem-step-body-label'>{t('home.printLabel')}</span>: {t('home.printBody')}
        </p>
      </div>
    </div>
  )
}

export default OemPrintingBranch
