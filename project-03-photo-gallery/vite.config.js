import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  // Relative base so built assets resolve correctly when the app is served
  // from a subpath on GitHub Pages (e.g. /My-Portfolio-Projects-React/project-03-.../).
  base: './',
  build: {
    rollupOptions: {
      output: {
        /*
         * Split large vendor libraries into separate chunks so the
         * browser can cache them independently of app code. Firebase
         * is ~480 kB on its own — keeping it in a dedicated chunk means
         * it only re-downloads when Firebase itself is upgraded, not on
         * every app change.
         */
        manualChunks: {
          'firebase-app':       ['firebase/app'],
          'firebase-auth':      ['firebase/auth'],
          'firebase-firestore': ['firebase/firestore'],
        },
      },
    },
  },
})
