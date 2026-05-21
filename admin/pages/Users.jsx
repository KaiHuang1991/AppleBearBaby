import React, { useCallback, useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'
import { toast } from 'react-toastify'

const PAGE_SIZE = 10
const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:4000'

const Users = ({ token }) => {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [appliedSearch, setAppliedSearch] = useState('')
  const [page, setPage] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const skipSearchPageReset = useRef(true)

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true)
      let url = `${backendUrl}/api/user/admin/all?page=${page}&limit=${PAGE_SIZE}`
      const s = appliedSearch.trim()
      if (s) url += `&search=${encodeURIComponent(s)}`

      const response = await axios.get(url, { headers: { token } })
      if (response.data.success) {
        const list = response.data.users || []
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
          setUsers(list)
        }
      } else {
        toast.error(response.data.message || 'Failed to fetch users')
      }
    } catch (error) {
      console.error('Error fetching users:', error)
      toast.error(error?.response?.data?.message || error?.message || 'Failed to fetch users')
    } finally {
      setLoading(false)
    }
  }, [token, page, appliedSearch])

  useEffect(() => {
    fetchUsers()
  }, [fetchUsers])

  useEffect(() => {
    const t = setTimeout(() => setAppliedSearch(searchTerm.trim()), 700)
    return () => clearTimeout(t)
  }, [searchTerm])

  useEffect(() => {
    if (skipSearchPageReset.current) {
      skipSearchPageReset.current = false
      return
    }
    setPage(1)
  }, [appliedSearch])

  const formatDate = (dateString) =>
    new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })

  if (loading && users.length === 0) {
    return (
      <div className="min-h-[40vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600" />
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Registered Users</h1>
        <p className="text-gray-600">Search customers and view their inquiries</p>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
          <div className="flex items-end">
            <button
              type="button"
              onClick={() => {
                setSearchTerm('')
                setAppliedSearch('')
                setPage(1)
              }}
              className="w-full bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600 transition-colors"
            >
              Clear search
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-6 border-b border-gray-200 flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 className="text-xl font-semibold text-gray-800">Users ({totalCount})</h2>
            {totalCount > 0 ? (
              <p className="text-sm text-gray-500 mt-1">
                Page {page} of {totalPages} · {PAGE_SIZE} per page
              </p>
            ) : null}
          </div>
        </div>

        {users.length === 0 ? (
          <div className="p-8 text-center text-gray-600">No users match your search.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 text-gray-600 uppercase text-xs">
                <tr>
                  <th className="px-6 py-3">Name</th>
                  <th className="px-6 py-3">Email</th>
                  <th className="px-6 py-3">Verified</th>
                  <th className="px-6 py-3">Inquiries</th>
                  <th className="px-6 py-3">Registered</th>
                  <th className="px-6 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {users.map((user) => (
                  <tr key={user._id || user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 font-medium text-gray-800">{user.name}</td>
                    <td className="px-6 py-4 text-gray-600">{user.email}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${
                          user.isVerified
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {user.isVerified ? 'Yes' : 'Pending'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-semibold text-blue-700">{user.inquiryCount ?? 0}</span>
                    </td>
                    <td className="px-6 py-4 text-gray-500 whitespace-nowrap">
                      {formatDate(user.createdAt)}
                    </td>
                    <td className="px-6 py-4">
                      <Link
                        to={`/users/${user._id || user.id}`}
                        className="text-blue-600 hover:text-blue-800 font-medium"
                      >
                        View details
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {totalPages > 1 ? (
          <div className="p-4 border-t border-gray-200 flex items-center justify-center gap-4">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="px-4 py-2 rounded-md border border-gray-300 disabled:opacity-40 hover:bg-gray-50"
            >
              Previous
            </button>
            <span className="text-sm text-gray-600">
              Page {page} of {totalPages}
            </span>
            <button
              type="button"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="px-4 py-2 rounded-md border border-gray-300 disabled:opacity-40 hover:bg-gray-50"
            >
              Next
            </button>
          </div>
        ) : null}
      </div>
    </div>
  )
}

export default Users
