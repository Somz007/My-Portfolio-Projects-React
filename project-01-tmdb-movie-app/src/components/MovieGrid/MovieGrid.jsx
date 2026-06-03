import MovieCard from '../MovieCard/MovieCard'
import Spinner from '../Spinner/Spinner'
import styles from './MovieGrid.module.css'

/**
 * MovieGrid — renders the full grid layout for movie results.
 *
 * This component handles all three display states so App.jsx stays clean:
 *   1. Loading  — centred spinner
 *   2. Error    — styled message with an optional retry hint
 *   3. Results  — responsive auto-fill grid of MovieCard components
 *
 * Props:
 *   movies   — array of TMDB movie objects to display
 *   loading  — boolean, true while fetch is in flight
 *   error    — string error message, or null
 *   onSelect — callback(id) passed down to each MovieCard
 *   label    — section heading string, e.g. "Trending" or "Results for 'Dune'"
 */
export default function MovieGrid({ movies, loading, error, onSelect, label }) {
  /* ── Loading state ─────────────────────────────────────────── */
  if (loading) {
    return (
      <div className={styles.centred}>
        <Spinner size="lg" />
      </div>
    )
  }

  /* ── Error / empty state ───────────────────────────────────── */
  if (error) {
    return (
      <div className={styles.centred}>
        <p className={styles.errorIcon} aria-hidden="true">✦</p>
        <p className={styles.errorMsg}>{error}</p>
        <p className={styles.errorHint}>Try a different title or check your connection.</p>
      </div>
    )
  }

  /* ── No movies yet ─────────────────────────────────────────── */
  if (!movies || movies.length === 0) return null

  return (
    <section className={styles.section}>
      {label && (
        <div className={styles.labelRow}>
          <span className={styles.labelLine} />
          <h2 className={styles.label}>{label}</h2>
          <span className={styles.labelLine} />
        </div>
      )}

      <div className={styles.grid}>
        {movies.map((movie, i) => (
          <MovieCard
            key={movie.id}
            movie={movie}
            onSelect={onSelect}
            index={i}
          />
        ))}
      </div>
    </section>
  )
}
