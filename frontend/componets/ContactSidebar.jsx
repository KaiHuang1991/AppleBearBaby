import React, { useState } from 'react'

const iconMap = {
  email: (
    <svg viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='1.6' strokeLinecap='round' strokeLinejoin='round' className='w-6 h-6'>
      <rect x='3' y='5' width='18' height='14' rx='2' ry='2' />
      <polyline points='3 7 12 13 21 7' />
    </svg>
  ),
  phone: (
    <svg viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='1.6' strokeLinecap='round' strokeLinejoin='round' className='w-6 h-6'>
      <path d='M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.79 19.79 0 0 1 2.08 4.18 2 2 0 0 1 4.06 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11l-1.27 1.27a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z' />
    </svg>
  ),
  whatsapp: (
    <svg viewBox='0 0 24 24' fill='currentColor' className='w-6 h-6'>
      <path d='M20.52 3.48A11.89 11.89 0 0 0 11.9 0 12 12 0 0 0 0 12a11.84 11.84 0 0 0 1.6 6L0 24l6.28-1.64A11.92 11.92 0 0 0 11.9 24 12 12 0 0 0 24 12a11.86 11.86 0 0 0-3.48-8.52ZM11.9 21.8a9.77 9.77 0 0 1-4.94-1.35l-.35-.2-3.73 1 1-3.63-.24-.37a9.82 9.82 0 1 1 18-5.25 9.86 9.86 0 0 1-9.78 9.8Zm5.36-7.3c-.29-.15-1.71-.84-1.97-.93s-.46-.14-.66.15-.76.93-.94 1.12-.35.2-.64.05a7.95 7.95 0 0 1-2.34-1.44 8.63 8.63 0 0 1-1.6-2 2.25 2.25 0 0 1-.1-1c.08-.15.2-.21.42-.35s.22-.2.33-.33.14-.19.21-.31a1.1 1.1 0 0 0 .07-.39.68.68 0 0 0 0-.33c0-.1-.66-1.6-.9-2.2s-.45-.45-.66-.46h-.56a1.08 1.08 0 0 0-.78.36 3.21 3.21 0 0 0-1 2.37 5.59 5.59 0 0 0 1.17 3 12.73 12.73 0 0 0 4.87 4 16.5 16.5 0 0 0 1.59.58 3.8 3.8 0 0 0 1.74.11 2.85 2.85 0 0 0 1.86-1.31 2.33 2.33 0 0 0 .16-1.36c-.07-.12-.26-.18-.55-.32Z' />
    </svg>
  ),
  wechat: (
    <svg viewBox='0 0 24 24' fill='currentColor' className='w-6 h-6'>
      <path d='M8.1 2C3.6 2 0 5.08 0 8.95 0 11.46 1.5 13.63 3.9 14.75L3 18l3.9-2.3c.4.07.8.14 1.2.14h.1c.2 0 .4 0 .6-.04-.4-.73-.6-1.56-.6-2.42 0-3.87 3.6-6.95 8.1-6.95a9.6 9.6 0 0 1 1.5.12C15.8 3.75 12.23 2 8.1 2Zm5.9 6c-4.5 0-8.1 3.08-8.1 6.95S9.5 22 14 22c.4 0 .9-.04 1.3-.1l3.7 2.1-.9-3.14c2.3-1.14 3.9-3.28 3.9-5.81C22 11.08 18.5 8 14 8Zm-4.7 1.5c.4 0 .7.33.7.75s-.3.75-.7.75-.7-.33-.7-.75.3-.75.7-.75Zm5.4 4.5c-.4 0-.7-.34-.7-.75s.3-.75.7-.75c.4 0 .7.34.7.75s-.3.75-.7.75Zm2.7-3c-.4 0-.7-.33-.7-.75s.3-.75.7-.75.7.33.7.75-.3.75-.7.75Z' />
    </svg>
  )
}

const contactMethods = [
  {
    key: 'email',
    label: 'Email',
    value: '1034201254@qq.com'
  },

  {
    key: 'whatsapp',
    label: 'WhatsApp',
    value: 'Kai:+86-15867976938'
  },
]

const ContactSidebar = () => {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <>
      <div className='hidden sm:fixed sm:top-1/2 sm:right-0 sm:z-50 sm:block'>
        <div className='group relative' tabIndex={0} aria-label='Contact shortcuts'>
          {/* Compact Rail */}
          <div className='flex flex-col items-center gap-4 rounded-l-2xl bg-gradient-to-b from-blue-500 via-sky-500 to-cyan-400 px-3 py-4 shadow-lg transition-opacity duration-200 group-hover:hidden group-focus-within:hidden'>
            {contactMethods.map((method) => (
              <span
                key={method.label}
                className='text-white drop-shadow-sm'
              >
                {iconMap[method.key]}
              </span>
            ))}
          </div>

          {/* Expanded Panel */}
          <div className='absolute top-0 right-full mr-3 hidden rounded-lg bg-gradient-to-br from-blue-500 via-sky-500 to-cyan-400 px-6 py-5 text-sm font-medium text-white shadow-xl group-hover:flex group-hover:flex-col group-focus-within:flex group-focus-within:flex-col'>
            {contactMethods.map((method, index) => (
              <div
                key={method.label}
                className={`flex items-center gap-3 ${index !== contactMethods.length - 1 ? 'mb-4' : ''}`}
              >
                <span className='text-white drop-shadow-sm'>{iconMap[method.key]}</span>
                <span className='text-white drop-shadow-sm'>{method.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Mobile contact chip */}
      <div className='sm:hidden fixed bottom-5 right-4 z-50'>
        <div className='flex flex-col items-end gap-3'>
          {mobileOpen && (
            <div className='w-64 rounded-2xl bg-gradient-to-br from-blue-500 via-sky-500 to-cyan-400 p-4 text-white shadow-2xl space-y-3 transition-all duration-200'>
              {contactMethods.map((method) => (
                <button
                  key={method.label}
                  type='button'
                  className='w-full flex items-center gap-3 rounded-xl bg-white/15 px-3 py-2 text-left transition-colors hover:bg-white/25 focus:outline-none focus:ring-2 focus:ring-white/60'
                  onClick={() => setMobileOpen(false)}
                >
                  <span className='text-white drop-shadow-sm'>{iconMap[method.key]}</span>
                  <span className='text-sm font-medium'>{method.value}</span>
                </button>
              ))}
            </div>
          )}

          <button
            type='button'
            onClick={() => setMobileOpen((prev) => !prev)}
            className='flex items-center gap-2 rounded-full bg-gradient-to-r from-blue-500 to-cyan-400 px-4 py-3 text-white shadow-xl shadow-blue-400/40 hover:scale-[1.03] active:scale-[0.97] transition-transform'
            aria-expanded={mobileOpen}
            aria-label='Contact options'
          >
            <span className='inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/20'>
              {iconMap.whatsapp}
            </span>
            <span className='text-sm font-semibold tracking-wide'>
              {mobileOpen ? 'Close contact' : 'Contact us'}
            </span>
          </button>
        </div>
      </div>
    </>
  )
}

export default ContactSidebar

