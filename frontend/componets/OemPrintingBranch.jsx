import React from 'react'
import silkScreen from '../src/assets/oem/silk screening.png'
import heatTransfer from '../src/assets/oem/heat transfer.png'

const ForkConnector = () => (
  <svg className='oem-fork-svg' viewBox='0 0 48 120' fill='none' aria-hidden='true'>
    <path d='M0 60 H16' stroke='#93c5fd' strokeWidth='2' strokeLinecap='round' />
    <path d='M16 60 V24 H44' stroke='#93c5fd' strokeWidth='2' strokeLinecap='round' />
    <path d='M16 60 V96 H44' stroke='#93c5fd' strokeWidth='2' strokeLinecap='round' />
    <path d='M38 24 L44 24 M41 21 L44 24 L41 27' stroke='#93c5fd' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round' />
    <path d='M38 96 L44 96 M41 93 L44 96 L41 99' stroke='#93c5fd' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round' />
  </svg>
)

const BranchOption = ({ label, name, icon, alt }) => (
  <div className='oem-branch-path'>
    <div className='oem-branch-path-lead'>
      <span className='oem-branch-path-label'>{label}</span>
      <span className='oem-branch-path-arrow' aria-hidden='true'>→</span>
    </div>
    <div className='oem-branch-card'>
      <div className='oem-branch-icon'>
        <img src={icon} alt={alt} className='oem-branch-icon-img' />
      </div>
      <p className='oem-branch-name'>{name}</p>
    </div>
  </div>
)

const OemPrintingBranch = () => (
  <div className='oem-branch-zone'>
    <ForkConnector />
    <div className='oem-branch-paths'>
      <BranchOption
        label='Fewer Colors'
        name='Silk Screen'
        icon={silkScreen}
        alt='Silk screen printing'
      />
      <BranchOption
        label='Multi-color / Gradient'
        name='Heat Transfer'
        icon={heatTransfer}
        alt='Heat transfer printing'
      />
    </div>
    <span className='oem-flow-arrow oem-branch-merge' aria-hidden='true'>→</span>
  </div>
)

export default OemPrintingBranch
