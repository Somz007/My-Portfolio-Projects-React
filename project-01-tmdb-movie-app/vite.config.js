import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  // Relative base so built assets resolve correctly when the app is served
  // from a subpath on GitHub Pages (e.g. /My-Portfolio-Projects-React/project-01-.../).
  base: './',
})
