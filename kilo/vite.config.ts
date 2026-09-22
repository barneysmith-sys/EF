import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  // Served from https://barneysmith-sys.github.io/EF/ on GitHub Pages, so assets
  // need the repo name as a prefix. Local dev stays at the root.
  base: process.env.GITHUB_PAGES ? '/EF/' : '/',
  plugins: [react()],
})
