import React, { useEffect, useMemo, useState } from 'react'
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
} from 'react-native'
import { useShop } from '../context/ShopContext'

export default function CartScreen() {
  const { cartItems, products, currency, updateQuantity, submitCartInquiry, token, user } = useShop()
  const [lines, setLines] = useState([])
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [message, setMessage] = useState('')
  const [sending, setSending] = useState(false)

  useEffect(() => {
    const temp = []
    for (const pid of Object.keys(cartItems)) {
      for (const sz of Object.keys(cartItems[pid])) {
        const q = cartItems[pid][sz]
        if (q > 0) temp.push({ _id: pid, size: sz, quantity: q })
      }
    }
    setLines(temp)
  }, [cartItems])

  useEffect(() => {
    if (user?.name) setName(user.name)
    if (user?.email) setEmail(user.email)
  }, [user])

  const productMap = useMemo(() => {
    const m = {}
    for (const p of products) m[p._id] = p
    return m
  }, [products])

  const submit = async () => {
    if (!email.trim() || !name.trim()) {
      Alert.alert('Form', 'Please enter name and email.')
      return
    }
    setSending(true)
    const res = await submitCartInquiry({
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim(),
      message: message.trim(),
    })
    setSending(false)
    if (res.ok) Alert.alert('Sent', 'Your inquiry was submitted.')
  }

  return (
    <ScrollView style={styles.root} contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
      <Text style={styles.h1}>Wholesale inquiry</Text>
      <Text style={styles.sub}>Same flow as web Cart: line items + inquiry form.</Text>

      {!token ? (
        <Text style={styles.warn}>Sign in to build a cart and submit an inquiry.</Text>
      ) : null}

      {lines.length === 0 ? (
        <Text style={styles.empty}>No products in cart. Add items from a product page.</Text>
      ) : (
        lines.map((line) => {
          const p = productMap[line._id]
          if (!p) return null
          const img = Array.isArray(p.image) && p.image[0] ? p.image[0] : null
          return (
            <View key={`${line._id}-${line.size}`} style={styles.line}>
              {img ? <Image source={{ uri: img }} style={styles.thumb} /> : <View style={styles.thumb} />}
              <View style={styles.lineBody}>
                <Text style={styles.pname} numberOfLines={2}>
                  {p.name}
                </Text>
                <Text style={styles.pmeta}>
                  {currency}
                  {p.price} · {line.size}
                </Text>
                <View style={styles.qtyRow}>
                  <TextInput
                    style={styles.qtyInput}
                    keyboardType="number-pad"
                    defaultValue={String(line.quantity)}
                    onEndEditing={(e) => {
                      const v = parseInt(e.nativeEvent.text, 10)
                      if (!Number.isFinite(v)) return
                      updateQuantity(line._id, line.size, v)
                    }}
                  />
                  <TouchableOpacity
                    onPress={() => updateQuantity(line._id, line.size, 0)}
                    style={styles.remove}
                  >
                    <Text style={styles.removeText}>Remove</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          )
        })
      )}

      <Text style={styles.h2}>Contact</Text>
      <TextInput style={styles.input} placeholder="Name" value={name} onChangeText={setName} />
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <TextInput style={styles.input} placeholder="Phone" value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
      <TextInput
        style={[styles.input, styles.msg]}
        placeholder="Message (optional)"
        value={message}
        onChangeText={setMessage}
        multiline
      />
      <TouchableOpacity style={styles.btn} onPress={submit} disabled={sending || !token}>
        {sending ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Submit inquiry</Text>}
      </TouchableOpacity>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#fff' },
  h1: { fontSize: 22, fontWeight: '800', color: '#0f172a' },
  sub: { color: '#64748b', marginTop: 6, marginBottom: 12 },
  warn: { color: '#b45309', marginBottom: 12, fontWeight: '600' },
  empty: { color: '#94a3b8', marginVertical: 16 },
  line: { flexDirection: 'row', paddingVertical: 12, borderBottomWidth: StyleSheet.hairlineWidth, borderColor: '#e2e8f0' },
  thumb: { width: 64, height: 64, borderRadius: 8, backgroundColor: '#e2e8f0' },
  lineBody: { flex: 1, marginLeft: 12 },
  pname: { fontSize: 15, fontWeight: '600', color: '#0f172a' },
  pmeta: { marginTop: 4, color: '#475569' },
  qtyRow: { flexDirection: 'row', alignItems: 'center', marginTop: 8, gap: 12 },
  qtyInput: {
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 8,
    width: 56,
    paddingVertical: 6,
    paddingHorizontal: 8,
    textAlign: 'center',
  },
  remove: { padding: 6 },
  removeText: { color: '#dc2626', fontWeight: '600' },
  h2: { marginTop: 20, marginBottom: 8, fontSize: 18, fontWeight: '800' },
  input: {
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
    fontSize: 16,
    backgroundColor: '#f8fafc',
  },
  msg: { minHeight: 80, textAlignVertical: 'top' },
  btn: {
    marginTop: 8,
    backgroundColor: '#2563eb',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  btnText: { color: '#fff', fontWeight: '800', fontSize: 16 },
})
