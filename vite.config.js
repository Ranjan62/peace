import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
// base './' makes the build work from any path (GitHub Pages /peace/, Vercel root, etc.)
export default defineConfig({ base: './', plugins: [react()] })
