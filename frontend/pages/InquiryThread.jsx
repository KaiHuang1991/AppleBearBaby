import React, { useContext, useEffect, useRef, useState } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { ShopContext } from '../context/ShopContext'
import Title from '../componets/Title'

const formatWhen = (d) =>
  new Date(d).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })

const InquiryThread = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { token, currency, getInquiryThread, postInquiryMessage, refreshInquiryUnreadCount } = useContext(ShopContext)
  const [inquiry, setInquiry] = useState(null)
  const [loading, setLoading] = useState(true)
  const [text, setText] = useState('')
  const [sending, setSending] = useState(false)
  const bottomRef = useRef(null)

  const load = async () => {
    setLoading(true)
    const data = await getInquiryThread(id)
    if (data?.success) {
      setInquiry(data.inquiry)
      refreshInquiryUnreadCount()
    } else {
      navigate('/inquiries')
    }
    setLoading(false)
  }

  useEffect(() => {
    if (!token) {
      navigate('/login')
      return
    }
    load()
  }, [id, token])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [inquiry?.messages])

  const handleSend = async (e) => {
    e.preventDefault()
    const trimmed = text.trim()
    if (!trimmed || sending) return
    setSending(true)
    const data = await postInquiryMessage(id, trimmed)
    if (data?.success) {
      setInquiry(data.inquiry)
      setText('')
      refreshInquiryUnreadCount()
    }
    setSending(false)
  }

  if (!token) return null

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-28">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600" />
      </div>
    )
  }

  if (!inquiry) {
    return null
  }

  const messages = inquiry.messages || []
  const last = messages.length ? messages[messages.length - 1] : null
  const displayStatus = inquiry.customerThreadStatus ?? inquiry.displayStatus ?? inquiry.status

  return (
    <div className="min-h-screen relative pt-28 pb-16">
      <div className="absolute inset-0 cartoon-bg" />
      <div className="absolute inset-0 cartoon-hearts opacity-10" />

      <div className="relative z-10 max-w-3xl mx-auto px-4">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <Link
            to="/inquiries"
            className="text-sm font-medium text-blue-700 hover:text-blue-900"
          >
            ← Back to inquiries
          </Link>
          <span
            className={`text-xs font-semibold px-3 py-1 rounded-full ${
              displayStatus === 'pending'
                ? 'bg-amber-100 text-amber-900'
                : displayStatus === 'replied' || displayStatus === 'responded'
                  ? 'bg-emerald-100 text-emerald-900'
                  : 'bg-slate-100 text-slate-800'
            }`}
          >
            {displayStatus === 'pending'
              ? last?.author === 'admin'
                ? 'Pending — you can reply below'
                : 'Pending — awaiting store reply'
              : displayStatus === 'replied' || displayStatus === 'responded'
                ? 'Replied'
                : displayStatus.charAt(0).toUpperCase() + displayStatus.slice(1)}
          </span>
        </div>

        <div className="text-center mb-6">
          <Title text1="INQUIRY" text2="CHAT" />
          <p className="text-sm text-gray-600 mt-2">#{String(inquiry._id).slice(-6)}</p>
        </div>

        <div className="cartoon-card p-4 sm:p-6 mb-6 space-y-3">
          <h2 className="text-sm font-semibold text-gray-700">Products</h2>
          {inquiry.products?.map((product, index) => {
            const pop =
              product.productId &&
              typeof product.productId === 'object' &&
              !Array.isArray(product.productId)
                ? product.productId
                : null
            const imgUrl =
              pop && Array.isArray(pop.image) && pop.image.length > 0 ? pop.image[0] : null
            const productIdStr = pop?._id
              ? String(pop._id)
              : product.productId
                ? String(product.productId)
                : null
            const modelLabel = (pop?.modelNumber && String(pop.modelNumber).trim()) || ''
            return (
            <div
              key={index}
              className="flex items-center gap-3 p-3 bg-gray-50 border border-gray-100 rounded-lg"
            >
              {imgUrl ? (
                <img
                  src={imgUrl}
                  alt=""
                  className="w-10 h-10 object-cover rounded-lg border border-gray-200 shrink-0 bg-white"
                />
              ) : (
                <div className="w-10 h-10 bg-gray-200 rounded-lg flex items-center justify-center text-sm shrink-0">
                  📦
                </div>
              )}
              <div className="flex-1 min-w-0">
                {productIdStr ? (
                  <Link
                    to={`/product/${productIdStr}`}
                    className="font-medium text-blue-700 hover:underline block truncate"
                  >
                    {product.productName}
                  </Link>
                ) : (
                  <p className="font-medium text-gray-800 truncate">{product.productName}</p>
                )}
                <p className="text-xs text-gray-600">
                  {modelLabel ? <>型号 {modelLabel} · </> : null}
                  Qty {product.quantity} · {product.size} · {currency}
                  {product.price}
                </p>
              </div>
            </div>
            )
          })}
          <p className="text-sm text-gray-600 pt-2 border-t border-gray-100">
            Total <span className="font-semibold text-gray-900">{currency}{inquiry.totalAmount}</span>
          </p>
        </div>

        <div className="cartoon-card p-4 sm:p-6 flex flex-col min-h-[320px] max-h-[min(70vh,560px)]">
          <h2 className="text-sm font-semibold text-gray-700 mb-3">Messages</h2>
          <div className="flex-1 overflow-y-auto space-y-3 pr-1 mb-4">
            {messages.length === 0 ? (
              <p className="text-sm text-gray-500">No messages yet.</p>
            ) : (
              messages.map((m, i) => (
                <div
                  key={`${i}-${m.createdAt}`}
                  className={`flex ${m.author === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-2 text-sm shadow-sm ${
                      m.author === 'user'
                        ? 'bg-blue-600 text-white rounded-br-md'
                        : 'bg-gray-100 text-gray-900 border border-gray-200 rounded-bl-md'
                    }`}
                  >
                    <p className="whitespace-pre-wrap break-words">{m.body}</p>
                    <p
                      className={`text-[10px] mt-1 ${
                        m.author === 'user' ? 'text-blue-100' : 'text-gray-500'
                      }`}
                    >
                      {m.author === 'user' ? 'You' : 'Store'} · {formatWhen(m.createdAt)}
                    </p>
                  </div>
                </div>
              ))
            )}
            <div ref={bottomRef} />
          </div>

          <form onSubmit={handleSend} className="border-t border-gray-100 pt-3 flex flex-col sm:flex-row gap-2">
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Write a message to the store…"
              rows={2}
              className="flex-1 resize-none rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="submit"
              disabled={sending || !text.trim()}
              className="sm:self-end px-5 py-2 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {sending ? 'Sending…' : 'Send'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

export default InquiryThread
