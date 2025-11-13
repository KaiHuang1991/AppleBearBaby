import React from 'react'
import { assets } from '../src/assets/assets'

const Footer = () => {
  return (
    <div className='relative px-4 sm:px-[5vw] md:px-[7vw] lg:px-[8vw]'>
      {/* Blue/Cyan background decoration */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50/30 to-cyan-50/30 rounded-t-3xl"></div>
      <div className="absolute top-0 left-1/4 w-20 h-20 bg-blue-200/20 rounded-full gentle-float"></div>
      <div className="absolute bottom-0 right-1/4 w-16 h-16 bg-cyan-200/20 rounded-full gentle-bounce"></div>
      
      <div className='relative z-10'>
        <div className='grid grid-cols-1 lg:grid-cols-[2fr_1fr_1fr] gap-12 md:gap-14 my-10 mt-24 md:mt-36 text-sm items-start text-center lg:text-left'>
          <div>
              <div className='flex items-center justify-center lg:justify-start gap-2 mb-5'>
                  <img className='w-44' src={assets.logo} alt="" />
                  <span className='text-2xl gentle-bounce'>🌟</span>
              </div>
              <p className='max-w-xl mx-auto lg:mx-0 text-gray-600 mb-4 leading-relaxed'>
                Leading wholesale supplier of premium baby care products for healthcare facilities, daycare centers, and retailers. Quality assurance, bulk pricing, and dedicated support for wholesale clients.
              </p>
              
              {/* Features */}
              <div className='flex flex-wrap justify-center lg:justify-start gap-3'>
                <div className='flex items-center bg-blue-100 px-3 py-1 rounded-full'>
                  <span className='text-sm mr-1'>✅</span>
                  <span className='text-xs font-medium'>Quality Assured</span>
                </div>
                <div className='flex items-center bg-cyan-100 px-3 py-1 rounded-full'>
                  <span className='text-sm mr-1'>🚚</span>
                  <span className='text-xs font-medium'>Fast Delivery</span>
                </div>
                <div className='flex items-center bg-blue-50 px-3 py-1 rounded-full'>
                  <span className='text-sm mr-1'>💰</span>
                  <span className='text-xs font-medium'>Best Prices</span>
                </div>
              </div>
          </div>
          <div>
              <div className='flex items-center justify-center lg:justify-start gap-2 mb-5'>
                  <p className='text-xl font-medium'>WHOLESALE</p>
                  <span className='text-xl gentle-float'>🛍️</span>
              </div>
              <ul className='flex flex-col gap-2 text-gray-600 text-base items-center lg:items-start'>
                  <li className='hover:text-blue-600 transition-colors duration-300 cursor-pointer'>Bulk Orders</li>
                  <li className='hover:text-blue-600 transition-colors duration-300 cursor-pointer'>Healthcare Facilities</li>
                  <li className='hover:text-blue-600 transition-colors duration-300 cursor-pointer'>Daycare Centers</li>
                  <li className='hover:text-blue-600 transition-colors duration-300 cursor-pointer'>Retailers</li>
              </ul>
          </div>
          <div>
              <div className='flex items-center justify-center lg:justify-start gap-2 mb-5'>
                  <p className='text-xl font-medium'>Wholesale Contact</p>
                  <span className='text-xl gentle-bounce'>📞</span>
              </div>
              <ul className='flex flex-col gap-2 text-gray-600 text-base items-center lg:items-start'>
                 <li className='hover:text-blue-600 transition-colors duration-300 cursor-pointer'>+86-15867976938</li>
                 <li className='hover:text-blue-600 transition-colors duration-300 cursor-pointer'>wholesale@babycare.com</li>   
              </ul>
              
              {/* Social media icons */}
              <div className='flex gap-3 mt-4 justify-center lg:justify-start'>
                  <div className='w-8 h-8 bg-blue-200 rounded-full flex items-center justify-center hover:scale-110 transition-transform duration-300 cursor-pointer'>
                      <span className='text-sm'>📧</span>
                  </div>
                  <div className='w-8 h-8 bg-cyan-200 rounded-full flex items-center justify-center hover:scale-110 transition-transform duration-300 cursor-pointer'>
                      <span className='text-sm'>📱</span>
                  </div>
                  <div className='w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center hover:scale-110 transition-transform duration-300 cursor-pointer'>
                      <span className='text-sm'>💬</span>
                  </div>
              </div>
          </div>
        </div>
        
        <div>
            <hr className='border-blue-200' />
            <div className='py-5 text-sm text-center'>
                <p className='text-gray-600'>Copyright 2025@applebearbaby.com - All Rights Reserved</p>
                <div className='flex items-center justify-center gap-2 mt-2'>
                    <span className='text-xs'>Made with</span>
                    <span className='text-blue-500 text-lg gentle-bounce'>💖</span>
                    <span className='text-xs'>for baby care</span>
                </div>
            </div>
        </div>
      </div>
    </div>
  )
}

export default Footer
