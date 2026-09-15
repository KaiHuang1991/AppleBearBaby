import React, { useCallback, useContext, useLayoutEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { ShopContext } from '../context/ShopContext'

const WHATSAPP_URL = 'https://wa.me/8615867976938'

const welcomeMessage =
  "Hi! I'm AppleBearBaby's assistant. Ask about shopping or describe what you need (e.g. 150ml standard-neck bottles)—matching products may appear below my reply with photos and links. For a person, tap Talk to staff below (WhatsApp if you're a guest; Inquiry after login)."

function scrollChatPane(el, smooth) {
  if (!el) return
  el.scrollTo({ top: el.scrollHeight, behavior: smooth ? 'smooth' : 'auto' })
}

function wantsHumanHandoff(text) {
  const t = text.trim()
  if (!t) return false
  if (/转人工|人工客服/.test(t)) return true
  if (t === '人工' || /^人工[!！.。?？\s]*$/.test(t)) return true
  const lower = t.toLowerCase().replace(/[!?.！？]+$/g, '').trim()
  if (/^(human|agent|staff|whatsapp)$/.test(lower)) return true
  if (/\b(talk to (a )?(human|person|agent|staff)|real person|live agent|live chat)\b/.test(lower)) {
    return true
  }
  return lower === 'whats app' || (t.length < 24 && /whats\s*app/.test(lower))
}

function openWhatsApp() {
  window.open(WHATSAPP_URL, '_blank', 'noopener,noreferrer')
}

function handoffCopy(kind) {
  if (kind === 'guest') {
    return 'Staff are not in this AI chat. WhatsApp is opening for a person. You can also use Contact.\n人工不在这个窗口里。正在打开 WhatsApp；也可走 Contact。'
  }
  if (kind === 'inquiries') {
    return 'Staff are not in this AI chat. Opening your Inquiries so you can continue with the store.\n人工不在这个窗口里。正在打开你的询盘记录。'
  }
  if (kind === 'cart') {
    return 'Staff are not in this AI chat. Opening Cart so you can send a wholesale inquiry (add items first if needed).\n人工不在这个窗口里。正在打开购物车以便提交询盘。'
  }
  return 'Staff are not in this AI chat. Your cart is empty, so Contact is the next step—WhatsApp is also available.\n人工不在这个窗口里。购物车是空的，请走 Contact；WhatsApp 也可。'
}

const HandoffActions = ({ kind }) => (
  <div className='mt-3 flex flex-wrap gap-2 border-t border-slate-200/80 pt-3'>
    {(kind === 'guest' || kind === 'contact') && (
      <a
        href={WHATSAPP_URL}
        target='_blank'
        rel='noopener noreferrer'
        className='rounded-lg bg-emerald-500 px-3 py-1.5 text-xs font-medium text-white hover:bg-emerald-600'
      >
        WhatsApp
      </a>
    )}
    {kind === 'guest' && (
      <Link
        to='/login'
        className='rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:border-sky-300 hover:bg-sky-50'
      >
        Login
      </Link>
    )}
    {kind === 'inquiries' && (
      <Link
        to='/inquiries'
        className='rounded-lg bg-sky-500 px-3 py-1.5 text-xs font-medium text-white hover:bg-sky-600'
      >
        Inquiries
      </Link>
    )}
    {kind === 'cart' && (
      <Link
        to='/cart'
        className='rounded-lg bg-sky-500 px-3 py-1.5 text-xs font-medium text-white hover:bg-sky-600'
      >
        Cart
      </Link>
    )}
    <Link
      to='/contact'
      className='rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:border-sky-300 hover:bg-sky-50'
    >
      Contact
    </Link>
    {kind === 'inquiries' || kind === 'cart' ? (
      <a
        href={WHATSAPP_URL}
        target='_blank'
        rel='noopener noreferrer'
        className='rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:border-emerald-300 hover:bg-emerald-50'
      >
        WhatsApp
      </a>
    ) : null}
  </div>
)

const AiChatWidget = () => {
  const { api, currency, token, navigate, getCartCount } = useContext(ShopContext)
  const [open, setOpen] = useState(false)
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [staffBusy, setStaffBusy] = useState(false)
  const [messages, setMessages] = useState([{ role: 'assistant', content: welcomeMessage }])
  const scrollRef = useRef(null)

  /** Keep the viewport pinned to the latest reply (text + product cards). */
  useLayoutEffect(() => {
    if (!open) return
    const el = scrollRef.current
    if (!el) return
    scrollChatPane(el, true)
  }, [messages, loading, staffBusy, open])

  const onProductImageLayout = useCallback(() => {
    requestAnimationFrame(() => {
      const el = scrollRef.current
      if (el) scrollChatPane(el, false)
    })
  }, [])

  const appendHandoff = useCallback((kind) => {
    setMessages((prev) => [
      ...prev,
      { role: 'assistant', content: handoffCopy(kind), handoffKind: kind }
    ])
  }, [])

  const talkToStaff = useCallback(async () => {
    if (staffBusy) return
    setStaffBusy(true)
    try {
      if (!token) {
        appendHandoff('guest')
        openWhatsApp()
        return
      }

      let total = 0
      try {
        const { data } = await api.inquiriesUserStats()
        if (data?.success) total = Number(data.total) || 0
      } catch {
        total = 0
      }

      if (total > 0) {
        appendHandoff('inquiries')
        navigate('/inquiries')
        return
      }

      if (getCartCount() > 0) {
        appendHandoff('cart')
        navigate('/cart')
        return
      }

      appendHandoff('contact')
      navigate('/contact')
    } finally {
      setStaffBusy(false)
    }
  }, [api, appendHandoff, getCartCount, navigate, staffBusy, token])

  const send = async () => {
    const text = input.trim()
    if (!text || loading) return

    const nextUser = { role: 'user', content: text }
    const historyForApi = [...messages, nextUser].filter((m) => m.role === 'user' || m.role === 'assistant')

    setMessages((prev) => [...prev, nextUser])
    setInput('')

    if (wantsHumanHandoff(text)) {
      await talkToStaff()
      return
    }

    setLoading(true)

    try {
      const { data } = await api.chatbotMessage({
        messages: historyForApi.map(({ role, content }) => ({ role, content }))
      })
      if (data?.success && data.reply) {
        const products = Array.isArray(data.products) ? data.products : []
        setMessages((prev) => [
          ...prev,
          { role: 'assistant', content: data.reply, ...(products.length ? { products } : {}) }
        ])
      } else {
        setMessages((prev) => [
          ...prev,
          {
            role: 'assistant',
            content:
              data?.message ||
              'Sorry, something went wrong. Please try again or use Contact for help.'
          }
        ])
      }
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        (err.response?.status === 503
          ? 'AI assistant is not configured on the server (set DEEPSEEK_API_KEY or equivalent in backend .env).'
          : 'Network error. Please try again later.')
      setMessages((prev) => [...prev, { role: 'assistant', content: msg }])
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <button
        type='button'
        aria-expanded={open}
        aria-label={open ? 'Close chat assistant' : 'Open chat assistant'}
        onClick={() => setOpen((v) => !v)}
        className='fixed bottom-32 right-5 z-[60] flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 via-sky-500 to-cyan-400 text-white shadow-lg transition hover:brightness-105 focus:outline-none focus:ring-2 focus:ring-sky-300 sm:bottom-32 sm:right-8'
      >
        {open ? (
          <svg className='h-7 w-7' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2'>
            <path d='M18 6L6 18M6 6l12 12' />
          </svg>
        ) : (
          <svg className='h-7 w-7' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='1.8'>
            <path d='M21 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4z' strokeLinecap='round' strokeLinejoin='round' />
          </svg>
        )}
      </button>

      {open && (
        <div
          role='dialog'
          aria-label='AI chat assistant'
          className='fixed bottom-[calc(8rem+3.5rem+0.75rem)] right-5 z-[60] flex h-[min(480px,72vh)] w-[min(380px,calc(100vw-2.5rem))] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl sm:right-8'
        >
          <div className='bg-gradient-to-r from-blue-500 via-sky-500 to-cyan-400 px-4 py-3 text-sm font-semibold text-white'>
            AppleBearBaby · AI Assistant
          </div>

          <div ref={scrollRef} className='flex-1 space-y-3 overflow-y-auto px-3 py-3 text-sm'>
            {messages.map((m, i) => (
              <div
                key={i}
                className={`max-w-[92%] rounded-xl px-3 py-2 whitespace-pre-wrap ${
                  m.role === 'user'
                    ? 'ml-auto bg-sky-100 text-slate-800'
                    : 'mr-auto bg-slate-100 text-slate-800'
                }`}
              >
                <div>{m.content}</div>
                {m.role === 'assistant' && m.handoffKind && <HandoffActions kind={m.handoffKind} />}
                {m.role === 'assistant' && Array.isArray(m.products) && m.products.length > 0 && (
                  <div className='mt-3 space-y-2 border-t border-slate-200/80 pt-3'>
                    <p className='text-xs font-medium uppercase tracking-wide text-slate-500'>
                      Matching products
                    </p>
                    <div className='flex max-h-[220px] flex-col gap-2 overflow-y-auto pr-0.5'>
                      {m.products.map((p) => (
                        <Link
                          key={p.id}
                          to={p.href}
                          className='flex gap-3 rounded-lg border border-slate-200 bg-white p-2 text-left shadow-sm transition hover:border-sky-300 hover:bg-sky-50/80'
                        >
                          {p.image ? (
                            <img
                              src={p.image}
                              alt=''
                              className='h-16 w-16 shrink-0 rounded-md object-cover'
                              loading='lazy'
                              onLoad={onProductImageLayout}
                              onError={onProductImageLayout}
                            />
                          ) : (
                            <div className='flex h-16 w-16 shrink-0 items-center justify-center rounded-md bg-slate-200 text-xs text-slate-500'>
                              No img
                            </div>
                          )}
                          <div className='min-w-0 flex-1'>
                            <div className='line-clamp-2 text-sm font-medium text-slate-800'>{p.name}</div>
                            {p.modelNumber ? (
                              <div className='mt-0.5 text-xs text-slate-500'>Model {p.modelNumber}</div>
                            ) : null}
                            <div className='mt-1 text-sm font-semibold text-sky-600'>
                              {currency}
                              {p.price}
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
            {loading && (
              <div className='mr-auto rounded-xl bg-slate-100 px-3 py-2 text-slate-500'>…</div>
            )}
          </div>
          <div className='border-t border-slate-100 p-3'>
            <button
              type='button'
              onClick={talkToStaff}
              disabled={staffBusy}
              className='mb-2 w-full rounded-lg border border-sky-200 bg-sky-50 px-3 py-2 text-left text-sm font-medium text-sky-800 hover:bg-sky-100 disabled:opacity-50'
            >
              <span className='block leading-tight'>Talk to staff</span>
              <span className='block text-xs font-normal text-sky-700'>转人工</span>
            </button>
            <div className='flex gap-2'>
              <input
                type='text'
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault()
                    send()
                  }
                }}
                placeholder='Type a question…'
                className='min-w-0 flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-sky-400'
                disabled={loading}
                maxLength={2000}
              />
              <button
                type='button'
                onClick={send}
                disabled={loading || !input.trim()}
                className='rounded-lg bg-sky-500 px-4 py-2 text-sm font-medium text-white disabled:opacity-40'
              >
                Send
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default AiChatWidget
