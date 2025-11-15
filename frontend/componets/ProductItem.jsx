import React, { useContext } from 'react'
import { ShopContext } from '../context/ShopContext'
import { Link } from 'react-router-dom'
import { flyToCart } from '../src/utils/flyToCart'

const ProductItem = ({id,image,name,price}) => {
  const {currency, addToCart} = useContext(ShopContext)
  
  const handleAddToCart = (e) => {
    e.preventDefault()
    e.stopPropagation()
    addToCart(id)
    // Fly animation from product image to cart
    const card = e.currentTarget.closest('.cartoon-card')
    const imgEl = card ? card.querySelector('img.product-item-img') : null
    if (imgEl) flyToCart(imgEl)
  }

  return ( 
      <Link className='text-gray-700 cursor-pointer h-full'target='_blank' to={`/product/${id}`}>
        <div className='cartoon-card p-4 transition-all duration-300 h-full flex flex-col'>
            <div className='overflow-hidden rounded-xl mb-3 flex-shrink-0'>
                <img className='product-item-img hover:scale-110 transition ease-in-out duration-300 w-full aspect-square object-cover' src={image[0]} alt="" />
            </div>
            <div className='space-y-2 flex-1 flex flex-col'>
                <p className='text-base font-medium text-gray-800 line-clamp-2 min-h-[3rem]'>
                    {name}
                </p>
                <div className='flex flex-col  flex-start justify-between sm:flex-row'>
                    <p className='text-base font-bold text-blue-600'>{currency}{price}</p>
                    <span className='text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded-full font-medium sm:text-sm justify-center items-center'>
                        💖 Best Value
                    </span>
                </div>
                <button 
                    className='w-full cartoon-btn py-2 text-white font-semibold text-sm mt-auto'
                    onClick={handleAddToCart}
                >
                    Add to Cart 🛒
                </button>
            </div>
        </div>
      </Link>
  )
}

export default ProductItem
