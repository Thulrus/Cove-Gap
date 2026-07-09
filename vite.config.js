import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // Relative base so the build works from any subpath (e.g. a GitHub Pages
  // project page at /<repo>/) without hardcoding the repo name.
  base: './',
})
