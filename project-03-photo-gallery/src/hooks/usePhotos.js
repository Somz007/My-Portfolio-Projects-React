/**
 * usePhotos — Firestore real-time listener for the photo collection
 * ─────────────────────────────────────────────────────────────────
 * This hook subscribes to the "photos" Firestore collection and keeps
 * a local `photos` array in sync with the database in real time.
 *
 * onSnapshot vs. getDocs:
 *   getDocs()    — one-time read, like a normal API call. You'd have to
 *                  manually refetch to see new photos.
 *   onSnapshot() — persistent listener. Every time any document in the
 *                  query changes (add, update, delete), Firebase pushes
 *                  the new data to your callback. The UI updates
 *                  immediately without any polling.
 *
 * This means: if you upload a photo on your phone, it appears on your
 * laptop's gallery tab instantly. No refresh needed.
 *
 * Returns:
 *   photos  — array of photo objects ({ id, url, name, uid, ... })
 *   loading — true while the initial snapshot is loading
 *   error   — error message string or null
 *   deletePhoto — async function(photo) that removes from Storage + Firestore
 */
import { useState, useEffect } from 'react'
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore'
import { db } from '../firebase/config'
import { deletePhoto as firebaseDeletePhoto } from '../firebase/storage'

export function usePhotos() {
  const [photos,  setPhotos]  = useState([])
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState(null)

  useEffect(() => {
    /* Build a query: all documents in "photos", newest first.
       orderBy requires a Firestore index — for a single field Firebase
       creates it automatically. Composite indexes need manual creation. */
    const q = query(
      collection(db, 'photos'),
      orderBy('createdAt', 'desc')
    )

    /* onSnapshot returns an unsubscribe function — identical pattern
       to addEventListener / removeEventListener. Always clean up! */
    const unsubscribe = onSnapshot(
      q,

      /* Success callback — called immediately with current data,
         then again whenever anything in the query changes. */
      (snapshot) => {
        /* snapshot.docs is an array of QueryDocumentSnapshot.
           We map each to a plain object and include the document's
           auto-generated ID so we can reference it for deletion. */
        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          /* createdAt can be null briefly after addDoc() before the
             server resolves serverTimestamp(). Provide a fallback. */
          createdAt: doc.data().createdAt?.toDate() ?? new Date(),
        }))

        setPhotos(data)
        setLoading(false)
        setError(null)
      },

      /* Error callback — fires if rules deny access or if offline. */
      (err) => {
        console.error('Firestore snapshot error:', err)
        setError('Failed to load photos. Check your Firestore rules.')
        setLoading(false)
      }
    )

    /* Cleanup: detach the listener when the component using this hook
       unmounts. Without this, Firebase would continue sending updates
       to a component that no longer exists. */
    return unsubscribe
  }, []) /* Run once — the snapshot listener stays alive until cleanup. */

  /**
   * deletePhoto — deletes a photo from Storage and Firestore.
   * Wrapped here so errors are caught and surfaced via state.
   */
  async function deletePhoto(photo) {
    try {
      await firebaseDeletePhoto(photo)
      /* No need to update `photos` manually — the onSnapshot listener
         will fire automatically when the Firestore document is deleted
         and remove it from the array. */
    } catch (err) {
      console.error('Delete failed:', err)
      setError('Failed to delete photo. Please try again.')
    }
  }

  return { photos, loading, error, deletePhoto }
}
