import React, { useContext, useState, useEffect } from 'react'
import {assets} from '../src/assets/assets'
import { NavLink, Link, useLocation  } from 'react-router-dom'
import { ShopContext } from '../context/ShopContext'
import SideCart from './SideCart'

const NavBar = () => {
    const [visiable,setVisiable] = useState(false)
    const [showDropdown, setShowDropdown] = useState(false)
    const {setShowSearch,getCartCount,navigate,token,setToken,setCartItems, openCart, user, logout} = useContext(ShopContext)
    const location = useLocation()
    const isHomePage = location.pathname === '/'
    
    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (showDropdown && !event.target.closest('.dropdown-container')) {
                setShowDropdown(false)
            }
        }
        
        document.addEventListener('mousedown', handleClickOutside)
        return () => {
            document.removeEventListener('mousedown', handleClickOutside)
        }
    }, [showDropdown])
    
    const logOut = async () => {
        // Use the logout function from context which handles cookie clearing
        if (logout) {
          await logout()
        } else {
          // Fallback if logout function is not available
          navigate("/login")
          localStorage.removeItem("token")
          localStorage.removeItem('userId')
          localStorage.removeItem('userName')
          localStorage.removeItem('userEmail')
          localStorage.removeItem('userAvatar')
          localStorage.removeItem('joinDate')
          setToken('')
          setCartItems({})
        }
    }
  return (
    <>
    <div className="fixed w-full bg-white/90 backdrop-blur-sm top-0 left-0 right-0 border-b-2 border-blue-500" style={{zIndex: 9999}}>
      <div className='flex items-center justify-between py-4 sm:py-5  px-4 sm:px-[7vw] md:px-[10vw] lg:px-[10vw]'>
        <Link to='/' className='flex items-center gap-2'>
            <img src='../src/assets/icon.gif' className="w-28 sm:w-36 gentle-bounce" alt="" />
            <span className='text-xl sm:text-2xl gentle-float'>🌟</span>
        </Link>
        <ul className="hidden sm:flex gap-5 text-base text-gray-700">
            <NavLink to='/' className="flex flex-col items-center gap-2 hover:scale-105 transition-transform duration-300">
                <p className='font-semibold'>HOME</p>
                <hr className="w-2/4 border-none h-[1.5px] bg-blue-500 invisible"/>
            </NavLink>
            <NavLink to='/collection' className="flex flex-col items-center gap-2 hover:scale-105 transition-transform duration-300">
                <p className='font-semibold'>WHOLESALE</p>
                <hr className="w-2/4 border-none h-[1.5px] bg-blue-500 invisible"/>
            </NavLink> 
            <NavLink to='/about' className="flex flex-col items-center gap-2 hover:scale-105 transition-transform duration-300">
                <p className='font-semibold'>ABOUT</p>
                <hr className="w-2/4 border-none h-[1.5px] bg-blue-500 invisible"/>
            </NavLink>
            <NavLink to='/contact' className="flex flex-col items-center gap-2 hover:scale-105 transition-transform duration-300">
                <p className='font-semibold'>CONTACT</p>
                <hr className="w-2/4 border-none h-[1.5px] bg-blue-500 invisible"/>
            </NavLink>
            <NavLink to='/blogs' className="flex flex-col items-center gap-2 hover:scale-105 transition-transform duration-300">
                <p className='font-semibold'>BLOG</p>
                <hr className="w-2/4 border-none h-[1.5px] bg-blue-500 invisible"/>
            </NavLink>
        </ul>
        <div className='flex items-center gap-3 sm:gap-6'>
            {/* <img onClick={()=>{setShowSearch(true)}} src={assets.search_icon} alt="" className='w-5 cursor-pointer hover:scale-110 transition-transform duration-300' /> */}
            <div className='relative dropdown-container flex items-center gap-2'>
                {token && (user?.name || localStorage.getItem('userName')) && (
                  <span className='hidden sm:inline-block text-sm font-medium text-gray-700'>
                    {user?.name || localStorage.getItem('userName')}
                  </span>
                )}
                <img 
                  onClick={()=>token? setShowDropdown(!showDropdown):navigate('/login')} 
                  onMouseEnter={() => token ? setShowDropdown(true) : null}
                  onMouseLeave={() => setShowDropdown(false)}
                  src={user?.avatar || localStorage.getItem('userAvatar') || assets.profile_icon} 
                  className={`cursor-pointer hover:scale-110 transition-transform duration-300 ${token && (user?.avatar || localStorage.getItem('userAvatar')) ? 'w-9 h-9 rounded-full object-cover border border-blue-200' : 'w-5'}`} 
                  alt="Profile" 
                />
                {token && showDropdown &&
                <div 
                  className='dropdown-menu absolute right-0 top-full pt-2 z-[60]'
                  onMouseEnter={() => setShowDropdown(true)}
                  onMouseLeave={() => setShowDropdown(false)}
                >
                    <div className="flex flex-col gap-2 w-36 py-3 px-5 cartoon-card text-gray-500 shadow-lg bg-white border border-gray-200">
                        <p onClick={()=>navigate('/profile')} className='cursor-pointer hover:text-blue-600 transition-colors duration-300'>My Profile</p>
                        <p onClick={()=>navigate('/inquiries')} className='cursor-pointer hover:text-blue-600 transition-colors duration-300'>Inquiries</p>
                        <p onClick={logOut} className='cursor-pointer hover:text-blue-600 transition-colors duration-300'>Logout</p>
                    </div>
                </div>}
            </div>
            <button type='button' onClick={() => openCart()} className='relative'>
                <img id='cart-icon' src={assets.cart_icon} className='w-5 min-w-5 hover:scale-110 transition-transform duration-300' alt="" />
                <p className='absolute right-[-5px] bottom-[-5px] w-4 text-center leading-4 bg-blue-500 text-white aspect-square rounded-full text-[12px] gentle-bounce'>{getCartCount()}</p>
            </button>
            <button
              type='button'
              onClick={()=>{setVisiable(true)}}
              className='sm:hidden inline-flex items-center justify-center p-2 rounded-full hover:bg-blue-50 transition-colors duration-200'
              aria-label='Open menu'
            >
              <svg className='w-5 h-5 text-blue-600' fill='none' stroke='currentColor' strokeWidth='1.8' strokeLinecap='round' strokeLinejoin='round' viewBox='0 0 24 24'>
                <path d='M4 6h16M4 12h16M4 18h16' />
              </svg>
            </button>
        </div>
        {/*sidebar menu for small screens*/}
        <div className={`fixed top-0 right-0 h-screen overflow-hidden bg-white/95 backdrop-blur-sm transition-all z-[60] ${visiable?'w-full':'w-0'}`}>
            <div className='flex flex-col text-gray-600'>
                <div onClick={()=>{setVisiable(false)}} className='flex items-center gap-4 p-3'>
                    <img className='h-4 rotate-180' src={assets.dropdown_icon} alt="" />
                    <p>Back</p>
                </div>
                <NavLink onClick={()=>{setVisiable(false)}} className='py-2 pl-6 border hover:bg-blue-50 transition-colors duration-300' to='/'>HOME</NavLink>
                <NavLink onClick={()=>{setVisiable(false)}} className='py-2 pl-6 border hover:bg-blue-50 transition-colors duration-300' to='/collection'>WHOLESALE</NavLink>
                <NavLink onClick={()=>{setVisiable(false)}} className='py-2 pl-6 border hover:bg-blue-50 transition-colors duration-300' to='/about'>ABOUT</NavLink>
                <NavLink onClick={()=>{setVisiable(false)}} className='py-2 pl-6 border hover:bg-blue-50 transition-colors duration-300' to='/contact'>CONTACT</NavLink>
                <NavLink onClick={()=>{setVisiable(false)}} className='py-2 pl-6 border hover:bg-blue-50 transition-colors duration-300' to='/blogs'>BLOG</NavLink>
            </div>
        </div>
      </div>
    </div>
    <SideCart/>
    </>
  )
}

export default NavBar
