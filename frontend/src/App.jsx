import React from 'react'
import { Route, Routes, useLocation } from 'react-router-dom'
import Home from '../pages/Home'
import Collection from '../pages/Collection'
import About from '../pages/About'
import Contact from '../pages/Contact'
import Product from '../pages/Product'
import Cart from '../pages/Cart'
import Login from '../pages/Login'
import PlaceOrder from '../pages/PlaceOrder'
import Inquiries from '../pages/Inquiries'
import Profile from '../pages/Profile'
import Blogs from '../pages/Blogs'
import BlogDetail from '../pages/BlogDetail'
import VerifyEmail from '../pages/VerifyEmail'
import AwaitingVerification from '../pages/AwaitingVerification'
import ResetPassword from '../pages/ResetPassword'
import NavBar from '../componets/NavBar'
import Footer from '../componets/Footer'
import SearchBar from '../componets/SearchBar'
import ScrollToTop from '../componets/ScrollToTop'
import { ToastContainer } from 'react-toastify'

const App = () => {
  const location = useLocation()
  const isHomePage = location.pathname === '/'

  return (
    <div>
      <ScrollToTop />
      <NavBar />
      <ToastContainer />
      {/* <SearchBar /> */}
      
      {/* Home Page - Full Width */}
      {isHomePage ? (
        <Routes>
          <Route path='/' element={<Home />} />
        </Routes>
      ) : ( 
        /* Other Pages - 80% Width Container */
        <div className="w-[100%] mx-auto mt-0 h-auto sm:w-[80%]">
          <Routes>
            <Route path='/collection' element={<Collection />} />
            <Route path='/about' element={<About />} />
            <Route path='/contact' element={<Contact />} />
            <Route path='/product/:productId' element={<Product />} />
            <Route path='/cart' element={<Cart />} />
            <Route path='/login' element={<Login />} />
            <Route path='/verify-email/:token' element={<VerifyEmail />} />
            <Route path='/awaiting-verification' element={<AwaitingVerification />} />
            <Route path='/reset-password/:token' element={<ResetPassword />} />
            <Route path='/place-order' element={<PlaceOrder />} />
            <Route path='/inquiries' element={<Inquiries />} />
            <Route path='/profile' element={<Profile />} />
            <Route path='/blogs' element={<Blogs />} />
            <Route path='/blog/:id' element={<BlogDetail />} />
          </Routes>
        </div>
      )}
      {/* Footer - 80% Width for All Pages */}
      <div className="w-[80%] mx-auto">
        <Footer />
      </div>
    </div>
  )
}

export default App
