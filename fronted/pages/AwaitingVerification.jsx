import React, { useState, useContext } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import axios from 'axios'
import { toast } from 'react-toastify'
import { ShopContext } from '../context/ShopContext'

const AwaitingVerification = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { backendUrl } = useContext(ShopContext)
  const email = location.state?.email || localStorage.getItem('userEmail') || ''
  const [resending, setResending] = useState(false)

  const handleResendEmail = async () => {
    try {
      setResending(true)
      const baseUrl = backendUrl || import.meta.env.VITE_BACKEND_URL || 'http://localhost:4000'
      const response = await axios.post(`${baseUrl}/api/user/resend-verification`, { email })
      
      if (response.data.success) {
        toast.success(response.data.message)
      } else {
        toast.error(response.data.message)
      }
    } catch (error) {
      console.error(error)
      toast.error('Failed to resend verification email')
    } finally {
      setResending(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center relative pt-28">
      {/* Background */}
      <div className="absolute inset-0 cartoon-bg"></div>
      <div className="absolute inset-0 cartoon-hearts opacity-10"></div>
      
      {/* Floating decorative elements */}
      <div className="absolute top-32 left-10 w-12 h-12 bg-blue-200 rounded-full gentle-float opacity-40"></div>
      <div className="absolute bottom-40 right-20 w-8 h-8 bg-cyan-200 rounded-full gentle-bounce opacity-40"></div>
      
      <div className="relative z-10 bg-white rounded-2xl shadow-2xl p-12 max-w-lg w-full mx-4">
        <div className="text-center">
          {/* Icon */}
          <div className="mb-6 text-7xl animate-bounce">📧</div>
          
          {/* Title */}
          <h1 className="text-3xl font-bold text-gray-800 mb-4">
            Verify Your Email
          </h1>
          
          {/* Message */}
          <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-6 mb-6">
            <p className="text-gray-700 mb-4">
              We've sent a verification link to:
            </p>
            <p className="text-blue-600 font-bold text-lg mb-4">
              {email}
            </p>
            <p className="text-sm text-gray-600">
              Please check your inbox (and spam folder) and click the verification link to activate your account.
            </p>
          </div>
          
          {/* Info boxes */}
          <div className="space-y-3 mb-6 text-left">
            <div className="flex items-start gap-3 bg-yellow-50 border border-yellow-200 rounded-lg p-3">
              <span className="text-xl">⏰</span>
              <p className="text-sm text-gray-700">
                The verification link will expire in <strong>24 hours</strong>
              </p>
            </div>
            
            <div className="flex items-start gap-3 bg-green-50 border border-green-200 rounded-lg p-3">
              <span className="text-xl">💡</span>
              <p className="text-sm text-gray-700">
                Don't see the email? Check your <strong>spam folder</strong> or click the button below to resend
              </p>
            </div>
          </div>
          
          {/* Actions */}
          <div className="flex flex-col gap-3">
            <button
              onClick={handleResendEmail}
              disabled={resending}
              className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-8 py-3 rounded-full font-bold hover:scale-105 transition-transform shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {resending ? 'Sending...' : '📨 Resend Verification Email'}
            </button>
            
            <button
              onClick={() => navigate('/login')}
              className="border-2 border-gray-300 text-gray-700 px-8 py-3 rounded-full font-bold hover:scale-105 transition-transform"
            >
              Back to Login
            </button>
            
            <button
              onClick={() => navigate('/')}
              className="text-gray-500 hover:text-gray-700 transition-colors text-sm"
            >
              Go to Home Page
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AwaitingVerification

