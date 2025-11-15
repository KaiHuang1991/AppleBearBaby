import React from 'react'
import Title from '../componets/Title'
import {assets} from '../src/assets/assets'
import NewsLetterBox from '../componets/NewsLetterBox'
const About = () => {
  return (
    <div className="min-h-screen relative pt-28">
      {/* Blue/Cyan Background Pattern */}
      <div className="absolute inset-0 cartoon-bg"></div>
      <div className="absolute inset-0 cartoon-hearts opacity-10"></div>
      
      {/* Subtle floating elements */}
      <div className="absolute top-32 left-10 w-12 h-12 bg-blue-200 rounded-full gentle-float opacity-40"></div>
      <div className="absolute bottom-40 right-20 w-8 h-8 bg-cyan-200 rounded-full gentle-bounce opacity-40"></div>
      
      <div className='relative z-1'>
        <div className='text-2xl text-center pt-4 border-t border-blue-200'>
          <Title text1={'ABOUT'} text2={'US'}/>
        </div>
      <div className='my-10 flex flex-col md:flex-row gap-16'>
        <img
          className='w-full md:max-w-[450px] rounded-2xl cartoon-shadow h-full object-contain bg-white'
          src={assets.about_bottles}
          alt="Baby bottles collection"
        />
        <div className='flex flex-col justify-center gap-6 md:w-2/4 text-gray-600'>
        <b className='text-gray-800'>Our Value</b>
        <p>We are committed to providing healthcare facilities, daycare centers, and retailers with the highest quality baby care products at competitive wholesale prices.</p>
          
          <b className='text-gray-800'>Our Mission</b>
          <p>To be the leading wholesale supplier of safe, reliable, and cost-effective baby care products for healthcare professionals and childcare facilities worldwide.</p>
          <b className='text-gray-800'>Our History</b>
          <p>Established in 1998, we have grown to become a trusted wholesale supplier serving healthcare facilities, hospitals, daycare centers, and retailers across the globe. Our comprehensive product line includes feeding supplies, diapering essentials, safety products, and hygiene items. With a dedicated team of 100+ professionals across design, production, quality control, and sales departments, we ensure consistent quality and reliable supply chain management. Our commitment remains: providing healthcare professionals with cost-effective, safe baby care products.</p>
        </div>
      </div>
      <div className='text-xl py-4'>
          <Title text1={'WHY'} text2={'CHOOSE US'}/>
      </div>
      <div className='flex flex-col md:flex-row text-sm mb-20 relative'>
        {/* Blue/Cyan Background decoration */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-100/20 to-cyan-100/20 rounded-3xl"></div>
        <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-blue-200/20 rounded-full gentle-float"></div>
        <div className="absolute bottom-1/4 right-1/4 w-24 h-24 bg-cyan-200/20 rounded-full gentle-bounce"></div>
        
        <div className='relative z-1 flex flex-col md:flex-row w-full'>
          <div className='cartoon-card px-10 md:px-16 py-8 sm:py-20 flex flex-col gap-5'>
            <b className='text-blue-600'>Quality Assurance</b>
            <p className='text-gray-600'>All our products meet or exceed international safety standards. We maintain rigorous quality control processes to ensure every item meets healthcare facility requirements.</p>
          </div>
          <div className='cartoon-card px-10 md:px-16 py-8 sm:py-20 flex flex-col gap-5'>
            <b className='text-cyan-600'>Bulk Ordering</b>
            <p className='text-gray-600'>Streamlined ordering process for healthcare facilities and daycare centers. Volume discounts, dedicated account management, and reliable supply chain.</p>
          </div>
          <div className='cartoon-card px-10 md:px-16 py-8 sm:py-20 flex flex-col gap-5'>
            <b className='text-blue-600'>Dedicated Support</b>
            <p className='text-gray-600'>Personal account managers for wholesale clients, 24/7 support, and customized solutions for healthcare facilities and childcare centers.</p>
          </div>
        </div>
      </div>
      <NewsLetterBox/>
      </div>
    </div>
  )
}

export default About
