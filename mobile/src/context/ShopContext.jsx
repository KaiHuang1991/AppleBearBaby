import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import { Alert } from 'react-native'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { createHttpClient, createShopApi } from '@applebear/api'
import { resolveBackendUrl } from '../resolveBackendUrl'
import { normalizeCategoryNode, normalizeId, getProductCategoryIds, getProductCategoryPath } from '../utils/categories'

const TOKEN_KEY = 'abb_token'
const USER_ID_KEY = 'abb_userId'
const USER_NAME_KEY = 'abb_userName'
const USER_EMAIL_KEY = 'abb_userEmail'

export const ShopContext = createContext(null)

function sanitizeCartData(data) {
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
          if (/^\d+$/.test(trimmed)) return
          normalizedSize = trimmed
        }
      }
      validSizes[normalizedSize] = (validSizes[normalizedSize] || 0) + quantity
    })
    if (Object.keys(validSizes).length > 0) cleaned[productId] = validSizes
  })
  return cleaned
}

export function ShopProvider({ children }) {
  const currency = '$'
  const [token, setToken] = useState(null)
  const tokenRef = useRef(null)
  tokenRef.current = token

  const [user, setUser] = useState(null)
  const [cartItems, setCartItems] = useState({})
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [categoryTree, setCategoryTree] = useState([])
  const [categoryMap, setCategoryMap] = useState({})
  const [loadingCategories, setLoadingCategories] = useState(false)
  const [inquiryUnreadCount, setInquiryUnreadCount] = useState(0)

  const backendUrl = resolveBackendUrl()
  const httpClient = useMemo(
    () =>
      createHttpClient({
        baseURL: backendUrl,
        getToken: () => (typeof tokenRef.current === 'string' && tokenRef.current ? tokenRef.current : undefined),
        withCredentials: false,
      }),
    [backendUrl]
  )
  const api = useMemo(() => createShopApi(httpClient), [httpClient])

  const persistAuth = async (payload) => {
    const { authToken, userId, userName, userEmail } = payload
    if (authToken) await AsyncStorage.setItem(TOKEN_KEY, authToken)
    else await AsyncStorage.removeItem(TOKEN_KEY)
    if (userId) await AsyncStorage.setItem(USER_ID_KEY, String(userId))
    else await AsyncStorage.removeItem(USER_ID_KEY)
    if (userName) await AsyncStorage.setItem(USER_NAME_KEY, userName)
    else await AsyncStorage.removeItem(USER_NAME_KEY)
    if (userEmail) await AsyncStorage.setItem(USER_EMAIL_KEY, userEmail)
    else await AsyncStorage.removeItem(USER_EMAIL_KEY)
  }

  const loadStoredAuth = useCallback(async () => {
    const t = await AsyncStorage.getItem(TOKEN_KEY)
    setToken(t || null)
  }, [])

  const refreshUser = useCallback(async () => {
    if (!tokenRef.current) {
      setUser(null)
      return
    }
    try {
      const res = await api.userProfile()
      if (res.data?.success) setUser(res.data.user)
      else setUser(null)
    } catch {
      setUser(null)
    }
  }, [api])

  const refreshCart = useCallback(async () => {
    if (!tokenRef.current) {
      setCartItems({})
      return
    }
    try {
      const res = await api.cartGet()
      if (res.data?.success) setCartItems(sanitizeCartData(res.data.cartData))
    } catch {
      setCartItems({})
    }
  }, [api])

  const refreshInquiryUnreadCount = useCallback(async () => {
    if (!tokenRef.current) {
      setInquiryUnreadCount(0)
      return
    }
    try {
      const res = await api.inquiriesUserUnreadCount()
      if (res.data?.success && typeof res.data.count === 'number') setInquiryUnreadCount(res.data.count)
      else setInquiryUnreadCount(0)
    } catch {
      setInquiryUnreadCount(0)
    }
  }, [api])

  const fetchCategories = useCallback(async () => {
    setLoadingCategories(true)
    try {
      const res = await api.categoriesList()
      if (!res.data?.success) return
      const categoriesData = Array.isArray(res.data.categories) ? res.data.categories : []
      const normalizedCategories = categoriesData.map((cat) => {
        const id = normalizeId(cat._id)
        return { ...cat, _id: id, id, parent: cat.parent ? normalizeId(cat.parent) : null }
      })
      const map = {}
      normalizedCategories.forEach((cat) => {
        if (cat.id) map[cat.id] = cat
      })
      const treeData = Array.isArray(res.data.tree)
        ? res.data.tree.map((n) => normalizeCategoryNode(n)).filter(Boolean)
        : []
      setCategories(normalizedCategories)
      setCategoryMap(map)
      setCategoryTree(treeData)
    } catch (e) {
      console.warn('categories', e?.message)
    } finally {
      setLoadingCategories(false)
    }
  }, [api])

  const getProductsData = useCallback(async () => {
    try {
      const res = await api.productList({ all: true })
      if (res.data?.success) setProducts(res.data.products || [])
    } catch (e) {
      Alert.alert('Products', e?.response?.data?.message || e?.message || 'Failed to load')
    }
  }, [api])

  useEffect(() => {
    loadStoredAuth()
    fetchCategories()
    getProductsData()
  }, [loadStoredAuth, fetchCategories, getProductsData])

  useEffect(() => {
    if (token) {
      refreshCart()
      refreshUser()
      refreshInquiryUnreadCount()
    } else {
      setCartItems({})
      setUser(null)
      setInquiryUnreadCount(0)
    }
  }, [token, refreshCart, refreshUser, refreshInquiryUnreadCount])

  const login = async (email, password) => {
    const res = await api.userLogin({ email, password })
    if (!res.data?.success) {
      Alert.alert('Login', res.data?.message || 'Failed')
      return false
    }
    const t = res.data.token
    await persistAuth({
      authToken: t,
      userId: res.data.userId,
      userName: res.data.userName,
      userEmail: email,
    })
    setToken(t)
    return true
  }

  const register = async (name, email, password) => {
    const res = await api.userRegister({ name, email, password })
    if (!res.data?.success) {
      Alert.alert('Sign up', res.data?.message || 'Failed')
      return { ok: false }
    }
    const t = res.data.token
    await persistAuth({
      authToken: t,
      userId: res.data.userId,
      userName: res.data.userName,
      userEmail: email,
    })
    setToken(t)
    return { ok: true, needsVerification: !res.data.isVerified }
  }

  const logout = async () => {
    try {
      await api.userLogout()
    } catch {
      /* ignore */
    }
    await persistAuth({})
    setToken(null)
    setCartItems({})
    setUser(null)
    setInquiryUnreadCount(0)
  }

  const addToCart = async (itemId, size = 'Default', quantity = 1) => {
    if (!token) {
      Alert.alert('Cart', 'Please sign in to add items.')
      return false
    }
    const normalizedSize = size || 'Default'
    const qty = Math.max(1, parseInt(quantity, 10) || 1)
    try {
      const res = await api.cartAdd({ itemId, size: normalizedSize, quantity: qty })
      if (res.data?.success) {
        setCartItems(sanitizeCartData(res.data.newCartData))
        return true
      }
      Alert.alert('Cart', res.data?.message || 'Failed')
    } catch (e) {
      Alert.alert('Cart', e?.response?.data?.message || e?.message || 'Failed')
    }
    return false
  }

  const updateQuantity = async (itemId, size, quantity) => {
    if (!token) return
    try {
      const res = await api.cartUpdate({ itemId, size, quantity })
      if (res.data?.success) setCartItems(sanitizeCartData(res.data.newCartData))
    } catch (e) {
      Alert.alert('Cart', e?.response?.data?.message || e?.message || 'Failed')
    }
  }

  const getCartCount = () => {
    let n = 0
    for (const pid of Object.keys(cartItems)) {
      for (const sz of Object.keys(cartItems[pid])) {
        if (cartItems[pid][sz] > 0) n += 1
      }
    }
    return n
  }

  const getCartAmount = () => {
    let total = 0
    for (const pid of Object.keys(cartItems)) {
      const p = products.find((x) => x._id === pid)
      if (!p) continue
      for (const sz of Object.keys(cartItems[pid])) {
        const q = cartItems[pid][sz]
        if (q > 0) total += p.price * q
      }
    }
    return total
  }

  const submitCartInquiry = async ({ name, email, phone, message }) => {
    if (!token) {
      Alert.alert('Inquiry', 'Please sign in.')
      return { ok: false }
    }
    const lines = []
    for (const pid of Object.keys(cartItems)) {
      for (const sz of Object.keys(cartItems[pid])) {
        const q = cartItems[pid][sz]
        if (q > 0) lines.push({ _id: pid, size: sz, quantity: q })
      }
    }
    try {
      const res = await api.inquiriesCreate({
        userId: user?._id || null,
        userEmail: email,
        userName: name,
        userPhone: phone,
        products: lines,
        message: message || `Inquiry from ${name} (${email})`,
      })
      if (!res.data?.success) {
        Alert.alert('Inquiry', res.data?.message || 'Failed')
        return { ok: false }
      }
      setCartItems({})
      try {
        await api.cartClear()
      } catch {
        /* ignore */
      }
      return { ok: true, data: res.data }
    } catch (e) {
      Alert.alert('Inquiry', e?.response?.data?.message || e?.message || 'Failed')
      return { ok: false }
    }
  }

  const getInquiryThread = async (inquiryId) => {
    try {
      const res = await api.inquiriesUserThread(inquiryId)
      return res.data
    } catch {
      return null
    }
  }

  const postInquiryMessage = async (inquiryId, text) => {
    try {
      const res = await api.inquiriesUserThreadMessage(inquiryId, { text })
      return res.data
    } catch (e) {
      Alert.alert('Message', e?.response?.data?.message || e?.message || 'Failed')
      return null
    }
  }

  const deleteInquiry = async (inquiryId) => {
    try {
      const res = await api.inquiriesUserDelete(inquiryId)
      return !!res.data?.success
    } catch {
      return false
    }
  }

  const pathForProduct = (product) => getProductCategoryPath(product, categoryMap)
  const idsForProduct = (product) => getProductCategoryIds(product, categoryMap)

  const value = {
    currency,
    backendUrl,
    api,
    token,
    user,
    products,
    categories,
    categoryTree,
    categoryMap,
    loadingCategories,
    cartItems,
    inquiryUnreadCount,
    login,
    register,
    logout,
    refreshUser,
    refreshCart,
    refreshInquiryUnreadCount,
    fetchCategories,
    getProductsData,
    addToCart,
    updateQuantity,
    getCartCount,
    getCartAmount,
    submitCartInquiry,
    getInquiryThread,
    postInquiryMessage,
    deleteInquiry,
    pathForProduct,
    idsForProduct,
  }

  return <ShopContext.Provider value={value}>{children}</ShopContext.Provider>
}

export function useShop() {
  const ctx = useContext(ShopContext)
  if (!ctx) throw new Error('useShop must be used within ShopProvider')
  return ctx
}
