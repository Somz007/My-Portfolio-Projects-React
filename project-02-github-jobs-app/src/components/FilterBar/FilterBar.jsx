import { JOB_TYPES } from '../../hooks/useJobs'
import styles from './FilterBar.module.css'

/**
 * FilterBar — client-side filters applied to the already-fetched job list.
 *
 * These never trigger an API call — they slice the result that's already
 * in memory. Two filters are available:
 *   1. Job type — pill buttons (Full Time, Contract, etc.)
 *   2. Location — text input (substring match on candidate_required_location)
 *
 * Props:
 *   jobType          — currently active job type value ('all', 'full_time', …)
 *   onJobTypeChange  — setter for jobType
 *   location         — current location filter string
 *   onLocationChange — setter for location
 *   totalJobs        — total jobs from API (before filters), for context
 *   filteredCount    — jobs matching current filters
 *   currentPage      — used to show "Page X of Y" in the results summary
 *   totalPages       — total pages for the filtered set
 */
export default function FilterBar({
  jobType,
  onJobTypeChange,
  location,
  onLocationChange,
  totalJobs,
  filteredCount,
  currentPage,
  totalPages,
}) {
  return (
    <div className={styles.bar}>
      {/* ── Results summary ──────────────────────────────────────── */}
      {totalJobs > 0 && (
        <p className={styles.summary}>
          <span className={styles.count}>{filteredCount}</span>
          {' '}job{filteredCount !== 1 ? 's' : ''}
          {totalJobs !== filteredCount && (
            <span className={styles.summaryMuted}> (filtered from {totalJobs})</span>
          )}
          {totalPages > 1 && (
            <span className={styles.summaryMuted}> · page {currentPage} of {totalPages}</span>
          )}
        </p>
      )}

      <div className={styles.controls}>
        {/* ── Job type pills ─────────────────────────────────────── */}
        <div className={styles.pills} role="group" aria-label="Filter by job type">
          {JOB_TYPES.map((type) => (
            <button
              key={type.value}
              className={`${styles.pill} ${jobType === type.value ? styles.pillActive : ''}`}
              onClick={() => onJobTypeChange(type.value)}
              aria-pressed={jobType === type.value}
              type="button"
            >
              {type.label}
            </button>
          ))}
        </div>

        {/* ── Location filter ────────────────────────────────────── */}
        <div className={styles.locationWrapper}>
          <span className={styles.locationIcon} aria-hidden="true">📍</span>
          <input
            className={styles.locationInput}
            type="text"
            value={location}
            onChange={(e) => onLocationChange(e.target.value)}
            placeholder="Filter by location…"
            aria-label="Filter jobs by location"
          />
          {/* Clear location button */}
          {location && (
            <button
              className={styles.clearLocation}
              onClick={() => onLocationChange('')}
              aria-label="Clear location filter"
              type="button"
            >
              ✕
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
