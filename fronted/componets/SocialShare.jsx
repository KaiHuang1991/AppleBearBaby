import React, { useMemo } from 'react'

const shareTargets = [
  {
    key: 'facebook',
    label: 'Facebook',
    color: 'bg-[#1877F2] hover:bg-[#0f5bd4]',
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
        <path d="M22.675 0H1.325C.593 0 0 .594 0 1.326v21.348C0 23.407.593 24 1.325 24H12.82v-9.294H9.692v-3.622h3.128V8.413c0-3.1 1.894-4.788 4.658-4.788 1.325 0 2.464.099 2.797.143v3.24l-1.919.001c-1.504 0-1.796.715-1.796 1.765v2.313h3.587l-.467 3.622h-3.12V24h6.116C23.407 24 24 23.407 24 22.674V1.326C24 .594 23.407 0 22.675 0z" />
      </svg>
    ),
    buildLink: (url) => `https://www.facebook.com/sharer/sharer.php?u=${url}`
  },
  {
    key: 'twitter',
    label: 'Twitter',
    color: 'bg-[#1DA1F2] hover:bg-[#1486c8]',
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
        <path d="M23.954 4.569c-.885.389-1.83.654-2.825.775 1.014-.611 1.794-1.574 2.163-2.723-.949.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-2.717 0-4.92 2.201-4.92 4.917 0 .39.045.765.126 1.124C7.691 8.094 4.066 6.13 1.64 3.161c-.427.722-.666 1.561-.666 2.475 0 1.708.87 3.213 2.188 4.096-.807-.026-1.566-.248-2.228-.616v.061c0 2.385 1.693 4.374 3.946 4.827-.413.112-.849.171-1.296.171-.314 0-.615-.03-.916-.086.631 1.953 2.445 3.377 4.6 3.419-1.68 1.318-3.808 2.107-6.102 2.107-.39 0-.779-.023-1.17-.067 2.189 1.402 4.768 2.223 7.557 2.223 9.054 0 14.002-7.496 14.002-13.986 0-.21 0-.423-.016-.63.961-.69 1.8-1.56 2.46-2.548l-.047-.02z" />
      </svg>
    ),
    buildLink: (url) => `https://twitter.com/intent/tweet?url=${url}`
  }
]

const SocialShare = ({ product }) => {
  const { pageUrl, encodedUrl, canUseNativeShare } = useMemo(() => {
    if (!product) {
      return {
        pageUrl: '',
        encodedUrl: '',
        canUseNativeShare: false
      }
    }

    const url = typeof window !== 'undefined' ? window.location.href : ''
    const title = product.name || 'Check out this product'
    const description = (product.description || '').replace(/\s+/g, ' ').trim()
    return {
      pageUrl: url,
      encodedUrl: encodeURIComponent(url),
      canUseNativeShare: typeof navigator !== 'undefined' && typeof navigator.share === 'function'
    }
  }, [product])

  if (!product) return null

  const openPopup = (link) => {
    if (!link) return
    const width = 600
    const height = 600
    const left = window.screenX + (window.outerWidth - width) / 2
    const top = window.screenY + (window.outerHeight - height) / 2
    window.open(link, '_blank', `noopener,noreferrer,width=${width},height=${height},left=${left},top=${top}`)
  }

  const handleNativeShare = async () => {
    if (!canUseNativeShare || !pageUrl) return
    try {
      await navigator.share({
        title: product.name,
        text: product.description,
        url: pageUrl
      })
    } catch (error) {
      // eslint-disable-next-line no-console
      console.warn('Native share was cancelled or failed:', error)
    }
  }

  return (
    <div className='flex flex-wrap items-center justify-end gap-3 mt-6 border-t border-gray-100 pt-6'>
      {shareTargets.map((target) => (
        <button
          key={target.key}
          type='button'
            onClick={() => openPopup(target.buildLink(encodedUrl))}
          className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold text-white transition-all ${target.color}`}
          aria-label={`Share on ${target.label}`}
        >
          {target.icon}
          {target.label}
        </button>
      ))}
    </div>
  )
}

export default SocialShare

