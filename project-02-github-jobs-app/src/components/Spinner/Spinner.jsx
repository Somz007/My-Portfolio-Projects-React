import styles from './Spinner.module.css'

/**
 * Spinner — three pulsing dots that stagger in sequence.
 * A deliberate departure from project 1's ring spinner for portfolio variety.
 *
 * Props:
 *   label — optional status message shown below the dots
 */
export default function Spinner({ label = 'Fetching jobs…' }) {
  return (
    <div className={styles.wrapper} role="status" aria-label={label}>
      <div className={styles.dots}>
        <span className={styles.dot} />
        <span className={styles.dot} />
        <span className={styles.dot} />
      </div>
      {label && <p className={styles.label}>{label}</p>}
      <span className="visually-hidden">{label}</span>
    </div>
  )
}
