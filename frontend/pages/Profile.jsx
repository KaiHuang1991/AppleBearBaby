import React, { useContext, useEffect, useRef, useState } from 'react'
import { ShopContext } from '../context/ShopContext'
import Title from '../componets/Title'
import { toast } from 'react-toastify'

const Profile = () => {
  const { token, navigate, user, updateUserAvatar } = useContext(ShopContext)
  const [loading, setLoading] = useState(true)
  const [avatarFile, setAvatarFile] = useState(null)
  const [avatarPreview, setAvatarPreview] = useState('')
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef(null)

  useEffect(() => {
    if (!token) {
      navigate('/login')
      return
    }
    setLoading(false)
  }, [token, navigate])

  useEffect(() => {
    return () => {
      if (avatarPreview) {
        URL.revokeObjectURL(avatarPreview)
      }
    }
  }, [avatarPreview])

  const handleAvatarSelect = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file')
      return
    }
    setAvatarFile(file)
    setAvatarPreview(URL.createObjectURL(file))
  }

  const handleAvatarUpload = async () => {
    if (!avatarFile) {
      toast.error('Please choose an image first')
      return
    }
    setUploading(true)
    try {
      const result = await updateUserAvatar(avatarFile)
      if (result) {
        setAvatarFile(null)
        setAvatarPreview('')
        if (fileInputRef.current) {
          fileInputRef.current.value = ''
        }
      }
    } finally {
      setUploading(false)
    }
  }

  const handleCancel = () => {
    setAvatarFile(null)
    if (avatarPreview) {
      URL.revokeObjectURL(avatarPreview)
      setAvatarPreview('')
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Profile unavailable</h2>
          <p className="text-gray-600 mb-6">Please log in again to view your profile.</p>
          <button
            onClick={() => navigate('/login')}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Go to Login
          </button>
        </div>
      </div>
    )
  }

  const displayName = user.name || localStorage.getItem('userName') || 'User'
  const displayEmail = user.email || localStorage.getItem('userEmail') || 'Email not available'
  const joinDateRaw = localStorage.getItem('joinDate') || user.createdAt
  const joinDate = joinDateRaw ? new Date(joinDateRaw).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }) : 'Just joined'
  const avatarUrl = avatarPreview || user.avatar || localStorage.getItem('userAvatar') || ''
  const displayInitial = displayName.charAt(0).toUpperCase()

  return (
    <div className="min-h-screen relative">
      {/* Blue/Cyan Background Pattern */}
      <div className="absolute inset-0 cartoon-bg"></div>
      <div className="absolute inset-0 cartoon-hearts opacity-10"></div>
      
      {/* Subtle floating elements */}
      <div className="absolute top-20 left-10 w-12 h-12 bg-blue-200 rounded-full gentle-float opacity-40"></div>
      <div className="absolute bottom-40 right-20 w-8 h-8 bg-cyan-200 rounded-full gentle-bounce opacity-40"></div>
      
      <div className='relative z-10 border-t pt-16'>
        <div className='text-2xl text-center mb-8'>
          <Title text1={'MY'} text2={'PROFILE'}/>
        </div>
        
        <div className="max-w-4xl mx-auto px-4">
          <div className="cartoon-card p-8 mb-8">
            <div className="flex flex-col sm:flex-row items-center gap-6 mb-8">
              <div className="relative group">
                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt={`${displayName} avatar`}
                    className='w-28 h-28 rounded-full object-cover border-4 border-blue-100 shadow-md'
                  />
                ) : (
                  <div className='w-28 h-28 bg-gradient-to-br from-blue-400 to-cyan-400 rounded-full flex items-center justify-center text-white text-4xl font-bold shadow-md'>
                    {displayInitial}
                  </div>
                )}
                <button
                  type='button'
                  onClick={() => fileInputRef.current?.click()}
                  className='absolute bottom-0 right-0 bg-blue-600 text-white text-xs px-3 py-1 rounded-full shadow hover:bg-blue-700 transition-colors'
                >
                  Change
                </button>
                <input
                  type='file'
                  accept='image/*'
                  ref={fileInputRef}
                  onChange={handleAvatarSelect}
                  className='hidden'
                />
              </div>
              <div className='text-center sm:text-left'>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">{displayName}</h2>
                <p className="text-gray-600">{displayEmail}</p>
                <p className="text-sm text-gray-500 mt-1">Member since {joinDate}</p>
                {avatarFile && (
                  <div className='flex flex-col sm:flex-row gap-3 mt-4'>
                    <button
                      type='button'
                      onClick={handleAvatarUpload}
                      disabled={uploading}
                      className='bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed'
                    >
                      {uploading ? 'Uploading...' : 'Save Avatar'}
                    </button>
                    <button
                      type='button'
                      onClick={handleCancel}
                      className='border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors'
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-blue-600 mb-4">Account Information</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center py-2 border-b border-gray-200">
                    <span className="text-gray-600">Full Name:</span>
                    <span className="font-medium">{displayName}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-200">
                    <span className="text-gray-600">Email:</span>
                    <span className="font-medium break-all text-right max-w-[60%]">{displayEmail}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-200">
                    <span className="text-gray-600">Member Since:</span>
                    <span className="font-medium">{joinDate}</span>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-cyan-600 mb-4">Quick Actions</h3>
                <div className="space-y-3">
                  <button 
                    onClick={() => navigate('/inquiries')}
                    className="w-full text-left p-3 rounded-lg bg-blue-50 hover:bg-blue-100 transition-colors duration-300"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xl">📋</span>
                      <div>
                        <p className="font-medium text-gray-800">View My Inquiries</p>
                        <p className="text-sm text-gray-600">Check your order status</p>
                      </div>
                    </div>
                  </button>
                  
                  <button 
                    onClick={() => navigate('/cart')}
                    className="w-full text-left p-3 rounded-lg bg-cyan-50 hover:bg-cyan-100 transition-colors duration-300"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xl">🛒</span>
                      <div>
                        <p className="font-medium text-gray-800">Shopping Cart</p>
                        <p className="text-sm text-gray-600">Continue shopping</p>
                      </div>
                    </div>
                  </button>
                  
                  <button 
                    onClick={() => navigate('/blogs')}
                    className="w-full text-left p-3 rounded-lg bg-green-50 hover:bg-green-100 transition-colors duration-300"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xl">📝</span>
                      <div>
                        <p className="font-medium text-gray-800">Read Our Blog</p>
                        <p className="text-sm text-gray-600">Latest articles and tips</p>
                      </div>
                    </div>
                  </button>
                </div>
              </div>
            </div>
          </div>
          
          <div className="cartoon-card p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Account Statistics</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">0</div>
                <div className="text-sm text-gray-600">Total Inquiries</div>
              </div>
              <div className="text-center p-4 bg-cyan-50 rounded-lg">
                <div className="text-2xl font-bold text-cyan-600">0</div>
                <div className="text-sm text-gray-600">Pending Quotes</div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">0</div>
                <div className="text-sm text-gray-600">Completed Orders</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Profile 