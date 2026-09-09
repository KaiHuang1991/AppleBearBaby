import React from 'react'
import HomeLanding from '../componets/HomeLanding'
import GetQuoteSection from '../componets/GetQuoteSection'

const Home = () => {
  return (
    <div className='relative bg-white pt-[4.25rem] sm:pt-[4.5rem] lg:pt-[4.75rem] overflow-x-hidden'>
      <HomeLanding />
      <GetQuoteSection />
    </div>
  )
}

export default Home
