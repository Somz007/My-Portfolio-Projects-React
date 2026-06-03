import styles from './StarRating.module.css'

/**
 * StarRating — converts a TMDB vote_average (0–10) into a 5-star display.
 *
 * Two layers of star characters sit on top of each other inside a
 * position:relative container. The dim layer is the background; the gold
 * fill layer uses overflow:hidden + a percentage width to reveal only the
 * portion that represents the score. No SVG sprites needed.
 *
 * Props:
 *   score — number 0–10 from TMDB's vote_average field
 *   votes — raw vote count integer from TMDB
 */
export default function StarRating({ score, votes }) {
  /* TMDB scores out of 10 → percentage width of the gold fill overlay */
  const fillPercent = score ? Math.round((score / 10) * 100) : 0
  const displayScore = score ? score.toFixed(1) : 'N/A'

  return (
    <div className={styles.wrapper} aria-label={`Rating: ${displayScore} out of 10`}>
      {/* Stars: base (dim) + fill (gold overlay clipped by width) */}
      <span className={styles.stars} aria-hidden="true">
        <span className={styles.base}>★★★★★</span>
        <span className={styles.fill} style={{ width: `${fillPercent}%` }}>★★★★★</span>
      </span>

      <span className={styles.score}>{displayScore}</span>

      {votes > 0 && (
        <span className={styles.votes}>({Number(votes).toLocaleString()})</span>
      )}
    </div>
  )
}
