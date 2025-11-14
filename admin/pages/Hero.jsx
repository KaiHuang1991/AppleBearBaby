import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { toast } from 'react-toastify'
import { backendUrl as defaultBackendUrl } from '../src/App.jsx'

const Hero = ({ token, backendUrl: propBackendUrl }) => {
  const backendUrl = propBackendUrl || defaultBackendUrl || 'http://localhost:4000'
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [slides, setSlides] = useState([])
  const [autoPlay, setAutoPlay] = useState(true)
  const [autoPlayInterval, setAutoPlayInterval] = useState(3000)
  const [isActive, setIsActive] = useState(true)
  const [editingSlide, setEditingSlide] = useState(null)
  const [showAddForm, setShowAddForm] = useState(false)

  // Form state for adding/editing slide
  const [formData, setFormData] = useState({
    imageUrl: '',
    linkUrl: '',
    title: '',
    features: '',
    buttonText: 'View All Products',
    order: 0,
    isActive: true
  })

  useEffect(() => {
    fetchHeroConfig()
  }, [])

  const fetchHeroConfig = async () => {
    setLoading(true)
    try {
      const response = await axios.get(`${backendUrl}/api/hero`)
      if (response.data.success) {
        const config = response.data.config
        setSlides(config.slides || [])
        setAutoPlay(config.autoPlay !== undefined ? config.autoPlay : true)
        setAutoPlayInterval(config.autoPlayInterval || 3000)
        setIsActive(config.isActive !== undefined ? config.isActive : true)
      }
    } catch (error) {
      console.error('Error fetching hero config:', error)
      toast.error('Failed to load hero configuration')
    } finally {
      setLoading(false)
    }
  }

  const handleSaveConfig = async () => {
    setSaving(true)
    try {
      const response = await axios.put(
        `${backendUrl}/api/hero`,
        {
          slides,
          autoPlay,
          autoPlayInterval,
          isActive
        },
        {
          headers: { token }
        }
      )

      if (response.data.success) {
        toast.success('Hero configuration saved successfully!')
      } else {
        toast.error(response.data.message || 'Failed to save configuration')
      }
    } catch (error) {
      console.error('Error saving hero config:', error)
      toast.error(error.response?.data?.message || 'Failed to save hero configuration')
    } finally {
      setSaving(false)
    }
  }

  const handleAddSlide = () => {
    setFormData({
      imageUrl: '',
      linkUrl: '',
      title: '',
      features: '',
      buttonText: 'View All Products',
      order: slides.length,
      isActive: true
    })
    setEditingSlide(null)
    setShowAddForm(true)
  }

  const handleEditSlide = (slide) => {
    setFormData({
      imageUrl: slide.imageUrl || '',
      linkUrl: slide.linkUrl || '',
      title: slide.title || '',
      features: Array.isArray(slide.features) ? slide.features.join(', ') : '',
      buttonText: slide.buttonText || 'View All Products',
      order: slide.order || 0,
      isActive: slide.isActive !== undefined ? slide.isActive : true
    })
    setEditingSlide(slide._id)
    setShowAddForm(true)
  }

  const handleDeleteSlide = async (slideId) => {
    if (!window.confirm('Are you sure you want to delete this slide?')) {
      return
    }

    try {
      const response = await axios.delete(`${backendUrl}/api/hero/slide/${slideId}`, {
        headers: { token }
      })

      if (response.data.success) {
        toast.success('Slide deleted successfully')
        fetchHeroConfig()
      } else {
        toast.error(response.data.message || 'Failed to delete slide')
      }
    } catch (error) {
      console.error('Error deleting slide:', error)
      toast.error(error.response?.data?.message || 'Failed to delete slide')
    }
  }

  const handleSubmitSlide = async (e) => {
    e.preventDefault()

    if (!formData.imageUrl.trim() || !formData.title.trim()) {
      toast.error('Image URL and Title are required')
      return
    }

    try {
      const slideData = {
        ...formData,
        features: formData.features.split(',').map(f => f.trim()).filter(f => f)
      }

      if (editingSlide) {
        // Update existing slide
        const response = await axios.put(
          `${backendUrl}/api/hero/slide/${editingSlide}`,
          slideData,
          { headers: { token } }
        )

        if (response.data.success) {
          toast.success('Slide updated successfully')
          setShowAddForm(false)
          fetchHeroConfig()
        } else {
          toast.error(response.data.message || 'Failed to update slide')
        }
      } else {
        // Add new slide
        console.log('Adding slide with data:', slideData)
        console.log('Token:', token ? 'Present' : 'Missing')
        console.log('Backend URL:', backendUrl)
        
        const response = await axios.post(
          `${backendUrl}/api/hero/slide`,
          slideData,
          { headers: { token } }
        )

        if (response.data.success) {
          toast.success('Slide added successfully')
          setShowAddForm(false)
          fetchHeroConfig()
        } else {
          toast.error(response.data.message || 'Failed to add slide')
        }
      }
    } catch (error) {
      console.error('Error saving slide:', error)
      console.error('Error response:', error.response)
      console.error('Error data:', error.response?.data)
      const errorMessage = error.response?.data?.message || error.response?.data?.error || error.message || 'Failed to save slide'
      toast.error(`Error: ${errorMessage}`)
    }
  }

  const handleMoveSlide = async (index, direction) => {
    const newSlides = [...slides]
    const newIndex = direction === 'up' ? index - 1 : index + 1

    if (newIndex < 0 || newIndex >= newSlides.length) return

    // Swap orders
    const tempOrder = newSlides[index].order
    newSlides[index].order = newSlides[newIndex].order
    newSlides[newIndex].order = tempOrder

    // Swap positions
    ;[newSlides[index], newSlides[newIndex]] = [newSlides[newIndex], newSlides[index]]

    setSlides(newSlides)

    // Save to backend
    try {
      await axios.put(
        `${backendUrl}/api/hero`,
        {
          slides: newSlides,
          autoPlay,
          autoPlayInterval,
          isActive
        },
        {
          headers: { token }
        }
      )
    } catch (error) {
      console.error('Error saving slide order:', error)
      toast.error('Failed to save slide order')
      // Revert on error
      fetchHeroConfig()
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-800">Hero Section Management</h1>
        <button
          onClick={handleAddSlide}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          + Add New Slide
        </button>
      </div>

      {/* Configuration Settings */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">General Settings</h2>
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={autoPlay}
                onChange={(e) => setAutoPlay(e.target.checked)}
                className="w-4 h-4"
              />
              <span>Auto Play Slides</span>
            </label>
          </div>

          {autoPlay && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Auto Play Interval (milliseconds)
              </label>
              <input
                type="number"
                value={autoPlayInterval}
                onChange={(e) => setAutoPlayInterval(parseInt(e.target.value) || 3000)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                min="1000"
                step="500"
              />
            </div>
          )}

          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="w-4 h-4"
              />
              <span>Hero Section Active</span>
            </label>
          </div>

          <button
            onClick={handleSaveConfig}
            disabled={saving}
            className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Configuration'}
          </button>
        </div>
      </div>

      {/* Add/Edit Slide Form */}
      {showAddForm && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">
              {editingSlide ? 'Edit Slide' : 'Add New Slide'}
            </h2>
            <button
              onClick={() => {
                setShowAddForm(false)
                setEditingSlide(null)
              }}
              className="text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
          </div>

          <form onSubmit={handleSubmitSlide} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Image URL *
              </label>
              <input
                type="url"
                value={formData.imageUrl}
                onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholder="https://example.com/image.jpg"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Link URL (Optional)
              </label>
              <input
                type="url"
                value={formData.linkUrl}
                onChange={(e) => setFormData({ ...formData, linkUrl: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholder="https://example.com/product"
              />
              <p className="text-xs text-gray-500 mt-1">
                The image will be clickable and redirect to this URL
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Title *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholder="Glass Feeding Bottle Collection - Safe & Durable"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Features (comma-separated)
              </label>
              <input
                type="text"
                value={formData.features}
                onChange={(e) => setFormData({ ...formData, features: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholder="Borosilicate Glass, Heat Resistant, Explosion Proof"
              />
              <p className="text-xs text-gray-500 mt-1">
                Separate multiple features with commas
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Button Text
              </label>
              <input
                type="text"
                value={formData.buttonText}
                onChange={(e) => setFormData({ ...formData, buttonText: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholder="View All Products"
              />
            </div>

            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="w-4 h-4"
                />
                <span>Active</span>
              </label>
            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                {editingSlide ? 'Update Slide' : 'Add Slide'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowAddForm(false)
                  setEditingSlide(null)
                }}
                className="bg-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-400 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Slides List */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">Slides ({slides.length})</h2>

        {slides.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <p className="text-lg mb-2">No slides yet</p>
            <p className="text-sm">Click "Add New Slide" to create your first hero slide</p>
          </div>
        ) : (
          <div className="space-y-4">
            {slides
              .sort((a, b) => (a.order || 0) - (b.order || 0))
              .map((slide, index) => (
                <div
                  key={slide._id}
                  className={`border-2 rounded-lg p-4 ${
                    slide.isActive ? 'border-blue-300 bg-blue-50' : 'border-gray-200 bg-gray-50'
                  }`}
                >
                  <div className="flex gap-4">
                    {/* Image Preview */}
                    <div className="w-32 h-20 flex-shrink-0">
                      <img
                        src={slide.imageUrl}
                        alt={slide.title}
                        className="w-full h-full object-cover rounded border border-gray-300"
                        onError={(e) => {
                          e.target.src = 'https://via.placeholder.com/200x120?text=Image+Error'
                        }}
                      />
                    </div>

                    {/* Slide Info */}
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="font-semibold text-gray-800">{slide.title}</h3>
                          {slide.linkUrl && (
                            <p className="text-sm text-blue-600 mt-1">
                              Link: <a href={slide.linkUrl} target="_blank" rel="noopener noreferrer" className="underline">{slide.linkUrl}</a>
                            </p>
                          )}
                          {slide.features && slide.features.length > 0 && (
                            <div className="flex flex-wrap gap-2 mt-2">
                              {slide.features.map((feature, idx) => (
                                <span
                                  key={idx}
                                  className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs"
                                >
                                  {feature}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          {!slide.isActive && (
                            <span className="bg-gray-200 text-gray-600 px-2 py-1 rounded text-xs">
                              Inactive
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2 mt-3">
                        <button
                          onClick={() => handleEditSlide(slide)}
                          className="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteSlide(slide._id)}
                          className="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600"
                        >
                          Delete
                        </button>
                        {index > 0 && (
                          <button
                            onClick={() => handleMoveSlide(index, 'up')}
                            className="bg-gray-500 text-white px-3 py-1 rounded text-sm hover:bg-gray-600"
                          >
                            ↑ Move Up
                          </button>
                        )}
                        {index < slides.length - 1 && (
                          <button
                            onClick={() => handleMoveSlide(index, 'down')}
                            className="bg-gray-500 text-white px-3 py-1 rounded text-sm hover:bg-gray-600"
                          >
                            ↓ Move Down
                          </button>
                        )}
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

export default Hero

