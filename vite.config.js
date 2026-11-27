import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
// In development the website calls /api; forward it to the local API (npm run dev:api).
export default defineConfig({ plugins: [react()], server: { proxy: { '/api': 'http://localhost:4000' } } })
