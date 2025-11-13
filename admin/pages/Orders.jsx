import React, { useState, useEffect } from 'react'
import { toast } from 'react-toastify'

const Inquiries = ({ token }) => {
  const [inquiries, setInquiries] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchInquiries()
  }, [token])

  const fetchInquiries = async () => {
    try {
      setLoading(true)
      const response = await fetch('http://localhost:4000/api/inquiries/admin/all', {
        headers: {
          'token': token
        }
      })
      const data = await response.json()
      
      if (data.success) {
        setInquiries(data.inquiries)
      } else {
        console.error('Failed to fetch inquiries:', data.message)
        toast.error('Failed to load inquiries')
      }
    } catch (error) {
      console.error('Error fetching inquiries:', error)
      toast.error('Failed to load inquiries')
    } finally {
      setLoading(false)
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
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Inquiries Management</h1>
            <p className="text-gray-600 mt-2">View and manage customer inquiries</p>
          </div>
        </div>

        {/* Inquiries List */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Products
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {inquiries.map((inquiry) => (
                  <tr key={inquiry._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{inquiry.userName}</div>
                        <div className="text-sm text-gray-500">{inquiry.userEmail}</div>
                      </div>
                    </td>
                                         <td className="px-6 py-4">
                       <div className="text-sm text-gray-900">
                         {inquiry.products.map((product, index) => (
                           <div key={index} className="mb-1">
                             {product.productName} - Qty: {product.quantity} - Size: {product.size}
                           </div>
                         ))}
                       </div>
                     </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(inquiry.status)}`}>
                        {inquiry.status.charAt(0).toUpperCase() + inquiry.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(inquiry.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button className="text-blue-600 hover:text-blue-900">
                          View Details
                        </button>
                        <button className="text-green-600 hover:text-green-900">
                          Respond
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {inquiries.length === 0 && (
          <div className="text-center py-12">
            <h3 className="text-xl font-semibold text-gray-600 mb-2">No inquiries yet</h3>
            <p className="text-gray-500">Customer inquiries will appear here when they submit requests</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default Inquiries
