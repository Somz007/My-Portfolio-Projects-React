import { useEffect } from 'react'
import DOMPurify from 'dompurify'
import styles from './JobDetail.module.css'

/**
 * JobDetail — centered modal dialog showing the full job listing.
 *
 * Remotive returns job descriptions as HTML strings. Even though Remotive
 * is a reputable source, we never trust third-party HTML blindly — we run
 * it through DOMPurify before rendering with dangerouslySetInnerHTML. This
 * strips any <script>, event handlers, or other XSS vectors while keeping
 * safe formatting tags (headings, lists, links, bold, etc.).
 *
 * Props:
 *   job     — the full Remotive job object (includes .description HTML)
 *   onClose — callback to dismiss the modal
 */
export default function JobDetail({ job, onClose }) {
  /* Lock body scroll while the modal is open. */
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [])

  /* Close on Escape key. */
  useEffect(() => {
    function handleKey(e) {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [onClose])

  /**
   * Maps job_type to a human-readable label for display.
   */
  function formatType(type) {
    const map = {
      full_time:  'Full Time',
      part_time:  'Part Time',
      contract:   'Contract',
      freelance:  'Freelance',
      internship: 'Internship',
    }
    return map[type] ?? type ?? 'Unknown'
  }

  /** Format an ISO date to a readable form like "March 1, 2024". */
  function formatDate(dateStr) {
    return new Date(dateStr).toLocaleDateString('en-GB', {
      day: 'numeric', month: 'long', year: 'numeric',
    })
  }

  return (
    /* Clicking the dim backdrop dismisses the modal. */
    <div
      className={styles.backdrop}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="job-detail-title"
    >
      {/* Stop propagation so clicks inside the modal don't close it. */}
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>

        {/* ── Header ─────────────────────────────────────────────── */}
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            {/* Company logo */}
            {job.company_logo && (
              <img
                className={styles.logo}
                src={job.company_logo}
                alt={`${job.company_name} logo`}
                onError={(e) => { e.currentTarget.style.display = 'none' }}
              />
            )}
            <div>
              <p className={styles.company}>{job.company_name}</p>
              <h1 className={styles.title} id="job-detail-title">
                {job.title}
              </h1>
            </div>
          </div>

          {/* Close button */}
          <button className={styles.closeBtn} onClick={onClose} aria-label="Close">
            ✕
          </button>
        </div>

        {/* ── Meta chips ─────────────────────────────────────────── */}
        <div className={styles.meta}>
          {job.candidate_required_location && (
            <span className={styles.chip}>
              📍 {job.candidate_required_location}
            </span>
          )}
          <span className={styles.chip}>
            🕐 {formatType(job.job_type)}
          </span>
          {job.salary && (
            <span className={styles.chip}>
              💰 {job.salary}
            </span>
          )}
          <span className={styles.chip}>
            📅 {formatDate(job.publication_date)}
          </span>
        </div>

        {/* ── Tags ───────────────────────────────────────────────── */}
        {job.tags?.length > 0 && (
          <div className={styles.tags}>
            {job.tags.map((tag) => (
              <span key={tag} className={styles.tag}>{tag}</span>
            ))}
          </div>
        )}

        {/* ── Job description HTML ────────────────────────────────
            Remotive's description field is raw HTML. We render it directly
            inside a scoped container (.descriptionBody) that applies custom
            typography styles to normalise headings, lists, and code blocks. */}
        <div
          className={styles.descriptionBody}
          dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(job.description) }}
        />

        {/* ── CTA ────────────────────────────────────────────────── */}
        <div className={styles.footer}>
          <a
            className={styles.applyBtn}
            href={job.url}
            target="_blank"
            rel="noopener noreferrer"
          >
            Apply on {job.company_name} →
          </a>
          <button className={styles.backBtn} onClick={onClose}>
            ← Back to results
          </button>
        </div>
      </div>
    </div>
  )
}
