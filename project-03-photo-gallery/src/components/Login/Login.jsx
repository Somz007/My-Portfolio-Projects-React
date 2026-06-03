import { useState } from 'react'
import { signInWithGoogle } from '../../firebase/auth'
import styles from './Login.module.css'

/**
 * Login — full-page sign-in screen shown when no user is authenticated.
 *
 * Handles three states:
 *   idle       — initial state, button ready to click
 *   loading    — popup is open / OAuth in progress
 *   error      — something went wrong (user cancelled, popup blocked, etc.)
 *
 * After signInWithGoogle() resolves, onAuthStateChanged in AuthContext
 * fires automatically — the Login screen unmounts and the gallery appears.
 * We don't need to do anything here after the promise resolves.
 */
export default function Login() {
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState(null)

  async function handleSignIn() {
    setLoading(true)
    setError(null)
    try {
      await signInWithGoogle()
      /* On success, AuthContext handles the rest — this component unmounts. */
    } catch (err) {
      /* Common error: user closed the popup (code: 'auth/popup-closed-by-user').
         We show a friendly message regardless of the specific code. */
      if (err.code !== 'auth/popup-closed-by-user') {
        setError('Sign-in failed. Please try again.')
      }
      setLoading(false)
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        {/* App wordmark */}
        <div className={styles.wordmark}>
          <span className={styles.wordmarkIcon} aria-hidden="true">◈</span>
          <h1 className={styles.wordmarkText}>Luminary</h1>
        </div>

        <p className={styles.tagline}>Your personal photo gallery</p>

        <div className={styles.divider} />

        <p className={styles.prompt}>
          Sign in to upload, view, and manage your photos.
        </p>

        {/* Google sign-in button — uses Google's brand colours */}
        <button
          className={styles.googleBtn}
          onClick={handleSignIn}
          disabled={loading}
          aria-label="Sign in with Google"
        >
          {/* Google logo SVG */}
          <svg className={styles.googleIcon} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="20" height="20">
            <path fill="#FFC107" d="M43.6 20H24v8h11.3C33.7 33.3 29.4 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3 0 5.8 1.1 7.9 3l5.7-5.7C34.1 6.5 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20c11 0 19.4-7.7 19.4-19.4 0-1.3-.1-2.6-.4-3.8z"/>
            <path fill="#FF3D00" d="m6.3 14.7 6.6 4.8C14.7 15.1 19 12 24 12c3 0 5.8 1.1 7.9 3l5.7-5.7C34.1 6.5 29.3 4 24 4c-7.7 0-14.3 4.4-17.7 10.7z"/>
            <path fill="#4CAF50" d="M24 44c5.2 0 9.9-1.9 13.5-5l-6.2-5.2C29.5 35.5 26.9 36 24 36c-5.4 0-9.7-2.7-11.3-7H6.3C9.6 39.5 16.3 44 24 44z"/>
            <path fill="#1976D2" d="M43.6 20H24v8h11.3c-.8 2.3-2.3 4.2-4.3 5.6l6.2 5.2C40.9 35.5 44 30.2 44 24c0-1.3-.1-2.6-.4-3.8z"/>
          </svg>
          {loading ? 'Signing in…' : 'Continue with Google'}
        </button>

        {error && (
          <p className={styles.error} role="alert">{error}</p>
        )}

        <p className={styles.note}>
          Only you can see and delete your own photos.
        </p>
      </div>
    </div>
  )
}
