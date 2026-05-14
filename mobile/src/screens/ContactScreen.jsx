import React from 'react'
import { View, Text, StyleSheet, ScrollView, Linking, TouchableOpacity } from 'react-native'

export default function ContactScreen() {
  return (
    <ScrollView style={styles.root} contentContainerStyle={{ padding: 20 }}>
      <Text style={styles.h1}>Contact</Text>
      <Text style={styles.p}>
        Use the wholesale inquiry cart in the app, or reach the team through the same channels as on
        the website.
      </Text>
      <Text style={styles.p}>Tel: (+86) 15867976938</Text>
      <TouchableOpacity onPress={() => Linking.openURL('mailto:1034201254@qq.com')}>
        <Text style={styles.link}>Email: 1034201254@qq.com</Text>
      </TouchableOpacity>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#fff' },
  h1: { fontSize: 22, fontWeight: '800', color: '#0f172a', marginBottom: 12 },
  p: { fontSize: 16, lineHeight: 24, color: '#475569', marginBottom: 14 },
  link: { color: '#2563eb', fontWeight: '700', marginTop: 8 },
})
