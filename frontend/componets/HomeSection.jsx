import React from 'react'

export const SectionHeader = ({
  index,
  eyebrow,
  title,
  highlight,
  subtitle,
  align = 'center',
  dark = false,
}) => (
  <div
    className={[
      'home-section-header',
      align === 'center' ? 'home-section-header--center' : 'home-section-header--left',
      dark ? 'home-section-header--dark' : '',
    ].filter(Boolean).join(' ')}
  >
    {index ? (
      <span className='home-section-index' aria-hidden='true'>
        {String(index).padStart(2, '0')}
      </span>
    ) : null}
    <div className={align === 'center' ? 'mx-auto' : ''}>
      {eyebrow ? <span className='home-section-eyebrow'>{eyebrow}</span> : null}
      <h2 className='corp-section-title home-section-title'>
        {highlight ? (
          <>
            {title}{' '}
            <span className='home-section-title-highlight'>{highlight}</span>
          </>
        ) : (
          title
        )}
      </h2>
      {subtitle ? (
        <p className={`corp-section-subtitle home-section-subtitle mt-3 ${align === 'center' ? 'mx-auto' : ''}`}>
          {subtitle}
        </p>
      ) : null}
    </div>
  </div>
)

const HomeSection = ({ variant, children, className = '', innerClassName = '' }) => (
  <section className={`home-section home-section--${variant} ${className}`.trim()}>
    <div className='home-section-bg' aria-hidden='true' />
    <div className={`section-container home-section-inner ${innerClassName}`.trim()}>{children}</div>
  </section>
)

export default HomeSection
