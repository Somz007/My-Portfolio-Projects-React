import { useState } from 'react'
import StarRating from '../StarRating/StarRating'
import styles from './MovieCard.module.css'

const IMAGE_BASE = import.meta.env.VITE_TMDB_IMAGE_BASE || 'https://image.tmdb.org/t/p'

/**
 * MovieCard — displays a single movie from a search result or trending list.
 *
 * Clicking anywhere on the card calls onSelect to trigger the detail panel.
 * The 3D tilt on hover is driven by mouse position relative to the card's
 * bounding rect, giving a physically-grounded feel.
 *
 * Props:
 *   movie    — a TMDB movie object (id, title, poster_path, release_date, vote_average)
 *   onSelect — callback(id) when the card is clicked
 *   index    — position in the grid, used to stagger the entrance animation
 */
export default function MovieCard({ movie, onSelect, index = 0 }) {
  /* Track the tilt transform from mouse movement */
  const [tilt, setTilt] = useState({ x: 0, y: 0 })
  const [hovered, setHovered] = useState(false)

  const posterUrl = movie.poster_path
    ? `${IMAGE_BASE}/w500${movie.poster_path}`
    : null

  const year = movie.release_date
    ? new Date(movie.release_date).getFullYear()
    : '—'

  /**
   * On mouse move inside the card, calculate how far the cursor is
   * from the card's center (as a -1 to 1 ratio) and map that to a
   * small rotation so the card appears to tilt toward the cursor.
   */
  function handleMouseMove(e) {
    const rect = e.currentTarget.getBoundingClientRect()
    const cx = rect.left + rect.width / 2
    const cy = rect.top + rect.height / 2
    const dx = (e.clientX - cx) / (rect.width / 2)   // -1 to 1
    const dy = (e.clientY - cy) / (rect.height / 2)  // -1 to 1
    setTilt({ x: dy * -4, y: dx * 4 })               // max 4° rotation
  }

  function handleMouseLeave() {
    setTilt({ x: 0, y: 0 })
    setHovered(false)
  }

  const tiltStyle = {
    transform: hovered
      ? `perspective(600px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) scale(1.02)`
      : 'perspective(600px) rotateX(0deg) rotateY(0deg) scale(1)',
    /* Stagger entrance: each card waits an extra 40ms per position */
    animationDelay: `${index * 40}ms`,
  }

  return (
    <article
      className={styles.card}
      style={tiltStyle}
      onClick={() => onSelect(movie.id)}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={handleMouseLeave}
      onKeyDown={(e) => e.key === 'Enter' && onSelect(movie.id)}
      tabIndex={0}
      role="button"
      aria-label={`View details for ${movie.title}`}
    >
      {/* Poster image — fallback to a placeholder if no image exists */}
      <div className={styles.posterWrapper}>
        {posterUrl ? (
          <img
            className={styles.poster}
            src={posterUrl}
            alt={`${movie.title} poster`}
            loading="lazy"
          />
        ) : (
          <div className={styles.noPoster} aria-hidden="true">
            <span className={styles.noPosterIcon}>🎬</span>
            <span>No poster</span>
          </div>
        )}

        {/* Gold hover overlay */}
        <div className={styles.overlay} aria-hidden="true" />
      </div>

      {/* Card metadata below the poster */}
      <div className={styles.meta}>
        <p className={styles.year}>{year}</p>
        <h2 className={styles.title}>{movie.title}</h2>
        <StarRating score={movie.vote_average} votes={movie.vote_count} />
      </div>
    </article>
  )
}
