import React, { useContext, useEffect, useState } from 'react'
import { ShopContext } from '../context/ShopContext'
import Title from './Title'
import ProductItem from './ProductItem'
import { useNavigate } from 'react-router-dom'

const LatestCollection = () => {
    const navigate = useNavigate()
    const {products} = useContext(ShopContext)
    const [latestProducts,setLatestProducts]=useState([])
    useEffect(()=>{
        setLatestProducts(products.slice(0,10))
    },[products])

    const handleViewAllProducts = () => {
        navigate('/collection')
    }

    return (
    <div className='my-10 relative'>
        {/* Blue/Cyan Background decoration */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-cyan-50/50 rounded-3xl"></div>
        <div className="absolute top-0 left-1/4 w-32 h-32 bg-blue-200/30 rounded-full gentle-float"></div>
        <div className="absolute bottom-0 right-1/4 w-24 h-24 bg-cyan-200/30 rounded-full gentle-bounce"></div>
        
        <div className='relative z-10'>
            <div className='text-center py-8 px-4 sm:px-8'>
                <div className='flex items-center justify-center mb-4'>
                    <span className='text-3xl mr-4 gentle-bounce'>🛍️</span>
                    <Title text1="LATEST" text2="COLLECTION"/>
                    <span className='text-3xl ml-4 gentle-float'>📦</span>
                </div>
                <p className='max-w-3xl mx-auto text-xs sm:text-sm md:text-base text-gray-600'>
                Premium baby products available in bulk quantities. Perfect for retailers, daycare centers, hospitals, and healthcare facilities. Competitive wholesale pricing and reliable supply chain.
                </p>
                
                {/* Stats */}
                <div className='flex flex-wrap items-center justify-center gap-3 sm:gap-6 mt-6'>
                    <div className='flex items-center bg-blue-100 px-4 py-2 rounded-full shadow-sm'>
                        <span className='text-2xl mr-2'>🚀</span>
                        <span className='font-semibold text-sm'>Fast Delivery</span>
                    </div>
                    <div className='flex items-center bg-cyan-100 px-4 py-2 rounded-full shadow-sm'>
                        <span className='text-2xl mr-2'>💰</span>
                        <span className='font-semibold text-sm'>Best Prices</span>
                    </div>
                    <div className='flex items-center bg-blue-50 px-4 py-2 rounded-full shadow-sm'>
                        <span className='text-2xl mr-2'>✅</span>
                        <span className='font-semibold text-sm'>Quality Assured</span>
                    </div>
                </div>
            </div>
            
            {/*Rendring Products*/}
            <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6 gap-y-6 sm:gap-y-8 px-2 sm:px-0'>
                {
                    latestProducts.map((product,productIndex)=>(
                       <div key={productIndex} >
                           <ProductItem id={product._id} image={product.image} name={product.name} price={product.price} />
                       </div>
                    ))
                }
               
            </div>
            
            {/* Call to action */}
            <div className='text-center mt-8'>
                <button 
                    className='cartoon-btn px-8 py-3 text-white font-bold text-lg'
                    onClick={handleViewAllProducts}
                >
                    View All Products 🛒
                </button>
                <p className='text-gray-600 mt-4 text-sm'>
                    <span className='text-blue-500 font-semibold'>🌟 Special Offer:</span> Get 10% off on orders above $500!
                </p>
            </div>
        </div>
    </div>
  )
}

export default LatestCollection
