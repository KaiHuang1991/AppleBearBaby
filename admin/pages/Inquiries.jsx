import React, { useState, useEffect, useRef, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { toast } from 'react-toastify'
import axios from 'axios'

const PAGE_SIZE = 10

const Inquiries = ({ token }) => {
  const [inquiries, setInquiries] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [appliedSearch, setAppliedSearch] = useState('')
  const [messageStatusFilter, setMessageStatusFilter] = useState('')
  const [page, setPage] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const [totalPages, setTotalPages] = useState(1)

  const [unreadCount, setUnreadCount] = useState(0)
  const prevUnreadCountRef = useRef(null)
  const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:4000'

  const refreshUnreadCount = useCallback(async () => {
    try {
      const r = await axios.get(`${backendUrl}/api/inquiries/admin/unread-count`, {
        headers: { token }
      })
      if (!r.data.success) return 0
      const c = typeof r.data.count === 'number' ? r.data.count : 0
      setUnreadCount(c)
      window.dispatchEvent(new CustomEvent('admin-inquiry-unread-refresh', { detail: { count: c } }))
      return c
    } catch {
      return 0
    }
  }, [backendUrl, token])

  const fetchInquiries = useCallback(async (opts = {}) => {
    const silent = opts.silent ?? false
    try {
      if (!silent) setLoading(true)
      let url = `${backendUrl}/api/inquiries/admin/all?page=${page}&limit=${PAGE_SIZE}`
      const s = appliedSearch.trim()
      if (s) url += `&search=${encodeURIComponent(s)}`
      if (messageStatusFilter) url += `&messageStatus=${encodeURIComponent(messageStatusFilter)}`

      const response = await axios.get(url, {
        headers: { token }
      })

      if (response.data.success) {
        const list = response.data.inquiries || []
        const total = typeof response.data.total === 'number' ? response.data.total : list.length
        const tp =
          typeof response.data.totalPages === 'number' && response.data.totalPages >= 1
            ? response.data.totalPages
            : Math.max(1, Math.ceil(total / PAGE_SIZE))
        setTotalCount(total)
        setTotalPages(tp)
        if (list.length === 0 && page > 1) {
          setPage(page - 1)
        } else {
          setInquiries(list)
        }
      } else {
        toast.error('Failed to fetch inquiries')
      }

      const c = await refreshUnreadCount()
      if (prevUnreadCountRef.current !== null && c > prevUnreadCountRef.current) {
        const d = c - prevUnreadCountRef.current
        toast.info(
          d === 1
            ? 'New customer message — pinned at the top of the list.'
            : `${d} new customer messages — check the highlighted inquiries.`
        )
        try {
          if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
            void new Notification('Inquiries: new customer message', {
              body: d === 1 ? 'Open Inquiries to reply.' : `${d} new messages waiting.`
            })
          }
        } catch {
          /* ignore */
        }
      }
      prevUnreadCountRef.current = c
    } catch (error) {
      console.error('Error fetching inquiries:', error)
      if (!silent) {
        const msg =
          error?.response?.data?.message ||
          error?.response?.data?.error ||
          error?.message ||
          'Request failed'
        const hint =
          error?.code === 'ERR_NETWORK' || error?.message?.includes('Network Error')
            ? ` (check API is running: ${backendUrl})`
            : ''
        toast.error(`Error fetching inquiries: ${msg}${hint}`)
      }
    } finally {
      if (!silent) setLoading(false)
    }
  }, [backendUrl, token, page, appliedSearch, messageStatusFilter, refreshUnreadCount])

  useEffect(() => {
    fetchInquiries()
  }, [page, messageStatusFilter, appliedSearch, fetchInquiries])

  useEffect(() => {
    const t = setTimeout(() => {
      setAppliedSearch(searchTerm.trim())
    }, 700)
    return () => clearTimeout(t)
  }, [searchTerm])

  const skipSearchPageReset = useRef(true)
  useEffect(() => {
    if (skipSearchPageReset.current) {
      skipSearchPageReset.current = false
      return
    }
    setPage(1)
  }, [appliedSearch])

  useEffect(() => {
    const id = setInterval(() => {
      fetchInquiries({ silent: true })
    }, 25000)
    return () => clearInterval(id)
  }, [fetchInquiries])

  const requestDesktopAlerts = async () => {
    if (typeof Notification === 'undefined') {
      toast.warn('Desktop notifications are not supported in this browser.')
      return
    }
    const p = await Notification.requestPermission()
    if (p === 'granted') toast.success('Desktop alerts enabled for new customer messages.')
    else toast.info('Notifications were not enabled.')
  }

  const handleDelete = async (inquiryId) => {
    if (!window.confirm('Are you sure you want to delete this inquiry?')) return
    try {
      const response = await axios.delete(`${backendUrl}/api/inquiries/admin/${inquiryId}`, {
        headers: { token }
      })
      if (response.data.success) {
        toast.success('Inquiry deleted successfully')
        fetchInquiries({ silent: true })
      } else {
        toast.error('Failed to delete inquiry')
      }
    } catch (error) {
      console.error('Error deleting inquiry:', error)
      toast.error('Error deleting inquiry')
    }
  }

  const getStatusColor = (cf) => {
    if (cf === 'pending') return 'bg-yellow-100 text-yellow-800'
    return 'bg-emerald-100 text-emerald-800'
  }

  /** Same as frontend customer list: only Pending vs Replied (no email chips). */
  const customerFacingStatus = (inquiry) => {
    const s = String(inquiry.displayStatus || inquiry.status || '').toLowerCase()
    if (s === 'pending') return 'pending'
    return 'replied'
  }

  const threadStatusLabel = (inquiry) =>
    customerFacingStatus(inquiry) === 'pending' ? 'Pending' : 'Replied'

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Inquiries Management</h1>
        <p className="text-gray-600">Manage customer inquiries and their status</p>
        {unreadCount > 0 ? (
          <div className="mt-4 flex flex-wrap items-center gap-3 rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-amber-950">
            <span className="font-semibold">
              {unreadCount} conversation{unreadCount === 1 ? '' : 's'} with new customer messages (pinned at top, highlighted).
            </span>
            <button
              type="button"
              onClick={requestDesktopAlerts}
              className="text-sm font-medium text-amber-900 underline hover:no-underline"
            >
              Enable desktop alerts
            </button>
          </div>
        ) : (
          <div className="mt-3">
            <button
              type="button"
              onClick={requestDesktopAlerts}
              className="text-sm text-blue-600 hover:text-blue-800 underline"
            >
              Enable desktop alerts for new customer messages
            </button>
          </div>
        )}
      </div>

      {/* Search and Filter Section */}
             <div className="bg-white rounded-lg shadow-md p-6 mb-6">
         <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
           <div>
             <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
             <input
               type="text"
               placeholder="Search by name or email..."
               value={searchTerm}
               onChange={(e) => setSearchTerm(e.target.value)}
               className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
             />
           </div>
           <div>
             <label className="block text-sm font-medium text-gray-700 mb-2">Message status</label>
            <select
              value={messageStatusFilter}
              onChange={(e) => {
                setPage(1)
                setMessageStatusFilter(e.target.value)
              }}
               className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
             >
               <option value="">All</option>
               <option value="pending">Pending</option>
               <option value="replied">Replied</option>
             </select>
           </div>
           <div className="flex items-end">
             <button
               onClick={() => {
                 setSearchTerm('')
                 setAppliedSearch('')
                 setMessageStatusFilter('')
                 setPage(1)
               }}
               className="w-full bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600 transition-colors"
             >
               Clear Filters
             </button>
           </div>
         </div>
       </div>

      {/* Inquiries List */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800">Inquiries ({totalCount})</h2>
          {totalCount > 0 ? (
            <p className="text-sm text-gray-500 mt-1">
              Page {page} of {totalPages} · {PAGE_SIZE} per page
            </p>
          ) : null}
        </div>

        {inquiries.length === 0 ? (
          <div className="p-8 text-center">
            <div className="text-6xl mb-4">📋</div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">No Inquiries Found</h3>
            <p className="text-gray-600">No inquiries match your current filters.</p>
          </div>
        ) : (
          <div className="w-full py-6 flex flex-col items-center gap-6">
            {inquiries.map((inquiry) => {
              const cf = customerFacingStatus(inquiry)
              const isNewCustomer = Boolean(inquiry.hasUnreadUserMessageForAdmin)
              const preview =
                inquiry.latestThreadMessageLine ||
                inquiry.lastMessageBody ||
                (inquiry.message ? String(inquiry.message).slice(0, 160) : '')
              return (
                <div
                  key={inquiry._id}
                  className={`cartoon-card w-[90%] max-w-none mx-auto p-6 h-auto min-w-0 transition-colors ${
                    isNewCustomer ? 'inquiry-card-unread' : ''
                  }`}
                >
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between mb-4">
                    <div className="min-w-0 flex-1">
                      <h3 className="text-lg font-semibold text-gray-800 flex flex-wrap items-center gap-2">
                        Inquiry #{inquiry._id.slice(-6)}
                        {isNewCustomer ? (
                          <span className="text-[11px] font-bold uppercase tracking-wide text-amber-800 bg-amber-200/90 px-2 py-0.5 rounded-full">
                            New message
                          </span>
                        ) : null}
                      </h3>
                      <p className="text-sm text-gray-500">{formatDate(inquiry.createdAt)}</p>
                      {isNewCustomer ? (
                        <p className="text-xs font-semibold text-amber-800 mt-1">
                          New customer message — open chat below
                        </p>
                      ) : null}
                      <div className="mt-2 space-y-1">
                        <p className="text-sm text-gray-800">
                          <span className="font-medium text-gray-700">Customer:</span> {inquiry.userName}
                        </p>
                        <p className="text-sm text-gray-800">
                          <span className="font-medium text-gray-700">Email:</span> {inquiry.userEmail}
                        </p>
                      </div>
                    </div>
                    <div className="flex shrink-0 flex-col gap-2 sm:items-end w-full sm:w-auto">
                      <div className="flex flex-wrap items-center justify-start gap-2 sm:justify-end">
                        <span
                          className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${getStatusColor(cf)}`}
                        >
                          {threadStatusLabel(inquiry)}
                        </span>
                      </div>
                      <Link
                        to={`/inquiry/${inquiry._id}`}
                        className="inline-flex w-full shrink-0 items-center justify-center rounded-md bg-blue-600 px-4 py-2.5 text-center text-sm font-semibold text-white shadow hover:bg-blue-700 sm:w-auto sm:min-w-[8.5rem]"
                      >
                        Open chat
                      </Link>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {(inquiry.products || []).map((product, index) => {
                      const pop =
                        product.productId &&
                        typeof product.productId === 'object' &&
                        !Array.isArray(product.productId)
                          ? product.productId
                          : null
                      const imgUrl =
                        pop && Array.isArray(pop.image) && pop.image.length > 0 ? pop.image[0] : null
                      return (
                      <div
                        key={index}
                        className="flex items-center gap-4 p-3 bg-gray-50 border border-gray-100 rounded-lg"
                      >
                        {imgUrl ? (
                          <img
                            src={imgUrl}
                            alt=""
                            className="w-12 h-12 object-cover rounded-lg border border-gray-200 shrink-0 bg-white"
                          />
                        ) : (
                          <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center shadow-inner shrink-0">
                            <span className="text-gray-600">📦</span>
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-800 break-words">{product.productName}</p>
                          <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-600">
                            <span>Qty: {product.quantity}</span>
                            <span>Size: {product.size}</span>
                            <span>Price: ${product.price}</span>
                          </div>
                        </div>
                      </div>
                      )
                    })}
                  </div>

                  {preview ? (
                    <div className="mt-4 text-sm text-gray-700 bg-blue-50 border border-blue-100 rounded-lg p-3">
                      <span className="font-semibold">
                        {inquiry.latestThreadMessageLine ? 'Latest message' : 'Latest:'}
                      </span>{' '}
                      <span className="text-gray-600 break-words">{preview}</span>
                    </div>
                  ) : null}
                  {inquiry.userPhone ? (
                    <div className="mt-2 text-sm text-gray-600">
                      <span className="font-semibold text-gray-700">Phone:</span> {inquiry.userPhone}
                    </div>
                  ) : null}

                  <div className="mt-6 flex flex-col gap-3 border-t border-gray-200 pt-4">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-sm text-gray-600">Total Amount</p>
                      <p className="text-xl font-semibold text-gray-800">${inquiry.totalAmount}</p>
                    </div>
                    <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
                      <button
                        type="button"
                        onClick={() => handleDelete(inquiry._id)}
                        className="inline-flex w-full shrink-0 items-center justify-center gap-2 rounded-md bg-red-500 px-4 py-2.5 text-sm font-semibold text-white shadow hover:bg-red-600 sm:w-auto sm:min-w-[8.5rem]"
                      >
                        <span aria-hidden>🗑</span>
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
            {totalPages > 1 ? (
              <div className="w-[90%] mx-auto flex flex-wrap items-center justify-center gap-3 border-t border-gray-200 pt-6">
                <button
                  type="button"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Previous
                </button>
                <span className="text-sm text-gray-600">
                  Page {page} / {totalPages}
                </span>
                <button
                  type="button"
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Next
                </button>
              </div>
            ) : null}
          </div>
        )}
      </div>
    </div>
  )
}

export default Inquiries 