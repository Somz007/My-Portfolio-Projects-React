/**
 * Firebase Authentication Helpers
 * ─────────────────────────────────────────────────────────────────
 * Two functions that wrap the Firebase Auth SDK calls so components
 * never import from 'firebase/auth' directly.
 *
 * Google OAuth flow:
 *   1. User clicks "Sign in with Google"
 *   2. signInWithPopup() opens a Google-hosted popup window
 *   3. User selects their Google account and grants permission
 *   4. Firebase exchanges the OAuth token for a Firebase session
 *   5. The session is persisted in localStorage automatically
 *   6. onAuthStateChanged (in AuthContext) fires with the user object
 *
 * The returned `user` object from Firebase includes:
 *   user.uid          — unique, permanent ID for this user
 *   user.displayName  — "Jane Smith"
 *   user.email        — "jane@gmail.com"
 *   user.photoURL     — Google profile picture URL
 */
import { GoogleAuthProvider, signInWithPopup, signOut as firebaseSignOut } from 'firebase/auth'
import { auth } from './config'

/* GoogleAuthProvider tells Firebase which OAuth provider to use. */
const googleProvider = new GoogleAuthProvider()

/**
 * signInWithGoogle — opens the Google popup and signs the user in.
 * Returns the Firebase UserCredential object on success.
 * Throws on cancellation or error (handled in Login component).
 */
export async function signInWithGoogle() {
  return signInWithPopup(auth, googleProvider)
}

/**
 * signOut — signs the current user out and clears the session.
 * onAuthStateChanged will fire with null, triggering the Login screen.
 */
export async function signOut() {
  return firebaseSignOut(auth)
}
