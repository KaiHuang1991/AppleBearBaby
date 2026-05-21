import React, { useEffect, useState } from 'react'
import { assets } from '../src/admin_assets/assets'
import { NavLink } from 'react-router-dom'
import axios from 'axios'

const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:4000'

const SideBar = () => {
  const [inquiryUnread, setInquiryUnread] = useState(0)

  useEffect(() => {
    const loadUnread = async () => {
      const token = localStorage.getItem('token')
      if (!token) {
        setInquiryUnread(0)
        return
      }
      try {
        const r = await axios.get(`${backendUrl}/api/inquiries/admin/unread-count`, {
          headers: { token }
        })
        if (r.data?.success && typeof r.data.count === 'number') {
          setInquiryUnread(r.data.count)
        }
      } catch {
        /* ignore */
      }
    }

    loadUnread()
    const interval = setInterval(loadUnread, 45000)
    const onRefresh = () => {
      loadUnread()
    }
    window.addEventListener('admin-inquiry-unread-refresh', onRefresh)
    return () => {
      clearInterval(interval)
      window.removeEventListener('admin-inquiry-unread-refresh', onRefresh)
    }
  }, [])

  return (
    <aside className='sticky top-14 z-30 w-[18%] shrink-0 self-start max-h-[calc(100vh-3.5rem)] overflow-y-auto border-r-2 border-gray-200 bg-gray-50'>
      <div className='flex flex-col gap-4 pt-6 pb-8 pl-[20%] text-[15px]'>
        <NavLink className ='flex items-center gap-3 border border-gray-300 border-r-0 px-3 py-2 rounded-l' to='/add'>
            <img className='w-5 h-5' src={assets.add_icon} alt="" />
            <p className='hidden md:block'>Add Items</p>
        </NavLink>
        <NavLink className ='flex items-center gap-3 border border-gray-300 border-r-0 px-3 py-2 rounded-l' to='/list'>
            <img className='w-5 h-5' src={assets.order_icon} alt="" />
            <p className='hidden md:block'>List Items</p>
        </NavLink>
        <NavLink className ='flex items-center gap-3 border border-gray-300 border-r-0 px-3 py-2 rounded-l' to='/categories'>
            <span className='w-5 h-5 text-lg'>🗂️</span>
            <p className='hidden md:block'>Categories</p>
        </NavLink>
        <NavLink
          className="flex items-center gap-3 border border-gray-300 border-r-0 px-3 py-2 rounded-l"
          to="/users"
        >
          <img className="w-5 h-5" src={assets.parcel_icon} alt="" />
          <p className="block">Registered Users</p>
        </NavLink>
        <NavLink className ='flex items-center gap-3 border border-gray-300 border-r-0 px-3 py-2 rounded-l' to='/inquiries'>
            <img className='w-5 h-5' src={assets.order_icon} alt="" />
            <p className='hidden md:block flex items-center gap-2'>
              Inquiries
              {inquiryUnread > 0 ? (
                <span className="min-w-[1.25rem] rounded-full bg-amber-500 px-1.5 py-0.5 text-center text-[11px] font-bold text-white">
                  {inquiryUnread > 99 ? '99+' : inquiryUnread}
                </span>
              ) : null}
            </p>
        </NavLink>
        <NavLink className ='flex items-center gap-3 border border-gray-300 border-r-0 px-3 py-2 rounded-l' to='/blogs'>
            <span className='w-5 h-5 text-lg'>📝</span>
            <p className='hidden md:block'>Blog Management</p>
        </NavLink>
        <NavLink className ='flex items-center gap-3 border border-gray-300 border-r-0 px-3 py-2 rounded-l' to='/hero'>
            <span className='w-5 h-5 text-lg'>🎯</span>
            <p className='hidden md:block'>Hero Section</p>
        </NavLink>
        <NavLink className ='flex items-center gap-3 border border-gray-300 border-r-0 px-3 py-2 rounded-l' to='/videos'>
            <span className='w-5 h-5 text-lg'>🎬</span>
            <p className='hidden md:block'>Videos</p>
        </NavLink>
      </div>
    </aside>
  )
}

export default SideBar
