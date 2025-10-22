import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: "/", // important for correct asset URLs behind CloudFront
  build: {
    outDir: "dist",
    sourcemap: true
  },
  server: {
    proxy: {
      '/api': 'http://localhost:5000'
    }
  }
})
