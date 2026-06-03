import { useMovies } from './hooks/useMovies'
import SearchBar   from './components/SearchBar/SearchBar'
import MovieGrid   from './components/MovieGrid/MovieGrid'
import MovieDetail from './components/MovieDetail/MovieDetail'
import styles from './App.module.css'

/**
 * App — root component. Owns no state directly; everything flows from
 * the useMovies hook. Renders:
 *   - Header with app wordmark and search bar
 *   - MovieGrid for either search results or the trending list
 *   - MovieDetail overlay when a card has been selected
 */
export default function App() {
  const {
    query,
    setQuery,
    movies,
    trending,
    detail,
    loading,
    error,
    selectMovie,
    clearDetail,
  } = useMovies()

  /* Decide which list to show and what label to use */
  const displayMovies = query.trim() ? movies : trending
  const gridLabel = query.trim()
    ? `Results for "${query}"`
    : 'Trending this week'

  return (
    <div className={styles.app}>
      {/* ── Header ──────────────────────────────────────────────── */}
      <header className={styles.header}>
        <div className={styles.headerInner}>
          {/* Wordmark */}
          <div className={styles.wordmark}>
            <span className={styles.wordmarkAccent}>✦</span>
            <span className={styles.wordmarkText}>Cinerama</span>
          </div>

          {/* Search bar takes up the bulk of the header */}
          <div className={styles.searchWrapper}>
            <SearchBar
              value={query}
              onChange={setQuery}
              disabled={loading}
            />
          </div>
        </div>
      </header>

      {/* ── Main content ──────────────────────────────────────── */}
      <main className={styles.main}>
        <MovieGrid
          movies={displayMovies}
          loading={loading}
          error={error}
          onSelect={selectMovie}
          label={gridLabel}
        />
      </main>

      {/* ── Detail overlay (only mounts when a card has been clicked) ── */}
      {detail && (
        <MovieDetail
          movie={detail}
          loading={loading}
          onClose={clearDetail}
        />
      )}
    </div>
  )
}
