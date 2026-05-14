import { Platform } from 'react-native'
import Constants from 'expo-constants'

/**
 * Strip host from values like "192.168.1.5:8081" or "exp://192.168.1.5:8081".
 * Returns null for localhost / empty / non-IPv4 hostnames (e.g. tunnel domains).
 */
function ipv4HostFromDebuggerString(value) {
  if (!value || typeof value !== 'string') return null
  const noProto = value.replace(/^[^:]+:\/\//, '').trim()
  const host = noProto.split(':')[0]
  if (!host || host === 'localhost' || host === '127.0.0.1') return null
  if (/^\d{1,3}(\.\d{1,3}){3}$/.test(host)) return host
  return null
}

function readDebuggerHost() {
  const eg = Constants.expoGoConfig
  if (eg?.debuggerHost) return eg.debuggerHost
  const uri = Constants.expoConfig?.hostUri
  if (uri) return uri
  const m = Constants.manifest
  if (m && typeof m === 'object' && m.debuggerHost) return m.debuggerHost
  return null
}

/**
 * Priority: EXPO_PUBLIC_BACKEND_URL → dev LAN from Expo (physical device + same Wi‑Fi)
 * → Android emulator host → iOS simulator localhost.
 */
export function resolveBackendUrl() {
  const fromEnv = process.env.EXPO_PUBLIC_BACKEND_URL?.trim()
  if (fromEnv) return fromEnv

  if (__DEV__) {
    const raw = readDebuggerHost()
    const host = ipv4HostFromDebuggerString(raw)
    if (host) return `http://${host}:4000`
  }

  if (Platform.OS === 'android') return 'http://10.0.2.2:4000'
  return 'http://localhost:4000'
}

/**
 * Vite 店铺前端（与 frontend `npm run dev` 的端口一致）。
 * 优先 EXPO_PUBLIC_WEB_SHOP_URL；开发时与 Metro 同源推断局域网 IP。
 */
export function resolveWebShopUrl() {
  const fromEnv = process.env.EXPO_PUBLIC_WEB_SHOP_URL?.trim()
  if (fromEnv) return fromEnv

  if (__DEV__) {
    const raw = readDebuggerHost()
    const host = ipv4HostFromDebuggerString(raw)
    if (host) return `http://${host}:5173`
  }

  if (Platform.OS === 'android') return 'http://10.0.2.2:5173'
  return 'http://localhost:5173'
}
