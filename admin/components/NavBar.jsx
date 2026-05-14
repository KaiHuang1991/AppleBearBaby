import React from 'react'
import {assets} from '../src/admin_assets/assets'

const NavBar = ({setToken}) => {
  return (
    <div className='flex h-full min-h-14 items-center justify-between px-[4%]'>
        <img className='max-h-10 w-[max(10%,80px)] object-contain' src={assets.Icon} alt="" />
        <button onClick={()=>{setToken('')}} className='bg-gray-600 text-white px-5 py-2 sm:px-7 sm:py-2 rounded-full text-xs sm:text-sm'>Log Out</button>      
    </div>
  )
}

export default NavBar
