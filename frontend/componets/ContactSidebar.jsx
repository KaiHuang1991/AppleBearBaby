import React, { useContext, useEffect, useMemo, useState } from 'react'
import { createPortal } from 'react-dom'
import { useLocation } from 'react-router-dom'
import { toast } from 'react-toastify'
import { ShopContext } from '../context/ShopContext'

const HIDE_CONTACT_SIDEBAR_PATHS = new Set([
  '/profile',
  '/login',
  '/cart',
  '/place-order',
  '/inquiries',
])

export const shouldHideContactSidebar = (pathname) => {
  if (HIDE_CONTACT_SIDEBAR_PATHS.has(pathname)) return true
  if (pathname.startsWith('/inquiries/')) return true
  return false
}

const FALLBACK_CONTACTS = [
  {
    _id: 'fallback-email',
    name: 'Sales',
    channel: 'email',
    value: '1034201254@qq.com',
    label: '1034201254@qq.com',
    href: 'mailto:1034201254@qq.com',
  },
  {
    _id: 'fallback-whatsapp',
    name: 'Kai',
    channel: 'whatsapp',
    value: '+86-15867976938',
    label: 'Kai:+86-15867976938',
    href: 'https://wa.me/8615867976938',
  },
]

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
  ),
  telegram: (
    <svg viewBox='0 0 24 24' fill='currentColor' className='w-6 h-6'>
      <path d='M21.9 4.3c.3-.9-.5-1.6-1.3-1.3L2.7 9.4c-.9.3-.9 1.6.1 1.8l4.7 1.2 1.8 5.6c.3.8 1.3 1 1.8.4l2.6-2.6 4.6 3.4c.7.5 1.7.1 1.9-.7l2.7-14.2ZM8.5 12.5l8.7-5.4-6.7 6.8-.3 2.6-1.7-4Z' />
    </svg>
  ),
}

function resolveEmailHref(email) {
  const address = String(email || '').trim()
  const mailto = address ? `mailto:${address}` : 'mailto:1034201254@qq.com'
  if (typeof navigator === 'undefined') return mailto
  if (/MicroMessenger/i.test(navigator.userAgent) && /@qq\.com$/i.test(address)) {
    return `https://mail.qq.com/cgi-bin/qm_share?t=qm_mailto&email=${btoa(address)}`
  }
  return mailto
}

function contactIcon(channel) {
  return iconMap[channel] || iconMap.whatsapp
}

function wechatQrUrl(url) {
  if (!url || typeof url !== 'string') return ''
  if (!url.includes('res.cloudinary.com') || !url.includes('/upload/')) return url
  return url.replace('/upload/', '/upload/c_limit,w_720,q_100,f_png/')
}

function groupContactsByChannel(contacts) {
  const groups = []
  const indexByChannel = new Map()
  for (const contact of contacts) {
    const channel = contact.channel || 'whatsapp'
    if (!indexByChannel.has(channel)) {
      indexByChannel.set(channel, groups.length)
      groups.push({ channel, contacts: [contact] })
    } else {
      groups[indexByChannel.get(channel)].contacts.push(contact)
    }
  }
  return groups
}

const ContactSidebar = () => {
  const { pathname } = useLocation()
  const { api } = useContext(ShopContext)
  const [contacts, setContacts] = useState(FALLBACK_CONTACTS)
  const [mobileDockVisible, setMobileDockVisible] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [wechatPanel, setWechatPanel] = useState(null)

  useEffect(() => {
    let cancelled = false
    const load = async () => {
      try {
        const response = await api.floatContactsList()
        const remote = response.data?.success ? response.data.contacts : []
        if (!cancelled && Array.isArray(remote) && remote.length) {
          setContacts(remote)
        }
      } catch (error) {
        console.error('Failed to load floating contacts:', error)
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [api])

  useEffect(() => {
    if (!wechatPanel) return undefined
    const onKey = (event) => {
      if (event.key === 'Escape') setWechatPanel(null)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [wechatPanel])

  const channelGroups = useMemo(() => groupContactsByChannel(contacts), [contacts])

  if (shouldHideContactSidebar(pathname)) {
    return null
  }

  const openWechatPanel = (contact) => {
    setWechatPanel(contact)
    setMobileOpen(false)
  }

  const copyWechat = async (contact) => {
    const text = String(contact?.value || '').trim()
    if (!text) return
    try {
      await navigator.clipboard.writeText(text)
      toast.success(`WeChat ID copied: ${text}`)
    } catch {
      toast.info(`WeChat: ${text}`)
    }
  }

  const linkPropsFor = (contact) => {
    if (contact.channel === 'wechat') {
      return {
        href: '#',
        onClick: (event) => {
          event.preventDefault()
          event.stopPropagation()
          openWechatPanel(contact)
        },
      }
    }
    if (contact.channel === 'email') {
      const href = resolveEmailHref(contact.value)
      return href.startsWith('http')
        ? { href, target: '_blank', rel: 'noopener noreferrer' }
        : { href }
    }
    if (contact.href) {
      return { href: contact.href, target: '_blank', rel: 'noopener noreferrer' }
    }
    return { href: '#' }
  }

  const scheduleCollapseMobilePanel = () => {
    window.setTimeout(() => setMobileOpen(false), 280)
  }

  const collapseMobileDock = () => {
    setMobileDockVisible(false)
    setMobileOpen(false)
  }

  const primaryIcon = contactIcon(channelGroups.find((group) => group.channel === 'whatsapp')?.channel || channelGroups[0]?.channel)

  const renderPeople = (group) =>
    group.contacts.map((contact) => (
      <a
        key={contact._id || contact.label}
        {...linkPropsFor(contact)}
        className='flex min-w-0 flex-col rounded-md transition-opacity hover:opacity-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/80'
      >
        <span className='text-white drop-shadow-sm'>{contact.label}</span>
      </a>
    ))

  return (
    <>
      <div className='hidden sm:fixed sm:top-1/2 sm:right-0 sm:z-50 sm:block'>
        <div className='group relative' tabIndex={0} aria-label='Contact shortcuts'>
          <div className='flex flex-col items-center gap-4 rounded-l-2xl bg-gradient-to-b from-blue-500 via-sky-500 to-cyan-400 px-3 py-4 shadow-lg transition-opacity duration-200 group-hover:hidden group-focus-within:hidden'>
            {channelGroups.map((group) => {
              const first = group.contacts[0]
              return (
                <a
                  key={group.channel}
                  {...linkPropsFor(first)}
                  className='inline-flex text-white drop-shadow-sm transition-opacity hover:opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/80 rounded-md'
                  aria-label={group.channel === 'wechat' ? 'WeChat' : group.contacts.length > 1 ? group.channel : first.label}
                >
                  {contactIcon(group.channel)}
                </a>
              )
            })}
          </div>

          <div className='absolute top-0 right-full mr-3 hidden min-w-max max-w-[calc(100vw-2rem)] rounded-lg bg-gradient-to-br from-blue-500 via-sky-500 to-cyan-400 px-6 py-5 text-sm font-medium text-white shadow-xl group-hover:flex group-hover:flex-col group-focus-within:flex group-focus-within:flex-col'>
            {channelGroups.map((group, index) => (
              <div
                key={group.channel}
                className={`flex shrink-0 items-start gap-3 ${index !== channelGroups.length - 1 ? 'mb-4' : ''}`}
              >
                <span className='mt-0.5 text-white drop-shadow-sm'>{contactIcon(group.channel)}</span>
                <span className='flex flex-col gap-2'>{renderPeople(group)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <button
        type='button'
        className='sm:hidden fixed top-1/2 right-0 z-[51] flex h-28 min-h-[44px] w-9 min-w-[36px] -translate-y-1/2 items-center justify-center rounded-l-xl border-0 bg-gradient-to-b from-blue-500 via-sky-500 to-cyan-400 text-white shadow-lg shadow-blue-900/10 outline-none ring-0 transition hover:brightness-105 active:brightness-95 focus-visible:ring-2 focus-visible:ring-white/70'
        onClick={() => (mobileDockVisible ? collapseMobileDock() : setMobileDockVisible(true))}
        aria-expanded={mobileDockVisible}
        aria-label={mobileDockVisible ? '收起联系方式' : '展开联系方式'}
      >
        <svg
          className='h-6 w-6 shrink-0 drop-shadow-sm'
          viewBox='0 0 24 24'
          fill='none'
          stroke='currentColor'
          strokeWidth='2'
          strokeLinecap='round'
          strokeLinejoin='round'
          aria-hidden
        >
          {mobileDockVisible ? (
            <path d='M9 18l6-6-6-6' />
          ) : (
            <path d='M15 18l-6-6 6-6' />
          )}
        </svg>
      </button>

      {mobileDockVisible && (
        <div className='sm:hidden fixed top-1/2 right-11 z-50 max-h-[85vh] -translate-y-1/2'>
          <div className='flex max-h-[85vh] flex-col items-end gap-3 overflow-y-auto'>
            {mobileOpen && (
              <div className='w-64 rounded-2xl bg-gradient-to-br from-blue-500 via-sky-500 to-cyan-400 p-4 text-white shadow-2xl space-y-3 transition-all duration-200'>
                {channelGroups.map((group) => (
                  <div key={group.channel} className='flex w-full items-start gap-3 rounded-xl bg-white/15 px-3 py-2'>
                    <span className='text-white drop-shadow-sm'>{contactIcon(group.channel)}</span>
                    <span className='flex min-w-0 flex-col gap-2'>
                      {group.contacts.map((contact) => (
                        <a
                          key={contact._id || contact.label}
                          {...linkPropsFor(contact)}
                          className='text-left text-sm font-medium hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-white/60 rounded'
                          onClick={(event) => {
                            if (contact.channel === 'wechat') {
                              event.preventDefault()
                              event.stopPropagation()
                              openWechatPanel(contact)
                              return
                            }
                            scheduleCollapseMobilePanel()
                          }}
                        >
                          {contact.label}
                        </a>
                      ))}
                    </span>
                  </div>
                ))}
              </div>
            )}

            <button
              type='button'
              onClick={() => setMobileOpen((prev) => !prev)}
              className='flex items-center gap-2 rounded-full bg-gradient-to-r from-blue-500 to-cyan-400 px-4 py-3 text-white shadow-xl shadow-blue-400/40 transition-transform hover:scale-[1.03] active:scale-[0.97]'
              aria-expanded={mobileOpen}
              aria-label='Contact options'
            >
              <span className='inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/20'>
                {primaryIcon}
              </span>
              <span className='text-sm font-semibold tracking-wide'>
                {mobileOpen ? 'Close contact' : 'Contact us'}
              </span>
            </button>
          </div>
        </div>
      )}

      {wechatPanel &&
        createPortal(
          <>
            <button
              type='button'
              className='fixed inset-0 z-[1100] bg-black/45'
              aria-label='Close WeChat QR'
              onClick={() => setWechatPanel(null)}
            />
            <aside
              className='fixed z-[1101] top-1/2 right-4 sm:right-[4.75rem] flex max-h-[90vh] w-[min(24rem,calc(100vw-2rem))] -translate-y-1/2 flex-col overflow-y-auto rounded-2xl bg-white p-5 text-slate-800 shadow-2xl'
              role='dialog'
              aria-modal='true'
              aria-labelledby='wechat-qr-title'
            >
              <div className='mb-4 flex items-start justify-between gap-3'>
                <div>
                  <h2 id='wechat-qr-title' className='text-base font-semibold'>
                    WeChat · {wechatPanel.name || 'Scan QR'}
                  </h2>
                  {wechatPanel.value ? (
                    <p className='mt-1 break-all text-sm text-slate-500'>ID: {wechatPanel.value}</p>
                  ) : null}
                </div>
                <button
                  type='button'
                  onClick={() => setWechatPanel(null)}
                  className='inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-slate-400 transition hover:bg-slate-100 hover:text-slate-700'
                  aria-label='Close'
                >
                  <svg viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' className='h-5 w-5' aria-hidden>
                    <path d='M18 6 6 18M6 6l12 12' strokeLinecap='round' />
                  </svg>
                </button>
              </div>
              {wechatPanel.qrImageUrl ? (
                <img
                  src={wechatQrUrl(wechatPanel.qrImageUrl)}
                  alt={`${wechatPanel.name || 'WeChat'} QR code`}
                  className='mx-auto max-h-[min(32rem,62vh)] w-full object-contain'
                />
              ) : (
                <p className='rounded-xl bg-slate-50 px-4 py-8 text-center text-sm text-slate-500'>
                  No QR code uploaded for this contact.
                </p>
              )}
              {wechatPanel.value ? (
                <button
                  type='button'
                  onClick={() => copyWechat(wechatPanel)}
                  className='mt-4 w-full rounded-xl bg-gradient-to-r from-blue-500 to-cyan-400 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:brightness-105'
                >
                  Copy WeChat ID
                </button>
              ) : null}
            </aside>
          </>,
          document.body
        )}
    </>
  )
}

export default ContactSidebar
