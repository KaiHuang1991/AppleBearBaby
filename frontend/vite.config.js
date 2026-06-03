import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { socialOgPreview } from './vite.socialOg.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
// npm workspaces hoists react/react-dom to repo root; Vite must resolve them explicitly
const repoNodeModules = path.resolve(__dirname, '../node_modules')

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(), socialOgPreview()],
  resolve: {
    alias: {
      react: path.join(repoNodeModules, 'react'),
      'react-dom': path.join(repoNodeModules, 'react-dom'),
    },
  },
  server: {
    port: 5173,
    // Listen on all interfaces so http://YOUR_LAN_IP:5173 works from phone / other PCs
    host: true,
    // Allow Google Sign-In popup postMessage (fixes COOP warnings in dev)
    headers: {
      'Cross-Origin-Opener-Policy': 'same-origin-allow-popups',
    },
  },
  preview: {
    port: 5173,
    host: true,
    cors: true,
  },
  base: '/',
})
