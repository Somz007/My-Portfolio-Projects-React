import styles from './SearchForm.module.css'

/**
 * SearchForm — the primary search entry point.
 *
 * Submitting calls onSearch with the current title query so the parent
 * (App) can pass it to the useJobs hook. We handle both the button click
 * and the Enter key so keyboard users aren't disadvantaged.
 *
 * Props:
 *   value      — the controlled input value (lifted to App state)
 *   onChange   — setter for the input value
 *   onSearch   — callback(title) triggered on form submit
 *   loading    — disables the input and button while a fetch is in-flight
 */
export default function SearchForm({ value, onChange, onSearch, loading }) {

  /** Prevent the default page reload on form submit, then fire the callback. */
  function handleSubmit(e) {
    e.preventDefault()
    onSearch(value)
  }

  return (
    <section className={styles.hero}>
      <div className={styles.heroText}>
        <h1 className={styles.heading}>Find Remote Dev Jobs</h1>
        <p className={styles.subheading}>
          Powered by Remotive · {' '}
          <span className={styles.accent}>No signup required</span>
        </p>
      </div>

      <form className={styles.form} onSubmit={handleSubmit} role="search">
        <div className={styles.inputGroup}>
          {/* Search icon */}
          <span className={styles.icon} aria-hidden="true">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </span>

          <input
            className={styles.input}
            type="search"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="e.g. React Developer, Python, DevOps…"
            aria-label="Search jobs by title or keyword"
            disabled={loading}
            autoComplete="off"
            spellCheck={false}
          />
        </div>

        <button
          className={styles.button}
          type="submit"
          disabled={loading || !value.trim()}
          aria-label="Search jobs"
        >
          {loading ? 'Searching…' : 'Search Jobs'}
        </button>
      </form>
    </section>
  )
}
