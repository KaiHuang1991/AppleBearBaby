import React, { useEffect, useState } from 'react'
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native'
import { useRoute } from '@react-navigation/native'
import { useShop } from '../context/ShopContext'

function stripHtml(html) {
  if (!html || typeof html !== 'string') return ''
  return html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
}

export default function BlogDetailScreen() {
  const route = useRoute()
  const { id } = route.params || {}
  const { api } = useShop()
  const [blog, setBlog] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let c = false
    ;(async () => {
      try {
        const res = await api.blogsGetById(id)
        if (!c && res.data?.success) setBlog(res.data.blog)
      } finally {
        if (!c) setLoading(false)
      }
    })()
    return () => {
      c = true
    }
  }, [id, api])

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator />
      </View>
    )
  }
  if (!blog) {
    return (
      <View style={styles.center}>
        <Text>Article not found.</Text>
      </View>
    )
  }

  return (
    <ScrollView style={styles.root} contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
      <Text style={styles.title}>{blog.title}</Text>
      <Text style={styles.body}>{stripHtml(blog.content)}</Text>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#fff' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 22, fontWeight: '800', color: '#0f172a', marginBottom: 12 },
  body: { fontSize: 16, lineHeight: 24, color: '#334155' },
})
