import React from 'react'
import Hero from '../componets/Hero'
import OurFactory from '../componets/OurFactory'
import LatestCollection from '../componets/LatestCollection'
import HotSale from '../componets/HotSale'
import BabyProducts from '../componets/BabyProducts'
import LatestBlog from '../componets/LatestBlog'
import LatestVideos from '../componets/LatestVideos'
import ContactSidebar from '../componets/ContactSidebar'
import ScrollToTop from '../componets/ScrollToTop'

const Home = () => {
  return (
    <div className='relative bg-white pt-[4.25rem] sm:pt-[4.5rem] lg:pt-[4.75rem] overflow-x-hidden'>
      <ContactSidebar />
      <ScrollToTop />
      {/* Hero — edge-to-edge on all viewports */}
      <div className='hero-fullbleed-wrap'>
        <Hero />
      </div>
      
      {/* Content Modules */}
      <div className='w-full overflow-hidden'>
        <OurFactory />
        
        <div className="relative w-[90%] sm:w-[80%] lg:w-[80%] mx-auto mt-6 sm:mt-10 lg:mt-14">
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
            <LatestVideos />
          </div>
        </div>
      </div>
    </div>
  )
}

export default Home
