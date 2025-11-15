import React, { useEffect, useState, useContext } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import axios from 'axios'
import { ShopContext } from '../context/ShopContext'

const VerifyEmail = () => {
  const { token: verifyToken } = useParams()
  const navigate = useNavigate()
  const { backendUrl } = useContext(ShopContext)
  const [status, setStatus] = useState('verifying') // 'verifying', 'success', 'error'
  const [message, setMessage] = useState('')

  useEffect(() => {
    verifyEmail()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [verifyToken]) // backendUrl is stable, no need to include

  const verifyEmail = async () => {
    try {
      const baseUrl = backendUrl || import.meta.env.VITE_BACKEND_URL || 'http://localhost:4000'
      const response = await axios.get(`${baseUrl}/api/user/verify-email/${verifyToken}`)
      
      if (response.data.success) {
        setStatus('success')
        setMessage(response.data.message)
        
        // 3秒后跳转到登录页
        setTimeout(() => {
          navigate('/login')
        }, 3000)
      } else {
        setStatus('error')
        setMessage(response.data.message)
      }
    } catch (error) {
      console.error('Error verifying email:', error)
      setStatus('error')
      setMessage('Failed to verify email. Please try again.')
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
      
      <div className="relative z-10 bg-white rounded-2xl shadow-2xl p-12 max-w-md w-full mx-4">
        {status === 'verifying' && (
          <div className="text-center">
            <div className="mb-6">
              <div className="animate-spin rounded-full h-20 w-20 border-b-4 border-blue-600 mx-auto"></div>
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Verifying Your Email...</h2>
            <p className="text-gray-600">Please wait while we verify your email address.</p>
          </div>
        )}

        {status === 'success' && (
          <div className="text-center">
            <div className="mb-6 text-6xl animate-bounce">✅</div>
            <h2 className="text-2xl font-bold text-green-600 mb-4">Email Verified!</h2>
            <p className="text-gray-700 mb-6">{message}</p>
            <p className="text-sm text-gray-500">Redirecting to login page in 3 seconds...</p>
            <button
              onClick={() => navigate('/login')}
              className="mt-6 bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-8 py-3 rounded-full font-bold hover:scale-105 transition-transform shadow-lg"
            >
              Login Now
            </button>
          </div>
        )}

        {status === 'error' && (
          <div className="text-center">
            <div className="mb-6 text-6xl">❌</div>
            <h2 className="text-2xl font-bold text-red-600 mb-4">Verification Failed</h2>
            <p className="text-gray-700 mb-6">{message}</p>
            <div className="flex flex-col gap-3">
              <button
                onClick={() => navigate('/login')}
                className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-8 py-3 rounded-full font-bold hover:scale-105 transition-transform shadow-lg"
              >
                Go to Login
              </button>
              <button
                onClick={() => navigate('/')}
                className="border-2 border-gray-300 text-gray-700 px-8 py-3 rounded-full font-bold hover:scale-105 transition-transform"
              >
                Back to Home
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default VerifyEmail

