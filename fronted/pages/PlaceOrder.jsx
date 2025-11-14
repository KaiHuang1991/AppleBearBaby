import React from 'react'
import { useContext } from 'react'
import { useState } from 'react'
import CartTotal from '../componets/CartTotal'
import Title from '../componets/Title'
import { ShopContext } from '../context/ShopContext'
import { assets } from '../src/assets/assets'

const PlaceOrder = () => {
  const {navigate} =useContext(ShopContext)
  const [method,setMethod] =useState('cod')
  return (
    <div className='flex flex-col sm:flex-row justify-between gap-4 pt-5 sm:pt-14 min-h-[80vh] border-t'>
      {/*left side*/}
      <div className='flex flex-col gap-4 w-full sm:max-w-[480px]'>
        <div className='text-xl sm:text-2xl my-3'>
          <Title text1={'DELIVERY'} text2={'INFORMATION'}/>
        </div>
        <div className='flex gap-3'>
          <input type="text" className='border border-gray-300 rounded py-1.5 px-3.5 w-full' placeholder='First Name' />
          <input type="text" className='border border-gray-300 rounded py-1.5 px-3.5 w-full' placeholder='Last Name' />
        </div>
        <input type="email" className='border border-gray-300 rounded py-1.5 px-3.5 w-full' placeholder='Email Address' />
        <input type="text" className='border border-gray-300 rounded py-1.5 px-3.5 w-full' placeholder='Street' />
        <div className='flex gap-3'>
          <input type="text" className='border border-gray-300 rounded py-1.5 px-3.5 w-full' placeholder='City' />
          <input type="text" className='border border-gray-300 rounded py-1.5 px-3.5 w-full' placeholder='State' />
        </div> 
        <div className='flex gap-3'>
          <input type="number" className='border border-gray-300 rounded py-1.5 px-3.5 w-full' placeholder='Zipcode' />
          <input type="text" className='border border-gray-300 rounded py-1.5 px-3.5 w-full' placeholder='Country' />
        </div>     
        <input type="number" className='border border-gray-300 rounded py-1.5 px-3.5 w-full' placeholder='Phone' />
      </div>
      {/*right side*/}
      <div className='mt-8'>
        <div className='mt-8 min-w-120'>
          <CartTotal/>
        </div>
        <div className='mt-12'>
          <Title text1 ={'PAYMENT'}  text2={'METHOD'}/>
          {/*Payment Method Selection*/}
          <div className='flex gap-3 flex-col lg:flex-row'>
            <div onClick={()=>{setMethod('stripe')}} className='flex items-center gap-3 border px-2 py-3 cursor-pointer'>
              <p className={`min-w-3.5 h-3.5 border rounded-full  ${method ==='stripe'?'bg-green-400':''} `}></p>
              <img src={assets.stripe_logo} className='h5 mx-4' alt="" />
            </div>
            <div onClick={()=>{setMethod('razorpay')}} className='flex items-center gap-3 border px-2 py-3 cursor-pointer'>
              <p className={`min-w-3.5 h-3.5 border rounded-full ${method ==='razorpay'?'bg-green-400':''} `}></p>
              <img src={assets.razorpay_logo} className='h5 mx-4' alt="" />
            </div>
            <div onClick={()=>{setMethod('cod')}} className='flex items-center gap-3 border px-2 py-3 cursor-pointer'>
              <p className={`min-w-3.5 h-3.5 border rounded-full ${method ==='cod'?'bg-green-400':''}`}></p>
              <p className='text-gray-500 text-sm font-medium mx-4 '>CASH ON DELIVERY</p>
            </div>
          </div>
          <div className='w-full text-end mt-8'>
            <button onClick={()=>navigate('/orders')} className='bg-black text text-white px-16 py-3 text-sm'>PLACE ORDER</button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PlaceOrder
