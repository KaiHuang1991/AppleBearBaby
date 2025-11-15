import React, { useContext, useEffect } from 'react'
import { useState } from 'react'
import { ShopContext } from '../context/ShopContext'
import axios from 'axios'
import { toast } from 'react-toastify'

const Login = () => {
  const [currentState,setCurrentState] =useState('Login')
  const {token,setToken,navigate,backendUrl} =useContext(ShopContext)
  const [name,setName] =useState('')
  const [password,setPassword] =useState('')
  const [email,setEmail] =useState('')
  const [showVerificationNotice, setShowVerificationNotice] = useState(false)
  const [resendingEmail, setResendingEmail] = useState(false)
  const [showForgotPassword, setShowForgotPassword] = useState(false)
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState('')
  const [sendingResetEmail, setSendingResetEmail] = useState(false)
  
  const handleResendVerification = async () => {
    try {
      setResendingEmail(true)
      const response = await axios.post(backendUrl+'/api/user/resend-verification', { email })
      
      if (response.data.success) {
        toast.success(response.data.message)
      } else {
        toast.error(response.data.message)
      }
    } catch (error) {
      console.error(error)
      toast.error('Failed to resend verification email')
    } finally {
      setResendingEmail(false)
    }
  }
  
  const handleForgotPassword = async (e) => {
    e.preventDefault()
    
    if (!forgotPasswordEmail) {
      toast.error('Please enter your email')
      return
    }
    
    try {
      setSendingResetEmail(true)
      const response = await axios.post(backendUrl+'/api/user/forgot-password', { 
        email: forgotPasswordEmail 
      })
      
      if (response.data.success) {
        toast.success(response.data.message)
        setShowForgotPassword(false)
        setForgotPasswordEmail('')
      } else {
        toast.error(response.data.message)
      }
    } catch (error) {
      console.error(error)
      toast.error('Failed to send reset email')
    } finally {
      setSendingResetEmail(false)
    }
  }
  
  const onSubmitHandler= async (event)=>{
    event.preventDefault()
    try {
      //console.log(backendUrl)
      if(currentState === "Sign Up"){
        const response = await axios.post(backendUrl+'/api/user/register',{name,email,password})
        if(response.data.success){
          setToken(response.data.token)
          setName('')
          setEmail('')
          setPassword('')
          // Token is now stored in HttpOnly cookie, but keep user info in localStorage
          localStorage.setItem("userId",response.data.userId)
          localStorage.setItem("userName",response.data.userName)
          localStorage.setItem("userEmail",email)
          // Don't store token in localStorage anymore - it's in HttpOnly cookie
          localStorage.setItem("isVerified", response.data.isVerified || false)
          if (response.data.avatar) {
            localStorage.setItem('userAvatar', response.data.avatar)
          } else {
            localStorage.removeItem('userAvatar')
          }
          if (response.data.joinDate) {
            localStorage.setItem('joinDate', response.data.joinDate)
          } else {
            localStorage.removeItem('joinDate')
          }
          
          // Show verification notice
          if (!response.data.isVerified) {
            setShowVerificationNotice(true)
            toast.success(response.data.message)
          }
        }
        else{ 
        toast.error(response.data.message)
        }
      }else{
        const response = await axios.post(backendUrl+'/api/user/login',{email,password})
        if(response.data.success){
          setToken(response.data.token)
          // Token is now stored in HttpOnly cookie, but keep user info in localStorage
          localStorage.setItem("userId",response.data.userId)
          localStorage.setItem("userName",response.data.userName)
          localStorage.setItem("userEmail",email)
          // Don't store token in localStorage anymore - it's in HttpOnly cookie
          localStorage.setItem("isVerified", true)
          if (response.data.avatar) {
            localStorage.setItem('userAvatar', response.data.avatar)
          } else {
            localStorage.removeItem('userAvatar')
          }
          if (response.data.joinDate) {
            localStorage.setItem('joinDate', response.data.joinDate)
          } else {
            localStorage.removeItem('joinDate')
          }
        }else{
          // Check if user needs email verification
          if (response.data.isVerified === false) {
            toast.warning(response.data.message)
            localStorage.setItem("userEmail", email)
            navigate('/awaiting-verification', { state: { email } })
          } else {
            toast.error(response.data.message)
          }
        }
      }
    }
    catch (error) {
      console.log(error)
      toast.error(error.message)
    }
  }
  useEffect(()=>{
    if(token){
      navigate('/')
      window.location.reload()
    }
  },[token])
  return (
    <div className='relative pt-28'>
      <form  onSubmit={onSubmitHandler} className='flex flex-col items-center w-[%90] sm:max-w-96 m-auto mt-14 gap-4 text-gray-800'>
        <div className='inline-flex items-center gap-2 mb-2 mt-10 '>
          <p className='prata-regular text-3xl'>{currentState}</p>
          <hr className='border-none h-[1.5px] w-8 bg-gray-800'/>
        </div>
        
        {/* Verification Notice */}
        {showVerificationNotice && (
          <div className='w-full bg-blue-50 border-2 border-blue-200 rounded-lg p-4 mb-4'>
            <div className='flex items-start gap-3'>
              <span className='text-2xl'>📧</span>
              <div className='flex-1'>
                <p className='font-semibold text-blue-800 mb-2'>Verify Your Email</p>
                <p className='text-sm text-gray-700 mb-3'>
                  We've sent a verification link to <strong>{email}</strong>. 
                  Please check your inbox and click the link to verify your account.
                </p>
                <button
                  type='button'
                  onClick={handleResendVerification}
                  disabled={resendingEmail}
                  className='text-sm text-blue-600 hover:text-blue-800 font-medium underline disabled:opacity-50'
                >
                  {resendingEmail ? 'Sending...' : 'Resend Verification Email'}
                </button>
              </div>
            </div>
          </div>
        )}
        
        {currentState === 'Login'?'':<input onChange={(e)=>{setName(e.target.value)}} value={name} type="text" className='w-full px-3 py-2 border border-gray-800'placeholder='Name' required />}
        <input onChange={(e)=>{setEmail(e.target.value)}} value={email} type="email" className='w-full px-3 py-2 border border-gray-800'placeholder='Email' required />
        <input onChange={(e)=>{setPassword(e.target.value)}} value={password} type="password" className='w-full px-3 py-2 border border-gray-800'placeholder='Password'required  />
        <div className='w-full flex justify-between text-sm mt-[-8px]'>
          <p 
            className='cursor-pointer text-blue-600 hover:text-blue-800 hover:underline'
            onClick={() => setShowForgotPassword(true)}
          >
            Forgot your password?
          </p>
          {currentState ==='Login'?<p className='cursor-pointer' onClick={()=>{setCurrentState('Sign Up')}}>Create Account</p>:
                                  <p className='cursor-pointer' onClick={()=>{setCurrentState('Login')}}>Login Here</p>}
        </div>
        <button className='bg-black text-white font-light px-8 py-2 mt-4'>{currentState==="Login"?'Sign In':'Sign Up'}</button>
      </form>
      
      {/* Forgot Password Modal */}
      {showForgotPassword && (
        <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50' onClick={() => setShowForgotPassword(false)}>
          <div className='bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4' onClick={(e) => e.stopPropagation()}>
            <div className='text-center mb-6'>
              <div className='text-5xl mb-4'>🔑</div>
              <h2 className='text-2xl font-bold text-gray-800 mb-2'>Forgot Password?</h2>
              <p className='text-gray-600 text-sm'>Enter your email to receive a password reset link</p>
            </div>
            
            <form onSubmit={handleForgotPassword} className='space-y-4'>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>Email Address</label>
                <input
                  type="email"
                  value={forgotPasswordEmail}
                  onChange={(e) => setForgotPasswordEmail(e.target.value)}
                  className='w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                  placeholder='Enter your email'
                  required
                />
              </div>
              
              <div className='flex gap-3'>
                <button
                  type='button'
                  onClick={() => {
                    setShowForgotPassword(false)
                    setForgotPasswordEmail('')
                  }}
                  className='flex-1 border-2 border-gray-300 text-gray-700 px-6 py-3 rounded-lg font-medium hover:bg-gray-50 transition-colors'
                >
                  Cancel
                </button>
                <button
                  type='submit'
                  disabled={sendingResetEmail}
                  className='flex-1 bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-6 py-3 rounded-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed'
                >
                  {sendingResetEmail ? 'Sending...' : 'Send Reset Link'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default Login
