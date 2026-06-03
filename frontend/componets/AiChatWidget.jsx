import React, { useCallback, useContext, useLayoutEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { ShopContext } from '../context/ShopContext'

const welcomeMessage =
  "Hi! I'm AppleBearBaby's assistant. Ask about shopping or describe what you need (e.g. 150ml standard-neck bottles)—matching products may appear below my reply with photos and links. For human help, use Contact."

function scrollChatPane(el, smooth) {
  if (!el) return
  el.scrollTo({ top: el.scrollHeight, behavior: smooth ? 'smooth' : 'auto' })
}

const AiChatWidget = () => {
  const { api, currency } = useContext(ShopContext)
  const [open, setOpen] = useState(false)
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [messages, setMessages] = useState([{ role: 'assistant', content: welcomeMessage }])
  const scrollRef = useRef(null)

  /** Keep the viewport pinned to the latest reply (text + product cards). */
  useLayoutEffect(() => {
    if (!open) return
    const el = scrollRef.current
    if (!el) return
    scrollChatPane(el, true)
  }, [messages, loading, open])

  const onProductImageLayout = useCallback(() => {
    requestAnimationFrame(() => {
      const el = scrollRef.current
      if (el) scrollChatPane(el, false)
    })
  }, [])

  const send = async () => {
    const text = input.trim()
    if (!text || loading) return

    const nextUser = { role: 'user', content: text }
    const historyForApi = [...messages, nextUser].filter((m) => m.role === 'user' || m.role === 'assistant')

    setMessages((prev) => [...prev, nextUser])
    setInput('')
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
          className='fixed bottom-[calc(8rem+3.5rem+0.75rem)] right-5 z-[60] flex h-[min(420px,70vh)] w-[min(380px,calc(100vw-2.5rem))] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl sm:right-8'
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
          <div className='flex gap-2 border-t border-slate-100 p-3'>
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
      )}
    </>
  )
}

export default AiChatWidget
