import React, { lazy, Suspense, useEffect, useState } from 'react'
import { Route, Routes, useLocation } from 'react-router-dom'
import NavBar from '../componets/NavBar'
import Footer from '../componets/Footer'
import ScrollToTop from '../componets/ScrollToTop'
import SiteSeo from '../componets/SiteSeo'
import GoogleAds from '../componets/GoogleAds'
import LocaleSync from '../componets/LocaleSync'
import { ToastContainer } from 'react-toastify'
import { PREFIX_LOCALES, isHomePath } from './i18n/locales'

const Home = lazy(() => import('../pages/Home'))
const Collection = lazy(() => import('../pages/Collection'))
const About = lazy(() => import('../pages/About'))
const Contact = lazy(() => import('../pages/Contact'))
const Shipping = lazy(() => import('../pages/Shipping'))
const Faq = lazy(() => import('../pages/Faq'))
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
const NotFound = lazy(() => import('../pages/NotFound'))
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

const STOREFRONT_PAGES = [
  { path: 'collection', El: Collection },
  { path: 'collection/:categorySlug', El: Collection },
  { path: 'about', El: About },
  { path: 'contact', El: Contact },
  { path: 'shipping', El: Shipping },
  { path: 'faq', El: Faq },
  { path: 'product/:productId', El: Product },
  { path: 'cart', El: Cart },
  { path: 'login', El: Login },
  { path: 'verify-email/:token', El: VerifyEmail },
  { path: 'awaiting-verification', El: AwaitingVerification },
  { path: 'reset-password/:token', El: ResetPassword },
  { path: 'place-order', El: PlaceOrder },
  { path: 'inquiries', El: Inquiries },
  { path: 'inquiries/:id', El: InquiryThread },
  { path: 'profile', El: Profile },
  { path: 'blogs', El: Blogs },
  { path: 'blog/:blogKey', El: BlogDetail },
  { path: 'videos', El: Videos },
]

function StorefrontRouteList({ prefixed = false }) {
  return (
    <Routes>
      <Route index={prefixed} path={prefixed ? undefined : '/'} element={<Home />} />
      {STOREFRONT_PAGES.map(({ path, El }) => (
        <Route key={path} path={prefixed ? path : `/${path}`} element={<El />} />
      ))}
      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}

function PrefixedRoutes() {
  return <StorefrontRouteList prefixed />
}

const App = () => {
  const location = useLocation()
  const home = isHomePath(location.pathname)
  const [showDeferredWidgets, setShowDeferredWidgets] = useState(false)

  useEffect(() => {
    const seoNode = document.getElementById('seo-content')
    if (seoNode) seoNode.remove()
    const hideStyle = document.getElementById('seo-content-hide')
    if (hideStyle) hideStyle.remove()
  }, [location.pathname])

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
      <LocaleSync />
      <ScrollToTop />
      <GoogleAds />
      <SiteSeo />
      <NavBar />
      <ToastContainer />

      <Suspense fallback={<PageFallback />}>
        {home ? (
          <Routes>
            {PREFIX_LOCALES.map((code) => (
              <Route key={code} path={`/${code}/*`} element={<PrefixedRoutes />} />
            ))}
            <Route path="/*" element={<StorefrontRouteList />} />
          </Routes>
        ) : (
          <div className="w-full mx-auto mt-0 h-auto">
            <Routes>
              {PREFIX_LOCALES.map((code) => (
                <Route key={code} path={`/${code}/*`} element={<PrefixedRoutes />} />
              ))}
              <Route path="/*" element={<StorefrontRouteList />} />
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
