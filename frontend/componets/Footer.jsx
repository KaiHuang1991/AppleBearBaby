import React from 'react'
import { Link } from 'react-router-dom'
import { assets } from '../src/assets/assets'

/** Update href values when social profile URLs are ready */
const RELATED_LINKS = [
  {
    key: 'facebook',
    label: 'Facebook',
    href: '#',
    icon: (
      <svg className='w-5 h-5' fill='currentColor' viewBox='0 0 24 24' aria-hidden='true'>
        <path d='M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z' />
      </svg>
    ),
  },
  {
    key: 'youtube',
    label: 'YouTube',
    href: '#',
    icon: (
      <svg className='w-5 h-5' fill='currentColor' viewBox='0 0 24 24' aria-hidden='true'>
        <path d='M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z' />
      </svg>
    ),
  },
  {
    key: 'instagram',
    label: 'Instagram',
    href: '#',
    icon: (
      <svg className='w-5 h-5' fill='currentColor' viewBox='0 0 24 24' aria-hidden='true'>
        <path d='M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z' />
      </svg>
    ),
  },
  {
    key: 'tiktok',
    label: 'TikTok',
    href: '#',
    icon: (
      <svg className='w-5 h-5' fill='currentColor' viewBox='0 0 24 24' aria-hidden='true'>
        <path d='M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.27 6.27 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.18 8.18 0 004.78 1.52V6.76a4.85 4.85 0 01-1.01-.07z' />
      </svg>
    ),
  },
]

const Footer = () => {
  return (
    <footer className='border-t border-slate-200 bg-white mt-16'>
      <div className='section-container py-12 md:py-16'>
        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-10 text-sm'>
          <div className='sm:col-span-2 lg:col-span-2'>
            <img className='w-40 mb-4' src={assets.logo} alt='Applebear' />
            <p className='max-w-md text-slate-600 leading-relaxed'>
              Leading wholesale supplier of premium baby care products for healthcare facilities, daycare centers, and retailers. Quality assurance, bulk pricing, and dedicated support.
            </p>
            <div className='flex flex-wrap gap-2 mt-5'>
              <span className='inline-flex items-center gap-1.5 bg-blue-50 text-blue-700 text-xs font-medium px-3 py-1.5 rounded-full border border-blue-100'>
                Quality Assured
              </span>
              <span className='inline-flex items-center gap-1.5 bg-blue-50 text-blue-700 text-xs font-medium px-3 py-1.5 rounded-full border border-blue-100'>
                Fast Delivery
              </span>
              <span className='inline-flex items-center gap-1.5 bg-blue-50 text-blue-700 text-xs font-medium px-3 py-1.5 rounded-full border border-blue-100'>
                Best Prices
              </span>
            </div>
          </div>

          <div>
            <p className='text-sm font-semibold text-slate-800 uppercase tracking-wide mb-4'>Company</p>
            <ul className='flex flex-col gap-2.5 text-slate-600'>
              <li><Link to='/about' className='hover:text-blue-600 transition-colors'>About Us</Link></li>
              <li><Link to='/collection' className='hover:text-blue-600 transition-colors'>Wholesale Catalog</Link></li>
              <li><Link to='/contact' className='hover:text-blue-600 transition-colors'>Contact</Link></li>
              <li><Link to='/blogs' className='hover:text-blue-600 transition-colors'>Blog</Link></li>
              <li><Link to='/videos' className='hover:text-blue-600 transition-colors'>Videos</Link></li>
            </ul>
          </div>

          <div>
            <p className='text-sm font-semibold text-slate-800 uppercase tracking-wide mb-4'>Wholesale Contact</p>
            <ul className='flex flex-col gap-2.5 text-slate-600'>
              <li>
                <a
                  href='https://wa.me/8615867976938'
                  target='_blank'
                  rel='noopener noreferrer'
                  className='hover:text-blue-600 transition-colors'
                >
                  +86-15867976938
                </a>
              </li>
              <li>
                <a
                  href='mailto:1034201254@qq.com'
                  className='hover:text-blue-600 transition-colors'
                >
                  1034201254@qq.com
                </a>
              </li>
              <li className='text-slate-500 leading-relaxed pt-1'>
                No.9 Hengde Road, Niansanli Street, Yiwu City, Zhejiang, China
              </li>
            </ul>
          </div>

          <div>
            <p className='text-sm font-semibold text-slate-800 uppercase tracking-wide mb-4'>Related Links</p>
            <div className='grid grid-cols-2 gap-3 w-fit'>
              {RELATED_LINKS.map(({ key, label, href, icon }) => (
                <a
                  key={key}
                  href={href}
                  target='_blank'
                  rel='noopener noreferrer'
                  aria-label={label}
                  title={label}
                  className='inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-slate-50 text-slate-600 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600 transition-colors'
                >
                  {icon}
                </a>
              ))}
            </div>
          </div>
        </div>

        <div className='border-t border-slate-200 mt-10 pt-6 text-center text-xs text-slate-500'>
          <p>Copyright 2025 @ applebearbaby.com — All Rights Reserved</p>
        </div>
      </div>
    </footer>
  )
}

export default Footer
