import React, { lazy, Suspense, useEffect, useState } from 'react'
import { Route, Routes, useLocation } from 'react-router-dom'
import NavBar from '../componets/NavBar'
import Footer from '../componets/Footer'
import ScrollToTop from '../componets/ScrollToTop'
import SiteSeo from '../componets/SiteSeo'
import GoogleAds from '../componets/GoogleAds'
import { ToastContainer } from 'react-toastify'

const Home = lazy(() => import('../pages/Home'))
const Collection = lazy(() => import('../pages/Collection'))
const About = lazy(() => import('../pages/About'))
const Contact = lazy(() => import('../pages/Contact'))
const Product = lazy(() => import('../pages/Product'))
const Cart = lazy(() => import('../pages/Cart'))
const Login = lazy(() => import('../pages/Login'))
const PlaceOrder = lazy(() => import('../pages/PlaceOrder'))
const Inquiries = lazy(() => import('../pages/Inquiries'))
const InquiryThread = lazy(() => import('../pages/InquiryThread'))
const Profile = lazy(() => import('../pages/Profile'))
const Blogs = lazy(() => import('../pages/Blogs'))
const Videos = lazy(() => import('../pages/Videos'))
const BlogDetail = lazy(() => import('../pages/BlogDetail'))
const VerifyEmail = lazy(() => import('../pages/VerifyEmail'))
const AwaitingVerification = lazy(() => import('../pages/AwaitingVerification'))
const ResetPassword = lazy(() => import('../pages/ResetPassword'))
const AiChatWidget = lazy(() => import('../componets/AiChatWidget'))
const ContactSidebar = lazy(() => import('../componets/ContactSidebar'))

const PageFallback = () => (
  <div className="flex justify-center items-center min-h-[40vh]" aria-busy="true">
    <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-blue-600" />
  </div>
)

const App = () => {
  const location = useLocation()
  const isHomePage = location.pathname === '/'
  const [showDeferredWidgets, setShowDeferredWidgets] = useState(false)

  useEffect(() => {
    let idleId
    let timerId
    const enable = () => setShowDeferredWidgets(true)
    if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
      idleId = window.requestIdleCallback(enable, { timeout: 3500 })
    } else {
      timerId = window.setTimeout(enable, 2500)
    }
    return () => {
      if (idleId != null && typeof window.cancelIdleCallback === 'function') {
        window.cancelIdleCallback(idleId)
      }
      if (timerId != null) window.clearTimeout(timerId)
    }
  }, [])

  return (
    <div>
      <ScrollToTop />
      <GoogleAds />
      <SiteSeo />
      <NavBar />
      <ToastContainer />

      <Suspense fallback={<PageFallback />}>
        {isHomePage ? (
          <Routes>
            <Route path="/" element={<Home />} />
          </Routes>
        ) : (
          <div className="w-full mx-auto mt-0 h-auto">
            <Routes>
              <Route path="/collection" element={<Collection />} />
              <Route path="/collection/:categorySlug" element={<Collection />} />
              <Route path="/about" element={<About />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/product/:productId" element={<Product />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/login" element={<Login />} />
              <Route path="/verify-email/:token" element={<VerifyEmail />} />
              <Route path="/awaiting-verification" element={<AwaitingVerification />} />
              <Route path="/reset-password/:token" element={<ResetPassword />} />
              <Route path="/place-order" element={<PlaceOrder />} />
              <Route path="/inquiries" element={<Inquiries />} />
              <Route path="/inquiries/:id" element={<InquiryThread />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/blogs" element={<Blogs />} />
              <Route path="/blog/:id" element={<BlogDetail />} />
              <Route path="/videos" element={<Videos />} />
            </Routes>
          </div>
        )}
      </Suspense>

      <Footer />
      {showDeferredWidgets ? (
        <Suspense fallback={null}>
          <ContactSidebar />
          <AiChatWidget />
        </Suspense>
      ) : null}
    </div>
  )
}

export default App
