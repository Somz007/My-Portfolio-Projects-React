import { useJobs }   from './hooks/useJobs'
import SearchForm   from './components/SearchForm/SearchForm'
import FilterBar    from './components/FilterBar/FilterBar'
import JobCard      from './components/JobCard/JobCard'
import JobDetail    from './components/JobDetail/JobDetail'
import Pagination   from './components/Pagination/Pagination'
import Spinner      from './components/Spinner/Spinner'
import styles from './App.module.css'

/**
 * App — root component. Owns zero state directly; all logic lives in
 * the useJobs hook. This component's only job is to wire hook outputs
 * to the right component props, and decide which UI states to show.
 *
 * Rendering decision tree:
 *   loading         → <Spinner>
 *   error           → error message
 *   !hasSearched    → empty-state prompt
 *   jobs.length = 0 → "no results" message
 *   default         → <FilterBar> + job list + <Pagination>
 */
export default function App() {
  const {
    titleQuery, setTitleQuery, search,
    locationFilter, setLocationFilter,
    jobTypeFilter, setJobTypeFilter,
    pageJobs,
    totalJobs,
    filteredCount,
    loading,
    error,
    hasSearched,
    currentPage,
    totalPages,
    goToPage, nextPage, prevPage,
    selectedJob, selectJob, clearJob,
  } = useJobs()

  return (
    <div className={styles.app}>
      {/* ── Header ──────────────────────────────────────────────── */}
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <div className={styles.wordmark}>
            <span className={styles.wordmarkIcon}>{'</>'}</span>
            <span className={styles.wordmarkText}>DevJobs</span>
          </div>
          <span className={styles.headerTag}>Remote · Worldwide</span>
        </div>
      </header>

      {/* ── Search hero ─────────────────────────────────────────── */}
      <SearchForm
        value={titleQuery}
        onChange={setTitleQuery}
        onSearch={search}
        loading={loading}
      />

      {/* ── Main content ────────────────────────────────────────── */}
      <main className={styles.main}>

        {/* Loading state */}
        {loading && <Spinner label="Searching remote jobs…" />}

        {/* Error state */}
        {!loading && error && (
          <div className={styles.errorBox} role="alert">
            <span className={styles.errorIcon}>⚠</span>
            <p className={styles.errorMsg}>{error}</p>
          </div>
        )}

        {/* Pre-search prompt — shown on first load before any search */}
        {!loading && !error && !hasSearched && (
          <div className={styles.emptyState}>
            <p className={styles.emptyIcon} aria-hidden="true">{'{ }'}</p>
            <p className={styles.emptyHeading}>Search 1,000+ remote dev jobs</p>
            <p className={styles.emptyHint}>
              Try:{' '}
              {['React', 'Python', 'DevOps'].map((kw, i) => (
                <span key={kw}>
                  <button
                    className={styles.hintBtn}
                    onClick={() => { setTitleQuery(kw); search(kw) }}
                  >
                    {kw}
                  </button>
                  {i < 2 ? ', ' : ''}
                </span>
              ))}
            </p>
          </div>
        )}

        {/* Results */}
        {!loading && !error && hasSearched && (
          <>
            {/* Filter bar — only shown once there are results */}
            {totalJobs > 0 && (
              <FilterBar
                jobType={jobTypeFilter}
                onJobTypeChange={setJobTypeFilter}
                location={locationFilter}
                onLocationChange={setLocationFilter}
                totalJobs={totalJobs}
                filteredCount={filteredCount}
                currentPage={currentPage}
                totalPages={totalPages}
              />
            )}

            {/* Job list */}
            {pageJobs.length > 0 ? (
              <ul className={styles.list} aria-label="Job listings">
                {pageJobs.map((job, i) => (
                  <li key={job.id}>
                    <JobCard
                      job={job}
                      onSelect={selectJob}
                      index={i}
                    />
                  </li>
                ))}
              </ul>
            ) : (
              /* Filtered to zero — not an API error, just no matches */
              <div className={styles.emptyState}>
                <p className={styles.emptyIcon} aria-hidden="true">∅</p>
                <p className={styles.emptyHeading}>No jobs match your filters</p>
                <p className={styles.emptyHint}>Try adjusting the job type or location filter.</p>
              </div>
            )}

            {/* Pagination */}
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPage={goToPage}
              onPrev={prevPage}
              onNext={nextPage}
            />
          </>
        )}
      </main>

      {/* ── Footer ──────────────────────────────────────────────── */}
      <footer className={styles.footer}>
        <p>Powered by <a href="https://remotive.com" target="_blank" rel="noopener noreferrer">Remotive</a> · Built with React + Vite</p>
      </footer>

      {/* ── Job detail modal ─────────────────────────────────────── */}
      {selectedJob && (
        <JobDetail job={selectedJob} onClose={clearJob} />
      )}
    </div>
  )
}
