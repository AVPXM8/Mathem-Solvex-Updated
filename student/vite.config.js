import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],

  // proxy configuration for local development
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
    }
  },

  // NEW BLOCK for Server-Side Rendering
  build: {
    ssr: 'src/entry-server.jsx',
  },
})