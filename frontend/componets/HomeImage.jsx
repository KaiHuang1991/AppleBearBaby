import React from 'react'

const HomeImage = ({
  src,
  alt,
  className = '',
  wrapperClassName = '',
  eager = false,
  ...props
}) => (
  <div className={`relative overflow-hidden ${wrapperClassName}`.trim()}>
    <img
      src={src}
      alt={alt}
      className={className}
      loading={eager ? 'eager' : 'lazy'}
      decoding='async'
      {...props}
    />
  </div>
)

export default HomeImage
