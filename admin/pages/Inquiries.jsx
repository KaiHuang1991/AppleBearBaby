import React, { useState, useEffect } from 'react'
import { toast } from 'react-toastify'
import axios from 'axios'

const Inquiries = ({ token }) => {
  const [inquiries, setInquiries] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [emailStatusFilter, setEmailStatusFilter] = useState('')
  const [searchTimeout, setSearchTimeout] = useState(null)

  const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:4000'

  useEffect(() => {
    fetchInquiries()
  }, [emailStatusFilter])

  // Debounced search effect
  useEffect(() => {
    if (searchTimeout) {
      clearTimeout(searchTimeout)
    }
    
    const timeout = setTimeout(() => {
      fetchInquiries()
    }, 1500) // 1.5 second delay
    
    setSearchTimeout(timeout)
    
    return () => {
      if (timeout) {
        clearTimeout(timeout)
      }
    }
  }, [searchTerm])

  const fetchInquiries = async () => {
    try {
      setLoading(true)
             let url = `${backendUrl}/api/inquiries/admin/all?page=1&limit=50`
       if (searchTerm) url += `&search=${searchTerm}`
       if (emailStatusFilter) url += `&emailStatus=${emailStatusFilter}`

      const response = await axios.get(url, {
        headers: { token }
      })

      if (response.data.success) {
        setInquiries(response.data.inquiries)
      } else {
        toast.error('Failed to fetch inquiries')
      }
    } catch (error) {
      console.error('Error fetching inquiries:', error)
      toast.error('Error fetching inquiries')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (inquiryId) => {
    if (!window.confirm('Are you sure you want to delete this inquiry?')) return
    try {
      const response = await axios.delete(`${backendUrl}/api/inquiries/admin/${inquiryId}`, {
        headers: { token }
      })
      if (response.data.success) {
        toast.success('Inquiry deleted successfully')
        fetchInquiries()
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
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'responded': return 'bg-blue-100 text-blue-800'
      case 'completed': return 'bg-green-100 text-green-800'
      case 'cancelled': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getEmailStatusColor = (emailStatus) => {
    switch (emailStatus) {
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'sent': return 'bg-green-100 text-green-800'
      case 'failed': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
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
             <label className="block text-sm font-medium text-gray-700 mb-2">Email Status</label>
             <select
               value={emailStatusFilter}
               onChange={(e) => setEmailStatusFilter(e.target.value)}
               className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
             >
               <option value="">All Email Status</option>
               <option value="pending">Pending</option>
               <option value="sent">Sent</option>
               <option value="failed">Failed</option>
             </select>
           </div>
           <div className="flex items-end">
             <button
               onClick={() => {
                 setSearchTerm('')
                 setEmailStatusFilter('')
               }}
               className="w-full bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600 transition-colors"
             >
               Clear Filters
             </button>
           </div>
         </div>
       </div>

      {/* Inquiries List */}
      <div className="bg-white rounded-lg shadow-md">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800">Inquiries ({inquiries.length})</h2>
        </div>
        
        {inquiries.length === 0 ? (
          <div className="p-8 text-center">
            <div className="text-6xl mb-4">📋</div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">No Inquiries Found</h3>
            <p className="text-gray-600">No inquiries match your current filters.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {inquiries.map((inquiry) => (
              <div key={inquiry._id} className="p-6 hover:bg-gray-50">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800">
                      Inquiry #{inquiry._id.slice(-6)}
                    </h3>
                    <p className="text-sm text-gray-600">{formatDate(inquiry.createdAt)}</p>
                    <div className="mt-2 space-y-1">
                      <p className="text-sm">
                        <span className="font-medium">Customer:</span> {inquiry.userName}
                      </p>
                      <p className="text-sm">
                        <span className="font-medium">Email:</span> {inquiry.userEmail}
                      </p>
                      {inquiry.userPhone && (
                        <p className="text-sm">
                          <span className="font-medium">Phone:</span> {inquiry.userPhone}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${getStatusColor(inquiry.status)}`}>
                      {inquiry.status.charAt(0).toUpperCase() + inquiry.status.slice(1)}
                    </span>
                                         <div className="flex items-center gap-2">
                       <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${getEmailStatusColor(inquiry.emailStatus)}`}>
                         {inquiry.emailStatus === 'sent' ? '✅ Success' : 
                          inquiry.emailStatus === 'failed' ? '❌ Fail' : 
                          '⏳ Pending'}
                       </span>
                     </div>
                  </div>
                </div>

                {/* Products */}
                <div className="mb-4">
                  <h4 className="font-medium text-gray-800 mb-2">Products:</h4>
                  <div className="space-y-2">
                    {inquiry.products.map((product, index) => (
                      <div key={index} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                        <div className="w-10 h-10 bg-gray-200 rounded-lg flex items-center justify-center">
                          <span className="text-gray-600 text-sm">📦</span>
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-gray-800">{product.productName}</p>
                          <div className="flex gap-4 text-sm text-gray-600">
                            <span>Qty: {product.quantity}</span>
                            <span>Size: {product.size}</span>
                            <span>Price: ${product.price}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Total and Actions */}
                <div className="flex justify-between items-center pt-4 border-t border-gray-200">
                  <div>
                    <p className="text-sm text-gray-600">Total Amount:</p>
                    <p className="text-lg font-bold text-gray-800">${inquiry.totalAmount}</p>
                  </div>
                  <button
                    onClick={() => handleDelete(inquiry._id)}
                    className="px-3 py-1 bg-red-500 text-white rounded-md text-sm hover:bg-red-600 transition-colors"
                  >
                    Delete
                  </button>
                </div>

                {/* Admin Response */}
                {inquiry.adminResponse && (
                  <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                    <p className="text-sm font-medium text-gray-800">Admin Response:</p>
                    <p className="text-sm text-gray-700">{inquiry.adminResponse}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default Inquiries 