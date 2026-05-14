import React from 'react'
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native'
import { useNavigation } from '@react-navigation/native'
import { useShop } from '../context/ShopContext'

export default function AccountScreen() {
  const navigation = useNavigation()
  const { token, user, logout, inquiryUnreadCount } = useShop()

  return (
    <ScrollView style={styles.root} contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
      <Text style={styles.h1}>Account</Text>
      {token && user ? (
        <View style={styles.card}>
          <Text style={styles.name}>{user.name || 'Customer'}</Text>
          <Text style={styles.email}>{user.email}</Text>
          {inquiryUnreadCount > 0 ? (
            <Text style={styles.badge}>{inquiryUnreadCount} unread inquiry replies</Text>
          ) : null}
        </View>
      ) : (
        <Text style={styles.muted}>You are not signed in.</Text>
      )}

      {!token ? (
        <TouchableOpacity style={styles.btn} onPress={() => navigation.navigate('Login')}>
          <Text style={styles.btnText}>Sign in / Sign up</Text>
        </TouchableOpacity>
      ) : (
        <>
          <TouchableOpacity style={styles.link} onPress={() => navigation.navigate('Inquiries')}>
            <Text style={styles.linkText}>My inquiries {inquiryUnreadCount ? `(${inquiryUnreadCount})` : ''}</Text>
            <Text style={styles.chev}>›</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.btnOutline} onPress={logout}>
            <Text style={styles.btnOutlineText}>Log out</Text>
          </TouchableOpacity>
        </>
      )}

      <Text style={styles.section}>More</Text>
      <TouchableOpacity style={styles.link} onPress={() => navigation.navigate('Blogs')}>
        <Text style={styles.linkText}>Blog</Text>
        <Text style={styles.chev}>›</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.link} onPress={() => navigation.navigate('About')}>
        <Text style={styles.linkText}>About</Text>
        <Text style={styles.chev}>›</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.link} onPress={() => navigation.navigate('Contact')}>
        <Text style={styles.linkText}>Contact</Text>
        <Text style={styles.chev}>›</Text>
      </TouchableOpacity>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#fff' },
  h1: { fontSize: 22, fontWeight: '800', color: '#0f172a', marginBottom: 12 },
  card: {
    backgroundColor: '#f1f5f9',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  name: { fontSize: 18, fontWeight: '800', color: '#0f172a' },
  email: { color: '#475569', marginTop: 4 },
  badge: { marginTop: 10, color: '#b45309', fontWeight: '600' },
  muted: { color: '#64748b', marginBottom: 16 },
  btn: {
    backgroundColor: '#2563eb',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
  },
  btnText: { color: '#fff', fontWeight: '800', fontSize: 16 },
  btnOutline: {
    borderWidth: 1,
    borderColor: '#cbd5e1',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  btnOutlineText: { color: '#334155', fontWeight: '700' },
  section: { marginTop: 24, marginBottom: 8, fontSize: 14, fontWeight: '700', color: '#64748b' },
  link: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: '#e2e8f0',
  },
  linkText: { flex: 1, fontSize: 16, color: '#0f172a', fontWeight: '600' },
  chev: { fontSize: 20, color: '#94a3b8' },
})
