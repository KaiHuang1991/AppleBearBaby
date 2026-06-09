import React from 'react'

const Title = ({ text1, text2, align = 'center', subtitle, className = '' }) => {
  const alignClass = align === 'left' ? 'text-left' : 'text-center'

  return (
    <div className={`mb-6 ${alignClass} ${className}`}>
      <h2 className='corp-section-title'>
        {text1}
        {text2 ? <span className='text-blue-600'> {text2}</span> : null}
      </h2>
      {subtitle ? (
        <p className={`corp-section-subtitle ${align === 'center' ? 'mx-auto' : ''}`}>{subtitle}</p>
      ) : null}
    </div>
  )
}

export default Title
