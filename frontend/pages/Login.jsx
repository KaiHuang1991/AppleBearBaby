import React, { useContext, useEffect, useCallback, useRef } from 'react'
import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { ShopContext } from '../context/ShopContext'
import { toast } from 'react-toastify'
import SocialLogin from '../componets/SocialLogin'

const Login = () => {
  const [currentState,setCurrentState] =useState('Login')
  const {token, navigate, api, completeLogin} = useContext(ShopContext)
  const [name,setName] =useState('')
  const [password,setPassword] =useState('')
  const [email,setEmail] =useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [resendingEmail, setResendingEmail] = useState(false)
  const [showForgotPassword, setShowForgotPassword] = useState(false)
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState('')
  const [sendingResetEmail, setSendingResetEmail] = useState(false)
  const [searchParams] = useSearchParams()
  const oauthHandledRef = useRef(false)

  const handleOAuthSuccess = useCallback((data) => {
    completeLogin(data, { redirectTo: '/' })
    toast.success('Signed in successfully')
  }, [completeLogin])
  
  const handleResendVerification = async () => {
    try {
      setResendingEmail(true)
      const response = await api.userResendVerification({ email })
      
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
      const response = await api.userForgotPassword({ 
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
      //console.log('login')
      if(currentState === "Sign Up"){
        const response = await api.userRegister({name,email,password})
        if(response.data.success){
          // Don't set token or save user info - user needs to verify email first
          setName('')
          setEmail('')
          setPassword('')
          
          // Show success message
          toast.success(response.data.message || "Registration successful! Please check your email to verify your account.")
          
          // Navigate to verification page
          navigate('/awaiting-verification', { state: { email } })
        }
        else{ 
        toast.error(response.data.message)
        }
      }else{
        const response = await api.userLogin({email,password})
        if(response.data.success){
          completeLogin({ ...response.data, userEmail: email }, { redirectTo: '/' })
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
  // Already logged in — leave login page
  useEffect(() => {
    if (token) {
      navigate('/', { replace: true })
    }
  }, [token, navigate])

  // After server-side Google OAuth redirect (session cookie set on backend)
  useEffect(() => {
    const oauth = searchParams.get('oauth')
    const oauthError = searchParams.get('oauth_error')
    if (!oauth && !oauthError) return

    if (oauthError) {
      toast.error(decodeURIComponent(oauthError))
      navigate('/login', { replace: true })
      return
    }

    if (oauth !== 'google_success' || oauthHandledRef.current) return
    oauthHandledRef.current = true

    api
      .userProfile()
      .then((res) => {
        if (res.data?.success && res.data.user) {
          const u = res.data.user
          completeLogin(
            {
              userId: u._id,
              userName: u.name,
              userEmail: u.email,
              avatar: u.avatar || '',
              joinDate: u.createdAt
            },
            { redirectTo: '/' }
          )
          toast.success('Signed in successfully')
        } else {
          oauthHandledRef.current = false
          toast.error('Login succeeded but profile could not be loaded')
        }
      })
      .catch(() => {
        oauthHandledRef.current = false
        toast.error('Login succeeded but session could not be verified')
      })
  }, [searchParams, api, completeLogin, navigate])
  return (
    <div className='relative pt-28'>
      <form  onSubmit={onSubmitHandler} className='flex flex-col items-center w-[%90] sm:max-w-96 m-auto mt-14 gap-4 text-gray-800'>
        <div className='inline-flex items-center gap-2 mb-2 mt-10 '>
          <p className='prata-regular text-3xl'>{currentState}</p>
          <hr className='border-none h-[1.5px] w-8 bg-gray-800'/>
        </div>
        
        {currentState === 'Login'?'':<input onChange={(e)=>{setName(e.target.value)}} value={name} type="text" className='w-full px-3 py-2 border border-gray-800'placeholder='Name' required />}
        <input onChange={(e)=>{setEmail(e.target.value)}} value={email} type="email" className='w-full px-3 py-2 border border-gray-800'placeholder='Email' required />
        <div className='w-full relative'>
          <input 
            onChange={(e)=>{setPassword(e.target.value)}} 
            value={password} 
            type={showPassword ? "text" : "password"} 
            className='w-full px-3 py-2 pr-10 border border-gray-800' 
            placeholder='Password'
            required  
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className='absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-600 hover:text-gray-800 focus:outline-none'
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            )}
          </button>
        </div>
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

      {currentState === 'Login' && (
        <SocialLogin api={api} onAuthSuccess={handleOAuthSuccess} />
      )}
      
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
