import React from 'react'
import HomeLanding from '../componets/HomeLanding'
import GetQuoteSection from '../componets/GetQuoteSection'
import ContactSidebar from '../componets/ContactSidebar'
import ScrollToTop from '../componets/ScrollToTop'

const Home = () => {
  return (
    <div className='relative bg-white pt-[4.25rem] sm:pt-[4.5rem] lg:pt-[4.75rem] overflow-x-hidden'>
      <ContactSidebar />
      <ScrollToTop />
      <HomeLanding />
      <GetQuoteSection />
    </div>
  )
}

export default Home
