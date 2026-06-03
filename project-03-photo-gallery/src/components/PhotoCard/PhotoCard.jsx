import { useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import styles from './PhotoCard.module.css'

/**
 * PhotoCard — displays a single photo in the masonry grid.
 *
 * On hover, a frosted glass action bar slides up from the bottom showing:
 *   - The uploader's name + avatar
 *   - A delete button (only visible if photo.uid === current user's uid)
 *
 * Delete guard — why check on the client?
 *   The UI check prevents accidental clicks. But the REAL security is
 *   in Firestore rules: "allow delete if request.auth.uid == resource.data.uid"
 *   Without that rule, a malicious user could bypass the UI and call
 *   deleteDoc() directly. Never rely solely on UI guards for security.
 *
 * Props:
 *   photo      — Firestore photo document (id, url, uid, displayName, photoURL, createdAt)
 *   onOpen     — callback() to open this photo in the Lightbox
 *   onDelete   — callback(photo) to delete this photo
 */
export default function PhotoCard({ photo, onOpen, onDelete }) {
  const { user }    = useAuth()
  const [loaded, setLoaded]       = useState(false)
  const [deleting, setDeleting]   = useState(false)
  const [confirmDel, setConfirmDel] = useState(false)

  /* Is the current user the owner of this photo? */
  const isOwner = user?.uid === photo.uid

  async function handleDelete(e) {
    /* Stop propagation so clicking Delete doesn't also open the Lightbox. */
    e.stopPropagation()

    if (!confirmDel) {
      /* First click: ask for confirmation. */
      setConfirmDel(true)
      /* Auto-reset the confirmation state after 3 seconds if no second click. */
      setTimeout(() => setConfirmDel(false), 3000)
      return
    }

    /* Second click: proceed with deletion. */
    setDeleting(true)
    await onDelete(photo)
    /* No need to setDeleting(false) — the card unmounts when Firestore deletes it. */
  }

  return (
    <div
      className={styles.card}
      onClick={onOpen}
      role="button"
      tabIndex={0}
      aria-label={`View photo by ${photo.displayName}`}
      onKeyDown={(e) => e.key === 'Enter' && onOpen()}
    >
      {/* Loading skeleton — shown until the image loads. */}
      {!loaded && <div className={styles.skeleton} aria-hidden="true" />}

      {/* The photo itself */}
      <img
        className={`${styles.image} ${loaded ? styles.imageLoaded : ''}`}
        src={photo.url}
        alt={`Photo by ${photo.displayName}`}
        loading="lazy"
        onLoad={() => setLoaded(true)}
      />

      {/* Hover overlay — frosted glass action bar */}
      <div className={styles.overlay} aria-hidden="true">
        <div className={styles.overlayInner}>
          {/* Uploader info */}
          <div className={styles.uploaderInfo}>
            {photo.photoURL && (
              <img
                className={styles.uploaderAvatar}
                src={photo.photoURL}
                alt={`${photo.displayName}'s avatar`}
                referrerPolicy="no-referrer"
                loading="lazy"
              />
            )}
            <span className={styles.uploaderName}>{photo.displayName}</span>
          </div>

          {/* Delete button — owner only */}
          {isOwner && (
            <button
              className={`${styles.deleteBtn} ${confirmDel ? styles.deleteBtnConfirm : ''}`}
              onClick={handleDelete}
              disabled={deleting}
              aria-label={confirmDel ? 'Click again to confirm delete' : 'Delete photo'}
            >
              {deleting    ? '…'
               : confirmDel ? 'Confirm'
               : (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="3 6 5 6 21 6"/>
                  <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                  <path d="M10 11v6M14 11v6"/>
                  <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
                </svg>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
