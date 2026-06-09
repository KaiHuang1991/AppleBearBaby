import React, { useContext, useState, useEffect } from 'react'
import {assets} from '../src/assets/assets'
import { NavLink, Link, useLocation  } from 'react-router-dom'
import { ShopContext } from '../context/ShopContext'
import SideCart from './SideCart'

const NavBar = () => {
    const [visiable,setVisiable] = useState(false)
    const [showDropdown, setShowDropdown] = useState(false)
    const {setShowSearch,getCartCount,navigate,token,setToken,setCartItems, openCart, user, logout, inquiryUnreadCount, requestCustomerInquiryDesktopAlerts} = useContext(ShopContext)
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
    
    const displayName = user?.name || localStorage.getItem('userName')
    const avatarSrc = user?.avatar || localStorage.getItem('userAvatar') || assets.profile_icon
    const hasCustomAvatar = Boolean(token && (user?.avatar || localStorage.getItem('userAvatar')))

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
    <nav className="site-navbar fixed w-full bg-white/95 backdrop-blur-sm top-0 left-0 right-0 border-b border-slate-200 shadow-sm" style={{zIndex: 9999}} aria-label="Main navigation">
      <div className='navbar-inner flex items-center justify-between gap-3 py-3 sm:py-3.5 lg:py-4 px-4 sm:px-6 lg:px-[10vw] min-h-[4.25rem] lg:min-h-0'>
        <Link to='/' className='flex items-center gap-2 shrink-0 min-w-0'>
            <img draggable={false} src='../src/assets/logo.png' className="w-24 sm:w-28 lg:w-32 pointer-events-none" alt="Applebear" />
        </Link>
        <ul className="hidden lg:flex flex-1 justify-center gap-4 xl:gap-6 text-sm text-slate-600 min-w-0 px-2">
            <NavLink to='/' className="flex flex-col items-center gap-1 hover:text-blue-600 transition-colors shrink-0">
                <span className='font-semibold pointer-events-none whitespace-nowrap tracking-wide'>HOME</span>
                <hr className="w-2/4 border-none h-[2px] bg-blue-600 invisible"/>
            </NavLink>
            <NavLink to='/collection' className="flex flex-col items-center gap-1 hover:text-blue-600 transition-colors shrink-0">
                <span className='font-semibold pointer-events-none whitespace-nowrap tracking-wide'>WHOLESALE</span>
                <hr className="w-2/4 border-none h-[2px] bg-blue-600 invisible"/>
            </NavLink> 
            <NavLink to='/about' className="flex flex-col items-center gap-1 hover:text-blue-600 transition-colors shrink-0">
                <span className='font-semibold pointer-events-none whitespace-nowrap tracking-wide'>ABOUT</span>
                <hr className="w-2/4 border-none h-[2px] bg-blue-600 invisible"/>
            </NavLink>
            <NavLink to='/contact' className="flex flex-col items-center gap-1 hover:text-blue-600 transition-colors shrink-0">
                <span className='font-semibold pointer-events-none whitespace-nowrap tracking-wide'>CONTACT</span>
                <hr className="w-2/4 border-none h-[2px] bg-blue-600 invisible"/>
            </NavLink>
            <NavLink to='/blogs' className="flex flex-col items-center gap-1 hover:text-blue-600 transition-colors shrink-0">
                <span className='font-semibold pointer-events-none whitespace-nowrap tracking-wide'>BLOG</span>
                <hr className="w-2/4 border-none h-[2px] bg-blue-600 invisible"/>
            </NavLink>
            <NavLink to='/videos' className="flex flex-col items-center gap-1 hover:text-blue-600 transition-colors shrink-0">
                <span className='font-semibold pointer-events-none whitespace-nowrap tracking-wide'>VIDEOS</span>
                <hr className="w-2/4 border-none h-[2px] bg-blue-600 invisible"/>
            </NavLink>
        </ul>
        <div className='flex items-center gap-2 sm:gap-3 lg:gap-6 shrink-0'>
            {/* <img onClick={()=>{setShowSearch(true)}} src={assets.search_icon} alt="" className='w-5 cursor-pointer hover:scale-110 transition-transform duration-300' /> */}
            <div className='relative dropdown-container'>
                {token ? (
                  <button
                    type="button"
                    aria-expanded={showDropdown}
                    aria-haspopup="true"
                    aria-label={displayName ? `Account menu, ${displayName}` : 'Account menu'}
                    onClick={() => setShowDropdown(!showDropdown)}
                    onMouseEnter={() => setShowDropdown(true)}
                    className="profile-trigger flex items-center gap-2 cursor-pointer bg-transparent border-0 p-0 outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-1 rounded-lg"
                  >
                    {displayName ? (
                      <span className="hidden lg:inline-block max-w-[8rem] xl:max-w-[12rem] truncate text-sm font-medium text-gray-700 pointer-events-none">
                        {displayName}
                      </span>
                    ) : null}
                    <span className="relative shrink-0 inline-flex pointer-events-none">
                      <img
                        draggable={false}
                        src={avatarSrc}
                        className={`hover:scale-110 transition-transform duration-300 ${hasCustomAvatar ? 'w-9 h-9 rounded-full object-cover border border-blue-200' : 'w-5'}`}
                        alt=""
                      />
                      {inquiryUnreadCount > 0 ? (
                        <span
                          className="absolute -top-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-emerald-500 ring-2 ring-white shadow-sm"
                          title={
                            inquiryUnreadCount === 1
                              ? 'New reply to your inquiry'
                              : `${inquiryUnreadCount} new inquiry replies`
                          }
                          aria-hidden="true"
                        />
                      ) : null}
                    </span>
                  </button>
                ) : (
                  <button
                    type="button"
                    aria-label="Log in"
                    onClick={() => navigate('/login')}
                    className="profile-trigger cursor-pointer bg-transparent border-0 p-0 outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-1 rounded-full"
                  >
                    <img
                      draggable={false}
                      src={avatarSrc}
                      className="w-5 hover:scale-110 transition-transform duration-300 pointer-events-none"
                      alt=""
                    />
                  </button>
                )}
                {token && showDropdown &&
                <div 
                  className='dropdown-menu absolute right-0 top-full pt-2 z-[60]'
                  onMouseEnter={() => setShowDropdown(true)}
                  onMouseLeave={() => setShowDropdown(false)}
                >
                    <div className="flex flex-col gap-2 w-44 py-3 px-5 bg-white text-gray-600 shadow-lg border border-slate-200 rounded-lg">
                        <button type="button" onClick={() => { navigate('/profile'); setShowDropdown(false) }} className='w-full text-left cursor-pointer hover:text-blue-600 transition-colors duration-300 bg-transparent border-0 p-0'>My Profile</button>
                        <button type="button" onClick={() => { navigate('/inquiries'); setShowDropdown(false) }} className='w-full flex cursor-pointer items-center justify-between gap-2 hover:text-blue-600 transition-colors duration-300 bg-transparent border-0 p-0'>
                          <span>Inquiries</span>
                          {inquiryUnreadCount > 0 ? (
                            <span className="rounded-full bg-amber-500 px-2 py-0.5 text-[11px] font-bold text-white">{inquiryUnreadCount > 99 ? '99+' : inquiryUnreadCount}</span>
                          ) : null}
                        </button>
                        <button
                          type="button"
                          onClick={() => { requestCustomerInquiryDesktopAlerts(); setShowDropdown(false) }}
                          className="text-left text-xs text-blue-600 hover:text-blue-800 underline"
                        >
                          Enable reply alerts (browser)
                        </button>
                        <button type="button" onClick={logOut} className='w-full text-left cursor-pointer hover:text-blue-600 transition-colors duration-300 bg-transparent border-0 p-0'>Logout</button>
                    </div>
                </div>}
            </div>
            <button type='button' onClick={() => openCart()} className='relative cursor-pointer'>
                <img draggable={false} id='cart-icon' src={assets.cart_icon} className='w-5 min-w-5 hover:scale-110 transition-transform duration-300 pointer-events-none' alt="" />
                <span className='absolute right-[-5px] bottom-[-5px] w-4 text-center leading-4 bg-blue-600 text-white aspect-square rounded-full text-[11px] pointer-events-none'>{getCartCount()}</span>
            </button>
            <button
              type='button'
              onClick={()=>{setVisiable(true)}}
              className='lg:hidden inline-flex items-center justify-center p-2 rounded-full hover:bg-blue-50 transition-colors duration-200 cursor-pointer shrink-0'
              aria-label='Open menu'
            >
              <svg className='w-5 h-5 text-blue-600' fill='none' stroke='currentColor' strokeWidth='1.8' strokeLinecap='round' strokeLinejoin='round' viewBox='0 0 24 24'>
                <path d='M4 6h16M4 12h16M4 18h16' />
              </svg>
            </button>
        </div>
        {/* Sidebar menu — phone & tablet (< lg) */}
        <div className={`lg:hidden fixed top-0 right-0 h-screen overflow-hidden bg-white/95 backdrop-blur-sm transition-all z-[60] ${visiable ? 'w-full max-w-sm' : 'w-0'}`}>
            <div className='flex flex-col text-gray-600 '>
                <div onClick={()=>{setVisiable(false)}} className='flex items-center gap-4 p-3'>
                    <img className='h-4 rotate-180' src={assets.dropdown_icon} alt="" />
                    <span className="pointer-events-none">Back</span>
                </div>
                <NavLink onClick={()=>{setVisiable(false)}} className='py-2 pl-6 border hover:bg-blue-50 transition-colors duration-300' to='/'>HOME</NavLink>
                <NavLink onClick={()=>{setVisiable(false)}} className='py-2 pl-6 border hover:bg-blue-50 transition-colors duration-300' to='/collection'>WHOLESALE</NavLink>
                <NavLink onClick={()=>{setVisiable(false)}} className='py-2 pl-6 border hover:bg-blue-50 transition-colors duration-300' to='/about'>ABOUT</NavLink>
                <NavLink onClick={()=>{setVisiable(false)}} className='py-2 pl-6 border hover:bg-blue-50 transition-colors duration-300' to='/contact'>CONTACT</NavLink>
                <NavLink onClick={()=>{setVisiable(false)}} className='py-2 pl-6 border hover:bg-blue-50 transition-colors duration-300' to='/blogs'>BLOG</NavLink>
                <NavLink onClick={()=>{setVisiable(false)}} className='py-2 pl-6 border hover:bg-blue-50 transition-colors duration-300' to='/videos'>VIDEOS</NavLink>
            </div>
        </div>
      </div>
    </nav>
    <SideCart/>
    </>
  )
}

export default NavBar
