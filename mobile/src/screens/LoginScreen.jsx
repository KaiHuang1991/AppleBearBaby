import React, { useState } from 'react'
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
} from 'react-native'
import { useNavigation } from '@react-navigation/native'
import { useShop } from '../context/ShopContext'

export default function LoginScreen() {
  const navigation = useNavigation()
  const { login, register } = useShop()
  const [mode, setMode] = useState('login')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)

  const submit = async () => {
    if (!email.trim() || !password) {
      Alert.alert('Form', 'Enter email and password.')
      return
    }
    setBusy(true)
    try {
      if (mode === 'login') {
        const ok = await login(email.trim(), password)
        if (ok) navigation.goBack()
      } else {
        if (!name.trim()) {
          Alert.alert('Form', 'Enter your name.')
          setBusy(false)
          return
        }
        const r = await register(name.trim(), email.trim(), password)
        if (r.ok) {
          if (r.needsVerification) {
            Alert.alert('Check email', 'Verify your email, then sign in.')
          }
          navigation.goBack()
        }
      }
    } finally {
      setBusy(false)
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <Text style={styles.h1}>{mode === 'login' ? 'Sign in' : 'Create account'}</Text>
      {mode === 'register' ? (
        <TextInput style={styles.input} placeholder="Name" value={name} onChangeText={setName} />
      ) : null}
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
      />
      <TextInput
        style={styles.input}
        placeholder="Password (min 8 chars)"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <TouchableOpacity style={styles.btn} onPress={submit} disabled={busy}>
        {busy ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Continue</Text>}
      </TouchableOpacity>
      <TouchableOpacity onPress={() => setMode(mode === 'login' ? 'register' : 'login')}>
        <Text style={styles.switch}>
          {mode === 'login' ? 'Need an account? Sign up' : 'Have an account? Sign in'}
        </Text>
      </TouchableOpacity>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  root: { flex: 1, padding: 20, backgroundColor: '#fff', justifyContent: 'center' },
  h1: { fontSize: 24, fontWeight: '800', marginBottom: 20, color: '#0f172a' },
  input: {
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    marginBottom: 12,
    backgroundColor: '#f8fafc',
  },
  btn: {
    backgroundColor: '#2563eb',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  btnText: { color: '#fff', fontWeight: '800', fontSize: 16 },
  switch: { marginTop: 20, textAlign: 'center', color: '#2563eb', fontWeight: '600' },
})
