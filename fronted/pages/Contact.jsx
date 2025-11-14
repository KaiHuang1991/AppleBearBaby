import React from 'react'
import Title from '../componets/Title'
import {assets} from '../src/assets/assets'
import NewsLetterBox from '../componets/NewsLetterBox'
import { useContext } from 'react'
import { ShopContext } from '../context/ShopContext'
import { useNavigate } from 'react-router-dom'

const Contact = () => {
  const navigate = useNavigate()

  const handleRequestQuote = () => {
    // Navigate to cart page for quote request
    navigate('/cart')
  }

  return (
    <div className="min-h-screen relative pt-28">
      {/* Blue/Cyan Background Pattern */}
      <div className="absolute inset-0 cartoon-bg"></div>
      <div className="absolute inset-0 cartoon-hearts opacity-10"></div>
      
      {/* Subtle floating elements */}
      <div className="absolute top-32 left-10 w-12 h-12 bg-blue-200 rounded-full gentle-float opacity-40"></div>
      <div className="absolute bottom-40 right-20 w-8 h-8 bg-cyan-200 rounded-full gentle-bounce opacity-40"></div>
      
      <div className='relative z-1'>
        <div className='flex flex-col items-center text-center text-2xl pt-4 border-t border-blue-200'>
          <Title text1={'CONTACT'} text2 ={'US'}/>
        </div>
              <div className=' my-10 flex flex-col justify-center items-start mb-28 relative rounded-3xl overflow-hidden min-h-[500px]'>
          {/* Background Image */}
          <div 
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{
              backgroundImage: 'url(https://s.alicdn.com/@sc02/kf/H56c71f1d8533465987410054de80328as.jpg?hasNWGrade=1)',
            }}
          ></div>
          
          {/* Decorative elements */}
          <div className="absolute top-1/4 right-1/4 w-32 h-32 bg-blue-200/30 rounded-full gentle-float"></div>
          <div className="absolute bottom-1/4 right-1/3 w-24 h-24 bg-cyan-200/30 rounded-full gentle-bounce"></div>
          
          <div className='relative z-10 flex justify-start w-full p-8 md:p-12'>
            <div className='ml-[-15px] cartoon-card p-10 md:p-12 flex flex-col justify-center items-start gap-6 w-full md:max-w-2xl'>
              <p className='font-semibold text-xl text-blue-600'>Wholesale Office</p>
              <p className='text-gray-500'>No.9 Hengde Road, Niansanli Street,<br/> Yiwu City, Jinhua City, Zhejiang Province, China</p>
              <p className='text-gray-500'>Tel:(+86)15867976938<br/>Email:1034201254@qq.com</p>
              <p className='font-semibold text-xl text-cyan-600'>Wholesale Inquiries</p>
              <p className='text-gray-500'>Get wholesale pricing, bulk order information, and exclusive deals for healthcare facilities and retailers</p>
              <button 
                className='cartoon-btn px-8 py-4 text-sm text-white font-semibold'
                onClick={handleRequestQuote}
              >
                Request Quote
              </button>
            </div>
          </div>
        </div>
      <NewsLetterBox/>
      </div>
    </div>
  )
}

export default Contact
