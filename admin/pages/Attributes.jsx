import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { toast } from 'react-toastify'
import { backendUrl as defaultBackendUrl } from '../src/App.jsx'

const Attributes = ({ token, backendUrl: propBackendUrl }) => {
  const backendUrl = propBackendUrl || defaultBackendUrl || 'http://localhost:4000'
  const [attributes, setAttributes] = useState([])
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [form, setForm] = useState({
    name: '',
    label: '',
    description: '',
    color: '#3b82f6',
  })

  const fetchAttributes = async () => {
    setLoading(true)
    try {
      const { data } = await axios.get(`${backendUrl}/api/attributes`)
      if (data.success) {
        setAttributes(data.attributes || [])
      }
    } catch (error) {
      console.error('Failed to load attributes', error)
      toast.error(error.response?.data?.message || 'Failed to load attributes')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAttributes()
  }, [])

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.name.trim() || !form.label.trim()) {
      toast.error('Please provide both name and label')
      return
    }
    setSubmitting(true)
    try {
      const payload = {
        ...form,
        name: form.name.trim(),
        label: form.label.trim(),
      }
      const { data } = await axios.post(`${backendUrl}/api/attributes`, payload, {
        headers: { token },
      })
      if (data.success) {
        toast.success('Attribute created successfully')
        setForm({ name: '', label: '', description: '', color: '#3b82f6' })
        fetchAttributes()
      } else {
        toast.error(data.message || 'Failed to create attribute')
      }
    } catch (error) {
      console.error('Failed to create attribute', error)
      toast.error(error.response?.data?.message || error.message || 'Failed to create attribute')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className='space-y-6'>
      <div>
        <h2 className='text-2xl font-semibold text-gray-800 mb-2'>Attribute Management</h2>
        <p className='text-sm text-gray-500'>Define reusable product attributes. Selected attributes will be displayed as tags on product pages.</p>
      </div>

      <form onSubmit={handleSubmit} className='bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-4'>
        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-1'>Attribute Name (unique)</label>
            <input
              name='name'
              value={form.name}
              onChange={handleChange}
              placeholder='e.g. bpa_free'
              className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
            />
          </div>
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-1'>Display Label</label>
            <input
              name='label'
              value={form.label}
              onChange={handleChange}
              placeholder='e.g. BPA Free'
              className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
            />
          </div>
        </div>

        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-1'>Tag Color</label>
            <input
              type='color'
              name='color'
              value={form.color}
              onChange={handleChange}
              className='w-20 h-10 border border-gray-300 rounded'
            />
          </div>
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-1'>Description (optional)</label>
            <input
              name='description'
              value={form.description}
              onChange={handleChange}
              placeholder='Internal reference'
              className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
            />
          </div>
        </div>

        <button
          type='submit'
          disabled={submitting}
          className='px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-60'
        >
          {submitting ? 'Saving...' : 'Add Attribute'}
        </button>
      </form>

      <div className='bg-white rounded-xl shadow-sm border border-gray-200 p-6'>
        <h3 className='text-lg font-semibold text-gray-800 mb-4'>Existing Attributes</h3>
        {loading ? (
          <p className='text-gray-500 text-sm'>Loading attributes...</p>
        ) : attributes.length === 0 ? (
          <p className='text-gray-500 text-sm'>No attributes defined yet. Create your first attribute above.</p>
        ) : (
          <div className='grid gap-3 md:grid-cols-2'>
            {attributes.map(attribute => (
              <div key={attribute._id} className='border border-gray-200 rounded-lg p-4 flex flex-col gap-2'>
                <div className='flex items-center justify-between'>
                  <span className='font-semibold text-gray-800'>{attribute.label}</span>
                  <span className='inline-flex items-center gap-2 px-2 py-1 rounded-full text-xs font-medium text-white' style={{ backgroundColor: attribute.color || '#3b82f6' }}>
                    <span className='w-2 h-2 rounded-full bg-white/70'></span>
                    {attribute.name}
                  </span>
                </div>
                {attribute.description && <p className='text-xs text-gray-500'>{attribute.description}</p>}
                <p className='text-[11px] text-gray-400'>Created {new Date(attribute.createdAt).toLocaleDateString()}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default Attributes

