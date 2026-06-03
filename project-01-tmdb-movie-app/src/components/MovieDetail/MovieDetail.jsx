import { useEffect } from 'react'
import StarRating from '../StarRating/StarRating'
import Spinner from '../Spinner/Spinner'
import styles from './MovieDetail.module.css'

const IMAGE_BASE = import.meta.env.VITE_TMDB_IMAGE_BASE || 'https://image.tmdb.org/t/p'

/**
 * MovieDetail — full-screen overlay showing deep detail for one movie.
 *
 * The panel slides in from the right. While it is open, body scrolling is
 * locked so the background content stays fixed beneath the overlay.
 *
 * Props:
 *   movie   — the enriched TMDB movie object (includes .cast array)
 *   loading — boolean; shows a spinner while the detail fetch is in flight
 *   onClose — callback to dismiss the panel
 */
export default function MovieDetail({ movie, loading, onClose }) {
  /* Lock body scroll while the detail panel is visible */
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [])

  /* Close on Escape key — improves keyboard/accessibility experience */
  useEffect(() => {
    function handleKey(e) {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [onClose])

  const backdropUrl = movie?.backdrop_path
    ? `${IMAGE_BASE}/w1280${movie.backdrop_path}`
    : null

  const posterUrl = movie?.poster_path
    ? `${IMAGE_BASE}/w342${movie.poster_path}`
    : null

  const year = movie?.release_date
    ? new Date(movie.release_date).getFullYear()
    : '—'

  /* Format runtime from minutes to "Xh Ym" */
  function formatRuntime(minutes) {
    if (!minutes) return null
    const h = Math.floor(minutes / 60)
    const m = minutes % 60
    return h > 0 ? `${h}h ${m}m` : `${m}m`
  }

  return (
    /* Clicking the dim backdrop closes the panel */
    <div
      className={styles.backdrop}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Movie detail"
    >
      {/* Stop propagation so clicks inside the panel don't close it */}
      <div className={styles.panel} onClick={(e) => e.stopPropagation()}>

        {/* Close button */}
        <button className={styles.closeBtn} onClick={onClose} aria-label="Close detail panel">
          ✕
        </button>

        {/* Loading state inside the panel */}
        {loading && !movie && (
          <div className={styles.loadingState}>
            <Spinner size="lg" />
          </div>
        )}

        {movie && (
          <>
            {/* Backdrop hero image */}
            <div className={styles.hero}>
              {backdropUrl && (
                <img className={styles.heroImg} src={backdropUrl} alt="" aria-hidden="true" />
              )}
              <div className={styles.heroGradient} aria-hidden="true" />

              {/* Poster + core info sit on top of the backdrop */}
              <div className={styles.heroContent}>
                {posterUrl && (
                  <img
                    className={styles.poster}
                    src={posterUrl}
                    alt={`${movie.title} poster`}
                  />
                )}

                <div className={styles.heroMeta}>
                  <p className={styles.yearMono}>{year}</p>
                  <h1 className={styles.title}>{movie.title}</h1>

                  {movie.tagline && (
                    <p className={styles.tagline}>"{movie.tagline}"</p>
                  )}

                  <StarRating score={movie.vote_average} votes={movie.vote_count} />

                  {/* Stat pills: runtime + language */}
                  <div className={styles.stats}>
                    {formatRuntime(movie.runtime) && (
                      <span className={styles.stat}>{formatRuntime(movie.runtime)}</span>
                    )}
                    {movie.original_language && (
                      <span className={styles.stat}>
                        {movie.original_language.toUpperCase()}
                      </span>
                    )}
                    {movie.status && (
                      <span className={styles.stat}>{movie.status}</span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Scrollable body */}
            <div className={styles.body}>
              {/* Genre chips */}
              {movie.genres?.length > 0 && (
                <div className={styles.genres}>
                  {movie.genres.map((g) => (
                    <span key={g.id} className={styles.chip}>{g.name}</span>
                  ))}
                </div>
              )}

              {/* Overview */}
              {movie.overview && (
                <section className={styles.section}>
                  <h2 className={styles.sectionLabel}>Overview</h2>
                  <p className={styles.overview}>{movie.overview}</p>
                </section>
              )}

              {/* Cast */}
              {movie.cast?.length > 0 && (
                <section className={styles.section}>
                  <h2 className={styles.sectionLabel}>Cast</h2>
                  <div className={styles.castGrid}>
                    {movie.cast.map((actor) => (
                      <CastCard key={actor.id} actor={actor} />
                    ))}
                  </div>
                </section>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}

/**
 * CastCard — small avatar tile for a single cast member.
 * Kept local since it's only used inside MovieDetail.
 */
function CastCard({ actor }) {
  const profileUrl = actor.profile_path
    ? `${IMAGE_BASE}/w185${actor.profile_path}`
    : null

  return (
    <div className={styles.castCard}>
      <div className={styles.castAvatar}>
        {profileUrl ? (
          <img src={profileUrl} alt={actor.name} loading="lazy" />
        ) : (
          <span className={styles.castInitial}>
            {actor.name.charAt(0)}
          </span>
        )}
      </div>
      <p className={styles.castName}>{actor.name}</p>
      {actor.character && (
        <p className={styles.castCharacter}>{actor.character}</p>
      )}
    </div>
  )
}
