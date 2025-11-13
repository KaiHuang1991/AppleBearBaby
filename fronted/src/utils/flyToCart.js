export function flyToCart(sourceElement, options = {}) {
  try {
    const cartIcon = document.getElementById('cart-icon')
    if (!sourceElement || !cartIcon) return

    const srcRect = sourceElement.getBoundingClientRect()
    const cartRect = cartIcon.getBoundingClientRect()

    const imgSrc = sourceElement.getAttribute('src')
    if (!imgSrc) return

    const flyer = document.createElement('img')
    flyer.src = imgSrc
    flyer.alt = ''
    flyer.style.position = 'fixed'
    flyer.style.left = srcRect.left + 'px'
    flyer.style.top = srcRect.top + 'px'
    flyer.style.width = srcRect.width + 'px'
    flyer.style.height = srcRect.height + 'px'
    flyer.style.borderRadius = '8px'
    flyer.style.zIndex = '9999'
    flyer.style.pointerEvents = 'none'
    flyer.style.transition = 'transform 600ms cubic-bezier(0.22, 1, 0.36, 1), opacity 1000ms ease'

    document.body.appendChild(flyer)

    const deltaX = cartRect.left + cartRect.width / 2 - (srcRect.left + srcRect.width / 2)
    const deltaY = cartRect.top + cartRect.height / 2 - (srcRect.top + srcRect.height / 2)

    // Force layout for transition
    // eslint-disable-next-line no-unused-expressions
    flyer.offsetHeight

    flyer.style.transform = `translate(${deltaX}px, ${deltaY}px) scale(0.2)`
    flyer.style.opacity = '0.3'

    const cleanup = () => {
      if (flyer && flyer.parentNode) flyer.parentNode.removeChild(flyer)
    }

    flyer.addEventListener('transitionend', cleanup, { once: true })

    // Fallback cleanup
    setTimeout(cleanup, 800)
  } catch (_) {
    // no-op
  }
}


