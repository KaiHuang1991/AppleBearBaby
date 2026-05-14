import React, { useEffect, useState } from 'react'
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  FlatList,
  Dimensions,
  ActivityIndicator,
} from 'react-native'
import { useNavigation } from '@react-navigation/native'
import { useShop } from '../context/ShopContext'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

const { width: WIN_W } = Dimensions.get('window')
const COL_W = (WIN_W - 16 * 2 - 12) / 2

function ProductThumb({ item, onPress }) {
  const img = Array.isArray(item.image) && item.image[0] ? item.image[0] : null
  return (
    <TouchableOpacity style={styles.thumbWrap} onPress={() => onPress(item._id)}>
      {img ? <Image source={{ uri: img }} style={styles.thumbImg} resizeMode="cover" /> : null}
      <Text numberOfLines={2} style={styles.thumbName}>
        {item.name}
      </Text>
      <Text style={styles.thumbPrice}>${item.price}</Text>
    </TouchableOpacity>
  )
}

export default function HomeScreen() {
  const navigation = useNavigation()
  const insets = useSafeAreaInsets()
  const { products, api } = useShop()
  const [heroSlides, setHeroSlides] = useState([])
  const [heroLoading, setHeroLoading] = useState(true)
  const [blogs, setBlogs] = useState([])

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const res = await api.heroList()
        if (cancelled || !res.data?.success) return
        const slides = (res.data.config?.slides || [])
          .filter((s) => s.isActive !== false)
          .sort((a, b) => (a.order || 0) - (b.order || 0))
        setHeroSlides(slides)
      } catch {
        setHeroSlides([])
      } finally {
        if (!cancelled) setHeroLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [api])

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const res = await api.blogsAll({ page: 1, limit: 5 })
        if (cancelled || !res.data?.success) return
        const list = Array.isArray(res.data.blogs) ? res.data.blogs.slice(0, 3) : []
        setBlogs(list)
      } catch {
        setBlogs([])
      }
    })()
    return () => {
      cancelled = true
    }
  }, [api])

  const latest = products.slice(0, 10)
  const hot = products.filter((p) => p.bestseller).slice(0, 8)

  const openProduct = (id) => navigation.navigate('Product', { productId: id })

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={{ paddingBottom: 24 + insets.bottom }}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.heroSection}>
        {heroLoading ? (
          <ActivityIndicator style={{ marginVertical: 40 }} />
        ) : heroSlides.length ? (
          <FlatList
            horizontal
            pagingEnabled
            data={heroSlides}
            keyExtractor={(item, i) => String(item._id || i)}
            showsHorizontalScrollIndicator={false}
            renderItem={({ item }) =>
              item.imageUrl ? (
                <Image
                  source={{ uri: item.imageUrl }}
                  style={{ width: WIN_W, height: 200 }}
                  resizeMode="cover"
                />
              ) : (
                <View style={{ width: WIN_W, height: 120, justifyContent: 'center', alignItems: 'center' }}>
                  <Text style={styles.muted}>Slide</Text>
                </View>
              )
            }
          />
        ) : (
          <View style={styles.heroFallback}>
            <Text style={styles.heroTitle}>AppleBearBaby</Text>
            <Text style={styles.muted}>Wholesale baby feeding & care</Text>
          </View>
        )}
      </View>

      <View style={styles.block}>
        <Text style={styles.h2}>Latest collection</Text>
        <Text style={styles.sub}>
          Premium baby products in bulk — retailers, daycare, hospitals. Competitive wholesale pricing.
        </Text>
        <View style={styles.grid}>
          {latest.map((p) => (
            <ProductThumb key={p._id} item={p} onPress={openProduct} />
          ))}
        </View>
        <TouchableOpacity style={styles.btn} onPress={() => navigation.navigate('ShopTab')}>
          <Text style={styles.btnText}>View all products</Text>
        </TouchableOpacity>
      </View>

      {hot.length ? (
        <View style={styles.block}>
          <Text style={styles.h2}>Hot sale</Text>
          <View style={styles.grid}>
            {hot.map((p) => (
              <ProductThumb key={p._id} item={p} onPress={openProduct} />
            ))}
          </View>
        </View>
      ) : null}

      {blogs.length ? (
        <View style={styles.block}>
          <Text style={styles.h2}>From the blog</Text>
          {blogs.map((b) => (
            <TouchableOpacity
              key={String(b._id)}
              style={styles.blogRow}
              onPress={() => navigation.navigate('BlogDetail', { id: String(b._id) })}
            >
              <Text style={styles.blogTitle} numberOfLines={2}>
                {b.title}
              </Text>
              <Text style={styles.chev}>›</Text>
            </TouchableOpacity>
          ))}
          <TouchableOpacity style={styles.linkBtn} onPress={() => navigation.navigate('Blogs')}>
            <Text style={styles.linkBtnText}>All articles</Text>
          </TouchableOpacity>
        </View>
      ) : null}
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: '#fff' },
  heroSection: { backgroundColor: '#e0f2fe' },
  heroFallback: { paddingVertical: 36, paddingHorizontal: 20, alignItems: 'center' },
  heroTitle: { fontSize: 22, fontWeight: '800', color: '#0f172a' },
  muted: { color: '#64748b', fontSize: 13, marginTop: 6, textAlign: 'center' },
  block: { paddingHorizontal: 16, paddingTop: 20 },
  h2: { fontSize: 20, fontWeight: '700', color: '#0f172a' },
  sub: { color: '#475569', marginTop: 8, lineHeight: 20, fontSize: 14 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 12, gap: 12 },
  thumbWrap: {
    width: COL_W,
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  thumbImg: { width: '100%', height: COL_W * 0.9, borderRadius: 8, backgroundColor: '#e2e8f0' },
  thumbName: { marginTop: 6, fontSize: 13, fontWeight: '600', color: '#1e293b', minHeight: 36 },
  thumbPrice: { marginTop: 4, fontSize: 14, color: '#2563eb', fontWeight: '700' },
  btn: { marginTop: 16, backgroundColor: '#2563eb', paddingVertical: 14, borderRadius: 12, alignItems: 'center' },
  btnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  blogRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: '#e2e8f0',
  },
  blogTitle: { flex: 1, fontSize: 15, color: '#0f172a', fontWeight: '600' },
  chev: { fontSize: 22, color: '#94a3b8' },
  linkBtn: { marginTop: 8 },
  linkBtnText: { color: '#2563eb', fontWeight: '600' },
})
