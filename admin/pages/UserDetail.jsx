import React, { useCallback, useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import axios from 'axios'
import { toast } from 'react-toastify'

const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:4000'

const UserDetail = ({ token }) => {
  const { id } = useParams()
  const [user, setUser] = useState(null)
  const [inquiries, setInquiries] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchDetail = useCallback(async () => {
    try {
      setLoading(true)
      const response = await axios.get(`${backendUrl}/api/user/admin/${id}`, {
        headers: { token }
      })
      if (response.data.success) {
        setUser(response.data.user)
        setInquiries(response.data.inquiries || [])
      } else {
        toast.error(response.data.message || 'Failed to load user')
      }
    } catch (error) {
      console.error('Error loading user:', error)
      toast.error(error?.response?.data?.message || 'Failed to load user')
    } finally {
      setLoading(false)
    }
  }, [id, token])

  useEffect(() => {
    fetchDetail()
  }, [fetchDetail])

  const formatDate = (dateString) =>
    dateString
      ? new Date(dateString).toLocaleString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        })
      : '—'

  const statusClass = (status) => {
    const s = String(status || '').toLowerCase()
    if (s === 'pending') return 'bg-yellow-100 text-yellow-800'
    if (s === 'replied') return 'bg-emerald-100 text-emerald-800'
    return 'bg-gray-100 text-gray-700'
  }

  if (loading) {
    return (
      <div className="min-h-[40vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600" />
      </div>
    )
  }

  if (!user) {
    return (
      <div className="p-6">
        <p className="text-gray-600">User not found.</p>
        <Link to="/users" className="text-blue-600 mt-4 inline-block">
          ← Back to users
        </Link>
      </div>
    )
  }

  return (
    <div className="p-6">
      <Link to="/users" className="text-blue-600 hover:text-blue-800 text-sm mb-4 inline-block">
        ← Back to users
      </Link>

      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">{user.name}</h1>
        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
          <div>
            <dt className="text-gray-500">Email</dt>
            <dd className="font-medium text-gray-800">{user.email}</dd>
          </div>
          <div>
            <dt className="text-gray-500">Email verified</dt>
            <dd>
              <span
                className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${
                  user.isVerified ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                }`}
              >
                {user.isVerified ? 'Yes' : 'Pending'}
              </span>
            </dd>
          </div>
          <div>
            <dt className="text-gray-500">Registered</dt>
            <dd className="text-gray-800">{formatDate(user.createdAt)}</dd>
          </div>
          <div>
            <dt className="text-gray-500">Total inquiries</dt>
            <dd className="font-semibold text-blue-700">{user.inquiryCount ?? inquiries.length}</dd>
          </div>
        </dl>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800">Inquiries ({inquiries.length})</h2>
        </div>

        {inquiries.length === 0 ? (
          <div className="p-8 text-center text-gray-600">This user has no inquiries yet.</div>
        ) : (
          <ul className="divide-y divide-gray-100">
            {inquiries.map((inq) => (
              <li key={inq._id} className="p-6 hover:bg-gray-50">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span className="font-semibold text-gray-800">
                        Inquiry #{String(inq._id).slice(-6)}
                      </span>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusClass(inq.displayStatus)}`}>
                        {inq.displayStatus === 'pending' ? 'Pending' : inq.displayStatus === 'replied' ? 'Replied' : inq.displayStatus}
                      </span>
                      {inq.hasUnreadUserMessageForAdmin ? (
                        <span className="text-[11px] font-bold uppercase text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full">
                          New message
                        </span>
                      ) : null}
                    </div>
                    <p className="text-sm text-gray-500">{formatDate(inq.createdAt)}</p>
                    {inq.lastMessageBody ? (
                      <p className="text-sm text-gray-600 mt-2 line-clamp-2">{inq.lastMessageBody}</p>
                    ) : null}
                    <p className="text-sm text-gray-500 mt-1">
                      {inq.productCount} product(s) · ${Number(inq.totalAmount || 0).toFixed(2)}
                    </p>
                  </div>
                  <Link
                    to={`/inquiry/${inq._id}`}
                    className="shrink-0 text-blue-600 hover:text-blue-800 font-medium text-sm"
                  >
                    Open thread →
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}

export default UserDetail
