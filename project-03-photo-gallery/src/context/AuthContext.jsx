/**
 * AuthContext — React Context for Firebase auth state
 * ─────────────────────────────────────────────────────────────────
 * The Problem Without Context:
 *   If `user` were state in App, you'd have to pass it down as a prop
 *   through every component: App → Header → UserAvatar, App → Uploader,
 *   App → PhotoGrid → PhotoCard. This is called "prop drilling" and
 *   becomes painful as the tree grows.
 *
 * The Solution — React Context:
 *   1. Create a Context object (createContext)
 *   2. Wrap the app in a Provider that holds the state
 *   3. Any component anywhere in the tree calls useAuth() to read it
 *   No props needed.
 *
 * onAuthStateChanged — the Firebase auth listener:
 *   Firebase persists the user session in localStorage. When the app
 *   loads, onAuthStateChanged fires once:
 *     - If a session exists → callback receives the User object
 *     - If not logged in  → callback receives null
 *   It fires again whenever the user signs in or out.
 *
 *   The `loading` flag solves the "flash of login screen" problem:
 *   while Firebase checks the persisted session (async), we don't know
 *   yet if the user is logged in. We show nothing until we know.
 */
import { createContext, useContext, useEffect, useState } from 'react'
import { onAuthStateChanged } from 'firebase/auth'
import { auth } from '../firebase/config'

/* Step 1: Create the context. The null default is only used if a component
   tries to call useAuth() outside of <AuthProvider> — we'll catch that. */
const AuthContext = createContext(null)

/**
 * AuthProvider — wraps the entire app and keeps auth state in sync
 * with Firebase. All children can call useAuth() to read this state.
 */
export function AuthProvider({ children }) {
  /* The Firebase User object, or null if not signed in. */
  const [user, setUser]       = useState(null)

  /* True until Firebase resolves the initial auth check.
     Prevents showing the Login screen to already-authenticated users. */
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    /* Subscribe to auth state changes. Firebase calls this immediately
       with the current state, then again on every sign-in/sign-out.
       Returns an unsubscribe function — call it on cleanup to prevent
       memory leaks when the component unmounts. */
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser)   // null or a User object
      setLoading(false)       // we now know the auth state
    })

    /* Cleanup: unsubscribe the listener when AuthProvider unmounts.
       In practice this never unmounts (it wraps the whole app), but
       it's correct pattern to always clean up Firebase listeners. */
    return unsubscribe
  }, []) /* Empty array: only run once on mount, never re-run. */

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

/**
 * useAuth — custom hook that reads from AuthContext.
 * Import and call this in any component that needs the current user.
 *
 * Usage:
 *   const { user, loading } = useAuth()
 */
export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used inside <AuthProvider>')
  }
  return context
}
