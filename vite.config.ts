import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// GitHub Pages serve il sito su https://Ale-Gith.github.io/Giochini/
// (case-sensitive!) quindi il base path deve essere "/Giochini/" in produzione.
export default defineConfig({
  plugins: [react()],
  base: '/Giochini/',
})
