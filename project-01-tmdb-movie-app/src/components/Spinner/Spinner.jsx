import styles from './Spinner.module.css'

/**
 * Spinner — shown during any loading state.
 * Two concentric rings rotate in opposite directions, evoking a film reel.
 *
 * Props:
 *   size — 'sm' | 'md' (default) | 'lg'
 */
export default function Spinner({ size = 'md' }) {
  return (
    <div
      className={`${styles.wrapper} ${styles[size]}`}
      role="status"
      aria-label="Loading"
    >
      <span className={`${styles.ring} ${styles.outer}`} />
      <span className={`${styles.ring} ${styles.inner}`} />
      <span className="visually-hidden">Loading…</span>
    </div>
  )
}
