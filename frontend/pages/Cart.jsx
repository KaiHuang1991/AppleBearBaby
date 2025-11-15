import React, { useContext, useEffect, useState } from 'react'
import { ShopContext } from '../context/ShopContext'
import Title from '../componets/Title'
import { assets } from '../src/assets/assets'
import { Link } from 'react-router-dom'
import { toast } from 'react-toastify'

const Cart = () => {
  const { cartItems, currency, updateQuantity, sendInquiryEmail, token } = useContext(ShopContext)
  const [cartData, setCartData] = useState([])
  const [email,setEmail] = useState('')
  const [name,setName] = useState('')
  const [number,setNumber] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [attachments, setAttachments] = useState([]) // {name,type,base64}
  const products = JSON.parse(localStorage.getItem("products"))
  //let newCartData = JSON.parse(localStorage.getItem("cartItems"))
  console.log(products)
  useEffect(() => {
    // Build cart view directly from context state to avoid localStorage timing issues
    const tempData = []
    for (const items in cartItems) {
      for (const item in cartItems[items]) {
        if (cartItems[items][item] !== 0) {
          tempData.push({
            _id: items,
            size: item,
            quantity: cartItems[items][item]
          })
        }

      }
    }
    setCartData(tempData)
    
    // Pre-fill form with user data if logged in
    if (token) {
      const userName = localStorage.getItem('userName')
      const userEmail = localStorage.getItem('userEmail')
      if (userName) setName(userName)
      if (userEmail) setEmail(userEmail)
    }
  }, [cartItems, token])

  return (
    <div className='border-t pt-28 bg-gradient-to-br from-blue-50 to-cyan-50 min-h-screen'>
      <div className='text-2xl mb-3'>
        <Title text1={'WHOLESALE'} text2={'INQUIRY'} />
      </div>
      <div>
        {
          cartData.length > 0 ? (
            cartData.map((item, index) => {
              const productData = products && Array.isArray(products) ? products.find((product) => product._id === item._id) : null
              if (!productData) return null
              return (
                <div key={index} className='py-4 border-t border-b text-gray-700 grid grid-cols-[4fr_0.5fr_0.5fr] sm:grid-cols-[4fr_2fr_0.5fr] items-center gap-4'>
                  <div className='flex items-start gap-6'>
                    <Link to={`/product/${productData._id}`} target='_blank'><img className='w-16 sm:w-20' src={productData.image[0]} alt="" /></Link>
                    <div>
                      <p className='text-xs sm:text-lg font-medium '>{productData.name}</p>
                      <div className='flex items-center gap-5 mt-2'>
                        <p>{currency}{productData.price}</p>
                        <p className='px-2 sm:px-3 sm:py-1 border bg-slate-50'>{item.size}</p>
                      </div>
                    </div>
                  </div>
                  <input onChange={(e) => {
                    const value = e.target.value
                    if (value === '' || value === '0' || Number(value) <= 0) {
                      updateQuantity(item._id, item.size, 0)
                    } else {
                      updateQuantity(item._id, item.size, Number(value))
                    }
                  }} className='border max-w-10 sm:max-w-20 px-1 sm:px-2 py-1' type="number" min={0} value={item.quantity} />
                  <img onClick={() => updateQuantity(item._id, item.size, 0)} className='w-4 mr-4 sm:w-5 cursor-pointer ' src={assets.bin_icon} alt="" />
                </div>
              )
            })
          ) : (
            <div className='py-8 text-center border-t border-b'>
              <p className='text-gray-500 mb-2'>No products selected</p>
              <p className='text-sm text-gray-400'>You can still send a general inquiry using the form below</p>
            </div>
          )
        }
      </div>
      <div className='flex my-20 lg:justify-center md:justify-center sm:justify-center'>
        <div className='w-full lg:w-[80%] grid grid-cols-1 lg:grid-cols-2 gap-8'>
          {/* Left: Inquiry editor */}
          <div className='bg-white rounded-lg shadow-md p-6'>
            <p className='text-lg font-semibold mb-3'>
              Inquiry Message <span className='text-red-500'>*</span>
            </p>
            <textarea
              className='w-full h-48 p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm'
              placeholder='Describe your request, customization, quantities, delivery terms, etc.'
              value={message}
              onChange={(e)=>setMessage(e.target.value)}
              required
            />
            <div className='mt-4'>
              <label className='block text-sm font-medium text-gray-700 mb-1'>Images / Attachments</label>
              <div className='flex items-start gap-3'>
                <input
                  id='inquiry-attachments-input'
                  type='file'
                  multiple
                  accept='image/*,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document'
                  onChange={(e)=>{
                    const files = Array.from(e.target.files || [])
                    if(files.length===0) return
                    const readers = files.map(file=> new Promise(resolve=>{
                      const fr = new FileReader()
                      fr.onload = ()=> resolve({ name:file.name, type:file.type, base64: fr.result })
                      fr.readAsDataURL(file)
                    }))
                    Promise.all(readers).then(res=> setAttachments(prev=>[...prev, ...res]))
                  }}
                  className='hidden'
                />
                <label htmlFor='inquiry-attachments-input' className='inline-flex items-center justify-center px-4 py-2 rounded-md bg-blue-600 text-white text-sm cursor-pointer hover:bg-blue-700'>
                  Choose Files
                </label>
                <span className='text-sm text-gray-500 mt-1'>
                  {attachments.length>0 ? `${attachments.length} file(s) selected` : 'No file selected'}
                </span>
              </div>
              {attachments.length>0 ? (
                <div className='mt-3 grid grid-cols-3 gap-3'>
                  {attachments.map((att, idx) => (
                    <div key={idx} className='border rounded-md p-2 text-xs flex flex-col items-center'>
                      {att.type.startsWith("image/") ? (
                        <img src={att.base64} alt={att.name} className='w-full h-20 object-cover rounded' />
                      ) : (
                        <div className='w-full h-20 flex items-center justify-center bg-gray-50 rounded'>File</div>
                      )}
                      <p className='truncate w-full mt-1'>{att.name}</p>
                      <button type='button' className='text-red-500 mt-1' onClick={() => setAttachments(attachments.filter((_, i) => i !== idx))}>Remove</button>
                    </div>
                  ))}
                </div>
              ) : null}
            </div>
          </div>
          {/* Right: Contact form */}
          <div className='w-full'>
          <div className='w-full text-end'>
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              
              // Validate message - must not be blank
              if (!message || message.trim() === '') {
                toast.error('Please enter an inquiry message')
                return
              }
              
              setLoading(true)
              try {
                const formData = new FormData()
                formData.append("email", email)
                formData.append("name", name)
                formData.append("number", number)
                formData.append("products", JSON.stringify(cartData))
                formData.append("message", message)
                formData.append("attachments", JSON.stringify(attachments))
                formData.append("userId", localStorage.getItem('userId') || '')
                
                await sendInquiryEmail(formData)
                toast.success('Inquiry sent successfully! We will contact you soon.')
                
                // Clear form
                setEmail('')
                setName('')
                setNumber('')
                setMessage('')
                setAttachments([])
              } catch (error) {
                toast.error('Failed to send inquiry. Please try again.')
              } finally {
                setLoading(false)
              }
            }}
            className='space-y-4 bg-white p-6 rounded-lg shadow-md'
          >
            <div>
              <label htmlFor="email" className='block text-sm font-medium text-gray-700'>
                Email <span className='text-red-500'>*</span>
              </label>
              <input
                type="email"
                id="email"
                name="email"
                required
                className='mt-1 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                placeholder="Enter your email"
                value={email}
                onChange={e=>{setEmail(e.target.value)}}
              />
            </div>
            <div>
              <label htmlFor="name" className='block text-sm font-medium text-gray-700'>
                Name (Optional)
              </label>
              <input
                type="text"
                id="name"
                name="name"
                className='mt-1 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                placeholder="Enter your name"
                value={name}
                onChange={e=>setName(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="number" className='block text-sm font-medium text-gray-700'>
                Phone Number (Optional)
              </label>
              <input
                type="tel"
                id="number"
                name="number"
                className='mt-1 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                placeholder="Enter your phone number"
                value={number}
                onChange={e=>setNumber(e.target.value)}
              />
            </div>
            <div className='text-end'>
              <button
                type="submit" 
                disabled={loading}
                className='bg-black text-white text-sm px-8 py-3 rounded-md hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black disabled:opacity-50 disabled:cursor-not-allowed'
              >
                {loading ? 'Sending...' : 'Request Quote'}
              </button>
            </div>
          </form>
          </div>
        </div>
      </div>
    </div>
    </div>
  )
}

export default Cart
