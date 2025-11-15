import React, { useContext, useEffect, useState } from 'react'
import {ShopContext} from '../context/ShopContext'
import Title from './Title'
import ProductItem from './ProductItem'

const BestSeller = () => {
    const {products}=useContext(ShopContext)
    const [bestSeller,setBestSeller] =useState([])
    useEffect(()=>{
        const bestProducts = products.filter((product)=>(product.bestseller))
        //console.log(bestProducts)
        setBestSeller(bestProducts.slice(0,5))
    },[products])
  return (
    <div className='my-10 relative'>
      {/* Background decoration */}
      <div className="absolute inset-0 bg-gradient-to-br from-orange-50/50 to-yellow-50/50 rounded-3xl"></div>
      <div className="absolute top-1/4 right-0 w-40 h-40 bg-pink-200/20 rounded-full"></div>
      <div className="absolute bottom-1/4 left-0 w-32 h-32 bg-orange-200/20 rounded-full"></div>
      
      <div className='relative z-10'>
        <div className='text-center text-3xl py-8'>
          <Title text1 ={"TOP"} text2={"PRODUCTS"}/>
          <p className='w-3/4 m-auto text-xs sm:text-sm md:text-base text-gray-600'>
          Our most popular wholesale items trusted by healthcare professionals and childcare facilities nationwide. High-quality, safe, and reliable baby care products.
          </p>
        </div>
        {/*Rendring Products*/}
        <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6 gap-y-8 grid-items-align'>
              {
                  bestSeller.map((product,productIndex)=>(
                     <ProductItem key={productIndex} id={product._id} image={product.image} name={product.name} price={product.price} />
                  ))
              }
             
          </div>
      </div>
    </div>
  )
}

export default BestSeller
