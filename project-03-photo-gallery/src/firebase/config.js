/**
 * Firebase SDK Initialisation
 * ─────────────────────────────────────────────────────────────────
 * Firebase v10 uses a modular (tree-shakeable) API — you import only
 * the functions you need rather than a single giant object. This file
 * calls `initializeApp()` once and exports the three service instances
 * (auth, db, storage) that the rest of the app imports from.
 *
 * Why one init file?
 *   Firebase throws an error if you call initializeApp() more than once
 *   with the same config. Centralising it here prevents that entirely.
 *
 * Environment variables:
 *   All config values are read from .env (prefixed VITE_ so Vite
 *   bundles them into the client). They are NOT secret — Firebase
 *   keys are designed to be public; security is enforced by Firestore
 *   and Storage rules on the server side, not by hiding the key.
 */
import { initializeApp }     from 'firebase/app'
import { getAuth }            from 'firebase/auth'
import { getFirestore }       from 'firebase/firestore'
import { getStorage }         from 'firebase/storage'

const firebaseConfig = {
  apiKey:            import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain:        import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId:         import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket:     import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId:             import.meta.env.VITE_FIREBASE_APP_ID,
}

/* initializeApp registers the Firebase SDK with your project config. */
const app = initializeApp(firebaseConfig)

/* getAuth / getFirestore / getStorage return service instances tied to `app`. */
export const auth    = getAuth(app)
export const db      = getFirestore(app)
export const storage = getStorage(app)
