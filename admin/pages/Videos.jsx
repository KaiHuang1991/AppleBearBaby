import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { toast } from 'react-toastify'
import { backendUrl as defaultBackendUrl } from '../src/App.jsx'

const CATEGORIES = [
  { value: 'product-demo', label: 'Product demo' },
  { value: 'factory', label: 'Factory' },
  { value: 'tutorial', label: 'Tutorial' },
  { value: 'wholesale', label: 'Wholesale' },
  { value: 'other', label: 'Other' },
]

const emptyForm = {
  title: '',
  description: '',
  youtubeUrl: '',
  category: 'product-demo',
  productId: '',
  order: 0,
  isPublished: true,
}

const Videos = ({ token, backendUrl: propBackendUrl }) => {
  const backendUrl = propBackendUrl || defaultBackendUrl || 'http://localhost:4000'
  const [videos, setVideos] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [editingId, setEditingId] = useState(null)
  const [showForm, setShowForm] = useState(false)

  const fetchVideos = async () => {
    setLoading(true)
    try {
      const { data } = await axios.get(`${backendUrl}/api/videos/admin/all`, {
        headers: { token },
      })
      if (data.success) setVideos(data.videos || [])
    } catch {
      toast.error('Failed to load videos')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchVideos()
  }, [])

  const openAdd = () => {
    setForm(emptyForm)
    setEditingId(null)
    setShowForm(true)
  }

  const openEdit = (video) => {
    setForm({
      title: video.title || '',
      description: video.description || '',
      youtubeUrl: video.youtubeUrl || '',
      category: video.category || 'product-demo',
      productId: video.productId?._id || video.productId || '',
      order: video.order ?? 0,
      isPublished: video.isPublished !== false,
    })
    setEditingId(video._id)
    setShowForm(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.title.trim() || !form.youtubeUrl.trim()) {
      toast.error('Title and YouTube URL are required')
      return
    }

    setSaving(true)
    try {
      const payload = {
        ...form,
        productId: form.productId?.trim() || null,
        order: Number(form.order) || 0,
      }

      const { data } = editingId
        ? await axios.put(`${backendUrl}/api/videos/${editingId}`, payload, { headers: { token } })
        : await axios.post(`${backendUrl}/api/videos`, payload, { headers: { token } })

      if (data.success) {
        toast.success(editingId ? 'Video updated' : 'Video added')
        setShowForm(false)
        fetchVideos()
      } else {
        toast.error(data.message || 'Save failed')
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Save failed')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this video?')) return
    try {
      const { data } = await axios.delete(`${backendUrl}/api/videos/${id}`, { headers: { token } })
      if (data.success) {
        toast.success('Video deleted')
        fetchVideos()
      }
    } catch {
      toast.error('Delete failed')
    }
  }

  return (
    <div className="max-w-5xl">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800">Video library</h1>
          <p className="text-sm text-gray-500 mt-1 max-w-2xl">
            Use YouTube <strong>Unlisted</strong> uploads — paste the share link here. Videos stay off YouTube search
            but play on your site. No monetization = no pre-roll ads for most accounts.
          </p>
          <p className="text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 mt-3 max-w-2xl">
            若前台出现「请登录以确认你不是聊天机器人」：在 YouTube 工作室为该视频开启<strong>允许嵌入</strong>；
            可见性用「不公开列出」或「公开」（不要用「私享」）；用已登录的 Chrome 先打开一次该视频；
            正式域名 applebearbaby.net 上比 localhost 更稳定。
          </p>
        </div>
        <button
          type="button"
          onClick={openAdd}
          className="px-5 py-2 rounded-full bg-gray-800 text-white text-sm hover:bg-black"
        >
          + Add video
        </button>
      </div>

      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="mb-8 p-6 border border-gray-200 rounded-xl bg-white shadow-sm space-y-4"
        >
          <h2 className="font-medium text-gray-800">{editingId ? 'Edit video' : 'New video'}</h2>

          <div>
            <label className="block text-sm text-gray-600 mb-1">Title *</label>
            <input
              className="w-full border border-gray-300 rounded px-3 py-2"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              required
            />
          </div>

          <div>
            <label className="block text-sm text-gray-600 mb-1">YouTube URL or video ID *</label>
            <input
              className="w-full border border-gray-300 rounded px-3 py-2"
              placeholder="https://www.youtube.com/watch?v=... or youtu.be/..."
              value={form.youtubeUrl}
              onChange={(e) => setForm({ ...form, youtubeUrl: e.target.value })}
              required
            />
            <p className="text-xs text-gray-400 mt-1">
              Upload on YouTube → Visibility: <strong>Unlisted</strong> → copy link
            </p>
          </div>

          <div>
            <label className="block text-sm text-gray-600 mb-1">Description</label>
            <textarea
              className="w-full border border-gray-300 rounded px-3 py-2 min-h-[80px]"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-600 mb-1">Category</label>
              <select
                className="w-full border border-gray-300 rounded px-3 py-2"
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
              >
                {CATEGORIES.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Sort order</label>
              <input
                type="number"
                className="w-full border border-gray-300 rounded px-3 py-2"
                value={form.order}
                onChange={(e) => setForm({ ...form, order: e.target.value })}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm text-gray-600 mb-1">Product ID (optional)</label>
            <input
              className="w-full border border-gray-300 rounded px-3 py-2 font-mono text-sm"
              placeholder="MongoDB product _id — shows video on product page"
              value={form.productId}
              onChange={(e) => setForm({ ...form, productId: e.target.value })}
            />
          </div>

          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={form.isPublished}
              onChange={(e) => setForm({ ...form, isPublished: e.target.checked })}
            />
            Published on storefront
          </label>

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2 rounded-full bg-gray-800 text-white text-sm disabled:opacity-50"
            >
              {saving ? 'Saving…' : 'Save'}
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="px-5 py-2 rounded-full border border-gray-300 text-sm"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {loading ? (
        <p className="text-gray-500">Loading…</p>
      ) : videos.length === 0 ? (
        <p className="text-gray-500">No videos yet. Add your first Unlisted YouTube link.</p>
      ) : (
        <ul className="space-y-4">
          {videos.map((video) => (
            <li
              key={video._id}
              className="flex flex-col sm:flex-row gap-4 p-4 border border-gray-200 rounded-xl bg-white"
            >
              <img
                src={video.thumbnail}
                alt=""
                className="w-full sm:w-40 aspect-video object-cover rounded-lg shrink-0"
              />
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <h3 className="font-medium text-gray-800">{video.title}</h3>
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full ${video.isPublished ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}
                  >
                    {video.isPublished ? 'Published' : 'Draft'}
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-1 font-mono truncate">{video.youtubeUrl}</p>
                {video.description ? (
                  <p className="text-sm text-gray-600 mt-2 line-clamp-2">{video.description}</p>
                ) : null}
                <div className="flex gap-3 mt-3">
                  <button
                    type="button"
                    onClick={() => openEdit(video)}
                    className="text-sm text-blue-600 hover:underline"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(video._id)}
                    className="text-sm text-red-600 hover:underline"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export default Videos
