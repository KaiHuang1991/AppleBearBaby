import React from 'react'
import { assets } from '../src/assets/assets'

const OurPolicy = () => {
  return (
    <div className='relative py-20'>
      {/* Background decoration */}
      <div className="absolute inset-0 bg-gradient-to-r from-pink-100/30 via-orange-100/30 to-yellow-100/30 rounded-3xl"></div>
      <div className="absolute top-0 left-1/3 w-48 h-48 bg-pink-200/20 rounded-full"></div>
      <div className="absolute bottom-0 right-1/3 w-32 h-32 bg-orange-200/20 rounded-full"></div>
      
      <div className='relative z-10 flex flex-col sm:flex-row justify-around gap-12 text-center text-xs sm:text-sm md:text-base text-gray-700'>
        <div className='bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300'>
          <img src={assets.exchange_icon} className='w-12 m-auto mb-5' alt="" />
          <p className='font-semibold'>Bulk Order Discounts</p>
          <p className='text-gray-400'>Volume pricing for wholesale customers</p>
        </div>
        <div className='bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300'>
          <img src={assets.quality_icon} className='w-12 m-auto mb-5' alt="" />
          <p className='font-semibold'>Quality Assurance</p>
          <p className='text-gray-400'>All products meet safety standards</p>
        </div>
        <div className='bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300'>
          <img src={assets.support_img} className='w-12 m-auto mb-5' alt="" />
          <p className='font-semibold'>Dedicated Account Manager</p>
          <p className='text-gray-400'>Personal support for wholesale clients</p>
        </div>
      </div>
    </div>
  )
}

export default OurPolicy
