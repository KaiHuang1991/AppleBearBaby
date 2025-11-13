import { createContext, useCallback, useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import axios from 'axios'
import { GoogleMap, LoadScript } from "@react-google-maps/api";

// Configure axios defaults to send cookies with requests
axios.defaults.withCredentials = true;

export const ShopContext = createContext();

const ShopContextProvider = (props) => {
  const currency = '$'
  const delivery_fee = 10
  const [search, setSearch] = useState('')
  const [showSearch, setShowSearch] = useState(false)
  const sanitizeCartData = (data) => {
    const cleaned = {}
    if (!data || typeof data !== 'object') return cleaned

    Object.entries(data).forEach(([productId, sizes]) => {
      if (!sizes || typeof sizes !== 'object') return

      const validSizes = {}
      Object.entries(sizes).forEach(([sizeKey, qty]) => {
        const quantity = Number(qty)
        if (!Number.isFinite(quantity) || quantity <= 0) return

        let normalizedSize = 'Default'
        if (sizeKey && typeof sizeKey === 'string') {
          const trimmed = sizeKey.trim()
          if (trimmed && trimmed.toLowerCase() !== 'default' && trimmed.toLowerCase() !== 'undefined') {
            if (/^\d+$/.test(trimmed)) {
              return
            }
            normalizedSize = trimmed
          }
        }

        validSizes[normalizedSize] = (validSizes[normalizedSize] || 0) + quantity
      })

      if (Object.keys(validSizes).length > 0) {
        cleaned[productId] = validSizes
      }
    })

    return cleaned
  }

  const cacheUserInfo = (info) => {
    if (!info) {
      localStorage.removeItem('userName')
      localStorage.removeItem('userEmail')
      localStorage.removeItem('userAvatar')
      localStorage.removeItem('joinDate')
      return
    }

    const { name, email, avatar, createdAt, joinDate } = info
    if (name) {
      localStorage.setItem('userName', name)
    } else {
      localStorage.removeItem('userName')
    }

    if (email) {
      localStorage.setItem('userEmail', email)
    } else {
      localStorage.removeItem('userEmail')
    }

    if (avatar) {
      localStorage.setItem('userAvatar', avatar)
    } else {
      localStorage.removeItem('userAvatar')
    }

    const formattedJoinDate = joinDate
      ? joinDate
      : createdAt
        ? new Date(createdAt).toLocaleDateString('en-US')
        : null

    if (formattedJoinDate) {
      localStorage.setItem('joinDate', formattedJoinDate)
    } else {
      localStorage.removeItem('joinDate')
    }
  }

  const getCachedUser = () => {
    const name = localStorage.getItem('userName')
    const email = localStorage.getItem('userEmail')
    const avatar = localStorage.getItem('userAvatar')
    const joinDate = localStorage.getItem('joinDate')

    if (!name && !email && !avatar) return null

    return {
      name: name || '',
      email: email || '',
      avatar: avatar || '',
      createdAt: joinDate || null
    }
  }

  const [cartItems, setCartItems] = useState({})
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [categoryTree, setCategoryTree] = useState([])
  const [categoryMap, setCategoryMap] = useState({})
  const [loadingCategories, setLoadingCategories] = useState(false)
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [token, setToken] = useState(false)
  const [user, setUser] = useState(getCachedUser)
  const navigate = useNavigate()
  const backendUrl = import.meta.env.VITE_BACKEND_URL
  const openCart = () => setIsCartOpen(true)
  const closeCart = () => setIsCartOpen(false)
  const addToCart = async (itemId, size = 'Default', quantity = 1) => {
    if (!token) {
      toast.warn('Please sign in to add items to your cart.')
      return
    }

    const normalizedSize = size || 'Default'
    const qty = Math.max(1, parseInt(quantity, 10) || 1)

    try {
      // Token is now sent via cookie, but keep header as fallback
      const headers = token ? { token } : {}
      const response = await axios.post(
        backendUrl + '/api/cart/add',
        { itemId, size: normalizedSize, quantity: qty },
        { headers }
      )
      if (response.data.success) {
        setCartItems(sanitizeCartData(response.data.newCartData))
      }
    } catch (error) {
      console.log(error)
      toast.error(error?.response?.data?.message || error.message || 'Failed to update cart')
    }
  }

  const updateInquiryEmailStatus = async (inquiryId, status) => {
    if (!inquiryId) return
    try {
      await axios.put(`${backendUrl}/api/inquiries/email-status/${inquiryId}`, { emailStatus: status })
    } catch (error) {
      console.error('Failed to update inquiry email status:', error)
    }
  }

  const sendInquiryEmail = async (formData) => {
    try {
      const email = formData.get('email')
      const name = formData.get('name')
      const number = formData.get('number')
      const cartItems = JSON.parse(formData.get('products'))
      const message = formData.get('message') || ''
      const attachmentsJson = formData.get('attachments') || '[]'
      let attachments = []
      try { attachments = JSON.parse(attachmentsJson) } catch { attachments = [] }
      // Get userId from formData or use authenticated user ID
      const userId = formData.get('userId') || (user?._id ? user._id : null)

      // First, create the inquiry in the database
      // Token is now sent via cookie, but keep header as fallback
      const headers = token ? { token } : {}
      const inquiryData = {
        userId: userId || null,
        userEmail: email,
        userName: name,
        userPhone: number,
        products: cartItems,
        message: message || `Inquiry from ${name} (${email})`,
        emailStatus: 'pending'
      }

      const inquiryResponse = await axios.post(backendUrl + '/api/inquiries/create', inquiryData, { headers })
      
      if (inquiryResponse.data.success) {
        // Then send the email
        const emailData = {
          email,
          name,
          number,
          cartItems: cartItems.map(item => {
            const product = products.find(p => p._id === item._id)
            return {
              name: product ? product.name : 'Unknown Product',
              price: product ? product.price : 0,
              size: item.size,
              quantity: item.quantity,
              image: product && product.image ? product.image[0] : ''
            }
          }),
          currency: '$',
          total: cartItems.reduce((sum, item) => {
            const product = products.find(p => p._id === item._id)
            return sum + (product ? product.price * item.quantity : 0)
          }, 0),
          message,
          attachments: attachments.map(a => ({
            filename: a.name,
            content: (a.base64 || '').split(',')[1] || '',
            encoding: 'base64',
            contentType: a.type || 'application/octet-stream'
          }))
        }

        const emailResponse = await axios.post(backendUrl + '/api/cart/send-inquiry', emailData)
        console.log('Email response:', emailResponse.data)
        
        if (emailResponse.data.message === '邮件发送成功') {
          await updateInquiryEmailStatus(inquiryResponse.data.inquiry._id, 'sent')
          
          // Clear cart after successful inquiry and email
          setCartItems({})
          try {
            // Token is now sent via cookie, but keep header as fallback
            const headers = token ? { token } : {}
            await axios.post(backendUrl + '/api/cart/clear', {}, { headers })
          } catch (clearError) {
            console.warn('Failed to clear remote cart after inquiry:', clearError?.response?.data || clearError.message)
          }
          return inquiryResponse.data
        } else {
          await updateInquiryEmailStatus(inquiryResponse.data.inquiry._id, 'failed')
          
          console.error('Email response:', emailResponse.data)
          throw new Error(emailResponse.data.error || emailResponse.data.details || 'Email sending failed')
        }
      } else {
        throw new Error(inquiryResponse.data.message || 'Failed to create inquiry')
      }
    } catch (error) {
      console.error('Inquiry creation failed:', error)
      if (error.response) {
        throw new Error(error.response.data.error || error.response.data.details || error.response.data.message || 'Request failed')
      }
      throw error
    }
  }

  const normalizeId = (value) => {
    if (!value) return null
    if (typeof value === 'string') return value
    if (typeof value === 'number') return String(value)
    if (typeof value === 'object') {
      if (value._id) return String(value._id)
      if (typeof value.toString === 'function') return value.toString()
    }
    return null
  }

  const normalizeCategoryNode = (node) => {
    if (!node) return null
    const id = normalizeId(node._id || node.id)
    return {
      ...node,
      _id: id,
      id,
      parent: node.parent ? normalizeId(node.parent) : null,
      children: Array.isArray(node.children)
        ? node.children
            .map(child => normalizeCategoryNode(child))
            .filter(Boolean)
        : [],
    }
  }

  const fetchCategories = useCallback(async () => {
    setLoadingCategories(true)
    try {
      const response = await axios.get(`${backendUrl}/api/categories`)
      if (response.data.success) {
        const categoriesData = Array.isArray(response.data.categories) ? response.data.categories : []
        const normalizedCategories = categoriesData.map(cat => {
          const id = normalizeId(cat._id)
          return {
            ...cat,
            _id: id,
            id,
            parent: cat.parent ? normalizeId(cat.parent) : null,
          }
        })

        const map = {}
        normalizedCategories.forEach(cat => {
          if (cat.id) {
            map[cat.id] = cat
          }
        })

        const treeData = Array.isArray(response.data.tree)
          ? response.data.tree
              .map(node => normalizeCategoryNode(node))
              .filter(Boolean)
          : []

        setCategories(normalizedCategories)
        setCategoryMap(map)
        setCategoryTree(treeData)
      }
    } catch (error) {
      console.error('Failed to load categories:', error)
      toast.error(error.response?.data?.message || error.message || 'Failed to load categories')
    } finally {
      setLoadingCategories(false)
    }
  }, [backendUrl])

  useEffect(() => {
    fetchCategories()
  }, [fetchCategories])

  const getCategoryPathByIds = (categoryId, subCategoryId, thirdCategoryId) => {
    const deepestId = normalizeId(thirdCategoryId) || normalizeId(subCategoryId) || normalizeId(categoryId)
    if (!deepestId) return []

    const path = []
    const visited = new Set()

    let currentId = deepestId
    while (currentId && !visited.has(currentId)) {
      const node = categoryMap[currentId]
      if (!node) break

      path.push({
        id: currentId,
        name: node.name,
        parent: node.parent || null,
      })

      visited.add(currentId)
      currentId = node.parent || null
    }

    return path.reverse()
  }

  const getProductCategoryPath = (product) => {
    if (!product) return []
    const path = getCategoryPathByIds(product.categoryId, product.subCategoryId, product.thirdCategoryId)
    if (path.length) return path

    const fallback = []
    const addFallback = (idValue, nameValue) => {
      if (!nameValue) return
      fallback.push({
        id: normalizeId(idValue),
        name: nameValue,
        parent: null,
      })
    }

    addFallback(product.categoryId, product.category)
    addFallback(product.subCategoryId, product.subCategory)
    addFallback(product.thirdCategoryId, product.thirdCategory)

    return fallback
  }

  const getProductCategoryIds = (product) => {
    if (!product) return []
    const path = getCategoryPathByIds(product.categoryId, product.subCategoryId, product.thirdCategoryId)
    if (path.length) {
      return path.map(node => node.id).filter(Boolean)
    }

    const ids = []
    const pushId = (value) => {
      const id = normalizeId(value)
      if (id && !ids.includes(id)) {
        ids.push(id)
      }
    }

    pushId(product.categoryId)
    pushId(product.subCategoryId)
    pushId(product.thirdCategoryId)

    return ids
  }

  const getGoogleMap = () => {
    // 定义地图容器样式
    const containerStyle = {
      width: '80%',
      height: '400px',
    };

    // 定义地图的初始中心点和缩放级别
    const center = {
      lat: -34.397,
      lng: 150.644,
    };
    return (
      // LoadScript 加载 Google Maps JavaScript API
      <LoadScript googleMapsApiKey="AIzaSyCI4KCRxc10tpJLV2ojoygQe9BTtvI7PIQ">
        <GoogleMap
          mapContainerStyle={containerStyle}
          center={center}
          zoom={8}
        >
          {/* 这里可以添加其他地图元素，如标记、折线等 */}
        </GoogleMap>
      </LoadScript>
    );

  }
   //发送评论
  const submitComment=async (formData,userId,productId)=>{
    try {
      // Remove userId from FormData (it will be extracted from token in backend)
      formData.delete('userId')
      
      for (const [key, value] of formData.entries()) {
        console.log(`FormData ${key}:`, value instanceof File ? value.name : value);
      }
      const commentResponse=await axios.post(backendUrl + '/api/reviews/add', 
      formData,{headers:{token}})
      if(commentResponse.data.success){
        const review_id = commentResponse.data.review._id
      const response=await axios.post(backendUrl + '/api/product/comment', {
        review_id,productId
      },{headers:{token}})
      console.log(response.data)
      
      // Show success message
      toast.success('Comment submitted successfully! Refreshing comments...')
      
      // Return success to allow the component to refresh comments
      return { success: true, review: commentResponse.data.review }
      } else {
        toast.error(commentResponse.data.message || 'Failed to submit comment')
        return { success: false }
      }
    } catch (error) {
      console.log(error);
      toast.error(error.response?.data?.message || error.message || 'Failed to submit comment')
      return { success: false }
    }
  }
  const getCartCount = () => {
    let totalCount = 0
    for (const items in cartItems) {
      for (const item in cartItems[items]) {
        try {
          if (cartItems[items][item] > 0) {
            totalCount += 1  // 只计数种类，不累加数量
          }

        } catch (error) {
          console.log(error)
        }
      }
    }
    return totalCount
  }
  function getCartAmount() {
    let totalAmount = 0
    //console.log(products)
    for (const items in cartItems) {
      let itemInfo = products.find((product) => (product._id === items))
      //console.log(itemInfo)
      for (const item in cartItems[items]) {
        try {
          if (cartItems[items][item] > 0) {
            totalAmount += itemInfo.price * cartItems[items][item]
            //console.log(totalAmount)
          }
        } catch (error) {

        }
      }
    }

    return totalAmount
  }
  const getProductsData = async () => {
    try {
      const response = await axios.get(backendUrl + "/api/product/list", {
        params: { all: true }
      })
      if (response.data.success) {
        setProducts(response.data.products)
        localStorage.setItem("products",JSON.stringify(response.data.products))
      } else {
        toast.error(response.data.messege)
      }
    } catch (error) {
      console.log(error);
      toast.error(error.messege)
    }
  }
  useEffect(() => {
    getProductsData()
  }, [])
  
  const getUserInfo = async (token) => {
    try {
      // Token is now sent via cookie, but keep header as fallback
      const headers = token ? { token } : {}
      const response = await axios.get(`${backendUrl}/api/user/profile`, {
        headers
      })
      if (response.data.success) {
        setUser(response.data.user)
        cacheUserInfo(response.data.user)
        return response // Return response for useEffect
      }
      return response
    } catch (error) {
      console.error('Error fetching user info:', error)
      setUser(null)
      cacheUserInfo(null)
      throw error // Throw error so useEffect can catch it
    }
  }

  const updateUserAvatar = async (file) => {
    if (!token) {
      toast.warn('Please sign in to update your avatar.')
      return null
    }

    if (!file) {
      toast.error('Please select an image first.')
      return null
    }

    const formData = new FormData()
    formData.append('avatar', file)

    try {
      // Token is now sent via cookie, but keep header as fallback
      const headers = {
        'Content-Type': 'multipart/form-data'
      }
      if (token) headers.token = token
      const response = await axios.put(`${backendUrl}/api/user/avatar`, formData, {
        headers
      })

      if (response.data.success) {
        const avatarUrl = response.data.avatar || ''
        setUser(prev => ({ ...(prev || {}), avatar: avatarUrl }))
        cacheUserInfo({ ...(user || {}), avatar: avatarUrl })
        toast.success('Avatar updated successfully!')
        return avatarUrl
      }

      toast.error(response.data.message || 'Failed to update avatar')
    } catch (error) {
      console.error('Avatar update failed:', error)
      toast.error(error?.response?.data?.message || error.message || 'Failed to update avatar')
    }

    return null
  }

  // Check authentication status on mount and when token changes
  useEffect(() => {
    // Try to get user info (cookies will be sent automatically)
    if (token) {
      getUserCart(token)
      getUserInfo(token)
    } else {
      // If no token in state, check if user is logged in via cookies by trying to get profile
      getUserInfo(null).then((response) => {
        // If profile fetch succeeds, user is authenticated via cookie
        // Set token state to true to indicate user is logged in
        if (response && response.data && response.data.success) {
          setToken(true) // Set to true to indicate authenticated state
        }
      }).catch(() => {
        // If profile fetch fails, user is not authenticated
        setUser(null)
        setCartItems({})
        cacheUserInfo(null)
      })
    }
  }, [token])

  const getUserCart = async (token) => {
    try {
      // Token is now sent via cookie, but keep header as fallback
      const headers = token ? { token } : {}
      const response = await axios.post(backendUrl + '/api/cart/get', {}, { headers })
      if (response.data.success) {
        // console.log(response.data.cartData)
        const cleaned = sanitizeCartData(response.data.cartData)
        setCartItems(cleaned)
      }
    } catch (error) {
      console.log(error);
      toast.error(error.messege)
    }
  }
  const updateQuantity = async (itemId, size, quantity) => {
    if (!token) {
      toast.warn('Please sign in to update your cart.')
      return
    }

    try {
      // Token is now sent via cookie, but keep header as fallback
      const headers = token ? { token } : {}
      const response = await axios.post(backendUrl + '/api/cart/update', { itemId, size, quantity }, { headers })
      if (response.data.success) {
        setCartItems(sanitizeCartData(response.data.newCartData))
      }
    } catch (error) {
      console.log(error);
      toast.error(error?.response?.data?.message || error.message || 'Failed to update cart')
    }
  }

  // Blog comment functions
  const getBlogComments = async (blogId) => {
    try {
      const response = await axios.get(`${backendUrl}/api/comments/blog/${blogId}`)
      if (response.data.success) {
        return response.data.comments
      }
      return []
    } catch (error) {
      console.error('Error fetching blog comments:', error)
      return []
    }
  }

  const addBlogComment = async (blogId, content, userName) => {
    try {
      // Token is now sent via cookie, but keep header as fallback
      const headers = token ? { token } : {}
      const response = await axios.post(`${backendUrl}/api/comments/add`, {
        blogId,
        content,
        userName
      }, { headers })
      
      if (response.data.success) {
        toast.success('Comment added successfully!')
        return response.data.comment
      }
      return null
    } catch (error) {
      console.error('Error adding blog comment:', error)
      toast.error(error.response?.data?.message || 'Failed to add comment')
      return null
    }
  }

  const updateBlogComment = async (commentId, content) => {
    try {
      // Token is now sent via cookie, but keep header as fallback
      const headers = token ? { token } : {}
      const response = await axios.put(`${backendUrl}/api/comments/update/${commentId}`, {
        content
      }, { headers })
      
      if (response.data.success) {
        toast.success('Comment updated successfully!')
        return response.data.comment
      }
      return null
    } catch (error) {
      console.error('Error updating blog comment:', error)
      toast.error(error.response?.data?.message || 'Failed to update comment')
      return null
    }
  }

  const deleteBlogComment = async (commentId) => {
    try {
      // Token is now sent via cookie, but keep header as fallback
      const headers = token ? { token } : {}
      const response = await axios.delete(`${backendUrl}/api/comments/delete/${commentId}`, {
        headers
      })
      
      if (response.data.success) {
        toast.success('Comment deleted successfully!')
        return true
      }
      return false
    } catch (error) {
      console.error('Error deleting blog comment:', error)
      toast.error(error.response?.data?.message || 'Failed to delete comment')
      return false
    }
  }

  const resendInquiry = async (inquiryId, payload) => {
    if (!token) {
      toast.warn('Please sign in to manage your inquiries.')
      return null
    }

    try {
      // Token is now sent via cookie, but keep header as fallback
      const headers = token ? { token } : {}
      const response = await axios.post(
        `${backendUrl}/api/inquiries/user/${inquiryId}/resend`,
        payload,
        { headers }
      )

      if (response.data.success) {
        if (response.data.emailResult && response.data.emailResult.success === false) {
          toast.warn(response.data.message || 'Inquiry updated but email delivery failed.')
        } else {
          toast.success(response.data.message || 'Inquiry resent successfully!')
        }
        return response.data
      }

      toast.error(response.data.message || 'Failed to resend inquiry')
      return null
    } catch (error) {
      console.error('Error resending inquiry:', error)
      toast.error(error?.response?.data?.message || error.message || 'Failed to resend inquiry')
      return null
    }
  }

  // Logout function - clears cookie and local state
  const logout = async () => {
    try {
      await axios.post(`${backendUrl}/api/user/logout`)
      setToken(false)
      setUser(null)
      setCartItems({})
      cacheUserInfo(null)
      // Remove token from localStorage if it exists (for backward compatibility)
      localStorage.removeItem('token')
      localStorage.removeItem('userId')
      toast.success('Logged out successfully')
      navigate('/')
    } catch (error) {
      console.error('Error logging out:', error)
      // Even if logout API fails, clear local state
      setToken(false)
      setUser(null)
      setCartItems({})
      cacheUserInfo(null)
      localStorage.removeItem('token')
      localStorage.removeItem('userId')
      toast.success('Logged out successfully')
      navigate('/')
    }
  }

  const value = {
    products, currency, delivery_fee, search, setSearch, showSearch, setShowSearch, cartItems, addToCart, getCartCount, updateQuantity, getCartAmount,
    navigate, getProductsData, backendUrl, token, setToken, getGoogleMap, sendInquiryEmail, submitComment, setCartItems,
    getBlogComments, addBlogComment, updateBlogComment, deleteBlogComment, user, getUserInfo,
    isCartOpen, openCart, closeCart,
    categories, categoryTree, loadingCategories, fetchCategories,
    getCategoryPathByIds, getProductCategoryPath, getProductCategoryIds,
    updateUserAvatar,
    resendInquiry,
    logout
  }
  return (
    <ShopContext.Provider value={value}>
      {props.children}
    </ShopContext.Provider>
  )
}

export default ShopContextProvider