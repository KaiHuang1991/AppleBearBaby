import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { toast } from 'react-toastify'
import { backendUrl as defaultBackendUrl } from '../src/App.jsx'

const CHANNELS = [
  { id: 'whatsapp', label: 'WhatsApp' },
  { id: 'wechat', label: 'WeChat' },
  { id: 'email', label: 'Email' },
  { id: 'phone', label: 'Phone' },
  { id: 'telegram', label: 'Telegram' },
]

const emptyForm = {
  name: '',
  channel: 'whatsapp',
  value: '',
  label: '',
  qrImageUrl: '',
  order: 0,
  isActive: true,
}

const valuePlaceholder = (channel) => {
  if (channel === 'whatsapp') return '+86-15867976938'
  if (channel === 'wechat') return 'WeChat ID'
  if (channel === 'email') return 'sales@example.com'
  if (channel === 'phone') return '+86-15867976938'
  if (channel === 'telegram') return '@username'
  return ''
}

const FloatContacts = ({ token, backendUrl: propBackendUrl }) => {
  const backendUrl = propBackendUrl || defaultBackendUrl
  const [loading, setLoading] = useState(true)
  const [contacts, setContacts] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [formData, setFormData] = useState(emptyForm)

  const fetchContacts = async () => {
    setLoading(true)
    try {
      const response = await axios.get(`${backendUrl}/api/float-contacts/admin`, { headers: { token } })
      if (response.data?.success) {
        setContacts(response.data.contacts || [])
      }
    } catch (error) {
      console.error('Failed to load sales contacts', error)
      toast.error(error.response?.data?.message || 'Failed to load sales contacts')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchContacts()
  }, [])

  const openAdd = () => {
    setFormData({ ...emptyForm, order: contacts.length })
    setEditingId(null)
    setShowForm(true)
  }

  const openEdit = (contact) => {
    setFormData({
      name: contact.name || '',
      channel: contact.channel || 'whatsapp',
      value: contact.value || '',
      label: contact.label || '',
      qrImageUrl: contact.qrImageUrl || '',
      order: contact.order || 0,
      isActive: contact.isActive !== false,
    })
    setEditingId(contact._id)
    setShowForm(true)
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (!formData.name.trim() || !formData.value.trim()) {
      toast.error('Name and contact value are required')
      return
    }
    try {
      if (editingId) {
        const response = await axios.put(
          `${backendUrl}/api/float-contacts/contact/${editingId}`,
          formData,
          { headers: { token } }
        )
        if (!response.data?.success) {
          toast.error(response.data?.message || 'Failed to update')
          return
        }
        toast.success('Sales contact updated')
      } else {
        const response = await axios.post(
          `${backendUrl}/api/float-contacts/contact`,
          formData,
          { headers: { token } }
        )
        if (!response.data?.success) {
          toast.error(response.data?.message || 'Failed to add')
          return
        }
        toast.success('Added to the floating window')
      }
      setShowForm(false)
      setEditingId(null)
      fetchContacts()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save sales contact')
    }
  }

  const handleDelete = async (contact) => {
    if (!window.confirm(`Remove ${contact.name} (${contact.channel}) from the floating window?`)) {
      return
    }
    try {
      const response = await axios.delete(`${backendUrl}/api/float-contacts/contact/${contact._id}`, {
        headers: { token },
      })
      if (response.data?.success) {
        toast.success(response.data.message || 'Removed')
        fetchContacts()
      } else {
        toast.error(response.data?.message || 'Failed to remove')
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to remove')
    }
  }

  const handleMove = async (index, direction) => {
    const nextIndex = direction === 'up' ? index - 1 : index + 1
    if (nextIndex < 0 || nextIndex >= contacts.length) return
    const nextContacts = [...contacts]
    ;[nextContacts[index], nextContacts[nextIndex]] = [nextContacts[nextIndex], nextContacts[index]]
    const ordered = nextContacts.map((contact, order) => ({ ...contact, order }))
    setContacts(ordered)
    try {
      await axios.put(
        `${backendUrl}/api/float-contacts/reorder`,
        { contacts: ordered.map((contact) => ({ _id: contact._id, order: contact.order })) },
        { headers: { token } }
      )
    } catch (error) {
      toast.error('Failed to save order')
      fetchContacts()
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Sales Contacts</h1>
          <p className="text-sm text-gray-500 mt-1">
            These entries appear in the storefront floating window. Add one row per salesperson and channel (WhatsApp, WeChat, email…).
          </p>
        </div>
        <button
          type="button"
          onClick={openAdd}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          + Add salesperson
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">{editingId ? 'Edit sales contact' : 'Add sales contact'}</h2>
            <button type="button" onClick={() => setShowForm(false)} className="text-gray-500 hover:text-gray-700">
              ✕
            </button>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(event) => setFormData({ ...formData, name: event.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="Kai"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Channel *</label>
                <select
                  value={formData.channel}
                  onChange={(event) => setFormData({ ...formData, channel: event.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  {CHANNELS.map((channel) => (
                    <option key={channel.id} value={channel.id}>{channel.label}</option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Contact value *</label>
              <input
                type="text"
                value={formData.value}
                onChange={(event) => setFormData({ ...formData, value: event.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholder={valuePlaceholder(formData.channel)}
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                WhatsApp / phone: include country code. WeChat: ID. Telegram: @username.
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Display text (optional)</label>
              <input
                type="text"
                value={formData.label}
                onChange={(event) => setFormData({ ...formData, label: event.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholder="Kai:+86-15867976938"
              />
            </div>
            {formData.channel === 'wechat' ? (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">WeChat QR image URL (optional)</label>
                <input
                  type="url"
                  value={formData.qrImageUrl}
                  onChange={(event) => setFormData({ ...formData, qrImageUrl: event.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="https://res.cloudinary.com/..."
                />
                {formData.qrImageUrl ? (
                  <img src={formData.qrImageUrl} alt="" className="mt-3 h-24 w-24 object-cover rounded border bg-white" />
                ) : null}
              </div>
            ) : null}
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.isActive}
                onChange={(event) => setFormData({ ...formData, isActive: event.target.checked })}
                className="w-4 h-4"
              />
              <span>Show on floating window</span>
            </label>
            <div className="flex gap-3">
              <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700">
                {editingId ? 'Update' : 'Add'}
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="bg-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">Contacts ({contacts.length})</h2>
        {contacts.length === 0 ? (
          <p className="text-gray-500">No sales contacts yet. Add WhatsApp or WeChat for each salesperson.</p>
        ) : (
          <div className="space-y-4">
            {contacts.map((contact, index) => (
              <div
                key={contact._id}
                className={`border-2 rounded-lg p-4 ${contact.isActive ? 'border-blue-300 bg-blue-50' : 'border-gray-200 bg-gray-50'}`}
              >
                <div className="flex gap-4 items-start">
                  {contact.qrImageUrl ? (
                    <img src={contact.qrImageUrl} alt="" className="w-16 h-16 object-cover rounded border bg-white" />
                  ) : null}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-800">{contact.name}</h3>
                    <p className="text-sm text-gray-600 mt-1">
                      {contact.channel} · {contact.label}
                    </p>
                    {contact.href ? (
                      <a href={contact.href} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 underline break-all">
                        {contact.href}
                      </a>
                    ) : (
                      <p className="text-xs text-gray-500 mt-1">Clicking this on the site copies the WeChat ID.</p>
                    )}
                    {!contact.isActive ? <p className="text-xs text-gray-500 mt-1">Hidden</p> : null}
                    <div className="flex flex-wrap gap-2 mt-3">
                      <button type="button" onClick={() => handleMove(index, 'up')} disabled={index === 0} className="px-3 py-1 text-sm border rounded disabled:opacity-40">
                        Up
                      </button>
                      <button type="button" onClick={() => handleMove(index, 'down')} disabled={index === contacts.length - 1} className="px-3 py-1 text-sm border rounded disabled:opacity-40">
                        Down
                      </button>
                      <button type="button" onClick={() => openEdit(contact)} className="px-3 py-1 text-sm border rounded">
                        Edit
                      </button>
                      <button type="button" onClick={() => handleDelete(contact)} className="px-3 py-1 text-sm border rounded text-red-600">
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default FloatContacts
