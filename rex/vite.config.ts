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
    // Phone previews via Cloudflare quick tunnels (rotating *.trycloudflare.com hosts)
    allowedHosts: true,
  },
})
