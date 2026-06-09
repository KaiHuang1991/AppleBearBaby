import React, { useContext, useEffect, useState } from 'react'
import { ShopContext } from '../context/ShopContext'
import Title from './Title'
import ProductItem from './ProductItem'
import { useNavigate } from 'react-router-dom'

const HotSale = () => {
  const navigate = useNavigate()
  const { products } = useContext(ShopContext)
  const [hotProducts, setHotProducts] = useState([])

  useEffect(() => {
    const sorted = [...products]
      .sort((a, b) => {
        if (a.inquiryCount && b.inquiryCount) return b.inquiryCount - a.inquiryCount
        if (a.bestseller && !b.bestseller) return -1
        if (!a.bestseller && b.bestseller) return 1
        return b.date - a.date
      })
      .slice(0, 8)
    setHotProducts(sorted)
  }, [products])

  return (
    <section className='my-14 md:my-20 section-alt -mx-5 sm:-mx-8 px-5 sm:px-8 py-12 md:py-16 rounded-none'>
      <Title
        text1='Hot'
        text2='Sale'
        subtitle='Most popular products based on customer inquiries and orders — available at competitive wholesale prices.'
      />

      <div className='grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8 catalog-product-grid'>
        {hotProducts.map((item) => (
          <ProductItem key={item._id} id={item._id} image={item.image} name={item.name} price={item.price} />
        ))}
      </div>

      <div className='text-center mt-10'>
        <button type='button' className='corp-btn px-8' onClick={() => navigate('/collection')}>
          View All Hot Sale Products
          <span aria-hidden='true'>→</span>
        </button>
      </div>
    </section>
  )
}

export default HotSale
