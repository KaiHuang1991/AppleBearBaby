import React, { useContext, useEffect, useState } from 'react'
import { ShopContext } from '../context/ShopContext'
import Title from './Title'
import ProductItem from './ProductItem'
import { useNavigate } from 'react-router-dom'

const LatestCollection = () => {
  const navigate = useNavigate()
  const { products } = useContext(ShopContext)
  const [latestProducts, setLatestProducts] = useState([])

  useEffect(() => {
    setLatestProducts(products.slice(0, 8))
  }, [products])

  return (
    <section className='my-14 md:my-20'>
      <Title
        text1='Latest'
        text2='Collection'
        subtitle='Premium baby products available in bulk quantities for retailers, daycare centers, and healthcare facilities.'
      />

      <div className='flex flex-wrap items-center justify-center gap-3 mt-2 mb-8'>
        <span className='inline-flex items-center bg-blue-50 text-blue-700 text-xs font-medium px-3 py-1.5 rounded-full border border-blue-100'>Fast Delivery</span>
        <span className='inline-flex items-center bg-blue-50 text-blue-700 text-xs font-medium px-3 py-1.5 rounded-full border border-blue-100'>Best Prices</span>
        <span className='inline-flex items-center bg-blue-50 text-blue-700 text-xs font-medium px-3 py-1.5 rounded-full border border-blue-100'>Quality Assured</span>
      </div>

      <div className='grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8 catalog-product-grid'>
        {latestProducts.map((product) => (
          <ProductItem
            key={product._id}
            id={product._id}
            image={product.image}
            name={product.name}
            price={product.price}
          />
        ))}
      </div>

      <div className='text-center mt-10'>
        <button type='button' className='corp-btn px-8' onClick={() => navigate('/collection')}>
          View All Products
          <span aria-hidden='true'>→</span>
        </button>
      </div>
    </section>
  )
}

export default LatestCollection
