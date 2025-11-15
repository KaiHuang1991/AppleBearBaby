import React, { useContext, useEffect, useState } from 'react'
import { ShopContext } from '../context/ShopContext'
import Title from '../componets/Title'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'

const Inquiries = () => {
  const { token, currency, backendUrl } = useContext(ShopContext)
  const navigate = useNavigate()
  const [inquiries, setInquiries] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [searchTimeout, setSearchTimeout] = useState(null)

  useEffect(() => {
    if (token) {
      fetchUserInquiries()
    } else {
      setLoading(false)
    }
  }, [token])

  // Debounced search effect
  useEffect(() => {
    if (searchTimeout) {
      clearTimeout(searchTimeout)
    }
    
    const timeout = setTimeout(() => {
      if (token) {
        fetchUserInquiries()
      }
    }, 1500) // 1.5 second delay
    
    setSearchTimeout(timeout)
    
    return () => {
      if (timeout) {
        clearTimeout(timeout)
      }
    }
  }, [searchTerm])

  const fetchUserInquiries = async () => {
    try {
      setLoading(true)
      const baseUrl = backendUrl || import.meta.env.VITE_BACKEND_URL || 'http://localhost:4000'
      // Backend will use authenticated user ID from token/cookie
      // We can use /user route without userId parameter
      let url = `${baseUrl}/api/inquiries/user`
      
      // Add search parameter if searchTerm exists
      const params = new URLSearchParams()
      if (searchTerm.trim()) {
        params.append('search', searchTerm.trim())
      }
      if (params.toString()) {
        url += `?${params.toString()}`
      }
      
      // Token is now sent via cookie, but keep header as fallback
      const headers = {
        'Content-Type': 'application/json'
      }
      if (token) headers.token = token
      
      const response = await fetch(url, {
        headers,
        credentials: 'include' // Include cookies
      })
      const data = await response.json()
      
      if (data.success) {
        setInquiries(data.inquiries)
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
  }

  const handleDeleteInquiry = async (inquiryId) => {
    if (!window.confirm('Are you sure you want to delete this inquiry?')) {
      return
    }

    try {
      const userId = localStorage.getItem('userId')
      const baseUrl = backendUrl || import.meta.env.VITE_BACKEND_URL || 'http://localhost:4000'
      const response = await fetch(`${baseUrl}/api/inquiries/user/${inquiryId}`, {
        method: 'DELETE',
        headers: {
          'token': token,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ userId })
      })
      const data = await response.json()
      
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

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'responded':
        return 'bg-blue-100 text-blue-800'
      case 'completed':
        return 'bg-green-100 text-green-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getEmailStatusColor = (emailStatus) => {
    switch (emailStatus) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'sent':
        return 'bg-green-100 text-green-800'
      case 'failed':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
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
              {inquiries.map((inquiry) => (
                <div key={inquiry._id} className="cartoon-card p-6 h-auto overflow-hidden">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-5">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800">Inquiry #{inquiry._id.slice(-6)}</h3>
                      <p className="text-sm text-gray-500">{formatDate(inquiry.createdAt)}</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${getStatusColor(inquiry.status)}`}>
                        {inquiry.status.charAt(0).toUpperCase() + inquiry.status.slice(1)}
                      </span>
                      <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${getEmailStatusColor(inquiry.emailStatus)}`}>
                        {inquiry.emailStatus === 'sent' ? '✅ Success' :
                         inquiry.emailStatus === 'failed' ? '❌ Fail' :
                         '⏳ Pending'}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {inquiry.products.map((product, index) => (
                      <div key={index} className="flex items-center gap-4 p-3 bg-gray-50 border border-gray-100 rounded-lg">
                        <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center shadow-inner">
                          <span className="text-gray-600">📦</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-800 truncate">{product.productName}</p>
                          <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-600">
                            <span>Qty: {product.quantity}</span>
                            <span>Size: {product.size}</span>
                            <span>Price: {currency}{product.price}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {inquiry.message && (
                    <div className="mt-4 text-sm text-gray-700 bg-blue-50 border border-blue-100 rounded-lg p-3">
                      <span className="font-semibold">Message:</span>{' '}
                      <span className="text-gray-600 break-words">{inquiry.message}</span>
                    </div>
                  )}
                  {inquiry.userPhone && (
                    <div className="mt-2 text-sm text-gray-600">
                      <span className="font-semibold text-gray-700">Phone:</span> {inquiry.userPhone}
                    </div>
                  )}

                  <div className="mt-6 mt-10 pt-4 border-t border-gray-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm text-gray-600">Total Amount</p>
                      <p className="text-xl font-semibold text-gray-800">{currency}{inquiry.totalAmount}</p>
                      <button
                        onClick={() => handleDeleteInquiry(inquiry._id)}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-md text-sm font-medium hover:bg-red-600 transition-colors shadow"
                      >
                        <span>🗑</span>
                        Delete Inquiry
                      </button>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                      {inquiry.adminResponse && (
                        <div className="text-sm text-gray-700 bg-gray-50 px-4 py-2 rounded-lg border border-gray-200 sm:order-1 order-2">
                          <p className="font-medium text-gray-600">Admin Response</p>
                          <p className="text-gray-700 whitespace-pre-wrap break-words">{inquiry.adminResponse}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Inquiries
