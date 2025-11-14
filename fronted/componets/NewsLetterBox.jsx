import React from 'react'

const NewsLetterBox = () => {
    const onSubmitHandler=(event)=>{
        event.preventDefault()
    }
  return (
    <div className='text-center relative py-16'>
      {/* Background decoration */}
      <div className="absolute inset-0 bg-gradient-to-br from-pink-50/50 to-orange-50/50 rounded-3xl"></div>
      <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-yellow-200/30 rounded-full"></div>
      <div className="absolute bottom-1/4 right-1/4 w-24 h-24 bg-pink-200/30 rounded-full"></div>
      
      <div className='relative z-10'>
        <p className='text-2xl font-medium text-gray-800'>Wholesale Inquiries</p>
        <p className='text-gray-400 mt-3'>Get wholesale pricing, bulk order information, and exclusive deals for healthcare facilities, daycare centers, and retailers. Join our wholesale program today.</p>
        <form onSubmit={onSubmitHandler} className='w-full sm:w-1/2 flex items-center gap-3 mx-auto my-6 bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-4'>
          <input type="email" className='w-full flex-1 outline-none bg-transparent' placeholder='Enter your business email' required={true}/>
          <button type ="submit" className="bg-black text-white text-xs px-10 py-4 rounded-xl hover:bg-gray-800 transition-colors duration-300">REQUEST QUOTE</button>
        </form>
      </div>
    </div>
  )
}

export default NewsLetterBox
