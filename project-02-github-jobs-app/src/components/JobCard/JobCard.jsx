import styles from './JobCard.module.css'

/**
 * JobCard — displays a single job listing in the results list.
 *
 * Visual design:
 *   - Company logo (circle avatar with image or initials fallback)
 *   - Job title (prominent)
 *   - Company name + location + job type badge in a metadata row
 *   - Posted date (relative, e.g. "3 days ago") — right-aligned
 *   - Left blue border sweeps in on hover (CSS-only, no JS)
 *
 * Props:
 *   job      — a Remotive job object
 *   onSelect — callback(job) when the card is clicked
 *   index    — grid position, used to stagger the entrance animation
 */
export default function JobCard({ job, onSelect, index = 0 }) {

  /**
   * Converts an ISO date string to a human-readable relative label.
   * e.g. "2024-03-01T00:00:00" → "3 days ago"
   */
  function timeAgo(dateStr) {
    const diff = Date.now() - new Date(dateStr).getTime()
    const days = Math.floor(diff / 86_400_000)  // ms per day

    if (days === 0) return 'Today'
    if (days === 1) return 'Yesterday'
    if (days < 7)  return `${days} days ago`

    const weeks = Math.floor(days / 7)
    if (weeks < 5) return `${weeks} week${weeks > 1 ? 's' : ''} ago`

    const months = Math.floor(days / 30)
    if (months < 13) return `${months} month${months > 1 ? 's' : ''} ago`

    return `${Math.floor(days / 365)} year${Math.floor(days / 365) > 1 ? 's' : ''} ago`
  }

  /**
   * Maps Remotive's job_type string to a human-readable label and a CSS
   * class name that sets the badge colour.
   */
  function getTypeMeta(type) {
    const map = {
      full_time:   { label: 'Full Time',   cls: 'full' },
      part_time:   { label: 'Part Time',   cls: 'part' },
      contract:    { label: 'Contract',    cls: 'contract' },
      freelance:   { label: 'Freelance',   cls: 'freelance' },
      internship:  { label: 'Internship',  cls: 'internship' },
    }
    return map[type] ?? { label: type ?? 'Unknown', cls: 'default' }
  }

  const typeMeta = getTypeMeta(job.job_type)

  /** Returns up to 2 initials from a company name for the avatar fallback. */
  function getInitials(name) {
    return name
      ?.split(' ')
      .slice(0, 2)
      .map((w) => w[0]?.toUpperCase())
      .join('') ?? '?'
  }

  return (
    <article
      className={styles.card}
      style={{ animationDelay: `${index * 50}ms` }}
      onClick={() => onSelect(job)}
      onKeyDown={(e) => e.key === 'Enter' && onSelect(job)}
      tabIndex={0}
      role="button"
      aria-label={`View details: ${job.title} at ${job.company_name}`}
    >
      {/* Company avatar — logo image with initials fallback */}
      <div className={styles.avatar}>
        {job.company_logo ? (
          <img
            src={job.company_logo}
            alt={`${job.company_name} logo`}
            onError={(e) => {
              /* If the logo URL is broken, swap to the initials element. */
              e.currentTarget.style.display = 'none'
              e.currentTarget.nextSibling.style.display = 'flex'
            }}
          />
        ) : null}
        <span
          className={styles.initials}
          style={{ display: job.company_logo ? 'none' : 'flex' }}
          aria-hidden="true"
        >
          {getInitials(job.company_name)}
        </span>
      </div>

      {/* Card body */}
      <div className={styles.body}>
        {/* Top row: company + date */}
        <div className={styles.topRow}>
          <span className={styles.company}>{job.company_name}</span>
          <span className={styles.date}>{timeAgo(job.publication_date)}</span>
        </div>

        {/* Job title */}
        <h2 className={styles.title}>{job.title}</h2>

        {/* Bottom row: location + type badge */}
        <div className={styles.bottomRow}>
          {job.candidate_required_location && (
            <span className={styles.location}>
              <span aria-hidden="true">📍</span>
              {job.candidate_required_location}
            </span>
          )}
          <span className={`${styles.badge} ${styles[typeMeta.cls]}`}>
            {typeMeta.label}
          </span>
        </div>
      </div>

      {/* Chevron cue */}
      <span className={styles.chevron} aria-hidden="true">›</span>
    </article>
  )
}
