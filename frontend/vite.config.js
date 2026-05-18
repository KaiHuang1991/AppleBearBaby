import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 5173,
    // Listen on all interfaces so http://YOUR_LAN_IP:5173 works from phone / other PCs
    host: true,
  },
  preview: {
    port: 5173,
    host: true,
    cors: true,
  },
  base: '/',
})
