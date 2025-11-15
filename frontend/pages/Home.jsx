import React from 'react'
import Hero from '../componets/Hero'
import OurFactory from '../componets/OurFactory'
import LatestCollection from '../componets/LatestCollection'
import HotSale from '../componets/HotSale'
import BabyProducts from '../componets/BabyProducts'
import LatestBlog from '../componets/LatestBlog'
import ContactSidebar from '../componets/ContactSidebar'
import ScrollToTop from '../componets/ScrollToTop'

const Home = () => {
  return (
    <div className='relative bg-white top-[85.5px] mt-0 h-auto'>
      <ContactSidebar />
      <ScrollToTop />
      {/* Hero Section - Full Screen Width */}
      <div className=' w-full h-full overflow-hidden '>
        <Hero />
      </div>
      
      {/* Content Modules */}
      <div className='w-full overflow-hidden'>
        <OurFactory />
        
        <div className="relative w-[90%]  sm:w-[80%] lg:w-[80%] mx-auto mt-10 sm:mt-16">
          {/* Blue/Cyan Background Pattern */}
          <div className="absolute inset-0 cartoon-bg z-0"></div>
          <div className="absolute inset-0 cartoon-hearts opacity-10 z-0"></div>
          
          {/* Subtle floating elements */}
          <div className="absolute top-20 left-10 w-12 h-12 bg-blue-200 rounded-full gentle-float opacity-40 z-0"></div>
          <div className="absolute bottom-40 right-20 w-8 h-8 bg-cyan-200 rounded-full gentle-bounce opacity-40 z-0"></div>
          
          <div className='relative z-10 py-8'>
            <LatestCollection />
            <HotSale />
            <BabyProducts />
            <LatestBlog />
          </div>
        </div>
      </div>
    </div>
  )
}

export default Home
