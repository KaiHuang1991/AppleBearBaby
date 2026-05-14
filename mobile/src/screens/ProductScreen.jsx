import React, { useEffect, useMemo, useState } from 'react'
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
} from 'react-native'
import { useRoute } from '@react-navigation/native'
import { useShop } from '../context/ShopContext'

export default function ProductScreen() {
  const route = useRoute()
  const { productId } = route.params || {}
  const { products, currency, addToCart, token, pathForProduct, api } = useShop()
  const [reviews, setReviews] = useState([])
  const [loadingRev, setLoadingRev] = useState(true)

  const product = useMemo(() => products.find((p) => p._id === productId), [products, productId])
  const [size, setSize] = useState('')
  const [qty, setQty] = useState('1')

  useEffect(() => {
    if (product?.sizes?.length) setSize(product.sizes[0])
  }, [product])

  useEffect(() => {
    if (!productId) return
    let cancelled = false
    ;(async () => {
      setLoadingRev(true)
      try {
        const res = await api.productListComment({ productId })
        if (cancelled || !res.data?.success) return
        const arr = Array.isArray(res.data.reviews) ? res.data.reviews : Object.values(res.data.reviews || {})
        setReviews(arr)
      } catch {
        setReviews([])
      } finally {
        if (!cancelled) setLoadingRev(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [productId, api])

  if (!product) {
    return (
      <View style={styles.center}>
        <Text>Product not found. Open Shop after products load.</Text>
      </View>
    )
  }

  const img = Array.isArray(product.image) ? product.image[0] : null
  const path = pathForProduct(product)

  const onAdd = async () => {
    if (!token) {
      Alert.alert('Sign in', 'Please sign in to add to cart.')
      return
    }
    const q = Math.max(1, parseInt(qty, 10) || 1)
    const ok = await addToCart(product._id, size || 'Default', q)
    if (ok) Alert.alert('Cart', 'Added to cart')
  }

  return (
    <ScrollView style={styles.root} contentContainerStyle={{ paddingBottom: 32 }}>
      {img ? <Image source={{ uri: img }} style={styles.hero} resizeMode="cover" /> : null}
      <View style={styles.pad}>
        {path.length ? (
          <Text style={styles.crumb} numberOfLines={1}>
            {path.map((n) => n.name).join(' › ')}
          </Text>
        ) : null}
        <Text style={styles.title}>{product.name}</Text>
        {product.modelNumber && String(product.modelNumber).trim() ? (
          <Text style={styles.model}>
            型号 <Text style={styles.modelStrong}>{String(product.modelNumber).trim()}</Text>
          </Text>
        ) : null}
        <Text style={styles.price}>
          {currency}
          {product.price}
        </Text>
        <Text style={styles.label}>Size</Text>
        <View style={styles.sizes}>
          {(product.sizes || ['Default']).map((s) => (
            <TouchableOpacity
              key={String(s)}
              style={[styles.sizeChip, size === s && styles.sizeChipOn]}
              onPress={() => setSize(s)}
            >
              <Text style={[styles.sizeText, size === s && styles.sizeTextOn]}>{s}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <Text style={styles.label}>Quantity</Text>
        <TextInput
          style={styles.qty}
          keyboardType="number-pad"
          value={qty}
          onChangeText={setQty}
        />
        <TouchableOpacity style={styles.addBtn} onPress={onAdd}>
          <Text style={styles.addBtnText}>Add to cart</Text>
        </TouchableOpacity>
        <Text style={styles.h2}>Description</Text>
        <Text style={styles.desc}>{String(product.description || '').replace(/<[^>]+>/g, ' ')}</Text>
        <Text style={styles.h2}>Reviews</Text>
        {loadingRev ? (
          <ActivityIndicator />
        ) : reviews.length ? (
          reviews.map((r) => (
            <View key={String(r._id)} style={styles.rev}>
              <Text style={styles.revRating}>★ {r.rating}</Text>
              <Text style={styles.revText}>{r.review}</Text>
            </View>
          ))
        ) : (
          <Text style={styles.muted}>No reviews yet.</Text>
        )}
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#fff' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  hero: { width: '100%', height: 260, backgroundColor: '#e2e8f0' },
  pad: { padding: 16 },
  crumb: { color: '#64748b', fontSize: 12, marginBottom: 8 },
  title: { fontSize: 22, fontWeight: '800', color: '#0f172a' },
  model: { marginTop: 6, fontSize: 14, color: '#64748b' },
  modelStrong: { fontWeight: '700', color: '#334155' },
  price: { fontSize: 20, fontWeight: '700', color: '#2563eb', marginTop: 8 },
  label: { marginTop: 16, fontWeight: '700', color: '#334155' },
  sizes: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 8 },
  sizeChip: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    backgroundColor: '#fff',
  },
  sizeChipOn: { borderColor: '#2563eb', backgroundColor: '#eff6ff' },
  sizeText: { color: '#334155', fontWeight: '600' },
  sizeTextOn: { color: '#1d4ed8' },
  qty: {
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 10,
    padding: 12,
    fontSize: 18,
    maxWidth: 100,
  },
  addBtn: {
    marginTop: 20,
    backgroundColor: '#2563eb',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  addBtnText: { color: '#fff', fontWeight: '800', fontSize: 16 },
  h2: { marginTop: 24, fontSize: 18, fontWeight: '800', color: '#0f172a' },
  desc: { marginTop: 8, color: '#475569', lineHeight: 22 },
  rev: { marginTop: 12, padding: 12, backgroundColor: '#f8fafc', borderRadius: 10 },
  revRating: { fontWeight: '700', color: '#ca8a04' },
  revText: { marginTop: 4, color: '#334155' },
  muted: { color: '#94a3b8', marginTop: 8 },
})
