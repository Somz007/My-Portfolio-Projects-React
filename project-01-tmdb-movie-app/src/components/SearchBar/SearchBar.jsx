import { useRef } from 'react'
import styles from './SearchBar.module.css'

/**
 * SearchBar — controlled input that drives the movie search.
 *
 * Props:
 *   value      — the current search string (lifted to App state)
 *   onChange   — called with the new string on every keystroke
 *   disabled   — grays out the input while a request is in-flight
 */
export default function SearchBar({ value, onChange, disabled }) {
  const inputRef = useRef(null)

  /** Clears the input and returns focus so the user can type again. */
  function handleClear() {
    onChange('')
    inputRef.current?.focus()
  }

  return (
    <div className={styles.wrapper} role="search">
      {/* Search icon — purely decorative */}
      <span className={styles.icon} aria-hidden="true">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
      </span>

      <input
        ref={inputRef}
        className={styles.input}
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Search films…"
        aria-label="Search movies by title"
        disabled={disabled}
        autoComplete="off"
        spellCheck={false}
      />

      {/* Clear button — only visible when there is text */}
      {value && (
        <button
          className={styles.clear}
          onClick={handleClear}
          aria-label="Clear search"
          type="button"
        >
          ✕
        </button>
      )}
    </div>
  )
}
