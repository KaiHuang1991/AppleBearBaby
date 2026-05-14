import React, { useCallback, useEffect, useState } from 'react'
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native'
import { useNavigation, useRoute } from '@react-navigation/native'
import { useShop } from '../context/ShopContext'

export default function InquiryThreadScreen() {
  const navigation = useNavigation()
  const route = useRoute()
  const { id } = route.params || {}
  const { token, getInquiryThread, postInquiryMessage, refreshInquiryUnreadCount } = useShop()
  const [inquiry, setInquiry] = useState(null)
  const [loading, setLoading] = useState(true)
  const [text, setText] = useState('')
  const [sending, setSending] = useState(false)

  const load = useCallback(async () => {
    if (!id || !token) return
    setLoading(true)
    const data = await getInquiryThread(id)
    if (data?.success) {
      setInquiry(data.inquiry)
      refreshInquiryUnreadCount()
    } else {
      navigation.goBack()
    }
    setLoading(false)
  }, [id, token, getInquiryThread, navigation, refreshInquiryUnreadCount])

  useEffect(() => {
    if (!token) {
      navigation.navigate('Login')
      return
    }
    load()
  }, [token, load, navigation])

  const send = async () => {
    const t = text.trim()
    if (!t || sending) return
    setSending(true)
    const data = await postInquiryMessage(id, t)
    if (data?.success) {
      setInquiry(data.inquiry)
      setText('')
      refreshInquiryUnreadCount()
    }
    setSending(false)
  }

  if (!token || loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator />
      </View>
    )
  }
  if (!inquiry) return null

  const messages = inquiry.messages || []

  return (
    <KeyboardAvoidingView style={styles.root} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <FlatList
        data={messages}
        keyExtractor={(m, i) => String(m._id || i)}
        contentContainerStyle={{ padding: 12 }}
        ListHeaderComponent={
          <View style={styles.header}>
            <Text style={styles.h1}>Inquiry #{String(inquiry._id).slice(-6)}</Text>
            <Text style={styles.meta}>Status: {inquiry.customerThreadStatus || inquiry.status || '—'}</Text>
          </View>
        }
        renderItem={({ item }) => (
          <View
            style={[
              styles.bubble,
              item.author === 'admin' || item.author === 'store' ? styles.bubbleAdmin : styles.bubbleUser,
            ]}
          >
            <Text style={styles.author}>{item.author === 'admin' ? 'Store' : 'You'}</Text>
            <Text style={styles.msg}>{item.text || item.body || item.content || ''}</Text>
          </View>
        )}
      />
      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          placeholder="Reply…"
          value={text}
          onChangeText={setText}
        />
        <TouchableOpacity style={styles.send} onPress={send} disabled={sending}>
          {sending ? <ActivityIndicator color="#fff" /> : <Text style={styles.sendText}>Send</Text>}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#fff' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { marginBottom: 12 },
  h1: { fontSize: 18, fontWeight: '800', color: '#0f172a' },
  meta: { color: '#64748b', marginTop: 4 },
  bubble: { padding: 12, borderRadius: 12, marginBottom: 8, maxWidth: '92%' },
  bubbleUser: { alignSelf: 'flex-end', backgroundColor: '#dbeafe' },
  bubbleAdmin: { alignSelf: 'flex-start', backgroundColor: '#f1f5f9' },
  author: { fontSize: 11, fontWeight: '700', color: '#64748b', marginBottom: 4 },
  msg: { fontSize: 15, color: '#0f172a' },
  inputRow: { flexDirection: 'row', padding: 10, borderTopWidth: 1, borderColor: '#e2e8f0', gap: 8 },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
  },
  send: {
    backgroundColor: '#2563eb',
    paddingHorizontal: 18,
    justifyContent: 'center',
    borderRadius: 10,
  },
  sendText: { color: '#fff', fontWeight: '800' },
})
