import React from 'react'
import { View, Text, StyleSheet, ScrollView } from 'react-native'

export default function AboutScreen() {
  return (
    <ScrollView style={styles.root} contentContainerStyle={{ padding: 20 }}>
      <Text style={styles.h1}>About AppleBearBaby</Text>
      <Text style={styles.p}>
        We supply wholesale baby feeding bottles and related products for retailers, daycare centers,
        hospitals, and distributors. This app mirrors the same catalog, cart, and inquiry flows as the
        website — powered by the same backend API.
      </Text>
      <Text style={styles.p}>
        For factory tours, certifications, and long-form pages, the full marketing layout remains on
        the web; here you get a fast, mobile-first shopping and inquiry experience.
      </Text>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#fff' },
  h1: { fontSize: 22, fontWeight: '800', color: '#0f172a', marginBottom: 12 },
  p: { fontSize: 16, lineHeight: 24, color: '#475569', marginBottom: 14 },
})
