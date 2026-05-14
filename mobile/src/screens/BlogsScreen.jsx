import React, { useEffect, useState } from 'react'
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native'
import { useNavigation } from '@react-navigation/native'
import { useShop } from '../context/ShopContext'

export default function BlogsScreen() {
  const navigation = useNavigation()
  const { api } = useShop()
  const [blogs, setBlogs] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let c = false
    ;(async () => {
      try {
        const res = await api.blogsAll({})
        if (!c && res.data?.success) setBlogs(res.data.blogs || [])
      } finally {
        if (!c) setLoading(false)
      }
    })()
    return () => {
      c = true
    }
  }, [api])

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator />
      </View>
    )
  }

  return (
    <FlatList
      data={blogs}
      keyExtractor={(b) => String(b._id)}
      contentContainerStyle={{ padding: 12 }}
      ListEmptyComponent={<Text style={styles.muted}>No articles.</Text>}
      renderItem={({ item }) => (
        <TouchableOpacity
          style={styles.row}
          onPress={() => navigation.navigate('BlogDetail', { id: String(item._id) })}
        >
          <Text style={styles.title}>{item.title}</Text>
          <Text style={styles.chev}>›</Text>
        </TouchableOpacity>
      )}
    />
  )
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  muted: { textAlign: 'center', color: '#94a3b8', marginTop: 24 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: '#e2e8f0',
  },
  title: { flex: 1, fontSize: 16, fontWeight: '600', color: '#0f172a' },
  chev: { fontSize: 20, color: '#94a3b8' },
})
