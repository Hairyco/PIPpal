import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'https://rex-liart.vercel.app',
        changeOrigin: true,
      },
    },
  },
  preview: {
    // Cloudflare quick tunnels rotate hostnames; allow any *.trycloudflare.com host
    allowedHosts: ['.trycloudflare.com', 'localhost'],
  },
})
