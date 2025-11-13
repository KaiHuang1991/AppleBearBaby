import React, { useContext, useMemo, useState, useCallback } from 'react'
import { ShopContext } from '../context/ShopContext'

const SideCart = () => {
  const { isCartOpen, closeCart, cartItems, products, currency, updateQuantity, getCartAmount, navigate } = useContext(ShopContext)
  const [pendingMap, setPendingMap] = useState({})

  const setPending = useCallback((key, value) => {
    setPendingMap(prev => {
      if (prev[key] === value) return prev
      const next = { ...prev }
      if (value) {
        next[key] = true
      } else {
        delete next[key]
      }
      return next
    })
  }, [])

  const handleUpdateQuantity = useCallback(async (productId, size, quantity) => {
    const key = `${productId}__${size}`
    setPending(key, true)
    try {
      await updateQuantity(productId, size, quantity)
    } finally {
      setPending(key, false)
    }
  }, [setPending, updateQuantity])

  const items = useMemo(() => {
    const list = []
    for (const productId in cartItems) {
      for (const size in cartItems[productId]) {
        const qty = cartItems[productId][size]
        if (qty > 0) {
          const product = products.find(p => p._id === productId)
          if (product) {
            list.push({
              _id: productId,
              name: product.name,
              price: product.price,
              image: product.image?.[0] || '',
              size,
              quantity: qty
            })
          }
        }
      }
    }
    return list
  }, [cartItems, products])

  const subtotal = getCartAmount()

  return (
    <>
      {/* Backdrop */}
      {isCartOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-[999] transition-opacity duration-300"
          onClick={closeCart}
        />
      )}

      {/* Panel */}
      <div className={`fixed right-0 top-0 h-full w-[92%] sm:w-[420px] bg-white shadow-2xl z-[1000] transition-transform duration-300 ${isCartOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className='flex items-center justify-between p-4 border-b'>
          <h3 className='text-lg font-semibold'>Your Cart</h3>
          <button onClick={closeCart} className='text-gray-500 hover:text-gray-700'>✕</button>
        </div>

        <div className='h-[calc(100%-180px)] overflow-y-auto p-4'>
          {items.length === 0 ? (
            <p className='text-gray-500 text-sm'>Your cart is empty.</p>
          ) : (
            <div className='space-y-4'>
              {items.map((item, idx) => (
                <div key={`${item._id}-${item.size}-${idx}`} className='flex gap-3 items-center'>
                  <img src={item.image} alt='' className='w-16 h-16 object-cover rounded-md border' />
                  <div className='flex-1'>
                    <p className='text-sm font-medium line-clamp-2'>{item.name}</p>
                    <div className='text-xs text-gray-500 mt-0.5'>Size: {item.size}</div>
                    <div className='flex items-center gap-3 mt-2'>
                      {(() => {
                        const itemKey = `${item._id}__${item.size}`
                        const isPending = !!pendingMap[itemKey]
                        return (
                      <div className='flex items-center border rounded-md overflow-hidden'>
                        <button
                          onClick={() => handleUpdateQuantity(item._id, item.size, Math.max(0, item.quantity - 1))}
                          className='px-2 py-1 text-sm disabled:opacity-50'
                          disabled={isPending}
                        >
                          -
                        </button>
                        <input
                          className='w-10 text-center text-sm border-l border-r disabled:bg-gray-100'
                          type='number'
                          min={0}
                          value={item.quantity}
                          disabled={isPending}
                          onChange={async (e) => {
                            const v = Number(e.target.value)
                            if (!Number.isFinite(v)) return
                            await handleUpdateQuantity(item._id, item.size, Math.max(0, v))
                          }}
                        />
                        <button
                          onClick={() => handleUpdateQuantity(item._id, item.size, item.quantity + 1)}
                          className='px-2 py-1 text-sm disabled:opacity-50'
                          disabled={isPending}
                        >
                          +
                        </button>
                      </div>
                        )
                      })()}
                      <div className='ml-auto text-sm font-semibold'>
                        {currency}{(item.price * item.quantity).toFixed(2)}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => handleUpdateQuantity(item._id, item.size, 0)}
                    className='text-red-500 text-sm disabled:opacity-50'
                    disabled={!!pendingMap[`${item._id}__${item.size}`]}
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className='absolute bottom-0 left-0 right-0 border-t p-4 bg-white'>
          <div className='flex items-center justify-between mb-3'>
            <span className='text-sm text-gray-600'>Subtotal</span>
            <span className='text-base font-semibold'>{currency}{subtotal.toFixed(2)}</span>
          </div>
          <div className='flex gap-3'>
            <button onClick={() => { closeCart(); navigate('/cart') }} className='flex-1 border rounded-md py-2 text-sm'>View Cart</button>
            <button onClick={() => { closeCart(); navigate('/cart') }} className='flex-1 bg-black text-white rounded-md py-2 text-sm'>Request Quote</button>
          </div>
        </div>
      </div>
    </>
  )
}

export default SideCart


