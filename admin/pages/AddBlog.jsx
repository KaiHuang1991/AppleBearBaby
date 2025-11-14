import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import RichTextEditor from '../components/RichTextEditor'
import axios from 'axios'

const AddBlog = ({ token }) => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [categories, setCategories] = useState([])
  const [imageUploadType, setImageUploadType] = useState('url') // 'url' or 'local'
  const [imageFile, setImageFile] = useState(null)
  const [uploadingImage, setUploadingImage] = useState(false)
  const backendUrl = 'http://localhost:4000'
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    excerpt: '',
    category: '',
    author: '',
    image: '',
    readTime: 5,
    tags: '',
    isPublished: true
  })

  useEffect(() => {
    fetchCategories()
    if (id) {
      fetchBlog()
    }
  }, [id, token])

  const fetchCategories = async () => {
    try {
      const response = await fetch('http://localhost:4000/api/blogs/categories')
      const data = await response.json()
      if (data.success) {
        setCategories(data.categories)
      }
    } catch (error) {
      console.error('Error fetching categories:', error)
    }
  }

  const fetchBlog = async () => {
    try {
      setLoading(true)
      const response = await fetch(`http://localhost:4000/api/blogs/${id}`)
      const data = await response.json()
      
      if (data.success) {
        const blog = data.blog
        setFormData({
          title: blog.title || '',
          content: blog.content || '',
          excerpt: blog.excerpt || '',
          category: blog.category || '',
          author: blog.author || '',
          image: blog.image || '',
          readTime: blog.readTime || 5,
          tags: blog.tags ? blog.tags.join(', ') : '',
          isPublished: blog.isPublished !== undefined ? blog.isPublished : true
        })
      }
    } catch (error) {
      console.error('Error fetching blog:', error)
      toast.error('Failed to load blog')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  // Handle main image file selection
  const handleImageFileChange = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file')
      return
    }

    setImageFile(file)
    setUploadingImage(true)

    try {
      const formData = new FormData()
      formData.append('image', file)

      const response = await axios.post(`${backendUrl}/api/product/upload-description-image`, formData, {
        headers: {
          'token': token,
          'Content-Type': 'multipart/form-data'
        }
      })

      if (response.data.success) {
        setFormData(prev => ({ ...prev, image: response.data.imageUrl }))
        toast.success('Image uploaded successfully')
      } else {
        toast.error('Failed to upload image')
      }
    } catch (error) {
      console.error('Error uploading image:', error)
      toast.error('Failed to upload image')
    } finally {
      setUploadingImage(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!formData.title || !formData.content || !formData.category) {
      toast.error('Please fill in all required fields')
      return
    }

    try {
      setLoading(true)
      
      const submitData = {
        ...formData,
        tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag)
      }

      const url = id ? `http://localhost:4000/api/blogs/${id}` : 'http://localhost:4000/api/blogs'
      const method = id ? 'PUT' : 'POST'

      console.log('Making request to:', url);
      console.log('Method:', method);
      console.log('Token:', token);
      console.log('Submit data:', submitData);
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'token': token
        },
        body: JSON.stringify(submitData)
      })

      console.log('Response status:', response.status);
      console.log('Response headers:', response.headers);
      
      const responseText = await response.text();
      console.log('Response text:', responseText);
      
      let data;
      try {
        data = JSON.parse(responseText);
      } catch (error) {
        console.error('Failed to parse JSON:', error);
        throw new Error('Server returned invalid JSON: ' + responseText);
      }
      
      if (data.success) {
                 toast.success(id ? 'Blog updated successfully' : 'Blog created successfully')
         navigate('/blogs')
      } else {
        toast.error(data.message || 'Failed to save blog')
      }
    } catch (error) {
      console.error('Error saving blog:', error)
      toast.error('Failed to save blog')
    } finally {
      setLoading(false)
    }
  }

  if (loading && id) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            {id ? 'Edit Blog Post' : 'Add New Blog Post'}
          </h1>
          <p className="text-gray-600 mt-2">
            {id ? 'Update your blog post content and settings' : 'Create a new blog post for your website'}
          </p>

        </div>

        {/* Form */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Title *
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter blog title"
                required
              />
            </div>

            {/* Category and Author */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category *
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value="">Select Category</option>
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category.charAt(0).toUpperCase() + category.slice(1).replace('-', ' ')}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Author
                </label>
                <input
                  type="text"
                  name="author"
                  value={formData.author}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter author name"
                />
              </div>
            </div>

            {/* Image Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Main Image
              </label>
              
              {/* Upload Type Selector */}
              <div className="flex gap-4 mb-3">
                <label className="flex items-center cursor-pointer">
                  <input
                    type="radio"
                    checked={imageUploadType === 'url'}
                    onChange={() => setImageUploadType('url')}
                    className="mr-2"
                  />
                  <span className="text-sm">URL</span>
                </label>
                <label className="flex items-center cursor-pointer">
                  <input
                    type="radio"
                    checked={imageUploadType === 'local'}
                    onChange={() => setImageUploadType('local')}
                    className="mr-2"
                  />
                  <span className="text-sm">Upload Local File</span>
                </label>
              </div>

              {/* URL Input */}
              {imageUploadType === 'url' && (
                <input
                  type="url"
                  name="image"
                  value={formData.image}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="https://example.com/image.jpg"
                />
              )}

              {/* Local File Upload */}
              {imageUploadType === 'local' && (
                <div className="space-y-2">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageFileChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    disabled={uploadingImage}
                  />
                  {uploadingImage && (
                    <p className="text-sm text-blue-600">Uploading to Cloudinary...</p>
                  )}
                </div>
              )}

              {/* Image Preview */}
              {formData.image && (
                <div className="mt-3">
                  <p className="text-xs text-gray-500 mb-1">Preview:</p>
                  <img 
                    src={formData.image} 
                    alt="Preview" 
                    className="w-32 h-32 object-cover rounded-lg border shadow-sm"
                    onError={(e) => {
                      e.target.style.display = 'none'
                    }}
                  />
                </div>
              )}
            </div>

            {/* Excerpt */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Excerpt *
              </label>
              <textarea
                name="excerpt"
                value={formData.excerpt}
                onChange={handleInputChange}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Brief description of the blog post"
                required
              />
            </div>

            {/* Content */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Content *
              </label>
              <RichTextEditor
                value={formData.content}
                onChange={(value) => setFormData(prev => ({ ...prev, content: value }))}
                token={token}
                backendUrl={backendUrl}
              />
            </div>

            {/* Tags and Read Time */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tags
                </label>
                <input
                  type="text"
                  name="tags"
                  value={formData.tags}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="tag1, tag2, tag3"
                />
                <p className="text-xs text-gray-500 mt-1">Separate tags with commas</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Read Time (minutes)
                </label>
                <input
                  type="number"
                  name="readTime"
                  value={formData.readTime}
                  onChange={handleInputChange}
                  min="1"
                  max="60"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Published Status */}
            <div className="flex items-center">
              <input
                type="checkbox"
                name="isPublished"
                checked={formData.isPublished}
                onChange={handleInputChange}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label className="ml-2 block text-sm text-gray-900">
                Publish immediately
              </label>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-4 pt-6 border-t">
                             <button
                 type="button"
                 onClick={() => navigate('/blogs')}
                 className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
               >
                 Cancel
               </button>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Saving...' : (id ? 'Update Blog' : 'Create Blog')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default AddBlog 