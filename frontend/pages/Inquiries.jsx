import React, { useCallback, useContext, useEffect, useRef, useState } from 'react'
import { ShopContext } from '../context/ShopContext'
import Title from '../componets/Title'
import { useNavigate, Link } from 'react-router-dom'
import { toast } from 'react-toastify'

const Inquiries = () => {
  const { token, currency, api, refreshInquiryUnreadCount } = useContext(ShopContext)
  const navigate = useNavigate()
  const [inquiries, setInquiries] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const searchRef = useRef('')
  const searchDebounceRef = useRef(null)
  const skipDebouncedSearchOnce = useRef(true)

  useEffect(() => {
    searchRef.current = searchTerm
  }, [searchTerm])

  const fetchUserInquiries = useCallback(async () => {
    try {
      setLoading(true)
      const q = searchRef.current.trim()
      const params = q ? { search: q } : {}
      const response = await api.inquiriesUserList(params)
      const data = response.data
      
      if (data.success) {
        setInquiries(data.inquiries)
        refreshInquiryUnreadCount()
      } else {
        console.error('Failed to fetch inquiries:', data.message)
        toast.error(data.message || 'Failed to fetch inquiries')
      }
    } catch (error) {
      console.error('Error fetching inquiries:', error)
      toast.error('Error fetching inquiries')
    } finally {
      setLoading(false)
    }
  }, [token, api, refreshInquiryUnreadCount])

  useEffect(() => {
    if (token) {
      fetchUserInquiries()
    } else {
      setLoading(false)
    }
  }, [token, fetchUserInquiries])

  /** Debounce search: one request after user stops typing (ref timer clears previous). */
  useEffect(() => {
    if (!token) {
      if (searchDebounceRef.current) {
        clearTimeout(searchDebounceRef.current)
        searchDebounceRef.current = null
      }
      skipDebouncedSearchOnce.current = true
      return
    }
    if (skipDebouncedSearchOnce.current) {
      skipDebouncedSearchOnce.current = false
      return
    }
    if (searchDebounceRef.current) {
      clearTimeout(searchDebounceRef.current)
      searchDebounceRef.current = null
    }
    searchDebounceRef.current = setTimeout(() => {
      searchDebounceRef.current = null
      fetchUserInquiries()
    }, 3000)
    return () => {
      if (searchDebounceRef.current) {
        clearTimeout(searchDebounceRef.current)
        searchDebounceRef.current = null
      }
    }
  }, [searchTerm, token, fetchUserInquiries])

  const handleDeleteInquiry = async (inquiryId) => {
    if (!window.confirm('Are you sure you want to delete this inquiry?')) {
      return
    }

    try {
      const response = await api.inquiriesUserDelete(inquiryId)
      const data = response.data
      
      if (data.success) {
        toast.success('Inquiry deleted successfully')
        fetchUserInquiries()
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

  /** Customer-facing: only pending vs replied (no email / legacy status chips). */
  const customerFacingStatus = (inquiry) => {
    const s = String(inquiry.customerThreadStatus ?? inquiry.displayStatus ?? inquiry.status ?? '').toLowerCase()
    if (s === 'pending') return 'pending'
    return 'replied'
  }

  const threadStatusLabel = (inquiry) => (customerFacingStatus(inquiry) === 'pending' ? 'Pending' : 'Replied')

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

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Please Login</h2>
          <p className="text-gray-600 mb-4">You need to be logged in to view your inquiries</p>
          <button 
            onClick={() => navigate('/login')}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Login
          </button>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen relative pt-28">
      {/* Blue/Cyan Background Pattern */}
      <div className="absolute inset-0 cartoon-bg"></div>
      <div className="absolute inset-0 cartoon-hearts opacity-10"></div>
      
      {/* Subtle floating elements */}
      <div className="absolute top-32 left-10 w-12 h-12 bg-blue-200 rounded-full gentle-float opacity-40"></div>
      <div className="absolute bottom-40 right-20 w-8 h-8 bg-cyan-200 rounded-full gentle-bounce opacity-40"></div>
      
             <div className='relative z-10 border-t pt-8'>
         <div className='text-2xl text-center mb-8'>
           <Title text1={'MY'} text2={'INQUIRIES'}/>
         </div>
         
         {/* Search Section */}
         <div className="max-w-4xl mx-auto px-4 mb-6">
           <div className="bg-white rounded-lg shadow-md p-4">
             <div className="flex items-center gap-4">
               <div className="flex-1">
                 <label className="block text-sm font-medium text-gray-700 mb-2">Search Inquiries</label>
                 <input
                   type="text"
                   placeholder="Search by product name or inquiry details..."
                   value={searchTerm}
                   onChange={(e) => setSearchTerm(e.target.value)}
                   className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                 />
               </div>
               <div className="flex items-end">
                 <button
                   onClick={() => setSearchTerm('')}
                   className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors"
                 >
                   Clear
                 </button>
               </div>
             </div>
           </div>
         </div>
         
         <div className="max-w-4xl mx-auto px-4">
          {inquiries.length === 0 ? (
            <div className="cartoon-card p-8 text-center">
              <div className="text-6xl mb-4">📋</div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">No Inquiries Yet</h3>
              <p className="text-gray-600 mb-6">You haven't made any inquiries yet. Start shopping to create your first inquiry!</p>
              <button 
                onClick={() => navigate('/collection')}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Browse Products
              </button>
            </div>
          ) : (
            <div className="space-y-6 h-auto">
              {inquiries.map((inquiry) => {
                const st = customerFacingStatus(inquiry)
                const unread = Boolean(inquiry.hasUnreadAdminReply)
                const preview =
                  inquiry.latestThreadMessageLine ||
                  inquiry.lastMessageBody ||
                  (inquiry.message ? String(inquiry.message).slice(0, 160) : '')
                const chatTo = `/inquiries/${inquiry._id}`
                return (
                  <div
                    key={inquiry._id}
                    className={`cartoon-card p-6 h-auto min-w-0 transition-colors ${
                      unread ? 'inquiry-card-unread' : ''
                    }`}
                  >
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between mb-4">
                      <div className="min-w-0 flex-1">
                        <h3 className="text-lg font-semibold text-gray-800 flex flex-wrap items-center gap-2">
                          Inquiry #{inquiry._id.slice(-6)}
                          {unread ? (
                            <span className="text-[11px] font-bold uppercase tracking-wide text-amber-800 bg-amber-200/90 px-2 py-0.5 rounded-full">
                              Unread
                            </span>
                          ) : null}
                        </h3>
                        <p className="text-sm text-gray-500">{formatDate(inquiry.createdAt)}</p>
                        {inquiry.hasUnreadAdminReply ? (
                          <p className="text-xs font-semibold text-amber-800 mt-1">New reply — open chat below</p>
                        ) : null}
                      </div>
                      <div className="flex shrink-0 flex-col gap-2 sm:items-end">
                        <div className="flex flex-wrap items-center justify-start gap-2 sm:justify-end">
                          <span
                            className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${getStatusColor(st)}`}
                          >
                            {threadStatusLabel(inquiry)}
                          </span>
                        </div>
                        <Link
                          to={chatTo}
                          className="inline-flex w-full shrink-0 items-center justify-center rounded-md bg-blue-600 px-4 py-2.5 text-center text-sm font-semibold text-white shadow hover:bg-blue-700 sm:w-auto sm:min-w-[8.5rem]"
                        >
                          Open chat
                        </Link>
                      </div>
                    </div>

                    <div className="space-y-3">
                      {inquiry.products.map((product, index) => (
                        <div
                          key={index}
                          className="flex items-center gap-4 p-3 bg-gray-50 border border-gray-100 rounded-lg"
                        >
                          <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center shadow-inner">
                            <span className="text-gray-600">📦</span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-gray-800 truncate">{product.productName}</p>
                            <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-600">
                              <span>Qty: {product.quantity}</span>
                              <span>Size: {product.size}</span>
                              <span>
                                Price: {currency}
                                {product.price}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
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
                        <p className="text-xl font-semibold text-gray-800">
                          {currency}
                          {inquiry.totalAmount}
                        </p>
                      </div>
                      <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
                        <button
                          type="button"
                          onClick={() => handleDeleteInquiry(inquiry._id)}
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
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Inquiries
