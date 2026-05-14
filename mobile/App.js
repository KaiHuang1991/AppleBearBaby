import React from 'react'
import { StatusBar } from 'expo-status-bar'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { ShopProvider } from './src/context/ShopContext'
import RootNavigator from './src/navigation/RootNavigator'

export default function App() {
  return (
    <SafeAreaProvider>
      <ShopProvider>
        <StatusBar style="dark" />
        <RootNavigator />
      </ShopProvider>
    </SafeAreaProvider>
  )
}
