import React, { useEffect, useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import axios from 'axios'
import { toast } from 'react-toastify'

const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:4000'
const storeBaseUrl = (
  import.meta.env.VITE_STORE_URL ||
  import.meta.env.VITE_FRONTEND_URL ||
  'http://localhost:5173'
).replace(/\/$/, '')

const storefrontProductUrl = (productId) => {
  if (!productId) return null
  const id =
    typeof productId === 'object' && productId?._id != null
      ? String(productId._id)
      : String(productId)
  if (!id || id === 'undefined' || id === 'null') return null
  return `${storeBaseUrl}/product/${id}`
}

const formatWhen = (d) =>
  new Date(d).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })

const InquiryThread = ({ token }) => {
  const { id } = useParams()
  const [inquiry, setInquiry] = useState(null)
  const [loading, setLoading] = useState(true)
  const [text, setText] = useState('')
  const [sending, setSending] = useState(false)
  const bottomRef = useRef(null)

  const load = async () => {
    setLoading(true)
    try {
      const res = await axios.get(`${backendUrl}/api/inquiries/admin/thread/${id}`, {
        headers: { token }
      })
      if (res.data.success) {
        setInquiry(res.data.inquiry)
        window.dispatchEvent(new CustomEvent('admin-inquiry-unread-refresh'))
      } else {
        toast.error(res.data.message || 'Not found')
      }
    } catch (e) {
      toast.error(e?.response?.data?.message || 'Failed to load')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [id, token])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [inquiry?.messages])

  const send = async (e) => {
    e.preventDefault()
    const trimmed = text.trim()
    if (!trimmed || sending) return
    setSending(true)
    try {
      const res = await axios.post(
        `${backendUrl}/api/inquiries/admin/thread/${id}/messages`,
        { text: trimmed },
        { headers: { token, 'Content-Type': 'application/json' } }
      )
      if (res.data.success) {
        setInquiry(res.data.inquiry)
        setText('')
        toast.success('Message sent')
        window.dispatchEvent(new CustomEvent('admin-inquiry-unread-refresh'))
      } else {
        toast.error(res.data.message || 'Failed')
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to send')
    } finally {
      setSending(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-[40vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600" />
      </div>
    )
  }

  if (!inquiry) {
    return (
      <div className="p-6 w-full max-w-none min-w-0">
        <Link to="/inquiries" className="text-blue-600 hover:underline">
          ← Back to inquiries
        </Link>
      </div>
    )
  }

  const messages = inquiry.messages || []
  const displayStatus = inquiry.displayStatus || inquiry.status

  return (
    <div className="p-6 w-full max-w-none min-w-0">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <Link to="/inquiries" className="text-blue-600 hover:underline text-sm font-medium">
          ← Back to inquiries
        </Link>
        <span className="text-xs text-gray-500">#{String(inquiry._id).slice(-6)}</span>
      </div>

      <h1 className="text-2xl font-bold text-gray-800 mb-2">Inquiry chat</h1>
      <p className="text-sm text-gray-600 mb-4">
        {inquiry.userName} · {inquiry.userEmail}
        {inquiry.userPhone ? ` · ${inquiry.userPhone}` : ''}
      </p>

      <div className="mb-2">
        <span
          className={`text-xs font-semibold px-2 py-1 rounded-full ${
            displayStatus === 'pending' ? 'bg-amber-100 text-amber-900' : 'bg-emerald-100 text-emerald-900'
          }`}
        >
          {displayStatus === 'pending' ? 'Pending reply' : displayStatus === 'replied' || displayStatus === 'responded' ? 'Replied' : displayStatus}
        </span>
      </div>

      <div className="bg-white rounded-lg shadow border border-gray-200 p-4 mb-6">
        <h2 className="text-sm font-semibold text-gray-700 mb-3">Products</h2>
        <div className="space-y-3">
          {inquiry.products?.map((product, index) => {
            const pop =
              product.productId &&
              typeof product.productId === 'object' &&
              !Array.isArray(product.productId)
                ? product.productId
                : null
            const imgUrl =
              pop && Array.isArray(pop.image) && pop.image.length > 0 ? pop.image[0] : null
            const price = Number(product.price ?? 0)
            const productIdForLink = pop?._id ?? product.productId
            const productHref = storefrontProductUrl(productIdForLink)
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
                    className="w-12 h-12 object-cover rounded-lg border border-gray-200 shrink-0 bg-white"
                  />
                ) : (
                  <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center shrink-0 text-lg">
                    📦
                  </div>
                )}
                <div className="flex-1 min-w-0 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    {productHref ? (
                      <a
                        href={productHref}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-medium text-blue-700 hover:underline text-sm break-words"
                      >
                        {product.productName}
                      </a>
                    ) : (
                      <p className="font-medium text-gray-800 text-sm break-words">{product.productName}</p>
                    )}
                    <p className="text-xs text-gray-600 mt-0.5 break-words">
                      {modelLabel ? <>Model {modelLabel} · </> : null}
                      Qty {product.quantity} · {product.size} · ${price.toFixed(2)}
                    </p>
                  </div>
                  {productHref ? (
                    <a
                      href={productHref}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-medium text-blue-600 hover:text-blue-800 shrink-0 whitespace-nowrap"
                    >
                      前台商品页 ↗
                    </a>
                  ) : null}
                </div>
              </div>
            )
          })}
        </div>
        <p className="text-sm text-gray-600 pt-3 mt-3 border-t border-gray-100">
          Total{' '}
          <span className="font-semibold text-gray-900">
            ${Number(inquiry.totalAmount ?? 0).toFixed(2)}
          </span>
        </p>
      </div>

      <div className="bg-white rounded-lg shadow border border-gray-200 p-4 flex flex-col min-h-[280px] max-h-[min(65vh,520px)]">
        <h2 className="text-sm font-semibold text-gray-700 mb-3">Thread</h2>
        <div className="flex-1 overflow-y-auto space-y-3 pr-1 mb-4">
          {messages.map((m, i) => (
            <div key={`${i}-${m.createdAt}`} className={`flex ${m.author === 'admin' ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm ${
                  m.author === 'admin'
                    ? 'bg-blue-600 text-white rounded-br-md'
                    : 'bg-gray-100 text-gray-900 border border-gray-200 rounded-bl-md'
                }`}
              >
                <p className="whitespace-pre-wrap break-words">{m.body}</p>
                <p className={`text-[10px] mt-1 ${m.author === 'admin' ? 'text-blue-100' : 'text-gray-500'}`}>
                  {m.author === 'admin' ? 'You (store)' : 'Customer'} · {formatWhen(m.createdAt)}
                </p>
              </div>
            </div>
          ))}
          <div ref={bottomRef} />
        </div>

        <form onSubmit={send} className="border-t border-gray-100 pt-3 flex flex-col sm:flex-row gap-2">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={2}
            placeholder="Reply to customer…"
            className="flex-1 resize-none rounded border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            disabled={sending || !text.trim()}
            className="sm:self-end px-4 py-2 rounded bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 disabled:opacity-50"
          >
            {sending ? 'Sending…' : 'Send'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default InquiryThread
