import React from 'react'

const NewsLetterBox = () => {
  const onSubmitHandler = (event) => {
    event.preventDefault()
  }

  return (
    <section className='section-container py-16 md:py-20'>
      <div className='max-w-3xl mx-auto text-center bg-slate-50 border border-slate-200 rounded-xl px-6 py-10 md:px-12 md:py-14'>
        <h3 className='text-2xl font-bold text-slate-800'>Wholesale Inquiries</h3>
        <p className='text-slate-600 mt-3 leading-relaxed'>
          Get wholesale pricing, bulk order information, and exclusive deals for healthcare facilities, daycare centers, and retailers.
        </p>
        <form
          onSubmit={onSubmitHandler}
          className='w-full flex flex-col sm:flex-row items-stretch gap-3 mx-auto mt-8 max-w-xl'
        >
          <input
            type='email'
            className='flex-1 outline-none bg-white border border-slate-300 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
            placeholder='Enter your business email'
            required
          />
          <button type='submit' className='corp-btn whitespace-nowrap px-8'>
            Request Quote
          </button>
        </form>
      </div>
    </section>
  )
}

export default NewsLetterBox
