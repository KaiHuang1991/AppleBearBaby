import React, { useCallback, useEffect, useState } from 'react'
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from 'react-native'
import { useNavigation, useFocusEffect } from '@react-navigation/native'
import { useShop } from '../context/ShopContext'

export default function InquiriesScreen() {
  const navigation = useNavigation()
  const { token, api, refreshInquiryUnreadCount, deleteInquiry } = useShop()
  const [list, setList] = useState([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const load = useCallback(async () => {
    if (!token) {
      setList([])
      setLoading(false)
      return
    }
    try {
      const res = await api.inquiriesUserList({})
      if (res.data?.success) setList(res.data.inquiries || [])
    } catch {
      setList([])
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [token, api])

  useFocusEffect(
    useCallback(() => {
      setLoading(true)
      load()
      refreshInquiryUnreadCount()
    }, [load, refreshInquiryUnreadCount])
  )

  if (!token) {
    return (
      <View style={styles.center}>
        <Text style={styles.muted}>Sign in to see inquiries.</Text>
        <TouchableOpacity style={styles.btn} onPress={() => navigation.navigate('Login')}>
          <Text style={styles.btnText}>Sign in</Text>
        </TouchableOpacity>
      </View>
    )
  }

  return (
    <FlatList
      data={list}
      keyExtractor={(item) => String(item._id)}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load() }} />}
      contentContainerStyle={{ padding: 12, flexGrow: 1 }}
      ListEmptyComponent={
        loading ? (
          <Text style={styles.muted}>Loading…</Text>
        ) : (
          <Text style={styles.muted}>No inquiries yet.</Text>
        )
      }
      renderItem={({ item }) => (
        <TouchableOpacity
          style={styles.card}
          onPress={() => navigation.navigate('InquiryThread', { id: String(item._id) })}
        >
          <Text style={styles.id}>#{String(item._id).slice(-6)}</Text>
          <Text style={styles.status}>{item.status || item.displayStatus || '—'}</Text>
          <Text numberOfLines={2} style={styles.preview}>
            {item.message || item.userMessage || '—'}
          </Text>
          <TouchableOpacity
            style={styles.del}
            onPress={() => {
              Alert.alert('Delete', 'Remove this inquiry?', [
                { text: 'Cancel', style: 'cancel' },
                {
                  text: 'Delete',
                  style: 'destructive',
                  onPress: async () => {
                    const ok = await deleteInquiry(String(item._id))
                    if (ok) load()
                  },
                },
              ])
            }}
          >
            <Text style={styles.delText}>Delete</Text>
          </TouchableOpacity>
        </TouchableOpacity>
      )}
    />
  )
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  muted: { color: '#64748b', textAlign: 'center', marginTop: 8 },
  btn: { marginTop: 16, backgroundColor: '#2563eb', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 10 },
  btnText: { color: '#fff', fontWeight: '700' },
  card: {
    backgroundColor: '#f8fafc',
    padding: 14,
    borderRadius: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  id: { fontWeight: '800', color: '#0f172a' },
  status: { marginTop: 4, color: '#2563eb', fontWeight: '600', fontSize: 13 },
  preview: { marginTop: 8, color: '#475569' },
  del: { marginTop: 10, alignSelf: 'flex-start' },
  delText: { color: '#dc2626', fontWeight: '700' },
})
