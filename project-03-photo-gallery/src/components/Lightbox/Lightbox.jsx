import { useEffect, useCallback } from 'react'
import { useAuth } from '../../context/AuthContext'
import styles from './Lightbox.module.css'

/**
 * Lightbox — full-screen photo viewer with prev/next navigation.
 *
 * Navigation works three ways:
 *   1. Click the ‹ / › arrow buttons
 *   2. ArrowLeft / ArrowRight keyboard keys
 *   3. Click the left/right edge of the photo area (half-width zones)
 *
 * Closing works two ways:
 *   1. Click the ✕ button
 *   2. Press Escape
 *   3. Click the dark backdrop behind the photo
 *
 * Props:
 *   photos     — full photos array (from usePhotos) for navigation
 *   index      — currently open photo index (into photos[])
 *   onClose    — callback to close the lightbox (sets index to null in App)
 *   onNavigate — callback(newIndex) to change the displayed photo
 *   onDelete   — callback(photo) — delete from lightbox (owner only)
 */
export default function Lightbox({ photos, index, onClose, onNavigate, onDelete }) {
  const { user }  = useAuth()
  const photo     = photos[index]
  const isOwner   = user?.uid === photo?.uid
  const hasPrev   = index > 0
  const hasNext   = index < photos.length - 1

  const prev = useCallback(() => { if (hasPrev) onNavigate(index - 1) }, [hasPrev, index, onNavigate])
  const next = useCallback(() => { if (hasNext) onNavigate(index + 1) }, [hasNext, index, onNavigate])

  /* Lock body scroll while open; restore on close. */
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [])

  /* Keyboard navigation. */
  useEffect(() => {
    function handleKey(e) {
      if (e.key === 'Escape')     onClose()
      if (e.key === 'ArrowLeft')  prev()
      if (e.key === 'ArrowRight') next()
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [onClose, prev, next])

  if (!photo) return null

  /** Format the photo's timestamp into a readable date string. */
  function formatDate(date) {
    if (!date) return ''
    return new Date(date).toLocaleDateString('en-GB', {
      day: 'numeric', month: 'long', year: 'numeric',
    })
  }

  async function handleDelete() {
    await onDelete(photo)
    /* After deletion, onSnapshot fires in usePhotos, the photos array
       shrinks, and if the deleted photo was the last one, close the
       lightbox; otherwise stay open at the same index (now showing
       the next photo). */
    if (photos.length <= 1) {
      onClose()
    } else if (index >= photos.length - 1) {
      onNavigate(index - 1)
    }
  }

  return (
    <div
      className={styles.backdrop}
      role="dialog"
      aria-modal="true"
      aria-label={`Photo by ${photo.displayName}`}
    >
      {/* Close button */}
      <button className={styles.closeBtn} onClick={onClose} aria-label="Close lightbox">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
        </svg>
      </button>

      {/* Counter */}
      <div className={styles.counter} aria-live="polite">
        {index + 1} / {photos.length}
      </div>

      {/* Main photo area — click on left/right halves to navigate */}
      <div className={styles.imageArea}>
        {/* Left nav zone */}
        {hasPrev && (
          <button
            className={`${styles.navZone} ${styles.navLeft}`}
            onClick={prev}
            aria-label="Previous photo"
          >
            <span className={styles.navArrow}>‹</span>
          </button>
        )}

        {/* The photo */}
        <img
          key={photo.id} /* key forces re-render on photo change for fade effect */
          className={styles.image}
          src={photo.url}
          alt={`Photo by ${photo.displayName}`}
        />

        {/* Right nav zone */}
        {hasNext && (
          <button
            className={`${styles.navZone} ${styles.navRight}`}
            onClick={next}
            aria-label="Next photo"
          >
            <span className={styles.navArrow}>›</span>
          </button>
        )}
      </div>

      {/* Info bar at the bottom */}
      <div className={styles.infoBar}>
        <div className={styles.infoLeft}>
          {photo.photoURL && (
            <img
              className={styles.infoAvatar}
              src={photo.photoURL}
              alt=""
              referrerPolicy="no-referrer"
            />
          )}
          <div>
            <p className={styles.infoName}>{photo.displayName}</p>
            <p className={styles.infoDate}>{formatDate(photo.createdAt)}</p>
          </div>
        </div>

        <div className={styles.infoRight}>
          {/* Open original in new tab */}
          <a
            className={styles.infoBtn}
            href={photo.url}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Open full resolution"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
              <polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/>
            </svg>
          </a>

          {/* Delete — owner only */}
          {isOwner && (
            <button
              className={`${styles.infoBtn} ${styles.deleteBtn}`}
              onClick={handleDelete}
              aria-label="Delete photo"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="3 6 5 6 21 6"/>
                <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                <path d="M10 11v6M14 11v6"/>
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Dark backdrop — click to close */}
      <div className={styles.backdropClick} onClick={onClose} aria-hidden="true" />
    </div>
  )
}
