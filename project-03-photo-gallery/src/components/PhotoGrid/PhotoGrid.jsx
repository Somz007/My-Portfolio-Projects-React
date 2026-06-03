import PhotoCard from '../PhotoCard/PhotoCard'
import styles from './PhotoGrid.module.css'

/**
 * PhotoGrid — CSS columns masonry layout for the photo collection.
 *
 * Why CSS columns masonry?
 *   The native CSS approach uses `columns: N` which creates a newspaper-
 *   column layout. Images stack top-to-bottom in each column, then flow
 *   into the next. This naturally accommodates variable image heights
 *   without any JavaScript measurement or layout calculation.
 *
 *   Pros: zero JS, works with lazy loading, no ResizeObserver needed.
 *   Cons: fills columns top-to-bottom rather than shortest-column-first
 *         (some layout engines do it differently). For a portfolio this
 *         is perfectly acceptable.
 *
 *   The `break-inside: avoid` on each item prevents an image from being
 *   split across two columns.
 *
 * Props:
 *   photos     — array of photo objects from usePhotos()
 *   loading    — boolean, true while first Firestore snapshot loads
 *   error      — error string or null
 *   onOpen     — callback(index) to open Lightbox at a specific photo
 *   onDelete   — callback(photo) passed down to PhotoCard
 */
export default function PhotoGrid({ photos, loading, error, onOpen, onDelete }) {

  /* ── Loading state ─────────────────────────────────────────────── */
  if (loading) {
    return (
      <div className={styles.masonry} aria-busy="true" aria-label="Loading photos">
        {/* Render skeleton placeholders so the layout doesn't jump. */}
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className={styles.item}>
            <div className={styles.skeleton} style={{ aspectRatio: i % 3 === 0 ? '3/4' : i % 2 === 0 ? '4/3' : '1' }} />
          </div>
        ))}
      </div>
    )
  }

  /* ── Error state ───────────────────────────────────────────────── */
  if (error) {
    return (
      <div className={styles.message} role="alert">
        <p className={styles.messageIcon}>⚠</p>
        <p className={styles.messageText}>{error}</p>
      </div>
    )
  }

  /* ── Empty state ───────────────────────────────────────────────── */
  if (photos.length === 0) {
    return (
      <div className={styles.message}>
        <p className={styles.messageIcon}>◈</p>
        <p className={styles.messageTitle}>No photos yet</p>
        <p className={styles.messageText}>Upload your first photo above to get started.</p>
      </div>
    )
  }

  /* ── Photo grid ────────────────────────────────────────────────── */
  return (
    <div
      className={styles.masonry}
      role="list"
      aria-label={`${photos.length} photos`}
    >
      {photos.map((photo, index) => (
        <div key={photo.id} className={styles.item} role="listitem">
          <PhotoCard
            photo={photo}
            onOpen={() => onOpen(index)}
            onDelete={onDelete}
          />
        </div>
      ))}
    </div>
  )
}
