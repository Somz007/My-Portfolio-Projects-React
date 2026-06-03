import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
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
